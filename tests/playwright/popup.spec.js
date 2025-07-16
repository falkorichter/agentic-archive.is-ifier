import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Popup Interface', () => {
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

    // Get extension ID from background pages
    const backgroundPages = await context.backgroundPages();
    if (backgroundPages.length > 0) {
      const backgroundPage = backgroundPages[0];
      extensionId = backgroundPage.url().split('/')[2];
    }
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('popup page loads and displays all menu items', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping popup tests');
    }

    const page = await context.newPage();
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    
    await page.goto(popupUrl);
    
    // Check that the page loads successfully
    await expect(page.locator('h1')).toContainText('Archive.is-ifier');
    
    // Verify all main menu items are present
    await expect(page.locator('#archivePage')).toBeVisible();
    await expect(page.locator('#showVersions')).toBeVisible();
    await expect(page.locator('#openSettings')).toBeVisible();
    
    // Check menu item content
    await expect(page.locator('#archivePage .menu-title')).toContainText('Archive current page');
    await expect(page.locator('#showVersions .menu-title')).toContainText('Show archived versions');
    await expect(page.locator('#openSettings .menu-title')).toContainText('Settings');
    
    // Verify icons are present
    await expect(page.locator('#archivePage .menu-icon')).toContainText('📄');
    await expect(page.locator('#showVersions .menu-icon')).toContainText('🕐');
    await expect(page.locator('#openSettings .menu-icon')).toContainText('⚙️');
  });

  test('popup menu items are clickable', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping popup tests');
    }

    const page = await context.newPage();
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    
    await page.goto(popupUrl);
    
    // Test that menu items respond to hover
    await page.locator('#archivePage').hover();
    await page.locator('#showVersions').hover();
    await page.locator('#openSettings').hover();
    
    // Check that clicking settings opens options page
    const [optionsPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#openSettings').click()
    ]);
    
    // Verify options page opened
    expect(optionsPage.url()).toContain('options.html');
    await optionsPage.close();
  });

  test('popup visual layout and styling', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping popup tests');
    }

    const page = await context.newPage();
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    
    await page.goto(popupUrl);
    
    // Check popup container exists and has proper dimensions
    const popupContainer = page.locator('.popup-container');
    await expect(popupContainer).toBeVisible();
    
    // Verify menu items have consistent layout
    const menuItems = page.locator('.menu-item:not(.debug-only)');
    expect(await menuItems.count()).toBe(3);
    
    // Check separator exists
    await expect(page.locator('.separator')).toBeVisible();
    
    // Verify status element exists (even if hidden)
    await expect(page.locator('#status')).toBeAttached();
  });

  test('popup internationalization', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping popup tests');
    }

    const page = await context.newPage();
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    
    await page.goto(popupUrl);
    
    // Wait for i18n to load
    await page.waitForTimeout(500);
    
    // Check that text content is properly localized (not showing placeholder keys)
    const title = await page.locator('h1').textContent();
    expect(title).not.toContain('__MSG_');
    
    const menuTitles = await page.locator('.menu-title').allTextContents();
    menuTitles.forEach(title => {
      expect(title).not.toContain('__MSG_');
      expect(title.length).toBeGreaterThan(0);
    });
  });

  test('debug menu item visibility', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping popup tests');
    }

    const page = await context.newPage();
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    
    await page.goto(popupUrl);
    
    // Debug menu should be hidden by default
    await expect(page.locator('#runDebugScan')).toBeHidden();
    
    // The element should still exist in DOM
    await expect(page.locator('#runDebugScan')).toBeAttached();
  });
});