# Item Hook API

Complete reference for the Item Hook API, enabling plugins to add custom actions to video and directory items.

## Overview

The Item Hook API allows plugins to register context menu actions that appear when users interact with video or directory items. This enables features like "Add to Favorites", "Open on IMDb", or custom actions.

## Module Import

```javascript
var itemhook = require('movian/itemhook');
```

## Core Functions

### itemhook.create(config)

Creates and registers a new item hook.

```javascript
var hook = itemhook.create({
    itemtype: "video",
    title: "My Action",
    icon: Plugin.path + "icon.png",
    handler: function(item, nav) {
        // Handle action
    }
});
```

## Configuration Object

### Properties

- **itemtype** (string): Type of items to hook ("video", "directory", "audio")
- **title** (string): Display name in context menu
- **icon** (string): Path to icon file
- **handler** (function): Callback when action is selected

### Handler Function

```javascript
function(item, nav) {
    // item - Property object with item metadata
    // nav - Navigation object with openURL() method
    
    console.log("Selected: " + item.metadata.title);
    nav.openURL("plugin://myplugin:action:" + item.url);
}
```

## Practical Examples

### Add to Favorites

```javascript
var itemhook = require('movian/itemhook');
var store = require('movian/store');

var favorites = store.create("myfavorites");

itemhook.create({
    itemtype: "video",
    title: "Add to Favorites",
    icon: Plugin.path + "heart.png",
    handler: function(item, nav) {
        var list = favorites.list || [];
        list.push({
            title: item.metadata.title,
            url: item.url,
            added: Date.now()
        });
        favorites.list = list;
        
        console.log("Added to favorites: " + item.metadata.title);
    }
});
```

### Open on IMDb

```javascript
itemhook.create({
    itemtype: "video",
    title: "View on IMDb",
    icon: Plugin.path + "imdb.png",
    handler: function(item, nav) {
        var imdbId = item.metadata.imdb_id;
        if (imdbId) {
            nav.openURL("https://www.imdb.com/title/" + imdbId);
        }
    }
});
```

## Best Practices

- Always check if required metadata exists
- Use nav.openURL() for navigation
- Clean up hooks when plugin unloads

## API Quick Reference

```javascript
// Create hook
var hook = itemhook.create({
    itemtype: "video",
    title: "Action Name",
    icon: Plugin.path + "icon.png",
    handler: function(item, nav) {
        // Handle action
    }
});

// Cleanup
hook.destroy();
```

## See Also

- Source: `res/ecmascript/modules/movian/itemhook.js`
- Example: `docs/plugins/examples/03-advanced/`
