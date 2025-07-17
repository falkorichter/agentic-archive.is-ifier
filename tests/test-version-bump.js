// Version bump functionality tests
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test utilities
function createTestFiles(packageVersion, manifestVersion) {
    const testDir = '/tmp/version-test';
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    
    const packageJson = {
        name: "test-package",
        version: packageVersion,
        description: "Test package"
    };
    
    const manifestJson = {
        manifest_version: 3,
        name: "Test Extension",
        version: manifestVersion
    };
    
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
    fs.writeFileSync(path.join(testDir, 'manifest.json'), JSON.stringify(manifestJson, null, 4) + '\n');
    
    return testDir;
}

function cleanupTestFiles(testDir) {
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
}

// Test version bump script
function testVersionBump() {
    const testDir = createTestFiles("1.0.0", "1.0.0");
    const originalCwd = process.cwd();
    
    try {
        process.chdir(testDir);
        
        // Copy the bump script to test directory
        const scriptPath = path.join(__dirname, '..', 'scripts', 'bump-version.js');
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        fs.writeFileSync('bump-version.js', scriptContent);
        
        // Run the bump script
        execSync('node bump-version.js', { stdio: 'pipe' });
        
        // Check if versions were bumped correctly
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const manifestJson = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        
        if (packageJson.version !== "1.0.1" || manifestJson.version !== "1.0.1") {
            throw new Error(`Version bump failed. Expected 1.0.1, got package: ${packageJson.version}, manifest: ${manifestJson.version}`);
        }
        
        return true;
    } finally {
        process.chdir(originalCwd);
        cleanupTestFiles(testDir);
    }
}

function testVersionBumpFromDifferentVersions() {
    const testCases = [
        { input: "2.1.5", expected: "2.1.6" },
        { input: "0.0.9", expected: "0.0.10" },
        { input: "10.20.99", expected: "10.20.100" }
    ];
    
    for (const testCase of testCases) {
        const testDir = createTestFiles(testCase.input, testCase.input);
        const originalCwd = process.cwd();
        
        try {
            process.chdir(testDir);
            
            // Copy the bump script to test directory
            const scriptPath = path.join(__dirname, '..', 'scripts', 'bump-version.js');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            fs.writeFileSync('bump-version.js', scriptContent);
            
            // Run the bump script
            execSync('node bump-version.js', { stdio: 'pipe' });
            
            // Check if versions were bumped correctly
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const manifestJson = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            
            if (packageJson.version !== testCase.expected || manifestJson.version !== testCase.expected) {
                throw new Error(`Version bump failed for ${testCase.input}. Expected ${testCase.expected}, got package: ${packageJson.version}, manifest: ${manifestJson.version}`);
            }
        } finally {
            process.chdir(originalCwd);
            cleanupTestFiles(testDir);
        }
    }
    
    return true;
}

function testVersionBumpInvalidFormat() {
    const testDir = createTestFiles("invalid-version", "invalid-version");
    const originalCwd = process.cwd();
    
    try {
        process.chdir(testDir);
        
        // Copy the bump script to test directory
        const scriptPath = path.join(__dirname, '..', 'scripts', 'bump-version.js');
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        fs.writeFileSync('bump-version.js', scriptContent);
        
        // Run the bump script - should fail
        try {
            execSync('node bump-version.js', { stdio: 'pipe' });
            throw new Error('Expected script to fail with invalid version format');
        } catch (error) {
            // Expected to fail
            return true;
        }
    } finally {
        process.chdir(originalCwd);
        cleanupTestFiles(testDir);
    }
}

// Export test functions
module.exports = {
    testVersionBump,
    testVersionBumpFromDifferentVersions,
    testVersionBumpInvalidFormat
};