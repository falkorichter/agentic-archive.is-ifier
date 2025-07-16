// Global setup for Playwright tests
async function globalSetup() {
  // This function runs once before all tests
  console.log('Setting up Playwright tests for Chrome extension...');
  
  // Any global setup logic can go here
  // For now, just log that setup is complete
  console.log('Global setup complete');
}

export default globalSetup;