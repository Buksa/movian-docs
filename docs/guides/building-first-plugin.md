# Building Your First Plugin

Step-by-step tutorial for creating your first Movian plugin.

## Overview

This tutorial will guide you through creating a simple content provider plugin that displays a list of videos.

## Prerequisites

- Movian installed
- Text editor
- Basic JavaScript knowledge

## Step 1: Create Plugin Directory

```bash
mkdir my-first-plugin
cd my-first-plugin
```

## Step 2: Create plugin.json

```json
{
    "id": "my.first.plugin",
    "version": "1.0.0",
    "apiversion": 2,
    "title": "My First Plugin",
    "synopsis": "A simple video content plugin",
    "description": "This plugin demonstrates basic Movian plugin functionality",
    "author": "Your Name",
    "homepage": "https://github.com/yourusername/my-first-plugin",
    "icon": "logo.png",
    "type": "javascript",
    "file": "plugin.js"
}
```

**Important**: The `"apiversion": 2` field enables modern API v2 modules.

## Step 3: Create plugin.js

```javascript
/**
 * My First Plugin
 * A simple content provider
 */

// Import required modules (API v2)
var service = require('movian/service');
var page = require('movian/page');
var http = require('movian/http');

// Register service (adds to main menu)
// Note: Plugin is a global object, no need to require it
service.create("My Service", "myfirst:start", "video", true, 
               Plugin.path + "logo.png");

// Handle page requests
new page.Route("^myfirst:(.*)$", function(page, action) {
    page.type = "directory";
    page.metadata.title = "My First Plugin";
    page.metadata.icon = Plugin.path + "logo.png";
    
    // Add some sample items
    page.appendItem("video", "Sample Video 1", {
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        icon: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        description: "Big Buck Bunny sample video"
    });
    
    page.appendItem("video", "Sample Video 2", {
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        icon: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
        description: "Elephants Dream sample video"
    });
    
    page.loading = false;
});
```

## Step 4: Add Logo

Create or download a `logo.png` file (256x256 pixels recommended).

## Step 5: Install Plugin

### Method 1: Development Mode

```bash
# Copy to Movian plugins directory
cp -r my-first-plugin ~/.movian/plugins/
```

### Method 2: ZIP Package

```bash
# Create ZIP file
zip -r my-first-plugin.zip my-first-plugin/

# Install via Movian UI
# Settings > Plugins > Install from ZIP
```

## Step 6: Test Plugin

1. Start Movian
2. Navigate to "My Service" in the main menu
3. You should see two sample videos
4. Click on a video to play it

## Next Steps

### Add Settings

```javascript
var settings = require('movian/settings');

// Note: Plugin is a global object
var mySettings = new settings.globalSettings('My Plugin Settings', 
    Plugin.path + 'logo.png', 'Configuration');

mySettings.createString('apiKey', 'API Key', '', function(v) {
    // Handle API key change
});
```

### Fetch Real Data

```javascript
var http = require('movian/http');

new page.Route("^myfirst:browse$", function(page) {
    page.type = "directory";
    page.metadata.title = "Browse Videos";
    page.loading = true;
    
    try {
        var response = http.request('https://api.example.com/videos', {
            method: 'GET'
        });
        
        var data = JSON.parse(response.toString());
        
        data.videos.forEach(function(video) {
            page.appendItem("video", video.title, {
                url: video.url,
                icon: video.thumbnail,
                description: video.description
            });
        });
    } catch (err) {
        page.error("Failed to load: " + err);
    } finally {
        page.loading = false;
    }
});
```

### Add Search

```javascript
var page = require('movian/page');
var http = require('movian/http');

new page.Route("^myfirst:search:(.*)$", function(page, query) {
    page.type = "directory";
    page.metadata.title = "Search: " + query;
    page.loading = true;
    
    try {
        var response = http.request('https://api.example.com/search?q=' + encodeURIComponent(query));
        var results = JSON.parse(response.toString());
        
        results.forEach(function(video) {
            page.appendItem("video", video.title, {
                url: video.url,
                icon: video.thumbnail
            });
        });
    } catch (err) {
        page.error("Search failed: " + err);
    } finally {
        page.loading = false;
    }
});
```

## Troubleshooting

### Plugin Not Appearing

- Check plugin.json syntax
- Verify file paths
- Check Movian logs

### Videos Not Playing

- Verify video URLs
- Check network connectivity
- Test URLs in browser

### JavaScript Errors

- Enable debug mode: `movian --debug-ecmascript`
- Check console output
- Verify syntax

## See Also

- [Plugin Architecture](../plugins/architecture.md)
- [API Reference](../plugins/api/README.md)
- [Best Practices](../plugins/best-practices.md)
- [Example Plugins](../plugins/examples/)
