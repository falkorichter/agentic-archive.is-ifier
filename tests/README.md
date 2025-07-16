# Archive.is-ifier Extension Tests

This directory contains tests for the Archive.is-ifier Chrome extension that can be run in isolation without requiring the Chrome extension APIs.

## Running the Tests

1. Open `test.html` in any modern web browser
2. Click "Run All Tests" to execute all test cases
3. View the results to see which functions pass or fail

## Test Coverage

The tests cover the following core functionality:

### URL Cleaning (`cleanUrl`)
- Valid HTTPS/HTTP URLs
- Domains without protocol (automatically adds https://)
- URLs with whitespace (trimmed)
- Empty strings
- Invalid text with spaces

### URL Validation (`isValidUrl`)
- Valid URLs
- Invalid URLs 
- Empty strings

### Archive URL Detection (`isArchiveUrl`)
- archive.ph URLs
- archive.is URLs
- archive.today URLs
- web.archive.org URLs
- Regular non-archive URLs

### Real URL Extraction (`extractRealUrlFromArchive`)
- Extracting URLs from archive.ph links
- Extracting URLs from archive.is links
- Extracting URLs from web.archive.org links
- Handling non-archive URLs

### Workflow Tests
- Complete archive URL workflow (cleaning, validation, URL generation)
- Archived versions workflow (Wayback Machine integration)
- Real URL extraction workflow

## Why These Tests?

These tests were created to:

1. **Fix JavaScript errors**: The original code had variable naming conflicts that caused "Cannot access 'cleanUrl' before initialization" errors
2. **Test functionality in isolation**: Verify core logic works without Chrome extension APIs
3. **Prevent regressions**: Ensure changes don't break existing functionality
4. **Validate fixes**: Confirm that the variable naming fixes resolve the issues

## Test Results

All tests should pass if the JavaScript fixes were successful. Any failing tests indicate issues with the core logic that need to be addressed.

## Browser Compatibility

These tests work in any modern browser that supports:
- ES6 const/let declarations
- Regular expressions
- JSON.stringify
- URL constructor
- Basic DOM manipulation

No external dependencies or Chrome extension APIs are required.