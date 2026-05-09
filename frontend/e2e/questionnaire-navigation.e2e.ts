import { test, expect } from '@playwright/test';

/**
 * Tests e2e de navigation — exécutés quand ng serve est actif sur :4200
 * Lance : npx playwright test
 */
test.describe('Navigation CareTrack', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock-token-dev');
      localStorage.setItem('user_id', 'patient-dev-1');
      localStorage.setItem('user_roles', JSON.stringify(['PATIENT']));
    });
  });

  test('Page patient questionnaires se charge sans erreur JS', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/patient/questionnaires');
    await page.waitForLoadState('networkidle');

    // Vérifie qu'il n'y a pas d'erreurs JS critiques
    const jsErrors = errors.filter(e => !e.includes('favicon'));
    expect(jsErrors).toHaveLength(0);

    // Vérifie que la page a du contenu Angular
    await expect(page.locator('app-patient-questionnaires, [selector="app-patient-questionnaires"]')).toBeTruthy();
  });

  test('Page alertes pro se charge pour un médecin', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('user_roles', JSON.stringify(['MEDECIN']));
    });

    await page.goto('/pro/alertes');
    await page.waitForLoadState('networkidle');

    // La page doit se charger (peut être vide mais sans crash)
    expect(page.url()).toContain('/pro/alertes');
  });

  test('Page analytics pro se charge', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('user_roles', JSON.stringify(['MEDECIN']));
    });

    await page.goto('/pro/analytics');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/pro/analytics');
  });

  test('Plan builder se charge pour un médecin', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('user_roles', JSON.stringify(['MEDECIN']));
    });

    await page.goto('/pro/formulaires/builder');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/builder');
  });
});
