# Video Scrobbler API

Complete reference for the Video Scrobbler API, which enables plugins to track video playback events and build features like watch history, progress tracking, and external service integration (e.g., Trakt.tv).

## Table of Contents

- [Overview](#overview)
- [Module Import](#module-import)
- [VideoScrobbler Class](#videoscrobbler-class)
- [Event Handlers](#event-handlers)
- [Data Object Structure](#data-object-structure)
- [Property Object](#property-object)
- [Origin Object](#origin-object)
- [Practical Use Cases](#practical-use-cases)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [API Quick Reference](#api-quick-reference)
- [See Also](#see-also)

---

## Overview

The Video Scrobbler API provides a mechanism for plugins to receive notifications about video playback events in Movian. This enables developers to:

- Track watch history and viewing statistics
- Implement automatic "watched" status marking
- Synchronize playback progress with external services (Trakt.tv, etc.)
- Build recommendation systems based on viewing habits
- Create parental control features
- Generate viewing analytics

### How It Works

When a user plays a video in Movian, the system creates a video scrobble event. The VideoScrobbler class registers a hook that receives these events and dispatches them to your plugin's event handlers.

**Event Flow:**
1. User starts playing a video
2. Movian emits "start" event with video metadata
3. VideoScrobbler calls `onstart` handler
4. Movian subscribes to playstatus changes (pause/resume)
5. User pauses video → `onpause` called
6. User resumes video → `onresume` called  
7. User stops/closes video → `onstop` called

### Use Cases

**🎬 Watch History:**
- Track what users watched and when
- Store last watched position for resume playback
- Build "Continue Watching" features

**📊 Statistics:**
- Calculate total watch time
- Track viewing habits (genres, time of day)
- Generate viewing reports

**🔄 External Sync:**
- Scrobble to Trakt.tv
- Sync with Plex servers
- Update IMDB watchlists

**✅ Progress Tracking:**
- Mark episodes as watched at 90% completion
- Track series progress (X of Y episodes watched)
- Show completion badges

---

## Module Import

```javascript
var videoscrobbler = require('movian/videoscrobbler');
```

**Source:** `res/ecmascript/modules/movian/videoscrobbler.js`

---

## VideoScrobbler Class

### Constructor

#### new videoscrobbler.VideoScrobbler()

Creates a new VideoScrobbler instance that will receive video playback events.

**Parameters:** None

**Returns:** VideoScrobbler instance

**Example:**
```javascript
var videoscrobbler = require('movian/videoscrobbler');

// Create scrobbler instance
var scrobbler = new videoscrobbler.VideoScrobbler();

// Set up event handlers
scrobbler.onstart = function(data, prop, origin) {
    console.log("Started watching: " + data.title);
};
```

### Properties

#### scrobbler.paused

**Type:** `boolean` (read-only)

**Description:** Indicates whether the current video is paused.

**Access:**
```javascript
if (scrobbler.paused) {
    console.log("Video is paused");
} else {
    console.log("Video is playing");
}
```

**Note:** This property is automatically updated by the scrobbler when pause/resume events occur. It should not be set manually.

### Methods

#### scrobbler.destroy()

Destroys the scrobbler instance and unregisters the event hook.

**Parameters:** None

**Returns:** None

**Example:**
```javascript
// When plugin is being unloaded
scrobbler.destroy();
```

**Important:** While destruction is optional (the system will clean up when the plugin unloads), it's good practice to call destroy() in cleanup handlers.

---

## Event Handlers

The VideoScrobbler uses callback functions (event handlers) to notify your plugin of playback events. All handlers are optional - define only the ones you need.

### scrobbler.onstart

Called when a video starts playing.

**Function Signature:**
```javascript
scrobbler.onstart = function(data, prop, origin) {
    // Handle video start
};
```

**Parameters:**
- `data` (Object): Video metadata (see [Data Object Structure](#data-object-structure))
- `prop` (Property): Video property object with playstatus, current time, etc.
- `origin` (Property): Origin property object (navigation context)

**Example:**
```javascript
scrobbler.onstart = function(data, prop, origin) {
    console.log("Started: " + data.title);
    console.log("Duration: " + data.duration + " seconds");
    
    // Save to watch history
    history.lastStarted = {
        title: data.title,
        url: data.url,
        timestamp: Date.now()
    };
};
```

**When Called:**
- User starts playing a video
- Video auto-plays after loading
- User resumes from pause (only if onresume not defined)

### scrobbler.onstop

Called when a video stops playing (user closes video, stops playback, or video ends).

**Function Signature:**
```javascript
scrobbler.onstop = function(data, prop, origin) {
    // Handle video stop
};
```

**Parameters:**
- `data` (Object): Video metadata with position information (see [Data Object Structure](#data-object-structure))
- `prop` (Property): Video property object
- `origin` (Property): Origin property object

**Key Data Fields:**
- `data.stopposition` - Position when stopped (seconds)
- `data.startposition` - Position when started (seconds)
- `data.duration` - Total duration (seconds)

**Example:**
```javascript
scrobbler.onstop = function(data, prop, origin) {
    var duration = data.duration || 0;
    var stopPos = data.stopposition || 0;
    var startPos = data.startposition || 0;
    
    // Calculate percentage watched
    var percentWatched = 0;
    if (duration > 0) {
        var watched = stopPos - startPos;
        percentWatched = (watched / duration) * 100;
    }
    
    console.log("Stopped: " + data.title);
    console.log("Watched: " + percentWatched.toFixed(1) + "%");
    
    // Mark as watched if > 90%
    if (percentWatched > 90) {
        markAsWatched(data);
    }
    
    // Save resume position if not finished
    if (percentWatched < 90 && percentWatched > 5) {
        saveResumePosition(data.url, stopPos);
    }
};
```

**When Called:**
- User closes the video player
- User stops playback
- Video playback ends
- User navigates away from video

### scrobbler.onpause

Called when the video is paused.

**Function Signature:**
```javascript
scrobbler.onpause = function(data, prop, origin) {
    // Handle video pause
};
```

**Parameters:**
- `data` (Object): Video metadata
- `prop` (Property): Video property object (playstatus is 'pause')
- `origin` (Property): Origin property object

**Example:**
```javascript
scrobbler.onpause = function(data, prop, origin) {
    console.log("Paused: " + data.title);
    
    // Save current position for resume
    var currentPos = prop.currenttime;
    saveResumePosition(data.url, currentPos);
};
```

**When Called:**
- User presses pause button
- Video is paused programmatically
- System pauses video (incoming call, etc.)

### scrobbler.onresume

Called when the video resumes from pause.

**Function Signature:**
```javascript
scrobbler.onresume = function(data, prop, origin) {
    // Handle video resume
};
```

**Parameters:**
- `data` (Object): Video metadata
- `prop` (Property): Video property object (playstatus is 'play' or other)
- `origin` (Property): Origin property object

**Example:**
```javascript
scrobbler.onresume = function(data, prop, origin) {
    console.log("Resumed: " + data.title);
    
    // Resume tracking
    resumeAnalytics(data);
};
```

**When Called:**
- User presses play after pause
- Video resumes from system pause

---

## Data Object Structure

The `data` parameter passed to all event handlers contains video metadata and playback information.

### Core Fields

| Field | Type | Description | Availability |
|-------|------|-------------|--------------|
| `title` | string | Video title | Always |
| `url` | string | Video URL | Always |
| `duration` | number | Total duration in seconds | Always |
| `item` | Object | Full item metadata | Always |

### Position Fields (onstop only)

| Field | Type | Description |
|-------|------|-------------|
| `startposition` | number | Playback start position (seconds) |
| `stopposition` | number | Position when stopped (seconds) |

### Episode Fields (TV Shows)

| Field | Type | Description |
|-------|------|-------------|
| `season` | number | Season number |
| `episode` | number | Episode number |

### Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `year` | number | Release year |
| `imdb_id` | string | IMDB identifier (tt0000000) |
| `tmdb_id` | string | TMDB identifier |

### Complete Data Example

```javascript
{
    // Core
    title: "Breaking Bad S01E01",
    url: "plugin://myplugin:video:123",
    duration: 3480,
    
    // Item metadata
    item: {
        type: "video",
        metadata: {
            title: "Breaking Bad S01E01",
            description: "Pilot episode",
            year: 2008
        }
    },
    
    // Episode info (TV shows only)
    season: 1,
    episode: 1,
    
    // External IDs
    year: 2008,
    imdb_id: "tt0903747",
    tmdb_id: "1396",
    
    // Position info (onstop only)
    startposition: 0,
    stopposition: 3480
}
```

---

## Property Object

The `prop` parameter provides access to the video's property tree, allowing you to read playback state and subscribe to changes.

### Common Properties

| Property | Type | Description |
|----------|------|-------------|
| `prop.playstatus` | string | Current status: 'play', 'pause', 'stop' |
| `prop.currenttime` | number | Current playback position (seconds) |
| `prop.duration` | number | Total duration (seconds) |

### Reading Properties

```javascript
scrobbler.onstart = function(data, prop, origin) {
    // Read current playback position
    var currentTime = prop.currenttime;
    
    // Read play status
    var status = prop.playstatus;
    
    console.log("Status: " + status + " at " + currentTime + "s");
};
```

### Subscribing to Changes

You can subscribe to property changes within event handlers:

```javascript
scrobbler.onstart = function(data, prop, origin) {
    var startTime = Date.now();
    var lastUpdate = startTime;
    
    // Subscribe to time updates (every 10 seconds)
    var interval = setInterval(function() {
        if (scrobbler.paused) return;
        
        var currentTime = prop.currenttime;
        var now = Date.now();
        
        // Update analytics every 10 seconds of playback
        if (now - lastUpdate > 10000) {
            updateAnalytics(data, currentTime);
            lastUpdate = now;
        }
    }, 1000);
    
    // Clean up on stop
    scrobbler.onstop = function() {
        clearInterval(interval);
    };
};
```

---

## Origin Object

The `origin` parameter provides context about how the video was opened.

### Use Cases

The origin can be used to:
- Track which plugin/URL opened the video
- Implement "Return to previous page" functionality
- Log navigation context for analytics

### Example

```javascript
scrobbler.onstart = function(data, prop, origin) {
    // Log where the video was opened from
    console.log("Video opened from: " + origin);
    
    // You can also access origin properties
    if (origin && origin.url) {
        console.log("Origin URL: " + origin.url);
    }
};
```

---

## Practical Use Cases

### Use Case 1: Basic Watch History

Implement a simple watch history that tracks what was watched and when.

```javascript
var videoscrobbler = require('movian/videoscrobbler');
var store = require('movian/store');

// Persistent storage
var history = store.create("myplugin_history");

// Create scrobbler
var scrobbler = new videoscrobbler.VideoScrobbler();

scrobbler.onstart = function(data, prop, origin) {
    // Record that user started watching
    var watchRecord = {
        title: data.title,
        url: data.url,
        started_at: Date.now(),
        duration: data.duration
    };
    
    // Save to current watching
    history.current = watchRecord;
    
    console.log("Started: " + data.title);
};

scrobbler.onstop = function(data, prop, origin) {
    var current = history.current;
    if (!current) return;
    
    // Calculate watch percentage
    var duration = data.duration || current.duration || 0;
    var watched = (data.stopposition || 0) - (data.startposition || 0);
    var percent = duration > 0 ? (watched / duration) * 100 : 0;
    
    // Create completed record
    var completedRecord = {
        title: current.title,
        url: current.url,
        started_at: current.started_at,
        completed_at: Date.now(),
        percent_watched: percent,
        finished: percent > 90
    };
    
    // Add to history list
    var historyList = history.list || [];
    historyList.unshift(completedRecord);
    
    // Keep only last 100 items
    if (historyList.length > 100) {
        historyList = historyList.slice(0, 100);
    }
    
    history.list = historyList;
    history.current = null;
    
    console.log("Completed: " + current.title + " (" + percent.toFixed(1) + "%)");
};

// Export function to get history
exports.getWatchHistory = function() {
    return history.list || [];
};
```

### Use Case 2: Trakt.tv Integration

Scrobble playback to Trakt.tv service.

```javascript
var videoscrobbler = require('movian/videoscrobbler');
var http = require('movian/http');
var store = require('movian/store');

var config = store.create("trakt_config");

var scrobbler = new videoscrobbler.VideoScrobbler();

function scrobbleToTrakt(action, data) {
    if (!config.access_token) {
        console.log("Trakt not authorized");
        return;
    }
    
    var body = {
        movie: data.imdb_id ? {
            title: data.title,
            year: data.year,
            ids: {
                imdb: data.imdb_id
            }
        } : undefined,
        episode: data.season ? {
            season: data.season,
            number: data.episode,
            title: data.title
        } : undefined,
        progress: calculateProgress(data),
        sharing: {
            twitter: false,
            tumblr: false
        }
    };
    
    try {
        http.request('https://api.trakt.tv/scrobble/' + action, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + config.access_token,
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': config.client_id
            },
            body: JSON.stringify(body)
        }, function(err, response) {
            if (err) {
                console.error("Trakt scrobble failed: " + err);
                return;
            }
            console.log("Trakt: " + action + " - " + data.title);
        });
    } catch (e) {
        console.error("Trakt error: " + e.message);
    }
}

function calculateProgress(data) {
    if (!data.duration || data.duration === 0) return 0;
    var pos = data.stopposition || data.startposition || 0;
    return Math.round((pos / data.duration) * 100);
}

scrobbler.onstart = function(data, prop, origin) {
    scrobbleToTrakt('start', data);
};

scrobbler.onpause = function(data, prop, origin) {
    scrobbleToTrakt('pause', data);
};

scrobbler.onresume = function(data, prop, origin) {
    scrobbleToTrakt('start', data);
};

scrobbler.onstop = function(data, prop, origin) {
    var percent = calculateProgress(data);
    
    if (percent > 80) {
        // Scrobble as watched
        scrobbleToTrakt('stop', data);
    } else {
        // Cancel scrobble
        scrobbleToTrakt('stop', data);
    }
};
```

### Use Case 3: Resume Position Tracking

Save and restore playback position for resume functionality.

```javascript
var videoscrobbler = require('movian/videoscrobbler');
var store = require('movian/store');

var resumeStore = store.create("resume_positions");

var scrobbler = new videoscrobbler.VideoScrobbler();

// Save position on pause and stop
scrobbler.onpause = function(data, prop, origin) {
    var position = prop.currenttime;
    savePosition(data.url, position, data.duration);
};

scrobbler.onstop = function(data, prop, origin) {
    var duration = data.duration || 0;
    var stopPos = data.stopposition || 0;
    var percent = duration > 0 ? (stopPos / duration) * 100 : 0;
    
    if (percent > 5 && percent < 90) {
        // Save position for resume
        savePosition(data.url, stopPos, duration);
    } else {
        // Clear position (finished or barely started)
        clearPosition(data.url);
    }
};

function savePosition(url, position, duration) {
    var positions = resumeStore.positions || {};
    positions[url] = {
        position: position,
        duration: duration,
        saved_at: Date.now()
    };
    resumeStore.positions = positions;
}

function clearPosition(url) {
    var positions = resumeStore.positions || {};
    delete positions[url];
    resumeStore.positions = positions;
}

// Export function to get resume position
exports.getResumePosition = function(url) {
    var positions = resumeStore.positions || {};
    var record = positions[url];
    
    if (!record) return null;
    
    // Check if position is still valid (within 10% of duration)
    // This handles cases where video file changed
    return {
        position: record.position,
        percent: record.duration > 0 ? (record.position / record.duration) * 100 : 0
    };
};

// Usage in your plugin:
// var resume = getResumePosition(videoUrl);
// if (resume && resume.percent > 5 && resume.percent < 90) {
//     page.appendAction("Resume from " + formatTime(resume.position), ...);
// }
```

### Use Case 4: Series Progress Tracker

Track progress through TV series and show completion status.

```javascript
var videoscrobbler = require('movian/videoscrobbler');
var store = require('movian/store');

var seriesStore = store.create("series_progress");

var scrobbler = new videoscrobbler.VideoScrobbler();

scrobbler.onstop = function(data, prop, origin) {
    // Only track TV episodes
    if (!data.season || !data.episode) return;
    
    var duration = data.duration || 0;
    var watched = (data.stopposition || 0) - (data.startposition || 0);
    var percent = duration > 0 ? (watched / duration) * 100 : 0;
    
    // Only count if > 90% watched
    if (percent < 90) return;
    
    var seriesId = data.imdb_id || data.title.split(' S')[0];
    var episodeId = 'S' + data.season + 'E' + data.episode;
    
    // Get or create series record
    var series = seriesStore[seriesId] || {
        title: data.title.split(' S')[0],
        watched_episodes: [],
        last_watched: null,
        total_episodes: 0 // Update when known
    };
    
    // Add to watched if not already there
    if (series.watched_episodes.indexOf(episodeId) === -1) {
        series.watched_episodes.push(episodeId);
        series.last_watched = {
            season: data.season,
            episode: data.episode,
            watched_at: Date.now()
        };
        
        seriesStore[seriesId] = series;
        
        console.log("Watched " + series.title + " " + episodeId);
        
        // Check if series completed
        if (series.total_episodes > 0 && 
            series.watched_episodes.length >= series.total_episodes) {
            console.log("🎉 Series completed: " + series.title);
        }
    }
};

// Export progress function
exports.getSeriesProgress = function(seriesId, totalEpisodes) {
    var series = seriesStore[seriesId];
    if (!series) return { watched: 0, total: totalEpisodes, percent: 0 };
    
    var total = totalEpisodes || series.total_episodes || 0;
    var watched = series.watched_episodes.length;
    
    return {
        watched: watched,
        total: total,
        percent: total > 0 ? Math.round((watched / total) * 100) : 0,
        last_watched: series.last_watched,
        next_episode: calculateNextEpisode(series)
    };
};

function calculateNextEpisode(series) {
    if (!series.last_watched) return { season: 1, episode: 1 };
    
    // Simple logic: same season, next episode
    return {
        season: series.last_watched.season,
        episode: series.last_watched.episode + 1
    };
}
```

---

## Best Practices

### 1. Always Check Data Availability

```javascript
scrobbler.onstop = function(data, prop, origin) {
    // Defensive programming - check fields exist
    var duration = data.duration || 0;
    var stopPos = data.stopposition || 0;
    var title = data.title || "Unknown";
    
    // Now safe to use
    var percent = duration > 0 ? (stopPos / duration) * 100 : 0;
};
```

### 2. Handle Multiple Rapid Events

Users might rapidly pause/resume. Debounce if needed:

```javascript
var lastPauseTime = 0;

scrobbler.onpause = function(data, prop, origin) {
    lastPauseTime = Date.now();
};

scrobbler.onresume = function(data, prop, origin) {
    var pauseDuration = Date.now() - lastPauseTime;
    
    // Only log if paused for more than 1 second
    if (pauseDuration > 1000) {
        console.log("Paused for " + (pauseDuration / 1000) + "s");
    }
};
```

### 3. Store Data Efficiently

```javascript
// Good: Store only necessary data
history.push({
    title: data.title,
    url: data.url,
    timestamp: Date.now(),
    finished: percent > 90
});

// Bad: Storing entire data object wastes space
history.push(data); // Too much data
```

### 4. Cleanup Resources

```javascript
var intervals = [];

scrobbler.onstart = function(data, prop, origin) {
    var interval = setInterval(function() {
        // Periodic task
    }, 5000);
    
    intervals.push(interval);
};

scrobbler.onstop = function(data, prop, origin) {
    // Clean up intervals
    intervals.forEach(function(interval) {
        clearInterval(interval);
    });
    intervals = [];
};

// Also clean on plugin unload
plugin.addUnloadHook(function() {
    scrobbler.destroy();
    intervals.forEach(clearInterval);
});
```

### 5. Respect User Privacy

```javascript
// Check if user opted out of tracking
if (settings.enableTracking === false) {
    // Don't track, but still create scrobbler to avoid errors
    scrobbler.onstart = null;
    scrobbler.onstop = null;
    scrobbler.onpause = null;
    scrobbler.onresume = null;
}
```

---

## Common Pitfalls

### Pitfall 1: Assuming All Fields Exist

```javascript
// ❌ Wrong: Will crash if duration is undefined
var percent = (data.stopposition / data.duration) * 100;

// ✅ Correct: Check fields first
var duration = data.duration || 0;
var stopPos = data.stopposition || 0;
var percent = duration > 0 ? (stopPos / duration) * 100 : 0;
```

### Pitfall 2: Not Handling Multiple Videos

```javascript
// ❌ Wrong: Global variables get overwritten
var currentVideo = null;

scrobbler.onstart = function(data) {
    currentVideo = data; // Overwrites previous
};

// ✅ Correct: Use store keyed by URL
scrobbler.onstart = function(data) {
    var videos = store.videos || {};
    videos[data.url] = {
        started_at: Date.now(),
        data: data
    };
    store.videos = videos;
};
```

### Pitfall 3: Memory Leaks with Intervals

```javascript
// ❌ Wrong: Interval keeps running
scrobbler.onstart = function(data) {
    setInterval(function() {
        console.log("Still playing...");
    }, 5000);
};

// ✅ Correct: Clean up on stop
var intervals = [];

scrobbler.onstart = function(data) {
    var interval = setInterval(...);
    intervals.push(interval);
};

scrobbler.onstop = function(data) {
    intervals.forEach(clearInterval);
    intervals = [];
};
```

### Pitfall 4: Blocking the Main Thread

```javascript
// ❌ Wrong: Synchronous network request blocks UI
scrobbler.onstop = function(data) {
    var response = http.request('https://api.example.com/scrobble'); // SYNC - BAD!
};

// ✅ Correct: Use async callback
scrobbler.onstop = function(data) {
    http.request('https://api.example.com/scrobble', function(err, response) {
        // Async - Good!
    });
};
```

### Pitfall 5: Not Handling Errors

```javascript
// ❌ Wrong: No error handling
try {
    var history = JSON.parse(store.history);
} catch (e) {
    // Silent failure - bad!
}

// ✅ Correct: Handle errors gracefully
try {
    var history = JSON.parse(store.history);
} catch (e) {
    console.error("Failed to parse history: " + e.message);
    history = []; // Fallback to empty
}
```

---

## API Quick Reference

### Class

```javascript
var scrobbler = new videoscrobbler.VideoScrobbler();
```

### Properties

```javascript
scrobbler.paused        // boolean (read-only)
```

### Methods

```javascript
scrobbler.destroy()     // Cleanup and unregister
```

### Event Handlers

```javascript
scrobbler.onstart = function(data, prop, origin) { };
scrobbler.onstop = function(data, prop, origin) { };
scrobbler.onpause = function(data, prop, origin) { };
scrobbler.onresume = function(data, prop, origin) { };
```

### Data Object

```javascript
{
    title: string,
    url: string,
    duration: number,
    startposition: number,    // onstop only
    stopposition: number,     // onstop only
    season: number,           // TV only
    episode: number,          // TV only
    year: number,
    imdb_id: string,
    item: Object
}
```

### Property Object

```javascript
prop.playstatus      // 'play' | 'pause' | 'stop'
prop.currenttime     // Current position in seconds
prop.duration        // Total duration in seconds
```

---

## See Also

- [Store API](storage-api.md) - Persistent storage for watch history
- [Property API](prop-api.md) - Working with property objects
- [HTTP API](http-api.md) - Sending data to external services
- [Plugin Examples](../examples/03-advanced/04-video-scrobbler/) - Complete working example

**Source Files:**
- API Implementation: `res/ecmascript/modules/movian/videoscrobbler.js`
- Example: `docs/plugins/examples/03-advanced/04-video-scrobbler/main.js`
- Native Hook: `src/ecmascript/es_hook.c`

---

*Last updated: 2024 - Compatible with Movian API v2*
