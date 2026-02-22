---
layout: post
title: "Internationalization Support: 7 Languages Now Available"
date: 2025-07-17 12:00:00 +0000
categories: feature
---

We are thrilled to announce that **agentic-archive.is-ifier** now supports **7 languages**, making the extension accessible to a global audience.

## Languages Supported

- 🇺🇸 **English** (en_US) – default language
- 🇪🇸 **Spanish** (es)
- 🇫🇷 **French** (fr)
- 🇩🇪 **German** (de)
- 🇵🇹 **Portuguese** (pt)
- 🇯🇵 **Japanese** (ja)
- 🇨🇳 **Chinese Simplified** (zh_CN)

## How It Works

The extension uses Chrome's built-in i18n API to automatically detect your browser's language and display the extension UI in the matching language. All user-facing strings – including context menu entries, popup labels, and options page text – are fully localized.

```javascript
// Strings are loaded dynamically based on browser locale
chrome.i18n.getMessage('archiveLink')
```

Translation strings are stored in `_locales/{locale}/messages.json` files. The extension falls back to English if a translation is missing for a particular string.

## Technical Details

- The manifest uses `__MSG_key__` syntax for extension metadata such as the name and description
- The options page uses `innerHTML` for strings that contain HTML markup (e.g., the "(Beta)" badge in Auto-Archiving Settings) to preserve formatting
- All translation keys are kept sorted alphabetically across all locale files and this is enforced by the CI pipeline

## What's Next

We plan to continue expanding language support and improving translations based on community feedback. If you would like to contribute a translation for your language, please open an issue or pull request on [GitHub](https://github.com/falkorichter/agentic-archive.is-ifier).
