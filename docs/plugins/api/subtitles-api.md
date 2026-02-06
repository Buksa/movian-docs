# Subtitles API

Complete reference for the Subtitles API, enabling plugins to provide subtitle search and download capabilities for video playback.

## Table of Contents

- [Overview](#overview)
- [Module Import](#module-import)
- [Core Functions](#core-functions)
- [Provider Implementation](#provider-implementation)
- [Request Object](#request-object)
- [Subtitle Object](#subtitle-object)
- [Language Support](#language-support)
- [Practical Use Cases](#practical-use-cases)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [API Quick Reference](#api-quick-reference)
- [See Also](#see-also)

---

## Overview

The Subtitles API allows plugins to register as subtitle providers, enabling Movian to search and download subtitles from external sources. This system integrates seamlessly with Movian's video player, allowing users to select subtitles during playback.

### How It Works

1. Plugin registers a subtitle provider using `subtitles.addProvider()`
2. When user plays a video, Movian queries all registered providers
3. Each provider receives a request object with video metadata
4. Provider searches its subtitle database/API
5. Provider calls `req.addSubtitle()` for each found subtitle
6. Movian displays available subtitles to the user
7. User selects subtitle, Movian downloads and displays it

### Use Cases

**🌍 OpenSubtitles Integration:**
- Search OpenSubtitles.org database
- Download subtitles by file hash
- Multiple language support

**📁 Local Subtitles:**
- Auto-discover subtitles in video folder
- Support for .srt, .ass, .vtt files
- Named matching (movie.srt → movie.mp4)

**🔍 Custom Providers:**
- Private subtitle APIs
- Premium subtitle services
- Community subtitle databases

**🌐 Multi-Language Support:**
- Automatic language detection
- Priority language selection
- Fallback languages

---

## Module Import

```javascript
var subtitles = require('movian/subtitles');
```

**Source:** `res/ecmascript/modules/movian/subtitles.js`

---

## Core Functions

### subtitles.addProvider(callback)

Registers a subtitle provider function that will be called when Movian needs subtitles for a video.

**Function Signature:**
```javascript
subtitles.addProvider(function(request) {
    // Search for subtitles
    // Call request.addSubtitle() for each result
});
```

**Parameters:**
- `callback` (Function): Provider function that receives request object

**Returns:** None

**Example:**
```javascript
subtitles.addProvider(function(req) {
    console.log("Searching subtitles for: " + req.file);
    
    // Search logic here
    // ...
    
    // Add found subtitle
    req.addSubtitle(
        "http://example.com/subtitle.srt",
        "English subtitle",
        "eng",
        "srt",
        "MyProvider",
        100
    );
});
```

**Important Notes:**
- Provider is registered for the entire plugin lifetime
- Callback is called for every video playback
- Multiple providers can be registered (called in parallel)
- Provider should be registered once during plugin initialization

### subtitles.getLanguages()

Returns an array of supported language codes.

**Function Signature:**
```javascript
var languages = subtitles.getLanguages();
```

**Returns:** Array of strings (language codes like "eng", "rus", "spa")

**Example:**
```javascript
var langs = subtitles.getLanguages();
console.log("Supported languages: " + langs.join(", "));
// Output: Supported languages: eng, rus, spa, fra, deu, jpn, chi
```

**Use Cases:**
- Display available languages in settings
- Validate language codes
- Build language selection UI

---

## Provider Implementation

### Request Object

The request object is passed to your provider callback and contains information about the video being played.

#### Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `file` | string | Filename of the video | "movie.mp4" |
| `url` | string | URL of video (if available) | "http://..." |
| `imdb` | string | IMDB ID (if known) | "tt1234567" |
| `season` | number | Season number (TV shows) | 1 |
| `episode` | number | Episode number (TV shows) | 5 |
| `lang` | string | Requested language code | "eng" |
| `year` | number | Release year | 2023 |

#### Methods

##### request.addSubtitle(url, title, language, format, source, score)

Adds a subtitle to the search results.

**Parameters:**
- `url` (string): Direct download URL for the subtitle file
- `title` (string): Display name for the subtitle
- `language` (string): Language code (3-letter ISO 639-2)
- `format` (string): File format ("srt", "ass", "ssa", "vtt", "sub")
- `source` (string): Provider name (shown to user)
- `score` (number): Relevance score (0-100, higher is better)

**Returns:** None

**Example:**
```javascript
req.addSubtitle(
    "https://example.com/subtitles/movie_eng.srt",
    "English (HI)",
    "eng",
    "srt",
    "OpenSubtitles",
    95
);
```

**Best Practices:**
- Always provide direct download URLs (no redirects)
- Use descriptive titles (include quality, source, HI if hearing impaired)
- Score 90-100 for exact matches (same release group)
- Score 70-89 for good matches (same video, different source)
- Score 50-69 for approximate matches (same movie/show)
- Include language in title if not obvious (e.g., "English - BluRay")

### Complete Provider Example

```javascript
var subtitles = require('movian/subtitles');
var http = require('movian/http');

subtitles.addProvider(function(req) {
    // Log search request
    console.log("Subtitle search: " + req.file);
    console.log("Language: " + req.lang);
    console.log("IMDB: " + (req.imdb || "unknown"));
    
    // Build search query
    var query = req.imdb || req.file;
    var searchUrl = "https://api.example.com/subtitles/search" +
        "?q=" + encodeURIComponent(query) +
        "&lang=" + req.lang +
        "&season=" + (req.season || "") +
        "&episode=" + (req.episode || "");
    
    // Perform search
    try {
        http.request(searchUrl, {
            method: 'GET',
            timeout: 15
        }, function(err, response) {
            if (err) {
                console.error("Subtitle search failed: " + err);
                return;
            }
            
            try {
                var results = JSON.parse(response.toString());
                
                if (!Array.isArray(results)) {
                    console.error("Invalid response format");
                    return;
                }
                
                // Add each subtitle
                results.forEach(function(sub) {
                    req.addSubtitle(
                        sub.download_url,
                        sub.title + " (" + sub.uploader + ")",
                        sub.language,
                        sub.format,
                        "MyProvider",
                        calculateScore(sub, req)
                    );
                });
                
                console.log("Found " + results.length + " subtitles");
                
            } catch (e) {
                console.error("Failed to parse response: " + e.message);
            }
        });
        
    } catch (e) {
        console.error("Request failed: " + e.message);
    }
});

function calculateScore(subtitle, request) {
    var score = 50; // Base score
    
    // Boost for exact filename match
    if (request.file && subtitle.filename &&
        subtitle.filename.indexOf(request.file.replace(/\.[^/.]+$/, "")) !== -1) {
        score += 30;
    }
    
    // Boost for verified/uploaded by trusted user
    if (subtitle.verified) {
        score += 10;
    }
    
    // Boost for downloads count (popularity)
    if (subtitle.downloads > 1000) {
        score += 5;
    }
    
    // Penalize for machine translation
    if (subtitle.machine_translated) {
        score -= 20;
    }
    
    return Math.min(100, Math.max(0, score));
}
```

---

## Subtitle Object

When adding a subtitle via `request.addSubtitle()`, you provide these fields:

### url (required)

**Type:** string

**Description:** Direct download URL for the subtitle file.

**Requirements:**
- Must be a direct link (no redirects)
- Must return the subtitle file content
- Should be accessible without authentication (or use token in URL)

**Examples:**
```javascript
// Good: Direct link
"https://subtitles.example.com/download/12345.srt?token=abc"

// Bad: Redirects or requires authentication
"https://subtitles.example.com/download?id=12345"  // May redirect
```

### title (required)

**Type:** string

**Description:** Display name shown to the user.

**Best Practices:**
- Include language if not obvious
- Add quality info (BluRay, WEB-DL, etc.)
- Add "HI" for hearing impaired
- Keep under 50 characters

**Examples:**
```javascript
"English"                                    // Basic
"English (BluRay)"                           // With quality
"English HI (Hearing Impaired)"             // Hearing impaired
"Русский (Russian)"                          // Non-English language
"English - Synced for release"              // Sync info
```

### language (required)

**Type:** string

**Description:** ISO 639-2 language code (3 letters).

**Common Codes:**
- "eng" - English
- "rus" - Russian
- "spa" - Spanish
- "fra" - French
- "deu" - German
- "jpn" - Japanese
- "chi" - Chinese
- "ita" - Italian
- "por" - Portuguese
- "pol" - Polish

**Full List:** See [ISO 639-2](https://www.loc.gov/standards/iso639-2/php/code_list.php)

**Example:**
```javascript
req.addSubtitle(url, "English", "eng", "srt", source, score);
```

### format (required)

**Type:** string

**Description:** Subtitle file format.

**Supported Formats:**
- "srt" - SubRip (most common)
- "ass" - Advanced SubStation Alpha
- "ssa" - SubStation Alpha
- "vtt" - WebVTT
- "sub" - MicroDVD or VobSub

**Example:**
```javascript
req.addSubtitle(url, "English", "eng", "srt", source, score);
```

### source (required)

**Type:** string

**Description:** Provider name shown to user.

**Best Practices:**
- Use consistent name across all your subtitles
- Keep it short (under 20 characters)
- Don't include version numbers

**Examples:**
```javascript
"OpenSubtitles"
"LocalFiles"
"MySubtitleAPI"
```

### score (required)

**Type:** number

**Description:** Relevance score from 0 to 100.

**Scoring Guidelines:**
- **100:** Exact match (same release group, same file)
- **90-99:** Perfect sync (same video version)
- **80-89:** Good sync (slightly different source)
- **60-79:** Acceptable (same movie/show, timing may vary)
- **40-59:** Approximate (same content, may need adjustment)
- **0-39:** Poor match (may not sync well)

**Example:**
```javascript
req.addSubtitle(url, title, lang, format, source, 95);  // Excellent match
req.addSubtitle(url, title, lang, format, source, 75);  // Good match
```

---

## Language Support

### Getting Available Languages

```javascript
var subtitles = require('movian/subtitles');
var languages = subtitles.getLanguages();

console.log("Total languages: " + languages.length);
// languages is an array like: ["eng", "rus", "spa", "fra", ...]
```

### Language Code Reference

**Most Common:**

| Code | Language | Native Name |
|------|----------|-------------|
| eng | English | English |
| rus | Russian | Русский |
| spa | Spanish | Español |
| fra | French | Français |
| deu | German | Deutsch |
| jpn | Japanese | 日本語 |
| chi | Chinese | 中文 |
| ita | Italian | Italiano |
| por | Portuguese | Português |
| pol | Polish | Polski |
| ara | Arabic | العربية |
| kor | Korean | 한국어 |
| tur | Turkish | Türkçe |
| dut | Dutch | Nederlands |
| swe | Swedish | Svenska |

### Language Filtering

```javascript
subtitles.addProvider(function(req) {
    // Check if we support this language
    var supportedLangs = ["eng", "rus", "spa"];
    
    if (supportedLangs.indexOf(req.lang) === -1) {
        console.log("Language not supported: " + req.lang);
        return; // Don't search
    }
    
    // Search for subtitles...
});
```

---

## Practical Use Cases

### Use Case 1: OpenSubtitles Provider

Integrate with OpenSubtitles API.

```javascript
var subtitles = require('movian/subtitles');
var http = require('movian/http');
var crypto = require('native/crypto');

// OpenSubtitles API configuration
var OS_API_URL = "https://rest.opensubtitles.org/search";
var OS_USER_AGENT = "MovianPlugin v1.0";

subtitles.addProvider(function(req) {
    if (!req.file) {
        console.log("No filename available");
        return;
    }
    
    // Calculate file hash (OpenSubtitles specific)
    // In real implementation, calculate from actual file
    var fileHash = calculateFileHash(req.file);
    
    // Build search URL
    var searchUrl = OS_API_URL;
    var params = [];
    
    if (fileHash) {
        params.push("hash=" + fileHash);
    }
    
    if (req.imdb) {
        params.push("imdbid=" + req.imdb.replace("tt", ""));
    }
    
    params.push("query=" + encodeURIComponent(req.file));
    params.push("sublanguageid=" + getOSLanguageCode(req.lang));
    
    searchUrl += "?" + params.join("&");
    
    console.log("OpenSubtitles search: " + searchUrl);
    
    // Search
    http.request(searchUrl, {
        headers: {
            "User-Agent": OS_USER_AGENT,
            "X-User-Agent": OS_USER_AGENT
        },
        timeout: 20
    }, function(err, response) {
        if (err) {
            console.error("OpenSubtitles error: " + err);
            return;
        }
        
        try {
            var data = JSON.parse(response.toString());
            
            if (!data || !Array.isArray(data)) {
                return;
            }
            
            data.forEach(function(sub) {
                var score = calculateOpenSubtitlesScore(sub, req);
                
                req.addSubtitle(
                    sub.SubDownloadLink,
                    sub.SubFileName + " (" + sub.SubLanguageID + ")",
                    getStandardLangCode(sub.SubLanguageID),
                    sub.SubFormat.toLowerCase(),
                    "OpenSubtitles",
                    score
                );
            });
            
        } catch (e) {
            console.error("Parse error: " + e.message);
        }
    });
});

function calculateOpenSubtitlesScore(sub, req) {
    var score = 50;
    
    // Boost for hash match (exact file)
    if (sub.MovieHashMatch) {
        score += 40;
    }
    
    // Boost for IMDB match
    if (req.imdb && sub.IDMovieImdb === req.imdb) {
        score += 30;
    }
    
    // Boost for high rating
    score += Math.min(10, sub.SubRating || 0);
    
    // Boost for downloads (popularity)
    score += Math.min(10, (sub.SubDownloadsCnt || 0) / 1000);
    
    return Math.min(100, score);
}

function getOSLanguageCode(lang) {
    // Convert ISO 639-2 to OpenSubtitles format
    var mapping = {
        "eng": "eng",
        "rus": "rus",
        "spa": "spa",
        // ... more mappings
    };
    return mapping[lang] || lang;
}

function getStandardLangCode(osLang) {
    // Convert back to ISO 639-2
    return osLang.toLowerCase();
}
```

### Use Case 2: Local File Provider

Discover subtitles in the same folder as the video.

```javascript
var subtitles = require('movian/subtitles');
var io = require('native/io');

subtitles.addProvider(function(req) {
    if (!req.url) {
        console.log("No URL available for local subtitle search");
        return;
    }
    
    // Extract directory from video URL
    var videoUrl = req.url;
    var lastSlash = videoUrl.lastIndexOf('/');
    
    if (lastSlash === -1) {
        return;
    }
    
    var directory = videoUrl.substring(0, lastSlash + 1);
    var videoName = req.file.replace(/\.[^/.]+$/, ""); // Remove extension
    
    console.log("Searching local subtitles in: " + directory);
    console.log("Video name: " + videoName);
    
    // Common subtitle extensions
    var extensions = ["srt", "ass", "ssa", "vtt", "sub"];
    var languages = ["eng", "rus", "spa", "fra"]; // Priority languages
    
    // Search for subtitles
    extensions.forEach(function(ext) {
        // Check for language-specific subtitles
        languages.forEach(function(lang) {
            var subtitleUrl = directory + videoName + "." + lang + "." + ext;
            
            checkFileExists(subtitleUrl, function(exists) {
                if (exists) {
                    var langName = getLanguageName(lang);
                    req.addSubtitle(
                        subtitleUrl,
                        langName + " (Local)",
                        lang,
                        ext,
                        "LocalFiles",
                        100 // Perfect score for local files
                    );
                }
            });
        });
        
        // Check for generic subtitle (no language code)
        var genericUrl = directory + videoName + "." + ext;
        checkFileExists(genericUrl, function(exists) {
            if (exists) {
                req.addSubtitle(
                    genericUrl,
                    "Subtitle (Local)",
                    "eng", // Assume English if no code
                    ext,
                    "LocalFiles",
                    95
                );
            }
        });
    });
});

function checkFileExists(url, callback) {
    // Use io.stat or http.head to check if file exists
    try {
        http.request(url, {
            method: 'HEAD',
            timeout: 5
        }, function(err, response) {
            callback(!err && response.statusCode === 200);
        });
    } catch (e) {
        callback(false);
    }
}

function getLanguageName(code) {
    var names = {
        "eng": "English",
        "rus": "Russian",
        "spa": "Spanish",
        "fra": "French"
    };
    return names[code] || code;
}
```

### Use Case 3: Multi-Provider with Caching

Combine multiple providers with local caching.

```javascript
var subtitles = require('movian/subtitles');
var store = require('movian/store');
var http = require('movian/http');

// Cache storage
var cache = store.create("subtitle_cache");

// Cache duration: 24 hours
var CACHE_DURATION = 24 * 60 * 60 * 1000;

function getCachedSubtitles(key) {
    var cached = cache[key];
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        delete cache[key];
        return null;
    }
    
    return cached.results;
}

function setCachedSubtitles(key, results) {
    cache[key] = {
        timestamp: Date.now(),
        results: results
    };
}

// Provider 1: OpenSubtitles
function openSubtitlesProvider(req) {
    var cacheKey = "os_" + req.file + "_" + req.lang;
    var cached = getCachedSubtitles(cacheKey);
    
    if (cached) {
        console.log("Using cached OpenSubtitles results");
        cached.forEach(function(sub) {
            req.addSubtitle(sub.url, sub.title, sub.lang, sub.format, sub.source, sub.score);
        });
        return;
    }
    
    var results = [];
    
    // Search OpenSubtitles...
    // (implementation similar to Use Case 1)
    
    // Cache results
    setCachedSubtitles(cacheKey, results);
}

// Provider 2: Local Files
function localProvider(req) {
    // Implementation from Use Case 2
}

// Register both providers
subtitles.addProvider(openSubtitlesProvider);
subtitles.addProvider(localProvider);
```

### Use Case 4: Custom Premium Provider

Implement a custom provider with authentication.

```javascript
var subtitles = require('movian/subtitles');
var store = require('movian/store');
var http = require('movian/http');

var config = store.create("premium_provider_config");

// Settings for API key
settings.createString("subtitle_api_key", "Subtitle API Key", "", function(value) {
    config.api_key = value;
});

subtitles.addProvider(function(req) {
    if (!config.api_key) {
        console.log("No API key configured");
        return;
    }
    
    var apiUrl = "https://api.premium-subtitles.com/v1/search" +
        "?token=" + encodeURIComponent(config.api_key) +
        "&file=" + encodeURIComponent(req.file) +
        "&lang=" + req.lang;
    
    if (req.imdb) {
        apiUrl += "&imdb=" + req.imdb;
    }
    
    http.request(apiUrl, {
        headers: {
            "Authorization": "Bearer " + config.api_key
        },
        timeout: 15
    }, function(err, response) {
        if (err) {
            console.error("Premium API error: " + err);
            return;
        }
        
        try {
            var data = JSON.parse(response.toString());
            
            if (data.subtitles) {
                data.subtitles.forEach(function(sub) {
                    req.addSubtitle(
                        sub.download_url + "?token=" + config.api_key,
                        sub.name + " [Premium]",
                        sub.language,
                        sub.format,
                        "PremiumSubs",
                        sub.quality_score
                    );
                });
            }
        } catch (e) {
            console.error("Parse error: " + e);
        }
    });
});
```

---

## Best Practices

### 1. Always Handle Errors

```javascript
subtitles.addProvider(function(req) {
    try {
        // Search logic
    } catch (e) {
        console.error("Provider error: " + e.message);
        // Don't let errors crash the plugin
    }
});
```

### 2. Use Timeouts

```javascript
http.request(url, {
    timeout: 15  // 15 seconds max
}, function(err, response) {
    // Handle response
});
```

### 3. Validate Responses

```javascript
try {
    var data = JSON.parse(response.toString());
    
    if (!data || !Array.isArray(data.subtitles)) {
        console.error("Invalid response format");
        return;
    }
    
    // Process results
} catch (e) {
    console.error("Parse error: " + e.message);
}
```

### 4. Score Appropriately

```javascript
// Good: Meaningful scores
req.addSubtitle(url, title, lang, format, source, 95);  // Exact match
req.addSubtitle(url, title, lang, format, source, 75);  // Good match
req.addSubtitle(url, title, lang, format, source, 50);  // Approximate

// Bad: All same score
req.addSubtitle(url, title, lang, format, source, 100); // All "perfect"
```

### 5. Support Multiple Languages

```javascript
subtitles.addProvider(function(req) {
    // Primary language
    searchSubtitles(req.lang);
    
    // Fallback languages from settings
    var fallbacks = settings.fallback_langs || ["eng"];
    fallbacks.forEach(function(lang) {
        if (lang !== req.lang) {
            searchSubtitles(lang);
        }
    });
});
```

### 6. Cache Results

```javascript
var cache = {};
var CACHE_TIME = 60 * 60 * 1000; // 1 hour

subtitles.addProvider(function(req) {
    var key = req.file + "_" + req.lang;
    var cached = cache[key];
    
    if (cached && (Date.now() - cached.time < CACHE_TIME)) {
        // Use cached results
        cached.results.forEach(function(sub) {
            req.addSubtitle(sub.url, sub.title, sub.lang, sub.format, sub.source, sub.score);
        });
        return;
    }
    
    // Search and cache results
    // ...
});
```

---

## Common Pitfalls

### Pitfall 1: Not Checking Request Data

```javascript
// ❌ Wrong: Assumes all fields exist
var imdb = req.imdb;  // May be undefined

// ✅ Correct: Check fields
var imdb = req.imdb || null;
if (imdb) {
    // Use IMDB
}
```

### Pitfall 2: Synchronous Network Requests

```javascript
// ❌ Wrong: Blocks UI
var response = http.request(url);  // SYNC

// ✅ Correct: Use async
http.request(url, function(err, response) {
    // Handle response
});
```

### Pitfall 3: Not Encoding URLs

```javascript
// ❌ Wrong: Special characters break URL
var url = "https://api.example.com/search?q=" + req.file;

// ✅ Correct: Encode components
var url = "https://api.example.com/search?q=" + encodeURIComponent(req.file);
```

### Pitfall 4: Ignoring Language Code

```javascript
// ❌ Wrong: Always returns same language
req.addSubtitle(url, "Subtitle", "eng", "srt", source, score);

// ✅ Correct: Respect requested language
req.addSubtitle(url, title, req.lang, "srt", source, score);
```

### Pitfall 5: Memory Leaks

```javascript
// ❌ Wrong: Caches grow indefinitely
var cache = {};
cache[key] = results;  // Never cleaned

// ✅ Correct: Limit cache size or use TTL
function cleanupCache() {
    var now = Date.now();
    for (var key in cache) {
        if (now - cache[key].time > MAX_AGE) {
            delete cache[key];
        }
    }
}
```

---

## API Quick Reference

### Functions

```javascript
// Register provider
subtitles.addProvider(function(request) {
    // Search logic
});

// Get supported languages
var languages = subtitles.getLanguages();
// Returns: ["eng", "rus", "spa", ...]
```

### Request Object

```javascript
// Properties
request.file      // Filename (string)
request.url       // Video URL (string)
request.imdb      // IMDB ID (string)
request.season    // Season number (number)
request.episode   // Episode number (number)
request.lang      // Requested language code (string)
request.year      // Release year (number)

// Methods
request.addSubtitle(url, title, language, format, source, score);
```

### Subtitle Fields

```javascript
{
    url: "https://example.com/sub.srt",        // Download URL
    title: "English (BluRay)",                 // Display name
    language: "eng",                           // ISO 639-2 code
    format: "srt",                             // srt, ass, vtt, sub
    source: "OpenSubtitles",                   // Provider name
    score: 95                                  // 0-100 relevance
}
```

### Language Codes (ISO 639-2)

```javascript
"eng" - English
"rus" - Russian
"spa" - Spanish
"fra" - French
"deu" - German
"jpn" - Japanese
"chi" - Chinese
"ita" - Italian
"por" - Portuguese
"pol" - Polish
"ara" - Arabic
"kor" - Korean
```

---

## See Also

- [HTTP API](http-api.md) - Making API requests
- [Store API](storage-api.md) - Caching subtitle results
- [Video Scrobbler API](videoscrobbler-api.md) - Track video playback
- [Plugin Examples](../examples/03-advanced/03-subtitle-provider/) - Working example

**Source Files:**
- API Implementation: `res/ecmascript/modules/movian/subtitles.js`
- Example: `docs/plugins/examples/03-advanced/03-subtitle-provider/main.js`
- Native Implementation: `src/subtitles/` (various files)

---

*Last updated: 2024 - Compatible with Movian API v2*
