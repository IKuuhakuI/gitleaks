#!/usr/bin/env node

const yargs = require("yargs");
const git = require("simple-git");
const {hideBin} = require("yargs/helpers");
const {loadConfig} = require("./core/config");
const {reportResults} = require("./reporter");
const {scanRepository} = require("./core/scanner");

const argv = yargs(hideBin(process.argv))
    .option("staged", {
        alias: "s",
        type: "boolean",
        description: "Scan only files in the staging area",
    })
    .option("all", {
        alias: "a",
        type: "boolean",
        description: "Scan all files in the repository",
    })
    .conflicts("staged", "all")
    .help().argv;

(async () => {
    try {
        const config = loadConfig();
        const repoPath = process.cwd();
        let files = [];

        if (!(argv.staged || argv.all)) {
            console.error("[ERROR] Please specify either --staged or --all.");
            process.exit(1);
        }

        if (argv.staged) {
            console.info("[INFO] Scanning staged files...");
            const gitRepo = git(repoPath);
            const status = await gitRepo.status();
            files = status.staged.map((file) => `${repoPath}/${file}`);
        }

        if (argv.all) {
            console.info("[INFO] Scanning all files in the repository...");
            const {getAllFiles} = require("./utils/fileUtils");
            files = await getAllFiles(repoPath, config.ignorePaths || []);
        }

        if (files.length === 0) {
            console.info("[INFO] No files to scan.");
            process.exit(0);
        }

        const results = await scanRepository(repoPath, config, files);

        if (results.length === 0) {
            console.info("[INFO] No sensitive data found.");
            process.exit(0);
        }

        reportResults(results, config);
        console.error("[ERROR] Sensitive data detected!");
        process.exit(1);
    } catch (error) {
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
    }
})();
