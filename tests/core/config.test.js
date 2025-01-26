const fs = require("node:fs");
const sinon = require("sinon");
const {expect} = require("chai");
const path = require("node:path");
const {loadConfig} = require("../../core/config");
const {defaultPatterns} = require("../../core/patterns");

describe("Load Config", () => {
    const configPath = path.join(process.cwd(), ".gitleaksrc.json");

    afterEach(() => {
        sinon.restore();
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
    });

    it("should return default configuration if the config file does not exist", () => {
        sinon.stub(fs, "existsSync").returns(false);

        const config = loadConfig();
        expect(config).to.deep.equal({
            customPatterns: [],
            ignoredPatterns: [],
            ignorePaths: [
                ".git",
                "node_modules",
                "package.json",
                "package-lock.json",
            ],
            defaultPatterns,
        });
    });

    it("should merge custom configuration with defaults", () => {
        const userConfig = {
            ignorePaths: ["dist"],
            ignoredPatterns: ["awsAccessKey"],
            customPatterns: ["MY_CUSTOM_PATTERN"],
        };

        fs.writeFileSync(configPath, JSON.stringify(userConfig));

        const config = loadConfig();
        expect(config).to.deep.include({
            ignorePaths: [...userConfig.ignorePaths],
            customPatterns: userConfig.customPatterns,
            ignoredPatterns: userConfig.ignoredPatterns,
        });
    });

    it("should warn about unknown keys in configuration", () => {
        const warnStub = sinon.stub(console, "warn");
        const userConfig = {
            unknownKey: "value",
        };

        fs.writeFileSync(configPath, JSON.stringify(userConfig));

        loadConfig();
        expect(warnStub.calledOnce).to.be.true;
        expect(warnStub.firstCall.args[0]).to.include(
            "Unknown keys in configuration: unknownKey. These keys will be ignored.",
        );
    });

    it("should warn about invalid ignored patterns", () => {
        const warnStub = sinon.stub(console, "warn");
        const userConfig = {
            ignoredPatterns: ["invalidPattern"],
        };

        fs.writeFileSync(configPath, JSON.stringify(userConfig));

        loadConfig();
        expect(warnStub.calledOnce).to.be.true;
        expect(warnStub.firstCall.args[0]).to.include(
            "Invalid keys in 'ignoredPatterns': invalidPattern. These keys will be ignored.",
        );
    });

    it("should throw an error if the config file is not a valid JSON object", () => {
        fs.writeFileSync(configPath, "INVALID_JSON");

        expect(() => loadConfig()).to.throw(
            Error,
            `Failed to load configuration: Unexpected token 'I', "INVALID_JSON" is not valid JSON`,
        );
    });

    it("should throw an error if a field is invalid", () => {
        const userConfig = {
            customPatterns: "INVALID_TYPE",
        };

        fs.writeFileSync(configPath, JSON.stringify(userConfig));

        expect(() => loadConfig()).to.throw(
            "Invalid .gitleaksrc.json: 'customPatterns' is invalid.",
        );
    });

    it("should filter default patterns based on ignoredPatterns", () => {
        const userConfig = {
            ignoredPatterns: ["awsAccessKey"],
        };

        fs.writeFileSync(configPath, JSON.stringify(userConfig));

        const config = loadConfig();
        expect(config.defaultPatterns).to.not.have.property("awsAccessKey");
    });
});
