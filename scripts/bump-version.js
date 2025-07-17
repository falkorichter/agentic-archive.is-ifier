#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Bumps the patch version in both package.json and manifest.json
 * following semantic versioning (MAJOR.MINOR.PATCH)
 */
function bumpPatchVersion() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const manifestJsonPath = path.join(__dirname, '..', 'manifest.json');
    
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Parse version components
    const versionParts = currentVersion.split('.');
    if (versionParts.length !== 3) {
        console.error(`Invalid version format: ${currentVersion}. Expected MAJOR.MINOR.PATCH`);
        process.exit(1);
    }
    
    // Increment patch version
    const major = parseInt(versionParts[0]);
    const minor = parseInt(versionParts[1]);
    const patch = parseInt(versionParts[2]) + 1;
    
    const newVersion = `${major}.${minor}.${patch}`;
    
    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    // Update manifest.json
    const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
    manifestJson.version = newVersion;
    fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 4) + '\n');
    
    console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
    return newVersion;
}

if (require.main === module) {
    bumpPatchVersion();
}

module.exports = { bumpPatchVersion };