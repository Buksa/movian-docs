# Macro Reference

## Overview

The Movian flat skin defines a comprehensive set of reusable macros in `theme.view` that provide consistent visual styling and interactive components across the entire user interface. These macros encapsulate common UI patterns and ensure visual consistency throughout the application.

Macros are defined using the `#define` preprocessor directive and can be invoked anywhere in view files after importing `theme.view`:

```view
#import "skin://theme.view"

// Use macros in your view file
widget(container_y, {
  ListItemBevel();
  ListItemHighlight();
});
```

## Macro Categories

The macro system is organized into four main categories:

1. **Visual Effect Macros** - Shadow effects and visual depth
2. **Highlight Macros** - Interactive focus and hover states
3. **Navigation Macros** - Navigation components and page headers
4. **UI Control Macros** - Interactive controls like scrollbars and search

---

## Visual Effect Macros

### ListItemBevel()

Creates a subtle shadow effect for list items, providing visual depth and separation between items.

**Purpose**: Add a 3D bevel effect to list items with light and shadow lines

**Parameters**: None

**Visual Effect**: 
- Top light line (white, 15% opacity)
- 1px spacer
- Bottom shadow line (black, 15% opacity)

**Source Code**:
```view
#define ListItemBevel() {
  widget(container_y, {
    filterConstraintY: true;
    filterConstraintX: true;
    widget(quad, {
      height: 1;
      alpha: 0.15;
    });
    space(1);
    widget(quad, {
      height: 1;
      color: 0;
      alpha: 0.15;
    });
  });
}
```

**Usage Example**:
```view
widget(container_y, {
  style: "ListItem";
  
  // Content
  widget(label, {
    caption: "Item Title";
  });
  
  // Add bevel effect at bottom
  ListItemBevel();
});
```

**Technical Details**:
- Uses `filterConstraintY` and `filterConstraintX` to prevent layout interference
- Creates two 1-pixel high quads with a 1-pixel spacer between them
- Light line uses default white color (1.0)
- Shadow line uses black color (0.0)
- Both lines use 15% opacity for subtle effect

---

### GridItemBevel()

Creates a more complex shadow effect for grid items, adding depth on both vertical and horizontal edges.

**Purpose**: Add 3D bevel effect to grid items with shadows on bottom and right edges

**Parameters**: None

**Visual Effect**:
- Vertical bevel: top light line + bottom shadow line
- Horizontal bevel: left light line + right shadow line
- Creates a raised appearance for grid items

**Source Code**:
```view
#define GridItemBevel() {
  widget(container_y, {
    filterConstraintY: true;
    widget(quad, {
      height: 1;
      alpha: 0.15;
    });
    space(1);
    widget(quad, {
      height: 1;
      color: 0.6;
      alpha: 0.15;
    });
  });
  widget(container_x, {
    filterConstraintX: true;
    widget(quad, {
      width: 1;
      alpha: 0.15;
    });
    space(1);
    widget(quad, {
      width: 1;
      color: 0.6;
      alpha: 0.15;
    });
  });
}
```

**Usage Example**:
```view
widget(container_z, {
  // Grid item content
  widget(image, {
    source: $self.icon;
  });
  
  // Add bevel effect
  GridItemBevel();
});
```

**Technical Details**:
- Creates both vertical and horizontal bevels
- Vertical bevel: 1px white line, 1px spacer, 1px gray line (color: 0.6)
- Horizontal bevel: same pattern applied horizontally
- Uses `filterConstraintY` and `filterConstraintX` to prevent layout expansion
- Gray color (0.6) instead of black (0.0) for softer shadow effect

---

## Highlight Macros

### ListItemHighlight()

Creates an interactive highlight overlay for list items that responds to hover and focus states.

**Purpose**: Provide visual feedback for list item interaction (hover and keyboard focus)

**Parameters**: None

**Visual Effect**:
- 10% opacity on hover
- 20% opacity when keyboard focused
- Additive blending for bright highlight effect
- Smooth transitions between states

**Source Code**:
```view
#define ListItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
}
```

**Usage Example**:
```view
widget(container_z, {
  focusable: true;
  
  // Highlight layer (bottom)
  ListItemHighlight();
  
  // Content layer (top)
  widget(container_x, {
    widget(label, { caption: "Item Title"; });
  });
});
```

**Technical Details**:
- `fhpSpill: true` - Allows highlight to extend beyond parent boundaries
- `additive: true` - Uses additive blending for bright overlay effect
- `isHovered()` - Returns 1.0 when mouse hovers, 0.0 otherwise
- `isNavFocused()` - Returns 1.0 when item has keyboard focus, 0.0 otherwise
- Alpha calculation: `0.1 * hover + 0.2 * focus`
  - Hover only: 10% opacity
  - Focus only: 20% opacity
  - Both: 30% opacity (combined)
- Instant state changes (no interpolation)

---

### GridItemHighlight()

Creates an interactive highlight overlay for grid items with smooth interpolation for focus states.

**Purpose**: Provide visual feedback for grid item interaction with smooth focus transitions

**Parameters**: None

**Visual Effect**:
- 10% opacity on hover (instant)
- 20% opacity when keyboard focused (smoothly interpolated)
- Additive blending for bright highlight
- Smooth animation when focus changes

**Source Code**:
```view
#define GridItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * iir(isNavFocused(), 4, true);
  });
}
```

**Usage Example**:
```view
widget(container_z, {
  focusable: true;
  
  // Highlight layer
  GridItemHighlight();
  
  // Content layer
  widget(image, {
    source: $self.poster;
  });
});
```

**Technical Details**:
- Similar to `ListItemHighlight()` but with smooth focus transitions
- `iir(isNavFocused(), 4, true)` - Infinite Impulse Response filter
  - Smoothly interpolates focus state changes
  - Speed parameter: 4 (moderate smoothness)
  - Absolute mode: true (prevents negative values)
- Hover state remains instant for immediate feedback
- Focus state animates smoothly over several frames

**Comparison with ListItemHighlight()**:
- `ListItemHighlight()`: Instant focus changes
- `GridItemHighlight()`: Smooth focus transitions using `iir()` filter

---

### GridItemHighlight2()

Enhanced grid item highlight with additional hover border effect.

**Purpose**: Provide visual feedback with both highlight overlay and border emphasis on hover

**Parameters**: None

**Visual Effect**:
- Base highlight: 10% hover + 20% focus (instant transitions)
- Additional hover border: 50% opacity vertical lines on left and right edges
- Creates a more pronounced hover effect than `GridItemHighlight()`

**Source Code**:
```view
#define GridItemHighlight2() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
  widget(container_x, {
    filterConstraintX: true;
    fhpSpill: true;
    alpha: isHovered() * 0.5;
    widget(quad, {
      width: 1;
      color: 0;
    });
    space(1);
    widget(quad, {
      width: 1;
      color: 0;
    });
  });
}
```

**Usage Example**:
```view
widget(container_z, {
  focusable: true;
  
  // Enhanced highlight with border
  GridItemHighlight2();
  
  // Content
  widget(image, {
    source: $self.thumbnail;
  });
});
```

**Technical Details**:
- Combines two visual effects:
  1. **Base highlight quad**: Same as `ListItemHighlight()` (instant transitions)
  2. **Hover border**: Two vertical black lines (1px each) on left and right
- Border effect only visible on hover (`alpha: isHovered() * 0.5`)
- Border uses 50% opacity when hovered
- `filterConstraintX: true` prevents border from affecting layout
- No smooth interpolation (instant state changes)

**Use Cases**:
- Grid items that need more prominent hover feedback
- Situations where instant visual response is preferred
- UI designs requiring border emphasis on interaction

---

## Navigation Macros

### BackButton(ENABLED, EVENT)

Creates a standardized back button with chevron icon that appears when navigation is possible.

**Purpose**: Provide consistent back navigation UI across all pages

**Parameters**:
- `ENABLED` (optional, default: `true`) - Boolean expression to enable/disable the button
- `EVENT` (optional, default: `event("back")`) - Event to fire when button is activated

**Visual Effect**:
- Chevron left icon (2em size)
- Fades in/out based on pointer visibility and touch mode
- Hover effect: icon brightens from 50% to 100% opacity
- Smooth fade transitions (speed: 4)

**Source Code**:
```view
#define BackButton(ENABLED=true, EVENT=event("back")) {
  widget(container_y, {
    align: center;
    width: 4em;
    clickable: $ui.pointerVisible || ($ui.touch && ENABLED);
    alpha: iir($ui.pointerVisible || ($ui.touch && ENABLED), 4);
    onEvent(activate, EVENT);
    navFocusable: false;
    widget(icon, {
      color: 0.5 + iir(isHovered(), 4);
      size: 2em;
      source: "skin://icons/ic_chevron_left_48px.svg";
    });
  });
}
```

**Usage Examples**:

**Basic usage (default back event)**:
```view
widget(container_x, {
  hidden: !$nav.canGoBack;
  BackButton();
  space(1);
});
```

**Custom event**:
```view
BackButton(true, {
  $ui.showSettings = false;
  event("back");
});
```

**Conditional enabling**:
```view
BackButton($self.canNavigateBack, event("back"));
```

**Technical Details**:
- **Width**: Fixed 4em width for consistent sizing
- **Clickability**: Only clickable when pointer visible OR (touch mode AND enabled)
- **Visibility**: Fades in/out using `iir()` filter (speed: 4)
- **Icon color**: Base 50% brightness + smooth hover effect to 100%
- **Navigation**: `navFocusable: false` - not accessible via keyboard navigation
- **Icon source**: Material Design chevron left icon (48px)

**Behavior**:
- Desktop (pointer visible): Always clickable and visible
- Touch devices: Only visible/clickable when ENABLED is true
- Hover effect: Icon smoothly brightens on mouse hover
- Activation: Fires specified EVENT (default: back navigation)

---

### PageHeader(TITLE)

Creates a standardized page header with title, optional icon, and back button.

**Purpose**: Provide consistent page header layout with title display and navigation

**Parameters**:
- `TITLE` (required) - String or expression for the page title

**Visual Effect**:
- 3em height header bar
- Semi-transparent black background (20% opacity)
- Centered title text (1.5em size)
- Optional metadata icon on the left
- Back button on the left (when navigation possible)
- Elevated z-order (zoffset: 10)

**Source Code**:
```view
#define PageHeader(TITLE) {
  widget(container_z, {
    height: 3em;
    zoffset: 10;
    widget(quad, {
      color: 0;
      alpha: 0.2;
    });

    hbox({
      padding: [4em, 0.5em];
      image({
        align: left;
        source: $self.model.metadata.icon;
      });
    });

    widget(label, {
      padding: [3em, 0];
      align: center;
      caption: TITLE;
      size: 1.5em;
    });

    widget(container_x, {
      hidden: !$nav.canGoBack;
      BackButton();
      space(1);
    });
  });
}
```

**Usage Examples**:

**Static title**:
```view
PageHeader("Settings");
```

**Dynamic title from model**:
```view
PageHeader($self.model.title);
```

**Formatted title**:
```view
PageHeader(fmt("Search: %s", $view.searchQuery));
```

**Technical Details**:
- **Height**: Fixed 3em height
- **Z-order**: `zoffset: 10` ensures header appears above page content
- **Background**: Black quad with 20% opacity
- **Title**: 
  - Centered horizontally
  - 3em left padding (space for back button)
  - 1.5em font size
- **Icon**: 
  - Displayed from `$self.model.metadata.icon`
  - Left-aligned with 4em left padding
  - 0.5em right padding
- **Back button**: 
  - Only visible when `$nav.canGoBack` is true
  - Uses standard `BackButton()` macro

**Layout Structure**:
```
┌─────────────────────────────────────┐
│ [<] [Icon]      Title               │  3em height
└─────────────────────────────────────┘
  4em   padding    centered
```

---

### PageHeader0(CONTENTS)

Creates a customizable page header container with back button support.

**Purpose**: Provide flexible page header layout where content can be fully customized

**Parameters**:
- `CONTENTS` (required) - View file code block defining the header content

**Visual Effect**:
- 3em height header bar
- Semi-transparent black background (20% opacity)
- Custom content area
- Back button on the left (when navigation possible)
- Elevated z-order (zoffset: 10)

**Source Code**:
```view
#define PageHeader0(CONTENTS) {
  widget(container_z, {
    height: 3em;
    zoffset: 10;
    widget(quad, {
      color: 0;
      alpha: 0.2;
    });
    CONTENTS;

    widget(container_x, {
      hidden: !$nav.canGoBack;
      BackButton();
      space(1);
    });
  });
}
```

**Usage Examples**:

**Custom header with multiple elements**:
```view
PageHeader0({
  widget(container_x, {
    padding: [4em, 0.5em];
    spacing: 1em;
    
    widget(label, {
      caption: "Section";
      size: 1em;
      color: 0.7;
    });
    
    widget(label, {
      caption: $self.model.title;
      size: 1.5em;
    });
    
    space(1);
    
    widget(label, {
      caption: fmt("%d items", $self.model.items.count);
      size: 1em;
      color: 0.7;
    });
  });
});
```

**Header with search bar**:
```view
PageHeader0({
  widget(container_x, {
    padding: [4em, 0];
    SearchBar("search:", "Search...");
  });
});
```

**Technical Details**:
- **Height**: Fixed 3em height
- **Z-order**: `zoffset: 10` ensures header appears above page content
- **Background**: Black quad with 20% opacity
- **Content area**: Completely customizable via CONTENTS parameter
- **Back button**: 
  - Automatically included
  - Only visible when `$nav.canGoBack` is true
  - Positioned on the left side

**Comparison with PageHeader()**:
- `PageHeader(TITLE)`: Predefined layout with centered title and icon
- `PageHeader0(CONTENTS)`: Fully customizable content area

**Use Cases**:
- Complex header layouts with multiple elements
- Headers with custom controls (search, filters, buttons)
- Headers requiring non-standard layouts
- Dynamic header content based on page state

---

## UI Control Macros

### ScrollBar(TARGET, TOP_PAD, BOTTOM_PAD)

Creates a vertical scrollbar that binds to a scrollable target widget.

**Purpose**: Provide visual scroll position indicator and scrolling control

**Parameters**:
- `TARGET` (required) - Property reference to bind the scrollbar to (typically a scrollable container)
- `TOP_PAD` (optional, default: `0`) - Top padding in em units
- `BOTTOM_PAD` (optional, default: `0`) - Bottom padding in em units

**Visual Effect**:
- 0.6em wide vertical slider on the right edge
- Fades in when content is scrollable
- Brightens on hover (60% base + 100% on hover)
- Smooth fade transitions (speed: 16)
- Padding adjustable for header/footer clearance

**Source Code**:
```view
#define ScrollBar(TARGET, TOP_PAD = 0, BOTTOM_PAD = 0) {
  widget(container_x, {
    filterConstraintX: true;
    filterConstraintY: true;
    padding: [0,TOP_PAD,0,BOTTOM_PAD];

    space(1);
    widget(slider_y, {
      id: "scrollbar";
      bind(TARGET);
      width: 0.6em;
      focusable: canScroll();
      alpha: iir(canScroll(), 16);
      widget(container_x, {
        padding: [0.2em,0,0.2em, 0];
        widget(quad, {
          alpha: 0.6 + isHovered();
        });
      });
    });
  });
}
```

**Usage Examples**:

**Basic scrollbar**:
```view
widget(container_z, {
  widget(list_y, {
    id: "mylist";
    // List content...
  });
  
  ScrollBar("mylist");
});
```

**Scrollbar with padding**:
```view
widget(container_z, {
  widget(list_y, {
    id: "content";
    // Content...
  });
  
  // 3em top padding for header, 2em bottom for footer
  ScrollBar("content", 3, 2);
});
```

**Scrollbar with property binding**:
```view
widget(container_z, {
  widget(array, {
    id: "itemarray";
    cloner($self.model.items, ...);
  });
  
  ScrollBar("itemarray");
});
```

**Technical Details**:
- **Width**: Fixed 0.6em width
- **Positioning**: Right-aligned using `space(1)` before scrollbar
- **Visibility**: 
  - `alpha: iir(canScroll(), 16)` - Fades in/out based on scroll availability
  - Very smooth fade (speed: 16 = slow transition)
- **Focusability**: `focusable: canScroll()` - Only focusable when scrolling is possible
- **Appearance**:
  - Base opacity: 60%
  - Hover opacity: 160% (60% + 100%)
  - 0.2em horizontal padding for visual spacing
- **Binding**: `bind(TARGET)` - Connects scrollbar to target widget's scroll position
- **Layout**: 
  - `filterConstraintX: true` - Doesn't affect horizontal layout
  - `filterConstraintY: true` - Doesn't affect vertical layout
  - Padding applied: `[0, TOP_PAD, 0, BOTTOM_PAD]` (right, top, left, bottom)

**Behavior**:
- Automatically shows/hides based on content scrollability
- Smooth fade in/out transitions
- Hover effect for better visibility
- Can be focused and controlled via keyboard when scrollable
- Tracks scroll position of bound target widget

---

### SearchBar(URLPREFIX, TEXT, ICON)

Creates an interactive search input field with icon and placeholder text.

**Purpose**: Provide standardized search interface for content discovery

**Parameters**:
- `URLPREFIX` (required) - URL prefix to navigate to when search is submitted (search query appended)
- `TEXT` (optional, default: `void`) - Placeholder text shown when search field is empty
- `ICON` (optional, default: `void`) - Currently unused in implementation

**Visual Effect**:
- List item style with divider
- Search icon on the left (30% opacity, brightens to 130% on focus)
- Text input field with custom font
- Placeholder text (50% opacity) when empty
- 2em height with 0.5em padding

**Source Code**:
```view
#define SearchBar(URLPREFIX, TEXT=void, ICON=void) {
  widget(container_x, {
    style: "ListItem";
    divider: true;
    widget(container_z, {

      filterConstraintX: true;
      widget(quad, {
        color: 0;
      });

      widget(container_x, {
        height: 2em;
        padding: [0.5em, 0];
        spacing: 0.5em;
        widget(icon, {
          fhpSpill: true;
          size: 1.2em;
          source: "skin://icons/ic_search_48px.svg";
          alpha: 0.3 + isNavFocused();
        });

        zbox({
          filterConstraintX: true;
          label({
            hidden: $view.searchQuery ? true : false;
            caption: TEXT;
            size: 1.2em;
            font: "skin://fonts/RobotoCondensed-Regular.ttf";
            color: 0.5;
          });

          widget(text, {
            filterConstraintX: true;
            padding: [0, 0.4em];
            size: 1.2em;
            font: "skin://fonts/RobotoCondensed-Regular.ttf";
            focusable: 0.1;

            bind($view.searchQuery);
            onEvent(enter, navOpen(URLPREFIX + $view.searchQuery),
                    $view.searchQuery);
            onEvent(submit, navOpen(URLPREFIX + $view.searchQuery),
                    $view.searchQuery);
          });
        });
      });
    });
  });
}
```

**Usage Examples**:

**Basic search bar**:
```view
SearchBar("search:", "Type to search...");
```

**Search with custom URL**:
```view
SearchBar("plugin://myplugin/search?q=", "Search movies...");
```

**Search in page header**:
```view
PageHeader0({
  widget(container_x, {
    padding: [4em, 0];
    SearchBar("search:", "Find content...");
  });
});
```

**Technical Details**:
- **Style**: Uses "ListItem" style with divider
- **Height**: Fixed 2em height
- **Layout**: Horizontal container with 0.5em spacing
- **Search icon**:
  - Material Design search icon (48px)
  - Size: 1.2em
  - Base opacity: 30%
  - Focus opacity: 130% (30% + 100%)
  - `fhpSpill: true` - Can extend beyond boundaries
- **Placeholder text**:
  - Shown when `$view.searchQuery` is empty
  - 50% opacity gray color
  - Same font and size as input text
  - Hidden when user types
- **Text input**:
  - Binds to `$view.searchQuery` variable
  - Font: RobotoCondensed-Regular (1.2em)
  - Horizontal padding: 0.4em
  - `focusable: 0.1` - Can receive focus
  - `filterConstraintX: true` - Expands to fill available space
- **Events**:
  - `enter` event: Triggers navigation when Enter key pressed
  - `submit` event: Triggers navigation on form submission
  - Both events only fire when `$view.searchQuery` is not empty
  - Navigation URL: `URLPREFIX + $view.searchQuery`

**Data Binding**:
- Search query stored in `$view.searchQuery` variable
- Variable persists within the current view scope
- Automatically updates as user types
- Can be accessed by other view components

**Behavior**:
1. User focuses on search bar
2. Search icon brightens to indicate focus
3. User types search query
4. Placeholder text disappears
5. User presses Enter or submits
6. Navigation occurs to: `URLPREFIX + searchQuery`

**Example Navigation URLs**:
```
URLPREFIX: "search:"
Query: "action movies"
Result: "search:action movies"

URLPREFIX: "plugin://myplugin/search?q="
Query: "thriller"
Result: "plugin://myplugin/search?q=thriller"
```

---

## Macro Usage Best Practices

### Importing Macros

Always import `theme.view` at the top of your view file to access all macros:

```view
#import "skin://theme.view"

// Now you can use all macros
widget(container_y, {
  PageHeader("My Page");
  // ... page content ...
});
```

### Combining Macros

Macros can be combined to create complex UI components:

```view
widget(container_z, {
  // Highlight layer
  ListItemHighlight();
  
  // Content layer
  widget(container_y, {
    widget(label, { caption: "Item Title"; });
    
    // Bevel at bottom
    ListItemBevel();
  });
});
```

### Macro Composition

Build complex components by composing multiple macros:

```view
// Custom page with header, scrollable content, and scrollbar
widget(container_z, {
  widget(container_y, {
    // Header
    PageHeader("Browse Content");
    
    // Scrollable content area
    widget(container_z, {
      widget(list_y, {
        id: "contentlist";
        
        cloner($self.model.items, container_z, {
          focusable: true;
          
          // Highlight
          ListItemHighlight();
          
          // Content
          widget(container_y, {
            widget(label, { caption: $self.title; });
            ListItemBevel();
          });
        });
      });
      
      // Scrollbar
      ScrollBar("contentlist", 3, 0);
    });
  });
});
```

### Performance Considerations

1. **Highlight Macros**: Use `GridItemHighlight()` (with `iir()`) for smoother animations, `ListItemHighlight()` for instant feedback
2. **Bevel Macros**: Minimal performance impact due to simple quad rendering
3. **ScrollBar**: Only rendered when content is scrollable (automatic optimization)
4. **SearchBar**: Text input has minimal overhead, efficient for real-time search

### Customization Patterns

While macros provide consistent styling, you can customize their behavior:

**Custom back button event**:
```view
BackButton(true, {
  // Custom logic before going back
  $ui.saveState = true;
  event("back");
});
```

**Custom scrollbar padding**:
```view
// Account for 3em header and 2em footer
ScrollBar("mylist", 3, 2);
```

**Custom search URL pattern**:
```view
// Different URL patterns for different search types
SearchBar("plugin://myplugin/movies?search=", "Search movies...");
SearchBar("plugin://myplugin/shows?search=", "Search TV shows...");
```

### Accessibility Considerations

1. **Keyboard Navigation**: 
   - `ListItemHighlight()` and `GridItemHighlight()` respond to `isNavFocused()`
   - `BackButton()` has `navFocusable: false` (mouse/touch only)
   - `ScrollBar()` is focusable when scrolling is possible

2. **Touch Support**:
   - `BackButton()` adapts to touch mode via `$ui.touch`
   - `SearchBar()` works with on-screen keyboard

3. **Visual Feedback**:
   - All interactive macros provide clear hover and focus states
   - Smooth transitions help users track state changes

---

## Source Reference

All macros documented here are defined in:
- **File**: `movian/glwskins/flat/theme.view`
- **Skin**: Flat skin (default Movian skin)
- **Version**: Movian 4.8+

## See Also

- [Skin Structure](skin-structure.md) - Understanding skin organization
- [Theme Variables](theme-variables.md) - Global theme customization
- [View File Syntax](../view-files/syntax-reference.md) - View file language reference
- [Widget Reference](../widgets/) - Individual widget documentation
