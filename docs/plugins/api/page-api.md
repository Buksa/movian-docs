# Page API Reference

The Page API is the core interface for creating and managing pages in Movian plugins. Pages represent navigable screens that display content to users.

## Overview

Pages in Movian are created through route handlers and can display various types of content including:

- Directory listings
- Video/audio items
- Search results
- Settings pages
- Custom UI views

## Creating Pages

### Route Registration

```javascript
new page.Route(pattern, handler);
```

**Parameters:**
- `pattern` (string): URL pattern to match (supports wildcards)
- `handler` (function): Function called when route is accessed

**Example:**

```javascript
new page.Route("myplugin:start", function(page) {
  page.type = "directory";
  page.metadata.title = "My Plugin";
  page.loading = false;
});
```

### Route Patterns

#### Simple Routes

```javascript
new page.Route("myplugin:home", function(page) {
  // Handle myplugin:home
});
```

#### Wildcard Routes

```javascript
new page.Route("myplugin:category:(.*)", function(page, categoryId) {
  // categoryId contains the matched wildcard
  page.metadata.title = "Category: " + categoryId;
});
```

#### Multiple Wildcards

```javascript
new page.Route("myplugin:item:(.*):(.*)", function(page, type, id) {
  // type and id contain matched wildcards
  console.log("Type:", type, "ID:", id);
});
```

## Page Object

### Properties

#### page.type

Sets the page type, which determines how content is displayed.

```javascript
page.type = "directory";  // List of items
page.type = "video";      // Video player
page.type = "audio";      // Audio player
page.type = "image";      // Image viewer
```

**Valid Types:**
- `"directory"` - Item list/grid
- `"video"` - Video playback
- `"audio"` - Audio playback
- `"image"` - Image display
- `"item"` - Single item view

#### page.contents

Specifies how items are organized on the page.

```javascript
page.contents = "items";  // Standard list
page.contents = "grid";   // Grid layout
page.contents = "list";   // Detailed list
```

#### page.loading

Controls the loading indicator.

```javascript
page.loading = true;   // Show loading spinner
page.loading = false;  // Hide loading spinner
```

**Important:** Always set to `false` when done loading content.

#### page.metadata

Object containing page metadata.

```javascript
page.metadata.title = "Page Title";
page.metadata.icon = "http://example.com/icon.png";
page.metadata.background = "http://example.com/bg.jpg";
page.metadata.logo = plugin.path + "logo.png";
```

**Metadata Properties:**
- `title` (string): Page title
- `icon` (string): Page icon URL
- `background` (string): Background image URL
- `logo` (string): Logo image URL
- `glwview` (string): Custom view file path

#### page.entries

Number of items on the page (read-only).

```javascript
console.log("Total items:", page.entries);
```

### Methods

#### page.appendItem()

Adds an item to the page.

```javascript
page.appendItem(url, type, metadata);
```

**Parameters:**
- `url` (string): Item URL/route
- `type` (string): Item type
- `metadata` (object): Item metadata

**Item Types:**
- `"video"` - Video item
- `"audio"` - Audio item
- `"directory"` - Subdirectory
- `"separator"` - Visual separator
- `"label"` - Text label

**Example:**

```javascript
page.appendItem("myplugin:video:123", "video", {
  title: "Video Title",
  icon: "http://example.com/thumb.jpg",
  duration: 3600,
  description: "Video description"
});
```

#### page.appendPassiveItem()

Adds a non-interactive item (for display only).

```javascript
page.appendPassiveItem(type, metadata);
```

**Example:**

```javascript
page.appendPassiveItem("label", {
  title: "Information text"
});
```

#### page.appendAction()

Adds an action button to the page.

```javascript
page.appendAction(type, url, enabled, metadata);
```

**Parameters:**
- `type` (string): Action type
- `url` (string): Action URL
- `enabled` (boolean): Whether action is enabled
- `metadata` (object): Action metadata

**Example:**

```javascript
page.appendAction("pageevent", "refresh", true, {
  title: "Refresh",
  icon: plugin.path + "refresh.png"
});
```

#### page.dump()

Dumps page information to console (debugging).

```javascript
page.dump();
```

#### page.error()

Displays an error message on the page.

```javascript
page.error(message);
```

**Example:**

```javascript
try {
  // Load content
} catch(e) {
  page.error("Failed to load content: " + e.message);
}
```

#### page.redirect()

Redirects to another page.

```javascript
page.redirect(url);
```

**Example:**

```javascript
page.redirect("myplugin:home");
```

## Page Events

### onEvent Handler

Handle page-specific events.

```javascript
page.onEvent("refresh", function() {
  // Reload page content
  loadContent(page);
});
```

**Common Events:**
- `"refresh"` - User requested refresh
- `"back"` - User pressed back button
- `"search"` - Search initiated

## Item Metadata

### Video Items

```javascript
{
  title: "Video Title",
  icon: "http://example.com/thumb.jpg",
  description: "Video description",
  duration: 3600,  // seconds
  year: 2023,
  genre: "Action",
  rating: 8.5,
  tagline: "Movie tagline",
  sources: [
    {
      url: "http://example.com/video.mp4",
      mimetype: "video/mp4"
    }
  ]
}
```

### Audio Items

```javascript
{
  title: "Song Title",
  artist: "Artist Name",
  album: "Album Name",
  icon: "http://example.com/cover.jpg",
  duration: 240,
  year: 2023,
  track: 5,
  sources: [
    {
      url: "http://example.com/audio.mp3",
      mimetype: "audio/mpeg"
    }
  ]
}
```

### Directory Items

```javascript
{
  title: "Folder Name",
  icon: "http://example.com/folder.png",
  description: "Folder description"
}
```

## Advanced Features

### Pagination

```javascript
new page.Route("myplugin:list:(.*)", function(page, offset) {
  offset = parseInt(offset) || 0;
  var limit = 20;
  
  // Load items
  for (var i = 0; i < limit; i++) {
    page.appendItem(/* ... */);
  }
  
  // Add "Load More" button
  if (hasMoreItems) {
    page.appendItem("myplugin:list:" + (offset + limit), "directory", {
      title: "Load More..."
    });
  }
  
  page.loading = false;
});
```

### Search Integration

```javascript
new page.Route("myplugin:search:(.*)", function(page, query) {
  page.metadata.title = "Search: " + query;
  
  // Perform search
  var results = searchContent(query);
  
  results.forEach(function(item) {
    page.appendItem(item.url, "video", item);
  });
  
  page.loading = false;
});
```

### Custom Views

```javascript
new page.Route("myplugin:custom", function(page) {
  page.type = "directory";
  page.metadata.glwview = plugin.path + "views/custom.view";
  
  // Page data accessible in view file
  page.metadata.customData = {
    items: [...],
    config: {...}
  };
  
  page.loading = false;
});
```

### Async Content Loading

```javascript
new page.Route("myplugin:async", function(page) {
  page.type = "directory";
  page.metadata.title = "Loading...";
  page.loading = true;
  
  // Simulate async operation
  setTimeout(function() {
    page.metadata.title = "Content Loaded";
    
    // Add items
    page.appendItem(/* ... */);
    
    page.loading = false;
  }, 1000);
});
```

## Best Practices

### Error Handling

Always handle errors gracefully:

```javascript
new page.Route("myplugin:content", function(page) {
  try {
    page.loading = true;
    
    var data = fetchData();
    
    data.forEach(function(item) {
      page.appendItem(item.url, "video", item);
    });
    
  } catch(e) {
    page.error("Failed to load content: " + e.message);
  } finally {
    page.loading = false;
  }
});
```

### Performance

- Set `page.loading = false` as soon as possible
- Load items incrementally for large lists
- Cache data when appropriate
- Avoid blocking operations in route handlers

### User Experience

- Provide meaningful titles and descriptions
- Use appropriate icons and thumbnails
- Show loading indicators for slow operations
- Handle empty results gracefully

```javascript
if (items.length === 0) {
  page.appendPassiveItem("label", {
    title: "No items found"
  });
}
```

## Examples

### Simple Video List

```javascript
new page.Route("myplugin:videos", function(page) {
  page.type = "directory";
  page.metadata.title = "Videos";
  
  var videos = [
    { id: "1", title: "Video 1", thumb: "http://..." },
    { id: "2", title: "Video 2", thumb: "http://..." }
  ];
  
  videos.forEach(function(video) {
    page.appendItem("myplugin:play:" + video.id, "video", {
      title: video.title,
      icon: video.thumb
    });
  });
  
  page.loading = false;
});
```

### Category Browser

```javascript
new page.Route("myplugin:categories", function(page) {
  page.type = "directory";
  page.metadata.title = "Categories";
  
  var categories = ["Action", "Comedy", "Drama"];
  
  categories.forEach(function(cat) {
    page.appendItem("myplugin:category:" + cat, "directory", {
      title: cat,
      icon: plugin.path + "icons/" + cat.toLowerCase() + ".png"
    });
  });
  
  page.loading = false;
});
```

## See Also

- [Core API](core-api.md)
- [HTTP API](http-api.md)
- [Settings API](settings-api.md)
- [Plugin Examples](../examples/)
