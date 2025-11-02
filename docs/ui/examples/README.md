# GLW View File Examples

This directory contains working examples of Movian's GLW (OpenGL Widget) view files.

## Important Note

**Movian view files use JavaScript-like syntax, NOT XML!** 

The GLW system uses a functional approach with `widget()` calls and property objects, similar to JavaScript frameworks like React or Vue.

## Basic Syntax

```javascript
// Correct GLW syntax
widget(container_y, {
    spacing: 1em;
    padding: 2em;
    
    widget(label, {
        caption: "Hello World";
        align: center;
        color: 1.0;
    });
});
```

**NOT** XML syntax:
```xml
<!-- This is WRONG for Movian -->
<widget type="container_y">
    <property name="spacing" value="1em"/>
    <widget type="label">
        <property name="caption" value="Hello World"/>
    </widget>
</widget>
```

## Examples

### [basic-layout.view](basic-layout.view)
Comprehensive example showing:
- Container layouts (vertical and horizontal)
- Text labels with styling
- Images and icons
- Interactive elements with focus states
- Scrollable lists with cloners
- Custom macros for reusable components
- Event handling

### Key Concepts Demonstrated

#### 1. Widget Hierarchy
```javascript
widget(container_y, {
    widget(container_x, {
        widget(label, {
            caption: "Nested widgets";
        });
    });
});
```

#### 2. Property Syntax
```javascript
widget(label, {
    caption: "Text content";        // String property
    sizeScale: 1.5;                // Number property
    color: 1.0;                    // Color (0.0 to 1.0)
    hidden: false;                 // Boolean property
    align: center;                 // Enum/constant
});
```

#### 3. Interactive States
```javascript
widget(container_z, {
    focusable: true;
    
    widget(quad, {
        // Dynamic alpha based on interaction state
        alpha: 0.6 + 0.4 * iir(isNavFocused() + isPressed() + isHovered(), 4, true);
    });
    
    onEvent(activate, navOpen("some:url"));
});
```

#### 4. Data Binding
```javascript
cloner($self.model.nodes, container_z, {
    widget(label, {
        caption: $self.metadata.title;  // Bind to data
    });
});
```

#### 5. Macros and Reusability
```javascript
#define BUTTON(CAPTION, EVENT) {
    widget(container_z, {
        focusable: true;
        widget(label, {
            caption: CAPTION;
        });
        onEvent(activate, EVENT);
    });
}

// Usage
BUTTON("Click Me", navOpen("target:url"));
```

## Widget Types

### Layout Containers
- `container_x` - Horizontal layout
- `container_y` - Vertical layout  
- `container_z` - Layered/stacked layout

### Content Widgets
- `label` - Text display
- `image` - Image display
- `quad` - Colored rectangle
- `border` - Border/outline

### Interactive Widgets
- `list_x` - Horizontal scrollable list
- `list_y` - Vertical scrollable list
- `slider_x` - Horizontal scrollbar
- `slider_y` - Vertical scrollbar

### Special Widgets
- `cloner` - Repeats widgets for data items
- `loader` - Loads other view files
- `throbber` - Loading spinner

## Common Properties

### Layout Properties
- `width`, `height` - Size constraints
- `padding` - Internal spacing `[top, right, bottom, left]`
- `margin` - External spacing
- `spacing` - Space between child widgets
- `align` - Alignment (left, center, right, top, bottom)

### Visual Properties
- `color` - Color (0.0 to 1.0 or hex "#RRGGBB")
- `alpha` - Transparency (0.0 to 1.0)
- `hidden` - Visibility (true/false)

### Text Properties
- `caption` - Text content
- `sizeScale` - Text size multiplier
- `bold` - Bold text (true/false)
- `maxlines` - Maximum text lines

### Interactive Properties
- `focusable` - Can receive focus (true/false/number)
- `onEvent(event, action)` - Event handlers

## Expressions and Functions

### State Functions
- `isNavFocused()` - Widget has navigation focus
- `isHovered()` - Mouse is over widget
- `isPressed()` - Widget is being pressed
- `canScroll()` - Content can be scrolled

### Utility Functions
- `iir(value, rate, instant)` - Smooth interpolation
- `select(condition, trueValue, falseValue)` - Conditional value
- `navOpen(url)` - Navigate to URL
- `deliverEvent(event)` - Send event

### Data Access
- `$self.metadata.title` - Item title
- `$self.metadata.description` - Item description
- `$self.url` - Item URL
- `$clone.property` - Cloned item property

## File Organization

View files are typically organized as:
```
plugin/
├── views/
│   ├── main.view          # Main layout
│   ├── item.view          # Item template
│   └── common.view        # Shared macros
└── plugin.json
```

## Including Other Files

```javascript
#import "common.view"       // Import macros and definitions
#include "header.view"      // Include content inline
```

## Best Practices

1. **Use Macros**: Create reusable components with `#define`
2. **Consistent Naming**: Use clear, descriptive names
3. **Proper Nesting**: Organize widgets logically
4. **Performance**: Avoid deep nesting and complex expressions
5. **Accessibility**: Ensure proper focus navigation

## Debugging View Files

- Check Movian's log for syntax errors
- Use simple layouts first, then add complexity
- Test focus navigation with keyboard/remote
- Verify data binding with known values

## Related Documentation

- [GLW Architecture](../glw-architecture.md)
- [Widget Reference](../widgets/README.md)
- [Theming Guide](../theming/README.md)
- [Source Analysis](../source-analysis/README.md)