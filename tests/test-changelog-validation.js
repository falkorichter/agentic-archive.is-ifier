#!/usr/bin/env node

/**
 * Tests for changelog validation functionality
 */

const { validateChangelogFormat } = require('../scripts/validate-changelog.js');

/**
 * Test changelog format validation with valid content
 */
function testValidChangelogFormat() {
    const validChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-09

### Added

- Initial release with basic functionality

### Fixed

- Bug fixes and improvements

[unreleased]: https://github.com/example/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/example/repo/releases/tag/v1.0.0`;

    const errors = validateChangelogFormat(validChangelog);
    return {
        pass: errors.length === 0,
        result: errors.length === 0 ? 'Valid changelog format detected' : `Errors: ${errors.join(', ')}`
    };
}

/**
 * Test changelog format validation with missing header
 */
function testInvalidChangelogMissingHeader() {
    const invalidChangelog = `Some content without proper header

## [1.0.0] - 2025-01-09

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('Changelog')),
        result: errors.length > 0 ? 'Missing header detected' : 'Failed to detect missing header'
    };
}

/**
 * Test changelog format validation with invalid version format
 */
function testInvalidVersionFormat() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0] - 2025-01-09

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('version format')),
        result: errors.length > 0 ? 'Invalid version format detected' : 'Failed to detect invalid version'
    };
}

/**
 * Test changelog format validation with invalid date format
 */
function testInvalidDateFormat() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 01/09/2025

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('date format')),
        result: errors.length > 0 ? 'Invalid date format detected' : 'Failed to detect invalid date'
    };
}

/**
 * Test changelog format validation with invalid category
 */
function testInvalidCategory() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-09

### InvalidCategory
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('Invalid changelog category')),
        result: errors.length > 0 ? 'Invalid category detected' : 'Failed to detect invalid category'
    };
}

/**
 * Test changelog format validation with missing Unreleased section
 */
function testMissingUnreleasedSection() {
    const invalidChangelog = `# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-09

### Added
- Something`;

    const errors = validateChangelogFormat(invalidChangelog);
    return {
        pass: errors.length > 0 && errors.some(e => e.includes('Unreleased')),
        result: errors.length > 0 ? 'Missing Unreleased section detected' : 'Failed to detect missing Unreleased'
    };
}

module.exports = {
    testValidChangelogFormat,
    testInvalidChangelogMissingHeader,
    testInvalidVersionFormat,
    testInvalidDateFormat,
    testInvalidCategory,
    testMissingUnreleasedSection
};