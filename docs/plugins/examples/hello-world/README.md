# Hello World Plugin Example

A comprehensive example plugin demonstrating Movian [API](../../../reference/glossary.md#api-application-programming-interface) 2 (ECMAScript) features.

## Overview

This plugin showcases the fundamental concepts of Movian plugin development using the modern [API](../../../reference/glossary.md#api-application-programming-interface) 2:

- **Service Creation**: How to register your plugin in Movian's interface
- **Page Routing**: Handling different URLs and navigation
- **Settings Management**: Creating user-configurable options
- **Content Management**: Adding items to pages
- **Asynchronous Loading**: Loading content dynamically

## Features Demonstrated

### 🔧 Plugin Configuration
- Modern `plugin.json` with [API](../../../reference/glossary.md#api-application-programming-interface) version 2
- Proper metadata and categorization
- Icon and branding setup

### 🎛️ Settings System
- Global plugin settings
- Different setting types (string, boolean, integer)
- Setting change callbacks
- User preference persistence

### 🧭 Navigation and Routing
- Multiple page routes
- URL parameter handling
- Page metadata management
- Hierarchical navigation

### 📄 Content Management
- Static content items
- Dynamic content generation
- Different item types (directory, video, separator)
- Item metadata and icons

### ⚡ Asynchronous Features
- Async content loading
- Pagination with `asyncPaginator`
- Loading states and progress
- Dynamic content updates

## File Structure

```
hello-world/
├── plugin.json          # Plugin manifest (API 2)
├── main.js              # Main plugin implementation
├── logo.png             # Plugin icon (optional)
└── README.md            # This documentation
```

## Installation

1. Copy the entire `hello-world` directory to your Movian plugins folder:
   - **Linux**: `~/.movian/plugins/`
   - **Windows**: `%APPDATA%\Movian\plugins\`
   - **macOS**: `~/Library/Application Support/Movian/plugins/`

2. Restart Movian or reload plugins

3. The plugin will appear in the main menu as "Hello World"

## Code Walkthrough

### Plugin Manifest (plugin.json)

```json
{
  "type": "ecmascript",
  "apiversion": 2,
  "id": "hello-world-example",
  "file": "main.js"
}
```

Key points:
- `apiversion: 2` enables modern ECMAScript features
- `type: "ecmascript"` specifies JavaScript plugin
- `id` must be unique across all plugins

### Module Imports

```javascript
var page = require('movian/page');
var service = require('movian/service');
var settings = require('movian/settings');
```

API 2 uses CommonJS-style module imports for better organization.

### Service Registration

```javascript
service.create("Hello World", PLUGIN_PREFIX + ":start", "video", true, "logo.png");
```

Creates the main entry point in Movian's interface.

### Page Routing

```javascript
new page.Route(PLUGIN_PREFIX + ':start', function(page) {
    page.type = "directory";
    page.metadata.title = "Hello World Plugin";
    // ... page content
});
```

Modern routing system with clean URL patterns.

### Settings Management

```javascript
settings.createString("username", "Your Name", "Anonymous", function(value) {
    console.log("Username changed to: " + value);
});
```

Reactive settings with immediate callback execution.

### Asynchronous Loading

```javascript
page.asyncPaginator = loadMoreItems;
```

Built-in support for infinite scrolling and dynamic content.

## Compatibility

- **Movian Version**: 5.0+
- **API Version**: 2 (ECMAScript)
- **Platforms**: All supported Movian platforms

## Extending This Example

### Adding HTTP Requests

```javascript
var http = require('movian/http');

var response = http.request('https://api.example.com/data');
var data = JSON.parse(response.toString());
```

### Adding Storage

```javascript
var store = require('movian/store');
var storage = store.create('my-plugin-data');

storage.myKey = "some value";
var value = storage.myKey;
```

### Adding Custom Views

Create `.view` files for custom UI layouts:

```javascript
// In your plugin directory: views/custom.view
widget(container_y, {
    widget(label, {
        caption: "Custom UI Element";
        align: center;
    });
});
```

## Best Practices Demonstrated

1. **Consistent Naming**: Use a plugin prefix for all routes
2. **Error Handling**: Graceful fallbacks for missing data
3. **User Feedback**: Clear titles and descriptions
4. **Performance**: Efficient async loading patterns
5. **Modularity**: Clean separation of concerns

## Troubleshooting

### Plugin Not Loading
- Check `plugin.json` syntax with a JSON validator
- Ensure `apiversion: 2` is specified
- Verify file paths are correct

### JavaScript Errors
- Check Movian's log output for error messages
- Use `console.log()` for debugging
- Ensure all required modules are imported

### Settings Not Saving
- Settings are automatically persisted by Movian
- Check setting names don't conflict with other plugins
- Verify callback functions are properly defined

## Related Documentation

- [Plugin Development Guide](../../README.md)
- [API Reference](../../api/README.md)
- [Settings API](../../api/settings-api.md)
- [Page API](../../api/page-api.md)

## License

This example is provided as documentation and may be freely used and modified.