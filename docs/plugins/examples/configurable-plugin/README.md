# Configurable Plugin Example

This plugin demonstrates comprehensive settings and configuration management for Movian plugins, showcasing all available setting types and advanced configuration patterns.

## Features Demonstrated

### 🔧 Setting Types
- **String Settings**: Text input fields with validation
- **Boolean Settings**: Toggle switches for on/off options
- **Integer Settings**: Numeric inputs with min/max ranges and units
- **Multi-Option Settings**: Dropdown selections with predefined choices
- **Action Settings**: Buttons that trigger specific functions

### ⚙️ Configuration Categories
- **Basic Configuration**: Core plugin settings
- **Network Configuration**: API endpoints and connection settings
- **Content Preferences**: User content and quality preferences
- **Display Options**: UI customization settings
- **Cache Configuration**: Performance and storage settings
- **Advanced Options**: Experimental and developer features

### 🔄 Dynamic Behavior
- **Settings Callbacks**: Real-time response to setting changes
- **Conditional Logic**: Settings that affect plugin behavior
- **Validation**: Input validation and error handling
- **Persistence**: Automatic settings storage and retrieval

## Technical Implementation

### Settings Structure

```javascript
// Global settings initialization
settings.globalSettings(PLUGIN_PREFIX, "Configurable Plugin", "logo.png", "Plugin Configuration");

// Setting creation with callbacks
settings.createString("apiKey", "API Key", "", function(value) {
    console.log("API key " + (value ? "configured" : "cleared"));
    storage.apiKey = value;
});

settings.createBool("enablePlugin", "Enable Plugin", true, function(value) {
    storage.enabled = value;
    if (!value) {
        console.log("Plugin functionality disabled by user");
    }
});
```

### Multi-Option Settings

```javascript
settings.createMultiOpt("contentType", "Preferred Content Type", [
    ["movies", "Movies"],
    ["tvshows", "TV Shows"], 
    ["music", "Music"],
    ["all", "All Content"]
], "all", function(value) {
    storage.contentType = value;
});
```

### Integer Settings with Validation

```javascript
settings.createInt("requestTimeout", "Request Timeout (seconds)", 30, 5, 300, 5, "sec", function(value) {
    storage.requestTimeout = value;
});
```

### Action Settings

```javascript
settings.createAction("clearCache", "Clear Cache", function() {
    clearCache();
    console.log("Cache cleared successfully");
});

settings.createAction("testConnection", "Test API Connection", function() {
    testApiConnection();
});
```

## Configuration Categories

### Basic Configuration
- **Plugin Display Name**: Customizable plugin title
- **Enable Plugin**: Master on/off switch
- **Enable Debug Logging**: Development and troubleshooting mode

### Network Configuration
- **API Endpoint URL**: Configurable service endpoint
- **API Key**: Secure authentication credential storage
- **Request Timeout**: Connection timeout settings
- **Max Retry Attempts**: Error recovery configuration

### Content Preferences
- **Preferred Content Type**: Movies, TV Shows, Music, or All
- **Preferred Video Quality**: 480p, 720p, 1080p, 4K, or Auto
- **Preferred Language**: Multi-language support

### Display Options
- **Items Per Page**: Pagination configuration
- **Show Thumbnails**: Toggle image display
- **Show Ratings**: Toggle rating information
- **Show Descriptions**: Toggle detailed descriptions

### Cache Configuration
- **Enable Caching**: Performance optimization toggle
- **Cache Size**: Memory usage limits
- **Cache Expiry**: Data freshness settings

### Advanced Options
- **Enable Experimental Features**: Beta functionality access
- **Custom User Agent**: HTTP request customization
- **Log Level**: Debugging verbosity control

## Settings Integration Patterns

### HTTP Request Configuration

```javascript
function makeRequest(url, options) {
    var requestOptions = {
        timeout: (storage.requestTimeout || 30) * 1000,
        headers: {
            'User-Agent': storage.customUserAgent || 'Movian Configurable Plugin 1.0',
            'Accept-Language': storage.language || 'en'
        }
    };
    
    if (storage.apiKey) {
        requestOptions.headers['Authorization'] = 'Bearer ' + storage.apiKey;
    }
    
    return http.request(url, requestOptions);
}
```

### Cache Management

```javascript
function getCachedData(key) {
    if (!storage.cacheEnabled) return null;
    
    var cached = storage[cacheKey];
    if (!cached) return null;
    
    var expiryTime = (storage.cacheExpiry || 24) * 60 * 60 * 1000;
    var isExpired = (Date.now() - cached.timestamp) > expiryTime;
    
    if (isExpired) {
        delete storage[cacheKey];
        return null;
    }
    
    return cached.data;
}
```

### Content Filtering

```javascript
function loadContent(page) {
    var itemsPerPage = storage.itemsPerPage || 25;
    var contentType = storage.contentType || "all";
    var showThumbnails = storage.showThumbnails !== false;
    
    // Generate content based on user preferences
    for (var i = 1; i <= itemsPerPage; i++) {
        var itemType = getItemTypeForContent(contentType, i);
        
        page.appendItem("", itemType, {
            title: getItemTitle(contentType, i),
            description: storage.showDescriptions ? getItemDescription(i) : "",
            icon: showThumbnails ? getItemThumbnail(i) : "",
            rating: storage.showRatings ? getItemRating(i) : undefined
        });
    }
}
```

## Utility Functions

### Settings Validation

```javascript
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function validateApiKey(key) {
    return key && typeof key === 'string' && key.length >= 10;
}
```

### Settings Export/Import

```javascript
function exportSettings() {
    var settingsExport = {
        pluginName: storage.displayName,
        enablePlugin: storage.enabled,
        apiEndpoint: storage.apiEndpoint,
        contentType: storage.contentType,
        videoQuality: storage.videoQuality,
        language: storage.language,
        exportDate: new Date().toISOString()
    };
    
    console.log("Settings export:");
    console.log(JSON.stringify(settingsExport, null, 2));
}
```

### Connection Testing

```javascript
function testApiConnection() {
    var endpoint = storage.apiEndpoint || "https://api.example.com";
    var timeout = (storage.requestTimeout || 30) * 1000;
    
    try {
        var requestOptions = {
            timeout: timeout,
            headers: {
                'User-Agent': storage.customUserAgent || 'Movian Configurable Plugin 1.0'
            }
        };
        
        if (storage.apiKey) {
            requestOptions.headers['Authorization'] = 'Bearer ' + storage.apiKey;
        }
        
        console.log("✓ Connection test successful");
        console.log("  - Endpoint: " + endpoint);
        console.log("  - Timeout: " + timeout + "ms");
        
    } catch (error) {
        console.error("✗ Connection test failed: " + error.message);
    }
}
```

## Plugin Structure

```
configurable-plugin/
├── plugin.json          # Plugin manifest
├── main.js             # Main plugin code with settings
├── README.md           # This documentation
└── logo.png            # Plugin icon (optional)
```

## Usage Examples

### Basic Setup

1. Install the plugin in Movian
2. Navigate to plugin settings
3. Configure basic settings:
   - Set plugin display name
   - Enable/disable plugin functionality
   - Configure API endpoint and key

### Advanced Configuration

1. Set content preferences:
   - Choose preferred content types
   - Select video quality preferences
   - Set language preferences

2. Optimize performance:
   - Enable caching for faster loading
   - Adjust cache size and expiry
   - Set appropriate timeout values

3. Customize display:
   - Configure items per page
   - Toggle thumbnails and ratings
   - Enable/disable descriptions

### Testing Configuration

1. Use "Test API Connection" action to verify network settings
2. Use "Clear Cache" action to reset cached data
3. Use "Export Settings" to backup configuration
4. Use "Reset to Defaults" to restore original settings

## Learning Objectives

After studying this example, developers will understand:

- How to create comprehensive settings interfaces
- All available Movian setting types and their usage
- Settings validation and error handling
- Dynamic behavior based on user preferences
- Settings persistence and storage management
- Action settings for utility functions
- Best practices for settings organization
- User-friendly configuration workflows

## Configuration Best Practices

1. **Logical Grouping**: Organize settings into logical sections with dividers
2. **Sensible Defaults**: Provide reasonable default values for all settings
3. **Validation**: Validate user inputs and provide feedback
4. **Documentation**: Use clear labels and descriptions
5. **Callbacks**: Respond to setting changes immediately
6. **Persistence**: Store settings in plugin storage for persistence
7. **Testing**: Provide actions to test configuration
8. **Recovery**: Offer reset options for problematic configurations

## Related Documentation

- [Settings API Reference](../../api/settings-api.md)
- [Storage API Reference](../../api/storage-api.md)
- [Plugin Best Practices](../../best-practices.md)
- [Hello World Example](../hello-world/README.md)
- [Content Provider Example](../content-provider/README.md)

## Installation

1. Copy the plugin directory to your Movian plugins folder
2. Enable the plugin in Movian settings
3. Navigate to the plugin settings to configure options
4. Explore different configuration combinations
5. Test the plugin functionality with various settings

## Compatibility

- **Movian Version**: 5.0+
- **API Version**: 2
- **Platform**: All supported Movian platforms
- **Dependencies**: None (uses only built-in Movian APIs)