// Test runner for translation key sorting functionality
// Loads test functions and runs translation-specific tests

// Sample translation data for testing
const sampleTranslationsUnsorted = {
    "zTestKey": { "message": "Z message" },
    "appName": { "message": "App Name" },
    "contextMenuArchive": { "message": "Archive" },
    "bSecondKey": { "message": "B message" }
};

const sampleTranslationsSorted = {
    "appName": { "message": "App Name" },
    "bSecondKey": { "message": "B message" },
    "contextMenuArchive": { "message": "Archive" },
    "zTestKey": { "message": "Z message" }
};

// Test cases for translation key functionality
const translationTests = [
    {
        name: "testTranslationKeysOrder - Unsorted keys",
        test: () => {
            const result = testTranslationKeysOrder(sampleTranslationsUnsorted);
            return result.isCorrectOrder === false &&
                   result.currentKeys.length === 4 &&
                   result.sortedKeys[0] === "appName" &&
                   result.sortedKeys[3] === "zTestKey";
        }
    },
    {
        name: "testTranslationKeysOrder - Already sorted keys",
        test: () => {
            const result = testTranslationKeysOrder(sampleTranslationsSorted);
            return result.isCorrectOrder === true &&
                   result.currentKeys.length === 4 &&
                   JSON.stringify(result.currentKeys) === JSON.stringify(result.sortedKeys);
        }
    },
    {
        name: "testSortTranslationKeys - Sort unsorted translations",
        test: () => {
            const result = testSortTranslationKeys(sampleTranslationsUnsorted);
            return result.wasAlreadySorted === false &&
                   result.sortedKeys[0] === "appName" &&
                   result.sortedKeys[3] === "zTestKey" &&
                   result.sorted.appName.message === "App Name" &&
                   result.sorted.zTestKey.message === "Z message";
        }
    },
    {
        name: "testSortTranslationKeys - Already sorted translations",
        test: () => {
            const result = testSortTranslationKeys(sampleTranslationsSorted);
            return result.wasAlreadySorted === true &&
                   JSON.stringify(result.originalKeys) === JSON.stringify(result.sortedKeys);
        }
    },
    {
        name: "testTranslationKeysOrder - Empty translations",
        test: () => {
            const result = testTranslationKeysOrder({});
            return result.isCorrectOrder === true &&
                   result.keyCount === 0 &&
                   result.currentKeys.length === 0;
        }
    },
    {
        name: "testSortTranslationKeys - Single key",
        test: () => {
            const singleKey = { "onlyKey": { "message": "Only message" } };
            const result = testSortTranslationKeys(singleKey);
            return result.wasAlreadySorted === true &&
                   result.sortedKeys.length === 1 &&
                   result.sortedKeys[0] === "onlyKey";
        }
    }
];

// Export for use in main test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translationTests };
}