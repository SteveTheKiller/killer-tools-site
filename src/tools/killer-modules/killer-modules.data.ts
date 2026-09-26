export interface KillerModule {
  name: string
  expansion?: string
  description: string
  install: string
  repo: string
  functions: { cmd: string, alias?: string }[]
  requirements: string
}

// Add new modules here. Each entry renders one card, in the order listed.
export const modules: KillerModule[] = [
  {
    name: 'KillerPivot',
    expansion: 'Per-Identity Validated Org-Toggle',
    description:
      'Switch between Microsoft 365 tenants in PowerShell without firing commands at the wrong one. '
      + 'KillerPivot disables the auth broker to force a real sign-in prompt, then asks the session which '
      + 'tenant it actually landed in and verifies it before you touch anything. Save your tenants once, '
      + 'then pivot between them by name with identity verification built in.',
    install: 'Install-Module KillerPivot -Scope CurrentUser',
    repo: 'https://github.com/SteveTheKiller/killer-modules/tree/main/KillerPivot',
    functions: [
      { cmd: 'Connect-PivotTenant', alias: 'pivot' },
      { cmd: 'Get-PivotContext', alias: 'pvc' },
      { cmd: 'Disconnect-PivotTenant', alias: 'pvx' },
      { cmd: 'Add-PivotTenant' },
      { cmd: 'Get-PivotTenant' },
      { cmd: 'Remove-PivotTenant' },
    ],
    requirements: 'PowerShell 5.1 & 7 · ExchangeOnlineManagement v3+ · Microsoft.Graph.Authentication (for -Graph)',
  },
  {
    name: 'KillerScripts',
    description:
      'Every tool in the killer-scripts repo, available as a command in any PowerShell session. '
      + 'Each script is pulled fresh from GitHub the moment you run it, so you are always on the current '
      + 'version, with a local cache as an offline fallback. All 18 tools get their own command and a short '
      + 'alias, so typing urt runs the Universal Rename Tool.',
    install: 'Install-Module KillerScripts -Scope CurrentUser',
    repo: 'https://github.com/SteveTheKiller/killer-modules/tree/main/KillerScripts',
    functions: [
      { cmd: 'Get-KillerScript' },
      { cmd: 'Invoke-KillerScript' },
      { cmd: 'Update-KillerScripts' },
    ],
    requirements: 'PowerShell 5.1 & 7 · Internet access to fetch the current script (cached copies run offline)',
  },
];
