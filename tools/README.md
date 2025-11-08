# Documentation Tools

This directory contains utility tools for the Movian documentation project.

## Available Tools

### generate-skin-template.js

**Movian Skin Template Generator** - Creates a new Movian skin with proper universe.view structure.

**Usage:**
```bash
node tools/generate-skin-template.js <skin-name> [options]
```

**Options:**
- `--type=TYPE` - Template type: "minimal" or "advanced" (default: minimal)
- `--output=PATH` - Output directory path (default: ./generated-skins)
- `--color-primary=COLOR` - Primary color in hex format (default: #4192ff)
- `--color-secondary=COLOR` - Secondary color in hex format (default: #306cbe)
- `--color-accent=COLOR` - Accent color in hex format (default: #c2ddff)
- `--help`, `-h` - Show help message

**Examples:**
```bash
# Generate minimal skin
node tools/generate-skin-template.js my-custom-skin

# Generate advanced skin with custom colors
node tools/generate-skin-template.js my-skin --type=advanced --color-primary=#ff0000

# Generate to specific directory
node tools/generate-skin-template.js my-skin --output=../my-skins/
```

**Shell Wrappers:**
- `generate-skin.sh` - Bash wrapper for Linux/macOS
- `generate-skin.ps1` - PowerShell wrapper for Windows

**Documentation:**
See [Skin Template Generator Guide](../docs/guides/skin-template-generator.md) for complete documentation.

---

### analyze-source.js

Analyzes Movian source code to extract API information and documentation.

**Usage:**
```bash
node tools/analyze-source.js [source-path]
```

---

### check-links.js

Validates internal and external links in documentation files.

**Usage:**
```bash
node tools/check-links.js [docs-path]
```

---

### test-examples.js

Tests plugin and view file examples to ensure they are valid.

**Usage:**
```bash
node tools/test-examples.js
```

---

### validate-references.js

Validates source code references and line numbers in documentation.

**Usage:**
```bash
node tools/validate-references.js
```

## Requirements

All tools require:
- **Node.js** (version 12 or higher)
- Run from the `movian-docs` directory root

## Tool Development

### Adding New Tools

When adding new utility tools:

1. **Follow naming convention**: Use descriptive names with hyphens
2. **Add documentation**: Include usage examples and requirements
3. **Update this README**: Add the new tool to the list above
4. **Test thoroughly**: Ensure tools work from the project root directory
5. **Add help option**: Include `--help` flag for usage information

### Tool Guidelines

All tools should:
- Include proper error handling
- Provide clear usage instructions
- Work from the project root directory
- Follow Node.js best practices
- Include appropriate file encoding handling
- Exit with proper status codes (0 for success, non-zero for errors)

## Troubleshooting

### Common Issues

**Node.js not found:**
```bash
# Install Node.js from https://nodejs.org/
# Or use package manager:
# Ubuntu/Debian
sudo apt install nodejs

# macOS
brew install node
```

**Permission denied (Linux/macOS):**
```bash
# Make shell scripts executable
chmod +x tools/generate-skin.sh
```

**Script not found:**
```bash
# Make sure you're in the movian-docs directory
cd movian-docs
node tools/generate-skin-template.js --help
```

## Contributing

To improve the tools:

1. Fork the movian-docs repository
2. Create a new tool or modify existing ones
3. Test your changes thoroughly
4. Update this README
5. Submit a pull request

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Movian Documentation](../README.md)
- [Scripts Directory](../scripts/README.md)

## License

These tools are part of the Movian documentation project and are provided as-is for use with Movian.
