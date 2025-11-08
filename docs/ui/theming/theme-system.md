# Theme System Architecture

Complete guide to Movian's theming system architecture.

## Overview

The theme system provides:
- Global configuration
- Macro libraries
- Style definitions
- Color schemes
- Component reuse

## Theme Structure

### Core Files

```
skin/
├── universe.view      # Root entry point
├── theme.view         # Macro definitions
├── background.view    # Background layer
├── loading.view       # Loading screen
├── pages/            # Page templates
├── osd/              # On-screen display
└── popups/           # Modal dialogs
```

## Global Configuration

### Universe.view

```view
// Global UI variables
$ui.sizeOffset = 4;
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);
$ui.showTopIcons = $ui.pointerVisible || $ui.touch;

// Color scheme
$ui.color1 = "#4192ff";
$ui.color2 = "#306cbe";
$ui.color3 = "#c2ddff";

// Event handlers
onEvent(sysinfo, { toggle($ui.sysinfo); });
onEvent(back, { $ui.logwindow = false; }, $ui.logwindow);
```

## Macro System

### Theme.view

```view
#define ListItemBevel() { \
    widget(quad, { \
        color: 0; \
        alpha: 0.3; \
    }); \
}

#define ListItemHighlight() { \
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused(); \
}

#define PageHeader(TITLE) { \
    widget(label, { \
        caption: TITLE; \
        size: 2em; \
    }); \
}
```

## Style System

### Style Definitions

```view
style(PageContainer, {
    alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;
});

style(NavSelectedText, {
    color: select(isNavFocused(), 1, 0.8);
});
```

### Style Application

```view
widget(label, {
    style: "NavSelectedText";
    caption: "Text";
});
```

## Component Loading

### Dynamic Loading

```view
widget(loader, {
    autohide: true;
    source: select($condition, "component.view", "");
});

widget(loader, {
    source: translate($type,
                      "video", "video.view",
                      "audio", "audio.view");
});
```

## System Integration

### Navigation

```view
$nav.pages                    // Page stack
$nav.currentpage             // Current page
$nav.canGoBack              // Back button state
```

### Media

```view
$core.media.current.type     // Media type
$core.audio.mastervolume     // Volume level
$core.audio.mastermute       // Mute state
```

### UI State

```view
$ui.pointerVisible           // Mouse visible
$ui.touch                    // Touch interface
$ui.orientation              // landscape/portrait
```

## See Also

- [Skin Architecture](skin-architecture.md)
- [Macro Reference](macro-reference.md)
- [Global Configuration](global-configuration.md)
- [Creating Skins](creating-skins.md)
