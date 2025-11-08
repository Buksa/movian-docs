# Codec Support

This document describes the audio and video codecs supported by Movian.

## Video Codecs

### H.264 (AVC)

- **Support**: Full
- **Hardware Acceleration**: Yes (most platforms)
- **Container**: MP4, MKV, TS, AVI
- **Profiles**: Baseline, Main, High

### H.265 (HEVC)

- **Support**: Full
- **Hardware Acceleration**: Yes (modern hardware)
- **Container**: MP4, MKV, TS
- **Profiles**: Main, Main 10

### VP9

- **Support**: Full
- **Hardware Acceleration**: Limited
- **Container**: WebM, MKV
- **Profiles**: Profile 0, Profile 2

### AV1

- **Support**: Experimental
- **Hardware Acceleration**: Limited (newest hardware)
- **Container**: MP4, WebM, MKV

### MPEG-2

- **Support**: Full
- **Hardware Acceleration**: Yes
- **Container**: MPEG-PS, MPEG-TS, VOB

### MPEG-4 Part 2

- **Support**: Full
- **Hardware Acceleration**: Limited
- **Container**: AVI, MP4, MKV

### Other Codecs

- **VC-1**: Full support
- **Theora**: Full support
- **VP8**: Full support

## Audio Codecs

### AAC

- **Support**: Full
- **Profiles**: LC, HE-AAC, HE-AACv2
- **Container**: MP4, MKV, TS

### MP3

- **Support**: Full
- **Bitrates**: All standard bitrates
- **Container**: MP3, MP4, MKV, AVI

### Opus

- **Support**: Full
- **Container**: WebM, MKV, Ogg

### FLAC

- **Support**: Full
- **Container**: FLAC, MKV, Ogg

### Vorbis

- **Support**: Full
- **Container**: Ogg, WebM, MKV

### AC-3 (Dolby Digital)

- **Support**: Full
- **Passthrough**: Yes
- **Container**: MP4, MKV, TS

### E-AC-3 (Dolby Digital Plus)

- **Support**: Full
- **Passthrough**: Yes
- **Container**: MP4, MKV, TS

### DTS

- **Support**: Full
- **Passthrough**: Yes
- **Container**: MKV, TS

### Other Codecs

- **PCM**: Full support
- **ALAC**: Full support
- **WMA**: Full support
- **TrueHD**: Passthrough only
- **DTS-HD**: Passthrough only

## Hardware Acceleration

### Platform Support

| Platform | API | Status |
|----------|-----|--------|
| Linux | VAAPI | Full |
| Linux | VDPAU | Full |
| Windows | DXVA2 | Full |
| Windows | D3D11VA | Full |
| macOS | VideoToolbox | Full |
| Android | MediaCodec | Full |
| iOS | VideoToolbox | Limited |

### Codec Acceleration

| Codec | Linux | Windows | macOS | Android |
|-------|-------|---------|-------|---------|
| H.264 | ✓ | ✓ | ✓ | ✓ |
| H.265 | ✓ | ✓ | ✓ | ✓ |
| VP9 | ✓ | ✓ | ✓ | ✓ |
| AV1 | Limited | Limited | ✗ | Limited |
| MPEG-2 | ✓ | ✓ | ✓ | ✓ |

## Container Formats

### MP4

- **Video**: H.264, H.265, MPEG-4
- **Audio**: AAC, MP3, AC-3
- **Subtitles**: SRT, VTT

### MKV (Matroska)

- **Video**: All supported codecs
- **Audio**: All supported codecs
- **Subtitles**: SRT, ASS, VTT, PGS

### WebM

- **Video**: VP8, VP9, AV1
- **Audio**: Vorbis, Opus
- **Subtitles**: VTT

### AVI

- **Video**: MPEG-4, H.264, MJPEG
- **Audio**: MP3, PCM, AC-3

### MPEG-TS

- **Video**: H.264, H.265, MPEG-2
- **Audio**: AAC, MP3, AC-3
- **Subtitles**: DVB subtitles

## Codec Selection

### Automatic Selection

Movian automatically selects the best codec based on:

1. Hardware acceleration availability
2. Codec support
3. Performance characteristics
4. Quality requirements

### Manual Override

Force specific codec in plugin:

```javascript
{
  sources: [{
    url: "http://example.com/video.mp4",
    mimetype: "video/mp4",
    codec: "h264"
  }]
}
```

## Performance Considerations

### CPU Usage

| Codec | Decode Complexity | Recommended |
|-------|-------------------|-------------|
| H.264 | Medium | HW acceleration |
| H.265 | High | HW acceleration required |
| VP9 | High | HW acceleration recommended |
| AV1 | Very High | HW acceleration required |
| MPEG-2 | Low | SW decode acceptable |

### Quality vs Performance

- **High Quality**: H.265, AV1
- **Balanced**: H.264, VP9
- **Low Overhead**: MPEG-2, MPEG-4

## Troubleshooting

### Codec Not Supported

Check Movian build configuration:

```bash
movian --version
```

### Hardware Acceleration Not Working

Enable debug logging:

```bash
movian --debug video
```

### Audio/Video Sync Issues

Try different audio codec or disable hardware acceleration.

## See Also

- [Media Pipeline](pipeline-architecture.md)
- [Streaming](streaming.md)
- [Performance Optimization](../guides/performance.md)
