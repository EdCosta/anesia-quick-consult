import { expect, test } from '@playwright/test';

test.describe('critical flows', () => {
  test('guided journey opens emergency protocols', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('guided-journey-urgent-protocols').click();
    await expect(page).toHaveURL(/\/protocoles\?category=emergency/);
  });

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

  test('home search opens an internal procedure', async ({ page }) => {
    await page.goto('/');

    const search = page.getByTestId('home-search-input');
    await search.fill('pth');
    await page.getByText(/Proth[eè]se totale de hanche|Pr[oó]tese total da anca|Total hip replacement/i).first().click();

    await expect(page).toHaveURL(/\/p\/pth/);
  });

  test('public procedure page opens app procedure CTA', async ({ page }) => {
    await page.goto('/procedures/pth');

    await expect(page.getByTestId('public-procedure-open-app-cta')).toBeVisible();
    await page.getByTestId('public-procedure-open-app-cta').click();

    await expect(page).toHaveURL(/\/p\/pth/);
  });

  test('pricing page routes into account flow', async ({ page }) => {
    await page.goto('/pricing');

    await page.getByTestId('pricing-account-cta').click();
    await expect(page).toHaveURL(/\/account/);
  });

  test('account unauth surfaces auth entry points', async ({ page }) => {
    await page.goto('/account');

    await page.getByTestId('account-settings-link').click();
    await expect(page).toHaveURL(/\/auth\?mode=signin/);
    await expect(page.getByTestId('auth-page')).toBeVisible();
  });

  test('pro checkout unauth redirects to signin on manual invoice intent', async ({ page }) => {
    await page.goto('/pro/checkout?source=pricing');

    await expect(page.getByTestId('pro-checkout-page')).toBeVisible();
    await page.getByTestId('checkout-invoice-button').click();

    await expect(page).toHaveURL(/\/auth\?mode=signin/);
  });
});
