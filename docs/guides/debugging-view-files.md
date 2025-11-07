# Debugging View Files

**Status**: 🟢 Based on source code analysis and practical experience  
**Last Updated**: 2024-11-06  
**Movian Version**: 4.8+

## Overview

Debugging GLW view files can be challenging due to their dynamic nature and the complexity of the rendering pipeline. This guide provides practical techniques and tools for identifying and resolving common view file issues, from syntax errors to layout problems and performance bottlenecks.

## Quick Diagnosis

### Common Symptoms and Causes

| Symptom | Likely Cause | Quick Check |
|---------|--------------|-------------|
| View doesn't load | Syntax error, missing file | Check console for errors |
| Widget not visible | Alpha=0, off-screen, z-order | Check alpha, position, parent |
| Layout incorrect | Wrong container, bad constraints | Verify container type, sizes |
| Property not updating | Wrong path, no subscription | Check property path, binding |
| Performance issues | Too many widgets, complex expressions | Profile widget count, expressions |
| Focus not working | Missing focusable attribute | Check focusable flags |

### Debugging Checklist

Before diving deep, run through this checklist:

- [ ] **Syntax valid**: No parsing errors in console
- [ ] **File loaded**: Loader source property set correctly
- [ ] **Properties exist**: Referenced properties are defined
- [ ] **Widgets created**: Check widget tree in debug output
- [ ] **Visibility**: Alpha > 0, not clipped, in viewport
- [ ] **Focus path**: Focusable widgets in correct hierarchy

## Development Environment Setup

### Enable Debug Logging

Configure Movian to output detailed debug information:

**Command Line Flags**:
```bash
# Enable GLW debug output
./movian --debug glw

# Enable view file parsing debug
./movian --debug glw:view

# Enable property system debug
./movian --debug prop

# Enable all debug output
./movian --debug all

# Combine multiple debug categories
./movian --debug glw,prop,plugin
```

**Environment Variables**:
```bash
# Set debug level
export MOVIAN_DEBUG="glw:view,prop"

# Enable trace logging
export MOVIAN_TRACE=1

# Run Movian
./movian
```

### Console Output

Debug output appears in the console/terminal where Movian was launched:

```
GLW: Loading view: skin://views/home.view
GLW: Created widget: container_y (0x12345678)
GLW: Property subscription: $page.model.title
GLW: Attribute set: width = 100
GLW: Widget rendered: label "Home" at (10, 20)
```

### Development Tools

**Text Editor with Syntax Highlighting**:
- Use an editor that supports XML or JavaScript syntax
- Configure for `.view` file extension
- Enable bracket matching and indentation

**File Watcher**:
```bash
# Auto-reload view on file change (Linux)
while inotifywait -e modify views/myview.view; do
    # Trigger reload in Movian
    # (requires custom reload mechanism)
done
```

## Syntax Error Debugging

### Identifying Syntax Errors

**Error Format**:
```
Error views/home.view:42: Unexpected token '}' after expression
Error views/home.view:15: Unterminated string literal
Error views/home.view:28: Unknown widget type 'containr_x'
```

**Error Components**:
- **File path**: `views/home.view`
- **Line number**: `42`
- **Error description**: What went wrong
- **Context**: Token or expression causing error

### Common Syntax Errors

#### Unterminated Strings

**Problem**:
```javascript
label {
  caption = "Hello World;  // Missing closing quote
}
```

**Error**:
```
Error views/home.view:2: Unterminated string literal
```

**Solution**:
```javascript
label {
  caption = "Hello World";  // Added closing quote
}
```

#### Unbalanced Braces

**Problem**:
```javascript
container_y {
  label { caption = "Test"; }
  // Missing closing brace
```

**Error**:
```
Error views/home.view:4: Unexpected end of file, expected '}'
```

**Solution**:
```javascript
container_y {
  label { caption = "Test"; }
}  // Added closing brace
```

#### Missing Semicolons

**Problem**:
```javascript
label {
  caption = "Test"  // Missing semicolon
  alpha = 0.5;
}
```

**Error**:
```
Error views/home.view:3: Unexpected identifier 'alpha'
```

**Solution**:
```javascript
label {
  caption = "Test";  // Added semicolon
  alpha = 0.5;
}
```

#### Invalid Widget Types

**Problem**:
```javascript
containr_x {  // Typo: should be container_x
  label { caption = "Test"; }
}
```

**Error**:
```
Error views/home.view:1: Unknown widget type 'containr_x'
```

**Solution**:
```javascript
container_x {  // Fixed typo
  label { caption = "Test"; }
}
```

#### Invalid Attribute Names

**Problem**:
```javascript
label {
  captin = "Test";  // Typo: should be caption
}
```

**Error**:
```
Error views/home.view:2: Unknown attribute 'captin' for widget 'label'
```

**Solution**:
```javascript
label {
  caption = "Test";  // Fixed typo
}
```

### Syntax Validation Techniques

**Incremental Development**:
```javascript
// Start with minimal structure
container_y {
}

// Add one widget at a time
container_y {
  label { caption = "Test"; }
}

// Add more complexity gradually
container_y {
  label { caption = "Test"; }
  image { source = "icon.png"; }
}
```

**Comment Out Sections**:
```javascript
container_y {
  label { caption = "Working"; }
  
  /* Temporarily disable problematic section
  image {
    source = $broken.property;
  }
  */
  
  label { caption = "Also Working"; }
}
```

**Use Macros for Reusable Patterns**:
```javascript
// Define once, use many times
#define testLabel(text) {
  label {
    caption = $text;
    color = "#FFFFFF";
  }
}

// Use macro - easier to debug
container_y {
  testLabel("Test 1")
  testLabel("Test 2")
}
```

## Property Binding Debugging

### Property Path Issues

**Problem**: Property not found
```javascript
label {
  caption = $page.model.titl;  // Typo: should be title
}
```

**Symptoms**:
- Label shows empty text
- No error in console (property just returns void)

**Debug Technique**:
```javascript
// Use debug assignment to log property value
label {
  caption _=_ $page.model.title;  // Logs value changes
}
```

**Console Output**:
```
GLW: Debug assignment: caption = "Home Page"
GLW: Debug assignment: caption = "Settings"
```

**Solution**:
```javascript
label {
  caption = $page.model.title;  // Fixed typo
}
```

### Property Subscription Issues

**Problem**: Property changes but UI doesn't update

**Possible Causes**:
1. Property path incorrect
2. Property not actually changing
3. Widget not subscribed (static expression)
4. Widget inactive (subscription suspended)

**Debug Technique**:
```javascript
// Verify property exists and changes
label {
  caption = $page.model.title ?? "Property is void";
}

// Force dynamic evaluation
label {
  caption = "" + $page.model.title;  // String concatenation forces dynamic
}

// Check if property changes
label {
  caption _=_ $page.model.title;  // Debug log
}
```

### Scope Resolution Issues

**Problem**: Wrong scope context

**Example**:
```javascript
<loader source="item.view" args="$item">
  <!-- In item.view -->
  <label caption="$item.title"/>  <!-- Wrong: $item not in scope -->
  <label caption="$args.title"/>  <!-- Correct: use $args -->
</loader>
```

**Debug Technique**:
```javascript
// Test different scope roots
label { caption = $self.title ?? "No $self"; }
label { caption = $args.title ?? "No $args"; }
label { caption = $parent.title ?? "No $parent"; }
```

### Common Property Patterns

**Null Coalescing**:
```javascript
// Provide fallback for missing properties
caption = $item.title ?? "Untitled";
caption = $item.subtitle ?? $item.description ?? "No description";
```

**Type Conversion**:
```javascript
// Ensure string type
caption = "" + $item.count;  // Convert number to string

// Ensure numeric type
width = 0 + $item.width;  // Convert to number
```

**Conditional Values**:
```javascript
// Use ternary for conditional values
alpha = $enabled ? 1.0 : 0.3;
color = $selected ? "#FF0000" : "#CCCCCC";
```

## Layout Debugging

### Widget Visibility Issues

**Problem**: Widget exists but not visible

**Checklist**:
```javascript
// 1. Check alpha
alpha = 1.0;  // Not 0.0

// 2. Check size
width = 100;   // Not 0
height = 50;   // Not 0

// 3. Check parent visibility
// Parent must also be visible

// 4. Check z-order
// Widget might be behind another widget

// 5. Check clipping
// Widget might be outside parent bounds
```

**Debug Technique - Highlight Widget**:
```javascript
container_z {
  // Your widget
  label {
    caption = "Test";
  }
  
  // Debug overlay - bright border
  border {
    border = 0.2em;
    color = "#FF0000";  // Bright red
    alpha = 1.0;
  }
}
```

**Debug Technique - Simplify**:
```javascript
// Replace complex widget with simple colored quad
quad {
  width = 100;
  height = 100;
  color = "#FF0000";  // Should be visible
}
```

### Container Layout Issues

**Problem**: Children not positioned correctly

**Container Types**:
- `container_x`: Horizontal layout (left to right)
- `container_y`: Vertical layout (top to bottom)
- `container_z`: Z-axis layering (stacked)

**Debug Technique**:
```javascript
// Add colored backgrounds to see container bounds
container_y {
  quad {
    color = "#FF0000";  // Red background
    alpha = 0.3;        // Semi-transparent
  }
  
  label { caption = "Child 1"; }
  label { caption = "Child 2"; }
}
```

**Common Issues**:

**Issue**: Children overlap in container_y
```javascript
// Problem: Using container_z instead of container_y
container_z {  // Wrong: stacks children
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }  // Overlaps Item 1
}

// Solution: Use correct container
container_y {  // Correct: vertical layout
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }  // Below Item 1
}
```

**Issue**: Children too small or too large
```javascript
// Problem: No size constraints
container_x {
  label { caption = "Test"; }  // Size determined by content
}

// Solution: Add explicit sizes
container_x {
  width = 200;
  height = 50;
  label { caption = "Test"; }
}
```

**Issue**: Children not aligned
```javascript
// Problem: No alignment specified
container_x {
  label { caption = "Left"; }
  label { caption = "Right"; }
}

// Solution: Use alignment
container_x {
  align = center;  // Center children
  label { caption = "Centered 1"; }
  label { caption = "Centered 2"; }
}
```

### Spacing and Padding

**Debug Technique**:
```javascript
// Visualize spacing with colored quads
container_y {
  spacing = 1em;
  
  container_z {
    quad { color = "#FF0000"; alpha = 0.3; }
    label { caption = "Item 1"; }
  }
  
  container_z {
    quad { color = "#00FF00"; alpha = 0.3; }
    label { caption = "Item 2"; }
  }
}
```

**Common Patterns**:
```javascript
// Padding around content
container_z {
  quad { color = "#333333"; }  // Background
  
  container_y {
    padding = [1em, 2em];  // [vertical, horizontal]
    label { caption = "Padded content"; }
  }
}

// Spacing between items
container_y {
  spacing = 0.5em;
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }
  label { caption = "Item 3"; }
}
```

### Size and Position Debugging

**Absolute Sizes**:
```javascript
// Fixed pixel sizes
width = 200;
height = 100;
```

**Relative Sizes**:
```javascript
// Relative to parent
width = $parent.width * 0.5;  // 50% of parent width
height = $parent.height - 100;  // Parent height minus 100
```

**EM Units**:
```javascript
// Relative to font size
width = 10em;   // 10 times current font size
padding = 1em;  // 1 times current font size
```

**Debug Technique - Show Dimensions**:
```javascript
container_z {
  // Your widget
  image { source = "icon.png"; }
  
  // Debug label showing size
  label {
    caption = "W:" + $parent.width + " H:" + $parent.height;
    align = bottom;
    color = "#FFFF00";
  }
}
```

## Focus and Interaction Debugging

### Focus Issues

**Problem**: Widget not receiving focus

**Checklist**:
```javascript
// 1. Widget must be focusable
focusable = true;

// 2. Widget must be visible
alpha = 1.0;

// 3. Widget must be in focus path
// Parent containers must allow focus

// 4. Widget must have focus weight
// Higher weight = higher priority
```

**Debug Technique - Visual Focus Indicator**:
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
    alpha = isNavFocused();  // Only visible when focused
  }
  
  label { caption = "Focusable Item"; }
}
```

**Debug Technique - Log Focus Events**:
```javascript
container_x {
  focusable = true;
  
  // This will log when widget gains/loses focus
  onEvent(focus, deliverEvent($global.eventSink, "focus", $self.id));
  onEvent(blur, deliverEvent($global.eventSink, "blur", $self.id));
  
  label { caption = "Test"; }
}
```

### Event Handling Issues

**Problem**: Events not firing

**Common Causes**:
1. Widget not focusable
2. Event handler syntax incorrect
3. Event type misspelled
4. Action invalid

**Debug Technique**:
```javascript
container_x {
  focusable = true;
  
  // Test with simple action
  onEvent(activate, deliverEvent($global.eventSink, "test", "activated"));
  
  // Verify focus works
  quad {
    color = "#FF0000";
    alpha = isNavFocused();  // Should light up when focused
  }
  
  label { caption = "Click Me"; }
}
```

**Common Event Types**:
```javascript
// Activation (Enter/Click)
onEvent(activate, navOpen($self.url));

// Cancel (Back/Escape)
onEvent(cancel, deliverEvent($parent, "back"));

// Focus gained
onEvent(focus, /* action */);

// Focus lost
onEvent(blur, /* action */);
```

## Performance Debugging

### Widget Count Issues

**Problem**: Too many widgets causing slowdown

**Debug Technique - Count Widgets**:
```javascript
// Add debug label showing widget count
label {
  caption = "Widgets: " + $view.widgetCount;
  align = top;
  color = "#FFFF00";
}
```

**Optimization**:
```javascript
// Bad: Creating many individual widgets
container_y {
  label { caption = "Item 1"; }
  label { caption = "Item 2"; }
  // ... 100 more labels
}

// Good: Use cloner for dynamic content
list_y {
  cloner($items, container_x, {
    label { caption = $self.title; }
  });
}
```

### Expression Complexity

**Problem**: Complex expressions causing performance issues

**Debug Technique**:
```javascript
// Simplify expression to test
// Before:
alpha = ($enabled && $visible && !$disabled) ? 
        (1.0 - 0.3 * $dimFactor) : 0.0;

// After (simplified):
alpha = $enabled ? 1.0 : 0.0;
```

**Optimization**:
```javascript
// Bad: Complex expression evaluated frequently
alpha = iir(($a && $b) || ($c && $d), 8, true) * 
        ($e ? 1.0 : 0.5) + 
        ($f ? 0.2 : 0.0);

// Good: Simplify or cache intermediate values
alpha = iir($visible, 8, true);
```

### Subscription Overhead

**Problem**: Too many property subscriptions

**Debug Technique**:
```javascript
// Check subscription count in debug output
// Look for: "Property subscription created"

// Reduce subscriptions by caching values
// Bad: Multiple references to same property
alpha = $enabled ? 1.0 : 0.3;
color = $enabled ? "#FF0000" : "#CCCCCC";
scale = $enabled ? 1.0 : 0.8;

// Better: Use intermediate variable (if supported)
// Or combine into single expression
alpha = $enabled ? 1.0 : 0.3;
color = $enabled ? "#FF0000" : "#CCCCCC";
// Note: Each still creates subscription, but clearer
```

## Advanced Debugging Techniques

### Token Tree Inspection

For deep debugging, inspect the parsed token tree:

**Enable Token Tree Output**:
```bash
# Requires debug build
./movian --debug glw:view:tokens
```

**Output Example**:
```
Token tree for views/home.view:
  container_y (line 1)
    width: 200 (line 2)
    height: 100 (line 3)
    label (line 4)
      caption: "Test" (line 5)
```

### Memory Debugging

**Check for Memory Leaks**:
```bash
# Build with address sanitizer
./configure --extra-cflags="-fsanitize=address"
make

# Run and check for leaks
./movian
```

### Widget Tree Inspection

**Runtime Widget Tree**:
```javascript
// Add debug widget that shows tree structure
label {
  caption = "Parent: " + $parent.type + 
            " Children: " + $parent.childCount;
}
```

## Common Patterns and Solutions

### Pattern: Conditional Visibility

```javascript
// Show/hide based on condition
container_y {
  alpha = $showContent ? 1.0 : 0.0;
  
  // Or use autohide
  autohide = true;  // Hides when alpha = 0
  alpha = $showContent;
}
```

### Pattern: Loading States

```javascript
// Show loading indicator
container_z {
  // Content
  loader {
    source = $contentUrl;
    alpha = $loaded ? 1.0 : 0.0;
  }
  
  // Loading spinner
  image {
    source = "spinner.png";
    alpha = $loaded ? 0.0 : 1.0;
  }
}
```

### Pattern: Error States

```javascript
// Show error message
container_y {
  // Normal content
  container_y {
    alpha = $error ? 0.0 : 1.0;
    label { caption = $content; }
  }
  
  // Error message
  container_y {
    alpha = $error ? 1.0 : 0.0;
    label {
      caption = "Error: " + $errorMessage;
      color = "#FF0000";
    }
  }
}
```

### Pattern: Debug Overlays

```javascript
// Temporary debug overlay
container_z {
  // Your normal content
  container_y {
    label { caption = "Content"; }
  }
  
  // Debug overlay (remove in production)
  container_y {
    align = top;
    label {
      caption = "Debug: " + $page.model.state;
      color = "#FFFF00";
      backgroundColor = "#000000";
      alpha = 0.8;
    }
  }
}
```

## Troubleshooting Workflow

### Step-by-Step Debugging Process

1. **Identify the Problem**
   - What is the expected behavior?
   - What is the actual behavior?
   - When does it occur?

2. **Check Console Output**
   - Look for syntax errors
   - Check for property warnings
   - Note any GLW debug messages

3. **Simplify the View**
   - Comment out sections
   - Replace complex widgets with simple ones
   - Remove expressions temporarily

4. **Isolate the Issue**
   - Create minimal reproduction
   - Test in isolation
   - Verify assumptions

5. **Test Incrementally**
   - Add back complexity gradually
   - Test after each change
   - Document what works

6. **Verify the Fix**
   - Test in full context
   - Check edge cases
   - Ensure no regressions

### Quick Fixes Checklist

- [ ] **Syntax**: Check braces, semicolons, quotes
- [ ] **Properties**: Verify paths, check for typos
- [ ] **Visibility**: Check alpha, size, position
- [ ] **Focus**: Verify focusable attribute
- [ ] **Events**: Check event type and handler
- [ ] **Layout**: Verify container type
- [ ] **Performance**: Check widget count, expression complexity

## Best Practices

### Development Practices

1. **Start Simple**: Begin with minimal structure, add complexity gradually
2. **Test Frequently**: Test after each significant change
3. **Use Comments**: Document complex logic and workarounds
4. **Version Control**: Commit working versions frequently
5. **Modular Design**: Break complex views into smaller, reusable components

### Debugging Practices

1. **Enable Debug Output**: Always develop with debug logging enabled
2. **Use Debug Assignments**: Leverage `_=_` operator to log values
3. **Visual Debugging**: Use colored backgrounds and borders
4. **Incremental Testing**: Test one change at a time
5. **Document Issues**: Keep notes on problems and solutions

### Code Organization

1. **Consistent Naming**: Use clear, descriptive names
2. **Logical Structure**: Group related widgets together
3. **Macro Usage**: Extract reusable patterns into macros
4. **File Organization**: Separate concerns into different files
5. **Comment Complex Logic**: Explain non-obvious code

## Related Documentation

- [Troubleshooting Reference](../reference/troubleshooting.md) - Common issues and solutions
- [Syntax Reference](../ui/view-files/syntax-reference.md) - Complete syntax guide
- [GLW Architecture](../ui/glw-architecture.md) - System architecture
- [Source Analysis Summary](../ui/source-analysis/summary.md) - Technical details
- [Examples](../ui/examples/README.md) - Working examples

## See Also

- [Performance Optimization](performance-optimization.md) - Optimization techniques
- [Plugin Debugging](debugging-plugins.md) - Plugin-specific debugging
- [Best Practices](../plugins/best-practices.md) - Development patterns

---

**Accuracy Status**: 🟢 Based on source code analysis and practical debugging experience  
**Source References**:
- `src/ui/glw/glw_view_parser.c` - Error reporting
- `src/ui/glw/glw_view_eval.c` - Expression evaluation
- `src/ui/glw/glw.c` - Widget lifecycle
- Community debugging experiences

**Last Updated**: November 2024  
**Movian Version**: 4.8+
