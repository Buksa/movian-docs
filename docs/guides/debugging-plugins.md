# Debugging Plugins

This guide covers techniques and tools for debugging Movian plugins.

## Debug Logging

### Enable Plugin Debug Mode

Run Movian with plugin debugging:

```bash
movian --debug plugin
```

### Console Logging

Use `console.log()` in your plugin:

```javascript
console.log("Debug message:", variable);
console.log("Object:", JSON.stringify(obj, null, 2));
```

### Log Levels

```javascript
console.log("Info message");
console.warn("Warning message");
console.error("Error message");
```

## Common Issues

### Plugin Not Loading

**Check:**

1. `plugin.json` is valid JSON
2. Plugin ID is unique
3. File paths are correct
4. Movian logs for errors

**Debug:**

```bash
movian --debug plugin --trace
```

### JavaScript Errors

**Symptoms:**

- Plugin crashes
- Functions not working
- Unexpected behavior

**Debug:**

```javascript
try {
  // Your code
} catch(e) {
  console.error("Error:", e.message);
  console.error("Stack:", e.stack);
}
```

### HTTP Request Failures

**Debug HTTP requests:**

```javascript
try {
  var response = showtime.httpReq(url, {
    debug: true  // Enable HTTP debugging
  });
  console.log("Response:", response.toString());
} catch(e) {
  console.error("HTTP Error:", e.message);
}
```

### Page Not Rendering

**Check:**

1. Route pattern matches URL
2. `page.loading = false` is set
3. Items are added correctly
4. No JavaScript errors

**Debug:**

```javascript
new page.Route("plugin:page", function(page) {
  console.log("Route handler called");
  
  page.type = "directory";
  console.log("Page type set");
  
  page.appendItem("url", "video", {title: "Test"});
  console.log("Item added");
  
  page.loading = false;
  console.log("Loading complete");
});
```

## Debugging Techniques

### Breakpoint Simulation

```javascript
function debugBreakpoint(message) {
  console.log("=== BREAKPOINT ===");
  console.log(message);
  console.log("=================");
}

debugBreakpoint("Before API call");
var result = apiCall();
debugBreakpoint("After API call: " + JSON.stringify(result));
```

### Variable Inspection

```javascript
function inspect(obj, name) {
  console.log("=== " + name + " ===");
  for (var key in obj) {
    console.log(key + ":", obj[key]);
  }
  console.log("================");
}

inspect(page, "Page Object");
inspect(page.metadata, "Page Metadata");
```

### Timing Analysis

```javascript
var startTime = Date.now();

// Your code here

var endTime = Date.now();
console.log("Execution time:", (endTime - startTime) + "ms");
```

### Network Debugging

```javascript
function debugHttpRequest(url, options) {
  console.log("HTTP Request:", url);
  console.log("Options:", JSON.stringify(options));
  
  var start = Date.now();
  try {
    var response = showtime.httpReq(url, options);
    var duration = Date.now() - start;
    
    console.log("Response received in", duration + "ms");
    console.log("Status:", response.statuscode);
    console.log("Headers:", JSON.stringify(response.headers));
    
    return response;
  } catch(e) {
    console.error("Request failed:", e.message);
    throw e;
  }
}
```

## Testing Strategies

### Unit Testing

Create test functions:

```javascript
function testParseData() {
  var input = '{"test": "data"}';
  var result = parseData(input);
  
  if (result.test === "data") {
    console.log("✓ testParseData passed");
  } else {
    console.error("✗ testParseData failed");
  }
}

// Run tests
testParseData();
```

### Integration Testing

Test complete workflows:

```javascript
function testVideoPlayback() {
  console.log("Testing video playback...");
  
  // Create test page
  new page.Route("test:video", function(page) {
    page.type = "directory";
    page.appendItem("test:play:1", "video", {
      title: "Test Video"
    });
    page.loading = false;
  });
  
  console.log("Test route created");
}
```

## Log Analysis

### Find Plugin Logs

**Linux/macOS:**
```bash
tail -f ~/.hts/movian/log
```

**Windows:**
```cmd
type %APPDATA%\Movian\log
```

### Filter Logs

```bash
grep "plugin:myplugin" ~/.hts/movian/log
```

### Common Error Patterns

**Syntax Error:**
```
SyntaxError: Unexpected token
```

**Reference Error:**
```
ReferenceError: variable is not defined
```

**Type Error:**
```
TypeError: Cannot read property 'x' of undefined
```

## Best Practices

### Defensive Programming

```javascript
function safeAccess(obj, path) {
  var parts = path.split('.');
  var current = obj;
  
  for (var i = 0; i < parts.length; i++) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[parts[i]];
  }
  
  return current;
}

// Usage
var title = safeAccess(data, 'metadata.title') || 'Unknown';
```

### Error Boundaries

```javascript
function withErrorHandling(fn) {
  return function() {
    try {
      return fn.apply(this, arguments);
    } catch(e) {
      console.error("Error in", fn.name, ":", e.message);
      return null;
    }
  };
}

// Usage
var safeFunction = withErrorHandling(riskyFunction);
```

### Validation

```javascript
function validateConfig(config) {
  var errors = [];
  
  if (!config.apiKey) {
    errors.push("Missing apiKey");
  }
  
  if (!config.baseUrl) {
    errors.push("Missing baseUrl");
  }
  
  if (errors.length > 0) {
    console.error("Configuration errors:", errors.join(", "));
    return false;
  }
  
  return true;
}
```

## Tools

### JSON Validator

```javascript
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch(e) {
    console.error("Invalid JSON:", e.message);
    return false;
  }
}
```

### URL Validator

```javascript
function isValidUrl(url) {
  var pattern = /^https?:\/\/.+/;
  if (!pattern.test(url)) {
    console.error("Invalid URL:", url);
    return false;
  }
  return true;
}
```

## Performance Debugging

### Memory Usage

Monitor object creation:

```javascript
var objectCount = 0;

function createObject() {
  objectCount++;
  console.log("Objects created:", objectCount);
  return {};
}
```

### Request Optimization

```javascript
var requestCache = {};

function cachedRequest(url) {
  if (requestCache[url]) {
    console.log("Cache hit:", url);
    return requestCache[url];
  }
  
  console.log("Cache miss:", url);
  var response = showtime.httpReq(url);
  requestCache[url] = response;
  return response;
}
```

## See Also

- [Plugin Development](../plugins/getting-started.md)
- [API Reference](../plugins/api/core-api.md)
- [Development Setup](development-setup.md)
- [Best Practices](../plugins/best-practices.md)
