# GLW View Preprocessor Source Code Analysis

**File**: `movian/src/ui/glw/glw_view_preproc.c`  
**Purpose**: View file preprocessing with macros, includes, and imports  
**Status**: 🟢 Verified from source code analysis

## Overview

The `glw_view_preproc.c` file implements a C-style preprocessor for GLW view files. It provides macro definitions, file inclusion, and import mechanisms that allow for code reuse and modular view file organization. The preprocessor runs before the parser, transforming the token stream to expand macros and include external files.

## Architecture

### Core Data Structures

#### macro_t

Represents a macro definition:

```c
typedef struct macro {
  token_t *body;                    // Macro body (token chain)
  rstr_t *rname;                    // Macro name
  struct macro_arg_queue args;     // Macro arguments
  
  LIST_ENTRY(macro) link;          // List linkage
} macro_t;
```

**Key Fields**:
- **body**: The token chain representing the macro's body
- **rname**: The macro name (as a reference-counted string)
- **args**: Queue of macro arguments with their names and default values

#### macro_arg_t

Represents a macro argument:

```c
typedef struct macro_arg {
  token_t *first, *last;           // Argument value range in invocation
  rstr_t *rname;                   // Argument name
  token_t *ma_def;                 // Default value (if any)
  TAILQ_ENTRY(macro_arg) link;    // Queue linkage
} macro_arg_t;
```

**Key Fields**:
- **first/last**: Pointers to the first and last tokens of the argument value in a macro invocation
- **rname**: The argument name
- **ma_def**: Default value token chain (NULL if no default)

#### import_t

Tracks imported files to prevent duplicate imports:

```c
typedef struct import {
  rstr_t *rname;                   // Imported file path
  LIST_ENTRY(import) link;         // List linkage
} import_t;
```

**Purpose**: Maintains a list of already-imported files to ensure each file is imported only once per preprocessing session.

### List Structures

```c
LIST_HEAD(macro_list, macro);           // List of defined macros
TAILQ_HEAD(macro_arg_queue, macro_arg); // Queue of macro arguments
LIST_HEAD(import_list, import);         // List of imported files
```

## Key Functions

### Main Preprocessing

#### glw_view_preproc()

**Source**: Lines 467-487

```c
int
glw_view_preproc(glw_root_t *gr, token_t *p, errorinfo_t *ei, int may_unlock)
{
  struct macro_list ml;
  macro_t *m;
  struct import_list il;
  import_t *i;
  int r;
  
  LIST_INIT(&ml);
  LIST_INIT(&il);
  
  r = glw_view_preproc0(gr, p, ei, &ml, &il, may_unlock);
  
  while((m = LIST_FIRST(&ml)) != NULL)
    macro_destroy(gr, m);
  
  while((i = LIST_FIRST(&il)) != NULL) {
    LIST_REMOVE(i, link);
    rstr_release(i->rname);
    free(i);
  }
  
  return r;
}
```

**Purpose**: Entry point for preprocessing a token chain

**Behavior**:
1. Initializes macro and import lists
2. Calls `glw_view_preproc0()` to perform actual preprocessing
3. Cleans up all macros and imports after preprocessing
4. Returns 0 on success, -1 on error

**Parameters**:
- **gr**: GLW root context
- **p**: Token chain to preprocess (must start with TOKEN_START)
- **ei**: Error information structure
- **may_unlock**: Whether the function may unlock the GLW lock

#### glw_view_preproc0()

**Source**: Lines 72-465

```c
static int
glw_view_preproc0(glw_root_t *gr, token_t *p, errorinfo_t *ei,
                  struct macro_list *ml, struct import_list *il,
                  int may_unlock)
```

**Purpose**: Core preprocessing logic

**Main Loop Structure**:
```c
while(1) {
  t = p->next;
  if(t->type == TOKEN_END)
    return 0;
  
  // Check for macro invocation
  if(t->type == TOKEN_IDENTIFIER) {
    // Handle macro expansion
  }
  
  // Check for preprocessor directive
  if(t->type != TOKEN_HASH) {
    p = p->next;
    continue;
  }
  
  // Process directive (#include, #import, #define)
}
```

**Processing Order**:
1. Macro invocations (identifier followed by parenthesis)
2. Preprocessor directives (starting with `#`)
3. Regular tokens (passed through unchanged)

## Preprocessor Directives

### #include Directive

**Source**: Lines 283-295

```c
if(!strcmp(rstr_get(t->t_rstring), "include")) {
  consumetoken();
  
  if(t->type != TOKEN_RSTRING) 
    return glw_view_seterr(ei, t, "Invalid filename after include");
  
  x = t->next;
  if((n = glw_view_load1(gr, t->t_rstring, ei, t, may_unlock)) == NULL)
    return -1;
  
  n->next = x;
  consumetoken();
  continue;
}
```

**Syntax**: `#include "filename.view"`

**Behavior**:
1. Expects a string token with the filename
2. Loads the file using `glw_view_load1()`
3. Inserts the loaded token chain at the current position
4. Continues preprocessing (included file is also preprocessed)

**Use Case**: Include common view fragments multiple times

**Example**:
```xml
#include "common/header.view"
#include "common/footer.view"
```

**Key Difference from #import**: Files can be included multiple times

### #import Directive

**Source**: Lines 302-327

```c
if(!strcmp(rstr_get(t->t_rstring), "import")) {
  import_t *i;
  consumetoken();
  
  if(t->type != TOKEN_RSTRING) 
    return glw_view_seterr(ei, t, "Invalid filename after import");
  
  LIST_FOREACH(i, il, link) {
    if(!strcmp(rstr_get(i->rname), rstr_get(t->t_rstring)))
      break;
  }
  
  if(i == NULL) {
    i = malloc(sizeof(import_t));
    i->rname = rstr_dup(t->t_rstring);
    LIST_INSERT_HEAD(il, i, link);
    
    x = t->next;
    if((n = glw_view_load1(gr, t->t_rstring, ei, t, may_unlock)) == NULL)
      return -1;
    
    n->next = x;
    consumetoken();
  }
  
  continue;
}
```

**Syntax**: `#import "filename.view"`

**Behavior**:
1. Checks if file has already been imported
2. If not imported:
   - Adds to import list
   - Loads and inserts the file
3. If already imported:
   - Skips loading (no-op)

**Use Case**: Import macro definitions or common code once

**Example**:
```xml
#import "macros/ui-components.view"
#import "macros/ui-components.view"  <!-- Second import is ignored -->
```

**Key Difference from #include**: Files are imported only once per preprocessing session

### #define Directive

**Source**: Lines 334-456

```c
if(!strcmp(rstr_get(t->t_rstring), "define")) {
  consumetoken();
  
  if(t->type != TOKEN_IDENTIFIER)
    return glw_view_seterr(ei, t, "Invalid macro name");
  
  m = calloc(1, sizeof(macro_t));
  TAILQ_INIT(&m->args);
  LIST_INSERT_HEAD(ml, m, link);
  
  m->rname = rstr_dup(t->t_rstring);
  consumetoken();
  
  // Parse argument list
  // Parse macro body
}
```

**Syntax**: `#define macroname(arg1, arg2, ...) { body }`

**Components**:

1. **Macro Name**: Identifier following `#define`
2. **Argument List**: Comma-separated identifiers in parentheses
3. **Macro Body**: Token sequence enclosed in braces

#### Argument Parsing

**Source**: Lines 348-407

**Simple Arguments**:
```c
if(t->type != TOKEN_RIGHT_PARENTHESIS) {
  while(1) {
    if(t->type != TOKEN_IDENTIFIER)
      return glw_view_seterr(ei, t, "Expected macro argument");
    
    macro_arg_t *ma = macro_add_arg(m, t->t_rstring);
    consumetoken();
    
    // Check for default value or continue
  }
}
```

**Default Arguments**:
```c
if(t->type == TOKEN_ASSIGNMENT) {
  // Default argument
  consumetoken();
  
  ma->ma_def = t;
  int depth = 0;
  while(t->next->type != TOKEN_END) {
    if(t->next->type == TOKEN_LEFT_PARENTHESIS)
      depth++;
    if(t->next->type == TOKEN_RIGHT_PARENTHESIS) {
      if(depth == 0)
        break;
      depth--;
    }
    if(t->next->type == TOKEN_SEPARATOR) {
      break;
    }
    t = t->next;
  }
  
  token_t *x = t->next;
  t->next = NULL;
  t = x;
  
  defaultargs = 1;
}
```

**Rules**:
- Default arguments must come after non-default arguments
- Default values can contain parentheses (depth tracking)
- Default values end at comma or closing parenthesis

**Example**:
```c
#define widget(name, width=100, height=50) { ... }
```

#### Body Parsing

**Source**: Lines 413-456

```c
if(t->type != TOKEN_BLOCK_OPEN)
  return glw_view_seterr(ei, t, "Expected '{' after macro header");
consumetoken();

x = p;

while(1) {
  t = p->next;
  if(t->type == TOKEN_END)
    return glw_view_seterr(ei, x->next, "Unexpected end of input in "
                           "macro definition");
  
  if(t->type == TOKEN_BLOCK_CLOSE) {
    if(balance == 0) {
      consumetoken();
      break;
    }
    balance--;
  } else if(t->type == TOKEN_BLOCK_OPEN) {
    balance++;
  } else if(t->type == TOKEN_IDENTIFIER) {
    // Mark argument references
    TAILQ_FOREACH(ma, &m->args, link) {
      if(!strcmp(rstr_get(ma->rname), rstr_get(t->t_rstring))) {
        t->tmp = ma;
        break;
      }
    }
  }
  p = p->next;
}
```

**Behavior**:
1. Expects opening brace `{`
2. Tracks brace balance to handle nested blocks
3. Marks identifiers that match argument names (stores pointer in `t->tmp`)
4. Stores body as token chain
5. Ends at matching closing brace `}`

## Macro Invocation

### Detection

**Source**: Lines 82-86

```c
if(t->type == TOKEN_IDENTIFIER) {
  n = t->next;
  if(n->type == TOKEN_LEFT_PARENTHESIS) {
    LIST_FOREACH(m, ml, link)
      if(!strcmp(rstr_get(m->rname), rstr_get(t->t_rstring)))
        break;
```

**Trigger**: Identifier followed by left parenthesis that matches a defined macro name

### Argument Binding

#### Named Arguments

**Source**: Lines 94-143

```c
if(p->next->type == TOKEN_IDENTIFIER &&
   p->next->next->type == TOKEN_ASSIGNMENT) {
  
  TAILQ_FOREACH(ma, &m->args, link)
    ma->first = NULL;
  p = p->next;
  
  while(1) {
    TAILQ_FOREACH(ma, &m->args, link)
      if(!strcmp(rstr_get(ma->rname), rstr_get(p->t_rstring)))
        break;
    
    p = p->next;
    if(ma != NULL)
      ma->first = p->next;
    
    // Parse argument value (tracking balance)
    
    if(ma != NULL)
      ma->last = p;
    
    if(t->type == TOKEN_RIGHT_PARENTHESIS)
      break;
    p = t->next;
  }
}
```

**Syntax**: `macroname(arg1=value1, arg2=value2)`

**Behavior**:
- Arguments can be in any order
- Unspecified arguments use default values
- Mixing named and positional arguments is not supported

**Example**:
```c
widget(height=200, name="myWidget", width=150)
```

#### Positional Arguments

**Source**: Lines 147-195

```c
TAILQ_FOREACH(ma, &m->args, link) {
  ma->first = p->next;
  
  if(ma->first->type == TOKEN_RIGHT_PARENTHESIS) {
    ma->first = NULL;
    break;
  }
  
  while(1) {
    t = p->next;
    if(t->type == TOKEN_END)
      return glw_view_seterr(ei, p, "Unexpected end of input in "
                             "macro invocation");
    
    if(t->type == TOKEN_RIGHT_PARENTHESIS && balance == 0) {
      macro_arg_t *x = TAILQ_NEXT(ma, link);
      // Clear remaining arguments
      while(x != NULL) {
        x->first = NULL;
        x = TAILQ_NEXT(x, link);
      }
      break;
    }
    
    // Track balance and find separator
    
    if(t->type == TOKEN_SEPARATOR && balance == 0)
      break;
    p = p->next;
  }
  
  ma->last = p;
  
  if(t->type == TOKEN_RIGHT_PARENTHESIS)
    break;
  p = p->next;
}
```

**Syntax**: `macroname(value1, value2, value3)`

**Behavior**:
- Arguments matched in order
- Extra arguments cause error
- Missing arguments use default values or remain NULL

**Example**:
```c
widget("myWidget", 150, 200)
```

### Expansion

**Source**: Lines 203-241

```c
p = x;
b = NULL;
p->next = d;

for(a = m->body; a != NULL; a = a->next) {
  
  if(a->tmp != NULL && a->next->type != TOKEN_ASSIGNMENT) {
    ma = a->tmp;
    e = ma->first;
    
    if(e == NULL && ma->ma_def != NULL) {
      // Use default value
      token_t *last;
      b = glw_view_clone_chain(gr, ma->ma_def, &last);
      p->next = b;
      p = last;
    } else {
      // Use provided value
      while(1) {
        if(e == NULL)
          return glw_view_seterr(ei, t, 
                                 "Too few arguments to macro %s",
                                 rstr_get(m->rname));
        
        b = glw_view_token_copy(gr, e);
        p->next = b;
        p = b;
        
        if(e == ma->last)
          break;
        e = e->next;
      }
    }
  } else {
    // Copy non-argument token
    b = glw_view_token_copy(gr, a);
    p->next = b;
    p = b;
  }
}

if(b != NULL)
  b->next = d;

p = x;
glw_view_free_chain(gr, c);
```

**Process**:
1. Iterate through macro body tokens
2. For each token:
   - If it's an argument reference (`a->tmp != NULL`):
     - Use provided value if available
     - Use default value if no value provided
     - Error if no value and no default
   - Otherwise:
     - Copy token as-is
3. Insert expanded tokens into token stream
4. Free original invocation tokens
5. Continue preprocessing (expanded tokens are processed)

**Special Case**: Argument references followed by `TOKEN_ASSIGNMENT` are not expanded (allows `arg=value` syntax in macro body)

## Macro Management

### macro_add_arg()

**Source**: Lines 62-68

```c
static macro_arg_t *
macro_add_arg(macro_t *m, rstr_t *name)
{
  macro_arg_t *ma = calloc(1, sizeof(macro_arg_t));
  ma->rname = rstr_dup(name);
  TAILQ_INSERT_TAIL(&m->args, ma, link);
  return ma;
}
```

**Purpose**: Add an argument to a macro definition

**Returns**: Pointer to the new macro argument

### macro_destroy()

**Source**: Lines 44-58

```c
static void
macro_destroy(glw_root_t *gr, macro_t *m)
{
  macro_arg_t *ma;
  
  while((ma = TAILQ_FIRST(&m->args)) != NULL) {
    TAILQ_REMOVE(&m->args, ma, link);
    rstr_release(ma->rname);
    if(ma->ma_def)
      glw_view_free_chain(gr, ma->ma_def);
    free(ma);
  }
  
  LIST_REMOVE(m, link);
  glw_view_free_chain(gr, m->body);
  rstr_release(m->rname);
  free(m);
}
```

**Purpose**: Free all resources associated with a macro

**Cleanup**:
- Frees all macro arguments and their default values
- Frees macro body token chain
- Releases macro name string
- Removes from macro list

## Token Manipulation

### consumetoken() Macro

**Source**: Line 70

```c
#define consumetoken() assert(p != t); p->next = t->next; glw_view_token_free(gr, t); t = p->next
```

**Purpose**: Remove current token from chain and advance

**Behavior**:
1. Asserts that `p` (previous) is not the same as `t` (current)
2. Links previous token to next token (bypassing current)
3. Frees current token
4. Advances `t` to next token

**Usage**: Used throughout preprocessing to remove processed tokens

## Error Handling

### Error Reporting

All errors use `glw_view_seterr()` to report issues:

```c
return glw_view_seterr(ei, t, "Error message");
```

**Common Errors**:

1. **Invalid filename after include/import**:
   ```c
   #include 123  // Error: not a string
   ```

2. **Invalid macro name**:
   ```c
   #define 123() { }  // Error: not an identifier
   ```

3. **Expected '(' after macro name**:
   ```c
   #define widget { }  // Error: missing argument list
   ```

4. **Expected macro argument**:
   ```c
   #define widget(123) { }  // Error: not an identifier
   ```

5. **Non default arg after default arg**:
   ```c
   #define widget(a=1, b) { }  // Error: b has no default
   ```

6. **Expected '{' after macro header**:
   ```c
   #define widget() body  // Error: missing braces
   ```

7. **Unexpected end of input**:
   ```c
   #define widget() {  // Error: no closing brace
   ```

8. **Too many arguments to macro**:
   ```c
   widget(1, 2, 3)  // Error: widget only takes 2 args
   ```

9. **Too few arguments to macro**:
   ```c
   widget(1)  // Error: widget requires 2 args (no defaults)
   ```

10. **Mixing named and unnamed arguments**:
    ```c
    widget(1, name=2)  // Error: can't mix styles
    ```

11. **Invalid preprocessor directive**:
    ```c
    #unknown  // Error: not a valid directive
    ```

## Usage Examples

### Simple Macro

**Definition**:
```c
#define button(label) {
  container_x {
    label {
      caption = $label;
    }
  }
}
```

**Invocation**:
```c
button("Click Me")
```

**Expansion**:
```xml
container_x {
  label {
    caption = "Click Me";
  }
}
```

### Macro with Default Arguments

**Definition**:
```c
#define widget(name, width=100, height=50) {
  container_x {
    id = $name;
    width = $width;
    height = $height;
  }
}
```

**Invocations**:
```c
widget("myWidget")                    // Uses defaults: 100, 50
widget("myWidget", 200)               // Uses: 200, 50
widget("myWidget", 200, 100)          // Uses: 200, 100
widget(name="myWidget", height=100)   // Uses: 100, 100 (named args)
```

### Complex Macro with Nested Blocks

**Definition**:
```c
#define listItem(title, subtitle, icon) {
  container_x {
    image {
      source = $icon;
    }
    container_y {
      label {
        caption = $title;
      }
      label {
        caption = $subtitle;
      }
    }
  }
}
```

**Invocation**:
```c
listItem("Title", "Subtitle", "icon.png")
```

### File Organization

**macros.view**:
```c
#define button(label) { ... }
#define listItem(title, subtitle) { ... }
#define header(text) { ... }
```

**main.view**:
```c
#import "macros.view"

widget {
  button("Click Me")
  listItem("Item 1", "Description")
  header("My App")
}
```

## Performance Considerations

### Token Copying

- Macro expansion creates copies of tokens
- Large macros or frequent invocations increase memory usage
- Token chains are reference-counted where possible

### Preprocessing Order

1. Macros are expanded before parsing
2. Included files are preprocessed recursively
3. All preprocessing completes before parsing begins

### Import vs Include

- **#import**: More efficient for shared definitions (loaded once)
- **#include**: Necessary when multiple instances needed
- Choose based on use case

## Integration with View System

### Preprocessing Pipeline

```
Token Stream → Preprocessor → Expanded Token Stream → Parser → Widget Tree
```

1. **Lexer** produces initial token stream
2. **Preprocessor** expands macros and includes files
3. **Parser** processes expanded tokens
4. **Widget tree** is constructed

### File Loading

- `glw_view_load1()` loads and tokenizes files
- Loaded files are automatically preprocessed
- Recursive preprocessing handles nested includes/imports

### Scope Isolation

- Macros are local to preprocessing session
- Imports are tracked per preprocessing session
- Each `glw_view_preproc()` call has independent macro/import lists

## Related Files

- **glw_view.c**: View file loading (`glw_view_load1()`)
- **glw_view_lexer.c**: Tokenization
- **glw_view_parser.c**: Parsing expanded tokens
- **glw_view_support.c**: Token manipulation utilities

## See Also

- [glw_view_loader.c.md](glw_view_loader.c.md) - Dynamic view loading
- [glw_view_parser.c.md](glw_view_parser.c.md) - View file parsing
- [glw_view_lexer.c.md](glw_view_lexer.c.md) - Tokenization
- [glw_view_support.c.md](glw_view_support.c.md) - Token utilities
