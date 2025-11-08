# Playdeck System Architecture

## Overview

The playdeck system provides a persistent media control interface that appears at the bottom of the screen during audio playback. Unlike the video player's OSD system (which is overlay-based), playdecks are integrated into the main UI layout and adapt to both device orientation and media type.

**Key Characteristics**:
- **Persistent Display**: Always visible during audio playback (tracks, radio)
- **Orientation-Adaptive**: Separate implementations for landscape and portrait modes
- **Media-Type-Specific**: Different layouts for music tracks vs. radio streams
- **Global Integration**: Loaded at the universe.view level, not per-page

## Directory Structure

```
movian/glwskins/flat/playdecks/
├── playdeck_include.view          # Shared macros and button definitions
├── landscape/                     # Horizontal orientation layouts
│   ├── tracks.view               # Music/podcast player controls
│   └── radio.view                # Radio stream player controls
└── portrait/                      # Vertical orientation layouts
    ├── tracks.view               # Mobile-optimized music controls
    └── radio.view                # Mobile-optimized radio controls
```

## Loading System

### Dynamic Playdeck Selection

Playdecks are loaded in `universe.view` using a combination of media type detection and orientation awareness:

```view
widget(loader, {
  autohide: true;
  source: translate($core.media.current.type, "",
                    "tracks", "playdecks/" + $ui.orientation + "/tracks.view",
                    "radio",  "playdecks/" + $ui.orientation + "/radio.view"
                   );
});
```

**Selection Logic**:
1. **Media Type Detection**: `$core.media.current.type` determines content type
   - `"tracks"` → Music, podcasts, audiobooks with track navigation
   - `"radio"` → Live streams without seek capability
   - `""` (empty) → No playdeck displayed (video or no media)

2. **Orientation Detection**: `$ui.orientation` determines layout variant
   - `"landscape"` → Horizontal layout (desktop, TV, tablet landscape)
   - `"portrait"` → Vertical layout (mobile, tablet portrait)

3. **Path Construction**: Combines both factors dynamically
   - Example: `"playdecks/landscape/tracks.view"`
   - Example: `"playdecks/portrait/radio.view"`

**Orientation Variable** (from `universe.view`):
```view
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");
```
- Aspect ratio > 1 (wider than tall) → landscape
- Aspect ratio ≤ 1 (taller than wide) → portrait

## Shared Components: playdeck_include.view

### Purpose

The `playdeck_include.view` file defines reusable macros for consistent button styling and behavior across all playdeck variants. This ensures uniform interaction patterns regardless of orientation or media type.

### Button Macros

#### PLAYDECK_BUTTON

Standard button with icon and event handling:

```view
#define PLAYDECK_BUTTON(ICON, EVENT, ENABLED) {
  widget(container_z, {
    style: "playdeckButtonContainer";
    onEvent(activate, EVENT);
    clickable: ENABLED;

    GridItemHighlight2();

    widget(icon, {
      style: "playdeckButtonIcon";
      source: ICON;
      alpha: 0.7 * iir(ENABLED, 8) + 0.3;
    });
  });
}
```

**Parameters**:
- `ICON`: Path to icon resource (e.g., `"skin://icons/ic_play_arrow_48px.svg"`)
- `EVENT`: Action to execute on activation (e.g., `deliverEvent(...)`)
- `ENABLED`: Boolean expression controlling button availability

**Features**:
- **Visual Feedback**: `GridItemHighlight2()` macro for hover/focus states
- **Smooth Transitions**: `iir(ENABLED, 8)` interpolates alpha over 8 frames
- **Disabled State**: Minimum alpha of 0.3 when disabled (0.7 * 0 + 0.3)
- **Style System**: Uses `playdeckButtonContainer` and `playdeckButtonIcon` styles

#### PLAYDECK_BUTTON2

Simplified button variant without alpha interpolation:

```view
#define PLAYDECK_BUTTON2(ICON, EVENT, ENABLED) {
  widget(container_z, {
    style: "playdeckButtonContainer";
    onEvent(activate, EVENT);
    clickable: ENABLED;

    GridItemHighlight2();

    widget(icon, {
      style: "playdeckButtonIcon";
      source: ICON;
      alpha: iir(ENABLED, 4);
    });
  });
}
```

**Differences from PLAYDECK_BUTTON**:
- Faster interpolation (4 frames vs. 8)
- No minimum alpha (fully transparent when disabled)
- Used for secondary controls (e.g., "show more buttons")

#### PLAYDECK_BUTTON_TOGGLE

Toggle button with visual state indication:

```view
#define PLAYDECK_BUTTON_TOGGLE(ICON, VALUE, ENABLED) {
  widget(container_z, {
    style: "playdeckButtonContainer";
    onEvent(activate, {
      toggle(VALUE);
    });

    clickable: ENABLED;

    GridItemHighlight2();

    widget(icon, {
      style: "playdeckButtonIcon";
      source: ICON;
      color: select(VALUE, 1, 0.3);
      alpha: 0.7 * iir(ENABLED, 8) + 0.3;
    });
  });
}
```

**Parameters**:
- `ICON`: Icon resource path
- `VALUE`: Boolean variable to toggle (e.g., `$core.media.current.repeat`)
- `ENABLED`: Availability condition

**Features**:
- **Automatic Toggle**: Built-in `toggle(VALUE)` action
- **State Visualization**: Color changes based on VALUE (1 = full color, 0.3 = dimmed)
- **Common Use Cases**: Repeat, shuffle, mute controls

### Standard Button Row

#### PLAYDECK_BUTTON_ROW

Defines the standard set of media control buttons:

```view
#define PLAYDECK_BUTTON_ROW() {
  PLAYDECK_BUTTON("skin://icons/ic_list_48px.svg",
                  navOpen("playqueue:"),
                  $core.playqueue.active);

  PLAYDECK_BUTTON("skin://icons/ic_skip_previous_48px.svg",
                  deliverEvent($core.media.current.eventSink, "PreviousTrack"),
                  $core.media.current.canSkipBackward);

  PLAYDECK_BUTTON(translate($core.media.current.playstatus,
                            "skin://icons/ic_pause_48px.svg",
                            "pause",
                            "skin://icons/ic_play_arrow_48px.svg"),
                  deliverEvent($core.media.current.eventSink, "PlayPause"),
                  $core.media.current.canPause);

  PLAYDECK_BUTTON("skin://icons/ic_skip_next_48px.svg",
                  deliverEvent($core.media.current.eventSink, "NextTrack"),
                  $core.media.current.canSkipForward);

  PLAYDECK_BUTTON_TOGGLE("dataroot://res/svg/Repeat.svg",
                         $core.media.current.repeat,
                         $core.media.current.canRepeat);

  PLAYDECK_BUTTON_TOGGLE("dataroot://res/svg/Shuffle.svg",
                         $core.media.current.shuffle,
                         $core.media.current.canShuffle);
}
```

**Button Sequence**:
1. **Play Queue** - Opens queue view (only if queue is active)
2. **Previous Track** - Skip to previous item
3. **Play/Pause** - Toggle playback (icon changes based on state)
4. **Next Track** - Skip to next item
5. **Repeat** - Toggle repeat mode (visual state indication)
6. **Shuffle** - Toggle shuffle mode (visual state indication)

**Media System Integration**:
- `$core.media.current.eventSink` - Target for media control events
- `$core.media.current.playstatus` - Current state ("play", "pause", "stop")
- `$core.media.current.canSkipBackward/Forward` - Navigation capabilities
- `$core.media.current.canPause` - Pause support
- `$core.media.current.repeat/shuffle` - Playback mode states
- `$core.playqueue.active` - Queue availability

### Expandable Button Container

#### PLAYDECK_BUTTONS

Provides a deck widget that can expand to show all controls:

```view
#define PLAYDECK_BUTTONS() {
  widget(deck, {
    PLAYDECK_BUTTON2("skin://icons/ic_more_horiz_48px.svg",
                     {
                       $ui.showAllPlaydeckButtons = 1;
                     }, $ui.showTopIcons);

    widget(container_x, {
      PLAYDECK_BUTTON_ROW();
    });

    page: $ui.showAllPlaydeckButtons;
  });
}
```

**Behavior**:
- **Page 0**: Shows "more" button (three horizontal dots)
- **Page 1**: Shows full button row
- **Toggle Variable**: `$ui.showAllPlaydeckButtons` controls state
- **Condition**: "More" button only visible when `$ui.showTopIcons` is true

**Use Case**: Space-constrained interfaces where full controls are hidden by default

## Landscape Playdecks

### Landscape Tracks Playdeck

**File**: `playdecks/landscape/tracks.view`

**Layout**: Horizontal bar at bottom of screen with left-to-right flow

```view
widget(container_z, {
  widget(quad, {
    color: 0;
    alpha: 0.8;
  });

  widget(container_x, {
    height: 2em;
    padding: [0.5em, 0, 2em, 1];

    PLAYDECK_BUTTONS();

    widget(dummy, {
      width: 0.5em;
    });

    widget(label, {
      clickable: true;
      focusOnClick: false;
      onEvent(activate, {
        $ui.showAllPlaydeckButtons = 0;
      });

      maxWidth: $ui.width / 3;
      caption: join(" • ",
                    $core.media.current.metadata.artist,
                    $core.media.current.metadata.title);
      style: "playdeckText";
    });

    widget(label, {
      hidden: !$core.media.current.canSeek;
      width: 4em;
      caption: value2duration($view.tentativeSeekPosition ??
                              $core.media.current.currenttime);
      align: right;
      padding:[0,0,0.5em,0];
    });

    widget(container_z, {
      hidden: !$core.media.current.canSeek;
      widget(container_y, {
        align: center;
        widget(container_z, {
          height: 3;
          widget(container_y, {
            padding: 1;
            widget(quad, {
              alpha: 0.3;
              additive: true;
            });
          });
        });
      });

      widget(slider_x, {
        knobOverEdges: true;
        tentative: $view.tentativeSeekPosition;
        alwaysGrabKnob: true;
        clickable: true;
        bind($core.media.current.currenttime);
        max: $core.media.current.metadata.duration;
        widget(icon, {
          source: "skin://icons/dot.png";
        });
        widget(container_y, {
          space(1);
          widget(quad, {
            height: 3;
            alpha: 0.9;
            additive: true;
          });
          space(1);
        });
      });
    });

    widget(label, {
      hidden: !$core.media.current.canSeek;
      width: 3em;
      caption: value2duration($core.media.current.metadata.duration);
      padding:[0.5em,0,0,0];
    });

    widget(container_x, {
      hidden: isVoid($core.media.current.metadata.album_art);
      width: 5em;
      padding: [0, -4em, 0, 0];
      widget(image, {
        zoffset: 100;
        source: $core.media.current.metadata.album_art;
      });
    });
  });
});
```

**Layout Components** (left to right):
1. **Control Buttons** - `PLAYDECK_BUTTONS()` macro with expandable controls
2. **Spacer** - 0.5em dummy widget for visual separation
3. **Track Info** - Artist and title (max 1/3 screen width)
4. **Current Time** - Formatted playback position (if seekable)
5. **Seek Bar** - Interactive slider with progress visualization
6. **Total Duration** - Track length (if seekable)
7. **Album Art** - Cover image (5em width, negative padding for overlap)

**Key Features**:
- **Semi-transparent Background**: Black quad with 0.8 alpha
- **Seek Support**: Time display and slider only shown if `$core.media.current.canSeek`
- **Tentative Seeking**: `$view.tentativeSeekPosition` shows preview during drag
- **Album Art Overlay**: Negative padding creates visual overlap effect
- **Clickable Label**: Clicking track info collapses expanded button row

**Style Overrides**:
```view
style(playdeckButtonContainer, {
  width: 2em;
});
```

### Landscape Radio Playdeck

**File**: `playdecks/landscape/radio.view`

**Differences from Tracks**:
- **No Seek Controls**: Radio streams are live, no time display or slider
- **Different Metadata**: Shows title and `$core.media.current.radioinfo`
- **Simpler Layout**: Fewer components due to lack of seeking

```view
widget(container_z, {
  widget(quad, {
    color: 0;
    alpha: 0.2;
  });

  widget(container_x, {
    height: 2em;
    padding: [0.5em, 0, 2em, 1];

    PLAYDECK_BUTTONS();

    widget(dummy, {
      width: 0.5em;
    });

    widget(label, {
      clickable: true;
      focusOnClick: false;
      onEvent(activate, {
        $ui.showAllPlaydeckButtons = 0;
      });

      caption: join(" • ",
                    $core.media.current.metadata.title,
                    $core.media.current.radioinfo),
      style: "playdeckText";
    });

    space(1);

    widget(container_x, {
      width: 5em;
      padding: [0, -4em, 0, 0];
      widget(image, {
        zoffset: 100;
        source: $core.media.current.metadata.album_art;
      });
    });
  });
});
```

**Layout Components** (left to right):
1. **Control Buttons** - Same expandable button system
2. **Spacer** - Visual separation
3. **Stream Info** - Title and radio info (no width constraint)
4. **Flexible Space** - `space(1)` pushes album art to right
5. **Station Logo** - Album art field used for station branding

**Key Differences**:
- **Lower Background Alpha**: 0.2 vs. 0.8 (more transparent)
- **No Time Controls**: Entire seek bar section removed
- **Radio-Specific Data**: Uses `$core.media.current.radioinfo` for station details
- **Flexible Layout**: `space(1)` allows label to expand

## Portrait Playdecks

### Portrait Tracks Playdeck

**File**: `playdecks/portrait/tracks.view`

**Layout**: Vertical stacking with background image and overlay controls

```view
widget(container_z, {
  widget(quad, {
    color: 0.3;
    alpha: 0.5;
  });

  widget(container_x, {
    widget(image, {
      aspectConstraint: true;
      alpha: 0.5;
      source: $core.media.current.metadata.album_art;
    });
    space(1);
  });

  widget(container_y, {
    align: center;
    height: 4em;
    padding: [0.5em, 0, 0.5em, 0.5em];

    widget(container_x, {
      align: center;
      widget(dummy, {
        width: 2em;
      });
      PLAYDECK_BUTTON_ROW();
    });

    widget(label, {
      align: center;
      maxWidth: $ui.width / 3;
      caption: join(" • ",
                    $core.media.current.metadata.artist,
                    $core.media.current.metadata.title);
      style: "playdeckText";
      shadow: true;
    });

    widget(container_x, {
      widget(label, {
        hidden: !$core.media.current.canSeek;
        width: 3em;
        caption: value2duration($view.tentativeSeekPosition ??
                                $core.media.current.currenttime);
        align: right;
        padding:[0,0,0.5em,0];
        shadow: true;
      });

      widget(container_z, {
        hidden: !$core.media.current.canSeek;
        widget(container_y, {
          align: center;
          widget(container_z, {
            height: 3;
            widget(container_y, {
              padding: 1;
              widget(quad, {
                alpha: 0.3;
                additive: true;
              });
            });
          });
        });

        widget(slider_x, {
          knobOverEdges: true;
          tentative: $view.tentativeSeekPosition;
          alwaysGrabKnob: true;
          clickable: true;
          bind($core.media.current.currenttime);
          max: $core.media.current.metadata.duration;
          widget(icon, {
            source: "skin://icons/dot.png";
          });
          widget(container_y, {
            space(1);
            widget(quad, {
              height: 3;
              alpha: 0.9;
              additive: true;
            });
            space(1);
          });
        });
      });

      widget(label, {
        hidden: !$core.media.current.canSeek;
        width: 3em;
        caption: value2duration($core.media.current.metadata.duration);
        padding:[0.5em,0,0,0];
        shadow: true;
      });
    });
  });
});
```

**Layout Structure** (layered):
1. **Background Layer** (container_z):
   - Semi-transparent dark quad (color: 0.3, alpha: 0.5)
   - Full-width album art at 50% opacity
   
2. **Control Layer** (container_y, centered):
   - **Button Row**: Centered horizontally with 2em left spacer
   - **Track Info**: Centered label with text shadow
   - **Seek Controls**: Time labels and slider in horizontal container

**Orientation Adaptations**:
- **Vertical Stacking**: Controls arranged top-to-bottom instead of left-to-right
- **Background Image**: Album art fills width as backdrop
- **Centered Layout**: All controls centered for thumb accessibility
- **Text Shadows**: `shadow: true` for readability over image background
- **Larger Buttons**: 2em × 2em vs. 2em width only
- **Larger Icons**: 1.2em size for touch targets

**Style Overrides**:
```view
style(playdeckButtonContainer, {
  width: 2em;
  height: 2em;
});

style(playdeckButtonIcon, {
  size: 1.2em;
});
```

### Portrait Radio Playdeck

**File**: `playdecks/portrait/radio.view`

**Simplified Layout**: No seek controls, similar background treatment

```view
widget(container_z, {
  widget(quad, {
    color: 0.3;
    alpha: 0.5;
  });

  widget(container_x, {
    widget(image, {
      aspectConstraint: true;
      alpha: 0.5;
      source: $core.media.current.metadata.album_art;
    });
    space(1);
  });

  widget(container_y, {
    align: center;
    height: 4em;
    padding: [0.5em, 0, 0.5em, 0.5em];

    widget(container_x, {
      align: center;
      widget(dummy, {
        width: 2em;
      });
      PLAYDECK_BUTTON_ROW();
    });

    widget(label, {
      align: center;
      maxWidth: $ui.width / 3;
      caption: join(" • ",
                    $core.media.current.metadata.title,
                    $core.media.current.radioinfo),
      style: "playdeckText";
      shadow: true;
    });
  });
});
```

**Differences from Portrait Tracks**:
- **No Seek Bar**: Entire time control section removed
- **Simpler Vertical Stack**: Only buttons and label
- **Radio Metadata**: Uses `radioinfo` instead of artist
- **Same Visual Treatment**: Background image and shadows maintained

## Media System Integration

### Core Media Properties

**Playback State**:
```view
$core.media.current.type           // "tracks", "radio", "video", ""
$core.media.current.playstatus     // "play", "pause", "stop"
$core.media.current.currenttime    // Current position in seconds
```

**Capabilities**:
```view
$core.media.current.canSeek        // Boolean: seeking supported
$core.media.current.canPause       // Boolean: pause supported
$core.media.current.canSkipBackward    // Boolean: previous track available
$core.media.current.canSkipForward     // Boolean: next track available
$core.media.current.canRepeat      // Boolean: repeat mode available
$core.media.current.canShuffle     // Boolean: shuffle mode available
```

**Metadata**:
```view
$core.media.current.metadata.title        // Track/stream title
$core.media.current.metadata.artist       // Artist name (tracks only)
$core.media.current.metadata.album_art    // Cover image URL
$core.media.current.metadata.duration     // Total length in seconds
$core.media.current.radioinfo             // Station info (radio only)
```

**Playback Modes**:
```view
$core.media.current.repeat         // Boolean: repeat enabled
$core.media.current.shuffle        // Boolean: shuffle enabled
```

**Event Sink**:
```view
$core.media.current.eventSink      // Target for media control events
```

### Event Delivery

**Media Control Events**:
```view
deliverEvent($core.media.current.eventSink, "PlayPause")
deliverEvent($core.media.current.eventSink, "PreviousTrack")
deliverEvent($core.media.current.eventSink, "NextTrack")
```

**Event Types**:
- `"PlayPause"` - Toggle play/pause state
- `"PreviousTrack"` - Skip to previous item in queue
- `"NextTrack"` - Skip to next item in queue
- `"Stop"` - Stop playback completely

### Play Queue Integration

```view
$core.playqueue.active             // Boolean: queue system available
navOpen("playqueue:")              // Opens play queue view
```

## Design Patterns

### Orientation-Specific Adaptations

**Landscape (Desktop/TV)**:
- **Horizontal Layout**: Maximizes screen width
- **Compact Height**: 2em bar doesn't obstruct content
- **Left-to-Right Flow**: Natural reading order
- **Album Art as Accent**: Small image on right side
- **Smaller Touch Targets**: Mouse/remote precision

**Portrait (Mobile/Tablet)**:
- **Vertical Layout**: Optimizes for narrow screens
- **Larger Height**: 4em provides comfortable touch area
- **Centered Controls**: Thumb-friendly positioning
- **Album Art as Background**: Full-width visual context
- **Larger Touch Targets**: 2em × 2em buttons, 1.2em icons
- **Text Shadows**: Ensures readability over images

### Media-Type-Specific Adaptations

**Tracks (Music/Podcasts)**:
- **Seek Controls**: Time display and interactive slider
- **Artist + Title**: Dual metadata display
- **Duration Display**: Total track length
- **Tentative Seeking**: Preview position during drag
- **Skip Controls**: Previous/next track navigation

**Radio (Live Streams)**:
- **No Seek Controls**: Live content can't be scrubbed
- **Station Info**: Uses `radioinfo` field
- **Simpler Layout**: Fewer UI elements
- **Lower Background Alpha**: Less visual weight (landscape only)

### Conditional Visibility Patterns

**Seek-Dependent Elements**:
```view
hidden: !$core.media.current.canSeek;
```
Applied to:
- Current time label
- Seek slider
- Duration label

**Album Art Visibility**:
```view
hidden: isVoid($core.media.current.metadata.album_art);
```
Only show image container if artwork exists

**Button Availability**:
```view
clickable: $core.media.current.canSkipForward;
alpha: 0.7 * iir($core.media.current.canSkipForward, 8) + 0.3;
```
Buttons remain visible but dimmed when unavailable

### Visual Feedback Techniques

**Smooth State Transitions**:
```view
alpha: iir(ENABLED, 8)
```
- `iir()` function provides interpolated animation
- 8-frame transition for smooth visual changes
- Prevents jarring on/off switches

**Hover and Focus States**:
```view
GridItemHighlight2();
```
- Consistent highlight macro across all buttons
- Responds to both mouse hover and keyboard focus

**Toggle State Visualization**:
```view
color: select(VALUE, 1, 0.3);
```
- Full color when enabled (1)
- Dimmed when disabled (0.3)
- Immediate visual feedback

**Tentative Seeking**:
```view
tentative: $view.tentativeSeekPosition;
caption: value2duration($view.tentativeSeekPosition ?? $core.media.current.currenttime);
```
- Shows preview time during slider drag
- Falls back to current time when not dragging
- Provides feedback before committing seek

## Best Practices

### Creating Custom Playdecks

1. **Import Shared Components**:
   ```view
   #import "skin://playdecks/playdeck_include.view"
   ```

2. **Override Button Styles**:
   ```view
   style(playdeckButtonContainer, {
     width: 2em;
     height: 2em;  // Add height for portrait
   });
   ```

3. **Use Standard Macros**:
   - `PLAYDECK_BUTTON_ROW()` for consistent controls
   - `PLAYDECK_BUTTONS()` for expandable interface
   - Custom buttons with `PLAYDECK_BUTTON()` macro

4. **Respect Capabilities**:
   - Always check `canSeek`, `canPause`, etc.
   - Hide unavailable controls rather than disabling
   - Provide visual feedback for disabled states

5. **Optimize for Input Method**:
   - Landscape: Smaller targets, mouse/remote precision
   - Portrait: Larger targets, thumb-friendly positioning
   - Add text shadows for portrait overlays

### Performance Considerations

**Efficient Conditional Rendering**:
```view
hidden: !$core.media.current.canSeek;
```
Better than:
```view
alpha: select($core.media.current.canSeek, 1, 0);
```
Hidden widgets don't render at all

**Minimize Reflows**:
- Use fixed heights where possible (`height: 2em`)
- Avoid dynamic width calculations in hot paths
- Use `space(1)` for flexible spacing

**Smooth Animations**:
- Use `iir()` for interpolated transitions
- Choose appropriate frame counts (4-8 typical)
- Avoid animating layout properties (width/height)

## Troubleshooting

### Playdeck Not Appearing

**Check Media Type**:
```view
// Debug: Show current media type
widget(label, {
  caption: "Media type: " + $core.media.current.type;
});
```

**Verify Orientation**:
```view
// Debug: Show orientation
widget(label, {
  caption: "Orientation: " + $ui.orientation;
});
```

**Check File Paths**:
- Ensure files exist at expected locations
- Verify `skin://` protocol resolution
- Check for typos in `translate()` paths

### Controls Not Working

**Event Sink Availability**:
```view
// Verify event sink exists
hidden: isVoid($core.media.current.eventSink);
```

**Capability Checks**:
- Buttons may be disabled due to capability flags
- Check `canPause`, `canSkipForward`, etc.
- Verify media backend supports requested operations

### Layout Issues

**Portrait Overlap**:
- Ensure `container_z` layering is correct
- Check `zoffset` values for proper stacking
- Verify background image doesn't obscure controls

**Landscape Overflow**:
- Check `maxWidth` constraints on labels
- Verify padding values don't cause overflow
- Use `filterConstraintX` if needed

### Style Conflicts

**Button Size Issues**:
- Verify style overrides are after `#import`
- Check for conflicting global styles
- Use specific style names to avoid collisions

**Icon Sizing**:
- Portrait needs larger icons (1.2em vs. default)
- Ensure `playdeckButtonIcon` style is overridden
- Check icon source paths are valid

## Related Documentation

- [OSD System Architecture](osd-system.md) - Video player overlay controls
- [Audio/Video UI Integration](audio-video-ui.md) - Media system overview
- [Macro System Reference](../ui/theming/macro-reference.md) - Shared macro definitions
- [Global Configuration](../ui/theming/global-configuration.md) - Universe.view integration
- [Widget Reference](../ui/widgets/) - Container and control widgets
