// Options page script

document.addEventListener('DOMContentLoaded', function() {
    loadOptions();
    setupEventListeners();
    localizeContent();
});

function setupEventListeners() {
    document.getElementById('save').addEventListener('click', saveOptions);
    document.getElementById('reset').addEventListener('click', resetOptions);
}

function localizeContent() {
    // Localize text content
    document.getElementById('title').textContent = chrome.i18n.getMessage('optionsTitle');
    document.getElementById('archiveUrlLabel').textContent = chrome.i18n.getMessage('optionsArchiveUrl');
    document.getElementById('archiveUrlHelp').textContent = chrome.i18n.getMessage('optionsArchiveUrlHelp');
    document.getElementById('autoArchivingTitle').textContent = chrome.i18n.getMessage('optionsAutoArchivingTitle');
    document.getElementById('textIndicatorsLabel').textContent = chrome.i18n.getMessage('optionsTextIndicatorsLabel');
    document.getElementById('textIndicatorsHelp').textContent = chrome.i18n.getMessage('optionsTextIndicatorsHelp');
    document.getElementById('pagePathPatternsLabel').textContent = chrome.i18n.getMessage('optionsPagePathPatternsLabel');
    document.getElementById('pagePathPatternsHelp').textContent = chrome.i18n.getMessage('optionsPagePathPatternsHelp');
    document.getElementById('globalScanningLabel').textContent = chrome.i18n.getMessage('optionsGlobalScanningLabel');
    document.getElementById('globalScanningHelp').textContent = chrome.i18n.getMessage('optionsGlobalScanningHelp');
    document.getElementById('save').textContent = chrome.i18n.getMessage('optionsSave');
    document.title = chrome.i18n.getMessage('optionsTitle');
}

function loadOptions() {
    chrome.storage.sync.get({
        archiveUrl: 'https://archive.ph/submit/',
        globalScanning: false,
        textIndicators: '',
        pagePathPatterns: ''
    }, function(items) {
        document.getElementById('archiveUrl').value = items.archiveUrl;
        document.getElementById('globalScanning').checked = items.globalScanning;
        document.getElementById('textIndicators').value = items.textIndicators;
        document.getElementById('pagePathPatterns').value = items.pagePathPatterns;
    });
}

function saveOptions() {
    const archiveUrl = document.getElementById('archiveUrl').value;
    const globalScanning = document.getElementById('globalScanning').checked;
    const textIndicators = document.getElementById('textIndicators').value;
    const pagePathPatterns = document.getElementById('pagePathPatterns').value;
    
    chrome.storage.sync.set({
        archiveUrl: archiveUrl,
        globalScanning: globalScanning,
        textIndicators: textIndicators,
        pagePathPatterns: pagePathPatterns
    }, function() {
        // Update status
        showStatus('Options saved successfully!', 'success');
        
        // Clear status after 3 seconds
        setTimeout(hideStatus, 3000);
    });
}

function resetOptions() {
    document.getElementById('archiveUrl').value = 'https://archive.ph/submit/';
    document.getElementById('globalScanning').checked = false;
    document.getElementById('textIndicators').value = '';
    document.getElementById('pagePathPatterns').value = '';
    saveOptions();
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
}

function hideStatus() {
    const status = document.getElementById('status');
    status.style.display = 'none';
}