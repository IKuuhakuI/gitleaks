const fs = require("node:fs");
const git = require("simple-git");
const {loadConfig} = require("./config");
const {scanRepository} = require("./scanner");
const {reportResults} = require("../reporter");

const runScan = async (argv) => {
    const config = loadConfig();
    const repoPath = process.cwd();
    let files = [];

    const ignorePaths = [...(config.ignorePaths || []), ...(argv.ignore || [])];

    const customPatterns = [
        ...(config.customPatterns || []),
        ...(argv.patterns || []),
    ];

    const filteredPatterns = Object.entries(config.defaultPatterns).reduce(
        (acc, [key, value]) => {
            if (!(argv.exclude || []).includes(key)) {
                acc[key] = value;
            }
            return acc;
        },
        {},
    );

    const isStaged = argv.staged;
    const isAll = argv.all || !argv.staged;

    if (isStaged) {
        if (!argv.quiet) console.info("[INFO] Scanning staged files...");

        const gitRepo = git(repoPath);
        const status = await gitRepo.status();

        files = status.staged.map((file) => `${repoPath}/${file}`);
    }

    if (isAll) {
        if (!argv.quiet)
            console.info("[INFO] Scanning all files in the repository...");

        const {getAllFiles} = require("../utils/fileUtils");
        files = await getAllFiles(repoPath, ignorePaths);
    }

    if (files.length === 0) {
        if (!argv.quiet) console.info("[INFO] No files to scan.");

        process.exit(0);
    }

    if (argv.dryRun) {
        if (!argv.quiet)
            console.info("[INFO] Dry run mode enabled. No scan performed.");

        process.exit(0);
    }

    const results = await scanRepository(
        repoPath,
        {...config, customPatterns, defaultPatterns: filteredPatterns},
        files,
    );

    if (results.length === 0) {
        if (!argv.quiet) console.info("[INFO] No sensitive data found.");
        process.exit(0);
    }

    if (argv.output) {
        fs.writeFileSync(argv.output, JSON.stringify(results, null, 2));
        if (!argv.quiet) console.info(`[INFO] Results saved to ${argv.output}`);
    }

    reportResults(results, config);
    console.error("[ERROR] Sensitive data detected!");

    process.exit(1);
};

module.exports = {runScan};
