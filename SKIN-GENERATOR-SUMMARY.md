# Skin Template Generator - Quick Reference

## What Was Created

A comprehensive tool for generating Movian skins with proper architecture.

## Files Created

1. **`tools/generate-skin-template.js`** (600+ lines)
   - Main generator script
   - Supports minimal and advanced templates
   - Color customization
   - Cross-platform compatibility

2. **`tools/generate-skin.sh`** 
   - Bash wrapper for Linux/macOS

3. **`tools/generate-skin.ps1`**
   - PowerShell wrapper for Windows

4. **`docs/guides/skin-template-generator.md`** (800+ lines)
   - Complete user guide
   - Usage examples
   - Troubleshooting
   - Best practices

5. **`tools/README.md`**
   - Tools directory documentation

6. **`task-reports/task-7.4-skin-generator-report.md`**
   - Detailed completion report

## Quick Start

### Generate a Minimal Skin

```bash
node tools/generate-skin-template.js my-skin
```

This creates:
```
my-skin/
├── README.md
├── universe.view          # Main entry point
├── theme.view             # Macro definitions
├── background.view        # Background component
├── loading.view           # Loading screen
└── pages/
    └── home.view          # Home page
```

### Generate an Advanced Skin

```bash
node tools/generate-skin-template.js my-skin --type=advanced
```

This creates a complete skin with:
- OSD system (7 files)
- Playdecks (2 files)
- Popups (3 files)
- Multiple pages (3 files)
- Components (1 file)
- Plus all minimal files

### Customize Colors

```bash
node tools/generate-skin-template.js my-skin \
  --color-primary=#ff0000 \
  --color-secondary=#cc0000 \
  --color-accent=#ffcccc
```

## Key Features

✅ **Automated Creation**: No manual file creation needed  
✅ **Proper Structure**: Follows Movian architecture best practices  
✅ **Two Templates**: Minimal (learning) and Advanced (production)  
✅ **Color Customization**: Set colors via CLI  
✅ **Cross-Platform**: Works on Windows, Linux, macOS  
✅ **Error Handling**: Validates inputs and prevents overwrites  
✅ **Documentation**: Comprehensive guide included  

## Installation Workflow

1. **Generate skin**:
   ```bash
   node tools/generate-skin-template.js my-skin
   ```

2. **Customize** (optional):
   - Edit colors in `universe.view`
   - Add macros in `theme.view`
   - Create new pages

3. **Copy to Movian**:
   ```bash
   # Linux
   cp -r generated-skins/my-skin ~/.hts/movian/skins/
   
   # macOS
   cp -r generated-skins/my-skin ~/Library/Application\ Support/Movian/skins/
   
   # Windows
   Copy-Item -Recurse generated-skins\my-skin $env:APPDATA\Movian\skins\
   ```

4. **Select in Movian**:
   - Settings → User Interface → Skin → Select your skin

## Template Comparison

| Feature | Minimal | Advanced |
|---------|---------|----------|
| Files | 6 | 21 |
| Pages | 1 (home) | 3 (home, directory, video) |
| OSD | ❌ | ✅ (7 files) |
| Playdecks | ❌ | ✅ (2 files) |
| Popups | ❌ | ✅ (3 files) |
| Components | ❌ | ✅ (1 file) |
| Best For | Learning | Production |

## Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `<skin-name>` | Name of skin (required) | - |
| `--type=TYPE` | `minimal` or `advanced` | `minimal` |
| `--output=PATH` | Output directory | `./generated-skins` |
| `--color-primary=COLOR` | Primary color (hex) | `#4192ff` |
| `--color-secondary=COLOR` | Secondary color (hex) | `#306cbe` |
| `--color-accent=COLOR` | Accent color (hex) | `#c2ddff` |
| `--help`, `-h` | Show help | - |

## Examples

### Example 1: Quick Start
```bash
node tools/generate-skin-template.js my-first-skin
```

### Example 2: Dark Theme
```bash
node tools/generate-skin-template.js dark-theme \
  --color-primary=#bb86fc \
  --color-secondary=#3700b3 \
  --color-accent=#cf6679
```

### Example 3: Production Skin
```bash
node tools/generate-skin-template.js production-skin --type=advanced
```

### Example 4: Direct to Movian
```bash
node tools/generate-skin-template.js my-skin \
  --output=~/.hts/movian/skins/
```

## What Gets Generated

### universe.view
- Global configuration (`$ui` variables)
- Color scheme
- Event handlers
- Global styles
- Component loading system
- Navigation system
- Volume overlay
- Notification system

### theme.view
Essential macros:
- `ListItemBevel()` - Shadow effects
- `ListItemHighlight()` - Hover/focus
- `BackButton()` - Navigation
- `PageHeader()` - Headers

Advanced adds:
- `GridItemBevel()` - Grid shadows
- `ScrollBar()` - Scrollbars
- `SearchBar()` - Search UI
- `SIDEBAR_ACTION()` - Sidebar items
- `OSD_SETTINGS_MENU()` - Settings pages

### Other Files
- `background.view` - Gradient background
- `loading.view` - Loading spinner
- `pages/home.view` - Basic home page
- `README.md` - Installation guide

## Testing

All features tested and working:
- ✅ Minimal skin generation
- ✅ Advanced skin generation
- ✅ Color customization
- ✅ Custom output directory
- ✅ Error handling
- ✅ Help system
- ✅ Shell wrappers

## Documentation

Complete documentation available at:
- **User Guide**: `docs/guides/skin-template-generator.md`
- **Task Report**: `task-reports/task-7.4-skin-generator-report.md`
- **Tools README**: `tools/README.md`

## Next Steps

1. Try generating a skin
2. Customize it
3. Test in Movian
4. Share your creation!

## Support

For issues or questions:
1. Check the user guide
2. Review the troubleshooting section
3. Examine generated README.md files
4. Study the example skins

## License

Part of the Movian documentation project. Provided as-is for use with Movian.
