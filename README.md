# @ziul285/gitleaks

[![npm version](https://img.shields.io/npm/v/@ziul285/gitleaks.svg)](https://www.npmjs.com/package/@ziul285/gitleaks)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#run-tests)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#test-coverage)
[![Node.js](https://img.shields.io/badge/node-%3E=18.x-blue.svg)](https://nodejs.org/)

## By: Luiz Carlos Aguiar Carrion

A lightweight and customizable tool for detecting sensitive data in your repositories. Git Leaks scans files for patterns like API keys, tokens, and other sensitive information based on default or user-defined configurations.

⚙️ Easily configurable via .gitleaksrc.json, with support for:

🔍 Default and custom regex-based patterns

📂 Ignored paths and excluded patterns

🧪 CLI + Husky integration for pre-commit/pre-push scans

🧵 Inline ignore support — skip specific lines with @gitleaks ignore

🔄 Reusable API for embedding into Node.js projects

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
   - [Option 1: Install via npm](#option-1-install-via-npm)
   - [Option 2: Clone the Repository](#option-2-clone-the-repository)
3. [Usage](#usage)
   - [CLI Command](#cli-command)
   - [Available Flags](#available-flags)
   - [Example Commands](#example-commands)
4. [Integrating with Husky](#integrating-with-husky)
   - [Step 1: Install Husky](#step-1-install-husky)
   - [Step 2: Create a Pre-Commit Hook](#step-2-create-a-pre-commit-hook)
   - [Step 3: Create a Pre-Push Hook](#step-3-create-a-pre-push-hook)
   - [Step 4: Test the Setup](#step-4-test-the-setup)
   - [Advanced Husky Integration](#advanced-husky-integration)
5. [Configuration](#configuration)
   - [.gitleaksrc.json](#.gitleaksrcjson)
   - [Default Config](#default-config-if-gitleaksrcjson-is-not-present)
6. [Development](#development)
   - [Run the Project Locally](#run-the-project-locally)
   - [Run Tests](#run-tests)
   - [Test Coverage](#test-coverage)
7. [Adding to Another Project](#adding-to-another-project)
   - [Install as a Dependency](#install-as-a-dependency)
   - [Using in Code](#using-in-code)
8. [Contributing](#contributing)
9. [License](#license)

## Features

- Detect sensitive data such as API keys, AWS secrets, GitHub tokens, etc.
- Customizable patterns and ignore paths via `.gitleaksrc.json`.
- CLI support for easy integration into CI/CD pipelines.
- Modular and extensible codebase.

## Installation

### **Option 1: Install via npm**

```bash
npm install @ziul285/gitleaks
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
gitleaks [options]
```

### **Available Flags**

| Flag         | Alias | Type      | Description                                |
| ------------ | ----- | --------- | ------------------------------------------ |
| `--staged`   | `-s`  | `boolean` | Scan only files in the staging area        |
| `--all`      | `-a`  | `boolean` | Scan all files in the repository (default) |
| `--quiet`    | `-q`  | `boolean` | Suppress all output except errors          |
| `--ignore`   |       | `array`   | Additional paths to ignore during the scan |
| `--patterns` | `-p`  | `array`   | Specify additional patterns to scan for    |
| `--exclude`  | `-e`  | `array`   | Exclude specific patterns from the scan    |
| `--version`  | `-v`  | `boolean` | Display the current version of the tool    |
| `--help`     | `-h`  | `boolean` | Show help message with usage details       |

#### Example Commands

- **Scan Staged Files Only:**
  ```bash
  gitleaks --staged
  ```
- **Scan All Files in Quiet Mode:**
  ```bash
  gitleaks --all --quiet
  ```
- **Ignore Additional Paths:**
  ```bash
  gitleaks --all --ignore dist build
  ```
- **Add Custom Patterns:**
  ```bash
  gitleaks --all --patterns "CUSTOM_PATTERN_1" "CUSTOM_PATTERN_2"
  ```
- **Exclude Patterns:**
  ```bash
  gitleaks --all --exclude githubToken
  ```

## Integrating with Husky

You can integrate Git Leaks with Husky to automatically scan files during Git operations like `commit` or `push`.

### **Step 1: Install Husky**

If Husky is not already installed in your project, run:

```bash
npm install husky --save-dev
```

Set up Husky in your project:

```bash
npx husky install
```

### **Step 2: Create a Pre-Commit Hook**

Add a Husky pre-commit hook to scan staged files for sensitive data:

```bash
npx husky add .husky/pre-commit "npx gitleaks --staged"
```

### **Step 3: Create a Pre-Push Hook**

Optionally, add a pre-push hook to scan the entire repository before pushing:

```bash
npx husky add .husky/pre-push "npx gitleaks --all"
```

### **Step 4: Test the Setup**

To verify the integration:

1. Stage some changes with sensitive data.
2. Attempt to commit or push.
3. Git Leaks will run, and the commit/push will be blocked if sensitive data is detected.

### **Advanced Husky Integration**

- If you want to customize the hooks further, you can modify the commands in the `.husky/pre-commit` or `.husky/pre-push` files.
- Example `pre-commit` file:

  ```bash
  #!/bin/sh

  npx gitleaks --staged --quiet
  ```

## Configuration

### **.gitleaksrc.json**

The project uses a `.gitleaksrc.json` file for custom configurations. This file should be located in the root directory of the repository you want to scan.

#### Example `.gitleaksrc.json`:

```json
{
  "maxFileSizeKb": 500,
  "ignoreExtensions": [".jpg", ".zip", ".log"],
  "includePatterns": ["**/*.js", "src/**/*.ts"],
  "customPatterns": ["TEST_KEY_[A-Za-z0-9]{10}"],
  "ignorePaths": ["node_modules", ".git", "dist"],
  "ignoredPatterns": ["awsAccessKey", "openAiSecretKey"]
}
```

### 📘 Available Configuration Fields

| Field              | Type       | Description                                             |
| ------------------ | ---------- | ------------------------------------------------------- |
| `ignorePaths`      | `string[]` | Folders or files to skip entirely.                      |
| `ignoreExtensions` | `string[]` | File extensions to skip (e.g., `[".zip", ".log"]`).     |
| `maxFileSizeKb`    | `number`   | Skip files larger than this (in kilobytes).             |
| `includePatterns`  | `string[]` | Glob patterns for files to include (e.g., `"**/*.js"`). |
| `ignoredPatterns`  | `string[]` | Keys of default patterns to disable.                    |
| `customPatterns`   | `string[]` | User-defined regex patterns to scan for.                |

#### Default Config (if `.gitleaksrc.json` is not present):

```json
{
  "customPatterns": [],
  "ignoredPatterns": [],
  "ignorePaths": ["node_modules", ".git", "package.json", "package-lock.json"]
}
```

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
