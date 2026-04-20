import process from 'node:process';
import { resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';

import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import sitemap from 'vite-plugin-sitemap';
import markdown from 'vite-plugin-vue-markdown';
import svgLoader from 'vite-svg-loader';
import { configDefaults } from 'vitest/config';

const baseUrl = process.env.BASE_URL ?? '/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // @ts-expect-error – CJS default interop
    VueI18n({
      runtimeOnly: true,
      jitCompilation: true,
      compositionOnly: true,
      fullInstall: true,
      strictMessage: false,
      include: [
        resolve(__dirname, 'locales/**'),
      ],
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'vue-i18n',
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
        },
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
      },
    }),
    Icons({ compiler: 'vue3' }),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueJsx(),
    // @ts-expect-error – CJS default interop
    markdown(),
    svgLoader(),
    sitemap({
      hostname: 'https://killertools.net',
      dynamicRoutes: [
        '/about',
        '/ascii-text-drawer',
        '/base64-file-converter',
        '/base64-string-converter',
        '/basic-auth-generator',
        '/bcrypt',
        '/benchmark-builder',
        '/bip39-generator',
        '/camera-recorder',
        '/case-converter',
        '/chmod-calculator',
        '/chronometer',
        '/color-converter',
        '/crontab-generator',
        '/cve-lookup',
        '/date-converter',
        '/device-information',
        '/email-dns-checker',
        '/email-header-parser',
        '/email-normalizer',
        '/emoji-picker',
        '/encryption',
        '/eta-calculator',
        '/exchange-ndr-lookup',
        '/group-policy-reference',
        '/hash-text',
        '/hmac-generator',
        '/html-entities',
        '/html-wysiwyg-editor',
        '/http-status-codes',
        '/iban-validator-and-parser',
        '/base-converter',
        '/ipv4-address-converter',
        '/ipv4-range-expander',
        '/ipv4-subnet-calculator',
        '/ipv6-ula-generator',
        '/json-converter',
        '/json-diff',
        '/json-minify',
        '/json-to-csv',
        '/json-prettify',
        '/jwt-parser',
        '/keycode-info',
        '/killer-scripts',
        '/list-converter',
        '/lorem-ipsum-generator',
        '/m365-sku-decoder',
        '/mac-address-lookup',
        '/markdown-to-html',
        '/math-evaluator',
        '/og-meta-generator',
        '/mime-types',
        '/numeronym-generator',
        '/otp-generator',
        '/password-strength-analyser',
        '/pdf-signature-checker',
        '/percentage-calculator',
        '/phone-parser-and-formatter',
        '/port-protocol-reference',
        '/powershell-builder',
        '/qrcode-generator',
        '/random-port-generator',
        '/regex-tester',
        '/roman-numeral-converter',
        '/rsa-key-pair-generator',
        '/safelink-decoder',
        '/slugify-string',
        '/sql-prettify',
        '/string-obfuscator',
        '/svg-placeholder-generator',
        '/temperature-converter',
        '/text-diff',
        '/text-statistics',
        '/text-to-binary',
        '/text-to-nato-alphabet',
        '/text-to-unicode',
        '/password-generator',
        '/toml-converter',
        '/ulid-generator',
        '/url-encoder',
        '/url-parser',
        '/user-agent-parser',
        '/uuid-generator',
        '/whois-checker',
        '/windows-error-codes',
        '/windows-event-lookup',
        '/xml-formatter',
        '/xml-json-converter',
        '/yaml-converter',
        '/yaml-prettify',
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'Killer Tools',
        description: 'A collection of handy tools for developers and IT pros.',
        display: 'standalone',
        lang: 'en-US',
        start_url: `${baseUrl}?utm_source=pwa&utm_medium=pwa`,
        orientation: 'any',
        theme_color: '#0B1523',
        background_color: '#0B1523',
        icons: [
          {
            src: '/favicon-16x16.png',
            type: 'image/png',
            sizes: '16x16',
          },
          {
            src: '/favicon-32x32.png',
            type: 'image/png',
            sizes: '32x32',
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    // @ts-expect-error – CJS default interop
    Components({
      dirs: ['src/'],
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [NaiveUiResolver(), IconsResolver({ prefix: 'icon' })],
    }),
    Unocss(),
  ],
  base: baseUrl,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  test: {
    exclude: [...configDefaults.exclude, '**/*.e2e.spec.ts'],
  },
  server: {
    host: true,
  },
  build: {
    target: 'esnext',
  },
});
