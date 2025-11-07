# Theme Variables and Customization System

## Overview

Movian's theme system uses a combination of global variables, style definitions, and preprocessor macros to create customizable and consistent user interfaces. This document explains how theme variables work, how to define and use them, and best practices for creating flexible, customizable themes.

## Variable System

### Variable Scopes

Movian uses a hierarchical variable system with different scopes:

1. **Global Variables** (`$core.*`): System-provided, read-only
2. **UI Variables** (`$ui.*`): Skin-defined, application-wide
3. **View Variables** (`$view.*`): Page-specific variables
4. **Clone Variables** (`$clone.*`): Instance-specific in cloners
5. **Self Variables** (`$self.*`): Current widget/model properties

### Variable Declaration

Variables are declared using the `$` prefix and assigned with `=` or `:=`:

```c
// Simple assignment
$ui.color1 = "#4192ff";

// Computed assignment
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);

// Binding (reactive)
$ui.orientation := select($ui.aspect > 1, "landscape", "portrait");
```

**Assignment Operators**:
- `=` : Direct assignment (evaluated once)
- `:=` : Binding (reactive, updates when dependencies change)
- `delta()` : Incremental change

## Global UI Variables

### Standard UI Variables

These are commonly defined variables in Movian skins:

#### Display and Layout

```c
// Aspect ratio and orientation
$ui.aspect                    // Screen aspect ratio (width/height)
$ui.width                     // Screen width in pixels
$ui.height                    // Screen height in pixels
$ui.orientation               // "landscape" or "portrait"

// Margins and spacing
$ui.xmargin                   // Horizontal margin
$ui.ymargin                   // Vertical margin (if used)
$ui.sizeOffset                // Size adjustment offset

// Layout dimensions
$ui.universeBottomHeight      // Height of bottom UI elements
$ui.playdeckheight            // Height of media player controls
```

#### Visual State

```c
// Visibility flags
$ui.pointerVisible            // Mouse pointer is visible
$ui.touch                     // Touch interface is active
$ui.showTopIcons              // Show top bar icons
$ui.screensaverActive         // Screensaver is active

// UI state
$ui.logwindow                 // Log window is visible
$ui.sysinfo                   // System info is visible
$ui.mediainfo                 // Media info is visible
$ui.osk.show                  // On-screen keyboard is visible
```

#### Theme Colors

```c
// Primary colors
$ui.color1 = "#4192ff";       // Primary accent color
$ui.color2 = "#306cbe";       // Secondary accent color
$ui.color3 = "#c2ddff";       // Tertiary accent color

// Background
$ui.background = "skin://graphics/background.jpg";
```

#### Fonts

```c
// Font paths
$ui.monofont = "dataroot://res/fonts/UbuntuMono-Regular.ttf";
$ui.condensedfont = $core.fonts.condensed ?? "skin://fonts/OpenSans-CondBold.ttf";
```

**Source Reference**: 
- `movian/glwskins/flat/universe.view:3-6`
- `movian/glwskins/old/universe.view:1-4`

### System-Provided Variables

These variables are provided by Movian core and are read-only:

#### Core System

```c
$core.clock.localtimeofday    // Current time string
$core.glw.views.standard.*    // Standard view definitions
$core.fonts.main              // Default main font
$core.fonts.condensed         // Default condensed font
```

#### Navigation

```c
$nav.currentpage              // Current page object
$nav.pages                    // Page stack
$nav.canGoBack                // Can navigate back
```

#### Media

```c
$core.media.current.type      // Current media type ("tracks", "radio", etc.)
$core.audio.mastervolume      // Master volume level (dB)
$core.audio.mastermute        // Audio is muted
```

#### Notifications and Popups

```c
$core.notifications.nodes     // Active notifications
$core.popups                  // Active popup dialogs
$core.news                    // News items
```

#### Clipboard

```c
$core.clipboard.copyprogress  // File copy progress
$core.clipboard.pasteToModel  // Paste operation target
```

## Computed Variables

### Reactive Expressions

Variables can be computed from other variables using expressions:

```c
// Conditional based on aspect ratio
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);

// Boolean combination
$ui.showTopIcons = $ui.pointerVisible || $ui.touch;

// Orientation detection
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");
```

### Delta Variables

The `delta()` function creates variables that track changes:

```c
// Disable screensaver when remote controlled
delta($ui.disableScreensaver, $core.stpp.remoteControlled);

// Track height changes
delta($ui.universeBottomHeight, getHeight());
```

### IIR Filtering

The `iir()` function creates smoothly animated transitions:

```c
// Smooth fade based on layer depth
alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;

// Smooth visibility transition
alpha: iir($ui.screensaverActive, 8);

// Smooth focus state
color: 0.5 + iir(isHovered(), 4);
```

**Parameters**: `iir(value, speed, [instant])`
- `value`: Target value
- `speed`: Transition speed (higher = slower)
- `instant`: Optional boolean for instant initial value

## Style System

### Style Definitions

Styles are named sets of properties that can be applied to widgets:

```c
style(StyleName, {
  property: value;
  property: expression;
});
```

### Common Style Patterns

#### List Item Styles

```c
style(ListItemOuter, {
  height: 2em;
});

style(ListItem, {
  margin: [$ui.xmargin, 0, 0.5em, 0];
  spacing: $ui.xmargin;
});

style(ListItemIcon, {
  size: 1.5em;
  width: 3.5em;
  align: center;
  margin: [0, 1, 0, 1];
});

style(ListItemLabel, {
  // color: iir(!isNavFocused(), 4);
});

style(ListItemLabelDimmed, {
  color: 0.7;
});
```

**Source Reference**: `movian/glwskins/flat/styles/style_list.view:3-35`

#### Grid Item Styles

```c
style(GridItem, {
  width: 12em;
  height: 18em;
});

style(GridItemHighlight, {
  alpha: 0.1 * isHovered() + 0.2 * iir(isNavFocused(), 4, true);
});
```

#### Text Styles

```c
style(NavSelectedText, {
  color: select(isNavFocused(), 1, 0.8);
});

style(NavSelectedTextSecondary, {
  color: select(isNavFocused(), 0.9, 0.7);
});
```

**Source Reference**: `movian/glwskins/flat/universe.view:27-35`

#### Container Styles

```c
style(PageContainer, {
  alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;
});

style(sidebarBackdrop, {
  color: 0;
  alpha: 0.3;
});
```

### Applying Styles

Styles are applied using the `style` attribute:

```c
widget(container_x, {
  style: "ListItem";
  // ... other properties
});
```

Multiple styles can be applied by using style inheritance or combining properties.

## Preprocessor Macros

### Macro Definition

Macros are defined using `#define` and can accept parameters:

```c
#define MacroName(PARAM1, PARAM2 = default) {
  // Widget tree or code
}
```

### Common Macro Patterns

#### Visual Effect Macros

```c
#define ListItemBevel() {
  widget(container_y, {
    filterConstraintY: true;
    filterConstraintX: true;
    widget(quad, {
      height: 1;
      alpha: 0.15;
    });
    space(1);
    widget(quad, {
      height: 1;
      color: 0;
      alpha: 0.15;
    });
  });
}

#define GridItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * iir(isNavFocused(), 4, true);
  });
}
```

**Source Reference**: `movian/glwskins/flat/theme.view:2-50`

#### Layout Component Macros

```c
#define PageHeader(TITLE) {
  widget(container_z, {
    height: 3em;
    zoffset: 10;
    widget(quad, {
      color: 0;
      alpha: 0.2;
    });
    widget(label, {
      padding: [3em, 0];
      align: center;
      caption: TITLE;
      size: 1.5em;
    });
    widget(container_x, {
      hidden: !$nav.canGoBack;
      BackButton();
      space(1);
    });
  });
}
```

**Source Reference**: `movian/glwskins/flat/theme.view:96-117`

#### Interactive Element Macros

```c
#define BackButton(ENABLED=true, EVENT=event("back")) {
  widget(container_y, {
    align: center;
    width: 4em;
    clickable: $ui.pointerVisible || ($ui.touch && ENABLED);
    alpha: iir($ui.pointerVisible || ($ui.touch && ENABLED), 4);
    onEvent(activate, EVENT);
    navFocusable: false;
    widget(icon, {
      color: 0.5 + iir(isHovered(), 4);
      size: 2em;
      source: "skin://icons/ic_chevron_left_48px.svg";
    });
  });
}
```

**Source Reference**: `movian/glwskins/flat/theme.view:76-90`

#### Scrollbar Macro

```c
#define ScrollBar(TARGET, TOP_PAD = 0, BOTTOM_PAD = 0) {
  widget(container_x, {
    filterConstraintX: true;
    filterConstraintY: true;
    padding: [0, TOP_PAD, 0, BOTTOM_PAD];
    space(1);
    widget(slider_y, {
      id: "scrollbar";
      bind(TARGET);
      width: 0.6em;
      focusable: canScroll();
      alpha: iir(canScroll(), 16);
      widget(container_x, {
        padding: [0.2em, 0, 0.2em, 0];
        widget(quad, {
          alpha: 0.6 + isHovered();
        });
      });
    });
  });
}
```

**Source Reference**: `movian/glwskins/flat/theme.view:54-74`

### Using Macros

Macros are invoked by name with parameters:

```c
// In a view file
#include "skin://theme.view"

widget(container_z, {
  PageHeader($self.model.metadata.title);
  
  // Content
  
  ScrollBar("main", 3em, 0);
});
```

## Color System

### Color Formats

Colors can be specified in multiple formats:

```c
// Hex color
color: "#4192ff";

// RGB array (0-1 range)
color: [1.0, 0.5, 0.5];

// Grayscale (0-1 range)
color: 0.7;

// Named colors (limited support)
color: "red";
```

### Color Properties

```c
// Widget color
widget(quad, {
  color: $ui.color1;
});

// Text color
widget(label, {
  color: select(isNavFocused(), 1, 0.8);
});

// Icon color
widget(icon, {
  color: 0.5 + iir(isHovered(), 4);
});
```

### Gradient Colors

Some widgets support gradient colors:

```c
widget(bar, {
  color1: $ui.color1;
  color2: $ui.color2;
  fill: $progress;
});
```

### Alpha/Transparency

```c
// Widget alpha
alpha: 0.8;

// Conditional alpha
alpha: iir($ui.visible, 8);

// Computed alpha
alpha: 0.1 * isHovered() + 0.2 * isNavFocused();

// Separate alpha for self vs children
alphaSelf: 0.5;
```

## Font System

### Setting Default Font

```c
setDefaultFont("skin://fonts/RobotoCondensed-Regular.ttf");
```

### Font Properties

```c
widget(label, {
  font: "skin://fonts/RobotoCondensed-Bold.ttf";
  size: 1.5em;
  caption: "Text";
});
```

### Font Variables

```c
// Define font variables
$ui.monofont = "dataroot://res/fonts/UbuntuMono-Regular.ttf";
$ui.condensedfont = $core.fonts.condensed ?? "skin://fonts/OpenSans-CondBold.ttf";

// Use in styles
style(playdeckText, {
  font: "skin://fonts/RobotoCondensed-Regular.ttf";
});
```

## Responsive Design

### Orientation Detection

```c
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");

widget(loader, {
  source: "playdecks/" + $ui.orientation + "/tracks.view";
});
```

### Conditional Layouts

```c
// Different margins for landscape vs portrait
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);

// Show/hide elements based on screen size
hidden: $ui.width < 800;
```

### Device-Specific Variables

```c
// Touch vs pointer interface
$ui.showTopIcons = $ui.pointerVisible || $ui.touch;

// Adjust for TV overscan
widget(underscan, {
  // Content that respects TV safe area
});
```

## Animation and Transitions

### IIR Smoothing

```c
// Smooth fade in/out
alpha: iir($ui.visible, 8);

// Smooth color transition
color: iir(isNavFocused(), 4);

// Smooth size change
expansion: iir($ui.expanded, 6);
```

### Time-Based Animations

```c
// Sine wave animation
color: sinewave(1) * 0.25 + 0.75;

// Rotation
angle: time() * 360;
```

### Transition Effects

```c
widget(loader, {
  time: 0.3;           // Transition duration
  effect: blend;       // Transition effect
  source: $view.path;
});
```

## Theme Customization Patterns

### Color Scheme Customization

```c
// Define color palette
$ui.color1 = "#4192ff";  // Primary
$ui.color2 = "#306cbe";  // Secondary
$ui.color3 = "#c2ddff";  // Accent

// Use throughout skin
widget(bar, {
  color1: $ui.color1;
  color2: $ui.color2;
});

widget(border, {
  color: $ui.color3;
});
```

### Size and Spacing Customization

```c
// Define size variables
$ui.itemHeight = 2em;
$ui.itemSpacing = 0.5em;
$ui.iconSize = 1.5em;

// Use in styles
style(ListItem, {
  height: $ui.itemHeight;
  spacing: $ui.itemSpacing;
});
```

### Font Customization

```c
// Define font variables
$ui.fontRegular = "skin://fonts/MyFont-Regular.ttf";
$ui.fontBold = "skin://fonts/MyFont-Bold.ttf";
$ui.fontLight = "skin://fonts/MyFont-Light.ttf";

// Set default
setDefaultFont($ui.fontRegular);

// Use in specific contexts
style(HeaderText, {
  font: $ui.fontBold;
  size: 1.5em;
});
```

## Best Practices

### Variable Naming

1. **Use Descriptive Names**: `$ui.primaryColor` instead of `$ui.c1`
2. **Follow Conventions**: Use existing prefixes (`$ui.*`, `$view.*`, etc.)
3. **Group Related Variables**: `$ui.color1`, `$ui.color2`, `$ui.color3`
4. **Document Purpose**: Add comments for non-obvious variables

### Performance

1. **Minimize Reactive Bindings**: Use `=` instead of `:=` when possible
2. **Cache Computed Values**: Store expensive calculations in variables
3. **Use IIR Judiciously**: Smooth animations have a performance cost
4. **Avoid Deep Nesting**: Keep expression complexity reasonable

### Maintainability

1. **Centralize Theme Variables**: Define all theme variables in one place
2. **Use Macros for Repetition**: Extract common patterns into macros
3. **Create Style Libraries**: Define reusable styles
4. **Document Customization Points**: Mark which variables are meant to be customized

### Consistency

1. **Use Variables for Colors**: Don't hardcode colors throughout the skin
2. **Standardize Spacing**: Use consistent margin and padding variables
3. **Unify Fonts**: Use font variables instead of direct paths
4. **Apply Styles Consistently**: Use the same styles for similar elements

## Example: Complete Theme Configuration

```c
// universe.view - Theme configuration

// Set default font
setDefaultFont("skin://fonts/RobotoCondensed-Regular.ttf");

// Layout variables
$ui.sizeOffset = 4;
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");

// Visibility variables
$ui.showTopIcons = $ui.pointerVisible || $ui.touch;
$ui.showAllPlaydeckButtons = 0;

// Color scheme
$ui.color1 = "#4192ff";  // Primary blue
$ui.color2 = "#306cbe";  // Darker blue
$ui.color3 = "#c2ddff";  // Light blue

// Screensaver control
delta($ui.disableScreensaver, $core.stpp.remoteControlled);

// Style definitions
style(PageContainer, {
  alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;
});

style(NavSelectedText, {
  color: select(isNavFocused(), 1, 0.8);
});

style(NavSelectedTextSecondary, {
  color: select(isNavFocused(), 0.9, 0.7);
});
```

**Source Reference**: `movian/glwskins/flat/universe.view:1-37`

## Conclusion

Movian's theme variable and customization system provides powerful tools for creating flexible, maintainable, and visually consistent user interfaces. By understanding variables, styles, and macros, you can create themes that are both beautiful and easy to customize.

**Key Takeaways**:
- Variables enable dynamic, reactive UI behavior
- Styles provide consistent appearance across components
- Macros reduce code duplication and improve maintainability
- IIR filtering creates smooth animations and transitions
- Proper organization and naming improve theme maintainability
- Responsive design patterns adapt to different devices and orientations

**Next Steps**:
- Explore [Skin Structure and Organization](skin-structure.md)
- Learn about [Creating Custom Skins](creating-skins.md)
- Study [View File Syntax Reference](../view-files/syntax-reference.md)
- Review [Widget Reference](../widgets/container.md)
