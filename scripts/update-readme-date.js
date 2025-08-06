#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates the "Last updated" date in README.md to the current date
 * in ISO format (YYYY-MM-DD) to prevent manual update errors
 */
function updateReadmeDate() {
    const readmePath = path.join(__dirname, '..', 'README.md');
    
    // Get current date in ISO format
    const currentDate = new Date().toISOString().split('T')[0];
    
    try {
        // Read README content
        let readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Update the "Last updated" line
        const updatedContent = readmeContent.replace(
            /^\*\*Last updated:\*\* \d{4}(-\d{2}-\d{2})?$/m,
            `**Last updated:** ${currentDate}`
        );
        
        // Check if any changes were made
        if (readmeContent === updatedContent) {
            console.log('ℹ️ README date is already current or pattern not found');
            return;
        }
        
        // Write updated content back
        fs.writeFileSync(readmePath, updatedContent, 'utf8');
        console.log(`✅ Updated README "Last updated" date to ${currentDate}`);
        
    } catch (error) {
        console.error('❌ Failed to update README date:', error.message);
        process.exit(1);
    }
}

// Run the function if called directly
if (require.main === module) {
    updateReadmeDate();
}

module.exports = { updateReadmeDate };