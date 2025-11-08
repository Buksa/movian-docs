# Minimal Skin Example

This is a minimal working skin for Movian that demonstrates the essential components and macro patterns needed to create a functional custom skin.

## Overview

This minimal skin includes:

- **Core structure**: `universe.view` (entry point) and `theme.view` (macro definitions)
- **Essential macros**: `ListItemBevel()`, `PageHeader()`, `BackButton()`
- **Basic components**: background, loading screen, and a simple home page
- **Minimal styling**: Basic color scheme and layout

## File Structure

```
minimal-skin/
├── README.md              # This file
├── universe.view          # Main entry point and global configuration
├── theme.view             # Macro definitions
├── background.view        # Background component
├── loading.view           # Loading screen
└── pages/
    └── home.view          # Simple home page example
```

## Key Concepts Demonstrated

### 1. Entry Point (universe.view)

The `universe.view` file is the root of the skin. It:
- Sets up global UI variables and color scheme
- Defines global event handlers
- Loads the background component
- Manages the page system with navigation
- Shows loading indicators

### 2. Macro System (theme.view)

The `theme.view` file defines reusable UI macros:
- **`ListItemBevel()`**: Adds subtle shadow effects to list items
- **`PageHeader(TITLE)`**: Creates a standardized page header with back button
- **`BackButton()`**: Provides consistent back navigation

### 3. Component Loading

Components are loaded dynamically using the `loader` widget:
```view
widget(loader, {
  source: "background.view";
});
```

### 4. Page System

Pages are managed through the navigation system:
```view
cloner($nav.pages, container_z, {
  widget(loader, {
    source: "skin://pages/" + $self.model.type + ".view";
  });
});
```

## Installation

To use this minimal skin in Movian:

1. Copy the `minimal-skin` directory to your Movian skins directory:
   - **Linux**: `~/.hts/movian/skins/`
   - **Windows**: `%APPDATA%\Movian\skins\`
   - **macOS**: `~/Library/Application Support/Movian/skins/`

2. Restart Movian

3. Go to Settings → User Interface → Skin and select "Minimal Skin"

## Customization

This minimal skin serves as a starting point. You can customize it by:

1. **Changing colors**: Edit the `$ui.color1`, `$ui.color2`, `$ui.color3` variables in `universe.view`
2. **Adding macros**: Define new macros in `theme.view` for reusable UI patterns
3. **Creating pages**: Add new page types in the `pages/` directory
4. **Enhancing components**: Extend `background.view` or `loading.view` with more features

## Next Steps

To create a more complete skin, consider adding:

- Additional page types (list, grid, video, settings)
- Navigation sidebar or menu system
- Media player controls (playdeck)
- On-screen display (OSD) for video playback
- Popup dialogs (authentication, messages, file picker)
- Custom icons and graphics
- Advanced animations and transitions

See the full Movian documentation for more details on creating complete skins.

## Reference

This minimal skin is based on patterns from the official "flat" skin. For more advanced examples, study:
- `movian/glwskins/flat/` - Complete reference implementation
- Movian documentation - Comprehensive theming guide
