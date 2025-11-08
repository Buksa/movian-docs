# Settings and Configuration Management API

## Overview

Movian provides a comprehensive settings and configuration management system that allows plugins to:

- Create user-configurable settings with automatic UI generation
- Store persistent data using key-value storage
- Manage plugin configuration with different storage backends
- Handle different data types (strings, integers, booleans, multi-options)

The system consists of three main components:

1. **Settings API** (`movian/settings`) - High-level settings creation and management
2. **Store API** (`movian/store`) - File-based persistent storage
3. **KVStore API** (`native/kvstore`) - Low-level key-value storage with URL-based scoping

## Settings API (`movian/settings`)

The settings module provides a high-level interface for creating plugin configuration interfaces that automatically appear in Movian's settings UI.

### Global Settings

Create a settings group that appears in the main Movian settings under "Applications":

```javascript
var settings = require('movian/settings');

// Create global settings group
settings.globalSettings(pluginId, title, icon, description);

// Example
settings.globalSettings('myplugin', 'My Plugin', Plugin.path + 'logo.png', 
                       'Configuration for My Plugin');
```

**Parameters:**
- `pluginId` (string) - Unique identifier for the plugin
- `title` (string) - Display name in settings UI
- `icon` (string) - Path to plugin icon
- `description` (string) - Brief description of the plugin

### URL-based Settings (kvstoreSettings)

Create settings that are scoped to a specific URL using the kvstore backend:

```javascript
// Create URL-scoped settings
var urlSettings = new settings.kvstoreSettings(nodes, url, domain);

// Example for service-specific settings
var serviceSettings = new settings.kvstoreSettings(
    page.model.nodes, 
    'myservice://config', 
    'plugin'
);
```

**Parameters:**
- `nodes` - Property nodes container for the settings
- `url` (string) - URL to scope the settings to
- `domain` (string) - Storage domain ('plugin', 'sys', etc.)

### Setting Types

#### Boolean Settings

```javascript
var boolSetting = settings.createBool(id, title, defaultValue, callback, persistent);

// Example
var enableFeature = settings.createBool('enableFeature', 'Enable Advanced Features', 
                                       false, function(value) {
    console.log('Feature enabled:', value);
    // Update plugin behavior based on setting
}, true);

// Access current value
console.log('Current value:', enableFeature.value);

// Programmatically change value
enableFeature.value = true;

// Enable/disable the setting
enableFeature.enabled = false;
```

**Parameters:**
- `id` (string) - Unique identifier for the setting
- `title` (string) - Display name in UI
- `defaultValue` (boolean) - Default value
- `callback` (function) - Called when value changes
- `persistent` (boolean) - Whether to persist the value (default: true)

#### String Settings

```javascript
var stringSetting = settings.createString(id, title, defaultValue, callback, persistent);

// Example
var apiUrl = settings.createString('apiUrl', 'API Server URL', 
                                  'https://api.example.com', function(value) {
    console.log('API URL changed to:', value);
    // Update API client configuration
}, true);
```

#### Integer Settings

```javascript
var intSetting = settings.createInt(id, title, defaultValue, min, max, step, unit, callback, persistent);

// Example
var timeout = settings.createInt('timeout', 'Request Timeout', 30, 5, 300, 5, 'seconds', 
                                function(value) {
    console.log('Timeout set to:', value, 'seconds');
}, true);
```

**Parameters:**
- `min` (number) - Minimum allowed value
- `max` (number) - Maximum allowed value  
- `step` (number) - Step size for UI controls
- `unit` (string) - Unit label for display

#### Multi-Option Settings

```javascript
var multiSetting = settings.createMultiOpt(id, title, options, callback, persistent);

// Example
var quality = settings.createMultiOpt('quality', 'Video Quality', [
    ['480', '480p', false],      // [value, display_name, is_default]
    ['720', '720p', true],       // This option is default
    ['1080', '1080p', false]
], function(selectedValue) {
    console.log('Quality selected:', selectedValue);
}, true);
```

**Options Array Format:**
- `[0]` - Internal value (string)
- `[1]` - Display name (string)  
- `[2]` - Is default option (boolean)

#### Action Settings

```javascript
var actionSetting = settings.createAction(id, title, callback);

// Example
var clearCache = settings.createAction('clearCache', 'Clear Cache', function() {
    console.log('Clearing cache...');
    // Perform cache clearing operation
});
```

### UI Elements

#### Dividers

```javascript
settings.createDivider(title);

// Example
settings.createDivider('Network Settings');
```

#### Information Displays

```javascript
settings.createInfo(id, icon, description);

// Example  
settings.createInfo('version', Plugin.path + 'logo.png', 
                   'Plugin version: ' + plugin.version + '\nAuthor: ' + plugin.author);
```

### Complete Settings Example

```javascript
var settings = require('movian/settings');
var plugin = JSON.parse(Plugin.manifest);

// Create global settings
settings.globalSettings(plugin.id, plugin.title, Plugin.path + plugin.icon, plugin.synopsis);

// Plugin information
settings.createInfo('info', Plugin.path + plugin.icon, 
                   'Plugin developed by ' + plugin.author + '\nVersion: ' + plugin.version);

// Network settings section
settings.createDivider('Network Settings');

var apiUrl = settings.createString('apiUrl', 'API Server URL', 'https://api.example.com', 
                                  function(v) { config.apiUrl = v; });

var timeout = settings.createInt('timeout', 'Request Timeout', 30, 5, 300, 5, 'seconds',
                                function(v) { config.timeout = v; });

// Feature settings section  
settings.createDivider('Features');

var enableCache = settings.createBool('enableCache', 'Enable Caching', true,
                                     function(v) { config.enableCache = v; });

var quality = settings.createMultiOpt('defaultQuality', 'Default Video Quality', [
    ['480', '480p', false],
    ['720', '720p', true], 
    ['1080', '1080p', false]
], function(v) { config.defaultQuality = v; });

// Actions section
settings.createDivider('Actions');

settings.createAction('clearCache', 'Clear Cache', function() {
    // Clear cache implementation
    console.log('Cache cleared');
});
```

## Store API (`movian/store`)

The store module provides file-based persistent storage using JSON serialization with automatic saving and loading.

### Creating Stores

#### Named Store (Automatic Path)

```javascript
var store = require('movian/store');

// Creates store at: Core.storagePath + '/store/' + name
var myStore = store.create('mydata');
```

#### Custom Path Store

```javascript
var store = require('movian/store');

// Create store at specific path
var customStore = store.createFromPath('/path/to/my/store.json');
```

### Using Stores

Stores act like JavaScript objects with automatic persistence:

```javascript
var store = require('movian/store').create('userdata');

// Set values (automatically saved after 5 second delay)
store.username = 'john_doe';
store.preferences = {
    theme: 'dark',
    language: 'en'
};
store.watchedMovies = ['movie1', 'movie2'];

// Read values
console.log('Username:', store.username);
console.log('Theme:', store.preferences.theme);

// Check if key exists
if ('username' in store) {
    console.log('User is logged in');
}

// Delete values
delete store.username;
```

### Store Features

- **Automatic Saving**: Changes are saved to disk after a 5-second delay
- **JSON Serialization**: All data is stored as JSON
- **Proxy-based**: Uses JavaScript Proxy for transparent object access
- **Finalizer**: Ensures data is saved when store is garbage collected
- **Error Handling**: Gracefully handles file read/write errors

### Store Implementation Details

```javascript
// Store object structure (internal)
var storeObject = {
    filename: '/path/to/store.json',
    keys: {},           // Actual data storage
    timer: null         // Delayed save timer
};

// Proxy handlers provide transparent access
var storeProxy = {
    get: function(obj, name) {
        return obj.keys[name];
    },
    
    set: function(obj, name, value) {
        if (obj.keys[name] === value) return;
        
        obj.keys[name] = value;
        
        // Schedule save after 5 seconds
        if (obj.timer) clearTimeout(obj.timer);
        obj.timer = setTimeout(function() {
            fs.writeFileSync(obj.filename, JSON.stringify(obj.keys));
            delete obj.timer;
        }, 5000);
    },
    
    has: function(obj, name) {
        return name in obj.keys;
    }
};
```

## KVStore API (`native/kvstore`)

The kvstore module provides low-level key-value storage with URL-based scoping and multiple storage domains.

### Storage Domains

KVStore organizes data into different domains:

- `'plugin'` - Plugin-specific data (KVSTORE_DOMAIN_PLUGIN = 3)
- `'sys'` - System-level data (KVSTORE_DOMAIN_SYS = 1)  
- `'prop'` - Property-related data (KVSTORE_DOMAIN_PROP = 2)
- `'setting'` - Settings data (KVSTORE_DOMAIN_SETTING = 4)

### Basic Operations

```javascript
var kvstore = require('native/kvstore');

// Store values
kvstore.set(url, domain, key, value);

// Retrieve values with defaults
var stringValue = kvstore.getString(url, domain, key) || defaultValue;
var intValue = kvstore.getInteger(url, domain, key, defaultValue);
var boolValue = kvstore.getBoolean(url, domain, key, defaultValue);
```

### URL-based Scoping

KVStore uses URLs to scope data, allowing different contexts to have separate storage:

```javascript
var kvstore = require('native/kvstore');

// Plugin-specific settings for different services
kvstore.set('myservice://config', 'plugin', 'apiKey', 'abc123');
kvstore.set('otherservice://config', 'plugin', 'apiKey', 'xyz789');

// Retrieve service-specific settings
var myApiKey = kvstore.getString('myservice://config', 'plugin', 'apiKey');
var otherApiKey = kvstore.getString('otherservice://config', 'plugin', 'apiKey');
```

### Data Types

#### String Storage

```javascript
// Store string
kvstore.set('myapp://config', 'plugin', 'username', 'john_doe');

// Retrieve string (returns null if not found)
var username = kvstore.getString('myapp://config', 'plugin', 'username');
if (username) {
    console.log('Username:', username);
} else {
    console.log('No username stored');
}

// With default value
var theme = kvstore.getString('myapp://config', 'plugin', 'theme') || 'default';
```

#### Integer Storage

```javascript
// Store integer
kvstore.set('myapp://config', 'plugin', 'timeout', 30);

// Retrieve with default
var timeout = kvstore.getInteger('myapp://config', 'plugin', 'timeout', 10);
console.log('Timeout:', timeout, 'seconds');
```

#### Boolean Storage

```javascript
// Store boolean
kvstore.set('myapp://config', 'plugin', 'enabled', true);

// Retrieve with default
var enabled = kvstore.getBoolean('myapp://config', 'plugin', 'enabled', false);
console.log('Feature enabled:', enabled);
```

#### Deleting Values

```javascript
// Delete by setting to undefined/null
kvstore.set('myapp://config', 'plugin', 'oldSetting', null);
```

### KVStore Integration with Settings

The settings system uses kvstore internally when using `kvstoreSettings`:

```javascript
var settings = require('movian/settings');

// This creates a kvstore-backed settings group
var pageSettings = new settings.kvstoreSettings(
    page.model.nodes,           // UI nodes container
    'myservice://page:' + pageId,  // URL scope
    'plugin'                    // Storage domain
);

// Settings created on this group will be stored in kvstore
var autoplay = pageSettings.createBool('autoplay', 'Auto-play videos', false, 
                                       function(v) { /* callback */ }, true);

// Internally this calls:
// kvstore.set('myservice://page:' + pageId, 'plugin', 'autoplay', value);
```

## Configuration Patterns and Best Practices

### Plugin Configuration Structure

```javascript
// config.js - Centralized configuration
var plugin = JSON.parse(Plugin.manifest);

var config = {
    // Static configuration
    PREFIX: plugin.id,
    LOGO: Plugin.path + plugin.icon,
    
    // Default values for settings
    apiUrl: 'https://api.example.com',
    timeout: 30,
    enableCache: true,
    quality: '720',
    
    // Runtime configuration (updated by settings)
    debug: false
};

module.exports = config;
```

```javascript
// main.js - Settings integration
var settings = require('movian/settings');
var config = require('./config');

settings.globalSettings(config.PREFIX, plugin.title, config.LOGO, plugin.synopsis);

// Create settings that update config object
settings.createString('apiUrl', 'API URL', config.apiUrl, function(v) {
    config.apiUrl = v;
});

settings.createInt('timeout', 'Timeout', config.timeout, 5, 300, 5, 'sec', function(v) {
    config.timeout = v;
});

settings.createBool('enableCache', 'Enable Cache', config.enableCache, function(v) {
    config.enableCache = v;
});
```

### User Data Storage

```javascript
// User-specific data storage
var store = require('movian/store').create('userdata');

// Store user preferences
store.favorites = store.favorites || [];
store.watchHistory = store.watchHistory || {};
store.lastLogin = new Date().toISOString();

// Helper functions
function addToFavorites(itemId) {
    if (store.favorites.indexOf(itemId) === -1) {
        store.favorites.push(itemId);
    }
}

function markAsWatched(itemId, position) {
    store.watchHistory[itemId] = {
        position: position,
        timestamp: new Date().toISOString(),
        completed: position > 0.9
    };
}
```

### Service-specific Configuration

```javascript
// Per-service configuration using kvstore
var kvstore = require('native/kvstore');

function ServiceConfig(serviceUrl) {
    this.url = serviceUrl;
    this.domain = 'plugin';
}

ServiceConfig.prototype.get = function(key, defaultValue, type) {
    type = type || 'string';
    
    if (type === 'string') {
        return kvstore.getString(this.url, this.domain, key) || defaultValue;
    } else if (type === 'int') {
        return kvstore.getInteger(this.url, this.domain, key, defaultValue);
    } else if (type === 'bool') {
        return kvstore.getBoolean(this.url, this.domain, key, defaultValue);
    }
};

ServiceConfig.prototype.set = function(key, value) {
    kvstore.set(this.url, this.domain, key, value);
};

// Usage
var movieService = new ServiceConfig('moviedb://config');
movieService.set('apiKey', 'abc123');
movieService.set('language', 'en');

var apiKey = movieService.get('apiKey');
var language = movieService.get('language', 'en');
```

### Temporary vs Persistent Settings

```javascript
// Settings with persistence control
var settings = require('movian/settings');

// Persistent setting (saved across sessions)
var persistentSetting = settings.createBool('saveLogin', 'Remember Login', false, 
                                           function(v) { config.saveLogin = v; }, 
                                           true);  // persistent = true

// Temporary setting (session only)
var tempSetting = settings.createBool('debugMode', 'Debug This Session', false,
                                     function(v) { config.debug = v; },
                                     false);  // persistent = false
```

### Migration and Versioning

```javascript
// Configuration migration example
var store = require('movian/store').create('config');

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

if (configVersion < 3) {
    // Migrate from version 2 to 3
    if (typeof store.quality === 'number') {
        store.quality = store.quality + 'p';  // Convert 720 to '720p'
    }
    store.version = 3;
}
```

## Error Handling and Validation

### Settings Validation

```javascript
// Input validation in settings callbacks
var settings = require('movian/settings');

var apiUrl = settings.createString('apiUrl', 'API URL', 'https://api.example.com', 
                                  function(value) {
    // Validate URL format
    try {
        new URL(value);  // This will throw if invalid
        config.apiUrl = value;
        console.log('API URL updated:', value);
    } catch (e) {
        console.error('Invalid URL format:', value);
        // Could show popup or reset to default
    }
});

var port = settings.createInt('port', 'Port', 8080, 1, 65535, 1, '', function(value) {
    // Validation is automatic for integers (min/max)
    config.port = value;
});
```

### Store Error Handling

```javascript
// Graceful store error handling
var store;
try {
    store = require('movian/store').create('mydata');
} catch (e) {
    console.error('Failed to create store:', e);
    // Fallback to memory-only storage
    store = {};
}

// Safe store access
function safeStoreGet(key, defaultValue) {
    try {
        return store[key] !== undefined ? store[key] : defaultValue;
    } catch (e) {
        console.error('Store read error:', e);
        return defaultValue;
    }
}

function safeStoreSet(key, value) {
    try {
        store[key] = value;
    } catch (e) {
        console.error('Store write error:', e);
    }
}
```

### KVStore Error Handling

```javascript
// Safe kvstore operations
var kvstore = require('native/kvstore');

function safeKVGet(url, domain, key, defaultValue, type) {
    try {
        if (type === 'string') {
            return kvstore.getString(url, domain, key) || defaultValue;
        } else if (type === 'int') {
            return kvstore.getInteger(url, domain, key, defaultValue);
        } else if (type === 'bool') {
            return kvstore.getBoolean(url, domain, key, defaultValue);
        }
    } catch (e) {
        console.error('KVStore read error:', e);
        return defaultValue;
    }
}

function safeKVSet(url, domain, key, value) {
    try {
        kvstore.set(url, domain, key, value);
    } catch (e) {
        console.error('KVStore write error:', e);
    }
}
```

## Source Code References

### ECMAScript KVStore Implementation
- **File**: `movian/src/ecmascript/es_kvstore.c`
- **Functions**:
  - `es_kvstore_get_string()` - String retrieval (lines 35-45)
  - `es_kvstore_get_int()` - Integer retrieval (lines 51-61)  
  - `es_kvstore_get_bool()` - Boolean retrieval (lines 67-77)
  - `es_kvstore_set()` - Value storage with type detection (lines 83-103)
  - `es_kvstore_get_domain()` - Domain validation (lines 25-32)

### Settings JavaScript Module
- **File**: `movian/res/ecmascript/modules/movian/settings.js`
- **Key Functions**:
  - `createSetting()` - Base setting creation (lines 6-35)
  - `createBool()` - Boolean settings (lines 55-75)
  - `createString()` - String settings (lines 81-101)
  - `createInt()` - Integer settings (lines 107-135)
  - `createMultiOpt()` - Multi-option settings (lines 175-215)
  - `globalSettings()` - Global settings group (lines 225-255)
  - `kvstoreSettings()` - URL-scoped settings (lines 261-285)

### Store JavaScript Module  
- **File**: `movian/res/ecmascript/modules/movian/store.js`
- **Key Components**:
  - `storeproxy` - Proxy handlers for transparent access (lines 4-30)
  - `createFromPath()` - Store creation with custom path (lines 32-50)
  - `create()` - Named store creation (lines 53-60)

### KVStore Native Implementation
- **File**: `movian/src/db/kvstore.h`
- **Storage Domains**:
  - `KVSTORE_DOMAIN_SYS = 1` - System storage
  - `KVSTORE_DOMAIN_PROP = 2` - Property storage  
  - `KVSTORE_DOMAIN_PLUGIN = 3` - Plugin storage
  - `KVSTORE_DOMAIN_SETTING = 4` - Settings storage

## Version Compatibility

- **Settings API**: Available in all Movian versions with ECMAScript support
- **Store API**: Available in Movian 4.8+
- **KVStore API**: Available in all versions, domain system added in 4.6+
- **Proxy Support**: Requires Movian 4.8+ (Duktape 2.0+)

## See Also

- [Plugin API Overview](core-api.md) - Core plugin APIs
- [HTTP API](http-api.md) - Network requests and data fetching
- [Plugin Examples](../examples/) - Working examples with settings
- [Property System](prop-api.md) - Advanced property binding