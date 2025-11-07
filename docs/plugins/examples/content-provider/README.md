# Content Provider Plugin Example

A comprehensive example demonstrating how to create a professional-grade media content provider plugin for Movian using external APIs. This example incorporates patterns and best practices from successful real-world plugins like anilibria.tv and trakt.

## Overview

This plugin showcases advanced content provider patterns including:

- **HTTP API Integration**: Robust API communication with retry logic and comprehensive error handling
- **Advanced Caching System**: LRU cache with memory management and automatic cleanup
- **Error Handling**: Multi-layered error handling with user-friendly messages and fallback strategies
- **Async Loading**: Dynamic content loading with pagination and performance optimization
- **Media Metadata**: Rich metadata handling for movies and TV shows with validation
- **Search Functionality**: Advanced search with relevance scoring and result caching
- **Settings Management**: Comprehensive plugin configuration with validation
- **Performance Monitoring**: Built-in performance tracking and optimization
- **Memory Management**: Proper resource cleanup and memory leak prevention

## Features Demonstrated

### 🌐 Advanced HTTP API Integration
- RESTful API requests with proper headers and gzip encoding
- Automatic retry logic with exponential backoff for transient failures
- JSON response parsing with comprehensive validation
- Authentication token handling (Bearer tokens) with secure storage
- Request timeout and multi-layered error handling
- Response status code validation with specific user-friendly error messages
- URL building with query parameters and proper encoding
- HTTP Inspector setup for consistent request headers
- Network-level error detection and recovery

### 💾 Advanced Caching System
- LRU (Least Recently Used) cache implementation with automatic eviction
- Configurable cache duration and size limits via settings
- Cache key management with collision prevention
- Performance optimization for repeated requests
- Automatic cache cleanup to prevent memory leaks
- Cache hit/miss tracking for performance monitoring
- Memory-efficient storage with timestamp and access tracking

### 📺 Media Content Management
- Movie and TV show categorization
- Rich metadata handling (year, rating, genre, duration, etc.)
- Poster image integration with placeholder URLs
- Episode and season management for TV shows
- Video URL handling for playback
- Content transformation and sanitization

### 🔍 Search and Discovery
- Content search functionality with filtering
- Search result processing and display
- Search suggestions for better UX
- Query parameter encoding/decoding
- Trending content section

### ⚡ Performance Features
- Asynchronous content loading with proper state management
- Pagination with `asyncPaginator` for large datasets
- Configurable items per page (5-100 range)
- Loading state management and error recovery
- Utility functions for common operations

### 🛠️ Professional Code Organization
- Modular utility functions for maximum reusability
- Centralized content transformation with validation
- Consistent error handling patterns across all routes
- Plugin manifest integration with proper metadata
- Settings-driven configuration with type validation
- Separation of concerns between data, presentation, and logic layers
- Comprehensive logging and debugging support

## Architectural Patterns Demonstrated

### 🏗️ Plugin Architecture Best Practices

This example demonstrates several key architectural patterns used in successful Movian plugins:

#### 1. **Centralized Configuration Management**
```javascript
// All configuration in one place
var PLUGIN_PREFIX = 'content-provider';
var API_BASE_URL = 'https://jsonplaceholder.typicode.com';
var CACHE_DURATION = 5 * 60 * 1000;
var MAX_CACHE_ENTRIES = 100;
```

#### 2. **HTTP Inspector Pattern** (from anilibria.tv)
```javascript
// Consistent headers for all requests
io.httpInspectorCreate('.*jsonplaceholder.*', function(ctrl) {
    ctrl.setHeader('Accept-Encoding', 'gzip');
    ctrl.setHeader('User-Agent', 'Movian Content Provider Plugin 1.0');
    ctrl.setHeader('Accept', 'application/json');
});
```

#### 3. **Retry Logic with Exponential Backoff**
```javascript
// Robust network error handling
function attemptRequest(attempt) {
    // ... request logic ...
    if (error && attempt < maxRetries) {
        setTimeout(function() {
            return attemptRequest(attempt + 1);
        }, retryDelay);
        retryDelay *= 2; // Exponential backoff
    }
}
```

#### 4. **LRU Cache Implementation**
```javascript
// Memory-efficient caching with automatic cleanup
function setCachedData(key, data) {
    if (cacheKeys.length >= MAX_CACHE_ENTRIES) {
        var oldestKey = findOldestEntry();
        delete cache[oldestKey];
    }
    cache[key] = { data, timestamp: now, lastAccess: now };
}
```

#### 5. **Content Validation Pipeline**
```javascript
// Validate all external data before use
movies = posts.map(transformToMovie)
    .filter(movie => movie && validateContent(movie, 'movie'));
```

#### 6. **Centralized Error Handling**
```javascript
// Consistent error handling across all routes
function handlePageError(page, error, context) {
    console.error("Error in " + context + ": " + error.message);
    var userMessage = getUserFriendlyMessage(error);
    page.error(userMessage);
}
```

### 🎯 Real-World Plugin Patterns

#### Pattern 1: **Service Registration** (Standard Pattern)
```javascript
// Create main service entry point
service.create(plugin.title, PLUGIN_PREFIX + ":start", "video", true, "logo.png");
```

#### Pattern 2: **Settings Management** (Best Practice)
```javascript
// Comprehensive settings with validation
settings.createString("apiKey", "API Key", "", function(value) {
    // Validate and store API key
});
settings.createBool("enableCache", "Enable Caching", true, function(value) {
    // Handle cache toggle
});
```

#### Pattern 3: **Route Organization** (Scalable Structure)
```javascript
// Hierarchical route structure
PLUGIN_PREFIX + ':start'           // Main menu
PLUGIN_PREFIX + ':movies'          // Category pages
PLUGIN_PREFIX + ':movie:123'       // Individual items
PLUGIN_PREFIX + ':search:query'    // Search results
```

#### Pattern 4: **Async Pagination** (Performance Pattern)
```javascript
// Efficient content loading
page.asyncPaginator = function() {
    loadMoreContent();
    page.haveMore(hasMoreContent);
};
```

#### Pattern 5: **Search Integration** (User Experience)
```javascript
// Global search integration
page.Searcher(plugin.title, "logo.png", function(page, query) {
    page.redirect(PLUGIN_PREFIX + ':search:' + encodeURIComponent(query));
});
```

## File Structure

```
content-provider/
├── plugin.json          # Plugin manifest
├── main.js              # Main implementation
├── logo.png             # Plugin icon (optional)
└── README.md            # This documentation
```

## Installation

1. Copy the `content-provider` directory to your Movian plugins folder
2. (Optional) Add a `logo.png` file (64x64 pixels recommended) for the plugin icon
3. Restart Movian or reload plugins
4. The plugin will appear as "Content Provider" in the main menu

**Plugin Directory Location:**
- **Linux**: `~/.hts/movian/plugins/`
- **Windows**: `%APPDATA%\HTS\Movian\plugins\`
- **macOS**: `~/Library/Application Support/Movian/plugins/`

## Configuration

The plugin includes several configurable settings:

- **API Key**: Authentication token for external APIs
- **Enable Caching**: Toggle caching on/off for performance
- **Items Per Page**: Number of items to load per page (5-100)

Access settings through: Settings → Plugins → Content Provider Plugin

## Code Architecture

### Utility Functions

```javascript
var utils = {
    formatDuration: function(seconds) {
        if (!seconds) return '';
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        
        if (hours > 0) {
            return hours + 'h ' + minutes + 'm';
        }
        return minutes + 'm ' + secs + 's';
    },
    
    buildUrl: function(endpoint, params) {
        var url = API_BASE_URL + endpoint;
        if (params) {
            var queryString = [];
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    queryString.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                }
            }
            if (queryString.length > 0) {
                url += '?' + queryString.join('&');
            }
        }
        return url;
    },
    
    sanitizeText: function(text) {
        if (!text) return '';
        return text.replace(/[<>]/g, '').substring(0, 500);
    }
};
```

### HTTP Request Helper

```javascript
function makeRequest(url, options) {
    try {
        var requestOptions = {
            timeout: 30000,
            headers: {
                'User-Agent': 'Movian Content Provider Plugin 1.0',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            }
        };
        
        if (settings.apiKey && settings.apiKey.trim()) {
            requestOptions.headers['Authorization'] = 'Bearer ' + settings.apiKey.trim();
        }
        
        var response = http.request(url, requestOptions);
        
        if (response.statuscode >= 200 && response.statuscode < 300) {
            var responseText = response.toString();
            if (!responseText || responseText.trim() === '') {
                throw new Error("Empty response from server");
            }
            return JSON.parse(responseText);
        } else {
            var errorMsg = "HTTP " + response.statuscode;
            if (response.statuscode === 401) {
                errorMsg += ": Authentication failed. Check your API key.";
            } else if (response.statuscode === 403) {
                errorMsg += ": Access forbidden. Check your permissions.";
            } else if (response.statuscode === 429) {
                errorMsg += ": Rate limit exceeded. Please try again later.";
            } else if (response.statuscode >= 500) {
                errorMsg += ": Server error. Please try again later.";
            }
            throw new Error(errorMsg);
        }
    } catch (error) {
        if (error.message.indexOf('JSON') !== -1) {
            throw new Error("Invalid response format from server");
        }
        throw error;
    }
}
```

### Content Transformation

```javascript
function transformToMovie(post) {
    return {
        id: post.id,
        title: utils.sanitizeText(post.title),
        description: utils.sanitizeText(post.body),
        year: 2020 + (post.id % 5),
        rating: (7.0 + (post.id % 30) / 10).toFixed(1),
        genre: ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi"][post.id % 5],
        poster: "https://via.placeholder.com/300x450/0066cc/ffffff?text=Movie+" + post.id,
        duration: 90 + (post.id % 60)
    };
}
```

### Caching Implementation

```javascript
var cache = {};
var CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
    if (!settings.enableCache) return null;
    
    var cached = cache[key];
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCachedData(key, data) {
    if (!settings.enableCache) return;
    
    cache[key] = {
        data: data,
        timestamp: Date.now()
    };
}
```

### Async Content Loading

```javascript
new page.Route(PLUGIN_PREFIX + ':popular', function(page) {
    var offset = 0;
    var itemsPerPage = settings.itemsPerPage || 20;
    
    function loadMoreContent() {
        setTimeout(function() {
            if (offset >= 100) {
                page.haveMore(false);
                return;
            }
            
            // Load content batch
            for (var i = startId; i <= endId; i++) {
                page.appendItem(route, itemType, {
                    title: "Content Item " + i,
                    // ... metadata
                });
            }
            
            offset = endId;
            page.haveMore(offset < 100);
        }, 1500);
    }
    
    page.asyncPaginator = loadMoreContent;
    loadMoreContent();
});
```

### Trending Content Implementation

```javascript
new page.Route(PLUGIN_PREFIX + ':trending', function(page) {
    page.type = "directory";
    page.metadata.title = "Trending Now";
    
    try {
        var cacheKey = "trending_content";
        var cachedData = getCachedData(cacheKey);
        
        var trendingItems;
        if (cachedData) {
            trendingItems = cachedData;
        } else {
            var comments = makeRequest(utils.buildUrl('/comments', { _limit: 15 }));
            
            trendingItems = comments.map(function(comment, index) {
                var isMovie = index % 3 !== 0;
                var baseItem = isMovie ? 
                    transformToMovie({ id: comment.id, title: comment.name, body: comment.body }) :
                    transformToTVShow({ id: comment.id, title: comment.name });
                
                return {
                    id: baseItem.id,
                    title: baseItem.title,
                    type: isMovie ? 'movie' : 'show',
                    trendingRank: index + 1
                };
            });
            
            setCachedData(cacheKey, trendingItems);
        }
        
        // Display trending items with ranking
        trendingItems.forEach(function(item) {
            page.appendItem(route, itemType, {
                title: "#" + item.trendingRank + " " + item.title,
                // ... other metadata
            });
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load trending content: " + error.message);
    }
});
```

## API Integration Examples

### Real-World API Integration

To integrate with a real API service, modify the request helper:

```javascript
// Example: TMDB API Integration
var TMDB_API_KEY = settings.apiKey;
var TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function fetchMovies(page) {
    var url = TMDB_BASE_URL + '/movie/popular';
    return makeRequest(url, {
        args: {
            api_key: TMDB_API_KEY,
            page: page || 1
        }
    });
}

function fetchMovieDetails(movieId) {
    var url = TMDB_BASE_URL + '/movie/' + movieId;
    return makeRequest(url, {
        args: {
            api_key: TMDB_API_KEY,
            append_to_response: 'credits,videos'
        }
    });
}
```

### Content Transformation

Transform API responses to Movian format:

```javascript
function transformMovie(apiMovie) {
    return {
        title: apiMovie.title,
        description: apiMovie.overview,
        year: parseInt(apiMovie.release_date.split('-')[0]),
        rating: apiMovie.vote_average * 10, // Convert to 0-100 scale
        genre: apiMovie.genres.map(g => g.name).join(', '),
        poster: 'https://image.tmdb.org/t/p/w500' + apiMovie.poster_path,
        backdrop: 'https://image.tmdb.org/t/p/w1280' + apiMovie.backdrop_path
    };
}
```

## Error Handling Patterns

### Network Error Handling

```javascript
try {
    var data = makeRequest(url);
    // Process data
} catch (error) {
    if (error.message.indexOf('timeout') !== -1) {
        page.error("Request timed out. Please check your connection.");
    } else if (error.message.indexOf('HTTP 401') !== -1) {
        page.error("Authentication failed. Please check your API key.");
    } else if (error.message.indexOf('HTTP 429') !== -1) {
        page.error("Rate limit exceeded. Please try again later.");
    } else {
        page.error("Failed to load content: " + error.message);
    }
}
```

### Graceful Degradation

```javascript
// Fallback to cached data on network failure
var cachedData = getCachedData(cacheKey);
if (cachedData) {
    console.log("Using cached data due to network error");
    displayContent(cachedData);
} else {
    page.error("No cached data available. Please check your connection.");
}
```

## Performance Optimization

### Efficient Pagination

```javascript
// Load content in batches
var BATCH_SIZE = 20;
var currentBatch = 0;

function loadBatch() {
    var start = currentBatch * BATCH_SIZE;
    var end = start + BATCH_SIZE;
    
    // Only fetch if not cached
    var cacheKey = 'batch_' + currentBatch;
    var cached = getCachedData(cacheKey);
    
    if (cached) {
        displayBatch(cached);
    } else {
        fetchBatch(start, end).then(function(data) {
            setCachedData(cacheKey, data);
            displayBatch(data);
        });
    }
}
```

### Memory Management

```javascript
// Clean old cache entries
function cleanCache() {
    var now = Date.now();
    for (var key in cache) {
        if ((now - cache[key].timestamp) > CACHE_DURATION) {
            delete cache[key];
        }
    }
}

// Run cleanup periodically
setInterval(cleanCache, 10 * 60 * 1000); // Every 10 minutes
```

## Testing and Validation

### API Response Validation

```javascript
function validateMovieData(movie) {
    if (!movie.title || typeof movie.title !== 'string') {
        throw new Error('Invalid movie title');
    }
    
    if (movie.year && (movie.year < 1900 || movie.year > new Date().getFullYear() + 5)) {
        console.warn('Suspicious movie year: ' + movie.year);
    }
    
    if (movie.rating && (movie.rating < 0 || movie.rating > 100)) {
        movie.rating = Math.max(0, Math.min(100, movie.rating));
    }
    
    return movie;
}
```

### Plugin Testing

```javascript
// Test mode for development
var TEST_MODE = false; // Set to true for testing

if (TEST_MODE) {
    // Use mock data instead of real API
    function makeRequest(url, options) {
        return getMockData(url);
    }
}
```

## Compatibility

- **Movian Version**: 5.0+
- **API Version**: 2 (ECMAScript)
- **Network**: Requires internet connection for content fetching
- **Platforms**: All supported Movian platforms

## Common Issues and Solutions

### Authentication Problems
- Verify API key is correctly configured in settings
- Check API key permissions and rate limits
- Ensure proper header format for authentication

### Caching Issues
- Clear cache by disabling and re-enabling caching in settings
- Check cache key uniqueness to avoid conflicts
- Monitor memory usage with large cache sizes

### Network Timeouts
- Increase timeout values for slow connections
- Implement retry logic for failed requests
- Add connection status checking

## Common Pitfalls and Anti-Patterns

### ❌ What NOT to Do

#### 1. **Blocking Operations**
```javascript
// BAD: Synchronous operations that block UI
for (var i = 0; i < 1000; i++) {
    processItem(i); // Blocks UI thread
}

// GOOD: Async processing with batching
function processBatch(items, callback) {
    setTimeout(function() {
        var batch = items.splice(0, 20);
        batch.forEach(processItem);
        if (items.length > 0) {
            processBatch(items, callback);
        } else {
            callback();
        }
    }, 10);
}
```

#### 2. **Memory Leaks**
```javascript
// BAD: Unlimited cache growth
cache[key] = data; // Never cleaned up

// GOOD: Bounded cache with cleanup
if (Object.keys(cache).length >= MAX_ENTRIES) {
    cleanOldestEntries();
}
```

#### 3. **Poor Error Handling**
```javascript
// BAD: Generic error messages
catch (error) {
    page.error("Error occurred");
}

// GOOD: Specific, actionable error messages
catch (error) {
    if (error.message.indexOf('network') !== -1) {
        page.error("Network connection failed. Please check your internet connection.");
    }
}
```

#### 4. **Inefficient API Usage**
```javascript
// BAD: Multiple API calls for related data
var movie = getMovie(id);
var director = getDirector(movie.directorId);
var cast = getCast(movie.id);

// GOOD: Batch requests or use APIs that return related data
var movieDetails = getMovieWithDetails(id); // Includes director and cast
```

#### 5. **Unsafe Data Handling**
```javascript
// BAD: Using external data without validation
page.appendItem(movie.url, "video", {
    title: movie.title // Could be undefined or malicious
});

// GOOD: Validate and sanitize all external data
page.appendItem(movie.url, "video", {
    title: utils.sanitizeText(movie.title) || "Unknown Title"
});
```

### ✅ Best Practices Summary

1. **Always validate external data** before using it
2. **Implement proper caching** with size limits and TTL
3. **Use retry logic** for network requests
4. **Provide user-friendly error messages** with actionable advice
5. **Log important events** for debugging
6. **Clean up resources** to prevent memory leaks
7. **Use consistent naming conventions** throughout the plugin
8. **Implement proper settings management** with validation
9. **Handle edge cases** gracefully
10. **Test with poor network conditions** and invalid data

## Troubleshooting

### Plugin Not Loading
- Check that all files are in the correct directory structure
- Verify `plugin.json` syntax is valid JSON
- Check Movian logs for JavaScript errors
- Ensure Movian version supports ECMAScript API version 2
- Verify all required modules are available

### Network Issues
- Verify internet connection is working
- Check if the demo API (jsonplaceholder.typicode.com) is accessible
- Look for firewall or proxy blocking requests
- Check Movian's network settings

### Performance Issues
- Disable caching temporarily to test if cache is causing issues
- Reduce items per page in settings
- Check available memory if cache grows too large
- Monitor network request frequency

### Content Not Displaying
- Check browser developer tools for API response format
- Verify content transformation functions handle edge cases
- Look for missing or malformed metadata fields
- Test with different content types (movies vs TV shows)

### Development and Testing

#### Development Tips
- Enable debug logging: `console.log()` statements appear in Movian logs
- Use `TEST_MODE` flag to switch to mock data during development
- Test error conditions by temporarily breaking API URLs
- Validate JSON responses before parsing
- Monitor memory usage during development
- Test with different network conditions (slow, intermittent)

#### Testing Checklist

**Functionality Testing:**
- [ ] Plugin loads without errors
- [ ] All routes work correctly
- [ ] Search functionality returns relevant results
- [ ] Pagination works properly
- [ ] Settings are saved and applied correctly
- [ ] Cache improves performance on repeated requests

**Error Handling Testing:**
- [ ] Network timeouts are handled gracefully
- [ ] Invalid API responses don't crash the plugin
- [ ] Authentication failures show appropriate messages
- [ ] Rate limiting is handled properly
- [ ] Malformed data is validated and rejected

**Performance Testing:**
- [ ] Large result sets don't block the UI
- [ ] Memory usage stays within reasonable bounds
- [ ] Cache cleanup prevents memory leaks
- [ ] Async operations don't cause race conditions

**User Experience Testing:**
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly and actionable
- [ ] Navigation is intuitive and consistent
- [ ] Content displays correctly with proper metadata

#### Validation Tools

```javascript
// Example validation function for testing
function validatePluginHealth() {
    var issues = [];
    
    // Check cache size
    if (Object.keys(cache).length > MAX_CACHE_ENTRIES * 1.1) {
        issues.push("Cache size exceeds limit");
    }
    
    // Check for memory leaks
    if (typeof gc === 'function') {
        var beforeGC = process.memoryUsage().heapUsed;
        gc();
        var afterGC = process.memoryUsage().heapUsed;
        if (beforeGC - afterGC > 10 * 1024 * 1024) { // 10MB
            issues.push("Potential memory leak detected");
        }
    }
    
    return issues;
}
```

## Related Documentation

- [HTTP API Reference](../../api/http-api.md)
- [Settings API Reference](../../api/settings-api.md)
- [Page API Reference](../../api/page-api.md)
- [Plugin Best Practices](../../best-practices.md)
- [Plugin Architecture Guide](../../architecture.md)

## License

This example is provided as documentation and may be freely used and modified.