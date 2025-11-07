# GLW View Support Functions Source Code Analysis

**File**: `movian/src/ui/glw/glw_view_support.c`  
**Purpose**: Utility functions for token manipulation and management  
**Status**: 🟢 Verified from source code analysis

## Overview

The `glw_view_support.c` file provides essential utility functions for managing tokens throughout the GLW view system. These functions handle token allocation, deallocation, copying, cloning, and debugging. They form the foundation for all token manipulation operations in the lexer, preprocessor, parser, and evaluator.

## Architecture

### Token Memory Management

Tokens are managed through a memory pool system for efficiency:

```c
token_t *glw_view_token_alloc(glw_root_t *gr)
{
  return pool_get(gr->gr_token_pool);
}
```

**Benefits**:
- Fast allocation (no malloc overhead)
- Reduced memory fragmentation
- Efficient reuse of token structures

## Key Functions

### Token Allocation

#### glw_view_token_alloc()

**Source**: Lines 31-34

```c
token_t *
glw_view_token_alloc(glw_root_t *gr)
{
  return pool_get(gr->gr_token_pool);
}
```

**Purpose**: Allocate a new token from the memory pool

**Parameters**:
- **gr**: GLW root context containing the token pool

**Returns**: Pointer to newly allocated token (uninitialized)

**Usage**: Called by lexer and other components when creating new tokens

**Note**: Returned token must be initialized before use

### Token Deallocation

#### glw_view_token_free()

**Source**: Lines 40-127

```c
void
glw_view_token_free(glw_root_t *gr, token_t *t)
```

**Purpose**: Free a token and its associated resources

**Parameters**:
- **gr**: GLW root context
- **t**: Token to free (must be unlinked from all lists)

**Behavior**: Type-specific cleanup based on `t->type`

#### Token Type Cleanup

**Common Cleanup** (all types):
```c
rstr_release(t->file);  // Release file reference
```

**Type-Specific Cleanup**:

1. **TOKEN_FUNCTION**:
   ```c
   if(t->t_func->ctor != NULL)
     t->t_func->dtor(gr, t);
   ```
   - Calls function-specific destructor if defined

2. **TOKEN_PROPERTY_REF**:
   ```c
   prop_ref_dec(t->t_prop);
   ```
   - Decrements property reference count

3. **TOKEN_PROPERTY_OWNER**:
   ```c
   prop_destroy(t->t_prop);
   ```
   - Destroys owned property

4. **TOKEN_RSTRING, TOKEN_IDENTIFIER, TOKEN_UNRESOLVED_ATTRIBUTE**:
   ```c
   rstr_release(t->t_rstring);
   ```
   - Releases reference-counted string

5. **TOKEN_PROPERTY_NAME**:
   ```c
   for(i = 0; i < t->t_elements; i++)
     rstr_release(t->t_pnvec[i]);
   ```
   - Releases all property name components

6. **TOKEN_GEM** (GLW Event Map):
   ```c
   glw_event_map_destroy(gr, t->t_gem);
   ```
   - Destroys event map structure

7. **TOKEN_EVENT**:
   ```c
   event_release(t->t_event);
   ```
   - Releases event reference

8. **TOKEN_URI**:
   ```c
   rstr_release(t->t_uri_title);
   rstr_release(t->t_uri);
   ```
   - Releases both URI and title strings

**No Cleanup Required**:
- Numeric types (TOKEN_FLOAT, TOKEN_EM, TOKEN_INT, TOKEN_VECTOR_FLOAT)
- Operators and punctuation
- TOKEN_VOID, TOKEN_DIRECTORY, TOKEN_CSTRING
- Expression types (TOKEN_EXPR, TOKEN_RPN, TOKEN_PURE_RPN, TOKEN_BLOCK)

**Final Step**:
```c
pool_put(gr->gr_token_pool, t);
```
- Returns token to memory pool for reuse

### Token Copying

#### glw_view_token_copy()

**Source**: Lines 134-267

```c
token_t *
glw_view_token_copy(glw_root_t *gr, token_t *src)
```

**Purpose**: Create a shallow copy of a single token

**Parameters**:
- **gr**: GLW root context
- **src**: Source token to copy

**Returns**: Pointer to new token (copy of source)

**Behavior**: Creates new token with copied data

#### Common Fields Copied

```c
dst->file = rstr_dup(src->file);
dst->line = src->line;
dst->type = src->type;
dst->t_propsubr = src->t_propsubr;
dst->t_flags = src->t_flags;
```

#### Type-Specific Copying

1. **TOKEN_FLOAT, TOKEN_EM**:
   ```c
   dst->t_float = src->t_float;
   ```

2. **TOKEN_INT**:
   ```c
   dst->t_int = src->t_int;
   ```

3. **TOKEN_MOD_FLAGS**:
   ```c
   dst->t_clr = src->t_clr;
   dst->t_int = src->t_int;
   ```

4. **TOKEN_PROPERTY_REF**:
   ```c
   dst->t_prop = prop_ref_inc(src->t_prop);
   ```
   - Increments reference count

5. **TOKEN_PROPERTY_OWNER**:
   ```c
   dst->t_prop = prop_xref_addref(src->t_prop);
   ```
   - Creates cross-reference

6. **TOKEN_FUNCTION**:
   ```c
   dst->t_func = src->t_func;
   dst->t_func_arg = src->t_func_arg;
   if(dst->t_func->ctor != NULL)
     dst->t_func->ctor(dst);
   dst->t_num_args = src->t_num_args;
   ```
   - Copies function pointer and arguments
   - Calls constructor if defined

7. **TOKEN_RESOLVED_ATTRIBUTE**:
   ```c
   dst->t_attrib = src->t_attrib;
   ```

8. **TOKEN_CSTRING**:
   ```c
   dst->t_cstring = src->t_cstring;
   ```
   - Shallow copy (C string not owned)

9. **TOKEN_RSTRING**:
   ```c
   dst->t_rstrtype = src->t_rstrtype;
   dst->t_rstring = rstr_dup(src->t_rstring);
   ```

10. **TOKEN_IDENTIFIER, TOKEN_UNRESOLVED_ATTRIBUTE**:
    ```c
    dst->t_rstring = rstr_dup(src->t_rstring);
    ```

11. **TOKEN_PROPERTY_NAME**:
    ```c
    for(i = 0; i < src->t_elements; i++)
      dst->t_pnvec[i] = rstr_dup(src->t_pnvec[i]);
    dst->t_elements = src->t_elements;
    ```

12. **TOKEN_RPN**:
    ```c
    dst->t_rpn_origin = src->t_rpn_origin;
    ```

13. **TOKEN_URI**:
    ```c
    dst->t_uri_title = rstr_dup(src->t_uri_title);
    dst->t_uri = rstr_dup(src->t_uri);
    ```

**Important**: Does not copy `next` or `child` pointers - only the token itself

### Chain Operations

#### glw_view_clone_chain()

**Source**: Lines 289-304

```c
token_t *
glw_view_clone_chain(glw_root_t *gr, token_t *src, token_t **lp)
```

**Purpose**: Deep copy of an entire token chain

**Parameters**:
- **gr**: GLW root context
- **src**: First token in source chain
- **lp**: Optional pointer to receive last token in cloned chain

**Returns**: Pointer to first token in cloned chain

**Behavior**:
```c
token_t *r = NULL, *d;
token_t **pp = &r;

for(; src != NULL; src = src->next) {
  d = glw_view_token_copy(gr, src);
  *pp = d;
  pp = &d->next;
  if(lp)
    *lp = d;
  d->child = glw_view_clone_chain(gr, src->child, NULL);
}
return r;
```

**Process**:
1. Iterates through source chain
2. Copies each token using `glw_view_token_copy()`
3. Links copied tokens together
4. Recursively clones child chains
5. Optionally returns pointer to last token

**Use Cases**:
- Macro expansion (copying macro body)
- Creating default argument values
- Duplicating view fragments

#### glw_view_free_chain()

**Source**: Lines 281-284

```c
void
glw_view_free_chain(glw_root_t *gr, token_t *t)
{
  glw_view_free_chain2(gr, t, 0);
}
```

**Purpose**: Free an entire token chain

**Parameters**:
- **gr**: GLW root context
- **t**: First token in chain to free

#### glw_view_free_chain2()

**Source**: Lines 272-279

```c
static void
glw_view_free_chain2(glw_root_t *gr, token_t *t, int indent)
{
  token_t *n;
  
  for(; t != NULL; t = n) {
    n = t->next;
    if(t->child != NULL)
      glw_view_free_chain2(gr, t->child, indent + 2);
    
    glw_view_token_free(gr, t);
  }
}
```

**Purpose**: Recursively free token chain (internal implementation)

**Parameters**:
- **indent**: Indentation level for debugging (currently unused)

**Behavior**:
1. Iterates through chain
2. Recursively frees child chains
3. Frees each token
4. Handles arbitrary chain structures

### Debugging Utilities

#### token2name()

**Source**: Lines 311-431

```c
const char *
token2name(token_t *t)
```

**Purpose**: Convert token to human-readable string representation

**Parameters**:
- **t**: Token to convert

**Returns**: String representation (static buffer or token data)

**Examples**:

1. **Punctuation**:
   ```c
   TOKEN_START         → "<start>"
   TOKEN_END           → "<end>"
   TOKEN_BLOCK_OPEN    → "{"
   TOKEN_BLOCK_CLOSE   → "}"
   TOKEN_SEPARATOR     → ","
   TOKEN_ASSIGNMENT    → "="
   ```

2. **Operators**:
   ```c
   TOKEN_ADD           → "+"
   TOKEN_SUB           → "-"
   TOKEN_MULTIPLY      → "*"
   TOKEN_DIVIDE        → "/"
   TOKEN_BOOLEAN_AND   → "AND"
   TOKEN_BOOLEAN_OR    → "OR"
   TOKEN_GT            → ">"
   TOKEN_LT            → "<"
   ```

3. **Values**:
   ```c
   TOKEN_FLOAT         → "3.14f"
   TOKEN_EM            → "2.5em"
   TOKEN_INT           → "42"
   TOKEN_VOID          → "(void)"
   TOKEN_RSTRING       → "string content"
   TOKEN_CSTRING       → "string content"
   TOKEN_IDENTIFIER    → "identifier"
   ```

4. **Complex Types**:
   ```c
   TOKEN_FUNCTION      → "functionName()"
   TOKEN_PROPERTY_NAME → "<property> name parts"
   TOKEN_RESOLVED_ATTRIBUTE → "attributeName:"
   TOKEN_UNRESOLVED_ATTRIBUTE → "attributeName:"
   TOKEN_URI           → "Link<title, url>"
   TOKEN_VECTOR_FLOAT  → "[1.0 2.0 3.0]"
   ```

5. **Abstract Types**:
   ```c
   TOKEN_BLOCK         → "<block>"
   TOKEN_EXPR          → "<infix expr>"
   TOKEN_RPN           → "<rpn>"
   TOKEN_PURE_RPN      → "<pure-rpn>"
   TOKEN_NOP           → "<nop>"
   TOKEN_DIRECTORY     → "<directory>"
   ```

**Usage**: Debugging, error messages, logging

#### glw_view_print_tree()

**Source**: Lines 438-451

```c
void
glw_view_print_tree(token_t *f, int indent)
{
  token_t *c = f;
  
  while(c != NULL) {
    TRACE(TRACE_DEBUG, "GLW",
          "%*.s%s %p (%s:%d)\n", indent, "", token2name(c), c,
           rstr_get(c->file), c->line);
    
    if(c->child != NULL) {
      glw_view_print_tree(c->child, indent + 4);
    }
    c = c->next;
  }
}
```

**Purpose**: Print token tree structure for debugging

**Parameters**:
- **f**: First token in chain
- **indent**: Initial indentation level

**Output Format**:
```
<start> 0x12345678 (main.view:1)
    { 0x12345679 (main.view:2)
        identifier 0x1234567a (main.view:3)
            <property> name 0x1234567b (main.view:3)
        = 0x1234567c (main.view:3)
        "value" 0x1234567d (main.view:3)
    } 0x1234567e (main.view:4)
<end> 0x1234567f (main.view:5)
```

**Features**:
- Indentation shows hierarchy
- Shows token type, pointer, file, and line number
- Recursively prints child tokens
- Useful for debugging parser and preprocessor

### Error Handling

#### glw_view_seterr()

**Source**: Lines 458-474

```c
int
glw_view_seterr(errorinfo_t *ei, token_t *b, const char *fmt, ...)
{
  if(ei == NULL)
    ei = alloca(sizeof(errorinfo_t));
  
  va_list ap;
  va_start(ap, fmt);
  
  assert(b != NULL);
  
  vsnprintf(ei->error, sizeof(ei->error), fmt, ap);
  va_end(ap);
  
  snprintf(ei->file,  sizeof(ei->file),  "%s", rstr_get(b->file));
  ei->line = b->line;
  tracelog(TRACE_NO_PROP, TRACE_ERROR, "GLW", "Error %s:%d: %s",
           rstr_get(b->file), b->line, ei->error);
  
  return -1;
}
```

**Purpose**: Set error information and log error message

**Parameters**:
- **ei**: Error info structure (can be NULL)
- **b**: Token where error occurred
- **fmt**: Printf-style format string
- **...**: Format arguments

**Returns**: Always returns -1 (for convenient error propagation)

**Behavior**:
1. Allocates error info on stack if NULL
2. Formats error message
3. Extracts file and line from token
4. Logs error to trace system
5. Returns -1

**Usage Pattern**:
```c
if(error_condition)
  return glw_view_seterr(ei, token, "Error: %s", description);
```

**Error Info Structure**:
```c
typedef struct errorinfo {
  char error[256];  // Error message
  char file[256];   // Source file
  int line;         // Line number
} errorinfo_t;
```

### Property Name Utilities

#### glw_propname_to_array()

**Source**: Lines 481-489

```c
void
glw_propname_to_array(const char *pname[16], const token_t *a)
{
  const token_t *t;
  int i, j;
  for(i = 0, t = a; t != NULL && i < 16 - 1; t = t->child)
    for(j = 0; j < t->t_elements && i < 16 - 1; j++)
      pname[i++]  = rstr_get(t->t_pnvec[j]);
  pname[i] = NULL;
}
```

**Purpose**: Convert property name token chain to string array

**Parameters**:
- **pname**: Output array (must have space for 16 pointers)
- **a**: First token in property name chain

**Behavior**:
1. Iterates through token chain (following `child` pointers)
2. Extracts property name components from each token
3. Stores pointers to strings in output array
4. NULL-terminates array
5. Maximum 15 components (16th slot is NULL)

**Example**:

**Token Structure**:
```
TOKEN_PROPERTY_NAME
  t_pnvec[0] = "page"
  t_pnvec[1] = "model"
  child →
    TOKEN_PROPERTY_NAME
      t_pnvec[0] = "title"
```

**Output Array**:
```c
pname[0] = "page"
pname[1] = "model"
pname[2] = "title"
pname[3] = NULL
```

**Usage**: Converting property references for property system lookups

## Token Type Reference

### Value Tokens

- **TOKEN_FLOAT**: Floating-point number (e.g., `3.14`)
- **TOKEN_EM**: EM unit (e.g., `2.5em`)
- **TOKEN_INT**: Integer (e.g., `42`)
- **TOKEN_VOID**: Void/null value
- **TOKEN_VECTOR_FLOAT**: Float vector (e.g., `[1.0, 2.0, 3.0]`)
- **TOKEN_RSTRING**: Reference-counted string
- **TOKEN_CSTRING**: C string constant
- **TOKEN_IDENTIFIER**: Identifier name
- **TOKEN_URI**: URI with title

### Structural Tokens

- **TOKEN_START**: Start of token stream
- **TOKEN_END**: End of token stream
- **TOKEN_BLOCK_OPEN**: `{`
- **TOKEN_BLOCK_CLOSE**: `}`
- **TOKEN_LEFT_PARENTHESIS**: `(`
- **TOKEN_RIGHT_PARENTHESIS**: `)`
- **TOKEN_LEFT_BRACKET**: `[`
- **TOKEN_RIGHT_BRACKET**: `]`
- **TOKEN_SEPARATOR**: `,`
- **TOKEN_END_OF_EXPR**: `;`
- **TOKEN_DOT**: `.`
- **TOKEN_COLON**: `:`
- **TOKEN_HASH**: `#`

### Operator Tokens

- **TOKEN_ASSIGNMENT**: `=`
- **TOKEN_COND_ASSIGNMENT**: `?=`
- **TOKEN_REF_ASSIGNMENT**: `&=`
- **TOKEN_DEBUG_ASSIGNMENT**: `!=`
- **TOKEN_LINK_ASSIGNMENT**: `~=`
- **TOKEN_ADD**: `+`
- **TOKEN_SUB**: `-`
- **TOKEN_MULTIPLY**: `*`
- **TOKEN_DIVIDE**: `/`
- **TOKEN_MODULO**: `%`
- **TOKEN_BOOLEAN_AND**: `&&`
- **TOKEN_BOOLEAN_OR**: `||`
- **TOKEN_BOOLEAN_XOR**: `^^`
- **TOKEN_BOOLEAN_NOT**: `!`
- **TOKEN_EQ**: `==`
- **TOKEN_NEQ**: `!=`
- **TOKEN_LT**: `<`
- **TOKEN_GT**: `>`
- **TOKEN_NULL_COALESCE**: `??`
- **TOKEN_QUESTIONMARK**: `?`
- **TOKEN_TENARY**: Ternary operator
- **TOKEN_DOLLAR**: `$`
- **TOKEN_AMPERSAND**: `&`

### Property Tokens

- **TOKEN_PROPERTY_REF**: Property reference
- **TOKEN_PROPERTY_OWNER**: Owned property
- **TOKEN_PROPERTY_NAME**: Property name components
- **TOKEN_PROPERTY_SUBSCRIPTION**: Property subscription

### Attribute Tokens

- **TOKEN_RESOLVED_ATTRIBUTE**: Resolved attribute name
- **TOKEN_UNRESOLVED_ATTRIBUTE**: Unresolved attribute name

### Expression Tokens

- **TOKEN_EXPR**: Infix expression
- **TOKEN_RPN**: Reverse Polish Notation expression
- **TOKEN_PURE_RPN**: Pure RPN (no side effects)
- **TOKEN_BLOCK**: Code block
- **TOKEN_NOP**: No operation
- **TOKEN_VECTOR**: Vector constructor

### Special Tokens

- **TOKEN_FUNCTION**: Function call
- **TOKEN_GEM**: GLW Event Map
- **TOKEN_EVENT**: Event object
- **TOKEN_DIRECTORY**: Directory reference
- **TOKEN_MOD_FLAGS**: Flag modification

## Memory Management Patterns

### Allocation Pattern

```c
token_t *t = glw_view_token_alloc(gr);
t->type = TOKEN_INT;
t->t_int = 42;
t->file = rstr_dup(filename);
t->line = line_number;
t->next = NULL;
t->child = NULL;
```

### Deallocation Pattern

```c
// Unlink from chain first
prev->next = token->next;

// Then free
glw_view_token_free(gr, token);
```

### Chain Building Pattern

```c
token_t *first = NULL;
token_t **pp = &first;

for(...) {
  token_t *t = glw_view_token_alloc(gr);
  // Initialize t
  *pp = t;
  pp = &t->next;
}
*pp = NULL;  // Terminate chain
```

### Chain Cloning Pattern

```c
token_t *original = ...;
token_t *copy = glw_view_clone_chain(gr, original, NULL);
// copy is independent of original
```

### Chain Freeing Pattern

```c
token_t *chain = ...;
glw_view_free_chain(gr, chain);
// All tokens in chain are freed
```

## Performance Considerations

### Memory Pool Benefits

- **Fast Allocation**: O(1) allocation from pool
- **Reduced Fragmentation**: Tokens are same size
- **Cache Locality**: Pool allocations are contiguous
- **Efficient Reuse**: Freed tokens immediately available

### Reference Counting

- **rstr_t**: Reference-counted strings reduce copying
- **prop_t**: Reference-counted properties prevent duplication
- **Shared Data**: Multiple tokens can reference same string

### Chain Operations

- **Cloning**: Creates deep copy (can be expensive for large chains)
- **Freeing**: Recursive (can cause stack issues for very deep trees)
- **Copying**: Single token copy is fast

## Integration with View System

### Lexer Integration

```c
// Lexer creates tokens
token_t *t = glw_view_token_alloc(gr);
t->type = TOKEN_IDENTIFIER;
t->t_rstring = rstr_alloc(identifier_text);
```

### Preprocessor Integration

```c
// Preprocessor clones macro bodies
token_t *expanded = glw_view_clone_chain(gr, macro->body, NULL);
```

### Parser Integration

```c
// Parser consumes tokens
token_t *t = current;
current = current->next;
glw_view_token_free(gr, t);
```

### Error Reporting Integration

```c
// Error reporting uses token location
if(error)
  return glw_view_seterr(ei, token, "Parse error: %s", msg);
```

## Related Files

- **glw_view.h**: Token structure definitions
- **glw_view_lexer.c**: Token creation
- **glw_view_preproc.c**: Token manipulation for preprocessing
- **glw_view_parser.c**: Token consumption
- **glw_view_eval.c**: Token evaluation

## See Also

- [glw_view_lexer.c.md](glw_view_lexer.c.md) - Tokenization
- [glw_view_preproc.c.md](glw_view_preproc.c.md) - Preprocessing
- [glw_view_parser.c.md](glw_view_parser.c.md) - Parsing
- [glw_view_eval.c.md](glw_view_eval.c.md) - Expression evaluation
