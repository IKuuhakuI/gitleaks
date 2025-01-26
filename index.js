#!/usr/bin/env node

const {loadConfig} = require("./core/config");
const {reportResults} = require("./reporter");
const {scanRepository} = require("./core/scanner");

(async () => {
    try {
        const config = loadConfig();

        const results = await scanRepository(process.cwd(), config);

        reportResults(results, config);
    } catch (error) {
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
    }
})();
