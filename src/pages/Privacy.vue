<script setup lang="ts">
import { useHead } from '@vueuse/head';

const { t } = useI18n();

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
      {{ t('pages.privacy.heading') }}
    </h1>
    <p mb-2 op-70>
      {{ t('pages.privacy.lastUpdated') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.overviewHeading') }}
    </h2>
    <p mb-4>
      {{ t('pages.privacy.overviewIntro') }} (<a href="https://killertools.net" style="color: var(--kt-accent); text-decoration: none;">killertools.net</a>) {{ t('pages.privacy.overviewBody') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.dataCollectionHeading') }}
    </h2>
    <p mb-4>
      {{ t('pages.privacy.dataCollectionBody') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.cookiesHeading') }}
    </h2>
    <p mb-4>
      {{ t('pages.privacy.cookiesBody') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.analyticsHeading') }}
    </h2>
    <p mb-4>
      {{ t('pages.privacy.analyticsIntro') }} <a href="https://umami.is" target="_blank" rel="noopener" style="color: var(--kt-accent); text-decoration: none;">Umami</a>, {{ t('pages.privacy.analyticsBody') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.thirdPartyHeading') }}
    </h2>
    <p mb-4>
      {{ t('pages.privacy.thirdPartyBody') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.androidAppHeading') }}
    </h2>
    <p mb-4>
      {{ t('pages.privacy.androidAppBody') }}
    </p>

    <h2 mb-2 mt-6 text-lg font-bold>
      {{ t('pages.privacy.contactHeading') }}
    </h2>
    <p mb-8>
      {{ t('pages.privacy.contactBody') }} <a href="mailto:steve@thekiller.net" style="color: var(--kt-accent); text-decoration: none;">steve@thekiller.net</a>.
    </p>
  </div>
</template>
