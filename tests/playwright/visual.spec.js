import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Visual Regression Tests', () => {
  let context;
  let extensionId;

  test.beforeAll(async ({ browser }) => {
    const extensionPath = path.resolve(__dirname, '../../');
    
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ],
    });

    // Get extension ID
    const backgroundPages = await context.backgroundPages();
    if (backgroundPages.length > 0) {
      const backgroundPage = backgroundPages[0];
      extensionId = backgroundPage.url().split('/')[2];
    }
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('popup visual regression', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping visual tests');
    }

    const page = await context.newPage();
    
    // Set consistent viewport
    await page.setViewportSize({ width: 400, height: 600 });
    
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    await page.goto(popupUrl);
    
    // Wait for page to fully load and i18n to apply
    await page.waitForTimeout(1000);
    
    // Take screenshot of the popup
    await expect(page.locator('.popup-container')).toHaveScreenshot('popup-interface.png');
  });

  test('popup hover states', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping visual tests');
    }

    const page = await context.newPage();
    await page.setViewportSize({ width: 400, height: 600 });
    
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    await page.goto(popupUrl);
    await page.waitForTimeout(1000);
    
    // Hover over archive page menu item
    await page.locator('#archivePage').hover();
    await expect(page.locator('.popup-container')).toHaveScreenshot('popup-archive-hover.png');
    
    // Hover over show versions menu item
    await page.locator('#showVersions').hover();
    await expect(page.locator('.popup-container')).toHaveScreenshot('popup-versions-hover.png');
    
    // Hover over settings menu item
    await page.locator('#openSettings').hover();
    await expect(page.locator('.popup-container')).toHaveScreenshot('popup-settings-hover.png');
  });

  test('options page visual regression', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping visual tests');
    }

    const page = await context.newPage();
    
    // Set larger viewport for options page
    await page.setViewportSize({ width: 800, height: 1200 });
    
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    await page.goto(optionsUrl);
    
    // Wait for page to fully load
    await page.waitForTimeout(1000);
    
    // Take screenshot of the full options page
    await expect(page.locator('.container')).toHaveScreenshot('options-page-full.png');
  });

  test('options page sections visual', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping visual tests');
    }

    const page = await context.newPage();
    await page.setViewportSize({ width: 800, height: 1200 });
    
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    // Screenshot individual sections
    await expect(page.locator('#archiveServiceSection')).toHaveScreenshot('options-archive-service.png');
    await expect(page.locator('#autoArchivingSection')).toHaveScreenshot('options-auto-archiving.png');
    await expect(page.locator('#debugSection')).toHaveScreenshot('options-debug-section.png');
  });

  test('options page with filled data', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping visual tests');
    }

    const page = await context.newPage();
    await page.setViewportSize({ width: 800, height: 1200 });
    
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    // Fill in some sample data
    await page.locator('#archiveService').selectOption('archive.is');
    await page.locator('#urlPatterns').fill('example.com\ntest.org\n*.important.com');
    await page.locator('#textIndicators').fill('urgent\nimportant\nbreaking');
    await page.locator('#globalScan').check();
    await page.locator('#debugMode').check();
    
    // Wait for any UI updates
    await page.waitForTimeout(500);
    
    // Take screenshot with data filled
    await expect(page.locator('.container')).toHaveScreenshot('options-page-filled.png');
  });

  test('responsive layout check', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping visual tests');
    }

    const page = await context.newPage();
    
    // Test popup at different sizes
    await page.setViewportSize({ width: 320, height: 480 });
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    await page.goto(popupUrl);
    await page.waitForTimeout(1000);
    
    await expect(page.locator('.popup-container')).toHaveScreenshot('popup-mobile-size.png');
    
    // Test options page at different sizes
    await page.setViewportSize({ width: 600, height: 800 });
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    await expect(page.locator('.container')).toHaveScreenshot('options-tablet-size.png');
  });
});