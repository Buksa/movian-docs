# Technical Glossary

This glossary defines all technical terms used throughout the Movian documentation. Terms are organized alphabetically with cross-references to related concepts and source code locations where applicable.

## A

### API (Application Programming Interface)
A set of functions, protocols, and tools that allow different software components to communicate. In Movian, this primarily refers to the JavaScript APIs available to plugins for accessing native functionality.

**Related Terms**: [ECMAScript Runtime](#ecmascript-runtime), [Plugin System](#plugin-system)  
**Documentation**: [Plugin API Reference](../plugins/api/)

### Architecture Layer
Platform-specific code abstraction layer located in `src/arch/` that provides consistent interfaces for threading, file system access, and other OS-specific functionality across different platforms.

**Source Location**: `movian/src/arch/`  
**Related Terms**: [Threading Model](#threading-model), [Platform Abstraction](#platform-abstraction)

### Atomic Operations
Thread-safe operations that complete without interruption, used in Movian for reference counting and other concurrent data access patterns.

**Related Terms**: [Threading Model](#threading-model), [Reference Counting](#reference-counting)

## B

### Backend System
Pluggable content handler architecture that provides support for different media sources, protocols, and file formats. Each backend handles specific URL schemes or content types.

**Source Location**: `movian/src/backend/`  
**Related Terms**: [Media Pipeline](#media-pipeline), [Service Registry](#service-registry)  
**Documentation**: [Media System](../media/)

### Bitstream
A sequence of binary data representing encoded audio or video content. Movian includes bitstream parsing utilities for various media formats.

**Related Terms**: [Codec](#codec), [Media Pipeline](#media-pipeline)

## C

### Codec
Software component that encodes or decodes digital media streams. Movian supports numerous audio and video codecs through its media pipeline architecture.

**Related Terms**: [Backend System](#backend-system), [Media Pipeline](#media-pipeline)  
**Documentation**: [Codec Support](../media/codecs.md)

### Component
A modular part of Movian's architecture that provides specific functionality. Components communicate through the property system and event system.

**Related Terms**: [Property System](#property-system), [Event System](#event-system)  
**Documentation**: [Component Interaction](../architecture/components.md)

### Condition Variable
Synchronization primitive used for thread coordination. Movian uses condition variables (`hts_cond_t`) for signaling between threads.

**Source Type**: `hts_cond_t`  
**Related Terms**: [Threading Model](#threading-model), [Mutex](#mutex)

### Courier (Property)
Thread-specific mechanism for handling property updates and callbacks in a thread-safe manner. Different courier types handle various threading scenarios.

**Source Types**: `prop_courier_t`  
**Related Terms**: [Property System](#property-system), [Threading Model](#threading-model)

## D

### Demuxer
Component that separates multiplexed media streams into individual audio, video, and subtitle tracks for processing.

**Related Terms**: [Media Pipeline](#media-pipeline), [Codec](#codec)

## E

### ECMAScript Runtime
JavaScript execution environment that runs plugin code. Provides sandboxed access to native Movian functionality through JavaScript APIs.

**Source Location**: `movian/src/ecmascript/`  
**Related Terms**: [Plugin System](#plugin-system), [API](#api-application-programming-interface)  
**Documentation**: [Plugin Development](../plugins/)

### Event System
Message-passing mechanism for handling user interactions, system events, and component communication. Events are dispatched through a central event system.

**Source Location**: `movian/src/event.h`  
**Related Terms**: [Component](#component), [Navigator](#navigator)  
**Documentation**: [Component Interaction](../architecture/components.md)

### Expression System
Dynamic value evaluation system used in view files for data binding, conditional logic, and computed values. Supports variables, functions, and operators.

**Source Location**: `movian/src/ui/glw/glw_view_eval.c`  
**Related Terms**: [View Files](#view-files), [GLW](#glw-opengl-widget)  
**Documentation**: [Expression System](../ui/view-files/expressions.md)

## F

### Frame
A single image in a video sequence or a complete audio sample block. Movian's media pipeline processes frames through various stages.

**Related Terms**: [Media Pipeline](#media-pipeline), [Video Decoder](#video-decoder)

## G

### GLW (OpenGL Widget)
Movian's custom UI rendering engine built on OpenGL. Provides a widget-based system for creating responsive, hardware-accelerated user interfaces.

**Source Location**: `movian/src/ui/glw/`  
**Related Terms**: [View Files](#view-files), [Skin System](#skin-system), [Widget](#widget)  
**Documentation**: [GLW Architecture](../ui/glw-architecture.md)

### GLW Class
Object-oriented structure defining widget behavior in the GLW system. Each widget type has an associated GLW class with methods for rendering, layout, and event handling.

**Source Type**: `glw_class_t`  
**Related Terms**: [Widget](#widget), [GLW](#glw-opengl-widget)

### GLW Context (Render Context)
Rendering state information passed to widgets during layout and rendering operations, including transformation matrices, clipping regions, and alpha values.

**Source Type**: `glw_rctx`  
**Related Terms**: [GLW](#glw-opengl-widget), [Widget](#widget)

## H

### HTTP Client
Built-in networking component that provides HTTP/HTTPS request capabilities to plugins and core components. Includes support for cookies, authentication, and SSL.

**Source Location**: `movian/src/networking/`  
**Related Terms**: [Plugin System](#plugin-system), [Backend System](#backend-system)  
**Documentation**: [HTTP API](../plugins/api/http-api.md)

## I

### Initialization Group
Categorized initialization phases during application startup that ensure components are initialized in proper dependency order.

**Constants**: `INIT_GROUP_NET`, `INIT_GROUP_GRAPHICS`, `INIT_GROUP_IPC`, `INIT_GROUP_API`  
**Related Terms**: [Component](#component), [Lifecycle](#lifecycle)  
**Documentation**: [Application Lifecycle](../architecture/lifecycle.md)

## L

### Lexer
Component that breaks view file source code into tokens for parsing. The GLW lexer handles keywords, operators, strings, and other language elements.

**Source Location**: `movian/src/ui/glw/glw_view_lexer.c`  
**Related Terms**: [Parser](#parser), [View Files](#view-files)  
**Documentation**: [Lexer Analysis](../ui/source-analysis/glw_view_lexer.c.md)

### Lifecycle
The sequence of states a component goes through from creation to destruction. Includes initialization, running, and cleanup phases.

**Related Terms**: [Component](#component), [Plugin System](#plugin-system)  
**Documentation**: [Application Lifecycle](../architecture/lifecycle.md)

## M

### Manifest (Plugin)
JSON configuration file (`plugin.json`) that defines plugin metadata, capabilities, dependencies, and entry points.

**Related Terms**: [Plugin System](#plugin-system)  
**Documentation**: [Manifest Reference](../plugins/manifest-reference.md)

### Media Pipeline
Architecture for processing audio and video content through a series of stages including demuxing, decoding, filtering, and output.

**Source Location**: `movian/src/media/`  
**Related Terms**: [Backend System](#backend-system), [Codec](#codec)  
**Documentation**: [Pipeline Architecture](../media/pipeline-architecture.md)

### Mutex
Mutual exclusion synchronization primitive used to protect shared data structures from concurrent access. Movian uses `hts_mutex_t` for thread safety.

**Source Type**: `hts_mutex_t`  
**Related Terms**: [Threading Model](#threading-model), [Condition Variable](#condition-variable)

## N

### Navigator
Core component responsible for page lifecycle management, navigation history, URL routing, and backend selection for content loading.

**Source Location**: `movian/src/navigator.c`  
**Related Terms**: [Page System](#page-system), [Backend System](#backend-system)  
**Documentation**: [Component Interaction](../architecture/components.md)

## O

### OpenGL
Graphics API used by the GLW system for hardware-accelerated rendering of user interface elements.

**Related Terms**: [GLW](#glw-opengl-widget), [Widget](#widget)

## P

### Page System
Framework for managing application screens and content views. Pages represent different areas of the application interface and are managed by the Navigator.

**Related Terms**: [Navigator](#navigator), [View Files](#view-files)  
**Documentation**: [Page API](../plugins/api/page-api.md)

### Parser
Component that analyzes view file syntax and builds internal representations of UI elements and their relationships.

**Source Location**: `movian/src/ui/glw/glw_view_parser.c`  
**Related Terms**: [Lexer](#lexer), [View Files](#view-files)  
**Documentation**: [Parser Analysis](../ui/source-analysis/glw_view_parser.c.md)

### Platform Abstraction
Layer that provides consistent interfaces across different operating systems and hardware platforms, hiding platform-specific implementation details.

**Related Terms**: [Architecture Layer](#architecture-layer)

### Plugin System
Architecture that allows third-party JavaScript code to extend Movian functionality by providing content sources, user interfaces, and other features.

**Source Location**: `movian/src/plugins.c`  
**Related Terms**: [ECMAScript Runtime](#ecmascript-runtime), [Manifest](#manifest-plugin)  
**Documentation**: [Plugin Development](../plugins/)

### Preprocessor (View File)
Component that processes view files before parsing, handling include directives, conditional compilation, and macro expansion.

**Source Location**: `movian/src/ui/glw/glw_view_preproc.c`  
**Related Terms**: [View Files](#view-files), [Parser](#parser)  
**Documentation**: [Preprocessor](../ui/view-files/preprocessor.md)

### Property System
Hierarchical data model that serves as the primary communication mechanism between components. Provides thread-safe access to application state with event notifications.

**Source Location**: `movian/src/prop/`  
**Related Terms**: [Component](#component), [Threading Model](#threading-model)  
**Documentation**: [Component Interaction](../architecture/components.md)

### Property Tree
Hierarchical structure of properties that represents application state. Properties are organized in a tree with parent-child relationships.

**Related Terms**: [Property System](#property-system)

## R

### Reference Counting
Memory management technique where objects track the number of references to them and are automatically cleaned up when the count reaches zero.

**Related Terms**: [Property System](#property-system), [Threading Model](#threading-model)

### Render Context
See [GLW Context](#glw-context-render-context)

## S

### Sandboxing
Security mechanism that restricts plugin access to system resources, providing controlled access to native functionality through defined APIs.

**Related Terms**: [Plugin System](#plugin-system), [ECMAScript Runtime](#ecmascript-runtime)

### Service Registry
Central registry where components can register services and discover available functionality. Manages service lifecycle and status monitoring.

**Source Location**: `movian/src/service.c`  
**Related Terms**: [Component](#component), [Backend System](#backend-system)  
**Documentation**: [Component Interaction](../architecture/components.md)

### Skin System
Theming architecture that allows complete customization of the user interface through view files, stylesheets, and resource files.

**Source Location**: `movian/glwskins/`  
**Related Terms**: [View Files](#view-files), [Theme](#theme)  
**Documentation**: [Theming System](../ui/theming/)

### SQLite
Embedded database engine used for persistent storage of plugin data, settings, and application state.

**Related Terms**: [Storage API](#storage-api)  
**Documentation**: [SQLite API](../plugins/api/sqlite-api.md)

### Storage API
JavaScript API that provides plugins with access to persistent data storage, including key-value stores and SQLite databases.

**Related Terms**: [SQLite](#sqlite), [Plugin System](#plugin-system)  
**Documentation**: [Storage API](../plugins/api/storage-api.md)

## T

### Theme
Collection of visual styling definitions, resources, and configuration that determines the appearance and behavior of the user interface.

**Related Terms**: [Skin System](#skin-system), [View Files](#view-files)  
**Documentation**: [Theme Variables](../ui/theming/theme-variables.md)

### Threading Model
Concurrency architecture that defines how Movian uses multiple threads for responsive user interfaces, background processing, and media handling.

**Related Terms**: [Mutex](#mutex), [Condition Variable](#condition-variable)  
**Documentation**: [Threading Model](../architecture/threading.md)

### Thread Priority
Scheduling priority assigned to threads to ensure critical operations (like audio/video processing) receive appropriate system resources.

**Constants**: `THREAD_PRIO_AUDIO`, `THREAD_PRIO_VIDEO`, `THREAD_PRIO_UI_WORKER_HIGH`, etc.  
**Related Terms**: [Threading Model](#threading-model)

## U

### UI System
User interface architecture built on the GLW rendering engine, providing widgets, layout management, and event handling for creating interactive interfaces.

**Related Terms**: [GLW](#glw-opengl-widget), [View Files](#view-files)  
**Documentation**: [UI System & Theming](../ui/)

## V

### Video Decoder
Component responsible for decoding compressed video streams into displayable frames. Supports hardware acceleration where available.

**Source Location**: `movian/src/video/video_decoder.h`  
**Related Terms**: [Codec](#codec), [Media Pipeline](#media-pipeline)

### View Files
XML-like files with `.view` extension that define user interface layouts, styling, and behavior using the GLW widget system.

**Related Terms**: [GLW](#glw-opengl-widget), [Skin System](#skin-system), [Widget](#widget)  
**Documentation**: [View Files](../ui/view-files/)

### View Loader
Component responsible for loading view files from the filesystem, resolving includes, and managing the view file compilation process.

**Source Location**: `movian/src/ui/glw/glw_view_loader.c`  
**Related Terms**: [View Files](#view-files), [Preprocessor](#preprocessor-view-file)

## W

### Widget
Individual UI element in the GLW system, such as containers, text labels, images, or interactive controls. Each widget type has specific properties and behaviors.

**Related Terms**: [GLW](#glw-opengl-widget), [View Files](#view-files)  
**Documentation**: [Widget Reference](../ui/widgets/)

## Cross-Reference Index

### By Source Location
- **`movian/src/arch/`**: [Architecture Layer](#architecture-layer)
- **`movian/src/backend/`**: [Backend System](#backend-system)
- **`movian/src/ecmascript/`**: [ECMAScript Runtime](#ecmascript-runtime)
- **`movian/src/media/`**: [Media Pipeline](#media-pipeline)
- **`movian/src/navigator.c`**: [Navigator](#navigator)
- **`movian/src/plugins.c`**: [Plugin System](#plugin-system)
- **`movian/src/prop/`**: [Property System](#property-system)
- **`movian/src/service.c`**: [Service Registry](#service-registry)
- **`movian/src/ui/glw/`**: [GLW](#glw-opengl-widget)
- **`movian/glwskins/`**: [Skin System](#skin-system)

### By Category

#### **Core Architecture**
- [Component](#component)
- [Property System](#property-system)
- [Event System](#event-system)
- [Threading Model](#threading-model)
- [Service Registry](#service-registry)

#### **Plugin Development**
- [Plugin System](#plugin-system)
- [ECMAScript Runtime](#ecmascript-runtime)
- [API](#api-application-programming-interface)
- [Manifest](#manifest-plugin)
- [Sandboxing](#sandboxing)

#### **User Interface**
- [GLW](#glw-opengl-widget)
- [View Files](#view-files)
- [Widget](#widget)
- [Skin System](#skin-system)
- [Theme](#theme)

#### **Media Processing**
- [Media Pipeline](#media-pipeline)
- [Backend System](#backend-system)
- [Codec](#codec)
- [Video Decoder](#video-decoder)

#### **System Integration**
- [Architecture Layer](#architecture-layer)
- [Platform Abstraction](#platform-abstraction)
- [HTTP Client](#http-client)
- [SQLite](#sqlite)

---

**Glossary Version**: 1.0.0  
**Last Updated**: November 2025  
**Movian Version Compatibility**: 4.8+  
**Accuracy Status**: 🟢 Verified from source code analysis

*This glossary is maintained alongside the Movian documentation and updated with each release. Terms marked with source locations reference specific files in the Movian codebase for detailed implementation information.*