# Plugin API Overview

This directory contains comprehensive documentation for all JavaScript APIs available to Movian plugins.

## API Categories

### Core APIs

**[Core API](core-api.md)** - Essential plugin functionality
- Service registration and management
- Page creation and navigation
- Property system for data binding
- Event handling and dispatch

**[Page API](page-api.md)** - Page and navigation management
- Page types and lifecycle
- Item management and display
- Metadata and properties
- Navigation and routing

**[Property API](prop-api.md)** - Property system and data binding
- Property creation and manipulation
- Subscriptions and callbacks
- Data binding patterns
- Property trees and hierarchies

### Data and Storage APIs

**[Storage API](storage-api.md)** - Persistent data storage
- Key-value store operations
- Plugin-specific storage
- Data persistence patterns
- Storage quotas and limits

**[SQLite API](sqlite-api.md)** - Database operations
- Database creation and management
- SQL query execution
- Prepared statements
- Transaction handling

### Network APIs

**[HTTP API](http-api.md)** - HTTP client functionality
- HTTP requests (GET, POST, etc.)
- Request configuration and headers
- Response handling
- Error handling and retries

### Configuration APIs

**[Settings API](settings-api.md)** - Plugin configuration
- Settings definition and registration
- User preferences management
- Settings UI integration
- Configuration persistence

## Cross-Cutting Concerns

**[Error Handling](error-handling.md)** - Error management patterns
- Exception handling
- Error reporting
- Recovery strategies
- Debugging techniques

**[Performance](performance.md)** - Performance optimization
- Best practices for efficient plugins
- Caching strategies
- Async operations
- Resource management

**[Security](security.md)** - Security considerations
- Input validation
- XSS prevention
- HTTPS requirements
- Secure storage

## API Reference Format

Each API document follows this structure:

1. **Overview** - Purpose and use cases
2. **Module Import** - How to access the API
3. **Functions** - Complete function reference with signatures
4. **Examples** - Working code examples
5. **Best Practices** - Recommended patterns
6. **Common Pitfalls** - Things to avoid
7. **See Also** - Related documentation

## Quick Start

### Basic Plugin Structure

```javascript
// Import required modules
var service = require('movian/service');
var page = require('movian/page');
var http = require('movian/http');
var store = require('movian/store');

// Note: Plugin is a global object, no need to require it

// Register service
service.create("My Service", "myservice:start", "video", true, 
               Plugin.path + "logo.png");

// Handle page requests
new page.Route("^myservice:(.*)$", function(page, action) {
    page.type = "directory";
    page.metadata.title = "My Service";
    
    // Fetch data
    var response = http.request("https://api.example.com/data");
    var data = JSON.parse(response.toString());
    
    // Display items
    data.items.forEach(function(item) {
        page.appendItem("video", item.title, {
            url: item.video_url,
            icon: item.thumbnail
        });
    });
});
```

### Common Patterns

**Async Data Loading**:
```javascript
page.loading = true;
http.request("https://api.example.com/data", function(err, response) {
    page.loading = false;
    
    if (err) {
        page.error("Failed to load data: " + err);
        return;
    }
    
    var data = JSON.parse(response.toString());
    displayData(page, data);
});
```

**Settings Integration**:
```javascript
var settings = require('movian/settings');

settings.createString('username', 'Username', '', function(v) {
    store.username = v;
});

settings.createPassword('password', 'Password', '', function(v) {
    store.password = v;
});
```

**Property Binding**:
```javascript
var prop = require('movian/prop');

// Create property
var myProp = prop.createRoot();
myProp.title = "Initial Title";

// Subscribe to changes
prop.subscribe(myProp, function(value) {
    console.log("Title changed to: " + value.title);
});

// Update property
myProp.title = "New Title";  // Triggers subscription
```

## API Compatibility

### Version Requirements

| API | Minimum Version | Notes |
|-----|----------------|-------|
| Core API | 4.8+ | Basic functionality |
| Page API | 4.8+ | Full page management |
| HTTP API | 4.8+ | HTTP client |
| Storage API | 4.8+ | Key-value store |
| SQLite API | 4.8+ | Database operations |
| Settings API | 4.8+ | Plugin settings |
| Property API | 4.8+ | Property system |

### Deprecated APIs

Some older APIs are deprecated but still supported:

- `showtime.*` - Use `movian.*` instead
- `page.appendPassiveItem()` - Use `page.appendItem()` with appropriate type
- Old HTTP module - Use `movian/http` instead

See [HTML Modules Comparison](html-modules-comparison.md) for details on module differences.

## Module System

### Module Import

```javascript
// Standard modules (built-in)
var http = require('movian/http');
var page = require('movian/page');
var service = require('movian/service');

// Legacy modules (compatibility)
var http = require('http');  // Old style, still works

// Plugin-local modules
var utils = require('./utils');  // Relative path
```

### Module Exports

```javascript
// utils.js - Plugin-local module
exports.formatDate = function(date) {
    return date.toISOString();
};

exports.parseJSON = function(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
};

// main.js - Use local module
var utils = require('./utils');
var formatted = utils.formatDate(new Date());
```

## Error Handling

### Try-Catch Pattern

```javascript
try {
    var data = JSON.parse(response.toString());
    processData(data);
} catch (e) {
    console.error("Error processing data: " + e);
    page.error("Failed to process data");
}
```

### Async Error Handling

```javascript
http.request(url, function(err, response) {
    if (err) {
        console.error("HTTP error: " + err);
        page.error("Network error: " + err);
        return;
    }
    
    try {
        var data = JSON.parse(response.toString());
        processData(data);
    } catch (e) {
        console.error("Parse error: " + e);
        page.error("Invalid response format");
    }
});
```

## Debugging

### Console Logging

```javascript
// Basic logging
console.log("Debug message");
console.error("Error message");

// Formatted output
console.log("User: " + username + ", ID: " + userId);

// Object inspection
console.log("Data:", JSON.stringify(data, null, 2));
```

### Debug Mode

```bash
# Run Movian with plugin debugging
movian --debug-ecmascript

# Enable specific plugin debugging
movian --ecmascript=trace
```

### Common Debug Techniques

```javascript
// Trace function calls
function myFunction(arg) {
    console.log("myFunction called with:", arg);
    // Function body...
    console.log("myFunction returning:", result);
    return result;
}

// Dump object properties
function dumpObject(obj, name) {
    console.log(name + ":");
    for (var key in obj) {
        console.log("  " + key + ": " + obj[key]);
    }
}

// Performance timing
var start = Date.now();
performOperation();
var elapsed = Date.now() - start;
console.log("Operation took " + elapsed + "ms");
```

## Best Practices

### Do's ✅

- **Use async operations** for network requests
- **Validate user input** before processing
- **Handle errors gracefully** with try-catch
- **Cache data** when appropriate
- **Use property system** for reactive updates
- **Follow naming conventions** for consistency
- **Document your code** with comments
- **Test error paths** thoroughly

### Don'ts ❌

- **Don't block the main thread** with long operations
- **Don't ignore errors** - always handle them
- **Don't store sensitive data** in plain text
- **Don't make excessive HTTP requests** - use caching
- **Don't use global variables** - use proper scoping
- **Don't hardcode URLs** - use settings
- **Don't trust external data** - validate everything
- **Don't leak memory** - clean up resources

## Performance Tips

### Efficient Data Loading

```javascript
// BAD: Load all data at once
var allData = loadAllData();  // Blocks for long time

// GOOD: Load data incrementally
function loadPage(page, offset, limit) {
    var data = loadDataRange(offset, limit);
    displayData(page, data);
}
```

### Caching Strategy

```javascript
var cache = {};
var CACHE_TTL = 3600000;  // 1 hour

function getCachedData(key) {
    var cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedData(key, data) {
    cache[key] = {
        data: data,
        timestamp: Date.now()
    };
}
```

### Resource Cleanup

```javascript
// Clean up subscriptions
var subscription = prop.subscribe(myProp, callback);
// Later...
subscription.destroy();

// Clean up timers
var timer = setTimeout(function() {
    // ...
}, 1000);
// Later...
clearTimeout(timer);
```

## Security Guidelines

### Input Validation

```javascript
function validateUsername(username) {
    if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("Username contains invalid characters");
    }
    return username;
}
```

### XSS Prevention

```javascript
// BAD: Direct HTML injection
page.appendItem("label", "<b>" + userInput + "</b>");

// GOOD: Use text content
page.appendItem("label", userInput);
```

### Secure Storage

```javascript
// BAD: Store password in plain text
store.password = password;

// GOOD: Don't store passwords, use tokens
store.authToken = getAuthToken(username, password);
```

## Migration Guide

### From Old APIs

```javascript
// Old style (deprecated)
var http = require('http');
showtime.print("Message");

// New style (recommended)
var http = require('movian/http');
console.log("Message");
```

### Module Updates

See [HTML Modules Comparison](html-modules-comparison.md) for detailed migration information.

## Additional Resources

### Example Plugins

- [Hello World](../examples/hello-world/) - Basic plugin structure
- [Content Provider](../examples/content-provider/) - Media content plugin
- [Search Plugin](../examples/search-plugin/) - Search functionality
- [Configurable Plugin](../examples/configurable-plugin/) - Settings integration
- [Advanced UI Plugin](../examples/advanced-ui-plugin/) - Custom UI elements

### Related Documentation

- [Plugin Architecture](../architecture.md) - Plugin system overview
- [Plugin Lifecycle](../lifecycle.md) - Plugin loading and execution
- [Best Practices](../best-practices.md) - Development patterns
- [Debugging Guide](../../guides/debugging-plugins.md) - Debugging techniques

## Getting Help

### Community Resources

- **GitHub Issues**: Report bugs and request features
- **Forum**: Ask questions and share knowledge
- **IRC**: Real-time chat with developers
- **Wiki**: Community-maintained documentation

### Reporting Issues

When reporting API issues, include:

1. Movian version
2. Plugin code (minimal example)
3. Expected behavior
4. Actual behavior
5. Error messages or logs
6. Steps to reproduce

## Contributing

To contribute to API documentation:

1. Fork the repository
2. Make your changes
3. Test with real plugins
4. Submit pull request
5. Follow documentation standards

See [Contributing Guide](../../CONTRIBUTING.md) for details.
