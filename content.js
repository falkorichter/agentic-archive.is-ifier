// Content script for Archive.is-ifier
// Scans page content for indicator texts and triggers auto-archiving

(function() {
    'use strict';

    // Check if we should scan this page
    async function checkAndScanPage() {
        try {
            // Get settings from storage
            const settings = await chrome.storage.sync.get([
                'globalScanning',
                'textIndicators', 
                'pagePathPatterns'
            ]);

            const shouldScan = await shouldScanCurrentPage(settings);
            
            if (shouldScan) {
                const foundIndicators = scanPageForIndicators(settings.textIndicators || '');
                
                if (foundIndicators.length > 0) {
                    // Send message to background script to archive this page
                    chrome.runtime.sendMessage({
                        type: 'AUTO_ARCHIVE',
                        url: window.location.href,
                        indicators: foundIndicators
                    });
                }
            }
        } catch (error) {
            console.error('Archive.is-ifier: Error scanning page:', error);
        }
    }

    // Determine if current page should be scanned
    async function shouldScanCurrentPage(settings) {
        // If global scanning is enabled, scan all pages
        if (settings.globalScanning === true) {
            return true;
        }

        // Otherwise, check if current page matches any path patterns
        const pathPatterns = settings.pagePathPatterns || '';
        if (!pathPatterns.trim()) {
            return false;
        }

        const currentUrl = window.location.href;
        const patterns = pathPatterns.split('\n').filter(p => p.trim());
        
        return patterns.some(pattern => {
            const trimmedPattern = pattern.trim();
            if (!trimmedPattern) return false;
            
            try {
                // Support both simple text matching and regex patterns
                if (trimmedPattern.startsWith('/') && trimmedPattern.endsWith('/')) {
                    // Treat as regex
                    const regex = new RegExp(trimmedPattern.slice(1, -1), 'i');
                    return regex.test(currentUrl);
                } else {
                    // Simple string matching (case insensitive)
                    return currentUrl.toLowerCase().includes(trimmedPattern.toLowerCase());
                }
            } catch (error) {
                // If regex is invalid, fall back to string matching
                return currentUrl.toLowerCase().includes(trimmedPattern.toLowerCase());
            }
        });
    }

    // Helper function to normalize whitespace for text matching
    function normalizeWhitespace(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Scan page content for indicator texts
    function scanPageForIndicators(textIndicators) {
        if (!textIndicators.trim()) {
            return [];
        }

        const indicators = textIndicators.split('\n').filter(i => i.trim());
        const foundIndicators = [];
        const pageText = document.body.innerText.toLowerCase();
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

    // Wait for page to load, then scan
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndScanPage);
    } else {
        // Page already loaded
        checkAndScanPage();
    }

})();