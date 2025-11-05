# Plugin Manifest Reference (plugin.json)

## Overview

The `plugin.json` file is the manifest that describes a Movian plugin's metadata, capabilities, and requirements. This file is required for all plugins and must be located in the plugin's root directory.

## Basic Structure

```json
{
  "type": "ecmascript",
  "apiversion": 2,
  "id": "my-plugin",
  "file": "main.js",
  "version": "1.0.0",
  "title": "My Plugin",
  "author": "Plugin Developer",
  "description": "A sample plugin for Movian",
  "category": "video",
  "showtimeVersion": "5"
}
```

## Required Fields

### `type` (string, required)

Specifies the plugin type. Determines how the plugin is loaded and executed.

**Valid values:**
- `"ecmascript"` - JavaScript plugin using Duktape runtime
- `"views"` - UI-only plugin with view files
- `"bitcode"` - LLVM bitcode plugin (deprecated)

**Example:**
```json
{
  "type": "ecmascript"
}
```

### `id` (string, required)

Unique identifier for the plugin. Must be unique across all plugins.

**Format:** Alphanumeric characters, dots, hyphens, and underscores
**Example:**
```json
{
  "id": "my-video-plugin"
}
```

### `version` (string, required)

Plugin version using semantic versioning format.

**Format:** `MAJOR.MINOR.PATCH` or `MAJOR.MINOR.PATCH.BUILD`
**Example:**
```json
{
  "version": "1.2.3"
}
```

### `title` (string, required)

Human-readable plugin name displayed in the UI.

**Example:**
```json
{
  "title": "YouTube Video Player"
}
```

## ECMAScript Plugin Fields

### `file` (string, required for ecmascript)

Path to the main JavaScript file relative to the plugin directory.

**Example:**
```json
{
  "file": "main.js"
}
```

### `apiversion` (integer, required for ecmascript)

ECMAScript API version the plugin is designed for.

**Valid values:**
- `1` - Legacy API (deprecated, uses compatibility layer)
- `2` - Current API (recommended)

**Example:**
```json
{
  "apiversion": 2
}
```

## Optional Metadata Fields

### `author` (string, optional)

Plugin author or developer name.

**Example:**
```json
{
  "author": "John Doe"
}
```

### `description` (string, optional)

Detailed plugin description. Supports HTML formatting.

**Example:**
```json
{
  "description": "<p>This plugin provides access to <a href=\"https://example.com\">Example Video Service</a> for streaming movies and TV shows.</p>"
}
```

### `synopsis` (string, optional)

Short one-line description of the plugin.

**Example:**
```json
{
  "synopsis": "Stream videos from Example Service"
}
```

### `homepage` (string, optional)

URL to the plugin's homepage or repository.

**Example:**
```json
{
  "homepage": "https://github.com/user/my-plugin"
}
```

### `icon` (string, optional)

Path to the plugin icon relative to the plugin directory.

**Supported formats:** PNG, JPG, GIF
**Recommended size:** 256x256 pixels
**Example:**
```json
{
  "icon": "icon.png"
}
```

### `category` (string, optional)

Plugin category for organization in the plugin browser.

**Valid values:**
- `"tv"` - Online TV and live streaming
- `"video"` - Video streaming services
- `"music"` - Music streaming and audio
- `"cloud"` - Cloud storage services
- `"subtitles"` - Subtitle providers
- `"glwview"` - UI themes and components
- `"glwosk"` - On-screen keyboards
- `"audioengine"` - Audio decoders
- `"other"` - Miscellaneous utilities

**Default:** `"other"`
**Example:**
```json
{
  "category": "video"
}
```

### `popularity` (integer, optional)

Plugin popularity score used for sorting in repository listings.

**Range:** 0-100
**Example:**
```json
{
  "popularity": 85
}
```

## Version Requirements

### `showtimeVersion` (string, optional)

Minimum Movian version required for the plugin to function.

**Format:** Version string or minimum version number
**Example:**
```json
{
  "showtimeVersion": "5.0.200"
}
```

## Advanced Configuration

### `debug` (boolean, optional)

Enable debug mode for the plugin during development.

**Default:** `false`
**Example:**
```json
{
  "debug": true
}
```

### `entitlements` (object, optional)

Security permissions requested by the plugin.

**Available entitlements:**
- `bypassFileACLRead` - Bypass file system read restrictions
- `bypassFileACLWrite` - Bypass file system write restrictions

**Example:**
```json
{
  "entitlements": {
    "bypassFileACLRead": false,
    "bypassFileACLWrite": false
  }
}
```

### `memory-size` (integer, optional, bitcode only)

Memory size in KB for bitcode plugins.

**Default:** 4096
**Example:**
```json
{
  "memory-size": 8192
}
```

### `stack-size` (integer, optional, bitcode only)

Stack size in KB for bitcode plugins.

**Default:** 64
**Example:**
```json
{
  "stack-size": 128
}
```

## UI Integration

### `glwviews` (array, optional)

Custom view files provided by the plugin.

**Structure:**
```json
{
  "glwviews": [
    {
      "uitype": "standard",
      "class": "background",
      "title": "Custom Background",
      "file": "views/background.view",
      "select": false
    }
  ]
}
```

**Fields:**
- `uitype` - UI type (`"standard"` is most common)
- `class` - View class (e.g., `"background"`, `"loading"`, `"home"`)
- `title` - Display name for the view
- `file` - Path to view file relative to plugin directory
- `select` - Whether to auto-select this view on installation

## Auto-Installation Configuration

### `control` (object, optional)

Configuration for automatic plugin installation based on file types or URI patterns.

#### File Format Detection

```json
{
  "control": {
    "fileformats": [
      {
        "data": "base64-encoded-magic-bytes",
        "mask": "base64-encoded-mask",
        "offset": 0
      }
    ]
  }
}
```

#### URI Prefix Detection

```json
{
  "control": {
    "uriprefixes": [
      "https://example.com/",
      "myprotocol://"
    ]
  }
}
```

## Repository Fields

### `downloadURL` (string, repository only)

Direct download URL for the plugin package. Used by plugin repositories.

**Example:**
```json
{
  "downloadURL": "https://repo.example.com/plugins/my-plugin-1.0.0.zip"
}
```

## Complete Example

```json
{
  "type": "ecmascript",
  "apiversion": 2,
  "id": "example-video-service",
  "file": "main.js",
  "version": "2.1.0",
  "title": "Example Video Service",
  "author": "Plugin Developer",
  "synopsis": "Stream videos from Example Service",
  "description": "<p>This plugin provides access to <a href=\"https://example.com\">Example Video Service</a> for streaming movies, TV shows, and documentaries.</p><p>Features:</p><ul><li>Search functionality</li><li>HD streaming</li><li>Subtitle support</li></ul>",
  "homepage": "https://github.com/developer/example-plugin",
  "icon": "icon.png",
  "category": "video",
  "popularity": 75,
  "showtimeVersion": "5.0.156",
  "debug": false,
  "entitlements": {
    "bypassFileACLRead": false,
    "bypassFileACLWrite": false
  },
  "glwviews": [
    {
      "uitype": "standard",
      "class": "loading",
      "title": "Example Service Loading Screen",
      "file": "views/loading.view",
      "select": false
    }
  ],
  "control": {
    "uriprefixes": [
      "https://example.com/watch/",
      "example://"
    ]
  }
}
```

## Validation Rules

### Required Field Validation

- `type`, `id`, `version`, and `title` are mandatory
- ECMAScript plugins must include `file` and `apiversion`
- Plugin ID must be unique across all installed plugins

### Format Validation

- Version must follow semantic versioning
- Icon file must exist if specified
- Main file must exist for ECMAScript plugins
- Category must be from the valid list

### Compatibility Validation

- `showtimeVersion` checked against current Movian version
- API version must be supported
- Entitlements validated against security policy

## Best Practices

### Naming Conventions

- Use descriptive, unique plugin IDs
- Follow semantic versioning strictly
- Use clear, concise titles and descriptions

### Metadata Quality

- Provide comprehensive descriptions with HTML formatting
- Include high-quality icons (256x256 PNG recommended)
- Set appropriate categories for discoverability
- Include homepage URLs for support and updates

### Version Management

- Increment versions appropriately for changes
- Test compatibility with minimum Movian versions
- Document breaking changes in descriptions

### Security Considerations

- Request minimal necessary entitlements
- Validate all user inputs in plugin code
- Follow secure coding practices for network requests

This manifest reference ensures plugins are properly configured and integrated into the Movian ecosystem.