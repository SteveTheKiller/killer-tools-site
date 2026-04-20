import { expect, test } from '@playwright/test';

test.describe('Tool - Password generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/password-generator');
  });

  test('Has title', async ({ page }) => {
    await expect(page).toHaveTitle('Password generator - Killer Tools');
  });

  test('New password on refresh', async ({ page }) => {
    const initial = await page.getByPlaceholder('Generated password...').inputValue();
    await page.getByRole('button', { name: 'Refresh' }).click();
    const next = await page.getByPlaceholder('Generated password...').inputValue();
    expect(next).not.toEqual(initial);
  });
});
