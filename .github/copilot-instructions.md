Always update and validate the README

write comprehensive tests

verify no external code conflicts

document AI/LLM tools used in the development process

bump version in manifest with each commit that does not touch markdown files

try to separate tests in separate files so multiple pull requests don't conflict

Update the Development Metadata in README with every PR

Please update the README or main contribution guide to reflect this new instruction so that all documentation stays in sync.

Use Semantic Versioning https://semver.org/ 
Given a version number MAJOR.MINOR.PATCH, increment the:
- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backward compatible manner
- **PATCH** version when you make backward compatible bug fixes

When adding new localization keys to the extension, ensure they are translated to all supported languages (de, es, fr, ja, pt, zh_CN) not just en_US. All locale files must contain proper translations for new keys to maintain internationalization support.
