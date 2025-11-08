# Memory Management Patterns

This document describes the memory management patterns and practices used throughout the Movian codebase, including allocation strategies, ownership models, and resource cleanup mechanisms.

## Overview

Movian uses manual memory management in C with well-defined patterns for allocation, ownership, and deallocation. Understanding these patterns is essential for contributing to the core codebase and avoiding memory leaks or use-after-free bugs.

## Core Principles

### Memory Management Philosophy

1. **Explicit Ownership**: Every allocated resource has a clear owner responsible for deallocation
2. **Reference Counting**: Shared resources use reference counting for lifetime management
3. **RAII-like Patterns**: Resource acquisition and release are paired in predictable ways
4. **Pool Allocation**: Frequently allocated objects use memory pools for efficiency
5. **Leak Detection**: Debug builds include memory leak detection and tracking

### Allocation Strategies

**Stack Allocation**
- Used for temporary, short-lived data
- Automatic cleanup when function returns
- Preferred for small, fixed-size structures

**Heap Allocation**
- Used for long-lived or dynamically-sized data
- Requires explicit deallocation
- Managed through wrapper functions

**Pool Allocation**
- Used for frequently allocated/deallocated objects
- Reduces fragmentation and improves performance
- Common for UI widgets, events, and temporary buffers

## Memory Allocation Functions

### Standard Allocation

```c
// Basic allocation (never returns NULL, aborts on failure)
void *mymalloc(size_t size);
void *mycalloc(size_t nmemb, size_t size);
void *myrealloc(void *ptr, size_t size);

// String duplication
char *mystrdup(const char *str);

// Deallocation
void myfree(void *ptr);
```

**Usage Example**:
```c
// Allocate structure
my_struct_t *obj = mymalloc(sizeof(my_struct_t));

// Initialize
obj->field1 = value1;
obj->field2 = value2;

// Use object...

// Clean up
myfree(obj);
```

**Source Reference**: `src/misc/mystrdup.c`, `src/arch/*/malloc.c`

### Checked Allocation

```c
// Allocation with NULL return on failure
void *malloc_add(size_t a, size_t b);  // Allocates a+b bytes
void *malloc_mul(size_t a, size_t b);  // Allocates a*b bytes
```

**Purpose**: Prevents integer overflow in size calculations

**Usage Example**:
```c
// Safe array allocation
int *array = malloc_mul(count, sizeof(int));
if (array == NULL) {
    // Handle allocation failure
    return -1;
}
```

### String Allocation

```c
// Format string allocation
char *fmt(const char *format, ...);

// String building
typedef struct strbuf {
    char *buf;
    size_t size;
    size_t capacity;
} strbuf_t;

void strbuf_init(strbuf_t *sb);
void strbuf_append(strbuf_t *sb, const char *str);
void strbuf_appendf(strbuf_t *sb, const char *format, ...);
char *strbuf_get(strbuf_t *sb);  // Returns ownership
void strbuf_free(strbuf_t *sb);
```

**Usage Example**:
```c
strbuf_t sb;
strbuf_init(&sb);
strbuf_append(&sb, "Hello ");
strbuf_appendf(&sb, "world %d", 42);
char *result = strbuf_get(&sb);  // Takes ownership
// Use result...
myfree(result);
```

**Source Reference**: `src/misc/str.c`

## Reference Counting

### Reference Counted Objects

Many Movian objects use reference counting for shared ownership:

```c
typedef struct refcounted_object {
    atomic_t refcount;
    void (*destructor)(struct refcounted_object *);
    // Object data...
} refcounted_object_t;

// Increment reference count
void object_retain(refcounted_object_t *obj);

// Decrement reference count, destroy if zero
void object_release(refcounted_object_t *obj);
```

**Usage Pattern**:
```c
// Create object (refcount = 1)
refcounted_object_t *obj = create_object();

// Share with another component
object_retain(obj);
pass_to_component(obj);

// Release when done
object_release(obj);  // Refcount = 1

// Component releases when done
object_release(obj);  // Refcount = 0, object destroyed
```

### Common Reference Counted Types

**Property Trees (`prop_t`)**
```c
prop_t *prop = prop_create_root(NULL);
prop_ref_inc(prop);  // Increment reference
// Use property...
prop_ref_dec(prop);  // Decrement reference
```

**Source Reference**: `src/prop/prop.c`

**Media Buffers**
```c
media_buf_t *mb = media_buf_alloc();
media_buf_ref_inc(mb);
// Use buffer...
media_buf_ref_dec(mb);
```

**Source Reference**: `src/media/media_buf.c`

**Events**
```c
event_t *e = event_create_action(ACTION_ACTIVATE);
event_ref_inc(e);
// Use event...
event_ref_dec(e);
```

**Source Reference**: `src/event.c`

## Ownership Models

### Single Owner

**Pattern**: One component owns the object and is responsible for deallocation

```c
typedef struct component {
    char *name;           // Owned by component
    int *data;           // Owned by component
} component_t;

component_t *component_create(const char *name) {
    component_t *c = mymalloc(sizeof(component_t));
    c->name = mystrdup(name);  // Component owns copy
    c->data = mymalloc(sizeof(int) * 100);
    return c;
}

void component_destroy(component_t *c) {
    myfree(c->name);      // Free owned string
    myfree(c->data);      // Free owned array
    myfree(c);            // Free structure
}
```

### Shared Ownership

**Pattern**: Multiple components share ownership via reference counting

```c
typedef struct shared_resource {
    atomic_t refcount;
    char *data;
} shared_resource_t;

shared_resource_t *resource_create(void) {
    shared_resource_t *r = mymalloc(sizeof(shared_resource_t));
    atomic_set(&r->refcount, 1);
    r->data = mymalloc(1024);
    return r;
}

void resource_retain(shared_resource_t *r) {
    atomic_inc(&r->refcount);
}

void resource_release(shared_resource_t *r) {
    if (atomic_dec(&r->refcount) == 1) {
        myfree(r->data);
        myfree(r);
    }
}
```

### Borrowed References

**Pattern**: Component uses object without owning it

```c
void process_data(const component_t *c) {
    // c is borrowed, don't free it
    printf("Processing: %s\n", c->name);
    // No cleanup needed
}

void caller(void) {
    component_t *c = component_create("test");
    process_data(c);  // Borrow reference
    component_destroy(c);  // Caller still owns it
}
```

## Memory Pools

### Pool Allocation

Movian uses memory pools for frequently allocated objects:

```c
typedef struct mempool {
    void *free_list;
    size_t object_size;
    size_t objects_per_chunk;
} mempool_t;

// Create pool
mempool_t *pool = mempool_create(sizeof(my_object_t), 64);

// Allocate from pool
my_object_t *obj = mempool_alloc(pool);

// Return to pool
mempool_free(pool, obj);

// Destroy pool (frees all objects)
mempool_destroy(pool);
```

**Source Reference**: `src/misc/pool.c`

### Common Pools

**Event Pool**
```c
// Events are pooled for performance
event_t *e = event_create_action(ACTION_ACTIVATE);
// Event automatically returned to pool when refcount reaches 0
```

**GLW Widget Pool**
```c
// UI widgets use pooled allocation
glw_t *w = glw_create(root, &glw_container_x, NULL);
// Widget returned to pool on destruction
```

## Resource Management Patterns

### RAII-like Cleanup

**Pattern**: Pair resource acquisition with cleanup using scope

```c
void function(void) {
    // Acquire resources
    char *buffer = mymalloc(1024);
    FILE *file = fopen("data.txt", "r");
    
    // Use resources...
    if (error_condition) {
        goto cleanup;  // Jump to cleanup on error
    }
    
    // Normal processing...
    
cleanup:
    // Release resources
    if (file) fclose(file);
    myfree(buffer);
}
```

### Cleanup Callbacks

**Pattern**: Register cleanup function for automatic resource release

```c
typedef struct resource_manager {
    void **resources;
    void (**cleanup_funcs)(void *);
    int count;
} resource_manager_t;

void register_cleanup(resource_manager_t *rm, void *resource, 
                     void (*cleanup)(void *)) {
    rm->resources[rm->count] = resource;
    rm->cleanup_funcs[rm->count] = cleanup;
    rm->count++;
}

void cleanup_all(resource_manager_t *rm) {
    for (int i = 0; i < rm->count; i++) {
        rm->cleanup_funcs[i](rm->resources[i]);
    }
}
```

### Destructor Pattern

**Pattern**: Objects have destructor function for cleanup

```c
typedef struct object {
    void (*destroy)(struct object *);
    // Object data...
} object_t;

void object_destroy(object_t *obj) {
    if (obj->destroy) {
        obj->destroy(obj);  // Call virtual destructor
    }
    myfree(obj);
}
```

## Thread Safety

### Atomic Operations

```c
#include "arch/atomic.h"

// Atomic integer operations
atomic_t counter;
atomic_set(&counter, 0);
atomic_inc(&counter);
atomic_dec(&counter);
int value = atomic_get(&counter);
```

**Source Reference**: `src/arch/atomic.h`

### Lock-Protected Allocation

```c
typedef struct protected_allocator {
    hts_mutex_t mutex;
    void *free_list;
} protected_allocator_t;

void *protected_alloc(protected_allocator_t *pa) {
    hts_mutex_lock(&pa->mutex);
    void *ptr = allocate_from_free_list(pa);
    hts_mutex_unlock(&pa->mutex);
    return ptr;
}
```

**Source Reference**: `src/arch/threads.h`

## Memory Debugging

### Debug Builds

Debug builds include memory tracking:

```c
#ifdef DEBUG_MEMORY
// Track all allocations
void *debug_malloc(size_t size, const char *file, int line);
void debug_free(void *ptr, const char *file, int line);

#define mymalloc(size) debug_malloc(size, __FILE__, __LINE__)
#define myfree(ptr) debug_free(ptr, __FILE__, __LINE__)
#endif
```

### Leak Detection

```c
// Enable memory leak detection
void mem_debug_init(void);

// Dump memory leaks on exit
void mem_debug_dump_leaks(void);
```

**Usage**:
```bash
# Run with memory debugging
./movian --debug-memory

# Check for leaks on exit
# Leaks are printed to stderr
```

### Valgrind Integration

```bash
# Run under Valgrind
valgrind --leak-check=full --show-leak-kinds=all ./movian

# Suppress known false positives
valgrind --suppressions=movian.supp ./movian
```

## Common Patterns

### String Handling

```c
// Always duplicate strings when storing
typedef struct config {
    char *name;  // Owned copy
} config_t;

config_t *config_create(const char *name) {
    config_t *c = mymalloc(sizeof(config_t));
    c->name = mystrdup(name);  // Make owned copy
    return c;
}

void config_destroy(config_t *c) {
    myfree(c->name);  // Free owned string
    myfree(c);
}
```

### Array Management

```c
// Dynamic array with capacity tracking
typedef struct dynamic_array {
    void **items;
    int count;
    int capacity;
} dynamic_array_t;

void array_add(dynamic_array_t *arr, void *item) {
    if (arr->count >= arr->capacity) {
        arr->capacity = arr->capacity ? arr->capacity * 2 : 16;
        arr->items = myrealloc(arr->items, 
                              arr->capacity * sizeof(void *));
    }
    arr->items[arr->count++] = item;
}

void array_destroy(dynamic_array_t *arr) {
    myfree(arr->items);
    arr->items = NULL;
    arr->count = arr->capacity = 0;
}
```

### Circular Buffers

```c
typedef struct circular_buffer {
    void **items;
    int capacity;
    int read_pos;
    int write_pos;
} circular_buffer_t;

circular_buffer_t *cbuf_create(int capacity) {
    circular_buffer_t *cb = mymalloc(sizeof(circular_buffer_t));
    cb->items = mycalloc(capacity, sizeof(void *));
    cb->capacity = capacity;
    cb->read_pos = cb->write_pos = 0;
    return cb;
}

void cbuf_destroy(circular_buffer_t *cb) {
    myfree(cb->items);
    myfree(cb);
}
```

## Best Practices

### Do's

✅ **Always check allocation results** (for checked allocators)
```c
void *ptr = malloc_add(size1, size2);
if (ptr == NULL) {
    return ERROR_OUT_OF_MEMORY;
}
```

✅ **Initialize allocated memory**
```c
my_struct_t *obj = mycalloc(1, sizeof(my_struct_t));
// Or explicitly:
my_struct_t *obj = mymalloc(sizeof(my_struct_t));
memset(obj, 0, sizeof(my_struct_t));
```

✅ **Use reference counting for shared resources**
```c
prop_ref_inc(prop);  // Share ownership
// Use property...
prop_ref_dec(prop);  // Release ownership
```

✅ **Pair allocations with deallocations**
```c
void *ptr = mymalloc(size);
// Use ptr...
myfree(ptr);
```

✅ **NULL-check before freeing** (defensive programming)
```c
if (ptr != NULL) {
    myfree(ptr);
    ptr = NULL;  // Prevent double-free
}
```

### Don'ts

❌ **Don't mix allocation methods**
```c
// WRONG: malloc/free mismatch
void *ptr = mymalloc(size);
free(ptr);  // Should use myfree()
```

❌ **Don't leak on error paths**
```c
// WRONG: Leaks buffer on error
char *buffer = mymalloc(1024);
if (error) {
    return -1;  // Leaked buffer!
}
myfree(buffer);
```

❌ **Don't use after free**
```c
// WRONG: Use after free
myfree(ptr);
ptr->field = value;  // Undefined behavior!
```

❌ **Don't double-free**
```c
// WRONG: Double free
myfree(ptr);
myfree(ptr);  // Crash or corruption!
```

❌ **Don't forget to update reference counts**
```c
// WRONG: Missing ref_inc
prop_t *prop = get_property();
store_property(prop);  // Should call prop_ref_inc() first
```

## Performance Considerations

### Allocation Overhead

- **Stack allocation**: Fastest, no overhead
- **Pool allocation**: Fast, minimal overhead
- **Heap allocation**: Slower, fragmentation risk
- **Reference counting**: Atomic operations overhead

### Optimization Strategies

**Batch Allocations**
```c
// Allocate array of structures at once
my_struct_t *array = mycalloc(count, sizeof(my_struct_t));
// Better than count separate allocations
```

**Reuse Buffers**
```c
// Reuse buffer instead of reallocating
static char buffer[1024];
// Use buffer for temporary data
```

**Pool for Hot Paths**
```c
// Use pools for frequently allocated objects
static mempool_t *event_pool = NULL;
if (!event_pool) {
    event_pool = mempool_create(sizeof(event_t), 128);
}
event_t *e = mempool_alloc(event_pool);
```

## See Also

- [Threading Model](threading-model.md) - Thread safety and synchronization
- [Architecture Overview](overview.md) - System architecture
- [Component Interaction](components.md) - Component relationships
- [Memory Management Implementation](memory-management.md) - Low-level details
