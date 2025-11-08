# Custom Widgets

Guide to creating custom reusable widgets in Movian view files.

## Overview

Custom widgets are reusable UI components defined using macros. They provide:
- Code reuse
- Consistent styling
- Parameterization
- Maintainability

## Creating Custom Widgets

### Simple Widget

```view
#define MyButton(CAPTION) { \
    widget(container_z, { \
        height: 2em; \
        focusable: true; \
        \
        widget(quad, { \
            color: select(isNavFocused(), "#4192ff", "#333333"); \
        }); \
        \
        widget(label, { \
            caption: CAPTION; \
            align: center; \
        }); \
    }); \
}

// Usage
MyButton("Click Me");
```

### Parameterized Widget

```view
#define CustomCard(TITLE, ICON, ACTION, ENABLED=true) { \
    widget(container_z, { \
        width: 15em; \
        height: 10em; \
        focusable: ENABLED; \
        \
        onEvent(activate, ACTION); \
        \
        widget(image, { \
            source: ICON; \
        }); \
        \
        widget(label, { \
            caption: TITLE; \
            valign: bottom; \
        }); \
    }); \
}

// Usage
CustomCard("Settings", "icon.png", navOpen("settings:"), true);
```

## Widget Libraries

### Creating a Library

```view
// widgets.view
#define Button(CAPTION, ACTION) { ... }
#define Card(TITLE, ICON) { ... }
#define List(ITEMS) { ... }
```

### Using Libraries

```view
#import "widgets.view"

Button("Click", navOpen("page:"));
Card("Title", "icon.png");
```

## Best Practices

- Use descriptive names
- Provide default parameters
- Document parameters
- Keep widgets focused
- Test with different inputs

## See Also

- [Macro Reference](../theming/macro-reference.md)
- [Widget Documentation](container.md)
- [Theming Guide](../theming/creating-skins.md)
