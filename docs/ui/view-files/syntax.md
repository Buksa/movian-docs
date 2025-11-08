# View File Syntax Guide

Comprehensive syntax guide for Movian view files.

## Overview

View files use a declarative syntax for defining UI layouts. This guide covers the complete syntax including widgets, properties, expressions, and preprocessor directives.

## Basic Syntax

### Widget Declaration

```view
widget(type, {
    property: value;
    property: expression;
});
```

### Nested Widgets

```view
widget(container_x, {
    width: 10em;
    
    widget(label, {
        caption: "Hello";
    });
    
    widget(label, {
        caption: "World";
    });
});
```

## Property Syntax

### Simple Values

```view
widget(label, {
    caption: "Text";          // String
    size: 1.5em;              // Number with unit
    alpha: 0.5;               // Decimal
    hidden: false;            // Boolean
    color: "#FF0000";         // Color
});
```

### Arrays

```view
widget(container_x, {
    padding: [1em, 0.5em];              // Two values
    padding: [1em, 0.5em, 0.5em, 1em];  // Four values
    color: [1, 0, 0];                    // RGB
    color: [1, 0, 0, 0.5];               // RGBA
});
```

## Expression Syntax

### Variables

```view
$ui.color1                    // Global UI variable
$nav.canGoBack               // Navigation state
$self.title                  // Current item
$clone.variable              // Clone-local
$parent.property             // Parent property
```

### Functions

```view
select($condition, trueVal, falseVal)
iir($value, 4)
isHovered()
isNavFocused()
fmt("Count: %d", $count)
```

### Operators

```view
// Arithmetic
width: $ui.width / 2
alpha: 0.1 * isHovered()

// Logical
hidden: !$condition
focusable: $a || $b

// Comparison
hidden: $value > 10
```

## Event Handling

```view
widget(container_x, {
    onEvent(activate, {
        navOpen($self.url);
    });
    
    onEvent(back, {
        $clone.page = 0;
    }, $clone.page);  // Conditional
});
```

## Preprocessor

### Import

```view
#import "skin://theme.view"
```

### Macros

```view
#define MY_MACRO(PARAM) { \
    widget(label, { \
        caption: PARAM; \
    }); \
}

MY_MACRO("Hello");
```

## See Also

- [Syntax Reference](syntax-reference.md)
- [Properties Reference](properties-reference.md)
- [Elements Reference](elements-reference.md)
- [Expressions](expressions.md)
