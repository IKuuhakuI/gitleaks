const fs = require("node:fs");
const path = require("node:path");
const {defaultPatterns} = require("./patterns");
const {validateField, isArray, isObject} = require("../utils/validator");

/**
 * Loads the configuration for gitleaks with enhanced error handling and warnings for invalid keys.
 * @returns {Object} The validated configuration object.
 */
const loadConfig = () => {
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

    const validKeys = [
        "customPatterns",
        "ignoredPatterns",
        "ignorePaths",
        "ignoreExtensions",
        "maxFileSizeKb",
        "includePatterns",
    ];

    if (!fs.existsSync(configPath)) {
        return {...config, defaultPatterns};
    }

    try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        validateField(userConfig, "userConfig", isObject);

        const unknownKeys = Object.keys(userConfig).filter(
            (key) => !validKeys.includes(key),
        );

        if (unknownKeys.length > 0) {
            console.warn(
                `[WARN] Unknown keys in configuration: ${unknownKeys.join(", ")}. These keys will be ignored.`,
            );
        }

        if (userConfig.customPatterns) {
            validateField(userConfig.customPatterns, "customPatterns", isArray);
        }

        if (userConfig.ignoredPatterns) {
            validateField(
                userConfig.ignoredPatterns,
                "ignoredPatterns",
                isArray,
            );
        }

        if (userConfig.ignorePaths) {
            validateField(userConfig.ignorePaths, "ignorePaths", isArray);
        }

        if (userConfig.ignoreExtensions) {
            validateField(
                userConfig.ignoreExtensions,
                "ignoreExtensions",
                isArray,
            );
        }

        if (
            userConfig.maxFileSizeKb !== undefined &&
            typeof userConfig.maxFileSizeKb !== "number"
        ) {
            throw new Error("'maxFileSizeKb' must be a number.");
        }

        if (userConfig.includePatterns) {
            validateField(
                userConfig.includePatterns,
                "includePatterns",
                isArray,
            );
        }

        config = {...config, ...userConfig};

        const invalidIgnoredPatterns = config.ignoredPatterns.filter(
            (key) => !Object.keys(defaultPatterns).includes(key),
        );

        if (invalidIgnoredPatterns.length > 0) {
            console.warn(
                `[WARN] Invalid keys in 'ignoredPatterns': ${invalidIgnoredPatterns.join(
                    ", ",
                )}. These keys will be ignored.`,
            );
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
        throw new Error(`Failed to load configuration: ${error.message}`);
    }
};

module.exports = {loadConfig};
