# Content Provider Template

A complete template for creating media content provider plugins. This template demonstrates how to fetch content from external APIs, parse responses, and present media items in Movian.

## Features

- ✅ HTTP API integration
- ✅ JSON/HTML parsing
- ✅ Media item presentation
- ✅ Search functionality
- ✅ Pagination support
- ✅ Error handling
- ✅ Caching strategy
- ✅ Settings integration

## File Structure

```
content-provider/
├── plugin.json          # Plugin manifest with settings
├── main.js             # Main plugin logic
├── api.js              # API client module
├── parser.js           # Content parsing module
├── logo.png            # Plugin icon
└── README.md           # This file
```

## Use Cases

This template is perfect for:
- Video streaming services
- Podcast aggregators
- Music libraries
- News feeds
- Photo galleries
- Any content from REST APIs

## Quick Start

1. **Copy template**:
   ```bash
   cp -r content-provider/ ~/my-content-plugin/
   ```

2. **Configure API**:
   Edit `api.js` with your API endpoint:
   ```javascript
   var API_BASE = "https://api.example.com";
   ```

3. **Update plugin.json**:
   - Change plugin ID and name
   - Add API key setting if needed

4. **Implement parser**:
   Edit `parser.js` to parse your API responses

5. **Test**:
   ```bash
   cp -r ~/my-content-plugin/ ~/.movian/plugins/
   ```

## Configuration

### API Settings

Add to `plugin.json`:
```json
{
  "settings": [
    {
      "id": "apiKey",
      "title": "API Key",
      "type": "string",
      "defaultValue": ""
    },
    {
      "id": "quality",
      "title": "Video Quality",
      "type": "multiopt",
      "options": ["720p", "1080p", "4K"],
      "defaultValue": "1080p"
    }
  ]
}
```

### Custom Categories

In `main.js`, modify categories:
```javascript
var CATEGORIES = [
  { id: "trending", title: "Trending" },
  { id: "new", title: "New Releases" },
  { id: "popular", title: "Most Popular" }
];
```

## API Integration

### Making Requests

```javascript
// GET request
var response = http.request(url, {
  method: 'GET',
  headers: {
    'User-Agent': 'Movian Plugin',
    'Authorization': 'Bearer ' + apiKey
  }
});

// POST request
var response = http.request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  postdata: JSON.stringify({ query: searchTerm })
});
```

### Parsing Responses

```javascript
// JSON parsing
var data = JSON.parse(response.toString());

// HTML parsing
var dom = html.parse(response.toString());
var items = dom.root.getElementByTagName('div');
```

## Content Types

### Video Items

```javascript
page.appendItem(videoUrl, "video", {
  title: "Video Title",
  icon: thumbnailUrl,
  description: "Video description",
  duration: 3600,  // seconds
  year: 2024
});
```

### Directory Items

```javascript
page.appendItem(PREFIX + ":category:" + id, "directory", {
  title: "Category Name",
  icon: iconUrl
});
```

### Playable Items

```javascript
page.appendItem("videoparams:" + JSON.stringify({
  title: "Video Title",
  canonicalUrl: PREFIX + ":video:" + id,
  sources: [{
    url: streamUrl,
    mimetype: "video/mp4"
  }]
}), "video", {
  title: "Video Title",
  icon: thumbnailUrl
});
```

## Advanced Features

### Pagination

```javascript
function loadPage(page, pageNum) {
  var offset = (pageNum - 1) * ITEMS_PER_PAGE;
  var url = API_BASE + "/items?offset=" + offset;
  
  var response = http.request(url);
  var data = JSON.parse(response.toString());
  
  data.items.forEach(function(item) {
    page.appendItem(/* ... */);
  });
  
  // Add "Load More" if more items exist
  if (data.hasMore) {
    page.appendItem(PREFIX + ":page:" + (pageNum + 1), "directory", {
      title: "Load More..."
    });
  }
}
```

### Caching

```javascript
var cache = {};
var CACHE_DURATION = 3600; // 1 hour

function getCachedData(key) {
  if (cache[key] && (Date.now() - cache[key].time) < CACHE_DURATION * 1000) {
    return cache[key].data;
  }
  return null;
}

function setCachedData(key, data) {
  cache[key] = {
    data: data,
    time: Date.now()
  };
}
```

### Search Implementation

```javascript
new page.Route(PREFIX + ":search:(.*)$", function(page, query) {
  page.type = "directory";
  page.contents = "items";
  page.metadata.title = "Search: " + query;
  
  var url = API_BASE + "/search?q=" + encodeURIComponent(query);
  var response = http.request(url);
  var results = JSON.parse(response.toString());
  
  results.forEach(function(item) {
    page.appendItem(/* ... */);
  });
});

// Register search
searcher.create(PLUGIN_NAME, logo, function(page, query) {
  page.redirect(PREFIX + ":search:" + query);
});
```

## Error Handling

```javascript
function safeRequest(url) {
  try {
    var response = http.request(url, {
      timeout: 30000
    });
    
    if (response.statuscode !== 200) {
      throw new Error("HTTP " + response.statuscode);
    }
    
    return response;
  } catch(e) {
    console.error("Request failed:", e.message);
    return null;
  }
}
```

## Testing

1. **Test API connection**:
   ```javascript
   console.log("Testing API...");
   var response = http.request(API_BASE + "/test");
   console.log("Status:", response.statuscode);
   ```

2. **Validate JSON**:
   ```javascript
   try {
     var data = JSON.parse(response.toString());
     console.log("Valid JSON, items:", data.length);
   } catch(e) {
     console.error("Invalid JSON:", e.message);
   }
   ```

3. **Check item rendering**:
   - Open plugin in Movian
   - Verify items appear correctly
   - Test navigation and playback

## Performance Tips

1. **Lazy loading**: Load content only when needed
2. **Caching**: Cache API responses
3. **Pagination**: Don't load all items at once
4. **Thumbnails**: Use appropriate image sizes
5. **Timeouts**: Set reasonable HTTP timeouts

## Troubleshooting

**No items appear:**
- Check API response format
- Verify parsing logic
- Check console logs

**Slow loading:**
- Implement caching
- Reduce items per page
- Optimize API requests

**Playback fails:**
- Verify video URL format
- Check mimetype
- Test URL in browser

## Resources

- **HTTP API**: `docs/plugins/api/http-api.md`
- **Parsing**: `docs/plugins/best-practices.md`
- **Examples**: `docs/plugins/examples/content-provider/`
