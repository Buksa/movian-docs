# Configurable Plugin Example

This example demonstrates comprehensive settings and configuration management in Movian plugins, showcasing all available setting types, persistent storage patterns, and configuration best practices.

## Features Demonstrated

### Settings Types
- **Boolean Settings** - Feature toggles and preferences
- **String Settings** - URLs, API keys, and text configuration
- **Integer Settings** - Numeric values with validation and units
- **Multi-Option Settings** - Dropdown selections with multiple choices
- **Action Settings** - Buttons that trigger functions
- **UI Elements** - Dividers and information displays

### Storage Systems
- **Global Settings** - Plugin-wide configuration in Movian settings
- **Store API** - File-based persistent storage for user data
- **KVStore API** - URL-scoped key-value storage
- **Session Settings** - Temporary settings that don't persist

### Configuration Patterns
- **Centralized Configuration** - Single config object pattern
- **User Data Management** - Favorites, watch history, statistics
- **Page-specific Settings** - URL-scoped configuration
- **Settings Validation** - Input validation and error handling
- **Migration Support** - Configuration versioning and updates

## Installation

1. Copy the entire `configurable-plugin` directory to your Movian plugins folder
2. Restart Movian or reload plugins
3. The plugin will appear in your video sources as "Configurable Plugin Example"

## Usage

### Accessing Settings

1. Go to Movian Settings → Applications → "Configurable Plugin Example"
2. Explore the different setting types and sections:
   - **API Configuration** - Server settings and connection parameters
   - **Features** - Toggle various plugin features
   - **User Preferences** - Quality, language, and theme settings
   - **Advanced Settings** - Cache and update configurations
   - **Actions** - Buttons to perform various operations

### Testing Features

1. Launch the plugin from your video sources
2. View current configuration and user statistics
3. Use the demo actions to test:
   - Adding items to favorites
   - Marking items as watched
   - Page-specific settings

### Configuration Examples

The plugin demonstrates several configuration patterns:

#### Global Plugin Settings
```javascript
// Create global settings group
settings.globalSettings(plugin.id, plugin.title, Plugin.path + plugin.icon, plugin.synopsis);

// Boolean setting with callback
var cacheSetting = settings.createBool('enableCache', 'Enable Caching', true, function(value) {
    config.enableCache = value;
    if (!value) clearCache();
});

// Multi-option setting
var qualitySetting = settings.createMultiOpt('defaultQuality', 'Default Video Quality', [
    ['480p', '480p (SD)', false],
    ['720p', '720p (HD)', true],      // Default option
    ['1080p', '1080p (Full HD)', false]
], function(value) {
    config.defaultQuality = value;
});
```

#### Persistent User Data
```javascript
// Create persistent store
var userStore = store.create('userdata');

// Initialize data structure
userStore.favorites = userStore.favorites || [];
userStore.watchHistory = userStore.watchHistory || {};

// Helper functions
function addToFavorites(itemId, itemTitle) {
    if (userStore.favorites.indexOf(itemId) === -1) {
        userStore.favorites.push(itemId);
    }
}

function markAsWatched(itemId, position, duration) {
    userStore.watchHistory[itemId] = {
        position: position,
        duration: duration,
        timestamp: new Date().toISOString(),
        completed: position / duration > 0.9
    };
}
```

#### URL-Scoped Settings
```javascript
// Create page-specific settings using kvstore
function createPageSettings(pageUrl) {
    var kvstore = require('native/kvstore');
    
    return {
        get: function(key, defaultValue, type) {
            if (type === 'string') {
                return kvstore.getString(pageUrl, 'plugin', key) || defaultValue;
            } else if (type === 'bool') {
                return kvstore.getBoolean(pageUrl, 'plugin', key, defaultValue);
            }
        },
        
        set: function(key, value) {
            kvstore.set(pageUrl, 'plugin', key, value);
        }
    };
}

// Usage
var pageSettings = createPageSettings('demo://page:settings');
pageSettings.set('viewMode', 'grid');
var viewMode = pageSettings.get('viewMode', 'list');
```

## File Structure

```
configurable-plugin/
├── plugin.json          # Plugin manifest
├── main.js              # Main plugin code with all examples
├── README.md            # This documentation
└── logo.png             # Plugin icon (optional)
```

## Key Learning Points

### 1. Settings Architecture
- Use `settings.globalSettings()` for plugin-wide configuration
- Organize settings into logical sections with `createDivider()`
- Provide informational context with `createInfo()`
- Use appropriate setting types for different data

### 2. Data Persistence
- **Store API** for user data (favorites, history, preferences)
- **KVStore API** for URL-scoped or service-specific settings
- **Settings callbacks** for real-time configuration updates
- **Session-only settings** for temporary debugging options

### 3. Configuration Management
- Centralize configuration in a single object
- Use setting callbacks to update configuration in real-time
- Implement validation in setting callbacks
- Provide reset and export functionality

### 4. User Experience
- Group related settings with dividers
- Provide clear titles and descriptions
- Use appropriate units and ranges for numeric settings
- Implement action buttons for common operations

### 5. Error Handling
- Validate user input in setting callbacks
- Provide graceful fallbacks for storage errors
- Use try-catch blocks for critical operations
- Log errors appropriately for debugging

## Advanced Patterns

### Configuration Migration
```javascript
// Check and migrate configuration version
var configVersion = store.version || 1;

if (configVersion < 2) {
    // Migrate from version 1 to 2
    if (store.oldApiUrl) {
        store.apiUrl = store.oldApiUrl;
        delete store.oldApiUrl;
    }
    store.version = 2;
}
```

### Settings Validation
```javascript
var apiUrl = settings.createString('apiUrl', 'API URL', 'https://api.example.com', 
    function(value) {
        try {
            new URL(value);  // Validate URL format
            config.apiUrl = value;
        } catch (e) {
            console.error('Invalid URL format:', value);
        }
    }
);
```

### Conditional Settings
```javascript
// Enable/disable settings based on other settings
var advancedMode = settings.createBool('advancedMode', 'Advanced Mode', false, 
    function(value) {
        config.advancedMode = value;
        // Enable/disable other settings
        debugSetting.enabled = value;
        cacheSizeSetting.enabled = value;
    }
);
```

## Related Documentation

- [Settings API Reference](../../api/settings-api.md) - Complete API documentation
- [Plugin Development Guide](../../getting-started.md) - Basic plugin development
- [Storage Best Practices](../../best-practices.md) - Data storage recommendations
- [Property System](../../advanced/properties.md) - Advanced property binding

## Troubleshooting

### Settings Not Persisting
- Check that `persistent` parameter is `true` (default)
- Verify plugin has write permissions to storage directory
- Check console for storage-related errors

### Store Data Lost
- Ensure proper error handling around store operations
- Check that store path is writable
- Verify JSON serialization compatibility of stored data

### KVStore Issues
- Verify URL format is consistent
- Check domain parameter is correct ('plugin', 'sys', etc.)
- Ensure key names don't contain special characters

This example provides a comprehensive foundation for implementing settings and configuration management in your own Movian plugins.