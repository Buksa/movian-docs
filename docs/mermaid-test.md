# Mermaid Diagram Test

This page tests Mermaid diagram rendering in the documentation.

## Architecture Flow

```mermaid
graph LR
    A[User Request] --> B[Plugin System]
    B --> C[ECMAScript Runtime]
    C --> D[Native APIs]
    D --> E[Media Backend]
    E --> F[GLW Renderer]
    F --> G[Display Output]
```

## Property System Flow

```mermaid
sequenceDiagram
    participant P as Plugin
    participant PS as Property System
    participant N as Native Code
    participant UI as UI Layer
    
    P->>PS: prop.subscribe()
    PS->>N: Register callback
    N->>PS: Value changed
    PS->>P: Trigger callback
    P->>UI: Update interface
```

## Component Hierarchy

```mermaid
classDiagram
    class PropertyNode {
        +string name
        +variant value
        +PropertyNode parent
        +PropertyNode[] children
        +subscribe()
        +set()
        +get()
    }
    
    class PropertyCallback {
        +function callback
        +PropertyNode node
        +execute()
    }
    
    PropertyNode ||--o{ PropertyCallback : triggers
    PropertyNode ||--o{ PropertyNode : contains
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : prop.subscribe()
    Loading --> Active : callback registered
    Active --> Updating : value changed
    Updating --> Active : callback executed
    Active --> Idle : prop.unsubscribe()
    Idle --> [*]
```

If you can see the diagrams above, Mermaid is working correctly!