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
