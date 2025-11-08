# List Widgets

List widgets provide scrollable containers for displaying collections of items. They support smooth scrolling, focus management, and efficient rendering of large datasets.

## Overview

Movian provides two list widget types for different scroll directions:

- **list_y** - Vertical scrolling list
- **list_x** - Horizontal scrolling list

**Source Reference:** `movian/src/ui/glw/glw_list.c`

## Widget Types

### list_y

Vertical scrolling list that arranges items top to bottom.

**Properties:**
- **spacing**: Gap between list items (pixels)
- **padding**: Internal padding [left, top, right, bottom]
- **scrollThresholdTop**: Top scroll trigger distance
- **scrollThresholdBottom**: Bottom scroll trigger distance
- **clipAlpha**: Alpha fade for clipped items
- **clipBlur**: Blur amount for clipped items

**Example:**
```xml
<list_y spacing="10" 
        scrollThresholdTop="100"
        scrollThresholdBottom="100">
  <label caption="Item 1"/>
  <label caption="Item 2"/>
  <label caption="Item 3"/>
</list_y>
```

**Source:** `glw_list.c:700-730`

### list_x

Horizontal scrolling list that arranges items left to right.

**Properties:**
- Same as list_y
- Scrolls horizontally instead of vertically

**Example:**
```xml
<list_x spacing="15">
  <image source="thumb1.jpg"/>
  <image source="thumb2.jpg"/>
  <image source="thumb3.jpg"/>
</list_x>
```

**Source:** `glw_list.c:750-780`

## Common Properties

### spacing

Controls the gap between list items.

```xml
<list_y spacing="20">
  <!-- 20 pixel gap between items -->
</list_y>
```

**Type:** Integer (pixels)  
**Default:** 0  
**Effect:** Adds space between consecutive items

**Source:** `glw_list.c:650-670`

### padding

Internal padding around the list content area.

```xml
<list_y padding="10,20,10,20">
  <!-- left:10, top:20, right:10, bottom:20 -->
</list_y>
```

**Type:** Four integers [left, top, right, bottom]  
**Default:** [0, 0, 0, 0]  
**Effect:** Offsets list content from edges

**Source:** `glw_list.c:680-700`

## Scrolling Properties

### scrollThresholdTop / scrollThresholdPre

Distance from top/left edge where scrolling begins.

```xml
<list_y scrollThresholdTop="150">
  <!-- Scroll starts 150px from top -->
</list_y>
```

**Type:** Integer (pixels)  
**Default:** 0  
**Behavior:** Focused item scrolls when reaching threshold

**Source:** `glw_list.c:100-150`

### scrollThresholdBottom / scrollThresholdPost

Distance from bottom/right edge where scrolling begins.

```xml
<list_y scrollThresholdBottom="150">
  <!-- Scroll starts 150px from bottom -->
</list_y>
```

**Type:** Integer (pixels)  
**Default:** 0  
**Behavior:** Prevents focused item from reaching edge

**Source:** `glw_list.c:100-150`

### clipAlpha

Alpha fade amount for items being clipped at edges.

```xml
<list_y clipAlpha="0.5">
  <!-- Items fade to 50% at edges -->
</list_y>
```

**Type:** Float (0.0 to 1.0)  
**Default:** 0.0 (no fade)  
**Effect:** Smooth visual transition at clip boundaries

**Source:** `glw_list.c:300-350`

### clipBlur

Blur amount for items being clipped at edges.

```xml
<list_y clipBlur="0.8">
  <!-- Items blur at edges -->
</list_y>
```

**Type:** Float (0.0 to 1.0)  
**Default:** 0.0 (no blur)  
**Effect:** Softens clipped items

**Source:** `glw_list.c:300-350`

## Scroll Behavior

### Automatic Scrolling

Lists automatically scroll to keep focused items visible:

```xml
<list_y scrollThresholdTop="100"
        scrollThresholdBottom="100">
  <!-- Focused item stays within thresholds -->
</list_y>
```

**Behavior:**
1. User navigates to item
2. If item outside threshold, list scrolls
3. Smooth animation to new position
4. Item remains visible within thresholds

**Source:** `glw_list.c:150-200`

### Scroll Position

Lists maintain scroll position state:
- `target_pos` - Target scroll position
- `filtered_pos` - Smoothed current position
- `rounded_pos` - Pixel-aligned position

**Interpolation:** Smooth scrolling with low-pass filter

**Source:** `glw_list.c:200-250`

### Page Size

Lists track visible page size for scrolling:

```xml
<list_y>
  <!-- Page size = visible height -->
</list_y>
```

**Calculation:** Automatically determined from widget size  
**Usage:** Controls scroll distance and pagination

**Source:** `glw_list.c:120-140`

## Focus Management

### Focus Suggestion

Lists suggest focus to appropriate items:

```xml
<list_y>
  <widget focusable="true"/>
  <widget focusable="true"/>
</list_y>
```

**Behavior:**
- Suggests first focusable item on entry
- Maintains focus during scrolling
- Handles focus when items added/removed

**Source:** `glw_list.c:550-600`

### Floating Focus

Lists support floating focus mode:

```xml
<list_y floatingFocus="true">
  <!-- Focus floats to visible items -->
</list_y>
```

**Effect:** Focus automatically moves to visible items  
**Use Case:** Dynamic content loading

**Source:** `glw_list.c:600-650`

## Event Handling

### Navigation Events

Lists handle directional navigation:

**list_y:**
- Up/Down arrow keys
- Page Up/Page Down
- Home/End keys

**list_x:**
- Left/Right arrow keys
- Page Left/Page Right

**Source:** `glw_list.c:700-750`

### Scroll Events

Lists respond to scroll events:

```javascript
// JavaScript scroll control
list.scroll({
  value: 0.5,  // Scroll to 50%
  delta: 100   // Scroll by 100 pixels
});
```

**Source:** `glw_list.c:450-500`

### Pointer Events

Lists support touch/mouse scrolling:

- Touch drag scrolling
- Mouse wheel scrolling
- Kinetic scrolling (momentum)
- Scroll bar interaction

**Source:** `glw_scroll.c:50-150`

## Performance Optimization

### Lazy Rendering

Lists only render visible items:

```xml
<list_y>
  <!-- Only items in viewport are rendered -->
</list_y>
```

**Behavior:**
- Items outside viewport are skipped
- Reduces rendering overhead
- Improves performance for large lists

**Source:** `glw_list.c:250-300`

### Clipping

Items outside visible area are marked as clipped:

```xml
<list_y>
  <!-- Clipped items don't render -->
</list_y>
```

**Flag:** `GLW_CLIPPED` set on invisible items  
**Effect:** Skips rendering and layout for clipped items

**Source:** `glw_list.c:350-400`

## Layout Algorithm

### Item Positioning

1. **Measure Items**: Determine each item's size
2. **Calculate Positions**: Compute item positions based on scroll
3. **Apply Scroll Offset**: Offset items by scroll position
4. **Clip Detection**: Mark items outside viewport
5. **Render Visible**: Render only visible items

**Source:** `glw_list.c:100-250`

### Size Constraints

Items can have fixed or flexible sizes:

```xml
<list_y>
  <widget height="100"/>  <!-- Fixed height -->
  <widget/>               <!-- Flexible height -->
</list_y>
```

**Behavior:**
- Fixed size items maintain dimensions
- Flexible items use default or calculated size
- List adapts to item sizes

**Source:** `glw_list.c:150-200`

## Common Patterns

### Simple Vertical List

```xml
<list_y spacing="5" padding="10,10,10,10">
  <label caption="Item 1"/>
  <label caption="Item 2"/>
  <label caption="Item 3"/>
</list_y>
```

### Scrollable Menu

```xml
<list_y scrollThresholdTop="50"
        scrollThresholdBottom="50"
        clipAlpha="0.3">
  <container_x focusable="true" height="60">
    <icon source="icon1.png"/>
    <label caption="Menu Item 1"/>
  </container_x>
  <container_x focusable="true" height="60">
    <icon source="icon2.png"/>
    <label caption="Menu Item 2"/>
  </container_x>
</list_y>
```

### Horizontal Thumbnail Strip

```xml
<list_x spacing="10" 
        scrollThresholdPre="100"
        scrollThresholdPost="100">
  <image source="thumb1.jpg" width="200" height="150"/>
  <image source="thumb2.jpg" width="200" height="150"/>
  <image source="thumb3.jpg" width="200" height="150"/>
</list_x>
```

### Dynamic Content List

```xml
<list_y id="contentList">
  <cloner>
    <!-- Items dynamically created from data -->
    <container_y focusable="true">
      <label caption="$item.title"/>
      <label caption="$item.description"/>
    </container_y>
  </cloner>
</list_y>
```

### Fading Edge List

```xml
<list_y clipAlpha="0.5"
        clipBlur="0.7"
        scrollThresholdTop="100"
        scrollThresholdBottom="100">
  <!-- Items fade and blur at edges -->
</list_y>
```

## Advanced Features

### Bottom Gravity

Lists can anchor to bottom:

```xml
<list_y bottomGravity="true">
  <!-- New items appear at bottom -->
  <!-- Scroll position stays at bottom -->
</list_y>
```

**Use Case:** Chat messages, logs  
**Behavior:** Automatically scrolls to show newest items

**Source:** `glw_scroll.c:150-200`

### Kinetic Scrolling

Touch scrolling with momentum:

```xml
<list_y>
  <!-- Flick to scroll with momentum -->
</list_y>
```

**Behavior:**
- Drag to scroll
- Release with velocity continues scrolling
- Gradually decelerates
- Bounces at boundaries

**Source:** `glw_scroll.c:100-150`

### Pagination

Lists support pagination for large datasets:

```xml
<list_y>
  <!-- Automatically manages pages -->
</list_y>
```

**Signals:**
- `GLW_SIGNAL_PAGINATION` - Request more items
- Triggered near end of list
- Enables infinite scrolling

**Source:** `glw_list.c:500-550`

## Troubleshooting

### Items Not Scrolling

- Check scrollThreshold values
- Verify items are focusable
- Ensure list has size constraints
- Check if items exceed list size

### Jerky Scrolling

- Reduce number of visible items
- Simplify item layouts
- Check rendering performance
- Verify scroll interpolation

### Focus Issues

- Ensure items are focusable
- Check focus suggestion logic
- Verify navigation events
- Test with keyboard/remote

### Clipping Problems

- Adjust clipAlpha/clipBlur values
- Check scroll thresholds
- Verify item sizes
- Test with different content

## See Also

- [Container Widgets](container.md) - Basic layout containers
- [Grid Layouts](grid.md) - Grid-based layouts
- [Scroll System](../glw-architecture.md#rendering-pipeline) - Scrolling internals
- [Focus Management](../glw-architecture.md#focus) - Focus system
- [View File Syntax](../view-files/syntax-reference.md) - Complete syntax reference
