# Media Pipeline Architecture

This document describes Movian's media playback pipeline architecture.

## Overview

Movian's media pipeline handles the complete flow of media data from source to output, including:

- Media source handling (files, streams, network)
- Demuxing and container parsing
- Codec selection and decoding
- Audio/video synchronization
- Output rendering

## Pipeline Components

### Media Source Layer

Handles various input sources:

- **Local Files**: Direct file system access
- **Network Streams**: HTTP, HTTPS, RTSP protocols
- **Plugin Sources**: Custom sources from plugins

### Demuxer Layer

Parses container formats:

- MP4/MOV
- MKV/WebM
- AVI
- MPEG-TS
- And more...

### Decoder Layer

Decodes audio and video streams:

- **Video Codecs**: H.264, H.265, VP9, AV1, etc.
- **Audio Codecs**: AAC, MP3, Opus, FLAC, etc.
- **Hardware Acceleration**: Platform-specific (VAAPI, VDPAU, VideoToolbox, etc.)

### Synchronization

Maintains audio/video sync:

- PTS (Presentation Time Stamp) management
- Clock synchronization
- Buffer management

### Output Layer

Renders to display and audio devices:

- **Video Output**: OpenGL rendering
- **Audio Output**: Platform audio APIs

## Data Flow

```
Source → Demuxer → Decoder → Sync → Output
         ↓         ↓         ↓      ↓
      Container  Codec    Buffer  Render
      Format     Data     Queue   Display
```

## Implementation Details

### Source Code References

Key files in the media pipeline:

```
src/media/
├── media.c              # Core media subsystem
├── media_track.c        # Track management
├── media_codec.c        # Codec handling
├── media_queue.c        # Buffer queues
└── media_settings.c     # Media settings

src/backend/
├── backend.c            # Backend interface
└── [platform backends]  # Platform-specific implementations
```

### Media Context

The media context (`media_pipe_t`) manages the entire pipeline:

```c
typedef struct media_pipe {
  // Source information
  char *mp_url;
  
  // Tracks
  media_track_mgr_t *mp_audio;
  media_track_mgr_t *mp_video;
  media_track_mgr_t *mp_subtitle;
  
  // Queues
  media_queue_t *mp_audio_queue;
  media_queue_t *mp_video_queue;
  
  // Timing
  int64_t mp_audio_clock;
  int64_t mp_video_clock;
  
  // State
  int mp_playstatus;
  float mp_playback_rate;
} media_pipe_t;
```

## Playback States

### State Machine

```
STOP → PLAY → PAUSE
  ↑      ↓      ↓
  └──────┴──────┘
```

States:

- **STOP**: No media loaded
- **PLAY**: Active playback
- **PAUSE**: Playback paused
- **BUFFER**: Buffering data

## Buffer Management

### Queue System

Media data flows through queues:

- **Audio Queue**: Decoded audio frames
- **Video Queue**: Decoded video frames
- **Packet Queue**: Demuxed packets

### Buffer Levels

```
High Water Mark ────────────
                 ↑ Buffer
Low Water Mark  ────────────
                 ↓ Underrun
Empty ──────────────────────
```

## Synchronization

### Clock Management

Three clocks maintain sync:

1. **Audio Clock**: Master clock (usually)
2. **Video Clock**: Synced to audio
3. **External Clock**: System time reference

### PTS Handling

```
Packet PTS → Decode → Frame PTS → Display Time
```

## Hardware Acceleration

### Supported APIs

- **Linux**: VAAPI, VDPAU
- **Windows**: DXVA2, D3D11VA
- **macOS**: VideoToolbox
- **Android**: MediaCodec

### Acceleration Flow

```
Encoded Data → HW Decoder → GPU Memory → Display
```

## Error Handling

### Recovery Strategies

- **Packet Loss**: Skip to next keyframe
- **Decode Errors**: Continue with next frame
- **Buffer Underrun**: Pause and rebuffer
- **Sync Loss**: Resynchronize clocks

## Performance Optimization

### Threading

- Separate threads for demuxing, decoding, rendering
- Lock-free queues where possible
- Thread pool for parallel decoding

### Caching

- Metadata caching
- Thumbnail caching
- Codec information caching

## Plugin Integration

### Custom Sources

Plugins can provide custom media sources:

```javascript
var mediaSource = {
  url: "plugin://custom/video",
  mimetype: "video/mp4"
};
```

### Metadata

Plugins can provide metadata:

```javascript
{
  title: "Video Title",
  duration: 3600,
  codec: "h264",
  resolution: "1920x1080"
}
```

## Debugging

### Enable Debug Logging

```bash
movian --debug media
```

### Useful Logs

- Codec selection
- Buffer levels
- Sync adjustments
- Error conditions

## See Also

- [Codecs](codecs.md)
- [Streaming](streaming.md)
- [Audio/Video UI](audio-video-ui.md)
- [OSD System](osd-system.md)
