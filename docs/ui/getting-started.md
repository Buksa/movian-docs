# Getting Started with Movian UI Development

This guide introduces you to Movian's UI system and helps you create your first custom view files.

## Overview

Movian's UI is built using the GLW (OpenGL Widget) system, which uses XML-like view files to define layouts and components. Understanding the UI system allows you to:

- Create custom skins and themes
- Modify existing UI layouts
- Build plugin-specific interfaces
- Customize the user experience

## UI System Components

### View Files (.view)

View files are XML-like documents that define UI structure:

```xml
<widget type="container_x">
  <widget type="label">
    <caption>Hello, Movian!</caption>
  </widget>
</widget>
```

### GLW Rendering Engine

The GLW engine processes view files and renders them using OpenGL, providing:

- Hardware-accelerated rendering
- Smooth animations
- Responsive layouts
- Cross-platform compatibility

### Skins and Themes

Skins are collections of view files that define the entire UI appearance. Themes customize colors, fonts, and styling within a skin.

## Your First View File

### 1. Create a Simple View

Create a file named `hello.view`:

```
widget(container_y, {
  spacing: 10;
  
  widget(label, {
    caption: "Welcome to Movian UI";
    size: 1.5em;
    color: 1.0;
  });
  
  widget(container_x, {
    spacing: 5;
    
    widget(label, {
      caption: "This is a custom view";
    });
  });
});
```

### 2. Understanding the Structure

- `widget(container_y, {...})`: Vertical container that stacks children
- `widget(container_x, {...})`: Horizontal container that arranges children side-by-side
- `widget(label, {...})`: Text display widget
- `spacing`: Gap between child widgets (in pixels or em units)
- `caption`: Text content
- `size`: Font size (in em units or pixels)
- `color`: RGB color values (0.0 to 1.0)

### 3. Using in a Plugin

Reference your view file from a plugin:

```javascript
new page.Route("myplugin:page", function(page) {
  page.type = "directory";
  page.metadata.title = "Custom UI";
  
  // Load custom view
  page.metadata.glwview = plugin.path + "views/hello.view";
  
  page.loading = false;
});
```

## Common UI Patterns

### Creating a List

```xml
<widget type="list_y">
  <cloner>
    <widget type="container_x" height="50">
      <widget type="image">
        <source>$self.icon</source>
        <width>40</width>
      </widget>
      
      <widget type="label">
        <caption>$self.title</caption>
      </widget>
    </widget>
  </cloner>
</widget>
```

### Adding Images

```xml
<widget type="image">
  <source>http://example.com/image.png</source>
  <width>200</width>
  <height>150</height>
</widget>
```

### Creating Buttons

```xml
<widget type="container_x" focusable="true">
  <onEvent>
    <action>navOpen($self.url)</action>
  </onEvent>
  
  <widget type="label">
    <caption>Click Me</caption>
  </widget>
</widget>
```

### Using Variables

```xml
<widget type="label">
  <caption>$page.metadata.title</caption>
  <color>$ui.color.text</color>
  <size>$ui.size.large</size>
</widget>
```

## Widget Types

### Containers

- `container_x`: Horizontal layout
- `container_y`: Vertical layout
- `container_z`: Layered layout (stacking)
- `array`: Grid layout

### Display Widgets

- `label`: Text display
- `image`: Image display
- `icon`: Icon display
- `video`: Video player

### Interactive Widgets

- `list_y`: Vertical scrollable list
- `list_x`: Horizontal scrollable list
- `grid`: Grid layout with scrolling
- `deck`: Swipeable card deck

### Special Widgets

- `backdrop`: Background image with blur
- `loader`: Loading indicator
- `slider`: Progress bar or slider
- `text`: Multi-line text display

## Styling and Layout

### Sizing

```xml
<widget type="label">
  <width>200</width>
  <height>50</height>
  <minWidth>100</minWidth>
  <maxWidth>300</maxWidth>
</widget>
```

### Alignment

```xml
<widget type="container_x">
  <align>center</align>
  <valign>center</valign>
</widget>
```

### Spacing and Padding

```xml
<widget type="container_y">
  <spacing>10</spacing>
  <padding>20, 10, 20, 10</padding>
</widget>
```

### Colors

```xml
<widget type="label">
  <!-- RGB format (0.0 to 1.0) -->
  <color>1.0, 0.5, 0.0</color>
  
  <!-- RGBA format with alpha -->
  <color>1.0, 1.0, 1.0, 0.8</color>
</widget>
```

## Event Handling

### Navigation Events

```xml
<widget type="container_x" focusable="true">
  <onEvent>
    <action>navOpen("page:url")</action>
  </onEvent>
</widget>
```

### Focus Events

```xml
<widget type="label">
  <focusedColor>1.0, 1.0, 0.0</focusedColor>
  <unfocusedColor>0.7, 0.7, 0.7</unfocusedColor>
</widget>
```

## Expressions and Logic

### Conditional Display

```xml
<widget type="label">
  <hidden>${!$page.metadata.title}</hidden>
  <caption>$page.metadata.title</caption>
</widget>
```

### Computed Values

```xml
<widget type="label">
  <caption>${$item.count + " items"}</caption>
</widget>
```

## Next Steps

Now that you understand the basics, explore:

- [GLW Architecture](glw-architecture.md) - Deep dive into the rendering engine
- [View Files Reference](view-files/elements-reference.md) - Complete widget documentation
- [Theming Guide](theming/theme-system.md) - Create custom themes
- [Widget Reference](widgets/) - Detailed widget documentation
- [Examples](examples/) - Working UI examples

## Best Practices

### Performance

- Minimize nested containers
- Use appropriate widget types
- Avoid excessive animations
- Optimize image sizes

### Maintainability

- Use consistent naming
- Comment complex layouts
- Organize files logically
- Reuse common components

### Accessibility

- Ensure proper focus order
- Use appropriate font sizes
- Provide sufficient contrast
- Test with different screen sizes

## Troubleshooting

### View Not Rendering

- Check XML syntax
- Verify widget types are correct
- Check for missing closing tags
- Review Movian logs for errors

### Layout Issues

- Verify container types
- Check sizing constraints
- Review spacing and padding
- Test on different screen sizes

### Styling Not Applied

- Check property names
- Verify value formats
- Ensure proper inheritance
- Check theme variables

## Resources

- [Complete Widget Reference](widgets/)
- [View File Examples](examples/)
- [Skin Development Guide](theming/skin-structure.md)
- [GLW Source Analysis](source-analysis/)

## See Also

- [GLW Architecture](glw-architecture.md)
- [View Files](view-files/)
- [Theming System](theming/)
- [Widget Reference](widgets/)
