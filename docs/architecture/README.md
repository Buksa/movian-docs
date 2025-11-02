# Movian Architecture

This section covers Movian's core architecture and system design.

## Contents

- [System Overview](overview.md) - High-level architecture and [components](../reference/glossary.md#component)
- [Component Interaction](components.md) - How major systems communicate
- [Application Lifecycle](lifecycle.md) - Startup, initialization, and shutdown
- [Threading Model](threading-model.md) - Thread management and synchronization
- [Memory Management](memory-management.md) - Resource allocation patterns

## Architecture Diagrams

The architecture documentation includes comprehensive diagrams showing:
- System [component](../reference/glossary.md#component) relationships
- Data flow between subsystems
- Plugin integration points
- UI rendering pipeline

## Source References

Key files for understanding Movian's architecture:
- `src/main.c` - Application entry point
- `src/navigator.c` - Navigation and page management
- `src/service.c` - Service registration system
- `src/plugins.c` - Plugin loading and [lifecycle](../reference/glossary.md#lifecycle)