const {expect} = require("chai");
const {defaultPatterns} = require("../../core/patterns");

describe("Default Patterns", () => {
    it("should not match random text", () => {
        const randomText = "ThisIsRandomText123";
        const regex = new RegExp(Object.values(defaultPatterns).join("|"), "g");

        expect(randomText).to.not.match(regex);
    });

    it("should match an AWS access key", () => {
        const awsAccessKey = "AKIAIOSFODNN7EXAMPLE";
        const regex = new RegExp(defaultPatterns.awsAccessKey);

        expect(awsAccessKey).to.match(regex);
    });

    it("should match a basic API key", () => {
        const apiKey = "1234567890abcdef1234567890abcdef12345678";
        const regex = new RegExp(defaultPatterns.genericApiKey);

        expect(apiKey).to.match(regex);
    });

    it("should match a GitHub token", () => {
        const githubToken = "ghp_1234567890abcdef1234567890abcdef1234";
        const regex = new RegExp(defaultPatterns.githubToken);

        expect(githubToken).to.match(regex);
    });

    it("should match a Google API key", () => {
        const googleApiKey = "AIzaSyA1234567890ABCDEF1234567890abcdef";
        const regex = new RegExp(defaultPatterns.googleApiKey);

        expect(googleApiKey).to.match(regex);
    });

    it("should match an OpenAI key", () => {
        const openAiKey = "sk-1234567890abcdef1234567890abcdef12345678abcdefgh";
        const regex = new RegExp(defaultPatterns.openAiSecretKey);

        expect(openAiKey).to.match(regex);
    });

    it("should match a Gemini key", () => {
        const geminiKey = "AIzaSyEwcsswgzbu7NY221_KiERu0aRhI_lqIgd";
        const regex = new RegExp(defaultPatterns.geminiKey);

        expect(geminiKey).to.match(regex);
    });
});
