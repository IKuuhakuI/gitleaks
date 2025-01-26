const fs = require("node:fs");
const path = require("node:path");
const {getAllFiles} = require("../utils/fileUtils");

/**
 * Scans the repository for sensitive data.
 * @param {string} repoPath - Path to the repository.
 * @param {object} config - Configuration object.
 * @param {string[]} files - List of files to scan.
 * @returns {Promise<Array>} List of matches.
 */
const scanRepository = async (repoPath, config, files = null) => {
    const targetFiles = (
        files || (await getAllFiles(repoPath, config.ignorePaths || []))
    ).filter(
        (file) =>
            !config.ignorePaths.some((ignorePath) =>
                file.startsWith(path.join(repoPath, ignorePath)),
            ),
    );

    const patterns = Object.values(config.defaultPatterns).concat(
        config.customPatterns || [],
    );

    const combinedRegex = createCombinedRegex(patterns);

    const matches = [];

    for (const file of targetFiles) {
        const content = fs.readFileSync(file, "utf-8");
        combinedRegex.lastIndex = 0;

        let match;

        do {
            match = combinedRegex.exec(content);

            if (!match) continue;

            matches.push({
                file,
                match: match[0],
                line: getLine(content, match.index),
            });
        } while (match);
    }

    return matches;
};

/**
 * Creates a single combined regular expression from multiple patterns.
 * @param {string[]} patterns - Array of regex patterns.
 * @returns {RegExp} A combined RegExp with global matching.
 */
const createCombinedRegex = (patterns) => {
    const combined = patterns.map((pattern) => `(${pattern})`).join("|");
    return new RegExp(combined, "g");
};

/**
 * Calculates the line number of a match in a file's content.
 * @param {string} content - The file content as a string.
 * @param {number} index - The character index of the match.
 * @returns {number} The line number (1-based).
 */
const getLine = (content, index) => {
    return content.slice(0, index).split("\n").length;
};

module.exports = {scanRepository};
