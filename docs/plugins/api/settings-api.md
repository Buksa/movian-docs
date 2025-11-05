# Settings and Configuration API Reference

This document provides comprehensive reference for Movian's settings and configuration management system for plugins.

## Table of Contents

- [Settings Module](#settings-module)
- [Global Settings](#global-settings)
- [KVStore Settings](#kvstore-settings)
- [Setting Types](#setting-types)
- [Setting Groups](#setting-groups)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Settings Module

The Settings module provides a high-level interface for creating and managing plugin configuration options that appear in Movian's settings interface.

### Module: `movian/settings`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/movian/settings.js`
- Uses KVStore: `movian/src/ecmascript/es_kvstore.c`
- Uses Store: `movian/res/ecmascript/modules/movian/store.js`

---

## Global Settings

Global settings appear in Movian's main settings interface and are stored persistently.

### Constructor

#### `new settings.globalSettings(id, title, icon, description)`

Creates a new global settings group for the plugin.

**Parameters:**
- `id` (string): Unique identifier for the settings group
- `title` (string): Display title in settings interface
- `icon` (string): Path to settings icon
- `description` (string): Brief description of the plugin

**Returns:**
- `SettingsGroup`: Settings group object

**Example:**
```javascript
var settings = require('movian/settings');

var mySettings = new settings.globalSettings(
  'myplugin',
  'My Video Plugin',
  Plugin.path + 'icon.png',
  'Settings for My Video Plugin'
);
```

**Source Reference:** `exports.globalSettings` in `movian/res/ecmascript/modules/movian/settings.js:180-205`

### Settings Group Methods

#### `group.createBool(id, title, defaultValue, callback, persistent)`

Creates a boolean (checkbox) setting.

**Parameters:**
- `id` (string): Setting identifier
- `title` (string): Display title
- `defaultValue` (boolean): Default value
- `callback` (function): Called when value changes
- `persistent` (boolean, optional): Whether to persist value (default: true)

**Returns:**
- `Setting`: Setting object with `value` and `enabled` properties

**Example:**
```javascript
var enableNotifications = mySettings.createBool(
  'notifications',
  'Enable Notifications',
  true,
  function(value) {
    console.log('Notifications enabled:', value);
    // Update plugin behavior based on setting
  }
);

// Access current value
console.log('Current setting:', enableNotifications.value);

// Disable the setting temporarily
enableNotifications.enabled = false;
```

**Source Reference:** `sp.createBool` in `movian/res/ecmascript/modules/movian/settings.js:45-65`

#### `group.createString(id, title, defaultValue, callback, persistent)`

Creates a string (text input) setting.

**Parameters:**
- `id` (string): Setting identifier
- `title` (string): Display title
- `defaultValue` (string): Default value
- `callback` (function): Called when value changes
- `persistent` (boolean, optional): Whether to persist value

**Returns:**
- `Setting`: Setting object

**Example:**
```javascript
var apiKey = mySettings.createString(
  'apiKey',
  'API Key',
  '',
  function(value) {
    console.log('API Key updated:', value ? '***' : 'not set');
    // Validate and store API key
    if (value && value.length < 10) {
      console.log('Warning: API key seems too short');
    }
  }
);
```

**Source Reference:** `sp.createString` in `movian/res/ecmascript/modules/movian/settings.js:70-90`

#### `group.createInt(id, title, defaultValue, min, max, step, unit, callback, persistent)`

Creates an integer (number input) setting.

**Parameters:**
- `id` (string): Setting identifier
- `title` (string): Display title
- `defaultValue` (number): Default value
- `min` (number): Minimum allowed value
- `max` (number): Maximum allowed value
- `step` (number): Step increment
- `unit` (string): Unit label (e.g., 'seconds', 'MB')
- `callback` (function): Called when value changes
- `persistent` (boolean, optional): Whether to persist value

**Returns:**
- `Setting`: Setting object

**Example:**
```javascript
var maxResults = mySettings.createInt(
  'maxResults',
  'Maximum Results',
  20,        // default
  1,         // min
  100,       // max
  5,         // step
  'items',   // unit
  function(value) {
    console.log('Max results set to:', value);
    // Update search behavior
  }
);
```

**Source Reference:** `sp.createInt` in `movian/res/ecmascript/modules/movian/settings.js:95-125`

#### `group.createMultiOpt(id, title, options, callback, persistent)`

Creates a multiple choice (dropdown/radio) setting.

**Parameters:**
- `id` (string): Setting identifier
- `title` (string): Display title
- `options` (Array): Array of [value, label, isDefault] arrays
- `callback` (function): Called when selection changes
- `persistent` (boolean, optional): Whether to persist value

**Returns:**
- `Setting`: Setting object

**Example:**
```javascript
var quality = mySettings.createMultiOpt(
  'videoQuality',
  'Video Quality',
  [
    ['720p', '720p HD', false],
    ['1080p', '1080p Full HD', true],  // default
    ['4k', '4K Ultra HD', false]
  ],
  function(value) {
    console.log('Video quality set to:', value);
    // Update video streaming quality
  }
);
```

**Source Reference:** `sp.createMultiOpt` in `movian/res/ecmascript/modules/movian/settings.js:140-175`

#### `group.createAction(id, title, callback)`

Creates an action button setting.

**Parameters:**
- `id` (string): Setting identifier
- `title` (string): Button label
- `callback` (function): Called when button is pressed

**Returns:**
- `Setting`: Setting object

**Example:**
```javascript
var clearCache = mySettings.createAction(
  'clearCache',
  'Clear Cache',
  function() {
    console.log('Clearing cache...');
    // Clear plugin cache
    var store = require('movian/store');
    var cache = store.create('cache');
    
    // Clear all cache data
    for (var key in cache) {
      delete cache[key];
    }
    
    console.log('Cache cleared');
  }
);
```

**Source Reference:** `sp.createAction` in `movian/res/ecmascript/modules/movian/settings.js:130-140`

#### `group.createDivider(title)`

Creates a visual divider/separator in the settings interface.

**Parameters:**
- `title` (string): Divider label

**Example:**
```javascript
mySettings.createDivider('Advanced Settings');

// Settings below this will be visually separated
var debugMode = mySettings.createBool('debug', 'Debug Mode', false, function(value) {
  console.log('Debug mode:', value);
});
```

**Source Reference:** `sp.createDivider` in `movian/res/ecmascript/modules/movian/settings.js:125-130`

#### `group.createInfo(id, icon, description)`

Creates an informational display element.

**Parameters:**
- `id` (string): Element identifier
- `icon` (string): Path to info icon
- `description` (string): Information text

**Example:**
```javascript
mySettings.createInfo(
  'about',
  Plugin.path + 'info-icon.png',
  'This plugin provides access to video content from Example.com. ' +
  'Please configure your API key above to get started.'
);
```

**Source Reference:** `sp.createInfo` in `movian/res/ecmascript/modules/movian/settings.js:135-145`

#### `group.destroy()`

Removes the settings group from Movian's interface.

**Example:**
```javascript
// Clean up settings when plugin is unloaded
mySettings.destroy();
```

**Source Reference:** `sp.destroy` in `movian/res/ecmascript/modules/movian/settings.js:25-30`

#### `group.dump()`

Dumps the settings group structure to console for debugging.

**Example:**
```javascript
mySettings.dump(); // Print settings structure
```

**Source Reference:** `sp.dump` in `movian/res/ecmascript/modules/movian/settings.js:35-40`

---

## KVStore Settings

KVStore settings provide URL-scoped configuration storage, commonly used for page-specific or content-specific settings.

### Constructor

#### `new settings.kvstoreSettings(nodes, url, domain)`

Creates a settings group backed by KVStore.

**Parameters:**
- `nodes` (Object): Property nodes container
- `url` (string): URL scope for the settings
- `domain` (string): Domain identifier ('plugin', 'app', etc.)

**Returns:**
- `SettingsGroup`: KVStore-backed settings group

**Example:**
```javascript
var settings = require('movian/settings');

// Create page-specific settings
var pageSettings = new settings.kvstoreSettings(
  page.model.options,
  page.root.url,
  'plugin'
);

var sortOrder = pageSettings.createMultiOpt(
  'sortOrder',
  'Sort Order',
  [
    ['date', 'By Date', true],
    ['title', 'By Title', false],
    ['rating', 'By Rating', false]
  ],
  function(value) {
    console.log('Sort order changed to:', value);
    // Re-sort page content
    sortPageContent(value);
  },
  true  // persistent
);
```

**Source Reference:** `exports.kvstoreSettings` in `movian/res/ecmascript/modules/movian/settings.js:210-230`

### KVStore vs Global Settings

| Feature | Global Settings | KVStore Settings |
|---------|----------------|------------------|
| **Scope** | Plugin-wide | URL-specific |
| **Storage** | File-based store | KVStore database |
| **UI Location** | Main settings menu | Page/context-specific |
| **Persistence** | Always persistent | Configurable per setting |
| **Use Case** | Plugin configuration | Page/content preferences |

---

## Setting Types

### Boolean Settings

Boolean settings appear as checkboxes in the interface.

```javascript
var setting = group.createBool('enabled', 'Enable Feature', true, function(value) {
  if (value) {
    enableFeature();
  } else {
    disableFeature();
  }
});

// Programmatic access
if (setting.value) {
  console.log('Feature is enabled');
}
```

### String Settings

String settings appear as text input fields.

```javascript
var setting = group.createString('username', 'Username', '', function(value) {
  if (value.length > 0) {
    console.log('Username set to:', value);
  } else {
    console.log('Username cleared');
  }
});

// Validation example
var emailSetting = group.createString('email', 'Email Address', '', function(value) {
  if (value && !value.includes('@')) {
    console.log('Warning: Invalid email format');
  }
});
```

### Integer Settings

Integer settings appear as number inputs with optional constraints.

```javascript
var setting = group.createInt(
  'timeout',
  'Request Timeout',
  30,        // default: 30 seconds
  5,         // min: 5 seconds
  300,       // max: 5 minutes
  5,         // step: 5 second increments
  'seconds', // unit label
  function(value) {
    console.log('Timeout set to:', value, 'seconds');
    updateRequestTimeout(value * 1000); // Convert to milliseconds
  }
);
```

### Multiple Choice Settings

Multiple choice settings appear as dropdowns or radio button groups.

```javascript
var setting = group.createMultiOpt(
  'theme',
  'Interface Theme',
  [
    ['auto', 'Auto (System)', true],
    ['light', 'Light Theme', false],
    ['dark', 'Dark Theme', false]
  ],
  function(value) {
    console.log('Theme changed to:', value);
    applyTheme(value);
  }
);
```

### Action Settings

Action settings appear as buttons that execute functions when pressed.

```javascript
var setting = group.createAction('reset', 'Reset to Defaults', function() {
  // Reset all settings to default values
  console.log('Resetting settings...');
  
  // You would typically reset other settings here
  otherSetting.value = defaultValue;
  
  console.log('Settings reset complete');
});
```

---

## Setting Groups

### Organization Strategies

#### Logical Grouping
```javascript
var settings = require('movian/settings');
var mySettings = new settings.globalSettings('myplugin', 'My Plugin', icon, desc);

// Connection settings
mySettings.createDivider('Connection Settings');
mySettings.createString('apiUrl', 'API URL', 'https://api.example.com');
mySettings.createString('apiKey', 'API Key', '');
mySettings.createInt('timeout', 'Timeout', 30, 5, 300, 5, 'seconds', timeoutCallback);

// Display settings
mySettings.createDivider('Display Settings');
mySettings.createMultiOpt('quality', 'Video Quality', qualityOptions, qualityCallback);
mySettings.createBool('showThumbnails', 'Show Thumbnails', true, thumbnailCallback);

// Advanced settings
mySettings.createDivider('Advanced');
mySettings.createBool('debug', 'Debug Mode', false, debugCallback);
mySettings.createAction('clearCache', 'Clear Cache', clearCacheCallback);
```

#### Conditional Settings
```javascript
var debugEnabled = false;

var debugSetting = mySettings.createBool('debug', 'Debug Mode', false, function(value) {
  debugEnabled = value;
  
  // Enable/disable debug-related settings
  verboseSetting.enabled = value;
  logLevelSetting.enabled = value;
});

var verboseSetting = mySettings.createBool('verbose', 'Verbose Logging', false, function(value) {
  // Only active when debug mode is enabled
});

var logLevelSetting = mySettings.createMultiOpt('logLevel', 'Log Level', [
  ['error', 'Errors Only', true],
  ['warn', 'Warnings', false],
  ['info', 'Information', false],
  ['debug', 'Debug', false]
], function(value) {
  // Only active when debug mode is enabled
});

// Initially disable debug-related settings
verboseSetting.enabled = false;
logLevelSetting.enabled = false;
```

### Setting Dependencies

```javascript
var settings = require('movian/settings');
var mySettings = new settings.globalSettings('myplugin', 'My Plugin', icon, desc);

var authMethod = mySettings.createMultiOpt('authMethod', 'Authentication', [
  ['none', 'No Authentication', true],
  ['apikey', 'API Key', false],
  ['oauth', 'OAuth', false]
], function(value) {
  // Enable/disable related settings based on auth method
  apiKeySetting.enabled = (value === 'apikey');
  oauthClientSetting.enabled = (value === 'oauth');
  oauthSecretSetting.enabled = (value === 'oauth');
});

var apiKeySetting = mySettings.createString('apiKey', 'API Key', '', function(value) {
  console.log('API Key updated');
});

var oauthClientSetting = mySettings.createString('oauthClient', 'OAuth Client ID', '', function(value) {
  console.log('OAuth Client ID updated');
});

var oauthSecretSetting = mySettings.createString('oauthSecret', 'OAuth Secret', '', function(value) {
  console.log('OAuth Secret updated');
});

// Initially disable auth-specific settings
apiKeySetting.enabled = false;
oauthClientSetting.enabled = false;
oauthSecretSetting.enabled = false;
```

---

## Error Handling

### Setting Validation

```javascript
var settings = require('movian/settings');
var mySettings = new settings.globalSettings('myplugin', 'My Plugin', icon, desc);

var urlSetting = mySettings.createString('serverUrl', 'Server URL', '', function(value) {
  try {
    if (value) {
      // Validate URL format
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }
      
      // Test connection
      var http = require('movian/http');
      var response = http.request(value + '/api/status', {
        timeout: 5000,
        noFail: true
      });
      
      if (response.statuscode !== 200) {
        throw new Error('Server not reachable (HTTP ' + response.statuscode + ')');
      }
      
      console.log('Server URL validated successfully');
      
    }
  } catch (e) {
    console.log('Server URL validation failed:', e.message);
    // You might want to show an error to the user
    // or revert to a previous valid value
  }
});
```

### Setting Recovery

```javascript
var settings = require('movian/settings');
var store = require('movian/store');

function createSettingsWithBackup() {
  var mySettings = new settings.globalSettings('myplugin', 'My Plugin', icon, desc);
  var backupStore = store.create('settings-backup');
  
  var apiKeySetting = mySettings.createString('apiKey', 'API Key', '', function(value) {
    try {
      if (value) {
        // Validate API key
        validateApiKey(value);
        
        // Store backup of working key
        backupStore.lastWorkingApiKey = value;
        backupStore.lastValidated = Date.now();
      }
    } catch (e) {
      console.log('API Key validation failed:', e.message);
      
      // Offer to restore last working key
      if (backupStore.lastWorkingApiKey) {
        console.log('Restoring last working API key');
        apiKeySetting.value = backupStore.lastWorkingApiKey;
      }
    }
  });
  
  return mySettings;
}

function validateApiKey(key) {
  var http = require('movian/http');
  
  var response = http.request('https://api.example.com/validate', {
    headers: {
      'Authorization': 'Bearer ' + key
    },
    timeout: 10000
  });
  
  if (response.statuscode !== 200) {
    throw new Error('Invalid API key');
  }
}
```

### Graceful Degradation

```javascript
var settings = require('movian/settings');

function createRobustSettings() {
  try {
    var mySettings = new settings.globalSettings('myplugin', 'My Plugin', icon, desc);
    
    // Create settings with error handling
    var qualitySetting = mySettings.createMultiOpt('quality', 'Quality', [
      ['low', 'Low Quality', false],
      ['medium', 'Medium Quality', true],
      ['high', 'High Quality', false]
    ], function(value) {
      try {
        applyQualitySetting(value);
      } catch (e) {
        console.log('Failed to apply quality setting:', e.message);
        // Fall back to medium quality
        if (value !== 'medium') {
          console.log('Falling back to medium quality');
          qualitySetting.value = 'medium';
        }
      }
    });
    
    return mySettings;
    
  } catch (e) {
    console.log('Failed to create settings interface:', e.message);
    
    // Return a mock settings object that doesn't crash
    return {
      destroy: function() {},
      dump: function() {}
    };
  }
}
```

---

## Examples

### Complete Plugin Settings Example

```javascript
// settings-example.js - Complete plugin settings implementation

var settings = require('movian/settings');
var store = require('movian/store');
var http = require('movian/http');

function PluginSettings(pluginId, pluginTitle) {
  this.pluginId = pluginId;
  this.store = store.create('settings');
  
  // Create global settings interface
  this.settings = new settings.globalSettings(
    pluginId,
    pluginTitle + ' Settings',
    Plugin.path + 'icon.png',
    'Configure ' + pluginTitle + ' plugin options'
  );
  
  this.initializeSettings();
}

PluginSettings.prototype.initializeSettings = function() {
  var self = this;
  
  // Connection Settings
  this.settings.createDivider('Connection Settings');
  
  this.apiUrlSetting = this.settings.createString(
    'apiUrl',
    'API Server URL',
    'https://api.example.com',
    function(value) {
      self.onApiUrlChanged(value);
    }
  );
  
  this.apiKeySetting = this.settings.createString(
    'apiKey',
    'API Key',
    '',
    function(value) {
      self.onApiKeyChanged(value);
    }
  );
  
  this.timeoutSetting = this.settings.createInt(
    'timeout',
    'Request Timeout',
    30,
    5,
    300,
    5,
    'seconds',
    function(value) {
      self.onTimeoutChanged(value);
    }
  );
  
  // Display Settings
  this.settings.createDivider('Display Settings');
  
  this.qualitySetting = this.settings.createMultiOpt(
    'videoQuality',
    'Default Video Quality',
    [
      ['480p', '480p (SD)', false],
      ['720p', '720p (HD)', true],
      ['1080p', '1080p (Full HD)', false],
      ['4k', '4K (Ultra HD)', false]
    ],
    function(value) {
      self.onQualityChanged(value);
    }
  );
  
  this.thumbnailsSetting = this.settings.createBool(
    'showThumbnails',
    'Show Video Thumbnails',
    true,
    function(value) {
      self.onThumbnailsChanged(value);
    }
  );
  
  this.itemsPerPageSetting = this.settings.createInt(
    'itemsPerPage',
    'Items Per Page',
    20,
    5,
    100,
    5,
    'items',
    function(value) {
      self.onItemsPerPageChanged(value);
    }
  );
  
  // Advanced Settings
  this.settings.createDivider('Advanced Settings');
  
  this.cachingSetting = this.settings.createBool(
    'enableCaching',
    'Enable Response Caching',
    true,
    function(value) {
      self.onCachingChanged(value);
    }
  );
  
  this.debugSetting = this.settings.createBool(
    'debugMode',
    'Debug Mode',
    false,
    function(value) {
      self.onDebugChanged(value);
    }
  );
  
  // Actions
  this.settings.createDivider('Actions');
  
  this.settings.createAction(
    'testConnection',
    'Test API Connection',
    function() {
      self.testConnection();
    }
  );
  
  this.settings.createAction(
    'clearCache',
    'Clear Cache',
    function() {
      self.clearCache();
    }
  );
  
  this.settings.createAction(
    'resetSettings',
    'Reset to Defaults',
    function() {
      self.resetToDefaults();
    }
  );
  
  // Information
  this.settings.createDivider('Information');
  
  this.settings.createInfo(
    'about',
    Plugin.path + 'info-icon.png',
    'Plugin Version: ' + Plugin.version + '\n' +
    'For support, visit: https://example.com/support'
  );
};

PluginSettings.prototype.onApiUrlChanged = function(value) {
  console.log('API URL changed to:', value);
  this.store.apiUrl = value;
  
  // Validate URL format
  if (value && !value.match(/^https?:\/\/.+/)) {
    console.log('Warning: API URL should start with http:// or https://');
  }
};

PluginSettings.prototype.onApiKeyChanged = function(value) {
  console.log('API Key changed:', value ? '***' : 'cleared');
  this.store.apiKey = value;
  
  // Clear any cached authentication
  this.clearAuthCache();
};

PluginSettings.prototype.onTimeoutChanged = function(value) {
  console.log('Timeout changed to:', value, 'seconds');
  this.store.timeout = value;
};

PluginSettings.prototype.onQualityChanged = function(value) {
  console.log('Default quality changed to:', value);
  this.store.videoQuality = value;
};

PluginSettings.prototype.onThumbnailsChanged = function(value) {
  console.log('Show thumbnails:', value);
  this.store.showThumbnails = value;
};

PluginSettings.prototype.onItemsPerPageChanged = function(value) {
  console.log('Items per page changed to:', value);
  this.store.itemsPerPage = value;
};

PluginSettings.prototype.onCachingChanged = function(value) {
  console.log('Caching enabled:', value);
  this.store.enableCaching = value;
  
  if (!value) {
    this.clearCache();
  }
};

PluginSettings.prototype.onDebugChanged = function(value) {
  console.log('Debug mode:', value);
  this.store.debugMode = value;
  
  // You might enable/disable additional logging here
};

PluginSettings.prototype.testConnection = function() {
  console.log('Testing API connection...');
  
  var apiUrl = this.store.apiUrl || 'https://api.example.com';
  var apiKey = this.store.apiKey;
  var timeout = (this.store.timeout || 30) * 1000;
  
  try {
    var response = http.request(apiUrl + '/status', {
      headers: apiKey ? {'Authorization': 'Bearer ' + apiKey} : {},
      timeout: timeout,
      noFail: true
    });
    
    if (response.statuscode === 200) {
      console.log('✓ Connection successful');
      
      // Parse response for additional info
      try {
        var data = JSON.parse(response.toString());
        if (data.version) {
          console.log('API Version:', data.version);
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
    } else {
      console.log('✗ Connection failed: HTTP', response.statuscode);
    }
    
  } catch (e) {
    console.log('✗ Connection error:', e.message);
  }
};

PluginSettings.prototype.clearCache = function() {
  console.log('Clearing cache...');
  
  var cache = store.create('cache');
  var count = 0;
  
  for (var key in cache) {
    delete cache[key];
    count++;
  }
  
  console.log('Cleared', count, 'cache entries');
};

PluginSettings.prototype.clearAuthCache = function() {
  var cache = store.create('cache');
  
  // Clear authentication-related cache entries
  delete cache.authToken;
  delete cache.userInfo;
  delete cache.permissions;
  
  console.log('Authentication cache cleared');
};

PluginSettings.prototype.resetToDefaults = function() {
  console.log('Resetting settings to defaults...');
  
  // Reset to default values
  this.apiUrlSetting.value = 'https://api.example.com';
  this.apiKeySetting.value = '';
  this.timeoutSetting.value = 30;
  this.qualitySetting.value = '720p';
  this.thumbnailsSetting.value = true;
  this.itemsPerPageSetting.value = 20;
  this.cachingSetting.value = true;
  this.debugSetting.value = false;
  
  console.log('Settings reset complete');
};

PluginSettings.prototype.getApiUrl = function() {
  return this.store.apiUrl || 'https://api.example.com';
};

PluginSettings.prototype.getApiKey = function() {
  return this.store.apiKey || '';
};

PluginSettings.prototype.getTimeout = function() {
  return (this.store.timeout || 30) * 1000; // Convert to milliseconds
};

PluginSettings.prototype.getVideoQuality = function() {
  return this.store.videoQuality || '720p';
};

PluginSettings.prototype.shouldShowThumbnails = function() {
  return this.store.showThumbnails !== false; // Default to true
};

PluginSettings.prototype.getItemsPerPage = function() {
  return this.store.itemsPerPage || 20;
};

PluginSettings.prototype.isCachingEnabled = function() {
  return this.store.enableCaching !== false; // Default to true
};

PluginSettings.prototype.isDebugMode = function() {
  return this.store.debugMode === true; // Default to false
};

PluginSettings.prototype.destroy = function() {
  if (this.settings) {
    this.settings.destroy();
  }
};

// Usage example
var pluginSettings = new PluginSettings('myplugin', 'My Video Plugin');

// Access settings values
console.log('API URL:', pluginSettings.getApiUrl());
console.log('Debug mode:', pluginSettings.isDebugMode());

// Use settings in HTTP requests
var http = require('movian/http');

function makeApiRequest(endpoint) {
  return http.request(pluginSettings.getApiUrl() + endpoint, {
    headers: {
      'Authorization': 'Bearer ' + pluginSettings.getApiKey()
    },
    timeout: pluginSettings.getTimeout(),
    compression: true,
    caching: pluginSettings.isCachingEnabled()
  });
}

// Clean up on plugin unload
Plugin.addURI("plugin:myplugin:cleanup", function() {
  pluginSettings.destroy();
});
```

### Page-Specific Settings Example

```javascript
// page-settings-example.js - Page-specific settings using KVStore

var settings = require('movian/settings');
var page = require('movian/page');

function createBrowsePage(pageRoot, category) {
  var browsePage = new page.Page(pageRoot, false, false);
  
  // Create page-specific settings
  var pageSettings = new settings.kvstoreSettings(
    browsePage.model.options,
    pageRoot.url,
    'plugin'
  );
  
  // Sort order setting
  var sortSetting = pageSettings.createMultiOpt(
    'sortOrder',
    'Sort Order',
    [
      ['date_desc', 'Newest First', true],
      ['date_asc', 'Oldest First', false],
      ['title_asc', 'Title A-Z', false],
      ['title_desc', 'Title Z-A', false],
      ['rating_desc', 'Highest Rated', false]
    ],
    function(value) {
      console.log('Sort order changed to:', value);
      refreshPageContent(browsePage, category, value);
    },
    true // persistent
  );
  
  // View mode setting
  var viewSetting = pageSettings.createMultiOpt(
    'viewMode',
    'View Mode',
    [
      ['grid', 'Grid View', true],
      ['list', 'List View', false],
      ['detailed', 'Detailed View', false]
    ],
    function(value) {
      console.log('View mode changed to:', value);
      updateViewMode(browsePage, value);
    },
    true // persistent
  );
  
  // Items per page setting
  var itemsSetting = pageSettings.createInt(
    'itemsPerPage',
    'Items Per Page',
    20,
    5,
    100,
    5,
    'items',
    function(value) {
      console.log('Items per page changed to:', value);
      refreshPageContent(browsePage, category, sortSetting.value, value);
    },
    true // persistent
  );
  
  // Filter settings
  pageSettings.createDivider('Filters');
  
  var genreFilter = pageSettings.createMultiOpt(
    'genreFilter',
    'Genre Filter',
    [
      ['all', 'All Genres', true],
      ['action', 'Action', false],
      ['comedy', 'Comedy', false],
      ['drama', 'Drama', false],
      ['horror', 'Horror', false]
    ],
    function(value) {
      console.log('Genre filter changed to:', value);
      refreshPageContent(browsePage, category, sortSetting.value, itemsSetting.value, value);
    },
    true // persistent
  );
  
  // Load initial content
  refreshPageContent(browsePage, category, sortSetting.value, itemsSetting.value, genreFilter.value);
  
  return browsePage;
}

function refreshPageContent(page, category, sortOrder, itemsPerPage, genreFilter) {
  page.loading = true;
  page.flush();
  
  try {
    // Fetch content based on settings
    var content = fetchContent({
      category: category,
      sort: sortOrder,
      limit: itemsPerPage,
      genre: genreFilter === 'all' ? null : genreFilter
    });
    
    content.forEach(function(item) {
      page.appendItem(item.url, item.type, item.metadata);
    });
    
    page.loading = false;
    
  } catch (e) {
    page.error('Failed to load content: ' + e.message);
  }
}

function updateViewMode(page, viewMode) {
  // Update page properties based on view mode
  switch (viewMode) {
    case 'grid':
      page.model.itemsPerRow = 4;
      page.model.showDetails = false;
      break;
    case 'list':
      page.model.itemsPerRow = 1;
      page.model.showDetails = false;
      break;
    case 'detailed':
      page.model.itemsPerRow = 1;
      page.model.showDetails = true;
      break;
  }
}

// Register route with page-specific settings
var browseRoute = new page.Route('^plugin:myplugin:browse:(.*)$', function(page, category) {
  page.type = 'directory';
  page.metadata.title = 'Browse ' + category;
  
  createBrowsePage(page.root, category);
});
```

---

## Version Compatibility

- **Movian 4.8+**: All documented APIs available
- **Movian 4.6-4.7**: Core settings functionality available, some advanced features may be missing
- **Earlier versions**: Basic settings support, limited KVStore integration

## See Also

- [Core API Reference](core-api.md) - Service, page, and property APIs
- [Storage API Reference](storage-api.md) - Data persistence and storage
- [HTTP API Reference](http-api.md) - Network and HTTP functionality
- [Plugin Development Guide](../getting-started.md) - Getting started with plugins