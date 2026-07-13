<script setup lang="ts">
import { useHead } from '@vueuse/head';

const pageTitle = 'Android App - Killer Tools';
const pageDescription = 'Killer Tools for Android: the whole killertools.net toolbox as a native app. Currently in closed beta on Google Play - testers needed.';
const pageUrl = 'https://killertools.net/android';
useHead({
  title: pageTitle,
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:url', content: pageUrl },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
  ],
});
</script>

<!-- eslint-disable vue/singleline-html-element-content-newline, vue/multiline-html-element-content-newline -->
<template>
  <div class="android-wrapper">

    <!-- Hero: horizontal lockup + Android robot. Frameless on purpose: the art
         carries its own grained background, so no g-card border/accent edge -->
    <div class="hero-card">
      <img class="hero-img" src="/android-feature.png" alt="Killer Tools for Android - IT Utility Tools for Field Techs">
    </div>
    <p class="robot-attrib">
      The Android robot is reproduced or modified from work created and shared by Google and used
      according to terms described in the Creative Commons 3.0 Attribution License.
    </p>

    <div class="android-main">

      <!-- Left: what the app is (family grunge card, same recipe as About) -->
      <div class="g-card">
        <div class="card-body">
          <div class="prompt-line">
            <img class="site-icon" src="/android-chrome-192x192.png" alt="">
            <h1 class="site-title killer-font">Killer Tools for Android</h1>
          </div>
          <p>
            The whole killertools.net toolbox as a native Android app: every tool, the Killer Scripts
            library, and all your favorites, one tap from your home screen.
          </p>
          <p>
            Same rules as the site. Everything runs on your device. No account, no telemetry,
            no phone-home. If it saves you a ticket cycle in the field, it did its job.
          </p>
          <p class="last">
            The app is currently in <strong>closed beta on Google Play</strong>, and this is where
            you come in.
          </p>
        </div>
      </div>

      <!-- Right: how to join the beta -->
      <div class="g-card">
        <h2 class="also-heading killer-font">Join the beta</h2>
        <p class="steps-intro">
          Google requires <strong>12 testers with the app installed for 14 continuous days</strong>
          before an app from an independent developer can go public. Three steps, about two minutes,
          and you are one of the twelve:
        </p>
        <ol class="steps">
          <li>
            <a href="https://groups.google.com/g/killer-tools-beta-testers" target="_blank" rel="noopener">Join the tester group</a>
            on Google Groups (hit "Join group").
          </li>
          <li>
            <a href="https://play.google.com/apps/testing/net.killertools.paid" target="_blank" rel="noopener">Become a tester</a>
            on the Google Play opt-in page.
          </li>
          <li>
            <a href="https://play.google.com/store/apps/details?id=net.killertools.paid" target="_blank" rel="noopener">Install the app</a>
            from Google Play, and keep it installed for two weeks.
          </li>
        </ol>
        <p class="steps-note">
          <strong>Use the same Google account for all three steps</strong> - the opt-in page says
          "not available for this account" if you skip the group or switch accounts.
        </p>
        <p class="last">
          Something broken or missing? Tell me:
          <a href="mailto:feedback@killertools.net">feedback@killertools.net</a>
        </p>
      </div>

    </div>

  </div>
</template>

<style scoped>
.android-wrapper {
  width: 100%;
  font-family: monospace;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Hero banner: frameless image block, just the family corner rounding */
.hero-card {
  margin-top: 12px;
  line-height: 0;
  border-radius: 6px;
  overflow: hidden;
}

.hero-img {
  display: block;
  width: 100%;
  height: auto;
}

/* Google's required attribution for the Android robot */
.robot-attrib {
  font-size: 10px;
  color: #777;
  margin: 6px 2px 0;
  line-height: 1.4;
}

html:not(.dark) .robot-attrib { color: rgba(0, 0, 0, 0.4); }

.android-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
  padding-top: 24px;
}

@media (max-width: 1050px) {
  .android-main { grid-template-columns: 1fr; }
}

/* ── Grunge (family) pieces: typewriter face + grained card surface ── */
@font-face {
  font-family: 'KillerScan';
  src: url('/brand/KillerScan.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.killer-font {
  font-family: 'KillerScan', 'Courier New', monospace;
  font-weight: normal;
  letter-spacing: 0.5px;
}

/* Family card recipe (kt-terminal language), same as About.vue */
.g-card {
  position: relative;
  overflow: hidden;
  background: var(--kt-modal, #0a0a0a) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 6px;
  padding: 18px 24px 22px;
  transition: border-color 0.15s, box-shadow 0.12s, transform 0.12s;
}

.g-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--kt-accent-sel, var(--kt-accent));
  transition: background 0.15s ease;
  pointer-events: none;
  z-index: 1;
}

.g-card:hover::after {
  background: var(--kt-accent);
}

.g-card:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--kt-accent-rgb), 0.6);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
}

.also-heading {
  font-size: 20px;
  color: #e0e0e0;
  margin: 0 0 14px 0;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

.card-body {
  padding: 0;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
}

.prompt-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.site-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
  align-self: center;
}

.site-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--kt-accent);
  margin: 0;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.5);
}

p { margin: 0 0 10px 0; line-height: 1.65; color: rgba(255, 255, 255, 0.85); }
p.last { margin-bottom: 0; }

a { color: var(--kt-accent); text-decoration: none; transition: color 0.15s; }
a:hover { color: var(--kt-accent-2); text-decoration: underline; }

.steps-intro { margin-bottom: 12px; }

.steps {
  margin: 0 0 12px 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
}

.steps-note { color: rgba(255, 255, 255, 0.72); }

/* ── Light mode overrides (same pattern as About.vue) ── */
html:not(.dark) .g-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
}
html:not(.dark) .also-heading { color: #1a1a1a; text-shadow: none; }
html:not(.dark) .card-body { color: rgba(0, 0, 0, 0.75); }
html:not(.dark) p { color: rgba(0, 0, 0, 0.75); }
html:not(.dark) .steps { color: rgba(0, 0, 0, 0.75); }
html:not(.dark) .steps-note { color: rgba(0, 0, 0, 0.62); }
html:not(.dark) .site-title { color: var(--kt-accent); text-shadow: none; }
html:not(.dark) a { color: var(--kt-accent); }
html:not(.dark) a:hover { color: var(--kt-accent-2); }
</style>
