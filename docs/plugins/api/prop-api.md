# Property API

Complete reference for Movian's property system - a reactive data binding framework for plugins.

## Overview

The property system provides:
- Reactive data binding
- Hierarchical property trees
- Automatic UI updates
- Subscription-based notifications
- Thread-safe operations

**Use Cases**:
- Page metadata and content
- Dynamic UI updates
- Data synchronization
- State management
- Event propagation

## Module Import

```javascript
var prop = require('movian/prop');
```

## Property Creation

### Create Root Property

```javascript
/**
 * Create root property node
 * @param {string} name - Optional property name
 * @returns {Property} Root property
 */
var root = prop.createRoot(name);
```

### Create Child Property

```javascript
/**
 * Create child property
 * @param {Property} parent - Parent property
 * @param {string} name - Property name
 * @returns {Property} Child property
 */
var child = prop.create(parent, name);
```

**Example**:
```javascript
// Create property tree
var metadata = prop.createRoot("metadata");
var title = prop.create(metadata, "title");
var description = prop.create(metadata, "description");

// Set values
title.value = "My Title";
description.value = "My Description";
```

## Property Values

### Setting Values

```javascript
// Direct assignment
property.value = "string value";
property.value = 123;
property.value = true;
property.value = null;

// Typed setters
prop.setString(property, "text");
prop.setInt(property, 42);
prop.setFloat(property, 3.14);
prop.setBool(property, true);
```

### Getting Values

```javascript
// Direct access
var value = property.value;

// Typed getters
var str = prop.getString(property);
var num = prop.getInt(property);
var float = prop.getFloat(property);
var bool = prop.getBool(property);
```

## Subscriptions

### Subscribe to Changes

```javascript
/**
 * Subscribe to property changes
 * @param {Property} property - Property to watch
 * @param {Function} callback - Callback function
 * @param {Object} options - Subscription options
 * @returns {Subscription} Subscription object
 */
var subscription = prop.subscribe(property, function(value) {
    console.log("Property changed to:", value);
}, options);
```

**Example**:
```javascript
var title = prop.createRoot("title");

// Subscribe to changes
var sub = prop.subscribe(title, function(value) {
    console.log("Title changed to:", value);
});

title.value = "New Title";  // Triggers callback

// Unsubscribe
sub.destroy();
```

### Subscription Options

```javascript
var sub = prop.subscribe(property, callback, {
    // Call immediately with current value
    immediate: true,
    
    // Include property name in callback
    includeName: true,
    
    // Subscribe to child properties
    recursive: true
});
```

## Property Trees

### Navigating Trees

```javascript
// Access parent
var parent = property.parent;

// Access children
var children = property.children;

// Find child by name
var child = property.getChild("childName");

// Check if property exists
if (property.exists) {
    // Property is valid
}
```

### Tree Operations

```javascript
// Delete property
prop.destroy(property);

// Move property
prop.move(property, newParent);

// Copy property
var copy = prop.copy(property);

// Clear all children
prop.clear(property);
```

**Example**:
```javascript
var page = prop.createRoot("page");
var metadata = prop.create(page, "metadata");
var items = prop.create(page, "items");

// Add items
for (var i = 0; i < 10; i++) {
    var item = prop.create(items, "item" + i);
    prop.setString(prop.create(item, "title"), "Item " + i);
}

// Clear items
prop.clear(items);
```

## Page Properties

### Page Metadata

```javascript
// Page properties are automatically created
page.metadata.title = "Page Title";
page.metadata.icon = "http://example.com/icon.png";
page.metadata.background = "http://example.com/bg.jpg";

// Loading state
page.loading = true;
// ... load data ...
page.loading = false;

// Error state
page.error("Failed to load data");
```

### Item Properties

```javascript
// Items have automatic properties
var item = page.appendItem("video", "Video Title", {
    url: "http://example.com/video.mp4",
    icon: "http://example.com/thumb.jpg",
    description: "Video description"
});

// Access item properties
console.log(item.metadata.title);
console.log(item.url);
```

## Advanced Patterns

### Computed Properties

```javascript
var firstName = prop.createRoot("firstName");
var lastName = prop.createRoot("lastName");
var fullName = prop.createRoot("fullName");

// Update fullName when either name changes
function updateFullName() {
    fullName.value = firstName.value + " " + lastName.value;
}

prop.subscribe(firstName, updateFullName);
prop.subscribe(lastName, updateFullName);

firstName.value = "John";
lastName.value = "Doe";
// fullName.value is now "John Doe"
```

### Property Binding

```javascript
// Bind two properties together
function bindProperties(source, target) {
    return prop.subscribe(source, function(value) {
        target.value = value;
    }, {immediate: true});
}

var source = prop.createRoot("source");
var target = prop.createRoot("target");

var binding = bindProperties(source, target);

source.value = "test";  // target.value also becomes "test"

// Unbind
binding.destroy();
```

### Property Validation

```javascript
var age = prop.createRoot("age");

prop.subscribe(age, function(value) {
    if (value < 0 || value > 150) {
        console.error("Invalid age:", value);
        age.value = 0;  // Reset to valid value
    }
});
```

## Best Practices

### Use Properties for UI State

```javascript
// GOOD: Use properties for dynamic UI
page.metadata.loading = true;
http.request(url, function(err, response) {
    page.metadata.loading = false;
    if (!err) {
        page.metadata.title = response.title;
    }
});
```

### Clean Up Subscriptions

```javascript
// Store subscriptions
var subscriptions = [];

subscriptions.push(prop.subscribe(prop1, callback1));
subscriptions.push(prop.subscribe(prop2, callback2));

// Clean up when done
function cleanup() {
    subscriptions.forEach(function(sub) {
        sub.destroy();
    });
    subscriptions = [];
}
```

### Avoid Circular Updates

```javascript
// BAD: Circular dependency
prop.subscribe(prop1, function() {
    prop2.value = prop1.value;
});
prop.subscribe(prop2, function() {
    prop1.value = prop2.value;  // Infinite loop!
});

// GOOD: One-way binding
prop.subscribe(prop1, function() {
    prop2.value = prop1.value;
});
```

## Performance Tips

1. **Batch updates** - Update multiple properties before triggering subscriptions
2. **Unsubscribe** when no longer needed
3. **Use specific subscriptions** - Don't subscribe to root if you only need a child
4. **Avoid deep trees** - Keep property hierarchies shallow
5. **Cache property references** - Don't look up properties repeatedly

## See Also

- [Page API](page-api.md) - Page management
- [Core API](core-api.md) - Core functionality
- [Best Practices](../best-practices.md) - Development patterns
