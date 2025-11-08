# Macro Inheritance and Customization Guide

## Overview

Movian's macro system provides powerful mechanisms for code reuse and customization. This guide explains how to override default macro behavior, create custom macros for specific use cases, and leverage macro parameterization for maximum flexibility.

## Table of Contents

1. [Understanding Macro Inheritance](#understanding-macro-inheritance)
2. [Overriding Default Macros](#overriding-default-macros)
3. [Creating Custom Macros](#creating-custom-macros)
4. [Macro Parameterization](#macro-parameterization)
5. [Advanced Patterns](#advanced-patterns)
6. [Best Practices](#best-practices)

---

## Understanding Macro Inheritance

### Macro Definition Order

Macros in Movian follow a simple override rule: **the last definition wins**. When you import a file containing macros and then define a macro with the same name, your definition replaces the imported one.

**Import Order Matters**:
```view
// theme.view defines ListItemHighlight()
#import "skin://theme.view"

// Your custom definition overrides the imported one
#define ListItemHighlight() {
  widget(quad, {
    additive: true;
    alpha: 0.3 * isHovered() + 0.5 * isNavFocused();  // Different values
    color: "#ff6b35";  // Custom color
  });
}
```

### Scope and Visibility

Macros are visible in:
- The file where they're defined
- Any file that imports the defining file
- Files imported after the macro definition

**Example Structure**:
```
theme.view          # Defines base macros
├── custom.view     # Imports theme.view, can use and override macros
└── page.view       # Imports custom.view, sees all macros
```

---

## Overriding Default Macros

### Complete Override

Replace the entire macro implementation:

**Original (theme.view)**:
```view
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
```

**Override (your theme.view)**:
```view
#import "skin://theme.view"

// Completely replace with thicker, more visible bevel
#define ListItemBevel() {
  widget(container_y, {
    filterConstraintY: true;
    filterConstraintX: true;
    
    // Thicker light line
    widget(quad, {
      height: 2;
      alpha: 0.25;
    });
    
    space(2);
    
    // Thicker dark line
    widget(quad, {
      height: 2;
      color: 0;
      alpha: 0.25;
    });
  });
}
```

### Partial Override with Wrapper Pattern

Sometimes you want to keep the original macro but add additional functionality. Use a wrapper pattern:

**Original Macro**:
```view
#define ListItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
}
```

**Wrapper Pattern**:
```view
#import "skin://theme.view"

// Save original definition with different name
#define OriginalListItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
}

// Override with enhanced version
#define ListItemHighlight() {
  widget(container_z, {
    // Use original highlight
    OriginalListItemHighlight();
    
    // Add custom border on focus
    widget(container_y, {
      filterConstraintY: true;
      alpha: iir(isNavFocused(), 4);
      
      widget(quad, {
        height: 2;
        color: $ui.color1;
      });
      
      space(1);
      
      widget(quad, {
        height: 2;
        color: $ui.color1;
      });
    });
  });
}
```

### Conditional Override

Override macros based on runtime conditions:

```view
#import "skin://theme.view"

// Different highlight for touch vs pointer devices
#define ListItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    // Stronger highlight for touch devices
    alpha: select($ui.touch,
                  0.2 * isHovered() + 0.4 * isNavFocused(),  // Touch
                  0.1 * isHovered() + 0.2 * isNavFocused()); // Pointer
  });
}
```

---

## Creating Custom Macros

### Simple Custom Macros

Create macros for frequently used patterns:

**Card Component**:
```view
#define Card(CONTENTS) {
  widget(container_z, {
    // Shadow effect
    widget(quad, {
      color: 0;
      alpha: 0.3;
      margin: [2, 2, -2, -2];
    });
    
    // Card background
    widget(quad, {
      color: $ui.colorSurface;
      alpha: 0.95;
    });
    
    // Border
    widget(container_y, {
      filterConstraintY: true;
      widget(quad, {
        height: 1;
        color: $ui.color1;
        alpha: 0.5;
      });
      space(1);
      widget(quad, {
        height: 1;
        color: $ui.color1;
        alpha: 0.5;
      });
    });
    
    // Content
    widget(container_y, {
      padding: [$ui.spacingLarge, $ui.spacingLarge];
      CONTENTS;
    });
  });
}
```

**Usage**:
```view
Card({
  widget(label, {
    caption: "Card Title";
    size: 1.5em;
  });
  
  widget(label, {
    caption: "Card content goes here";
  });
});
```

### Macros with Multiple Parameters

Create flexible macros with multiple configuration options:

**Icon Button Macro**:
```view
#define IconButton(ICON, SIZE=2em, COLOR=$ui.colorText, EVENT=void, ENABLED=true) {
  widget(container_z, {
    width: SIZE * 1.5;
    height: SIZE * 1.5;
    focusable: ENABLED;
    alpha: select(ENABLED, 1, 0.3);
    onEvent(activate, EVENT, ENABLED);
    
    // Highlight on interaction
    widget(quad, {
      additive: true;
      alpha: 0.2 * isHovered() + 0.3 * isNavFocused();
      color: COLOR;
    });
    
    // Icon
    widget(icon, {
      source: ICON;
      size: SIZE;
      color: COLOR;
      align: center;
    });
  });
}
```

**Usage Examples**:
```view
// Simple usage with defaults
IconButton("skin://icons/ic_play_48px.svg");

// Custom size and color
IconButton("skin://icons/ic_pause_48px.svg", 3em, "#ff0000");

// With event handler
IconButton("skin://icons/ic_stop_48px.svg", 2em, $ui.color1, {
  $core.media.current.stop();
});

// Disabled state
IconButton("skin://icons/ic_forward_48px.svg", 2em, $ui.colorText, void, false);
```

### Macros with Conditional Content

Create macros that adapt based on parameters:

**List Item with Optional Icon**:
```view
#define ListItem(CAPTION, ICON=void, EVENT=void, ENABLED=true) {
  widget(container_z, {
    height: 2.5em;
    focusable: ENABLED;
    alpha: select(ENABLED, 1, 0.3);
    onEvent(activate, EVENT, ENABLED);
    
    ListItemBevel();
    ListItemHighlight();
    
    widget(container_x, {
      padding: [$ui.spacingNormal, $ui.spacingLarge];
      spacing: $ui.spacingNormal;
      
      // Icon only shown if provided
      widget(icon, {
        hidden: !ICON;
        width: 2em;
        source: ICON;
        color: select(isNavFocused(), $ui.color1, $ui.colorTextSecondary);
      });
      
      widget(label, {
        filterConstraintX: true;
        caption: CAPTION;
        style: "NavSelectedText";
      });
    });
  });
}
```

**Usage**:
```view
// Without icon
ListItem("Settings", void, navOpen("settings:"));

// With icon
ListItem("Profile", "skin://icons/ic_person_48px.svg", navOpen("profile:"));
```

### Nested Macro Composition

Build complex macros from simpler ones:

**Dialog Macro**:
```view
// Base button macro
#define DialogButton(CAPTION, EVENT, PRIMARY=false) {
  widget(container_z, {
    height: 2.5em;
    width: 8em;
    focusable: true;
    onEvent(activate, EVENT);
    
    widget(quad, {
      color: select(PRIMARY, $ui.colorAccent, $ui.colorSurface);
      alpha: 0.9;
    });
    
    ButtonHighlight();
    
    widget(label, {
      caption: CAPTION;
      align: center;
      color: select(PRIMARY, $ui.colorText, $ui.colorTextSecondary);
    });
  });
}

// Dialog macro using button macro
#define Dialog(TITLE, MESSAGE, OK_EVENT, CANCEL_EVENT=void) {
  widget(container_z, {
    // Dimmed background
    widget(quad, {
      color: 0;
      alpha: 0.7;
    });
    
    // Dialog card
    widget(container_y, {
      width: 30em;
      align: center;
      
      Card({
        // Title
        widget(label, {
          caption: TITLE;
          size: $ui.fontSizeXLarge;
          color: $ui.colorText;
        });
        
        space($ui.spacingLarge);
        
        // Message
        widget(label, {
          caption: MESSAGE;
          size: $ui.fontSizeNormal;
          color: $ui.colorTextSecondary;
          maxlines: 5;
        });
        
        space($ui.spacingXLarge);
        
        // Buttons
        widget(container_x, {
          spacing: $ui.spacingNormal;
          align: right;
          
          // Cancel button (if provided)
          widget(container_y, {
            hidden: !CANCEL_EVENT;
            DialogButton(_("Cancel"), CANCEL_EVENT, false);
          });
          
          // OK button
          DialogButton(_("OK"), OK_EVENT, true);
        });
      });
    });
  });
}
```

**Usage**:
```view
Dialog(
  _("Confirm Delete"),
  _("Are you sure you want to delete this item?"),
  {
    deleteItem();
    $ui.showDialog = false;
  },
  {
    $ui.showDialog = false;
  }
);
```

---

## Macro Parameterization

### Default Parameter Values

Use default values for optional parameters:

```view
#define Button(CAPTION, EVENT=void, ENABLED=true, WIDTH=10em, HEIGHT=2.5em) {
  widget(container_z, {
    width: WIDTH;
    height: HEIGHT;
    focusable: ENABLED;
    onEvent(activate, EVENT, ENABLED);
    
    widget(quad, {
      color: $ui.colorAccent;
      alpha: select(ENABLED, 0.9, 0.3);
    });
    
    widget(label, {
      caption: CAPTION;
      align: center;
    });
  });
}
```

**Usage with Different Parameter Combinations**:
```view
// All defaults
Button("Click Me");

// Custom event
Button("Save", { saveData(); });

// Custom size
Button("Large Button", void, true, 20em, 3em);

// Disabled state
Button("Disabled", void, false);
```

### Expression Parameters

Pass complex expressions as parameters:

```view
#define ConditionalWidget(CONDITION, TRUE_WIDGET, FALSE_WIDGET) {
  widget(container_z, {
    widget(container_y, {
      hidden: !CONDITION;
      TRUE_WIDGET;
    });
    
    widget(container_y, {
      hidden: CONDITION;
      FALSE_WIDGET;
    });
  });
}
```

**Usage**:
```view
ConditionalWidget(
  $core.media.current.canPause,
  {
    // Show pause button
    IconButton("skin://icons/ic_pause_48px.svg", 3em, $ui.color1, {
      $core.media.current.pause();
    });
  },
  {
    // Show play button
    IconButton("skin://icons/ic_play_48px.svg", 3em, $ui.color1, {
      $core.media.current.unpause();
    });
  }
);
```

### Variable Binding Parameters

Pass variable references for two-way binding:

```view
#define Slider(CAPTION, MIN, MAX, STEP, VALUE, UNIT=void) {
  widget(container_z, {
    height: 3em;
    ListItemBevel();
    ListItemHighlight();
    focusable: true;
    
    widget(container_x, {
      padding: [$ui.spacingNormal, $ui.spacingLarge];
      spacing: $ui.spacingNormal;
      
      widget(label, {
        filterConstraintX: true;
        caption: CAPTION;
        style: "NavSelectedText";
      });
      
      widget(container_x, {
        width: 12em;
        spacing: $ui.spacingSmall;
        
        // Decrease button
        widget(label, {
          caption: "-";
          width: 2em;
          align: center;
          focusable: true;
          onEvent(activate, {
            VALUE = clamp(VALUE - STEP, MIN, MAX);
          });
        });
        
        // Progress bar
        widget(bar, {
          color1: $ui.color1;
          color2: $ui.color2;
          fill: (VALUE - MIN) / (MAX - MIN);
        });
        
        // Increase button
        widget(label, {
          caption: "+";
          width: 2em;
          align: center;
          focusable: true;
          onEvent(activate, {
            VALUE = clamp(VALUE + STEP, MIN, MAX);
          });
        });
      });
      
      // Value display
      widget(label, {
        caption: select(UNIT, fmt("%d %s", VALUE, UNIT), fmt("%d", VALUE));
        style: "NavSelectedTextSecondary";
        width: 5em;
        align: right;
      });
    });
  });
}
```

**Usage**:
```view
// Bind to global variable
Slider(_("Volume"), 0, 100, 5, $core.audio.mastervolume, "%");

// Bind to local variable
Slider(_("Brightness"), 0, 255, 10, $ui.brightness);
```

### Macro Parameter Forwarding

Pass parameters through multiple macro layers:

```view
// Base macro
#define BaseListItem(CAPTION, ICON, EVENT, STYLE="NavSelectedText") {
  widget(container_z, {
    height: 2.5em;
    focusable: true;
    onEvent(activate, EVENT);
    
    ListItemBevel();
    ListItemHighlight();
    
    widget(container_x, {
      padding: [$ui.spacingNormal, $ui.spacingLarge];
      spacing: $ui.spacingNormal;
      
      widget(icon, {
        width: 2em;
        source: ICON;
      });
      
      widget(label, {
        filterConstraintX: true;
        caption: CAPTION;
        style: STYLE;
      });
    });
  });
}

// Specialized macro forwarding parameters
#define NavigationItem(CAPTION, ICON, URL) {
  BaseListItem(CAPTION, ICON, navOpen(URL), "NavSelectedText");
}

// Another specialized macro
#define ActionItem(CAPTION, ICON, ACTION) {
  BaseListItem(CAPTION, ICON, ACTION, "ActionLabel");
}
```

**Usage**:
```view
NavigationItem(_("Settings"), "skin://icons/ic_settings_48px.svg", "settings:");
ActionItem(_("Refresh"), "skin://icons/ic_refresh_48px.svg", { refreshData(); });
```

---

## Advanced Patterns

### State-Dependent Macros

Create macros that adapt to application state:

```view
#define MediaButton(ICON_PLAY, ICON_PAUSE, CAPTION) {
  widget(container_y, {
    width: 4em;
    spacing: $ui.spacingSmall;
    align: center;
    focusable: true;
    
    widget(container_z, {
      width: 3em;
      height: 3em;
      
      ButtonHighlight();
      
      // Show different icon based on playback state
      widget(icon, {
        source: select($core.media.current.playstatus == "play",
                       ICON_PAUSE,
                       ICON_PLAY);
        size: 2em;
        align: center;
      });
      
      onEvent(activate, {
        select($core.media.current.playstatus == "play",
               $core.media.current.pause(),
               $core.media.current.unpause());
      });
    });
    
    widget(label, {
      caption: CAPTION;
      size: $ui.fontSizeSmall;
      align: center;
    });
  });
}
```

### Responsive Macros

Create macros that adapt to screen size and orientation:

```view
#define ResponsiveGrid(ITEMS, CAPTION_FIELD) {
  widget(grid, {
    // Adjust columns based on screen width
    columns: select($ui.width > 1920, 6,
                    $ui.width > 1280, 5,
                    $ui.width > 960, 4,
                    $ui.width > 640, 3,
                    2);
    
    spacing: select($ui.width > 1280, 2em, 1em);
    
    cloner(ITEMS, container_z, {
      // Adjust item size based on orientation
      height: select($ui.orientation == "landscape", 15em, 20em);
      
      focusable: true;
      onEvent(activate, navOpen($self.url));
      
      GridItemBevel();
      GridItemHighlight();
      
      widget(container_y, {
        widget(image, {
          source: $self.icon;
          align: center;
        });
        
        widget(label, {
          caption: $self[CAPTION_FIELD];
          align: center;
          size: select($ui.width > 1280,
                       $ui.fontSizeLarge,
                       $ui.fontSizeNormal);
        });
      });
    });
  });
}
```

### Theme-Aware Macros

Create macros that respect theme variables:

```view
#define ThemedCard(CONTENTS, ACCENT=false) {
  widget(container_z, {
    // Shadow
    widget(quad, {
      color: 0;
      alpha: $ui.shadowAlpha ?? 0.3;
      margin: [$ui.shadowOffset ?? 2,
               $ui.shadowOffset ?? 2,
               -($ui.shadowOffset ?? 2),
               -($ui.shadowOffset ?? 2)];
    });
    
    // Background with theme color
    widget(quad, {
      color: select(ACCENT, $ui.colorAccent, $ui.colorSurface);
      alpha: $ui.cardAlpha ?? 0.95;
    });
    
    // Border with theme color
    widget(container_y, {
      filterConstraintY: true;
      widget(quad, {
        height: $ui.borderWidth ?? 1;
        color: select(ACCENT, $ui.colorAccent, $ui.color1);
        alpha: $ui.borderAlpha ?? 0.5;
      });
      space(1);
      widget(quad, {
        height: $ui.borderWidth ?? 1;
        color: select(ACCENT, $ui.colorAccent, $ui.color1);
        alpha: $ui.borderAlpha ?? 0.5;
      });
    });
    
    // Content with theme spacing
    widget(container_y, {
      padding: [$ui.cardPadding ?? $ui.spacingLarge,
                $ui.cardPadding ?? $ui.spacingLarge];
      CONTENTS;
    });
  });
}
```

### Macro Factories

Create macros that generate other macros:

```view
// This pattern is more conceptual - view files don't support
// runtime macro generation, but you can use this pattern
// in your theme.view to create variations

// Define a base pattern
#define CreateButton(PREFIX, COLOR) {
  // In practice, you'd define multiple macros:
  // #define PrimaryButton(...) { ... color: #4192ff; ... }
  // #define SecondaryButton(...) { ... color: #306cbe; ... }
  // #define DangerButton(...) { ... color: #ff0000; ... }
}

// Primary button
#define PrimaryButton(CAPTION, EVENT) {
  widget(container_z, {
    height: 2.5em;
    width: 10em;
    focusable: true;
    onEvent(activate, EVENT);
    
    widget(quad, {
      color: $ui.colorPrimary;
      alpha: 0.9;
    });
    
    ButtonHighlight();
    
    widget(label, {
      caption: CAPTION;
      align: center;
      color: $ui.colorText;
    });
  });
}

// Secondary button (same structure, different color)
#define SecondaryButton(CAPTION, EVENT) {
  widget(container_z, {
    height: 2.5em;
    width: 10em;
    focusable: true;
    onEvent(activate, EVENT);
    
    widget(quad, {
      color: $ui.colorSecondary;
      alpha: 0.9;
    });
    
    ButtonHighlight();
    
    widget(label, {
      caption: CAPTION;
      align: center;
      color: $ui.colorTextSecondary;
    });
  });
}
```

---

## Best Practices

### 1. Naming Conventions

**Use Clear, Descriptive Names**:
```view
// Good
#define NavigationButton(CAPTION, URL) { ... }
#define MediaControlBar() { ... }
#define SettingsListItem(CAPTION, VALUE, EVENT) { ... }

// Avoid
#define Btn(C, U) { ... }
#define MCB() { ... }
#define SLI(C, V, E) { ... }
```

**Use Consistent Prefixes**:
```view
// UI component macros
#define UIButton(...) { ... }
#define UICard(...) { ... }
#define UIDialog(...) { ... }

// Media-specific macros
#define MediaButton(...) { ... }
#define MediaProgress(...) { ... }
#define MediaInfo(...) { ... }

// Layout macros
#define LayoutGrid(...) { ... }
#define LayoutList(...) { ... }
#define LayoutSidebar(...) { ... }
```

### 2. Parameter Organization

**Order Parameters by Importance**:
```view
// Required first, optional last
#define Button(
  CAPTION,              // Required: what to display
  EVENT=void,           // Optional: what to do
  ENABLED=true,         // Optional: state
  WIDTH=10em,           // Optional: styling
  HEIGHT=2.5em          // Optional: styling
) { ... }
```

**Group Related Parameters**:
```view
#define StyledText(
  // Content parameters
  CAPTION,
  ICON=void,
  
  // Style parameters
  SIZE=$ui.fontSizeNormal,
  COLOR=$ui.colorText,
  ALIGN=center,
  
  // Behavior parameters
  FOCUSABLE=false,
  EVENT=void
) { ... }
```

### 3. Documentation

**Document Macro Purpose and Parameters**:
```view
// NavigationButton - Creates a button that navigates to a URL
// Parameters:
//   CAPTION - Button label text
//   ICON - Icon source path (optional)
//   URL - Target URL for navigation
//   ENABLED - Whether button is enabled (default: true)
// Usage:
//   NavigationButton(_("Settings"), "skin://icons/ic_settings_48px.svg", "settings:");
#define NavigationButton(CAPTION, ICON=void, URL, ENABLED=true) {
  widget(container_z, {
    height: 2.5em;
    focusable: ENABLED;
    alpha: select(ENABLED, 1, 0.3);
    onEvent(activate, navOpen(URL), ENABLED);
    
    ListItemBevel();
    ListItemHighlight();
    
    widget(container_x, {
      padding: [$ui.spacingNormal, $ui.spacingLarge];
      spacing: $ui.spacingNormal;
      
      widget(icon, {
        hidden: !ICON;
        width: 2em;
        source: ICON;
      });
      
      widget(label, {
        filterConstraintX: true;
        caption: CAPTION;
        style: "NavSelectedText";
      });
    });
  });
}
```

### 4. Macro Composition

**Build Complex Macros from Simple Ones**:
```view
// Simple building blocks
#define Shadow() {
  widget(quad, {
    color: 0;
    alpha: 0.3;
    margin: [2, 2, -2, -2];
  });
}

#define Border(COLOR=$ui.color1) {
  widget(container_y, {
    filterConstraintY: true;
    widget(quad, {
      height: 1;
      color: COLOR;
      alpha: 0.5;
    });
    space(1);
    widget(quad, {
      height: 1;
      color: COLOR;
      alpha: 0.5;
    });
  });
}

// Compose into complex macro
#define StyledCard(CONTENTS) {
  widget(container_z, {
    Shadow();
    
    widget(quad, {
      color: $ui.colorSurface;
      alpha: 0.95;
    });
    
    Border($ui.color1);
    
    widget(container_y, {
      padding: [$ui.spacingLarge, $ui.spacingLarge];
      CONTENTS;
    });
  });
}
```

### 5. Performance Considerations

**Avoid Excessive Nesting**:
```view
// Less efficient - many nested containers
#define HeavyWidget(CONTENTS) {
  widget(container_z, {
    widget(container_y, {
      widget(container_x, {
        widget(container_z, {
          CONTENTS;
        });
      });
    });
  });
}

// More efficient - minimal nesting
#define LightWidget(CONTENTS) {
  widget(container_z, {
    CONTENTS;
  });
}
```

**Use Conditional Rendering**:
```view
// Efficient - only renders when needed
#define ConditionalIcon(ICON, CONDITION) {
  widget(icon, {
    hidden: !CONDITION;
    source: ICON;
  });
}

// Less efficient - always renders
#define AlwaysIcon(ICON, CONDITION) {
  widget(container_z, {
    widget(icon, {
      hidden: !CONDITION;
      source: ICON;
    });
  });
}
```

### 6. Maintainability

**Keep Macros Focused**:
```view
// Good - single responsibility
#define IconButton(ICON, EVENT) { ... }
#define TextButton(CAPTION, EVENT) { ... }
#define IconTextButton(ICON, CAPTION, EVENT) { ... }

// Avoid - too many responsibilities
#define UniversalButton(
  ICON=void,
  CAPTION=void,
  EVENT=void,
  SHOW_BADGE=false,
  BADGE_COUNT=0,
  SHOW_TOOLTIP=false,
  TOOLTIP_TEXT=void,
  ...  // 20 more parameters
) { ... }
```

**Version Your Macros**:
```view
// Original version
#define Button(CAPTION, EVENT) { ... }

// Enhanced version - keep old one for compatibility
#define ButtonV2(CAPTION, EVENT, ICON=void, ENABLED=true) { ... }

// Or use clear naming
#define SimpleButton(CAPTION, EVENT) { ... }
#define IconButton(CAPTION, ICON, EVENT) { ... }
#define AdvancedButton(CAPTION, ICON, EVENT, ENABLED, STYLE) { ... }
```

### 7. Testing Macros

**Create Test Pages**:
```view
// test_macros.view
#import "skin://theme.view"

widget(container_y, {
  spacing: 1em;
  padding: [2em, 2em];
  
  // Test each macro variation
  widget(label, {
    caption: "Button Tests";
    size: 2em;
  });
  
  PrimaryButton("Primary", { print("Primary clicked"); });
  SecondaryButton("Secondary", { print("Secondary clicked"); });
  PrimaryButton("Disabled", void, false);
  
  space(2em);
  
  widget(label, {
    caption: "List Item Tests";
    size: 2em;
  });
  
  ListItem("Simple Item");
  ListItem("Item with Icon", "skin://icons/ic_star_48px.svg");
  ListItem("Disabled Item", void, void, false);
});
```

---

## Common Pitfalls

### 1. Parameter Name Conflicts

**Problem**:
```view
#define MyMacro(CONTENTS) {
  widget(container_y, {
    // CONTENTS might conflict with nested macro
    OtherMacro(CONTENTS);  // Which CONTENTS?
  });
}
```

**Solution**:
```view
#define MyMacro(OUTER_CONTENTS) {
  widget(container_y, {
    OtherMacro(OUTER_CONTENTS);
  });
}
```

### 2. Missing Default Values

**Problem**:
```view
// Macro requires all parameters
#define Button(CAPTION, WIDTH, HEIGHT, COLOR) { ... }

// Usage is verbose
Button("Click", 10em, 2.5em, $ui.color1);
```

**Solution**:
```view
// Provide sensible defaults
#define Button(CAPTION, WIDTH=10em, HEIGHT=2.5em, COLOR=$ui.color1) { ... }

// Usage is simpler
Button("Click");
Button("Custom", 15em);
```

### 3. Overriding Without Import

**Problem**:
```view
// Forgot to import original
#define ListItemHighlight() {
  // This creates a new macro, doesn't override
  ...
}
```

**Solution**:
```view
// Always import first
#import "skin://theme.view"

// Now this overrides
#define ListItemHighlight() {
  ...
}
```

### 4. Circular Dependencies

**Problem**:
```view
// file1.view
#import "skin://file2.view"
#define Macro1() { Macro2(); }

// file2.view
#import "skin://file1.view"
#define Macro2() { Macro1(); }
```

**Solution**:
```view
// Create a common file
// common.view
#define BaseMacro() { ... }

// file1.view
#import "skin://common.view"
#define Macro1() { BaseMacro(); }

// file2.view
#import "skin://common.view"
#define Macro2() { BaseMacro(); }
```

---

## Summary

Macro inheritance and customization in Movian provides powerful tools for creating maintainable, reusable UI components:

1. **Override macros** by importing and redefining them
2. **Create custom macros** for your specific use cases
3. **Use parameters** with default values for flexibility
4. **Compose macros** from simpler building blocks
5. **Follow best practices** for naming, documentation, and organization
6. **Test thoroughly** to ensure macros work as expected

By mastering these patterns, you can create sophisticated, maintainable skins that are easy to customize and extend