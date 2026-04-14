<script setup lang="ts">
import { useHead } from '@vueuse/head';

const privacyTitle = 'Privacy Policy - Killer Tools';
const privacyDescription = 'Privacy policy for Killer Tools. No tracking, no cookies, no data collection. All tool processing happens in your browser.';
const privacyUrl = 'https://killertools.net/privacy';
useHead({
  title: privacyTitle,
  link: [
    { rel: 'canonical', href: privacyUrl },
  ],
  meta: [
    { name: 'description', content: privacyDescription },
    { property: 'og:title', content: privacyTitle },
    { property: 'og:description', content: privacyDescription },
    { property: 'og:url', content: privacyUrl },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: privacyTitle },
    { name: 'twitter:description', content: privacyDescription },
  ],
});
</script>

<template>
  <div mx-auto mt-50px max-w-600px px-4>
    <h1 mb-4 text-2xl font-bold>
      Privacy Policy
    </h1>
    <p mb-2 op-70>
      Last updated: April 4, 2026
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Overview
    </h2>
    <p mb-4>
      Killer Tools (<a href="https://killertools.net" style="color: #1ea54c; text-decoration: none;">killertools.net</a>) is a free collection of IT utility tools. Your privacy is important to us, and this policy explains how we handle your data.
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Data Collection
    </h2>
    <p mb-4>
      Killer Tools does not collect, store, or transmit any personal data. All tool processing happens entirely in your browser. No data you enter into any tool is sent to any server.
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Cookies
    </h2>
    <p mb-4>
      This site does not use cookies for tracking. Your theme preferences and settings are stored locally in your browser and are never transmitted.
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Analytics
    </h2>
    <p mb-4>
      This site uses <a href="https://umami.is" target="_blank" rel="noopener" style="color: #1ea54c; text-decoration: none;">Umami</a>, a privacy-focused analytics tool, to understand general usage patterns such as page views and referral sources. Umami does not use cookies, does not track users across sites, and does not collect any personally identifiable information. All data is aggregated and anonymous.
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Third-Party Services
    </h2>
    <p mb-4>
      Some tools may link to external resources or documentation. We are not responsible for the privacy practices of those external sites.
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Android App
    </h2>
    <p mb-4>
      The Killer Tools Android app is a wrapper around the web application. It does not request or access any device permissions beyond basic internet access. No device data is collected or transmitted.
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      Contact
    </h2>
    <p mb-8>
      If you have questions about this privacy policy, you can reach us at <a href="mailto:steve@thekiller.net" style="color: #1ea54c; text-decoration: none;">steve@thekiller.net</a>.
    </p>
  </div>
</template>
