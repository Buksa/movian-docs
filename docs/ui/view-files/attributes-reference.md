# GLW View Attributes Reference

**Status**: 🟢 Verified from source code analysis  
**Last Updated**: 2024-11-06  
**Movian Version**: 4.8+

## Overview

This document provides a complete catalog of all attributes that can be set on GLW widgets. All information is derived from direct source code analysis of `glw_view_attrib.c` and related files.

**Source Reference**: `movian/src/ui/glw/glw_view_attrib.c` (1758 lines)

## Attribute Categories

Attributes are organized by type and function:

1. **Layout and Positioning** - Size, position, alignment
2. **Visual Properties** - Colors, transparency, effects
3. **Content and Media** - Sources, captions, fonts
4. **Layout Behavior** - Spacing, scaling, constraints
5. **Animation and Transitions** - Timing, effects
6. **Interactive Properties** - Values, ranges, priorities
7. **Property References** - Data binding
8. **Boolean Flags** - Widget, image, text, video flags

## Layout and Positioning Attributes

### Size Attributes

#### width
- **Type**: Integer (pixels) or EM units
- **Handler**: `set_int()` / `set_em()`
- **Description**: Widget width constraint
- **Example**: `width = 100;` or `width = 10 em;`

#### height
- **Type**: Integer (pixels) or EM units
- **Handler**: `set_int()` / `set_em()`
- **Description**: Widget height constraint
- **Example**: `height = 50;` or `height = 5 em;`

#### weight
- **Type**: Float
- **Handler**: `set_float()`
- **Description**: Layout weight for space distribution
- **Range**: 0.0 to infinity (typically 0.0 to 10.0)
- **Example**: `weight = 1.0;`
- **Note**: Higher weight = more space allocated

### Position Attributes

#### translation
- **Type**: Float vector [x, y, z]
- **Handler**: `set_float3()`
- **Attribute ID**: `GLW_ATTRIB_TRANSLATION`
- **Description**: 3D translation offset
- **Example**: `translation = [10, 20, 0];`

#### scaling
- **Type**: Float vector [x, y, z]
- **Handler**: `set_float3()`
- **Attribute ID**: `GLW_ATTRIB_SCALING`
- **Description**: 3D scaling factors
- **Example**: `scaling = [1.5, 1.5, 1.0];`

#### rotation
- **Type**: Float vector [angle, x, y, z]
- **Handler**: `set_float4()`
- **Attribute ID**: `GLW_ATTRIB_ROTATION`
- **Description**: 3D rotation (angle in degrees, axis vector)
- **Example**: `rotation = [45, 0, 0, 1];`  // 45° around Z-axis

#### zoffset
- **Type**: Integer
- **Handler**: `set_int()`
- **Description**: Z-axis offset for layering
- **Example**: `zoffset = 10;`


### Alignment Attributes

#### align
- **Type**: Enumerated string
- **Handler**: `set_align()`
- **Values**:
  - `center` - Center alignment
  - `left` - Left alignment
  - `right` - Right alignment
  - `top` - Top alignment
  - `bottom` - Bottom alignment
  - `topLeft` - Top-left corner
  - `topRight` - Top-right corner
  - `bottomLeft` - Bottom-left corner
  - `bottomRight` - Bottom-right corner
  - `justified` - Justified alignment (text)
- **Example**: `align = "center";`

### Spacing Attributes

#### margin
- **Type**: Integer vector [left, top, right, bottom]
- **Handler**: `set_margin()`
- **Description**: External spacing around widget
- **Example**: `margin = [10, 5, 10, 5];`

#### padding
- **Type**: Integer vector [left, top, right, bottom]
- **Handler**: `set_int16_4()`
- **Attribute ID**: `GLW_ATTRIB_PADDING`
- **Description**: Internal spacing within widget
- **Example**: `padding = [10, 10, 10, 10];`

#### border
- **Type**: Integer vector [left, top, right, bottom]
- **Handler**: `set_int16_4()`
- **Attribute ID**: `GLW_ATTRIB_BORDER`
- **Description**: Border width on each side
- **Example**: `border = [1, 1, 1, 1];`

## Visual Properties Attributes

### Transparency Attributes

#### alpha
- **Type**: Float
- **Handler**: `set_float()`
- **Range**: 0.0 (transparent) to 1.0 (opaque)
- **Description**: Widget transparency
- **Example**: `alpha = 0.8;`
- **Note**: Affects widget and all children

#### alphaSelf
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_ALPHA_SELF`
- **Range**: 0.0 to 1.0
- **Description**: Widget transparency (self only, not children)
- **Example**: `alphaSelf = 0.5;`

#### bgalpha
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_BACKGROUND_ALPHA`
- **Range**: 0.0 to 1.0
- **Description**: Background transparency
- **Example**: `bgalpha = 0.3;`

#### alphaFallOff
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_ALPHA_FALLOFF`
- **Description**: Alpha gradient falloff
- **Example**: `alphaFallOff = 0.5;`

#### alphaEdges
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_ALPHA_EDGES`
- **Description**: Edge alpha blending
- **Example**: `alphaEdges = 0.2;`

### Color Attributes

#### color
- **Type**: Float vector [r, g, b] or hex string
- **Handler**: `set_float3()`
- **Attribute ID**: `GLW_ATTRIB_RGB`
- **Range**: 0.0 to 1.0 per component
- **Description**: Primary color
- **Examples**:
  - `color = [1.0, 0.0, 0.0];`  // Red
  - `color = "#FF0000";`  // Red (hex)
  - `color = 0.5;`  // Gray (broadcast to all components)

#### color1
- **Type**: Float vector [r, g, b]
- **Handler**: `set_float3()`
- **Attribute ID**: `GLW_ATTRIB_COLOR1`
- **Description**: Secondary color (gradients)
- **Example**: `color1 = [1.0, 1.0, 0.0];`

#### color2
- **Type**: Float vector [r, g, b]
- **Handler**: `set_float3()`
- **Attribute ID**: `GLW_ATTRIB_COLOR2`
- **Description**: Tertiary color (gradients)
- **Example**: `color2 = [0.0, 1.0, 1.0];`

#### bgcolor
- **Type**: Float vector [r, g, b]
- **Handler**: `set_float3()`
- **Attribute ID**: `GLW_ATTRIB_BACKGROUND_COLOR`
- **Description**: Background color
- **Example**: `bgcolor = "#000000";`

### Effect Attributes

#### blur
- **Type**: Float
- **Handler**: `set_float()`
- **Range**: 0.0 (no blur) to higher values
- **Description**: Blur amount
- **Example**: `blur = 5.0;`

#### blurFallOff
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_BLUR_FALLOFF`
- **Description**: Blur gradient falloff
- **Example**: `blurFallOff = 0.5;`

#### saturation
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_SATURATION`
- **Range**: 0.0 (grayscale) to 1.0 (full saturation)
- **Description**: Color saturation
- **Example**: `saturation = 0.5;`

#### cornerRadius
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_RADIUS`
- **Description**: Corner rounding radius
- **Example**: `cornerRadius = 10;`


## Content and Media Attributes

### Source Attributes

#### source
- **Type**: String (URL/path)
- **Handler**: `set_source()`
- **Description**: Content source (image, video, view file)
- **Path Resolution**:
  - `skin://path` - Relative to skin directory
  - `dataroot://path` - Relative to data root
  - Relative paths - Relative to current file
  - Absolute paths - Full file system path
- **Example**: `source = "skin://images/icon.png";`

#### alt
- **Type**: String (URL/path)
- **Handler**: `set_alt()`
- **Description**: Alternative/fallback source
- **Example**: `alt = "fallback.png";`

### Text Attributes

#### caption
- **Type**: String
- **Handler**: `set_caption()`
- **Description**: Text content for labels
- **Example**: `caption = "Hello World";`
- **Note**: Supports property binding: `caption = $item.title;`

#### font
- **Type**: String
- **Handler**: `set_font()`
- **Description**: Font family name
- **Example**: `font = "Arial";`

### Shader Attributes

#### fragmentShader
- **Type**: String
- **Handler**: `set_fs()`
- **Description**: Custom fragment shader code
- **Example**: `fragmentShader = "shader://custom.glsl";`

### Audio Attributes

#### audioVolume
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_AUDIO_VOLUME`
- **Range**: 0.0 (mute) to 1.0 (full volume)
- **Description**: Audio volume level
- **Example**: `audioVolume = 0.8;`

## Layout Behavior Attributes

### Text Layout

#### maxlines
- **Type**: Integer/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_MAX_LINES`
- **Description**: Maximum number of text lines
- **Example**: `maxlines = 3;`

### Scaling Attributes

#### sizeScale
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_SIZE_SCALE`
- **Description**: Overall size scaling factor
- **Example**: `sizeScale = 1.5;`

#### size
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_SIZE`
- **Description**: Base size (context-dependent)
- **Example**: `size = 24;`  // Font size for text

#### maxWidth
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_MAX_WIDTH`
- **Description**: Maximum width constraint
- **Example**: `maxWidth = 500;`

### Child Layout Attributes

#### childAspect
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_CHILD_ASPECT`
- **Description**: Aspect ratio for children
- **Example**: `childAspect = 1.777;`  // 16:9

#### childScale
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_CHILD_SCALE`
- **Description**: Scaling factor for children
- **Example**: `childScale = 0.8;`

#### childTilesX
- **Type**: Integer/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_CHILD_TILES_X`
- **Description**: Number of horizontal tiles/columns
- **Example**: `childTilesX = 4;`

#### childTilesY
- **Type**: Integer/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_CHILD_TILES_Y`
- **Description**: Number of vertical tiles/rows
- **Example**: `childTilesY = 3;`

### Spacing Attributes

#### spacing
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_SPACING`
- **Description**: General spacing between children
- **Example**: `spacing = 10;`

#### Xspacing
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_X_SPACING`
- **Description**: Horizontal spacing between children
- **Example**: `Xspacing = 15;`

#### Yspacing
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_Y_SPACING`
- **Description**: Vertical spacing between children
- **Example**: `Yspacing = 10;`

## Animation and Transition Attributes

### Timing Attributes

#### time
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_TIME`
- **Description**: Animation/transition duration (seconds)
- **Example**: `time = 0.3;`

#### transitionTime
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_TRANSITION_TIME`
- **Description**: Transition duration (seconds)
- **Example**: `transitionTime = 0.5;`

### Animation Attributes

#### angle
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_ANGLE`
- **Description**: Rotation angle (degrees)
- **Example**: `angle = 45;`

#### expansion
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_EXPANSION`
- **Range**: 0.0 (collapsed) to 1.0 (expanded)
- **Description**: Expansion state for expander widget
- **Example**: `expansion = $expanded ? 1.0 : 0.0;`

### Transition Effects

#### effect
- **Type**: Enumerated string
- **Handler**: `set_transition_effect()`
- **Values**:
  - `blend` - Fade transition
  - `flipHorizontal` - Horizontal flip
  - `flipVertical` - Vertical flip
  - `slideHorizontal` - Horizontal slide
  - `slideVertical` - Vertical slide
- **Description**: Transition effect type
- **Example**: `effect = "blend";`


## Interactive Properties Attributes

### Value Attributes

#### value
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_VALUE`
- **Description**: Current value (sliders, inputs)
- **Example**: `value = $settings.volume;`

#### min
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_INT_MIN`
- **Description**: Minimum value
- **Example**: `min = 0;`

#### max
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_INT_MAX`
- **Description**: Maximum value
- **Example**: `max = 100;`

#### step
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_INT_STEP`
- **Description**: Increment step
- **Example**: `step = 1;`

### Control Attributes

#### center
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_CENTER`
- **Description**: Center point for controls
- **Example**: `center = 50;`

#### priority
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_PRIORITY`
- **Description**: Widget priority (focus, rendering)
- **Example**: `priority = 10;`

#### fill
- **Type**: Float/Number
- **Handler**: `set_number()`
- **Attribute ID**: `GLW_ATTRIB_FILL`
- **Description**: Fill amount (progress bars, etc.)
- **Range**: 0.0 to 1.0
- **Example**: `fill = $progress;`

## Property Reference Attributes

### Scope Properties

#### args
- **Type**: Property reference
- **Handler**: `set_args()`
- **Description**: Arguments passed to loaded view
- **Example**: `args = $item;`
- **Note**: Creates `$args` in loaded view's scope

#### self
- **Type**: Property reference
- **Handler**: `set_propref()`
- **Attribute ID**: `GLW_ATTRIB_PROP_SELF`
- **Flag**: `GLW_ATTRIB_FLAG_NO_SUBSCRIPTION`
- **Description**: Self property reference
- **Example**: `self = $currentItem;`

#### itemModel
- **Type**: Property reference
- **Handler**: `set_propref()`
- **Attribute ID**: `GLW_ATTRIB_PROP_ITEM_MODEL`
- **Flag**: `GLW_ATTRIB_FLAG_NO_SUBSCRIPTION`
- **Description**: Item model property
- **Example**: `itemModel = $item;`

#### parentModel
- **Type**: Property reference
- **Handler**: `set_propref()`
- **Attribute ID**: `GLW_ATTRIB_PROP_PARENT_MODEL`
- **Flag**: `GLW_ATTRIB_FLAG_NO_SUBSCRIPTION`
- **Description**: Parent model property
- **Example**: `parentModel = $parent.model;`

#### tentative
- **Type**: Property reference
- **Handler**: `set_propref()`
- **Attribute ID**: `GLW_ATTRIB_TENTATIVE_VALUE`
- **Flag**: `GLW_ATTRIB_FLAG_NO_SUBSCRIPTION`
- **Description**: Tentative value for inputs
- **Example**: `tentative = $tempValue;`

## Boolean Flag Attributes

### Widget Flags (GLW2_*)

These attributes control general widget behavior:

#### hidden
- **Type**: Boolean
- **Handler**: `mod_hidden()`
- **Description**: Hide widget
- **Example**: `hidden = $shouldHide;`

#### filterConstraintX
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_CONSTRAINT_IGNORE_X`
- **Description**: Ignore X-axis constraints
- **Example**: `filterConstraintX = true;`

#### filterConstraintY
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_CONSTRAINT_IGNORE_Y`
- **Description**: Ignore Y-axis constraints
- **Example**: `filterConstraintY = true;`

#### debug
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_DEBUG`
- **Description**: Enable debug output
- **Example**: `debug = true;`

#### focusOnClick
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_FOCUS_ON_CLICK`
- **Description**: Focus widget on click
- **Example**: `focusOnClick = true;`

#### autoRefocusable
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_AUTOREFOCUSABLE`
- **Description**: Can be auto-refocused
- **Example**: `autoRefocusable = true;`

#### navFocusable
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_NAV_FOCUSABLE`
- **Description**: Focusable via navigation
- **Example**: `navFocusable = true;`

#### homogenous
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_HOMOGENOUS`
- **Description**: Children have equal size
- **Example**: `homogenous = true;`

#### enabled
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW2_ENABLED`
- **Description**: Widget is enabled
- **Example**: `enabled = $canInteract;`

### Image Flags (GLW_IMAGE_*)

These attributes control image widget behavior:

#### fixedSize
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_FIXED_SIZE`
- **Target**: `mod_img_flags`
- **Description**: Don't scale image
- **Example**: `fixedSize = true;`

#### bevelLeft
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_BEVEL_LEFT`
- **Target**: `mod_img_flags`
- **Description**: Bevel left edge
- **Example**: `bevelLeft = true;`

#### bevelTop
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_BEVEL_TOP`
- **Target**: `mod_img_flags`
- **Description**: Bevel top edge
- **Example**: `bevelTop = true;`

#### bevelRight
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_BEVEL_RIGHT`
- **Target**: `mod_img_flags`
- **Description**: Bevel right edge
- **Example**: `bevelRight = true;`

#### bevelBottom
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_BEVEL_BOTTOM`
- **Target**: `mod_img_flags`
- **Description**: Bevel bottom edge
- **Example**: `bevelBottom = true;`

#### aspectConstraint
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_SET_ASPECT`
- **Target**: `mod_img_flags`
- **Description**: Maintain aspect ratio
- **Example**: `aspectConstraint = true;`

#### additive
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_ADDITIVE`
- **Target**: `mod_img_flags`
- **Description**: Additive blending
- **Example**: `additive = true;`

#### borderOnly
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_IMAGE_BORDER_ONLY`
- **Target**: `mod_img_flags`
- **Description**: Render border only
- **Example**: `borderOnly = true;`


### Text Flags (GTB_*)

These attributes control text rendering:

#### password
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GTB_PASSWORD`
- **Target**: `mod_text_flags`
- **Description**: Hide text (password mode)
- **Example**: `password = true;`

#### ellipsize
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GTB_ELLIPSIZE`
- **Target**: `mod_text_flags`
- **Description**: Truncate with ellipsis (...)
- **Example**: `ellipsize = true;`

#### bold
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GTB_BOLD`
- **Target**: `mod_text_flags`
- **Description**: Bold text
- **Example**: `bold = true;`

#### italic
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GTB_ITALIC`
- **Target**: `mod_text_flags`
- **Description**: Italic text
- **Example**: `italic = true;`

#### outline
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GTB_OUTLINE`
- **Target**: `mod_text_flags`
- **Description**: Text outline
- **Example**: `outline = true;`

### Video Flags (GLW_VIDEO_*)

These attributes control video widget behavior:

#### primary
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_VIDEO_PRIMARY`
- **Target**: `mod_video_flags`
- **Description**: Primary video stream
- **Example**: `primary = true;`

#### noAudio
- **Type**: Boolean
- **Handler**: `mod_flag()`
- **Flag**: `GLW_VIDEO_NO_AUDIO`
- **Target**: `mod_video_flags`
- **Description**: Disable audio
- **Example**: `noAudio = true;`

## Identifier Attributes

### Widget Identification

#### id
- **Type**: String
- **Handler**: `set_rstring()` → `set_id_rstr()`
- **Description**: Widget identifier
- **Example**: `id = "myWidget";`
- **Note**: Used for debugging and widget lookup

#### how
- **Type**: String
- **Handler**: `set_rstring()` → `set_how_rstr()`
- **Description**: How attribute (context-dependent)
- **Example**: `how = "method";`

#### description
- **Type**: String
- **Handler**: `set_rstring()` → `set_description_rstr()`
- **Description**: Widget description
- **Example**: `description = "Main content area";`

#### parentUrl
- **Type**: String
- **Handler**: `set_rstring()` → `set_parent_url_rstr()`
- **Description**: Parent URL reference
- **Example**: `parentUrl = "parent.view";`

## Type Conversion

### Automatic Type Conversion

The attribute system provides automatic type conversion:

#### String to Number
```c
width = "100";  // Converted to integer 100
```

#### Number to String
```c
caption = 123;  // Converted to string "123"
```

#### EM to Pixels
```c
width = 10 em;  // Converted to pixels based on font size
// Requires dynamic evaluation
```

#### Scalar to Vector
```c
color = 0.5;  // Broadcast to [0.5, 0.5, 0.5]
```

#### Hex String to Color
```c
color = "#FF0000";  // Parsed to [1.0, 0.0, 0.0]
```

### Type Handlers

| Handler | Accepted Types | Description |
|---------|----------------|-------------|
| `set_int()` | INT, FLOAT, EM, CSTRING | Integer values |
| `set_float()` | FLOAT, INT, EM | Float values |
| `set_number()` | INT, FLOAT, EM, CSTRING, VOID | Numeric values |
| `set_rstring()` | RSTRING, CSTRING, INT, FLOAT, EM, VOID | String values |
| `set_float3()` | VECTOR_FLOAT, FLOAT, RSTRING | 3-component vectors |
| `set_float4()` | VECTOR_FLOAT | 4-component vectors |
| `set_int16_4()` | INT array | 4-component integer vectors |

## EM Unit Handling

### Dynamic Evaluation

EM units require dynamic evaluation because they depend on current font size:

```c
width = 10 em;  // Re-evaluated when font size changes
```

**Evaluation Flag**: `GLW_VIEW_EVAL_EM`

### EM-Aware Widgets

Widgets can handle EM units natively through `gc_set_em()` callback:

```c
// Widget class provides EM handler
r = gc->gc_set_em ? gc->gc_set_em(w, attrib, value) : -1;

// Fallback to pixel conversion
if(r == -1) {
  value *= gr->gr_current_size;  // Convert to pixels
  r = gc->gc_set_float(w, attrib, value, NULL);
}
```

## Attribute Resolution

### Resolution Process

1. **Parse attribute name**: `"width"` → token
2. **Lookup in attribute table**: Find `token_attrib_t` entry
3. **Call handler**: `set_int()`, `set_float()`, etc.
4. **Widget-specific processing**: Widget class handles attribute
5. **Refresh notification**: Mark widget for layout/render update

### Fallback Mechanism

If widget doesn't support an attribute type:

1. Try primary handler (e.g., `gc_set_float`)
2. Try alternative handler (e.g., `gc_set_int` with conversion)
3. Try unresolved handler (`gc_set_rstr_unresolved`)
4. Report error if no handler accepts

### Refresh Types

Attribute changes trigger appropriate refresh:

- `GLW_REFRESH_LAYOUT_ONLY` - Layout recalculation only
- `GLW_REFRESH_FLAG_LAYOUT | GLW_REFRESH_FLAG_RENDER` - Full refresh

## Attribute Optimization

### Static Assignment Optimization

Simple static assignments are optimized:

**Before Optimization**:
```
RPN: [attribute] [value] [assignment]
```

**After Optimization**:
```
[value with attribute pointer] → next
```

**Conditions**:
- Must be `TOKEN_PURE_RPN` (no dynamic evaluation)
- Simple value types: FLOAT, INT, CSTRING, RSTRING, IDENTIFIER
- Static assignment (no property references)

### Flag Merging

Multiple flag operations are merged into single operations:

```c
// Multiple flag sets
hidden = true;
enabled = false;
debug = true;

// Optimized to single operation
// Sets all flags at once
```

**Benefits**:
- Reduces widget method calls
- Minimizes refresh operations
- Improves performance

## Widget Integration

### Widget Class Interface

Widgets implement attribute handlers:

```c
typedef struct glw_class {
  int (*gc_set_int)(glw_t *w, int attrib, int value, glw_style_t *origin);
  int (*gc_set_float)(glw_t *w, int attrib, float value, glw_style_t *origin);
  int (*gc_set_float3)(glw_t *w, int attrib, const float *value, glw_style_t *origin);
  int (*gc_set_float4)(glw_t *w, int attrib, const float *value);
  int (*gc_set_int16_4)(glw_t *w, int attrib, const int16_t *value, glw_style_t *origin);
  int (*gc_set_rstr)(glw_t *w, int attrib, rstr_t *value, glw_style_t *origin);
  int (*gc_set_em)(glw_t *w, int attrib, float value);
  // ... more handlers
} glw_class_t;
```

### Return Values

Handler return values indicate success/failure:

- **0**: Success, attribute handled
- **-1**: Not handled, try alternative
- **GLW_REFRESH_***: Success with specific refresh type

## Common Patterns

### Conditional Attributes

```c
alpha = $enabled ? 1.0 : 0.3;
hidden = !$visible;
color = $selected ? "#FF0000" : "#FFFFFF";
```

### Property Binding

```c
caption = $item.title;
width = $parent.width * 0.5;
source = $item.thumbnail;
```

### Dynamic Sizing

```c
width = $parent.width - 20;
height = $parent.height / 2;
size = $ui.fontSize * 1.5;
```

### Responsive Layout

```c
spacing = $ui.isTV ? 20 : 10;
childTilesX = $ui.width > 1920 ? 6 : 4;
```

## Best Practices

### Performance

**Prefer Static Values**:
```c
// Good: Static, evaluated once
width = 100;

// Avoid if possible: Dynamic, re-evaluated
width = $constant;  // If truly constant
```

**Minimize Property References**:
```c
// Good: Single reference
alpha = $enabled ? 1.0 : 0.3;

// Avoid: Redundant references
alpha = $enabled && $enabled ? 1.0 : 0.3;
```

### Readability

**Use Descriptive IDs**:
```c
id = "mainContentArea";
id = "navigationMenu";
```

**Group Related Attributes**:
```c
// Layout
width = 100;
height = 50;
padding = [10, 10, 10, 10];

// Visual
color = "#FF0000";
alpha = 0.8;
blur = 2.0;
```

### Maintainability

**Use Constants**:
```c
// Define in parent scope
$buttonWidth = 100;
$buttonHeight = 40;

// Use in children
width = $buttonWidth;
height = $buttonHeight;
```

**Comment Complex Expressions**:
```c
// Calculate width: parent width minus padding and margins
width = $parent.width - ($padding * 2) - ($margin * 2);
```

## Error Handling

### Common Errors

**Type Mismatch**:
```c
width = "not a number";  // Error: Expected numeric value
```

**Unknown Attribute**:
```c
unknownAttr = 100;  // Error: Attribute not recognized
```

**Invalid Value**:
```c
align = "invalid";  // Error: Not a valid alignment value
```

### Error Reporting

Errors include context:
- File name
- Line number
- Attribute name
- Expected vs actual type
- Widget type

**Example**:
```
Error views/main.view:42: Widget container_x does not respond to attribute 'invalidAttr'
```

## Accuracy Status

🟢 **Verified**: All attributes verified from source code analysis  
**Source File**: `movian/src/ui/glw/glw_view_attrib.c` (1758 lines)  
**Attribute Count**: 80+ documented attributes  
**Version**: Based on Movian source as of 2024-11-06

## See Also

- [Syntax Reference](syntax-reference.md) - View file syntax
- [Elements Reference](elements-reference.md) - Widget types
- [Expressions Guide](expressions.md) - Expression system
- [Source Analysis](../source-analysis/glw_view_attrib.c.md) - Technical details
