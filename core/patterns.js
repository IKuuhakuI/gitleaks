const defaultPatterns = {
    geminiKey: "gem-[A-Za-z0-9]{40}",
    awsAccessKey: "AKIA[0-9A-Z]{16}",
    githubToken: "ghp_[A-Za-z0-9]{36}",
    googleApiKey: "AIza[0-9A-Za-z-_]{35}",
    openAiSecretKey: "sk-[A-Za-z0-9]{48}",
    genericApiKey: "\\b[A-Za-z0-9]{40}\\b",
};

module.exports = {defaultPatterns};
