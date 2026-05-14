# Sync-M365SKUs.ps1
# Downloads Microsoft's official SKU CSV and compares against your constants file.
# Outputs new/changed SKUs and optionally generates TypeScript stubs to paste in.

[CmdletBinding()]
param(
    [string]$ConstantsFile = "$PSScriptRoot\..\src\tools\m365-sku-decoder\m365-sku-decoder.constants.ts",
    [switch]$OpenCsv
)

$CsvUrl = "https://download.microsoft.com/download/e/3/e/e3e9faf2-f28b-490a-9ada-c6089a1fc5b0/Product%20names%20and%20service%20plan%20identifiers%20for%20licensing.csv"
$TempCsv = Join-Path $env:TEMP "m365-skus.csv"

# ── Download CSV ──────────────────────────────────────────────────────────────
Write-Host "`nDownloading Microsoft SKU reference CSV..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $CsvUrl -OutFile $TempCsv -UseBasicParsing -ErrorAction Stop
    Write-Host "  Downloaded to $TempCsv" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to download CSV. Check your internet connection." -ForegroundColor Red
    Write-Host "  $_"
    exit 1
}

if ($OpenCsv) { Start-Process $TempCsv }

# ── Parse CSV ─────────────────────────────────────────────────────────────────
# Microsoft's CSV has duplicate rows (one per service plan per SKU).
# Deduplicate by GUID + String ID, keeping the first Product Name seen.
Write-Host "Parsing CSV..." -ForegroundColor Cyan
$raw = Import-Csv $TempCsv

# Column names vary slightly between CSV versions — normalize them
$guidCol     = $raw[0].PSObject.Properties.Name | Where-Object { $_ -match 'GUID' }                      | Select-Object -First 1
$stringCol   = $raw[0].PSObject.Properties.Name | Where-Object { $_ -match 'String.?ID|String_Id' }      | Select-Object -First 1
$nameCol     = $raw[0].PSObject.Properties.Name | Where-Object { $_ -match 'Product.?Name|Product_Display_Name' } | Select-Object -First 1

if (-not $guidCol -or -not $stringCol -or -not $nameCol) {
    Write-Host "  ERROR: Could not identify expected columns in CSV." -ForegroundColor Red
    Write-Host "  Columns found: $($raw[0].PSObject.Properties.Name -join ', ')"
    exit 1
}

$microsoftSkus = $raw |
    Select-Object @{N='Guid';E={$_.$guidCol.Trim()}},
                  @{N='StringId';E={$_.$stringCol.Trim()}},
                  @{N='Name';E={$_.$nameCol.Trim()}} |
    Where-Object { $_.StringId -ne '' -and $_.Guid -ne '' } |
    Sort-Object StringId -Unique

Write-Host "  Found $($microsoftSkus.Count) unique SKUs in Microsoft CSV" -ForegroundColor Green

# ── Parse constants file ──────────────────────────────────────────────────────
Write-Host "Parsing constants file..." -ForegroundColor Cyan
if (-not (Test-Path $ConstantsFile)) {
    Write-Host "  ERROR: Constants file not found at: $ConstantsFile" -ForegroundColor Red
    Write-Host "  Use -ConstantsFile to specify the correct path."
    exit 1
}

$constantsContent = Get-Content $ConstantsFile -Raw

# Extract all stringId values from the TypeScript file
$localStringIds = [regex]::Matches($constantsContent, "stringId:\s*'([^']+)'") |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object -Unique

Write-Host "  Found $($localStringIds.Count) SKUs in your constants file" -ForegroundColor Green

# ── Diff ──────────────────────────────────────────────────────────────────────
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$newSkus     = $microsoftSkus | Where-Object { $localStringIds -notcontains $_.StringId }
$removedSkus = $localStringIds | Where-Object { ($microsoftSkus.StringId) -notcontains $_ }

# New SKUs (in Microsoft CSV but not in your constants)
if ($newSkus.Count -gt 0) {
    Write-Host "`n  NEW SKUs in Microsoft CSV not in your constants ($($newSkus.Count)):" -ForegroundColor Yellow
    $newSkus | Format-Table StringId, Name -AutoSize
} else {
    Write-Host "`n  No new SKUs found — your constants are up to date." -ForegroundColor Green
}

# Removed SKUs (in your constants but not in Microsoft CSV)
# These are often deliberate (Legacy category) so just flag, don't remove
if ($removedSkus.Count -gt 0) {
    Write-Host "  SKUs in your constants NOT found in Microsoft CSV ($($removedSkus.Count)):" -ForegroundColor DarkYellow
    Write-Host "  (These may be intentionally kept in your Legacy category, or may have been retired/renamed)" -ForegroundColor DarkGray
    $removedSkus | ForEach-Object { Write-Host "    - $_" -ForegroundColor DarkYellow }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# ── Generate TypeScript stubs ─────────────────────────────────────────────────
if ($newSkus.Count -gt 0) {
    Write-Host "`nGenerating TypeScript stubs for new SKUs..." -ForegroundColor Cyan

    $stubFile = Join-Path (Split-Path $ConstantsFile) "m365-sku-stubs.ts"
    $lines = @()
    $lines += "// ── New SKUs from Microsoft CSV — add to appropriate categories ──"
    $lines += "// Generated: $(Get-Date -Format 'yyyy-MM-dd')"
    $lines += "// Fill in description and tier before pasting into constants file"
    $lines += ""

    foreach ($sku in $newSkus | Sort-Object Name) {
        $lines += "      {"
        $lines += "        guid: '$($sku.Guid)',"
        $lines += "        stringId: '$($sku.StringId)',"
        $lines += "        name: '$($sku.Name -replace "'", "\\'")',"
        $lines += "        description: 'TODO: Add description.',"
        $lines += "        tier: 'Add-on',"
        $lines += "      },"
    }

    $lines | Set-Content $stubFile -Encoding UTF8
    Write-Host "  Stubs written to: $stubFile" -ForegroundColor Green
    Write-Host "  Open the file, fill in descriptions and tiers, then paste into the correct categories." -ForegroundColor DarkGray
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Microsoft CSV SKUs : $($microsoftSkus.Count)"
Write-Host "  Your constants     : $($localStringIds.Count)"
Write-Host "  New (need adding)  : $($newSkus.Count)"
Write-Host "  Not in CSV         : $($removedSkus.Count)"
Write-Host ""