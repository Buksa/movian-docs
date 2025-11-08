# View File Preprocessor

Documentation for preprocessor directives in Movian view files.

## Overview

The view file preprocessor provides:
- File inclusion (`#import`)
- Macro definitions (`#define`)
- Conditional compilation
- Text substitution

## Import Directive

### Basic Import

```view
#import "skin://theme.view"
#import "default.view"
#import "skin://menu/sidebar_include.view"
```

### Import Paths

- `skin://` - Skin-relative path
- Relative paths - Relative to current file
- Absolute paths - From skin root

## Macro Definitions

### Simple Macros

```view
#define MY_COLOR "#4192ff"
#define SPACING 0.5em

widget(quad, {
    color: MY_COLOR;
    padding: [SPACING, SPACING];
});
```

### Parameterized Macros

```view
#define ListItemHighlight() { \
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused(); \
}

#define PageHeader(TITLE) { \
    widget(label, { \
        caption: TITLE; \
        size: 2em; \
    }); \
}

#define BackButton(ENABLED=true, EVENT=event("back")) { \
    widget(container_x, { \
        focusable: ENABLED; \
        onEvent(activate, EVENT); \
    }); \
}
```

### Macro Usage

```view
widget(container_z, {
    ListItemHighlight();
});

PageHeader("My Page");

BackButton(true, navOpen("home:"));
```

## See Also

- [Syntax Reference](syntax-reference.md)
- [Macro Reference](../theming/macro-reference.md)
- [Theme System](../theming/theme-system.md)
