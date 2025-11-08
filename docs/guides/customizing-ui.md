# Customizing UI

Guide to customizing Movian's user interface through view files and skins.

## Overview

Movian's UI can be customized through:
- View files for layout
- Skins for complete themes
- Macros for reusable components
- Styles for consistent appearance

## Quick Start

### Modify Existing Skin

1. Locate skin directory: `movian/glwskins/flat/`
2. Copy files to custom location
3. Modify view files
4. Load custom skin in Movian

### Create Simple View

```view
widget(container_y, {
    padding: [1em, 1em];
    
    widget(label, {
        caption: "Hello World";
        size: 2em;
        color: "#FFFFFF";
    });
    
    widget(label, {
        caption: "Custom UI";
        size: 1.5em;
        color: "#CCCCCC";
    });
});
```

## Common Customizations

### Change Colors

```view
// In theme.view or universe.view
$ui.color1 = "#FF0000";  // Primary color
$ui.color2 = "#CC0000";  // Secondary color
$ui.color3 = "#FFCCCC";  // Accent color
```

### Modify Layout

```view
// Change spacing
widget(container_x, {
    spacing: 1em;  // Increase spacing
    padding: [2em, 2em];  // Add padding
});
```

### Custom Buttons

```view
#define MyButton(CAPTION, ACTION) { \
    widget(container_z, { \
        height: 3em; \
        focusable: true; \
        onEvent(activate, ACTION); \
        \
        widget(quad, { \
            color: select(isNavFocused(), $ui.color1, "#333333"); \
        }); \
        \
        widget(label, { \
            caption: CAPTION; \
            align: center; \
        }); \
    }); \
}
```

## See Also

- [View File Syntax](../ui/view-files/syntax.md)
- [Creating Skins](../ui/theming/creating-skins.md)
- [Theme System](../ui/theming/theme-system.md)
- [Widget Reference](../ui/widgets/container.md)
