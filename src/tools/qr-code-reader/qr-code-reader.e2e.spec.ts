import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

test('reads a QR image locally without sending its pixels or opening its link', async ({ page }, testInfo) => {
  const contentRequests: string[] = [];
  page.on('request', (request) => {
    const telemetry = request.url() === 'https://koya.thekiller.net/api/send';
    if ((request.method() !== 'GET' && !telemetry) || request.postData()?.includes('https://killershot.net/qr')) {
      contentRequests.push(request.url());
    }
  });
  await page.goto('/qrcode-reader');
  await page.locator('input[type="file"]').setInputFiles(fileURLToPath(new URL('./fixtures/plain.png', import.meta.url)));
  await expect(page.getByTestId('qr-payload')).toHaveText('https://killershot.net/qr', { timeout: 60000 });
  await expect(page.getByTestId('qr-open')).toBeVisible();
  expect(page.url()).toContain('/qrcode-reader');
  expect(contentRequests).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('qr-reader.png'), fullPage: true });
});

test('warning links require confirmation before opening', async ({ page }, testInfo) => {
  const opened: string[] = [];
  await page.exposeFunction('recordOpened', (url: string) => opened.push(url));
  await page.addInitScript(() => {
    const boundary = globalThis as typeof globalThis & { recordOpened: (url: string) => Promise<void> };
    window.open = (url) => {
      void boundary.recordOpened(String(url));
      return null;
    };
  });
  await page.goto('/qrcode-reader');
  await page.locator('input[type="file"]').setInputFiles(fileURLToPath(new URL('./fixtures/warning.png', import.meta.url)));
  await expect(page.getByTestId('qr-payload')).toHaveText('http://bit.ly/code', { timeout: 60000 });
  await expect(page.getByText('Shortened link. Destination is not expanded.')).toBeVisible();
  expect(opened).toEqual([]);
  await page.getByTestId('qr-open').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(opened).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('qr-warning.png'), fullPage: true, animations: 'disabled' });
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(opened).toEqual([]);
  await page.getByTestId('qr-open').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Open', exact: true }).click();
  await expect.poll(() => opened).toEqual(['http://bit.ly/code']);
});

test('blocked payloads have no Open and Wi-Fi copies the exact password', async ({ page }) => {
  const copied: string[] = [];
  await page.exposeFunction('recordCopied', (text: string) => copied.push(text));
  await page.addInitScript(() => {
    const boundary = globalThis as typeof globalThis & { recordCopied: (text: string) => Promise<void> };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: boundary.recordCopied } });
  });
  await page.goto('/qrcode-reader');
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(fileURLToPath(new URL('./fixtures/blocked.png', import.meta.url)));
  await expect(page.getByTestId('qr-payload')).toHaveText('javascript:alert(1)', { timeout: 60000 });
  await expect(page.getByTestId('qr-open')).toHaveCount(0);
  await input.setInputFiles(fileURLToPath(new URL('./fixtures/wifi.png', import.meta.url)));
  await expect(page.getByRole('button', { name: 'Copy password', exact: true })).toBeVisible({ timeout: 60000 });
  await expect(page.getByTestId('qr-open')).toHaveCount(0);
  await page.getByRole('button', { name: 'Copy password', exact: true }).click();
  await expect.poll(() => copied).toEqual(['p@ss;word']);
});

test('renders the reader in Black, Light and a narrow viewport', async ({ page }, testInfo) => {
  for (const state of [{ theme: 'black', accent: 'teal', width: 1280 }, { theme: 'light', accent: 'yellow', width: 1280 }, { theme: 'black', accent: 'teal', width: 390 }]) {
    await page.setViewportSize({ width: state.width, height: 900 });
    await page.addInitScript(({ theme, accent }) => {
      localStorage.setItem('kt-theme', theme);
      localStorage.setItem('kt-accent', accent);
    }, state);
    await page.goto('/qrcode-reader');
    await page.locator('input[type="file"]').setInputFiles(fileURLToPath(new URL('./fixtures/plain.png', import.meta.url)));
    await expect(page.getByTestId('qr-payload')).toHaveText('https://killershot.net/qr', { timeout: 60000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`qr-${state.theme}-${state.width}.png`), fullPage: true });
  }
});

test('an image without a code returns nothing and clears an earlier result', async ({ page }) => {
  await page.goto('/qrcode-reader');
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(fileURLToPath(new URL('./fixtures/plain.png', import.meta.url)));
  await expect(page.getByTestId('qr-payload')).toBeVisible({ timeout: 60000 });
  await input.setInputFiles(fileURLToPath(new URL('./fixtures/blank.png', import.meta.url)));
  await expect(page.getByText('No QR codes found.', { exact: true })).toBeVisible({ timeout: 60000 });
  await expect(page.getByTestId('qr-payload')).toHaveCount(0);
});
