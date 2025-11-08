# Minimal Skin Creation Guide

This guide walks through creating a minimal but functional Movian skin, explaining each component and the essential patterns needed for skin development.

## Overview

A minimal Movian skin requires:

1. **Entry point** (`universe.view`) - Root configuration and layout
2. **Macro definitions** (`theme.view`) - Reusable UI components
3. **Background component** (`background.view`) - Visual backdrop
4. **Loading screen** (`loading.view`) - Loading state indicator
5. **At least one page** (`pages/home.view`) - Content display

## File Structure

```
minimal-skin/
├── universe.view          # Main entry point
├── theme.view             # Macro definitions
├── background.view        # Background component
├── loading.view           # Loading screen
└── pages/
    └── home.view          # Home page
```

## Core Components

### 1. universe.view - The Entry Point

The `universe.view` file is the root of your skin. Movian loads this file first and it sets up the entire UI structure.

#### Key Responsibilities

**Global Configuration:**
```view
// UI sizing and layout
$ui.sizeOffset = 4;
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");

// Color scheme
$ui.color1 = "#4192ff";  // Primary color
$ui.color2 = "#306cbe";  // Secondary color
$ui.color3 = "#c2ddff";  // Accent color
```

**Event Handlers:**
```view
// Global keyboard/remote shortcuts
onEvent(sysinfo, {
  toggle($ui.sysinfo);
});

onEvent(mediastats, {
  toggle($ui.mediainfo);
});
```

**Style Definitions:**
```view
// Define global styles that apply to specific widget types
style(PageContainer, {
  alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;
});

style(NavSelectedText, {
  color: select(isNavFocused(), 1, 0.8);
});
```

**Component Loading:**
```view
// Load background
widget(loader, {
  source: "background.view";
});

// Load loading indicator
widget(loader, {
  hidden: iir($nav.currentpage.model.loading, 8) < 0.001;
  source: "loading.view";
});
```

**Page System:**
```view
// The page system manages navigation between different views
widget(playfield, {
  cloner($nav.pages, container_z, {
    widget(loader, {
      source: "skin://pages/" + $self.model.type + ".view";
    });
  });
});
```

### 2. theme.view - Macro Definitions

The `theme.view` file defines reusable UI macros that ensure consistent styling across your skin.

#### Essential Macros

**ListItemBevel() - Visual Depth**

Creates a subtle 3D effect for list items:

```view
#define ListItemBevel() {
  widget(container_y, {
    filterConstraintY: true;
    filterConstraintX: true;
    
    // Light line on top
    widget(quad, {
      height: 1;
      alpha: 0.15;
    });
    
    space(1);
    
    // Dark line on bottom
    widget(quad, {
      height: 1;
      color: 0;
      alpha: 0.15;
    });
  });
}
```

**Usage:**
```view
widget(container_z, {
  ListItemBevel();
  // Your content here
});
```

**ListItemHighlight() - Interactive Feedback**

Highlights items on hover and focus:

```view
#define ListItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
}
```

**Key Features:**
- `fhpSpill: true` - Allows the highlight to extend beyond parent bounds
- `additive: true` - Uses additive blending for a glow effect
- `isHovered()` - Returns 1 when mouse is over the widget
- `isNavFocused()` - Returns 1 when widget has keyboard/remote focus

**BackButton() - Navigation**

Creates a consistent back button:

```view
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
      source: "dataroot://res/svg/Left.svg";
    });
  });
}
```

**Parameters:**
- `ENABLED` - Whether the button is enabled (default: true)
- `EVENT` - Event to trigger on activation (default: back event)

**PageHeader() - Standardized Headers**

Creates a page header with title and back button:

```view
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

**Usage:**
```view
PageHeader(_("Home"));
```

### 3. background.view - Visual Backdrop

The background component provides the visual backdrop for your skin:

```view
widget(container_z, {
  widget(backdrop, {
    source: $nav.currentpage.model.metadata.background ??
      $nav.currentpage.glw.background ??
      $core.glw.background ??
      "pixmap:gradient:30,30,30:10,10,10";

    zoffset: -1500;
    alpha: iir(1 - $ui.fullwindow, 4);
    maxIntensity: 0.4;
  });
});
```

**Key Features:**
- **Fallback chain**: Uses page background, then global background, then gradient
- **Z-ordering**: `zoffset: -1500` ensures it's behind all content
- **Fade effect**: `alpha: iir(1 - $ui.fullwindow, 4)` fades out in fullscreen
- **Intensity limit**: `maxIntensity: 0.4` prevents overly bright backgrounds

### 4. loading.view - Loading State

The loading screen displays while content is being fetched:

```view
widget(container_y, {
  space(1);
  
  // Animated spinner
  widget(throbber, {
  });

  widget(container_y, {
    weight: 1;
    filterConstraintY: true;
    align: center;

    // Status text
    widget(label, {
      align: center;
      caption: $nav.currentpage.model.loadingStatus;
      bold: true;
    });

    // Bitrate info (if available)
    widget(container_x, {
      spacing: 0.5em;
      hidden: !$nav.currentpage.model.io.bitrateValid;

      widget(label, {
        filterConstraintX: true;
        align: right;
        color: 0.6;
        caption: _("Bitrate:");
      });

      widget(label, {
        filterConstraintX: true;
        caption: fmt(_("%d kb/s"), $nav.currentpage.model.io.bitrate);
      });
    });
  });
});
```

**Components:**
- **Throbber**: Animated loading spinner
- **Status text**: Shows what's being loaded
- **Bitrate display**: Shows network speed (when available)
- **Info nodes**: Additional loading information

### 5. pages/home.view - Content Page

The home page displays available services in a grid:

```view
#import "skin://theme.view"

widget(container_z, {
  widget(layer, {
    widget(clip, {
      widget(container_z, {
        widget(array, {
          id: "main";
          
          clipOffsetTop: 3em;
          scrollThresholdTop: 3em;
          
          margin: [$ui.xmargin, 0em];
          
          // Grid layout
          childTilesX: $ui.aspect > 1 ? 5 : 2;
          childTilesY: 4;

          // Service items
          cloner($core.services.stable, container_z, {
            focusable: true;
            ListItemHighlight();
            onEvent(activate, navOpen($self.url, void, $self));

            widget(container_y, {
              spacing: 0.5em;
              padding: 0.5em;

              widget(displacement, {
                scaling: [1,1,1] - [0.11,0.1,0] * iir(isPressed(), 4, true);
                
                widget(icon, {
                  source: $self.icon ?? "dataroot://res/svg/Settings.svg";
                  saturation: iir(isPressed(), 4, true) * 0.66;
                  size: 3em;
                });
              });

              widget(label, {
                align: center;
                caption: $self.title;
                size: 1.2em;
              });
            });
          });
        });
      });
    });
  });

  widget(container_y, {
    align: top;
    PageHeader(_("Home"));
  });
});
```

**Key Patterns:**

**Grid Layout:**
```view
widget(array, {
  childTilesX: $ui.aspect > 1 ? 5 : 2;  // 5 columns landscape, 2 portrait
  childTilesY: 4;
});
```

**Data Binding:**
```view
cloner($core.services.stable, container_z, {
  // Template for each service
});
```

**Press Effect:**
```view
widget(displacement, {
  scaling: [1,1,1] - [0.11,0.1,0] * iir(isPressed(), 4, true);
  // Content scales down when pressed
});
```

## Essential Patterns

### 1. Smooth Animations with iir()

The `iir()` function creates smooth interpolated animations:

```view
alpha: iir($condition, 4);
```

- **First parameter**: Target value (0 or 1, or any expression)
- **Second parameter**: Speed (higher = slower, 4 is a good default)
- **Third parameter** (optional): Absolute mode (true/false)

**Examples:**
```view
// Fade in/out
alpha: iir($visible, 4);

// Smooth color transition
color: iir(isHovered(), 4);

// Smooth scaling
scaling: [1,1,1] * (1 + 0.1 * iir(isNavFocused(), 4));
```

### 2. Conditional Display

**Using hidden:**
```view
widget(label, {
  hidden: !$condition;
  caption: "Visible when condition is true";
});
```

**Using select:**
```view
widget(label, {
  caption: select($condition, "True text", "False text");
});
```

**Using translate:**
```view
source: translate($type, "default.view",
                  "video", "video.view",
                  "audio", "audio.view");
```

### 3. Layout Containers

**Horizontal layout:**
```view
widget(container_x, {
  spacing: 0.5em;
  // Children arranged left to right
});
```

**Vertical layout:**
```view
widget(container_y, {
  spacing: 0.5em;
  // Children arranged top to bottom
});
```

**Stacked layout:**
```view
widget(container_z, {
  // Children stacked by z-order
});
```

### 4. Focus and Interaction

**Making widgets focusable:**
```view
widget(container_z, {
  focusable: true;
  onEvent(activate, navOpen($self.url));
});
```

**Focus indicators:**
```view
widget(quad, {
  alpha: 0.2 * isNavFocused();
});
```

**Hover effects:**
```view
widget(icon, {
  color: 0.5 + 0.5 * isHovered();
});
```

### 5. Data Binding with Cloner

The `cloner` widget creates instances from data:

```view
cloner($core.services.stable, container_z, {
  // $self refers to each service item
  widget(label, {
    caption: $self.title;
  });
});
```

**Common data sources:**
- `$core.services.stable` - Available services
- `$nav.pages` - Navigation pages
- `$core.notifications.nodes` - Notifications
- `$self.model.nodes` - Page-specific data

## Installation and Testing

### 1. Create Skin Directory

Create your skin in the Movian skins directory:

**Linux:**
```bash
mkdir -p ~/.hts/movian/skins/minimal-skin
```

**Windows:**
```
%APPDATA%\Movian\skins\minimal-skin\
```

**macOS:**
```bash
mkdir -p ~/Library/Application\ Support/Movian/skins/minimal-skin
```

### 2. Copy Files

Copy all the view files to your skin directory:
- `universe.view`
- `theme.view`
- `background.view`
- `loading.view`
- `pages/home.view`

### 3. Activate Skin

1. Start Movian
2. Go to Settings → User Interface → Skin
3. Select "minimal-skin"
4. Restart Movian

### 4. Debugging

**Enable debug logging:**
1. Press `Ctrl+D` (or equivalent) to open debug menu
2. Enable "GLW debug" to see widget tree
3. Check console for error messages

**Common issues:**
- **Syntax errors**: Check for missing braces, semicolons
- **Missing files**: Verify file paths and names
- **Layout issues**: Use `widget(border, {})` to visualize boundaries

## Customization

### Changing Colors

Edit `universe.view`:
```view
$ui.color1 = "#ff4192";  // Pink
$ui.color2 = "#be3068";  // Dark pink
$ui.color3 = "#ffc2dd";  // Light pink
```

### Adding New Macros

Edit `theme.view`:
```view
#define MyCustomButton(CAPTION, ACTION) {
  widget(container_z, {
    focusable: true;
    onEvent(activate, ACTION);
    ListItemHighlight();
    
    widget(label, {
      padding: [1em, 0.5em];
      caption: CAPTION;
    });
  });
}
```

### Creating New Pages

Create `pages/list.view`:
```view
#import "skin://theme.view"

widget(container_z, {
  widget(layer, {
    widget(list_y, {
      cloner($self.model.nodes, container_z, {
        focusable: true;
        ListItemHighlight();
        onEvent(activate, navOpen($self.url));
        
        widget(label, {
          padding: [1em, 0.5em];
          caption: $self.title;
        });
      });
    });
  });
  
  widget(container_y, {
    align: top;
    PageHeader($self.model.metadata.title);
  });
});
```

## Next Steps

To create a complete skin, add:

1. **More page types**: list, grid, video, settings, directory
2. **Navigation menu**: Sidebar or top navigation bar
3. **Media controls**: Playdeck for audio/video playback
4. **OSD system**: On-screen display for video settings
5. **Popup dialogs**: Authentication, messages, file picker
6. **Custom graphics**: Icons, backgrounds, textures
7. **Advanced animations**: Transitions, effects, transformations

## Reference

- **Full example**: See `movian-docs/docs/ui/theming/examples/minimal-skin/`
- **Complete skin**: Study `movian/glwskins/flat/` for advanced patterns
- **Documentation**: Refer to the complete Movian theming guide

## Summary

A minimal Movian skin requires:

1. **universe.view** - Entry point with global configuration
2. **theme.view** - Reusable macro definitions
3. **background.view** - Visual backdrop
4. **loading.view** - Loading state indicator
5. **pages/home.view** - At least one content page

With these components and the essential patterns (macros, animations, data binding, focus handling), you have a solid foundation for creating custom Movian skins.
