# Movian Plugin API Versions

## Overview

Movian supports two ECMAScript API versions for plugins:

- **API v2**: Modern CommonJS-based API (recommended)
- **API v1**: Legacy API with global objects (deprecated, emulated)

All new plugins should use **API v2** for better performance, maintainability, and access to modern ECMAScript features.

## API Version Comparison

| Aspect | API v1 (Legacy) | API v2 (Modern) |
|--------|----------------|-----------------|
| **Status** | ⚠️ Deprecated (emulated) | ✅ Recommended |
| **Module System** | None (global objects) | CommonJS `require()` |
| **Performance** | Slower (emulation overhead) | Native performance |
| **Global Objects** | `showtime`, `plugin` | `Plugin`, `Core`, `console` |
| **ECMAScript** | Limited | Full ES5 + extensions |
| **Declared In** | `"apiversion": 1` | `"apiversion": 2` |
| **Compatibility** | Emulated by wrapper | Native runtime |

## API v1 (Legacy)

**Status**: ⚠️ Deprecated (emulated via compatibility layer)  
**Declared in plugin.json**: `"apiversion": 1`

### Characteristics

- **Global `showtime` object** with utility methods
- **Global `plugin` object** with plugin-specific methods
- **No module system** - all APIs available globally
- **Emulated** by `movian/res/ecmascript/legacy/api-v1.js`
- **Performance overhead** due to emulation layer
- **Limited ECMAScript** features

### Example

```javascript
// plugin.json
{
  "id": "my-plugin",
  "version": "1.0",
  "type": "ecmascript",
  "apiversion": 1,
  "title": "My Plugin"
}
```

```javascript
// main.js (API v1)
// Global objects available immediately
var response = showtime.httpGet(url);
var service = plugin.createService(title, url, "video", true);

plugin.addURI("myplugin:start", function(page) {
  page.type = "directory";
  page.contents = "items";
  page.metadata.title = "My Plugin";
});
```

### Deprecated Methods

All `showtime.*` and `plugin.*` methods are deprecated. See [API Differences](api-differences.md) for complete mapping to API v2.

## API v2 (Modern)

**Status**: ✅ Recommended  
**Declared in plugin.json**: `"apiversion": 2`

### Characteristics

- **CommonJS module system** with `require()`
- **Standard ECMAScript** (JSON, console, etc.)
- **Global `Plugin` object** (capital P) with plugin metadata
- **Global `Core` object** with system information
- **Native performance** - no emulation overhead
- **Better error handling** and debugging
- **Modern patterns** and best practices

### Example

```javascript
// plugin.json
{
  "id": "my-plugin",
  "version": "1.0",
  "type": "ecmascript",
  "apiversion": 2,
  "title": "My Plugin"
}
```

```javascript
// main.js (API v2)
var http = require('movian/http');
var service = require('movian/service');
var page = require('movian/page');

service.create("My Plugin", "myplugin:start", "video", true);

new page.Route("myplugin:start", function(page) {
  page.type = "directory";
  page.contents = "items";
  page.metadata.title = "My Plugin";
  
  var response = http.request(url);
  // Process response...
});
```

### Module System

API v2 uses CommonJS modules:

```javascript
// Core modules (movian/*)
var http = require('movian/http');
var service = require('movian/service');
var page = require('movian/page');
var store = require('movian/store');
var settings = require('movian/settings');

// Native modules (native/*)
var fs = require('native/fs');
var crypto = require('native/crypto');
var io = require('native/io');
var popup = require('native/popup');
var string = require('native/string');
```

See [API Reference](api/) for complete module documentation.

## Version Detection

### In Source Code

From `movian/src/ecmascript/ecmascript.h:227`:

```c
#define ES_API_VERSION_1  1
#define ES_API_VERSION_2  2
```

### Runtime Detection

The Movian runtime checks the `apiversion` field in `plugin.json` and loads the appropriate environment:

- **API v1**: Loads `movian/res/ecmascript/legacy/api-v1.js` wrapper
- **API v2**: Loads native CommonJS environment

### In Plugin Code

```javascript
// API v2 - Check plugin metadata
console.log("Plugin ID:", Plugin.id);
console.log("Plugin Path:", Plugin.path);
console.log("Movian Version:", Core.currentVersionString);

// Access plugin.json data
var manifest = JSON.parse(Plugin.manifest);
console.log("API Version:", manifest.apiversion);
```

## Backward Compatibility

### API v2 Runtime with API v1 Plugins

✅ **Supported** - API v1 plugins run on API v2 runtime via emulation layer

The emulation layer (`api-v1.js`) provides:
- Global `showtime` object mapping to API v2 modules
- Global `plugin` object mapping to API v2 modules
- Automatic translation of method calls
- Compatible behavior for all API v1 methods

**Performance Note**: Emulation adds overhead. Migrate to API v2 for better performance.

### API v1 Runtime with API v2 Plugins

❌ **Not Supported** - API v2 plugins cannot run on older Movian versions with only API v1 support

### Gradual Migration

✅ **Possible** - You can migrate incrementally:

1. Update `plugin.json` to `"apiversion": 2`
2. Replace global calls one module at a time
3. Test after each change
4. Keep plugin functional throughout migration

See [Migration Guide](../guides/api-v1-to-v2-migration.md) for detailed steps.

## Compatibility Layer Details

### How API v1 Emulation Works

When a plugin declares `"apiversion": 1`, Movian loads `movian/res/ecmascript/legacy/api-v1.js` which:

1. **Creates global `showtime` object** with methods that call API v2 modules
2. **Creates global `plugin` object** with methods that call API v2 modules
3. **Translates parameters** between API v1 and API v2 formats
4. **Maintains compatibility** for all documented API v1 methods

### Example Translation

```javascript
// API v1 call
var response = showtime.httpGet(url, args, headers, ctrl);

// Translated to API v2
var http = require('movian/http');
var c = { args: args, headers: headers };
for(var p in ctrl) c[p] = ctrl[p];
var response = http.request(url, c);
```

### Emulation Limitations

- **Performance**: Extra function call overhead
- **Features**: Cannot access new API v2-only features
- **Debugging**: Stack traces show emulation layer
- **Maintenance**: Emulation layer may lag behind API v2 updates

## Migration Path

### For New Plugins

**Always use API v2:**

```json
{
  "apiversion": 2
}
```

### For Existing API v1 Plugins

**Recommended**: Migrate to API v2

**Benefits**:
- ✅ Better performance (no emulation)
- ✅ Access to new features
- ✅ Better error messages
- ✅ Modern ECMAScript patterns
- ✅ Future-proof

**Migration Time**: 1-4 hours for typical plugin

See [API v1 to v2 Migration Guide](../guides/api-v1-to-v2-migration.md) for complete instructions.

## Version History

| Version | Release | Status | Notes |
|---------|---------|--------|-------|
| API v1 | ~2012 | Deprecated | SpiderMonkey-era API, now emulated |
| API v2 | ~2015 | Current | Duktape-based, CommonJS modules |

## Recommendations

### For Plugin Developers

- ✅ **New plugins**: Use API v2
- ✅ **Existing plugins**: Migrate to API v2 when possible
- ⚠️ **Legacy plugins**: Continue working via emulation, but consider migration

### For Plugin Users

- ✅ Both API v1 and API v2 plugins work on modern Movian
- ✅ No action required from users
- ℹ️ API v2 plugins may perform better

## See Also

- [API v1 to v2 Migration Guide](../guides/api-v1-to-v2-migration.md) - Step-by-step migration
- [API Differences Reference](api-differences.md) - Complete API mapping
- [Plugin Architecture](architecture.md) - Overall plugin system
- [Manifest Reference](manifest-reference.md) - plugin.json specification
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
