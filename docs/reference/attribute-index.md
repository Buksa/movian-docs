# GLW Attribute Index

**Status**: 🟢 Verified from source code analysis  
**Last Updated**: 2024-11-08  
**Movian Version**: 4.8+

## Overview

This document provides a comprehensive quick-reference index of all GLW widget attributes available in view files. For detailed information about each attribute, see the [Attributes Reference](../ui/view-files/attributes-reference.md).

**Source Reference**: `movian/src/ui/glw/glw_view_attrib.c`

## Quick Reference Table

### Layout & Positioning

| Attribute | Type | Range/Values | Purpose | Example |
|-----------|------|--------------|---------|---------|
| `width` | int/em | 0+ | Widget width | `width = 100;` |
| `height` | int/em | 0+ | Widget height | `height = 50;` |
| `weight` | float | 0.0+ | Layout weight | `weight = 1.0;` |
| `align` | enum | left/center/right/top/bottom | Alignment | `align = "center";` |
| `padding` | int[4] | [left,top,right,bottom] | Internal spacing | `padding = [10,10,10,10];` |
| `margin` | int[4] | [left,top,right,bottom] | External spacing | `margin = [5,5,5,5];` |
| `spacing` | float | 0+ | Child spacing | `spacing = 10;` |
| `Xspacing` | float | 0+ | Horizontal spacing | `Xspacing = 15;` |
| `Yspacing` | float | 0+ | Vertical spacing | `Yspacing = 10;` |
| `translation` | float[3] | [x,y,z] | 3D translation | `translation = [10,20,0];` |
| `scaling` | float[3] | [x,y,z] | 3D scaling | `scaling = [1.5,1.5,1.0];` |
| `rotation` | float[4] | [angle,x,y,z] | 3D rotation | `rotation = [45,0,0,1];` |
| `zoffset` | int | any | Z-axis offset | `zoffset = 10;` |

### Visual Properties

| Attribute | Type | Range/Values | Purpose | Example |
|-----------|------|--------------|---------|---------|
| `alpha` | float | 0.0-1.0 | Transparency | `alpha = 0.8;` |
| `alphaSelf` | float | 0.0-1.0 | Self transparency | `alphaSelf = 0.5;` |
| `bgalpha` | float | 0.0-1.0 | Background alpha | `bgalpha = 0.3;` |
| `color` | float[3]/hex | RGB or #RRGGBB | Primary color | `color = "#FF0000";` |
| `color1` | float[3] | RGB | Secondary color | `color1 = [1.0,1.0,0.0];` |
| `color2` | float[3] | RGB | Tertiary color | `color2 = [0.0,1.0,1.0];` |
| `bgcolor` | float[3]/hex | RGB or #RRGGBB | Background color | `bgcolor = "#000000";` |
| `blur` | float | 0.0+ | Blur amount | `blur = 5.0;` |
| `saturation` | float | 0.0-1.0 | Color saturation | `saturation = 0.5;` |
| `cornerRadius` | float | 0.0+ | Corner rounding | `cornerRadius = 10;` |

### Content & Media

| Attribute | Type | Range/Values | Purpose | Example |
|-----------|------|--------------|---------|---------|
| `source` | string | URL/path | Content source | `source = "icon.png";` |
| `alt` | string | URL/path | Fallback source | `alt = "fallback.png";` |
| `caption` | string | any | Text content | `caption = "Hello";` |
| `font` | string | font name | Font family | `font = "Arial";` |
| `size` | float | 0+ | Font/element size | `size = 24;` |
| `audioVolume` | float | 0.0-1.0 | Audio volume | `audioVolume = 0.8;` |

### Animation & Transitions

| Attribute | Type | Range/Values | Purpose | Example |
|-----------|------|--------------|---------|---------|
| `time` | float | 0.0+ (seconds) | Animation duration | `time = 0.3;` |
| `transitionTime` | float | 0.0+ (seconds) | Transition duration | `transitionTime = 0.5;` |
| `effect` | enum | blend/flip/slide | Transition effect | `effect = "blend";` |
| `angle` | float | 0-360 (degrees) | Rotation angle | `angle = 45;` |
| `expansion` | float | 0.0-1.0 | Expansion state | `expansion = 1.0;` |

### Interactive Properties

| Attribute | Type | Range/Values | Purpose | Example |
|-----------|------|--------------|---------|---------|
| `value` | float | any | Current value | `value = $volume;` |
| `min` | float | any | Minimum value | `min = 0;` |
| `max` | float | any | Maximum value | `max = 100;` |
| `step` | float | any | Increment step | `step = 1;` |
| `fill` | float | 0.0-1.0 | Fill amount | `fill = $progress;` |
| `priority` | float | any | Widget priority | `priority = 10;` |

### Boolean Flags

| Attribute | Type | Default | Purpose | Example |
|-----------|------|---------|---------|---------|
| `hidden` | bool | false | Hide widget | `hidden = !$visible;` |
| `focusable` | bool | false | Can receive focus | `focusable = true;` |
| `enabled` | bool | true | Widget enabled | `enabled = $canInteract;` |
| `debug` | bool | false | Debug output | `debug = true;` |
| `homogenous` | bool | false | Equal child sizing | `homogenous = true;` |
| `navFocusable` | bool | false | Nav focusable | `navFocusable = true;` |
| `focusOnClick` | bool | false | Focus on click | `focusOnClick = true;` |
| `autoRefocusable` | bool | false | Auto refocus | `autoRefocusable = true;` |
| `filterConstraintX` | bool | false | Ignore X constraints | `filterConstraintX = true;` |
| `filterConstraintY` | bool | false | Ignore Y constraints | `filterConstraintY = true;` |

### Image-Specific Flags

| Attribute | Type | Default | Purpose | Example |
|-----------|------|---------|---------|---------|
| `fixedSize` | bool | false | Don't scale image | `fixedSize = true;` |
| `aspectConstraint` | bool | false | Maintain aspect | `aspectConstraint = true;` |
| `additive` | bool | false | Additive blending | `additive = true;` |
| `borderOnly` | bool | false | Render border only | `borderOnly = true;` |
| `bevelLeft` | bool | false | Bevel left edge | `bevelLeft = true;` |
| `bevelTop` | bool | false | Bevel top edge | `bevelTop = true;` |
| `bevelRight` | bool | false | Bevel right edge | `bevelRight = true;` |
| `bevelBottom` | bool | false | Bevel bottom edge | `bevelBottom = true;` |

### Text-Specific Flags

| Attribute | Type | Default | Purpose | Example |
|-----------|------|---------|---------|---------|
| `bold` | bool | false | Bold text | `bold = true;` |
| `italic` | bool | false | Italic text | `italic = true;` |
| `outline` | bool | false | Text outline | `outline = true;` |
| `ellipsize` | bool | false | Truncate with ... | `ellipsize = true;` |
| `password` | bool | false | Hide text | `password = true;` |
| `maxlines` | int | unlimited | Max text lines | `maxlines = 3;` |

### Video-Specific Flags

| Attribute | Type | Default | Purpose | Example |
|-----------|------|---------|---------|---------|
| `primary` | bool | false | Primary video | `primary = true;` |
| `noAudio` | bool | false | Disable audio | `noAudio = true;` |

### Property References

| Attribute | Type | Purpose | Example |
|-----------|------|---------|---------|
| `args` | propref | Arguments to view | `args = $item;` |
| `self` | propref | Self reference | `self = $currentItem;` |
| `itemModel` | propref | Item model | `itemModel = $item;` |
| `parentModel` | propref | Parent model | `parentModel = $parent.model;` |
| `tentative` | propref | Tentative value | `tentative = $tempValue;` |

### Identification

| Attribute | Type | Purpose | Example |
|-----------|------|---------|---------|
| `id` | string | Widget identifier | `id = "myWidget";` |
| `description` | string | Widget description | `description = "Main area";` |
| `how` | string | How attribute | `how = "method";` |
| `parentUrl` | string | Parent URL | `parentUrl = "parent.view";` |

## Attributes by Widget Type

### All Widgets

**Universal attributes available on all widget types:**

```
id, alpha, alphaSelf, hidden, debug, focusable, enabled, weight, 
width, height, translation, scaling, rotation, zoffset, priority
```

### Container Widgets

**Additional attributes for `container_x`, `container_y`, `container_z`:**

```
spacing, Xspacing, Yspacing, padding, margin, align, homogenous,
filterConstraintX, filterConstraintY, navFocusable, focusOnClick
```

**Example**:
```xml
<container_y spacing="10" padding="[20,20,20,20]" 
             align="center" homogenous="false">
  <!-- Children -->
</container_y>
```

### List Widgets

**Additional attributes for `list_x`, `list_y`:**

```
spacing, childTilesX, childTilesY, scrollThreshold, navWrap,
filterConstraintX, filterConstraintY
```

**Example**:
```xml
<list_y spacing="5" childTilesY="10" navWrap="true">
  <cloner source="$items">
    <!-- Item template -->
  </cloner>
</list_y>
```

### Grid Widget

**Additional attributes for `grid`:**

```
childTilesX, childTilesY, spacing, Xspacing, Yspacing, 
childAspect, childScale
```

**Example**:
```xml
<grid childTilesX="4" childTilesY="3" 
      spacing="10" childAspect="1.777">
  <cloner source="$photos">
    <!-- Photo template -->
  </cloner>
</grid>
```

### Label Widget

**Additional attributes for `label`:**

```
caption, font, size, color, align, maxlines, ellipsize,
bold, italic, outline, sizeScale
```

**Example**:
```xml
<label caption="$item.title" 
       size="24" bold="true" color="#FFFFFF"
       maxlines="2" ellipsize="true"/>
```

### Text Widget

**Additional attributes for `text`:**

```
value, caption, font, size, color, password, focusable,
tentative, maxlines
```

**Example**:
```xml
<text value="$settings.username" 
      focusable="true" size="18"
      onEvent(submit, saveSettings())/>
```

### Image Widget

**Additional attributes for `image`:**

```
source, alt, color, saturation, alpha, aspectConstraint,
fixedSize, bevelLeft, bevelTop, bevelRight, bevelBottom,
additive, borderOnly
```

**Example**:
```xml
<image source="$item.thumbnail" 
       aspectConstraint="true" saturation="1.0"
       bevelLeft="true" bevelRight="true"/>
```

### Video Widget

**Additional attributes for `video`:**

```
source, primary, noAudio, audioVolume
```

**Example**:
```xml
<video source="$page.model.videoUrl" 
       primary="true" audioVolume="1.0"/>
```

### Quad Widget

**Additional attributes for `quad`:**

```
color, color1, color2, alpha, cornerRadius
```

**Example**:
```xml
<quad color="#FF0000" alpha="0.5" cornerRadius="10"/>
```

### Loader Widget

**Additional attributes for `loader`:**

```
source, alt, args, time, effect, autohide
```

**Example**:
```xml
<loader source="$page.model.viewUrl" 
        args="$page.model.data"
        time="0.3" effect="blend" autohide="true"/>
```

### Cloner Widget

**Additional attributes for `cloner`:**

```
source (required - property containing items)
```

**Example**:
```xml
<cloner source="$items">
  <container_x>
    <label caption="$self.title"/>
  </container_x>
</cloner>
```

### Slider Widgets

**Additional attributes for `slider`, `slider_x`, `slider_y`:**

```
value, min, max, step, fill, focusable
```

**Example**:
```xml
<slider value="$settings.volume" 
        min="0" max="100" step="1" focusable="true"/>
```

### Backdrop Widget

**Additional attributes for `backdrop`:**

```
blur, blurFallOff, alpha, color, bgcolor, bgalpha
```

**Example**:
```xml
<backdrop blur="10" alpha="0.8" bgcolor="#000000">
  <!-- Content with blurred background -->
</backdrop>
```

### Rotator Widget

**Additional attributes for `rotator`:**

```
angle, axis (via rotation attribute)
```

**Example**:
```xml
<rotator angle="$time * 360" axis="y">
  <image source="spinner.png"/>
</rotator>
```

### Expander Widget

**Additional attributes for `expander`:**

```
expansion, time
```

**Example**:
```xml
<expander expansion="$expanded ? 1.0 : 0.0" time="0.3">
  <container_y>
    <!-- Expandable content -->
  </container_y>
</expander>
```

## Attributes by Function

### Sizing & Dimensions

**Fixed Sizing**:
```xml
width = 100;
height = 50;
```

**Relative Sizing**:
```xml
width = $parent.width * 0.5;
height = $parent.height - 100;
```

**EM Units** (font-relative):
```xml
width = 10 em;
height = 5 em;
padding = [1 em, 1 em, 1 em, 1 em];
```

**Weight-Based** (flex layout):
```xml
weight = 1.0;  <!-- Takes proportional space -->
```

### Positioning & Transform

**Translation** (move):
```xml
translation = [10, 20, 0];  <!-- x, y, z offset -->
```

**Scaling** (resize):
```xml
scaling = [1.5, 1.5, 1.0];  <!-- x, y, z scale -->
```

**Rotation** (rotate):
```xml
rotation = [45, 0, 0, 1];  <!-- angle, x-axis, y-axis, z-axis -->
```

**Z-Order**:
```xml
zoffset = 10;  <!-- Higher = in front -->
```

### Alignment & Spacing

**Alignment**:
```xml
align = "center";     <!-- Horizontal: left/center/right -->
valign = "middle";    <!-- Vertical: top/middle/bottom -->
```

**Spacing**:
```xml
spacing = 10;         <!-- General spacing -->
Xspacing = 15;        <!-- Horizontal spacing -->
Yspacing = 10;        <!-- Vertical spacing -->
```

**Padding** (internal):
```xml
padding = [10, 10, 10, 10];  <!-- left, top, right, bottom -->
```

**Margin** (external):
```xml
margin = [5, 5, 5, 5];  <!-- left, top, right, bottom -->
```

### Colors & Transparency

**Colors**:
```xml
color = "#FF0000";              <!-- Hex format -->
color = [1.0, 0.0, 0.0];       <!-- RGB float -->
color = 0.5;                    <!-- Grayscale (broadcast) -->
```

**Transparency**:
```xml
alpha = 0.8;                    <!-- Widget + children -->
alphaSelf = 0.5;                <!-- Widget only -->
bgalpha = 0.3;                  <!-- Background only -->
```

**Gradients**:
```xml
color1 = "#FF0000";             <!-- Start color -->
color2 = "#0000FF";             <!-- End color -->
```

### Visual Effects

**Blur**:
```xml
blur = 5.0;                     <!-- Blur amount -->
blurFallOff = 0.5;              <!-- Blur gradient -->
```

**Saturation**:
```xml
saturation = 0.5;               <!-- 0.0 = grayscale, 1.0 = full -->
```

**Corner Rounding**:
```xml
cornerRadius = 10;              <!-- Rounded corners -->
```

**Alpha Effects**:
```xml
alphaFallOff = 0.5;             <!-- Alpha gradient -->
alphaEdges = 0.2;               <!-- Edge alpha -->
```

### Animation & Timing

**Duration**:
```xml
time = 0.3;                     <!-- Animation duration (seconds) -->
transitionTime = 0.5;           <!-- Transition duration -->
```

**Effects**:
```xml
effect = "blend";               <!-- Fade transition -->
effect = "flipHorizontal";      <!-- Flip transition -->
effect = "slideVertical";       <!-- Slide transition -->
```

**Animated Properties**:
```xml
angle = $time * 360;            <!-- Continuous rotation -->
expansion = $expanded ? 1.0 : 0.0;  <!-- Expand/collapse -->
alpha = iir($visible, 4);       <!-- Smooth fade -->
```

### Data Binding

**Property References**:
```xml
caption = $item.title;          <!-- Bind to property -->
source = $item.thumbnail;       <!-- Dynamic source -->
hidden = !$visible;             <!-- Computed visibility -->
```

**Conditional Values**:
```xml
alpha = $enabled ? 1.0 : 0.3;   <!-- Ternary operator -->
color = $selected ? "#FF0000" : "#FFFFFF";
```

**Null Coalescing**:
```xml
caption = $item.title ?? "Untitled";  <!-- Fallback value -->
width = $custom.width ?? 100;
```

### Event Handling

**Event Handlers**:
```xml
onEvent(activate, navOpen($self.url))
onEvent(cancel, goBack())
onEvent(focus, handleFocus())
onEvent(blur, handleBlur())
```

**Common Events**:
- `activate` - User activation (Enter/Click)
- `cancel` - Cancel action (Back/Escape)
- `focus` - Widget gained focus
- `blur` - Widget lost focus
- `itemMenu` - Context menu
- `left/right/up/down` - Navigation

## Attribute Type Reference

### Type Conversion

**Automatic Conversions**:

| From | To | Example |
|------|-----|---------|
| String | Number | `"100"` → `100` |
| Number | String | `123` → `"123"` |
| EM | Pixels | `10 em` → pixels (font-relative) |
| Scalar | Vector | `0.5` → `[0.5, 0.5, 0.5]` |
| Hex | RGB | `"#FF0000"` → `[1.0, 0.0, 0.0]` |

### Type Handlers

| Handler | Accepts | Example Attributes |
|---------|---------|-------------------|
| `set_int()` | int, float, em, string | `width`, `height`, `zoffset` |
| `set_float()` | float, int, em | `alpha`, `blur`, `weight` |
| `set_number()` | int, float, em, string, void | `value`, `min`, `max`, `size` |
| `set_rstring()` | string, int, float, em, void | `caption`, `id`, `font` |
| `set_float3()` | float[3], float, string | `color`, `translation` |
| `set_float4()` | float[4] | `rotation` |
| `set_int16_4()` | int[4] | `padding`, `border` |

## Common Patterns

### Responsive Sizing

```xml
<!-- Percentage-based -->
width = $parent.width * 0.8;
height = $parent.height * 0.5;

<!-- Calculated -->
width = $parent.width - ($padding * 2);
height = $parent.height - $header.height - $footer.height;

<!-- Conditional -->
width = $ui.isTV ? 1920 : 1280;
spacing = $ui.isTV ? 20 : 10;
```

### Conditional Styling

```xml
<!-- Visibility -->
hidden = !$visible;
hidden = $items.count == 0;

<!-- Transparency -->
alpha = $enabled ? 1.0 : 0.3;
alpha = $selected ? 1.0 : 0.5;

<!-- Colors -->
color = $selected ? "#FF0000" : "#FFFFFF";
color = $error ? "#FF0000" : $warning ? "#FFAA00" : "#00FF00";
```

### Smooth Animations

```xml
<!-- Interpolated values -->
alpha = iir($visible, 4);
scaling = [iir($focused, 8) * 0.2 + 1.0, 
           iir($focused, 8) * 0.2 + 1.0, 1.0];

<!-- Timed transitions -->
<loader source="$view" time="0.3" effect="blend"/>
<expander expansion="$expanded ? 1.0 : 0.0" time="0.3"/>
```

### Data-Driven Content

```xml
<!-- Property binding -->
caption = $item.title;
source = $item.thumbnail;
value = $settings.volume;

<!-- Computed values -->
caption = fmt("%d items", $items.count);
width = $item.width ?? 100;
hidden = $item.type != "video";
```

## Performance Considerations

### Attribute Evaluation

**Static** (evaluated once):
```xml
width = 100;
color = "#FF0000";
spacing = 10;
```

**Dynamic** (re-evaluated on change):
```xml
width = $parent.width * 0.5;
alpha = $enabled ? 1.0 : 0.3;
caption = $item.title;
```

**Optimization Tips**:
- Use static values when possible
- Minimize property references in expressions
- Avoid redundant calculations
- Use conditional assignment (`?=`) for defaults

### Expensive Attributes

**High Cost**:
- `blur` - GPU-intensive
- `rotation` - 3D transform calculations
- `displacement` - Shader-based effects
- Complex expressions with many property references

**Medium Cost**:
- `alpha` - Blending calculations
- `scaling` - Transform calculations
- `color` with gradients

**Low Cost**:
- `hidden` - Simple boolean
- `caption` - Text update
- `width/height` - Layout calculation

## Debugging Attributes

### Debug Output

```xml
<container_y debug="true">
  <!-- Prints debug info to console -->
</container_y>
```

### Visual Debugging

```xml
<!-- Add borders to visualize layout -->
<container_y border="[1,1,1,1]" color="#FF0000">
  <!-- Content -->
</container_y>

<!-- Show widget bounds -->
<quad color="#FF0000" alpha="0.2"/>
```

### Identification

```xml
<container_y id="mainContent" description="Main content area">
  <label id="titleLabel" caption="Title"/>
  <image id="thumbnailImage" source="thumb.png"/>
</container_y>
```

## Cross-References

### Related Documentation

- **[Attributes Reference](../ui/view-files/attributes-reference.md)** - Detailed attribute documentation
- **[Elements Reference](../ui/view-files/elements-reference.md)** - Widget types
- **[Element Index](element-index.md)** - Quick element reference
- **[Syntax Reference](../ui/view-files/syntax-reference.md)** - View file syntax
- **[Expressions Guide](../ui/view-files/expressions.md)** - Expression system

### By Topic

**Layout**:
- [Container Widgets](../ui/widgets/container.md)
- [List Widgets](../ui/widgets/list.md)
- [Grid Widgets](../ui/widgets/grid.md)

**Styling**:
- [Theme System](../ui/theming/theme-variables.md)
- [Skin Structure](../ui/theming/skin-structure.md)

**Examples**:
- [Basic Examples](../ui/examples/)
- [Skin Examples](../ui/theming/examples/)

## Accuracy Status

🟢 **Verified**: All attributes verified from source code analysis  
**Source File**: `movian/src/ui/glw/glw_view_attrib.c`  
**Attribute Count**: 80+ documented attributes  
**Version**: Based on Movian source as of 2024-11-08

## See Also

- [Element Index](element-index.md) - Quick element reference
- [API Index](api-index.md) - JavaScript API reference
- [Glossary](glossary.md) - Technical terms
- [Troubleshooting](troubleshooting.md) - Common issues
