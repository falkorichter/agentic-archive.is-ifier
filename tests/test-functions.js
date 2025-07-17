// Test functions extracted from background.js for isolated testing
// This file contains the core logic without Chrome extension APIs

// Helper function to clean URL
function cleanUrl(url) {
  if (!url) return '';
  
  // If it's just text (from selection), try to make it a valid URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Check if it looks like a domain
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    }
  }
  
  return url.trim();
}

// Helper function to validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if URL is an archive URL
function isArchiveUrl(url) {
  return url.includes('archive.ph') || 
         url.includes('archive.is') || 
         url.includes('archive.today') ||
         url.includes('web.archive.org');
}

// Helper function to extract real URL from archive URL
function extractRealUrlFromArchive(archiveUrl) {
  // Handle archive.ph/archive.is format
  const archiveMatch = archiveUrl.match(/archive\.(ph|is|today)\/[^\/]+\/(.+)/);
  if (archiveMatch) {
    return archiveMatch[2];
  }
  
  // Handle web.archive.org format
  const webArchiveMatch = archiveUrl.match(/web\.archive\.org\/web\/\d+\/(.+)/);
  if (webArchiveMatch) {
    return webArchiveMatch[1];
  }
  
  return null;
}

// Generate a simple archive ID (placeholder)
function generateArchiveId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Test function to verify URL cleaning and archiving workflow
function testArchiveUrlWorkflow(url, archiveServiceUrl = 'https://archive.ph/submit/') {
  try {
    const cleanedUrl = cleanUrl(url);
    if (!isValidUrl(cleanedUrl)) {
      return { success: false, error: 'Invalid URL', cleanedUrl: cleanedUrl };
    }

    const archiveSubmitUrl = `${archiveServiceUrl}?url=${encodeURIComponent(cleanedUrl)}`;
    const archivedUrl = `https://archive.ph/${generateArchiveId()}/${cleanedUrl}`;
    
    return {
      success: true,
      originalUrl: url,
      cleanedUrl: cleanedUrl,
      archiveSubmitUrl: archiveSubmitUrl,
      archivedUrl: archivedUrl
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test function to verify archived versions workflow
function testShowArchivedVersionsWorkflow(url) {
  try {
    const cleanedUrl = cleanUrl(url);
    const searchUrl = `https://web.archive.org/web/*/${cleanedUrl}`;
    
    return {
      success: true,
      originalUrl: url,
      cleanedUrl: cleanedUrl,
      searchUrl: searchUrl
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test function to verify real URL extraction workflow
function testShowRealUrlWorkflow(url) {
  try {
    if (isArchiveUrl(url)) {
      const realUrl = extractRealUrlFromArchive(url);
      return {
        success: true,
        archiveUrl: url,
        realUrl: realUrl,
        isValid: realUrl !== null
      };
    } else {
      return {
        success: false,
        error: 'Not an archive URL',
        archiveUrl: url
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}


// New functions for content script functionality testing

// Helper function to normalize whitespace for text matching
function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Test function for scanning page content for indicators
function scanPageForIndicators(textIndicators, pageContent) {
  if (!textIndicators.trim()) {
    return [];
  }

  const indicators = textIndicators.split('\n').filter(i => i.trim());
  const foundIndicators = [];
  const pageText = pageContent.toLowerCase();
  const normalizedPageText = normalizeWhitespace(pageText);

  indicators.forEach(indicator => {
    const trimmedIndicator = indicator.trim();
    if (!trimmedIndicator) return;

    try {
      // Support both simple text matching and regex patterns
      if (trimmedIndicator.startsWith('/') && trimmedIndicator.endsWith('/')) {
        // Treat as regex
        const regex = new RegExp(trimmedIndicator.slice(1, -1), 'gi');
        if (regex.test(normalizedPageText)) {
          foundIndicators.push(trimmedIndicator);
        }
      } else {
        // Simple string matching (case insensitive) with normalized whitespace
        const normalizedIndicator = normalizeWhitespace(trimmedIndicator.toLowerCase());
        if (normalizedPageText.includes(normalizedIndicator)) {
          foundIndicators.push(trimmedIndicator);
        }
      }
    } catch (error) {
      // If regex is invalid, fall back to string matching
      const normalizedIndicator = normalizeWhitespace(trimmedIndicator.toLowerCase());
      if (normalizedPageText.includes(normalizedIndicator)) {
        foundIndicators.push(trimmedIndicator);
      }
    }
  });

  return foundIndicators;
}

// Test function for checking if URL matches path patterns
function shouldScanUrlWithPatterns(url, pagePathPatterns) {
  if (!pagePathPatterns.trim()) {
    return false;
  }

  const patterns = pagePathPatterns.split('\n').filter(p => p.trim());
  
  return patterns.some(pattern => {
    const trimmedPattern = pattern.trim();
    if (!trimmedPattern) return false;
    
    try {
      // Support both simple text matching and regex patterns
      if (trimmedPattern.startsWith('/') && trimmedPattern.endsWith('/')) {
        // Treat as regex
        const regex = new RegExp(trimmedPattern.slice(1, -1), 'i');
        return regex.test(url);
      } else {
        // Simple string matching (case insensitive)
        return url.toLowerCase().includes(trimmedPattern.toLowerCase());
      }
    } catch (error) {
      // If regex is invalid, fall back to string matching
      return url.toLowerCase().includes(trimmedPattern.toLowerCase());
    }
  });
}

// Test function for overall scanning decision logic
function shouldScanPage(url, settings) {
  // Check if this is a homepage URL (exclude homepages from scanning)
  try {
    const urlObj = new URL(url);
    const isHomepage = urlObj.pathname === '/' || urlObj.pathname === '';
    
    if (isHomepage) {
      return false;
    }
  } catch (error) {
    // If URL parsing fails, continue with other checks
  }
  
  // If global scanning is enabled, scan all pages (except homepages)
  if (settings.globalScanning === true) {
    return true;
  }

  // Otherwise, check if current page matches any path patterns
  return shouldScanUrlWithPatterns(url, settings.pagePathPatterns || '');
}

// Test function for debug scan analysis - always runs regardless of conditions
function testDebugScanAnalysis(url, settings, mockPageContent = '') {
  try {
    // Simulate the debug scan analysis logic
    const urlObj = new URL(url);
    const isHomepage = urlObj.pathname === '/' || urlObj.pathname === '';
    const globalScanningEnabled = settings.globalScanning === true;
    
    // Check page path patterns
    let pathMatches = false;
    const pathPatterns = settings.pagePathPatterns || '';
    if (pathPatterns.trim()) {
      pathMatches = shouldScanUrlWithPatterns(url, pathPatterns);
    }
    
    // Determine if normal scan would occur
    const normalScanWouldOccur = !isHomepage && (globalScanningEnabled || pathMatches);
    
    // Always run indicator scanning for debug (regardless of normal conditions)
    const foundIndicators = scanPageForIndicators(settings.textIndicators || '', mockPageContent);
    
    // Determine final result
    // In debug mode, indicators take precedence over normal scanning conditions (except homepage exclusion)
    let wouldArchive = false;
    let reason = '';
    
    if (isHomepage) {
      wouldArchive = false;
      reason = 'Homepage exclusion';
    } else if (foundIndicators.length > 0) {
      wouldArchive = true;
      reason = `Found indicators: ${foundIndicators.join(', ')}`;
      if (!normalScanWouldOccur) {
        reason += ' (debug mode: indicators override normal scanning conditions)';
      }
    } else {
      wouldArchive = false;
      reason = 'No indicators found in page content';
    }
    
    return {
      success: true,
      wouldArchive: wouldArchive,
      reason: reason,
      foundIndicators: foundIndicators,
      normalScanWouldOccur: normalScanWouldOccur,
      isHomepage: isHomepage,
      globalScanningEnabled: globalScanningEnabled,
      pathMatches: pathMatches
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test debug scan with indicators found
function testDebugScanWithIndicators() {
  const url = 'https://example.com/article/123';
  const settings = {
    globalScanning: true,
    textIndicators: 'premium content\npaywall',
    pagePathPatterns: '',
    debugMode: true
  };
  const mockPageContent = 'This article contains premium content that requires subscription.';
  
  return testDebugScanAnalysis(url, settings, mockPageContent);
}

// Test debug scan on homepage (should show would not archive)
function testDebugScanHomepage() {
  const url = 'https://example.com/';
  const settings = {
    globalScanning: true,
    textIndicators: 'premium content',
    pagePathPatterns: '',
    debugMode: true
  };
  const mockPageContent = 'This homepage has premium content mentioned.';
  
  return testDebugScanAnalysis(url, settings, mockPageContent);
}

// Test debug scan with no indicators found
function testDebugScanNoIndicators() {
  const url = 'https://example.com/article/123';
  const settings = {
    globalScanning: true,
    textIndicators: 'premium content\npaywall',
    pagePathPatterns: '',
    debugMode: true
  };
  const mockPageContent = 'This is a free article with no restricted content.';
  
  return testDebugScanAnalysis(url, settings, mockPageContent);
}

// Test debug scan with no scanning conditions met
function testDebugScanNoConditions() {
  const url = 'https://example.com/article/123';
  const settings = {
    globalScanning: false,
    textIndicators: 'premium content',
    pagePathPatterns: '', // No patterns
    debugMode: true
  };
  const mockPageContent = 'This article has premium content.';
  
  return testDebugScanAnalysis(url, settings, mockPageContent);
}

// Test function for tab creation with correct index
function testTabIndexBehavior() {
  try {
    // Mock tab object representing current tab at index 3
    const mockCurrentTab = { index: 3, id: 123 };
    
    // Test that the next tab would be created at index 4
    const expectedIndex = mockCurrentTab.index + 1;
    
    return {
      success: true,
      currentTabIndex: mockCurrentTab.index,
      expectedNewTabIndex: expectedIndex,
      isCorrect: expectedIndex === 4
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test function for content script message handling
function testContentScriptMessageHandling(messageType) {
  try {
    let expectedResponse = null;
    
    switch (messageType) {
      case 'PING':
        expectedResponse = { available: true };
        break;
      case 'MANUAL_DEBUG_SCAN':
        // This would normally be async, but for testing we simulate the expected structure
        expectedResponse = { 
          success: true, 
          result: {
            wouldArchive: false,
            reason: 'No indicators found in page content',
            foundIndicators: [],
            normalScanWouldOccur: true,
            isHomepage: false,
            globalScanningEnabled: false,
            pathMatches: false
          }
        };
        break;
      default:
        expectedResponse = null;
    }
    
    return {
      success: true,
      messageType: messageType,
      expectedResponse: expectedResponse,
      isValidMessage: expectedResponse !== null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Version bump utility functions for testing
function parseVersionComponents(version) {
  const versionParts = version.split('.');
  if (versionParts.length !== 3) {
    throw new Error(`Invalid version format: ${version}. Expected MAJOR.MINOR.PATCH`);
  }
  
  const major = parseInt(versionParts[0]);
  const minor = parseInt(versionParts[1]);
  const patch = parseInt(versionParts[2]);
  
  // Check for invalid numbers (NaN, negative, etc.)
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`Invalid version format: ${version}. All components must be valid numbers`);
  }
  
  if (major < 0 || minor < 0 || patch < 0) {
    throw new Error(`Invalid version format: ${version}. Version components cannot be negative`);
  }
  
  return { major, minor, patch };
}

// Test function for version bump logic (without file operations)
function testBumpPatchVersionLogic(currentVersion) {
  try {
    const { major, minor, patch } = parseVersionComponents(currentVersion);
    const newVersion = `${major}.${minor}.${patch + 1}`;
    
    return {
      success: true,
      currentVersion: currentVersion,
      newVersion: newVersion,
      major: major,
      minor: minor,
      oldPatch: patch,
      newPatch: patch + 1
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      currentVersion: currentVersion
    };
  }
}

// Test function for version format validation
function testVersionFormatValidation(version) {
  try {
    parseVersionComponents(version);
    return {
      success: true,
      version: version,
      isValid: true
    };
  } catch (error) {
    return {
      success: true,
      version: version,
      isValid: false,
      error: error.message
    };
  }
}

// Test function for translation key sorting validation
function testTranslationKeysOrder(translations) {
  const keys = Object.keys(translations);
  const sortedKeys = [...keys].sort();
  
  return {
    currentKeys: keys,
    sortedKeys: sortedKeys,
    isCorrectOrder: JSON.stringify(keys) === JSON.stringify(sortedKeys),
    keyCount: keys.length
  };
}

// Test function for sorting translation keys
function testSortTranslationKeys(translations) {
  const keys = Object.keys(translations);
  const sortedKeys = [...keys].sort();
  const sortedTranslations = {};
  
  sortedKeys.forEach(key => {
    sortedTranslations[key] = translations[key];
  });
  
  return {
    original: translations,
    sorted: sortedTranslations,
    originalKeys: keys,
    sortedKeys: sortedKeys,
    wasAlreadySorted: JSON.stringify(keys) === JSON.stringify(sortedKeys)
  };
}

// Changelog validation functions
function validateChangelogFormat(content) {
    const errors = [];
    
    // Check required header
    if (!content.includes('# Changelog')) {
        errors.push('Missing required "# Changelog" header');
    }
    
    // Check Keep a Changelog reference
    if (!content.includes('keepachangelog.com')) {
        errors.push('Missing reference to keepachangelog.com in header section');
    }
    
    // Check semantic versioning reference
    if (!content.includes('semver.org')) {
        errors.push('Missing reference to semver.org in header section');
    }
    
    // Check for Unreleased section
    if (!content.includes('## [Unreleased]')) {
        errors.push('Missing required "## [Unreleased]" section');
    }
    
    // Validate version format patterns
    const versionPattern = /## \[([^\]]+)\] - ([^\s]+)/g;
    const versions = [];
    let match;
    
    while ((match = versionPattern.exec(content)) !== null) {
        const [, version, date] = match;
        versions.push({ version, date });
        
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            errors.push(`Invalid date format "${date}" for version ${version}. Expected YYYY-MM-DD format`);
        }
        
        // Validate semantic version format
        const semverRegex = /^\d+\.\d+\.\d+$/;
        if (!semverRegex.test(version) && version !== 'Unreleased') {
            errors.push(`Invalid version format "${version}". Expected semantic versioning (MAJOR.MINOR.PATCH)`);
        }
    }
    
    // Check for valid changelog categories
    const validCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
    const categoryPattern = /### (Added|Changed|Deprecated|Removed|Fixed|Security)/g;
    
    // Check for invalid categories
    const invalidCategoryPattern = /### (?!(?:Added|Changed|Deprecated|Removed|Fixed|Security)\b)(\w+)/g;
    while ((match = invalidCategoryPattern.exec(content)) !== null) {
        errors.push(`Invalid changelog category "${match[1]}". Must be one of: ${validCategories.join(', ')}`);
    }
    
    // Check for version links at the bottom
    if (versions.length > 0) {
        const linkPattern = /^\[[\d.]+\]:\s*https?:\/\//m;
        if (!linkPattern.test(content)) {
            errors.push('Missing version comparison links at the bottom of the changelog');
        }
        
        // Check that all versions have corresponding links
        versions.forEach(({ version }) => {
            const linkRegex = new RegExp(`\\[${version.replace(/\./g, '\\.')}\\]:\\s*https?://`, 'm');
            if (!linkRegex.test(content)) {
                errors.push(`Missing comparison link for version ${version}`);
            }
        });
    }
    
    return errors;
}

function testValidChangelogFormat() {
    const validChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-09

### Added

- Initial release with basic functionality

### Fixed

- Bug fixes and improvements

[unreleased]: https://github.com/example/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/example/repo/releases/tag/v1.0.0`;

    const errors = validateChangelogFormat(validChangelog);
    return {
        pass: errors.length === 0,
        result: errors.length === 0 ? 'Valid changelog format detected' : `Errors: ${errors.join(', ')}`
    };
}

function testInvalidChangelogMissingHeader() {
    const invalidChangelog = `Some content without proper header

## [1.0.0] - 2025-01-09

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('Changelog')),
        result: errors.length > 0 ? 'Missing header detected' : 'Failed to detect missing header'
    };
}

function testInvalidVersionFormat() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0] - 2025-01-09

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('version format')),
        result: errors.length > 0 ? 'Invalid version format detected' : 'Failed to detect invalid version'
    };
}

function testInvalidDateFormat() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 01/09/2025

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('date format')),
        result: errors.length > 0 ? 'Invalid date format detected' : 'Failed to detect invalid date'
    };
}

function testInvalidCategory() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-09

### InvalidCategory
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('Invalid changelog category')),
        result: errors.length > 0 ? 'Invalid category detected' : 'Failed to detect invalid category'
    };
}

function testMissingUnreleasedSection() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-09

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('Unreleased')),
        result: errors.length > 0 ? 'Missing Unreleased section detected' : 'Failed to detect missing Unreleased'
    };
}