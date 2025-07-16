// Popup script for Archive.is-ifier extension

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize popup
    await initializePopup();
    
    // Set up event listeners
    setupEventListeners();
});

async function initializePopup() {
    try {
        // Load localized text
        document.getElementById('appTitle').textContent = chrome.i18n.getMessage('appName');
        document.getElementById('archivePageTitle').textContent = chrome.i18n.getMessage('popupArchivePage');
        document.getElementById('archivePageDesc').textContent = chrome.i18n.getMessage('popupArchivePageDesc');
        document.getElementById('showVersionsTitle').textContent = chrome.i18n.getMessage('popupShowVersions');
        document.getElementById('showVersionsDesc').textContent = chrome.i18n.getMessage('popupShowVersionsDesc');
        document.getElementById('debugScanTitle').textContent = chrome.i18n.getMessage('popupDebugScanTitle') || 'Run Debug Scan';
        document.getElementById('debugScanDesc').textContent = chrome.i18n.getMessage('popupDebugScanDesc') || 'Manually trigger detection and view logs';
        document.getElementById('settingsTitle').textContent = chrome.i18n.getMessage('popupSettings');
        document.getElementById('settingsDesc').textContent = chrome.i18n.getMessage('popupSettingsDesc');
        
        // Check if debug mode is enabled and show/hide debug button
        const settings = await chrome.storage.sync.get(['debugMode']);
        const debugModeEnabled = settings.debugMode || false;
        
        const debugButton = document.getElementById('runDebugScan');
        if (debugModeEnabled) {
            debugButton.style.display = 'block';
        } else {
            debugButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing popup:', error);
    }
}

function setupEventListeners() {
    // Archive current page
    document.getElementById('archivePage').addEventListener('click', async () => {
        await handleArchivePage();
    });
    
    // Show archived versions
    document.getElementById('showVersions').addEventListener('click', async () => {
        await handleShowVersions();
    });
    
    // Run debug scan
    document.getElementById('runDebugScan').addEventListener('click', async () => {
        await handleDebugScan();
    });
    
    // Open settings
    document.getElementById('openSettings').addEventListener('click', async () => {
        await handleOpenSettings();
    });
}

async function handleArchivePage() {
    try {
        showStatus('Archiving page...', 'info');
        
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            showStatus('Error: Could not get current page URL', 'error');
            return;
        }
        
        // Check if it's a valid URL to archive
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
            showStatus('Error: Cannot archive browser internal pages', 'error');
            return;
        }
        
        // Send message to background script to archive the page
        await chrome.runtime.sendMessage({
            action: 'archivePage',
            url: tab.url
        });
        
        showStatus('Page sent for archiving!', 'success');
        
        // Close popup after a short delay
        setTimeout(() => {
            window.close();
        }, 1500);
        
    } catch (error) {
        console.error('Error archiving page:', error);
        showStatus('Error archiving page', 'error');
    }
}

async function handleDebugScan() {
    try {
        showStatus('Running debug scan...', 'info');
        
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            showStatus('Error: Could not get current page URL', 'error');
            return;
        }
        
        // Check if it's a valid URL to scan
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
            showStatus('Error: Cannot scan browser internal pages', 'error');
            return;
        }
        
        // First, check if content script is available
        let contentScriptAvailable = false;
        try {
            const pingResponse = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
            contentScriptAvailable = pingResponse && pingResponse.available;
        } catch (error) {
            // Content script not available
            contentScriptAvailable = false;
        }
        
        // If content script is not available, try to inject it
        if (!contentScriptAvailable) {
            showStatus('Injecting content script...', 'info');
            
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                
                // Wait a moment for the script to initialize
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (injectError) {
                console.error('Failed to inject content script:', injectError);
                showStatus('Error: Could not inject content script. Page may not support scripts.', 'error');
                return;
            }
        }
        
        // Now try to run the debug scan
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                type: 'MANUAL_DEBUG_SCAN'
            });
            
            if (response && response.success) {
                showStatus('Debug scan completed! Check console for detailed logs.', 'success');
            } else {
                showStatus('Debug scan failed: ' + (response?.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Failed to send debug scan message:', error);
            showStatus('Error: Failed to communicate with content script.', 'error');
        }
        
    } catch (error) {
        console.error('Error running debug scan:', error);
        showStatus('Error running debug scan', 'error');
    }
}

async function handleShowVersions() {
    try {
        showStatus('Opening archived versions...', 'info');
        
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            showStatus('Error: Could not get current page URL', 'error');
            return;
        }
        
        // Check if it's a valid URL
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
            showStatus('Error: Cannot check archive for browser internal pages', 'error');
            return;
        }
        
        // Send message to background script to show archived versions
        await chrome.runtime.sendMessage({
            action: 'showVersions',
            url: tab.url
        });
        
        // Close popup
        window.close();
        
    } catch (error) {
        console.error('Error showing versions:', error);
        showStatus('Error opening archived versions', 'error');
    }
}

async function handleOpenSettings() {
    try {
        // Open options page
        await chrome.runtime.openOptionsPage();
        
        // Close popup
        window.close();
        
    } catch (error) {
        console.error('Error opening settings:', error);
        showStatus('Error opening settings', 'error');
    }
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');
    
    // Auto-hide after 3 seconds unless it's an error
    if (type !== 'error') {
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 3000);
    }
}