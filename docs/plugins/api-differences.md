# API v1 to v2 Differences Reference

## Overview

This document provides a complete mapping of API v1 methods to their API v2 equivalents. Use this as a quick reference during migration.

## Quick Comparison Table

| Category | API v1 | API v2 | Module |
|----------|--------|--------|--------|
| **HTTP** | `showtime.httpGet()` | `http.request()` | `movian/http` |
| **Service** | `plugin.createService()` | `service.create()` | `movian/service` |
| **Pages** | `plugin.addURI()` | `new page.Route()` | `movian/page` |
| **Search** | `plugin.addSearcher()` | `new page.Searcher()` | `movian/page` |
| **Settings** | `plugin.createSettings()` | `new settings.globalSettings()` | `movian/settings` |
| **Storage** | `plugin.createStore()` | `store.create()` | `movian/store` |
| **Cache** | `plugin.cachePut/Get()` | `misc.cachePut/Get()` + JSON | `native/misc` |
| **Logging** | `showtime.print()` | `console.log()` | Built-in |
| **JSON** | `showtime.JSONDecode()` | `JSON.parse()` | Built-in |
| **Strings** | `showtime.entityDecode()` | `string.entityDecode()` | `native/string` |
| **Popups** | `showtime.message()` | `popup.message()` | `native/popup` |
| **Crypto** | `showtime.md5digest()` | `crypto.hashCreate()` | `native/crypto` |
| **Files** | `showtime.basename()` | `fs.basename()` | `native/fs` |
| **System** | `showtime.currentVersionString` | `Core.currentVersionString` | Global |
| **Plugin** | `plugin.path` | `Plugin.path` | Global |

## Complete Mapping Reference

### HTTP & Networking

#### Simple GET Request

**API v1**:
```javascript
var response = showtime.httpGet(url);
```

**API v2**:
```javascript
var http = require('movian/http');
var response = http.request(url);
```

#### GET with Parameters

**API v1**:
```javascript
var response = showtime.httpGet(url, {param: 'value'}, headers);
```

**API v2**:
```javascript
var http = require('movian/http');
var response = http.request(url, {
  args: {param: 'value'},
  headers: headers
});
```

#### Advanced HTTP Request

**API v1**:
```javascript
showtime.httpReq(url, {
  method: 'POST',
  postdata: data,
  headers: headers
}, callback);
```

**API v2**:
```javascript
var http = require('movian/http');
http.request(url, {
  method: 'POST',
  postdata: data,
  headers: headers
}, callback);
```

### Services & Pages

#### Create Service

**API v1**:
```javascript
var service = plugin.createService(title, url, type, enabled, icon);
```

**API v2**:
```javascript
var service = require('movian/service');
service.create(title, url, type, enabled, icon);
```

#### Add Page Route

**API v1**:
```javascript
plugin.addURI(pattern, function(page) {
  // Handler
});
```

**API v2**:
```javascript
var page = require('movian/page');
new page.Route(pattern, function(page) {
  // Handler
});
```

#### Add Search Provider

**API v1**:
```javascript
plugin.addSearcher(title, icon, function(page, query) {
  // Search handler
});
```

**API v2**:
```javascript
var page = require('movian/page');
new page.Searcher(title, icon, function(page, query) {
  // Search handler
});
```

### Storage & Data

#### Create Store

**API v1**:
```javascript
var store = plugin.createStore(name);
store.key = value;
var value = store.key;
```

**API v2**:
```javascript
var store = require('movian/store');
var s = store.create(name);
s.key = value;
var value = s.key;
```

#### Cache Put

**API v1**:
```javascript
plugin.cachePut(stash, key, object, maxage);
```

**API v2**:
```javascript
var misc = require('native/misc');
misc.cachePut(
  'plugin/' + Plugin.id + '/' + stash,
  key,
  JSON.stringify(object),
  maxage
);
```

#### Cache Get

**API v1**:
```javascript
var object = plugin.cacheGet(stash, key);
```

**API v2**:
```javascript
var misc = require('native/misc');
var json = misc.cacheGet('plugin/' + Plugin.id + '/' + stash, key);
var object = json ? JSON.parse(json) : null;
```

### Settings

#### Create Settings

**API v1**:
```javascript
var settings = plugin.createSettings(title, icon, description);
```

**API v2**:
```javascript
var settings = require('movian/settings');
var s = new settings.globalSettings(Plugin.id, title, icon, description);
```

#### Create String Setting

**API v1**:
```javascript
var setting = settings.createString(id, title, defaultValue, callback);
```

**API v2**:
```javascript
var setting = s.createString(id, title, defaultValue, callback);
```

### String Utilities

#### Entity Decode

**API v1**:
```javascript
var decoded = showtime.entityDecode(html);
```

**API v2**:
```javascript
var string = require('native/string');
var decoded = string.entityDecode(html);
```

#### Query String Split

**API v1**:
```javascript
var params = showtime.queryStringSplit(queryString);
```

**API v2**:
```javascript
var string = require('native/string');
var params = string.queryStringSplit(queryString);
```

#### Path Escape

**API v1**:
```javascript
var escaped = showtime.pathEscape(path);
```

**API v2**:
```javascript
var string = require('native/string');
var escaped = string.pathEscape(path);
```

#### Parameter Escape

**API v1**:
```javascript
var escaped = showtime.paramEscape(param);
```

**API v2**:
```javascript
var string = require('native/string');
var escaped = string.paramEscape(param);
```

#### Duration to String

**API v1**:
```javascript
var duration = showtime.durationToString(seconds);
```

**API v2**:
```javascript
var string = require('native/string');
var duration = string.durationToString(seconds);
```

### Popup & UI

#### Message Dialog

**API v1**:
```javascript
showtime.message(text, ok, cancel);
```

**API v2**:
```javascript
var popup = require('native/popup');
popup.message(text, ok, cancel);
```

#### Notification

**API v1**:
```javascript
showtime.notify(message, delay, icon);
```

**API v2**:
```javascript
var popup = require('native/popup');
popup.notify(message, delay, icon);
```

#### Text Dialog

**API v1**:
```javascript
var text = showtime.textDialog(message, dontReject);
```

**API v2**:
```javascript
var popup = require('native/popup');
var text = popup.textDialog(message, dontReject);
```

#### Auth Credentials

**API v1**:
```javascript
var creds = plugin.getAuthCredentials(title, text, queryUser);
```

**API v2**:
```javascript
var popup = require('native/popup');
var creds = popup.getAuthCredentials(title, text, queryUser);
```

### Cryptography

#### MD5 Digest

**API v1**:
```javascript
var hash = showtime.md5digest(str);
```

**API v2**:
```javascript
var crypto = require('native/crypto');
var hash = crypto.hashCreate('md5');
crypto.hashUpdate(hash, str);
var digest = crypto.hashFinalize(hash);
var hexdigest = Duktape.enc('hex', digest);
```

#### SHA1 Digest

**API v1**:
```javascript
var hash = showtime.sha1digest(str);
```

**API v2**:
```javascript
var crypto = require('native/crypto');
var hash = crypto.hashCreate('sha1');
crypto.hashUpdate(hash, str);
var digest = crypto.hashFinalize(hash);
var hexdigest = Duktape.enc('hex', digest);
```

### File System

#### Basename

**API v1**:
```javascript
var name = showtime.basename(path);
```

**API v2**:
```javascript
var fs = require('native/fs');
var name = fs.basename(path);
```

#### Copy File

**API v1**:
```javascript
plugin.copyFile(src, dst);
```

**API v2**:
```javascript
var fs = require('native/fs');
fs.copyfile(src, dst);
```

### System Information

#### Current Version String

**API v1**:
```javascript
var version = showtime.currentVersionString;
```

**API v2**:
```javascript
var version = Core.currentVersionString;
```

#### Current Version Int

**API v1**:
```javascript
var versionInt = showtime.currentVersionInt;
```

**API v2**:
```javascript
var versionInt = Core.currentVersionInt;
```

#### Device ID

**API v1**:
```javascript
var deviceId = showtime.deviceId;
```

**API v2**:
```javascript
var deviceId = Core.deviceId;
```

#### System IP Address

**API v1**:
```javascript
var ip = showtime.systemIpAddress();
```

**API v2**:
```javascript
var misc = require('native/misc');
var ip = misc.systemIpAddress();
```

### JSON Operations

#### JSON Decode

**API v1**:
```javascript
var obj = showtime.JSONDecode(jsonString);
```

**API v2**:
```javascript
var obj = JSON.parse(jsonString);
```

#### JSON Encode

**API v1**:
```javascript
var json = showtime.JSONEncode(obj);
```

**API v2**:
```javascript
var json = JSON.stringify(obj);
```

### Logging

#### Print

**API v1**:
```javascript
showtime.print("Message");
```

**API v2**:
```javascript
console.log("Message");
```

#### Trace

**API v1**:
```javascript
showtime.trace("Debug message");
```

**API v2**:
```javascript
console.log("Debug message");
```

### Plugin Information

#### Plugin Path

**API v1**:
```javascript
var path = plugin.path;
```

**API v2**:
```javascript
var path = Plugin.path;
```

#### Plugin ID

**API v1**:
```javascript
var descriptor = plugin.getDescriptor();
var id = descriptor.id;
```

**API v2**:
```javascript
var id = Plugin.id;
```

#### Plugin Descriptor

**API v1**:
```javascript
var descriptor = plugin.getDescriptor();
```

**API v2**:
```javascript
var descriptor = JSON.parse(Plugin.manifest);
```

### Advanced Features

#### Rich Text

**API v1**:
```javascript
var rt = new showtime.RichText(html);
```

**API v2**:
```javascript
var prop = require('movian/prop');
var rt = new prop.RichText(html);
```

#### Item Hook

**API v1**:
```javascript
plugin.addItemHook({
  title: "Action",
  handler: function(item) { }
});
```

**API v2**:
```javascript
var itemhook = require('movian/itemhook');
itemhook.create({
  title: "Action",
  handler: function(item) { }
});
```

#### Subtitle Provider

**API v1**:
```javascript
plugin.addSubtitleProvider(function(req) {
  req.addSubtitle(url, title, lang, format, source, score);
});
```

**API v2**:
```javascript
var subtitle = require('native/subtitle');
subtitle.addProvider(function(root, query, basescore, autosel) {
  subtitle.addItem(root, url, title, lang, format, source,
                   basescore + score, autosel);
}, Plugin.id, Plugin.id);
```

#### HTTP Auth

**API v1**:
```javascript
plugin.addHTTPAuth(pattern, callback);
```

**API v2**:
```javascript
var io = require('native/io');
io.httpInspectorCreate(pattern, callback);
```

#### Select View

**API v1**:
```javascript
plugin.selectView(view);
```

**API v2**:
```javascript
var misc = require('native/misc');
misc.selectView(view);
```

#### Probe

**API v1**:
```javascript
var info = showtime.probe(url);
```

**API v2**:
```javascript
var io = require('native/io');
var info = io.probe(url);
```

#### Sleep

**API v1**:
```javascript
showtime.sleep(milliseconds);
```

**API v2**:
```javascript
Core.sleep(milliseconds);
```

#### Get Subtitle Languages

**API v1**:
```javascript
var languages = showtime.getSubtitleLanguages();
```

**API v2**:
```javascript
var subtitle = require('native/subtitle');
var languages = subtitle.getLanguages();
```

#### XML-RPC

**API v1**:
```javascript
var result = showtime.xmlrpc(url, method, arg1, arg2, ...);
```

**API v2**:
```javascript
var io = require('native/io');
var xml = require('movian/xml');
var args = [arg1, arg2, ...];
var result = io.xmlrpc(url, method, JSON.stringify(args));
var parsed = xml.htsmsg(result);
```

## Module Reference

### movian/* Modules

| Module | Purpose | Common Methods |
|--------|---------|----------------|
| `movian/http` | HTTP requests | `request()` |
| `movian/service` | Service registration | `create()` |
| `movian/page` | Page routing | `Route()`, `Searcher()` |
| `movian/store` | Persistent storage | `create()` |
| `movian/settings` | Plugin settings | `globalSettings()` |
| `movian/prop` | Property system | `RichText()` |
| `movian/itemhook` | Item actions | `create()` |
| `movian/xml` | XML parsing | `htsmsg()` |

### native/* Modules

| Module | Purpose | Common Methods |
|--------|---------|----------------|
| `native/popup` | UI dialogs | `message()`, `notify()`, `textDialog()` |
| `native/string` | String utilities | `entityDecode()`, `pathEscape()` |
| `native/crypto` | Cryptography | `hashCreate()`, `hashUpdate()` |
| `native/fs` | File system | `basename()`, `copyfile()` |
| `native/io` | I/O operations | `probe()`, `xmlrpc()` |
| `native/misc` | Miscellaneous | `cachePut()`, `cacheGet()` |
| `native/subtitle` | Subtitles | `addProvider()`, `getLanguages()` |

## Deprecated Methods

These API v1 methods have no direct API v2 equivalent or are handled differently:

| API v1 Method | Status | Alternative |
|---------------|--------|-------------|
| `plugin.config` | Removed | Use `settings` module |
| `plugin.properties` | Changed | Use `prop.global.plugin[Plugin.id]` |
| `showtime.RichText` | Moved | Use `prop.RichText` from `movian/prop` |

## Migration Priority

### High Priority (Core Functionality)

1. ✅ `plugin.json` apiversion field
2. ✅ HTTP requests (`showtime.httpGet` → `http.request`)
3. ✅ Service creation (`plugin.createService` → `service.create`)
4. ✅ Page routes (`plugin.addURI` → `new page.Route`)
5. ✅ Logging (`showtime.print` → `console.log`)

### Medium Priority (Common Features)

6. ✅ Settings (`plugin.createSettings` → `new settings.globalSettings`)
7. ✅ Storage (`plugin.createStore` → `store.create`)
8. ✅ String utilities (`showtime.*` → `string.*`)
9. ✅ JSON operations (`showtime.JSON*` → `JSON.*`)
10. ✅ Popups (`showtime.message` → `popup.message`)

### Low Priority (Advanced Features)

11. ✅ Cache (`plugin.cache*` → `misc.cache*` + JSON)
12. ✅ Cryptography (`showtime.*digest` → `crypto.*`)
13. ✅ File system (`showtime.basename` → `fs.basename`)
14. ✅ Item hooks (`plugin.addItemHook` → `itemhook.create`)
15. ✅ Subtitle providers (`plugin.addSubtitleProvider` → `subtitle.addProvider`)

## See Also

- [API Versions](api-versions.md) - API version overview
- [Migration Guide](../guides/api-v1-to-v2-migration.md) - Step-by-step migration
- [Plugin Architecture](architecture.md) - Plugin system overview
- [API Reference](api/) - Complete API v2 documentation

## Source References

- **API v1 Emulation**: `movian/res/ecmascript/legacy/api-v1.js`
- **API Version Constants**: `movian/src/ecmascript/ecmascript.h:227`
- **Runtime Implementation**: `movian/src/ecmascript/ecmascript.c`

---

**Status**: ✅ Ready for Use  
**Last Updated**: 2025-11-08  
**Movian Version**: 4.8+  
**Accuracy**: 🟢 Verified from source code
