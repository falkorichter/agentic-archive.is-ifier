# Playwright Testing

This document describes the Playwright testing infrastructure for automated browser testing of the popup and options UIs.

## Overview

The project includes comprehensive Playwright tests that validate:
- Extension loading and basic functionality
- Popup interface UI and interactions
- Options page functionality and settings persistence
- Visual regression testing for UI consistency

## Test Structure

```
tests/playwright/
├── extension.spec.js    # Extension loading and manifest validation
├── popup.spec.js        # Popup interface testing
├── options.spec.js      # Options page functionality
├── visual.spec.js       # Visual regression tests
└── global-setup.js     # Global test setup
```

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Test Commands
```bash
# Run all Playwright tests
npm run test:playwright

# Run tests with UI for debugging
npm run test:playwright:ui

# Run tests in headed mode (visible browser)
npm run test:playwright:headed

# Run complete CI suite (includes Playwright tests)
npm run ci
```

## Test Features

### Extension Loading Tests
- Validates extension loads without errors
- Checks manifest.json accessibility and content
- Verifies background script functionality

### Popup Interface Tests
- Tests all menu items are visible and clickable
- Validates internationalization (i18n) loading
- Checks hover states and interactions
- Verifies settings page navigation

### Options Page Tests
- Tests all sections display correctly
- Validates form functionality (dropdowns, checkboxes, text areas)
- Tests settings persistence across page reloads
- Verifies internationalization

### Visual Regression Tests
- Captures screenshots of popup interface
- Tests hover states for visual consistency
- Captures options page layout
- Tests responsive behavior at different screen sizes

## CI Integration

The CI pipeline automatically:
1. Installs Playwright browsers
2. Runs all tests in headless mode
3. Captures screenshots and traces on failures
4. Gracefully handles cases where browsers aren't available

## Configuration

The Playwright configuration (`playwright.config.js`) includes:
- Chrome extension loading support
- Screenshot capture on failures
- Trace collection for debugging
- Retry logic for flaky tests

## Development

When making UI changes:
1. Run tests locally to check for regressions
2. Update visual baselines if changes are intentional
3. Add new tests for new UI components
4. Ensure tests pass in CI environment

## Troubleshooting

If tests fail with browser installation errors:
- Ensure system dependencies are installed: `npx playwright install-deps`
- Try forcing browser reinstall: `npx playwright install --force`
- Check CI logs for specific browser installation issues