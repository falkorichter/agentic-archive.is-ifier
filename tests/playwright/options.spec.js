import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Options Page', () => {
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

  test('options page loads and displays all sections', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Archive.is-ifier Settings');
    
    // Check archive service section
    await expect(page.locator('#archiveServiceSection')).toBeVisible();
    await expect(page.locator('label[for="archiveService"]')).toBeVisible();
    
    // Check auto-archiving section
    await expect(page.locator('#autoArchivingSection')).toBeVisible();
    await expect(page.locator('#autoArchivingTitle')).toContainText('Auto-Archiving Settings');
    
    // Check URL patterns section
    await expect(page.locator('#urlPatternsSection')).toBeVisible();
    
    // Check text indicators section
    await expect(page.locator('#textIndicatorsSection')).toBeVisible();
    
    // Check global scanning option
    await expect(page.locator('#globalScanSection')).toBeVisible();
    
    // Check debug section
    await expect(page.locator('#debugSection')).toBeVisible();
  });

  test('archive service dropdown functionality', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    
    // Wait for page to fully load
    await page.waitForTimeout(1000);
    
    // Check dropdown exists
    const dropdown = page.locator('#archiveService');
    await expect(dropdown).toBeVisible();
    
    // Verify dropdown options
    const options = await dropdown.locator('option').allTextContents();
    expect(options).toContain('archive.ph');
    expect(options).toContain('archive.is');
    expect(options).toContain('archive.today');
    
    // Test changing selection
    await dropdown.selectOption('archive.is');
    expect(await dropdown.inputValue()).toBe('https://archive.is');
  });

  test('auto-archiving toggles and inputs', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    // Test URL patterns input
    const urlPatternsInput = page.locator('#urlPatterns');
    await expect(urlPatternsInput).toBeVisible();
    
    await urlPatternsInput.fill('example.com\ntest.org');
    expect(await urlPatternsInput.inputValue()).toContain('example.com');
    
    // Test text indicators input
    const textIndicatorsInput = page.locator('#textIndicators');
    await expect(textIndicatorsInput).toBeVisible();
    
    await textIndicatorsInput.fill('urgent\nimportant');
    expect(await textIndicatorsInput.inputValue()).toContain('urgent');
    
    // Test global scanning checkbox
    const globalScanCheckbox = page.locator('#globalScan');
    await expect(globalScanCheckbox).toBeVisible();
    
    // Toggle checkbox
    await globalScanCheckbox.check();
    expect(await globalScanCheckbox.isChecked()).toBe(true);
    
    await globalScanCheckbox.uncheck();
    expect(await globalScanCheckbox.isChecked()).toBe(false);
  });

  test('debug mode functionality', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    // Check debug section exists
    await expect(page.locator('#debugSection')).toBeVisible();
    
    // Test debug checkbox
    const debugCheckbox = page.locator('#debugMode');
    await expect(debugCheckbox).toBeVisible();
    
    // Toggle debug mode
    await debugCheckbox.check();
    expect(await debugCheckbox.isChecked()).toBe(true);
    
    await debugCheckbox.uncheck();
    expect(await debugCheckbox.isChecked()).toBe(false);
  });

  test('settings persistence', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    // Set some values
    await page.locator('#archiveService').selectOption('archive.is');
    await page.locator('#urlPatterns').fill('test.example.com');
    await page.locator('#globalScan').check();
    
    // Wait for auto-save
    await page.waitForTimeout(2000);
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Check that values persisted
    expect(await page.locator('#archiveService').inputValue()).toBe('https://archive.is');
    expect(await page.locator('#urlPatterns').inputValue()).toContain('test.example.com');
    expect(await page.locator('#globalScan').isChecked()).toBe(true);
  });

  test('internationalization on options page', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    await page.waitForTimeout(1000);
    
    // Check that i18n messages are loaded (not showing __MSG_ keys)
    const headings = await page.locator('h1, h2, h3').allTextContents();
    headings.forEach(heading => {
      expect(heading).not.toContain('__MSG_');
      expect(heading.length).toBeGreaterThan(0);
    });
    
    // Check labels
    const labels = await page.locator('label').allTextContents();
    labels.forEach(label => {
      if (label.trim().length > 0) {
        expect(label).not.toContain('__MSG_');
      }
    });
  });

  test('options page styling and layout', async () => {
    if (!extensionId) {
      test.skip('Extension ID not found, skipping options tests');
    }

    const page = await context.newPage();
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    
    await page.goto(optionsUrl);
    
    // Check container exists
    await expect(page.locator('.container')).toBeVisible();
    
    // Check sections are properly laid out
    const sections = page.locator('.section');
    expect(await sections.count()).toBeGreaterThan(3);
    
    // Verify form elements are styled consistently
    await expect(page.locator('select')).toHaveCSS('padding', '8px');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });
});