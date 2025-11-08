# Movian Examples and Templates Library

This directory contains a comprehensive collection of working code examples, project templates, and reusable UI components for Movian development. All examples are validated and tested to work with current Movian versions.

## Directory Structure

```
examples-templates/
├── project-templates/          # Complete starter templates
│   ├── basic-plugin/          # Minimal plugin template
│   ├── content-provider/      # Media content provider template
│   ├── search-service/        # Search integration template
│   ├── settings-plugin/       # Plugin with configuration
│   ├── ui-extension/          # Custom UI plugin template
│   └── minimal-skin/          # Basic skin template
│
└── ui-components/             # Reusable UI components
    ├── navigation/            # Navigation patterns
    ├── media-controls/        # Media player controls
    ├── lists-grids/          # Data display components
    ├── forms-inputs/         # Input and form components
    ├── dialogs-popups/       # Modal dialogs and popups
    └── animations/           # Animation patterns
```

## Quick Start

### Using Project Templates

1. **Copy a template** to your development directory:
   ```bash
   cp -r project-templates/basic-plugin/ ~/my-movian-plugin/
   ```

2. **Customize the template**:
   - Edit `plugin.json` with your plugin details
   - Modify `main.js` with your functionality
   - Update `README.md` with your documentation

3. **Test your plugin**:
   - Copy to Movian plugins directory
   - Restart Movian
   - Enable plugin in settings

### Using UI Components

1. **Browse components** in the `ui-components/` directory
2. **Copy component code** into your view files
3. **Customize** colors, sizes, and behavior
4. **Import macros** if needed from theme.view

## Template Categories

### Plugin Templates

- **basic-plugin**: Minimal plugin structure for learning
- **content-provider**: Full-featured media content provider
- **search-service**: Search integration with API
- **settings-plugin**: Plugin with user configuration
- **ui-extension**: Custom UI elements and pages

### Skin Templates

- **minimal-skin**: Basic skin with essential components
- See also: `docs/ui/theming/examples/` for complete skin examples

### UI Component Library

- **navigation**: Menus, breadcrumbs, tabs
- **media-controls**: Play/pause, seek, volume controls
- **lists-grids**: Scrollable lists, grid layouts, data tables
- **forms-inputs**: Text inputs, buttons, checkboxes, sliders
- **dialogs-popups**: Alerts, confirmations, modals
- **animations**: Transitions, fades, slides, zooms

## Validation

All templates and components are validated using automated tests:

```bash
# Validate plugin templates
cd docs/tests
npm test

# Validate view file syntax
./run-view-syntax-tests.sh

# Validate skin structure
./run-skin-structure-validation.sh
```

## Documentation References

- **Plugin Development**: `docs/plugins/README.md`
- **View Files**: `docs/ui/view-files/syntax-reference.md`
- **Theming**: `docs/ui/theming/README.md`
- **API Reference**: `docs/reference/api-index.md`
- **Best Practices**: `docs/plugins/best-practices.md`

## Contributing

When adding new templates or components:

1. Follow existing naming conventions
2. Include comprehensive README.md
3. Add inline code comments
4. Test with current Movian version
5. Update this index file

## Version Compatibility

- **Movian Version**: 4.8+
- **Last Updated**: 2024-11-08
- **Validation Status**: ✅ All examples tested and working

## Support

For questions and issues:
- Check `docs/reference/troubleshooting.md`
- Review `docs/reference/faq.md`
- See plugin examples in `docs/plugins/examples/`
