# Creating Custom Skins

This comprehensive guide walks you through creating a custom skin for Movian from scratch.

## Overview

A Movian skin is a collection of view files that define the entire user interface. Creating a custom skin allows you to:

- Completely redesign the UI
- Adapt the interface for specific devices
- Create branded experiences
- Optimize for different screen sizes

## Skin Structure

### Basic Skin Directory

```
my-skin/
├── universe.view          # Main entry point
├── theme.view             # Theme configuration
├── pages/                 # Application pages
│   ├── home.view
│   ├── video.view
│   └── settings.view
├── components/            # Reusable components
│   ├── header.view
│   ├── footer.view
│   └── menu.view
├── widgets/               # Custom widgets
│   ├── video-item.view
│   └── list-item.view
└── assets/                # Images and resources
    ├── icons/
    └── backgrounds/
```

### Required Files

Every skin must have:

1. **universe.view** - Main entry point that loads all other components
2. **theme.view** - Theme configuration with colors, fonts, and styles

## Step-by-Step Guide

### Step 1: Create Skin Directory

Create your skin directory in Movian's skins folder:

- **Linux**: `~/.hts/movian/skins/my-skin/`
- **Windows**: `%APPDATA%\Movian\skins\my-skin\`
- **macOS**: `~/Library/Application Support/Movian/skins/my-skin/`

### Step 2: Create universe.view

The universe.view file is the main entry point:

```
#include "theme.view"

// Set default font
setDefaultFont("skin://fonts/RobotoCondensed-Regular.ttf");

// Global UI variables
$ui.sizeOffset = 4;
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);

// Main container
widget(container_z, {

  // Background
  widget(loader, {
    source: "background.view";
  });

  // Main content area
  widget(underscan, {
    widget(container_z, {
      
      // Page content
      widget(playfield, {
        effect: blend;
        noInitialTransform: true;
        
        cloner($nav.pages, container_z, {
          widget(loader, {
            noInitialTransform: true;
            source: "skin://pages/" + $self.model.type + ".view";
          });
        });
      });
      
      // Popups
      cloner($core.popups, loader, {
        source: "popups/" + $self.type + ".view";
      });
    });
  });
});
```

### Step 3: Create theme.view

Define your theme's visual style using macros and styles:

```
// Color Palette
$ui.colorPrimary = "#4192ff";
$ui.colorSecondary = "#306cbe";
$ui.colorAccent = "#c2ddff";
$ui.colorBackground = "#1a1a1a";
$ui.colorText = "#ffffff";
$ui.colorTextDim = "#b3b3b3";

// Typography
$ui.fontSizeSmall = 0.8em;
$ui.fontSizeMedium = 1.0em;
$ui.fontSizeLarge = 1.5em;
$ui.fontSizeXLarge = 2.0em;

// Spacing
$ui.spacingSmall = 0.3em;
$ui.spacingMedium = 0.6em;
$ui.spacingLarge = 1.2em;

// Dimensions
$ui.headerHeight = 3em;
$ui.footerHeight = 2.5em;
$ui.itemHeight = 4em;

// Styles
style(ListItem, {
  height: $ui.itemHeight;
  focusable: true;
  onEvent(activate, navOpen($self.url));
});

style(PageHeader, {
  height: $ui.headerHeight;
  color: 0;
  alpha: 0.2;
});

// Macros
#define ListItemHighlight() {
  widget(quad, {
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
}

#define PageHeader(TITLE) {
  widget(container_z, {
    height: $ui.headerHeight;
    zoffset: 10;
    
    widget(quad, {
      color: 0;
      alpha: 0.2;
    });
    
    widget(label, {
      padding: [3em, 0];
      align: center;
      caption: TITLE;
      size: $ui.fontSizeLarge;
    });
  });
}

#define ScrollBar(TARGET) {
  widget(container_x, {
    filterConstraintX: true;
    filterConstraintY: true;
    space(1);
    
    widget(slider_y, {
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

### Step 4: Create Header Component

Create `components/header.view`:

```
widget(container_x, {
  height: $ui.headerHeight;
  padding: $ui.spacingLarge;
  
  // Logo
  widget(image, {
    source: "assets/logo.png";
    width: 3em;
    height: 3em;
  });
  
  // Title
  widget(label, {
    weight: 1.0;
    caption: $page.metadata.title;
    size: $ui.fontSizeLarge;
    align: left;
  });
  
  // Clock
  widget(label, {
    caption: strftime($core.clock.unixtime, "%H:%M");
    size: $ui.fontSizeMedium;
    color: 0.7;
  });
});
```

### Step 5: Create Page Templates

Create `pages/directory.view`:

```
widget(container_y, {
  padding: $ui.spacingLarge;
  
  // Page header
  PageHeader($page.model.metadata.title);
  
  // Content list
  widget(list_y, {
    weight: 1.0;
    spacing: $ui.spacingSmall;
    
    cloner($page.model.nodes, container_z, {
      focusable: true;
      onEvent(activate, navOpen($self.url));
      
      // Highlight on focus
      ListItemHighlight();
      
      // Item content
      widget(container_x, {
        height: $ui.itemHeight;
        spacing: $ui.spacingMedium;
        padding: $ui.spacingMedium;
        
        // Thumbnail
        widget(image, {
          source: $self.metadata.icon;
          width: 3em;
          height: 3em;
        });
        
        // Text info
        widget(container_y, {
          weight: 1.0;
          
          widget(label, {
            caption: $self.metadata.title;
            size: $ui.fontSizeMedium;
          });
          
          widget(label, {
            caption: $self.metadata.description;
            size: $ui.fontSizeSmall;
            color: 0.7;
          });
        });
      });
    });
  });
  
  // Scrollbar
  ScrollBar($page.model.nodes);
});
```

### Step 6: Create Video Page

Create `pages/video.view`:

```
widget(container_y, {
  
  // Video player
  widget(video, {
    weight: 1.0;
    source: $page.source;
  });
  
  // Playback controls (shown on interaction)
  widget(container_x, {
    height: 4em;
    alpha: iir($ui.pointerVisible, 4);
    padding: $ui.spacingLarge;
    spacing: $ui.spacingMedium;
    
    widget(quad, {
      color: 0;
      alpha: 0.8;
    });
    
    // Play/Pause button
    widget(icon, {
      focusable: true;
      source: select($page.canPause, 
                     "skin://icons/ic_pause_48px.svg",
                     "skin://icons/ic_play_arrow_48px.svg");
      size: 2em;
      onEvent(activate, event("playPause"));
    });
    
    // Progress slider
    widget(slider_x, {
      weight: 1.0;
      focusable: true;
      min: 0;
      max: $page.model.metadata.duration;
      value: $page.model.currenttime;
      
      widget(container_y, {
        padding: [0, 0.5em];
        widget(quad, {
          height: 0.3em;
          alpha: 0.5;
        });
      });
    });
    
    // Time display
    widget(label, {
      caption: value2duration($page.model.currenttime) + " / " + 
               value2duration($page.model.metadata.duration);
      size: $ui.fontSizeSmall;
    });
  });
});
```

## Advanced Features

### Responsive Design

Adapt layout based on screen size:

```xml
<widget type="container_x">
  <!-- Desktop layout -->
  <hidden>${$ui.width &lt; 1280}</hidden>
  <!-- Desktop content -->
</widget>

<widget type="container_y">
  <!-- Mobile layout -->
  <hidden>${$ui.width &gt;= 1280}</hidden>
  <!-- Mobile content -->
</widget>
```

### Theme Variants

Support light and dark themes:

```xml
<!-- In theme.view -->
<define name="colorBackground" value="${$ui.theme == 'dark' ? '0.1, 0.1, 0.1' : '0.9, 0.9, 0.9'}"/>
<define name="colorText" value="${$ui.theme == 'dark' ? '1.0, 1.0, 1.0' : '0.1, 0.1, 0.1'}"/>
```

### Animations

Add smooth transitions:

```xml
<widget type="label">
  <caption>$self.title</caption>
  <alpha>
    <animation>
      <duration>$animationDuration</duration>
      <value>${$self.focused ? 1.0 : 0.7}</value>
    </animation>
  </alpha>
</widget>
```

### Custom Fonts

Use custom fonts:

```xml
<widget type="label">
  <caption>Custom Font Text</caption>
  <font>assets/fonts/custom-font.ttf</font>
  <size>$fontSizeMedium</size>
</widget>
```

## Testing Your Skin

### Enable Your Skin

1. Copy skin to Movian skins directory
2. Restart Movian
3. Go to Settings → Appearance → Skin
4. Select your custom skin

### Debug Mode

Enable debug mode to see layout boundaries:

```xml
<widget type="container_x">
  <debug>true</debug>
  <!-- Content -->
</widget>
```

### Live Reload

Some Movian builds support live reload:

1. Make changes to view files
2. Press Ctrl+R in Movian to reload

## Best Practices

### Organization

- Keep related components together
- Use meaningful file names
- Comment complex layouts
- Separate concerns (structure, style, behavior)

### Performance

- Minimize nested containers
- Optimize image sizes
- Use appropriate widget types
- Avoid excessive animations

### Maintainability

- Use variables for repeated values
- Create reusable macros
- Follow consistent naming conventions
- Document custom components

### Accessibility

- Ensure proper focus order
- Use sufficient color contrast
- Provide text alternatives for icons
- Test with different screen sizes

## Troubleshooting

### Skin Not Appearing

- Check file permissions
- Verify XML syntax
- Ensure universe.view exists
- Check Movian logs

### Layout Issues

- Verify container types
- Check weight values
- Review spacing and padding
- Test on target device

### Performance Problems

- Reduce container nesting
- Optimize images
- Simplify animations
- Profile with debug mode

## Examples

### Minimal Skin

See [Minimal Skin Example](examples/minimal-skin/README.md) for a basic working skin.

### Advanced Skin

See [Advanced Skin Example](examples/advanced-skin/README.md) for a feature-rich skin with animations and responsive design.

## Resources

- [Theme System](theme-system.md)
- [Skin Structure](skin-structure.md)
- [Widget Reference](../widgets/)
- [View Files Guide](../view-files/)
- [Macro Reference](macro-reference.md)

## See Also

- [GLW Architecture](../glw-architecture.md)
- [Theme Variables](theme-variables.md)
- [UI Getting Started](../getting-started.md)
- [View File Syntax](../view-files/syntax.md)
