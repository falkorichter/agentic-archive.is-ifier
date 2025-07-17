#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Checks if the version was bumped compared to the previous commit
 * This is used in CI to enforce version bumping with every commit
 */
function checkVersionBump() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    
    try {
        // Get current version
        const currentPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = currentPackageJson.version;
        
        // Get previous version from git
        let previousVersion;
        try {
            const previousPackageJson = execSync('git show HEAD~1:package.json', { encoding: 'utf8' });
            previousVersion = JSON.parse(previousPackageJson).version;
        } catch (error) {
            // If this is the first commit or there's no previous version, allow it
            console.log('No previous version found (first commit or no package.json history). Allowing commit.');
            return true;
        }
        
        if (currentVersion === previousVersion) {
            console.error(`❌ Version not bumped! Current version (${currentVersion}) is the same as previous version (${previousVersion})`);
            console.error('Please bump the patch version using: npm run version:bump');
            process.exit(1);
        }
        
        // Validate version format and ensure it's a proper bump
        const currentParts = currentVersion.split('.').map(Number);
        const previousParts = previousVersion.split('.').map(Number);
        
        if (currentParts.length !== 3 || previousParts.length !== 3) {
            console.error(`❌ Invalid version format. Expected MAJOR.MINOR.PATCH format.`);
            process.exit(1);
        }
        
        const [currentMajor, currentMinor, currentPatch] = currentParts;
        const [prevMajor, prevMinor, prevPatch] = previousParts;
        
        // Check if it's a valid semantic version bump
        const validBump = 
            (currentMajor > prevMajor) || // Major version bump
            (currentMajor === prevMajor && currentMinor > prevMinor) || // Minor version bump
            (currentMajor === prevMajor && currentMinor === prevMinor && currentPatch > prevPatch); // Patch version bump
        
        if (!validBump) {
            console.error(`❌ Invalid version bump! Current version (${currentVersion}) is not greater than previous version (${previousVersion})`);
            console.error('Version must follow semantic versioning and be incremented.');
            process.exit(1);
        }
        
        // Check if manifest.json version matches package.json
        const manifestJsonPath = path.join(__dirname, '..', 'manifest.json');
        const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
        
        if (manifestJson.version !== currentVersion) {
            console.error(`❌ Version mismatch! package.json version (${currentVersion}) doesn't match manifest.json version (${manifestJson.version})`);
            console.error('Both files must have the same version. Use: npm run version:bump');
            process.exit(1);
        }
        
        console.log(`✅ Version properly bumped from ${previousVersion} to ${currentVersion}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error checking version bump: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    checkVersionBump();
}

module.exports = { checkVersionBump };