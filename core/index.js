const git = require("simple-git");
const {loadConfig} = require("./config");
const {reportResults} = require("../reporter");
const {scanRepository} = require("./scanner");

const runScan = async (argv) => {
    const config = loadConfig();
    const repoPath = process.cwd();
    let files = [];

    const isStaged = argv.staged;
    const isAll = argv.all || !argv.staged;

    if (isStaged) {
        console.info("[INFO] Scanning staged files...");
        const gitRepo = git(repoPath);
        const status = await gitRepo.status();
        files = status.staged.map((file) => `${repoPath}/${file}`);
    }

    if (isAll) {
        console.info("[INFO] Scanning all files in the repository...");
        const {getAllFiles} = require("../utils/fileUtils");
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
};

module.exports = {runScan};
