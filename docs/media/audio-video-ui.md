# Audio and Video UI Components

## Overview

Movian's media player UI provides comprehensive controls for audio and video playback through two main systems:

1. **Playdeck System** - Persistent media controls that adapt to content type and screen orientation
2. **Video Player Controls** - Full-featured video playback interface with OSD integration

This document covers the implementation of media player UI components, their integration with the core media system, and how they adapt to different media types and device orientations.

## Playdeck System Architecture

### Overview

The playdeck is a persistent UI component that displays media controls for currently playing content. It appears at the bottom of the screen and adapts based on:

- **Media Type**: Different layouts for tracks (music/video) vs. radio streams
- **Screen Orientation**: Landscape vs. portrait layouts
- **Device Capabilities**: Touch vs. remote control interfaces

### Directory Structure

```
glwskins/flat/playdecks/
├── playdeck_include.view      # Shared macros and button definitions
├── landscape/
│   ├── tracks.view            # Music/video track controls (landscape)
│   └── radio.view             # Radio stream controls (landscape)
└── portrait/
    ├── tracks.view            # Music/video track controls (portrait)
    └── radio.view             # Radio stream controls (portrait)
```

### Playdeck Loading System

The playdeck is dynamically loaded in `universe.view` based on media type and orientation:

```view
widget(loader, {
  autohide: true;
  source: translate($core.media.current.type,
    "tracks", "playdecks/" + $ui.orientation + "/tracks.view",
    "radio", "playdecks/" + $ui.orientation + "/radio.view"
  );
});
```

**Media Type Detection:**
- `$core.media.current.type` - Current media type ("tracks", "radio", etc.)
- Automatically switches playdeck layout when media type changes

**Orientation Adaptation:**
- `$ui.orientation` - Current screen orientation ("landscape" or "portrait")
- Calculated in `universe.view`: `$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");`

## Playdeck Button Macros

### PLAYDECK_BUTTON Macro


Defined in `playdeck_include.view`, creates clickable media control buttons:

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

**Parameters:**
- `ICON` - Path to icon file (SVG or PNG)
- `EVENT` - Action to execute on button press
- `ENABLED` - Boolean expression controlling button availability

**Visual Feedback:**
- Uses `GridItemHighlight2()` macro for hover/focus effects
- Alpha animation: `0.7 * iir(ENABLED, 8) + 0.3` (smooth fade between 0.3 and 1.0)

### PLAYDECK_BUTTON_TOGGLE Macro

Creates toggle buttons for repeat/shuffle functionality:

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

**Parameters:**
- `ICON` - Path to icon file
- `VALUE` - Variable to toggle (e.g., `$core.media.current.repeat`)
- `ENABLED` - Boolean expression controlling button availability

**Visual State:**
- Active state: `color: 1` (full brightness)
- Inactive state: `color: 0.3` (dimmed)

### PLAYDECK_BUTTON_ROW Macro

Creates the standard row of media control buttons:

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

**Button Functions:**
1. **Play Queue** - Opens the play queue page
2. **Previous Track** - Skip to previous track
3. **Play/Pause** - Toggle playback (icon changes based on play status)
4. **Next Track** - Skip to next track
5. **Repeat** - Toggle repeat mode
6. **Shuffle** - Toggle shuffle mode

## Landscape Tracks Playdeck

### Layout Structure

The landscape tracks playdeck (`playdecks/landscape/tracks.view`) provides a horizontal layout optimized for wide screens:

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

    // Seek bar and time display
    // Album art thumbnail
  });
});
```

### Key Features

**Media Information Display:**
```view
caption: join(" • ",
              $core.media.current.metadata.artist,
              $core.media.current.metadata.title);
```

**Seek Bar Implementation:**
```view
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
```

**Time Display:**
```view
widget(label, {
  hidden: !$core.media.current.canSeek;
  width: 4em;
  caption: value2duration($view.tentativeSeekPosition ??
                          $core.media.current.currenttime);
  align: right;
  padding:[0,0,0.5em,0];
});

widget(label, {
  hidden: !$core.media.current.canSeek;
  width: 3em;
  caption: value2duration($core.media.current.metadata.duration);
  padding:[0.5em,0,0,0];
});
```

**Album Art Thumbnail:**
```view
widget(container_x, {
  hidden: isVoid($core.media.current.metadata.album_art);
  width: 5em;
  padding: [0, -4em, 0, 0];
  widget(image, {
    zoffset: 100;
    source: $core.media.current.metadata.album_art;
  });
});
```

## Portrait Tracks Playdeck

### Layout Structure

The portrait tracks playdeck (`playdecks/portrait/tracks.view`) uses a vertical layout optimized for narrow screens:

```view
widget(container_z, {
  widget(quad, {
    color: 0.3;
    alpha: 0.5;
  });

  // Background album art
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

    // Seek bar (similar to landscape)
  });
});
```

### Key Differences from Landscape

1. **Background Image**: Full-width album art as background (50% opacity)
2. **Vertical Layout**: Controls stacked vertically instead of horizontally
3. **Text Shadows**: `shadow: true` for better readability over background
4. **Smaller Buttons**: `size: 1.2em` for button icons
5. **Centered Alignment**: All elements centered for portrait orientation

## Radio Stream Playdeck

### Landscape Radio Layout

The radio playdeck (`playdecks/landscape/radio.view`) is simplified for streaming content:

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

### Key Differences from Tracks

1. **No Seek Bar**: Radio streams typically don't support seeking
2. **Radio Info**: Displays `$core.media.current.radioinfo` instead of artist
3. **Simpler Layout**: Fewer controls, focus on current stream information

## Video Player Controls

### Video Page Structure

The video playback page (`pages/video.view`) integrates OSD, playdeck, and video controls:

```view
widget(container_z, {
  clickable: true;
  onEvent(activate, {
    toggle($clone.showPlaydeck);
    focus("pause-btn");
  });

  // Primary video display
  widget(layer, {
    widget(video, {
      id: "videowidget";
      primary: true;
      source: $self.source;
      focusable: 0.1;
      injectEventsFrom($self.control);

      onEvent(left,  deliverEvent($self.media.eventSink, "SeekReverse"));
      onEvent(right, deliverEvent($self.media.eventSink, "SeekForward"));
      onEvent(up,    deliverEvent($self.media.eventSink, "VolumeUp"));
      onEvent(down,  deliverEvent($self.media.eventSink, "VolumeDown"));

      bottomOverlayDisplacement: $clone.bottomOsdHeight;
    });

    // OSD container
    // Playdeck controls
    // Seekbar
  });
});
```

### Video Widget Event Handling

**Directional Controls:**
```view
onEvent(left,  deliverEvent($self.media.eventSink, "SeekReverse"));
onEvent(right, deliverEvent($self.media.eventSink, "SeekForward"));
onEvent(up,    deliverEvent($self.media.eventSink, "VolumeUp"));
onEvent(down,  deliverEvent($self.media.eventSink, "VolumeDown"));
```

### Playdeck Button Row in Video Page

The video page defines its own playdeck buttons with additional controls:

```view
widget(container_x, {
  spacing: 1em;
  padding: [1em + $view.iconPad, 0.1em];
  align: center;
  
  PLAYDECK_BUTTON("skin://icons/ic_stop_48px.svg",
                  _("Stop"),
                  deliverEvent($self.control, Stop),
                  true, "stop-btn");

  PLAYDECK_BUTTON("skin://icons/ic_subtitles_48px.svg",
                  _("Subtitles"),
                  {
                    $clone.osdpage = select($clone.osdpage == 100, 0, 100);
                    focus("osd_subs");
                  }, true, "subtitles-btn");

  PLAYDECK_BUTTON("skin://icons/ic_skip_previous_48px.svg",
                  _("Previous"),
                  deliverEvent($self.control, PreviousTrack),
                  $self.media.canSkipBackward ||
                  $self.media.canSeek,
                 "prev-btn");

  PLAYDECK_BUTTON(translate($core.media.current.playstatus,
                            "skin://icons/ic_pause_48px.svg",
                            "pause",
                            "skin://icons/ic_play_arrow_48px.svg"),
                  _("Play/Pause"),
                  deliverEvent($self.control, PlayPause),
                  $self.media.canPause,
                 "pause-btn");

  PLAYDECK_BUTTON("skin://icons/ic_skip_next_48px.svg",
                  _("Next"),
                  deliverEvent($self.control, NextTrack),
                  $self.media.canSkipForward,
                 "next-btn");

  PLAYDECK_BUTTON("skin://icons/ic_speaker_48px.svg",
                  _("Audio tracks"),
                  {
                    $clone.osdpage = select($clone.osdpage == 101, 0, 101);
                    focus("osd_audio");
                  }, true, "audio-btn");

  PLAYDECK_BUTTON("skin://icons/ic_menu_48px.svg",
                  _("Settings"),
                  {
                    toggle($clone.osdpage);
                    focus("osd_main");
                  }, true, "menu-btn",
                  $clone.osdpage > 0 && $clone.osdpage < 100);
});
```

### Video Seekbar

The video seekbar appears at the bottom of the screen:

```view
widget(container_y, {
  hidden: !$view.showSeekBar || !$self.media.canSeek;
  align: bottom;
  padding: [0,0,0,$ui.universeBottomHeight];
  
  widget(container_z, {
    delta($clone.bottomOsdHeight, isVisible() * getHeight());
    height: 2em;
    
    widget(quad, {
      alpha: 0.8;
      color: 0;
    });

    widget(container_x, {
      spacing: 0.5em;
      padding: [$view.iconPad, 0, 0, 0];

      widget(label, {
        width: 4em;
        caption: value2duration($view.tentativeSeekPosition ??
                                $self.media.currenttime);
        align: right;
      });

      widget(container_z, {
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
          bind($self.media.currenttime);
          max: $self.media.metadata.duration;
          secondBarValue: $core.media.current.buffer.delay;
          
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
          
          widget(container_y, {
            space(1);
            widget(quad, {
              height: 3;
              alpha: 0.5;
              additive: true;
            });
            space(1);
          });
        });
      });
      
      widget(label, {
        width: 4em;
        caption: value2duration($self.media.metadata.duration);
      });
    });
  });
});
```

**Seekbar Features:**
- **Current Time**: `$self.media.currenttime` (bound to slider)
- **Tentative Position**: `$view.tentativeSeekPosition` (preview while dragging)
- **Buffer Indicator**: `secondBarValue: $core.media.current.buffer.delay`
- **Duration Display**: Total media duration

### Seekbar Visibility Control

```view
$view.showSeekBar =
  $ui.pointerVisible ||
  $clone.showPlaydeck ||
  changed($self.media.seektime, 5, true) ||
  changed($self.url, 5, true) ||
  $self.media.playstatus == "pause";
```

**Visibility Conditions:**
- Mouse/pointer is visible
- Playdeck is shown
- Seek operation occurred in last 5 seconds
- URL changed in last 5 seconds
- Media is paused

## Media System Integration

### Core Media Properties

The UI components access media state through `$core.media.current`:

**Playback State:**
```view
$core.media.current.playstatus      // "play", "pause", "stop"
$core.media.current.currenttime     // Current playback position (seconds)
$core.media.current.eventSink       // Event delivery target
```

**Capabilities:**
```view
$core.media.current.canPause        // Can pause/resume
$core.media.current.canSeek         // Can seek to position
$core.media.current.canSkipForward  // Can skip to next track
$core.media.current.canSkipBackward // Can skip to previous track
$core.media.current.canRepeat       // Supports repeat mode
$core.media.current.canShuffle      // Supports shuffle mode
```

**Metadata:**
```view
$core.media.current.metadata.title       // Track/video title
$core.media.current.metadata.artist      // Artist name
$core.media.current.metadata.album_art   // Album art URL
$core.media.current.metadata.duration    // Total duration (seconds)
$core.media.current.metadata.icon        // Media icon
```

**Radio-Specific:**
```view
$core.media.current.radioinfo       // Current radio stream information
```

### Media Type Detection and Adaptive UI

**Media Type Property:**

The `$core.media.current.type` property identifies the current media type and drives UI adaptation:

```view
$core.media.current.type            // Media type: "tracks", "radio", "video", etc.
```

**Automatic Playdeck Selection:**

The playdeck system uses media type detection to load appropriate controls:

```view
widget(loader, {
  autohide: true;
  source: translate($core.media.current.type,
    "tracks", "playdecks/" + $ui.orientation + "/tracks.view",
    "radio", "playdecks/" + $ui.orientation + "/radio.view"
  );
});
```

**Media Type Values:**

| Type | Description | UI Adaptation |
|------|-------------|---------------|
| `"tracks"` | Music tracks or video files | Full controls with seek bar, track navigation |
| `"radio"` | Radio streams | Simplified controls, no seek bar, radio info display |
| `"video"` | Video playback | Video-specific controls, OSD integration |
| (empty) | No media playing | Playdeck hidden via `autohide: true` |

**Conditional UI Elements Based on Media Type:**

```view
// Hide seek controls for radio streams
widget(container_x, {
  hidden: translate($core.media.current.type, true,
                    "tracks", false,
                    "radio", true);
  
  // Seek bar implementation...
});

// Show radio-specific information
widget(label, {
  hidden: $core.media.current.type != "radio";
  caption: $core.media.current.radioinfo;
});

// Show track-specific metadata
widget(label, {
  hidden: $core.media.current.type != "tracks";
  caption: join(" • ",
                $core.media.current.metadata.artist,
                $core.media.current.metadata.title);
});
```

**Media Control Visibility:**

```view
// Show playback controls only when media is active
widget(container_z, {
  hidden: translate($core.media.current.type, true,
                    "tracks", false,
                    "radio", false);
  
  // Media controls...
});
```

### Screen Orientation Adaptation

**Orientation Detection:**

The `$ui.orientation` property automatically detects screen orientation:

```view
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");
```

**Calculation Logic:**
- `$ui.aspect` - Screen aspect ratio (width / height)
- `$ui.aspect > 1` - Landscape (wider than tall)
- `$ui.aspect <= 1` - Portrait (taller than wide)

**Orientation Values:**

| Value | Condition | Typical Devices |
|-------|-----------|-----------------|
| `"landscape"` | `$ui.aspect > 1` | TVs, desktop monitors, tablets in horizontal mode |
| `"portrait"` | `$ui.aspect <= 1` | Phones, tablets in vertical mode |

**Automatic Layout Selection:**

The playdeck system uses orientation to select appropriate layout:

```view
widget(loader, {
  autohide: true;
  source: translate($core.media.current.type,
    "tracks", "playdecks/" + $ui.orientation + "/tracks.view",
    "radio", "playdecks/" + $ui.orientation + "/radio.view"
  );
});
```

**Path Resolution Examples:**
- Landscape tracks: `"playdecks/landscape/tracks.view"`
- Portrait tracks: `"playdecks/portrait/tracks.view"`
- Landscape radio: `"playdecks/landscape/radio.view"`
- Portrait radio: `"playdecks/portrait/radio.view"`

**Orientation-Specific Styling:**

```view
// Adjust padding based on orientation
widget(container_x, {
  padding: select($ui.orientation == "landscape",
                  [0.5em, 1em],      // Landscape: more horizontal padding
                  [1em, 0.5em]);     // Portrait: more vertical padding
});

// Adjust button size for touch interfaces
style(playdeckButtonIcon, {
  size: select($ui.orientation == "portrait",
               1.5em,                // Larger for portrait/touch
               1.2em);               // Smaller for landscape/remote
});

// Conditional layout direction
widget(select($ui.orientation == "landscape",
              container_x,           // Horizontal for landscape
              container_y), {        // Vertical for portrait
  // Content...
});
```

**Responsive Margins:**

```view
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);
```

This creates adaptive horizontal margins:
- Landscape: 1% of screen width
- Portrait: Fixed 0.2em margin

**Orientation Change Handling:**

The UI automatically adapts when orientation changes:

1. `$ui.orientation` updates based on new aspect ratio
2. Playdeck loader detects change and loads new layout
3. `autohide: true` ensures smooth transition
4. Previous layout is unloaded automatically

### Audio System Integration

**Volume Control Properties:**

```view
$core.audio.mastervolume            // Master volume level (-75 to 12 dB)
$core.audio.mastermute              // Mute state (boolean)
```

**Volume Range:**
- Minimum: -75 dB (near silence)
- Maximum: +12 dB (amplification)
- Default: 0 dB (unity gain)

**Volume Bar Implementation:**

```view
widget(container_x, {
  // Show volume bar when volume changes
  alpha: iir(changed($core.audio.mastervolume, 2, true), 7);
  
  widget(bar, {
    // Convert dB range (-75 to 12) to 0-1 fill percentage
    fill: ($core.audio.mastervolume + 75) / 87;
    color1: $ui.color1;
    color2: $ui.color2;
  });
});
```

**Volume Bar Calculation:**
- Range: -75 dB to +12 dB = 87 dB total
- Formula: `(volume + 75) / 87`
- Example: 0 dB → (0 + 75) / 87 = 0.86 (86% full)
- Example: -75 dB → (-75 + 75) / 87 = 0.0 (0% full)
- Example: +12 dB → (12 + 75) / 87 = 1.0 (100% full)

**Volume Display with Percentage:**

```view
widget(container_y, {
  alpha: iir(changed($core.audio.mastervolume, 2, true), 7);
  
  widget(label, {
    caption: fmt(_("Volume: %d%%"), 
                 ($core.audio.mastervolume + 75) * 100 / 87);
    align: center;
  });
  
  widget(container_x, {
    widget(bar, {
      fill: ($core.audio.mastervolume + 75) / 87;
      color1: $ui.color1;
      color2: $ui.color2;
    });
  });
});
```

**Volume Control in OSD:**

From `sidebar_common.view`:

```view
SIDEBAR_INTEGER(_("Master volume"), "skin://icons/ic_speaker_48px.svg",
                -75, 12, 1, $core.audio.mastervolume, _("dB"));
```

This creates an interactive slider:
- Min: -75 dB
- Max: +12 dB
- Step: 1 dB
- Bound to: `$core.audio.mastervolume`
- Unit: "dB"

**Mute Indicator:**

```view
widget(container_x, {
  // Show mute indicator when audio is muted
  alpha: iir($core.audio.mastermute, 7);
  
  widget(icon, {
    source: "skin://icons/ic_volume_off_48px.svg";
  });
  
  widget(label, {
    caption: _("Audio muted");
  });
});
```

**Mute Toggle Button:**

```view
widget(container_z, {
  focusable: true;
  onEvent(activate, {
    toggle($core.audio.mastermute);
  });
  
  widget(icon, {
    source: select($core.audio.mastermute,
                   "skin://icons/ic_volume_off_48px.svg",
                   "skin://icons/ic_volume_up_48px.svg");
    color: select($core.audio.mastermute, [1, 0.3, 0.3], 1);
  });
});
```

**Volume Change Animation:**

The `changed()` function detects volume changes:

```view
changed($core.audio.mastervolume, 2, true)
```

Parameters:
- Variable: `$core.audio.mastervolume`
- Timeout: 2 seconds (returns true for 2 seconds after change)
- Initial: `true` (returns true on first evaluation)

Combined with `iir()` for smooth fade:

```view
alpha: iir(changed($core.audio.mastervolume, 2, true), 7);
```

This creates a volume indicator that:
1. Appears when volume changes
2. Stays visible for 2 seconds
3. Fades out smoothly over 7 frames

**Complete Volume Overlay Example:**

```view
widget(container_z, {
  // Position in top-right corner
  align: topRight;
  padding: 2em;
  
  widget(container_y, {
    // Show for 2 seconds after volume change
    alpha: iir(changed($core.audio.mastervolume, 2, true), 7);
    width: 15em;
    spacing: 0.5em;
    
    // Background
    widget(quad, {
      color: 0;
      alpha: 0.8;
      padding: 1em;
    });
    
    // Volume icon and label
    widget(container_x, {
      spacing: 0.5em;
      padding: 1em;
      
      widget(icon, {
        source: select($core.audio.mastermute,
                       "skin://icons/ic_volume_off_48px.svg",
                       "skin://icons/ic_volume_up_48px.svg");
        size: 2em;
      });
      
      widget(label, {
        caption: select($core.audio.mastermute,
                        _("Muted"),
                        fmt(_("Volume: %d dB"), $core.audio.mastervolume));
        size: 1.2em;
      });
    });
    
    // Volume bar
    widget(container_x, {
      padding: [0, 1em];
      height: 0.5em;
      
      widget(container_z, {
        // Background track
        widget(quad, {
          color: 0.3;
          alpha: 0.5;
        });
        
        // Fill bar
        widget(container_x, {
          widget(quad, {
            width: ($core.audio.mastervolume + 75) / 87;
            color: $ui.color1;
            alpha: select($core.audio.mastermute, 0.3, 1.0);
          });
          space(1);
        });
      });
    });
  });
});
```

### Media Event Delivery

**Event Delivery Pattern:**
```view
deliverEvent($core.media.current.eventSink, "EventName")
deliverEvent($self.control, EventName)
```

**Common Media Events:**
- `PlayPause` - Toggle play/pause
- `Stop` - Stop playback
- `NextTrack` - Skip to next
- `PreviousTrack` - Skip to previous
- `SeekForward` - Seek forward
- `SeekReverse` - Seek backward
- `VolumeUp` - Increase volume
- `VolumeDown` - Decrease volume

### Track Selection

**Audio Track Selection:**
```view
deliverEvent($parent.control, selectAudioTrack($self.url))
```

**Subtitle Track Selection:**
```view
deliverEvent($parent.control, selectSubtitleTrack($self.url))
```

## Notification System

### Media Notifications

The video page displays various media-related notifications:

**Track Change Notifications:**
```view
widget(container_x, {
  spacing: 0.5em;
  alpha: iir(changed($self.media.audio.active.url, 5) &&
             !isVoid($self.media.audio.active.url), 8);
  
  widget(icon, {
    source:  "skin://icons/ic_speaker_48px.svg";
  });
  
  widget(label, {
    style: "notifications";
    caption: join(" - ",
                  $self.media.audio.active.title,
                  $self.media.audio.active.language,
                  $self.media.audio.active.source,
                  $self.media.audio.active.longformat ??
                  $self.media.audio.active.format);
  });
});
```

**Subtitle Change Notifications:**
```view
widget(container_x, {
  spacing: 0.5em;
  alpha: iir(changed($self.media.subtitle.active.url, 5) &&
             !isVoid($self.media.subtitle.active.url), 8);

  widget(icon, {
    source: "skin://icons/ic_subtitles_48px.svg";
  });
  
  widget(label, {
    style: "notifications";
    caption: join(" - ",
                  $self.media.subtitle.active.title,
                  $self.media.subtitle.active.language,
                  $self.media.subtitle.active.source,
                  $self.media.subtitle.active.longformat ??
                  $self.media.subtitle.active.format);
  });
});
```

**Error Notifications:**
```view
widget(container_x, {
  spacing: 0.5em;
  hidden: select($self.media.error, false, true);
  
  widget(icon, {
    source: "skin://icons/ic_error_48px.svg";
  });
  
  widget(label, {
    caption: $self.media.error;
    style: "notifications";
  });
});
```

**Performance Warnings:**
```view
widget(container_x, {
  spacing: 0.5em;
  hidden: select($self.media.video.too_slow, false, true);
  
  widget(icon, {
    source: "skin://icons/ic_error_48px.svg";
  });
  
  widget(label, {
    caption: _("CPU is too slow to decode this video");
    style: "notifications";
  });
});
```

## Best Practices

### Orientation Adaptation

1. **Use `$ui.orientation`** to select appropriate layout
2. **Test both orientations** during development
3. **Adjust button sizes** for touch vs. remote control
4. **Consider text readability** in portrait mode

### Media Type Adaptation

1. **Check media capabilities** before showing controls
2. **Hide unavailable features** (e.g., seek bar for radio)
3. **Adapt metadata display** to content type
4. **Use appropriate icons** for different media types

### Performance Optimization

1. **Use `autohide: true`** on loaders
2. **Implement conditional rendering** with `hidden` attribute
3. **Optimize animations** with `iir()` for smooth transitions
4. **Minimize layout recalculations** with proper constraints

### User Experience

1. **Provide visual feedback** for all interactions
2. **Show loading states** during buffering
3. **Display helpful notifications** for track changes
4. **Auto-hide controls** after inactivity
5. **Maintain focus** on appropriate controls

## Example: Custom Playdeck Layout

```view
// custom_playdeck.view
#import "skin://playdecks/playdeck_include.view"

style(playdeckButtonContainer, {
  width: 2.5em;
  height: 2.5em;
});

widget(container_z, {
  // Custom background
  widget(quad, {
    color: [0.1, 0.1, 0.2];
    alpha: 0.9;
  });

  widget(container_y, {
    padding: 1em;
    spacing: 0.5em;

    // Media info
    widget(label, {
      caption: $core.media.current.metadata.title;
      size: 1.5em;
      align: center;
    });

    // Control buttons
    widget(container_x, {
      align: center;
      spacing: 1em;
      PLAYDECK_BUTTON_ROW();
    });

    // Custom seek bar
    widget(container_x, {
      hidden: !$core.media.current.canSeek;
      spacing: 0.5em;

      widget(label, {
        width: 3em;
        caption: value2duration($core.media.current.currenttime);
      });

      widget(slider_x, {
        bind($core.media.current.currenttime);
        max: $core.media.current.metadata.duration;
        clickable: true;
        
        widget(container_y, {
          align: center;
          widget(quad, {
            height: 4;
            alpha: 0.8;
          });
        });
      });

      widget(label, {
        width: 3em;
        caption: value2duration($core.media.current.metadata.duration);
      });
    });
  });
});
```

## See Also

- [OSD System](osd-system.md) - On-screen display and settings interface
- [Skin Architecture](../ui/theming/skin-architecture.md) - Overall skin component system
- [Macro Reference](../ui/theming/macro-reference.md) - Available UI macros
- [Widget System](../ui/widgets/) - Widget documentation
- [Global Configuration](../ui/theming/global-configuration.md) - System integration variables
