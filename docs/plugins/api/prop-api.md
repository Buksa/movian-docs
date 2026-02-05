# Property (Prop) API Reference

Complete reference for Movian's Property System - a reactive, hierarchical data binding framework that powers the plugin architecture.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Module Import](#module-import)
- [Basic Operations](#basic-operations)
- [Tree Management](#tree-management)
- [Subscriptions](#subscriptions)
- [Pagination](#pagination)
- [Atomic Operations](#atomic-operations)
- [Utility Functions](#utility-functions)
- [Advanced Features](#advanced-features)
- [Practical Use Cases](#practical-use-cases)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [API Quick Reference](#api-quick-reference)

---

## Overview

The Property System is the backbone of Movian's reactive architecture. It provides a tree-structured data model where changes automatically propagate to the UI and other subscribed components.

### Key Features

- **Reactive Data Binding**: Changes to properties automatically update the UI
- **Hierarchical Structure**: Properties form a tree with parent-child relationships
- **Event-Driven**: Subscribe to changes and react accordingly
- **Thread-Safe**: Safe for use in multi-threaded environments
- **Memory Efficient**: Automatic cleanup and reference counting

### Common Use Cases

- **Page Management**: Creating and managing page content and metadata
- **UI State**: Tracking loading states, errors, and user interactions
- **Settings**: Managing plugin configuration with persistence
- **Data Synchronization**: Keeping UI in sync with backend data
- **Event Handling**: Responding to user actions and system events

### Architecture

The Property System consists of two layers:

1. **Native Layer** (`src/ecmascript/es_prop.c`): Core C implementation
2. **JavaScript Wrapper** (`res/ecmascript/modules/movian/prop.js`): Proxy-based API

The JavaScript wrapper uses ES6 Proxy objects to provide a clean, intuitive interface while delegating operations to the native layer.

**Source References:**
- JavaScript wrapper: `res/ecmascript/modules/movian/prop.js`
- Native implementation: `src/ecmascript/es_prop.c`
- Usage examples: `res/ecmascript/modules/movian/page.js`, `settings.js`

---

## Core Concepts

### Property Nodes

Properties are organized as nodes in a tree structure. Each node can:
- Hold a value (string, number, boolean, object)
- Have child nodes
- Emit events when changed
- Be subscribed to for updates

```javascript
// Property tree structure example
page (root)
├── metadata
│   ├── title = "My Page"
│   ├── icon = "http://example.com/icon.png"
│   └── description = "Page description"
├── type = "directory"
├── loading = false
├── entries = 10
└── nodes (children container)
    ├── item1
    ├── item2
    └── ...
```

### Proxy Objects

The `prop` module uses JavaScript Proxy objects to provide transparent access to property trees:

```javascript
var prop = require('movian/prop');
var root = prop.createRoot("myProp");

// These operations go through the Proxy handler
root.metadata = {};           // Creates child 'metadata'
root.metadata.title = "Test"; // Sets value on nested child
var title = root.metadata.title; // Gets value
```

**How it works:**
- Property access (`.`) triggers `propHandler.get` in `prop.js:20-31`
- Property assignment triggers `propHandler.set` in `prop.js:33-59`
- The Proxy delegates to native functions via `native/prop`

### Standard Property Paths

Movian uses consistent property paths across the system:

| Path | Purpose | Example |
|------|---------|---------|
| `metadata` | Display metadata (title, icon) | `page.metadata.title` |
| `type` | Node type (directory, video, action) | `page.type = "directory"` |
| `enabled` | Whether item is enabled | `item.enabled = true` |
| `options` | Item options/actions | `item.addOptAction(...)` |
| `eventSink` | Event handling endpoint | `prop.subscribe(root.eventSink, ...)` |
| `nodes` | Container for child items | `page.model.nodes` |
| `url` | Navigation URL | `item.root.url = "plugin:..."` |

### Global Property Tree

The global property tree (`prop.global`) contains system-wide properties:

```javascript
// Access global settings
var globalSettings = prop.global.settings.apps;

// Access global item hooks
var itemHooks = prop.global.itemhooks;
```

**Source:** `prop.js:94` exports `global` from `native/prop.global()`

---

## Module Import

```javascript
var prop = require('movian/prop');
```

**Source:** `res/ecmascript/modules/movian/prop.js:12`

The module exports an object with all property functions. Some functions are directly delegated to the native layer via `exports.__proto__ = np` (line 89).

---

## Basic Operations

### Creating Properties

#### prop.createRoot(name)

Creates a new root property node.

**Parameters:**
- `name` (string, optional): Name for the property

**Returns:** Property object (wrapped in Proxy)

**Source:** `prop.js:97-99` → `native/prop.create()`

**Usage Examples:**
- `page.js:12` - Creates Item root
- `page.js:56` - Creates option nodes
- `settings.js:165` - Creates separator/info nodes

**Example:**
```javascript
// Create a root property
var root = prop.createRoot("myPlugin");

// Create page metadata structure
var page = prop.createRoot("page");
page.metadata = {};
page.metadata.title = "My Page";
page.type = "directory";

// Create item root
var item = prop.createRoot();
item.type = "video";
item.url = "http://example.com/video.mp4";
```

#### prop.makeProp(rawProp)

Wraps a raw native property object in a JavaScript Proxy.

**Parameters:**
- `rawProp` (object): Raw property from native layer

**Returns:** Proxy-wrapped property

**Source:** `prop.js:70-72`

**Usage Examples:**
- `page.js:391` - Wraps page property from route handler
- `page.js:420` - Wraps search model
- `itemhook.js:18` - Wraps navigation property

**Example:**
```javascript
// Raw property from native callback
function callback(rawPageProp, sync) {
    // Wrap in Proxy for clean access
    var page = prop.makeProp(rawPageProp);
    
    // Now you can use dot notation
    page.metadata.title = "My Page";
}
```

### Accessing Properties

#### Dot Notation

Access child properties using dot notation:

```javascript
var root = prop.createRoot("test");

// Create nested structure automatically
root.metadata = {};
root.metadata.title = "Title";
root.metadata.description = "Description";

// Access values
var title = root.metadata.title;
```

**Implementation:** Via Proxy handler `get` in `prop.js:20-31`

#### Dynamic Access

Access properties using bracket notation:

```javascript
var root = prop.createRoot("test");
root["dynamic" + "Name"] = "value";

var value = root["metadata"];
```

#### Enumeration

Iterate over child properties:

```javascript
var root = prop.createRoot("test");
root.child1 = "value1";
root.child2 = "value2";

for (var name in root) {
    console.log(name + ": " + root[name]);
}
// Output: child1: value1, child2: value2
```

**Implementation:** Via `enumerate` handler in `prop.js:61`

#### Existence Check

Check if a child property exists:

```javascript
if ("metadata" in root) {
    console.log("Metadata exists");
}
```

**Implementation:** Via `has` handler in `prop.js:62`

### Working with Values

#### Setting Values

Assign values directly to properties:

```javascript
var root = prop.createRoot("test");

// String values
root.title = "My Title";

// Number values
root.count = 42;

// Boolean values
root.enabled = true;

// Null values
root.optional = null;
```

**Implementation:** Via Proxy handler `set` in `prop.js:33-59`

#### Rich Text Values

For formatted text, use RichText objects:

```javascript
// Setting RichText value
var root = prop.createRoot("test");
var richText = {
    toRichString: function() {
        return "Formatted: **bold** text";
    }
};

root.description = richText;
```

**Implementation:** `prop.js:37-40` checks for `toRichString` method

#### Object Values

When assigning objects, properties are recursively created:

```javascript
var root = prop.createRoot("test");

// This creates nested property structure
root.config = {
    quality: "1080p",
    subtitles: true
};

// Results in:
// root.config.quality = "1080p"
// root.config.subtitles = true
```

**Implementation:** `prop.js:47-54` iterates over object properties

---

## Tree Management

### Parent-Child Relationships

#### prop.setParent(child, parent)

Sets the parent of a child property, adding it to the parent's children.

**Parameters:**
- `child` (Property): The child property to add
- `parent` (Property): The parent property

**Source:** native `setParent()`

**Usage Examples:**
- `page.js:69` - Adds option to item options
- `page.js:295` - Adds item to page nodes
- `settings.js:168` - Adds node to settings group

**Example:**
```javascript
var parent = prop.createRoot("parent");
var child = prop.createRoot("child");

// Make child a child of parent
prop.setParent(child.root, parent.nodes);

// Now child appears in parent's children
```

#### prop.getChild(prop, name)

Gets a child property by name.

**Parameters:**
- `prop` (Property): Parent property
- `name` (string|number): Child name or index

**Returns:** Child property or undefined

**Source:** native `getChild()`

**Implementation:** Via Proxy in `prop.js:30`

**Example:**
```javascript
var root = prop.createRoot("test");
root.child = "value";

// Direct access (preferred)
var child1 = root.child;

// Using getChild
var child2 = prop.getChild(root, "child");
```

#### prop.getName(prop)

Gets the name of a property.

**Parameters:**
- `prop` (Property): The property

**Returns:** String name

**Source:** native `getName()`

**Usage:** `settings.js:247` - Gets option ID from property

**Example:**
```javascript
var root = prop.createRoot("myName");
var name = prop.getName(root); // "myName"
```

### Destruction and Cleanup

#### prop.destroy(prop)

Destroys a property and all its children, removing it from the tree.

**Parameters:**
- `prop` (Property): Property to destroy

**Source:** native `destroy()`

**Usage Examples:**
- `page.js:52` - Destroys option items
- `page.js:100` - Destroys item when removed
- `itemhook.js:37` - Destroys item hook

**Example:**
```javascript
var root = prop.createRoot("test");
var child = prop.createRoot();
prop.setParent(child, root);

// Destroy child
prop.destroy(child);

// child is now invalid (zombie)
```

#### prop.deleteChilds(parent)

Deletes all children of a property.

**Parameters:**
- `parent` (Property): Parent property

**Source:** native `deleteChilds()`

**Usage:** `page.js:338` - Clears all items from page (flush)

**Example:**
```javascript
var root = prop.createRoot("test");
root.child1 = "value1";
root.child2 = "value2";

// Delete all children
prop.deleteChilds(root);

// root is now empty
```

#### prop.deleteChild(prop, name)

Deletes a specific child property.

**Parameters:**
- `prop` (Property): Parent property
- `name` (string): Name of child to delete

**Source:** native `deleteChild()`

**Implementation:** Via Proxy `deleteProperty` in `prop.js:63`

**Example:**
```javascript
var root = prop.createRoot("test");
root.temp = "value";

// Delete specific child
delete root.temp;
// or
prop.deleteChild(root, "temp");
```

#### prop.unloadDestroy(prop)

Marks a property for destruction when the plugin unloads.

**Parameters:**
- `prop` (Property): Property to destroy on unload

**Source:** native `unloadDestroy()`

**Usage Examples:**
- `settings.js:278` - Destroys settings when plugin unloads
- `itemhook.js:11` - Destroys item hook on unload

**Example:**
```javascript
var hook = prop.createRoot("hook");

// Register for auto-cleanup
prop.unloadDestroy(hook);

// hook will be destroyed when plugin is unloaded
```

#### prop.isZombie(prop)

Checks if a property has been destroyed (is no longer valid).

**Parameters:**
- `prop` (Property): Property to check

**Returns:** Boolean (true if destroyed)

**Source:** native `isZombie()`

**Usage Examples:**
- `page.js:218` - Checks if page closed during pagination
- `page.js:399` - Error handling in route callback
- `page.js:440` - Search error handling

**Example:**
```javascript
var root = prop.createRoot("test");
prop.destroy(root);

if (prop.isZombie(root)) {
    console.log("Property is dead");
}
```

### Ordering and Selection

#### prop.moveBefore(prop, beforeProp)

Moves a property before another property in the parent's children list.

**Parameters:**
- `prop` (Property): Property to move
- `beforeProp` (Property|null): Property to move before (null for end)

**Source:** native `moveBefore()`

**Usage Examples:**
- `page.js:105` - Reorders items
- `page.js:231` - Handles item reordering from UI

**Example:**
```javascript
var parent = prop.createRoot("parent");
var item1 = prop.createRoot("item1");
var item2 = prop.createRoot("item2");

prop.setParent(item1, parent);
prop.setParent(item2, parent);

// Move item2 before item1
prop.moveBefore(item2.root, item1.root);

// Order is now: item2, item1
```

#### prop.select(option)

Selects an option property (used in multi-option settings).

**Parameters:**
- `option` (Property): Option to select

**Source:** native `select()`

**Usage:** `settings.js:239` - Selects option in multi-option control

**Example:**
```javascript
var settings = prop.createRoot("settings");
settings.options = {};

var opt1 = prop.createRoot("opt1");
var opt2 = prop.createRoot("opt2");
prop.setParent(opt1, settings.options);
prop.setParent(opt2, settings.options);

// Select opt1
prop.select(opt1);
```

#### prop.link(source, target)

Links two properties together (typically an option to current value).

**Parameters:**
- `source` (Property): Source property
- `target` (Property): Target property to link to

**Source:** native `link()`

**Usage:** `settings.js:240`, `settings.js:249` - Links option to current value

**Example:**
```javascript
var current = prop.createRoot("current");
var option = prop.createRoot("option");

// Link option to current
prop.link(option, current);

// Now changes to current affect option
```

#### prop.unlink(prop)

Removes the link from a property.

**Parameters:**
- `prop` (Property): Property to unlink

**Source:** native `unlink()`

**Example:**
```javascript
// Assuming prop is linked
prop.unlink(prop);
```

### Navigation and Enumeration

#### prop.enumerate(prop)

Returns an array of child property names.

**Parameters:**
- `prop` (Property): Parent property

**Returns:** Array of strings

**Source:** native `enumerate()`

**Implementation:** Via Proxy in `prop.js:61`

**Example:**
```javascript
var root = prop.createRoot("test");
root.a = 1;
root.b = 2;

var names = prop.enumerate(root);
// or
for (var name in root) {
    console.log(name);
}
```

#### prop.has(prop, name)

Checks if a property has a child with the given name.

**Parameters:**
- `prop` (Property): Parent property
- `name` (string): Child name to check

**Returns:** Boolean

**Source:** native `has()`

**Implementation:** Via Proxy in `prop.js:62`

**Example:**
```javascript
var root = prop.createRoot("test");
root.child = "value";

if (prop.has(root, "child")) {
    console.log("Has child");
}

// or using 'in' operator
if ("child" in root) {
    console.log("Has child");
}
```

---

## Subscriptions

The subscription system allows you to react to property changes and events.

### Subscription Methods

#### prop.subscribe(prop, callback, options)

Subscribes to all events on a property.

**Parameters:**
- `prop` (Property): Property to subscribe to
- `callback` (function): Event handler function
- `options` (object, optional): Subscription options

**Returns:** Subscription object with `destroy()` method

**Callback Signature:**
```javascript
function(type, value, value2) {
    // type: Event type (string)
    // value: Primary value (varies by event type)
    // value2: Secondary value (optional)
}
```

**Source:** native `subscribe()` (delegated via `__proto__`)

**Usage Examples:**
- `page.js:62` - Subscribes to action events
- `page.js:130` - Subscribes to item events
- `page.js:203` - Subscribes to page nodes for pagination
- `settings.js:245` - Subscribes to multi-option changes

**Example:**
```javascript
var root = prop.createRoot("test");

// Subscribe to all events
var sub = prop.subscribe(root, function(type, value, value2) {
    console.log("Event: " + type);
    console.log("Value: " + value);
}, {
    autoDestroy: true
});

// Later: unsubscribe
sub.destroy();
```

#### prop.subscribeValue(prop, callback, options)

Subscribes only to value changes (filters events to 'set' type only).

**Parameters:**
- `prop` (Property): Property to subscribe to
- `callback` (function): Value change handler
- `options` (object, optional): Subscription options

**Returns:** Subscription object

**Callback Signature:**
```javascript
function(value) {
    // value: New property value
}
```

**Source:** `prop.js:101-109`

**Usage Examples:**
- `settings.js:78` - Watches setting value changes
- `settings.js:105` - Watches string setting changes
- `settings.js:141` - Watches integer setting changes
- `videoscrobbler.js:18` - Watches playstatus changes

**Example:**
```javascript
var root = prop.createRoot("test");

// Subscribe only to value changes
var sub = prop.subscribeValue(root, function(value) {
    console.log("Value changed to: " + value);
}, {
    autoDestroy: true,
    noInitialUpdate: true
});

root.value = "new value"; // Triggers callback
```

### Subscription Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoDestroy` | boolean | false | Automatically destroy subscription when the property is destroyed |
| `noInitialUpdate` | boolean | false | Skip the initial callback with the current value |
| `ignoreVoid` | boolean | false | Ignore updates where value is void/null |
| `actionAsArray` | boolean | false | Return action events as array instead of string |
| `debug` | boolean | false | Enable debug logging for this subscription |
| `earlyChildDelete` | boolean | false | Receive early notification for child deletion |

**Source:** `es_prop.c` subscription control flags

**Common Combinations:**

```javascript
// For settings (avoid duplicate initial callback)
{
    noInitialUpdate: true,
    ignoreVoid: true,
    autoDestroy: true
}

// For action events (get actions as array)
{
    actionAsArray: true,
    autoDestroy: true
}

// For general use (auto-cleanup)
{
    autoDestroy: true
}
```

### Event Types

When using `prop.subscribe()`, the callback receives these event types:

| Type | Arguments | Description | Common Usage |
|------|-----------|-------------|--------------|
| `"set"` | value | Value was set on property | Value change tracking |
| `"dir"` | - | Property is a directory | Type checking |
| `"action"` | action(s) | Action event received | Button clicks |
| `"selectchild"` | child | Child was selected | Multi-option selection |
| `"wantmorechilds"` | - | Request for more children | Pagination |
| `"addchild"` | child | Child added | Tree monitoring |
| `"delchild"` | child | Child deleted | Tree monitoring |
| `"movechild"` | child, before | Child moved | Reordering |
| `"addchilds"` | array | Multiple children added | Bulk operations |
| `"addchildsbefore"` | array, before | Multiple added before | Bulk operations |
| `"destroyed"` | - | Property destroyed | Cleanup |
| `"reqmove"` | child, before | Request to move child | Drag & drop |
| `"propref"` | prop, nav | Property reference | Item hooks |
| `"unicode"` | code | Unicode input event | Text input |

**Source:** `es_prop.c` event dispatching

### Event Handling

#### prop.sendEvent(prop, type, data)

Sends an event to a property.

**Parameters:**
- `prop` (Property): Target property (usually eventSink)
- `type` (string): Event type
- `data` (any): Event data

**Source:** native `sendEvent()`

**Usage Examples:**
- `page.js:348` - Sends redirect event
- `itemhook.js:23` - Sends openurl event

**Example:**
```javascript
// Send redirect event
prop.sendEvent(page.root.eventSink, "redirect", "plugin:myplugin:page2");

// Send custom event
prop.sendEvent(item.root.eventSink, "action", "customAction");
```

### Subscription Management

#### Subscription Object

The object returned by `subscribe()` and `subscribeValue()`:

```javascript
var sub = prop.subscribe(root, callback, options);

// Destroy the subscription
sub.destroy();
```

**Important:** Always store subscription references if you need to manually destroy them:

```javascript
var subscriptions = [];

subscriptions.push(prop.subscribe(prop1, callback1));
subscriptions.push(prop.subscribe(prop2, callback2));

// Cleanup function
function cleanup() {
    subscriptions.forEach(function(sub) {
        sub.destroy();
    });
    subscriptions = [];
}
```

---

## Pagination

Properties support pagination for lazy loading of large lists.

### prop.haveMore(nodes, hasMore)

Signals whether more children are available for pagination.

**Parameters:**
- `nodes` (Property): The nodes container property
- `hasMore` (boolean): True if more data is available

**Source:** native `haveMore()`

**Usage Examples:**
- `page.js:225` - Signals pagination availability
- `page.js:240` - Updates pagination state

**Example:**
```javascript
new page.Route("example:list", function(page) {
    var currentPage = 1;
    var hasMoreData = true;
    
    page.paginator = function() {
        // Load next page
        var data = loadPage(currentPage);
        
        // Add items
        data.items.forEach(function(item) {
            page.appendItem(item.url, "video", {
                title: item.title
            });
        });
        
        currentPage++;
        hasMoreData = currentPage <= data.totalPages;
        
        // Signal pagination state
        prop.haveMore(page.model.nodes, hasMoreData);
        
        return hasMoreData;
    };
    
    // Load first page
    page.paginator();
});
```

### prop.asyncPaginator

Alternative pagination mode for asynchronous loading.

**Usage:** `page.js:208`

When set as a function, called for async pagination:

```javascript
page.asyncPaginator = function() {
    // Async loading logic
    loadDataAsync(function(data) {
        // Add items
        // Call prop.haveMore()
    });
};
```

---

## Atomic Operations

Thread-safe operations for concurrent access.

### prop.atomicAdd(prop, value)

Atomically adds a value to an integer property.

**Parameters:**
- `prop` (Property): Integer property
- `value` (number): Value to add (can be negative)

**Source:** native `atomicAdd()`

**Usage:** `page.js:432`, `page.js:436` - Loading counter in Searcher

**Example:**
```javascript
// Loading counter
var loading = prop.createRoot("loading");
loading.value = 0;

// Increment (thread-safe)
prop.atomicAdd(loading, 1);

// ... do async work ...

// Decrement (thread-safe)
prop.atomicAdd(loading, -1);
```

### prop.setClipRange(prop, min, max)

Sets clipping range for integer values.

**Parameters:**
- `prop` (Property): Integer property
- `min` (number): Minimum allowed value
- `max` (number): Maximum allowed value

**Source:** native `setClipRange()`

**Usage:** `settings.js:134` - Clips integer setting values

**Example:**
```javascript
var volume = prop.createRoot("volume");

// Clip to 0-100 range
prop.setClipRange(volume, 0, 100);

volume.value = 150; // Will be clipped to 100
volume.value = -10; // Will be clipped to 0
```

---

## Utility Functions

### prop.makeUrl(prop)

Generates a persistent URL from a property tree.

**Parameters:**
- `prop` (Property): Root property

**Returns:** String URL

**Source:** native `makeUrl()`

**Usage Examples:**
- `page.js:431` - Generates URL for search page
- `settings.js:283` - Generates URL for settings page

**Example:**
```javascript
var root = prop.createRoot("myPage");

// Generate URL
var url = prop.makeUrl(root);
// Result: plugin:pluginid:prop:hash

// Can be used for navigation
page.redirect(url);
```

### prop.isSame(prop1, prop2)

Checks if two properties are the same object.

**Parameters:**
- `prop1` (Property): First property
- `prop2` (Property): Second property

**Returns:** Boolean

**Source:** native `isSame()`

**Usage:** `page.js:245` - Finds item by property in array

**Example:**
```javascript
var root = prop.createRoot("test");
var child1 = prop.createRoot();
prop.setParent(child1, root);

var child2 = root[0]; // Get same child via Proxy

console.log(prop.isSame(child1, child2)); // true
```

### prop.isValue(prop)

Checks if a property holds a value (as opposed to being a directory).

**Parameters:**
- `prop` (Property): Property to check

**Returns:** Boolean

**Source:** native `isValue()`

**Usage:** `prop.js:42` - Used when assigning objects

**Example:**
```javascript
var root = prop.createRoot("test");
root.value = "string";

console.log(prop.isValue(root)); // true

root.child = {};
console.log(prop.isValue(root.child)); // false (it's a directory)
```

### prop.print(prop)

Prints the property tree to console for debugging.

**Parameters:**
- `prop` (Property): Root of tree to print

**Source:** native `print()`

**Usage Examples:**
- `page.js:40` - Debug item dump
- `page.js:334` - Debug page dump
- `settings.js:63` - Debug settings dump

**Example:**
```javascript
var root = prop.createRoot("test");
root.metadata = {};
root.metadata.title = "Test Title";
root.items = {};

// Print entire tree
prop.print(root);

// Output:
// [prop tree dump showing all children and values]
```

### prop.release(prop)

Releases a reference to a property.

**Parameters:**
- `prop` (Property): Property to release

**Source:** native `release()`

**Note:** Generally not needed in JavaScript due to garbage collection, but can be used for explicit memory management.

---

## Advanced Features

### Node Filters

Advanced filtering for property trees (rarely needed in plugins).

#### prop.nodeFilterCreate(prop, callback)

Creates a node filter.

**Parameters:**
- `prop` (Property): Root property
- `callback` (function): Filter callback

**Returns:** Filter object

**Source:** native `nodeFilterCreate()`

#### prop.nodeFilterAddPred(filter, ...)

Adds a predicate to a filter.

**Source:** native `nodeFilterAddPred()`

#### prop.nodeFilterDelPred(filter, id)

Removes a predicate from a filter.

**Source:** native `nodeFilterDelPred()`

### Tags

Tagging system for subscriptions.

#### prop.tagSet(subscription, key, value)

Sets a tag on a subscription.

**Parameters:**
- `subscription` (object): Subscription object
- `key` (string): Tag key
- `value` (any): Tag value

**Source:** native `tagSet()`

#### prop.tagClear(subscription, key)

Clears a tag from a subscription.

**Source:** native `tagClear()`

#### prop.tagGet(subscription, key)

Gets a tag value from a subscription.

**Source:** native `tagGet()`

---

## Practical Use Cases

### Use Case 1: Creating a Page with Items

Complete example showing page creation, item management, and cleanup:

```javascript
var page = require('movian/page');
var prop = require('movian/prop');
var http = require('movian/http');

new page.Route("myplugin:list", function(page) {
    // Page setup
    page.type = "directory";
    page.metadata.title = "Video List";
    page.loading = true;
    
    var subscriptions = [];
    var currentPage = 1;
    var hasMore = true;
    
    // Load items
    function loadItems() {
        try {
            var response = http.request(
                "http://api.example.com/videos?page=" + currentPage
            );
            var data = JSON.parse(response.toString());
            
            // Add items
            data.videos.forEach(function(video) {
                var item = page.appendItem(video.url, "video", {
                    title: video.title,
                    icon: video.thumbnail,
                    description: video.description
                });
                
                // Subscribe to item events
                var sub = prop.subscribe(item.root, function(type, val) {
                    if (type === "action") {
                        console.log("Action on item: " + val);
                    }
                }, { autoDestroy: true });
                
                subscriptions.push(sub);
            });
            
            currentPage++;
            hasMore = currentPage <= data.totalPages;
            prop.haveMore(page.model.nodes, hasMore);
            
        } catch (e) {
            page.error("Failed to load: " + e.message);
            console.error("Load error: " + e);
        }
        
        page.loading = false;
    }
    
    // Pagination
    page.paginator = function() {
        if (!hasMore) return false;
        
        try {
            loadItems();
        } catch (e) {
            // Check if page was closed
            if (!prop.isZombie(page.root)) {
                console.error("Pagination error: " + e);
            }
            return false;
        }
        
        return hasMore;
    };
    
    // Load first page
    loadItems();
    
    // Cleanup is automatic with autoDestroy: true
    // But we could manually cleanup if needed:
    // page.onEvent("destroy", function() {
    //     subscriptions.forEach(function(sub) { sub.destroy(); });
    // });
});
```

### Use Case 2: Settings with Multi-Option

Complete example of settings with multi-option selection:

```javascript
var settings = require('movian/settings');
var prop = require('movian/prop');
var store = require('movian/store');

// Storage for persistence
var config = store.create("myplugin_config");

// Create settings group
var pluginSettings = new settings.globalSettings(
    "myplugin-settings",
    "My Plugin Settings",
    Plugin.path + "icon.png",
    "Configure plugin options"
);

// Multi-option for quality selection
var qualityOptions = [
    ["720", "720p", false],
    ["1080", "1080p", true],  // default
    ["4k", "4K Ultra HD", false]
];

// Create the multi-option setting
pluginSettings.createMultiOpt(
    "quality",
    "Video Quality",
    qualityOptions,
    function(selected) {
        config.quality = selected;
        console.log("Quality changed to: " + selected);
    },
    true  // persistent
);

// Behind the scenes (inside settings.js):
// 1. Creates property structure
// 2. Sets up options as children
// 3. Subscribes to selection changes
// 4. Links selected option to current value

// How it works:
var model = prop.createRoot("quality_model");
model.type = "multiopt";
model.options = {};

// Add options
qualityOptions.forEach(function(opt) {
    var optProp = prop.createRoot(opt[0]);
    optProp.title = opt[1];
    prop.setParent(optProp, model.options);
});

// Subscribe to selection
prop.subscribe(model.options, function(type, child) {
    if (type === "selectchild") {
        var selectedId = prop.getName(child);
        
        // Link selected option to current
        prop.select(child);
        prop.link(child, model.current);
        
        // Save and callback
        config.quality = selectedId;
        callback(selectedId);
    }
}, { autoDestroy: true, noInitialUpdate: true });

// Integer setting with range
pluginSettings.createInt(
    "volume",
    "Volume",
    50,     // default
    0,      // min
    100,    // max
    5,      // step
    "%",    // unit
    function(value) {
        config.volume = value;
    },
    true    // persistent
);

// Behind the scenes:
// Uses prop.setClipRange(item.model.value, min, max)
// to enforce the range
```

### Use Case 3: Item Hook Registration

Complete example of creating an item hook:

```javascript
var itemhook = require('movian/itemhook');
var prop = require('movian/prop');

// Create item hook
var hook = itemhook.create({
    itemtype: "video",
    title: "My Hook",
    icon: Plugin.path + "icon.png",
    
    handler: function(item, nav) {
        // item is prop.makeProp(obj)
        // nav is { openURL: function(url) { ... } }
        
        console.log("Hook called for: " + item.metadata.title);
        
        // Add custom option
        item.addOptAction("Custom Action", function() {
            console.log("Custom action triggered");
            
            // Open related URL
            nav.openURL("plugin:myplugin:related:" + item.url);
        });
    }
});

// Behind the scenes (itemhook.js):
// 1. Creates root property
// 2. Registers in prop.global.itemhooks
// 3. Subscribes to propref events

var node = prop.createRoot();
node.itemtype = "video";
prop.unloadDestroy(node);  // Auto-cleanup
prop.setParent(node, prop.global.itemhooks);

prop.subscribe(node.eventSink, function(type, obj, nav) {
    if (type === "propref") {
        // Wrap properties
        var item = prop.makeProp(obj);
        var navObj = {
            openURL: function(url) {
                nav = nav ? prop.makeProp(nav) : undefined;
                if (nav) {
                    prop.sendEvent(nav.eventSink, "openurl", { url: url });
                }
            }
        };
        
        // Call handler
        conf.handler(item, navObj);
    }
}, { autoDestroy: true });
```

### Use Case 4: Video Playback Tracking

Complete example of tracking video playback:

```javascript
var videoscrobbler = require('movian/videoscrobbler');
var prop = require('movian/prop');

var scrobbler = new videoscrobbler.VideoScrobbler();

scrobbler.onstart = function(data, prop, origin) {
    // Wrap properties
    var videoProp = prop.makeProp(prop);
    var originProp = prop.makeProp(origin);
    
    console.log("Started: " + data.title);
    console.log("Current time: " + prop.currenttime);
    
    // Subscribe to play status
    var sub = prop.subscribeValue(prop.playstatus, function(status) {
        if (status === "play") {
            console.log("Playing");
        } else if (status === "pause") {
            console.log("Paused");
        }
    }, { autoDestroy: true });
};

scrobbler.onstop = function(data, prop, origin) {
    var percent = (data.stopposition / data.duration) * 100;
    console.log("Stopped at " + percent.toFixed(1) + "%");
    
    if (percent > 90) {
        console.log("Video completed!");
    }
};
```

### Use Case 5: Dynamic UI Updates

Example of reactive UI updates with property binding:

```javascript
var page = require('movian/page');
var prop = require('movian/prop');

new page.Route("myplugin:dynamic", function(page) {
    page.type = "directory";
    page.metadata.title = "Dynamic UI";
    
    // Create reactive properties
    var state = prop.createRoot("state");
    state.count = 0;
    state.loading = false;
    
    // Add counter display
    var counterItem = page.appendPassiveItem("label", {}, {
        title: "Count: 0"
    });
    
    // Subscribe to count changes
    prop.subscribeValue(state, function(value) {
        // Check if this is the count property
        if (this && this.count !== undefined) {
            counterItem.root.metadata.title = "Count: " + state.count;
        }
    }.bind(state), { autoDestroy: true });
    
    // Add increment action
    page.appendAction("Increment", function() {
        state.count++;
    });
    
    // Add async load action
    page.appendAction("Load Data", function() {
        state.loading = true;
        page.loading = true;
        
        // Simulate async load
        setTimeout(function() {
            if (!prop.isZombie(page.root)) {
                state.count += 10;
                state.loading = false;
                page.loading = false;
            }
        }, 2000);
    });
    
    page.loading = false;
});
```

---

## Best Practices

### Subscription Management

**Always store subscription references if you need manual cleanup:**

```javascript
// Good: Store references
var subs = [];
subs.push(prop.subscribe(prop1, callback1));
subs.push(prop.subscribe(prop2, callback2));

// Cleanup when done
function cleanup() {
    subs.forEach(function(sub) { sub.destroy(); });
}

// Good: Use autoDestroy for automatic cleanup
prop.subscribe(prop, callback, { autoDestroy: true });
```

### Resource Cleanup

**Use appropriate cleanup method:**

```javascript
// For temporary properties
prop.destroy(prop);

// For persistent properties (settings, hooks)
prop.unloadDestroy(prop);

// For clearing page items
prop.deleteChilds(page.model.nodes);
```

### Error Handling

**Always check isZombie in async operations:**

```javascript
function asyncOperation() {
    http.request(url, function(err, response) {
        // Check if property still valid
        if (prop.isZombie(page.root)) {
            console.log("Page closed, ignoring response");
            return;
        }
        
        // Process response
        // ...
    });
}
```

### Performance

1. **Avoid deep property trees** - Keep hierarchies shallow
2. **Batch updates** - Make multiple changes before triggering events
3. **Use specific subscriptions** - Subscribe to specific properties, not root
4. **Cache property references** - Don't look up properties repeatedly
5. **Clean up subscriptions** - Prevent memory leaks

### Common Patterns

**Pattern 1: Loading State**
```javascript
page.loading = true;
http.request(url, function(err, response) {
    if (!prop.isZombie(page.root)) {
        // Process response
        page.loading = false;
    }
});
```

**Pattern 2: Computed Properties**
```javascript
var firstName = prop.createRoot("first");
var lastName = prop.createRoot("last");
var fullName = prop.createRoot("full");

function update() {
    fullName.value = firstName.value + " " + lastName.value;
}

prop.subscribeValue(firstName, update, { autoDestroy: true });
prop.subscribeValue(lastName, update, { autoDestroy: true });
```

**Pattern 3: Settings with Validation**
```javascript
var setting = prop.createRoot("setting");

prop.subscribeValue(setting, function(value) {
    if (value < 0 || value > 100) {
        console.error("Invalid value, resetting");
        setting.value = 50;
    }
}, { autoDestroy: true });
```

---

## Common Pitfalls

### 1. Subscription Leaks

**Problem:** Not destroying subscriptions leads to memory leaks.

```javascript
// BAD: No cleanup
function setup() {
    prop.subscribe(root, callback); // Subscription never destroyed
}

// GOOD: Auto cleanup
function setup() {
    prop.subscribe(root, callback, { autoDestroy: true });
}

// GOOD: Manual cleanup
var sub = prop.subscribe(root, callback);
sub.destroy();
```

### 2. Accessing Zombie Properties

**Problem:** Using properties after they're destroyed causes errors.

```javascript
// BAD: No check
prop.destroy(root);
root.value = "test"; // Error!

// GOOD: Check first
prop.destroy(root);
if (!prop.isZombie(root)) {
    root.value = "test";
}

// GOOD: Defensive async
http.request(url, function() {
    if (!prop.isZombie(root)) {
        root.value = "done";
    }
});
```

### 3. Circular Dependencies

**Problem:** Subscriptions that update each other create infinite loops.

```javascript
// BAD: Circular update
prop.subscribe(prop1, function() {
    prop2.value = prop1.value;
});
prop.subscribe(prop2, function() {
    prop1.value = prop2.value; // Infinite loop!
});

// GOOD: One-way binding
prop.subscribe(prop1, function() {
    prop2.value = prop1.value;
});
```

### 4. Wrong Subscription Options

**Problem:** Using wrong options causes unexpected behavior.

```javascript
// BAD: Missing autoDestroy causes leak
prop.subscribe(root, callback);

// BAD: actionAsArray without handling array
prop.subscribe(root.eventSink, function(type, val) {
    // val is array, not string!
}, { actionAsArray: true });

// GOOD: Proper options
prop.subscribe(root, callback, { 
    autoDestroy: true,
    actionAsArray: true 
});
```

### 5. Confusing Value Types

**Problem:** Not understanding when properties are values vs directories.

```javascript
var root = prop.createRoot("test");
root.child = "value";

// root is a directory (has children)
// root.child is a value (holds "value")

if (prop.isValue(root)) {
    // false - root is directory
}

if (prop.isValue(root.child)) {
    // true - child holds value
}
```

---

## API Quick Reference

### Complete Function List

**Property Creation:**
```javascript
prop.createRoot(name)           // Create root property
prop.makeProp(rawProp)          // Wrap in Proxy
prop.global                     // Access global tree
```

**Tree Management:**
```javascript
prop.setParent(child, parent)   // Set parent relationship
prop.destroy(prop)              // Destroy property
prop.deleteChilds(parent)       // Delete all children
prop.deleteChild(prop, name)    // Delete specific child
prop.unloadDestroy(prop)        // Destroy on unload
prop.moveBefore(prop, before)   // Reorder
prop.select(option)             // Select option
prop.link(source, target)       // Link properties
prop.unlink(prop)               // Unlink property
```

**Access:**
```javascript
prop.getChild(prop, name)       // Get child
prop.getName(prop)              // Get property name
prop.enumerate(prop)            // List children
prop.has(prop, name)            // Check existence
prop.getValue(prop)             // Get value (native)
prop.set(prop, key, value)      // Set value (native)
prop.setRichStr(prop, k, v)     // Set rich text
```

**Subscriptions:**
```javascript
prop.subscribe(prop, cb, opts)      // Subscribe to events
prop.subscribeValue(prop, cb, opts) // Subscribe to values
prop.sendEvent(prop, type, data)    // Send event
```

**Pagination:**
```javascript
prop.haveMore(nodes, hasMore)   // Signal pagination
```

**Atomic Operations:**
```javascript
prop.atomicAdd(prop, value)     // Atomic addition
prop.setClipRange(prop, min, max) // Clip range
```

**Utilities:**
```javascript
prop.makeUrl(prop)              // Generate URL
prop.isSame(p1, p2)             // Compare properties
prop.isZombie(prop)             // Check validity
prop.isValue(prop)              // Check if value
prop.print(prop)                // Debug print
prop.release(prop)              // Release reference
```

**Filters (Advanced):**
```javascript
prop.nodeFilterCreate(prop, cb)
prop.nodeFilterAddPred(filter, ...)
prop.nodeFilterDelPred(filter, id)
```

**Tags (Advanced):**
```javascript
prop.tagSet(sub, key, value)
prop.tagClear(sub, key)
prop.tagGet(sub, key)
```

### Subscription Options

| Option | Type | Description |
|--------|------|-------------|
| `autoDestroy` | boolean | Auto-cleanup on prop destroy |
| `noInitialUpdate` | boolean | Skip initial callback |
| `ignoreVoid` | boolean | Ignore void/null values |
| `actionAsArray` | boolean | Actions as array |
| `debug` | boolean | Debug logging |
| `earlyChildDelete` | boolean | Early delete notification |

### Common Event Types

| Type | Description |
|------|-------------|
| `"set"` | Value changed |
| `"action"` | Action triggered |
| `"selectchild"` | Child selected |
| `"wantmorechilds"` | Need more data (pagination) |
| `"destroyed"` | Property destroyed |
| `"propref"` | Property reference (hooks) |

---

## See Also

- [Page API](page-api.md) - Page management and navigation
- [Settings API](settings-api.md) - Plugin settings
- [Core API](core-api.md) - Core plugin functionality
- [API v1→v2 Migration](api-v1-to-v2-migration.md) - Migration guide

## Source References

- JavaScript Wrapper: `res/ecmascript/modules/movian/prop.js`
- Native Implementation: `src/ecmascript/es_prop.c`
- Usage Examples:
  - `res/ecmascript/modules/movian/page.js`
  - `res/ecmascript/modules/movian/settings.js`
  - `res/ecmascript/modules/movian/itemhook.js`
  - `res/ecmascript/modules/movian/videoscrobbler.js`
