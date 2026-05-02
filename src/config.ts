export const config = {
  app: {
    version: (import.meta.env.PACKAGE_VERSION as string) ?? '0.0.0',
    lastCommitSha: (import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA as string) ?? '',
    baseUrl: (import.meta.env.BASE_URL as string) ?? '/',
    env: (import.meta.env.VITE_VERCEL_ENV as string) ?? 'development',
  },
  showBanner: import.meta.env.VITE_SHOW_BANNER === 'true',
  showSponsorBanner: import.meta.env.VITE_SHOW_SPONSOR_BANNER === 'true',
};
