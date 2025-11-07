# GLW View Attributes Analysis (glw_view_attrib.c)

**File**: `movian/src/ui/glw/glw_view_attrib.c`  
**Purpose**: Complete attribute system for GLW widgets, handles all widget properties  
**Lines**: 1758 lines  
**Last Analyzed**: 2024-11-06

## Overview

The GLW view attribute system is the comprehensive property management layer for all GLW widgets. It defines every attribute that can be set on widgets, handles type conversion, validation, and provides the interface between view file expressions and widget implementations.

## Core Architecture

### Attribute Definition Structure
```c
typedef struct token_attrib {
  const char *name;                    // Attribute name (e.g., "width", "alpha")
  int (*set)(glw_view_eval_context_t *ec, const token_attrib_t *a, struct token *t);
  int attrib;                          // Attribute ID constant
  void *fn;                           // Type-specific setter function
  int flags;                          // Attribute flags
} token_attrib_t;
```

### Attribute Categories

#### 1. String Attributes
**Handler**: `set_rstring()`  
**Supported Types**: `TOKEN_CSTRING`, `TOKEN_RSTRING`, `TOKEN_URI`, `TOKEN_INT`, `TOKEN_FLOAT`, `TOKEN_EM`

```c
{"id",              set_rstring, 0, set_id_rstr},
{"how",             set_rstring, 0, set_how_rstr},
{"description",     set_rstring, 0, set_description_rstr},
{"parentUrl",       set_rstring, 0, set_parent_url_rstr},
```

#### 2. Numeric Attributes
**Handler**: `set_number()`, `set_int()`, `set_float()`  
**Supports**: Integer, float, EM units with automatic conversion

```c
{"alpha",           set_float,  0, glw_set_alpha},
{"blur",            set_float,  0, glw_set_blur},
{"weight",          set_float,  0, glw_set_weight},
{"height",          set_int,    0, glw_set_height},
{"width",           set_int,    0, glw_set_width},
```

#### 3. Vector Attributes
**Handlers**: `set_float3()`, `set_float4()`, `set_int16_4()`

```c
{"color",           set_float3, GLW_ATTRIB_RGB},
{"translation",     set_float3, GLW_ATTRIB_TRANSLATION},
{"scaling",         set_float3, GLW_ATTRIB_SCALING},
{"rotation",        set_float4, GLW_ATTRIB_ROTATION},
{"padding",         set_int16_4, GLW_ATTRIB_PADDING},
{"margin",          set_margin},
```

#### 4. Boolean Flag Attributes
**Handler**: `mod_flag()`  
**Categories**: Widget flags, image flags, text flags, video flags

```c
// Widget Flags (GLW2_*)
{"hidden",                mod_hidden},
{"filterConstraintX",     mod_flag, GLW2_CONSTRAINT_IGNORE_X,    mod_flags2},
{"filterConstraintY",     mod_flag, GLW2_CONSTRAINT_IGNORE_Y,    mod_flags2},
{"debug",                 mod_flag, GLW2_DEBUG,                  mod_flags2},
{"focusOnClick",          mod_flag, GLW2_FOCUS_ON_CLICK,         mod_flags2},
{"autoRefocusable",       mod_flag, GLW2_AUTOREFOCUSABLE,        mod_flags2},
{"navFocusable",          mod_flag, GLW2_NAV_FOCUSABLE,          mod_flags2},
{"homogenous",            mod_flag, GLW2_HOMOGENOUS,             mod_flags2},
{"enabled",               mod_flag, GLW2_ENABLED,                mod_flags2},

// Image Flags (GLW_IMAGE_*)
{"fixedSize",       mod_flag, GLW_IMAGE_FIXED_SIZE,   mod_img_flags},
{"bevelLeft",       mod_flag, GLW_IMAGE_BEVEL_LEFT,   mod_img_flags},
{"bevelTop",        mod_flag, GLW_IMAGE_BEVEL_TOP,    mod_img_flags},
{"bevelRight",      mod_flag, GLW_IMAGE_BEVEL_RIGHT,  mod_img_flags},
{"bevelBottom",     mod_flag, GLW_IMAGE_BEVEL_BOTTOM, mod_img_flags},
{"aspectConstraint",mod_flag, GLW_IMAGE_SET_ASPECT,   mod_img_flags},
{"additive",        mod_flag, GLW_IMAGE_ADDITIVE,     mod_img_flags},
{"borderOnly",      mod_flag, GLW_IMAGE_BORDER_ONLY,  mod_img_flags},

// Text Flags (GTB_*)
{"password",        mod_flag,  GTB_PASSWORD, mod_text_flags},
{"ellipsize",       mod_flag,  GTB_ELLIPSIZE, mod_text_flags},
{"bold",            mod_flag,  GTB_BOLD, mod_text_flags},
{"italic",          mod_flag,  GTB_ITALIC, mod_text_flags},
{"outline",         mod_flag,  GTB_OUTLINE, mod_text_flags},

// Video Flags (GLW_VIDEO_*)
{"primary",         mod_flag, GLW_VIDEO_PRIMARY, mod_video_flags},
{"noAudio",         mod_flag, GLW_VIDEO_NO_AUDIO, mod_video_flags},
```

#### 5. Enumerated Attributes
**Handler**: `set_align()`, `set_transition_effect()`

```c
// Alignment Values
static struct strtab aligntab[] = {
  { "center",        LAYOUT_ALIGN_CENTER},
  { "left",          LAYOUT_ALIGN_LEFT},
  { "right",         LAYOUT_ALIGN_RIGHT},
  { "top",           LAYOUT_ALIGN_TOP},
  { "bottom",        LAYOUT_ALIGN_BOTTOM},
  { "topLeft",       LAYOUT_ALIGN_TOP_LEFT},
  { "topRight",      LAYOUT_ALIGN_TOP_RIGHT},
  { "bottomLeft",    LAYOUT_ALIGN_BOTTOM_LEFT},
  { "bottomRight",   LAYOUT_ALIGN_BOTTOM_RIGHT},
  { "justified",     LAYOUT_ALIGN_JUSTIFIED},
};

// Transition Effects
static struct strtab transitiontab[] = {
  { "blend",             GLW_TRANS_BLEND},
  { "flipHorizontal",    GLW_TRANS_FLIP_HORIZONTAL},
  { "flipVertical",      GLW_TRANS_FLIP_VERTICAL},
  { "slideHorizontal",   GLW_TRANS_SLIDE_HORIZONTAL},
  { "slideVertical",     GLW_TRANS_SLIDE_VERTICAL},
};
```

## Complete Attribute Catalog

### Layout and Positioning
```c
{"width",           set_int,    0, glw_set_width},
{"height",          set_int,    0, glw_set_height},
{"weight",          set_float,  0, glw_set_weight},
{"align",           set_align,  0},
{"margin",          set_margin},
{"padding",         set_int16_4, GLW_ATTRIB_PADDING},
{"border",          set_int16_4, GLW_ATTRIB_BORDER},
{"translation",     set_float3, GLW_ATTRIB_TRANSLATION},
{"scaling",         set_float3, GLW_ATTRIB_SCALING},
{"rotation",        set_float4, GLW_ATTRIB_ROTATION},
{"zoffset",         set_int,    0, glw_set_zoffset},
```

### Visual Properties
```c
{"alpha",           set_float,  0, glw_set_alpha},
{"blur",            set_float,  0, glw_set_blur},
{"color",           set_float3, GLW_ATTRIB_RGB},
{"color1",          set_float3, GLW_ATTRIB_COLOR1},
{"color2",          set_float3, GLW_ATTRIB_COLOR2},
{"bgcolor",         set_float3, GLW_ATTRIB_BACKGROUND_COLOR},
{"saturation",      set_number, GLW_ATTRIB_SATURATION},
{"alphaSelf",       set_number, GLW_ATTRIB_ALPHA_SELF},
{"bgalpha",         set_number, GLW_ATTRIB_BACKGROUND_ALPHA},
{"alphaFallOff",    set_number, GLW_ATTRIB_ALPHA_FALLOFF},
{"blurFallOff",     set_number, GLW_ATTRIB_BLUR_FALLOFF},
{"alphaEdges",      set_number, GLW_ATTRIB_ALPHA_EDGES},
{"cornerRadius",    set_number, GLW_ATTRIB_RADIUS},
```

### Content and Media
```c
{"source",          set_source},
{"alt",             set_alt},
{"caption",         set_caption, 0},
{"font",            set_font, 0},
{"fragmentShader",  set_fs, 0},
{"audioVolume",     set_number, GLW_ATTRIB_AUDIO_VOLUME},
```

### Layout Behavior
```c
{"maxlines",        set_number, GLW_ATTRIB_MAX_LINES},
{"sizeScale",       set_number, GLW_ATTRIB_SIZE_SCALE},
{"size",            set_number, GLW_ATTRIB_SIZE},
{"maxWidth",        set_number, GLW_ATTRIB_MAX_WIDTH},
{"childAspect",     set_number, GLW_ATTRIB_CHILD_ASPECT},
{"childScale",      set_number, GLW_ATTRIB_CHILD_SCALE},
{"childTilesX",     set_number, GLW_ATTRIB_CHILD_TILES_X},
{"childTilesY",     set_number, GLW_ATTRIB_CHILD_TILES_Y},
{"spacing",         set_number, GLW_ATTRIB_SPACING},
{"Xspacing",        set_number, GLW_ATTRIB_X_SPACING},
{"Yspacing",        set_number, GLW_ATTRIB_Y_SPACING},
```

### Animation and Transitions
```c
{"time",            set_number, GLW_ATTRIB_TIME},
{"transitionTime",  set_number, GLW_ATTRIB_TRANSITION_TIME},
{"angle",           set_number, GLW_ATTRIB_ANGLE},
{"expansion",       set_number, GLW_ATTRIB_EXPANSION},
{"effect",          set_transition_effect,  0},
```

### Interactive Properties
```c
{"min",             set_number, GLW_ATTRIB_INT_MIN},
{"max",             set_number, GLW_ATTRIB_INT_MAX},
{"step",            set_number, GLW_ATTRIB_INT_STEP},
{"value",           set_number, GLW_ATTRIB_VALUE},
{"center",          set_number, GLW_ATTRIB_CENTER},
{"priority",        set_number, GLW_ATTRIB_PRIORITY},
{"fill",            set_number, GLW_ATTRIB_FILL},
```

### Property References
```c
{"args",            set_args},
{"self",            set_propref, GLW_ATTRIB_PROP_SELF, NULL,
 GLW_ATTRIB_FLAG_NO_SUBSCRIPTION},
{"itemModel",       set_propref, GLW_ATTRIB_PROP_ITEM_MODEL, NULL,
 GLW_ATTRIB_FLAG_NO_SUBSCRIPTION},
{"parentModel",     set_propref, GLW_ATTRIB_PROP_PARENT_MODEL, NULL,
 GLW_ATTRIB_FLAG_NO_SUBSCRIPTION},
{"tentative",       set_propref, GLW_ATTRIB_TENTATIVE_VALUE, NULL,
 GLW_ATTRIB_FLAG_NO_SUBSCRIPTION},
```

## Type Conversion System

### Automatic Type Conversion
The attribute system provides automatic conversion between compatible types:

#### String Conversion (`set_rstring`)
```c
switch(t->type) {
  case TOKEN_VOID:
    buf[0] = 0;  // Empty string
    break;
  case TOKEN_CSTRING:
    rstr = rstr_alloc(t->t_cstring);
    break;
  case TOKEN_INT:
    snprintf(buf, sizeof(buf), "%d", t->t_int);
    break;
  case TOKEN_FLOAT:
    snprintf(buf, sizeof(buf), "%f", t->t_float);
    break;
  case TOKEN_EM:
    ec->dynamic_eval |= GLW_VIEW_EVAL_EM;
    snprintf(buf, sizeof(buf), "%f", t->t_float * w->glw_root->gr_current_size);
    break;
}
```

#### Numeric Conversion (`set_number`)
```c
switch(t->type) {
  case TOKEN_CSTRING:
    v = atoi(t->t_cstring);
    break;
  case TOKEN_FLOAT:
    set_number_float(w, a, t, t->t_float);
    break;
  case TOKEN_EM:
    set_number_em(w, a, t, ec);  // Dynamic evaluation required
    break;
  case TOKEN_INT:
    set_number_int(w, a, t, t->t_int);
    break;
  case TOKEN_VOID:
    set_number_int(w, a, t, 0);
    break;
}
```

#### Vector Conversion (`set_float3`, `set_float4`)
```c
switch(t->type) {
  case TOKEN_VECTOR_FLOAT:
    vec3 = t->t_float_vector;  // Direct use
    break;
  case TOKEN_FLOAT:
    v[0] = v[1] = v[2] = t->t_float;  // Broadcast to all components
    vec3 = v;
    break;
  case TOKEN_RSTRING:
    if(s[0] == '#') {
      rgbstr_to_floatvec(s + 1, v);  // Parse hex color
      vec3 = v;
    }
    break;
}
```

## EM Unit Handling

### Dynamic Evaluation
EM units require dynamic evaluation because they depend on the current font size:

```c
case TOKEN_EM:
  ec->dynamic_eval |= GLW_VIEW_EVAL_EM;
  v = t->t_float * w->glw_root->gr_current_size;
```

### EM-Aware Attributes
Widgets can handle EM units natively through `gc_set_em()`:
```c
r = gc->gc_set_em ? gc->gc_set_em(w, a->attrib, v) : -1;
if(r == -1) {
  // Fallback to converted pixel value
  v *= gr->gr_current_size;
  r = gc->gc_set_float ? gc->gc_set_float(w, a->attrib, v, NULL) : -1;
}
```

## Widget Integration

### Widget Class Interface
Each widget class provides handlers for supported attributes:

```c
typedef struct glw_class {
  int (*gc_set_int)(glw_t *w, int attrib, int value, glw_style_t *origin);
  int (*gc_set_float)(glw_t *w, int attrib, float value, glw_style_t *origin);
  int (*gc_set_float3)(glw_t *w, int attrib, const float *value, glw_style_t *origin);
  int (*gc_set_float4)(glw_t *w, int attrib, const float *value);
  int (*gc_set_int16_4)(glw_t *w, int attrib, const int16_t *value, glw_style_t *origin);
  int (*gc_set_rstr)(glw_t *w, int attrib, rstr_t *value, glw_style_t *origin);
  // ... more handlers
} glw_class_t;
```

### Fallback Mechanism
If a widget doesn't support a specific attribute type, the system tries alternatives:
1. Try primary handler (e.g., `gc_set_float`)
2. Try alternative handler (e.g., `gc_set_int` with conversion)
3. Report error if no handler accepts the attribute

### Refresh Notifications
Attribute changes trigger appropriate refresh operations:
```c
if(r)
  attr_need_refresh(w->glw_root, t, a->name, r);
```

**Refresh Types**:
- `GLW_REFRESH_LAYOUT_ONLY`: Layout recalculation only
- `GLW_REFRESH_FLAG_LAYOUT | GLW_REFRESH_FLAG_RENDER`: Full refresh

## Path Resolution

### Resource Path Handling
```c
rstr_t *glw_resolve_path(rstr_t *filename, rstr_t *at, glw_root_t *gr, int *flags)
{
  const char *x = mystrbegins(rstr_get(filename), "skin://");
  if(x != NULL) {
    char buf[PATH_MAX];
    fa_pathjoin(buf, sizeof(buf), gr->gr_skin, x);
    if(flags != NULL)
      *flags = GLW_SOURCE_FLAG_ALWAYS_LOCAL;
    return rstr_alloc(buf);
  }
  return fa_absolute_path(filename, at);
}
```

**Supported Schemes**:
- `skin://path` → Resolved relative to current skin directory
- `dataroot://path` → Resolved relative to data root
- Relative paths → Resolved relative to current file

## Optimization Features

### Attribute Merging
The system optimizes multiple flag operations by merging them:

```c
void glw_view_attrib_optimize(token_t *t, glw_root_t *gr)
{
  token_t *f2 = NULL, *img = NULL, *txt = NULL;
  
  // Merge multiple flag operations into single operations
  if(t->t_attrib->fn == &mod_flags2 &&
     merge_token(t, gr, p, &f2, &or_flags2))
    continue;
}
```

**Benefits**:
- Reduces number of widget method calls
- Minimizes refresh operations
- Improves performance for complex flag combinations

### Unresolved Attribute Handling
For attributes not in the main table, the system provides fallback handling:

```c
int glw_view_unresolved_attribute_set(glw_view_eval_context_t *ec,
                                      const char *attrib,
                                      struct token *t)
{
  // Try widget-specific unresolved handlers
  r = gc->gc_set_rstr_unresolved ? 
    gc->gc_set_rstr_unresolved(w, attrib, val, NULL) : -1;
}
```

## Error Handling

### Attribute Validation
```c
static void respond_error(glw_t *w, const token_t *t, const char *name)
{
  TRACE(TRACE_DEBUG, "GLW", "Widget %s (%s:%d) "
        "assignment at %s:%d does not respond to attribute %s",
        gc->gc_name,
        rstr_get(w->glw_file), w->glw_line,
        rstr_get(t->file), t->line, name);
}
```

### Type Mismatch Handling
```c
return glw_view_seterr(ec->ei, t, 
                       "Attribute '%s' expects a string or scalar, got %s",
                       a->name, token2name(t));
```

## Accuracy Status

🟢 **Verified**: All information directly from source code analysis  
**Version**: Based on Movian source as of 2024-11-06  
**Completeness**: Complete catalog of all 80+ attributes and their handlers

## See Also

- [GLW View Parser Analysis](glw_view_parser.c.md) - Expression parsing
- [GLW View Evaluator Analysis](glw_view_eval.c.md) - Attribute evaluation
- [GLW Architecture Overview](../glw-architecture.md) - Widget system overview