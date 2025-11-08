# Subtitle Support

Movian supports various subtitle formats and provides subtitle rendering capabilities.

## Supported Formats

### Text-Based Formats

- **SRT (SubRip)**: Most common format
- **VTT (WebVTT)**: Web-based subtitles
- **ASS/SSA**: Advanced SubStation Alpha (styled subtitles)
- **SUB**: MicroDVD format

### Image-Based Formats

- **PGS**: Blu-ray subtitles
- **VobSub**: DVD subtitles
- **DVB**: Digital TV subtitles

## Loading Subtitles

### External Subtitle Files

```javascript
{
  sources: [{
    url: "http://example.com/video.mp4"
  }],
  subtitles: [{
    url: "http://example.com/subtitles.srt",
    language: "en",
    title: "English"
  }]
}
```

### Embedded Subtitles

Subtitles embedded in container (MKV, MP4) are automatically detected.

## Subtitle Styling

### ASS/SSA Styling

Full support for ASS styling:

- Fonts and colors
- Positioning
- Effects and animations

### Basic Styling

For SRT and VTT:

- Font size
- Color
- Position
- Background

## Configuration

### User Settings

- Subtitle language preference
- Font size
- Color and background
- Position on screen

## See Also

- [Media Pipeline](pipeline-architecture.md)
- [Video Player UI](audio-video-ui.md)
