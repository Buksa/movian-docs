# Plugin Examples

## API Version Note

All examples in this directory use **API v2** (the modern, recommended API).

If you have existing API v1 plugins, see the [Migration Guide](../../guides/api-v1-to-v2-migration.md).

---

## Available Examples

### [Hello World](hello-world/)
Minimal plugin demonstrating basic concepts including service registration and simple page routing.

**Key Concepts**:
- Service creation
- Basic page routing
- Plugin structure

### [Content Provider](content-provider/)
Media source integration showing how to fetch and display content from external sources.

**Key Concepts**:
- HTTP requests
- Content parsing
- Media item creation
- Page navigation

### [Search Plugin](search-plugin/)
Search functionality implementation with query handling and result display.

**Key Concepts**:
- Search provider registration
- Query processing
- Result formatting
- Error handling

### [Configurable Plugin](configurable-plugin/)
Settings and preferences management for user-configurable plugins.

**Key Concepts**:
- Settings creation
- User preferences
- Configuration persistence
- Settings UI

### [Advanced UI Plugin](advanced-ui-plugin/)
Custom interface elements and advanced UI patterns.

**Key Concepts**:
- Custom UI components
- Advanced page layouts
- User interaction
- Rich content display

---

## Learning Path

1. **Start with Hello World** to understand basic structure
2. **Move to Content Provider** for media integration
3. **Try Search Plugin** for search functionality
4. **Explore Configurable Plugin** for settings
5. **Study Advanced UI Plugin** for custom interfaces

## Common Patterns

All examples demonstrate:

- ✅ API v2 syntax with `require()` modules
- ✅ Proper error handling
- ✅ Modern ECMAScript patterns
- ✅ Best practices for performance
- ✅ `"apiversion": 2` in plugin.json

## API v2 Module Usage

All examples use the modern module system:

```javascript
// Common imports
var http = require('movian/http');
var service = require('movian/service');
var page = require('movian/page');
var store = require('movian/store');
var settings = require('movian/settings');

// Native modules
var popup = require('native/popup');
var string = require('native/string');
```

## Example Structure

Each example includes:

- `plugin.json` - Plugin manifest with `"apiversion": 2`
- `main.js` - Main plugin code using API v2
- `README.md` - Documentation and explanation
- Additional resources (icons, etc.)

## Testing Examples

To test an example:

1. Copy the example directory to Movian's plugin directory
2. Restart Movian or reload plugins
3. Look for the service in Movian's main menu
4. Check logs for any errors

## See Also

- [Plugin Architecture](../architecture.md) - Overall plugin system
- [API Reference](../api/) - Complete API documentation
- [Best Practices](../best-practices.md) - Development guidelines
- [API Versions](../api-versions.md) - API version information
- [Migration Guide](../../guides/api-v1-to-v2-migration.md) - Upgrade from API v1

---

**Note**: All examples are verified to work with Movian 4.8+ using API v2.
