# HTML Parsing Modules Comparison

## Overview

Movian provides multiple options for HTML parsing, each with different capabilities and API designs. This document compares the built-in `movian/html` module with the enhanced `html2.js` module found in modern plugins.

## Module Comparison

### Built-in movian/html Module

**Location**: `movian/res/ecmascript/modules/movian/html.js`  
**Parser Engine**: Native Gumbo parser  
**API Style**: Basic DOM-like interface  

#### Features

```javascript
var html = require('movian/html');
var result = html.parse(htmlString);

// Access document and root
var document = result.document;
var root = result.root;

// Basic element access
var element = document.getElementById('myId');
var elements = document.getElementByTagName('div');    // ⚠️ Non-standard naming
var items = document.getElementByClassName('item');    // ⚠️ Non-standard naming

// Properties
console.log(element.nodeName);     // Element tag name
console.log(element.nodeType);     // Node type constant
console.log(element.textContent);  // Text content
console.log(element.children);     // Child elements
console.log(element.attributes);   // Attributes array
```

#### API Issues

⚠️ **Non-Standard Method Names**:
- `getElementByTagName()` should be `getElementsByTagName()`
- `getElementByClassName()` should be `getElementsByClassName()`

### Enhanced html2.js Module

**Location**: `New_Rezka/utils/html2.js` (plugin-provided)  
**Parser Engine**: Native Gumbo parser with enhanced wrapper  
**API Style**: Full W3C DOM-compatible interface  

#### Features

```javascript
var html = require('./utils/html2');  // Plugin-local module
var document = html.parse(htmlString);

// Standard DOM API
var element = document.getElementById('myId');
var elements = document.getElementsByTagName('div');     // ✅ Standard naming
var items = document.getElementsByClassName('item');     // ✅ Standard naming

// CSS Selectors
var selected = document.querySelector('.menu-item');
var all = document.querySelectorAll('div.content > p');

// Advanced features
var matches = element.matches('div.active[data-id]');
var serialized = html.DOMUtils.serializeToHTML(element, {
  prettyPrint: true,
  indentSize: 2
});
```

## Detailed Feature Comparison

| Feature | movian/html | html2.js | Standard DOM |
|---------|-------------|----------|--------------|
| **Parser Engine** | ✅ Gumbo | ✅ Gumbo | N/A |
| **Memory Usage** | ✅ Low | ⚠️ Higher | N/A |
| **Performance** | ✅ Fast | ⚠️ Feature-rich | N/A |

### Element Access Methods

| Method | movian/html | html2.js | Standard | Notes |
|--------|-------------|----------|----------|-------|
| `getElementById()` | ✅ | ✅ | ✅ | Standard |
| `getElementsByTagName()` | ❌ | ✅ | ✅ | Built-in uses wrong name |
| `getElementsByClassName()` | ❌ | ✅ | ✅ | Built-in uses wrong name |
| `querySelector()` | ❌ | ✅ | ✅ | CSS selectors |
| `querySelectorAll()` | ❌ | ✅ | ✅ | CSS selectors |

### CSS Selector Support

| Selector Type | movian/html | html2.js | Examples |
|---------------|-------------|----------|----------|
| **Tag Selectors** | ❌ | ✅ | `div`, `span`, `a` |
| **ID Selectors** | ❌ | ✅ | `#header`, `#main` |
| **Class Selectors** | ❌ | ✅ | `.menu`, `.active` |
| **Attribute Selectors** | ❌ | ✅ | `[data-id]`, `[href^="http"]` |
| **Descendant Selectors** | ❌ | ✅ | `div .content`, `.menu a` |
| **Child Selectors** | ❌ | ✅ | `ul > li`, `.nav > .item` |
| **Multiple Selectors** | ❌ | ✅ | `.class1, .class2, #id1` |

### Attribute Selector Operators

| Operator | movian/html | html2.js | Description |
|----------|-------------|----------|-------------|
| `[attr]` | ❌ | ✅ | Attribute exists |
| `[attr="value"]` | ❌ | ✅ | Exact match |
| `[attr~="value"]` | ❌ | ✅ | Word match |
| `[attr\|="value"]` | ❌ | ✅ | Language match |
| `[attr^="value"]` | ❌ | ✅ | Starts with |
| `[attr$="value"]` | ❌ | ✅ | Ends with |
| `[attr*="value"]` | ❌ | ✅ | Contains |

### Node Properties and Methods

| Property/Method | movian/html | html2.js | Standard | Notes |
|-----------------|-------------|----------|----------|-------|
| `nodeName` | ✅ | ✅ | ✅ | Element tag name |
| `nodeType` | ✅ | ✅ | ✅ | Node type constant |
| `tagName` | ❌ | ✅ | ✅ | Uppercase tag name |
| `textContent` | ✅ | ✅ | ✅ | Text content |
| `innerHTML` | ❌ | ✅ | ✅ | Inner HTML |
| `outerHTML` | ❌ | ✅ | ✅ | Outer HTML |
| `children` | ✅ | ✅ | ✅ | Child elements |
| `childNodes` | ❌ | ✅ | ✅ | All child nodes |
| `parentElement` | ❌ | ✅ | ✅ | Parent element |
| `attributes` | ✅ | ✅ | ✅ | Attributes collection |
| `getAttribute()` | ❌ | ✅ | ✅ | Get attribute value |
| `hasAttribute()` | ❌ | ✅ | ✅ | Check attribute |
| `matches()` | ❌ | ✅ | ✅ | Test selector |

### Advanced Features

| Feature | movian/html | html2.js | Description |
|---------|-------------|----------|-------------|
| **HTML Serialization** | ❌ | ✅ | Convert back to HTML |
| **Pretty Printing** | ❌ | ✅ | Formatted HTML output |
| **Error Handling** | ⚠️ Basic | ✅ Comprehensive | Parsing error management |
| **NodeList Methods** | ❌ | ✅ | `forEach()`, `item()` |
| **Document Properties** | ❌ | ✅ | `body`, `head`, `title` |
| **Utility Functions** | ❌ | ✅ | Content extraction helpers |

## Performance Analysis

### Memory Usage

```javascript
// Built-in module (Lower memory)
var html = require('movian/html');
var result = html.parse(htmlString);
// Minimal wrapper around native Gumbo structures

// Enhanced module (Higher memory)
var html2 = require('./utils/html2');
var document = html2.parse(htmlString);
// Full DOM tree with enhanced objects and methods
```

### Parsing Speed

Both modules use the same native Gumbo parser, so parsing speed is similar. The difference is in the wrapper layer:

- **movian/html**: Minimal overhead, direct native access
- **html2.js**: Additional processing for DOM compatibility and CSS selectors

### Feature vs Performance Trade-off

| Aspect | movian/html | html2.js |
|--------|-------------|----------|
| **Parsing Speed** | ✅ Fastest | ✅ Fast |
| **Memory Usage** | ✅ Minimal | ⚠️ Higher |
| **Feature Set** | ⚠️ Limited | ✅ Complete |
| **Standards Compliance** | ❌ Non-standard | ✅ W3C-like |
| **Development Speed** | ⚠️ Slower | ✅ Faster |

## Usage Recommendations

### Use Built-in movian/html When:

✅ **Performance is Critical**
- Large HTML documents (>1MB)
- High-frequency parsing operations
- Memory-constrained environments

✅ **Simple Parsing Needs**
- Basic element access by ID
- Simple text extraction
- Minimal DOM manipulation

✅ **Plugin Size Matters**
- Avoiding additional dependencies
- Minimal plugin footprint

### Use Enhanced html2.js When:

✅ **Standards Compliance Required**
- Porting existing web code
- Team familiar with DOM APIs
- Future-proofing code

✅ **Complex Parsing Needs**
- CSS selector queries
- Advanced DOM manipulation
- Content extraction workflows

✅ **Development Speed Priority**
- Rapid prototyping
- Complex parsing logic
- Rich feature requirements

## Migration Guide

### From Built-in to Enhanced Module

```javascript
// Before (movian/html)
var html = require('movian/html');
var result = html.parse(htmlString);
var elements = result.document.getElementByTagName('div');  // Wrong name

// After (html2.js)
var html = require('./utils/html2');
var document = html.parse(htmlString);
var elements = document.getElementsByTagName('div');        // Correct name

// Additional capabilities
var selected = document.querySelectorAll('div.content > p');
var matches = element.matches('.active[data-id]');
```

### Handling Method Name Differences

```javascript
// Compatibility wrapper for built-in module
function wrapBuiltinHTML(htmlModule) {
  var originalParse = htmlModule.parse;
  
  htmlModule.parse = function(htmlString) {
    var result = originalParse(htmlString);
    
    // Fix method names
    if (result.document.getElementByTagName) {
      result.document.getElementsByTagName = result.document.getElementByTagName;
    }
    if (result.document.getElementByClassName) {
      result.document.getElementsByClassName = result.document.getElementByClassName;
    }
    
    return result.document;
  };
  
  return htmlModule;
}

// Usage
var html = wrapBuiltinHTML(require('movian/html'));
var document = html.parse(htmlString);
var elements = document.getElementsByTagName('div'); // Now works correctly
```

## Best Practices

### For Plugin Developers

1. **Choose Based on Requirements**
   - Simple parsing → Built-in module
   - Complex parsing → Enhanced module

2. **Handle API Differences**
   - Use wrapper functions for compatibility
   - Document which module you're using

3. **Performance Considerations**
   - Profile your specific use case
   - Consider caching parsed results

4. **Future Compatibility**
   - Prefer standard DOM API names
   - Use feature detection when possible

### For Movian Core Development

1. **Fix Built-in Module**
   - Rename methods to match standards
   - Add missing DOM properties
   - Maintain backward compatibility

2. **Consider Integration**
   - Evaluate integrating enhanced features
   - Provide migration path for existing plugins

## Conclusion

Both modules serve different needs in the Movian ecosystem:

- **Built-in movian/html**: Fast, lightweight, but with API inconsistencies
- **Enhanced html2.js**: Feature-complete, standards-compliant, but heavier

The choice depends on your specific requirements for performance, features, and standards compliance. For new development, the enhanced module is recommended unless performance is the primary concern.