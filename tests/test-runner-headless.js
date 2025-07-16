#!/usr/bin/env node

/**
 * Headless test runner for Archive.is-ifier extension tests
 * Runs the tests directly in Node.js environment
 */

const path = require('path');
const fs = require('fs');

// Mock URL constructor for Node.js environment
global.URL = global.URL || require('url').URL;

function runTests() {
  console.log('Starting headless test runner...');
  
  let exitCode = 0;
  
  try {
    // Load test functions
    const testFunctionsPath = path.resolve(__dirname, 'test-functions.js');
    const testFunctionsCode = fs.readFileSync(testFunctionsPath, 'utf8');
    
    // Load test runner to get test cases
    const testRunnerPath = path.resolve(__dirname, 'test-runner.js');
    const testRunnerCode = fs.readFileSync(testRunnerPath, 'utf8');
    
    // Create a clean execution context
    const context = {
      URL: global.URL,
      console: console,
      Date: Date,
      Math: Math,
      JSON: JSON,
      encodeURIComponent: encodeURIComponent
    };
    
    // Execute test functions in context
    const testFunctionScript = new Function('context', `
      with (context) {
        ${testFunctionsCode}
        return {
          cleanUrl: cleanUrl,
          isValidUrl: isValidUrl,
          isArchiveUrl: isArchiveUrl,
          extractRealUrlFromArchive: extractRealUrlFromArchive,
          generateArchiveId: generateArchiveId,
          testArchiveUrlWorkflow: testArchiveUrlWorkflow,
          testShowArchivedVersionsWorkflow: testShowArchivedVersionsWorkflow,
          testShowRealUrlWorkflow: testShowRealUrlWorkflow,
          scanPageForIndicators: scanPageForIndicators,
          shouldScanUrlWithPatterns: shouldScanUrlWithPatterns,
          shouldScanPage: shouldScanPage,
          testTabIndexBehavior: testTabIndexBehavior
        };
      }
    `);
    
    const testFunctions = testFunctionScript(context);
    
    // Extract test cases from test runner
    const testCasesMatch = testRunnerCode.match(/const testCases = \[([\s\S]*?)\];/);
    if (!testCasesMatch) {
      throw new Error('Could not find testCases array in test-runner.js');
    }
    
    // Create test cases with proper function references
    const testCasesScript = new Function('testFunctions', `
      const { cleanUrl, isValidUrl, isArchiveUrl, extractRealUrlFromArchive, 
              generateArchiveId, testArchiveUrlWorkflow, testShowArchivedVersionsWorkflow, 
              testShowRealUrlWorkflow, scanPageForIndicators, shouldScanUrlWithPatterns,
              shouldScanPage, testTabIndexBehavior } = testFunctions;
      
      const testCases = [${testCasesMatch[1]}];
      return testCases;
    `);
    
    const testCases = testCasesScript(testFunctions);
    
    console.log(`Running ${testCases.length} tests...\n`);
    
    let passCount = 0;
    let totalCount = testCases.length;
    const results = [];
    
    testCases.forEach((testCase, index) => {
      try {
        const testResult = testCase.test();
        const passed = testResult.pass;
        
        results.push({
          name: testCase.name,
          passed: passed,
          result: testResult.result,
          error: null
        });
        
        if (passed) {
          passCount++;
          console.log(`✅ ${testCase.name}`);
        } else {
          console.log(`❌ ${testCase.name}`);
          console.log(`   Expected: pass, Got: ${JSON.stringify(testResult.result)}`);
        }
        
      } catch (error) {
        results.push({
          name: testCase.name,
          passed: false,
          result: null,
          error: error.message
        });
        
        console.log(`❌ ${testCase.name} (ERROR)`);
        console.log(`   Error: ${error.message}`);
      }
    });
    
    // Display summary
    console.log('\n=== Test Results ===');
    console.log(`Total tests: ${totalCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${totalCount - passCount}`);
    console.log(`Success rate: ${Math.round(passCount / totalCount * 100)}%`);
    
    if (passCount < totalCount) {
      console.log('\nFailed tests:');
      results
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}`);
          if (test.error) {
            console.log(`    Error: ${test.error}`);
          } else {
            console.log(`    Result: ${JSON.stringify(test.result)}`);
          }
        });
      exitCode = 1;
    } else {
      console.log('\n✅ All tests passed!');
    }
    
  } catch (error) {
    console.error('Test runner error:', error);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Check if required files exist
const testFunctionsPath = path.resolve(__dirname, 'test-functions.js');
const testRunnerPath = path.resolve(__dirname, 'test-runner.js');

if (!fs.existsSync(testFunctionsPath)) {
  console.error('Error: test-functions.js not found at', testFunctionsPath);
  process.exit(1);
}

if (!fs.existsSync(testRunnerPath)) {
  console.error('Error: test-runner.js not found at', testRunnerPath);
  process.exit(1);
}

runTests();