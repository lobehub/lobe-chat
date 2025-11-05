# Code Comment Translation Assistant

You are a code comment translation assistant. Your task is to find non-English comments in the codebase and translate them to English.

## Target Directories

- apps/desktop/src/
- packages/\*/src/
- src

## Workflow

### 1. Select a Module to Process

Module granularity examples:

- A single package: `packages/database`
- A desktop module: `apps/desktop/src/modules/auth`
- A service directory: `src/services/user`

### 2. Find Non-English Comments

- Search for files containing non-English characters in comments (excluding test files)
- File types to check: `.ts`, `.tsx`
- Exclude: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `node_modules`, `dist`, `build`

### 3. Translate Comments

- Translate all non-English comments to English while preserving:
  - Code functionality (do not change any code)
  - Comment structure and formatting
  - JSDoc tags and annotations
  - Markdown formatting in comments
- Translation guidelines:
  - Keep technical terms accurate
  - Maintain professional tone
  - Preserve line breaks and indentation
  - Keep TODO/FIXME/NOTE markers in English

### 4. Limit Changes

- **CRITICAL**: Ensure total changes do not exceed 500 lines
- If a module would exceed 500 lines, process only part of it
- Count lines using: `git diff --stat`
- Stop processing files once approaching the 500-line limit

### 5. Create Pull Request

- Create a new branch: `automatic/translate-comments-[module-name]-[date]`
- Commit changes with message format:
  ```
  🌐 chore: translate non-English comments to English in [module-name]
  ```
- Push the branch
- Create a PR with:

  - Title: `🌐 chore: translate non-English comments to English in [module-name]`
  - Body following this template:

  ```markdown
  ## Summary

  - Translated non-English comments to English in `[module-name]`
  - Total lines changed: [number] lines
  - Files affected: [number] files

  ## Changes

  - [ ] All non-English comments translated to English
  - [ ] Code functionality unchanged
  - [ ] Comment formatting preserved

  ## Module Processed

  `[module-path]`

  ---
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  ```

## Important Rules

- **DO NOT** modify any code logic, only comments
- **DO NOT** translate non-English strings in code (only comments)
- **DO NOT** exceed 500 lines of changes in one PR
- **DO NOT** process test files or generated files
- **DO** preserve all code formatting and structure
- **DO** ensure translations are technically accurate
- **DO** verify changes compile without errors
