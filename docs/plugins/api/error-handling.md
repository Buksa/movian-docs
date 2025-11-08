# Error Handling

Best practices and patterns for error handling in Movian plugins.

## Overview

Proper error handling ensures:
- Graceful degradation
- User-friendly error messages
- Debugging information
- Application stability
- Data integrity

## Error Types

### JavaScript Errors

```javascript
// Syntax errors
try {
    eval("invalid javascript{");
} catch (e) {
    console.error("Syntax error:", e);
}

// Runtime errors
try {
    var obj = null;
    obj.property;  // TypeError
} catch (e) {
    console.error("Runtime error:", e);
}

// Type errors
try {
    var num = "not a number";
    num.toFixed(2);  // TypeError
} catch (e) {
    console.error("Type error:", e);
}
```

### Network Errors

```javascript
http.request(url, function(err, response) {
    if (err) {
        if (err.code === 'ETIMEDOUT') {
            page.error("Request timed out");
        } else if (err.code === 'ENOTFOUND') {
            page.error("Server not found");
        } else {
            page.error("Network error: " + err.message);
        }
        return;
    }
    // Process response
});
```

### API Errors

```javascript
try {
    var data = JSON.parse(response.toString());
    
    if (data.error) {
        throw new Error("API error: " + data.error.message);
    }
    
    if (!data.results) {
        throw new Error("Invalid API response");
    }
    
    processData(data.results);
} catch (e) {
    console.error("API error:", e);
    page.error("Failed to process data");
}
```

## Error Handling Patterns

### Try-Catch Pattern

```javascript
function safeOperation() {
    try {
        // Risky operation
        var data = JSON.parse(response);
        return processData(data);
    } catch (e) {
        console.error("Operation failed:", e);
        return null;
    }
}
```

### Error-First Callbacks

```javascript
function asyncOperation(callback) {
    http.request(url, function(err, response) {
        if (err) {
            callback(err, null);
            return;
        }
        
        try {
            var data = JSON.parse(response.toString());
            callback(null, data);
        } catch (e) {
            callback(e, null);
        }
    });
}

// Usage
asyncOperation(function(err, data) {
    if (err) {
        console.error("Error:", err);
        return;
    }
    // Use data
});
```

### Guard Clauses

```javascript
function processUser(user) {
    if (!user) {
        console.error("User is null");
        return;
    }
    
    if (!user.id) {
        console.error("User has no ID");
        return;
    }
    
    if (!user.name) {
        console.error("User has no name");
        return;
    }
    
    // Process valid user
    console.log("Processing user:", user.name);
}
```

### Validation Functions

```javascript
function validateEmail(email) {
    if (!email) {
        throw new Error("Email is required");
    }
    
    if (typeof email !== 'string') {
        throw new Error("Email must be a string");
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email format");
    }
    
    return email.toLowerCase();
}

try {
    var email = validateEmail(userInput);
    // Use validated email
} catch (e) {
    page.error(e.message);
}
```

## User-Facing Errors

### Page Errors

```javascript
// Display error to user
page.error("Failed to load content");

// Error with details
page.error("Network error: " + err.message);

// Temporary error (can retry)
page.error("Temporary error, please try again");
```

### Loading States

```javascript
page.loading = true;

http.request(url, function(err, response) {
    page.loading = false;
    
    if (err) {
        page.error("Failed to load: " + err.message);
        return;
    }
    
    // Display content
});
```

### Graceful Degradation

```javascript
function loadContent(page) {
    http.request(primaryUrl, function(err, response) {
        if (err) {
            console.log("Primary source failed, trying fallback");
            
            http.request(fallbackUrl, function(err2, response2) {
                if (err2) {
                    page.error("All sources failed");
                    return;
                }
                
                displayContent(page, response2);
            });
            return;
        }
        
        displayContent(page, response);
    });
}
```

## Logging and Debugging

### Console Logging

```javascript
// Different log levels
console.log("Info message");
console.warn("Warning message");
console.error("Error message");

// Structured logging
console.log("Operation:", operation, "Status:", status);

// Object inspection
console.log("Data:", JSON.stringify(data, null, 2));
```

### Error Context

```javascript
function processData(data, context) {
    try {
        // Process data
        return transform(data);
    } catch (e) {
        console.error("Error in processData:", {
            error: e.message,
            context: context,
            data: data
        });
        throw e;
    }
}
```

### Stack Traces

```javascript
try {
    riskyOperation();
} catch (e) {
    console.error("Error:", e.message);
    console.error("Stack:", e.stack);
}
```

## Retry Logic

### Simple Retry

```javascript
function retryRequest(url, maxRetries, callback) {
    var attempts = 0;
    
    function attempt() {
        attempts++;
        
        http.request(url, function(err, response) {
            if (err && attempts < maxRetries) {
                console.log("Retry attempt", attempts);
                setTimeout(attempt, 1000 * attempts);  // Exponential backoff
                return;
            }
            
            callback(err, response);
        });
    }
    
    attempt();
}

// Usage
retryRequest(url, 3, function(err, response) {
    if (err) {
        page.error("Failed after 3 retries");
        return;
    }
    // Process response
});
```

### Exponential Backoff

```javascript
function exponentialBackoff(func, maxRetries) {
    var attempts = 0;
    
    function retry() {
        attempts++;
        
        func(function(err, result) {
            if (err && attempts < maxRetries) {
                var delay = Math.pow(2, attempts) * 1000;  // 2s, 4s, 8s, ...
                console.log("Retrying in", delay, "ms");
                setTimeout(retry, delay);
                return;
            }
            
            if (err) {
                console.error("Failed after", attempts, "attempts");
            }
        });
    }
    
    retry();
}
```

## Error Recovery

### State Recovery

```javascript
var lastGoodState = null;

function updateState(newState) {
    try {
        validateState(newState);
        lastGoodState = newState;
        applyState(newState);
    } catch (e) {
        console.error("Invalid state, reverting:", e);
        if (lastGoodState) {
            applyState(lastGoodState);
        }
    }
}
```

### Transaction Rollback

```javascript
function atomicUpdate(db, operations) {
    try {
        db.begin();
        
        operations.forEach(function(op) {
            op(db);
        });
        
        db.commit();
        return true;
    } catch (e) {
        console.error("Transaction failed:", e);
        db.rollback();
        return false;
    }
}
```

## Best Practices

### Do's ✅

- **Always handle errors** - Never ignore error conditions
- **Provide context** - Include relevant information in error messages
- **Log errors** - Use console.error for debugging
- **Validate input** - Check data before processing
- **Use try-catch** - Wrap risky operations
- **Fail gracefully** - Provide fallbacks when possible
- **Clean up resources** - Release resources in finally blocks
- **Test error paths** - Verify error handling works

### Don'ts ❌

- **Don't swallow errors** - Always log or handle them
- **Don't expose internals** - Show user-friendly messages
- **Don't crash** - Catch and handle exceptions
- **Don't retry forever** - Set retry limits
- **Don't ignore warnings** - They often indicate problems
- **Don't use errors for control flow** - Use proper conditionals
- **Don't leak sensitive data** - Sanitize error messages
- **Don't block on errors** - Allow application to continue

## Error Reporting

### User Feedback

```javascript
function handleError(err, userMessage) {
    // Log technical details
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    
    // Show user-friendly message
    page.error(userMessage || "An error occurred");
}
```

### Error Aggregation

```javascript
var errorLog = [];

function logError(error, context) {
    errorLog.push({
        error: error.message,
        context: context,
        timestamp: Date.now()
    });
    
    // Keep only recent errors
    if (errorLog.length > 100) {
        errorLog.shift();
    }
}

function getErrorReport() {
    return JSON.stringify(errorLog, null, 2);
}
```

## See Also

- [Best Practices](../best-practices.md) - Development patterns
- [Debugging Guide](../../guides/debugging-plugins.md) - Debugging techniques
- [HTTP API](http-api.md) - Network error handling
- [SQLite API](sqlite-api.md) - Database error handling
