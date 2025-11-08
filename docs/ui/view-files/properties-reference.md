# View File Properties Reference

Complete reference for all properties available in Movian view files.

## Overview

This document provides a comprehensive list of all properties that can be used in view files, organized by category.

## Layout Properties

### Sizing

```view
widget(container_x, {
    width: 10em;              // Fixed width
    height: 5em;              // Fixed height
    minWidth: 5em;            // Minimum width
    maxWidth: 20em;           // Maximum width
    minHeight: 3em;           // Minimum height
    maxHeight: 10em;          // Maximum height
    aspectRatio: 1.777;       // Width/height ratio (16:9)
});
```

### Spacing

```view
widget(container_x, {
    padding: [1em, 0.5em];              // [vertical, horizontal]
    padding: [1em, 0.5em, 0.5em, 1em];  // [top, right, bottom, left]
    spacing: 0.5em;                      // Space between children
    margin: [0, 1em];                    // External spacing
});
```

### Alignment

```view
widget(container_x, {
    align: left;              // left, center, right
    valign: top;              // top, middle, bottom
    
    // Container-specific
    homogenous: true;         // Equal size children
    filterConstraintX: true;  // Constrain horizontal layout
    filterConstraintY: true;  // Constrain vertical layout
});
```

## Visual Properties

### Colors

```view
widget(quad, {
    color: "#FF0000";         // Hex color
    color: 1;                 // White (0-1 scale)
    color: [1, 0, 0];         // RGB
    color: [1, 0, 0, 0.5];    // RGBA
    color: $ui.color1;        // Variable reference
});
```

### Opacity

```view
widget(container_x, {
    alpha: 1.0;               // Fully opaque
    alpha: 0.5;               // Semi-transparent
    alpha: 0.0;               // Fully transparent
    alpha: iir($condition, 4); // Animated opacity
});
```

### Effects

```view
widget(container_x, {
    blur: 5;                  // Blur amount
    saturation: 0.5;          // Color saturation (0-1)
    additive: true;           // Additive blending
    fhpSpill: true;           // Allow content overflow
});
```

## Interaction Properties

### Focus and Input

```view
widget(container_x, {
    focusable: true;          // Can receive focus
    clickable: true;          // Can be clicked
    navFocusable: true;       // Keyboard navigation
    focusOnClick: true;       // Focus when clicked
    
    // Focus behavior
    focusable: $ui.pointerVisible;  // Conditional focus
});
```

### Events

```view
widget(container_x, {
    onEvent(activate, {
        navOpen($self.url);
    });
    
    onEvent(itemMenu, {
        eventWithProp(defaultInfo, $self);
    });
    
    onEvent(back, {
        $clone.osdpage = 0;
    }, $clone.osdpage);  // Conditional event
});
```

## Text Properties

### Text Content

```view
widget(label, {
    caption: "Text content";
    caption: $self.title;     // Variable binding
    caption: fmt("Count: %d", $count);  // Formatted text
});
```

### Text Styling

```view
widget(label, {
    size: 1.5em;              // Font size
    weight: bold;             // Font weight
    italic: true;             // Italic text
    color: "#FFFFFF";         // Text color
    shadow: true;             // Text shadow
    outline: true;            // Text outline
    align: center;            // Text alignment
    maxlines: 2;              // Maximum lines
    ellipsize: true;          // Add ellipsis
});
```

## Image Properties

### Image Source

```view
widget(image, {
    source: "skin://icons/icon.png";
    source: $self.icon;
    source: select($condition, "icon1.png", "icon2.png");
});
```

### Image Sizing

```view
widget(image, {
    width: 10em;
    height: 10em;
    aspectRatio: 1.0;         // Maintain aspect ratio
    keepAspect: true;         // Preserve original aspect
    
    // Scaling modes
    scaling: fit;             // fit, fill, stretch
});
```

## Animation Properties

### Transitions

```view
widget(loader, {
    time: 0.3;                // Transition duration (seconds)
    effect: blend;            // blend, fade, slide
    noInitialTransform: true; // Skip initial animation
});
```

### Interpolation

```view
widget(container_x, {
    alpha: iir($value, 4);    // Smooth interpolation
    // iir(value, speed, absolute)
    // speed: higher = faster
    // absolute: true for absolute values
});
```

## List and Grid Properties

### List Configuration

```view
widget(list_y, {
    id: "mylist";
    spacing: 0.5em;
    navWrap: true;            // Wrap navigation
    scrollThreshold: 0.5;     // Scroll trigger point
    
    // Cloner for dynamic content
    cloner($self.items, container_y, {
        // Item template
    });
});
```

### Grid Configuration

```view
widget(grid, {
    columns: 4;               // Number of columns
    spacing: 1em;             // Space between items
    scrollThreshold: 0.5;
});
```

## Conditional Properties

### Visibility

```view
widget(container_x, {
    hidden: false;            // Visible
    hidden: true;             // Hidden
    hidden: !$condition;      // Conditional visibility
    hidden: iir($value, 8) < 0.01;  // Animated visibility
});
```

### Conditional Rendering

```view
widget(loader, {
    autohide: true;           // Auto-hide when source is empty
    source: select($condition, "file1.view", "");
    source: translate($type, "",
                      "video", "video.view",
                      "audio", "audio.view");
});
```

## Advanced Properties

### Z-Order

```view
widget(container_z, {
    // Children stacked by order
    // Later children appear on top
});
```

### Clipping

```view
widget(container_x, {
    clipping: true;           // Clip children to bounds
    clipOffsetTop: 1em;       // Clip offset
    clipOffsetBottom: 1em;
});
```

### Transformation

```view
widget(displacement, {
    scaling: [1.2, 1.2, 1];   // Scale factors [x, y, z]
    translation: [10, 20, 0]; // Position offset
    rotation: 45;             // Rotation angle
});
```

## Style Properties

### Style Application

```view
// Define style
style(MyStyle, {
    color: "#FF0000";
    size: 1.5em;
});

// Apply style
widget(label, {
    style: "MyStyle";
});
```

## Binding Properties

### Property Binding

```view
widget(slider_y, {
    bind("mylist");           // Bind to list for scrollbar
    focusable: canScroll();   // Conditional based on binding
    alpha: iir(canScroll(), 16);
});
```

## Special Properties

### ID Assignment

```view
widget(container_x, {
    id: "mywidget";           // Unique identifier
});

// Reference by ID
focus("mywidget");
```

### Debug Properties

```view
widget(container_x, {
    debug: true;              // Enable debug visualization
    debugColor: "#FF0000";    // Debug color
});
```

## Property Expressions

### Variables

```view
// Global variables
$ui.color1                    // UI variables
$nav.canGoBack               // Navigation state
$core.audio.mastervolume     // System state
$self.title                  // Item data
$clone.variable              // Clone-local variable
$parent.property             // Parent property
```

### Functions

```view
// Conditional
select(condition, trueValue, falseValue)
translate(value, default, key1, val1, key2, val2, ...)

// Animation
iir(value, speed, absolute)
changed(variable, timeout, initial)

// State
isHovered()
isNavFocused()
isFocused()
canScroll()

// Math
clamp(value, min, max)
fmt(format, ...)

// Navigation
getLayer()
```

### Operators

```view
// Arithmetic
alpha: 0.1 * isHovered() + 0.2 * isNavFocused()
width: $ui.width / 2

// Logical
hidden: !$nav.canGoBack
focusable: $ui.pointerVisible || $ui.touch

// Comparison
hidden: $value > 10
alpha: $count == 0 ? 0 : 1
```

## See Also

- [Syntax Reference](syntax-reference.md) - View file syntax
- [Elements Reference](elements-reference.md) - Widget types
- [Expressions](expressions.md) - Expression system
- [Widget Reference](widget-reference.md) - Widget documentation
