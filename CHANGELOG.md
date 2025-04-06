# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-04-06

### 🚀 Added

- **Inline Ignore Support:** Use `@gitleaks ignore` to skip secret detection on specific lines.
- New test cases for inline ignore handling (single/multiple lines, mixed matches).
- `@gitleaks ignore` works with default and custom patterns.

### 🧪 Improved

- Refactored line-by-line scanning to support Biome linting (`noAssignInExpressions`).
- Stronger test coverage with 100% match accuracy across patterns.
- Improved configuration structure via `.gitleaksrc.json`.

### 📘 Docs

- Updated README with new description and inline ignore usage.
- Added project badges (npm version, license, test status, coverage, Node version).
- Added this `CHANGELOG.md` file.

---

## [0.0.7] - 2025-01-26

### ✅ Added

- Initial CLI interface (`--all`, `--staged`, `--patterns`, `--exclude`, etc.).
- Built-in patterns for:
  - AWS Access Key
  - GitHub Token
  - Google API Key
  - OpenAI Key
- Custom pattern support via CLI or config file.
- Path ignore logic via `ignorePaths` config.
- Husky integration instructions.
