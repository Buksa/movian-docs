# GLW Element Index

**Status**: 🟢 Verified from source code analysis  
**Last Updated**: 2024-11-08  
**Movian Version**: 4.8+

## Overview

This document provides a comprehensive quick-reference index of all GLW widget elements available in view files. For detailed information about each element, see the [Elements Reference](../ui/view-files/elements-reference.md).

## Quick Reference Table

| Element | Category | Purpose | Common Use Cases |
|---------|----------|---------|------------------|
| `container_x` | Container | Horizontal layout | Toolbars, button groups, horizontal menus |
| `container_y` | Container | Vertical layout | Lists, forms, vertical menus |
| `container_z` | Container | Z-axis stacking | Overlays, backgrounds, layered UI |
| `list_x` | List | Horizontal scrollable list | Carousels, horizontal galleries |
| `list_y` | List | Vertical scrollable list | Content lists, menus, feeds |
| `grid` | Layout | Grid layout | Photo galleries, app grids, thumbnails |
| `deck` | Layout | Card stack (one visible) | Page navigation, wizards |
| `label` | Content | Text display | Titles, descriptions, captions |
| `text` | Content | Editable text | Text input fields, search boxes |
| `image` | Content | Image display | Icons, photos, thumbnails |
| `video` | Content | Video playback | Media player, video preview |
| `quad` | Content | Colored rectangle | Backgrounds, separators, highlights |
| `icon` | Content | Icon display | UI icons, status indicators |
| `bar` | Content | Progress/level bar | Progress indicators, volume levels |
| `loader` | Dynamic | Dynamic view loading | Conditional UI, page loading |
| `cloner` | Dynamic | Widget replication | Data-driven lists, repeated items |
| `slider` | Interactive | Slider control | Volume, brightness, settings |
| `slider_x` | Interactive | Horizontal slider | Scrollbars, progress indicators |
| `slider_y` | Interactive | Vertical slider | Scrollbars, vertical controls |
| `backdrop` | Effect | Backdrop effects | Blur backgrounds, overlays |
| `mirror` | Effect | Reflection effect | Mirror images, reflections |
| `displacement` | Effect | Displacement mapping | Visual distortions, effects |
| `rotator` | Effect | 3D rotation | Spinning elements, transitions |
| `expander` | Effect | Expand/collapse | Collapsible sections, accordions |
| `layer` | Special | Z-order management | Page layers, modal dialogs |
| `playfield` | Special | Media playback surface | Video playback area |
| `underscan` | Special | Screen boundary management | TV-safe areas, overscan |
| `border` | Special | Border rendering | Decorative borders, frames |

## Elements by Category

### Container Elements

**Purpose**: Layout and organize child widgets

| Element | Layout Direction | Scrollable | Best For |
|---------|-----------------|------------|----------|
| `container_x` | Horizontal | No | Fixed horizontal layouts |
| `container_y` | Vertical | No | Fixed vertical layouts |
| `container_z` | Z-axis (stacked) | No | Overlays and layers |
| `list_x` | Horizontal | Yes | Scrollable horizontal content |
| `list_y` | Vertical | Yes | Scrollable vertical content |
| `grid` | Grid (2D) | Yes | Multi-column/row layouts |
| `deck` | Stacked (one visible) | No | Page navigation |

**Key Attributes**:
- `spacing` - Space between children
- `padding` - Internal padding
- `align` - Child alignment
- `homogenous` - Equal child sizing

**Example**:
```xml
<container_y spacing="10" padding="[20, 20, 20, 20]">
  <label caption="Title"/>
  <container_x spacing="5">
    <image source="icon.png"/>
    <label caption="Description"/>
  </container_x>
</container_y>
```

### Content Display Elements

**Purpose**: Display text, images, and media

| Element | Content Type | Supports | Best For |
|---------|--------------|----------|----------|
| `label` | Text | Rich text, styling | Static text display |
| `text` | Text | Editing, binding | Text input fields |
| `image` | Image | Scaling, effects | Photos, icons, thumbnails |
| `video` | Video | Playback, audio | Video content |
| `quad` | Color | Gradients | Backgrounds, separators |
| `icon` | Image | SVG, PNG | UI icons |
| `bar` | Visual | Fill level | Progress, volume |

**Key Attributes**:
- `caption` - Text content (label, text)
- `source` - Content source (image, video, icon)
- `color` - Primary color
- `alpha` - Transparency
- `size` - Font size (text) or scale

**Example**:
```xml
<container_x>
  <image source="$item.thumbnail" 
         aspectConstraint="true"
         width="100" height="100"/>
  <container_y>
    <label caption="$item.title" 
           size="18" bold="true"/>
    <label caption="$item.description" 
           maxlines="3" ellipsize="true"/>
  </container_y>
</container_x>
```

### Dynamic Content Elements

**Purpose**: Load and generate content dynamically

| Element | Purpose | Creates | Updates |
|---------|---------|---------|---------|
| `loader` | Load view files | Single view instance | On source change |
| `cloner` | Replicate widgets | Multiple instances | On data change |

**Key Attributes**:
- **loader**: `source`, `args`, `time`, `effect`, `autohide`
- **cloner**: `source` (data collection)

**Example**:
```xml
<!-- Dynamic view loading -->
<loader source="$page.model.contentView"
        args="$page.model.data"
        time="0.3"
        effect="blend"/>

<!-- Data-driven widget replication -->
<cloner source="$items">
  <container_x focusable="true"
               onEvent(activate, navOpen($self.url))>
    <image source="$self.icon"/>
    <label caption="$self.title"/>
  </container_x>
</cloner>
```

### Interactive Elements

**Purpose**: Handle user input and interaction

| Element | Input Type | Value Type | Best For |
|---------|------------|------------|----------|
| `slider` | Drag/click | Numeric | General sliders |
| `slider_x` | Horizontal drag | Numeric | Horizontal scrollbars |
| `slider_y` | Vertical drag | Numeric | Vertical scrollbars |
| `text` | Keyboard | String | Text input |

**Key Attributes**:
- `value` - Current value
- `min`, `max`, `step` - Range and increment
- `focusable` - Can receive focus
- `onEvent` - Event handlers

**Example**:
```xml
<slider value="$settings.volume"
        min="0" max="100" step="1"
        focusable="true"/>

<text value="$settings.username"
      focusable="true"
      onEvent(submit, saveSettings())/>
```

### Effect Elements

**Purpose**: Apply visual effects to children

| Element | Effect Type | Parameters | Performance |
|---------|-------------|------------|-------------|
| `backdrop` | Blur, overlay | `blur`, `alpha`, `color` | Medium |
| `mirror` | Reflection | `axis` | Low |
| `displacement` | Distortion | `source`, `scale` | High |
| `rotator` | 3D rotation | `angle`, `axis` | Medium |
| `expander` | Expand/collapse | `expansion`, `time` | Low |

**Key Attributes**:
- `blur` - Blur amount (backdrop)
- `angle` - Rotation angle (rotator)
- `expansion` - Expansion state (expander)
- `time` - Animation duration

**Example**:
```xml
<backdrop blur="10" alpha="0.8">
  <container_y>
    <label caption="Blurred Background"/>
  </container_y>
</backdrop>

<rotator angle="$time * 360" axis="y">
  <image source="spinner.png"/>
</rotator>
```

### Layout Elements

**Purpose**: Specialized layout management

| Element | Layout Type | Features | Best For |
|---------|-------------|----------|----------|
| `grid` | Grid | Multi-column/row | Galleries, app grids |
| `deck` | Stack | One visible | Page navigation |
| `layer` | Z-order | Layer management | Modal dialogs |
| `playfield` | Media | Playback surface | Video playback |
| `underscan` | Boundary | Safe area | TV interfaces |

**Key Attributes**:
- **grid**: `childTilesX`, `childTilesY`, `spacing`
- **deck**: `effect`, `time`
- **layer**: Z-order management
- **underscan**: Screen boundary handling

**Example**:
```xml
<grid childTilesX="4" childTilesY="3" 
      spacing="10" Xspacing="15" Yspacing="10">
  <cloner source="$items">
    <container_z>
      <image source="$self.thumbnail"/>
      <label caption="$self.title"/>
    </container_z>
  </cloner>
</grid>
```

## Element Compatibility Matrix

### Parent-Child Compatibility

| Parent Element | Can Contain | Cannot Contain | Notes |
|----------------|-------------|----------------|-------|
| `container_*` | Any element | - | Universal containers |
| `list_*` | Any element | - | Scrollable containers |
| `grid` | Any element | - | Grid layout |
| `deck` | Any element | - | Card stack |
| `loader` | (Dynamic) | - | Loads view file |
| `cloner` | Template | - | Replicates template |
| `label` | - | Any | Leaf node |
| `image` | - | Any | Leaf node |
| `video` | - | Any | Leaf node |
| `quad` | - | Any | Leaf node |
| `backdrop` | Any element | - | Effect wrapper |
| `mirror` | Any element | - | Effect wrapper |
| `rotator` | Any element | - | Effect wrapper |
| `expander` | Any element | - | Effect wrapper |

### Nesting Recommendations

**✅ Good Patterns**:
```xml
<!-- Clear hierarchy -->
<container_y>
  <label caption="Title"/>
  <list_y>
    <cloner source="$items">
      <container_x>
        <image source="$self.icon"/>
        <label caption="$self.title"/>
      </container_x>
    </cloner>
  </list_y>
</container_y>

<!-- Effect wrapping -->
<backdrop blur="5">
  <container_z>
    <quad color="#000000" alpha="0.5"/>
    <container_y>
      <!-- Content -->
    </container_y>
  </container_z>
</backdrop>
```

**❌ Avoid**:
```xml
<!-- Unnecessary nesting -->
<container_y>
  <container_y>
    <container_y>
      <label caption="Over-nested"/>
    </container_y>
  </container_y>
</container_y>

<!-- Conflicting layouts -->
<list_y>
  <list_y>
    <!-- Nested scrollable lists -->
  </list_y>
</list_y>
```

## Element Selection Guide

### By Use Case

**Navigation Menus**:
- Horizontal: `container_x` or `list_x`
- Vertical: `container_y` or `list_y`
- Grid: `grid`

**Content Display**:
- Text: `label`
- Images: `image`
- Video: `video`
- Mixed: `container_*` with children

**Data-Driven Lists**:
- Fixed: `container_*` with `cloner`
- Scrollable: `list_*` with `cloner`
- Grid: `grid` with `cloner`

**User Input**:
- Text: `text`
- Numeric: `slider`
- Selection: Focusable `container_*` with `onEvent`

**Page Navigation**:
- Single page: `loader`
- Multiple pages: `deck` or `layer`
- Conditional: `loader` with dynamic `source`

### By Performance

**Low Overhead** (use freely):
- `container_*`
- `label`
- `quad`
- `icon`

**Medium Overhead** (use judiciously):
- `image`
- `list_*`
- `grid`
- `rotator`

**High Overhead** (use sparingly):
- `video`
- `backdrop` (with blur)
- `displacement`
- Complex `cloner` with many items

## Common Patterns

### List with Items

```xml
<list_y spacing="5">
  <cloner source="$items">
    <container_x focusable="true"
                 onEvent(activate, navOpen($self.url))>
      <image source="$self.thumbnail" width="80" height="80"/>
      <container_y>
        <label caption="$self.title" bold="true"/>
        <label caption="$self.description" maxlines="2"/>
      </container_y>
    </container_x>
  </cloner>
</list_y>
```

### Grid Gallery

```xml
<grid childTilesX="4" childTilesY="3" spacing="10">
  <cloner source="$photos">
    <container_z focusable="true"
                 onEvent(activate, viewPhoto($self))>
      <image source="$self.thumbnail" aspectConstraint="true"/>
      <container_y align="bottom">
        <quad color="#000000" alpha="0.7"/>
        <label caption="$self.title" padding="[5,5,5,5]"/>
      </container_y>
    </container_z>
  </cloner>
</grid>
```

### Conditional Content

```xml
<loader source="translate($page.model.type,
                          'list', 'views/list.view',
                          'grid', 'views/grid.view',
                          'detail', 'views/detail.view')"
        args="$page.model.data"
        time="0.3"
        effect="blend"/>
```

### Overlay with Backdrop

```xml
<container_z>
  <!-- Main content -->
  <container_y>
    <!-- ... -->
  </container_y>
  
  <!-- Overlay -->
  <container_z hidden="!$showOverlay">
    <backdrop blur="10" alpha="0.9">
      <quad color="#000000" alpha="0.5"/>
    </backdrop>
    <container_y align="center" valign="middle">
      <!-- Overlay content -->
    </container_y>
  </container_z>
</container_z>
```

### Expandable Section

```xml
<container_y>
  <container_x focusable="true"
               onEvent(activate, toggle($expanded))>
    <label caption="Section Title"/>
    <icon source="$expanded ? 'chevron-up.svg' : 'chevron-down.svg'"/>
  </container_x>
  
  <expander expansion="$expanded ? 1.0 : 0.0" time="0.3">
    <container_y>
      <!-- Expandable content -->
    </container_y>
  </expander>
</container_y>
```

## Element Lifecycle

### Creation Order

1. **Parse**: Element definition parsed from view file
2. **Lookup**: Element class looked up by name
3. **Construct**: Constructor called (`gc_ctor`)
4. **Configure**: Attributes set via setters
5. **Children**: Child elements created recursively
6. **Add**: Element added to parent
7. **Layout**: Initial layout calculated
8. **Render**: Element rendered to screen

### Update Triggers

Elements update when:
- **Property Change**: Bound property changes
- **Attribute Change**: Attribute value changes
- **Parent Layout**: Parent recalculates layout
- **Focus Change**: Element gains/loses focus
- **User Input**: User interacts with element

### Destruction Order

1. **Mark**: Element marked for removal
2. **Suspend**: Subscriptions suspended
3. **Children**: Child elements destroyed recursively
4. **Destruct**: Destructor called (`gc_dtor`)
5. **Release**: Memory released

## Performance Considerations

### Element Count

**Impact**: Each element has memory and CPU overhead

**Guidelines**:
- Minimize nesting depth (< 10 levels)
- Use `cloner` efficiently (paginate large lists)
- Avoid creating elements for hidden content
- Use `autohide` on `loader` to destroy unused views

### Layout Complexity

**Impact**: Complex layouts require more CPU for calculation

**Guidelines**:
- Prefer simple container hierarchies
- Use `filterConstraintX/Y` to optimize constraints
- Avoid circular dependencies in sizing
- Use fixed sizes where possible

### Rendering Overhead

**Impact**: Some elements are expensive to render

**High Cost Elements**:
- `video` - Hardware decoding and rendering
- `backdrop` with `blur` - GPU-intensive
- `displacement` - Shader-based effects
- `image` with large textures - Memory bandwidth

**Optimization**:
- Hide expensive elements when not visible
- Use lower blur values
- Scale images appropriately
- Limit simultaneous video playback

## Debugging Elements

### Debug Attribute

Enable debug output for any element:

```xml
<container_y debug="true">
  <!-- Debug info printed to console -->
</container_y>
```

### Element Identification

Use `id` attribute for identification:

```xml
<container_y id="mainContent">
  <label id="titleLabel" caption="Title"/>
  <image id="thumbnailImage" source="thumb.png"/>
</container_y>
```

### Visual Debugging

Add borders to visualize layout:

```xml
<container_y>
  <border color="#FF0000" border="[1,1,1,1]">
    <label caption="Debug this"/>
  </border>
</container_y>
```

## Cross-References

### Related Documentation

- **[Elements Reference](../ui/view-files/elements-reference.md)** - Detailed element documentation
- **[Attributes Reference](attribute-index.md)** - Complete attribute catalog
- **[Syntax Reference](../ui/view-files/syntax-reference.md)** - View file syntax
- **[Widget Documentation](../ui/widgets/)** - Widget-specific guides
- **[GLW Architecture](../ui/glw-architecture.md)** - System architecture

### By Topic

**Layout**:
- [Container Widgets](../ui/widgets/container.md)
- [List Widgets](../ui/widgets/list.md)
- [Grid Widgets](../ui/widgets/grid.md)

**Content**:
- [Text Widgets](../ui/widgets/text.md)
- [Image Widgets](../ui/widgets/image.md)

**Examples**:
- [Basic Examples](../ui/examples/)
- [Skin Examples](../ui/theming/examples/)

## Accuracy Status

🟢 **Verified**: All elements verified from source code analysis  
**Source Files**: `movian/src/ui/glw/glw_*.c` (widget implementations)  
**Version**: Based on Movian source as of 2024-11-08

## See Also

- [Attribute Index](attribute-index.md) - Quick attribute reference
- [API Index](api-index.md) - JavaScript API reference
- [Glossary](glossary.md) - Technical terms
- [Troubleshooting](troubleshooting.md) - Common issues
