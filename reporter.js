/**
 * Reports the results of the scan.
 * @param {Array} matches - List of matches from the scan.
 * @param {Object} config - Configuration object.
 */
function reportResults(matches) {
    if (matches.length === 0) {
        console.info("[INFO] No sensitive data found!");
        return;
    }

    console.info(`[INFO] Found ${matches.length} potential issues:\n`);
    matches.forEach((match, index) => {
        console.info(`[INFO] ${index + 1}. File: ${match.file}`);
        console.info(`[INFO]    Match: ${match.match}`);
        console.info(`[INFO]    Line: ${match.line}\n`);
    });
}

module.exports = {reportResults};
