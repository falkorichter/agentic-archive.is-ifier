#!/usr/bin/env node

/**
 * Script to validate that translation keys are sorted alphabetically
 * Used in CI to enforce consistent key ordering
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = '_locales';

function validateTranslationKeysOrder(filePath) {
    try {
        // Read the JSON file
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        
        // Get current keys and sorted keys
        const currentKeys = Object.keys(translations);
        const sortedKeys = [...currentKeys].sort();
        
        // Check if they match
        const isCorrectOrder = JSON.stringify(currentKeys) === JSON.stringify(sortedKeys);
        
        if (isCorrectOrder) {
            console.log(`✅ ${filePath} - Keys are sorted alphabetically`);
            return true;
        } else {
            console.log(`❌ ${filePath} - Keys are NOT sorted alphabetically`);
            console.log(`   Current order: ${currentKeys.slice(0, 5).join(', ')}...`);
            console.log(`   Expected order: ${sortedKeys.slice(0, 5).join(', ')}...`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    console.log('Validating translation key alphabetical order...\n');
    
    if (!fs.existsSync(LOCALES_DIR)) {
        console.error(`❌ Locales directory '${LOCALES_DIR}' not found`);
        process.exit(1);
    }
    
    const locales = fs.readdirSync(LOCALES_DIR);
    let allValid = true;
    
    for (const locale of locales) {
        const localePath = path.join(LOCALES_DIR, locale);
        const messagesPath = path.join(localePath, 'messages.json');
        
        if (fs.existsSync(messagesPath) && fs.statSync(messagesPath).isFile()) {
            if (!validateTranslationKeysOrder(messagesPath)) {
                allValid = false;
            }
        }
    }
    
    console.log();
    if (allValid) {
        console.log('✅ All translation files have correctly sorted keys!');
    } else {
        console.log('❌ Some translation files have incorrectly sorted keys');
        console.log('   Run: npm run translations:sort');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateTranslationKeysOrder };