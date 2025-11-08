# Streaming Support

Movian supports various streaming protocols and adaptive streaming technologies.

## Supported Protocols

### HTTP/HTTPS

Standard HTTP streaming:

```javascript
{
  url: "https://example.com/video.mp4",
  mimetype: "video/mp4"
}
```

### HLS (HTTP Live Streaming)

Apple's adaptive streaming protocol:

```javascript
{
  url: "https://example.com/playlist.m3u8",
  mimetype: "application/vnd.apple.mpegurl"
}
```

### DASH (Dynamic Adaptive Streaming)

MPEG-DASH support:

```javascript
{
  url: "https://example.com/manifest.mpd",
  mimetype: "application/dash+xml"
}
```

### RTSP

Real-Time Streaming Protocol:

```javascript
{
  url: "rtsp://example.com/stream",
  mimetype: "application/x-rtsp"
}
```

## Adaptive Streaming

### Quality Selection

Movian automatically selects appropriate quality based on:

- Available bandwidth
- Screen resolution
- CPU capabilities
- Buffer status

### Manual Quality Control

```javascript
{
  url: "https://example.com/playlist.m3u8",
  preferredBitrate: 5000000  // 5 Mbps
}
```

## Buffering

### Buffer Configuration

```javascript
{
  url: "https://example.com/video.mp4",
  bufferSize: 10485760,  // 10 MB
  prebuffer: 5242880     // 5 MB
}
```

### Buffer States

- **Buffering**: Loading initial data
- **Playing**: Sufficient buffer
- **Rebuffering**: Buffer depleted

## Network Optimization

### Connection Settings

- Connection timeout
- Read timeout
- Retry attempts
- User agent

### Bandwidth Management

- Adaptive bitrate selection
- Buffer-based throttling
- Network condition monitoring

## See Also

- [Media Pipeline](pipeline-architecture.md)
- [Codecs](codecs.md)
- [HTTP API](../plugins/api/http-api.md)
