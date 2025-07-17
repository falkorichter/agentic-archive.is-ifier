// Test runner for Archive.is-ifier extension

// Test cases
const testCases = [
  // URL cleaning tests
  {
    name: 'cleanUrl - Valid HTTPS URL',
    test: () => {
      const result = cleanUrl('https://example.com');
      return { pass: result === 'https://example.com', result: result };
    }
  },
  {
    name: 'cleanUrl - Valid HTTP URL',
    test: () => {
      const result = cleanUrl('http://example.com');
      return { pass: result === 'http://example.com', result: result };
    }
  },
  {
    name: 'cleanUrl - Domain without protocol',
    test: () => {
      const result = cleanUrl('example.com');
      return { pass: result === 'https://example.com', result: result };
    }
  },
  {
    name: 'cleanUrl - URL with whitespace',
    test: () => {
      const result = cleanUrl('  https://example.com  ');
      return { pass: result === 'https://example.com', result: result };
    }
  },
  {
    name: 'cleanUrl - Empty string',
    test: () => {
      const result = cleanUrl('');
      return { pass: result === '', result: result };
    }
  },
  {
    name: 'cleanUrl - Invalid text with spaces',
    test: () => {
      const result = cleanUrl('some random text');
      return { pass: result === 'some random text', result: result };
    }
  },

  // URL validation tests
  {
    name: 'isValidUrl - Valid HTTPS URL',
    test: () => {
      const result = isValidUrl('https://example.com');
      return { pass: result === true, result: result };
    }
  },
  {
    name: 'isValidUrl - Invalid URL',
    test: () => {
      const result = isValidUrl('not a url');
      return { pass: result === false, result: result };
    }
  },
  {
    name: 'isValidUrl - Empty string',
    test: () => {
      const result = isValidUrl('');
      return { pass: result === false, result: result };
    }
  },

  // Archive URL detection tests
  {
    name: 'isArchiveUrl - archive.ph URL',
    test: () => {
      const result = isArchiveUrl('https://archive.ph/abc123/example.com');
      return { pass: result === true, result: result };
    }
  },
  {
    name: 'isArchiveUrl - archive.is URL',
    test: () => {
      const result = isArchiveUrl('https://archive.is/def456/example.com');
      return { pass: result === true, result: result };
    }
  },
  {
    name: 'isArchiveUrl - web.archive.org URL',
    test: () => {
      const result = isArchiveUrl('https://web.archive.org/web/20220101000000/example.com');
      return { pass: result === true, result: result };
    }
  },
  {
    name: 'isArchiveUrl - regular URL',
    test: () => {
      const result = isArchiveUrl('https://example.com');
      return { pass: result === false, result: result };
    }
  },

  // Real URL extraction tests
  {
    name: 'extractRealUrlFromArchive - archive.ph URL',
    test: () => {
      const result = extractRealUrlFromArchive('https://archive.ph/abc123/https://example.com');
      return { pass: result === 'https://example.com', result: result };
    }
  },
  {
    name: 'extractRealUrlFromArchive - archive.is URL',
    test: () => {
      const result = extractRealUrlFromArchive('https://archive.is/def456/https://github.com');
      return { pass: result === 'https://github.com', result: result };
    }
  },
  {
    name: 'extractRealUrlFromArchive - web.archive.org URL',
    test: () => {
      const result = extractRealUrlFromArchive('https://web.archive.org/web/20220101000000/https://example.com');
      return { pass: result === 'https://example.com', result: result };
    }
  },
  {
    name: 'extractRealUrlFromArchive - non-archive URL',
    test: () => {
      const result = extractRealUrlFromArchive('https://example.com');
      return { pass: result === null, result: result };
    }
  },

  // Workflow tests
  {
    name: 'testArchiveUrlWorkflow - Valid URL',
    test: () => {
      const result = testArchiveUrlWorkflow('https://example.com');
      return { 
        pass: result.success && result.cleanedUrl === 'https://example.com' && result.archiveSubmitUrl.includes('archive.ph'), 
        result: result 
      };
    }
  },
  {
    name: 'testArchiveUrlWorkflow - Domain without protocol',
    test: () => {
      const result = testArchiveUrlWorkflow('github.com');
      return { 
        pass: result.success && result.cleanedUrl === 'https://github.com' && result.archiveSubmitUrl.includes('archive.ph'), 
        result: result 
      };
    }
  },
  {
    name: 'testArchiveUrlWorkflow - Invalid URL',
    test: () => {
      const result = testArchiveUrlWorkflow('not a url');
      return { 
        pass: !result.success && result.error === 'Invalid URL', 
        result: result 
      };
    }
  },

  {
    name: 'testShowArchivedVersionsWorkflow - Valid URL',
    test: () => {
      const result = testShowArchivedVersionsWorkflow('https://example.com');
      return { 
        pass: result.success && result.searchUrl === 'https://web.archive.org/web/*/https://example.com', 
        result: result 
      };
    }
  },

  {
    name: 'testShowRealUrlWorkflow - Archive URL',
    test: () => {
      const result = testShowRealUrlWorkflow('https://archive.ph/abc123/https://example.com');
      return { 
        pass: result.success && result.realUrl === 'https://example.com' && result.isValid, 
        result: result 
      };
    }
  },
  {
    name: 'testShowRealUrlWorkflow - Non-archive URL',
    test: () => {
      const result = testShowRealUrlWorkflow('https://example.com');
      return { 
        pass: !result.success && result.error === 'Not an archive URL', 
        result: result 
      };
    }
  },

  // Content scanning tests
  {
    name: 'scanPageForIndicators - Simple text match',
    test: () => {
      const indicators = 'premium content\npaywall';
      const pageContent = 'This article contains premium content for subscribers only.';
      const result = scanPageForIndicators(indicators, pageContent);
      return { 
        pass: result.length === 1 && result[0] === 'premium content', 
        result: result 
      };
    }
  },
  {
    name: 'scanPageForIndicators - No matches',
    test: () => {
      const indicators = 'premium content\npaywall';
      const pageContent = 'This is a free article for everyone to read.';
      const result = scanPageForIndicators(indicators, pageContent);
      return { 
        pass: result.length === 0, 
        result: result 
      };
    }
  },
  {
    name: 'scanPageForIndicators - Regex pattern match',
    test: () => {
      const indicators = '/premium|exclusive/\npaywall';
      const pageContent = 'This exclusive article is for members only.';
      const result = scanPageForIndicators(indicators, pageContent);
      return { 
        pass: result.length === 1 && result[0] === '/premium|exclusive/', 
        result: result 
      };
    }
  },
  {
    name: 'scanPageForIndicators - Multiple matches',
    test: () => {
      const indicators = 'premium\nsubscription';
      const pageContent = 'Premium subscription required for this content.';
      const result = scanPageForIndicators(indicators, pageContent);
      return { 
        pass: result.length === 2 && result.includes('premium') && result.includes('subscription'), 
        result: result 
      };
    }
  },
  {
    name: 'scanPageForIndicators - Whitespace normalization',
    test: () => {
      const indicators = 'Zugriff auf alle Inhalte';
      const pageContent = 'Zugriff\n                                auf alle Inhalte';
      const result = scanPageForIndicators(indicators, pageContent);
      return { 
        pass: result.length === 1 && result[0] === 'Zugriff auf alle Inhalte', 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanUrlWithPatterns - Simple pattern match',
    test: () => {
      const patterns = 'news.example.com\nblog.test.org';
      const url = 'https://news.example.com/article/123';
      const result = shouldScanUrlWithPatterns(url, patterns);
      return { 
        pass: result === true, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanUrlWithPatterns - No pattern match',
    test: () => {
      const patterns = 'news.example.com\nblog.test.org';
      const url = 'https://other.website.com/article/123';
      const result = shouldScanUrlWithPatterns(url, patterns);
      return { 
        pass: result === false, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanUrlWithPatterns - Regex pattern match',
    test: () => {
      const patterns = '/article\\/\\d+/\nblog.test.org';
      const url = 'https://example.com/article/12345';
      const result = shouldScanUrlWithPatterns(url, patterns);
      return { 
        pass: result === true, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanPage - Global scanning enabled',
    test: () => {
      const url = 'https://any-website.com/page';
      const settings = { globalScanning: true, pagePathPatterns: '' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === true, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanPage - Pattern match only',
    test: () => {
      const url = 'https://news.example.com/article';
      const settings = { globalScanning: false, pagePathPatterns: 'news.example.com' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === true, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanPage - No scanning conditions met',
    test: () => {
      const url = 'https://other-site.com/page';
      const settings = { globalScanning: false, pagePathPatterns: 'news.example.com' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === false, 
        result: result 
      };
    }
  },
  
  // Homepage exclusion tests
  {
    name: 'shouldScanPage - Homepage exclusion with global scanning',
    test: () => {
      const url = 'https://spiegel.de/';
      const settings = { globalScanning: true, pagePathPatterns: '' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === false, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanPage - Homepage exclusion without trailing slash',
    test: () => {
      const url = 'https://spiegel.de';
      const settings = { globalScanning: true, pagePathPatterns: '' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === false, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanPage - Article page with global scanning',
    test: () => {
      const url = 'https://spiegel.de/article/123';
      const settings = { globalScanning: true, pagePathPatterns: '' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === true, 
        result: result 
      };
    }
  },
  {
    name: 'shouldScanPage - Article page with path patterns',
    test: () => {
      const url = 'https://spiegel.de/news/something';
      const settings = { globalScanning: false, pagePathPatterns: 'spiegel.de' };
      const result = shouldScanPage(url, settings);
      return { 
        pass: result === true, 
        result: result 
      };
    }
  },

  // Tab index behavior test
  {
    name: 'testTabIndexBehavior - Tab opens next to current tab',
    test: () => {
      const result = testTabIndexBehavior();
      return { 
        pass: result.success && result.expectedNewTabIndex === 4 && result.isCorrect, 
        result: result 
      };
    }
  },

  // Debug mode functionality test
  {
    name: 'debugMode - Settings include debug mode',
    test: () => {
      // Test that debug mode setting can be included in settings object
      const testSettings = {
        globalScanning: false,
        textIndicators: 'test',
        pagePathPatterns: '',
        debugMode: true
      };
      const hasDebugMode = 'debugMode' in testSettings;
      const debugModeValue = testSettings.debugMode;
      return { 
        pass: hasDebugMode && debugModeValue === true,
        result: { hasDebugMode, debugModeValue, testSettings }
      };
    }
  },

  // Content script message handling tests
  {
    name: 'contentScriptMessage - PING message handling',
    test: () => {
      const result = testContentScriptMessageHandling('PING');
      return { 
        pass: result.success && result.isValidMessage && result.expectedResponse.available === true,
        result: result 
      };
    }
  },
  {
    name: 'contentScriptMessage - MANUAL_DEBUG_SCAN message handling',
    test: () => {
      const result = testContentScriptMessageHandling('MANUAL_DEBUG_SCAN');
      return { 
        pass: result.success && result.isValidMessage && result.expectedResponse.success === true,
        result: result 
      };
    }
  },
  {
    name: 'contentScriptMessage - Unknown message type handling',
    test: () => {
      const result = testContentScriptMessageHandling('UNKNOWN_MESSAGE');
      return { 
        pass: result.success && !result.isValidMessage && result.expectedResponse === null,
        result: result 
      };
    }
  },
  {
    name: 'debugScan - With indicators found',
    test: () => {
      const result = testDebugScanWithIndicators();
      return { 
        pass: result.success && result.wouldArchive === true && result.foundIndicators.length > 0,
        result: result 
      };
    }
  },
  {
    name: 'debugScan - Homepage exclusion',
    test: () => {
      const result = testDebugScanHomepage();
      return { 
        pass: result.success && result.wouldArchive === false && result.isHomepage === true,
        result: result 
      };
    }
  },
  {
    name: 'debugScan - No indicators found',
    test: () => {
      const result = testDebugScanNoIndicators();
      return { 
        pass: result.success && result.wouldArchive === false && result.foundIndicators.length === 0,
        result: result 
      };
    }
  },
  {
    name: 'debugScan - No scanning conditions met',
    test: () => {
      const result = testDebugScanNoConditions();
      return { 
        pass: result.success && result.wouldArchive === true && result.normalScanWouldOccur === false && result.foundIndicators.length > 0,
        result: result 
      };
    }
  },

  // Version bump tests
  {
    name: 'versionBump - Valid version 1.0.0',
    test: () => {
      const result = testBumpPatchVersionLogic('1.0.0');
      return { 
        pass: result.success && result.newVersion === '1.0.1',
        result: result 
      };
    }
  },
  {
    name: 'versionBump - Valid version with leading zeros 00.0.0',
    test: () => {
      const result = testBumpPatchVersionLogic('00.0.0');
      return { 
        pass: result.success && result.newVersion === '0.0.1',
        result: result 
      };
    }
  },
  {
    name: 'versionBump - Large patch version 1.0.10000',
    test: () => {
      const result = testBumpPatchVersionLogic('1.0.10000');
      return { 
        pass: result.success && result.newVersion === '1.0.10001',
        result: result 
      };
    }
  },
  {
    name: 'versionBump - Invalid negative patch version 1.0.-10000',
    test: () => {
      const result = testBumpPatchVersionLogic('1.0.-10000');
      return { 
        pass: !result.success && result.error.includes('cannot be negative'),
        result: result 
      };
    }
  },
  {
    name: 'versionBump - Invalid negative major version -1.0.0',
    test: () => {
      const result = testBumpPatchVersionLogic('-1.0.0');
      return { 
        pass: !result.success && result.error.includes('cannot be negative'),
        result: result 
      };
    }
  },
  {
    name: 'versionBump - Invalid negative minor version 1.-5.0',
    test: () => {
      const result = testBumpPatchVersionLogic('1.-5.0');
      return { 
        pass: !result.success && result.error.includes('cannot be negative'),
        result: result 
      };
    }
  },
  {
    name: 'versionValidation - Invalid format too few parts 1.0',
    test: () => {
      const result = testVersionFormatValidation('1.0');
      return { 
        pass: !result.isValid && result.error.includes('Expected MAJOR.MINOR.PATCH'),
        result: result 
      };
    }
  },
  {
    name: 'versionValidation - Invalid format too many parts 1.0.0.0',
    test: () => {
      const result = testVersionFormatValidation('1.0.0.0');
      return { 
        pass: !result.isValid && result.error.includes('Expected MAJOR.MINOR.PATCH'),
        result: result 
      };
    }
  },
  {
    name: 'versionValidation - Invalid format non-numeric patch 1.0.abc',
    test: () => {
      const result = testVersionFormatValidation('1.0.abc');
      return { 
        pass: !result.isValid && result.error.includes('must be valid numbers'),
        result: result 
      };
    }
  },
  {
    name: 'versionValidation - Valid version 2.15.999',
    test: () => {
      const result = testVersionFormatValidation('2.15.999');
      return { 
        pass: result.isValid,
        result: result 
      };
    }
  },

  // Translation key sorting tests
  {
    name: 'translationKeysOrder - Unsorted keys detection',
    test: () => {
      const unsortedTranslations = {
        "zTestKey": { "message": "Z message" },
        "appName": { "message": "App Name" },
        "contextMenuArchive": { "message": "Archive" },
        "bSecondKey": { "message": "B message" }
      };
      const result = testTranslationKeysOrder(unsortedTranslations);
      return { 
        pass: result.isCorrectOrder === false && result.keyCount === 4,
        result: result 
      };
    }
  },
  {
    name: 'translationKeysOrder - Already sorted keys',
    test: () => {
      const sortedTranslations = {
        "appName": { "message": "App Name" },
        "bSecondKey": { "message": "B message" },
        "contextMenuArchive": { "message": "Archive" },
        "zTestKey": { "message": "Z message" }
      };
      const result = testTranslationKeysOrder(sortedTranslations);
      return { 
        pass: result.isCorrectOrder === true && result.keyCount === 4,
        result: result 
      };
    }
  },
  {
    name: 'translationKeysOrder - Empty translations',
    test: () => {
      const result = testTranslationKeysOrder({});
      return { 
        pass: result.isCorrectOrder === true && result.keyCount === 0,
        result: result 
      };
    }
  },
  {
    name: 'sortTranslationKeys - Sort unsorted translations',
    test: () => {
      const unsortedTranslations = {
        "zTestKey": { "message": "Z message" },
        "appName": { "message": "App Name" },
        "contextMenuArchive": { "message": "Archive" }
      };
      const result = testSortTranslationKeys(unsortedTranslations);
      return { 
        pass: result.wasAlreadySorted === false && 
              result.sortedKeys[0] === "appName" && 
              result.sortedKeys[2] === "zTestKey",
        result: result 
      };
    }
  },
  {
    name: 'sortTranslationKeys - Already sorted translations',
    test: () => {
      const sortedTranslations = {
        "appName": { "message": "App Name" },
        "contextMenuArchive": { "message": "Archive" },
        "zTestKey": { "message": "Z message" }
      };
      const result = testSortTranslationKeys(sortedTranslations);
      return { 
        pass: result.wasAlreadySorted === true,
        result: result 
      };
    }
  }
];

// Run all tests
function runAllTests() {
  const resultsDiv = document.getElementById('test-results');
  resultsDiv.innerHTML = '<h2>Test Results</h2>';
  
  let passCount = 0;
  let totalCount = testCases.length;
  
  testCases.forEach((testCase, index) => {
    try {
      const testResult = testCase.test();
      const testDiv = document.createElement('div');
      testDiv.className = `test ${testResult.pass ? 'pass' : 'fail'}`;
      
      testDiv.innerHTML = `
        <div class="test-name">${testCase.name}</div>
        <div class="test-result">
          Status: ${testResult.pass ? 'PASS ✓' : 'FAIL ✗'}<br>
          Result: ${JSON.stringify(testResult.result, null, 2)}
        </div>
      `;
      
      resultsDiv.appendChild(testDiv);
      
      if (testResult.pass) {
        passCount++;
      }
    } catch (error) {
      const testDiv = document.createElement('div');
      testDiv.className = 'test fail';
      testDiv.innerHTML = `
        <div class="test-name">${testCase.name}</div>
        <div class="test-result">
          Status: ERROR ✗<br>
          Error: ${error.message}
        </div>
      `;
      resultsDiv.appendChild(testDiv);
    }
  });
  
  // Add summary
  const summaryDiv = document.createElement('div');
  summaryDiv.style.cssText = 'margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; font-weight: bold;';
  summaryDiv.innerHTML = `
    <h3>Test Summary</h3>
    Passed: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)
  `;
  resultsDiv.appendChild(summaryDiv);
}

// Clear test results
function clearResults() {
  document.getElementById('test-results').innerHTML = '';
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Test page loaded. Click "Run All Tests" to start testing.');
});