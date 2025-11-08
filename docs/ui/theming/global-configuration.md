# Global Configuration Architecture (universe.view)

## Overview

The `universe.view` file serves as the **root configuration and entry point** for Movian's skin system. It establishes the global UI state, defines system-wide variables, configures event handlers, and creates the main application container structure. This file is the foundation upon which all other view files build.

**Location**: `glwskins/flat/universe.view`

**Key Responsibilities**:
- Initialize global UI variables and configuration
- Define the color system and theme palette
- Register system-wide event handlers
- Establish global style definitions
- Create the root widget hierarchy and application structure
- Integrate core system components (navigation, media, popups, notifications)

## Global UI Variables

The `universe.view` file initializes critical UI state variables that are accessible throughout the entire skin system via the `$ui` namespace.

### Layout and Sizing Variables

```view
$ui.sizeOffset = 4;
```
**Purpose**: Global size adjustment offset for UI elements  
**Type**: Integer  
**Usage**: Applied to element sizing calculations throughout the skin  
**Default**: 4

```view
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);
```
**Purpose**: Dynamic horizontal margin based on screen aspect ratio  
**Type**: Dimension (calculated)  
**Logic**: 
- Landscape mode (`aspect > 1`): 1% of screen width
- Portrait mode: Fixed 0.2em
**Usage**: Consistent horizontal spacing in layouts

```view
$ui.showTopIcons = $ui.pointerVisible || $ui.touch;
```
**Purpose**: Control visibility of top navigation icons  
**Type**: Boolean (calculated)  
**Logic**: Show icons when mouse pointer is visible OR touch interface is active  
**Usage**: Adaptive UI for different input methods

```view
$ui.showAllPlaydeckButtons = 0;
```
**Purpose**: Control media player button visibility  
**Type**: Integer (boolean)  
**Default**: 0 (hidden)  
**Usage**: Toggle extended media controls

```view
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");
```
**Purpose**: Determine device orientation for adaptive layouts  
**Type**: String ("landscape" | "portrait")  
**Logic**: Based on screen aspect ratio  
**Usage**: Load orientation-specific view files and layouts

### Screen Management Variables

```view
delta($ui.disableScreensaver, $core.stpp.remoteControlled);
```
**Purpose**: Disable screensaver when device is remotely controlled  
**Type**: Boolean (delta binding)  
**Logic**: Syncs with `$core.stpp.remoteControlled` state  
**Usage**: Prevent screensaver during remote playback sessions

### Dynamic State Variables

The following variables are toggled by event handlers:

- **`$ui.sysinfo`**: System information overlay visibility
- **`$ui.mediainfo`**: Media information overlay visibility
- **`$ui.logwindow`**: Debug log window visibility
- **`$ui.screensaverActive`**: Screensaver active state
- **`$ui.underscan_changes`**: Overscan adjustment UI visibility

### Calculated Layout Variables

```view
delta($ui.universeBottomHeight, getHeight());
```
**Purpose**: Track height of bottom UI area (playdeck, notifications)  
**Type**: Dimension (auto-calculated)  
**Usage**: Layout calculations for overlays and positioning

## Color System

The global color palette is defined with three primary colors that establish the visual theme:

```view
$ui.color1 = "#4192ff";  // Primary blue
$ui.color2 = "#306cbe";  // Darker blue (gradients, shadows)
$ui.color3 = "#c2ddff";  // Light blue (highlights, borders)
```

### Color Usage Patterns

**Primary Color (`$ui.color1`)**:
- Main UI accents and highlights
- Progress bars and sliders (primary fill)
- Active state indicators
- Brand color for key elements

**Secondary Color (`$ui.color2`)**:
- Gradient endpoints with `$ui.color1`
- Darker variants for depth
- Secondary UI elements
- Hover states

**Tertiary Color (`$ui.color3`)**:
- Borders and outlines
- Subtle highlights
- Light accents
- Text highlights

### Color Application Examples

```view
// Progress bar with gradient
widget(bar, {
  color1: $ui.color1;  // Start color
  color2: $ui.color2;  // End color
  fill: ($core.audio.mastervolume + 75) / 87;
});

// Border with tertiary color
widget(border, {
  color: $ui.color3;
  border: 1;
  margin: -1;
});
```

## Event Handler System

Global event handlers respond to system-wide user actions and state changes. These handlers are registered at the root level and remain active throughout the application lifecycle.

### System Information Events

```view
onEvent(sysinfo, {
  toggle($ui.sysinfo);
});
```
**Event**: `sysinfo`  
**Trigger**: User requests system information display (typically via remote control or keyboard shortcut)  
**Action**: Toggle visibility of system information overlay  
**Variable**: `$ui.sysinfo`

```view
onEvent(mediastats, {
  toggle($ui.mediainfo);
});
```
**Event**: `mediastats`  
**Trigger**: User requests media statistics display  
**Action**: Toggle visibility of media information overlay  
**Variable**: `$ui.mediainfo`

### Debug and Development Events

```view
onEvent(logwindow, {
  toggle($ui.logwindow);
});
```
**Event**: `logwindow`  
**Trigger**: User requests debug log window  
**Action**: Toggle visibility of log window overlay  
**Variable**: `$ui.logwindow`

### Conditional Event Handlers

```view
onEvent(back, {
  $ui.logwindow = false;
}, $ui.logwindow);
```
**Event**: `back`  
**Condition**: Only active when `$ui.logwindow` is true  
**Action**: Close log window on back button press  
**Pattern**: Conditional event handler with third parameter as activation condition

### Event Handler Patterns

**Toggle Pattern**:
```view
onEvent(eventName, {
  toggle($ui.variableName);
});
```

**Conditional Handler Pattern**:
```view
onEvent(eventName, {
  // Actions
}, $condition);  // Only active when condition is true
```

**Direct Assignment Pattern**:
```view
onEvent(eventName, {
  $ui.variableName = value;
});
```

## Global Style System

Global styles define reusable visual properties that can be applied to widgets throughout the skin. Styles are defined once and automatically applied based on widget context.

### Page Container Style

```view
style(PageContainer, {
  alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;
});
```
**Style Name**: `PageContainer`  
**Property**: `alpha` (opacity)  
**Logic**: 
- Base opacity: 1.0 (fully opaque)
- Reduction: Up to 0.9 based on layer depth
- Smoothing: `iir()` function with speed 4 for smooth transitions
- Clamping: Layer value clamped between 0 and 1

**Effect**: Pages deeper in the navigation stack become progressively more transparent, creating a depth effect

### Navigation Text Styles

```view
style(NavSelectedText, {
  color: select(isNavFocused(), 1, 0.8);
});
```
**Style Name**: `NavSelectedText`  
**Property**: `color` (text color)  
**Logic**: 
- Focused: Full brightness (1.0)
- Unfocused: Reduced brightness (0.8)
- Detection: `isNavFocused()` function

**Usage**: Primary text in navigation items

```view
style(NavSelectedTextSecondary, {
  color: select(isNavFocused(), 0.9, 0.7);
});
```
**Style Name**: `NavSelectedTextSecondary`  
**Property**: `color` (text color)  
**Logic**: 
- Focused: High brightness (0.9)
- Unfocused: Lower brightness (0.7)

**Usage**: Secondary/subtitle text in navigation items

### Style Application

Styles are automatically applied to widgets based on their type or explicit style assignment:

```view
// Automatic application by widget type
widget(container_y, {
  // PageContainer style applied if widget is a page container
});

// Explicit style application
widget(label, {
  style: NavSelectedText;
  caption: $self.title;
});
```

## Core System Integrations

The `universe.view` file integrates with multiple core Movian systems through variable bindings and component loading.

### Navigation System Integration

```view
cloner($nav.pages, container_z, {
  widget(loader, {
    noInitialTransform: true;
    source: "skin://pages/" + $self.model.type + ".view";
  });
});
```

**Variables**:
- `$nav.pages`: Collection of all navigation pages in the stack
- `$nav.currentpage.model.loading`: Loading state of current page
- `$nav.canGoBack`: Boolean indicating if back navigation is possible

**Pattern**: Dynamic page loading based on page type

### Audio System Integration

```view
// Volume display
widget(bar, {
  fill: ($core.audio.mastervolume + 75) / 87;
  color1: $ui.color1;
  color2: $ui.color2;
});

// Mute indicator
widget(container_x, {
  alpha: iir($core.audio.mastermute, 7);
  widget(label, {
    caption: _("Audio muted");
  });
});
```

**Variables**:
- `$core.audio.mastervolume`: Master volume level in dB (-75 to +12)
- `$core.audio.mastermute`: Boolean mute state

**Features**:
- Real-time volume bar visualization
- Smooth fade-in/out for volume changes
- Mute state indicator with smooth transitions

### Media Playback Integration

```view
widget(loader, {
  autohide: true;
  source: translate($core.media.current.type, "",
    "tracks", "playdecks/" + $ui.orientation + "/tracks.view",
    "radio",  "playdecks/" + $ui.orientation + "/radio.view"
  );
});
```

**Variables**:
- `$core.media.current.type`: Type of currently playing media
- `$core.stpp.remoteControlled`: Remote control state

**Pattern**: Load orientation-specific playdeck based on media type

### Popup System Integration

```view
cloner($core.popups, loader, {
  source: "popups/" + $self.type + ".view";
});
```

**Variables**:
- `$core.popups`: Collection of active popup dialogs

**Pattern**: Dynamic popup loading based on popup type

### Notification System Integration

```view
cloner($core.notifications.nodes, container_z, {
  widget(quad, {
    color: 0;
    alpha: 0.6;
  });
  widget(label, {
    padding: [2em, 0.5em];
    caption: $self.text;
  });
});
```

**Variables**:
- `$core.notifications.nodes`: Collection of active notifications

**Pattern**: Toast-style notifications with semi-transparent background

### Clipboard Operations Integration

```view
cloner($core.clipboard.copyprogress, container_z, {
  // Progress bar UI
  bar({
    fill: $self.completed / $self.total;
  });
  label({
    caption: fmt(_("Copying %d files"), $self.files);
  });
});
```

**Variables**:
- `$core.clipboard.copyprogress`: Active file copy operations
- `$self.files`: Number of files being copied
- `$self.completed`: Completed bytes
- `$self.total`: Total bytes

### On-Screen Keyboard Integration

```view
widget(loader, {
  autohide: true;
  source: select($ui.osk.show, "osk.view", "");
});
```

**Variables**:
- `$ui.osk.show`: Boolean indicating if on-screen keyboard should be visible

**Pattern**: Conditional loading with autohide

### Clock Display Integration

```view
widget(label, {
  alpha: iir(!$ui.showTopIcons && !$ui.hideClock, 4);
  caption: $core.clock.localtimeofday;
});
```

**Variables**:
- `$core.clock.localtimeofday`: Current local time string

**Logic**: Show clock when top icons are hidden and clock is not explicitly hidden

## Root Widget Hierarchy

The `universe.view` establishes a multi-layered widget hierarchy that forms the application structure:

```
container_z (root)
├── loader (background.view)
├── loader (loading.view) - conditional
├── underscan (main content area)
│   ├── container_z
│   │   ├── layer (pages and overlays)
│   │   │   ├── playfield (navigation pages)
│   │   │   │   └── cloner($nav.pages) - dynamic page loading
│   │   │   ├── cloner($core.popups) - popup dialogs
│   │   │   ├── loader (log.view) - conditional
│   │   │   └── loader (osk.view) - conditional
│   │   └── container_y (bottom area)
│   │       ├── loader (playdeck) - media-specific
│   │       ├── cloner($core.notifications) - notifications
│   │       └── cloner($core.clipboard.copyprogress) - copy progress
│   └── container_z (overscan adjustment UI)
├── container_y (audio indicators)
│   ├── container_z (mute indicator)
│   └── container_z (volume bar)
├── underscan (info overlays)
│   ├── loader (mediainfo.view) - conditional
│   └── loader (sysinfo.view) - conditional
└── underscan (clock display)
```

### Layer Architecture

**Z-Order Layers** (bottom to top):
1. **Background Layer**: Static background (`background.view`)
2. **Loading Layer**: Loading indicator (z-offset: -999)
3. **Content Layer**: Main application pages and navigation
4. **Popup Layer**: Modal dialogs and popups
5. **Overlay Layer**: Log window, on-screen keyboard
6. **Bottom UI Layer**: Playdeck, notifications, clipboard progress
7. **Indicator Layer**: Audio mute/volume indicators
8. **Info Layer**: Media info, system info overlays
9. **Clock Layer**: Time display

### Dynamic Loading Patterns

**Conditional Loading**:
```view
widget(loader, {
  autohide: true;
  source: select($condition, "file.view", "");
});
```

**Media-Adaptive Loading**:
```view
widget(loader, {
  source: translate($core.media.current.type, "",
    "tracks", "playdecks/landscape/tracks.view",
    "radio", "playdecks/landscape/radio.view"
  );
});
```

**Animated Loading**:
```view
widget(loader, {
  time: 0.1;
  effect: blend;
  source: select($ui.sysinfo, "sysinfo.view", "");
});
```

## Advanced Patterns and Techniques

### Smooth Transitions with IIR Filter

The `iir()` function (Infinite Impulse Response filter) creates smooth transitions:

```view
alpha: iir($nav.currentpage.model.loading, 8);
```

**Parameters**:
- First: Source value (0 or 1)
- Second: Speed (higher = slower transition)
- Third (optional): Absolute mode

**Effect**: Smooth fade-in/out instead of instant changes

### Conditional Event Handling

```view
onEvent(back, {
  $ui.logwindow = false;
}, $ui.logwindow);
```

**Pattern**: Third parameter acts as activation condition  
**Usage**: Event only fires when condition is true  
**Benefit**: Prevents event conflicts and unwanted behavior

### Dynamic Height Tracking

```view
delta($ui.universeBottomHeight, getHeight());
```

**Pattern**: `delta()` function syncs variable with widget property  
**Usage**: Track dynamic dimensions for layout calculations  
**Benefit**: Responsive layouts that adapt to content

### Expedited Subscriptions

```view
widget(container_y, {
  expediteSubscriptions: true;
  // Content that needs fast updates
});
```

**Purpose**: Optimize data binding performance  
**Usage**: Apply to containers with frequently updating content  
**Benefit**: Reduced latency for real-time updates

## Best Practices

### Variable Naming Conventions

- **`$ui.*`**: User interface state and configuration
- **`$core.*`**: Core system state (read-only from skin)
- **`$nav.*`**: Navigation system state
- **`$self.*`**: Current widget/item context

### Performance Optimization

1. **Use IIR filters** for smooth animations instead of instant changes
2. **Apply `expediteSubscriptions`** to frequently updating containers
3. **Use `autohide`** on conditional loaders to prevent unnecessary rendering
4. **Clamp values** before applying IIR to prevent overflow

### Maintainability

1. **Centralize colors** in global variables for easy theme changes
2. **Use consistent event patterns** throughout the skin
3. **Document complex expressions** with comments
4. **Group related functionality** in logical widget hierarchies

### Accessibility

1. **Provide visual feedback** for all interactive elements
2. **Support multiple input methods** (pointer, touch, keyboard)
3. **Use smooth transitions** to avoid jarring changes
4. **Maintain readable contrast** with color choices

## Integration with Other Components

### Theme System Integration

The `universe.view` works in conjunction with `theme.view`:
- `universe.view`: Global state, structure, system integration
- `theme.view`: Reusable macros, visual components, styling helpers

### Page System Integration

Pages are loaded dynamically based on navigation:
```view
source: "skin://pages/" + $self.model.type + ".view"
```

**Page Types**: `directory`, `video`, `audio`, `settings`, `search`, etc.

### Playdeck System Integration

Media-specific UI loaded based on content type and orientation:
```view
source: "playdecks/" + $ui.orientation + "/" + $mediaType + ".view"
```

## Debugging and Development

### Enabling Debug Overlays

**System Info**: Press designated key to toggle `$ui.sysinfo`  
**Media Stats**: Press designated key to toggle `$ui.mediainfo`  
**Log Window**: Press designated key to toggle `$ui.logwindow`

### Variable Inspection

Add temporary labels to inspect variable values:
```view
widget(label, {
  caption: fmt("Orientation: %s, Aspect: %.2f", $ui.orientation, $ui.aspect);
});
```

### Layout Debugging

Enable overscan adjustment UI:
```view
$ui.underscan_changes = true;  // Shows border adjustment guides
```

## Version Compatibility

**Verified Version**: Movian 4.8+  
**Source File**: `movian/glwskins/flat/universe.view`  
**Last Updated**: 2024-11-06  
**Accuracy Status**: 🟢 Verified from source code

## See Also

- [Macro Reference](macro-reference.md) - Reusable UI macros from theme.view
- [Skin Architecture](skin-architecture.md) - Complete skin structure
- [View File Syntax](../view-files/syntax-reference.md) - View file language reference
- [Expression System](../view-files/expressions.md) - Expression syntax and functions
