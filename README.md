# agentic-archive.is-ifier

A Chrome extension for archiving URLs with archive.is and similar services. This extension provides comprehensive context menu integration for archiving web content and managing archive links.

## Features

### ✅ Popup Interface
The extension provides a clean popup interface when clicking the extension icon in the browser toolbar:

![Popup Interface](https://github.com/user-attachments/assets/fda4e460-8af4-48df-8e16-6bae43557c7c)

The popup offers three main options:
- **📄 Archive current page** - Archives the active tab using the configured archive service
- **🕐 Show archived versions** - Opens Wayback Machine to view page history  
- **⚙️ Settings** - Links to the extension options page

### ✅ Context Menu Integration
- **Archive links** - Submit URLs to your configured archive service (archive.is, archive.ph, archive.today)
- **Archive and copy** - Archive links and automatically copy the archive URL to clipboard  
- **Show archived versions** - View archived versions using Wayback Machine
- **Extract real URLs** - Extract original URLs from archive.is/archive.ph links
- **Archive selected text** - Archive text selections containing URLs
- **Archive current page** - Archive the currently active page
- **Auto-archiving** - Automatically archive pages containing specified text indicators
- **Pattern-based scanning** - Configure URL patterns for targeted page scanning

### ✅ Configuration & Options
The extension provides a comprehensive options page for configuring archive services and viewing available features:

![Options Interface](https://github.com/user-attachments/assets/29351d8f-073c-4526-bdf0-310324cffd45)

- **Configurable archive service** - Choose between archive.ph, archive.is, archive.today
- **Auto-archiving settings** - Configure text indicators and page patterns for automatic archiving
- **Global scanning toggle** - Option to scan all websites for indicators, not just specific patterns
- **Clean options UI** - Intuitive settings interface 
- **Persistent settings** - Your preferences are saved and synchronized

### ✅ Technical Implementation
- **Manifest v3** - Modern Chrome extension with proper permissions
- **Service worker** - Efficient background processing
- **Internationalization** - Multi-language support framework
- **Custom icon** - Distinctive "is!" icon for easy identification
- **Error handling** - Comprehensive notifications and error management
- **Comprehensive tests** - Isolated unit tests for core functionality
- **Code quality** - HTML/CSS validation integrated into CI pipeline

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your Chrome toolbar

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

## Usage

### Popup Interface
1. **Click the extension icon** in the browser toolbar to open the popup menu
2. **Archive current page** - Click to archive the active tab
3. **Show archived versions** - Click to view page history on Wayback Machine
4. **Settings** - Click to open the extension options page

### Context Menu
1. **Configure** - Right-click the extension icon → Options to choose your preferred archive service and set up auto-archiving
2. **Archive links** - Right-click any link and select archive options from context menu
3. **Archive pages** - Right-click anywhere on a page to archive the current page
4. **Archive selections** - Select text containing URLs and right-click to archive
5. **Auto-archiving** - Configure text indicators and URL patterns for automatic page archiving
6. **Global scanning** - Enable scanning all websites for indicators, or use specific URL patterns
7. **View archives** - Use "Show archived versions" to see historical snapshots

## File Structure

```
├── manifest.json              # Extension manifest with permissions
├── background.js              # Service worker for context menus & API calls
├── content.js                 # Content script for page scanning & auto-archiving
├── popup/
│   ├── popup.html              # Popup interface UI
│   ├── popup.css               # Popup styling
│   └── popup.js                # Popup functionality
├── options/
│   ├── options.html          # Options page UI
│   ├── options.css           # Styling
│   └── options.js            # Options functionality
├── _locales/en_US/
│   └── messages.json         # Internationalization strings
├── img/
│   └── icon.png             # Extension icon with "is!" text
├── tests/                    # Test suite for core functionality
│   ├── test.html            # Browser-based test runner
│   ├── test-runner.js       # Test execution framework
│   ├── test-runner-headless.js  # Headless test runner for CI
│   └── test-functions.js    # Unit tests for core functions
├── .github/workflows/
│   └── ci.yml               # CI pipeline with tests and validation
├── package.json             # Node.js dependencies for validation tools
├── .htmlvalidate.json       # HTML validation configuration
├── .stylelintrc.json        # CSS validation configuration
└── INSTALL.md               # Installation instructions
```

## Archive Service Integration

The extension submits URLs to archive services using their form submission endpoints:

```javascript
const archiveSubmitUrl = `${archiveServiceUrl}?url=${encodeURIComponent(cleanedUrl)}`;
```

This mimics the archive service form submission process while providing seamless integration through the browser context menu.

## Auto-Archiving Features

The extension includes automatic page archiving capabilities:

- **Text Indicators**: Configure patterns to search for in page content (supports regex)
- **URL Patterns**: Define which pages to scan based on URL patterns
- **Global Scanning**: Option to scan all visited websites regardless of URL patterns
- **Smart Matching**: Supports both simple text matching and regex patterns

When enabled, the content script scans pages for configured indicators and automatically archives matching pages.

## Related Projects

This extension is similar to [rahiel/archiveror](https://github.com/rahiel/archiveror), which provides broader archiving functionality including multiple services (archive.is, archive.org, perma.cc, webcitation.org) and bookmark automation. Archiveror offers more comprehensive features like local MHTML saving and automatic bookmark archiving, while agentic-archive.is-ifier focuses specifically on archive.is-style services with a streamlined context menu experience.

## Development

### Testing
Run the test suite and validation by:

**JavaScript Tests:**
```bash
npm test
# or directly: node tests/test-runner-headless.js
```

**HTML/CSS Validation:**
```bash
npm run validate
# or separately:
npm run validate:html  # HTML syntax and semantics
npm run validate:css   # CSS syntax and style consistency
```

**Complete CI Check:**
```bash
npm run ci  # Runs both tests and validation
```

**Browser-based Testing:**
Open `tests/test.html` in your browser for interactive testing.

Tests cover:
- URL cleaning and validation
- Archive URL detection and extraction  
- Context menu functionality
- Complete archiving workflows
- Auto-archiving and content scanning functionality
- **HTML validation** - Syntax, semantics, accessibility
- **CSS validation** - Syntax, modern standards, consistency

**Future Enhancement**: Consider integrating Playwright into the CI pipeline to enable automated browser testing of the popup interface and ensure UI functionality doesn't break with future changes. This would provide visual regression testing and automated screenshot capture for documentation updates.

### Contributing
When contributing:
1. Update the README with new features
2. Write tests for new functionality  
3. **Run validation** - Ensure `npm run ci` passes before submitting
4. Check for external code changes before submitting
5. Document the LLM and tools used in development
6. **Update screenshots** - When UI changes are made, update screenshots in the README using browser testing tools like Playwright to ensure documentation stays current

## AI Generation Notice

This entire codebase was generated using AI tools (specifically GitHub Copilot and Claude) with no human coding intervention. The extension was created through iterative AI-assisted development, including:
- Initial code generation
- Bug fixes and refinements  
- Test suite creation
- Documentation

## Development Metadata

**Last updated:** 2024
**AI Tools Used:** GitHub Copilot, Claude (Anthropic)
**Development Method:** Fully AI-generated with iterative refinement
**Test Coverage:** Core functionality, URL processing, archive detection, HTML/CSS validation

---

*For future development: Always update README, write comprehensive tests, verify no external code conflicts, and document AI/LLM tools used in the development process., bump version in manifest with each commit that does not touch markdown files*

