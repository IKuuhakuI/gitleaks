# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-04-06

### 🚀 Added

- **Inline Ignore Support:** Use `@gitleaks ignore` to skip secret detection on specific lines.
- **New Config Options**:
  - `ignoreExtensions`: skip files by file extension (e.g. `.zip`, `.log`)
  - `maxFileSizeKb`: skip files larger than the given size
  - `includePatterns`: glob-based file filters (e.g. `**/*.js`, `src/**/*.ts`)
- **Glob pattern matching** using `minimatch` for flexible include filters.
- Added test cases for all new config options.

### 🧪 Improved

- Refactored scanning logic to support:
  - Dynamic file filtering with multiple conditions
- Centralized file filtering logic for reusability and testability.
- 100% test coverage for all config combinations.

### 📘 Docs

- Updated README with:
  - Full config reference
  - Husky integration
  - CLI flag examples
  - New badge section
- Added `.gitleaksrc.json` config examples with glob patterns and size limits.
- Added this `CHANGELOG.md` following Keep a Changelog standard.
