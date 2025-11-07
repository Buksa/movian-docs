# GLW View Loader Source Code Analysis

**File**: `movian/src/ui/glw/glw_view_loader.c`  
**Purpose**: Dynamic view file loading and transition management  
**Status**: 🟢 Verified from source code analysis

## Overview

The `glw_view_loader.c` file implements the `loader` widget, which is responsible for dynamically loading view files at runtime and managing transitions between different views. This is a critical component for creating dynamic user interfaces that can change content without rebuilding the entire UI hierarchy.

## Architecture

### Core Data Structures

#### glw_view_loader_t

The main structure representing a loader widget instance:

```c
typedef struct glw_view_loader {
  glw_t w;                          // Base widget structure
  
  glw_scope_t *scope;               // Variable scope for loaded views
  
  rstr_t *url;                      // Primary view file URL
  rstr_t *alt_url;                  // Alternative/fallback view file URL
  
  float delta;                      // Transition speed per frame
  float time;                       // Transition duration in seconds
  
  glw_transition_type_t efx_conf;   // Transition effect type
  char loaded;                      // Loading state flag
  
} glw_view_loader_t;
```

**Key Fields**:
- **scope**: Maintains the variable scope that will be passed to loaded views, including `$args` and `$self` properties
- **url**: The primary view file to load (can be changed dynamically)
- **alt_url**: Fallback URL if primary fails to load
- **time**: Controls transition duration (minimum 0.00001 seconds)
- **delta**: Calculated per-frame transition increment based on time and frame rate
- **loaded**: Boolean flag indicating whether content is currently loaded
- **efx_conf**: Transition effect configuration (fade, slide, etc.)

#### glw_loader_item_t

Per-child data structure tracking transition state:

```c
typedef struct glw_loader_item {
  float vl_cur;    // Current transition value (0.0 = visible, 1.0 = hidden)
  float vl_tgt;    // Target transition value
} glw_loader_item_t;
```

**Transition Logic**:
- `vl_cur = 0.0`: Child is fully visible (active view)
- `vl_cur = -1.0`: Child is transitioning in (appearing)
- `vl_cur = 1.0`: Child is fully hidden and will be destroyed
- `vl_tgt`: The target value that `vl_cur` is moving towards

## Key Functions

### Lifecycle Management

#### glw_view_loader_ctor()

**Source**: Lines 195-201

```c
static void
glw_view_loader_ctor(glw_t *w)
{
  glw_view_loader_t *vl = (glw_view_loader_t *)w;
  vl->time = 0.00001;
  vl->scope = glw_scope_retain(w->glw_scope);
  w->glw_flags2 |= GLW2_EXPEDITE_SUBSCRIPTIONS;
}
```

**Purpose**: Initialize a new loader widget instance

**Behavior**:
- Sets default transition time to minimum value (0.00001 seconds)
- Retains the parent scope for passing to loaded views
- Sets `GLW2_EXPEDITE_SUBSCRIPTIONS` flag to optimize property subscriptions

#### glw_view_loader_dtor()

**Source**: Lines 208-214

```c
static void
glw_view_loader_dtor(glw_t *w)
{
  glw_view_loader_t *vl = (void *)w;
  glw_scope_release(vl->scope);
  rstr_release(vl->url);
  rstr_release(vl->alt_url);
}
```

**Purpose**: Clean up loader widget resources

**Behavior**:
- Releases the scope reference
- Releases URL strings (primary and alternative)

### View Loading

#### set_source()

**Source**: Lines 242-286

```c
static void
set_source(glw_t *w, rstr_t *url, int flags, glw_style_t *origin)
```

**Purpose**: Load a new view file into the loader

**Key Behavior**:

1. **URL Comparison**: Checks if the new URL is different from current
   ```c
   if(!strcmp(rstr_get(url) ?: "", rstr_get(a->url) ?: ""))
     return;  // Same URL, no action needed
   ```

2. **Inactive Widget Handling**: If widget is inactive, destroys all children immediately
   ```c
   if(!(w->glw_flags & GLW_ACTIVE)) {
     while((c = TAILQ_FIRST(&w->glw_childs)) != NULL)
       glw_destroy(c);
   }
   ```

3. **Subscription Suspension**: Suspends property subscriptions on existing children
   ```c
   TAILQ_FOREACH(c, &w->glw_childs, glw_parent_link)
     glw_suspend_subscriptions(c);
   ```

4. **Empty URL Handling**: Treats empty strings as NULL URLs
   ```c
   if(url != NULL && rstr_get(url)[0] == 0)
     url = NULL;
   ```

5. **View Creation**: Calls `glw_view_create()` with primary and alternative URLs
   ```c
   if(url || alt_url) {
     glw_view_create(w->glw_root, url, alt_url, w, a->scope, NULL, 0);
     a->loaded = 1;
     update_autohide(a);
     return;
   }
   ```

6. **Unloading**: If both URLs are NULL, marks all children for removal
   ```c
   a->loaded = 0;
   update_autohide(a);
   TAILQ_FOREACH(c, &w->glw_childs, glw_parent_link)
     itemdata(c)->vl_tgt = 1;
   ```

**Debug Output**: When `GLW2_DEBUG` flag is set, logs loading operations:
```c
if(w->glw_flags2 & GLW2_DEBUG)
  TRACE(TRACE_DEBUG, "GLW", "%s: Loader loading %s",
        rstr_get(w->glw_id_rstr), rstr_get(url) ?: "(void)");
```

#### set_alt()

**Source**: Lines 293-297

```c
static void
set_alt(glw_t *w, rstr_t *url)
{
  glw_view_loader_t *a = (glw_view_loader_t *)w;
  rstr_set(&a->alt_url, url);
}
```

**Purpose**: Set the alternative/fallback URL

**Usage**: The alternative URL is used if the primary URL fails to load

### Layout and Rendering

#### glw_loader_layout()

**Source**: Lines 52-81

```c
static void
glw_loader_layout(glw_t *w, const glw_rctx_t *rc)
```

**Purpose**: Update transition states and layout children

**Key Operations**:

1. **Delta Calculation**: Computes per-frame transition increment
   ```c
   a->delta = 1 / (a->time * (1000000 / w->glw_root->gr_frameduration));
   ```
   - Formula: `delta = 1 / (time_in_seconds * frames_per_second)`
   - Ensures transition completes in specified time regardless of frame rate

2. **Transition Update**: Advances each child's transition state
   ```c
   float n = GLW_MIN(itemdata(c)->vl_cur + a->delta, itemdata(c)->vl_tgt);
   if(n != itemdata(c)->vl_cur)
     glw_need_refresh(gr, 0);  // Request another frame
   itemdata(c)->vl_cur = n;
   ```

3. **Child Destruction**: Removes children that have completed transition out
   ```c
   if(itemdata(c)->vl_cur == 1) {
     glw_destroy(c);
     if((c = TAILQ_FIRST(&w->glw_childs)) != NULL) {
       glw_copy_constraints(w, c);  // Update constraints from new first child
     }
   }
   ```

4. **Child Layout**: Layouts remaining children
   ```c
   glw_layout0(c, rc);
   ```

#### glw_view_loader_render()

**Source**: Lines 155-179

```c
static void
glw_view_loader_render(glw_t *w, const glw_rctx_t *rc)
```

**Purpose**: Render children with transition effects

**Rendering Logic**:

1. **Active Child**: Renders at full alpha without transition effect
   ```c
   if(itemdata(c)->vl_cur == 0) {
     rc0.rc_alpha = alpha;
     rc0.rc_sharpness = sharpness;
     glw_render0(c, &rc0);
     continue;
   }
   ```

2. **Transitioning Children**: Applies transition effect based on current state
   ```c
   glw_transition_render(a->efx_conf, itemdata(c)->vl_cur, alpha, &rc0);
   glw_render0(c, &rc0);
   ```
   - `efx_conf`: Transition type (fade, slide, etc.)
   - `vl_cur`: Current transition progress (0.0 to 1.0)

### Signal Handling

#### glw_loader_callback()

**Source**: Lines 100-145

```c
static int
glw_loader_callback(glw_t *w, void *opaque, glw_signal_t signal, void *extra)
```

**Purpose**: Handle widget lifecycle signals

**Signal Handlers**:

1. **GLW_SIGNAL_CHILD_CREATED**: New child added (new view loaded)
   ```c
   case GLW_SIGNAL_CHILD_CREATED:
     c = extra;
     
     // Initialize transition state
     if(TAILQ_FIRST(&w->glw_childs) == c &&
        TAILQ_NEXT(c, glw_parent_link) == NULL &&
        w->glw_flags2 & GLW2_NO_INITIAL_TRANS) {
       itemdata(c)->vl_cur = 0;  // No transition for first child
     } else {
       itemdata(c)->vl_cur = -1;  // Transition in from -1 to 0
     }
     
     itemdata(c)->vl_tgt = 0;  // Target is visible state
     
     // Close focus paths and mark old children for removal
     glw_focus_open_path_close_all_other(c);
     TAILQ_FOREACH(n, &w->glw_childs, glw_parent_link) {
       if(c == n) continue;
       itemdata(n)->vl_tgt = 1;  // Mark for removal
     }
     
     // Copy constraints from first child
     if(c == TAILQ_FIRST(&w->glw_childs)) {
       glw_copy_constraints(w, c);
     }
   ```

2. **GLW_SIGNAL_CHILD_CONSTRAINTS_CHANGED**: Child constraints updated
   ```c
   case GLW_SIGNAL_CHILD_CONSTRAINTS_CHANGED:
     c = extra;
     if(c == TAILQ_FIRST(&w->glw_childs))
       glw_copy_constraints(w, c);
     return 1;
   ```

3. **GLW_SIGNAL_INACTIVE**: Widget became inactive
   ```c
   case GLW_SIGNAL_INACTIVE:
     unload_because_inactive(w);
     return 0;
   ```

#### unload_because_inactive()

**Source**: Lines 88-96

```c
static void
unload_because_inactive(glw_t *w)
{
  glw_t *c, *next;
  for(c = TAILQ_FIRST(&w->glw_childs); c != NULL; c = next) {
    next = TAILQ_NEXT(c, glw_parent_link);
    if(itemdata(c)->vl_tgt > 0) {
      glw_destroy(c);
    }
  }
}
```

**Purpose**: Immediately destroy children marked for removal when widget becomes inactive

### Attribute Setters

#### glw_view_loader_set_int()

**Source**: Lines 304-318

```c
static int
glw_view_loader_set_int(glw_t *w, glw_attribute_t attrib, int value,
                        glw_style_t *origin)
```

**Supported Attributes**:
- **GLW_ATTRIB_TRANSITION_EFFECT**: Sets the transition effect type
  - Values: Defined in `glw_transitions.h` (fade, slide, flip, etc.)

#### glw_view_loader_set_float()

**Source**: Lines 325-339

```c
static int
glw_view_loader_set_float(glw_t *w, glw_attribute_t *attrib, float value,
                          glw_style_t *origin)
```

**Supported Attributes**:
- **GLW_ATTRIB_TIME**: Sets transition duration in seconds
  - Minimum value: 0.00001 seconds
  - Controls how long transitions take to complete

#### glw_view_loader_set_prop()

**Source**: Lines 346-368

```c
static int
glw_view_loader_set_prop(glw_t *w, glw_attribute_t attrib, prop_t *p)
```

**Supported Attributes**:
- **GLW_ATTRIB_ARGS**: Sets the `$args` property for loaded views
  - Creates new scope with `GLW_ROOT_ARGS` set to the property
  - Allows passing parameters to loaded views
  
- **GLW_ATTRIB_PROP_SELF**: Sets the `$self` property for loaded views
  - Creates new scope with `GLW_ROOT_SELF` set to the property
  - Provides context about the data being displayed

**Scope Management**: Both attributes create a new scope by duplicating the existing scope and setting the appropriate root property.

### Utility Functions

#### update_autohide()

**Source**: Lines 221-235

```c
static void
update_autohide(glw_view_loader_t *l)
{
  if(!(l->w.glw_flags2 & GLW2_AUTOHIDE))
    return;
  
  if(l->loaded) {
    glw_unhide(&l->w);
  } else {
    glw_hide(&l->w);
    glw_t *c;
    while((c = TAILQ_FIRST(&l->w.glw_childs)) != NULL)
      glw_destroy(c);
  }
}
```

**Purpose**: Automatically hide/show widget based on loaded state

**Behavior**:
- If `GLW2_AUTOHIDE` flag is set:
  - Shows widget when content is loaded
  - Hides widget and destroys all children when no content is loaded

#### glw_view_loader_retire_child()

**Source**: Lines 186-190

```c
static void
glw_view_loader_retire_child(glw_t *w, glw_t *c)
{
  glw_suspend_subscriptions(c);
  itemdata(c)->vl_tgt = 1;
}
```

**Purpose**: Mark a child for removal

**Behavior**:
- Suspends property subscriptions to stop updates
- Sets target transition value to 1 (hidden state)
- Child will be destroyed once transition completes

#### get_identity()

**Source**: Lines 375-380

```c
static const char *
get_identity(glw_t *w, char *tmp, size_t tmpsize)
{
  glw_view_loader_t *l = (glw_view_loader_t *)w;
  return rstr_get(l->url) ?: "NULL";
}
```

**Purpose**: Return widget identity for debugging

**Returns**: Current URL or "NULL" if no URL is set

#### mod_flags2()

**Source**: Lines 387-396

```c
static void
mod_flags2(glw_t *w, int set, int clr)
{
  glw_view_loader_t *gvl = (glw_view_loader_t *)w;
  
  if(set & GLW2_AUTOHIDE && !gvl->loaded)
    glw_hide(w);
  
  if(clr & GLW2_AUTOHIDE)
    glw_unhide(w);
}
```

**Purpose**: Handle flag modifications

**Behavior**:
- When `GLW2_AUTOHIDE` is set and no content is loaded, hides the widget
- When `GLW2_AUTOHIDE` is cleared, shows the widget

## Widget Class Registration

**Source**: Lines 403-421

```c
static glw_class_t glw_view_loader = {
  .gc_name = "loader",
  .gc_instance_size = sizeof(glw_view_loader_t),
  .gc_parent_data_size = sizeof(glw_loader_item_t),
  .gc_ctor = glw_view_loader_ctor,
  .gc_dtor = glw_view_loader_dtor,
  .gc_set_int = glw_view_loader_set_int,
  .gc_set_float = glw_view_loader_set_float,
  .gc_set_prop = glw_view_loader_set_prop,
  .gc_layout = glw_loader_layout,
  .gc_render = glw_view_loader_render,
  .gc_retire_child = glw_view_loader_retire_child,
  .gc_signal_handler = glw_loader_callback,
  .gc_set_source = set_source,
  .gc_get_identity = get_identity,
  .gc_set_alt = set_alt,
  .gc_mod_flags2 = mod_flags2,
};

GLW_REGISTER_CLASS(glw_view_loader);
```

**Widget Name**: `loader`

**Registered Callbacks**:
- Constructor/Destructor: `glw_view_loader_ctor`, `glw_view_loader_dtor`
- Attribute Setters: `set_int`, `set_float`, `set_prop`
- Layout/Render: `glw_loader_layout`, `glw_view_loader_render`
- Child Management: `glw_view_loader_retire_child`
- Signal Handler: `glw_loader_callback`
- Source Management: `set_source`, `set_alt`
- Identity: `get_identity`
- Flags: `mod_flags2`

## Usage Patterns

### Basic Loader Usage

```xml
<loader id="contentLoader" 
        source="views/content.view"
        time="0.3"
        effect="blend"/>
```

### Dynamic Content Loading

```xml
<loader source="$page.model.viewUrl"
        args="$page.model.data"
        time="0.5"/>
```

**Behavior**: When `$page.model.viewUrl` changes, the loader will:
1. Suspend subscriptions on current view
2. Start transition out (vl_cur: 0 → 1)
3. Load new view file
4. Start transition in (vl_cur: -1 → 0)
5. Destroy old view when fully transitioned out

### Autohide Pattern

```xml
<loader source="$page.model.optionalView"
        autohide="true"/>
```

**Behavior**: Widget is automatically hidden when `source` is empty or NULL

### Fallback URL

```xml
<loader source="$page.model.primaryView"
        alt="views/fallback.view"/>
```

**Behavior**: If `primaryView` fails to load, `fallback.view` is loaded instead

## Transition Mechanics

### Transition States

1. **Initial Load** (GLW2_NO_INITIAL_TRANS flag set):
   - `vl_cur = 0` (no transition, appears immediately)

2. **Normal Load**:
   - `vl_cur = -1` (starting state, off-screen/invisible)
   - Transitions to `vl_tgt = 0` (visible state)

3. **Unload**:
   - `vl_cur = 0` (visible)
   - Transitions to `vl_tgt = 1` (hidden)
   - Destroyed when `vl_cur == 1`

### Frame-by-Frame Update

```
Frame N:   vl_cur = -1.0
Frame N+1: vl_cur = -1.0 + delta
Frame N+2: vl_cur = -1.0 + 2*delta
...
Frame M:   vl_cur = 0.0 (transition complete)
```

### Transition Speed Calculation

```c
delta = 1 / (time * (1000000 / gr_frameduration))
```

**Example** (60 FPS, 0.3 second transition):
```
delta = 1 / (0.3 * (1000000 / 16666.67))
delta = 1 / (0.3 * 60)
delta = 1 / 18
delta ≈ 0.0556 per frame
```

**Frames needed**: `1 / 0.0556 ≈ 18 frames` (0.3 seconds at 60 FPS)

## Integration with View System

### View Creation Flow

1. **set_source()** called with new URL
2. **glw_view_create()** called (defined in `glw_view.c`)
3. View file is loaded and parsed
4. New widget tree is created as child of loader
5. **GLW_SIGNAL_CHILD_CREATED** signal fired
6. Transition begins

### Scope Propagation

The loader's scope is passed to loaded views, providing access to:
- **$args**: Parameters passed via `args` attribute
- **$self**: Context property passed via `propSelf` attribute
- **Parent scope variables**: Inherited from loader's parent

### Path Resolution

View file URLs are resolved relative to:
1. Current skin directory
2. Application resource directory
3. Absolute paths (if supported)

The actual path resolution is handled by `glw_view_create()` and `glw_view_load1()` functions.

## Performance Considerations

### Subscription Management

- **Suspension**: Old views have subscriptions suspended during transition
- **Expedited**: New views use `GLW2_EXPEDITE_SUBSCRIPTIONS` for faster startup
- **Cleanup**: Subscriptions are fully released when views are destroyed

### Memory Management

- **Gradual Cleanup**: Old views are destroyed after transition completes
- **Immediate Cleanup**: When inactive, views are destroyed immediately
- **Scope Retention**: Scope is retained for the lifetime of the loader

### Frame Rate Independence

The transition system is frame-rate independent:
- Delta is calculated based on actual frame duration
- Transitions complete in specified time regardless of FPS
- Refresh is requested only when transitions are active

## Related Files

- **glw_view.c**: View file loading and creation (`glw_view_create()`, `glw_view_load1()`)
- **glw_transitions.h**: Transition effect definitions
- **glw.h**: Base widget structures and functions
- **glw_view.h**: View system structures and declarations

## See Also

- [glw_view_parser.c.md](glw_view_parser.c.md) - View file parsing
- [glw_view_preproc.c.md](glw_view_preproc.c.md) - Preprocessing directives
- [glw_view_eval.c.md](glw_view_eval.c.md) - Expression evaluation
- [GLW Architecture](../glw-architecture.md) - Overall GLW system design
