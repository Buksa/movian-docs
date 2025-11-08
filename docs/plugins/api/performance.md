# Performance Optimization

Best practices for creating fast and efficient Movian plugins.

## Overview

Performance optimization focuses on:
- Fast page loading
- Efficient data processing
- Minimal memory usage
- Smooth UI updates
- Network efficiency

## Async Operations

### Use Async HTTP Requests

```javascript
// GOOD: Async request
page.loading = true;
http.request(url, function(err, response) {
    page.loading = false;
    if (!err) {
        processData(response);
    }
});

// BAD: Blocks plugin thread
var response = http.request(url);  // Synchronous
```

### Parallel Requests

```javascript
// Load multiple resources in parallel
var pending = 2;
var results = {};

function checkComplete() {
    if (--pending === 0) {
        displayResults(results);
    }
}

http.request(url1, function(err, response) {
    results.data1 = response;
    checkComplete();
});

http.request(url2, function(err, response) {
    results.data2 = response;
    checkComplete();
});
```

## Caching Strategies

### Memory Cache

```javascript
var cache = {};
var CACHE_TTL = 3600000;  // 1 hour

function getCached(key) {
    var entry = cache[key];
    if (entry && Date.now() - entry.time < CACHE_TTL) {
        return entry.data;
    }
    return null;
}

function setCache(key, data) {
    cache[key] = {
        data: data,
        time: Date.now()
    };
}
```

### Persistent Cache

```javascript
var store = require('movian/store');

function getCachedData(key) {
    var cached = store[key];
    if (cached) {
        var data = JSON.parse(cached);
        if (Date.now() - data.timestamp < 3600000) {
            return data.value;
        }
    }
    return null;
}

function setCachedData(key, value) {
    store[key] = JSON.stringify({
        value: value,
        timestamp: Date.now()
    });
}
```

## Data Processing

### Lazy Loading

```javascript
// Load data incrementally
function loadPage(page, offset, limit) {
    var url = baseUrl + "?offset=" + offset + "&limit=" + limit;
    
    http.request(url, function(err, response) {
        if (!err) {
            var data = JSON.parse(response.toString());
            displayItems(page, data.items);
            
            // Load more if available
            if (data.hasMore) {
                loadPage(page, offset + limit, limit);
            }
        }
    });
}

loadPage(page, 0, 20);  // Start with 20 items
```

### Batch Operations

```javascript
// BAD: Individual database inserts
for (var i = 0; i < 1000; i++) {
    db.exec("INSERT INTO items VALUES (" + i + ")");
}

// GOOD: Batch with transaction
db.begin();
var stmt = db.prepare("INSERT INTO items VALUES (?)");
for (var i = 0; i < 1000; i++) {
    stmt.bind(i).execute();
}
stmt.finalize();
db.commit();
```

## Memory Management

### Avoid Memory Leaks

```javascript
// BAD: Leaks subscriptions
function createPage() {
    prop.subscribe(someProp, function() {
        // Callback never cleaned up
    });
}

// GOOD: Clean up subscriptions
function createPage() {
    var subscriptions = [];
    
    subscriptions.push(prop.subscribe(someProp, callback));
    
    page.onDestroy(function() {
        subscriptions.forEach(function(sub) {
            sub.destroy();
        });
    });
}
```

### Limit Cache Size

```javascript
var cache = {};
var MAX_CACHE_SIZE = 100;
var cacheKeys = [];

function setCache(key, value) {
    if (cacheKeys.length >= MAX_CACHE_SIZE) {
        var oldKey = cacheKeys.shift();
        delete cache[oldKey];
    }
    
    cache[key] = value;
    cacheKeys.push(key);
}
```

## Network Optimization

### Request Throttling

```javascript
var requestQueue = [];
var activeRequests = 0;
var MAX_CONCURRENT = 4;

function queueRequest(url, callback) {
    requestQueue.push({url: url, callback: callback});
    processQueue();
}

function processQueue() {
    while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
        var req = requestQueue.shift();
        activeRequests++;
        
        http.request(req.url, function(err, response) {
            activeRequests--;
            req.callback(err, response);
            processQueue();
        });
    }
}
```

### Request Deduplication

```javascript
var pendingRequests = {};

function deduplicatedRequest(url, callback) {
    if (pendingRequests[url]) {
        pendingRequests[url].push(callback);
        return;
    }
    
    pendingRequests[url] = [callback];
    
    http.request(url, function(err, response) {
        var callbacks = pendingRequests[url];
        delete pendingRequests[url];
        
        callbacks.forEach(function(cb) {
            cb(err, response);
        });
    });
}
```

## UI Performance

### Minimize Property Updates

```javascript
// BAD: Multiple updates trigger multiple redraws
page.metadata.title = "Title";
page.metadata.icon = "icon.png";
page.metadata.background = "bg.jpg";

// GOOD: Batch updates
var metadata = page.metadata;
metadata.title = "Title";
metadata.icon = "icon.png";
metadata.background = "bg.jpg";
```

### Efficient Item Creation

```javascript
// BAD: Create items one by one
items.forEach(function(item) {
    page.appendItem("video", item.title, {url: item.url});
});

// GOOD: Prepare data first, then create items
var itemData = items.map(function(item) {
    return {
        type: "video",
        title: item.title,
        url: item.url
    };
});

itemData.forEach(function(data) {
    page.appendItem(data.type, data.title, {url: data.url});
});
```

## Database Optimization

### Use Indexes

```javascript
// Create indexes for frequently queried columns
db.exec("CREATE INDEX IF NOT EXISTS idx_timestamp ON cache(timestamp)");
db.exec("CREATE INDEX IF NOT EXISTS idx_user_id ON history(user_id)");
```

### Prepared Statements

```javascript
// BAD: Repeated parsing
for (var i = 0; i < 1000; i++) {
    db.query("SELECT * FROM users WHERE id = " + i);
}

// GOOD: Prepared statement
var stmt = db.prepare("SELECT * FROM users WHERE id = ?");
for (var i = 0; i < 1000; i++) {
    var results = stmt.bind(i).execute();
}
stmt.finalize();
```

## Profiling and Measurement

### Timing Operations

```javascript
function measureTime(name, func) {
    var start = Date.now();
    var result = func();
    var elapsed = Date.now() - start;
    console.log(name + " took " + elapsed + "ms");
    return result;
}

// Usage
measureTime("Data processing", function() {
    return processLargeDataset(data);
});
```

### Memory Usage

```javascript
// Monitor cache size
function getCacheSize() {
    var size = 0;
    for (var key in cache) {
        size += JSON.stringify(cache[key]).length;
    }
    return size;
}

console.log("Cache size:", getCacheSize(), "bytes");
```

## Best Practices

### Do's ✅

- Use async operations for I/O
- Cache frequently accessed data
- Use prepared statements for databases
- Create indexes on queried columns
- Batch operations when possible
- Limit cache size
- Throttle network requests
- Clean up resources
- Profile performance bottlenecks

### Don'ts ❌

- Don't block with synchronous operations
- Don't make excessive HTTP requests
- Don't store large objects in memory
- Don't update UI unnecessarily
- Don't ignore cache invalidation
- Don't leak subscriptions
- Don't use SELECT * in queries
- Don't ignore database transactions

## See Also

- [Best Practices](../best-practices.md) - Development patterns
- [HTTP API](http-api.md) - Network operations
- [SQLite API](sqlite-api.md) - Database operations
- [Storage API](storage-api.md) - Data persistence
