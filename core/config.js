const fs = require("node:fs");
const path = require("node:path");
const {defaultPatterns} = require("./patterns");

/**
 * Loads the configuration for gitleaks.
 * @returns {Object} The configuration object.
 */
function loadConfig() {
    const configPath = path.join(process.cwd(), ".gitleaksrc.json");

    let config = {
        customPatterns: [],
        ignoredPatterns: [],
        ignorePaths: ["node_modules", ".git"],
    };

    if (fs.existsSync(configPath)) {
        const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        config = {...config, ...userConfig};
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
}

module.exports = {loadConfig};
