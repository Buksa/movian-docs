# Memory Management Implementation

This document provides detailed implementation information about Movian's memory management system, including low-level allocation mechanisms, platform-specific implementations, and advanced memory management techniques.

## Overview

This document complements [Memory Management Patterns](memory.md) by focusing on implementation details, platform-specific code, and advanced topics. For general memory management patterns and best practices, see the [Memory Management Patterns](memory.md) document.

## Platform-Specific Implementations

### POSIX Platforms (Linux, macOS)

**Standard Allocation**:
```c
// src/arch/posix/posix_malloc.c

void *mymalloc(size_t size) {
    void *ptr = malloc(size);
    if (ptr == NULL) {
        fprintf(stderr, "Out of memory: failed to allocate %zu bytes\n", size);
        abort();  // Fatal error
    }
    return ptr;
}

void *mycalloc(size_t nmemb, size_t size) {
    void *ptr = calloc(nmemb, size);
    if (ptr == NULL) {
        fprintf(stderr, "Out of memory: failed to allocate %zu bytes\n", 
                nmemb * size);
        abort();
    }
    return ptr;
}

void *myrealloc(void *ptr, size_t size) {
    void *new_ptr = realloc(ptr, size);
    if (new_ptr == NULL && size != 0) {
        fprintf(stderr, "Out of memory: failed to reallocate to %zu bytes\n", 
                size);
        abort();
    }
    return new_ptr;
}

void myfree(void *ptr) {
    free(ptr);
}
```

**Memory Alignment**:
```c
// Allocate aligned memory
void *mymemalign(size_t alignment, size_t size) {
    void *ptr;
    if (posix_memalign(&ptr, alignment, size) != 0) {
        fprintf(stderr, "Failed to allocate %zu bytes with alignment %zu\n",
                size, alignment);
        abort();
    }
    return ptr;
}
```

**Source Reference**: `src/arch/posix/posix_malloc.c`

### Windows Platform

**Windows Allocation**:
```c
// src/arch/win32/win32_malloc.c

void *mymalloc(size_t size) {
    void *ptr = HeapAlloc(GetProcessHeap(), 0, size);
    if (ptr == NULL) {
        fprintf(stderr, "Out of memory: failed to allocate %zu bytes\n", size);
        abort();
    }
    return ptr;
}

void *mycalloc(size_t nmemb, size_t size) {
    size_t total = nmemb * size;
    void *ptr = HeapAlloc(GetProcessHeap(), HEAP_ZERO_MEMORY, total);
    if (ptr == NULL) {
        fprintf(stderr, "Out of memory: failed to allocate %zu bytes\n", total);
        abort();
    }
    return ptr;
}

void myfree(void *ptr) {
    if (ptr != NULL) {
        HeapFree(GetProcessHeap(), 0, ptr);
    }
}
```

**Source Reference**: `src/arch/win32/win32_malloc.c`

### Embedded Platforms (PS3, Android)

**Custom Allocator**:
```c
// src/arch/ps3/ps3_malloc.c

// PS3 uses custom memory regions
#define MAIN_MEMORY_SIZE (256 * 1024 * 1024)  // 256 MB

static void *memory_pool = NULL;
static size_t memory_used = 0;

void memory_init(void) {
    memory_pool = sys_memory_allocate(MAIN_MEMORY_SIZE, 
                                     SYS_MEMORY_PAGE_SIZE_1M);
    if (memory_pool == NULL) {
        fprintf(stderr, "Failed to allocate main memory pool\n");
        abort();
    }
}

void *mymalloc(size_t size) {
    // Custom allocation from pool
    // Implementation details...
}
```

**Source Reference**: `src/arch/ps3/ps3_malloc.c`

## Memory Pool Implementation

### Pool Structure

```c
// src/misc/pool.c

typedef struct mempool_chunk {
    struct mempool_chunk *next;
    void *memory;
} mempool_chunk_t;

typedef struct mempool {
    size_t object_size;
    size_t objects_per_chunk;
    size_t alignment;
    
    hts_mutex_t mutex;
    void *free_list;
    mempool_chunk_t *chunks;
    
    // Statistics
    atomic_t num_allocations;
    atomic_t num_frees;
    atomic_t peak_usage;
} mempool_t;
```

### Pool Operations

**Pool Creation**:
```c
mempool_t *mempool_create(size_t object_size, size_t objects_per_chunk) {
    mempool_t *pool = mymalloc(sizeof(mempool_t));
    
    // Align object size to cache line
    pool->object_size = (object_size + 63) & ~63;
    pool->objects_per_chunk = objects_per_chunk;
    pool->alignment = 64;  // Cache line size
    
    hts_mutex_init(&pool->mutex);
    pool->free_list = NULL;
    pool->chunks = NULL;
    
    atomic_set(&pool->num_allocations, 0);
    atomic_set(&pool->num_frees, 0);
    atomic_set(&pool->peak_usage, 0);
    
    return pool;
}
```

**Chunk Allocation**:
```c
static void mempool_add_chunk(mempool_t *pool) {
    size_t chunk_size = pool->object_size * pool->objects_per_chunk;
    
    // Allocate chunk
    mempool_chunk_t *chunk = mymalloc(sizeof(mempool_chunk_t));
    chunk->memory = mymemalign(pool->alignment, chunk_size);
    
    // Add to chunk list
    chunk->next = pool->chunks;
    pool->chunks = chunk;
    
    // Initialize free list
    char *ptr = chunk->memory;
    for (size_t i = 0; i < pool->objects_per_chunk; i++) {
        void **free_node = (void **)ptr;
        *free_node = pool->free_list;
        pool->free_list = free_node;
        ptr += pool->object_size;
    }
}
```

**Object Allocation**:
```c
void *mempool_alloc(mempool_t *pool) {
    hts_mutex_lock(&pool->mutex);
    
    // Allocate new chunk if needed
    if (pool->free_list == NULL) {
        mempool_add_chunk(pool);
    }
    
    // Get object from free list
    void **free_node = pool->free_list;
    pool->free_list = *free_node;
    
    hts_mutex_unlock(&pool->mutex);
    
    // Update statistics
    atomic_inc(&pool->num_allocations);
    
    // Zero memory
    memset(free_node, 0, pool->object_size);
    
    return free_node;
}
```

**Object Deallocation**:
```c
void mempool_free(mempool_t *pool, void *ptr) {
    if (ptr == NULL) {
        return;
    }
    
    hts_mutex_lock(&pool->mutex);
    
    // Add to free list
    void **free_node = ptr;
    *free_node = pool->free_list;
    pool->free_list = free_node;
    
    hts_mutex_unlock(&pool->mutex);
    
    // Update statistics
    atomic_inc(&pool->num_frees);
}
```

**Pool Destruction**:
```c
void mempool_destroy(mempool_t *pool) {
    // Free all chunks
    mempool_chunk_t *chunk = pool->chunks;
    while (chunk != NULL) {
        mempool_chunk_t *next = chunk->next;
        myfree(chunk->memory);
        myfree(chunk);
        chunk = next;
    }
    
    hts_mutex_destroy(&pool->mutex);
    myfree(pool);
}
```

**Source Reference**: `src/misc/pool.c`

## Reference Counting Implementation

### Reference Count Structure

```c
// src/misc/refcount.c

typedef struct refcount {
    atomic_t count;
    void (*destructor)(void *);
    void *opaque;
} refcount_t;

#define REFCOUNT_HEADER \
    refcount_t rc_header
```

### Reference Count Operations

**Initialization**:
```c
void refcount_init(refcount_t *rc, void (*destructor)(void *), void *opaque) {
    atomic_set(&rc->count, 1);
    rc->destructor = destructor;
    rc->opaque = opaque;
}
```

**Increment**:
```c
void refcount_inc(refcount_t *rc) {
    int old_count = atomic_inc(&rc->count);
    assert(old_count > 0);  // Detect use-after-free
}
```

**Decrement**:
```c
void refcount_dec(refcount_t *rc) {
    int new_count = atomic_dec(&rc->count);
    
    if (new_count == 0) {
        // Last reference, destroy object
        if (rc->destructor) {
            rc->destructor(rc->opaque);
        }
    } else {
        assert(new_count > 0);  // Detect double-free
    }
}
```

**Source Reference**: `src/misc/refcount.c`

### Property Reference Counting

```c
// src/prop/prop.c

typedef struct prop {
    REFCOUNT_HEADER;
    
    hts_mutex_t hp_mutex;
    prop_t *hp_parent;
    TAILQ_HEAD(, prop) hp_childs;
    // ... other fields
} prop_t;

void prop_ref_inc(prop_t *p) {
    refcount_inc(&p->rc_header);
}

void prop_ref_dec(prop_t *p) {
    refcount_dec(&p->rc_header);
}

static void prop_destroy(void *opaque) {
    prop_t *p = opaque;
    
    // Destroy children
    prop_t *child;
    while ((child = TAILQ_FIRST(&p->hp_childs)) != NULL) {
        TAILQ_REMOVE(&p->hp_childs, child, hp_link);
        prop_ref_dec(child);
    }
    
    hts_mutex_destroy(&p->hp_mutex);
    myfree(p);
}

prop_t *prop_create(prop_t *parent) {
    prop_t *p = mymalloc(sizeof(prop_t));
    refcount_init(&p->rc_header, prop_destroy, p);
    
    hts_mutex_init(&p->hp_mutex);
    TAILQ_INIT(&p->hp_childs);
    p->hp_parent = parent;
    
    if (parent) {
        prop_ref_inc(parent);
        TAILQ_INSERT_TAIL(&parent->hp_childs, p, hp_link);
    }
    
    return p;
}
```

**Source Reference**: `src/prop/prop.c`

## Memory Debugging

### Debug Allocator

```c
// src/misc/debug_malloc.c

#ifdef DEBUG_MEMORY

typedef struct alloc_header {
    size_t size;
    const char *file;
    int line;
    uint32_t magic;
    struct alloc_header *next;
    struct alloc_header *prev;
} alloc_header_t;

#define ALLOC_MAGIC 0xDEADBEEF
#define ALLOC_FREED_MAGIC 0xFREEDBAD

static hts_mutex_t alloc_mutex;
static alloc_header_t *alloc_list = NULL;
static size_t total_allocated = 0;
static size_t peak_allocated = 0;

void *debug_malloc(size_t size, const char *file, int line) {
    // Allocate with header and footer
    size_t total_size = sizeof(alloc_header_t) + size + sizeof(uint32_t);
    alloc_header_t *header = malloc(total_size);
    
    if (header == NULL) {
        fprintf(stderr, "Out of memory at %s:%d\n", file, line);
        abort();
    }
    
    // Initialize header
    header->size = size;
    header->file = file;
    header->line = line;
    header->magic = ALLOC_MAGIC;
    
    // Add to allocation list
    hts_mutex_lock(&alloc_mutex);
    header->next = alloc_list;
    header->prev = NULL;
    if (alloc_list) {
        alloc_list->prev = header;
    }
    alloc_list = header;
    
    total_allocated += size;
    if (total_allocated > peak_allocated) {
        peak_allocated = total_allocated;
    }
    hts_mutex_unlock(&alloc_mutex);
    
    // Set footer magic
    uint32_t *footer = (uint32_t *)((char *)(header + 1) + size);
    *footer = ALLOC_MAGIC;
    
    return header + 1;
}

void debug_free(void *ptr, const char *file, int line) {
    if (ptr == NULL) {
        return;
    }
    
    alloc_header_t *header = (alloc_header_t *)ptr - 1;
    
    // Check header magic
    if (header->magic != ALLOC_MAGIC) {
        fprintf(stderr, "Invalid free at %s:%d (allocated at %s:%d)\n",
                file, line, header->file, header->line);
        if (header->magic == ALLOC_FREED_MAGIC) {
            fprintf(stderr, "Double free detected!\n");
        }
        abort();
    }
    
    // Check footer magic
    uint32_t *footer = (uint32_t *)((char *)ptr + header->size);
    if (*footer != ALLOC_MAGIC) {
        fprintf(stderr, "Buffer overflow detected at %s:%d (allocated at %s:%d)\n",
                file, line, header->file, header->line);
        abort();
    }
    
    // Remove from allocation list
    hts_mutex_lock(&alloc_mutex);
    if (header->prev) {
        header->prev->next = header->next;
    } else {
        alloc_list = header->next;
    }
    if (header->next) {
        header->next->prev = header->prev;
    }
    
    total_allocated -= header->size;
    hts_mutex_unlock(&alloc_mutex);
    
    // Mark as freed
    header->magic = ALLOC_FREED_MAGIC;
    
    // Fill with pattern to detect use-after-free
    memset(ptr, 0xDD, header->size);
    
    free(header);
}

void debug_dump_leaks(void) {
    hts_mutex_lock(&alloc_mutex);
    
    if (alloc_list == NULL) {
        printf("No memory leaks detected\n");
    } else {
        printf("Memory leaks detected:\n");
        
        alloc_header_t *header = alloc_list;
        size_t leak_count = 0;
        size_t leak_bytes = 0;
        
        while (header) {
            printf("  %zu bytes at %s:%d\n", 
                   header->size, header->file, header->line);
            leak_count++;
            leak_bytes += header->size;
            header = header->next;
        }
        
        printf("Total: %zu leaks, %zu bytes\n", leak_count, leak_bytes);
    }
    
    printf("Peak memory usage: %zu bytes\n", peak_allocated);
    
    hts_mutex_unlock(&alloc_mutex);
}

#endif // DEBUG_MEMORY
```

**Source Reference**: `src/misc/debug_malloc.c`

### Valgrind Integration

**Valgrind Annotations**:
```c
#ifdef HAVE_VALGRIND
#include <valgrind/memcheck.h>

void *mymalloc(size_t size) {
    void *ptr = malloc(size);
    if (ptr) {
        VALGRIND_MALLOCLIKE_BLOCK(ptr, size, 0, 0);
    }
    return ptr;
}

void myfree(void *ptr) {
    if (ptr) {
        VALGRIND_FREELIKE_BLOCK(ptr, 0);
        free(ptr);
    }
}
#endif
```

**Suppression File** (`movian.supp`):
```
{
   OpenGL_driver_leak
   Memcheck:Leak
   ...
   obj:*/libGL.so*
}

{
   FFmpeg_internal_buffer
   Memcheck:Leak
   ...
   obj:*/libavcodec.so*
}
```

## Memory Optimization Techniques

### Object Pooling

**Widget Pool**:
```c
// src/ui/glw/glw.c

static mempool_t *widget_pool = NULL;

void glw_init(void) {
    widget_pool = mempool_create(sizeof(glw_t), 256);
}

glw_t *glw_alloc(void) {
    return mempool_alloc(widget_pool);
}

void glw_free(glw_t *w) {
    mempool_free(widget_pool, w);
}
```

### String Interning

**String Pool**:
```c
// src/misc/strtab.c

typedef struct strtab {
    hts_mutex_t mutex;
    AVL_TREE(, strtab_entry) entries;
} strtab_t;

const char *strtab_get(strtab_t *st, const char *str) {
    hts_mutex_lock(&st->mutex);
    
    strtab_entry_t *entry = strtab_find(st, str);
    if (entry) {
        entry->refcount++;
        hts_mutex_unlock(&st->mutex);
        return entry->str;
    }
    
    // Create new entry
    entry = mymalloc(sizeof(strtab_entry_t));
    entry->str = mystrdup(str);
    entry->refcount = 1;
    AVL_INSERT(&st->entries, entry);
    
    hts_mutex_unlock(&st->mutex);
    return entry->str;
}

void strtab_release(strtab_t *st, const char *str) {
    hts_mutex_lock(&st->mutex);
    
    strtab_entry_t *entry = strtab_find(st, str);
    if (entry && --entry->refcount == 0) {
        AVL_REMOVE(&st->entries, entry);
        myfree(entry->str);
        myfree(entry);
    }
    
    hts_mutex_unlock(&st->mutex);
}
```

**Source Reference**: `src/misc/strtab.c`

### Copy-on-Write

**COW String**:
```c
typedef struct cow_string {
    atomic_t refcount;
    size_t length;
    char data[];
} cow_string_t;

cow_string_t *cow_string_create(const char *str) {
    size_t len = strlen(str);
    cow_string_t *s = mymalloc(sizeof(cow_string_t) + len + 1);
    atomic_set(&s->refcount, 1);
    s->length = len;
    memcpy(s->data, str, len + 1);
    return s;
}

cow_string_t *cow_string_copy(cow_string_t *s) {
    atomic_inc(&s->refcount);
    return s;
}

cow_string_t *cow_string_modify(cow_string_t *s) {
    if (atomic_get(&s->refcount) == 1) {
        // Sole owner, can modify in place
        return s;
    }
    
    // Shared, create copy
    cow_string_t *copy = cow_string_create(s->data);
    cow_string_release(s);
    return copy;
}

void cow_string_release(cow_string_t *s) {
    if (atomic_dec(&s->refcount) == 0) {
        myfree(s);
    }
}
```

## Platform-Specific Optimizations

### Linux: jemalloc

```c
// Use jemalloc for better performance
#ifdef USE_JEMALLOC
#include <jemalloc/jemalloc.h>

void *mymalloc(size_t size) {
    return je_malloc(size);
}

void myfree(void *ptr) {
    je_free(ptr);
}
#endif
```

### macOS: Zone Allocator

```c
// Use malloc zones on macOS
#ifdef __APPLE__
#include <malloc/malloc.h>

static malloc_zone_t *movian_zone = NULL;

void memory_init(void) {
    movian_zone = malloc_create_zone(0, 0);
    malloc_set_zone_name(movian_zone, "Movian");
}

void *mymalloc(size_t size) {
    return malloc_zone_malloc(movian_zone, size);
}

void myfree(void *ptr) {
    malloc_zone_free(movian_zone, ptr);
}
#endif
```

### Windows: Low Fragmentation Heap

```c
// Enable low fragmentation heap on Windows
#ifdef _WIN32
void memory_init(void) {
    HANDLE heap = GetProcessHeap();
    ULONG heap_info = 2;  // Enable LFH
    HeapSetInformation(heap, HeapCompatibilityInformation,
                      &heap_info, sizeof(heap_info));
}
#endif
```

## See Also

- [Memory Management Patterns](memory.md) - High-level patterns and best practices
- [Threading Model](threading-model.md) - Thread safety and synchronization
- [Architecture Overview](overview.md) - System architecture
- [Performance Optimization](../guides/performance-optimization.md) - Performance tuning
