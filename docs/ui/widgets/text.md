# Text Widgets

Text widgets display and edit text content in Movian's user interface. They support rich formatting, multiple fonts, and various display modes.

## Overview

Movian provides two primary text widget types:

- **label** - Read-only text display
- **text** - Editable text input field

**Source Reference:** `movian/src/ui/glw/glw_text_bitmap.c`

## Widget Types

### label

Displays static or dynamic text content.

**Properties:**
- **caption**: Text content to display
- **font**: Font family name
- **size**: Font size (in em units or pixels)
- **maxLines**: Maximum number of lines to display
- **maxWidth**: Maximum width in pixels
- **color**: Text color [R, G, B]
- **padding**: Internal padding [left, top, right, bottom]
- **alignment**: Text alignment (left, center, right, justified)

**Example:**
```xml
<label caption="Hello World" 
       font="sans-serif"
       size="1.2"
       color="1.0,1.0,1.0"
       alignment="center"/>
```

**Source:** `glw_text_bitmap.c:1480-1510`

### text

Editable text input field with cursor and keyboard support.

**Properties:**
- All label properties plus:
- **description**: Placeholder/hint text
- **password**: Hide input characters (boolean)
- **fileRequest**: Enable file picker (boolean)
- **dirRequest**: Enable directory picker (boolean)

**Example:**
```xml
<text caption="Enter name"
      description="Your name"
      size="1.0"
      focusable="true"/>
```

**Source:** `glw_text_bitmap.c:1520-1550`

## Common Properties

### caption

The text content to display or edit.

```xml
<label caption="Static Text"/>
```

**Type:** String  
**Binding:** Can be bound to a property for dynamic updates  
**HTML Support:** Supports basic HTML tags when bound to rich text properties

**Source:** `glw_text_bitmap.c:900-950`

### font

Specifies the font family to use.

```xml
<label caption="Text" font="sans-serif"/>
```

**Type:** String  
**Default:** System default font  
**Common Values:** "sans-serif", "serif", "monospace"

**Source:** `glw_text_bitmap.c:1200-1220`

### size

Controls the font size.

```xml
<label caption="Large Text" size="1.5"/>
```

**Type:** Float (em units) or Integer (pixels)  
**Default:** 1.0 (current system size)  
**Scale:** Relative to root font size

**Source:** `glw_text_bitmap.c:1350-1370`

### sizeScale

Alternative way to specify size as a multiplier.

```xml
<label caption="Text" sizeScale="1.2"/>
```

**Type:** Float  
**Default:** 1.0  
**Equivalent to:** size attribute

**Source:** `glw_text_bitmap.c:1380-1400`

### maxLines

Limits the number of text lines displayed.

```xml
<label caption="Long text..." maxLines="3"/>
```

**Type:** Integer  
**Default:** 1  
**Behavior:** Text wraps to fit within line limit

**Source:** `glw_text_bitmap.c:1420-1440`

### maxWidth

Sets maximum width for text rendering.

```xml
<label caption="Text" maxWidth="400"/>
```

**Type:** Integer (pixels)  
**Default:** Unlimited  
**Behavior:** Text wraps at specified width

**Source:** `glw_text_bitmap.c:1410-1420`

### color (RGB)

Sets the text color.

```xml
<label caption="Red Text" color="1.0,0.0,0.0"/>
```

**Type:** Three floats [R, G, B] (0.0 to 1.0)  
**Default:** [1.0, 1.0, 1.0] (white)

**Source:** `glw_text_bitmap.c:1100-1120`

### padding

Internal padding around text content.

```xml
<label caption="Text" padding="10,5,10,5"/>
```

**Type:** Four integers [left, top, right, bottom]  
**Default:** [0, 0, 0, 0]  
**Effect:** Adds space around text within widget bounds

**Source:** `glw_text_bitmap.c:1140-1160`

### alignment

Controls text alignment within the widget.

```xml
<label caption="Centered" alignment="center"/>
```

**Values:**
- `left` - Left-aligned
- `center` - Centered
- `right` - Right-aligned
- `justified` - Justified (multi-line only)
- `top`, `bottom` - Vertical alignment

**Default:** left  
**Source:** `glw_text_bitmap.c:1250-1280`

## Text Formatting Flags

### bold

Renders text in bold weight.

```xml
<label caption="Bold Text" bold="true"/>
```

**Type:** Boolean  
**Default:** false

### italic

Renders text in italic style.

```xml
<label caption="Italic Text" italic="true"/>
```

**Type:** Boolean  
**Default:** false

### outline

Adds an outline effect to text.

```xml
<label caption="Outlined" outline="true"/>
```

**Type:** Boolean  
**Default:** false  
**Effect:** Improves readability on complex backgrounds

### shadow

Adds a drop shadow to text.

```xml
<label caption="Shadow Text" shadow="true"/>
```

**Type:** Boolean  
**Default:** false  
**Effect:** Subtle shadow for depth

**Source:** `glw_text_bitmap.c:1300-1330`

### ellipsize

Truncates text with ellipsis (...) when it exceeds bounds.

```xml
<label caption="Very long text..." ellipsize="true" maxLines="1"/>
```

**Type:** Boolean  
**Default:** false  
**Behavior:** Adds "..." at truncation point

**Source:** `glw_text_bitmap.c:1290-1300`

## Background Properties

### backgroundColor

Sets a background color for the text widget.

```xml
<label caption="Text" backgroundColor="0.2,0.2,0.2"/>
```

**Type:** Three floats [R, G, B]  
**Default:** Transparent

### backgroundAlpha

Controls background opacity.

```xml
<label caption="Text" 
       backgroundColor="0.0,0.0,0.0"
       backgroundAlpha="0.8"/>
```

**Type:** Float (0.0 to 1.0)  
**Default:** 0.0 (transparent)

**Source:** `glw_text_bitmap.c:1130-1140`

## Text Input (text widget)

### Editing Features

The `text` widget supports:
- Cursor positioning with arrow keys
- Character insertion and deletion
- Copy/paste operations
- On-screen keyboard integration

**Keyboard Events:**
- `ACTION_BS` - Backspace/delete
- `ACTION_LEFT` - Move cursor left
- `ACTION_RIGHT` - Move cursor right
- `ACTION_ACTIVATE` - Open on-screen keyboard
- `ACTION_PASTE` - Paste from clipboard

**Source:** `glw_text_bitmap.c:800-900`

### Password Mode

Hides input characters for secure entry.

```xml
<text caption="" 
      description="Enter password"
      password="true"/>
```

**Type:** Boolean  
**Effect:** Displays asterisks (*) instead of actual characters

**Source:** `glw_text_bitmap.c:1050-1070`

### File/Directory Picker

Enables file or directory selection dialogs.

```xml
<text caption="/path/to/file"
      description="Select file"
      fileRequest="true"/>
```

**Properties:**
- `fileRequest` - Enable file picker
- `dirRequest` - Enable directory picker

**Source:** `glw_text_bitmap.c:850-880`

## Property Binding

Text widgets can be bound to properties for dynamic updates.

```xml
<label>
  <bind property="title"/>
</label>
```

**Behavior:**
- Automatically updates when property changes
- Supports rich text (HTML) properties
- Two-way binding for text input widgets

**Source:** `glw_text_bitmap.c:950-1000`

## Text Rendering

### Rendering Pipeline

1. **Text Parsing**: Unicode text is parsed and formatted
2. **Layout**: Text is laid out with wrapping and alignment
3. **Rasterization**: Text is rendered to a texture bitmap
4. **Caching**: Rendered texture is cached for performance
5. **Display**: Texture is drawn to screen

**Source:** `glw_text_bitmap.c:200-400`

### Performance Optimization

- Text is rendered asynchronously on a background thread
- Rendered textures are cached until text or size changes
- Texture resolution adapts to widget size
- Rescaling triggers re-render for optimal quality

**Source:** `glw_text_bitmap.c:600-700`

### Text States

Text widgets progress through rendering states:
- `IDLE` - No content
- `QUEUED_FOR_DIMENSIONING` - Measuring text size
- `DIMENSIONING` - Calculating layout
- `NEED_RENDER` - Requires rendering
- `QUEUED_FOR_RENDERING` - Waiting for render thread
- `RENDERING` - Being rendered
- `VALID` - Rendered and ready

**Source:** `glw_text_bitmap.c:100-120`

## Advanced Features

### Multi-line Text

```xml
<label caption="Line 1&#10;Line 2&#10;Line 3"
       maxLines="5"
       alignment="left"/>
```

**Line Breaks:** Use `&#10;` or `\n` for line breaks  
**Wrapping:** Automatic word wrapping when maxWidth is set

### Rich Text (HTML)

When bound to rich text properties, basic HTML is supported:

```xml
<label>
  <bind property="richText"/>
</label>
```

**Supported Tags:**
- `<b>` - Bold
- `<i>` - Italic
- `<br>` - Line break
- HTML entities (`&amp;`, `&lt;`, etc.)

**Source:** `glw_text_bitmap.c:920-940`

### Dynamic Sizing

Text widgets automatically adjust constraints based on content:

```xml
<label caption="Dynamic"
       maxLines="1"/>
<!-- Widget height adjusts to font size -->
```

**Constraint Behavior:**
- Single-line labels constrain both width and height
- Multi-line labels constrain only height
- Width constraint removed when wrapping is enabled

**Source:** `glw_text_bitmap.c:500-550`

## Common Patterns

### Title Text

```xml
<label caption="Movie Title"
       font="sans-serif"
       size="2.0"
       bold="true"
       alignment="center"
       shadow="true"/>
```

### Body Text

```xml
<label caption="Description text..."
       maxLines="5"
       maxWidth="600"
       size="1.0"
       alignment="justified"/>
```

### Input Field

```xml
<text caption=""
      description="Enter text"
      focusable="true"
      padding="10,5,10,5"
      backgroundColor="0.1,0.1,0.1"
      backgroundAlpha="0.8"/>
```

### Truncated Label

```xml
<label caption="Very long filename.txt"
       maxLines="1"
       ellipsize="true"
       maxWidth="300"/>
```

## Troubleshooting

### Text Not Visible

- Check color matches background
- Verify alpha/opacity settings
- Ensure font is available
- Check if widget has size constraints

### Text Truncated

- Increase maxWidth
- Increase maxLines
- Check parent container constraints
- Enable ellipsize for intentional truncation

### Poor Text Quality

- Text automatically re-renders at optimal resolution
- Avoid scaling text widgets after render
- Use appropriate font sizes
- Enable outline for better readability

## See Also

- [Container Widgets](container.md) - Layout containers
- [Image Widgets](image.md) - Image display
- [View File Syntax](../view-files/syntax-reference.md) - Complete syntax reference
- [Property System](../../plugins/api/prop-api.md) - Property binding
