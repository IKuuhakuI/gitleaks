const fs = require("node:fs");
const path = require("node:path");

function loadConfig() {
    const configPath = path.join(process.cwd(), ".gitleaksrc.json");

    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    return {
        customPatterns: [],
        ignorePaths: ["node_modules", ".git"],
    };
}

module.exports = {loadConfig};
