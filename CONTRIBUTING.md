# Contributing to Movian Documentation

Thank you for your interest in improving the Movian documentation! This guide outlines how to contribute effectively.

## Documentation Standards

### Accuracy Requirements
- All code examples must be tested and working
- Source code references must include file paths and line numbers
- Version compatibility must be clearly stated
- Mark information with accuracy indicators:
  - 🟢 **Verified**: Directly from source code analysis
  - 🟡 **Tested**: Verified through working examples
  - 🟠 **Inferred**: Based on code behavior observation
  - 🔴 **Assumed**: Needs verification

### Content Guidelines
- Use clear, concise language appropriate for developers
- Include working code examples for all concepts
- Provide both reference and tutorial content
- Cross-reference related documentation sections
- Include troubleshooting information where relevant

### File Organization
- Follow the established directory structure
- Use descriptive filenames with kebab-case
- Include README.md files for directory overviews
- Maintain consistent formatting across all files

## Making Changes

### Small Improvements
For typos, clarifications, or minor additions:
1. Edit the relevant markdown file
2. Test any code examples
3. Update the "Last Updated" date
4. Submit your changes

### Major Additions
For new sections or significant changes:
1. Review the existing structure in [design.md](.kiro/specs/movian-documentation/design.md)
2. Follow the established patterns and templates
3. Include source code analysis where applicable
4. Add comprehensive examples
5. Update cross-references and navigation

### Code Examples
All code examples must:
- Be complete and runnable
- Use API 2 (ECMAScript) syntax for plugins
- Use JavaScript-like syntax for view files (not XML)
- Include necessary imports/requires
- Show expected output where applicable
- Include error handling
- Reference working plugins if applicable
- Include version compatibility notes (Movian 5.0+)

### Source References
When documenting APIs or features:
- Reference specific source files: `src/ecmascript/es_http.c:123-456`
- Include commit hash for verification: `(commit abc123)`
- Link to GitHub source when possible
- Update references when source code changes

## Testing Documentation

### Automated Validation
Run the validation tools before submitting:
```bash
# Test all code examples
npm run test:examples

# Validate source references
npm run validate:references

# Check for broken links
npm run check:links
```

### Manual Testing
- Test all code examples in actual Movian
- Verify installation instructions on target platforms
- Check that all links work correctly
- Ensure examples match current Movian behavior

## Review Process

### Self-Review Checklist
- [ ] All code examples tested and working
- [ ] Source references verified and current
- [ ] Cross-references updated
- [ ] Accuracy indicators included
- [ ] Version compatibility noted
- [ ] Formatting consistent with existing docs

### Community Review
- Technical accuracy review by domain experts
- Usability feedback from target audiences
- Integration with existing documentation flow

## Maintenance

### Regular Updates
Documentation should be reviewed and updated:
- When new Movian versions are released
- When APIs change or are deprecated
- When community feedback identifies issues
- During quarterly maintenance cycles

### Deprecation Handling
- Mark deprecated features with clear warnings
- Provide migration guides to new APIs
- Maintain deprecated docs for 2 major versions
- Archive old versions in separate sections

## Questions and Support

For questions about contributing:
- Check existing documentation structure and patterns
- Review the design document for architectural decisions
- Ask for clarification on specific technical details

Thank you for helping make Movian documentation better for everyone!