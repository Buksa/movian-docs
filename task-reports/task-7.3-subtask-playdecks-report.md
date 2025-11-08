# Task 7.3 Sub-task: Playdeck Directory Analysis - Completion Report

## Task Description

Analyze the `playdecks/` directory structure to document:
- `playdecks/landscape/` vs `playdecks/portrait/` adaptations
- `playdeck_include.view` shared components
- Media-specific view files for different content types

## Completion Summary

- **Status**: Completed
- **Date**: 2024-11-07
- **Duration**: ~45 minutes

## Deliverables

### Created Documentation

**Primary Document**: `movian-docs/docs/media/playdeck-system.md`
- Comprehensive 600+ line documentation covering all aspects of the playdeck system
- Complete analysis of directory structure and file organization
- Detailed macro system documentation from `playdeck_include.view`
- Full comparison of landscape vs. portrait implementations
- Media-type-specific adaptations (tracks vs. radio)

### Documentation Sections

1. **Overview** - System purpose and characteristics
2. **Directory Structure** - File organization and layout
3. **Loading System** - Dynamic selection logic in universe.view
4. **Shared Components** - Complete macro reference from playdeck_include.view
5. **Landscape Playdecks** - Tracks and radio implementations
6. **Portrait Playdecks** - Mobile-optimized layouts
7. **Media System Integration** - Core properties and event delivery
8. **Design Patterns** - Orientation and media-type adaptations
9. **Best Practices** - Custom playdeck creation guidelines
10. **Troubleshooting** - Common issues and solutions

## Key Findings

### Directory Structure

```
movian/glwskins/flat/playdecks/
├── playdeck_include.view          # Shared macros (3 button types + standard row)
├── landscape/
│   ├── tracks.view               # Horizontal layout with seek controls
│   └── radio.view                # Horizontal layout without seeking
└── portrait/
    ├── tracks.view               # Vertical layout with background image
    └── radio.view                # Vertical layout simplified
```

### Shared Component System (playdeck_include.view)

**Discovered 5 Key Macros**:

1. **PLAYDECK_BUTTON** - Standard button with smooth alpha transitions
2. **PLAYDECK_BUTTON2** - Simplified button for secondary controls
3. **PLAYDECK_BUTTON_TOGGLE** - Toggle button with visual state indication
4. **PLAYDECK_BUTTON_ROW** - Standard 6-button control set
5. **PLAYDECK_BUTTONS** - Expandable deck container

**Button Row Composition**:
- Play Queue button
- Previous Track button
- Play/Pause button (dynamic icon)
- Next Track button
- Repeat toggle
- Shuffle toggle

### Dynamic Loading System

**Selection Logic** (from universe.view):
```view
source: translate($core.media.current.type, "",
                  "tracks", "playdecks/" + $ui.orientation + "/tracks.view",
                  "radio",  "playdecks/" + $ui.orientation + "/radio.view");
```

**Two-Factor Selection**:
1. **Media Type**: `$core.media.current.type` ("tracks" or "radio")
2. **Orientation**: `$ui.orientation` ("landscape" or "portrait")

**Orientation Detection**:
```view
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");
```

### Landscape vs. Portrait Adaptations

**Landscape Characteristics**:
- Horizontal layout (container_x)
- Compact 2em height
- Left-to-right component flow
- Album art as small accent (5em width)
- Smaller button sizes (2em width only)
- Semi-transparent background (alpha: 0.8 for tracks, 0.2 for radio)

**Portrait Characteristics**:
- Vertical layout (container_y)
- Larger 4em height
- Centered component stacking
- Album art as full-width background (50% opacity)
- Larger touch targets (2em × 2em buttons)
- Larger icons (1.2em vs. default)
- Text shadows for readability over images

### Tracks vs. Radio Adaptations

**Tracks Features** (Music/Podcasts):
- Seek controls (time display + interactive slider)
- Artist + Title metadata display
- Duration display
- Tentative seeking with preview
- Skip navigation controls
- Conditional visibility based on `$core.media.current.canSeek`

**Radio Features** (Live Streams):
- No seek controls (live content)
- Title + `$core.media.current.radioinfo` display
- Simpler layout (fewer components)
- Lower background alpha in landscape (0.2 vs. 0.8)
- Same button controls but no time-based features

### Media System Integration

**Key Properties Discovered**:
```view
$core.media.current.type           // Media type detection
$core.media.current.playstatus     // Play/pause state
$core.media.current.currenttime    // Playback position
$core.media.current.canSeek        // Capability flags
$core.media.current.canPause
$core.media.current.canSkipBackward
$core.media.current.canSkipForward
$core.media.current.canRepeat
$core.media.current.canShuffle
$core.media.current.metadata.*     // Title, artist, album_art, duration
$core.media.current.radioinfo      // Radio-specific info
$core.media.current.repeat         // Playback mode states
$core.media.current.shuffle
$core.media.current.eventSink      // Event delivery target
$core.playqueue.active             // Queue availability
```

**Event Delivery Pattern**:
```view
deliverEvent($core.media.current.eventSink, "PlayPause")
deliverEvent($core.media.current.eventSink, "PreviousTrack")
deliverEvent($core.media.current.eventSink, "NextTrack")
```

## Technical Insights

### Macro Design Patterns

1. **Parameterized Macros**: All button macros accept ICON, EVENT/VALUE, and ENABLED parameters
2. **Visual Feedback**: `GridItemHighlight2()` provides consistent hover/focus states
3. **Smooth Transitions**: `iir()` function for interpolated alpha changes (4-8 frames)
4. **Disabled State Handling**: Minimum alpha of 0.3 keeps disabled buttons visible
5. **Toggle Visualization**: Color changes (1 vs. 0.3) indicate toggle state

### Layout Techniques

1. **Conditional Visibility**: `hidden: !$core.media.current.canSeek` for seek controls
2. **Flexible Spacing**: `space(1)` for dynamic layout adaptation
3. **Negative Padding**: Album art uses negative padding for visual overlap
4. **Z-Order Layering**: `zoffset: 100` ensures album art appears above background
5. **Aspect Constraint**: `aspectConstraint: true` maintains image proportions

### Performance Optimizations

1. **Hidden vs. Alpha**: Uses `hidden` property to avoid rendering unused widgets
2. **Fixed Heights**: Consistent 2em/4em heights prevent layout reflows
3. **Interpolated Animations**: `iir()` provides smooth transitions without layout changes
4. **Conditional Loading**: `autohide: true` removes widgets when source is empty

## Challenges and Solutions

### Challenge 1: Finding Playdeck Loading Logic

**Issue**: Initial searches for "playdeck" in view files returned no results.

**Solution**: Examined universe.view based on design document references, found dynamic loading system using `translate()` function with orientation and media type variables.

### Challenge 2: Understanding Macro System

**Issue**: Multiple macro variants (PLAYDECK_BUTTON, PLAYDECK_BUTTON2, PLAYDECK_BUTTON_TOGGLE) with subtle differences.

**Solution**: Analyzed each macro definition in detail, documented parameter differences and use cases. Discovered PLAYDECK_BUTTON2 is for secondary controls with faster transitions.

### Challenge 3: Orientation Detection

**Issue**: Needed to understand how landscape/portrait selection works.

**Solution**: Found orientation variable in universe.view: `$ui.orientation = select($ui.aspect > 1, "landscape", "portrait")`. Simple aspect ratio check determines layout variant.

## Documentation Quality

### Completeness

- ✅ All 4 playdeck view files analyzed
- ✅ Complete macro system documented
- ✅ Loading system explained with code examples
- ✅ Orientation adaptations compared in detail
- ✅ Media-type differences documented
- ✅ Media system integration properties listed
- ✅ Design patterns and best practices included
- ✅ Troubleshooting section added

### Code Examples

- 15+ complete code examples from actual source files
- All macros documented with full definitions
- Layout structures shown with component breakdowns
- Media property references with usage examples

### Cross-References

- Links to OSD system documentation
- References to macro system documentation
- Widget reference links
- Global configuration references

## Next Steps

### Immediate

1. ✅ Mark sub-task as complete in tasks.md
2. ✅ Create this completion report
3. Update main task 7.3 progress tracking

### Follow-up

1. Consider creating visual diagrams for layout comparisons
2. Add screenshots of landscape vs. portrait playdecks
3. Create example custom playdeck implementation
4. Document additional media types if discovered

## Files Modified

### Created
- `movian-docs/docs/media/playdeck-system.md` (new, 600+ lines)
- `movian-docs/task-reports/task-7.3-subtask-playdecks-report.md` (this file)

### Source Files Analyzed
- `movian/glwskins/flat/playdecks/playdeck_include.view`
- `movian/glwskins/flat/playdecks/landscape/tracks.view`
- `movian/glwskins/flat/playdecks/landscape/radio.view`
- `movian/glwskins/flat/playdecks/portrait/tracks.view`
- `movian/glwskins/flat/playdecks/portrait/radio.view`
- `movian/glwskins/flat/universe.view` (loading system)

## Verification

### Documentation Accuracy

- ✅ All code examples copied directly from source files
- ✅ Property names verified against actual usage
- ✅ Macro definitions match source exactly
- ✅ Loading logic confirmed in universe.view
- ✅ Media system properties verified in multiple files

### Completeness Check

- ✅ Directory structure fully documented
- ✅ All 4 view files analyzed
- ✅ All 5 macros documented
- ✅ Landscape vs. portrait comparison complete
- ✅ Tracks vs. radio comparison complete
- ✅ Media system integration documented
- ✅ Best practices included
- ✅ Troubleshooting section added

## Conclusion

Successfully completed comprehensive analysis of the playdeck system. The documentation provides a complete reference for understanding how Movian implements persistent media controls that adapt to both device orientation and media type. The macro system analysis reveals a well-designed component library that promotes consistency while allowing flexibility.

The playdeck system demonstrates sophisticated UI adaptation patterns:
- Dynamic loading based on runtime conditions
- Shared component library for consistency
- Orientation-specific optimizations
- Media-type-specific features
- Smooth visual transitions
- Performance-conscious rendering

This documentation will enable developers to:
- Understand the playdeck architecture
- Create custom playdeck implementations
- Modify existing playdecks for specific needs
- Troubleshoot playdeck-related issues
- Follow established design patterns
