/**
 * Reports the results of the scan.
 * @param {Array} matches - List of matches from the scan.
 * @param {Object} config - Configuration object.
 */
const reportResults = (matches) => {
    if (matches.length === 0) {
        console.info("[INFO] No sensitive data found!");
        return;
    }

    console.warn(`[ERROR] Found ${matches.length} potential issues:\n`);
    matches.forEach((match, index) => {
        console.warn(`[ERROR] ${index + 1}. File: ${match.file}`);
        console.warn(`[ERROR]    Match: ${match.match}`);
        console.warn(`[ERROR]    Line: ${match.line}\n`);
    });
};

module.exports = {reportResults};
