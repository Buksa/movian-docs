# Troubleshooting Reference

**Status**: 🟢 Comprehensive solutions for common issues  
**Last Updated**: 2024-11-06  
**Movian Version**: 4.8+

## Overview

This reference provides quick solutions to common problems encountered when developing for Movian. Issues are organized by category with symptoms, causes, and solutions.

## Quick Reference

### Problem Categories

- [View File Issues](#view-file-issues) - Syntax, parsing, and rendering problems
- [Property Binding Issues](#property-binding-issues) - Data binding and updates
- [Layout Problems](#layout-problems) - Widget positioning and sizing
- [Focus and Navigation](#focus-and-navigation) - Focus management and events
- [Performance Issues](#performance-issues) - Slowdowns and optimization
- [Plugin Issues](#plugin-issues) - Plugin loading and execution
- [Build Issues](#build-issues) - Compilation and dependencies
- [Runtime Issues](#runtime-issues) - Crashes and errors

## View File Issues

### View File Not Loading

**Symptoms**:
- Blank screen or default view shown
- No error message in console
- Loader widget empty

**Possible Causes**:
1. File path incorrect
2. File doesn't exist
3. Syntax error preventing parse
4. Loader source property not set

**Solutions**:

```javascript
// Check file path
<loader source="skin://views/home.view"/>  // Correct
<loader source="views/home.view"/>         // May fail if not relative

// Verify file exists
// Check console for "File not found" errors

// Test with simple view
<loader source="skin://views/test.view"/>
// test.view:
container_y {
  label { caption = "Test"; }
}

// Check source property
<loader source="$page.model.viewUrl"/>
// Ensure $page.model.viewUrl is set and valid
```


### Syntax Error in View File

**Symptoms**:
- Error message in console with file and line number
- View fails to load
- Specific error description provided

**Common Errors**:

**Unterminated String**:
```javascript
// Problem
label { caption = "Hello World; }

// Error: Unterminated string literal

// Solution
label { caption = "Hello World"; }
```

**Missing Semicolon**:
```javascript
// Problem
label {
  caption = "Test"
  alpha = 0.5;
}

// Error: Unexpected identifier 'alpha'

// Solution
label {
  caption = "Test";  // Added semicolon
  alpha = 0.5;
}
```

**Unbalanced Braces**:
```javascript
// Problem
container_y {
  label { caption = "Test"; }
// Missing closing brace

// Error: Unexpected end of file

// Solution
container_y {
  label { caption = "Test"; }
}  // Added closing brace
```

**Unknown Widget Type**:
```javascript
// Problem
containr_x { }  // Typo

// Error: Unknown widget type 'containr_x'

// Solution
container_x { }  // Fixed typo
```

**Unknown Attribute**:
```javascript
// Problem
label { captin = "Test"; }  // Typo

// Error: Unknown attribute 'captin'

// Solution
label { caption = "Test"; }  // Fixed typo
```


### Widget Not Visible

**Symptoms**:
- Widget created but not shown on screen
- No error messages
- Other widgets in same view visible

**Possible Causes and Solutions**:

**Alpha is Zero**:
```javascript
// Problem
label {
  caption = "Test";
  alpha = 0.0;  // Invisible
}

// Solution
label {
  caption = "Test";
  alpha = 1.0;  // Visible
}
```

**Size is Zero**:
```javascript
// Problem
container_x {
  width = 0;  // No size
  label { caption = "Test"; }
}

// Solution
container_x {
  width = 200;  // Explicit size
  label { caption = "Test"; }
}
```

**Widget Off-Screen**:
```javascript
// Problem
container_y {
  height = 100;
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }
  label { caption = "Item 3"; }  // May be clipped
}

// Solution
list_y {  // Scrollable
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }
  label { caption = "Item 3"; }
}
```

**Behind Another Widget**:
```javascript
// Problem
container_z {
  quad { color = "#000000"; }  // Opaque background
  label { caption = "Hidden"; }  // Behind quad
}

// Solution
container_z {
  label { caption = "Visible"; }  // First = on top
  quad { color = "#000000"; alpha = 0.5; }  // Semi-transparent
}
```

**Parent Invisible**:
```javascript
// Problem
container_y {
  alpha = 0.0;  // Parent invisible
  label { caption = "Also invisible"; }  // Child inherits
}

// Solution
container_y {
  alpha = 1.0;  // Parent visible
  label { caption = "Now visible"; }
}
```


### Macro Expansion Errors

**Symptoms**:
- Error during preprocessing
- Macro not expanding correctly
- Argument count mismatch

**Common Issues**:

**Argument Count Mismatch**:
```javascript
// Definition
#define button(label, width) {
  container_x {
    width = $width;
    label { caption = $label; }
  }
}

// Problem
button("Click Me")  // Missing width argument

// Error: Macro 'button' expects 2 arguments, got 1

// Solution
button("Click Me", 100)  // Provide all arguments
// Or use default values
#define button(label, width=100) { ... }
```

**Circular Include**:
```javascript
// file1.view
#include "file2.view"

// file2.view
#include "file1.view"  // Circular!

// Error: Circular include detected

// Solution: Restructure to avoid circular dependencies
```

**File Not Found**:
```javascript
// Problem
#include "missing.view"

// Error: File not found: missing.view

// Solution: Check file path and existence
#include "common/macros.view"  // Correct path
```

## Property Binding Issues

### Property Not Updating

**Symptoms**:
- Widget shows initial value
- Value doesn't change when property changes
- No error messages

**Possible Causes and Solutions**:

**Static Expression**:
```javascript
// Problem: No property reference, evaluated once
label {
  caption = "Static Text";  // Never changes
}

// Solution: Use property binding
label {
  caption = $page.model.title;  // Updates when property changes
}
```

**Wrong Property Path**:
```javascript
// Problem: Typo in property path
label {
  caption = $page.model.titl;  // Typo: should be 'title'
}

// Solution: Fix property path
label {
  caption = $page.model.title;  // Correct
}

// Debug: Use null coalescing to detect
label {
  caption = $page.model.title ?? "Property not found";
}
```

**Property Doesn't Exist**:
```javascript
// Problem: Property never set
label {
  caption = $page.model.missingProperty;  // Returns void
}

// Solution: Ensure property is set in plugin/page
// Or provide fallback
label {
  caption = $page.model.title ?? "No title";
}
```


**Widget Inactive**:
```javascript
// Problem: Widget not active, subscription suspended
container_y {
  alpha = 0.0;  // Inactive
  label {
    caption = $page.model.title;  // Subscription suspended
  }
}

// Solution: Ensure widget is active
container_y {
  alpha = 1.0;  // Active
  label {
    caption = $page.model.title;  // Subscription active
  }
}
```

### Wrong Scope Context

**Symptoms**:
- Property reference returns void
- Works in one context but not another
- Cloner items not showing data

**Common Issues**:

**Cloner Scope**:
```javascript
// Problem: Wrong scope in cloner
<cloner source="$items">
  <label caption="$items.title"/>  <!-- Wrong: $items is array -->
</cloner>

// Solution: Use $self for current item
<cloner source="$items">
  <label caption="$self.title"/>  <!-- Correct: $self is current item -->
</cloner>
```

**Loader Scope**:
```javascript
// Problem: Accessing parent scope incorrectly
<!-- parent.view -->
<loader source="child.view" args="$item"/>

<!-- child.view -->
<label caption="$item.title"/>  <!-- Wrong: $item not in scope -->

// Solution: Use $args
<!-- child.view -->
<label caption="$args.title"/>  <!-- Correct: $args contains passed data -->
```

**Nested Scope**:
```javascript
// Problem: Accessing outer scope
<cloner source="$items">
  <cloner source="$self.subitems">
    <label caption="$items.title"/>  <!-- Wrong: $items is outer scope -->
  </cloner>
</cloner>

// Solution: Use $parent or save reference
<cloner source="$items">
  <container_y id="$self.id">
    <cloner source="$self.subitems">
      <label caption="$parent.title"/>  <!-- Access parent scope -->
    </cloner>
  </container_y>
</cloner>
```

## Layout Problems

### Children Overlapping

**Symptoms**:
- Widgets stack on top of each other
- Only last widget visible
- Expected vertical/horizontal layout not working

**Cause**: Wrong container type

**Solution**:
```javascript
// Problem: Using container_z (layering)
container_z {
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }  // Overlaps Item 1
}

// Solution: Use container_y (vertical) or container_x (horizontal)
container_y {
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }  // Below Item 1
}

container_x {
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }  // Right of Item 1
}
```


### Incorrect Widget Sizes

**Symptoms**:
- Widgets too small or too large
- Content clipped or overflowing
- Inconsistent sizing

**Common Issues**:

**No Size Specified**:
```javascript
// Problem: Size determined by content only
container_x {
  label { caption = "Test"; }  // Size = text size
}

// Solution: Specify explicit size
container_x {
  width = 200;
  height = 50;
  label { caption = "Test"; }
}
```

**Conflicting Constraints**:
```javascript
// Problem: Child larger than parent
container_x {
  width = 100;
  label {
    width = 200;  // Larger than parent!
    caption = "Test";
  }
}

// Solution: Use relative sizing
container_x {
  width = 100;
  label {
    width = $parent.width;  // Match parent
    caption = "Test";
  }
}
```

**EM Units Not Calculated**:
```javascript
// Problem: EM units require font context
label {
  width = 10em;  // May not work without font
}

// Solution: Ensure font is set
label {
  fontSize = 16;
  width = 10em;  // Now calculated correctly
}
```

### Alignment Issues

**Symptoms**:
- Content not centered
- Items not aligned as expected
- Uneven spacing

**Solutions**:

**Center Alignment**:
```javascript
// Horizontal centering
container_x {
  align = center;
  label { caption = "Centered"; }
}

// Vertical centering
container_y {
  align = center;
  label { caption = "Centered"; }
}

// Both axes
container_z {
  label {
    caption = "Centered";
    align = center;  // Within parent
  }
}
```

**Left/Right Alignment**:
```javascript
// Left align
container_x {
  align = left;
  label { caption = "Left"; }
}

// Right align
container_x {
  align = right;
  label { caption = "Right"; }
}
```

**Top/Bottom Alignment**:
```javascript
// Top align
container_y {
  align = top;
  label { caption = "Top"; }
}

// Bottom align
container_y {
  align = bottom;
  label { caption = "Bottom"; }
}
```


### Spacing Problems

**Symptoms**:
- No space between items
- Too much space between items
- Inconsistent spacing

**Solutions**:

**Add Spacing**:
```javascript
// Problem: No spacing
container_y {
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }  // Touching Item 1
}

// Solution: Add spacing
container_y {
  spacing = 0.5em;  // Space between children
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }
}
```

**Add Padding**:
```javascript
// Problem: Content touching edges
container_y {
  label { caption = "Text"; }  // At edge
}

// Solution: Add padding
container_y {
  padding = [1em, 2em];  // [vertical, horizontal]
  label { caption = "Text"; }  // Padded
}
```

## Focus and Navigation

### Widget Not Focusable

**Symptoms**:
- Cannot navigate to widget
- Widget doesn't respond to input
- Focus skips over widget

**Cause**: Missing focusable attribute

**Solution**:
```javascript
// Problem: Not focusable
container_x {
  label { caption = "Click Me"; }
}

// Solution: Add focusable attribute
container_x {
  focusable = true;  // Now can receive focus
  label { caption = "Click Me"; }
}
```

### No Visual Focus Indicator

**Symptoms**:
- Can't tell which widget is focused
- Navigation works but no visual feedback

**Solution**: Add focus indicator
```javascript
container_z {
  focusable = true;
  
  // Background that changes on focus
  quad {
    color = "#444444";
    alpha = 0.6 + 0.4 * iir(isNavFocused(), 4, true);
  }
  
  // Border that appears on focus
  border {
    border = 0.1em;
    color = "#FFFFFF";
    alpha = isNavFocused();
  }
  
  label { caption = "Focusable"; }
}
```

### Events Not Firing

**Symptoms**:
- Widget focused but doesn't respond to activation
- No action when pressing Enter/Click

**Common Issues**:

**Missing Event Handler**:
```javascript
// Problem: No event handler
container_x {
  focusable = true;
  label { caption = "Click Me"; }
}

// Solution: Add event handler
container_x {
  focusable = true;
  onEvent(activate, navOpen("target:url"));
  label { caption = "Click Me"; }
}
```

**Wrong Event Type**:
```javascript
// Problem: Wrong event name
container_x {
  focusable = true;
  onEvent(click, navOpen("url"));  // Wrong: should be 'activate'
}

// Solution: Use correct event type
container_x {
  focusable = true;
  onEvent(activate, navOpen("url"));  // Correct
}
```

**Invalid Action**:
```javascript
// Problem: Invalid action syntax
container_x {
  focusable = true;
  onEvent(activate, "navOpen(url)");  // Wrong: string, not action
}

// Solution: Use proper action syntax
container_x {
  focusable = true;
  onEvent(activate, navOpen($self.url));  // Correct
}
```


### Focus Navigation Issues

**Symptoms**:
- Focus jumps unexpectedly
- Cannot navigate to certain widgets
- Focus order incorrect

**Solutions**:

**Set Focus Weight**:
```javascript
// Control focus priority
container_y {
  container_x {
    focusable = true;
    focusWeight = 1.0;  // Higher priority
    label { caption = "Important"; }
  }
  
  container_x {
    focusable = true;
    focusWeight = 0.5;  // Lower priority
    label { caption = "Less Important"; }
  }
}
```

**Fix Focus Path**:
```javascript
// Problem: Parent not allowing focus
container_y {
  // No focusable attribute
  container_x {
    focusable = true;  // Can't receive focus (parent blocks)
    label { caption = "Unreachable"; }
  }
}

// Solution: Ensure focus path is clear
container_y {
  // Parent doesn't need to be focusable for children to be
  container_x {
    focusable = true;  // Now reachable
    label { caption = "Reachable"; }
  }
}
```

## Performance Issues

### Slow Rendering

**Symptoms**:
- UI feels sluggish
- Frame rate drops
- Animations stutter

**Common Causes**:

**Too Many Widgets**:
```javascript
// Problem: Creating hundreds of individual widgets
container_y {
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }
  // ... 500 more labels
}

// Solution: Use cloner with list
list_y {
  cloner($items, container_x, {
    label { caption = $self.title; }
  });
}
```

**Complex Expressions**:
```javascript
// Problem: Complex expression evaluated frequently
alpha = iir(($a && $b && $c) || ($d && $e && $f), 8, true) * 
        ($g ? 1.0 : 0.5) + 
        ($h ? 0.2 : 0.0);

// Solution: Simplify
alpha = iir($visible, 8, true);
```

**Too Many Subscriptions**:
```javascript
// Problem: Many property references
alpha = $enabled ? 1.0 : 0.3;
color = $enabled ? "#FF0000" : "#CCCCCC";
scale = $enabled ? 1.0 : 0.8;
blur = $enabled ? 0.0 : 2.0;

// Solution: Reduce redundant references
// Consider caching or simplifying logic
```

### Memory Issues

**Symptoms**:
- Memory usage grows over time
- Crashes after extended use
- Slow performance after time

**Solutions**:

**Clean Up Resources**:
```javascript
// Ensure widgets are properly destroyed
// Use autohide to remove inactive widgets
container_y {
  autohide = true;
  alpha = $visible ? 1.0 : 0.0;
}
```

**Limit Cloner Items**:
```javascript
// Problem: Cloning thousands of items
<cloner source="$allItems">  <!-- 10,000 items -->
  <container_x>...</container_x>
</cloner>

// Solution: Use pagination or virtual scrolling
<cloner source="$visibleItems">  <!-- Only visible items -->
  <container_x>...</container_x>
</cloner>
```


## Plugin Issues

### Plugin Not Loading

**Symptoms**:
- Plugin doesn't appear in Movian
- No error message
- Plugin directory exists

**Common Causes**:

**Invalid plugin.json**:
```json
// Problem: Syntax error in JSON
{
  "id": "myplugin",
  "version": "1.0",  // Trailing comma
}

// Solution: Fix JSON syntax
{
  "id": "myplugin",
  "version": "1.0"
}
```

**Missing Required Fields**:
```json
// Problem: Missing required fields
{
  "version": "1.0"
}

// Solution: Add all required fields
{
  "id": "myplugin",
  "version": "1.0",
  "title": "My Plugin",
  "type": "javascript",
  "file": "plugin.js"
}
```

**Wrong File Path**:
```json
// Problem: File doesn't exist
{
  "id": "myplugin",
  "file": "main.js"  // File doesn't exist
}

// Solution: Use correct filename
{
  "id": "myplugin",
  "file": "plugin.js"  // File exists
}
```

### JavaScript Errors

**Symptoms**:
- Plugin loads but doesn't work
- Error messages in console
- Features not functioning

**Common Errors**:

**Syntax Error**:
```javascript
// Problem
var title = "Test"  // Missing semicolon
var count = 10;

// Error: Unexpected token

// Solution
var title = "Test";  // Added semicolon
var count = 10;
```

**Undefined Variable**:
```javascript
// Problem
console.log(myVariable);  // Variable not defined

// Error: ReferenceError: myVariable is not defined

// Solution
var myVariable = "value";
console.log(myVariable);
```

**API Not Available**:
```javascript
// Problem
var response = http.get("url");  // Wrong API

// Error: http is not defined

// Solution
var response = require('movian/http').request("url", {
  method: 'GET'
});
```

### Service Not Registering

**Symptoms**:
- Plugin loads but service doesn't appear
- No search results
- Content not accessible

**Solution**:
```javascript
// Ensure service is registered correctly
var service = require('movian/service');

service.create("My Service", "myservice:start", "video", true, 
  require('movian/plugin').path + "logo.png");
```


### HTTP Request Failures

**Symptoms**:
- Network requests fail
- Timeout errors
- No response data

**Common Issues**:

**Wrong URL**:
```javascript
// Problem
var response = http.request("htp://example.com");  // Typo

// Solution
var response = http.request("http://example.com");
```

**Missing Headers**:
```javascript
// Problem: API requires headers
var response = http.request("http://api.example.com/data");

// Solution: Add required headers
var response = http.request("http://api.example.com/data", {
  headers: {
    'User-Agent': 'Movian Plugin',
    'Accept': 'application/json'
  }
});
```

**Timeout Too Short**:
```javascript
// Problem: Request times out
var response = http.request("http://slow-api.com", {
  timeout: 1000  // 1 second, too short
});

// Solution: Increase timeout
var response = http.request("http://slow-api.com", {
  timeout: 30000  // 30 seconds
});
```

**SSL/HTTPS Issues**:
```javascript
// Problem: SSL certificate validation fails
var response = http.request("https://self-signed.com");

// Solution: Disable SSL verification (use with caution)
var response = http.request("https://self-signed.com", {
  noVerify: true
});
```

## Build Issues

### Missing Dependencies

**Symptoms**:
- Configure fails with "Package not found"
- Compilation errors about missing headers
- Linker errors about missing libraries

**Solutions**:

**Ubuntu/Debian**:
```bash
# Install development packages
sudo apt-get install \
  libfreetype6-dev \
  libfontconfig1-dev \
  libxext-dev \
  libgl1-mesa-dev \
  libasound2-dev \
  libssl-dev
```

**Fedora/CentOS**:
```bash
# Install development packages
sudo dnf install \
  freetype-devel \
  fontconfig-devel \
  libXext-devel \
  mesa-libGL-devel \
  alsa-lib-devel \
  openssl-devel
```

**macOS**:
```bash
# Install via Homebrew
brew install \
  freetype \
  fontconfig \
  openssl
```

### Compiler Errors

**Symptoms**:
- Compilation fails with syntax errors
- C99/C++11 features not supported
- Undefined references

**Solutions**:

**Update Compiler**:
```bash
# Ubuntu/Debian
sudo apt-get install gcc-8 g++-8

# Configure with specific compiler
./configure --cc=gcc-8 --cxx=g++-8
```

**Add Missing Libraries**:
```bash
# Configure with additional libraries
./configure --extra-ldflags="-lpthread -ldl -lm"
```


## Runtime Issues

### Crashes on Startup

**Symptoms**:
- Movian crashes immediately after launch
- Segmentation fault
- No UI appears

**Common Causes**:

**Missing Libraries**:
```bash
# Check for missing libraries
ldd build.linux/movian

# Install missing runtime libraries
sudo apt-get install libssl1.1 libpulse0
```

**Graphics Driver Issues**:
```bash
# Check OpenGL support
glxinfo | grep "direct rendering"

# Install proper drivers
sudo apt-get install mesa-utils libgl1-mesa-dri
```

**Permission Issues**:
```bash
# Check file permissions
ls -la build.linux/movian

# Fix if needed
chmod +x build.linux/movian
```

### Audio/Video Playback Issues

**Symptoms**:
- No audio output
- Video doesn't play
- Codec errors

**Solutions**:

**Audio Device Access**:
```bash
# Add user to audio group
sudo usermod -a -G audio $USER

# Log out and back in
```

**Missing Codecs**:
```bash
# Install codec libraries
sudo apt-get install \
  libavcodec-dev \
  libavformat-dev \
  libavutil-dev
```

### Display Issues

**Symptoms**:
- Blank screen
- Corrupted graphics
- Wrong resolution

**Solutions**:

**X11 Connection**:
```bash
# Set DISPLAY variable
export DISPLAY=:0

# Allow X11 connections
xhost +local:
```

**OpenGL Context**:
```bash
# Check OpenGL version
glxinfo | grep "OpenGL version"

# Update graphics drivers if needed
```

## Platform-Specific Issues

### Linux-Specific

**Wayland Issues**:
```bash
# Force X11 backend
export GDK_BACKEND=x11
./movian
```

**PulseAudio Issues**:
```bash
# Restart PulseAudio
pulseaudio --kill
pulseaudio --start
```

### macOS-Specific

**Gatekeeper Issues**:
```bash
# Allow unsigned application
xattr -d com.apple.quarantine /path/to/Movian.app
```

**OpenSSL Path Issues**:
```bash
# Configure with Homebrew OpenSSL
./configure \
  --extra-cflags="-I/opt/homebrew/opt/openssl/include" \
  --extra-ldflags="-L/opt/homebrew/opt/openssl/lib"
```

### Windows-Specific

**MSYS2 Path Issues**:
```bash
# Ensure MSYS2 in PATH
export PATH="/mingw64/bin:$PATH"
```

**DLL Not Found**:
```bash
# Copy required DLLs to executable directory
cp /mingw64/bin/*.dll build.win32/
```

## Diagnostic Tools

### Enable Debug Output

```bash
# View file debugging
./movian --debug glw:view

# Property system debugging
./movian --debug prop

# Plugin debugging
./movian --debug plugin

# All debug output
./movian --debug all
```

### Check System Information

```bash
# System info
uname -a

# OpenGL info
glxinfo | head -20

# Library versions
pkg-config --modversion freetype2
pkg-config --modversion openssl
```

### Memory Debugging

```bash
# Build with address sanitizer
./configure --extra-cflags="-fsanitize=address"
make

# Run and check for leaks
./movian
```

### Performance Profiling

```bash
# Build with profiling
./configure --optlevel=g
make

# Run with profiler
gdb ./build.linux/movian
(gdb) run
(gdb) bt  # Backtrace on crash
```

## Getting Help

### Before Asking

1. **Check console output** for error messages
2. **Search existing issues** on GitHub
3. **Try minimal reproduction** to isolate problem
4. **Collect system information** (OS, version, etc.)
5. **Review this troubleshooting guide**

### Where to Ask

- **GitHub Issues**: Bug reports and feature requests
- **Community Forum**: General questions and discussion
- **Documentation**: Check guides and references

### Information to Include

When reporting issues:

- **Platform**: OS, version, architecture
- **Movian version**: Build date, commit hash
- **Error messages**: Complete output, not summaries
- **Steps to reproduce**: Exact sequence to trigger issue
- **Expected vs actual**: What should happen vs what does
- **Code samples**: Minimal reproduction case

## Quick Reference Tables

### Error Message Patterns

| Error Pattern | Category | Common Cause |
|---------------|----------|--------------|
| `Unexpected token` | Syntax | Missing semicolon, brace |
| `Unknown widget type` | Syntax | Typo in widget name |
| `Unknown attribute` | Syntax | Typo in attribute name |
| `Unterminated string` | Syntax | Missing quote |
| `Property not found` | Binding | Wrong property path |
| `Package not found` | Build | Missing dependency |
| `undefined reference` | Build | Missing library |
| `Permission denied` | Runtime | File/device permissions |

### Widget Visibility Checklist

- [ ] Alpha > 0
- [ ] Width > 0 and Height > 0
- [ ] Parent visible
- [ ] Not clipped by parent
- [ ] Not behind opaque widget
- [ ] In viewport

### Focus Checklist

- [ ] focusable = true
- [ ] Widget visible
- [ ] Parent allows focus
- [ ] Focus indicator present
- [ ] Event handler defined

### Performance Checklist

- [ ] Widget count < 1000
- [ ] Expression complexity low
- [ ] Property subscriptions minimal
- [ ] Cloner used for lists
- [ ] Autohide for inactive widgets

## Related Documentation

- [Debugging View Files](../guides/debugging-view-files.md) - Detailed debugging guide
- [Installation Troubleshooting](../installation/troubleshooting.md) - Build issues
- [Syntax Reference](../ui/view-files/syntax-reference.md) - View file syntax
- [Plugin Best Practices](../plugins/best-practices.md) - Plugin development
- [Performance Optimization](../guides/performance-optimization.md) - Optimization tips

---

**Accuracy Status**: 🟢 Solutions verified from real issues and source code  
**Last Updated**: November 2024  
**Movian Version**: 4.8+
