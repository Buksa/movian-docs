# GLW View Elements Reference

**Status**: 🟢 Verified from source code analysis  
**Last Updated**: 2024-11-06  
**Movian Version**: 4.8+

## Overview

This document catalogs all GLW widget types (elements) available in view files. Each widget type is registered with the GLW system and provides specific functionality for building user interfaces.

## Widget Classification

### Container Widgets

Widgets that contain and layout other widgets.

#### container_x

**Purpose**: Horizontal container that layouts children left-to-right

**Layout Behavior**:
- Children arranged horizontally
- Respects child width constraints
- Distributes space based on weight

**Common Attributes**:
- `spacing` - Space between children
- `align` - Vertical alignment of children
- `padding` - Internal padding

**Example**:
```xml
<container_x spacing="10">
  <label caption="Left"/>
  <label caption="Center"/>
  <label caption="Right"/>
</container_x>
```

#### container_y

**Purpose**: Vertical container that layouts children top-to-bottom

**Layout Behavior**:
- Children arranged vertically
- Respects child height constraints
- Distributes space based on weight

**Common Attributes**:
- `spacing` - Space between children
- `align` - Horizontal alignment of children
- `padding` - Internal padding

**Example**:
```xml
<container_y spacing="5">
  <label caption="Top"/>
  <label caption="Middle"/>
  <label caption="Bottom"/>
</container_y>
```

#### container_z

**Purpose**: Z-axis container that stacks children in depth

**Layout Behavior**:
- Children stacked on Z-axis
- All children occupy same 2D space
- Useful for overlays and layers

**Common Attributes**:
- `zoffset` - Z-axis offset for layering
- `alpha` - Transparency for blending

**Example**:
```xml
<container_z>
  <image source="background.png"/>
  <label caption="Overlay Text"/>
</container_z>
```

### List Widgets

Scrollable containers for dynamic content.

#### list_x

**Purpose**: Horizontal scrollable list

**Layout Behavior**:
- Children arranged horizontally
- Scrollable when content exceeds width
- Supports focus navigation

**Common Attributes**:
- `spacing` - Space between items
- `childTilesX` - Number of visible tiles
- `scrollThreshold` - Scroll trigger distance

**Example**:
```xml
<list_x spacing="10">
  <cloner source="$items">
    <container_x>
      <label caption="$self.title"/>
    </container_x>
  </cloner>
</list_x>
```

#### list_y

**Purpose**: Vertical scrollable list

**Layout Behavior**:
- Children arranged vertically
- Scrollable when content exceeds height
- Supports focus navigation

**Common Attributes**:
- `spacing` - Space between items
- `childTilesY` - Number of visible tiles
- `scrollThreshold` - Scroll trigger distance

**Example**:
```xml
<list_y spacing="5">
  <cloner source="$items">
    <label caption="$self.title"/>
  </cloner>
</list_y>
```

### Content Widgets

Widgets that display content.

#### label

**Purpose**: Display text content

**Features**:
- Text rendering with font support
- Multi-line text with wrapping
- Rich text support (single-quoted strings)
- Text styling (bold, italic, outline)

**Common Attributes**:
- `caption` - Text to display
- `font` - Font family
- `size` - Font size
- `color` - Text color
- `align` - Text alignment
- `maxlines` - Maximum number of lines
- `ellipsize` - Truncate with ellipsis
- `bold` - Bold text
- `italic` - Italic text
- `outline` - Text outline

**Example**:
```xml
<label caption="Hello World"
       size="24"
       color="#FFFFFF"
       bold="true"/>
```

#### image

**Purpose**: Display images

**Features**:
- Image loading from various sources
- Scaling and aspect ratio control
- Border and bevel effects
- Color tinting

**Common Attributes**:
- `source` - Image URL/path
- `color` - Tint color
- `saturation` - Color saturation
- `alpha` - Transparency
- `aspectConstraint` - Maintain aspect ratio
- `fixedSize` - Don't scale image
- `bevelLeft/Right/Top/Bottom` - Bevel edges

**Example**:
```xml
<image source="icon.png"
       aspectConstraint="true"
       alpha="0.8"/>
```

#### quad

**Purpose**: Render colored rectangle

**Features**:
- Simple colored quad
- Useful for backgrounds and separators
- Supports gradients via color1/color2

**Common Attributes**:
- `color` - Fill color
- `color1` - Gradient start color
- `color2` - Gradient end color
- `alpha` - Transparency

**Example**:
```xml
<quad color="#FF0000" alpha="0.5"/>
```

#### video

**Purpose**: Video playback widget

**Features**:
- Video rendering
- Audio control
- Playback state management

**Common Attributes**:
- `source` - Video URL
- `primary` - Primary video flag
- `noAudio` - Disable audio
- `audioVolume` - Volume level

**Example**:
```xml
<video source="$page.model.videoUrl"
       primary="true"
       audioVolume="1.0"/>
```

### Dynamic Widgets

Widgets for dynamic content loading and generation.

#### loader

**Purpose**: Dynamically load view files at runtime

**Features**:
- Load views based on property values
- Smooth transitions between views
- Scope propagation to loaded views
- Fallback URL support

**Common Attributes**:
- `source` - View file URL to load
- `alt` - Alternative/fallback URL
- `args` - Arguments passed as `$args`
- `time` - Transition duration
- `effect` - Transition effect type
- `autohide` - Hide when no content

**Example**:
```xml
<loader source="$page.model.viewUrl"
        args="$page.model.data"
        time="0.3"
        effect="blend"/>
```

**Source Reference**: `movian/src/ui/glw/glw_view_loader.c`

#### cloner

**Purpose**: Clone widgets for each item in a collection

**Features**:
- Dynamic widget generation
- Data binding with `$self`
- Pagination support
- Efficient updates

**Common Attributes**:
- `source` - Property containing items
- (Children define template to clone)

**Example**:
```xml
<cloner source="$items">
  <container_x>
    <image source="$self.icon"/>
    <label caption="$self.title"/>
  </container_x>
</cloner>
```

**Context Variables**:
- `$self` - Current item
- `$clone` - Cloner context

### Interactive Widgets

Widgets that handle user input.

#### slider

**Purpose**: Slider control for numeric input

**Features**:
- Horizontal or vertical orientation
- Min/max/step configuration
- Value binding

**Common Attributes**:
- `value` - Current value
- `min` - Minimum value
- `max` - Maximum value
- `step` - Increment step

**Example**:
```xml
<slider value="$settings.volume"
        min="0"
        max="100"
        step="1"/>
```

#### button

**Purpose**: Clickable button widget

**Features**:
- Focus and activation handling
- Visual feedback
- Event handling

**Common Attributes**:
- `focusable` - Can receive focus
- `onEvent` - Event handlers

**Example**:
```xml
<button focusable="true"
        onEvent(activate, navOpen($self.url))>
  <label caption="Click Me"/>
</button>
```

**Note**: Often implemented as a focusable container with custom styling.

### Layout Widgets

Specialized layout containers.

#### grid

**Purpose**: Grid layout for items

**Features**:
- Multi-column/row layout
- Automatic item positioning
- Scrollable grid

**Common Attributes**:
- `childTilesX` - Number of columns
- `childTilesY` - Number of rows
- `spacing` - Space between items
- `Xspacing` - Horizontal spacing
- `Yspacing` - Vertical spacing

**Example**:
```xml
<grid childTilesX="4" childTilesY="3" spacing="10">
  <cloner source="$items">
    <image source="$self.thumbnail"/>
  </cloner>
</grid>
```

#### deck

**Purpose**: Stack of widgets with one visible at a time

**Features**:
- Card-style navigation
- Smooth transitions
- Page management

**Common Attributes**:
- `effect` - Transition effect
- `time` - Transition duration

**Example**:
```xml
<deck effect="slideHorizontal" time="0.3">
  <container_y id="page1">...</container_y>
  <container_y id="page2">...</container_y>
</deck>
```

### Effect Widgets

Widgets that apply visual effects.

#### backdrop

**Purpose**: Apply backdrop effects to children

**Features**:
- Blur effects
- Color overlays
- Visual filtering

**Common Attributes**:
- `blur` - Blur amount
- `alpha` - Transparency
- `color` - Overlay color

**Example**:
```xml
<backdrop blur="10" alpha="0.8">
  <container_y>
    <!-- Content with blurred background -->
  </container_y>
</backdrop>
```

#### mirror

**Purpose**: Mirror/reflect child widgets

**Features**:
- Reflection effects
- Axis control

**Common Attributes**:
- `axis` - Mirror axis

**Example**:
```xml
<mirror axis="y">
  <image source="logo.png"/>
</mirror>
```

### Text Input Widgets

Widgets for text entry.

#### text_input

**Purpose**: Single-line text input field

**Features**:
- Text entry and editing
- Password mode
- Value binding

**Common Attributes**:
- `value` - Current text value
- `password` - Password mode (hidden text)
- `focusable` - Can receive focus

**Example**:
```xml
<text_input value="$settings.username"
            focusable="true"/>
```

### Special Widgets

Specialized widgets for specific purposes.

#### displacement

**Purpose**: Apply displacement mapping effects

**Features**:
- Visual distortion effects
- Shader-based rendering

**Common Attributes**:
- `source` - Displacement map
- `scale` - Displacement scale

#### rotator

**Purpose**: Rotate child widgets

**Features**:
- 3D rotation
- Animation support

**Common Attributes**:
- `angle` - Rotation angle
- `axis` - Rotation axis

**Example**:
```xml
<rotator angle="$time * 360" axis="y">
  <image source="spinner.png"/>
</rotator>
```

#### expander

**Purpose**: Expandable/collapsible container

**Features**:
- Expand/collapse animation
- State management

**Common Attributes**:
- `expansion` - Expansion state (0.0 to 1.0)
- `time` - Animation duration

**Example**:
```xml
<expander expansion="$expanded ? 1.0 : 0.0" time="0.3">
  <container_y>
    <!-- Expandable content -->
  </container_y>
</expander>
```

## Widget Hierarchy Rules

### Parent-Child Compatibility

**Container Widgets** can contain:
- Any widget type
- Multiple children
- Nested containers

**Content Widgets** typically:
- Do not contain children
- Are leaf nodes in widget tree

**Dynamic Widgets** (loader, cloner):
- Manage child lifecycle
- Create/destroy children dynamically

### Nesting Guidelines

**Recommended Patterns**:
```xml
<!-- Good: Clear hierarchy -->
<container_y>
  <label caption="Title"/>
  <container_x>
    <image source="icon.png"/>
    <label caption="Description"/>
  </container_x>
</container_y>

<!-- Avoid: Unnecessary nesting -->
<container_y>
  <container_y>
    <container_y>
      <label caption="Over-nested"/>
    </container_y>
  </container_y>
</container_y>
```

## Common Attributes by Widget Type

### All Widgets

These attributes are available on all widget types:

- `id` - Widget identifier
- `alpha` - Transparency (0.0 to 1.0)
- `hidden` - Hide widget
- `debug` - Enable debug output
- `focusable` - Can receive focus
- `weight` - Layout weight
- `width` - Width constraint
- `height` - Height constraint

### Container Widgets

Additional attributes for containers:

- `spacing` - Space between children
- `Xspacing` - Horizontal spacing
- `Yspacing` - Vertical spacing
- `padding` - Internal padding
- `align` - Child alignment
- `homogenous` - Equal child sizing

### Content Widgets

Additional attributes for content:

- `source` - Content source (image, video, etc.)
- `caption` - Text content (label)
- `color` - Primary color
- `saturation` - Color saturation
- `blur` - Blur amount

### Interactive Widgets

Additional attributes for interaction:

- `focusable` - Can receive focus
- `enabled` - Interaction enabled
- `focusOnClick` - Focus on click
- `onEvent` - Event handlers

## Widget Registration

Widgets are registered with the GLW system using:

```c
static glw_class_t glw_widget_name = {
  .gc_name = "widget_name",
  .gc_instance_size = sizeof(glw_widget_t),
  // ... callbacks
};

GLW_REGISTER_CLASS(glw_widget_name);
```

**Source Reference**: Each widget implementation in `movian/src/ui/glw/glw_*.c`

## Widget Lifecycle

### Creation

1. Parser encounters widget definition
2. Widget class looked up by name
3. Constructor called (`gc_ctor`)
4. Attributes set via setters
5. Children created recursively
6. Widget added to parent

### Updates

1. Property change triggers subscription
2. Expression re-evaluated
3. Attribute setter called
4. Widget marks itself for refresh
5. Layout recalculated if needed
6. Rendering updated

### Destruction

1. Widget marked for removal
2. Subscriptions suspended
3. Children destroyed recursively
4. Destructor called (`gc_dtor`)
5. Memory released

## Custom Widget Development

### Widget Class Structure

```c
typedef struct glw_class {
  const char *gc_name;                    // Widget name
  int gc_instance_size;                   // Instance size
  int gc_parent_data_size;                // Per-child data size
  
  // Lifecycle
  void (*gc_ctor)(glw_t *w);
  void (*gc_dtor)(glw_t *w);
  
  // Attribute setters
  int (*gc_set_int)(glw_t *w, int attrib, int value, glw_style_t *origin);
  int (*gc_set_float)(glw_t *w, int attrib, float value, glw_style_t *origin);
  int (*gc_set_rstr)(glw_t *w, int attrib, rstr_t *value, glw_style_t *origin);
  // ... more setters
  
  // Layout and rendering
  void (*gc_layout)(glw_t *w, const glw_rctx_t *rc);
  void (*gc_render)(glw_t *w, const glw_rctx_t *rc);
  
  // Signal handling
  int (*gc_signal_handler)(glw_t *w, void *opaque, glw_signal_t signal, void *extra);
  
  // ... more callbacks
} glw_class_t;
```

### Implementing a Widget

**Minimum Requirements**:
1. Define widget structure (extends `glw_t`)
2. Implement constructor/destructor
3. Implement attribute setters
4. Implement layout callback
5. Implement render callback
6. Register widget class

**Example Skeleton**:
```c
typedef struct glw_mywidget {
  glw_t w;
  // Widget-specific fields
} glw_mywidget_t;

static void glw_mywidget_ctor(glw_t *w) {
  // Initialize widget
}

static void glw_mywidget_dtor(glw_t *w) {
  // Cleanup widget
}

static void glw_mywidget_layout(glw_t *w, const glw_rctx_t *rc) {
  // Layout children
}

static void glw_mywidget_render(glw_t *w, const glw_rctx_t *rc) {
  // Render widget
}

static glw_class_t glw_mywidget = {
  .gc_name = "mywidget",
  .gc_instance_size = sizeof(glw_mywidget_t),
  .gc_ctor = glw_mywidget_ctor,
  .gc_dtor = glw_mywidget_dtor,
  .gc_layout = glw_mywidget_layout,
  .gc_render = glw_mywidget_render,
};

GLW_REGISTER_CLASS(glw_mywidget);
```

## Widget Discovery

### Finding Available Widgets

**Source Code**:
- Widget implementations in `movian/src/ui/glw/glw_*.c`
- Each file typically implements one widget class
- Look for `GLW_REGISTER_CLASS()` macro

**Runtime**:
- Widgets registered at startup
- Available in all view files
- No explicit import needed

### Widget Naming Conventions

**Container Widgets**: `container_*`
- `container_x`, `container_y`, `container_z`

**List Widgets**: `list_*`
- `list_x`, `list_y`

**Content Widgets**: Descriptive names
- `label`, `image`, `video`, `quad`

**Special Widgets**: Functional names
- `loader`, `cloner`, `slider`, `deck`

## Best Practices

### Widget Selection

**Choose the Right Container**:
```xml
<!-- Horizontal layout -->
<container_x>...</container_x>

<!-- Vertical layout -->
<container_y>...</container_y>

<!-- Overlays -->
<container_z>...</container_z>

<!-- Scrollable list -->
<list_y>...</list_y>
```

### Performance Considerations

**Minimize Widget Count**:
```xml
<!-- Good: Efficient structure -->
<container_y>
  <label caption="Title"/>
  <label caption="Description"/>
</container_y>

<!-- Avoid: Unnecessary containers -->
<container_y>
  <container_y>
    <label caption="Title"/>
  </container_y>
  <container_y>
    <label caption="Description"/>
  </container_y>
</container_y>
```

**Use Cloner for Dynamic Content**:
```xml
<!-- Good: Efficient dynamic content -->
<cloner source="$items">
  <label caption="$self.title"/>
</cloner>

<!-- Avoid: Manual widget creation -->
<!-- (Not possible in view files, but conceptually) -->
```

### Accessibility

**Provide Focusable Elements**:
```xml
<container_x focusable="true"
             onEvent(activate, navOpen($self.url))>
  <label caption="$self.title"/>
</container_x>
```

**Use Semantic Structure**:
```xml
<!-- Good: Clear hierarchy -->
<container_y>
  <label caption="Section Title"/>
  <container_y>
    <!-- Section content -->
  </container_y>
</container_y>
```

## Accuracy Status

🟢 **Verified**: Widget types and behaviors verified from source code  
**Source Files**: `movian/src/ui/glw/glw_*.c` (all widget implementations)  
**Version**: Based on Movian source as of 2024-11-06

**Note**: This reference covers common widgets. Additional specialized widgets may exist in the codebase. Refer to source code for complete catalog.

## See Also

- [Syntax Reference](syntax-reference.md) - View file syntax
- [Attributes Reference](attributes-reference.md) - Widget attributes
- [Expressions Guide](expressions.md) - Expression system
- [GLW Architecture](../glw-architecture.md) - Widget system design
