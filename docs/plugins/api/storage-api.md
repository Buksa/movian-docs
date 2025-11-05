# Storage and Database API Reference

This document provides comprehensive reference for Movian's storage and database capabilities including key-value store, SQLite database, and file system access.

## Table of Contents

- [Key-Value Store (KVStore)](#key-value-store-kvstore)
- [Store Module](#store-module)
- [SQLite Database](#sqlite-database)
- [File System Access](#file-system-access)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Key-Value Store (KVStore)

The KVStore provides persistent key-value storage tied to URLs and domains, commonly used for plugin settings and user data.

### Module: `native/kvstore`

**Source References:**
- Native implementation: `movian/src/ecmascript/es_kvstore.c`
- Used by settings system: `movian/res/ecmascript/modules/movian/settings.js`

### Functions

#### `kvstore.getString(url, domain, key)`

Retrieves a string value from the key-value store.

**Parameters:**
- `url` (string): URL identifier for the data scope
- `domain` (string): Domain identifier ('plugin', 'app', etc.)
- `key` (string): Key name

**Returns:**
- `string|null`: Stored value or null if not found

**Example:**
```javascript
var kvstore = require('native/kvstore');

var username = kvstore.getString('plugin:myplugin', 'plugin', 'username');
if (username) {
  console.log('Stored username:', username);
} else {
  console.log('No username stored');
}
```

**Source Reference:** `es_kvstore_get_string()` in `movian/src/ecmascript/es_kvstore.c:35-45`

#### `kvstore.getInteger(url, domain, key, defaultValue)`

Retrieves an integer value from the key-value store.

**Parameters:**
- `url` (string): URL identifier for the data scope
- `domain` (string): Domain identifier
- `key` (string): Key name
- `defaultValue` (number): Default value if key not found

**Returns:**
- `number`: Stored value or default value

**Example:**
```javascript
var kvstore = require('native/kvstore');

var maxResults = kvstore.getInteger('plugin:myplugin', 'plugin', 'maxResults', 20);
console.log('Max results setting:', maxResults);
```

**Source Reference:** `es_kvstore_get_int()` in `movian/src/ecmascript/es_kvstore.c:50-60`

#### `kvstore.getBoolean(url, domain, key, defaultValue)`

Retrieves a boolean value from the key-value store.

**Parameters:**
- `url` (string): URL identifier for the data scope
- `domain` (string): Domain identifier
- `key` (string): Key name
- `defaultValue` (boolean): Default value if key not found

**Returns:**
- `boolean`: Stored value or default value

**Example:**
```javascript
var kvstore = require('native/kvstore');

var enableNotifications = kvstore.getBoolean('plugin:myplugin', 'plugin', 'notifications', true);
console.log('Notifications enabled:', enableNotifications);
```

**Source Reference:** `es_kvstore_get_bool()` in `movian/src/ecmascript/es_kvstore.c:65-75`

#### `kvstore.set(url, domain, key, value)`

Stores a value in the key-value store.

**Parameters:**
- `url` (string): URL identifier for the data scope
- `domain` (string): Domain identifier
- `key` (string): Key name
- `value` (string|number|boolean): Value to store

**Example:**
```javascript
var kvstore = require('native/kvstore');

// Store different types of values
kvstore.set('plugin:myplugin', 'plugin', 'username', 'john_doe');
kvstore.set('plugin:myplugin', 'plugin', 'maxResults', 50);
kvstore.set('plugin:myplugin', 'plugin', 'notifications', false);
```

**Source Reference:** `es_kvstore_set()` in `movian/src/ecmascript/es_kvstore.c:80-95`

### Domain Types

- `'plugin'`: Plugin-specific data (most common)
- `'app'`: Application-wide data
- `'user'`: User-specific data

### URL Scoping

The URL parameter provides data scoping:
- `'plugin:myplugin'`: Plugin-wide settings
- `'plugin:myplugin:user:123'`: User-specific data
- `'http://example.com/video.mp4'`: Media-specific data (playback position, etc.)

---

## Store Module

The Store module provides a higher-level file-based storage system with automatic JSON serialization.

### Module: `movian/store`

**Source Reference:** `movian/res/ecmascript/modules/movian/store.js`

### Functions

#### `store.create(name)`

Creates a new store with the given name in the plugin's storage directory.

**Parameters:**
- `name` (string): Store name (used as filename)

**Returns:**
- `Object`: Proxied store object with automatic persistence

**Example:**
```javascript
var store = require('movian/store');

var myStore = store.create('user-preferences');

// Data is automatically persisted
myStore.theme = 'dark';
myStore.language = 'en';
myStore.favorites = ['item1', 'item2', 'item3'];

console.log('Theme:', myStore.theme);
```

#### `store.createFromPath(path)`

Creates a store from a specific file path.

**Parameters:**
- `path` (string): Full path to store file

**Returns:**
- `Object`: Proxied store object

**Example:**
```javascript
var store = require('movian/store');

var customStore = store.createFromPath('/path/to/custom/store.json');
customStore.data = 'custom data';
```

### Store Object Behavior

#### Automatic Persistence

Store objects automatically save changes to disk after a 5-second delay:

```javascript
var store = require('movian/store');
var myStore = store.create('settings');

myStore.setting1 = 'value1';  // Triggers save timer
myStore.setting2 = 'value2';  // Resets save timer

// File is written 5 seconds after last change
```

#### Property Access

Store objects behave like regular JavaScript objects:

```javascript
var store = require('movian/store');
var myStore = store.create('data');

// Set properties
myStore.user = {
  name: 'John',
  age: 30,
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

// Get properties
console.log('User name:', myStore.user.name);
console.log('Theme:', myStore.user.preferences.theme);

// Check property existence
if ('user' in myStore) {
  console.log('User data exists');
}

// Delete properties
delete myStore.user.age;
```

#### Finalization

Store objects automatically save on garbage collection:

```javascript
// Store is automatically saved when object is finalized
var myStore = store.create('temp');
myStore.data = 'important data';
myStore = null; // Triggers finalization and save
```

---

## SQLite Database

SQLite database support for complex data storage and queries.

### Module: `movian/sqlite`

**Source References:**
- JavaScript wrapper: `movian/res/ecmascript/modules/movian/sqlite.js`
- Native implementation: `movian/src/ecmascript/es_sqlite.c`

### Database Class

#### Constructor

#### `new sqlite.DB(dbname)`

Creates or opens a SQLite database.

**Parameters:**
- `dbname` (string): Database name (stored in plugin's database directory)

**Returns:**
- `DB`: Database instance

**Example:**
```javascript
var sqlite = require('movian/sqlite');

var db = new sqlite.DB('mydata');
```

**Source Reference:** `es_sqlite_create()` in `movian/src/ecmascript/es_sqlite.c:70-95`

### Database Methods

#### `db.query(sql, ...params)`

Executes a SQL query with optional parameters.

**Parameters:**
- `sql` (string): SQL query with ? placeholders
- `...params` (any): Parameters to bind to placeholders

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('movies');

// Create table
db.query('CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY, title TEXT, year INTEGER, rating REAL)');

// Insert data
db.query('INSERT INTO movies (title, year, rating) VALUES (?, ?, ?)', 
         'The Matrix', 1999, 8.7);

// Query data
db.query('SELECT * FROM movies WHERE year > ?', 2000);
```

#### `db.step()`

Steps through query results (used after query() for SELECT statements).

**Returns:**
- `Object|null`: Row object or null if no more rows

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('movies');

db.query('SELECT * FROM movies ORDER BY rating DESC');

var row;
while ((row = db.step()) !== null) {
  console.log('Movie:', row.title, '(' + row.year + ') - Rating:', row.rating);
}
```

#### `db.upgradeSchema(path)`

Upgrades database schema using SQL files.

**Parameters:**
- `path` (string): Path to directory containing numbered SQL files

**Returns:**
- `boolean`: True if upgrade successful

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('movies');

// Upgrade using files: 001.sql, 002.sql, etc.
var success = db.upgradeSchema(Plugin.path + 'sql/');
if (success) {
  console.log('Database schema updated');
} else {
  console.log('Schema upgrade failed:', db.lastErrorString);
}
```

#### `db.close()`

Closes the database connection and cleans up resources.

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('temp');

// Use database...

db.close(); // Clean up
```

### Database Properties

#### `db.lastRowId`

Gets the row ID of the last inserted row.

**Type:** `number`

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('movies');

db.query('INSERT INTO movies (title, year) VALUES (?, ?)', 'New Movie', 2023);
console.log('Inserted movie with ID:', db.lastRowId);
```

#### `db.lastErrorString`

Gets the last error message.

**Type:** `string`

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('movies');

try {
  db.query('INVALID SQL QUERY');
} catch (e) {
  console.log('SQL Error:', db.lastErrorString);
}
```

#### `db.lastErrorCode`

Gets the last SQLite error code.

**Type:** `number`

**Example:**
```javascript
var sqlite = require('movian/sqlite');
var db = new sqlite.DB('movies');

db.query('SELECT * FROM nonexistent_table');
if (db.lastErrorCode !== 0) {
  console.log('Error code:', db.lastErrorCode);
  console.log('Error message:', db.lastErrorString);
}
```

---

## File System Access

Basic file system operations for reading and writing files.

### Module: `fs`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/fs.js`
- Native implementation: `movian/src/ecmascript/es_fs.c`

### Functions

#### `fs.readFileSync(path)`

Synchronously reads a file.

**Parameters:**
- `path` (string): File path to read

**Returns:**
- `string`: File contents

**Example:**
```javascript
var fs = require('fs');

try {
  var content = fs.readFileSync(Plugin.path + 'config.json');
  var config = JSON.parse(content);
  console.log('Config loaded:', config);
} catch (e) {
  console.log('Failed to read config:', e.message);
}
```

#### `fs.writeFileSync(path, data)`

Synchronously writes a file.

**Parameters:**
- `path` (string): File path to write
- `data` (string): Data to write

**Example:**
```javascript
var fs = require('fs');

var config = {
  version: '1.0',
  settings: {
    theme: 'dark'
  }
};

try {
  fs.writeFileSync(Plugin.path + 'config.json', JSON.stringify(config, null, 2));
  console.log('Config saved');
} catch (e) {
  console.log('Failed to save config:', e.message);
}
```

### Native File System Module

#### Module: `native/fs`

Additional file system utilities.

##### `fs.mkdirs(path)`

Creates directories recursively.

**Parameters:**
- `path` (string): Directory path to create

**Example:**
```javascript
var fs = require('native/fs');

fs.mkdirs(Core.storagePath + '/mydata/cache');
```

##### `fs.dirname(path)`

Gets the directory name of a path.

**Parameters:**
- `path` (string): File path

**Returns:**
- `string`: Directory path

**Example:**
```javascript
var fs = require('native/fs');

var dir = fs.dirname('/path/to/file.txt');
console.log('Directory:', dir); // '/path/to'
```

---

## Error Handling

### Common Error Patterns

#### KVStore Errors
```javascript
var kvstore = require('native/kvstore');

try {
  var value = kvstore.getString('plugin:myplugin', 'invalid_domain', 'key');
} catch (e) {
  console.log('KVStore error:', e.message);
  // Handle invalid domain or other errors
}
```

#### Store File Errors
```javascript
var store = require('movian/store');

try {
  var myStore = store.createFromPath('/invalid/path/store.json');
  myStore.data = 'test';
} catch (e) {
  console.log('Store error:', e.message);
  // Handle file permission or path errors
}
```

#### SQLite Errors
```javascript
var sqlite = require('movian/sqlite');

var db = new sqlite.DB('mydata');

try {
  db.query('CREATE TABLE test (id INTEGER PRIMARY KEY)');
  db.query('INSERT INTO test (id) VALUES (?)', 'invalid_integer');
} catch (e) {
  console.log('SQL Error:', db.lastErrorString);
  console.log('Error Code:', db.lastErrorCode);
}
```

#### File System Errors
```javascript
var fs = require('fs');

try {
  var content = fs.readFileSync('/nonexistent/file.txt');
} catch (e) {
  if (e.message.includes('No such file')) {
    console.log('File not found');
  } else if (e.message.includes('Permission denied')) {
    console.log('Access denied');
  } else {
    console.log('File error:', e.message);
  }
}
```

### Error Recovery Strategies

#### Graceful Degradation
```javascript
var store = require('movian/store');

function getSettings() {
  try {
    return store.create('settings');
  } catch (e) {
    console.log('Failed to load settings, using defaults:', e.message);
    return {
      theme: 'light',
      notifications: true
    };
  }
}
```

#### Database Migration
```javascript
var sqlite = require('movian/sqlite');

function initDatabase() {
  var db = new sqlite.DB('mydata');
  
  try {
    // Try to upgrade schema
    if (!db.upgradeSchema(Plugin.path + 'sql/')) {
      throw new Error('Schema upgrade failed: ' + db.lastErrorString);
    }
  } catch (e) {
    console.log('Database initialization failed:', e.message);
    
    // Try to recreate database
    db.close();
    // Note: In real implementation, you might want to backup/remove old DB
    db = new sqlite.DB('mydata_new');
    
    if (!db.upgradeSchema(Plugin.path + 'sql/')) {
      throw new Error('Failed to create new database');
    }
  }
  
  return db;
}
```

---

## Examples

### Complete Data Management Example

```javascript
// data-manager.js - Complete data management system

var kvstore = require('native/kvstore');
var store = require('movian/store');
var sqlite = require('movian/sqlite');

function DataManager(pluginId) {
  this.pluginId = pluginId;
  this.urlBase = 'plugin:' + pluginId;
  
  // Initialize storage systems
  this.settings = store.create('settings');
  this.cache = store.create('cache');
  this.db = this.initDatabase();
}

DataManager.prototype.initDatabase = function() {
  var db = new sqlite.DB('data');
  
  // Create tables
  db.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE,
      title TEXT,
      metadata TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);
  
  db.query(`
    CREATE TABLE IF NOT EXISTS user_data (
      item_id INTEGER,
      key TEXT,
      value TEXT,
      PRIMARY KEY (item_id, key),
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `);
  
  return db;
};

// Settings management
DataManager.prototype.getSetting = function(key, defaultValue) {
  return kvstore.getString(this.urlBase, 'plugin', key) || 
         this.settings[key] || 
         defaultValue;
};

DataManager.prototype.setSetting = function(key, value) {
  kvstore.set(this.urlBase, 'plugin', key, value);
  this.settings[key] = value;
};

DataManager.prototype.getBooleanSetting = function(key, defaultValue) {
  return kvstore.getBoolean(this.urlBase, 'plugin', key, defaultValue);
};

DataManager.prototype.setBooleanSetting = function(key, value) {
  kvstore.set(this.urlBase, 'plugin', key, value);
  this.settings[key] = value;
};

// Cache management
DataManager.prototype.getCached = function(key) {
  var cached = this.cache[key];
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  return null;
};

DataManager.prototype.setCached = function(key, data, ttlSeconds) {
  this.cache[key] = {
    data: data,
    expires: Date.now() + (ttlSeconds * 1000)
  };
};

DataManager.prototype.clearExpiredCache = function() {
  var now = Date.now();
  for (var key in this.cache) {
    if (this.cache[key].expires <= now) {
      delete this.cache[key];
    }
  }
};

// Database operations
DataManager.prototype.saveItem = function(url, title, metadata) {
  var now = Date.now();
  
  this.db.query(`
    INSERT OR REPLACE INTO items (url, title, metadata, created_at, updated_at)
    VALUES (?, ?, ?, 
      COALESCE((SELECT created_at FROM items WHERE url = ?), ?),
      ?)
  `, url, title, JSON.stringify(metadata), url, now, now);
  
  return this.db.lastRowId;
};

DataManager.prototype.getItem = function(url) {
  this.db.query('SELECT * FROM items WHERE url = ?', url);
  var row = this.db.step();
  
  if (row) {
    row.metadata = JSON.parse(row.metadata || '{}');
    return row;
  }
  
  return null;
};

DataManager.prototype.getAllItems = function() {
  this.db.query('SELECT * FROM items ORDER BY updated_at DESC');
  
  var items = [];
  var row;
  while ((row = this.db.step()) !== null) {
    row.metadata = JSON.parse(row.metadata || '{}');
    items.push(row);
  }
  
  return items;
};

DataManager.prototype.setUserData = function(itemId, key, value) {
  this.db.query(`
    INSERT OR REPLACE INTO user_data (item_id, key, value)
    VALUES (?, ?, ?)
  `, itemId, key, JSON.stringify(value));
};

DataManager.prototype.getUserData = function(itemId, key) {
  this.db.query('SELECT value FROM user_data WHERE item_id = ? AND key = ?', itemId, key);
  var row = this.db.step();
  
  if (row) {
    return JSON.parse(row.value);
  }
  
  return null;
};

// Cleanup
DataManager.prototype.cleanup = function() {
  this.clearExpiredCache();
  
  // Clean up old items (older than 30 days)
  var thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  this.db.query('DELETE FROM items WHERE updated_at < ?', thirtyDaysAgo);
  
  this.db.close();
};

// Usage example
var dataManager = new DataManager('myplugin');

// Settings
dataManager.setSetting('apiKey', 'your-api-key');
dataManager.setBooleanSetting('notifications', true);

var apiKey = dataManager.getSetting('apiKey');
var notifications = dataManager.getBooleanSetting('notifications', false);

// Caching
var cachedData = dataManager.getCached('api-response');
if (!cachedData) {
  // Fetch from API
  cachedData = fetchFromAPI();
  dataManager.setCached('api-response', cachedData, 300); // 5 minutes
}

// Database
var itemId = dataManager.saveItem(
  'http://example.com/video.mp4',
  'Sample Video',
  {
    duration: 3600,
    genre: 'action'
  }
);

dataManager.setUserData(itemId, 'favorite', true);
dataManager.setUserData(itemId, 'rating', 5);

var item = dataManager.getItem('http://example.com/video.mp4');
var isFavorite = dataManager.getUserData(item.id, 'favorite');

console.log('Item:', item.title, 'Favorite:', isFavorite);

// Cleanup on plugin unload
Plugin.addURI("plugin:myplugin:cleanup", function() {
  dataManager.cleanup();
});
```

### Backup and Restore System

```javascript
// backup-restore.js - Data backup and restore system

var fs = require('fs');
var store = require('movian/store');
var sqlite = require('movian/sqlite');

function BackupManager(pluginId) {
  this.pluginId = pluginId;
  this.backupPath = Core.storagePath + '/backups/' + pluginId;
  
  // Ensure backup directory exists
  require('native/fs').mkdirs(this.backupPath);
}

BackupManager.prototype.createBackup = function() {
  var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  var backupFile = this.backupPath + '/backup-' + timestamp + '.json';
  
  var backup = {
    version: '1.0',
    timestamp: timestamp,
    pluginId: this.pluginId,
    data: {}
  };
  
  try {
    // Backup store data
    var settingsStore = store.create('settings');
    var cacheStore = store.create('cache');
    
    backup.data.settings = this.cloneObject(settingsStore);
    backup.data.cache = this.cloneObject(cacheStore);
    
    // Backup database
    backup.data.database = this.exportDatabase();
    
    // Save backup file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('Backup created:', backupFile);
    return backupFile;
    
  } catch (e) {
    console.log('Backup failed:', e.message);
    return null;
  }
};

BackupManager.prototype.restoreBackup = function(backupFile) {
  try {
    var backupData = JSON.parse(fs.readFileSync(backupFile));
    
    if (backupData.pluginId !== this.pluginId) {
      throw new Error('Backup is for different plugin: ' + backupData.pluginId);
    }
    
    // Restore store data
    if (backupData.data.settings) {
      var settingsStore = store.create('settings');
      this.restoreObject(settingsStore, backupData.data.settings);
    }
    
    if (backupData.data.cache) {
      var cacheStore = store.create('cache');
      this.restoreObject(cacheStore, backupData.data.cache);
    }
    
    // Restore database
    if (backupData.data.database) {
      this.importDatabase(backupData.data.database);
    }
    
    console.log('Backup restored from:', backupFile);
    return true;
    
  } catch (e) {
    console.log('Restore failed:', e.message);
    return false;
  }
};

BackupManager.prototype.cloneObject = function(obj) {
  var clone = {};
  for (var key in obj) {
    if (obj.hasOwnProperty && obj.hasOwnProperty(key)) {
      clone[key] = obj[key];
    }
  }
  return clone;
};

BackupManager.prototype.restoreObject = function(target, source) {
  // Clear existing data
  for (var key in target) {
    if (target.hasOwnProperty && target.hasOwnProperty(key)) {
      delete target[key];
    }
  }
  
  // Restore data
  for (var key in source) {
    target[key] = source[key];
  }
};

BackupManager.prototype.exportDatabase = function() {
  var db = new sqlite.DB('data');
  var export_data = {
    tables: {}
  };
  
  try {
    // Get all table names
    db.query("SELECT name FROM sqlite_master WHERE type='table'");
    
    var row;
    while ((row = db.step()) !== null) {
      var tableName = row.name;
      
      // Skip system tables
      if (tableName.startsWith('sqlite_')) {
        continue;
      }
      
      // Export table data
      db.query('SELECT * FROM ' + tableName);
      
      var tableData = [];
      var dataRow;
      while ((dataRow = db.step()) !== null) {
        tableData.push(dataRow);
      }
      
      export_data.tables[tableName] = tableData;
    }
    
    db.close();
    return export_data;
    
  } catch (e) {
    console.log('Database export failed:', e.message);
    db.close();
    return null;
  }
};

BackupManager.prototype.importDatabase = function(importData) {
  var db = new sqlite.DB('data');
  
  try {
    // Clear existing data
    for (var tableName in importData.tables) {
      db.query('DELETE FROM ' + tableName);
    }
    
    // Import data
    for (var tableName in importData.tables) {
      var tableData = importData.tables[tableName];
      
      for (var i = 0; i < tableData.length; i++) {
        var row = tableData[i];
        var columns = Object.keys(row);
        var placeholders = columns.map(function() { return '?'; }).join(', ');
        var values = columns.map(function(col) { return row[col]; });
        
        var sql = 'INSERT INTO ' + tableName + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')';
        db.query.apply(db, [sql].concat(values));
      }
    }
    
    db.close();
    console.log('Database import completed');
    
  } catch (e) {
    console.log('Database import failed:', e.message);
    db.close();
    throw e;
  }
};

BackupManager.prototype.listBackups = function() {
  try {
    var files = fs.readdirSync(this.backupPath);
    return files.filter(function(file) {
      return file.startsWith('backup-') && file.endsWith('.json');
    }).sort().reverse(); // Most recent first
  } catch (e) {
    console.log('Failed to list backups:', e.message);
    return [];
  }
};

BackupManager.prototype.deleteOldBackups = function(keepCount) {
  var backups = this.listBackups();
  
  if (backups.length > keepCount) {
    var toDelete = backups.slice(keepCount);
    
    toDelete.forEach(function(backup) {
      try {
        fs.unlinkSync(this.backupPath + '/' + backup);
        console.log('Deleted old backup:', backup);
      } catch (e) {
        console.log('Failed to delete backup:', backup, e.message);
      }
    }.bind(this));
  }
};

// Usage example
var backupManager = new BackupManager('myplugin');

// Create backup
var backupFile = backupManager.createBackup();

// List available backups
var backups = backupManager.listBackups();
console.log('Available backups:', backups);

// Restore from backup
if (backups.length > 0) {
  var success = backupManager.restoreBackup(backupManager.backupPath + '/' + backups[0]);
  if (success) {
    console.log('Restore completed');
  }
}

// Clean up old backups (keep only 5 most recent)
backupManager.deleteOldBackups(5);
```

---

## Version Compatibility

- **Movian 4.8+**: All documented APIs available
- **Movian 4.6-4.7**: Core storage functionality available, some advanced features may be missing
- **Earlier versions**: Basic KVStore and file system support

## See Also

- [Core API Reference](core-api.md) - Service, page, and property APIs
- [HTTP API Reference](http-api.md) - Network and HTTP functionality
- [Settings API Reference](settings-api.md) - Configuration management
- [Plugin Development Guide](../getting-started.md) - Getting started with plugins