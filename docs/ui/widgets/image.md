# Image Widgets

Image widgets display graphics, icons, and visual content in Movian's user interface. They support various image formats, scaling modes, and visual effects.

## Overview

Movian provides several image widget types for different use cases:

- **image** - Standard image display with aspect ratio preservation
- **icon** - Fixed-size icons with automatic scaling
- **backdrop** - Background images with child content support
- **frontdrop** - Foreground images with child content support
- **repeatedimage** - Tiled/repeated image patterns

**Source Reference:** `movian/src/ui/glw/glw_image.c`

## Widget Types

### image

Standard image widget that preserves aspect ratio and scales to fit.

**Properties:**
- **source**: Image URL or file path
- **aspect**: Force specific aspect ratio
- **angle**: Rotation angle in degrees
- **saturation**: Color saturation (0.0 to 1.0)
- **alpha**: Opacity (0.0 to 1.0)
- **color**: Color tint [R, G, B]

**Example:**
```xml
<image source="poster.jpg"
       aspect="0.667"
       alignment="center"/>
```

**Source:** `glw_image.c:1450-1480`

### icon

Fixed or scaled icon display, typically for UI elements.

**Properties:**
- **source**: Icon image URL
- **size**: Fixed size in pixels or em units
- **sizeScale**: Size multiplier relative to system size
- **color**: Icon tint color

**Example:**
```xml
<icon source="play-icon.png"
      size="48"
      color="1.0,1.0,1.0"/>
```

**Behavior:**
- Automatically scales with system font size
- Maintains square aspect ratio
- Optimized for small graphics

**Source:** `glw_image.c:1490-1520`

### backdrop

Background image that can contain child widgets.

**Properties:**
- **source**: Background image URL
- **border**: Border widths for 9-patch scaling [left, top, right, bottom]
- **padding**: Internal padding for children

**Example:**
```xml
<backdrop source="panel-bg.png"
          border="10,10,10,10"
          padding="15,15,15,15">
  <label caption="Content"/>
</backdrop>
```

**Use Cases:**
- Panel backgrounds
- Dialog boxes
- Decorated containers

**Source:** `glw_image.c:1530-1560`

### frontdrop

Foreground image rendered on top of child content.

**Properties:**
- Same as backdrop
- Children render behind the image

**Example:**
```xml
<frontdrop source="frame.png"
           border="20,20,20,20">
  <image source="photo.jpg"/>
</frontdrop>
```

**Use Cases:**
- Decorative frames
- Overlay effects
- Borders and edges

**Source:** `glw_image.c:1570-1600`

### repeatedimage

Tiles an image to fill the widget area.

**Properties:**
- **source**: Image to tile
- **color**: Tint color
- **alpha**: Opacity

**Example:**
```xml
<repeatedimage source="pattern.png"
               alpha="0.3"/>
```

**Use Cases:**
- Background patterns
- Textures
- Decorative fills

**Source:** `glw_image.c:1610-1640`

## Common Properties

### source

Specifies the image file to display.

```xml
<image source="http://example.com/image.jpg"/>
<image source="file:///path/to/local/image.png"/>
<image source="theme://icon.png"/>
```

**Type:** String (URL or file path)  
**Protocols:** http://, https://, file://, theme://  
**Formats:** JPEG, PNG, GIF, BMP, WebP

**Source:** `glw_image.c:1200-1250`

### aspect

Forces a specific aspect ratio for the image.

```xml
<image source="photo.jpg" aspect="1.777"/>
<!-- 16:9 aspect ratio -->
```

**Type:** Float (width/height ratio)  
**Behavior:** Image scales to maintain specified aspect  
**Constraint:** Sets width constraint based on height

**Source:** `glw_image.c:1320-1340`

### angle

Rotates the image by specified degrees.

```xml
<image source="arrow.png" angle="90"/>
```

**Type:** Float (degrees)  
**Range:** 0 to 360  
**Rotation:** Clockwise from original orientation

**Source:** `glw_image.c:1300-1310`

### color (RGB)

Applies a color tint to the image.

```xml
<image source="icon.png" color="1.0,0.5,0.0"/>
<!-- Orange tint -->
```

**Type:** Three floats [R, G, B] (0.0 to 1.0)  
**Default:** [1.0, 1.0, 1.0] (no tint)  
**Effect:** Multiplies image colors

**Source:** `glw_image.c:1100-1120`

### saturation

Controls color saturation level.

```xml
<image source="photo.jpg" saturation="0.5"/>
<!-- 50% desaturated -->
```

**Type:** Float (0.0 to 1.0)  
**Values:**
- 0.0 = Grayscale
- 0.5 = Half saturation
- 1.0 = Full color (default)

**Source:** `glw_image.c:1310-1320`

### alpha / alphaSelf

Controls image opacity.

```xml
<image source="overlay.png" alpha="0.7"/>
```

**Type:** Float (0.0 to 1.0)  
**Default:** 1.0 (fully opaque)  
**Inheritance:** Multiplied with parent alpha

**Source:** `glw_image.c:1340-1350`

## Advanced Properties

### border (9-Patch Scaling)

Defines border regions for scalable panels.

```xml
<backdrop source="panel.png"
          border="20,20,20,20">
  <!-- Content -->
</backdrop>
```

**Type:** Four integers [left, top, right, bottom]  
**Behavior:**
- Corners remain fixed size
- Edges stretch in one direction
- Center stretches in both directions

**Mode Flags:**
- `borderLeft`, `borderRight` - Enable horizontal borders
- `borderTop`, `borderBottom` - Enable vertical borders
- `borderOnly` - Render only borders, not center

**Source:** `glw_image.c:1180-1200`

### padding

Internal padding for child content (backdrop/frontdrop).

```xml
<backdrop source="bg.png"
          padding="10,15,10,15">
  <label caption="Padded content"/>
</backdrop>
```

**Type:** Four integers [left, top, right, bottom]  
**Effect:** Offsets child widget positioning

**Source:** `glw_image.c:1160-1180`

### radius

Applies rounded corners to the image.

```xml
<image source="avatar.jpg" radius="10"/>
```

**Type:** Integer (pixels)  
**Effect:** Corner radius for rounded rectangles  
**Performance:** Requires image re-processing

**Source:** `glw_image.c:1380-1390`

### shadow

Adds a drop shadow effect.

```xml
<image source="card.png" shadow="true"/>
```

**Type:** Boolean  
**Effect:** Subtle shadow for depth  
**Performance:** Requires additional rendering

**Source:** `glw_image.c:1250-1270`

### alphaEdges

Creates soft edges with alpha gradient.

```xml
<image source="photo.jpg" alphaEdges="20"/>
```

**Type:** Integer (pixels)  
**Effect:** Fades image edges to transparent  
**Use Case:** Smooth blending with background

**Source:** `glw_image.c:1400-1420`

## Image Loading

### Loading States

Images progress through loading states:
- **Loading** - Image is being fetched/decoded
- **Loaded** - Image ready for display
- **Error** - Failed to load image

**Status Signal:** `GLW_SIGNAL_STATUS_CHANGED`

**Source:** `glw_image.c:150-180`

### Automatic Scaling

Images are automatically scaled to optimal resolution:

```xml
<image source="large-photo.jpg"/>
<!-- Automatically downscaled to widget size -->
```

**Behavior:**
- Images larger than widget are downscaled
- Images smaller than widget can be upscaled
- Resolution adapts when widget size changes
- Maintains aspect ratio

**Source:** `glw_image.c:900-1000`

### Caching

- Loaded images are cached in memory
- Multiple widgets can share the same image
- Cache automatically manages memory
- Images reload when source changes

**Source:** `glw_image.c:700-750`

## Visual Effects

### Additive Blending

Renders image with additive blend mode.

```xml
<image source="glow.png" additive="true"/>
```

**Type:** Boolean  
**Effect:** Colors add to background (glow effect)  
**Use Case:** Light effects, glows, highlights

### Fixed Size

Prevents image from scaling.

```xml
<image source="icon.png" fixedSize="true"/>
```

**Type:** Boolean  
**Effect:** Image displays at original pixel dimensions  
**Constraint:** Sets exact width/height constraints

**Source:** `glw_image.c:1140-1160`

### Set Aspect

Constrains widget to image aspect ratio.

```xml
<image source="photo.jpg" setAspect="true"/>
```

**Type:** Boolean  
**Effect:** Widget dimensions follow image aspect  
**Use Case:** Responsive image containers

**Source:** `glw_image.c:1350-1370`

## Icon-Specific Features

### Size Scaling

Icons automatically scale with system font size:

```xml
<icon source="icon.png" sizeScale="1.5"/>
<!-- 1.5x system size -->
```

**Type:** Float  
**Default:** 1.0  
**Behavior:** Scales relative to root font size

**Source:** `glw_image.c:1280-1300`

### Fixed Icon Size

Override automatic scaling:

```xml
<icon source="icon.png" size="64"/>
```

**Type:** Integer (pixels)  
**Effect:** Fixed pixel size regardless of system scale

**Source:** `glw_image.c:1390-1410`

## Performance Considerations

### Image Resolution

- Use appropriately sized images for display size
- Avoid loading very large images for small widgets
- System automatically downscales but uses memory

### Texture Memory

- Each unique image consumes GPU texture memory
- Shared images (same source) use single texture
- Consider image dimensions and format

### Loading Performance

- Remote images (HTTP) load asynchronously
- Local images load faster
- Image decoding happens on background thread

**Source:** `glw_image.c:600-650`

## Common Patterns

### Poster Display

```xml
<image source="movie-poster.jpg"
       aspect="0.667"
       alignment="center"
       shadow="true"/>
```

### Icon Button

```xml
<container_z focusable="true">
  <icon source="play-icon.png"
        size="48"
        color="1.0,1.0,1.0"/>
</container_z>
```

### Panel Background

```xml
<backdrop source="panel-bg.png"
          border="15,15,15,15"
          padding="20,20,20,20">
  <container_y>
    <label caption="Title"/>
    <label caption="Content"/>
  </container_y>
</backdrop>
```

### Avatar with Rounded Corners

```xml
<image source="avatar.jpg"
       radius="50"
       aspect="1.0"
       alignment="center"/>
```

### Decorative Frame

```xml
<frontdrop source="ornate-frame.png"
           border="30,30,30,30"
           padding="25,25,25,25">
  <image source="photo.jpg"/>
</frontdrop>
```

### Background Pattern

```xml
<repeatedimage source="texture.png"
               alpha="0.2"
               color="0.5,0.5,0.5"/>
```

## Troubleshooting

### Image Not Displaying

- Verify source URL is correct and accessible
- Check image format is supported
- Ensure widget has size constraints
- Check alpha/opacity settings

### Image Stretched/Distorted

- Use `aspect` property to maintain ratio
- Check parent container constraints
- Verify alignment settings
- Consider using `setAspect="true"`

### Poor Image Quality

- Use higher resolution source images
- Avoid excessive upscaling
- Check if image is being downscaled too much
- System automatically re-renders at optimal size

### Slow Loading

- Use local images when possible
- Optimize image file sizes
- Consider image dimensions
- Check network connectivity for remote images

## See Also

- [Container Widgets](container.md) - Layout containers
- [Text Widgets](text.md) - Text display
- [View File Syntax](../view-files/syntax-reference.md) - Complete syntax reference
- [Texture System](../glw-architecture.md) - Image loading and caching
