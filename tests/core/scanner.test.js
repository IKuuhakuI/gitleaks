const path = require("node:path");
const fs = require("node:fs");
const {expect} = require("chai");
const {scanRepository} = require("../../core/scanner");
const {defaultPatterns} = require("../../core/patterns");

const MOCK_DIR = path.join(__dirname, "../utils/mockRepo");

describe("Scanner", () => {
    beforeEach(() => {
        if (!fs.existsSync(MOCK_DIR)) {
            fs.mkdirSync(MOCK_DIR, {recursive: true});
        }
    });

    afterEach(() => {
        fs.rmSync(MOCK_DIR, {recursive: true, force: true});
    });

    const createMockFile = (filePath, content) => {
        const fullPath = path.join(MOCK_DIR, filePath);
        const dirPath = path.dirname(fullPath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {recursive: true});
        }
        fs.writeFileSync(fullPath, content);
    };

    it("should detect sensitive data patterns in real files", async () => {
        createMockFile("file1.txt", "test-pattern");
        createMockFile("subdir/nested.txt", "test-pattern");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignoredPatterns: [],
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

    it("should detect 2 or more sensitive data patterns in same file", async () => {
        createMockFile("double-pattern.txt", "pattern-1 pattern-2");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignoredPatterns: [],
            ignorePaths: ["defaultPatterns"],
            customPatterns: ["pattern-1", "pattern-2"],
        });

        expect(results).to.have.lengthOf(2);
        expect(results).to.deep.include.members([
            {
                line: 1,
                match: "pattern-1",
                file: path.join(MOCK_DIR, "double-pattern.txt"),
            },
            {
                line: 1,
                match: "pattern-2",
                file: path.join(MOCK_DIR, "double-pattern.txt"),
            },
        ]);
    });

    it("should ignore files in the specified ignorePaths", async () => {
        createMockFile("file1.txt", "test-pattern");
        createMockFile("subdir/ignored.txt", "test-pattern");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            customPatterns: ["test-pattern"],
            ignorePaths: ["subdir"],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0]).to.deep.equal({
            line: 1,
            match: "test-pattern",
            file: path.join(MOCK_DIR, "file1.txt"),
        });
    });

    it("should return an empty array if no matches are found", async () => {
        createMockFile("no-match.txt", "no sensitive data here");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: ["no-match-pattern"],
        });

        expect(results).to.be.an("array").that.is.empty;
    });

    it("should handle files with no content gracefully", async () => {
        createMockFile("empty-file.txt", "");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: ["empty-file-pattern"],
        });

        expect(results).to.be.an("array").that.is.empty;
    });

    it("should handle invalid patterns gracefully", async () => {
        await expect(
            scanRepository(MOCK_DIR, {
                defaultPatterns,
                ignorePaths: [],
                customPatterns: ["[invalid-regex"],
            }),
        ).to.be.rejectedWith(SyntaxError);
    });

    it("should detect an AWS access key in files", async () => {
        createMockFile("aws-key.txt", "AKIAIOSFODNN7EXAMPLE");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "AKIAIOSFODNN7EXAMPLE",
            file: path.join(MOCK_DIR, "aws-key.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });

    it("should detect a GitHub token in files", async () => {
        createMockFile(
            "github-token.txt",
            "ghp_1234567890abcdef1234567890abcdef1234",
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
        });

        const expectedResult = {
            line: 1,
            match: "ghp_1234567890abcdef1234567890abcdef1234",
            file: path.join(MOCK_DIR, "github-token.txt"),
        };

        expect(results).to.deep.include(expectedResult);
    });

    it("should detect a Google API key in files", async () => {
        createMockFile(
            "defaultPatterns/google-key.txt",
            "AIzaSyA1234567890ABCDEF1234567890abcdef",
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
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
        createMockFile(
            "defaultPatterns/openai-key.txt",
            "sk-1234567890abcdef1234567890abcdef12345678abcdefgh",
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
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

    it("should detect multiple sensitive data patterns in the same file", async () => {
        createMockFile(
            "multi-patterns.txt",
            "AKIAIOSFODNN7EXAMPLE ghp_1234567890abcdef1234567890abcdef1234",
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
        });

        expect(results).to.have.lengthOf(2);
    });
});
