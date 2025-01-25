const path = require("node:path");
const {expect} = require("chai");
const {scanRepository} = require("../../core/scanner");

const MOCK_DIR = path.join(__dirname, "../utils/mockRepo");

describe("Scanner", () => {
    it("should detect sensitive data patterns in real files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: [],
            customPatterns: ["test-pattern"],
        });

        expect(results).to.have.lengthOf(2);
        expect(results).to.deep.include.members([
            {
                file: path.join(MOCK_DIR, "file1.txt"),
                match: "test-pattern",
                line: 1,
            },
            {
                file: path.join(MOCK_DIR, "subdir/nested.txt"),
                match: "test-pattern",
                line: 1,
            },
        ]);
    });

    it("should ignore files in the specified ignorePaths", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: ["subdir"],
            customPatterns: ["test-pattern"],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0]).to.deep.equal({
            file: path.join(MOCK_DIR, "file1.txt"),
            match: "test-pattern",
            line: 1,
        });
    });
});
