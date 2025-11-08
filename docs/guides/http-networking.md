# HTTP and Networking

Comprehensive guide to HTTP and networking in Movian plugins.

## Overview

Movian provides robust HTTP client functionality for:
- API requests
- Content fetching
- Authentication
- File downloads
- Streaming

## Basic HTTP Requests

### GET Request

```javascript
var http = require('movian/http');

var response = http.request('https://api.example.com/data');
var data = JSON.parse(response.toString());
```

### POST Request

```javascript
var response = http.request('https://api.example.com/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    postdata: JSON.stringify({
        username: 'user',
        password: 'pass'
    })
});
```

## Async Requests

```javascript
http.request(url, function(err, response) {
    if (err) {
        console.error("Request failed:", err);
        return;
    }
    
    var data = JSON.parse(response.toString());
    processData(data);
});
```

## Request Options

```javascript
http.request(url, {
    method: 'GET',              // HTTP method
    headers: {                  // Custom headers
        'User-Agent': 'Movian Plugin',
        'Authorization': 'Bearer ' + token
    },
    timeout: 30000,             // Timeout in ms
    compression: true,          // Enable compression
    caching: true              // Enable caching
});
```

## Error Handling

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
    
    if (response.statuscode !== 200) {
        page.error("HTTP error: " + response.statuscode);
        return;
    }
    
    // Process response
});
```

## Authentication

### Bearer Token

```javascript
var token = store.authToken;

http.request(url, {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
```

### Basic Auth

```javascript
var credentials = btoa(username + ':' + password);

http.request(url, {
    headers: {
        'Authorization': 'Basic ' + credentials
    }
});
```

## Response Handling

### JSON Response

```javascript
var response = http.request(url);
var data = JSON.parse(response.toString());
```

### Binary Data

```javascript
var response = http.request(imageUrl);
// response is Buffer object
```

### Status Codes

```javascript
if (response.statuscode === 200) {
    // Success
} else if (response.statuscode === 404) {
    // Not found
} else if (response.statuscode === 401) {
    // Unauthorized
}
```

## Best Practices

- Use HTTPS for sensitive data
- Implement retry logic
- Cache responses when appropriate
- Handle errors gracefully
- Set reasonable timeouts
- Validate responses

## See Also

- [HTTP API](../plugins/api/http-api.md)
- [Error Handling](../plugins/api/error-handling.md)
- [Performance](../plugins/api/performance.md)
- [Security](../plugins/api/security.md)
