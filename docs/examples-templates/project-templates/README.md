# Project Templates

Complete starter templates for common Movian development scenarios. Each template provides a fully functional starting point that you can customize for your specific needs.

## Available Templates

### 1. Basic Plugin
**Path**: `basic-plugin/`

A minimal plugin template for learning and quick prototyping.

**Features**:
- Simple service registration
- Basic page routing
- Logging setup
- Clean code structure

**Best For**:
- Learning Movian plugin development
- Quick prototypes
- Simple utilities
- Testing ideas

**Quick Start**:
```bash
cp -r basic-plugin/ ~/my-plugin/
cd ~/my-plugin/
# Edit plugin.json and main.js
cp -r ~/my-plugin/ ~/.movian/plugins/
```

---

### 2. Content Provider
**Path**: `content-provider/`

Complete template for media content provider plugins.

**Features**:
- HTTP API integration
- JSON/HTML parsing
- Media item presentation
- Search functionality
- Pagination support
- Caching strategy
- Settings integration

**Best For**:
- Video streaming services
- Podcast aggregators
- Music libraries
- News feeds
- Any REST API integration

**Quick Start**:
```bash
cp -r content-provider/ ~/my-content-plugin/
cd ~/my-content-plugin/
# Configure API in api.js
# Update parser.js for your data format
# Edit plugin.json
cp -r ~/my-content-plugin/ ~/.movian/plugins/
```

---

### 3. Search Service
**Path**: `search-service/`

Template for creating search integration plugins.

**Features**:
- Search service registration
- Query handling
- Result formatting
- Debouncing
- Result caching

**Best For**:
- Search engines
- Content discovery
- Metadata lookup
- Cross-service search

**Coming Soon**

---

### 4. Settings Plugin
**Path**: `settings-plugin/`

Template demonstrating comprehensive settings management.

**Features**:
- Multiple setting types
- Settings validation
- Default values
- Settings UI
- Persistent storage

**Best For**:
- Configuration-heavy plugins
- User preferences
- API key management
- Feature toggles

**Coming Soon**

---

### 5. UI Extension
**Path**: `ui-extension/`

Template for plugins that add custom UI elements.

**Features**:
- Custom view files
- UI component integration
- Theme compatibility
- Responsive layouts

**Best For**:
- Custom navigation pages
- Dashboard widgets
- Information displays
- Interactive tools

**Coming Soon**

---

### 6. Minimal Skin
**Path**: `minimal-skin/`

Basic skin template with essential components.

**Features**:
- Universe.view structure
- Theme.view macros
- Basic pages
- Navigation system

**Best For**:
- Learning skin development
- Custom themes
- UI experiments
- Minimal interfaces

**See Also**: `docs/ui/theming/examples/minimal-skin/`

---

## Template Structure

Each template includes:

```
template-name/
├── README.md           # Detailed documentation
├── plugin.json         # Plugin manifest
├── main.js            # Main plugin code
├── [additional files] # Template-specific files
└── logo.png           # Plugin icon (optional)
```

## Customization Guide

### 1. Update Plugin Identity

Edit `plugin.json`:
```json
{
  "id": "com.yourname.yourplugin",
  "title": "Your Plugin Name",
  "description": "What your plugin does",
  "author": "Your Name",
  "homepage": "https://your-website.com"
}
```

### 2. Modify Functionality

Edit `main.js`:
- Change PREFIX constant
- Update service registration
- Modify route handlers
- Add your logic

### 3. Add Settings

In `plugin.json`:
```json
{
  "settings": [
    {
      "id": "settingName",
      "title": "Setting Title",
      "type": "string|bool|integer|multiopt",
      "defaultValue": "default"
    }
  ]
}
```

Access in code:
```javascript
var value = store.settingName;
```

### 4. Add Resources

- `logo.png` - Plugin icon (256x256 recommended)
- Additional `.js` files for modules
- `.view` files for custom UI
- Images, fonts, etc.

## Development Workflow

### 1. Choose Template
Select the template that best matches your needs.

### 2. Copy and Rename
```bash
cp -r template-name/ ~/my-plugin-name/
cd ~/my-plugin-name/
```

### 3. Customize
- Edit plugin.json
- Modify main.js
- Add your functionality
- Update README.md

### 4. Test Locally
```bash
# Create symlink for development
ln -s ~/my-plugin-name/ ~/.movian/plugins/my-plugin-name

# Or copy
cp -r ~/my-plugin-name/ ~/.movian/plugins/
```

### 5. Debug
- Enable plugin in Movian settings
- Check logs (Ctrl+D in Movian)
- Test all features
- Fix issues

### 6. Package
```bash
# Create distribution package
cd ~/my-plugin-name/
zip -r my-plugin-v1.0.0.zip . -x "*.git*" "node_modules/*"
```

## Testing Templates

### Validate Plugin Structure
```bash
cd docs/tests
node plugin-integration-tests.js
```

### Check Code Quality
```javascript
// Add to your plugin for debugging
console.log("Plugin loaded:", plugin.getDescriptor().version);
console.log("Settings:", JSON.stringify(store));
```

### Test in Movian
1. Install plugin
2. Enable in settings
3. Check service appears
4. Test navigation
5. Verify functionality

## Common Customizations

### Add HTTP Requests
```javascript
var response = http.request(url, {
  method: 'GET',
  headers: { 'User-Agent': 'Movian Plugin' }
});
var data = JSON.parse(response.toString());
```

### Add Search
```javascript
searcher.create(PLUGIN_NAME, logo, function(page, query) {
  // Handle search
  page.redirect(PREFIX + ":search:" + query);
});
```

### Add Persistent Storage
```javascript
// Save data
store.myData = JSON.stringify(data);

// Load data
var data = JSON.parse(store.myData || "{}");
```

### Add Custom Pages
```javascript
new page.Route(PREFIX + ":mypage$", function(page) {
  page.type = "directory";
  page.metadata.title = "My Page";
  // Add content
});
```

## Troubleshooting

### Plugin Doesn't Load
- Check plugin.json syntax (use JSON validator)
- Verify file permissions
- Check Movian logs for errors
- Ensure all required files exist

### Service Doesn't Appear
- Verify service.create() call
- Check PREFIX matches route pattern
- Ensure logo file exists
- Restart Movian

### Routes Don't Work
- Check route pattern syntax
- Verify PREFIX constant
- Test with console.log()
- Check for JavaScript errors

### Settings Don't Save
- Verify setting IDs in plugin.json
- Check store access in code
- Ensure proper data types
- Test with simple values

## Best Practices

1. **Start Simple**: Begin with basic-plugin template
2. **Test Often**: Test after each change
3. **Use Logging**: Add console.log() for debugging
4. **Handle Errors**: Use try-catch blocks
5. **Document Code**: Add comments for clarity
6. **Version Control**: Use git for your plugin
7. **Follow Conventions**: Match existing plugin patterns

## Resources

- **Plugin API**: `docs/reference/api-index.md`
- **Best Practices**: `docs/plugins/best-practices.md`
- **Examples**: `docs/plugins/examples/`
- **Troubleshooting**: `docs/reference/troubleshooting.md`
- **UI Components**: `docs/examples-templates/ui-components/`

## Contributing Templates

To contribute a new template:

1. Create template directory
2. Include all necessary files
3. Write comprehensive README.md
4. Add usage examples
5. Test thoroughly
6. Submit pull request

## Support

For help with templates:
- Check template README.md
- Review example plugins
- See troubleshooting guide
- Check Movian documentation
