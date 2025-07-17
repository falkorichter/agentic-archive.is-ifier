# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.7] - 2025-07-17

### Added
- Keep a Changelog implementation following https://keepachangelog.com/en/1.1.0/ standards
- Comprehensive changelog documentation with version history
- Changelog reference in README and file structure documentation
- Development guidelines for changelog maintenance

### Changed
- Updated README to include changelog section and contributing guidelines
- Enhanced file structure documentation to include CHANGELOG.md
- Updated development metadata with changelog implementation details

## [1.2.6] - 2025-07-17

### Added
- Translation key alphabetical sorting and CI validation
- Comprehensive test coverage for version bump functionality  
- Automated patch version bumping with CI enforcement
- Support for version synchronization between package.json and manifest.json

### Fixed
- Translation key management and validation in CI pipeline
- Version consistency enforcement across project files

### Changed
- Enhanced CI pipeline with translation key validation
- Improved version management workflow

## [1.2.5] - 2025-07-17

### Added
- Comprehensive language pack support for international localization
- Support for 7 languages: English, Spanish, French, German, Portuguese, Japanese, Chinese Simplified
- Localized options page feature list for internationalization support
- Complete i18n framework implementation

### Fixed
- Beta span rendering issue in options page
- i18n title rendering to preserve HTML formatting
- Chrome extension context compatibility for localized content

### Changed
- Options page now fully localized with proper HTML preservation
- Improved internationalization strategy with innerHTML support

## [1.2.4] - 2025-07-16

### Added
- HTML/CSS validation to CI pipeline
- Comprehensive validation for code quality and consistency
- Stylelint configuration for CSS standards
- HTML validation for syntax, semantics, and accessibility

### Fixed
- Debug scanning to prioritize indicators over normal scanning conditions
- Content script availability error for debug button

### Changed
- Enhanced CI pipeline with HTML/CSS validation
- Improved debugging functionality for auto-archiving detection

## [1.2.3] - 2025-07-16

### Added
- Global scanning option for automatic archiving based on text indicators
- Comprehensive debugging functionality for auto-archiving detection
- Beta label for auto-archiving settings
- Homepage exclusion for auto-archiving feature
- Debug mode functionality with visual feedback

### Fixed
- Auto-archiving scanning logic and priority handling
- Debug button content script integration

### Changed
- Enhanced auto-archiving capabilities with global scanning
- Improved debugging and diagnostic features

## [1.2.2] - 2025-07-16

### Added
- Auto-archiving features with text indicator scanning
- Pattern-based URL scanning for targeted archiving
- Debug functionality for troubleshooting auto-archiving
- Comprehensive test coverage for auto-archiving functionality

### Fixed
- Content script integration and messaging
- Auto-archiving detection reliability

### Changed
- Enhanced extension capabilities with automatic archiving
- Improved user experience with pattern-based scanning

## [1.2.1] - 2025-07-16

### Added
- Context menu integration for archive functionality
- Popup interface with clean UI design
- Support for multiple archive services (archive.is, archive.ph, archive.today)
- Comprehensive test suite with 62+ test cases

### Fixed
- Context menu functionality and integration
- Archive service compatibility

### Changed
- Improved user interface and experience
- Enhanced archive service integration

## [1.2.0] - 2025-07-16

### Added
- Initial release of agentic-archive.is-ifier Chrome extension
- Core archiving functionality with archive.is services
- Manifest v3 compliance with modern Chrome extension standards
- Service worker implementation for background processing
- Basic internationalization framework
- Custom "is!" icon for easy identification
- Comprehensive error handling and notifications

### Features
- Archive links and pages through context menu
- Archive and copy functionality with clipboard integration
- Show archived versions using Wayback Machine
- Extract real URLs from archive links
- Archive selected text containing URLs
- Archive current page functionality

[unreleased]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.7...HEAD
[1.2.7]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/falkorichter/agentic-archive.is-ifier/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/falkorichter/agentic-archive.is-ifier/releases/tag/v1.2.0