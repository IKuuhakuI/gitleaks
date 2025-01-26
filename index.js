#!/usr/bin/env node

const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");
const {version} = require("./package.json");
const {runScan} = require("./core/index.js");

const argv = yargs(hideBin(process.argv))
    .usage("Usage: gitleaks [options]")
    .option("staged", {
        alias: "s",
        type: "boolean",
        description: "Scan only files in the staging area",
    })
    .option("all", {
        alias: "a",
        type: "boolean",
        description: "Scan all files in the repository (default behavior)",
    })
    .option("quiet", {
        alias: "q",
        type: "boolean",
        description: "Suppress all output except errors",
    })
    .option("ignore", {
        type: "array",
        description: "Additional paths to ignore during the scan",
    })
    .option("patterns", {
        alias: "p",
        type: "array",
        description: "Specify additional patterns to scan for",
    })
    .option("exclude", {
        alias: "e",
        type: "array",
        description: "Exclude specific patterns from the scan",
    })
    .version(version)
    .alias("version", "v")
    .help("help")
    .alias("help", "h")
    .epilog("For more information, read the README.md").argv;

(async () => {
    try {
        await runScan(argv);
    } catch (error) {
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
    }
})();
