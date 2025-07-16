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
    
    // Special handling for auto archiving title to preserve the (Beta) span
    const autoArchivingTitle = document.getElementById('autoArchivingTitle');
    const baseTitle = chrome.i18n.getMessage('optionsAutoArchivingTitle');
    autoArchivingTitle.innerHTML = `${baseTitle} <span style="color: #ff6600; font-size: 0.8em; font-weight: normal;">(Beta)</span>`;
    
    document.getElementById('textIndicatorsLabel').textContent = chrome.i18n.getMessage('optionsTextIndicatorsLabel');
    document.getElementById('textIndicatorsHelp').textContent = chrome.i18n.getMessage('optionsTextIndicatorsHelp');
    document.getElementById('pagePathPatternsLabel').textContent = chrome.i18n.getMessage('optionsPagePathPatternsLabel');
    document.getElementById('pagePathPatternsHelp').textContent = chrome.i18n.getMessage('optionsPagePathPatternsHelp');
    document.getElementById('globalScanningLabel').textContent = chrome.i18n.getMessage('optionsGlobalScanningLabel');
    document.getElementById('globalScanningHelp').textContent = chrome.i18n.getMessage('optionsGlobalScanningHelp');
    document.getElementById('debugSettingsTitle').textContent = chrome.i18n.getMessage('optionsDebugSettingsTitle') || 'Debug Settings';
    document.getElementById('debugModeLabel').textContent = chrome.i18n.getMessage('optionsDebugModeLabel') || 'Enable debug mode';
    document.getElementById('debugModeHelp').textContent = chrome.i18n.getMessage('optionsDebugModeHelp') || 'When enabled, detailed logging will be shown in console and debug tools will be available in popup';
    document.getElementById('save').textContent = chrome.i18n.getMessage('optionsSave');
    document.getElementById('reset').textContent = chrome.i18n.getMessage('optionsReset');
    document.title = chrome.i18n.getMessage('optionsTitle');
    
    // Localize features section
    document.getElementById('featuresTitle').textContent = chrome.i18n.getMessage('optionsFeaturesTitle');
    document.getElementById('feature1').textContent = chrome.i18n.getMessage('optionsFeature1');
    document.getElementById('feature2').textContent = chrome.i18n.getMessage('optionsFeature2');
    document.getElementById('feature3').textContent = chrome.i18n.getMessage('optionsFeature3');
    document.getElementById('feature4').textContent = chrome.i18n.getMessage('optionsFeature4');
    document.getElementById('feature5').textContent = chrome.i18n.getMessage('optionsFeature5');
    document.getElementById('feature6').textContent = chrome.i18n.getMessage('optionsFeature6');
    
    // Special handling for features with <strong> tags to preserve formatting
    const feature7Element = document.getElementById('feature7');
    const feature7Text = chrome.i18n.getMessage('optionsFeature7');
    feature7Element.innerHTML = `<strong>Auto-archive pages</strong> ${feature7Text.replace('Auto-archive pages ', '')}`;
    
    const feature8Element = document.getElementById('feature8');
    const feature8Text = chrome.i18n.getMessage('optionsFeature8');
    feature8Element.innerHTML = `<strong>Configure scanning</strong> ${feature8Text.replace('Configure scanning ', '')}`;
}

function loadOptions() {
    chrome.storage.sync.get({
        archiveUrl: 'https://archive.ph/submit/',
        globalScanning: false,
        textIndicators: '',
        pagePathPatterns: '',
        debugMode: false
    }, function(items) {
        document.getElementById('archiveUrl').value = items.archiveUrl;
        document.getElementById('globalScanning').checked = items.globalScanning;
        document.getElementById('textIndicators').value = items.textIndicators;
        document.getElementById('pagePathPatterns').value = items.pagePathPatterns;
        document.getElementById('debugMode').checked = items.debugMode;
    });
}

function saveOptions() {
    const archiveUrl = document.getElementById('archiveUrl').value;
    const globalScanning = document.getElementById('globalScanning').checked;
    const textIndicators = document.getElementById('textIndicators').value;
    const pagePathPatterns = document.getElementById('pagePathPatterns').value;
    const debugMode = document.getElementById('debugMode').checked;
    
    chrome.storage.sync.set({
        archiveUrl: archiveUrl,
        globalScanning: globalScanning,
        textIndicators: textIndicators,
        pagePathPatterns: pagePathPatterns,
        debugMode: debugMode
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
    document.getElementById('debugMode').checked = false;
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