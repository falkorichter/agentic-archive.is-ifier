#!/usr/bin/env node

/**
 * Script to sort translation keys alphabetically in all locale files
 * This ensures consistent ordering and makes maintenance easier
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = '_locales';

function sortTranslationKeys(filePath) {
    try {
        // Read the JSON file
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        
        // Sort keys alphabetically
        const sortedKeys = Object.keys(translations).sort();
        const sortedTranslations = {};
        
        sortedKeys.forEach(key => {
            sortedTranslations[key] = translations[key];
        });
        
        // Write back with proper formatting (4 spaces indentation to match existing style)
        const sortedContent = JSON.stringify(sortedTranslations, null, 4) + '\n';
        fs.writeFileSync(filePath, sortedContent, 'utf8');
        
        console.log(`✅ Sorted keys in ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    console.log('Sorting translation keys alphabetically...\n');
    
    if (!fs.existsSync(LOCALES_DIR)) {
        console.error(`❌ Locales directory '${LOCALES_DIR}' not found`);
        process.exit(1);
    }
    
    const locales = fs.readdirSync(LOCALES_DIR);
    let success = true;
    
    for (const locale of locales) {
        const localePath = path.join(LOCALES_DIR, locale);
        const messagesPath = path.join(localePath, 'messages.json');
        
        if (fs.existsSync(messagesPath) && fs.statSync(messagesPath).isFile()) {
            if (!sortTranslationKeys(messagesPath)) {
                success = false;
            }
        }
    }
    
    if (success) {
        console.log('\n✅ All translation keys sorted successfully!');
    } else {
        console.log('\n❌ Some files failed to process');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { sortTranslationKeys };