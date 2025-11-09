# API v2 Fixes Report

**Date**: 2025-11-09
**Task**: Fix all documentation to use API v2 consistently

## Summary

Updated all plugin documentation examples to use modern API v2 instead of legacy API v1.

## Key Changes

### 1. Global Objects Clarification

**Fixed**: Removed incorrect `var Plugin = require('movian/plugin')`
**Reason**: `Plugin` is a global object (like `console`), not a module

**Verified from source**: `movian/res/ecmascript/modules/movian/service.js` line 29:
```javascript
return new Service(s.create("plugin:" + Plugin.id, title, url,
                            type, enabled, icon));
```

### 2. Files Updated

#### `docs/plugins/getting-started.md`
- ✅ Added `"apiversion": 2` to plugin.json example
- ✅ Removed `(function(plugin) {...})(this)` wrapper
- ✅ Changed `plugin.createService()` → `service.create()`
- ✅ Changed `showtime.httpReq()` → `http.request()`
- ✅ Changed `plugin.createSettings()` → `new settings.globalSettings()`
- ✅ Added proper module imports
- ✅ Fixed `Plugin` usage (global object, not require)

#### `docs/guides/building-first-plugin.md`
- ✅ Added `"apiversion": 2` to plugin.json
- ✅ Removed old wrapper pattern
- ✅ Updated to use `service.create()`
- ✅ Changed `page.Route()` → `new page.Route()`
- ✅ Updated settings example
- ✅ Fixed HTTP request example
- ✅ Fixed search example
- ✅ Fixed `Plugin` usage

#### `docs/plugins/api/README.md`
- ✅ Changed `plugin.path` → `Plugin.path`
- ✅ Changed `page.Route()` → `new page.Route()`
- ✅ Fixed `Plugin` usage

#### `docs/meta/documentation-standards.md`
- ✅ Updated example from API v1 to API v2
- ✅ Removed `(function(plugin) {...})(this)` wrapper
- ✅ Changed `plugin.createService()` → `service.create()`
- ✅ Changed `service.addURI()` → `new page.Route()`

#### `docs/reference/faq.md`
- ✅ Updated plugin creation example to API v2
- ✅ Updated service registration example
- ✅ Removed `require('showtime/richtext').imageFromPlugin()`
- ✅ Changed to `Plugin.path + "logo.png"`

#### `docs/guides/debugging-plugins.md`
- ✅ Changed `showtime.httpReq()` → `http.request()` (3 occurrences)
- ✅ Added proper module imports
- ✅ Updated HTTP debugging examples
- ✅ Updated performance profiling example
- ✅ Updated caching example

## API v1 → API v2 Mapping Applied

| API v1 | API v2 | Status |
|--------|--------|--------|
| `plugin.createService()` | `service.create()` | ✅ Fixed |
| `plugin.addURI()` | `new page.Route()` | ✅ Fixed |
| `plugin.createSettings()` | `new settings.globalSettings()` | ✅ Fixed |
| `showtime.httpReq()` | `http.request()` | ✅ Fixed |
| `showtime.httpGet()` | `http.request()` | ✅ Fixed |
| `plugin.path` | `Plugin.path` (global) | ✅ Fixed |
| `(function(plugin){...})(this)` | Direct module imports | ✅ Fixed |

## Verification

### Files Already Using API v2 Correctly
- ✅ `docs/plugins/examples/hello-world/` - Already correct
- ✅ `docs/plugins/examples/*/` - All examples already use API v2
- ✅ `docs/guides/api-v1-to-v2-migration.md` - Migration guide (intentionally shows both)
- ✅ `docs/plugins/lifecycle.md` - Shows API v1 as deprecated example
- ✅ `docs/plugins/best-practices.md` - Already uses API v2

### Important Notes

1. **Plugin is Global**: `Plugin` (capital P) is a global object available in all plugins
   - Properties: `Plugin.id`, `Plugin.path`, `Plugin.version`
   - No need to require it
   - Verified in source: `movian/res/ecmascript/modules/movian/service.js`

2. **API Version Field**: All plugin.json files must include `"apiversion": 2` to use modern APIs

3. **Module Imports**: API v2 requires explicit module imports:
   ```javascript
   var service = require('movian/service');
   var page = require('movian/page');
   var http = require('movian/http');
   var settings = require('movian/settings');
   ```

## Testing Recommendations

1. Verify all code examples compile without errors
2. Test plugin.json examples with actual Movian
3. Ensure all links to API documentation are correct
4. Run validation scripts to check for remaining API v1 usage

## Next Steps

- Run link validation to ensure all cross-references work
- Update any remaining files that reference old API patterns
- Consider adding API version warnings to legacy examples

## Related Documentation

- [API v1 to v2 Migration Guide](../guides/api-v1-to-v2-migration.md)
- [API Versions](../plugins/api-versions.md)
- [API Differences Reference](../plugins/api-differences.md)
