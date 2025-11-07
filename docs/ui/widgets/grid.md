# Grid Layouts

Grid layouts arrange widgets in a two-dimensional grid pattern with rows and columns. While Movian doesn't have a dedicated "grid" widget, grid layouts are achieved through combinations of containers and specialized widgets.

## Overview

Grid layouts in Movian can be created using:

- **Nested Containers** - container_y with container_x children
- **Array Widget** - Specialized grid layout widget
- **Cloner with Containers** - Dynamic grid generation

**Source Reference:** `movian/src/ui/glw/glw_array.c`, `movian/src/ui/glw/glw_container.c`

## Grid Patterns

### Nested Container Grid

The most common approach uses nested containers:

```xml
<container_y spacing="10">
  <container_x spacing="10">
    <widget width="100" height="100"/>
    <widget width="100" height="100"/>
    <widget width="100" height="100"/>
  </container_x>
  <container_x spacing="10">
    <widget width="100" height="100"/>
    <widget width="100" height="100"/>
    <widget width="100" height="100"/>
  </container_x>
</container_y>
```

**Advantages:**
- Simple and explicit
- Full control over layout
- Easy to understand

**Disadvantages:**
- Verbose for large grids
- Manual row management
- Not dynamic

**Source:** `glw_container.c:1-50`

### Array Widget

The array widget provides automatic grid layout:

```xml
<array columns="4" spacing="10">
  <widget/>
  <widget/>
  <widget/>
  <!-- Automatically arranged in 4 columns -->
</array>
```

**Properties:**
- **columns**: Number of columns
- **spacing**: Gap between items
- **childWidth**: Fixed width for all children
- **childHeight**: Fixed height for all children

**Source:** `glw_array.c:1-100`

### Dynamic Grid with Cloner

For data-driven grids, use cloner with containers:

```xml
<list_y>
  <cloner>
    <container_x spacing="10">
      <image source="$item.thumb" width="200" height="150"/>
    </container_x>
  </cloner>
</list_y>
```

**Behavior:**
- Items automatically arranged
- Rows created as needed
- Scrollable for large datasets

## Grid Properties

### Column Count

Controls number of columns in grid:

```xml
<array columns="5">
  <!-- 5 items per row -->
</array>
```

**Type:** Integer  
**Default:** Varies by widget  
**Effect:** Determines grid width

### Spacing

Gap between grid cells:

```xml
<array columns="4" spacing="15">
  <!-- 15px gap between items -->
</array>
```

**Type:** Integer (pixels)  
**Applies to:** Both horizontal and vertical gaps  
**Alternative:** Use separate spacing for rows/columns with nested containers

### Cell Sizing

#### Fixed Size

All cells same size:

```xml
<array columns="3" 
       childWidth="150" 
       childHeight="150">
  <!-- All cells 150x150 -->
</array>
```

**Type:** Integer (pixels)  
**Effect:** Uniform grid cells

#### Flexible Size

Cells adapt to content:

```xml
<container_y>
  <container_x>
    <widget/>  <!-- Size based on content -->
    <widget/>
  </container_x>
</container_y>
```

**Behavior:** Each cell sizes independently

#### Aspect Ratio

Maintain cell aspect ratios:

```xml
<array columns="4">
  <image aspect="1.5"/>  <!-- 3:2 ratio -->
  <image aspect="1.5"/>
</array>
```

**Effect:** Cells maintain specified aspect

## Layout Algorithms

### Flow Layout

Items flow left-to-right, top-to-bottom:

```
[1] [2] [3] [4]
[5] [6] [7] [8]
[9] [10] ...
```

**Implementation:** Array widget or nested containers

### Justified Grid

Items stretch to fill available width:

```xml
<container_y>
  <container_x homogenous="true">
    <widget/>
    <widget/>
    <widget/>
  </container_x>
</container_y>
```

**Effect:** Equal-width columns filling container

**Source:** `glw_container.c:180-200`

### Masonry Layout

Variable height items in columns:

```xml
<container_x>
  <container_y weight="1.0">
    <widget height="100"/>
    <widget height="150"/>
  </container_y>
  <container_y weight="1.0">
    <widget height="120"/>
    <widget height="180"/>
  </container_y>
</container_x>
```

**Effect:** Pinterest-style layout

## Scrollable Grids

### Vertical Scrolling Grid

```xml
<list_y spacing="10">
  <container_x spacing="10">
    <image source="thumb1.jpg" width="200"/>
    <image source="thumb2.jpg" width="200"/>
    <image source="thumb3.jpg" width="200"/>
  </container_x>
  <container_x spacing="10">
    <image source="thumb4.jpg" width="200"/>
    <image source="thumb5.jpg" width="200"/>
    <image source="thumb6.jpg" width="200"/>
  </container_x>
  <!-- More rows... -->
</list_y>
```

**Behavior:**
- Vertical scrolling
- Rows remain intact
- Efficient rendering

### Horizontal Scrolling Grid

```xml
<list_x spacing="10">
  <container_y spacing="10">
    <widget height="100"/>
    <widget height="100"/>
    <widget height="100"/>
  </container_y>
  <container_y spacing="10">
    <widget height="100"/>
    <widget height="100"/>
    <widget height="100"/>
  </container_y>
  <!-- More columns... -->
</list_x>
```

**Behavior:**
- Horizontal scrolling
- Columns remain intact
- Suitable for carousels

## Navigation

### Grid Navigation

Navigation in grids requires proper focus handling:

```xml
<container_y>
  <container_x>
    <widget focusable="true"/>
    <widget focusable="true"/>
  </container_x>
  <container_x>
    <widget focusable="true"/>
    <widget focusable="true"/>
  </container_x>
</container_y>
```

**Behavior:**
- Up/Down moves between rows
- Left/Right moves within row
- Focus wraps at edges (optional)

### Focus Memory

Grids can remember column position:

```xml
<container_y>
  <container_x id="row1">
    <!-- Focus remembers column -->
  </container_x>
  <container_x id="row2">
    <!-- Returns to same column -->
  </container_x>
</container_y>
```

**Effect:** Maintains horizontal position when moving vertically

## Common Patterns

### Photo Grid

```xml
<list_y spacing="10" padding="10,10,10,10">
  <container_x spacing="10">
    <image source="photo1.jpg" 
           width="200" 
           height="150"
           focusable="true"/>
    <image source="photo2.jpg" 
           width="200" 
           height="150"
           focusable="true"/>
    <image source="photo3.jpg" 
           width="200" 
           height="150"
           focusable="true"/>
  </container_x>
  <container_x spacing="10">
    <image source="photo4.jpg" 
           width="200" 
           height="150"
           focusable="true"/>
    <image source="photo5.jpg" 
           width="200" 
           height="150"
           focusable="true"/>
    <image source="photo6.jpg" 
           width="200" 
           height="150"
           focusable="true"/>
  </container_x>
</list_y>
```

### Movie Poster Grid

```xml
<list_y spacing="15">
  <container_x spacing="15" homogenous="true">
    <container_z focusable="true">
      <image source="poster1.jpg" aspect="0.667"/>
      <container_y alignment="bottom">
        <label caption="Movie Title"/>
      </container_y>
    </container_z>
    <container_z focusable="true">
      <image source="poster2.jpg" aspect="0.667"/>
      <container_y alignment="bottom">
        <label caption="Movie Title"/>
      </container_y>
    </container_z>
  </container_x>
</list_y>
```

### Icon Grid

```xml
<container_y spacing="20" alignment="center">
  <container_x spacing="20" alignment="center">
    <container_z focusable="true">
      <icon source="app1.png" size="96"/>
      <label caption="App 1" alignment="center"/>
    </container_z>
    <container_z focusable="true">
      <icon source="app2.png" size="96"/>
      <label caption="App 2" alignment="center"/>
    </container_z>
  </container_x>
  <container_x spacing="20" alignment="center">
    <container_z focusable="true">
      <icon source="app3.png" size="96"/>
      <label caption="App 3" alignment="center"/>
    </container_z>
    <container_z focusable="true">
      <icon source="app4.png" size="96"/>
      <label caption="App 4" alignment="center"/>
    </container_z>
  </container_x>
</container_y>
```

### Responsive Grid

```xml
<container_y spacing="10">
  <container_x spacing="10" homogenous="true">
    <widget weight="1.0"/>
    <widget weight="1.0"/>
    <widget weight="1.0"/>
  </container_x>
  <!-- Adapts to container width -->
</container_y>
```

### Data-Driven Grid

```xml
<list_y spacing="10">
  <cloner source="$items">
    <container_x spacing="10">
      <image source="$item.thumbnail" 
             width="150" 
             height="150"
             focusable="true"/>
    </container_x>
  </cloner>
</list_y>
```

## Advanced Techniques

### Variable Column Count

Adjust columns based on screen size:

```javascript
// In view file
var columns = screenWidth > 1920 ? 6 : 4;
```

```xml
<array columns="$columns">
  <!-- Responsive column count -->
</array>
```

### Lazy Loading

Load grid items on demand:

```xml
<list_y>
  <cloner source="$visibleItems">
    <!-- Only visible items loaded -->
  </cloner>
</list_y>
```

**Benefit:** Improved performance for large grids

### Staggered Grid

Offset rows for visual interest:

```xml
<container_y>
  <container_x padding="0,0,0,0">
    <widget/>
    <widget/>
  </container_x>
  <container_x padding="50,0,0,0">
    <widget/>
    <widget/>
  </container_x>
</container_y>
```

**Effect:** Zigzag or offset pattern

## Performance Optimization

### Limit Visible Items

Only render visible grid cells:

```xml
<list_y>
  <!-- List automatically clips invisible rows -->
  <container_x>
    <!-- Row items -->
  </container_x>
</list_y>
```

**Benefit:** Reduces rendering overhead

### Fixed Sizes

Use fixed sizes when possible:

```xml
<array columns="4" 
       childWidth="200" 
       childHeight="150">
  <!-- Fixed sizes improve performance -->
</array>
```

**Benefit:** Faster layout calculation

### Avoid Deep Nesting

Keep grid structure shallow:

```xml
<!-- Good -->
<list_y>
  <container_x>
    <widget/>
  </container_x>
</list_y>

<!-- Avoid -->
<list_y>
  <container_z>
    <container_y>
      <container_x>
        <widget/>
      </container_x>
    </container_y>
  </container_z>
</list_y>
```

**Benefit:** Reduced layout complexity

## Troubleshooting

### Uneven Spacing

- Check spacing values on all containers
- Verify padding settings
- Ensure consistent cell sizes
- Test with different content

### Navigation Issues

- Verify focusable attributes
- Check navigation event handlers
- Test focus order
- Ensure proper container hierarchy

### Layout Breaks

- Check container constraints
- Verify weight values
- Test with different screen sizes
- Validate cell dimensions

### Performance Problems

- Reduce visible items
- Use fixed sizes
- Simplify cell layouts
- Enable lazy loading

## See Also

- [Container Widgets](container.md) - Layout containers
- [List Widgets](list.md) - Scrollable lists
- [Array Widget](../view-files/elements-reference.md#array) - Grid widget
- [Cloner Widget](../view-files/elements-reference.md#cloner) - Dynamic content
- [View File Syntax](../view-files/syntax-reference.md) - Complete syntax reference
