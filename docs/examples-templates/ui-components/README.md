# Reusable UI Components Library

A collection of ready-to-use UI components for Movian view files. These components demonstrate common UI patterns and can be copied directly into your skin or plugin views.

## Component Categories

### Navigation Components
- **Sidebar Menu**: Vertical navigation with icons
- **Tab Bar**: Horizontal tab navigation
- **Breadcrumbs**: Hierarchical navigation trail
- **Pagination**: Page number navigation

### Media Controls
- **Play/Pause Button**: Toggle playback control
- **Seek Bar**: Video/audio progress bar
- **Volume Control**: Volume slider with mute
- **Playback Speed**: Speed adjustment control

### Lists and Grids
- **Scrollable List**: Vertical list with items
- **Grid Layout**: Multi-column grid
- **Carousel**: Horizontal scrolling items
- **Infinite Scroll**: Auto-loading list

### Forms and Inputs
- **Text Input**: Single-line text field
- **Text Area**: Multi-line text input
- **Button**: Clickable button with states
- **Checkbox**: Toggle checkbox
- **Radio Group**: Single selection group
- **Slider**: Numeric value slider
- **Dropdown**: Selection dropdown

### Dialogs and Popups
- **Alert Dialog**: Simple message dialog
- **Confirmation Dialog**: Yes/No confirmation
- **Input Dialog**: Text input prompt
- **Loading Overlay**: Loading indicator
- **Toast Notification**: Temporary message

### Animations
- **Fade In/Out**: Opacity transitions
- **Slide In/Out**: Position transitions
- **Scale**: Size transitions
- **Rotate**: Rotation animations

## Usage

### Copy Component Code

1. Browse to the component category
2. Open the `.view` file
3. Copy the component code
4. Paste into your view file
5. Customize as needed

### Import as Macro

1. Copy component to your skin directory
2. Import in your view file:
   ```view
   #import "components/sidebar.view"
   ```
3. Use the macro:
   ```view
   SidebarMenu();
   ```

### Customize Component

Most components accept parameters:

```view
// Example: Customizable button
#define CustomButton(LABEL, ACTION, COLOR) {
  widget(container_z, {
    height: 3em;
    focusable: true;
    onEvent(activate, ACTION);
    
    widget(quad, {
      color: COLOR;
    });
    
    widget(label, {
      caption: LABEL;
      align: center;
    });
  });
}

// Usage
CustomButton("Click Me", navOpen("page:url"), "#4192ff");
```

## Component Structure

Each component includes:

- **Standalone `.view` file**: Ready to use
- **Macro version**: For reusability
- **Documentation**: Usage examples
- **Customization guide**: Parameter options

## Best Practices

### Performance
- Use `iir()` for smooth animations
- Implement lazy loading for lists
- Cache static content
- Minimize widget nesting

### Accessibility
- Ensure keyboard navigation works
- Add focus indicators
- Use semantic widget types
- Provide text alternatives

### Responsiveness
- Use relative units (em, %)
- Test on different screen sizes
- Adapt to orientation changes
- Handle different aspect ratios

### Maintainability
- Use macros for repeated patterns
- Document component parameters
- Follow naming conventions
- Keep components focused

## Examples

### Simple Button Component

```view
#define SimpleButton(LABEL, ACTION) {
  widget(container_z, {
    height: 2.5em;
    width: 10em;
    focusable: true;
    onEvent(activate, ACTION);
    
    // Background
    widget(quad, {
      color: select(isNavFocused(), "#4192ff", "#2a2a2a");
      alpha: iir(isNavFocused(), 4);
    });
    
    // Label
    widget(label, {
      caption: LABEL;
      align: center;
      color: 1;
    });
  });
}
```

### List Item Component

```view
#define ListItem(TITLE, SUBTITLE, ICON, ACTION) {
  widget(container_z, {
    height: 4em;
    focusable: true;
    onEvent(activate, ACTION);
    
    // Highlight on focus
    widget(quad, {
      color: "#4192ff";
      alpha: 0.2 * isNavFocused();
    });
    
    // Content
    widget(container_x, {
      padding: [0.5em, 1em];
      spacing: 1em;
      
      // Icon
      widget(icon, {
        source: ICON;
        width: 3em;
        height: 3em;
      });
      
      // Text
      widget(container_y, {
        filterConstraintX: true;
        
        widget(label, {
          caption: TITLE;
          size: 1.2em;
        });
        
        widget(label, {
          caption: SUBTITLE;
          size: 0.9em;
          alpha: 0.7;
        });
      });
    });
  });
}
```

## Testing Components

1. **Create test view file**:
   ```view
   #import "skin://theme.view"
   
   widget(container_y, {
     // Test your component here
     SimpleButton("Test Button", { console.log("Clicked!"); });
   });
   ```

2. **Load in Movian**:
   - Add to your skin
   - Navigate to test page
   - Verify appearance and behavior

3. **Test interactions**:
   - Keyboard navigation
   - Mouse/touch input
   - Focus states
   - Animations

## Contributing

To add new components:

1. Create component file in appropriate category
2. Add macro definition with parameters
3. Include usage examples
4. Document customization options
5. Test thoroughly
6. Update this README

## Resources

- **View File Syntax**: `docs/ui/view-files/syntax-reference.md`
- **Widget Reference**: `docs/ui/widgets/`
- **Theming Guide**: `docs/ui/theming/`
- **Examples**: `docs/ui/examples/`
