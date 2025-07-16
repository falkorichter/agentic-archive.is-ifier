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
    document.getElementById('save').textContent = chrome.i18n.getMessage('optionsSave');
    document.title = chrome.i18n.getMessage('optionsTitle');
}

function loadOptions() {
    chrome.storage.sync.get({
        archiveUrl: 'https://archive.ph/submit/'
    }, function(items) {
        document.getElementById('archiveUrl').value = items.archiveUrl;
    });
}

function saveOptions() {
    const archiveUrl = document.getElementById('archiveUrl').value;
    
    chrome.storage.sync.set({
        archiveUrl: archiveUrl
    }, function() {
        // Update status
        showStatus('Options saved successfully!', 'success');
        
        // Clear status after 3 seconds
        setTimeout(hideStatus, 3000);
    });
}

function resetOptions() {
    document.getElementById('archiveUrl').value = 'https://archive.ph/submit/';
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