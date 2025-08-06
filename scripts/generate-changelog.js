#!/usr/bin/env node

/**
 * Changelog Generator for agentic-archive.is-ifier
 * 
 * This script helps generate changelog entries from git history
 * following Keep a Changelog format.
 */

const { execSync } = require('child_process');
const fs = require('fs');

function getGitCommits(since = '1 week ago') {
    try {
        const command = `git log --since="${since}" --pretty=format:"%h|%ad|%s" --date=short`;
        const output = execSync(command, { encoding: 'utf8' });
        
        if (!output.trim()) {
            console.log('No commits found in the specified timeframe.');
            return [];
        }

        return output.trim().split('\n').map(line => {
            const [hash, date, message] = line.split('|');
            return { hash, date, message };
        });
    } catch (error) {
        console.error('Error getting git commits:', error.message);
        return [];
    }
}

function categorizeCommit(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('add') || msg.includes('implement') || msg.includes('create')) {
        return 'Added';
    }
    if (msg.includes('fix') || msg.includes('resolve') || msg.includes('bug')) {
        return 'Fixed';
    }
    if (msg.includes('update') || msg.includes('change') || msg.includes('improve') || msg.includes('enhance')) {
        return 'Changed';
    }
    if (msg.includes('remove') || msg.includes('delete')) {
        return 'Removed';
    }
    if (msg.includes('security')) {
        return 'Security';
    }
    if (msg.includes('deprecate')) {
        return 'Deprecated';
    }
    
    return 'Changed'; // Default category
}

function generateChangelogEntry(commits, version = 'Unreleased') {
    const categories = {
        'Added': [],
        'Changed': [],
        'Deprecated': [],
        'Removed': [],
        'Fixed': [],
        'Security': []
    };

    commits.forEach(commit => {
        // Skip merge commits and version bumps
        if (commit.message.includes('Merge') || 
            commit.message.includes('version bump') ||
            commit.message.includes('bump version')) {
            return;
        }

        const category = categorizeCommit(commit.message);
        categories[category].push(`- ${commit.message} (${commit.hash})`);
    });

    let entry = `## [${version}]`;
    if (version !== 'Unreleased') {
        entry += ` - ${new Date().toISOString().split('T')[0]}`;
    }
    entry += '\n\n';

    // Only add categories that have entries
    Object.entries(categories).forEach(([category, items]) => {
        if (items.length > 0) {
            entry += `### ${category}\n`;
            items.forEach(item => {
                entry += `${item}\n`;
            });
            entry += '\n';
        }
    });

    return entry;
}

function main() {
    const args = process.argv.slice(2);
    const since = args[0] || '1 week ago';
    const version = args[1] || 'Unreleased';

    console.log(`Generating changelog entries for commits since: ${since}`);
    console.log(`Version: ${version}\n`);

    const commits = getGitCommits(since);
    
    if (commits.length === 0) {
        console.log('No commits to process.');
        return;
    }

    console.log(`Found ${commits.length} commits:\n`);
    
    const entry = generateChangelogEntry(commits, version);
    console.log('Generated changelog entry:');
    console.log('=' .repeat(50));
    console.log(entry);
    console.log('=' .repeat(50));
    console.log('\nNote: Please review and edit the generated entry before adding to CHANGELOG.md');
    console.log('Make sure to follow Keep a Changelog format and remove any irrelevant commits.');
}

if (require.main === module) {
    main();
}

module.exports = { getGitCommits, categorizeCommit, generateChangelogEntry };