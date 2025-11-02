# Component Interaction and Architecture

## Overview

Movian's architecture is built around a modular component system where different subsystems communicate through well-defined interfaces. The core architecture follows a layered approach with clear separation of concerns between the native C/C++ core, the JavaScript plugin runtime, and the UI rendering system.

## Core Component Architecture

```mermaid
graph TB
    A[Main Application] --> B[Property System]
    A --> C[Event System]
    A --> D[Navigator]
    A --> E[Service Manager]
    A --> F[Plugin System]
    A --> G[Media Engine]
    A --> H[GLW UI System]
    
    B --> I[Component Communication]
    C --> I
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    F --> J[ECMAScript Runtime]
    F --> K[Plugin Loader]
    H --> L[View Files]
    H --> M[Skin System]
    
    subgraph "Core Services"
        N[Backend System]
        O[File Access]
        P[Network Stack]
        Q[Database]
    end
    
    E --> N
    E --> O
    E --> P
    E --> Q
```

## Component Interaction Patterns

### 1. Property-Based Communication

The property system (`src/prop/prop.h`) serves as the primary communication mechanism between components:

**Key Features:**
- **Hierarchical Structure**: Properties form a tree structure with global root
- **Subscription Model**: Components can subscribe to property changes
- **Thread-Safe**: All property operations are thread-safe with mutex protection
- **Event-Driven**: Property changes trigger callbacks in subscribed components

**Communication Flow:**
```mermaid
sequenceDiagram
    participant A as Component A
    participant PS as Property System
    participant B as Component B
    
    A->>PS: prop_set("path.to.value", data)
    PS->>PS: Update property tree
    PS->>B: Callback notification
    B->>PS: prop_get("path.to.value")
    PS->>B: Return current value
```

**Example Usage:**
```c
// Component A sets a property
prop_set(nav->nav_prop_curpage, "url", PROP_SET_STRING, url);

// Component B subscribes to changes
prop_subscribe(0,
    PROP_TAG_CALLBACK_STRING, url_changed_callback, opaque,
    PROP_TAG_ROOT, nav->nav_prop_curpage,
    PROP_TAG_NAME("url"),
    NULL);
```

### 2. Event-Driven Architecture

The event system (`src/event.h`) handles user interactions and system events:

**Event Types:**
- **User Actions**: Navigation, playback control, UI interaction
- **System Events**: URL opening, page navigation, media events
- **Internal Events**: Component lifecycle, state changes

**Event Flow:**
```mermaid
graph LR
    A[User Input] --> B[Event Creation]
    B --> C[Event Dispatch]
    C --> D[Navigator]
    C --> E[Media Player]
    C --> F[Plugin System]
    C --> G[UI System]
    
    D --> H[Page Navigation]
    E --> I[Playback Control]
    F --> J[Plugin Events]
    G --> K[UI Updates]
```

### 3. Service Registration System

The service manager (`src/service.c`) provides a registry for content providers and system services:

**Service Architecture:**
```mermaid
graph TB
    A[Service Manager] --> B[Service Registry]
    B --> C[System Services]
    B --> D[Plugin Services]
    B --> E[Discovered Services]
    
    C --> F[Settings Service]
    C --> G[Plugin Manager Service]
    D --> H[Content Providers]
    D --> I[Search Providers]
    E --> J[Network Discovery]
    E --> K[UPnP/DLNA Services]
```

## Component Lifecycle Management

### 1. Application Startup Sequence

The main initialization follows a structured sequence in `main_init()`:

```mermaid
sequenceDiagram
    participant M as Main
    participant P as Property System
    participant S as Settings
    participant N as Navigator
    participant PS as Plugin System
    participant U as UI System
    
    M->>M: Initialize threading primitives
    M->>P: prop_init() - Initialize property tree
    M->>S: settings_init() - Load configuration
    M->>N: nav_init() - Initialize navigation
    M->>PS: plugins_init() - Load plugins
    M->>U: UI system initialization
    M->>M: Start background threads
```

**Initialization Groups:**
- **INIT_GROUP_NET**: Network subsystem initialization
- **INIT_GROUP_GRAPHICS**: Graphics and UI initialization  
- **INIT_GROUP_IPC**: Inter-process communication
- **INIT_GROUP_API**: External API initialization

### 2. Component Dependencies

Components have clear dependency relationships:

```mermaid
graph TB
    A[Threading Primitives] --> B[Property System]
    B --> C[Settings System]
    C --> D[Service Manager]
    D --> E[Navigator]
    E --> F[Plugin System]
    F --> G[UI System]
    
    B --> H[Event System]
    H --> E
    H --> F
    H --> G
```

## Inter-Component Communication Mechanisms

### 1. Navigator Component

The navigator (`src/navigator.c`) manages page lifecycle and navigation:

**Key Responsibilities:**
- Page creation and destruction
- Navigation history management
- URL routing and backend selection
- Bookmark management

**Communication Interfaces:**
```c
// Event-based navigation
static void nav_eventsink(void *opaque, event_t *e) {
    navigator_t *nav = opaque;
    if(event_is_action(e, ACTION_NAV_BACK)) {
        nav_back(nav);
    } else if(event_is_type(e, EVENT_OPENURL)) {
        // Handle URL opening
    }
}

// Property-based state updates
prop_set(nav->nav_prop_can_go_back, PROP_SET_INT, can_go_back);
```

### 2. Plugin System Integration

The plugin system (`src/plugins.c`) provides runtime extensibility:

**Plugin Communication:**
- **JavaScript API**: ECMAScript runtime for plugin execution
- **Property Binding**: Plugins can read/write properties
- **Event Handling**: Plugins receive and generate events
- **Service Registration**: Plugins can register as content providers

**Plugin Lifecycle:**
```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Loaded : plugin_load()
    Loaded --> Running : ECMAScript execution
    Running --> Unloading : plugin_unload()
    Unloading --> [*]
    
    Running --> Suspended : System pause
    Suspended --> Running : System resume
```

### 3. UI System Communication

The GLW UI system communicates through:

**View File Processing:**
- View files define UI structure and behavior
- Property bindings connect UI to application state
- Event handlers process user interactions

**UI Update Flow:**
```mermaid
sequenceDiagram
    participant A as Application Logic
    participant P as Property System
    participant U as UI System
    participant V as View Files
    
    A->>P: Update application state
    P->>U: Property change notification
    U->>V: Update UI elements
    V->>U: Render changes
```

## Memory Management and Resource Cleanup

### 1. Reference Counting

Components use reference counting for memory management:

```c
// Property reference management
prop_t *p = prop_ref_inc(property);  // Increment reference
// ... use property ...
prop_ref_dec(p);  // Decrement reference, cleanup if zero
```

### 2. Subscription Management

Property subscriptions are automatically cleaned up:

```c
// Subscription with automatic cleanup
prop_sub_t *sub = prop_subscribe(PROP_SUB_TRACK_DESTROY,
    PROP_TAG_CALLBACK, callback_func, opaque,
    PROP_TAG_ROOT, property,
    NULL);
// Subscription automatically cleaned up when property is destroyed
```

### 3. Component Shutdown

Shutdown follows reverse initialization order:

```mermaid
sequenceDiagram
    participant M as Main
    participant U as UI System
    participant PS as Plugin System
    participant N as Navigator
    participant P as Property System
    
    M->>U: UI shutdown
    M->>PS: Plugin unloading
    M->>N: Navigator cleanup
    M->>P: Property system cleanup
    M->>M: Threading cleanup
```

## Error Handling and Recovery

### 1. Component Isolation

Components are designed to fail gracefully:
- Plugin failures don't crash the main application
- UI errors are contained within view rendering
- Network failures are handled at the service level

### 2. State Recovery

The property system enables state recovery:
- Component state is stored in properties
- Failed components can be restarted with preserved state
- Settings and preferences persist across restarts

## Performance Considerations

### 1. Asynchronous Operations

Long-running operations use background threads:
- Plugin loading and execution
- Network operations
- File system access
- Media processing

### 2. Event Batching

The property system batches updates for efficiency:
- Multiple property changes are combined
- UI updates are coalesced to reduce rendering overhead
- Event processing is prioritized by importance

## Component Extension Points

### 1. Backend System

New content sources can be added through the backend interface:

```c
static backend_t my_backend = {
    .be_canhandle = my_canhandle,
    .be_open = my_open_url,
    .be_search = my_search,
};

BE_REGISTER(my_backend);
```

### 2. Service Providers

Components can register as service providers:

```c
service_t *service = service_create(
    "service_id",
    "Service Title", 
    "service://url",
    "service_type",
    "icon_url",
    probe_enabled,
    enabled,
    SVC_ORIGIN_SYSTEM
);
```

This architecture provides a flexible, extensible foundation that allows Movian to support diverse content sources, UI customizations, and platform-specific features while maintaining system stability and performance.