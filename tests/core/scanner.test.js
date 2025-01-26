const path = require("node:path");
const {expect} = require("chai");
const {scanRepository} = require("../../core/scanner");

const MOCK_DIR = path.join(__dirname, "../utils/mockRepo");

describe("Scanner", () => {
    it("should detect sensitive data patterns in real files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: ["defaultPatterns"],
            customPatterns: ["test-pattern"],
        });

        expect(results).to.have.lengthOf(2);
        expect(results).to.deep.include.members([
            {
                line: 1,
                match: "test-pattern",
                file: path.join(MOCK_DIR, "file1.txt"),
            },
            {
                line: 1,
                match: "test-pattern",
                file: path.join(MOCK_DIR, "subdir/nested.txt"),
            },
        ]);
    });

    it("should ignore files in the specified ignorePaths", async () => {
        const results = await scanRepository(MOCK_DIR, {
            customPatterns: ["test-pattern"],
            ignorePaths: ["subdir", "defaultPatterns"],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0]).to.deep.equal({
            line: 1,
            match: "test-pattern",
            file: path.join(MOCK_DIR, "file1.txt"),
        });
    });

    it("should return an empty array if no matches are found", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: ["defaultPatterns"],
            customPatterns: ["no-match-pattern"],
        });

        expect(results).to.be.an("array").that.is.empty;
    });

    it("should handle files with no content gracefully", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: ["defaultPatterns"],
            customPatterns: ["empty-file-pattern"],
        });

        expect(results).to.be.an("array").that.is.empty;
    });

    it("should handle invalid patterns gracefully", async () => {
        await expect(
            scanRepository(MOCK_DIR, {
                ignorePaths: [],
                customPatterns: ["[invalid-regex"],
            }),
        ).to.be.rejectedWith(SyntaxError);
    });

    it("should detect an AWS access key in files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "AKIAIOSFODNN7EXAMPLE",
            file: path.resolve(MOCK_DIR, "defaultPatterns/aws-key.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });

    it("should detect a GitHub token in files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "ghp_1234567890abcdef1234567890abcdef1234",
            file: path.resolve(MOCK_DIR, "defaultPatterns/github-token.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });

    it("should detect a Google API key in files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "AIzaSyA1234567890ABCDEF1234567890abcdef",
            file: path.resolve(MOCK_DIR, "defaultPatterns/google-key.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });

    it("should detect an OpenAI key in files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "sk-1234567890abcdef1234567890abcdef12345678abcdefgh",
            file: path.resolve(MOCK_DIR, "defaultPatterns/openai-key.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });

    it("should detect a Gemini custom key in files", async () => {
        const results = await scanRepository(MOCK_DIR, {
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "AIzaSyEwcsswgzbu7NY221_KiERu0aRhI_lqIgd",
            file: path.resolve(MOCK_DIR, "defaultPatterns/gemini-key.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });
});
