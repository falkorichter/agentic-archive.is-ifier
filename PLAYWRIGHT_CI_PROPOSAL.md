# Playwright CI Integration Proposal

## Overview
This document outlines a proposal to integrate Playwright testing into the CI pipeline to ensure that contributions to the repository don't break existing functionality, particularly the new popup interface.

## Current State
- The project has a CI pipeline (`.github/workflows/ci.yml`) that runs basic tests
- Tests are currently unit tests that run in Node.js via `test-runner-headless.js`
- No browser automation or visual testing is currently implemented

## Proposed Enhancement

### Benefits of Adding Playwright
1. **Automated Browser Testing** - Test the extension in actual browser environments
2. **Visual Regression Testing** - Detect unintended UI changes in the popup interface
3. **Screenshot Automation** - Automatically capture screenshots for documentation
4. **Cross-browser Testing** - Ensure compatibility across different browsers
5. **Integration Testing** - Test the full workflow including popup → background script communication

### Implementation Approach

#### 1. Test Structure
```
tests/
├── playwright/
│   ├── extension.spec.js       # Extension loading and basic functionality
│   ├── popup.spec.js           # Popup interface testing
│   ├── context-menu.spec.js    # Context menu functionality
│   └── visual.spec.js          # Visual regression tests
├── playwright.config.js        # Playwright configuration
└── package.json               # Dependencies
```

#### 2. Key Test Scenarios
- **Extension Loading**: Verify extension loads without errors
- **Popup Interface**: Test all three popup menu items work correctly
- **Context Menu**: Verify right-click menus appear and function
- **Options Page**: Test settings page functionality
- **Archive Workflow**: End-to-end archiving process
- **Visual Consistency**: Screenshot comparison for UI regression

#### 3. CI Integration
Update `.github/workflows/ci.yml` to:
- Install Playwright browsers
- Run extension tests in headless Chrome
- Capture and store screenshots as artifacts
- Compare with baseline screenshots for visual regression

#### 4. Screenshot Management
- Store baseline screenshots in `tests/screenshots/baseline/`
- Generate comparison screenshots during CI runs
- Update baselines when UI changes are intentional
- Fail CI if unexpected visual changes are detected

### Sample Playwright Test
```javascript
// tests/playwright/popup.spec.js
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Extension Popup', () => {
  test.beforeEach(async ({ page }) => {
    // Load extension
    const extensionPath = path.resolve(__dirname, '../../');
    const context = await page.context().browser().newContext({
      args: [`--load-extension=${extensionPath}`]
    });
  });

  test('popup opens and displays all menu items', async ({ page }) => {
    // Navigate to test page
    await page.goto('https://example.com');
    
    // Click extension icon (would need to locate extension button)
    // Verify popup appears
    // Test each menu item
    
    await expect(page.locator('#archivePage')).toBeVisible();
    await expect(page.locator('#showVersions')).toBeVisible();
    await expect(page.locator('#openSettings')).toBeVisible();
  });

  test('archive current page functionality', async ({ page }) => {
    // Test the archive workflow
  });

  test('visual regression for popup', async ({ page }) => {
    // Take screenshot and compare with baseline
    await expect(page.locator('.popup-container')).toHaveScreenshot();
  });
});
```

### Dependencies to Add
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

### Documentation Updates
- Screenshots in README.md would be automatically updated when tests run
- Test reports would include visual diffs for any UI changes
- Contributors would get immediate feedback on UI impact

## Next Steps
1. Create GitHub issue to track this enhancement
2. Set up basic Playwright configuration
3. Implement core extension testing infrastructure
4. Add visual regression testing for popup interface
5. Integrate into CI pipeline
6. Document testing procedures for contributors

## Benefits for Maintainers
- **Automated validation** that PRs don't break functionality
- **Visual documentation** that stays current automatically  
- **Confidence in merging** contributions without manual testing
- **Early detection** of regressions in extension functionality