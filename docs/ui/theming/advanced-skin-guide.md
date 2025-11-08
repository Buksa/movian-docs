# Advanced Skin Development Guide

## Overview

This guide explains how to create a comprehensive, production-ready skin for Movian with advanced features including custom global configuration, extended macro library, OSD integration, media player UI, popup systems, and notification handling.

The advanced skin example (`docs/ui/theming/examples/advanced-skin/`) demonstrates all these concepts in a complete, working implementation.

## Table of Contents

1. [Extended Global Configuration](#extended-global-configuration)
2. [Extended Macro Library](#extended-macro-library)
3. [OSD Integration](#osd-integration)
4. [Media Player UI](#media-player-ui)
5. [Popup System](#popup-system)
6. [Notification System](#notification-system)
7. [Component Architecture](#component-architecture)
8. [Best Practices](#best-practices)

## Extended Global Configuration

### Color System

A comprehensive color system provides semantic naming for consistent theming:

```view
// Primary colors
$ui.color1 = "#4192ff";  // Primary blue
$ui.color2 = "#306cbe";  // Darker blue
$ui.color3 = "#c2ddff";  // Light blue

// Semantic colors
$ui.colorAccent = "#ff6b35";     // Accent orange
$ui.colorSuccess = "#4caf50";    // Success green
$ui.colorWarning = "#ff9800";    // Warning orange
$ui.colorError = "#f44336";      // Error red
$ui.colorBackground = "#1a1a1a"; // Dark background
$ui.colorSurface = "#2a2a2a";    // Surface color
$ui.colorText = "#ffffff";       // Primary text
$ui.colorTextSecondary = "#b0b0b0"; // Secondary text
```

**Benefits**:
- Consistent color usage across the skin
- Easy theme customization by changing variables
- Semantic naming improves code readability
- Supports light/dark theme switching

### Typography System

Define font sizes for different UI elements:

```view
$ui.fontSizeSmall = 0.8em;
$ui.fontSizeNormal = 1em;
$ui.fontSizeLarge = 1.2em;
$ui.fontSizeXLarge = 1.5em;
$ui.fontSizeXXLarge = 2em;
```

**Usage**:
```view
widget(label, {
  caption: "Title";
  size: $ui.fontSizeXLarge;
});
```

### Spacing System

Consistent spacing creates visual harmony:

```view
$ui.spacingXSmall = 0.25em;
$ui.spacingSmall = 0.5em;
$ui.spacingNormal = 1em;
$ui.spacingLarge = 1.5em;
$ui.spacingXLarge = 2em;
```

**Usage**:
```view
widget(container_y, {
  padding: $ui.spacingLarge;
  spacing: $ui.spacingNormal;
});
```

### Animation Settings

Control animation speeds globally:

```view
$ui.animSpeed = 4;        // Default animation speed
$ui.animSpeedFast = 8;    // Fast animations
$ui.animSpeedSlow = 2;    // Slow animations
```

**Usage**:
```view
alpha: iir($ui.visible, $ui.animSpeed);
```

### UI State Variables

Track global UI state:

```view
$ui.sysinfo = false;      // System info overlay
$ui.mediainfo = false;    // Media info overlay
$ui.logwindow = false;    // Log window
$ui.showSidebar = false;  // Navigation sidebar
$ui.osk.show = false;     // On-screen keyboard
```

## Extended Macro Library

### Visual Effect Macros

#### ListItemBevel()

Creates a subtle 3D bevel effect for list items:

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

#### CardShadow()

Adds a drop shadow effect for card-style containers:

```view
#define CardShadow() {
  widget(quad, {
    color: 0;
    alpha: 0.3;
    margin: [2, 2, -2, -2];
  });
}
```

### Interactive State Macros

#### ButtonHighlight()

Provides visual feedback for button interactions:

```view
#define ButtonHighlight() {
  widget(quad, {
    additive: true;
    alpha: 0.2 * isHovered() + 0.3 * isNavFocused();
    color: $ui.color1;
  });
}
```

**Features**:
- Responds to both mouse hover and keyboard focus
- Uses additive blending for glow effect
- Configurable color

### Navigation Macros

#### SidebarAction()

Creates consistent sidebar navigation items:

```view
#define SidebarAction(CAPTION, ICON, EVENT, HIDDEN=false) {
  widget(container_z, {
    hidden: HIDDEN;
    height: 2.5em;
    ListItemBevel();
    ListItemHighlight();
    focusable: true;
    onEvent(activate, EVENT);
    
    widget(container_x, {
      style: "ListItem";
      spacing: $ui.spacingNormal;
      
      widget(icon, {
        style: "ListItemIcon";
        source: ICON;
      });
      
      widget(label, {
        filterConstraintX: true;
        caption: CAPTION;
        style: "ActionLabel";
      });
    });
  });
}
```

**Parameters**:
- `CAPTION`: Text label
- `ICON`: Icon source path
- `EVENT`: Event to trigger on activation
- `HIDDEN`: Optional visibility control

**Usage**:
```view
SidebarAction(_("Settings"),
              "skin://icons/ic_settings_48px.svg",
              navOpen("settings://"));
```

### UI Control Macros

#### PlaydeckButton()

Creates media control buttons with consistent styling:

```view
#define PlaydeckButton(ICON, CAPTION, EVENT, ENABLED=true, ID=void, HIGHLIGHTED=false) {
  widget(container_y, {
    id: ID;
    width: 4em;
    spacing: $ui.spacingSmall;
    align: center;
    focusable: ENABLED;
    alpha: select(ENABLED, 1, 0.3);
    onEvent(activate, EVENT, ENABLED);
    
    widget(container_z, {
      width: 3em;
      height: 3em;
      
      ButtonHighlight();
      
      widget(quad, {
        color: select(HIGHLIGHTED, $ui.colorAccent, $ui.colorSurface);
        alpha: 0.8;
      });
      
      widget(icon, {
        source: ICON;
        color: select(HIGHLIGHTED, $ui.colorText, $ui.colorTextSecondary);
        size: 2em;
        align: center;
      });
    });
    
    widget(label, {
      caption: CAPTION;
      size: $ui.fontSizeSmall;
      align: center;
      color: $ui.colorTextSecondary;
    });
  });
}
```

**Features**:
- Icon with label
- Enabled/disabled states
- Highlight state for active buttons
- Focus management with optional ID

#### ScrollBar()

Adds a scrollbar indicator to scrollable lists:

```view
#define ScrollBar(TARGET, TOP_PAD=0, BOTTOM_PAD=0) {
  widget(slider_y, {
    bind(TARGET);
    width: 4;
    focusable: canScroll();
    alpha: iir(canScroll(), 16);
    padding: [TOP_PAD, 0, BOTTOM_PAD, 0];
    
    widget(quad, {
      color: $ui.color1;
      alpha: 0.8;
    });
  });
}
```

**Usage**:
```view
widget(list_y, {
  id: "mylist";
  // ... list content
});

ScrollBar("mylist");
```

## OSD Integration

### OSD Architecture

The On-Screen Display (OSD) system provides an overlay interface for media playback controls and settings.

#### Page State Management

Use a single state variable to manage OSD pages:

```view
$clone.osdpage = 0;
```

**Page Numbers**:
- `0`: OSD hidden
- `1`: Main OSD menu
- `2`: Subtitle settings
- `3`: Audio settings
- `4`: Video settings
- `100`: Subtitle track selection
- `101`: Audio track selection

#### OSD Container Structure

```view
widget(displacement, {
  hidden: iir($clone.osdpage > 0, 3) < 0.01;
  width: 22em;
  scaling: [1.2 - iir($clone.osdpage > 0, 3) * 0.2,
            1.2 - iir($clone.osdpage > 0, 3) * 0.2,
            1];
  
  widget(container_z, {
    onEvent(left, {
      $clone.osdpage = 0;
    }, true, false);
    
    widget(quad, {
      color: 0;
      alpha: iir($clone.osdpage > 0, 4) * 0.8;
    });
    
    widget(layer, {
      // OSD pages loaded here
    });
  });
});
```

**Features**:
- Smooth slide-in animation with scaling
- Semi-transparent background dimming
- Left arrow dismisses OSD
- Lazy loading of OSD pages

### OSD Main Menu

The main menu provides navigation to all OSD features:

```view
widget(container_y, {
  width: 22em;
  id: "osd_main";
  
  widget(list_y, {
    id: "sidebar";
    navWrap: true;
    
    SidebarAction(_("Subtitle settings"),
                  "skin://icons/ic_subtitles_48px.svg",
                  {
                    $clone.osdpage = 2;
                    focus("osd_settings_subs");
                  });
    
    SidebarAction(_("Audio settings"),
                  "skin://icons/ic_speaker_48px.svg",
                  {
                    $clone.osdpage = 3;
                    focus("osd_settings_audio");
                  });
    
    // ... more actions
  });
});
```

### Settings Pages

Use a reusable macro for consistent settings pages:

```view
#define OSD_SETTINGS_MENU(NODES, TITLE, ID) {
  widget(container_y, {
    id: ID;
    
    widget(label, {
      style: "osdsettingtitle";
      height: 3em;
      align: center;
      caption: TITLE;
    });
    
    onEvent(back, {
      $clone.osdpage = 1;
      focus("osd_main");
    });
    
    widget(container_x, {
      widget(list_y, {
        navWrap: true;
        id: "list";
        
        cloner(NODES, loader, {
          hidden: !$self.enabled;
          source: "skin://items/list/" + $self.type + ".view";
        });
      });
      
      ScrollBar("list");
    });
  });
}
```

**Usage**:
```view
OSD_SETTINGS_MENU($self.media.subtitle.settings.nodes,
                  _("Subtitle settings"),
                  "osd_settings_subs");
```

### Track Selection Pages

Display audio and subtitle tracks with current track indication:

```view
cloner($self.media.subtitle.sorted, container_z, {
  height: 3em;
  ListItemHighlight();
  ListItemBevel();
  focusable: true;
  onEvent(activate, deliverEvent($parent.control, selectSubtitleTrack($self.url)));
  
  widget(container_x, {
    padding: [$ui.spacingNormal, $ui.spacingLarge];
    spacing: $ui.spacingNormal;
    
    // Current track indicator
    widget(icon, {
      width: 1.5em;
      source: "skin://icons/ic_check_48px.svg";
      alpha: iir($self.url == $parent.media.subtitle.current, 4);
      color: $ui.colorSuccess;
    });
    
    // Track info
    widget(label, {
      caption: $self.title;
      style: "NavSelectedText";
    });
  });
});
```

### Focus Management

Coordinate focus between OSD pages:

```view
SidebarAction(_("Subtitle settings"),
              "skin://icons/ic_subtitles_48px.svg",
              {
                $clone.osdpage = 2;
                focus("osd_settings_subs");  // Move focus to settings page
              });
```

**Back Navigation**:
```view
onEvent(back, {
  $clone.osdpage = 1;
  focus("osd_main");  // Return focus to main menu
});
```

## Media Player UI

### Playdeck Architecture

The playdeck provides media playback controls:

```view
widget(container_y, {
  hidden: iir(!$clone.showPlaydeck, 3) > 0.99;
  alpha: iir($clone.showPlaydeck, 4);
  
  space(1);
  
  widget(loader, {
    autohide: true;
    source: select($clone.showPlaydeck,
                  "skin://playdecks/playdeck_video.view", "");
  });
});
```

### Progress Bar

Seekable progress bar with time display:

```view
widget(container_z, {
  height: 1em;
  focusable: true;
  onEvent(activate, seekToTime($self.media.current.metadata.duration * (getMouseX() / getWidth())));
  
  widget(quad, {
    color: $ui.colorSurface;
    alpha: 0.5;
  });
  
  widget(container_x, {
    widget(quad, {
      color: $ui.color1;
      weight: $self.media.current.currenttime / $self.media.current.metadata.duration;
    });
    space(1 - $self.media.current.currenttime / $self.media.current.metadata.duration);
  });
  
  widget(container_x, {
    padding: [$ui.spacingSmall, $ui.spacingNormal];
    
    widget(label, {
      caption: value2duration($self.media.current.currenttime);
    });
    
    space(1);
    
    widget(label, {
      caption: value2duration($self.media.current.metadata.duration);
    });
  });
});
```

### Control Buttons

Use the `PlaydeckButton` macro for consistent controls:

```view
// Play/Pause
PlaydeckButton(select($self.media.current.playstatus == "play",
                     "skin://icons/ic_pause_48px.svg",
                     "skin://icons/ic_play_arrow_48px.svg"),
               select($self.media.current.playstatus == "play", _("Pause"), _("Play")),
               deliverEvent($self.media.control, "playpause"),
               true,
               "pause-btn");

// Previous
PlaydeckButton("skin://icons/ic_skip_previous_48px.svg",
               _("Previous"),
               deliverEvent($self.media.control, "previousTrack"),
               $self.media.canSkipBackward);

// Next
PlaydeckButton("skin://icons/ic_skip_next_48px.svg",
               _("Next"),
               deliverEvent($self.media.control, "nextTrack"),
               $self.media.canSkipForward);
```

### Metadata Display

Show current media information:

```view
widget(container_y, {
  spacing: $ui.spacingSmall;
  
  widget(label, {
    caption: $self.media.current.metadata.title;
    size: $ui.fontSizeLarge;
    color: $ui.colorText;
    align: center;
  });
  
  widget(label, {
    caption: $self.media.current.metadata.artist;
    size: $ui.fontSizeNormal;
    color: $ui.colorTextSecondary;
    align: center;
    hidden: !$self.media.current.metadata.artist;
  });
});
```

## Popup System

### Popup Architecture

Popups are loaded dynamically based on type:

```view
cloner($core.popups, loader, {
  source: "popups/" + $self.type + ".view";
});
```

### Authentication Dialog

```view
widget(container_z, {
  // Dimmed background
  widget(quad, {
    color: 0;
    alpha: 0.8;
  });
  
  // Dialog container
  widget(container_y, {
    align: center;
    
    widget(container_z, {
      width: 30em;
      
      CardShadow();
      
      widget(quad, {
        color: $ui.colorSurface;
      });
      
      widget(container_y, {
        padding: $ui.spacingXLarge;
        spacing: $ui.spacingLarge;
        
        // Title
        widget(label, {
          caption: _("Authentication Required");
          size: $ui.fontSizeXLarge;
        });
        
        // Username field
        widget(text, {
          bind($self.username);
          focusable: true;
        });
        
        // Password field
        widget(text, {
          bind($self.password);
          password: true;
          focusable: true;
        });
        
        // Buttons
        widget(container_x, {
          // Cancel and OK buttons
        });
      });
    });
  });
});
```

### Message Dialog

```view
widget(container_z, {
  // Icon based on message type
  widget(icon, {
    source: translate($self.type, "skin://icons/ic_info_48px.svg",
                     "error", "skin://icons/ic_error_48px.svg",
                     "warning", "skin://icons/ic_warning_48px.svg");
    color: translate($self.type, $ui.color1,
                    "error", $ui.colorError,
                    "warning", $ui.colorWarning);
  });
  
  // Message text
  widget(label, {
    caption: $self.message;
    wrap: true;
  });
});
```

## Notification System

### Toast Notifications

Display temporary messages:

```view
cloner($core.notifications.nodes, container_z, {
  height: 3em;
  
  widget(quad, {
    color: translate($self.type, $ui.colorBackground,
                    "info", $ui.color1,
                    "warning", $ui.colorWarning,
                    "error", $ui.colorError);
    alpha: 0.9;
  });
  
  widget(container_x, {
    padding: [$ui.spacingNormal, $ui.spacingLarge];
    spacing: $ui.spacingNormal;
    
    widget(icon, {
      width: 2em;
      source: translate($self.type, "skin://icons/ic_info_48px.svg",
                       "warning", "skin://icons/ic_warning_48px.svg",
                       "error", "skin://icons/ic_error_48px.svg");
    });
    
    widget(label, {
      caption: $self.text;
    });
  });
});
```

### Progress Indicators

Show operation progress:

```view
cloner($core.clipboard.copyprogress, container_z, {
  height: 3em;
  
  widget(quad, {
    color: $ui.colorSurface;
    alpha: 0.9;
  });
  
  widget(container_x, {
    widget(bar, {
      color1: $ui.color1;
      color2: $ui.color2;
      fill: $self.progress;
    });
  });
  
  widget(label, {
    caption: fmt(_("Copying: %d%%"), $self.progress * 100);
    align: center;
  });
});
```

## Component Architecture

### Component Loading Patterns

#### Static Loading

Load components that are always present:

```view
widget(loader, {
  source: "background.view";
});
```

#### Conditional Loading

Load components based on state:

```view
widget(loader, {
  autohide: true;
  source: select($ui.showSidebar, "components/sidebar.view", "");
});
```

#### Animated Loading

Add smooth transitions:

```view
widget(loader, {
  time: 0.1;
  effect: blend;
  alpha: iir($ui.showComponent, 4);
  source: "components/mycomponent.view";
});
```

#### Dynamic Loading

Load based on data:

```view
cloner($nav.pages, container_z, {
  widget(loader, {
    source: "skin://pages/" + $self.model.type + ".view";
  });
});
```

### Component Organization

Organize components by function:

```
advanced-skin/
├── pages/           # Page types
├── osd/             # OSD system
├── playdecks/       # Media controls
├── popups/          # Modal dialogs
└── components/      # Reusable components
```

## Best Practices

### Performance

1. **Minimize Nested Containers**: Flatten widget hierarchies
2. **Use filterConstraint**: Prevent unnecessary layout calculations
3. **Optimize Animations**: Use `iir()` for smooth interpolation
4. **Lazy Loading**: Load components only when needed

### Maintainability

1. **Consistent Naming**: Use clear, descriptive names
2. **Macro Reuse**: Extract common patterns
3. **Component Organization**: Group related files
4. **Documentation**: Comment complex logic

### Accessibility

1. **Focus Management**: Ensure proper navigation
2. **Visual Feedback**: Provide clear hover/focus states
3. **Text Contrast**: Maintain readability
4. **Touch Targets**: Make interactive elements large enough

### Code Quality

1. **DRY Principle**: Don't repeat yourself - use macros
2. **Separation of Concerns**: Keep logic separate from presentation
3. **Consistent Styling**: Use global styles and variables
4. **Error Handling**: Handle missing data gracefully

## Conclusion

The advanced skin example demonstrates a complete, production-ready skin with all the features needed for a professional Movian theme. By following these patterns and best practices, you can create sophisticated, maintainable skins that provide an excellent user experience.

For more information, see:
- [Minimal Skin Guide](minimal-skin-guide.md) - Basic skin concepts
- [OSD System Documentation](../../media/osd-system.md) - Detailed OSD reference
- [Macro Reference](macro-reference.md) - Complete macro documentation
