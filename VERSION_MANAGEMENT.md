# Version Management

This project uses automated patch version bumping to follow semantic versioning practices.

## How it works

Every commit to the main branch must include a version bump. The CI system enforces this requirement.

## Commands

### Bump patch version
```bash
npm run version:bump
```
This increments the patch version in both `package.json` and `manifest.json`.

### Check version bump
```bash
npm run version:check
```
This validates that the version was properly bumped compared to the previous commit.

## Semantic Versioning

Following [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backward compatible manner  
- **PATCH** version when you make backward compatible bug fixes

## Automated Process

1. Before committing changes, run `npm run version:bump`
2. Commit your changes including the version bump
3. CI will automatically validate the version was bumped

## Manual Version Changes

For MAJOR or MINOR version changes, manually edit both `package.json` and `manifest.json` to ensure they have the same version number.

## Files Updated

The version bump script updates:
- `package.json` - Node.js package version
- `manifest.json` - Browser extension version

Both files must always have the same version number.# Demo change
