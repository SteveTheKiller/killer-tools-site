<script setup lang="ts">
const features = [
  { title: 'ARP + Ping Discovery', desc: 'Dual-method host detection catches devices that don\'t respond to ICMP, including IoT devices and firewalled endpoints.' },
  { title: 'Port Probing', desc: 'Parallel scan of common service ports (SSH, RDP, SMB, HTTP, printing, hypervisor, NAS) with 200ms timeout per port.' },
  { title: 'Vendor Identification', desc: 'MAC OUI lookup against the IEEE database to identify device manufacturers including printers, switches, APs, IoT, and more.' },
  { title: 'Device Classification', desc: 'Automatic typing via hostname keywords, OUI vendor, and port fingerprinting. Right-click to manually override any device type.' },
  { title: 'Export', desc: 'Export scan results as CSV or HTML report. Right-click any device to copy IP, MAC, hostname, or launch RDP/SSH/browser.' },
  { title: 'Single File, No Install', desc: 'One exe, ~500 KB zipped. No installer, no admin rights needed, no dependencies beyond the .NET runtime.' },
];
</script>

<template>
  <div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">
        <span style="color: #1ea54c;">Killer</span>Scan
      </h1>
      <p style="color: #a0a0a0; font-size: 15px; max-width: 520px; margin: 0 auto 24px;">
        Fast network scanner built for field techs. ARP + ping discovery, port probing, vendor lookup,
        and automatic device classification in a single portable exe.
      </p>
      <a
        href="https://dl.killertools.net/KillerScan.zip"
        style="display: inline-flex; align-items: center; gap: 8px; background: #1ea54c; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 4px; text-decoration: none;"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download for Windows (.zip)
      </a>
      <p style="margin-top: 10px; font-size: 12px; color: #a0a0a0;">
        v1.1.2 &middot; Windows 10/11 x64 &middot; ~500 KB &middot; Requires
        <a
          href="https://dotnet.microsoft.com/download/dotnet/8.0"
          target="_blank"
          rel="noopener"
          style="color: #1ea54c;"
        >
          .NET 8 Desktop Runtime
        </a>
      </p>
    </div>

    <n-divider />

    <h2 style="font-size: 17px; font-weight: 600; margin-bottom: 16px;">
      What it does
    </h2>

    <div class="feature-grid">
      <n-card
        v-for="feature in features"
        :key="feature.title"
        size="small"
      >
        <template #header>
          <span style="color: #1ea54c; font-size: 13px; font-weight: 600;">{{ feature.title }}</span>
        </template>
        <span style="font-size: 12px; color: #a0a0a0; line-height: 1.5;">{{ feature.desc }}</span>
      </n-card>
    </div>

    <n-divider />

    <h2 style="font-size: 17px; font-weight: 600; margin-bottom: 16px;">
      Requirements
    </h2>

    <n-card size="small" style="max-width: 420px;">
      <p style="font-size: 13px; color: #a0a0a0; margin-bottom: 6px;">
        <strong style="color: #e0e0e0;">OS:</strong> Windows 10 or 11 (x64)
      </p>
      <p style="font-size: 13px; color: #a0a0a0; margin-bottom: 6px;">
        <strong style="color: #e0e0e0;">Runtime:</strong>
        <a
          href="https://dotnet.microsoft.com/download/dotnet/8.0"
          target="_blank"
          rel="noopener"
          style="color: #1ea54c;"
        >
          .NET 8 Desktop Runtime
        </a>
      </p>
      <p style="font-size: 13px; color: #a0a0a0;">
        <strong style="color: #e0e0e0;">Network:</strong> Run as admin for best ARP results on some networks
      </p>
    </n-card>
  </div>
</template>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
</style>
