const defaultPatterns = {
    awsAccessKey: "AKIA[0-9A-Z]{16}",
    githubToken: "ghp_[A-Za-z0-9]{36}",
    googleApiKey: "AIza[0-9A-Za-z-_]{35}",
    openAiSecretKey: "sk-[A-Za-z0-9]{48}",
    genericApiKey: "\\b[A-Za-z0-9]{40}\\b",
    geminiApiKey: "AIzaSy[a-zA-Z0-9\\-_]{33}",
};

module.exports = {defaultPatterns};
