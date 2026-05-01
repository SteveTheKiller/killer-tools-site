<script setup lang="ts">
const features = [
  { title: 'ARP + Ping Discovery', desc: 'Dual-method host detection catches devices that don\'t respond to ICMP, including IoT devices and firewalled endpoints.' },
  { title: 'Port Probing', desc: 'Parallel scan of common service ports (SSH, RDP, SMB, HTTP, printing, hypervisor, NAS) with 200ms timeout per port.' },
  { title: 'Vendor Identification', desc: 'MAC OUI lookup against the IEEE database to identify device manufacturers including printers, switches, APs, IoT, and more.' },
  { title: 'Device Classification', desc: 'Automatic typing via hostname keywords, OUI vendor, and port fingerprinting. Right-click to manually override any device type.' },
  { title: 'Export', desc: 'Export scan results as CSV or HTML report. Right-click any device to copy IP, MAC, hostname, or launch RDP/SSH/browser.' },
  { title: 'Self-Installer or Portable', desc: 'Run straight from the EXE for a portable no-install experience, or let it install itself to %LOCALAPPDATA% with a Start Menu shortcut. No runtime, no admin rights, no dependencies.' },
];
</script>

<template>
  <div class="killer-scan-page">
    <div class="hero-wrap">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; text-align: center;">
        <span style="color: #1ea54c;">Killer</span>Scan
      </h1>
      <div class="hero-columns">
        <div class="hero-terminal">
          <div class="terminal">
            <div class="terminal-bar">
              <span class="terminal-title">~/killerscan</span>
              <div class="terminal-dots">
                <span class="terminal-dot green" /><span class="terminal-dot yellow" /><span class="terminal-dot red" />
              </div>
            </div>
            <div class="terminal-body">
              <span class="t-prompt">$</span> <span class="t-cmd">killerscan</span> <span class="t-flag">--scan</span> <span class="t-out">192.168.1.0/24</span><br>
              <br>
              <span class="t-out"><span class="t-label">found</span> 47 hosts in 3.2s</span><br>
              <span class="t-out"><span class="t-label">probed</span> 12 open ports across 6 services</span><br>
              <span class="t-out"><span class="t-label">identified</span> 38 vendors via MAC OUI</span><br>
              <span class="t-out"><span class="t-label">classified</span> printers, switches, APs, endpoints</span><br>
              <br>
              <span class="t-out">
                Optional installer. No agent. No account. No telemetry.
              </span><br>
              <span class="t-out">
                Free. Open. GPLv3. Built by a field tech, for field techs.
              </span><br>
              <br>
              <span class="t-prompt">$</span> <span class="t-cursor" />
            </div>
          </div>
        </div>
        <div class="hero-cta">
          <a
            href="https://github.com/SteveTheKiller/KillerScan/releases/latest/download/KillerScan.zip"
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
            Windows 10/11 x64 &middot; ~865 KB &middot;
            <a
              href="https://github.com/SteveTheKiller/KillerScan/releases/download/v1.3.0/KillerScan-1.3.0-src.zip"
              style="color: #1ea54c;"
            >
              source (zip)
            </a>
          </p>
          <div style="display: inline-block; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 3px; padding: 4px 12px; font-family: Consolas, monospace; font-size: 12px; color: #1ea54c; margin-top: 12px;">
            <span style="color: #0C7A43; font-weight: bold;">$</span> KillerScan v1.3.0 &middot; updated 4/25/2026
          </div>
          <p style="margin-top: 12px; font-size: 11px; color: #a0a0a0; font-family: Consolas, monospace; text-align: center; word-break: break-all; overflow-wrap: break-word; width: 100%;">
            <span style="color: #1ea54c; margin-right: 8px;">SHA256</span>f52707176a98bda7f4a4a0855491ef924676200e895636da1dc927c9deff02c9
          </p>
          <a
            href="https://github.com/SteveTheKiller/KillerScan"
            target="_blank"
            rel="noopener"
            style="display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 10px 18px; background: #232323; border: 1px solid #1ea54c; border-radius: 4px; font-size: 13px; color: #e0e0e0; text-decoration: none;"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ea54c">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.29 3.44 9.77 8.2 11.36.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" />
            </svg>
            <span>Now open source under GPLv3</span>
            <span style="color: #1ea54c; font-weight: 600;">View on GitHub &rarr;</span>
          </a>
        </div>
      </div>
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
        <span class="feature-desc" style="font-size: 12px; line-height: 1.5;">{{ feature.desc }}</span>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.killer-scan-page {
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;
}
.hero-wrap {
  max-width: 1100px;
  margin: 0 auto 32px;
}
.hero-columns {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 48px;
  align-items: center;
}
.hero-terminal {
  max-width: 440px;
}
.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media (max-width: 900px) {
  .hero-columns { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .hero-cta { width: 100%; align-items: stretch; }
  .hero-cta > a, .hero-cta > div, .hero-cta > p {
    max-width: 100% !important;
    box-sizing: border-box !important;
    justify-content: center;
  }
}
.terminal {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  margin: 0;
  text-align: left;
  overflow: hidden;
}
.terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #151515;
  border-bottom: 1px solid #2a2a2a;
}
.terminal-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}
.terminal-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.terminal-dot.red    { background: #ff5f57; }
.terminal-dot.yellow { background: #febc2e; }
.terminal-dot.green  { background: #28c840; }
.terminal-title {
  font-family: Consolas, monospace;
  font-size: 11px;
  color: #555;
}
.terminal-body {
  padding: 16px 18px;
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.8;
  overflow-wrap: break-word;
  word-break: break-word;
}
.t-prompt { color: #0C7A43; font-weight: bold; }
.t-cmd { color: #fff; font-weight: bold; }
.t-flag { color: #1ea54c; }
.t-out { color: #a0a0a0; }
.t-label { color: #1ea54c; }
.t-cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  background: #1ea54c;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  width: 100%;
}
</style>
