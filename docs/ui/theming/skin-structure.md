# Skin Structure and Organization

## Overview

Movian skins define the complete visual appearance and user interface of the application. A skin is a self-contained directory containing view files, assets, and configuration that determines how content is displayed and how users interact with the application.

This document analyzes the structure and organization patterns used in Movian skins, based on examination of the built-in `flat` (modern) and `old` (legacy) skins.

## Skin Directory Structure

### Standard Skin Layout

A typical Movian skin follows this directory structure:

```
skin-name/
├── universe.view          # Main entry point - defines overall UI structure
├── theme.view             # Theme definitions, macros, and reusable components
├── background.view        # Background rendering
├── loading.view           # Loading screen
├── screensaver.view       # Screensaver display
├── log.view              # Debug log window
├── sysinfo.view          # System information overlay
├── osk.view              # On-screen keyboard
├── mediainfo.view        # Media information overlay (optional)
│
├── fonts/                # Font files (.ttf)
├── graphics/             # Image assets (.png, .jpg)
├── icons/                # Icon files (.svg, .png)
│
├── pages/                # Page type implementations
├── items/                # Item renderer components
├── menu/                 # Navigation and menu components
├── popups/               # Popup dialog implementations
├── playdecks/            # Media player controls
├── osd/                  # On-screen display elements
├── styles/               # Style definitions
└── ctxmenu/              # Context menu implementations (optional)
```

## Core Files

### universe.view - Application Entry Point

**Purpose**: The main entry point that defines the overall application structure and layout hierarchy.

**Key Responsibilities**:
- Set default fonts and global UI variables
- Define application-wide event handlers
- Create the main container hierarchy (background, pages, overlays)
- Implement the page navigation system (playfield)
- Handle system overlays (notifications, volume, screensaver)
- Define underscan regions for TV displays

**Example Structure** (from flat skin):
```
universe.view
├── Background layer
├── Loading screen (conditional)
├── Underscan container
│   ├── Page playfield (navigation stack)
│   │   └── Cloner for pages → loads pages/{type}.view
│   ├── Popup cloner → loads popups/{type}.view
│   ├── Log window (conditional)
│   ├── On-screen keyboard (conditional)
│   └── Media playdecks (conditional)
├── System notifications
├── Volume display
└── System info overlays
```

**Key Patterns**:
- Uses `playfield` widget for page navigation with layer-based transitions
- Implements `cloner` widgets to dynamically load pages and popups
- Uses conditional `loader` widgets with `autohide` for optional overlays
- Defines global UI variables (e.g., `$ui.xmargin`, `$ui.color1`)

### theme.view - Theme Definitions and Macros

**Purpose**: Defines reusable UI components, macros, and theme-specific styling patterns.

**Key Responsibilities**:
- Define preprocessor macros for common UI patterns
- Create reusable component templates
- Define theme-specific styling functions
- Establish visual consistency patterns

**Common Macro Types**:

1. **Visual Effects**:
   ```c
   #define ListItemBevel() { ... }
   #define GridItemHighlight() { ... }
   ```

2. **Layout Components**:
   ```c
   #define PageHeader(TITLE) { ... }
   #define ScrollBar(TARGET, TOP_PAD, BOTTOM_PAD) { ... }
   ```

3. **Interactive Elements**:
   ```c
   #define BackButton(ENABLED, EVENT) { ... }
   #define SearchBar(URLPREFIX, TEXT, ICON) { ... }
   ```

**Source Reference**: `movian/glwskins/flat/theme.view`

### background.view - Background Rendering

**Purpose**: Defines the application background, which can be static, dynamic, or content-aware.

**Common Patterns**:
- Static image backgrounds
- Blurred content-based backgrounds
- Animated or gradient backgrounds
- Conditional backgrounds based on content type

### loading.view - Loading Screen

**Purpose**: Displayed while content is loading, providing visual feedback to users.

**Typical Elements**:
- Loading spinner or animation
- Loading message or progress indicator
- Branded elements (logo, colors)

## Directory Organization

### pages/ - Page Type Implementations

**Purpose**: Contains view files for different page types that display content.

**Organization Pattern**: One file per page type, named after the content type.

**Common Page Types**:

| File | Purpose | Content Type |
|------|---------|--------------|
| `home.view` | Home screen / dashboard | Application entry |
| `directory.view` | Generic directory/folder listing | File browsing |
| `list.view` | Generic list view | Various content |
| `grid.view` | Grid layout for thumbnails | Images, movies |
| `settings.view` | Settings and configuration | System settings |
| `video.view` | Video playback page | Video player |
| `album.view` | Music album display | Audio content |
| `image.view` | Image viewer | Single image |
| `openerror.view` | Error display | Error states |
| `playqueue.view` | Media queue management | Playlist |

**Page Structure Pattern**:
```
page-type.view
├── Event handlers (itemMenu, back, cancel)
├── View selection logic (multiopt)
├── Main container
│   ├── Header (title, navigation)
│   ├── Content area (list/grid/custom)
│   └── Optional overlays (menus, info)
└── Item menu loaders (conditional)
```

**Source Reference**: 
- `movian/glwskins/flat/pages/`
- `movian/glwskins/old/pages/`

### items/ - Item Renderer Components

**Purpose**: Reusable components for rendering individual items in lists and grids.

**Organization Pattern** (flat skin):
```
items/
├── list/          # List item renderers
├── rect/          # Rectangular/card item renderers
└── details/       # Detailed item views
```

**Organization Pattern** (old skin):
```
pages/
├── listitems/     # List item renderers
├── biglistitems/  # Large list items
├── smallitems/    # Compact items
├── squareitems/   # Square grid items
└── iteminfo/      # Item detail views
```

**Item Renderer Responsibilities**:
- Display item metadata (title, description, rating)
- Show thumbnails or icons
- Handle focus and selection states
- Provide visual feedback for interactions
- Support different item types (video, audio, directory, etc.)

### menu/ - Navigation and Menu Components

**Purpose**: Navigation bars, sidebars, and menu systems.

**Common Components**:

| File | Purpose |
|------|---------|
| `navbar.view` | Navigation bar (usually left side) |
| `sidebar.view` | Sidebar menu (usually right side) |
| `sidebar_common.view` | Shared sidebar components |
| `sidebar_include.view` | Sidebar content includes |

**Menu Patterns**:
- Expandable/collapsible navigation
- Focus management and keyboard navigation
- Dynamic menu item generation
- Context-sensitive menu options

**Source Reference**: `movian/glwskins/flat/menu/`

### popups/ - Popup Dialog Implementations

**Purpose**: Modal dialogs and popup windows for user interaction.

**Common Popup Types**:

| File | Purpose |
|------|---------|
| `message.view` | Simple message dialogs |
| `auth.view` | Authentication prompts |
| `textDialog.view` | Text input dialogs |
| `filepicker.view` | File selection dialogs |
| `resume.view` | Resume playback prompts |
| `common.view` | Shared popup components |

**Popup Structure Pattern**:
- Semi-transparent backdrop
- Centered dialog container
- Title and message area
- Action buttons (OK, Cancel, etc.)
- Focus trapping within dialog

**Source Reference**: `movian/glwskins/flat/popups/`

### playdecks/ - Media Player Controls

**Purpose**: Media playback controls and information display.

**Organization Pattern**:
```
playdecks/
├── landscape/     # Horizontal layout controls
│   ├── tracks.view
│   └── radio.view
└── portrait/      # Vertical layout controls (optional)
```

**Playdeck Responsibilities**:
- Display current media information
- Show playback controls (play, pause, skip)
- Display progress bar and time
- Show audio/subtitle track selection
- Provide volume controls

**Adaptive Design**: Playdecks often have separate layouts for landscape and portrait orientations.

### styles/ - Style Definitions

**Purpose**: Centralized style definitions for consistent appearance.

**Organization Pattern** (flat skin):
```
styles/
├── style_list.view      # List view styles
├── style_grid.view      # Grid view styles
└── style_sidebar.view   # Sidebar styles
```

**Style Definition Pattern**:
```c
style(StyleName, {
  property: value;
  property: expression;
});
```

**Common Style Categories**:
- List item styles (height, spacing, colors)
- Grid item styles (size, padding, borders)
- Text styles (fonts, sizes, colors)
- Interactive element styles (focus, hover states)

**Source Reference**: `movian/glwskins/flat/styles/`

### osd/ - On-Screen Display Elements

**Purpose**: Temporary overlays that appear during playback or interaction.

**Common OSD Elements**:
- Volume indicators
- Playback status
- Subtitle display
- Buffering indicators
- Quick settings overlays

### ctxmenu/ - Context Menu Implementations

**Purpose**: Right-click or long-press context menus (legacy pattern).

**Note**: The `flat` skin uses a different approach with integrated item menus, while the `old` skin has a dedicated `cmdmenu/` directory for command menus.

## Asset Organization

### fonts/ - Font Files

**Purpose**: Typography assets for the skin.

**Common Pattern**:
- Include multiple weights (Regular, Bold, Light)
- Use TrueType (.ttf) or OpenType (.otf) formats
- Organize by font family

**Example** (flat skin):
```
fonts/
├── RobotoCondensed-Regular.ttf
├── RobotoCondensed-Bold.ttf
└── RobotoCondensed-Light.ttf
```

**Usage**:
```c
setDefaultFont("skin://fonts/RobotoCondensed-Regular.ttf");
```

### graphics/ - Image Assets

**Purpose**: Bitmap graphics used in the skin.

**Common Asset Types**:
- Background images
- Texture overlays
- Borders and decorative elements
- Fallback images (e.g., "sad panda" for errors)

**Format Recommendations**:
- PNG for transparency and UI elements
- JPG for photographs and backgrounds
- Keep file sizes reasonable for performance

### icons/ - Icon Files

**Purpose**: Icons for UI elements, buttons, and content types.

**Format Recommendations**:
- **SVG** (preferred): Scalable, resolution-independent
- **PNG**: For raster icons, provide multiple sizes if needed

**Organization Pattern**:
- Use consistent naming conventions
- Group by function or category
- Include standard icon sizes (24px, 48px)

**Example** (flat skin uses Material Design icons):
```
icons/
├── ic_home_48px.svg
├── ic_settings_48px.svg
├── ic_play_arrow_48px.svg
├── ic_pause_48px.svg
└── ...
```

**Usage**:
```c
widget(icon, {
  source: "skin://icons/ic_home_48px.svg";
  size: 2em;
});
```

## Skin Comparison: Flat vs Old

### Architectural Differences

| Aspect | Flat Skin (Modern) | Old Skin (Legacy) |
|--------|-------------------|-------------------|
| **Structure** | Modular, component-based | Monolithic, page-centric |
| **Styles** | Separate style files | Inline styles in pages |
| **Menus** | Integrated sidebars | Separate command menus |
| **Items** | Dedicated items/ directory | Items within pages/ subdirs |
| **Icons** | SVG (Material Design) | Mixed PNG/SVG |
| **Complexity** | Higher abstraction | More explicit |

### Flat Skin Characteristics

**Design Philosophy**: Modern, clean, component-based architecture

**Key Features**:
- Modular component system with reusable macros
- Separate style definitions for maintainability
- Integrated navigation with sidebars
- Material Design icon system
- Responsive design with orientation awareness
- Blur and transparency effects

**File Organization**:
- Clear separation of concerns
- Dedicated directories for each component type
- Centralized style management

**Best For**: Modern displays, touch interfaces, maintainable codebases

### Old Skin Characteristics

**Design Philosophy**: Traditional, explicit, self-contained pages

**Key Features**:
- Self-contained page implementations
- Explicit styling within pages
- Command menu system
- Mixed icon formats
- Simpler component hierarchy

**File Organization**:
- Page-centric structure
- Item renderers within page directories
- Less abstraction, more direct implementation

**Best For**: Legacy systems, simpler customization, learning the basics

## File Relationships and Dependencies

### Include and Import Patterns

**Direct Includes**:
```c
#include "skin://theme.view"
```
Includes are processed at compile time and insert the file contents directly.

**Dynamic Loading**:
```c
widget(loader, {
  source: "skin://pages/" + $self.model.type + ".view";
});
```
Loaders dynamically load view files at runtime based on content type.

### Dependency Graph

```
universe.view (entry point)
├── includes: theme.view (macros and definitions)
├── loads: background.view
├── loads: loading.view
├── loads: screensaver.view
├── dynamically loads: pages/{type}.view
│   ├── may include: theme.view
│   ├── may include: styles/style_*.view
│   └── may load: items/{type}/*.view
├── dynamically loads: popups/{type}.view
├── dynamically loads: playdecks/{orientation}/{type}.view
└── conditionally loads: log.view, osk.view, mediainfo.view, sysinfo.view
```

### Resource References

**Skin-Relative Paths**:
```c
source: "skin://icons/ic_home_48px.svg"
source: "skin://fonts/RobotoCondensed-Regular.ttf"
source: "skin://graphics/background.jpg"
```

**Absolute Paths** (for system resources):
```c
source: "dataroot://res/svg/Alert.svg"
source: "dataroot://res/fonts/UbuntuMono-Regular.ttf"
```

## Best Practices

### Organization

1. **Maintain Clear Directory Structure**: Follow the standard layout for consistency
2. **Separate Concerns**: Keep styles, components, and pages in dedicated directories
3. **Use Meaningful Names**: File names should clearly indicate their purpose
4. **Group Related Files**: Keep related components together (e.g., landscape/portrait playdecks)

### Modularity

1. **Define Reusable Macros**: Create macros in theme.view for common patterns
2. **Create Component Libraries**: Build reusable item renderers and UI components
3. **Centralize Styles**: Use style files instead of inline styling
4. **Avoid Duplication**: Extract common patterns into shared files

### Performance

1. **Optimize Assets**: Compress images, use SVG where possible
2. **Lazy Load**: Use conditional loaders for optional components
3. **Minimize Nesting**: Avoid excessive widget hierarchy depth
4. **Use Efficient Selectors**: Optimize conditional expressions

### Maintainability

1. **Document Macros**: Add comments explaining macro parameters and usage
2. **Use Consistent Naming**: Follow naming conventions throughout the skin
3. **Version Control**: Track changes to skin files
4. **Test Thoroughly**: Verify skin on different screen sizes and devices

### Compatibility

1. **Support Multiple Orientations**: Provide landscape and portrait layouts
2. **Handle Missing Assets**: Provide fallbacks for optional resources
3. **Test on Target Devices**: Verify on TV, mobile, and desktop platforms
4. **Consider Performance**: Optimize for lower-end devices

## Common Patterns

### Page Header Pattern

```c
#define PageHeader(TITLE) {
  widget(container_z, {
    height: 3em;
    widget(quad, {
      color: 0;
      alpha: 0.2;
    });
    widget(label, {
      padding: [3em, 0];
      align: center;
      caption: TITLE;
    });
    widget(container_x, {
      hidden: !$nav.canGoBack;
      BackButton();
      space(1);
    });
  });
}
```

### Item Menu Pattern

```c
onEvent(itemMenu, { $clone.itemMenu = void; }, $clone.itemMenu);
onEvent(back,     { $clone.itemMenu = void; }, $clone.itemMenu);
onEvent(cancel,   { $clone.itemMenu = void; }, $clone.itemMenu);

widget(loader, {
  hidden: !$clone.itemMenu;
  source: select($clone.itemMenu, 
                 "popups/itemmenu.view", 
                 "");
});
```

### Conditional Overlay Pattern

```c
widget(loader, {
  autohide: true;
  time: 0.1;
  effect: blend;
  source: select($ui.showOverlay, "overlay.view", "");
});
```

### Responsive Layout Pattern

```c
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");

widget(loader, {
  source: "playdecks/" + $ui.orientation + "/tracks.view";
});
```

## Skin Metadata

While not always present in the skin directory itself, skins may be accompanied by metadata files:

- **Skin name and version**
- **Author information**
- **Compatibility requirements**
- **Description and screenshots**

This metadata is typically managed by Movian's skin selection system.

## Conclusion

Movian's skin system provides a flexible and powerful way to customize the entire user interface. Understanding the standard directory structure and file organization patterns is essential for creating maintainable, performant, and user-friendly skins.

The evolution from the `old` skin to the `flat` skin demonstrates a move toward more modular, component-based architecture that improves maintainability and enables more sophisticated visual designs.

**Key Takeaways**:
- Skins are self-contained directories with a standard structure
- `universe.view` is the entry point that defines the overall UI hierarchy
- `theme.view` provides reusable macros and components
- Pages, items, menus, and popups are organized in dedicated directories
- Assets (fonts, graphics, icons) are organized by type
- Modern skins favor modularity and component reuse
- Proper organization improves maintainability and performance

**Next Steps**:
- Explore [Theme Variables and Customization](theme-variables.md)
- Learn about [Creating Custom Skins](creating-skins.md)
- Study [View File Syntax Reference](../view-files/syntax-reference.md)
