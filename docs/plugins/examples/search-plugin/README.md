# Search Plugin Example

A comprehensive example demonstrating advanced search functionality in Movian plugins.

## Overview

This plugin showcases sophisticated search patterns including:

- **Multi-Source Search**: Aggregating results from multiple content sources
- **Search History**: Persistent storage of user search queries
- **Smart Suggestions**: Context-aware search recommendations
- **Result Filtering**: Advanced sorting and filtering options
- **Asynchronous Operations**: Non-blocking search with Promise-based architecture
- **Performance Optimization**: Caching and efficient result aggregation

## Features Demonstrated

### 🔍 Advanced Search Capabilities
- Multi-source search aggregation
- Configurable search sources (Movies, TV Shows, Music)
- Real-time search suggestions
- Search history with persistence
- Result sorting by relevance, year, rating, or title

### 💾 Data Persistence
- Search history storage using `movian/store`
- User preference persistence
- Configurable search behavior
- Cache management for performance

### ⚡ Asynchronous Architecture
- Promise-based search operations
- Parallel search execution across sources
- Non-blocking UI updates
- Error handling and recovery

### 🎛️ User Experience
- Intuitive search interface
- Popular search suggestions
- Category-specific search
- Search refinement options
- Loading states and progress indicators

## File Structure

```
search-plugin/
├── plugin.json          # Plugin manifest
├── main.js              # Main implementation
├── logo.png             # Plugin icon (optional)
└── README.md            # This documentation
```

## Installation

1. Copy the `search-plugin` directory to your Movian plugins folder
2. Restart Movian or reload plugins
3. The plugin will appear as "Advanced Search" in the main menu

## Configuration

Configure search behavior through: Settings → Plugins → Search Plugin

### Search Sources
- **Search Movies**: Enable/disable movie search
- **Search TV Shows**: Enable/disable TV show search  
- **Search Music**: Enable/disable music search

### Search Behavior
- **Max Results Per Source**: Number of results from each source (5-100)
- **Save Search History**: Enable persistent search history
- **Show Search Suggestions**: Enable search suggestions
- **Default Sort Order**: Default result sorting method

## Architecture Overview

### Search Source Interface

Each search source implements a common interface:

```javascript
var searchSource = {
    name: "Source Name",
    enabled: function() { 
        return settings.enableSource; 
    },
    search: function(query, options) {
        return new Promise(function(resolve, reject) {
            // Perform search and resolve with results array
            resolve(results);
        });
    }
};
```

### Result Aggregation

```javascript
function performSearch(query, options) {
    var promises = [];
    
    // Collect enabled sources
    for (var sourceId in searchSources) {
        var source = searchSources[sourceId];
        if (source.enabled()) {
            promises.push(source.search(query, options));
        }
    }
    
    // Wait for all searches and combine results
    return Promise.all(promises).then(function(resultSets) {
        var allResults = [];
        resultSets.forEach(function(results) {
            allResults = allResults.concat(results);
        });
        
        // Sort by relevance, year, rating, or title
        return sortResults(allResults, options.sortBy);
    });
}
```

### Search History Management

```javascript
function addToSearchHistory(query) {
    if (!settings.enableHistory) return;
    
    var history = getSearchHistory();
    
    // Remove duplicates and add to front
    history = history.filter(function(item) {
        return item.query !== query;
    });
    
    history.unshift({
        query: query,
        timestamp: Date.now(),
        count: 1
    });
    
    // Keep only last 50 searches
    storage.searchHistory = history.slice(0, 50);
}
```

## Implementation Examples

### Custom Search Source

Add a new search source for your content:

```javascript
searchSources.mySource = {
    name: "My Content Source",
    enabled: function() { 
        return settings.enableMySource; 
    },
    search: function(query, options) {
        return new Promise(function(resolve, reject) {
            try {
                // Make API request
                var response = http.request('https://api.example.com/search', {
                    args: {
                        q: query,
                        limit: options.maxResults || 20
                    }
                });
                
                var data = JSON.parse(response.toString());
                
                // Transform to standard format
                var results = data.items.map(function(item) {
                    return {
                        type: 'video',
                        title: item.title,
                        description: item.synopsis,
                        year: item.release_year,
                        rating: item.rating,
                        poster: item.poster_url,
                        url: item.stream_url,
                        relevance: item.score,
                        source: 'mySource'
                    };
                });
                
                resolve(results);
            } catch (error) {
                reject(error);
            }
        });
    }
};
```

### Advanced Result Filtering

```javascript
function filterResults(results, filters) {
    return results.filter(function(result) {
        // Year range filter
        if (filters.yearMin && result.year < filters.yearMin) return false;
        if (filters.yearMax && result.year > filters.yearMax) return false;
        
        // Rating filter
        if (filters.minRating && parseFloat(result.rating) < filters.minRating) return false;
        
        // Genre filter
        if (filters.genre && result.genre !== filters.genre) return false;
        
        // Content type filter
        if (filters.type && result.type !== filters.type) return false;
        
        return true;
    });
}
```

### Search Analytics

```javascript
function trackSearchAnalytics(query, resultCount, sources) {
    var analytics = storage.searchAnalytics || {};
    
    // Track popular queries
    if (!analytics.popularQueries) analytics.popularQueries = {};
    analytics.popularQueries[query] = (analytics.popularQueries[query] || 0) + 1;
    
    // Track source performance
    if (!analytics.sourceStats) analytics.sourceStats = {};
    sources.forEach(function(source) {
        if (!analytics.sourceStats[source]) {
            analytics.sourceStats[source] = { searches: 0, totalResults: 0 };
        }
        analytics.sourceStats[source].searches++;
        analytics.sourceStats[source].totalResults += resultCount;
    });
    
    storage.searchAnalytics = analytics;
}
```

## Performance Optimization

### Result Caching

```javascript
var searchCache = {};
var CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedResults(query, sources) {
    var cacheKey = query + ':' + sources.join(',');
    var cached = searchCache[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.results;
    }
    
    return null;
}

function setCachedResults(query, sources, results) {
    var cacheKey = query + ':' + sources.join(',');
    searchCache[cacheKey] = {
        results: results,
        timestamp: Date.now()
    };
}
```

### Debounced Search

```javascript
var searchTimeout;

function debouncedSearch(query, callback, delay) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
        performSearch(query).then(callback);
    }, delay || 300);
}
```

### Parallel vs Sequential Search

```javascript
// Parallel search (faster, more resource intensive)
function parallelSearch(query, sources) {
    var promises = sources.map(function(source) {
        return source.search(query);
    });
    
    return Promise.all(promises);
}

// Sequential search (slower, less resource intensive)
function sequentialSearch(query, sources) {
    return sources.reduce(function(promise, source) {
        return promise.then(function(results) {
            return source.search(query).then(function(newResults) {
                return results.concat(newResults);
            });
        });
    }, Promise.resolve([]));
}
```

## Error Handling Strategies

### Graceful Degradation

```javascript
function robustSearch(query, sources) {
    var promises = sources.map(function(source) {
        return source.search(query).catch(function(error) {
            console.warn("Search failed for source " + source.name + ": " + error.message);
            return []; // Return empty results instead of failing
        });
    });
    
    return Promise.all(promises).then(function(resultSets) {
        var successfulSources = 0;
        var allResults = [];
        
        resultSets.forEach(function(results, index) {
            if (results.length > 0) {
                successfulSources++;
                allResults = allResults.concat(results);
            }
        });
        
        if (successfulSources === 0) {
            throw new Error("All search sources failed");
        }
        
        return allResults;
    });
}
```

### Retry Logic

```javascript
function searchWithRetry(source, query, maxRetries) {
    var retries = 0;
    
    function attempt() {
        return source.search(query).catch(function(error) {
            if (retries < maxRetries) {
                retries++;
                console.log("Retrying search, attempt " + retries);
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(attempt());
                    }, 1000 * retries); // Exponential backoff
                });
            } else {
                throw error;
            }
        });
    }
    
    return attempt();
}
```

## Testing and Validation

### Mock Search Sources

```javascript
// Test mode with mock data
var TEST_MODE = false;

if (TEST_MODE) {
    searchSources.movies.search = function(query, options) {
        return Promise.resolve([
            {
                type: 'movie',
                title: 'Test Movie: ' + query,
                description: 'Mock movie result',
                year: 2023,
                rating: '8.5',
                relevance: 0.9,
                source: 'movies'
            }
        ]);
    };
}
```

### Performance Monitoring

```javascript
function monitorSearchPerformance(searchFunction) {
    return function(query, options) {
        var startTime = Date.now();
        
        return searchFunction(query, options).then(function(results) {
            var duration = Date.now() - startTime;
            console.log("Search completed in " + duration + "ms, " + results.length + " results");
            
            // Log slow searches
            if (duration > 5000) {
                console.warn("Slow search detected: " + duration + "ms for query '" + query + "'");
            }
            
            return results;
        });
    };
}
```

## Compatibility

- **Movian Version**: 5.0+
- **API Version**: 2 (ECMAScript)
- **Storage**: Uses `movian/store` for persistence
- **Network**: Requires internet for external search sources
- **Platforms**: All supported Movian platforms

## Common Use Cases

### Content Discovery Platform
- Aggregate content from multiple streaming services
- Unified search across different content types
- Personalized recommendations based on search history

### Media Library Search
- Search local and network media libraries
- Metadata-based filtering and sorting
- Advanced search with multiple criteria

### Live Content Search
- Real-time search of live streams
- Dynamic content discovery
- Social media integration

## Related Documentation

- [HTTP API Reference](../../api/http-api.md)
- [Storage API Reference](../../api/storage-api.md)
- [Settings API Reference](../../api/settings-api.md)
- [Page API Reference](../../api/page-api.md)
- [Plugin Best Practices](../../best-practices.md)

## License

This example is provided as documentation and may be freely used and modified.