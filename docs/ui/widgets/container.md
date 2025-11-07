# Container Widgets

Container widgets are fundamental layout components in Movian's GLW system that organize and position child widgets. They provide flexible layout mechanisms for building complex user interfaces.

## Overview

Movian provides three primary container types that differ in their layout direction:

- **container_x** (hbox) - Horizontal layout
- **container_y** (vbox) - Vertical layout  
- **container_z** (zbox) - Stacked/layered layout

**Source Reference:** `movian/src/ui/glw/glw_container.c`

## Container Types

### container_x (hbox)

Arranges child widgets horizontally from left to right.

**Properties:**
- **spacing**: Gap between child widgets (in pixels)
- **padding**: Internal padding [left, top, right, bottom]
- **alignment**: Horizontal alignment (left, center, right)
- **homogenous**: When enabled, all children get equal width

**Layout Behavior:**
- Children with fixed width constraints maintain their size
- Remaining space is distributed among weighted children
- Supports aspect ratio constraints for children
- Can use table mode for column-based layouts

**Example:**
```xml
<container_x spacing="10" padding="5,10,5,10">
  <image source="icon1.png"/>
  <label caption="Item 1"/>
  <image source="icon2.png"/>
</container_x>
```

**Source:** `glw_container.c:1100-1120`

### container_y (vbox)

Arranges child widgets vertically from top to bottom.

**Properties:**
- **spacing**: Gap between child widgets (in pixels)
- **padding**: Internal padding [left, top, right, bottom]
- **alignment**: Vertical alignment (top, center, bottom)
- **autofade**: Enables fade-in/fade-out animations for children

**Layout Behavior:**
- Children with fixed height constraints maintain their size
- Remaining space is distributed among weighted children
- Supports smooth transitions when children are added/removed
- Can anchor to top or bottom

**Example:**
```xml
<container_y spacing="15" alignment="top">
  <label caption="Title"/>
  <label caption="Subtitle"/>
  <container_x>
    <!-- Nested horizontal container -->
  </container_x>
</container_y>
```

**Source:** `glw_container.c:600-650`

### container_z (zbox)

Stacks child widgets on top of each other (z-axis layering).

**Properties:**
- **alignment**: Controls how children are positioned within the container
- **zindex**: Controls rendering order (higher values render on top)

**Layout Behavior:**
- All children occupy the same space
- Children are rendered in order (last child on top)
- Useful for overlays, backgrounds, and layered effects
- Copies constraints from first visible child

**Example:**
```xml
<container_z>
  <image source="background.png"/>
  <container_y>
    <label caption="Overlay Text"/>
  </container_y>
</container_z>
```

**Source:** `glw_container.c:800-850`

## Common Properties

### Spacing

Controls the gap between child widgets.

```xml
<container_x spacing="20">
  <!-- 20 pixel gap between children -->
</container_x>
```

**Type:** Integer (pixels)  
**Default:** 0  
**Applies to:** container_x, container_y

### Padding

Internal padding around the container's content area.

```xml
<container_y padding="10,20,10,20">
  <!-- left:10, top:20, right:10, bottom:20 -->
</container_y>
```

**Type:** Four integers [left, top, right, bottom]  
**Default:** [0, 0, 0, 0]  
**Applies to:** All containers

### Alignment

Controls how children are positioned when they don't fill the container.

**Values:**
- `left` / `top` - Align to start
- `center` - Center alignment
- `right` / `bottom` - Align to end

```xml
<container_x alignment="center">
  <!-- Children centered horizontally -->
</container_x>
```

**Source:** `glw_container.c:350-380`

## Advanced Features

### Homogenous Mode

When enabled on container_x, all children receive equal width based on the largest child.

```xml
<container_x homogenous="true">
  <button caption="OK"/>
  <button caption="Cancel"/>
  <!-- Both buttons get same width -->
</container_x>
```

**Source:** `glw_container.c:180-200`

### Weight System

Children without fixed constraints can specify a weight to control space distribution.

```xml
<container_x>
  <widget weight="1.0"/>  <!-- Gets 1/3 of space -->
  <widget weight="2.0"/>  <!-- Gets 2/3 of space -->
</container_x>
```

**Source:** `glw_container.c:150-170`

### Aspect Ratio Constraints

Children can request space based on aspect ratios.

```xml
<container_x>
  <image aspect="1.777"/>  <!-- 16:9 aspect ratio -->
</container_x>
```

**Source:** `glw_container.c:220-250`

### Table Mode

Container_x supports table mode for column-aligned layouts.

```xml
<table>
  <container_x tableMode="true">
    <label caption="Name:"/>
    <label caption="John"/>
  </container_x>
  <container_x tableMode="true">
    <label caption="Age:"/>
    <label caption="30"/>
  </container_x>
</table>
```

**Source:** `glw_container.c:70-110`

## Layout Algorithm

### Constraint Resolution

1. **Fixed Size Children**: Children with explicit width/height constraints are measured first
2. **Weighted Children**: Remaining space is distributed based on weights
3. **Aspect Ratio**: Children with aspect constraints are sized to maintain ratio
4. **Alignment**: Final positioning based on alignment settings

**Source:** `glw_container.c:130-300`

### Rendering Order

- **container_x/y**: Children rendered in document order
- **container_z**: Children rendered in order with z-index support
- Clipping applied when children exceed container bounds

**Source:** `glw_container.c:700-800`

## Event Handling

Containers support navigation events:

- **container_x**: Handles left/right navigation
- **container_y**: Handles up/down navigation
- **container_z**: Passes events to top visible child

**Source:** `glw_container.c:900-950`

## Performance Considerations

- Containers with many children may impact layout performance
- Use `autofade` sparingly as it requires continuous rendering
- Nested containers increase layout complexity
- Consider using `list_x` or `list_y` for large scrollable content

## Common Patterns

### Centered Content

```xml
<container_z>
  <container_y alignment="center">
    <container_x alignment="center">
      <label caption="Centered Text"/>
    </container_x>
  </container_y>
</container_z>
```

### Header/Content/Footer Layout

```xml
<container_y>
  <container_x height="50">
    <!-- Header -->
  </container_x>
  <container_y weight="1.0">
    <!-- Content (fills remaining space) -->
  </container_y>
  <container_x height="40">
    <!-- Footer -->
  </container_x>
</container_y>
```

### Sidebar Layout

```xml
<container_x>
  <container_y width="200">
    <!-- Sidebar -->
  </container_y>
  <container_y weight="1.0">
    <!-- Main content -->
  </container_y>
</container_x>
```

## See Also

- [List Widgets](list.md) - For scrollable content
- [Grid Layouts](grid.md) - For grid-based layouts
- [View File Syntax](../view-files/syntax-reference.md) - Complete syntax reference
