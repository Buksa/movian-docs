# Plugin Development Best Practices

This guide outlines best practices for developing high-quality Movian plugins based on analysis of official examples and real-world plugins.

## Table of Contents

- [Project Structure](#project-structure)
- [Code Organization](#code-organization)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [User Experience](#user-experience)
- [Security Considerations](#security-considerations)
- [Testing and Validation](#testing-and-validation)
- [Documentation](#documentation)
- [Common Patterns](#common-patterns)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Project Structure

### Recommended Directory Layout

```
my-plugin/
├── plugin.json          # Plugin manifest (required)
├── main.js             # Main plugin code (required)
├── README.md           # Documentation (required)
├── LICENSE             # License file (recommended)
├── logo.png            # Plugin icon (recommended)
├── lib/                # Utility modules (optional)
│   ├── api.js
│   ├── utils.js
│   └── cache.js
├── views/              # Custom view files (optional)
│   ├── main.view
│   └── item.view
└── assets/             # Static assets (optional)
    ├── icons/
    └── images/
```

### Plugin Manifest Best Practices

```json
{
  "type": "ecmascript",
  "id": "my-unique-plugin-id",
  "file": "main.js",
  "apiversion": 2,
  "title": "My Plugin Title",
  "synopsis": "Brief one-line description",
  "description": "Detailed description of plugin functionality and features",
  "author": "Your Name <email@example.com>",
  "version": "1.0.0",
  "icon": "logo.png",
  "category": "video",
  "homepage": "https://github.com/user/plugin",
  "minMovianVersion": "5.0.0"
}
```

**Key Points:**
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Choose descriptive but unique plugin IDs
- Always specify API version 2 for new plugins
- Include comprehensive metadata for better discoverability

## Code Organization

### Module Structure

```javascript
/**
 * Plugin Name - Brief Description
 * 
 * Detailed description of plugin functionality
 * Compatible with Movian 5.0+
 */

// Import required Movian modules
var page = require('movian/page');
var service = require('movian/service');
var http = require('movian/http');
var settings = require('movian/settings');
var store = require('movian/store');

// Plugin configuration constants
var PLUGIN_PREFIX = 'my-plugin';
var API_BASE_URL = 'https://api.example.com';
var CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize plugin storage
var storage = store.create('my-plugin-data');

// Plugin initialization code...
```

### Use Constants for Configuration

```javascript
// ✅ Good: Use constants for configuration
var CONFIG = {
    PLUGIN_PREFIX: 'my-plugin',
    API_BASE_URL: 'https://api.example.com',
    DEFAULT_TIMEOUT: 30000,
    ITEMS_PER_PAGE: 25,
    CACHE_DURATION: 5 * 60 * 1000,
    MAX_RETRIES: 3
};

// ❌ Bad: Magic numbers scattered throughout code
var response = http.request(url, { timeout: 30000 });
if (items.length > 25) { /* ... */ }
setTimeout(callback, 300000);
```

### Modular Function Design

```javascript
// ✅ Good: Small, focused functions
function makeApiRequest(endpoint, options) {
    var url = CONFIG.API_BASE_URL + endpoint;
    var requestOptions = Object.assign({
        timeout: CONFIG.DEFAULT_TIMEOUT,
        headers: getDefaultHeaders()
    }, options);
    
    return http.request(url, requestOptions);
}

function getDefaultHeaders() {
    return {
        'User-Agent': 'Movian Plugin/' + Plugin.version,
        'Accept': 'application/json'
    };
}

// ❌ Bad: Large, monolithic functions
function handleEverything(page, query, options, callback) {
    // 200+ lines of mixed concerns
}
```

## Error Handling

### Comprehensive Error Handling

```javascript
// ✅ Good: Proper error handling with user feedback
function fetchContent(page, url) {
    try {
        page.loading = true;
        
        var response = makeApiRequest('/content', {
            args: { url: url }
        });
        
        if (response.statuscode !== 200) {
            throw new Error('API returned status ' + response.statuscode);
        }
        
        var data = JSON.parse(response.toString());
        populatePage(page, data);
        
    } catch (error) {
        console.error('Failed to fetch content:', error.message);
        page.error('Unable to load content: ' + error.message);
    } finally {
        page.loading = false;
    }
}

// ❌ Bad: No error handling
function fetchContent(page, url) {
    var response = http.request(API_BASE_URL + '/content?url=' + url);
    var data = JSON.parse(response.toString());
    // What if the request fails? What if JSON is invalid?
}
```

### Graceful Degradation

```javascript
// ✅ Good: Graceful degradation with fallbacks
function getItemThumbnail(item) {
    try {
        if (item.poster && isValidUrl(item.poster)) {
            return item.poster;
        }
        
        if (item.thumbnail && isValidUrl(item.thumbnail)) {
            return item.thumbnail;
        }
        
        // Fallback to default icon
        return 'dataroot://resources/svg/Movie.svg';
        
    } catch (error) {
        console.warn('Error getting thumbnail:', error.message);
        return 'dataroot://resources/svg/Movie.svg';
    }
}
```

### User-Friendly Error Messages

```javascript
// ✅ Good: User-friendly error messages
function handleApiError(error, page) {
    var userMessage;
    
    if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please check your internet connection and try again.';
    } else if (error.message.includes('404')) {
        userMessage = 'Content not found. It may have been removed or moved.';
    } else if (error.message.includes('403')) {
        userMessage = 'Access denied. Please check your API credentials in settings.';
    } else {
        userMessage = 'An unexpected error occurred. Please try again later.';
    }
    
    page.error(userMessage);
    console.error('API Error:', error.message);
}

// ❌ Bad: Technical error messages exposed to users
page.error('XMLHttpRequest failed with status 500: Internal Server Error');
```

## Performance Optimization

### Efficient Caching Strategy

```javascript
// ✅ Good: Smart caching with expiration
var cache = {};

function getCachedData(key, maxAge) {
    maxAge = maxAge || CONFIG.CACHE_DURATION;
    
    var cached = cache[key];
    if (!cached) return null;
    
    var age = Date.now() - cached.timestamp;
    if (age > maxAge) {
        delete cache[key];
        return null;
    }
    
    return cached.data;
}

function setCachedData(key, data) {
    cache[key] = {
        data: data,
        timestamp: Date.now()
    };
    
    // Prevent memory leaks
    cleanupOldCache();
}

function cleanupOldCache() {
    var keys = Object.keys(cache);
    if (keys.length > 100) { // Max cache entries
        var oldest = keys.sort(function(a, b) {
            return cache[a].timestamp - cache[b].timestamp;
        }).slice(0, 20);
        
        oldest.forEach(function(key) {
            delete cache[key];
        });
    }
}
```

### ⚠️ Critical: Always Return Cached Data Asynchronously

When implementing caching in API clients, **always return cached data asynchronously**, even though it's available immediately. This is critical for proper pagination behavior.

```javascript
// ❌ Bad: Synchronous cache return breaks pagination
function apiRequest(url, callback) {
    var cacheKey = generateCacheKey(url);
    var cachedData = cache.get(cacheKey);
    
    if (cachedData !== null) {
        callback(null, cachedData);  // ← Synchronous! Breaks pagination
        return;
    }
    
    http.request(url, function(error, response) {
        if (!error) {
            cache.set(cacheKey, response);
        }
        callback(error, response);
    });
}

// ✅ Good: Asynchronous cache return maintains consistent behavior
function apiRequest(url, callback) {
    var cacheKey = generateCacheKey(url);
    var cachedData = cache.get(cacheKey);
    
    if (cachedData !== null) {
        // Return cached data asynchronously to match API behavior
        setTimeout(function() {
            callback(null, cachedData);
        }, 0);
        return;
    }
    
    http.request(url, function(error, response) {
        if (!error) {
            cache.set(cacheKey, response);
        }
        callback(error, response);
    });
}
```

**Why this matters:**

1. **Pagination breaks with synchronous cache returns**
   - When cache returns data synchronously, the callback executes immediately
   - `page.loading = false` is set before Movian processes the page
   - Movian doesn't trigger `asyncPaginator` for subsequent pages
   - Result: Only first page loads (e.g., 25 items instead of all pages)

2. **Asynchronous behavior is consistent**
   - API requests are always asynchronous
   - Cache should behave the same way
   - `setTimeout(fn, 0)` makes the callback asynchronous
   - Gives Movian time to process the page and trigger pagination

3. **Real-world example:**
   ```javascript
   // Symptom: Catalog shows only 25 items on second visit
   // First visit: Works (no cache, async API calls)
   // Second visit: Broken (cache returns instantly, pagination stops)
   // Fix: Wrap cache callback in setTimeout(fn, 0)
   ```

**Testing your cache implementation:**
- Test with `useCache: false` - should always work
- Test with `useCache: true` on first visit - should work
- Test with `useCache: true` on second visit - should still work (this is where synchronous cache fails)
- If pagination only works without cache or on first visit, you have a synchronous cache callback issue

### Lazy Loading and Pagination

```javascript
// ✅ Good: Async pagination for large datasets
new page.Route(PLUGIN_PREFIX + ':browse', function(page) {
    page.type = "directory";
    page.metadata.title = "Browse Content";
    
    var offset = 0;
    var itemsPerPage = CONFIG.ITEMS_PER_PAGE;
    var hasMore = true;
    
    function loadMoreItems() {
        if (!hasMore) return;
        
        setTimeout(function() {
            try {
                var items = fetchItems(offset, itemsPerPage);
                
                items.forEach(function(item) {
                    page.appendItem(item.url, item.type, {
                        title: item.title,
                        description: item.description,
                        icon: item.thumbnail
                    });
                });
                
                offset += items.length;
                hasMore = items.length === itemsPerPage;
                page.haveMore(hasMore);
                
            } catch (error) {
                console.error('Failed to load more items:', error);
                page.haveMore(false);
            }
        }, 100); // Small delay to prevent UI blocking
    }
    
    page.asyncPaginator = loadMoreItems;
    loadMoreItems(); // Load initial items
});
```

### Minimize HTTP Requests

```javascript
// ✅ Good: Batch requests when possible
function fetchMultipleItems(ids) {
    // Batch multiple IDs into single request
    var batchUrl = CONFIG.API_BASE_URL + '/items/batch';
    var response = http.request(batchUrl, {
        method: 'POST',
        postdata: JSON.stringify({ ids: ids }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    return JSON.parse(response.toString());
}

// ❌ Bad: Multiple individual requests
function fetchMultipleItems(ids) {
    return ids.map(function(id) {
        return http.request(CONFIG.API_BASE_URL + '/items/' + id);
    });
}
```

## User Experience

### Responsive Loading States

```javascript
// ✅ Good: Clear loading states and progress indication
function loadContent(page) {
    page.loading = true;
    page.metadata.title = "Loading...";
    
    try {
        var totalSteps = 3;
        var currentStep = 0;
        
        // Step 1: Fetch metadata
        currentStep++;
        page.metadata.title = `Loading... (${currentStep}/${totalSteps})`;
        var metadata = fetchMetadata();
        
        // Step 2: Fetch content list
        currentStep++;
        page.metadata.title = `Loading... (${currentStep}/${totalSteps})`;
        var items = fetchContentList();
        
        // Step 3: Process and display
        currentStep++;
        page.metadata.title = `Loading... (${currentStep}/${totalSteps})`;
        populatePage(page, metadata, items);
        
        page.metadata.title = metadata.title;
        
    } catch (error) {
        handleError(page, error);
    } finally {
        page.loading = false;
    }
}
```

### Intuitive Navigation

```javascript
// ✅ Good: Consistent navigation patterns
function createNavigationStructure() {
    return [
        {
            title: "🏠 Home",
            route: PLUGIN_PREFIX + ":start",
            description: "Main plugin page"
        },
        {
            title: "🔍 Search",
            route: PLUGIN_PREFIX + ":search",
            description: "Search for content"
        },
        {
            title: "⭐ Popular",
            route: PLUGIN_PREFIX + ":popular",
            description: "Most popular content"
        },
        {
            title: "📚 Categories",
            route: PLUGIN_PREFIX + ":categories",
            description: "Browse by category"
        },
        {
            title: "⚙️ Settings",
            route: PLUGIN_PREFIX + ":settings",
            description: "Plugin configuration"
        }
    ];
}
```

### Meaningful Metadata

```javascript
// ✅ Good: Rich metadata for better presentation
function createMediaItem(data) {
    return {
        title: data.title,
        description: truncateDescription(data.synopsis, 150),
        icon: getOptimizedThumbnail(data.poster),
        year: parseInt(data.release_year),
        rating: Math.round(parseFloat(data.rating) * 10), // Convert to 0-100 scale
        genre: data.genres ? data.genres.join(', ') : undefined,
        duration: data.runtime ? parseInt(data.runtime) * 60 : undefined, // Convert to seconds
        metadata: {
            director: data.director,
            cast: data.cast ? data.cast.slice(0, 3).join(', ') : undefined,
            country: data.country,
            language: data.language
        }
    };
}
```

## Security Considerations

### Input Validation and Sanitization

```javascript
// ✅ Good: Validate and sanitize user inputs
function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        throw new Error('Invalid search query');
    }
    
    // Remove potentially dangerous characters
    query = query.replace(/[<>\"'&]/g, '');
    
    // Limit length
    if (query.length > 100) {
        query = query.substring(0, 100);
    }
    
    // Trim whitespace
    query = query.trim();
    
    if (query.length < 2) {
        throw new Error('Search query too short');
    }
    
    return query;
}

function isValidUrl(url) {
    try {
        var parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch (e) {
        return false;
    }
}
```

### Safe API Key Handling

```javascript
// ✅ Good: Secure API key management
settings.createString("apiKey", "API Key", "", function(value) {
    // Don't log the actual key
    console.log("API key " + (value ? "configured" : "cleared"));
    storage.apiKey = value;
});

function makeAuthenticatedRequest(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    
    var apiKey = storage.apiKey;
    if (apiKey) {
        // Use Authorization header instead of URL parameters
        options.headers['Authorization'] = 'Bearer ' + apiKey;
    }
    
    return http.request(url, options);
}

// ❌ Bad: API key in URL or logs
console.log("Using API key: " + apiKey); // Never log sensitive data
var url = API_BASE_URL + '?api_key=' + apiKey; // Avoid keys in URLs
```

### Content Filtering

```javascript
// ✅ Good: Content filtering and safety checks
function filterContent(items, userPreferences) {
    return items.filter(function(item) {
        // Age rating filter
        if (userPreferences.maxRating && item.rating > userPreferences.maxRating) {
            return false;
        }
        
        // Content type filter
        if (userPreferences.blockedGenres && 
            userPreferences.blockedGenres.some(function(genre) {
                return item.genres && item.genres.includes(genre);
            })) {
            return false;
        }
        
        // Language filter
        if (userPreferences.preferredLanguages && 
            !userPreferences.preferredLanguages.includes(item.language)) {
            return false;
        }
        
        return true;
    });
}
```

## Testing and Validation

### Self-Testing Functions

```javascript
// ✅ Good: Built-in testing capabilities
function runSelfTest() {
    console.log("Running plugin self-test...");
    
    var tests = [
        testApiConnection,
        testCacheSystem,
        testSettingsIntegrity,
        testRouteHandlers
    ];
    
    var results = tests.map(function(test) {
        try {
            test();
            return { name: test.name, passed: true };
        } catch (error) {
            return { name: test.name, passed: false, error: error.message };
        }
    });
    
    var passed = results.filter(function(r) { return r.passed; }).length;
    console.log(`Self-test completed: ${passed}/${results.length} tests passed`);
    
    return results;
}

function testApiConnection() {
    var response = http.request(CONFIG.API_BASE_URL + '/health', {
        timeout: 5000
    });
    
    if (response.statuscode !== 200) {
        throw new Error('API health check failed');
    }
}
```

### Input Validation Testing

```javascript
// ✅ Good: Validate edge cases
function testInputValidation() {
    var testCases = [
        { input: "", shouldFail: true },
        { input: null, shouldFail: true },
        { input: "a", shouldFail: true }, // Too short
        { input: "valid search", shouldFail: false },
        { input: "x".repeat(200), shouldFail: true }, // Too long
        { input: "<script>alert('xss')</script>", shouldFail: true }
    ];
    
    testCases.forEach(function(testCase) {
        try {
            var result = validateSearchQuery(testCase.input);
            if (testCase.shouldFail) {
                throw new Error('Expected validation to fail for: ' + testCase.input);
            }
        } catch (error) {
            if (!testCase.shouldFail) {
                throw new Error('Unexpected validation failure for: ' + testCase.input);
            }
        }
    });
}
```

## Documentation

### Comprehensive README

```markdown
# Plugin Name

Brief description of what the plugin does.

## Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Installation

1. Download the plugin files
2. Copy to Movian plugins directory
3. Enable in Movian settings
4. Configure API credentials (if required)

## Configuration

### Required Settings
- **API Key**: Get from [provider website](https://example.com)
- **Server URL**: Default is usually fine

### Optional Settings
- **Cache Duration**: How long to cache data (default: 5 minutes)
- **Items Per Page**: Number of items to load at once (default: 25)

## Usage

1. Navigate to the plugin from Movian main menu
2. Browse categories or use search
3. Select items to play

## Troubleshooting

### Common Issues

**Problem**: Plugin doesn't appear in menu
**Solution**: Check that plugin is enabled in Movian settings

**Problem**: "API Error" messages
**Solution**: Verify API key is correct and service is available

## Development

### Building from Source
```bash
git clone https://github.com/user/plugin
cd plugin
# No build step required for JavaScript plugins
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0
- Initial release
- Basic browsing functionality
- Search support
```

### Inline Code Documentation

```javascript
/**
 * Fetches content from the API with caching and error handling
 * 
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {Object} options - Request options
 * @param {number} options.timeout - Request timeout in milliseconds
 * @param {Object} options.headers - Additional HTTP headers
 * @param {boolean} options.useCache - Whether to use cached data if available
 * @returns {Object} Parsed JSON response from API
 * @throws {Error} If request fails or response is invalid
 * 
 * @example
 * var data = fetchApiData('/movies/popular', {
 *   timeout: 10000,
 *   useCache: true
 * });
 */
function fetchApiData(endpoint, options) {
    options = options || {};
    
    // Implementation...
}
```

## Common Patterns

### Settings Management Pattern

```javascript
// ✅ Good: Centralized settings management
var PluginSettings = {
    init: function() {
        settings.globalSettings(PLUGIN_PREFIX, "Plugin Name", "logo.png", "Plugin Settings");
        
        this.createBasicSettings();
        this.createAdvancedSettings();
        this.createActions();
    },
    
    createBasicSettings: function() {
        settings.createDivider("Basic Settings");
        
        settings.createString("apiKey", "API Key", "", function(value) {
            storage.apiKey = value;
            console.log("API key " + (value ? "configured" : "cleared"));
        });
        
        settings.createBool("enableCache", "Enable Caching", true, function(value) {
            storage.cacheEnabled = value;
            if (!value) {
                Cache.clear();
            }
        });
    },
    
    createAdvancedSettings: function() {
        settings.createDivider("Advanced Settings");
        
        settings.createInt("timeout", "Request Timeout (seconds)", 30, 5, 300, 5, "sec", function(value) {
            storage.requestTimeout = value * 1000;
        });
    },
    
    createActions: function() {
        settings.createDivider("Actions");
        
        settings.createAction("clearCache", "Clear Cache", function() {
            Cache.clear();
            console.log("Cache cleared");
        });
        
        settings.createAction("testConnection", "Test API Connection", function() {
            ApiClient.testConnection();
        });
    }
};
```

### API Client Pattern

```javascript
// ✅ Good: Reusable API client
var ApiClient = {
    baseUrl: CONFIG.API_BASE_URL,
    
    request: function(endpoint, options) {
        options = options || {};
        
        var url = this.baseUrl + endpoint;
        var requestOptions = {
            timeout: storage.requestTimeout || CONFIG.DEFAULT_TIMEOUT,
            headers: this.getDefaultHeaders()
        };
        
        // Merge options
        Object.keys(options).forEach(function(key) {
            if (key === 'headers') {
                Object.assign(requestOptions.headers, options.headers);
            } else {
                requestOptions[key] = options[key];
            }
        });
        
        // Add authentication if available
        if (storage.apiKey) {
            requestOptions.headers['Authorization'] = 'Bearer ' + storage.apiKey;
        }
        
        var response = http.request(url, requestOptions);
        
        if (response.statuscode < 200 || response.statuscode >= 300) {
            throw new Error('HTTP ' + response.statuscode + ': ' + response.statusMessage);
        }
        
        return JSON.parse(response.toString());
    },
    
    getDefaultHeaders: function() {
        return {
            'User-Agent': 'Movian Plugin/' + (Plugin.version || '1.0.0'),
            'Accept': 'application/json',
            'Accept-Language': storage.language || 'en'
        };
    },
    
    testConnection: function() {
        try {
            this.request('/health');
            console.log("✓ API connection successful");
            return true;
        } catch (error) {
            console.error("✗ API connection failed:", error.message);
            return false;
        }
    }
};
```

### Route Handler Pattern

```javascript
// ✅ Good: Consistent route handling
var RouteHandlers = {
    main: function(page) {
        page.type = "directory";
        page.metadata.title = "Plugin Name";
        
        try {
            this.addNavigationItems(page);
            page.loading = false;
        } catch (error) {
            this.handleError(page, error);
        }
    },
    
    search: function(page, query) {
        page.type = "directory";
        page.metadata.title = "Search: " + query;
        
        if (!query || query.trim().length < 2) {
            page.error("Please enter a search term (minimum 2 characters)");
            return;
        }
        
        try {
            page.loading = true;
            var results = ApiClient.request('/search', {
                args: { q: query.trim() }
            });
            
            this.populateSearchResults(page, results);
            
        } catch (error) {
            this.handleError(page, error);
        } finally {
            page.loading = false;
        }
    },
    
    handleError: function(page, error) {
        console.error("Route error:", error.message);
        
        var userMessage = this.getUserFriendlyError(error);
        page.error(userMessage);
    },
    
    getUserFriendlyError: function(error) {
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please check your connection.';
        } else if (error.message.includes('404')) {
            return 'Content not found.';
        } else if (error.message.includes('403')) {
            return 'Access denied. Check your API credentials.';
        } else {
            return 'An error occurred. Please try again.';
        }
    }
};

// Register routes
new page.Route(PLUGIN_PREFIX + ':start', RouteHandlers.main.bind(RouteHandlers));
new page.Route(PLUGIN_PREFIX + ':search:(.*)', RouteHandlers.search.bind(RouteHandlers));
```

## Anti-Patterns to Avoid

### ❌ Global Variable Pollution

```javascript
// ❌ Bad: Global variables
var apiKey = "secret";
var cache = {};
var settings = {};

// ✅ Good: Encapsulated in objects or modules
var PluginState = {
    apiKey: null,
    cache: {},
    settings: {}
};
```

### ❌ Synchronous Operations in UI Thread

```javascript
// ❌ Bad: Blocking operations
function loadPage(page) {
    var data = http.request(url); // Blocks UI
    processData(data); // More blocking
    page.loading = false;
}

// ✅ Good: Asynchronous operations
function loadPage(page) {
    page.loading = true;
    
    setTimeout(function() {
        try {
            var data = http.request(url);
            processData(data);
        } catch (error) {
            handleError(page, error);
        } finally {
            page.loading = false;
        }
    }, 0);
}
```

### ❌ Hardcoded Values

```javascript
// ❌ Bad: Hardcoded values
if (items.length > 50) { /* ... */ }
setTimeout(callback, 5000);
var url = "https://api.example.com/v1/data";

// ✅ Good: Configurable constants
if (items.length > CONFIG.MAX_ITEMS) { /* ... */ }
setTimeout(callback, CONFIG.RETRY_DELAY);
var url = CONFIG.API_BASE_URL + CONFIG.API_ENDPOINTS.data;
```

### ❌ Poor Error Messages

```javascript
// ❌ Bad: Technical error messages
page.error("XMLHttpRequest failed: 500 Internal Server Error");
page.error("JSON.parse: unexpected token at position 42");

// ✅ Good: User-friendly messages
page.error("Unable to load content. Please try again later.");
page.error("Invalid response from server. Please check your settings.");
```

### ❌ Memory Leaks

```javascript
// ❌ Bad: Unbounded cache growth
var cache = {};
function cacheData(key, data) {
    cache[key] = data; // Never cleaned up
}

// ✅ Good: Bounded cache with cleanup
var cache = {};
var MAX_CACHE_SIZE = 100;

function cacheData(key, data) {
    cache[key] = { data: data, timestamp: Date.now() };
    
    if (Object.keys(cache).length > MAX_CACHE_SIZE) {
        cleanupCache();
    }
}
```

## Conclusion

Following these best practices will help you create robust, maintainable, and user-friendly Movian plugins. Remember to:

1. **Plan your architecture** before writing code
2. **Handle errors gracefully** and provide meaningful feedback
3. **Optimize for performance** with caching and async operations
4. **Prioritize user experience** with clear navigation and loading states
5. **Document thoroughly** for future maintainers
6. **Test extensively** with various inputs and scenarios
7. **Follow security best practices** to protect user data
8. **Keep code organized** and modular for easier maintenance

For more specific guidance, refer to the individual plugin examples and API documentation.