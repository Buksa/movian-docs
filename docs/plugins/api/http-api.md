# HTTP and Networking API Reference

This document provides comprehensive reference for Movian's HTTP and networking capabilities for plugin development.

## Table of Contents

- [HTTP Module](#http-module)
- [Movian HTTP Module](#movian-http-module)
- [WebSocket API](#websocket-api)
- [URL Utilities](#url-utilities)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## HTTP Module

The standard HTTP module provides Node.js-compatible HTTP client functionality.

### Module: `http`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/http.js`
- Native implementation: `movian/src/ecmascript/es_io.c`

### Functions

#### `http.request(options, callback)`

Creates an HTTP request object.

**Parameters:**
- `options` (string|Object): URL string or options object
- `callback` (function, optional): Response callback

**Options Object:**
- `hostname` (string): Server hostname
- `port` (number): Server port
- `path` (string): Request path
- `method` (string): HTTP method (default: 'GET')
- `headers` (Object): Request headers

**Returns:**
- `Request`: HTTP request object

**Example:**
```javascript
var http = require('http');

var req = http.request({
  hostname: 'api.example.com',
  port: 80,
  path: '/data',
  method: 'GET',
  headers: {
    'User-Agent': 'Movian Plugin'
  }
});

req.on('response', function(res) {
  console.log('Status:', res.statusCode);
  
  res.on('data', function(chunk) {
    console.log('Data:', chunk);
  });
  
  res.on('end', function() {
    console.log('Request complete');
  });
});

req.on('error', function(err) {
  console.log('Request error:', err.message);
});

req.end();
```

#### `http.get(url, callback)`

Convenience method for GET requests.

**Parameters:**
- `url` (string|Object): URL or options object
- `callback` (function, optional): Response callback

**Returns:**
- `Request`: HTTP request object (automatically ended)

**Example:**
```javascript
var http = require('http');

http.get('http://api.example.com/data', function(res) {
  var data = '';
  
  res.on('data', function(chunk) {
    data += chunk;
  });
  
  res.on('end', function() {
    var json = JSON.parse(data);
    console.log('Received:', json);
  });
});
```

### Request Object

#### Methods

##### `request.end(data)`

Finishes sending the request.

**Parameters:**
- `data` (string|Buffer, optional): Request body data

##### `request.on(event, callback)`

Registers event handlers.

**Events:**
- `'response'`: Response received
- `'error'`: Request error occurred

### Response Object

#### Properties

- `statusCode` (number): HTTP status code
- `headers` (Object): Response headers
- `encoding` (string): Response encoding (default: 'utf8')

#### Methods

##### `response.setEncoding(encoding)`

Sets the response encoding.

**Parameters:**
- `encoding` (string): Character encoding ('utf8', 'binary', etc.)

##### `response.on(event, callback)`

Registers event handlers.

**Events:**
- `'data'`: Data chunk received
- `'end'`: Response complete

---

## Movian HTTP Module

The Movian-specific HTTP module provides enhanced functionality with better error handling and response processing.

### Module: `movian/http`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/movian/http.js`
- Native implementation: `movian/src/ecmascript/es_io.c`

### Functions

#### `http.request(url, options, callback)`

Performs an HTTP request with enhanced features.

**Parameters:**
- `url` (string): Target URL
- `options` (Object, optional): Request options
- `callback` (function, optional): Completion callback

**Options:**
- `method` (string): HTTP method ('GET', 'POST', 'PUT', 'DELETE', etc.)
- `headers` (Object): Request headers
- `postdata` (string|Buffer): Request body data
- `args` (Object|Array): Additional arguments (merged if array)
- `timeout` (number): Request timeout in milliseconds
- `compression` (boolean): Enable gzip compression
- `caching` (boolean): Enable response caching
- `debug` (boolean): Enable debug logging
- `noFail` (boolean): Don't throw on HTTP error status codes
- `headRequest` (boolean): Perform HEAD request only

**Returns:**
- `HttpResponse`: Response object (if synchronous)
- `undefined`: If callback provided (asynchronous)

**Synchronous Example:**
```javascript
var http = require('movian/http');

try {
  var response = http.request('http://api.example.com/data', {
    method: 'GET',
    headers: {
      'User-Agent': 'Movian Plugin/1.0',
      'Accept': 'application/json'
    },
    timeout: 30000
  });
  
  console.log('Status:', response.statuscode);
  console.log('Content-Type:', response.contenttype);
  
  var data = JSON.parse(response.toString());
  console.log('Data:', data);
  
} catch (e) {
  console.log('Request failed:', e.message);
}
```

**Asynchronous Example:**
```javascript
var http = require('movian/http');

http.request('http://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  postdata: JSON.stringify({key: 'value'})
}, function(err, response) {
  if (err) {
    console.log('Error:', err.message);
    return;
  }
  
  console.log('Status:', response.statuscode);
  var result = JSON.parse(response.toString());
  console.log('Result:', result);
});
```

### HttpResponse Object

#### Properties

- `statuscode` (number): HTTP status code
- `bytes` (Buffer): Raw response body bytes
- `headers` (Object): Response headers (original case)
- `headers_lc` (Object): Response headers (lowercase keys)
- `multiheaders` (Object): Multiple headers as arrays (original case)
- `multiheaders_lc` (Object): Multiple headers as arrays (lowercase)
- `allheaders` (Array): All headers as [key, value, key, value, ...] array
- `contenttype` (string): Content-Type header value

#### Methods

##### `response.toString()`

Converts response body to string with automatic encoding detection.

**Returns:**
- `string`: Response body as UTF-8 string

**Description:**
Automatically detects character encoding from Content-Type header or validates UTF-8. Falls back to UTF-8 conversion if needed.

**Example:**
```javascript
var response = http.request('http://example.com/api');
var text = response.toString();
console.log('Response text:', text);
```

##### `response.convertFromEncoding(encoding)`

Converts response body from specific encoding to UTF-8.

**Parameters:**
- `encoding` (string): Source encoding ('iso-8859-1', 'windows-1252', etc.)

**Returns:**
- `string`: Converted UTF-8 string

**Example:**
```javascript
var response = http.request('http://example.com/latin1-data');
var text = response.convertFromEncoding('iso-8859-1');
console.log('Converted text:', text);
```

### Advanced Request Options

#### Multiple Arguments Merging

When `options.args` is an array, all objects in the array are merged:

```javascript
var http = require('movian/http');

var baseHeaders = {'User-Agent': 'Movian Plugin'};
var authHeaders = {'Authorization': 'Bearer token123'};

var response = http.request('http://api.example.com/data', {
  args: [baseHeaders, authHeaders, {
    'Accept': 'application/json'
  }]
});
```

#### Caching and Compression

```javascript
var response = http.request('http://api.example.com/large-data', {
  compression: true,  // Enable gzip compression
  caching: true,      // Enable response caching
  timeout: 60000      // 60 second timeout
});
```

---

## WebSocket API

WebSocket support for real-time communication.

### Module: `websocket`

**Source References:**
- JavaScript implementation: `movian/res/ecmascript/modules/websocket.js`
- Native implementation: `movian/src/ecmascript/es_websocket.c`

### WebSocket Class

#### Constructor

```javascript
var WebSocket = require('websocket');
var ws = new WebSocket('ws://example.com/socket');
```

#### Events

##### `onopen`

Connection established.

```javascript
ws.onopen = function() {
  console.log('WebSocket connected');
  ws.send('Hello Server');
};
```

##### `onmessage`

Message received from server.

```javascript
ws.onmessage = function(event) {
  console.log('Received:', event.data);
};
```

##### `onclose`

Connection closed.

```javascript
ws.onclose = function(event) {
  console.log('WebSocket closed:', event.code, event.reason);
};
```

##### `onerror`

Connection error occurred.

```javascript
ws.onerror = function(error) {
  console.log('WebSocket error:', error);
};
```

#### Methods

##### `send(data)`

Sends data to the server.

**Parameters:**
- `data` (string): Data to send

```javascript
ws.send(JSON.stringify({type: 'ping', timestamp: Date.now()}));
```

##### `close(code, reason)`

Closes the connection.

**Parameters:**
- `code` (number, optional): Close code
- `reason` (string, optional): Close reason

```javascript
ws.close(1000, 'Normal closure');
```

---

## URL Utilities

URL parsing and manipulation utilities.

### Module: `url`

**Source Reference:** `movian/res/ecmascript/modules/url.js`

### Functions

#### `url.parse(urlString)`

Parses a URL string into components.

**Parameters:**
- `urlString` (string): URL to parse

**Returns:**
- `Object`: URL components

**Example:**
```javascript
var url = require('url');

var parsed = url.parse('http://user:pass@example.com:8080/path?query=value#fragment');

console.log(parsed);
// {
//   protocol: 'http:',
//   hostname: 'example.com',
//   port: '8080',
//   pathname: '/path',
//   search: '?query=value',
//   hash: '#fragment',
//   auth: 'user:pass'
// }
```

#### `url.format(urlObject)`

Formats URL components into a URL string.

**Parameters:**
- `urlObject` (Object): URL components

**Returns:**
- `string`: Formatted URL

**Example:**
```javascript
var url = require('url');

var formatted = url.format({
  protocol: 'https:',
  hostname: 'api.example.com',
  pathname: '/v1/data',
  search: '?format=json'
});

console.log(formatted); // 'https://api.example.com/v1/data?format=json'
```

### Query String Utilities

#### Module: `querystring`

**Source Reference:** `movian/res/ecmascript/modules/querystring.js`

##### `querystring.parse(str)`

Parses query string into object.

**Parameters:**
- `str` (string): Query string to parse

**Returns:**
- `Object`: Parsed parameters

**Example:**
```javascript
var qs = require('querystring');

var params = qs.parse('name=John&age=30&city=New%20York');
console.log(params);
// { name: 'John', age: '30', city: 'New York' }
```

##### `querystring.stringify(obj)`

Converts object to query string.

**Parameters:**
- `obj` (Object): Object to stringify

**Returns:**
- `string`: Query string

**Example:**
```javascript
var qs = require('querystring');

var query = qs.stringify({
  search: 'movies',
  limit: 20,
  sort: 'date'
});
console.log(query); // 'search=movies&limit=20&sort=date'
```

---

## Error Handling

### Common Error Types

#### Network Errors
```javascript
var http = require('movian/http');

try {
  var response = http.request('http://unreachable.example.com');
} catch (e) {
  if (e.message.includes('timeout')) {
    console.log('Request timed out');
  } else if (e.message.includes('connection')) {
    console.log('Connection failed');
  } else {
    console.log('Network error:', e.message);
  }
}
```

#### HTTP Status Errors
```javascript
var http = require('movian/http');

var response = http.request('http://api.example.com/data', {
  noFail: true  // Don't throw on HTTP errors
});

if (response.statuscode >= 400) {
  console.log('HTTP Error:', response.statuscode);
  console.log('Error body:', response.toString());
} else {
  // Process successful response
  var data = JSON.parse(response.toString());
}
```

#### JSON Parsing Errors
```javascript
var http = require('movian/http');

try {
  var response = http.request('http://api.example.com/json');
  var data = JSON.parse(response.toString());
} catch (e) {
  if (e instanceof SyntaxError) {
    console.log('Invalid JSON response');
    console.log('Raw response:', response.toString());
  } else {
    console.log('Request error:', e.message);
  }
}
```

### Error Recovery Patterns

#### Retry Logic
```javascript
function requestWithRetry(url, options, maxRetries) {
  var retries = 0;
  
  function attempt() {
    try {
      return http.request(url, options);
    } catch (e) {
      retries++;
      if (retries < maxRetries) {
        console.log('Retry', retries, 'of', maxRetries);
        return attempt();
      } else {
        throw e;
      }
    }
  }
  
  return attempt();
}
```

#### Timeout Handling
```javascript
function requestWithTimeout(url, timeoutMs) {
  return http.request(url, {
    timeout: timeoutMs,
    noFail: true
  });
}
```

---

## Examples

### Complete API Client Example

```javascript
// api-client.js - Complete HTTP API client

var http = require('movian/http');
var qs = require('querystring');

function ApiClient(baseUrl, apiKey) {
  this.baseUrl = baseUrl;
  this.apiKey = apiKey;
  this.defaultHeaders = {
    'User-Agent': 'Movian Plugin/1.0',
    'Authorization': 'Bearer ' + apiKey,
    'Accept': 'application/json'
  };
}

ApiClient.prototype.request = function(endpoint, options) {
  options = options || {};
  
  var url = this.baseUrl + endpoint;
  
  // Add query parameters
  if (options.params) {
    url += '?' + qs.stringify(options.params);
  }
  
  var requestOptions = {
    method: options.method || 'GET',
    headers: Object.assign({}, this.defaultHeaders, options.headers),
    timeout: options.timeout || 30000,
    compression: true,
    caching: options.cache !== false
  };
  
  // Add request body for POST/PUT
  if (options.data) {
    requestOptions.postdata = JSON.stringify(options.data);
    requestOptions.headers['Content-Type'] = 'application/json';
  }
  
  try {
    var response = http.request(url, requestOptions);
    
    if (response.statuscode >= 400) {
      throw new Error('HTTP ' + response.statuscode + ': ' + response.toString());
    }
    
    var contentType = response.contenttype || '';
    if (contentType.includes('application/json')) {
      return JSON.parse(response.toString());
    } else {
      return response.toString();
    }
    
  } catch (e) {
    console.log('API request failed:', e.message);
    throw e;
  }
};

ApiClient.prototype.get = function(endpoint, params) {
  return this.request(endpoint, {params: params});
};

ApiClient.prototype.post = function(endpoint, data) {
  return this.request(endpoint, {method: 'POST', data: data});
};

ApiClient.prototype.put = function(endpoint, data) {
  return this.request(endpoint, {method: 'PUT', data: data});
};

ApiClient.prototype.delete = function(endpoint) {
  return this.request(endpoint, {method: 'DELETE'});
};

// Usage example
var client = new ApiClient('https://api.example.com/v1', 'your-api-key');

try {
  // Get data
  var movies = client.get('/movies', {genre: 'action', limit: 20});
  
  // Post data
  var newMovie = client.post('/movies', {
    title: 'New Movie',
    year: 2023,
    genre: 'action'
  });
  
  console.log('Created movie:', newMovie);
  
} catch (e) {
  console.log('API error:', e.message);
}
```

### WebSocket Chat Example

```javascript
// websocket-chat.js - WebSocket communication example

var WebSocket = require('websocket');

function ChatClient(url, username) {
  this.url = url;
  this.username = username;
  this.ws = null;
  this.connected = false;
  this.messageHandlers = [];
}

ChatClient.prototype.connect = function() {
  var self = this;
  
  this.ws = new WebSocket(this.url);
  
  this.ws.onopen = function() {
    console.log('Connected to chat server');
    self.connected = true;
    
    // Send join message
    self.send({
      type: 'join',
      username: self.username
    });
  };
  
  this.ws.onmessage = function(event) {
    try {
      var message = JSON.parse(event.data);
      self.handleMessage(message);
    } catch (e) {
      console.log('Invalid message received:', event.data);
    }
  };
  
  this.ws.onclose = function(event) {
    console.log('Disconnected from chat server:', event.code, event.reason);
    self.connected = false;
  };
  
  this.ws.onerror = function(error) {
    console.log('WebSocket error:', error);
  };
};

ChatClient.prototype.send = function(message) {
  if (this.connected && this.ws) {
    this.ws.send(JSON.stringify(message));
  }
};

ChatClient.prototype.sendMessage = function(text) {
  this.send({
    type: 'message',
    username: this.username,
    text: text,
    timestamp: Date.now()
  });
};

ChatClient.prototype.handleMessage = function(message) {
  this.messageHandlers.forEach(function(handler) {
    handler(message);
  });
};

ChatClient.prototype.onMessage = function(handler) {
  this.messageHandlers.push(handler);
};

ChatClient.prototype.disconnect = function() {
  if (this.ws) {
    this.ws.close(1000, 'Client disconnect');
  }
};

// Usage example
var chat = new ChatClient('ws://chat.example.com/socket', 'MyUsername');

chat.onMessage(function(message) {
  console.log('[' + message.username + ']:', message.text);
});

chat.connect();

// Send a message
setTimeout(function() {
  chat.sendMessage('Hello everyone!');
}, 1000);
```

### File Download with Progress

```javascript
// download.js - File download with progress tracking

var http = require('movian/http');
var fs = require('fs');

function downloadFile(url, localPath, progressCallback) {
  console.log('Downloading:', url);
  
  try {
    // First, get file size with HEAD request
    var headResponse = http.request(url, {
      method: 'HEAD',
      timeout: 10000
    });
    
    var contentLength = parseInt(headResponse.headers_lc['content-length'] || '0');
    console.log('File size:', contentLength, 'bytes');
    
    // Download the file
    var response = http.request(url, {
      timeout: 300000  // 5 minute timeout for large files
    });
    
    if (response.statuscode !== 200) {
      throw new Error('Download failed: HTTP ' + response.statuscode);
    }
    
    // Save to file
    fs.writeFileSync(localPath, response.bytes);
    
    console.log('Download complete:', localPath);
    
    if (progressCallback) {
      progressCallback(100, contentLength, contentLength);
    }
    
    return true;
    
  } catch (e) {
    console.log('Download failed:', e.message);
    
    if (progressCallback) {
      progressCallback(-1, 0, 0); // Error indicator
    }
    
    return false;
  }
}

// Usage example
var success = downloadFile(
  'http://example.com/large-file.zip',
  Core.storagePath + '/downloads/file.zip',
  function(percent, downloaded, total) {
    if (percent < 0) {
      console.log('Download error');
    } else {
      console.log('Progress:', percent + '%', '(' + downloaded + '/' + total + ')');
    }
  }
);

if (success) {
  console.log('File downloaded successfully');
} else {
  console.log('Download failed');
}
```

---

## Version Compatibility

- **Movian 4.8+**: All documented APIs available
- **Movian 4.6-4.7**: Core HTTP functionality available, some advanced features may be missing
- **Earlier versions**: Basic HTTP support, limited WebSocket support

## See Also

- [Core API Reference](core-api.md) - Service, page, and property APIs
- [Storage API Reference](storage-api.md) - Data persistence and storage
- [Settings API Reference](settings-api.md) - Configuration management
- [Plugin Development Guide](../getting-started.md) - Getting started with plugins