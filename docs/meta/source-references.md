# Source Code Reference Tracking System

## Overview

This document describes the system for tracking and validating source code references throughout the Movian documentation. Maintaining accurate references to source files and line numbers is critical for documentation accuracy and maintainability.

## Reference Format Standards

### File References

All source code references should follow these standardized formats:

#### Format 1: Simple File Reference
```markdown
See `src/ui/glw/glw_view.c` for implementation details.
```

#### Format 2: File Reference with Line Numbers
```markdown
Source Reference: src/ecmascript/es_http.c:123-456
```

#### Format 3: Inline Code with File Path
```markdown
The `movian/src/plugins.c` file handles plugin loading.
```

### Supported File Extensions

The validation system recognizes the following file types:
- `.c` - C source files
- `.h` - C header files
- `.js` - JavaScript files
- `.view` - GLW view files

## Reference Validation

### Automated Validation

The `file-reference-validator.js` script automatically validates all source code references in the documentation:

```bash
# Run file reference validation
node docs/tests/file-reference-validator.js --verbose

# Specify custom Movian source location
node docs/tests/file-reference-validator.js --movian-root=/path/to/movian
```

### Validation Checks

The validator performs the following checks:

1. **File Existence**: Verifies that referenced files exist in the Movian repository
2. **Line Number Validity**: Checks that line numbers are within the file's actual line count
3. **Line Range Validity**: Ensures line ranges (start-end) are valid and logical

### Validation Results

Results are saved to `docs/tests/results/file-reference-validation.json`:

```json
{
  "timestamp": "2024-11-08T12:00:00.000Z",
  "summary": {
    "totalReferences": 150,
    "validReferences": 148,
    "invalidReferences": 2,
    "warnings": 0
  },
  "errors": [
    "Invalid file reference in plugins/api/core-api.md: src/old_file.c (file not found)"
  ]
}
```

## Tracking Source Changes

### Version Compatibility

When Movian source code changes, documentation references may become outdated. The tracking system helps identify these issues:

#### Change Detection Strategy

1. **Regular Validation**: Run validation checks regularly (weekly recommended)
2. **CI Integration**: Integrate validation into continuous integration pipeline
3. **Version Tagging**: Tag documentation with compatible Movian version

#### Handling Source Changes

When Movian source code is updated:

1. **Run Validation**: Execute file reference validator
2. **Review Errors**: Check validation report for broken references
3. **Update References**: Update line numbers and file paths as needed
4. **Verify Content**: Ensure documentation content still matches source behavior

### Version Tracking

Document the Movian version compatibility in each major documentation section:

```markdown
**Accuracy Status:** 🟢 Verified from source code  
**Movian Version:** 4.8+  
**Last Verified:** 2024-11-08
```

## Reference Patterns

### Common Reference Patterns

#### Pattern 1: API Documentation
```markdown
/**
 * Function: http.request()
 * 
 * Source Reference: src/ecmascript/es_http.c:123-456
 * 
 * Parameters:
 *   @param {string} url - Target URL
 * ...
 */
```

#### Pattern 2: Architecture Documentation
```markdown
The GLW rendering engine is implemented in `src/ui/glw/glw.c` and 
coordinates with `src/ui/glw/glw_renderer.c` for OpenGL operations.
```

#### Pattern 3: Component Analysis
```markdown
## View File Parser

**Source Files:**
- `src/ui/glw/glw_view_parser.c` - Main parser implementation
- `src/ui/glw/glw_view_lexer.c` - Lexical analysis
- `src/ui/glw/glw_view_attrib.c` - Attribute processing
```

### Best Practices

1. **Be Specific**: Include line numbers for specific functions or code blocks
2. **Use Relative Paths**: Use paths relative to Movian repository root
3. **Group Related References**: Group references to related files together
4. **Update Regularly**: Review and update references when source changes
5. **Document Assumptions**: Note if reference is approximate or may change

## Integration with Documentation Workflow

### During Documentation Creation

1. **Verify Source**: Always verify source code before documenting
2. **Record References**: Add source references as you document
3. **Use Standard Format**: Follow the reference format standards
4. **Test References**: Run validator before committing

### During Documentation Updates

1. **Check Validity**: Run validator to find broken references
2. **Update References**: Fix any invalid references found
3. **Verify Behavior**: Ensure documented behavior still matches source
4. **Update Version Info**: Update version compatibility information

### During Code Reviews

1. **Validate References**: Ensure all new references are valid
2. **Check Format**: Verify references follow standard format
3. **Test Validation**: Run validator as part of review process

## Automation and CI Integration

### GitHub Actions Integration

Add validation to CI pipeline:

```yaml
name: Documentation Validation

on:
  push:
    paths:
      - 'docs/**/*.md'
  pull_request:
    paths:
      - 'docs/**/*.md'

jobs:
  validate-references:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Checkout Movian source
        uses: actions/checkout@v2
        with:
          repository: andoma/movian
          path: movian
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      
      - name: Install dependencies
        run: cd docs/tests && npm install
      
      - name: Validate file references
        run: node docs/tests/file-reference-validator.js --verbose
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: validation-results
          path: docs/tests/results/
```

### Pre-commit Hooks

Add validation to pre-commit hooks:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Validating documentation references..."
node docs/tests/file-reference-validator.js

if [ $? -ne 0 ]; then
  echo "❌ File reference validation failed!"
  echo "Please fix the errors before committing."
  exit 1
fi

echo "✅ File reference validation passed"
```

## Maintenance Schedule

### Regular Maintenance Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| **Run Validation** | Weekly | Execute full validation suite |
| **Review Warnings** | Weekly | Check and address validation warnings |
| **Update References** | As needed | Fix broken references when found |
| **Verify Behavior** | Monthly | Spot-check documented behavior against source |
| **Update Versions** | Per release | Update version compatibility information |

### Quarterly Review

Every quarter, perform a comprehensive review:

1. **Full Validation**: Run all validation checks
2. **Source Comparison**: Compare documentation against latest Movian source
3. **Accuracy Audit**: Verify accuracy of documented APIs and behaviors
4. **Update Documentation**: Update any outdated information
5. **Report Status**: Document validation status and any issues

## Troubleshooting

### Common Issues

#### Issue: File Not Found
```
❌ Invalid file reference: src/old_file.c (file not found)
```

**Solution**: File may have been moved or renamed. Search Movian repository for the file or its replacement.

#### Issue: Invalid Line Numbers
```
❌ Invalid line reference: src/file.c:500 (file has only 400 lines)
```

**Solution**: Source file has changed. Review the file and update line numbers.

#### Issue: Movian Source Not Found
```
❌ Movian source directory not found: /path/to/movian
```

**Solution**: Clone Movian repository or specify correct path with `--movian-root` option.

## Reference Database

### Maintaining Reference Database

For large documentation projects, consider maintaining a reference database:

```json
{
  "references": [
    {
      "id": "glw-view-parser",
      "file": "src/ui/glw/glw_view_parser.c",
      "lines": "123-456",
      "description": "Main view file parser implementation",
      "lastVerified": "2024-11-08",
      "movianVersion": "4.8",
      "usedIn": [
        "docs/ui/view-files/syntax-reference.md",
        "docs/ui/glw-architecture.md"
      ]
    }
  ]
}
```

This database can be used to:
- Track where references are used
- Identify impact of source changes
- Facilitate bulk updates
- Generate reference reports

## Future Enhancements

### Planned Improvements

1. **Semantic Validation**: Verify that referenced code matches documented behavior
2. **Diff Tracking**: Track changes in referenced source files
3. **Auto-update**: Automatically update line numbers when source changes
4. **Reference Suggestions**: Suggest references based on documentation content
5. **Visual Diff**: Show visual diff between documented and actual source

---

**Last Updated:** November 2024  
**Maintained By:** Movian Documentation Team  
**Related Documents:**
- [Accuracy Tracking System](accuracy-tracking.md)
- [Documentation Standards](documentation-standards.md)
- [Testing Guide](../tests/README.md)
