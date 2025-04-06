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

    const createMockFileWithSize = (filePath, content, sizePaddingKb = 0) => {
        const fullPath = path.join(MOCK_DIR, filePath);
        const dirPath = path.dirname(fullPath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {recursive: true});
        }

        let contentToWrite = content;
        if (sizePaddingKb > 0) {
            const extra = "x".repeat(sizePaddingKb * 1024);
            contentToWrite += extra;
        }

        fs.writeFileSync(fullPath, contentToWrite);
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

    it("should scan a specific list of files and find sensitive data", async () => {
        createMockFile("file1.txt", "AKIAIOSFODNN7EXAMPLE");
        createMockFile("file2.txt", "ghp_1234567890abcdef1234567890abcdef1234");

        const filesToScan = [path.join(MOCK_DIR, "file1.txt")];
        const results = await scanRepository(
            MOCK_DIR,
            {
                defaultPatterns,
                ignorePaths: [],
                customPatterns: [],
            },
            filesToScan,
        );

        expect(results).to.have.lengthOf(1);
        expect(results[0]).to.deep.include({
            line: 1,
            match: "AKIAIOSFODNN7EXAMPLE",
            file: path.join(MOCK_DIR, "file1.txt"),
        });
    });

    it("should return an empty array if an empty files array is provided", async () => {
        createMockFile("file1.txt", "AKIAIOSFODNN7EXAMPLE");

        const results = await scanRepository(
            MOCK_DIR,
            {
                defaultPatterns,
                ignorePaths: [],
                customPatterns: [],
            },
            [],
        );

        expect(results).to.be.an("array").that.is.empty;
    });

    it("should handle non-existent files gracefully", async () => {
        createMockFile("file1.txt", "AKIAIOSFODNN7EXAMPLE");

        const filesToScan = [path.join(MOCK_DIR, "nonexistent-file.txt")];
        try {
            await scanRepository(
                MOCK_DIR,
                {
                    defaultPatterns,
                    ignorePaths: [],
                    customPatterns: [],
                },
                filesToScan,
            );
            throw new Error("Expected an error for non-existent file.");
        } catch (error) {
            expect(error.message).to.include("ENOENT");
        }
    });

    it("should respect ignorePaths even with specific files provided", async () => {
        createMockFile(
            "ignored-file.txt",
            "ghp_1234567890abcdef1234567890abcdef1234",
        );
        createMockFile("file1.txt", "AKIAIOSFODNN7EXAMPLE");

        const filesToScan = [
            path.join(MOCK_DIR, "file1.txt"),
            path.join(MOCK_DIR, "ignored-file.txt"),
        ];

        const results = await scanRepository(
            MOCK_DIR,
            {
                defaultPatterns,
                customPatterns: [],
                ignorePaths: ["ignored-file.txt"],
            },
            filesToScan,
        );

        expect(results).to.have.lengthOf(1);
        expect(results[0]).to.deep.include({
            line: 1,
            match: "AKIAIOSFODNN7EXAMPLE",
            file: path.join(MOCK_DIR, "file1.txt"),
        });
    });

    it("should detect sensitive data from multiple specific files", async () => {
        createMockFile("file1.txt", "AKIAIOSFODNN7EXAMPLE");
        createMockFile("file2.txt", "ghp_1234567890abcdef1234567890abcdef1234");

        const filesToScan = [
            path.join(MOCK_DIR, "file1.txt"),
            path.join(MOCK_DIR, "file2.txt"),
        ];

        const results = await scanRepository(
            MOCK_DIR,
            {
                defaultPatterns,
                ignorePaths: [],
                customPatterns: [],
            },
            filesToScan,
        );

        expect(results).to.have.lengthOf(2);
        expect(results).to.deep.include.members([
            {
                line: 1,
                match: "AKIAIOSFODNN7EXAMPLE",
                file: path.join(MOCK_DIR, "file1.txt"),
            },
            {
                line: 1,
                file: path.join(MOCK_DIR, "file2.txt"),
                match: "ghp_1234567890abcdef1234567890abcdef1234",
            },
        ]);
    });

    it("should ignore a single pattern on a line with @gitleaks ignore", async () => {
        createMockFile(
            "ignored-inline.txt",
            "AKIAIOSFODNN7EXAMPLE // @gitleaks ignore",
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
        });

        expect(results).to.be.an("array").that.is.empty;
    });

    it("should detect a pattern on a line without @gitleaks ignore and ignore the one with it", async () => {
        createMockFile(
            "partial-inline-ignore.txt",
            [
                "AKIAIOSFODNN7EXAMPLE",
                "ghp_1234567890abcdef1234567890abcdef1234 // @gitleaks ignore",
            ].join("\n"),
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0]).to.deep.include({
            line: 1,
            match: "AKIAIOSFODNN7EXAMPLE",
            file: path.join(MOCK_DIR, "partial-inline-ignore.txt"),
        });
    });

    it("should detect multiple patterns in different lines, skipping ignored ones", async () => {
        createMockFile(
            "mixed-matches.txt",
            [
                "ghp_1234567890abcdef1234567890abcdef1234",
                "AKIAIOSFODNN7EXAMPLE // @gitleaks ignore",
                "sk-1234567890abcdef1234567890abcdef12345678abcdefgh",
            ].join("\n"),
        );

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
        });

        expect(results).to.have.lengthOf(2);
        expect(results).to.deep.include.members([
            {
                line: 1,
                match: "ghp_1234567890abcdef1234567890abcdef1234",
                file: path.join(MOCK_DIR, "mixed-matches.txt"),
            },
            {
                line: 3,
                match: "sk-1234567890abcdef1234567890abcdef12345678abcdefgh",
                file: path.join(MOCK_DIR, "mixed-matches.txt"),
            },
        ]);
    });

    it("should ignore files with extensions in ignoreExtensions", async () => {
        createMockFile("secret.log", "AKIAIOSFODNN7EXAMPLE");
        createMockFile("visible.txt", "AKIAIOSFODNN7EXAMPLE");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
            ignoreExtensions: [".log"],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0].file).to.include("visible.txt");
    });

    it("should only scan files matching includePatterns", async () => {
        createMockFile("keep.js", "AKIAIOSFODNN7EXAMPLE");
        createMockFile("drop.txt", "AKIAIOSFODNN7EXAMPLE");

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            customPatterns: [],
            includePatterns: ["**/*.js"],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0].file).to.include("keep.js");
    });

    it("should skip files larger than maxFileSizeKb", async () => {
        createMockFileWithSize("small.txt", "AKIAIOSFODNN7EXAMPLE", 1);
        createMockFileWithSize("large.txt", "AKIAIOSFODNN7EXAMPLE", 600);

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            maxFileSizeKb: 500,
            customPatterns: [],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0].file).to.include("small.txt");
    });

    it("should respect all filters together", async () => {
        createMockFile("match.js", "AKIAIOSFODNN7EXAMPLE");
        createMockFile("ignore.log.js", "AKIAIOSFODNN7EXAMPLE");
        createMockFileWithSize("skip.txt", "AKIAIOSFODNN7EXAMPLE", 600);

        const results = await scanRepository(MOCK_DIR, {
            defaultPatterns,
            ignorePaths: [],
            maxFileSizeKb: 500,
            customPatterns: [],
            includePatterns: ["**/*.js"],
            ignoreExtensions: [".log.js"],
        });

        expect(results).to.have.lengthOf(1);
        expect(results[0].file).to.include("match.js");
    });
});
