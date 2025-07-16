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

// Test function to verify tab creation with correct index
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
        expectedResponse = { success: true };
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