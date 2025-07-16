// Background service worker for Archive.is-ifier

// Default archive service URL
const DEFAULT_ARCHIVE_URL = 'https://archive.ph/submit/';

// Context menu IDs
const MENU_IDS = {
  ARCHIVE_LINK: 'archive-link',
  ARCHIVE_COPY: 'archive-copy', 
  SHOW_VERSIONS: 'show-versions',
  SHOW_REAL_URL: 'show-real-url',
  ARCHIVE_SELECTION: 'archive-selection',
  ARCHIVE_PAGE: 'archive-page'
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
  
  // Set default options
  chrome.storage.sync.get(['archiveUrl'], (result) => {
    if (!result.archiveUrl) {
      chrome.storage.sync.set({
        archiveUrl: DEFAULT_ARCHIVE_URL
      });
    }
  });
});

// Set up context menus
function setupContextMenus() {
  // Remove all existing context menus
  chrome.contextMenus.removeAll(() => {
    
    // Archive link (for links)
    chrome.contextMenus.create({
      id: MENU_IDS.ARCHIVE_LINK,
      title: chrome.i18n.getMessage('contextMenuArchive'),
      contexts: ['link']
    });

    // Archive link and copy URL (for links)
    chrome.contextMenus.create({
      id: MENU_IDS.ARCHIVE_COPY,
      title: chrome.i18n.getMessage('contextMenuArchiveCopy'),
      contexts: ['link']
    });

    // Show archived versions (for links)
    chrome.contextMenus.create({
      id: MENU_IDS.SHOW_VERSIONS,
      title: chrome.i18n.getMessage('contextMenuShowVersions'),
      contexts: ['link']
    });

    // Show real URL (for archive.is links)
    chrome.contextMenus.create({
      id: MENU_IDS.SHOW_REAL_URL,
      title: chrome.i18n.getMessage('contextMenuShowReal'),
      contexts: ['link']
    });

    // Archive selected text as URL (for text selection)
    chrome.contextMenus.create({
      id: MENU_IDS.ARCHIVE_SELECTION,
      title: chrome.i18n.getMessage('contextMenuArchiveSelection'),
      contexts: ['selection']
    });

    // Archive current page
    chrome.contextMenus.create({
      id: MENU_IDS.ARCHIVE_PAGE,
      title: chrome.i18n.getMessage('contextMenuArchivePage'),
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case MENU_IDS.ARCHIVE_LINK:
      archiveUrl(info.linkUrl);
      break;
    case MENU_IDS.ARCHIVE_COPY:
      archiveUrl(info.linkUrl, true);
      break;
    case MENU_IDS.SHOW_VERSIONS:
      showArchivedVersions(info.linkUrl);
      break;
    case MENU_IDS.SHOW_REAL_URL:
      showRealUrl(info.linkUrl);
      break;
    case MENU_IDS.ARCHIVE_SELECTION:
      archiveUrl(info.selectionText);
      break;
    case MENU_IDS.ARCHIVE_PAGE:
      archiveUrl(tab.url);
      break;
  }
});

// Archive a URL
async function archiveUrl(url, copyToClipboard = false) {
  try {
    // Get the archive service URL from storage
    const result = await chrome.storage.sync.get(['archiveUrl']);
    const archiveServiceUrl = result.archiveUrl || DEFAULT_ARCHIVE_URL;
    
    // Clean up the URL
    const cleanUrl = cleanUrl(url);
    if (!isValidUrl(cleanUrl)) {
      showNotification(chrome.i18n.getMessage('notificationError'), 'Invalid URL');
      return;
    }

    // Submit to archive service
    const archiveUrl = `${archiveServiceUrl}?url=${encodeURIComponent(cleanUrl)}`;
    
    // Open archive page in new tab
    const tab = await chrome.tabs.create({ 
      url: archiveUrl,
      active: !copyToClipboard // Don't activate tab if we're just copying
    });

    if (copyToClipboard) {
      // Wait a bit for the archive to process, then get the result
      setTimeout(async () => {
        try {
          // For now, we'll copy the archive.is URL format
          // In a real implementation, we'd need to parse the response
          const archivedUrl = `https://archive.ph/${generateArchiveId()}/${cleanUrl}`;
          await copyToClipboardFunction(archivedUrl);
          showNotification(chrome.i18n.getMessage('notificationCopied'));
        } catch (error) {
          showNotification(chrome.i18n.getMessage('notificationError'), error.message);
        }
      }, 2000);
    } else {
      showNotification(chrome.i18n.getMessage('notificationSuccess'));
    }

  } catch (error) {
    showNotification(chrome.i18n.getMessage('notificationError'), error.message);
  }
}

// Show archived versions of a URL
function showArchivedVersions(url) {
  const cleanUrl = cleanUrl(url);
  const searchUrl = `https://web.archive.org/web/*/${cleanUrl}`;
  chrome.tabs.create({ url: searchUrl });
}

// Show real URL from archive.is link
function showRealUrl(url) {
  if (isArchiveUrl(url)) {
    const realUrl = extractRealUrlFromArchive(url);
    if (realUrl) {
      chrome.tabs.create({ url: realUrl });
    } else {
      showNotification(chrome.i18n.getMessage('notificationError'), 'Could not extract real URL');
    }
  } else {
    showNotification(chrome.i18n.getMessage('notificationError'), 'Not an archive URL');
  }
}

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

// Copy text to clipboard
async function copyToClipboardFunction(text) {
  try {
    // Use the clipboard API
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Show notification
function showNotification(title, message = '') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'img/icon.png',
    title: title,
    message: message
  });
}