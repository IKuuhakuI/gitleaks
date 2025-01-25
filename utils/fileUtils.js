const fs = require("node:fs");
const path = require("node:path");

/**
 * Recursively retrieves all files from a directory, ignoring specified paths.
 * @param {string} dir - Directory to scan.
 * @param {Array<string>} ignorePaths - Paths to ignore.
 * @returns {Promise<string[]>} List of file paths.
 */
const getAllFiles = async (dir, ignorePaths) => {
    let files = [];
    const items = fs.readdirSync(dir, {withFileTypes: true});

    for (const item of items) {
        if (ignorePaths.includes(item.name)) continue;

        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            const nestedFiles = await getAllFiles(fullPath, ignorePaths);
            files = files.concat(nestedFiles);
            continue;
        }

        files.push(fullPath);
    }

    return files;
};

module.exports = {getAllFiles};
