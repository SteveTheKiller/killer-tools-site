<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({ title: 'Page not found - killer tools' });
</script>

<template>
  <div class="not-found">
    <!-- Family card: kt-terminal supplies the grain, chrome border, accent
         top stripe, and hover pop from the global stylesheet -->
    <div class="terminal-block kt-terminal">
      <p class="prompt">
        <span class="green">>_</span><span class="prompt-name">killer-tools</span>
      </p>
      <p class="command">
        <span class="green">$ </span>
        <span class="white">cd /{{ $route.path.replace('/', '') }}</span>
      </p>
      <p class="error">
        bash: cd: /{{ $route.path.replace('/', '') }}: No such file or directory
      </p>
      <p class="code">
        <span class="dim">exit code </span><span class="green">404</span>
      </p>
    </div>

    <RouterLink to="/" class="home-btn">
      <span class="green">~/</span> back to home
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 32px;
}

/* Layout only — surface chrome (grain, border, stripe, hover) comes from
   the global .kt-terminal recipe */
.terminal-block {
  font-family: 'Cascadia Code', 'Cascadia Mono', 'Consolas', 'Courier New', monospace;
  border-radius: 8px;
  padding: 28px 36px;
  min-width: 380px;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
}

.terminal-block p {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.terminal-block p:last-child {
  margin-bottom: 0;
}

.green { color: var(--kt-accent); }
.white { color: rgba(255, 255, 255, 0.9); }
.dim   { color: rgba(255, 255, 255, 0.45); }

/* Card heading voice: family typewriter face, white with the text stroke */
.prompt {
  margin-bottom: 12px !important;
  font-family: 'KillerScan', 'Courier New', monospace;
  font-size: 1.15rem !important;
  letter-spacing: 0.5px;
}

.prompt-name {
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

.error {
  color: rgba(255, 100, 100, 0.85);
  margin-top: 4px !important;
}

.code {
  margin-top: 12px !important;
  font-size: 0.85rem !important;
}

/* Family button recipe (Scan-button voice) */
.home-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(var(--kt-accent-rgb), 0.45);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.home-btn:hover {
  background: rgba(10, 10, 12, 0.95);
  border-color: rgba(var(--kt-accent-rgb), 0.75);
  color: #fff;
}

/* ── Light mode ── */
html:not(.dark) .white { color: rgba(0, 0, 0, 0.85); }
html:not(.dark) .dim { color: rgba(0, 0, 0, 0.45); }
html:not(.dark) .error { color: rgba(170, 40, 40, 0.9); }
html:not(.dark) .prompt-name { color: #1a1a1a; text-shadow: none; }
html:not(.dark) .terminal-block { box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2); }
html:not(.dark) .home-btn {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.8);
}
html:not(.dark) .home-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

@media (max-width: 480px) {
  .terminal-block {
    min-width: unset;
    padding: 20px;
  }
}
</style>
