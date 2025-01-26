const fs = require("node:fs");
const path = require("node:path");
const {defaultPatterns} = require("./patterns");

/**
 * Loads the configuration for gitleaks with enhanced error handling and warnings for invalid keys.
 * @returns {Object} The validated configuration object.
 */
function loadConfig() {
    const configPath = path.join(process.cwd(), ".gitleaksrc.json");

    let config = {
        customPatterns: [],
        ignoredPatterns: [],
        ignorePaths: [
            ".git",
            "node_modules",
            "package.json",
            "package-lock.json",
        ],
    };

    try {
        if (fs.existsSync(configPath)) {
            const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

            if (typeof userConfig !== "object" || userConfig === null) {
                throw new Error(
                    "Invalid .gitleaksrc.json: Must be a valid JSON object.",
                );
            }

            if (
                userConfig.customPatterns &&
                !Array.isArray(userConfig.customPatterns)
            ) {
                throw new Error(
                    "Invalid .gitleaksrc.json: 'customPatterns' must be an array.",
                );
            }
            if (
                userConfig.ignoredPatterns &&
                !Array.isArray(userConfig.ignoredPatterns)
            ) {
                throw new Error(
                    "Invalid .gitleaksrc.json: 'ignoredPatterns' must be an array.",
                );
            }
            if (
                userConfig.ignorePaths &&
                !Array.isArray(userConfig.ignorePaths)
            ) {
                throw new Error(
                    "Invalid .gitleaksrc.json: 'ignorePaths' must be an array.",
                );
            }

            config = {...config, ...userConfig};

            const invalidKeys = config.ignoredPatterns.filter(
                (key) => !Object.keys(defaultPatterns).includes(key),
            );

            if (invalidKeys.length > 0) {
                console.warn(
                    `[WARN] Invalid keys in 'ignoredPatterns': ${invalidKeys.join(
                        ", ",
                    )}. These keys will be ignored.`,
                );
            }
        }

        const filteredPatterns = Object.entries(defaultPatterns).reduce(
            (acc, [key, value]) => {
                if (!config.ignoredPatterns.includes(key)) {
                    acc[key] = value;
                }
                return acc;
            },
            {},
        );

        return {...config, defaultPatterns: filteredPatterns};
    } catch (error) {
        console.error(`[ERROR] Failed to load configuration: ${error.message}`);
        return {...config, defaultPatterns};
    }
}

module.exports = {loadConfig};
