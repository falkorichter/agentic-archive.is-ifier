#!/usr/bin/env node

/**
 * Changelog validation script for Keep a Changelog format
 * Validates CHANGELOG.md follows https://keepachangelog.com/ standards
 */

const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = process.env.CHANGELOG_PATH || 'CHANGELOG.md';

/**
 * Validate Keep a Changelog format requirements
 */
function validateChangelogFormat(content) {
    const errors = [];
    const lines = content.split('\n');
    
    // Check required header
    if (!content.includes('# Changelog')) {
        errors.push('Missing required "# Changelog" header');
    }
    
    // Check Keep a Changelog reference
    if (!content.includes('keepachangelog.com')) {
        errors.push('Missing reference to keepachangelog.com in header section');
    }
    
    // Check semantic versioning reference
    if (!content.includes('semver.org')) {
        errors.push('Missing reference to semver.org in header section');
    }
    
    // Check for Unreleased section
    if (!content.includes('## [Unreleased]')) {
        errors.push('Missing required "## [Unreleased]" section');
    }
    
    // Validate version format patterns
    const versionPattern = /## \[([^\]]+)\] - ([^\s]+)/g;
    const versions = [];
    let match;
    
    while ((match = versionPattern.exec(content)) !== null) {
        const [, version, date] = match;
        versions.push({ version, date });
        
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            errors.push(`Invalid date format "${date}" for version ${version}. Expected YYYY-MM-DD format`);
        }
        
        // Validate semantic version format
        const semverRegex = /^\d+\.\d+\.\d+$/;
        if (!semverRegex.test(version) && version !== 'Unreleased') {
            errors.push(`Invalid version format "${version}". Expected semantic versioning (MAJOR.MINOR.PATCH)`);
        }
    }
    
    // Check for valid changelog categories
    const validCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
    const categoryPattern = /### (Added|Changed|Deprecated|Removed|Fixed|Security)/g;
    const foundCategories = new Set();
    
    while ((match = categoryPattern.exec(content)) !== null) {
        foundCategories.add(match[1]);
    }
    
    // Check for invalid categories
    const invalidCategoryPattern = /### (?!(?:Added|Changed|Deprecated|Removed|Fixed|Security)\b)(\w+)/g;
    while ((match = invalidCategoryPattern.exec(content)) !== null) {
        errors.push(`Invalid changelog category "${match[1]}". Must be one of: ${validCategories.join(', ')}`);
    }
    
    // Check for version links at the bottom
    if (versions.length > 0) {
        const linkPattern = /^\[[\d.]+\]:\s*https?:\/\//m;
        if (!linkPattern.test(content)) {
            errors.push('Missing version comparison links at the bottom of the changelog');
        }
        
        // Check that all versions have corresponding links
        versions.forEach(({ version }) => {
            const linkRegex = new RegExp(`\\[${version.replace(/\./g, '\\.')}\\]:\\s*https?://`, 'm');
            if (!linkRegex.test(content)) {
                errors.push(`Missing comparison link for version ${version}`);
            }
        });
    }
    
    return errors;
}

/**
 * Validate changelog structure and content
 */
function validateChangelog() {
    console.log('Validating CHANGELOG.md format...\n');
    
    if (!fs.existsSync(CHANGELOG_PATH)) {
        console.error(`❌ CHANGELOG.md not found at ${CHANGELOG_PATH}`);
        return false;
    }
    
    let content;
    try {
        content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    } catch (error) {
        console.error(`❌ Error reading CHANGELOG.md: ${error.message}`);
        return false;
    }
    
    if (content.trim().length === 0) {
        console.error('❌ CHANGELOG.md is empty');
        return false;
    }
    
    const errors = validateChangelogFormat(content);
    
    if (errors.length === 0) {
        console.log('✅ CHANGELOG.md follows Keep a Changelog format correctly');
        return true;
    } else {
        console.log('❌ CHANGELOG.md format validation failed:\n');
        errors.forEach(error => {
            console.log(`   • ${error}`);
        });
        console.log('\nSee https://keepachangelog.com/ for format guidelines');
        return false;
    }
}

function main() {
    const isValid = validateChangelog();
    process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = { validateChangelogFormat, validateChangelog };