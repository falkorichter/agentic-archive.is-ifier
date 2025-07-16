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
        
        // Check if this is a homepage URL (exclude homepages from scanning)
        const url = new URL(currentUrl);
        const isHomepage = url.pathname === '/' || url.pathname === '';
        
        if (isHomepage) {
            debugLog('Homepage detected - skipping scan', {
                hostname: url.hostname,
                pathname: url.pathname
            });
            return false;
        }
        
        // If global scanning is enabled, scan all pages (except homepages)
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

    // Show toast notification on the page
    function showToastNotification(message, isSuccess = true) {
        // Remove any existing toast
        const existingToast = document.getElementById('archive-is-ifier-debug-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.id = 'archive-is-ifier-debug-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isSuccess ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Debug-specific scanning function that always runs and shows comprehensive results
    async function debugScanPage() {
        try {
            debugLog('=== DEBUG SCAN: STARTING COMPREHENSIVE ANALYSIS ===');
            
            // Get settings from storage
            const settings = await chrome.storage.sync.get([
                'globalScanning',
                'textIndicators', 
                'pagePathPatterns',
                'debugMode'
            ]);

            debugMode = settings.debugMode || false;
            const currentUrl = window.location.href;
            
            debugLog('🔍 Debug Scan Configuration:', {
                url: currentUrl,
                settings: {
                    globalScanning: settings.globalScanning,
                    hasTextIndicators: !!(settings.textIndicators && settings.textIndicators.trim()),
                    hasPagePathPatterns: !!(settings.pagePathPatterns && settings.pagePathPatterns.trim()),
                    debugMode: debugMode
                }
            });

            // Check all conditions step by step
            let wouldArchive = false;
            let archiveReason = '';
            let skipReason = '';

            // 1. Check if this is a homepage (this would normally skip scanning)
            const url = new URL(currentUrl);
            const isHomepage = url.pathname === '/' || url.pathname === '';
            
            if (isHomepage) {
                debugLog('🏠 Homepage Check: DETECTED - This is a homepage', {
                    hostname: url.hostname,
                    pathname: url.pathname
                });
                skipReason = 'Homepage URLs are excluded from automatic scanning';
            } else {
                debugLog('🏠 Homepage Check: PASSED - Not a homepage');
            }

            // 2. Check if global scanning is enabled
            const globalScanningEnabled = settings.globalScanning === true;
            debugLog(`🌐 Global Scanning: ${globalScanningEnabled ? 'ENABLED' : 'DISABLED'}`);

            // 3. Check page path patterns
            const pathPatterns = settings.pagePathPatterns || '';
            let pathMatches = false;
            let matchedPattern = '';
            
            if (pathPatterns.trim()) {
                debugLog('🎯 Checking Page Path Patterns:', {
                    patterns: pathPatterns.split('\n').filter(p => p.trim())
                });
                
                const patterns = pathPatterns.split('\n').filter(p => p.trim());
                
                for (let i = 0; i < patterns.length; i++) {
                    const pattern = patterns[i];
                    const trimmedPattern = pattern.trim();
                    if (!trimmedPattern) continue;
                    
                    try {
                        let matches = false;
                        if (trimmedPattern.startsWith('/') && trimmedPattern.endsWith('/')) {
                            const regex = new RegExp(trimmedPattern.slice(1, -1), 'i');
                            matches = regex.test(currentUrl);
                            debugLog(`   Pattern ${i + 1} (regex): "${trimmedPattern}" - ${matches ? '✅ MATCH' : '❌ no match'}`);
                        } else {
                            matches = currentUrl.toLowerCase().includes(trimmedPattern.toLowerCase());
                            debugLog(`   Pattern ${i + 1} (text): "${trimmedPattern}" - ${matches ? '✅ MATCH' : '❌ no match'}`);
                        }
                        
                        if (matches && !pathMatches) {
                            pathMatches = true;
                            matchedPattern = trimmedPattern;
                        }
                    } catch (error) {
                        debugLog(`   Pattern ${i + 1} regex error, falling back to text matching: "${trimmedPattern}"`, error);
                        const matches = currentUrl.toLowerCase().includes(trimmedPattern.toLowerCase());
                        debugLog(`   Pattern ${i + 1} (fallback text): "${trimmedPattern}" - ${matches ? '✅ MATCH' : '❌ no match'}`);
                        if (matches && !pathMatches) {
                            pathMatches = true;
                            matchedPattern = trimmedPattern;
                        }
                    }
                }
            } else {
                debugLog('🎯 Page Path Patterns: NONE CONFIGURED');
            }

            // 4. Determine if scanning would normally occur
            const normalScanWouldOccur = !isHomepage && (globalScanningEnabled || pathMatches);
            
            if (normalScanWouldOccur) {
                debugLog('✅ Normal Scan Decision: WOULD SCAN');
                if (globalScanningEnabled) {
                    debugLog('   Reason: Global scanning is enabled');
                } else if (pathMatches) {
                    debugLog(`   Reason: URL matches pattern: "${matchedPattern}"`);
                }
            } else {
                debugLog('❌ Normal Scan Decision: WOULD SKIP');
                if (isHomepage) {
                    debugLog('   Reason: Homepage URLs are excluded');
                } else if (!globalScanningEnabled && !pathMatches) {
                    debugLog('   Reason: Global scanning disabled and no path patterns match');
                }
            }

            // 5. Always run indicator scanning for debug (regardless of normal conditions)
            debugLog('🔍 Running indicator scan (debug mode always scans)...');
            const foundIndicators = scanPageForIndicators(settings.textIndicators || '');
            
            // 6. Determine final result
            // In debug mode, indicators take precedence over normal scanning conditions (except homepage exclusion)
            if (isHomepage) {
                wouldArchive = false;
                skipReason = 'Homepage exclusion';
            } else if (foundIndicators.length > 0) {
                wouldArchive = true;
                archiveReason = `Found indicators: ${foundIndicators.join(', ')}`;
                if (!normalScanWouldOccur) {
                    archiveReason += ' (debug mode: indicators override normal scanning conditions)';
                }
            } else {
                wouldArchive = false;
                skipReason = 'No indicators found in page content';
            }

            // 7. Show final result
            debugLog('=== DEBUG SCAN: FINAL RESULT ===');
            if (wouldArchive) {
                debugLog('✅ RESULT: Archive page WOULD OPEN');
                debugLog(`   Trigger: ${archiveReason}`);
                showToastNotification(`✅ Archive WOULD open - ${archiveReason}`, true);
            } else {
                debugLog('❌ RESULT: Archive page would NOT open');
                debugLog(`   Reason: ${skipReason}`);
                showToastNotification(`❌ Archive would NOT open - ${skipReason}`, false);
            }

            debugLog('=== DEBUG SCAN: ANALYSIS COMPLETE ===');
            
            return {
                wouldArchive: wouldArchive,
                reason: wouldArchive ? archiveReason : skipReason,
                foundIndicators: foundIndicators,
                normalScanWouldOccur: normalScanWouldOccur,
                isHomepage: isHomepage,
                globalScanningEnabled: globalScanningEnabled,
                pathMatches: pathMatches
            };
            
        } catch (error) {
            console.error('Archive.is-ifier: Error in debug scan:', error);
            debugLog('❌ DEBUG SCAN ERROR:', error);
            showToastNotification('❌ Debug scan error: ' + error.message, false);
            throw error;
        }
    }

    // Manual debug scanning function (called from popup)
    async function manualDebugScan() {
        debugLog('=== MANUAL DEBUG SCAN TRIGGERED ===');
        const result = await debugScanPage();
        debugLog('=== MANUAL DEBUG SCAN COMPLETED ===');
        return result;
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'MANUAL_DEBUG_SCAN') {
            debugLog('Received manual debug scan request from popup');
            manualDebugScan().then((result) => {
                sendResponse({ success: true, result: result });
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