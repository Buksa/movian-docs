# Plugin Development Workflow

Best practices and workflow for developing Movian plugins.

## Development Cycle

1. **Plan** - Define plugin functionality
2. **Setup** - Create plugin structure
3. **Develop** - Write code incrementally
4. **Test** - Test functionality
5. **Debug** - Fix issues
6. **Refine** - Optimize and polish
7. **Release** - Package and distribute

## Project Structure

```
my-plugin/
├── plugin.json          # Manifest
├── plugin.js            # Main code
├── logo.png             # Icon
├── README.md            # Documentation
├── CHANGELOG.md         # Version history
└── lib/                 # Optional libraries
    ├── api.js
    └── utils.js
```

## Development Tools

### Debug Mode

```bash
movian --debug-ecmascript
```

### Live Reload

Restart Movian after code changes or use development mode.

### Logging

```javascript
console.log("Debug:", value);
console.error("Error:", error);
```

## Testing

### Manual Testing

1. Install plugin
2. Test all features
3. Test error cases
4. Test on different platforms

### Automated Testing

```javascript
function runTests() {
    console.log("Running tests...");
    
    testApiConnection();
    testDataParsing();
    testErrorHandling();
    
    console.log("Tests complete");
}
```

## Version Control

### Git Workflow

```bash
git init
git add .
git commit -m "Initial commit"
git tag v1.0.0
```

### Semantic Versioning

- MAJOR.MINOR.PATCH
- 1.0.0 - Initial release
- 1.1.0 - New features
- 1.1.1 - Bug fixes

## Release Process

1. Update version in plugin.json
2. Update CHANGELOG.md
3. Test thoroughly
4. Create git tag
5. Create ZIP package
6. Publish to repository

## See Also

- [Building First Plugin](building-first-plugin.md)
- [Best Practices](../plugins/best-practices.md)
- [Debugging Guide](debugging-plugins.md)
