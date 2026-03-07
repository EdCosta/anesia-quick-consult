import { expect, test } from '@playwright/test';

test.describe('critical flows', () => {
  test('homepage search assist routes airway intent', async ({ page }) => {
    await page.goto('/');

    const search = page.getByTestId('home-search-input');
    await expect(search).toBeVisible();
    await search.fill('airway');
    await search.press('Enter');

    await expect(page).toHaveURL(/\/protocoles/);
  });

  test('AI widget opens and accepts typing', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('ai-widget-trigger').click();
    await expect(page.getByTestId('ai-widget-panel')).toBeVisible();

    const textarea = page.getByTestId('ai-chat-textarea');
    await textarea.fill('Plan rapide pour PTH');
    await expect(textarea).toHaveValue('Plan rapide pour PTH');
  });

  test('public procedure page exposes app CTA', async ({ page }) => {
    await page.goto('/procedures/pth');

    await expect(page.getByRole('link', { name: /app/i })).toBeVisible();
    await expect(page.getByText(/Preop|Pre-op/i)).toBeVisible();
  });

  test('pricing page exposes upgrade entry', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByTestId('pricing-account-cta')).toBeVisible();
  });
});
