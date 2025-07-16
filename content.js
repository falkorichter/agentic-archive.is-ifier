// Content script for Archive.is-ifier
// Scans page content for indicator texts and triggers auto-archiving

(function() {
    'use strict';

    let debugMode = false;

    // Debug logging function
    function debugLog(message, ...args) {
        if (debugMode) {
            console.log(`[Archive.is-ifier Debug] ${message}`, ...args);
        }
    }

    // Check if we should scan this page
    async function checkAndScanPage() {
        try {
            // Get settings from storage
            const settings = await chrome.storage.sync.get([
                'globalScanning',
                'textIndicators', 
                'pagePathPatterns',
                'debugMode'
            ]);

            debugMode = settings.debugMode || false;
            
            debugLog('Starting page scan check', {
                url: window.location.href,
                settings: {
                    globalScanning: settings.globalScanning,
                    hasTextIndicators: !!(settings.textIndicators && settings.textIndicators.trim()),
                    hasPagePathPatterns: !!(settings.pagePathPatterns && settings.pagePathPatterns.trim()),
                    debugMode: debugMode
                }
            });

            const shouldScan = await shouldScanCurrentPage(settings);
            
            debugLog('Scan decision result:', shouldScan);
            
            if (shouldScan) {
                debugLog('Scanning page for indicators...');
                const foundIndicators = scanPageForIndicators(settings.textIndicators || '');
                
                debugLog('Scan completed', {
                    foundIndicators: foundIndicators,
                    indicatorCount: foundIndicators.length
                });
                
                if (foundIndicators.length > 0) {
                    debugLog('Auto-archive triggered!', {
                        url: window.location.href,
                        triggeredBy: foundIndicators
                    });
                    
                    // Send message to background script to archive this page
                    chrome.runtime.sendMessage({
                        type: 'AUTO_ARCHIVE',
                        url: window.location.href,
                        indicators: foundIndicators
                    });
                } else {
                    debugLog('No indicators found - no auto-archive triggered');
                }
            } else {
                debugLog('Page scan skipped - conditions not met');
            }
        } catch (error) {
            console.error('Archive.is-ifier: Error scanning page:', error);
        }
    }

    // Determine if current page should be scanned
    async function shouldScanCurrentPage(settings) {
        const currentUrl = window.location.href;
        
        debugLog('Checking if page should be scanned', {
            currentUrl: currentUrl,
            globalScanning: settings.globalScanning
        });
        
        // If global scanning is enabled, scan all pages
        if (settings.globalScanning === true) {
            debugLog('Global scanning enabled - will scan this page');
            return true;
        }

        // Otherwise, check if current page matches any path patterns
        const pathPatterns = settings.pagePathPatterns || '';
        if (!pathPatterns.trim()) {
            debugLog('No page path patterns configured and global scanning disabled - skipping scan');
            return false;
        }

        debugLog('Checking page path patterns', {
            pathPatterns: pathPatterns.split('\n').filter(p => p.trim())
        });

        const patterns = pathPatterns.split('\n').filter(p => p.trim());
        
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            const trimmedPattern = pattern.trim();
            if (!trimmedPattern) continue;
            
            try {
                let matches = false;
                // Support both simple text matching and regex patterns
                if (trimmedPattern.startsWith('/') && trimmedPattern.endsWith('/')) {
                    // Treat as regex
                    const regex = new RegExp(trimmedPattern.slice(1, -1), 'i');
                    matches = regex.test(currentUrl);
                    debugLog(`Pattern ${i + 1} (regex): "${trimmedPattern}" - ${matches ? 'MATCH' : 'no match'}`);
                } else {
                    // Simple string matching (case insensitive)
                    matches = currentUrl.toLowerCase().includes(trimmedPattern.toLowerCase());
                    debugLog(`Pattern ${i + 1} (text): "${trimmedPattern}" - ${matches ? 'MATCH' : 'no match'}`);
                }
                
                if (matches) {
                    debugLog('Page matches pattern - will scan for indicators');
                    return true;
                }
            } catch (error) {
                debugLog(`Pattern ${i + 1} regex error, falling back to text matching: "${trimmedPattern}"`, error);
                // If regex is invalid, fall back to string matching
                const matches = currentUrl.toLowerCase().includes(trimmedPattern.toLowerCase());
                debugLog(`Pattern ${i + 1} (fallback text): "${trimmedPattern}" - ${matches ? 'MATCH' : 'no match'}`);
                if (matches) {
                    debugLog('Page matches pattern (fallback) - will scan for indicators');
                    return true;
                }
            }
        }
        
        debugLog('No pattern matches found - scan skipped');
        return false;
    }

    // Helper function to normalize whitespace for text matching
    function normalizeWhitespace(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Scan page content for indicator texts
    function scanPageForIndicators(textIndicators) {
        debugLog('Starting indicator scan', {
            hasTextIndicators: !!(textIndicators && textIndicators.trim()),
            textIndicatorsLength: textIndicators ? textIndicators.length : 0
        });
        
        if (!textIndicators.trim()) {
            debugLog('No text indicators configured - scan aborted');
            return [];
        }

        const indicators = textIndicators.split('\n').filter(i => i.trim());
        const foundIndicators = [];
        const pageText = document.body.innerText.toLowerCase();
        const normalizedPageText = normalizeWhitespace(pageText);
        
        debugLog('Page content prepared for scanning', {
            indicatorCount: indicators.length,
            pageTextLength: pageText.length,
            normalizedPageTextLength: normalizedPageText.length,
            pageTextPreview: normalizedPageText.substring(0, 200) + (normalizedPageText.length > 200 ? '...' : '')
        });

        indicators.forEach((indicator, index) => {
            const trimmedIndicator = indicator.trim();
            if (!trimmedIndicator) {
                debugLog(`Indicator ${index + 1}: Empty - skipped`);
                return;
            }

            try {
                let found = false;
                // Support both simple text matching and regex patterns
                if (trimmedIndicator.startsWith('/') && trimmedIndicator.endsWith('/')) {
                    // Treat as regex
                    const regex = new RegExp(trimmedIndicator.slice(1, -1), 'gi');
                    found = regex.test(normalizedPageText);
                    debugLog(`Indicator ${index + 1} (regex): "${trimmedIndicator}" - ${found ? 'FOUND' : 'not found'}`);
                    if (found) {
                        const matches = normalizedPageText.match(regex);
                        debugLog(`Regex matches:`, matches);
                    }
                } else {
                    // Simple string matching (case insensitive) with normalized whitespace
                    const normalizedIndicator = normalizeWhitespace(trimmedIndicator.toLowerCase());
                    found = normalizedPageText.includes(normalizedIndicator);
                    debugLog(`Indicator ${index + 1} (text): "${trimmedIndicator}" -> normalized: "${normalizedIndicator}" - ${found ? 'FOUND' : 'not found'}`);
                    if (found) {
                        const position = normalizedPageText.indexOf(normalizedIndicator);
                        const context = normalizedPageText.substring(Math.max(0, position - 50), position + normalizedIndicator.length + 50);
                        debugLog(`Found at position ${position}, context: "...${context}..."`);
                    }
                }
                
                if (found) {
                    foundIndicators.push(trimmedIndicator);
                }
            } catch (error) {
                debugLog(`Indicator ${index + 1} regex error, falling back to text matching: "${trimmedIndicator}"`, error);
                // If regex is invalid, fall back to string matching
                const normalizedIndicator = normalizeWhitespace(trimmedIndicator.toLowerCase());
                const found = normalizedPageText.includes(normalizedIndicator);
                debugLog(`Indicator ${index + 1} (fallback text): "${trimmedIndicator}" -> normalized: "${normalizedIndicator}" - ${found ? 'FOUND' : 'not found'}`);
                if (found) {
                    foundIndicators.push(trimmedIndicator);
                    const position = normalizedPageText.indexOf(normalizedIndicator);
                    const context = normalizedPageText.substring(Math.max(0, position - 50), position + normalizedIndicator.length + 50);
                    debugLog(`Found at position ${position}, context: "...${context}..."`);
                }
            }
        });

        debugLog('Indicator scan completed', {
            totalIndicators: indicators.length,
            foundIndicators: foundIndicators,
            foundCount: foundIndicators.length
        });

        return foundIndicators;
    }

    // Manual debug scanning function (called from popup)
    async function manualDebugScan() {
        debugLog('=== MANUAL DEBUG SCAN TRIGGERED ===');
        await checkAndScanPage();
        debugLog('=== MANUAL DEBUG SCAN COMPLETED ===');
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'MANUAL_DEBUG_SCAN') {
            debugLog('Received manual debug scan request from popup');
            manualDebugScan().then(() => {
                sendResponse({ success: true });
            }).catch(error => {
                console.error('Manual debug scan error:', error);
                sendResponse({ success: false, error: error.message });
            });
            return true; // Will respond asynchronously
        } else if (request.type === 'PING') {
            // Simple ping to check if content script is available
            sendResponse({ available: true });
            return false;
        }
    });

    // Wait for page to load, then scan
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndScanPage);
    } else {
        // Page already loaded
        checkAndScanPage();
    }

})();