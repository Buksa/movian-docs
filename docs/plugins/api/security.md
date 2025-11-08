# Security Considerations

Security best practices for Movian plugin development.

## Overview

Security considerations include:
- Input validation
- XSS prevention
- Secure data storage
- HTTPS requirements
- Authentication handling
- API key protection

## Input Validation

### Validate User Input

```javascript
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        throw new Error("Invalid username");
    }
    
    if (username.length < 3 || username.length > 20) {
        throw new Error("Username must be 3-20 characters");
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("Username contains invalid characters");
    }
    
    return username;
}
```

### Sanitize URLs

```javascript
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        throw new Error("Invalid URL");
    }
    
    // Only allow HTTP/HTTPS
    if (!/^https?:\/\//i.test(url)) {
        throw new Error("URL must use HTTP or HTTPS");
    }
    
    return url;
}
```

### Validate API Responses

```javascript
function validateApiResponse(data) {
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid API response");
    }
    
    if (!data.results || !Array.isArray(data.results)) {
        throw new Error("Missing results array");
    }
    
    return data;
}
```

## XSS Prevention

### Avoid HTML Injection

```javascript
// BAD: Direct HTML injection
page.appendItem("label", "<b>" + userInput + "</b>");

// GOOD: Use text content
page.appendItem("label", userInput);
```

### Escape Special Characters

```javascript
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

## Secure Storage

### Don't Store Passwords

```javascript
// BAD: Store password in plain text
store.password = password;

// GOOD: Use authentication tokens
function login(username, password) {
    var response = http.request(loginUrl, {
        method: 'POST',
        postdata: JSON.stringify({
            username: username,
            password: password
        })
    });
    
    var data = JSON.parse(response.toString());
    store.authToken = data.token;  // Store token, not password
}
```

### Encrypt Sensitive Data

```javascript
// Use Movian's secure storage for sensitive data
var settings = require('movian/settings');

settings.createPassword('apiKey', 'API Key', '', function(value) {
    // Value is stored securely
    store.apiKey = value;
});
```

## HTTPS Requirements

### Enforce HTTPS

```javascript
function makeSecureRequest(url) {
    if (!url.startsWith('https://')) {
        throw new Error("Only HTTPS URLs are allowed");
    }
    
    return http.request(url);
}
```

### Certificate Validation

```javascript
// Movian validates SSL certificates by default
// Don't disable certificate validation unless absolutely necessary
```

## Authentication

### Token-Based Auth

```javascript
var authToken = null;

function authenticate(username, password) {
    var response = http.request(authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        postdata: JSON.stringify({
            username: username,
            password: password
        })
    });
    
    var data = JSON.parse(response.toString());
    authToken = data.token;
    store.authToken = authToken;
}

function makeAuthenticatedRequest(url) {
    if (!authToken) {
        throw new Error("Not authenticated");
    }
    
    return http.request(url, {
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    });
}
```

### Session Management

```javascript
var sessionExpiry = null;

function isSessionValid() {
    if (!authToken) {
        return false;
    }
    
    if (sessionExpiry && Date.now() > sessionExpiry) {
        authToken = null;
        return false;
    }
    
    return true;
}

function refreshSession() {
    if (!isSessionValid()) {
        // Re-authenticate
        authenticate(store.username, store.password);
    }
}
```

## API Key Protection

### Don't Hardcode Keys

```javascript
// BAD: Hardcoded API key
var API_KEY = "sk_live_1234567890abcdef";

// GOOD: Use settings
var settings = require('movian/settings');

settings.createString('apiKey', 'API Key', '', function(value) {
    store.apiKey = value;
});

function makeApiRequest(url) {
    if (!store.apiKey) {
        throw new Error("API key not configured");
    }
    
    return http.request(url, {
        headers: {
            'X-API-Key': store.apiKey
        }
    });
}
```

### Rotate Keys

```javascript
function checkKeyExpiry() {
    var keyAge = Date.now() - store.keyTimestamp;
    var maxAge = 30 * 24 * 60 * 60 * 1000;  // 30 days
    
    if (keyAge > maxAge) {
        console.warn("API key is old, consider rotating");
    }
}
```

## Rate Limiting

### Implement Rate Limiting

```javascript
var requestCounts = {};
var RATE_LIMIT = 100;  // requests per minute
var RATE_WINDOW = 60000;  // 1 minute

function checkRateLimit(endpoint) {
    var now = Date.now();
    var key = endpoint + ':' + Math.floor(now / RATE_WINDOW);
    
    requestCounts[key] = (requestCounts[key] || 0) + 1;
    
    if (requestCounts[key] > RATE_LIMIT) {
        throw new Error("Rate limit exceeded");
    }
    
    // Clean up old entries
    for (var k in requestCounts) {
        if (k < key - 1) {
            delete requestCounts[k];
        }
    }
}
```

## Error Messages

### Don't Leak Information

```javascript
// BAD: Exposes internal details
catch (e) {
    page.error("Database error: " + e.stack);
}

// GOOD: Generic user message, detailed logging
catch (e) {
    console.error("Database error:", e);
    page.error("An error occurred. Please try again.");
}
```

## Best Practices

### Do's ✅

- Validate all user input
- Use HTTPS for all network requests
- Store tokens, not passwords
- Implement rate limiting
- Use secure storage for sensitive data
- Validate API responses
- Log security events
- Keep dependencies updated

### Don'ts ❌

- Don't trust user input
- Don't store passwords in plain text
- Don't hardcode API keys
- Don't disable SSL verification
- Don't expose internal errors
- Don't use HTTP for sensitive data
- Don't ignore authentication failures
- Don't leak sensitive information in logs

## See Also

- [Error Handling](error-handling.md) - Error management
- [Best Practices](../best-practices.md) - Development patterns
- [HTTP API](http-api.md) - Network operations
- [Storage API](storage-api.md) - Data persistence
