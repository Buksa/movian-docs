# Core Plugin API Reference

This document provides comprehensive reference for Movian's core plugin APIs including service registration, page management, and property system.

## Table of Contents

- [Service API](#service-api)
- [Page API](#page-api)
- [Property (Prop) API](#property-prop-api)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Service API

The Service API allows plugins to register services that appear in Movian's main interface.

### Module: `movian/service`

**Source References:**
- Native implementation: `movian/src/ecmascript/es_service.c`
- JavaScript wrapper: `movian/res/ecmascript/modules/movian/service.js`

### Functions

#### `service.create(title, url, type, enabled, icon)`

Creates and registers a new service in Movian's interface.

**Parameters:**
- `title` (string): Display name for the service
- `url` (string): URL that will be opened when service is accessed
- `type` (string): Service type (e.g., 'directory', 'video', 'music')
- `enabled` (boolean): Whether the service is initially enabled
- `icon` (string, optional): Path to service icon

**Returns:**
- `Service`: Service object with control methods

**Example:**
```javascript
var service = require('movian/service');

var myService = service.create(
  'My Video Service',           // title
  'plugin:myplugin:browse',     // url
  'video',                      // type
  true,                         // enabled
  Plugin.path + 'icon.png'      // icon
);
```

**Source Reference:** `es_service_create()` in `movian/src/ecmascript/es_service.c:89-130`

### Service Object Methods

#### `service.destroy()`

Removes the service from Movian's interface and cleans up resources.

**Example:**
```javascript
myService.destroy();
```

#### `service.enabled` (property)

Gets or sets the service enabled state.

**Type:** `boolean`

**Example:**
```javascript
// Get current state
var isEnabled = myService.enabled;

// Set enabled state
myService.enabled = false;
```

**Source Reference:** `es_service_enable()` in `movian/src/ecmascript/es_service.c:132-148`

---

## Page API

The Page API provides functionality for creating and managing content pages within Movian.

### Module: `movian/page`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/movian/page.js`
- Native route handling: `movian/src/ecmascript/es_route.c`

### Classes

#### `Page`

Represents a content page that can display items, handle navigation, and manage user interaction.

**Constructor:** Created automatically by Route handlers

**Properties:**
- `type` (string): Page type ('directory', 'video', 'music', etc.)
- `metadata` (object): Page metadata (title, description, icon, etc.)
- `loading` (boolean): Loading state indicator
- `source` (string): Content source identifier
- `entries` (number): Number of entries on the page
- `paginator` (function): Function for handling pagination

### Page Methods

#### `page.appendItem(url, type, metadata)`

Adds a new item to the page.

**Parameters:**
- `url` (string): Item URL for navigation
- `type` (string): Item type ('video', 'directory', 'separator', 'list', etc.)
- `metadata` (object): Item metadata

**Returns:**
- `Item`: Created item object

**Example:**
```javascript
var item = page.appendItem(
  'videoparams:' + JSON.stringify({
    sources: [{url: 'http://example.com/video.mp4'}],
    title: 'Sample Video'
  }),
  'video',
  {
    title: 'Sample Video',
    description: 'A sample video file',
    icon: 'http://example.com/thumb.jpg'
  }
);
```

**Special Behavior for Video Items:**
For items with `type: 'video'`, the system automatically binds playback metadata (playcount, lastplayed, restartpos) from kvstore using the URL as key. This enables resume functionality and viewing history tracking.

**Source Reference:** `Page.prototype.appendItem` in `movian/res/ecmascript/modules/movian/page.js:200-235`

#### `page.appendAction(title, func, subtype)`

Adds an action item that executes a function when activated.

**Parameters:**
- `title` (string): Action display name
- `func` (function): Function to execute when activated
- `subtype` (string, optional): Action subtype for styling

**Returns:**
- `Item`: Created action item

**Example:**
```javascript
page.appendAction('Refresh Content', function() {
  // Reload page content
  loadContent();
}, 'refresh');
```

#### `page.appendPassiveItem(type, data, metadata)`

Adds a passive item that displays data without navigation.

**Parameters:**
- `type` (string): Item type
- `data` (any): Item data payload
- `metadata` (object): Display metadata

**Returns:**
- `Item`: Created passive item

#### `page.getItems()`

Returns a copy of all items on the page.

**Returns:**
- `Array<Item>`: Copy of items array

**Example:**
```javascript
var allItems = page.getItems();
console.log('Page has ' + allItems.length + ' items');
```

#### `page.flush()`

Removes all items from the page.

**Example:**
```javascript
page.flush(); // Clear all content
```

#### `page.error(message)`

Sets the page to error state with the specified message.

**Parameters:**
- `message` (string): Error message to display

**Example:**
```javascript
page.error('Failed to load content: Network timeout');
```

#### `page.redirect(url)`

Redirects the page to a new URL.

**Parameters:**
- `url` (string): Target URL

**Example:**
```javascript
page.redirect('plugin:myplugin:settings');
```

#### `page.dump()`

Dumps the page's property tree to console for debugging.

**Example:**
```javascript
page.dump(); // Print page structure to console
```

### Route Registration

#### `new page.Route(pattern, callback)`

Registers a URL route handler for the plugin.

**Parameters:**
- `pattern` (string): URL pattern to match (regex supported)
- `callback` (function): Handler function receiving (page, ...args)

**Example:**
```javascript
var route = new page.Route('^plugin:myplugin:browse:(.*)$', function(page, category) {
  page.type = 'directory';
  page.metadata.title = 'Browse ' + category;
  
  // Load and display content for category
  loadCategoryContent(page, category);
});
```

### Search Integration

#### `new page.Searcher(title, icon, callback)`

Registers a search provider that appears in Movian's global search.

**Parameters:**
- `title` (string): Search provider name
- `icon` (string): Provider icon path
- `callback` (function): Search handler receiving (page, query)

**Example:**
```javascript
var searcher = new page.Searcher(
  'My Video Search',
  Plugin.path + 'search-icon.png',
  function(page, query) {
    page.type = 'directory';
    
    // Perform search and add results
    var results = searchVideos(query);
    results.forEach(function(video) {
      page.appendItem(video.url, 'video', video.metadata);
    });
  }
);
```

---

## Property (Prop) API

The Property API provides access to Movian's property tree system for data binding and state management.

### Module: `movian/prop`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/movian/prop.js`
- Native implementation: `movian/src/ecmascript/es_prop.c`

### Global Properties

#### `prop.global`

Access to the global property tree containing system-wide properties.

**Type:** `Object` (Proxied property object)

**Example:**
```javascript
var prop = require('movian/prop');

// Access current time
var currentTime = prop.global.clock.unixtime;

// Access current page URL
var currentUrl = prop.global.navigators.current.currentpage.url;
```

### Functions

#### `prop.createRoot(name)`

Creates a new root property node.

**Parameters:**
- `name` (string, optional): Property name

**Returns:**
- `Object`: New proxied property object

**Example:**
```javascript
var root = prop.createRoot('mydata');
root.title = 'My Title';
root.count = 42;
```

#### `prop.makeProp(nativeProp)`

Creates a proxied version of a raw native property object.

**Parameters:**
- `nativeProp` (Object): Raw native property object

**Returns:**
- `Object`: Proxied property object with get/set handlers

**Example:**
```javascript
// Usually called internally, but can be used to wrap native props
var proxied = prop.makeProp(rawNativeProp);
```

#### `prop.subscribe(target, callback, options)`

Subscribes to property changes and events.

**Parameters:**
- `target` (Object): Property object to monitor
- `callback` (function): Callback function receiving (type, value1, value2)
- `options` (Object, optional): Subscription options

**Options:**
- `autoDestroy` (boolean): Auto-cleanup when property is destroyed
- `noInitialUpdate` (boolean): Skip initial callback invocation
- `ignoreVoid` (boolean): Ignore void/undefined values
- `actionAsArray` (boolean): Receive action events as arrays

**Returns:**
- `Object`: Subscription handle for cleanup

**Example:**
```javascript
var subscription = prop.subscribe(item.root.eventSink, function(type, value) {
  if (type === 'action' && value === 'Activate') {
    console.log('Item was activated');
  }
}, {
  autoDestroy: true,
  actionAsArray: true
});
```

#### `prop.subscribeValue(target, callback, options)`

Subscribes specifically to property value changes.

**Parameters:**
- `target` (Object): Property object to monitor
- `callback` (function): Callback receiving new value
- `options` (Object, optional): Subscription options

**Example:**
```javascript
prop.subscribeValue(settings.enabled, function(newValue) {
  console.log('Setting changed to:', newValue);
}, {
  ignoreVoid: true,
  autoDestroy: true
});
```

#### `prop.sendEvent(target, event, data)`

Sends an event to a property's event sink.

**Parameters:**
- `target` (Object): Target property object (usually eventSink)
- `event` (string): Event name ('focus', 'action', 'redirect', etc.)
- `data` (any): Event data

**Example:**
```javascript
// Send focus event to an item
prop.sendEvent(item.root.eventSink, 'focus');

// Send redirect event
prop.sendEvent(page.root.eventSink, 'redirect', 'plugin:myplugin:settings');
```

#### `prop.setParent(child, parent)`

Attaches a property as child of another property in the tree.

**Parameters:**
- `child` (Object): Child property object
- `parent` (Object): Parent property object

**Example:**
```javascript
var item = prop.createRoot();
item.type = 'video';
item.metadata.title = 'My Video';

// Attach to page's nodes
prop.setParent(item, page.model.nodes);
```

#### `prop.print(target)`

Prints property tree structure to console for debugging.

**Parameters:**
- `target` (Object): Property object to dump

**Example:**
```javascript
prop.print(page.root); // Debug page structure
```

#### `prop.isSame(prop1, prop2)`

Compares if two property objects refer to the same native object.

**Parameters:**
- `prop1` (Object): First property object
- `prop2` (Object): Second property object

**Returns:**
- `boolean`: True if both properties refer to the same native object

**Example:**
```javascript
var isSameItem = prop.isSame(item1.root, item2.root);
```

---

## Item API

Items represent individual content entries within pages.

### Item Properties

- `root` (Object): Root property object containing all item data
- `page` (Object): Reference to parent page
- `eventhandlers` (Object): Event handler registry

### Item Methods

#### `item.bindVideoMetadata(metadata)`

Binds video metadata to the item, including playback history from kvstore.

**Parameters:**
- `metadata` (Object): Metadata object with title and other video properties

**Description:**
Automatically binds kvstore data (playcount, lastplayed, restartpos) to the item's root property. This data is used for resume functionality and tracking viewing history. The binding is asynchronous.

**Example:**
```javascript
item.bindVideoMetadata({
  title: 'My Movie',
  duration: 7200,
  year: 2023
});
```

#### `item.unbindVideoMetadata()`

Removes video metadata binding and cleans up resources.

**Example:**
```javascript
item.unbindVideoMetadata();
```

#### `item.dump()`

Dumps the item's property tree to console for debugging.

**Example:**
```javascript
item.dump(); // Print item structure
```

#### `item.enable()` / `item.disable()`

Enables or disables the item in the interface.

**Example:**
```javascript
item.enable();  // Make item selectable
item.disable(); // Gray out item
```

#### `item.addOptAction(title, func, subtype)`

Adds an action to the item's context menu.

**Parameters:**
- `title` (string): Action display name
- `func` (function): Function to execute
- `subtype` (string, optional): Action subtype

**Returns:**
- `Object`: Option node for further customization

**Example:**
```javascript
item.addOptAction('Mark as Favorite', function() {
  markAsFavorite(item);
}, 'favorite');
```

#### `item.addOptURL(title, url, subtype)`

Adds a URL navigation option to the item's context menu.

**Parameters:**
- `title` (string): Option display name
- `url` (string): Target URL
- `subtype` (string, optional): Option subtype

**Example:**
```javascript
item.addOptURL('View Details', 'plugin:myplugin:details:' + item.id);
```

#### `item.onEvent(type, callback)`

Registers an event handler for the item.

**Parameters:**
- `type` (string): Event type to listen for
- `callback` (function): Event handler function

**Example:**
```javascript
item.onEvent('Activate', function() {
  console.log('Item was activated');
});
```

---

## Error Handling

### Common Error Patterns

#### Service Creation Errors
```javascript
try {
  var service = require('movian/service').create(
    'My Service', 'plugin:myplugin:browse', 'video', true
  );
} catch (e) {
  console.log('Failed to create service:', e.message);
}
```

#### Page Loading Errors
```javascript
function loadContent(page) {
  try {
    // Load content logic
    var data = fetchData();
    data.forEach(function(item) {
      page.appendItem(item.url, item.type, item.metadata);
    });
  } catch (e) {
    page.error('Failed to load content: ' + e.message);
  }
}
```

#### Property Access Errors
```javascript
try {
  var value = prop.global.some.deep.property;
} catch (e) {
  console.log('Property access failed:', e.message);
  // Handle missing property gracefully
}
```

### Error Types

- **Resource Errors**: Service/route registration failures
- **Property Errors**: Invalid property access or modification
- **Navigation Errors**: Invalid URLs or routing failures
- **Binding Errors**: Failed property subscriptions or bindings

---

## Examples

### Complete Plugin Example

```javascript
// plugin.js - Complete plugin demonstrating core APIs

var service = require('movian/service');
var page = require('movian/page');
var prop = require('movian/prop');

// Create main service
var myService = service.create(
  'My Video Plugin',
  'plugin:myvideo:browse',
  'video',
  true,
  Plugin.path + 'icon.png'
);

// Register browse route
var browseRoute = new page.Route('^plugin:myvideo:browse$', function(page) {
  page.type = 'directory';
  page.metadata.title = 'My Videos';
  page.metadata.icon = Plugin.path + 'icon.png';
  
  // Add some sample content
  page.appendItem(
    'videoparams:' + JSON.stringify({
      sources: [{url: 'http://example.com/video1.mp4'}],
      title: 'Sample Video 1'
    }),
    'video',
    {
      title: 'Sample Video 1',
      description: 'First sample video',
      duration: 3600
    }
  );
  
  // Add action for refreshing
  page.appendAction('Refresh', function() {
    page.flush();
    loadContent(page);
  });
});

// Register search provider
var searcher = new page.Searcher(
  'My Video Search',
  Plugin.path + 'search-icon.png',
  function(page, query) {
    page.type = 'directory';
    
    // Simulate search
    if (query.toLowerCase().includes('sample')) {
      page.appendItem(
        'plugin:myvideo:video:sample1',
        'video',
        {
          title: 'Sample Video Result',
          description: 'Found in search: ' + query
        }
      );
    }
  }
);

// Cleanup on plugin unload
Plugin.addURI("plugin:myvideo:*", function(uri) {
  // Handle additional routes
});
```

### Advanced Property Binding Example

```javascript
// Advanced property binding and event handling

var prop = require('movian/prop');

function createInteractiveItem(page, data) {
  var item = page.appendItem(data.url, data.type, data.metadata);
  
  // Bind video metadata for resume functionality
  if (data.type === 'video') {
    item.bindVideoMetadata(data.metadata);
  }
  
  // Add context menu options
  item.addOptAction('Mark as Watched', function() {
    // Update watch status
    item.root.playcount = (item.root.playcount || 0) + 1;
    item.root.lastplayed = Date.now() / 1000;
  });
  
  item.addOptAction('Add to Favorites', function() {
    // Add to favorites list
    var favorites = getFavoritesList();
    favorites.push(data.url);
    saveFavoritesList(favorites);
  });
  
  // Handle item events
  item.onEvent('Activate', function() {
    console.log('Playing:', data.metadata.title);
  });
  
  // Subscribe to property changes
  prop.subscribeValue(item.root.playcount, function(count) {
    console.log('Play count updated:', count);
  }, {
    ignoreVoid: true,
    autoDestroy: true
  });
  
  return item;
}
```

---

## Version Compatibility

- **Movian 4.8+**: All documented APIs available
- **Movian 4.6-4.7**: Core APIs available, some advanced features may be missing
- **Earlier versions**: Limited API support, check individual function availability

## See Also

- [HTTP API Reference](http-api.md) - Network and HTTP functionality
- [Storage API Reference](storage-api.md) - Data persistence and storage
- [Settings API Reference](settings-api.md) - Configuration management
- [Plugin Development Guide](../getting-started.md) - Getting started with plugins