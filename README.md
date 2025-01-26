# Git Leaks
## By: Luiz Carlos Aguiar Carrion

A lightweight and customizable tool for detecting sensitive data in your repositories. Git Leaks scans files for patterns like API keys, tokens, and other sensitive information based on default or user-defined configurations.


## Features

- Detect sensitive data such as API keys, AWS secrets, GitHub tokens, etc.
- Customizable patterns and ignore paths via `.gitleaksrc.json`.
- CLI support for easy integration into CI/CD pipelines.
- Modular and extensible codebase.


## Installation

### **Option 1: Install via npm**
```bash
npm install gitleaks
```

### **Option 2: Clone the Repository**
```bash
git clone https://github.com/IKuuhakuI/gitleaks.git
cd gitleaks-scanner
npm install
```

## Usage

### **CLI Command**
Run Git Leaks in the root directory of your repository:
```bash
gitleaks
```


### **Configuration**

The project uses a `.gitleaksrc.json` file for custom configurations. This file should be located in the root directory of the repository you want to scan.

#### Example `.gitleaksrc.json`:
```json
{
  "ignoredPatterns": ["awsAccessKey"],
  "ignorePaths": ["node_modules", ".git"],
  "customPatterns": ["TEST_KEY_[A-Za-z0-9]{10}"], 
}
```

#### Default Config (if `.gitleaksrc.json` is not present):
```json
{
  "customPatterns": [],
  "ignoredPatterns": [],
  "ignorePaths": ["node_modules", ".git", "package.json", "package-lock.json"],
}
```


## Default Patterns

The following patterns are included by default. You can disable specific patterns via the `ignoredPatterns` option.

| Pattern Key          | Regex                                      | Description                  |
|-----------------------|--------------------------------------------|------------------------------|
| `awsAccessKey`        | `AKIA[0-9A-Z]{16}`                        | AWS Access Key               |
| `githubToken`         | `ghp_[A-Za-z0-9]{36}`                     | GitHub Token                 |
| `googleApiKey`        | `AIza[0-9A-Za-z-_]{35}`                   | Google API Key               |
| `openAiSecretKey`     | `sk-[A-Za-z0-9]{48}`                      | OpenAI Secret Key            |
| `geminiKey`           | `AIzaSy[a-zA-Z0-9\\-_]{33}`               | Gemini API Key               |
| `genericApiKey`       | `\\b[A-Za-z0-9]{40}\\b`                   | Generic API Key              |


## Development

### **Run the Project Locally**
```bash
node index.js
```

### **Run Tests**
The project uses **Mocha** and **Chai** for testing. Run the test suite with:
```bash
npm test
```

### **Test Coverage**
Ensure all major features are tested:
1. Default patterns detection.
2. Custom patterns detection.
3. `ignoredPatterns` functionality.
4. File and path exclusions.


## Adding to Another Project

### **Install as a Dependency**
```bash
npm install gitleaks
```

### **Using in Code**
```javascript
const { scanRepository } = require("gitleaks/core/scanner");

(async () => {
    const results = await scanRepository("/path/to/repo", {
        ignorePaths: ["node_modules"],
        customPatterns: ["MY_SECRET_[A-Za-z0-9]{20}"],
    });
    console.log(results);
})();
```

## Contributing

Contributions are welcome! Follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Implement your feature.
4. Create tests!
5. Commit your changes (`git commit -m "Add new feature"`).
6. Push to your branch (`git push origin feature-name`).
7. Create a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
