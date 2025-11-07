# Advanced UI Plugin Example

This plugin demonstrates advanced UI patterns and custom interface elements for Movian plugin development.

## Features Demonstrated

### 🧩 UI Components
- **Buttons & Controls**: Various button styles and interactive controls
- **Cards & Panels**: Card layouts and information panels  
- **Lists & Grids**: Advanced list and grid components
- **Navigation**: Navigation components and breadcrumbs
- **Media Elements**: Video players, image galleries, and media controls
- **Data Display**: Charts, tables, and data visualization

### 📐 Layout Examples
- **Grid Layouts**: Responsive grid systems and masonry layouts
- **Flexbox Layouts**: Flexible box layouts with dynamic sizing
- **Card Layouts**: Card-based layouts with various arrangements
- **List Layouts**: Advanced list layouts with custom renderers

### ✨ Animations & Transitions
- **Fade Transitions**: Smooth fade in/out effects
- **Slide Animations**: Sliding transitions and movements
- **Scale Effects**: Zoom and scale transformations
- **Rotation Effects**: Rotation and spin animations
- **Complex Sequences**: Multi-step animation sequences

### 🎮 Interactive Elements
- **Button Interactions**: Various button states and click handlers
- **Form Controls**: Input fields, sliders, and form elements
- **Drag & Drop**: Draggable elements and drop zones
- **Gesture Handling**: Touch gestures and multi-touch support
- **Keyboard Navigation**: Keyboard shortcuts and focus management

### 🎨 Theme System
- **Multiple Themes**: Default, Dark, Light, and Custom themes
- **Dynamic Theme Switching**: Runtime theme changes
- **Color Customization**: Configurable color schemes
- **Responsive Design**: Adaptive layouts for different screen sizes

## Technical Implementation

### Property System Integration
```javascript
// Global properties for UI state management
var uiState = {
    currentView: prop.createRoot(),
    selectedItem: prop.createRoot(),
    animationState: prop.createRoot(),
    themeData: prop.createRoot()
};

// Property subscriptions for reactive updates
prop.subscribe(uiState.themeData, function(type, value) {
    if (type === 'set') {
        console.log("Theme data updated:", JSON.stringify(value));
    }
});
```

### Custom View Files
The plugin supports custom view files for enhanced UI presentation:
- `views/main.view` - Main page layout
- `views/components.view` - Component showcase layout
- `views/layouts.view` - Layout examples
- `views/showcase.view` - Complete examples
- `views/theme-preview.view` - Theme preview layout

### Settings Integration
Comprehensive settings system for UI customization:
```javascript
settings.createMultiOpt("theme", "UI Theme", [
    ["default", "Default Theme"],
    ["dark", "Dark Theme"],
    ["light", "Light Theme"],
    ["custom", "Custom Theme"]
], "default", function(value) {
    storage.theme = value;
    updateTheme();
});
```

### Animation System
Configurable animation system with performance considerations:
```javascript
function createFadeAnimation(element, duration, fromAlpha, toAlpha) {
    if (!storage.animationsEnabled) return;
    
    return {
        type: "fade",
        element: element,
        duration: duration || 500,
        from: fromAlpha || 0,
        to: toAlpha || 1
    };
}
```

## Plugin Structure

```
advanced-ui-plugin/
├── plugin.json          # Plugin manifest
├── main.js             # Main plugin code
├── README.md           # This documentation
├── logo.png            # Plugin icon
└── views/              # Custom view files (optional)
    ├── main.view
    ├── components.view
    ├── layouts.view
    ├── showcase.view
    └── theme-preview.view
```

## Configuration Options

### Theme Settings
- **UI Theme**: Choose from Default, Dark, Light, or Custom themes
- **Enable Animations**: Toggle animation effects on/off
- **Enable Transitions**: Control transition effects

### Layout Settings
- **Layout Style**: Grid, List, Card, or Mosaic layouts
- **Item Spacing**: Configurable spacing between items (0-50px)
- **Show Item Details**: Toggle detailed item information display

## Usage Examples

### Basic Plugin Integration
```javascript
// Create service with custom icon
service.create("Advanced UI Demo", PLUGIN_PREFIX + ":start", "other", true, "logo.png");

// Set custom view file
page.metadata.glwview = Plugin.path + "views/main.view";

// Bind theme data to page
page.metadata.theme = uiState.themeData.value;
```

### Theme Management
```javascript
function updateTheme() {
    var themeName = storage.theme || "default";
    var themeData = getThemeData(themeName);
    uiState.themeData.value = themeData;
}

// Theme data structure
var themeData = {
    primaryColor: "#0066cc",
    secondaryColor: "#cc6600",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    accentColor: "#00cc66"
};
```

### Interactive Elements
```javascript
// Add interactive metadata to items
page.appendItem(route, "directory", {
    title: item.title,
    description: item.description,
    metadata: {
        interactive: true,
        theme: uiState.themeData.value,
        animationType: "fade"
    }
});
```

## Best Practices Demonstrated

1. **Modular Design**: Separate concerns into logical sections
2. **Configurable UI**: Extensive settings for user customization
3. **Performance**: Conditional animations and efficient rendering
4. **Accessibility**: Keyboard navigation and focus management
5. **Responsive Design**: Adaptive layouts for different screen sizes
6. **State Management**: Proper use of Movian's property system
7. **Error Handling**: Graceful fallbacks for missing resources

## Learning Objectives

After studying this example, developers will understand:

- How to create complex, interactive UI components in Movian
- Property system usage for reactive UI updates
- Theme system implementation and customization
- Animation and transition management
- Custom view file integration
- Advanced layout patterns and responsive design
- Settings integration for user customization
- Performance considerations for UI-heavy plugins

## Related Documentation

- [Plugin API Reference](../../api/core-api.md)
- [Settings API](../../api/settings-api.md)
- [Property System Guide](../../api/prop-api.md)
- [View Files Documentation](../../../ui/view-files/syntax-reference.md)
- [Best Practices Guide](../../best-practices.md)

## Installation

1. Copy the plugin directory to your Movian plugins folder
2. Enable the plugin in Movian settings
3. Navigate to the plugin from the main menu
4. Explore different sections to see various UI patterns
5. Customize the appearance using plugin settings

## Compatibility

- **Movian Version**: 5.0+
- **API Version**: 2
- **Platform**: All supported Movian platforms
- **Dependencies**: None (uses only built-in Movian APIs)