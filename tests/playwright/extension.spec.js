import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Extension Loading', () => {
  let context;
  let extensionId;

  test.beforeAll(async ({ browser }) => {
    // Get the extension path
    const extensionPath = path.resolve(__dirname, '../../');
    
    // Create a browser context with the extension loaded
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--disable-dev-shm-usage',
        '--no-sandbox'
      ],
    });

    // Wait for the extension to load and get its ID
    const extensionIds = await context.backgroundPages();
    if (extensionIds.length > 0) {
      const backgroundPage = extensionIds[0];
      extensionId = backgroundPage.url().split('/')[2];
    }
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('extension loads without errors', async () => {
    const page = await context.newPage();
    
    // Navigate to a test page
    await page.goto('https://example.com');
    
    // Check that there are no console errors related to the extension
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a moment for any errors to appear
    await page.waitForTimeout(1000);
    
    // Filter out unrelated errors and check for extension-specific issues
    const extensionErrors = errors.filter(error => 
      error.includes('extension') || 
      error.includes('chrome-extension') ||
      error.includes('manifest')
    );
    
    expect(extensionErrors).toHaveLength(0);
  });

  test('extension has valid manifest', async () => {
    const page = await context.newPage();
    
    // Try to access the extension's manifest
    if (extensionId) {
      const manifestUrl = `chrome-extension://${extensionId}/manifest.json`;
      const response = await page.goto(manifestUrl);
      expect(response?.status()).toBe(200);
      
      const manifestText = await page.textContent('pre');
      const manifest = JSON.parse(manifestText);
      
      // Verify key manifest properties
      expect(manifest.name).toBe('Archive.is-ifier');
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.permissions).toContain('contextMenus');
      expect(manifest.permissions).toContain('activeTab');
    }
  });

  test('background script loads successfully', async () => {
    // Check if we have a background page
    const backgroundPages = await context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    
    if (backgroundPages.length > 0) {
      const backgroundPage = backgroundPages[0];
      
      // Check that the background page loaded without errors
      const errors = [];
      backgroundPage.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait a moment for any errors
      await backgroundPage.waitForTimeout(1000);
      
      // Check for critical errors (filter out minor warnings)
      const criticalErrors = errors.filter(error => 
        !error.includes('Unchecked runtime.lastError') &&
        !error.includes('service worker')
      );
      
      expect(criticalErrors).toHaveLength(0);
    }
  });
});