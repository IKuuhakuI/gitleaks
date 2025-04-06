const fs = require("node:fs");
const path = require("node:path");
const {minimatch} = require("minimatch");
const {getAllFiles} = require("../utils/fileUtils");

/**
 * Scans the repository for sensitive data.
 * @param {string} repoPath - Path to the repository.
 * @param {object} config - Configuration object.
 * @param {string[]} files - List of files to scan.
 * @returns {Promise<Array>} List of matches.
 */
const scanRepository = async (repoPath, config, files = null) => {
    const allFiles =
        files || (await getAllFiles(repoPath, config.ignorePaths || []));

    const targetFiles = allFiles.filter((file) => {
        const relativePath = path.relative(repoPath, file);

        if (
            config.ignorePaths?.some((ignorePath) =>
                relativePath.startsWith(ignorePath),
            )
        )
            return false;

        if (
            config.ignoreExtensions?.some((ext) =>
                file.toLowerCase().endsWith(ext.toLowerCase()),
            )
        )
            return false;

        if (
            config.includePatterns?.length &&
            !config.includePatterns.some((pattern) =>
                minimatch(relativePath, pattern),
            )
        )
            return false;

        if (config.maxFileSizeKb) {
            const stats = fs.statSync(file);
            const sizeKb = stats.size / 1024;

            if (sizeKb > config.maxFileSizeKb) return false;
        }

        return true;
    });

    const patterns = Object.values(config.defaultPatterns).concat(
        config.customPatterns || [],
    );

    const combinedRegex = createCombinedRegex(patterns);

    const matches = [];

    for (const file of targetFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes("@gitleaks ignore")) continue;

            combinedRegex.lastIndex = 0;
            let match = combinedRegex.exec(line);

            while (match !== null) {
                matches.push({
                    file,
                    match: match[0],
                    line: i + 1,
                });

                match = combinedRegex.exec(line);
            }
        }
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

module.exports = {scanRepository};
