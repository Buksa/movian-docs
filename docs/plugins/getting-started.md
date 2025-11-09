# Getting Started with Movian Plugins

This guide will help you create your first Movian plugin and understand the basics of plugin development.

## Prerequisites

Before you start developing plugins, make sure you have:

- Movian installed on your system
- Basic knowledge of JavaScript
- A text editor or IDE
- Understanding of JSON format

## Plugin Basics

A Movian plugin is a JavaScript application that extends Movian's functionality. Plugins can:

- Add new content sources
- Provide search capabilities
- Create custom UI pages
- Integrate with external services
- Add settings and configuration options

## Your First Plugin

### 1. Create Plugin Directory

Create a new directory for your plugin:

```
my-first-plugin/
├── plugin.json
└── main.js
```

### 2. Create plugin.json

The `plugin.json` file is the manifest that describes your plugin:

```json
{
  "id": "com.example.myfirstplugin",
  "version": "1.0.0",
  "apiversion": 2,
  "title": "My First Plugin",
  "synopsis": "A simple example plugin",
  "description": "This is my first Movian plugin",
  "author": "Your Name",
  "homepage": "https://example.com",
  "type": "javascript",
  "file": "main.js"
}
```

**Note**: The `"apiversion": 2` field is required for using modern API v2 modules.

### 3. Create main.js

The main JavaScript file contains your plugin logic:

```javascript
// Import required modules
var service = require('movian/service');
var page = require('movian/page');

// Create service (adds to main menu)
// Note: Plugin is a global object, no need to require it
service.create("My First Plugin", "myfirstplugin:start", "video", true, 
  Plugin.path + "icon.png");

// Route handler
new page.Route("myfirstplugin:start", function(page) {
  page.type = "directory";
  page.contents = "items";
  page.metadata.title = "My First Plugin";
  
  page.appendItem("", "separator", {
    title: "Welcome to My First Plugin!"
  });
  
  page.appendItem("", "label", {
    title: "This is a simple example plugin"
  });
  
  page.loading = false;
});
```

### 4. Install Your Plugin

1. Copy your plugin directory to Movian's plugin folder:
   - **Linux**: `~/.hts/movian/plugins/`
   - **Windows**: `%APPDATA%\Movian\plugins\`
   - **macOS**: `~/Library/Application Support/Movian/plugins/`

2. Restart Movian

3. Your plugin should appear in the plugins list

## Next Steps

Now that you've created your first plugin, explore these topics:

- [Plugin Architecture](architecture.md) - Understand how plugins work
- [API Reference](api/core-api.md) - Learn about available APIs
- [Examples](examples/hello-world/README.md) - Study working examples
- [Best Practices](best-practices.md) - Write better plugins

## Common Tasks

### Adding a Settings Page

```javascript
var settings = require('movian/settings');

// Note: Plugin is a global object
var mySettings = new settings.globalSettings("My Plugin Settings", 
  Plugin.path + "icon.png", "My Plugin Configuration");

mySettings.createString("apikey", "API Key", "", function(v) {
  // Handle setting change
});
```

### Making HTTP Requests

```javascript
var http = require('movian/http');

var response = http.request("https://api.example.com/data", {
  method: "GET",
  headers: {
    "User-Agent": "Movian Plugin"
  }
});

var data = JSON.parse(response.toString());
```

### Creating Pages

```javascript
var page = require('movian/page');

new page.Route("myplugin:page:(.*)", function(page, id) {
  page.type = "directory";
  page.metadata.title = "Page " + id;
  
  // Add content to page
  page.appendItem("myplugin:item:" + id, "video", {
    title: "Video Item",
    icon: "http://example.com/icon.png"
  });
  
  page.loading = false;
});
```

## Troubleshooting

### Plugin Not Appearing

- Check that `plugin.json` is valid JSON
- Verify the plugin ID is unique
- Check Movian logs for errors

### JavaScript Errors

- Use `console.log()` for debugging
- Check the Movian log file
- Verify all required fields in plugin.json

### API Not Working

- Ensure you're using the correct API methods
- Check API documentation for parameter requirements
- Verify network connectivity for HTTP requests

## Resources

- [Complete API Reference](api/core-api.md)
- [Plugin Examples](examples/)
- [Community Plugins](https://github.com/topics/movian-plugin)
- [Movian Forum](https://movian.tv/forum)

## See Also

- [Plugin Architecture](architecture.md)
- [HTTP & Networking](api/http-api.md)
- [Page API](api/page-api.md)
- [Settings API](api/settings-api.md)
