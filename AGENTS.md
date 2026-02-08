# AGENTS.md - Movian Documentation Repository

Guidelines for AI agents working in this repository.

## Build & Development Commands

### Documentation Development

#### Option 1: Using pip (Standard)
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Development server (MkDocs)
mkdocs serve

# Build documentation
mkdocs build

# Deploy to GitHub Pages
mkdocs gh-deploy
```

#### Option 2: Using UV (Recommended - Faster)

UV is an ultra-fast Python package manager that significantly speeds up dependency installation.

**Installation:**
```bash
# Install UV if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh
# Add to PATH: export PATH="$HOME/.local/bin:$PATH"
```

**Development workflow:**
```bash
# Create virtual environment
uv venv

# Install dependencies (10x faster than pip)
uv pip install -r requirements.txt

# Activate environment and serve
source .venv/bin/activate
mkdocs serve

# Or use uv run (without explicit activation)
uv run mkdocs serve

# Build documentation
uv run mkdocs build

# Deploy to GitHub Pages
uv run mkdocs gh-deploy
```

**Advantages of UV:**
- ⚡ 10-100x faster than pip
- 🔄 Intelligent caching
- 📦 Automatic virtual environment management
- 🎯 Better dependency resolution

### Testing Commands
```bash
# Run all tests
make test
npm test

# Individual test suites
make test-examples       # Validate code examples
make test-links          # Check internal/external links
make test-references MOVIAN_SOURCE=/path/to/movian  # Validate source references

# From docs/tests/ directory:
npm run test:plugins          # Plugin integration tests
npm run test:view-syntax      # View syntax validation
npm run test:macros           # Macro validation
npm run test:skin-structure   # Skin structure validation
npm run test:qa               # QA validation

# Single test file (run specific validator)
node docs/tests/view-syntax-validator.js
node docs/tests/macro-validator.js
```

### Analysis Commands
```bash
# Analyze Movian source (requires MOVIAN_SOURCE env var)
make analyze-source MOVIAN_SOURCE=/path/to/movian
make generate-api MOVIAN_SOURCE=/path/to/movian

# Tools from root directory
node tools/test-examples.js
node tools/check-links.js
node tools/validate-references.js
```

## Code Style Guidelines

### JavaScript (Node.js Tools & Examples)
- **Style**: ES6+ features allowed in tools; ES5 for Movian plugins (API compatibility)
- **Classes**: PascalCase (e.g., `ExampleTester`, `LinkChecker`)
- **Methods/Functions**: camelCase (e.g., `testMarkdownFile`, `generateReport`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Variables**: camelCase, use `const`/`let` (avoid `var` in tools)
- **Plugins**: Use `var` for Movian plugin code (ES5 compatibility)
- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Comments**: JSDoc for public methods, inline for complex logic

### Markdown Documentation
- **Filenames**: kebab-case (e.g., `documentation-standards.md`)
- **Structure**: Title, Overview, Content Sections, Examples, See Also
- **Code blocks**: Always specify language (e.g., ```javascript)
- **Accuracy indicators**: Use 🟢 Verified, 🟡 Tested, 🟠 Inferred, 🔴 Assumed
- **Line length**: Soft wrap at 80-100 characters
- **Headers**: Use sentence case (e.g., "## File naming conventions")

### Shell Scripts
- **Shebang**: `#!/bin/bash` with `set -e`
- **Functions**: lowercase with underscores (e.g., `test_examples()`)
- **Variables**: UPPER_CASE for constants, lowercase for locals
- **Colors**: Use RED, GREEN, YELLOW, BLUE, NC pattern for output
- **Quotes**: Always quote variables (e.g., `"$variable"`)

### Python Scripts
- **Style**: PEP 8 compliant
- **Functions**: snake_case
- **Classes**: PascalCase
- **Indentation**: 4 spaces

## Import Conventions

### Node.js Tools
```javascript
const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');
```

### Movian Plugins
```javascript
var page = require('movian/page');
var service = require('movian/service');
var http = require('movian/http');
```

## Error Handling
- Use try-catch for async operations
- Return boolean success/failure from test methods
- Log errors with context (file path, line number when available)
- Process exit codes: 0 for success, non-zero for failure

## Testing Standards
- All code examples must be syntactically valid
- Source references must include file paths and line numbers
- Cross-references between docs must be valid
- Run `npm test` before committing changes

## Project Structure
- `docs/` - Documentation source files
- `tools/` - Build and validation tools
- `docs/tests/` - Comprehensive test suite
- `docs/plugins/examples/` - Working plugin examples
- `mkdocs.yml` - MkDocs configuration
- `Makefile` - Build automation

## Key Constraints
- Movian plugins target API v2 (ECMAScript 5 compatible)
- Documentation must be accurate and tested
- Links must be validated (internal and external)
- Code examples must match actual Movian behavior
