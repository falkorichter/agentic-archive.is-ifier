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