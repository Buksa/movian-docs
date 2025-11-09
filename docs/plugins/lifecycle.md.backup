# Plugin Lifecycle

## Overview

Understanding the plugin lifecycle is crucial for developing robust Movian plugins. This document details the complete lifecycle from plugin discovery through execution and cleanup, including state transitions, error handling, and resource management.

## Lifecycle Phases

### 1. Discovery Phase

The plugin manager discovers plugins through multiple sources:

#### Repository Scanning
```c
// From plugins.c - plugin_load_repo()
static int plugin_load_repo(void) {
    // Fetch plugin metadata from remote repository
    // Parse plugin list and create plugin entries
    // Update plugin availability status
}
```

#### Installed Plugin Scanning
```c
// From plugins.c - plugin_load_installed()
static void plugin_load_installed(void) {
    // Scan installedplugins directory
    // Load plugin.json from each ZIP file
    // Create plugin entries for installed plugins
}
```

#### Development Plugin Loading
```c
// From plugins.c - plugins_init()
void plugins_init(char **devplugs) {
    // Load development plugins from specified paths
    // Enable debug mode and bypass security restrictions
}
```

### 2. Installation Phase

When a user chooses to install a plugin:

#### Download Process
```c
// From plugins.c - plugin_install()
static int plugin_install(plugin_t *pl, const char *package) {
    // 1. Download plugin package from repository
    // 2. Validate ZIP file format
    // 3. Save to installedplugins directory
    // 4. Load and validate plugin.json
    // 5. Update plugin state
}
```

#### Validation Steps
1. **Package Integrity**: Verify ZIP file format and structure
2. **Manifest Validation**: Parse and validate plugin.json
3. **Compatibility Check**: Verify Movian version requirements
4. **Security Check**: Validate against blacklist
5. **Dependency Resolution**: Check for required components

### 3. Loading Phase

Plugin loading occurs during Movian startup or on-demand:

#### Context Creation
```c
// From ecmascript.c - es_context_create()
static es_context_t *es_context_create(const char *id, int flags,
                                       const char *url, const char *storage) {
    // 1. Create ECMAScript execution context
    // 2. Initialize memory management
    // 3. Set up security sandbox
    // 4. Configure debug settings
}
```

#### Environment Setup
```c
// From ecmascript.c - es_create_env()
static void es_create_env(es_context_t *ec, const char *loaddir, 
                          const char *storage) {
    // 1. Create global objects and APIs
    // 2. Set up module resolution system
    // 3. Configure plugin-specific paths
    // 4. Initialize core JavaScript modules
}
```

#### Code Compilation and Execution
```c
// From ecmascript.c - ecmascript_plugin_load()
int ecmascript_plugin_load(const char *id, const char *url,
                           char *errbuf, size_t errlen,
                           int version, const char *manifest, int flags) {
    // 1. Create plugin execution context
    // 2. Set up Plugin global object
    // 3. Load API compatibility layer (if needed)
    // 4. Compile and execute main plugin file
}
```

### 4. Execution Phase

During execution, plugins interact with Movian's systems:

#### Service Registration
Plugins typically register services during initialization:
```javascript
// Example plugin service registration
var service = require('movian/service');

service.create("My Video Service", "myservice:", {
    title: "My Video Service",
    icon: Plugin.path + "icon.png"
});
```

#### Resource Management
The ECMAScript runtime tracks plugin resources:
```c
// From ecmascript.c - es_resource_create()
void *es_resource_create(es_context_t *ec, const es_resource_class_t *erc,
                         int permanent) {
    // Create and link resource to plugin context
    // Track for automatic cleanup
}
```

### 5. Unloading Phase

Plugin unloading can occur due to:
- User uninstallation
- Plugin errors
- Movian shutdown
- Plugin reload during development

#### Resource Cleanup
```c
// From ecmascript.c - ecmascript_plugin_unload()
void ecmascript_plugin_unload(const char *id) {
    // 1. Find plugin context by ID
    // 2. Destroy all permanent resources
    // 3. Clean up volatile resources
    // 4. Release ECMAScript context
}
```

#### View Cleanup
```c
// From plugins.c - plugin_unload_views()
static void plugin_unload_views(plugin_t *pl) {
    // Remove all registered view components
    // Clean up UI integration points
}
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Discovered: Repository scan
    Discovered --> Downloading: User install
    Downloading --> Downloaded: Download complete
    Downloaded --> Installing: Validation passed
    Installing --> Installed: Installation success
    Installed --> Loading: Movian startup
    Loading --> Loaded: Context created
    Loaded --> Running: Code execution
    Running --> Suspended: Context suspend
    Suspended --> Running: Context resume
    Running --> Unloading: Plugin stop
    Unloading --> Installed: Cleanup complete
    Installed --> Removing: User uninstall
    Removing --> [*]: Removal complete
    
    Downloading --> Discovered: Download failed
    Installing --> Discovered: Install failed
    Loading --> Installed: Load failed
    Loaded --> Installed: Execution failed
```

## Error Handling

### Compilation Errors

When JavaScript compilation fails:
```c
// From ecmascript.c - es_load_and_compile()
static int es_load_and_compile(es_context_t *ec, const char *path, 
                               duk_context *ctx) {
    if(duk_pcompile(ctx, 0)) {
        TRACE(TRACE_ERROR, rstr_get(ec->ec_id), 
              "Unable to compile %s -- %s", path, 
              duk_safe_to_string(ctx, -1));
        return -1;
    }
}
```

### Runtime Errors

Runtime exceptions are caught and logged:
```c
// From ecmascript.c - es_dump_err_ex()
void es_dump_err_ex(duk_context *ctx, const char *native_func,
                    const char *native_file, int native_line) {
    // Extract error information
    // Log error with stack trace
    // Include native callsite information
}
```

### Recovery Mechanisms

1. **Graceful Degradation**: Core Movian functionality continues
2. **Error Reporting**: Detailed error messages for debugging
3. **Automatic Cleanup**: Resources automatically released on failure
4. **Retry Logic**: Failed plugins can be reloaded

## Memory Management

### Context Memory Tracking

Each plugin context tracks memory usage:
```c
// From ecmascript.c - es_mem_alloc()
static void *es_mem_alloc(void *udata, duk_size_t size) {
    es_context_t *ec = udata;
    void *p = malloc(size);
    if(p != NULL) {
        ec->ec_mem_active += arch_malloc_size(p);
        ec->ec_mem_peak = MAX(ec->ec_mem_peak, ec->ec_mem_active);
    }
    return p;
}
```

### Resource Lifecycle

Resources are categorized by lifecycle:

#### Permanent Resources
- Persist for the entire plugin lifetime
- Services, settings, persistent UI components
- Cleaned up only during plugin unload

#### Volatile Resources
- Temporary objects with shorter lifespans
- HTTP requests, temporary UI elements
- Automatically cleaned up during garbage collection

### Garbage Collection

The ECMAScript runtime performs periodic garbage collection:
```c
// From ecmascript.c - es_context_end()
void es_context_end(es_context_t *ec, int do_gc, duk_context *ctx) {
    if(do_gc)
        duk_gc(ec->ec_duk, 0);
    // Additional cleanup logic
}
```

## Threading Model

### Context Threading

Each plugin context can use multiple threads:
- **Main Thread**: Primary execution thread
- **Worker Threads**: Background processing
- **Suspended Threads**: Paused execution contexts

### Thread Safety

```c
// From ecmascript.c - es_context_begin()
duk_context *es_context_begin(es_context_t *ec) {
    atomic_inc(&ec->ec_refcount);
    hts_mutex_lock(&ec->ec_mutex);
    // Thread-safe context access
}
```

### Context Suspension

Plugins can suspend execution for asynchronous operations:
```c
// From ecmascript.c - es_context_suspend()
void es_context_suspend(es_context_t *ec, duk_context *ctx, 
                        duk_thread_state *state) {
    duk_suspend(ctx, state);
    hts_mutex_unlock(&ec->ec_mutex);
}
```

## Development Lifecycle

### Development Mode

Development plugins have special handling:
- **Hot Reload**: Automatic reloading on file changes
- **Enhanced Debugging**: Detailed execution traces
- **Relaxed Security**: Bypass certain restrictions

### Debug Features

```c
// Debug mode enables additional logging
if(ec->ec_debug) {
    es_debug(ec, "Module %s loaded from %s", id, path);
}
```

### Reload Mechanism

```c
// From plugins.c - plugins_reload_dev_plugin()
void plugins_reload_dev_plugin(void) {
    // Reload all development plugins
    // Preserve state where possible
    // Update UI to reflect changes
}
```

## Auto-Installation Lifecycle

### File Type Detection

Plugins can be automatically installed based on file magic:
```c
// From plugins.c - plugin_probe_for_autoinstall()
void plugin_probe_for_autoinstall(fa_handle_t *fh, const uint8_t *buf, 
                                  size_t len, const char *url) {
    // Check file magic against plugin triggers
    // Automatically install matching plugin
}
```

### URI Pattern Matching

Plugins can be triggered by URI patterns:
```c
// From plugins.c - plugin_check_prefix_for_autoinstall()
int plugin_check_prefix_for_autoinstall(const char *uri) {
    // Check URI against registered prefixes
    // Install plugin if pattern matches
}
```

## Performance Considerations

### Lazy Loading

Plugins are loaded on-demand to improve startup time:
- Repository plugins loaded when browsing
- Installed plugins loaded during startup
- Development plugins loaded immediately

### Context Reuse

ECMAScript contexts can be reused for efficiency:
- Thread contexts cached between executions
- Memory pools maintained for common operations
- Compilation results cached when possible

### Resource Optimization

- **Memory Limits**: Configurable per-plugin memory limits
- **Execution Timeouts**: Prevent runaway plugin execution
- **Resource Pooling**: Reuse common resources across plugins

## Best Practices

### Plugin Development

1. **Proper Initialization**: Handle all initialization errors gracefully
2. **Resource Cleanup**: Always clean up resources in error paths
3. **Error Handling**: Provide meaningful error messages
4. **Memory Efficiency**: Avoid memory leaks and excessive allocation

### Lifecycle Management

1. **State Tracking**: Maintain clear plugin state
2. **Dependency Management**: Handle missing dependencies gracefully
3. **Version Compatibility**: Test across Movian versions
4. **Performance Monitoring**: Monitor resource usage

### Debugging

1. **Enable Debug Mode**: Use debug flags during development
2. **Log Strategically**: Add logging at key lifecycle points
3. **Test Error Paths**: Verify error handling works correctly
4. **Monitor Resources**: Track memory and resource usage

This comprehensive lifecycle management ensures plugins integrate seamlessly with Movian while maintaining system stability and performance.