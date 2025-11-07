# UI Examples

This directory contains working GLW view file examples demonstrating various UI patterns and techniques. Each example is a complete, functional view file that can be used as a reference or starting point for your own UI development.

## Available Examples

### 1. Basic Layout (`basic-layout.view`)

Demonstrates fundamental layout concepts and application structure:
- Vertical and horizontal containers
- Header, navigation, content, and footer sections
- List with cloner for dynamic content
- Scrollbar implementation
- Reusable button macros
- Property binding and expressions

**Key Concepts**: Application structure, container hierarchy, basic navigation

### 2. Containers (`containers.view`)

Comprehensive examples of container widgets:
- `container_x` - Horizontal layout
- `container_y` - Vertical layout
- `container_z` - Z-axis layering
- Nested containers for grid layouts
- Container alignment (left, center, right)
- Spacing and padding configuration

**Key Concepts**: Layout containers, nesting, alignment, spacing

### 3. Text and Images (`text-and-images.view`)

Content display widgets and formatting:
- Text labels with various styles (bold, italic, sizes)
- Text alignment (left, center, right)
- Multi-line text with wrapping and ellipsis
- Rich text formatting with HTML-like tags
- Image display with aspect ratio control
- Image tinting and transparency
- Colored rectangles (quads)
- Combined text and image layouts

**Key Concepts**: Content widgets, text formatting, image handling

### 4. Lists and Grids (`lists-and-grids.view`)

Data presentation patterns:
- Vertical scrollable lists (`list_y`)
- Horizontal scrollable lists (`list_x`)
- Dynamic content with cloner
- Grid layouts using nested containers
- Scrollbar indicators
- Focusable list items
- Data binding with `$self`

**Key Concepts**: Lists, grids, cloner, scrolling, data binding

### 5. Interactive Elements (`interactive-elements.view`)

User interaction and event handling:
- Focusable buttons with visual feedback
- Icon buttons
- Toggle buttons with state management
- Interactive list items
- Event types (activate, cancel)
- Disabled and conditional states
- Focus indicators (border, background, scale)
- Hover and press states

**Key Concepts**: Focus, events, interaction states, user feedback

### 6. Animations (`animations.view`)

Transitions and dynamic effects:
- IIR filter for smooth transitions
- Alpha (opacity) animations
- Color transitions
- Scale animations
- Combined animations
- Hover and press effects
- Conditional visibility
- Progress indicators
- Border animations

**Key Concepts**: iir(), transitions, animations, dynamic effects

## Using These Examples

### Viewing Examples

These view files are designed to be loaded in Movian. To use them:

1. Copy the desired `.view` file to your Movian skin or plugin directory
2. Load the view using a `loader` widget or as a page view
3. Ensure any required properties (like `$page.model.items`) are provided

### Learning from Examples

Each example is structured to demonstrate specific concepts:
- **Progressive Complexity**: Examples start simple and build up
- **Comments**: Key sections are commented for clarity
- **Self-Contained**: Each example works independently
- **Real Patterns**: Based on actual Movian UI patterns

### Adapting Examples

Feel free to:
- Copy entire examples as starting points
- Extract specific patterns for your needs
- Combine techniques from multiple examples
- Modify colors, sizes, and behaviors

## Common Patterns

### Focusable Button Pattern

```javascript
widget(container_z, {
    focusable: true;
    
    widget(quad, {
        color: "#FF6600";
        alpha: 0.6 + 0.4 * iir(isNavFocused() + isPressed(), 4, true);
    });
    
    widget(label, {
        caption: "Button Text";
        align: center;
    });
    
    widget(border, {
        border: 0.1em;
        color: "#FFFFFF";
        alpha: 0.8 * isNavFocused();
    });
    
    onEvent(activate, navOpen("target:url"));
});
```

### List Item with Cloner Pattern

```javascript
widget(list_y, {
    spacing: 0.5em;
    
    cloner($page.model.items, container_z, {
        focusable: true;
        
        widget(quad, {
            color: "#444444";
            alpha: 0.6 + 0.4 * iir(isNavFocused(), 4, true);
        });
        
        widget(label, {
            caption: $self.title;
            padding: [0, 1em];
        });
        
        onEvent(activate, navOpen($self.url));
    });
});
```

### Smooth Transition Pattern

```javascript
// Use iir() for smooth transitions
alpha: iir(isNavFocused(), 8, true);  // Smooth fade
color: [
    1.0 - iir(isNavFocused(), 8, true),  // Red fades out
    iir(isNavFocused(), 8, true),        // Green fades in
    0.0
];
```

## Best Practices

### Performance

- Minimize widget count - use simple structures
- Avoid deep nesting when possible
- Use cloner for dynamic content instead of manual widgets
- Cache property references when used multiple times

### Maintainability

- Use consistent naming conventions
- Comment complex expressions
- Extract reusable patterns into macros
- Keep view files focused on single purposes

### User Experience

- Provide clear focus indicators
- Use smooth transitions (iir with value 4-8)
- Ensure adequate contrast for text
- Test navigation flow with keyboard/remote

## Related Documentation

- [Syntax Reference](../view-files/syntax-reference.md) - Complete view file syntax
- [Elements Reference](../view-files/elements-reference.md) - All widget types
- [Attributes Reference](../view-files/attributes-reference.md) - Widget attributes
- [Expressions Guide](../view-files/expressions.md) - Expression system

## Contributing Examples

If you create useful examples, consider contributing them:
1. Ensure the example is self-contained and well-commented
2. Follow the existing structure and naming conventions
3. Test the example in actual Movian
4. Document the key concepts demonstrated

---

**Note**: These examples use the modern GLW view file syntax (JavaScript-like, not XML). All examples are based on source code analysis and tested patterns from existing Movian skins.