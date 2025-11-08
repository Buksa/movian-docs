# Advanced Skin Example

This is a comprehensive advanced skin for Movian that demonstrates a complete theming system with custom global configuration, extended macro library, OSD integration, popup systems, and media player UI.

## Overview

This advanced skin showcases:

- **Custom global configuration**: Extended `$ui` variables for comprehensive theming
- **Extended macro library**: 15+ reusable macros for complex UI patterns
- **OSD integration**: Complete on-screen display system for media playback
- **Media player UI**: Full playdeck with controls and track selection
- **Popup system**: Authentication, message, and file picker dialogs
- **Notification system**: Toast notifications and progress indicators
- **Advanced animations**: Smooth transitions and interactive effects

## File Structure

```
advanced-skin/
├── README.md                    # This file
├── universe.view                # Main entry point with extended configuration
├── theme.view                   # Extended macro library
├── background.view              # Animated background
├── loading.view                 # Enhanced loading screen
├── pages/
│   ├── home.view                # Home page with grid layout
│   ├── directory.view           # Directory/list page
│   └── video.view               # Video playback page with OSD
├── osd/
│   ├── osd_main.view            # Main OSD menu
│   ├── osd_settings.view        # Settings page macro
│   ├── osd_settings_audio.view  # Audio settings
│   ├── osd_settings_subs.view   # Subtitle settings
│   ├── osd_settings_video.view  # Video settings
│   ├── osd_audio.view           # Audio track selection
│   └── osd_subs.view            # Subtitle track selection
├── playdecks/
│   ├── playdeck_video.view      # Video player controls
│   └── playdeck_audio.view      # Audio player controls
├── popups/
│   ├── auth.view                # Authentication dialog
│   ├── message.view             # Message/alert dialog
│   └── filepicker.view          # File picker dialog
└── components/
    ├── sidebar.view             # Navigation sidebar
    └── notification.view        # Notification toast
```

## Key Features

### 1. Extended Global Configuration

The `universe.view` file includes comprehensive global configuration:

- **UI State Management**: Screen orientation, pointer visibility, touch detection
- **Color System**: Primary, secondary, accent colors with semantic naming
- **Typography**: Font sizes and weights for different UI elements
- **Spacing System**: Consistent margins, padding, and spacing values
- **Animation Settings**: Transition speeds and easing functions
- **System Integrations**: Navigation, audio, media, clipboard, notifications

### 2. Extended Macro Library

The `theme.view` file provides 15+ macros:

**Visual Effect Macros**:
- `ListItemBevel()` - Subtle shadow effects
- `GridItemBevel()` - Grid item shadows
- `CardShadow()` - Card-style shadow effects

**Interactive State Macros**:
- `ListItemHighlight()` - List item hover/focus
- `GridItemHighlight()` - Grid item hover/focus
- `ButtonHighlight()` - Button interaction states

**Navigation Macros**:
- `BackButton()` - Back navigation
- `PageHeader()` - Standardized page header
- `PageHeader0()` - Customizable page header
- `SidebarAction()` - Sidebar navigation items

**UI Control Macros**:
- `ScrollBar()` - Scrollbar indicators
- `SearchBar()` - Search interface
- `PlaydeckButton()` - Media control buttons
- `SettingsItem()` - Settings list items

**Layout Macros**:
- `GridContainer()` - Grid layout wrapper
- `ListContainer()` - List layout wrapper

### 3. OSD System

Complete on-screen display for video playback:

- **Main Menu**: Navigation hub for all OSD features
- **Settings Pages**: Audio, subtitle, and video configuration
- **Track Selection**: Audio and subtitle track choosers
- **Focus Management**: Coordinated navigation between pages
- **Smooth Transitions**: Animated page changes

### 4. Media Player UI

Full-featured playdeck system:

- **Video Controls**: Play/pause, seek, skip, stop
- **Audio Controls**: Volume, mute, audio tracks
- **Subtitle Controls**: Subtitle tracks, settings
- **Progress Bar**: Seekable timeline with time display
- **Metadata Display**: Title, artist, album information
- **Responsive Layout**: Adapts to screen size and orientation

### 5. Popup System

Modal dialogs for user interaction:

- **Authentication**: Login forms with username/password
- **Messages**: Alert and confirmation dialogs
- **File Picker**: File and directory selection
- **Keyboard Overlay**: On-screen keyboard for text input

### 6. Notification System

Toast notifications and progress indicators:

- **Toast Notifications**: Temporary messages with auto-dismiss
- **Progress Indicators**: File operations, downloads
- **System Messages**: Errors, warnings, success messages

## Installation

To use this advanced skin in Movian:

1. Copy the `advanced-skin` directory to your Movian skins directory:
   - **Linux**: `~/.hts/movian/skins/`
   - **Windows**: `%APPDATA%\Movian\skins\`
   - **macOS**: `~/Library/Application Support/Movian/skins/`

2. Restart Movian

3. Go to Settings → User Interface → Skin and select "Advanced Skin"

## Customization Guide

### Changing Colors

Edit the color variables in `universe.view`:

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
```

### Adding Custom Macros

Define new macros in `theme.view`:

```view
#define MyCustomMacro(PARAM1, PARAM2) {
  widget(container_x, {
    // Your macro implementation
  });
}
```

### Creating New Pages

Add new page types in the `pages/` directory:

1. Create `pages/mypage.view`
2. Implement the page layout
3. The page will automatically load when Movian navigates to a page of type "mypage"

### Customizing Animations

Adjust animation speeds in `universe.view`:

```view
$ui.animSpeed = 4;        // Default animation speed
$ui.animSpeedFast = 8;    // Fast animations
$ui.animSpeedSlow = 2;    // Slow animations
```

## Architecture Patterns

### Component Loading

Components are loaded dynamically using the `loader` widget:

```view
widget(loader, {
  source: "components/sidebar.view";
});
```

### Conditional Loading

Load components based on state:

```view
widget(loader, {
  autohide: true;
  source: select($ui.showSidebar, "components/sidebar.view", "");
});
```

### Animated Loading

Add smooth transitions:

```view
widget(loader, {
  time: 0.1;
  effect: blend;
  alpha: iir($ui.showComponent, 4);
  source: "components/mycomponent.view";
});
```

### Data-Driven Components

Use `cloner` for dynamic content:

```view
cloner($nav.pages, container_z, {
  widget(loader, {
    source: "skin://pages/" + $self.model.type + ".view";
  });
});
```

## Best Practices

### Performance

- **Minimize Nested Containers**: Flatten widget hierarchies where possible
- **Use `filterConstraint`**: Prevent unnecessary layout calculations
- **Optimize Animations**: Use `iir()` for smooth interpolation
- **Lazy Loading**: Load components only when needed with `autohide`

### Maintainability

- **Consistent Naming**: Use clear, descriptive names for variables and IDs
- **Macro Reuse**: Extract common patterns into macros
- **Component Organization**: Group related files in directories
- **Documentation**: Comment complex logic and macro parameters

### Accessibility

- **Focus Management**: Ensure proper keyboard/controller navigation
- **Visual Feedback**: Provide clear hover and focus states
- **Text Contrast**: Maintain readable text against backgrounds
- **Touch Targets**: Make interactive elements large enough for touch

## Advanced Topics

### Custom Event Handling

Define custom event handlers:

```view
onEvent(myCustomEvent, {
  // Handle event
  $ui.myState = true;
});
```

### State Management

Use global variables for shared state:

```view
$ui.currentView = "home";
$ui.sidebarOpen = false;
$ui.osdPage = 0;
```

### Expression System

Leverage the expression system for dynamic behavior:

```view
alpha: iir($ui.visible, 4);
color: select(isNavFocused(), $ui.color1, $ui.color3);
hidden: !$nav.canGoBack;
width: clamp($ui.width / 3, 10em, 30em);
```

### Style System

Define global styles:

```view
style(MyCustomStyle, {
  color: $ui.color1;
  alpha: select(isNavFocused(), 1, 0.8);
});
```

## Reference

This advanced skin demonstrates patterns from the official "flat" skin with additional enhancements. For more information:

- **Movian Documentation**: Comprehensive theming guide
- **Official Flat Skin**: `movian/glwskins/flat/` - Reference implementation
- **GLW Source Code**: `movian/src/ui/glw/` - Widget system internals

## Troubleshooting

### Skin Not Loading

- Check file paths are correct
- Ensure `universe.view` is in the root of the skin directory
- Verify all imported files exist

### Components Not Displaying

- Check `source` paths in `loader` widgets
- Verify conditional logic in `select()` and `translate()` expressions
- Use Movian's log window (Ctrl+L) to see errors

### Navigation Issues

- Ensure `focusable: true` on interactive widgets
- Check `navFocusable` settings
- Verify focus IDs are unique and correct

### Performance Problems

- Reduce animation complexity
- Minimize nested containers
- Use `filterConstraint` to optimize layout
- Profile with Movian's performance overlay (Ctrl+P)

## License

This example skin is provided for educational purposes. Feel free to use, modify, and distribute as needed.
