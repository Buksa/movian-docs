# Command-Line Options Reference

Complete reference for all Movian command-line options and debug flags.

## Overview

Movian supports a comprehensive set of command-line options for controlling application behavior, debugging, and development. These options are parsed in `src/main.c` during application startup.

## Basic Usage

```bash
movian [options] [<url>]
```

Where `<url>` is any supported URL type (e.g., `file:///path/to/media`, `http://...`, plugin URLs).

## General Options

### Help and Version

#### `-h, --help`
Display help text with all available options and exit.

```bash
movian --help
```

**Output**: Shows version, copyright, and complete list of command-line options.

### Debug and Logging

#### `-d`
Enable debug output (sets trace level to `TRACE_DEBUG`).

```bash
movian -d
```

**Effect**: 
- Enables verbose debug logging
- Shows detailed trace messages from all subsystems
- Useful for troubleshooting and development

**Source**: `gconf.trace_level = TRACE_DEBUG`

#### `--libav-log`
Enable libav (FFmpeg) log messages.

```bash
movian --libav-log
```

**Effect**:
- Shows FFmpeg/libav internal logging
- Useful for debugging media playback issues
- Shows codec, format, and stream information

**Source**: `gconf.libavlog = 1`

#### `-L <ip:host>`
Send log messages to remote host.

```bash
movian -L 192.168.1.100:9000
```

**Effect**: Redirects log output to remote syslog server or log collector.

#### `--syslog`
Send log messages to system syslog.

```bash
movian --syslog
```

**Effect**: 
- Integrates with system logging (syslog on Linux/macOS)
- Useful for production deployments
- Logs appear in `/var/log/syslog` or system journal

**Source**: `gconf.trace_to_syslog = 1`

### UI Options

#### `--no-ui`
Start without user interface (headless mode).

```bash
movian --no-ui
```

**Effect**:
- Runs Movian without GUI
- Useful for server/backend mode
- Still runs plugins and services

**Source**: `gconf.noui = 1`

#### `--fullscreen`
Start in fullscreen mode.

```bash
movian --fullscreen
```

**Effect**: Launches application in fullscreen instead of windowed mode.

**Source**: `gconf.fullscreen = 1`

#### `--ui <ui>`
Use specified user interface.

```bash
movian --ui glw
```

**Options**: `glw` (OpenGL Widget system) or platform-specific UIs.

**Source**: `gconf.ui = argv[1]`

#### `--skin <skin>`
Select skin for GLW UI.

```bash
movian --skin flat
```

**Options**: 
- `flat` - Modern flat design (default)
- `old` - Legacy skin
- Custom skin names from `glwskins/` directory

**Source**: `gconf.skin = argv[1]`

#### `-v <view>`
Use specific view for initial URL.

```bash
movian -v video file:///path/to/movie.mp4
```

**Effect**: Opens URL with specified view type instead of auto-detection.

**Source**: `gconf.initial_view = argv[1]`

### Path Configuration

#### `--cache <path>`
Set path for cache directory.

```bash
movian --cache /tmp/movian-cache
```

**Effect**: 
- Overrides default cache location
- Used for thumbnails, temporary files, blob cache
- Directory is created if it doesn't exist

**Default**: Platform-specific (e.g., `~/.cache/movian` on Linux)

**Source**: `gconf.cache_path = argv[1]`

#### `--persistent <path>`
Set path for persistent storage.

```bash
movian --persistent ~/.config/movian
```

**Effect**:
- Overrides default settings/data location
- Stores settings, databases, keyring
- Directory is created if it doesn't exist

**Default**: Platform-specific (e.g., `~/.config/movian` on Linux)

**Source**: `gconf.persistent_path = argv[1]`

### Network Options

#### `--proxy <host:port>`
Use SOCKS 4/5 proxy for HTTP requests.

```bash
movian --proxy 127.0.0.1:1080
```

**Effect**: Routes all HTTP traffic through specified SOCKS proxy.

**Default Port**: 1080 (if not specified)

**Source**: 
```c
gconf.proxy_host = host;
gconf.proxy_port = port;
```

#### `--disable-upnp`
Disable UPNP/DLNA stack.

```bash
movian --disable-upnp
```

**Effect**: 
- Disables UPnP device discovery
- Disables DLNA media server
- Reduces network traffic

**Source**: `gconf.disable_upnp = 1`

**Availability**: Only when compiled with `ENABLE_HTTPSERVER`

#### `--disable-sd`
Disable service discovery (mDNS, Avahi, etc).

```bash
movian --disable-sd
```

**Effect**:
- Disables mDNS/Bonjour service discovery
- Disables automatic network service detection
- Reduces network traffic

**Source**: `gconf.disable_sd = 1`

### Plugin Development

#### `-p <path>`
Load plugin from directory (development mode).

```bash
movian -p /path/to/my-plugin
```

**Effect**:
- Loads plugin directly from filesystem
- Bypasses plugin repository
- Can be specified multiple times for multiple plugins
- Intended for plugin development and testing

**Source**: `strvec_addp(&gconf.devplugins, argv[1])`

#### `--plugin-repo <url>`
Use custom plugin repository URL.

```bash
movian --plugin-repo https://my-repo.com/plugins
```

**Effect**: 
- Overrides default plugin repository
- Useful for testing custom plugin repositories
- Intended for plugin development

**Source**: `gconf.plugin_repo = argv[1]`

#### `--disable-upgrades`
Disable automatic upgrades (plugins and app).

```bash
movian --disable-upgrades
```

**Effect**:
- Disables plugin auto-updates
- Disables application auto-updates
- Useful for development and testing

**Source**: `gconf.disable_upgrades = 1`

#### `--bypass-ecmascript-acl`
Bypass ECMAScript security ACL (Access Control List).

```bash
movian --bypass-ecmascript-acl
```

**Effect**:
- Disables JavaScript security restrictions
- Allows plugins full system access
- **DANGEROUS**: Only use for trusted plugin development

**Source**: `gconf.bypass_ecmascript_acl = 1`

#### `--ecmascript <path>`
Load JavaScript file at startup.

```bash
movian --ecmascript /path/to/script.js
```

**Effect**: Executes JavaScript file in Movian's ECMAScript environment.

**Source**: `gconf.load_ecmascript = argv[1]`

### Advanced Debug Options

#### `--debug-glw`
Enable GLW (OpenGL Widget) debug output.

```bash
movian --debug-glw
```

**Effect**:
- Shows detailed GLW rendering information
- Logs widget tree operations
- Displays layout calculations
- Useful for UI development and debugging

**Source**: `gconf.debug_glw = 1`

#### `--pointer-is-touch`
Convert pointer events to touch events.

```bash
movian --pointer-is-touch
```

**Effect**:
- Treats mouse as touch input
- Useful for testing touch interfaces with mouse
- Enables touch-specific UI behaviors

**Source**: `gconf.convert_pointer_to_touch = 1`

#### `--show-usage-events`
Display usage tracking events.

```bash
movian --show-usage-events
```

**Effect**:
- Shows analytics/usage events in logs
- Useful for debugging usage tracking
- Shows what data would be sent to analytics

**Source**: `gconf.show_usage_events = 1`

### Input Options

#### `--stdin`
Listen on stdin for events.

```bash
echo "quit" | movian --stdin
```

**Effect**:
- Enables command input from stdin
- Useful for automation and scripting
- Can send events to running instance

**Source**: `gconf.listen_on_stdin = 1`

**Availability**: Only when compiled with `ENABLE_STDIN`

### System Control Options

#### `--with-standby`
Enable system standby capability.

```bash
movian --with-standby
```

**Effect**: Enables "Suspend" option in UI to put system in standby mode.

**Source**: `gconf.can_standby = 1`

#### `--with-poweroff`
Enable system power-off capability.

```bash
movian --with-poweroff
```

**Effect**: Enables "Power Off" option in UI to shut down system.

**Source**: `gconf.can_poweroff = 1`

#### `--with-logout`
Enable logout capability.

```bash
movian --with-logout
```

**Effect**: Enables "Logout" option in UI (for multi-user systems).

**Source**: `gconf.can_logout = 1`

#### `--with-restart`
Enable system restart capability.

```bash
movian --with-restart
```

**Effect**: Enables "Restart" option in UI to reboot system.

**Source**: `gconf.can_restart = 1`

#### `--without-exit`
Disable exit/quit capability.

```bash
movian --without-exit
```

**Effect**: 
- Removes "Exit" option from UI
- Prevents user from closing application
- Useful for kiosk mode

**Source**: `gconf.can_not_exit = 1`

#### `--with-openshell`
Enable shell opening capability.

```bash
movian --with-openshell
```

**Effect**: Enables option to open system shell from UI.

**Source**: `gconf.can_open_shell = 1`

## Internal/Platform-Specific Options

### `--showtime-shell-fd <fd>`
File descriptor for shell communication (internal use).

**Source**: `gconf.shell_fd = atoi(argv[1])`

**Note**: Used internally for IPC, not for general use.

### `--upgrade-path <path>`
Set path for application upgrades (internal use).

**Source**: `gconf.upgrade_path = argv[1]`

### `--vmir-bitcode <path>`
Load VMIR bitcode file (experimental).

**Source**: `gconf.load_np = argv[1]`

**Note**: Experimental feature for bytecode execution.

### `-psn` (macOS only)
Process Serial Number argument (automatically added by macOS).

**Effect**: Ignored by Movian, handled by macOS launcher.

## Configuration File

Global configuration structure is defined in `src/main.h`:

```c
typedef struct gconf {
  int trace_level;              // Logging level
  int libavlog;                 // FFmpeg logging
  int debug_glw;                // GLW debug mode
  int noui;                     // Headless mode
  int fullscreen;               // Fullscreen mode
  int disable_upnp;             // Disable UPnP
  int disable_sd;               // Disable service discovery
  int disable_upgrades;         // Disable auto-updates
  int bypass_ecmascript_acl;    // Bypass JS security
  int can_standby;              // System standby enabled
  int can_poweroff;             // System poweroff enabled
  int can_logout;               // Logout enabled
  int can_restart;              // System restart enabled
  int can_not_exit;             // Exit disabled
  int can_open_shell;           // Shell access enabled
  char *cache_path;             // Cache directory
  char *persistent_path;        // Settings directory
  char *ui;                     // UI type
  char *skin;                   // Skin name
  char *initial_url;            // Startup URL
  char *initial_view;           // Startup view
  char proxy_host[256];         // Proxy hostname
  int proxy_port;               // Proxy port
  strvec_t devplugins;          // Development plugins
  char *plugin_repo;            // Plugin repository URL
  // ... more fields
} gconf_t;

extern gconf_t gconf;
```

## Common Usage Examples

### Development Mode

```bash
# Full debug mode with plugin development
movian -d --debug-glw --libav-log -p ~/my-plugin
```

### Kiosk Mode

```bash
# Fullscreen, no exit, with standby
movian --fullscreen --without-exit --with-standby
```

### Headless Server

```bash
# No UI, with logging
movian --no-ui --syslog --disable-sd
```

### Testing Custom Skin

```bash
# Load custom skin with debug
movian -d --skin myskin --debug-glw
```

### Network Debugging

```bash
# With proxy and network debug
movian -d --proxy 127.0.0.1:8080 --libav-log
```

## Environment Variables

While not command-line options, these environment variables affect Movian:

- `HOME` - User home directory (affects default paths)
- `XDG_CONFIG_HOME` - Config directory (Linux)
- `XDG_CACHE_HOME` - Cache directory (Linux)
- `LANG` / `LC_ALL` - Locale settings

## See Also

- [Development Setup](development-setup.md) - IDE configuration with debug flags
- [Debugging Plugins](debugging-plugins.md) - Plugin development debugging
- [Debugging View Files](debugging-view-files.md) - UI debugging techniques
- [Architecture Overview](../architecture/overview.md) - Application startup flow
- [Application Lifecycle](../architecture/lifecycle.md) - Initialization sequence

## Source Code Reference

All command-line parsing is implemented in:
- **File**: `movian/src/main.c`
- **Function**: `parse_opts(int argc, char **argv)`
- **Lines**: ~470-700
- **Global Config**: `gconf_t gconf` structure in `src/main.h`

## Notes

1. **Order Matters**: Options are processed left-to-right
2. **Multiple Plugins**: Use `-p` multiple times to load multiple dev plugins
3. **Security**: Be careful with `--bypass-ecmascript-acl` - only for trusted code
4. **Platform Differences**: Some options may not be available on all platforms
5. **Debug Performance**: Debug flags (`-d`, `--debug-glw`) impact performance
