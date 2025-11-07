# Troubleshooting Reference

**Status**: 🟢 Complete reference guide  
**Last Updated**: 2024-11-06  
**Movian Version**: 4.8+

## Overview

This reference provides quick solutions to common problems encountered when developing for Movian. Issues are organized by category with symptoms, causes, and solutions.

## Quick Reference

| Category | Common Issues |
|----------|---------------|
| [View Files](#view-file-issues) | Syntax errors, loading failures, layout problems |
| [Plugins](#plugin-issues) | Loading failures, API errors, crashes |
| [Properties](#property-issues) | Binding failures, undefined values, scope errors |
| [Layout](#layout-issues) | Positioning, sizing, visibility problems |
| [Performance](#performance-issues) | Lag, stuttering, memory issues |
| [Navigation](#navigation-issues) | Focus problems, event handling |
| [Media](#media-issues) | Playback failures, codec problems |
| [Build](#build-issues) | Compilation errors, dependency problems |

## View File Issues

### Syntax Error: Unexpected Token

**Symptoms**:
```
Error views/main.view:42: Unexpected token '}' after expression
```

**Causes**:
- Missing semicolon
- Unmatched braces
- Invalid operator
- Malformed expression

**Solutions**:

1. **Check for missing semicolons**:
```javascript
// ❌ Wrong
widget(label, {
  caption: "Text"  // Missing semicolon
  color: "#FFFFFF";
});

// ✅ Correct
widget(label, {
  caption: "Text";
  color: "#FFFFFF";
});
```

2. **Match all braces**:
```javascript
// ❌ Wrong - missing closing brace
widget(container_x, {
  widget(label, {
    caption: "Text";
  });
// Missing }

// ✅ Correct
widget(container_x, {
  widget(label, {
    caption: "Text";
  });
});
```

3. **Use valid operators**:
```javascript
// ❌ Wrong
width: 100 @ 50;

// ✅ Correct
width: 100 + 50;
```

### View File Won't Load

**Symptoms**:
- Blank screen
- Error in log: "Error loading view"
- Application shows fallback content

**Causes**:
- File path incorrect
- File doesn't exist
- Syntax error in file
- Circular include/import

**Solutions**:

1. **Verify file path**:
```javascript
// Check path is correct
widget(loader, {
  source: "skin://pages/home.view";  // Correct path
});
```

2. **Check file exists**:
```bash
# Verify file is in correct location
ls -la glwskins/flat/pages/home.view
```

3. **Check for syntax errors**:
- Review error log for specific line numbers
- Use text editor with syntax checking
- Comment out sections to isolate problem

4. **Avoid circular includes**:
```javascript
// ❌ Wrong - circular dependency
// file1.view
#include "file2.view"

// file2.view
#include "file1.view"

// ✅ Correct - use #import
// file1.view
#import "common.view"

// file2.view
#import "common.view"  // Only loaded once
```

### Macro Expansion Error

**Symptoms**:
```
Error: Macro 'ButtonWidget' not defined
Error: Argument count mismatch for macro 'Button'
```

**Causes**:
- Macro not defined before use
- Wrong number of arguments
- Missing default values

**Solutions**:

1. **Define macros before use**:
```javascript
// ✅ Correct order
#define Button(label) {
  widget(container_x, {
    widget(label, { caption: $label; });
  });
}

Button("Click Me");
```

2. **Match argument count**:
```javascript
#define Button(label, width, height) {
  widget(container_x, {
    width: $width;
    height: $height;
    widget(label, { caption: $label; });
  });
}

// ❌ Wrong - missing arguments
Button("Click");

// ✅ Correct - all arguments provided
Button("Click", 100, 40);
```

3. **Use default values**:
```javascript
#define Button(label, width=100, height=40) {
  widget(container_x, {
    width: $width;
    height: $height;
    widget(label, { caption: $label; });
  });
}

// ✅ Now works with fewer arguments
Button("Click");
Button("Click", 200);
Button("Click", 200, 50);
```

### Unterminated String

**Symptoms**:
```
Error: Unterminated string literal
```

**Causes**:
- Missing closing quote
- Unescaped quote in string
- Wrong quote type

**Solutions**:

1. **Close all strings**:
```javascript
// ❌ Wrong
caption: "Hello World;

// ✅ Correct
caption: "Hello World";
```

2. **Escape quotes in strings**:
```javascript
// ❌ Wrong
caption: "He said "Hello"";

// ✅ Correct
caption: "He said \"Hello\"";
```

3. **Use correct quote type**:
```javascript
// For plain text
caption: "Plain text";

// For rich text (HTML-like)
caption: '<b>Bold</b> text';
```

## Plugin Issues

### Plugin Won't Load

**Symptoms**:
- Plugin not visible in Movian
- Error in log: "Plugin load failed"
- No service registered

**Causes**:
- Invalid plugin.json
- JavaScript syntax error
- Missing required fields
- API version mismatch

**Solutions**:

1. **Validate plugin.json**:
```json
{
  "id": "myplugin",
  "version": "1.0.0",
  "title": "My Plugin",
  "synopsis": "Description",
  "author": "Your Name",
  "homepage": "https://example.com",
  "type": "javascript",
  "file": "main.js"
}
```

2. **Check JavaScript syntax**:
```javascript
// Use strict mode to catch errors
"use strict";

// Check for syntax errors
exports.init = function() {
  // Plugin code
};
```

3. **Verify API version**:
```json
{
  "apiversion": 1,
  "type": "javascript"
}
```

### Plugin Crashes Movian

**Symptoms**:
- Movian crashes when plugin loads
- Segmentation fault
- Application freeze

**Causes**:
- Null pointer dereference
- Infinite loop
- Memory corruption
- Invalid API call

**Solutions**:

1. **Add error handling**:
```javascript
try {
  // Potentially problematic code
  var data = JSON.parse(response);
} catch (e) {
  console.error("Parse error:", e);
  return;
}
```

2. **Avoid infinite loops**:
```javascript
// ❌ Wrong - potential infinite loop
while (true) {
  // No break condition
}

// ✅ Correct - with break condition
var maxIterations = 100;
var count = 0;
while (condition && count < maxIterations) {
  count++;
  // Loop body
}
```

3. **Validate API calls**:
```javascript
// Check parameters before API calls
if (url && typeof url === "string") {
  http.request(url);
} else {
  console.error("Invalid URL:", url);
}
```

### HTTP Request Fails

**Symptoms**:
- Network error
- Timeout
- Empty response

**Causes**:
- Invalid URL
- Network connectivity
- Server error
- Timeout too short

**Solutions**:

1. **Validate URL**:
```javascript
function isValidUrl(url) {
  return url && 
         typeof url === "string" && 
         (url.startsWith("http://") || url.startsWith("https://"));
}

if (isValidUrl(url)) {
  var response = http.request(url);
} else {
  console.error("Invalid URL:", url);
}
```

2. **Increase timeout**:
```javascript
var response = http.request(url, {
  timeout: 30000,  // 30 seconds
  method: "GET"
});
```

3. **Handle errors**:
```javascript
try {
  var response = http.request(url);
  if (response.statuscode === 200) {
    // Success
  } else {
    console.error("HTTP error:", response.statuscode);
  }
} catch (e) {
  console.error("Request failed:", e);
}
```

### JSON Parse Error

**Symptoms**:
```
Error: JSON parse error
SyntaxError: Unexpected token
```

**Causes**:
- Invalid JSON format
- Server returned HTML instead of JSON
- Encoding issues

**Solutions**:

1. **Validate JSON before parsing**:
```javascript
try {
  var data = JSON.parse(response.body);
} catch (e) {
  console.error("JSON parse error:", e);
  console.error("Response:", response.body.substring(0, 200));
  return null;
}
```

2. **Check content type**:
```javascript
var contentType = response.headers["content-type"];
if (contentType && contentType.indexOf("application/json") !== -1) {
  var data = JSON.parse(response.body);
} else {
  console.error("Expected JSON, got:", contentType);
}
```

3. **Handle empty responses**:
```javascript
if (response.body && response.body.length > 0) {
  var data = JSON.parse(response.body);
} else {
  console.error("Empty response");
  return null;
}
```

## Property Issues

### Property Not Found

**Symptoms**:
- Widget shows no data
- Log: "Property not found"
- Undefined value

**Causes**:
- Property doesn't exist
- Wrong property path
- Scope issue
- Property not yet set

**Solutions**:

1. **Use null coalescing**:
```javascript
// Provide fallback value
caption: $page.model.title ?? "Untitled";
```

2. **Check property path**:
```javascript
// ❌ Wrong path
caption: $item.title;

// ✅ Correct path in cloner
cloner($items, container_x, {
  caption: $self.title;
});
```

3. **Verify scope**:
```javascript
// In page context
caption: $page.model.title;

// In cloner context
caption: $self.title;

// In loader context
caption: $args.title;
```

### Property Not Updating

**Symptoms**:
- Widget doesn't reflect changes
- Stale data displayed
- No subscription created

**Causes**:
- Static expression (no property reference)
- Subscription not created
- Property path incorrect
- Widget not re-evaluating

**Solutions**:

1. **Ensure dynamic expression**:
```javascript
// ❌ Static - evaluated once
caption: "Title: " + "Fixed";

// ✅ Dynamic - updates with property
caption: "Title: " + $page.model.title;
```

2. **Use debug assignment**:
```javascript
// Log property changes
caption _=_ $page.model.title;
```

3. **Force re-evaluation**:
```javascript
// Use property reference to trigger updates
alpha: $page.model.updated ? 1.0 : 1.0;
```

### Scope Error

**Symptoms**:
- $self undefined
- $args not available
- Wrong data displayed

**Causes**:
- Using $self outside cloner
- Using $args outside loader
- Incorrect scope reference

**Solutions**:

1. **Use correct scope**:
```javascript
// ❌ Wrong - $self not available
widget(label, {
  caption: $self.title;
});

// ✅ Correct - use appropriate scope
widget(label, {
  caption: $page.model.title;
});
```

2. **In cloner context**:
```javascript
cloner($page.model.items, container_x, {
  // $self refers to current item
  widget(label, {
    caption: $self.title;
  });
});
```

3. **In loader context**:
```javascript
// Parent view
widget(loader, {
  source: "item.view";
  args: $item;
});

// item.view
widget(label, {
  caption: $args.title;  // Access passed data
});
```

## Layout Issues

### Widget Not Visible

**Symptoms**:
- Widget exists but doesn't appear
- Blank space where widget should be
- No error in log

**Causes**:
- Alpha is 0
- No size constraints
- Covered by other widget
- Outside parent bounds
- Hidden attribute set

**Solutions**:

1. **Check alpha**:
```javascript
widget(label, {
  caption: "Text";
  alpha: 1.0;  // Ensure visible
});
```

2. **Add size constraints**:
```javascript
widget(container_x, {
  height: 50;  // Specify size
  widget(label, {
    caption: "Text";
  });
});
```

3. **Check z-order**:
```javascript
widget(container_z, {
  // Background first
  widget(quad, { color: "#000000"; });
  // Content on top
  widget(label, { caption: "Text"; });
});
```

4. **Verify not hidden**:
```javascript
widget(label, {
  caption: "Text";
  hidden: false;  // Ensure not hidden
});
```

### Widget Wrong Size

**Symptoms**:
- Widget too large or too small
- Doesn't fit in container
- Overlaps other widgets

**Causes**:
- Missing size constraints
- Conflicting constraints
- Wrong weight value
- Aspect ratio issues

**Solutions**:

1. **Specify size**:
```javascript
widget(container_x, {
  width: 200;
  height: 50;
});
```

2. **Use weight for flexible sizing**:
```javascript
widget(container_x, {
  widget(container_y, {
    width: 200;  // Fixed width
  });
  widget(container_y, {
    weight: 1.0;  // Fills remaining space
  });
});
```

3. **Avoid conflicting constraints**:
```javascript
// ❌ Wrong - conflicting
widget(container_x, {
  width: 100;
  weight: 1.0;  // Conflicts with fixed width
});

// ✅ Correct - use one
widget(container_x, {
  weight: 1.0;
});
```

### Widget Wrong Position

**Symptoms**:
- Widget in wrong location
- Not aligned correctly
- Overlapping incorrectly

**Causes**:
- Wrong container type
- Incorrect alignment
- Wrong parent
- Z-order issues

**Solutions**:

1. **Use correct container**:
```javascript
// Horizontal layout
widget(container_x, {
  widget(label, { caption: "Left"; });
  widget(label, { caption: "Right"; });
});

// Vertical layout
widget(container_y, {
  widget(label, { caption: "Top"; });
  widget(label, { caption: "Bottom"; });
});

// Layered
widget(container_z, {
  widget(quad, { color: "#000000"; });
  widget(label, { caption: "Overlay"; });
});
```

2. **Set alignment**:
```javascript
widget(container_x, {
  alignment: center;  // Center children
  widget(label, { caption: "Centered"; });
});
```

3. **Check parent hierarchy**:
```javascript
// Ensure widget is in correct parent
widget(container_y, {
  widget(container_x, {
    // This widget is inside container_x
    widget(label, { caption: "Text"; });
  });
});
```

### Spacing Issues

**Symptoms**:
- Widgets too close together
- Too much space between widgets
- Inconsistent spacing

**Causes**:
- Missing spacing attribute
- Wrong spacing value
- Padding not set
- Margin issues

**Solutions**:

1. **Set spacing**:
```javascript
widget(container_y, {
  spacing: 10;  // 10 pixels between children
  widget(label, { caption: "Item 1"; });
  widget(label, { caption: "Item 2"; });
});
```

2. **Use padding**:
```javascript
widget(container_x, {
  padding: [10, 20, 10, 20];  // left, top, right, bottom
  widget(label, { caption: "Text"; });
});
```

3. **Add spacer widgets**:
```javascript
widget(container_x, {
  widget(label, { caption: "Left"; });
  space(1);  // Flexible spacer
  widget(label, { caption: "Right"; });
});
```

## Performance Issues

### Slow Rendering

**Symptoms**:
- Lag when scrolling
- Stuttering animations
- Low frame rate

**Causes**:
- Too many widgets
- Complex expressions
- Large images
- Inefficient layout

**Solutions**:

1. **Reduce widget count**:
```javascript
// ❌ Too many widgets
widget(container_z, {
  widget(quad, { ... });
  widget(quad, { ... });
  widget(quad, { ... });
  widget(label, { ... });
});

// ✅ Simplified
widget(container_z, {
  widget(quad, { ... });  // Combined background
  widget(label, { ... });
});
```

2. **Simplify expressions**:
```javascript
// ❌ Complex expression
alpha: ($enabled && $visible && !$disabled) ? 
       (isNavFocused() ? 1.0 : 0.8) : 0.3;

// ✅ Broken down
$isActive = $enabled && $visible && !$disabled;
alpha: $isActive ? (isNavFocused() ? 1.0 : 0.8) : 0.3;
```

3. **Optimize images**:
```bash
# Resize large images
convert large.png -resize 1920x1080 optimized.png

# Compress images
pngquant optimized.png
```

4. **Use list widgets for scrolling**:
```javascript
// ✅ Efficient for large lists
widget(list_y, {
  cloner($items, container_x, {
    // Item template
  });
});
```

### High Memory Usage

**Symptoms**:
- Memory usage increases over time
- Application becomes slow
- Eventually crashes

**Causes**:
- Memory leaks
- Too many cached items
- Large images
- Subscriptions not released

**Solutions**:

1. **Limit cached items**:
```javascript
// In plugin
page.model.items = items.slice(0, 100);  // Limit items
```

2. **Use smaller images**:
```javascript
// Request appropriate size from API
var imageUrl = item.image + "?size=medium";
```

3. **Clean up resources**:
```javascript
// In plugin cleanup
exports.cleanup = function() {
  // Release resources
  subscriptions.forEach(function(sub) {
    sub.destroy();
  });
};
```

### Stuttering Animations

**Symptoms**:
- Animations not smooth
- Jerky transitions
- Inconsistent frame rate

**Causes**:
- Complex calculations during animation
- Too many animated widgets
- Inefficient iir() usage

**Solutions**:

1. **Use appropriate iir() time constant**:
```javascript
// ❌ Too fast - jerky
alpha: iir(isNavFocused(), 1, true);

// ✅ Smooth
alpha: iir(isNavFocused(), 8, true);
```

2. **Limit animated widgets**:
```javascript
// Only animate focused items
alpha: isNavFocused() ? 
       iir(1.0, 8, true) : 
       0.7;  // Static for non-focused
```

3. **Avoid complex expressions in animations**:
```javascript
// ❌ Complex calculation every frame
scale: iir(isNavFocused() ? 
           ($parent.width / $self.width) : 
           1.0, 8, true);

// ✅ Pre-calculate
$targetScale = $parent.width / $self.width;
scale: iir(isNavFocused() ? $targetScale : 1.0, 8, true);
```

## Navigation Issues

### Can't Focus Widget

**Symptoms**:
- Widget not selectable
- Navigation skips widget
- No focus indicator

**Causes**:
- Missing focusable attribute
- Widget hidden or alpha 0
- Focus weight too low
- Parent not focusable

**Solutions**:

1. **Add focusable attribute**:
```javascript
widget(container_x, {
  focusable: true;  // Make focusable
  widget(label, { caption: "Button"; });
});
```

2. **Ensure visible**:
```javascript
widget(container_x, {
  focusable: true;
  alpha: 1.0;  // Ensure visible
  hidden: false;
});
```

3. **Set focus weight**:
```javascript
widget(container_x, {
  focusable: true;
  focusWeight: 1.0;  // Higher priority
});
```

### Focus Indicator Not Visible

**Symptoms**:
- Can navigate but can't see focus
- No visual feedback
- Hard to tell what's selected

**Causes**:
- No focus indicator implemented
- Focus indicator same color as background
- Alpha too low

**Solutions**:

1. **Add focus indicator**:
```javascript
widget(container_z, {
  focusable: true;
  
  // Background with focus effect
  widget(quad, {
    color: "#444444";
    alpha: 0.6 + 0.4 * iir(isNavFocused(), 4, true);
  });
  
  widget(label, { caption: "Button"; });
  
  // Focus border
  widget(border, {
    border: 0.1em;
    color: "#FFFFFF";
    alpha: isNavFocused();
  });
});
```

2. **Use contrasting colors**:
```javascript
widget(quad, {
  color: isNavFocused() ? "#FFFF00" : "#444444";
});
```

3. **Add scale effect**:
```javascript
widget(container_x, {
  focusable: true;
  scale: 1.0 + 0.1 * iir(isNavFocused(), 4, true);
});
```

### Event Not Firing

**Symptoms**:
- Button doesn't respond
- onEvent handler not called
- No action on activation

**Causes**:
- Event handler syntax error
- Widget not focusable
- Event type wrong
- Handler returns wrong value

**Solutions**:

1. **Check event handler syntax**:
```javascript
widget(container_x, {
  focusable: true;
  onEvent(activate, navOpen("test:url"));
});
```

2. **Verify widget is focusable**:
```javascript
widget(container_x, {
  focusable: true;  // Required for events
  onEvent(activate, navOpen("test:url"));
});
```

3. **Use correct event type**:
```javascript
// Common event types
onEvent(activate, ...);  // Enter/Click
onEvent(cancel, ...);    // Back/Escape
onEvent(focus, ...);     // Gained focus
onEvent(blur, ...);      // Lost focus
```

## Media Issues

### Video Won't Play

**Symptoms**:
- Black screen
- Error message
- Playback fails to start

**Causes**:
- Unsupported codec
- Invalid URL
- DRM protected
- Network issue

**Solutions**:

1. **Check codec support**:
```javascript
// Verify video format
console.log("Video codec:", videoInfo.codec);
console.log("Audio codec:", audioInfo.codec);
```

2. **Validate URL**:
```javascript
if (videoUrl && videoUrl.startsWith("http")) {
  page.model.videoUrl = videoUrl;
} else {
  console.error("Invalid video URL:", videoUrl);
}
```

3. **Handle DRM**:
```javascript
// Check for DRM
if (video.drm) {
  console.log("DRM protected content");
  // Handle DRM if supported
}
```

### Audio Out of Sync

**Symptoms**:
- Audio doesn't match video
- Delay in audio
- Audio ahead of video

**Causes**:
- Incorrect timestamps
- Codec issues
- Performance problems

**Solutions**:

1. **Adjust audio delay**:
```javascript
// In playback settings
audioDelay: -200;  // Negative to delay audio
```

2. **Check video format**:
- Verify container format (MP4, MKV, etc.)
- Check for variable frame rate issues
- Test with different video files

### Subtitles Not Showing

**Symptoms**:
- No subtitles displayed
- Subtitle option not available
- Wrong subtitles shown

**Causes**:
- Subtitle track not detected
- Wrong encoding
- Subtitle format not supported

**Solutions**:

1. **Verify subtitle track**:
```javascript
// Check available subtitle tracks
console.log("Subtitle tracks:", media.subtitleTracks);
```

2. **Set subtitle track**:
```javascript
// Select subtitle track
media.currentSubtitleTrack = 0;
```

3. **Check encoding**:
- Ensure UTF-8 encoding for subtitle files
- Verify subtitle format (SRT, ASS, etc.)

## Build Issues

### Compilation Error

**Symptoms**:
```
error: undefined reference to 'function'
error: 'struct' has no member named 'field'
```

**Causes**:
- Missing dependency
- Wrong include path
- API version mismatch
- Platform-specific code

**Solutions**:

1. **Install dependencies**:
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libssl-dev

# macOS
brew install openssl
```

2. **Check configure options**:
```bash
./configure --help
./configure --enable-feature
```

3. **Clean and rebuild**:
```bash
make clean
make
```

### Linking Error

**Symptoms**:
```
error: cannot find -llibrary
undefined reference to 'symbol'
```

**Causes**:
- Missing library
- Wrong library path
- Library version mismatch

**Solutions**:

1. **Install missing library**:
```bash
# Find package name
apt-cache search library-name

# Install
sudo apt-get install library-dev
```

2. **Set library path**:
```bash
export LD_LIBRARY_PATH=/path/to/libs:$LD_LIBRARY_PATH
```

3. **Check library version**:
```bash
pkg-config --modversion library-name
```

### Platform-Specific Issues

**Symptoms**:
- Builds on one platform but not another
- Platform-specific errors
- Missing platform features

**Causes**:
- Platform-specific code
- Different library versions
- Missing platform dependencies

**Solutions**:

1. **Check platform requirements**:
```bash
# Read platform-specific docs
cat README.platform
```

2. **Use platform-specific configure**:
```bash
# Linux
./configure.linux

# macOS
./configure.osx

# Android
./configure.android
```

3. **Install platform dependencies**:
```bash
# Check platform requirements
./configure --help
```

## Getting Help

### Collecting Debug Information

When reporting issues, include:

1. **Movian version**:
```bash
movian --version
```

2. **Platform information**:
```bash
uname -a  # Linux/macOS
```

3. **Error logs**:
```bash
movian --debug 2>&1 | tee movian.log
```

4. **Minimal test case**:
- Create smallest example that reproduces issue
- Include all relevant files
- Document steps to reproduce

### Community Resources

- **GitHub Issues**: https://github.com/andoma/movian/issues
- **Forums**: Check Movian community forums
- **Documentation**: https://github.com/andoma/movian/wiki

### Reporting Bugs

When reporting bugs:

1. **Search existing issues** first
2. **Provide clear title** describing the problem
3. **Include steps to reproduce**
4. **Attach relevant logs** and files
5. **Specify platform** and version
6. **Describe expected vs actual behavior**

## See Also

- [Debugging View Files](../guides/debugging-view-files.md) - Detailed debugging guide
- [Syntax Reference](../ui/view-files/syntax-reference.md) - Complete syntax guide
- [Plugin API Reference](../plugins/api/core-api.md) - Plugin development
- [GLW Architecture](../ui/glw-architecture.md) - System architecture
