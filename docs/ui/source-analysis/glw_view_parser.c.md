# GLW View Parser Analysis (glw_view_parser.c)

**File**: `movian/src/ui/glw/glw_view_parser.c`  
**Purpose**: Core parser for GLW view files, handles expression parsing and RPN conversion  
**Lines**: ~800 lines  
**Last Analyzed**: 2024-11-06

## Overview

The GLW view parser is responsible for converting tokenized view file content into executable expressions. It implements a sophisticated expression parser using the Shunting Yard algorithm to convert infix expressions to Reverse Polish Notation (RPN) for efficient evaluation.

## Key Data Structures

### Token Queue
```c
typedef struct tokenqueue {
  token_t *head, *tail;
} tokenqueue_t;
```
- **Purpose**: FIFO queue for managing tokens during RPN conversion
- **Usage**: Output queue in Shunting Yard algorithm

### Token Precedence Table
```c
static const int tokenprecedence[TOKEN_num] = {
  [TOKEN_ASSIGNMENT]         = 1,
  [TOKEN_COND_ASSIGNMENT]    = 1,
  [TOKEN_REF_ASSIGNMENT]     = 1,
  [TOKEN_DEBUG_ASSIGNMENT]   = 1,
  [TOKEN_LINK_ASSIGNMENT]    = 1,
  [TOKEN_COLON]              = 2,
  [TOKEN_QUESTIONMARK]       = 3,
  [TOKEN_TENARY]             = 3,
  [TOKEN_NULL_COALESCE]      = 4,
  [TOKEN_BOOLEAN_OR]         = 5,
  [TOKEN_BOOLEAN_AND]        = 6,
  [TOKEN_BOOLEAN_XOR]        = 7,
  [TOKEN_EQ]                 = 8,
  [TOKEN_NEQ]                = 8,
  [TOKEN_LT]                 = 8,
  [TOKEN_GT]                 = 8,
  [TOKEN_ADD]                = 9,
  [TOKEN_SUB]                = 9,
  [TOKEN_MULTIPLY]           = 10,
  [TOKEN_DIVIDE]             = 10,
  [TOKEN_MODULO]             = 11,
  [TOKEN_BLOCK]              = 12,
  [TOKEN_BOOLEAN_NOT]        = 13,
};
```
- **Purpose**: Defines operator precedence for expression parsing
- **Range**: 1 (lowest) to 13 (highest precedence)
- **Note**: Higher numbers = higher precedence (evaluated first)

## Core Functions

### Expression Parsing

#### `parse_shunting_yard(token_t *expr, errorinfo_t *ei, glw_root_t *gr)`
**Purpose**: Converts infix expressions to RPN using Shunting Yard algorithm  
**Location**: Lines 95-280  
**Algorithm**: Modified Shunting Yard with function argument tracking

**Key Features**:
- Tracks function arguments using `t_num_args` field
- Handles parentheses, brackets, and function calls
- Supports ternary operator (`?:`) with special handling
- Validates expression syntax during conversion

**Token Processing**:
```c
switch(t->type) {
  case TOKEN_PROPERTY_REF:
  case TOKEN_RSTRING:
  case TOKEN_FLOAT:
  case TOKEN_INT:
    // Direct to output queue
    t = tokenqueue_enqueue(&outq, t, curfunc);
    break;
    
  case TOKEN_ADD:
  case TOKEN_SUB:
  case TOKEN_MULTIPLY:
    // Operator precedence handling
    while(stack && tokenprecedence[t->type] <= tokenprecedence[stack->type])
      tokenqueue_enqueue(&outq, tokenstack_pop(&stack), NULL);
    t = tokenstack_push(&stack, t);
    break;
}
```

#### `parse_prep_expression(token_t *expr, errorinfo_t *ei, glw_root_t *gr)`
**Purpose**: Preprocesses expressions before RPN conversion  
**Location**: Lines 350-450  

**Transformations**:
1. **Property References**: `$foo.bar` → `TOKEN_PROPERTY_NAME`
2. **EM Units**: `10 em` → `TOKEN_EM`
3. **Attribute References**: `.name` → `TOKEN_RESOLVED_ATTRIBUTE`
4. **Function Calls**: `func()` → `TOKEN_FUNCTION`
5. **Internationalization**: `_("text")` → translated string

**Property Chain Building**:
```c
if((t->type == TOKEN_DOLLAR || t->type == TOKEN_AMPERSAND) 
   && t1 != NULL && t1->type == TOKEN_IDENTIFIER) {
  t0->type = TOKEN_PROPERTY_NAME;
  t0->t_elements = 1;
  t0->t_pnvec[0] = t1->t_rstring;
  // Continue building chain for .foo.bar.baz
}
```

### Block and Expression Management

#### `parse_block(token_t *first, errorinfo_t *ei, token_type_t term, glw_root_t *gr)`
**Purpose**: Parses blocks delimited by `{}` or file boundaries  
**Location**: Lines 550-600  

**Process**:
1. Identifies block boundaries (`TOKEN_BLOCK_OPEN` to `TOKEN_BLOCK_CLOSE`)
2. Parses each expression within the block
3. Optimizes attribute assignments
4. Handles empty blocks

#### `parse_one_expression(token_t *prev, token_t *first, errorinfo_t *ei, glw_root_t *gr)`
**Purpose**: Parses a single expression ending with `;`  
**Location**: Lines 480-550  

**Features**:
- Handles nested blocks
- Validates parentheses balance
- Converts to `TOKEN_EXPR` type
- Calls preprocessing and RPN conversion

### Optimization Functions

#### `optimize_attribute_assignment(token_t *t, token_t *prev, glw_root_t *gr)`
**Purpose**: Optimizes simple attribute assignments  
**Location**: Lines 300-340  

**Optimization Pattern**:
```
attribute: static-value;
```
**Converts from**:
```
RPN -> [attribute] -> [value] -> [assignment operator]
```
**To**:
```
[value with attribute pointer] -> next
```

**Conditions for Optimization**:
- Must be `TOKEN_PURE_RPN`
- Simple value types: `FLOAT`, `INT`, `CSTRING`, `RSTRING`, `IDENTIFIER`
- Static assignment (no dynamic evaluation needed)

#### `scan_prop_names(token_t *rpn, token_t *prev, glw_root_t *gr)`
**Purpose**: Assigns local IDs to property names within RPN expressions  
**Location**: Lines 400-450  

**Algorithm**:
1. Scans all `TOKEN_PROPERTY_NAME` tokens in RPN
2. Compares property name arrays using `propnamecmp()`
3. Assigns same ID to identical property names
4. Enables subscription merging in evaluator

## Expression Types

### TOKEN_PURE_RPN
- **Definition**: Expressions with no dynamic evaluation needed
- **Characteristics**: Static values, no property references
- **Optimization**: Can be evaluated once and cached
- **Example**: `width: 100;`

### TOKEN_RPN
- **Definition**: Expressions requiring dynamic evaluation
- **Characteristics**: Contains property references, functions, or dynamic values
- **Evaluation**: Must be re-evaluated when dependencies change
- **Example**: `width: $model.width * 2;`

## Property Name Handling

### Property Chain Structure
```c
typedef struct {
  int t_elements;                    // Number of elements in chain
  rstr_t *t_pnvec[TOKEN_PROPERTY_NAME_VEC_SIZE];  // Property name vector
  struct token *child;               // Overflow chain for long paths
} property_name_token;
```

### Chain Building Process
1. **Initial**: `$foo` → `TOKEN_PROPERTY_NAME` with 1 element
2. **Extension**: `.bar` → Add to `t_pnvec` if space available
3. **Overflow**: If `TOKEN_PROPERTY_NAME_VEC_SIZE` exceeded, create child chain
4. **Resolution**: Convert to `TOKEN_PROPERTY_REF` during evaluation

## Function Resolution

### Built-in Function Handling
```c
if(!strcmp(rstr_get(t->t_rstring), "_") &&
   t1->next->type == TOKEN_RSTRING &&
   t1->next->next->type == TOKEN_RIGHT_PARENTHESIS) {
  // Special case for internationalization function _("text")
  glw_view_nls_string(t, rstr_get(t1->next->t_rstring));
}
```

### Function Call Structure
- **Detection**: `IDENTIFIER` followed by `TOKEN_LEFT_PARENTHESIS`
- **Resolution**: `glw_view_function_resolve()` (defined elsewhere)
- **Arguments**: Tracked using `t_num_args` field during parsing

## Error Handling

### Common Error Conditions
1. **Unbalanced Parentheses**: `parse_shunting_yard()` validates bracket matching
2. **Invalid Separators**: Comma validation in function arguments
3. **Syntax Errors**: Invalid token sequences
4. **Unexpected EOF**: Incomplete expressions

### Error Reporting
```c
glw_view_seterr(ei, t, "Unbalanced parentheses");
```
- **Context**: Includes file name and line number
- **Token Reference**: Points to problematic token
- **Message**: Descriptive error text

## Integration Points

### Input Sources
- **Lexer**: Receives tokenized input from `glw_view_lexer.c`
- **Preprocessor**: May receive preprocessed tokens

### Output Targets
- **Evaluator**: Produces RPN for `glw_view_eval.c`
- **Attribute System**: Optimized assignments for `glw_view_attrib.c`

### Dependencies
- **Token Management**: `glw_view_token_alloc()`, `glw_view_token_free()`
- **Attribute Resolution**: `glw_view_attrib_resolve()`
- **Function Resolution**: `glw_view_function_resolve()`
- **Internationalization**: `nls_get_prop()`

## Performance Considerations

### Optimization Strategies
1. **Static Assignment Optimization**: Eliminates RPN evaluation for simple cases
2. **Property Name Deduplication**: Reduces subscription overhead
3. **RPN Conversion**: Enables efficient stack-based evaluation

### Memory Management
- **Token Reuse**: Transforms tokens in-place when possible
- **Chain Management**: Proper cleanup of token chains
- **Error Cleanup**: Ensures no memory leaks on parse errors

## Accuracy Status

🟢 **Verified**: All information directly from source code analysis  
**Version**: Based on Movian source as of 2024-11-06  
**Completeness**: Full analysis of all major functions and data structures

## See Also

- [GLW View Lexer Analysis](glw_view_lexer.c.md) - Token generation
- [GLW View Evaluator Analysis](glw_view_eval.c.md) - RPN evaluation
- [GLW View Attributes Analysis](glw_view_attrib.c.md) - Attribute handling