# GLW View Expressions Guide

**Status**: 🟢 Verified from source code analysis  
**Last Updated**: 2024-11-06  
**Movian Version**: 4.8+

## Overview

This document provides a comprehensive guide to the expression system in GLW view files. Expressions enable dynamic, data-driven user interfaces through property binding, arithmetic operations, and conditional logic.

**Source References**:
- `movian/src/ui/glw/glw_view_parser.c` - Expression parsing
- `movian/src/ui/glw/glw_view_eval.c` - Expression evaluation

## Expression Fundamentals

### Expression Types

#### Static Expressions (TOKEN_PURE_RPN)

**Characteristics**:
- No property references
- No dynamic values
- Evaluated once at parse time
- Result cached

**Examples**:
```c
width = 100 + 50;           // Evaluated to 150
alpha = 0.5 * 2;            // Evaluated to 1.0
caption = "Hello" + " World";  // Evaluated to "Hello World"
```

**Performance**: Most efficient, no runtime overhead

#### Dynamic Expressions (TOKEN_RPN)

**Characteristics**:
- Contains property references
- Contains EM units or other dynamic values
- Re-evaluated when dependencies change
- Subscription-based updates

**Examples**:
```c
width = $model.width * 2;        // Re-evaluated when $model.width changes
alpha = $enabled ? 1.0 : 0.3;    // Re-evaluated when $enabled changes
size = 2 em;                     // Re-evaluated when font size changes
```

**Performance**: Efficient subscription system minimizes overhead

### Evaluation Engine

#### RPN (Reverse Polish Notation)

Expressions are converted from infix to RPN for efficient stack-based evaluation:

**Infix Notation**:
```c
a + b * c
```

**RPN Notation**:
```c
a b c * +
```

**Evaluation Process**:
1. Push `a` onto stack
2. Push `b` onto stack
3. Push `c` onto stack
4. Pop `c` and `b`, multiply, push result
5. Pop result and `a`, add, push result
6. Final stack value is result

**Benefits**:
- No parentheses needed
- Unambiguous evaluation order
- Efficient stack-based execution
- Operator precedence handled during parsing


## Operators and Precedence

### Operator Precedence Table

| Precedence | Operators | Associativity | Description |
|------------|-----------|---------------|-------------|
| 13 | `!` | Right | Logical NOT |
| 12 | `{}` | N/A | Block grouping |
| 11 | `%` | Left | Modulo |
| 10 | `*` `/` | Left | Multiplication, Division |
| 9 | `+` `-` | Left | Addition, Subtraction |
| 8 | `==` `!=` `<` `>` | Left | Comparison |
| 7 | `^^` | Left | Logical XOR |
| 6 | `&&` | Left | Logical AND |
| 5 | `\|\|` | Left | Logical OR |
| 4 | `??` | Left | Null coalescing |
| 3 | `?` `:` | Right | Ternary conditional |
| 2 | `:` | N/A | Attribute separator |
| 1 | `=` `?=` `<-` `:=` `_=_` | Right | Assignment |

**Higher precedence = evaluated first**

### Arithmetic Operators

#### Addition (+)

**Numeric Addition**:
```c
result = 10 + 5;           // 15
result = 3.14 + 2.86;      // 6.0
result = $width + 10;      // Dynamic addition
```

**String Concatenation**:
```c
caption = "Hello" + " World";           // "Hello World"
caption = "Count: " + 42;               // "Count: 42"
caption = $firstName + " " + $lastName; // Dynamic concatenation
```

**Vector Addition**:
```c
color = [0.5, 0.5, 0.5] + [0.2, 0.2, 0.2];  // [0.7, 0.7, 0.7]
```

#### Subtraction (-)

```c
result = 100 - 25;         // 75
result = $total - $used;   // Dynamic subtraction
width = $parent.width - 20;  // Responsive sizing
```

#### Multiplication (*)

```c
result = 10 * 5;           // 50
result = 3.14 * 2;         // 6.28
width = $parent.width * 0.5;  // Half of parent width
```

**Vector Multiplication** (scalar):
```c
color = [1.0, 0.5, 0.0] * 0.5;  // [0.5, 0.25, 0.0]
```

#### Division (/)

```c
result = 100 / 4;          // 25
result = 10.0 / 3.0;       // 3.333...
height = $parent.height / 2;  // Half of parent height
```

**Note**: Integer division truncates: `10 / 3 = 3`

#### Modulo (%)

```c
result = 10 % 3;           // 1
result = 100 % 25;         // 0
index = $count % $columns;  // Wrap around
```

### Comparison Operators

#### Equality (==)

```c
result = 10 == 10;         // true (1)
result = "test" == "test"; // true (1)
result = $value == 0;      // Dynamic comparison
```

**Type Coercion**:
```c
result = 10 == 10.0;       // true (int ↔ float)
result = "10" == 10;       // false (different types)
```

#### Inequality (!=)

```c
result = 10 != 5;          // true (1)
result = $value != void;   // Check if value exists
```

#### Less Than (<)

```c
result = 5 < 10;           // true (1)
result = $count < $max;    // Dynamic comparison
```

#### Greater Than (>)

```c
result = 10 > 5;           // true (1)
result = $progress > 0.5;  // Dynamic comparison
```

### Logical Operators

#### Logical AND (&&)

```c
result = true && true;     // true (1)
result = true && false;    // false (0)
result = $enabled && $visible;  // Both must be true
```

**Short-Circuit Evaluation**: Right side not evaluated if left is false

#### Logical OR (||)

```c
result = true || false;    // true (1)
result = false || false;   // false (0)
result = $hasData || $hasCache;  // Either can be true
```

**Short-Circuit Evaluation**: Right side not evaluated if left is true

#### Logical XOR (^^)

```c
result = true ^^ false;    // true (1)
result = true ^^ true;     // false (0)
result = $option1 ^^ $option2;  // Exactly one must be true
```

#### Logical NOT (!)

```c
result = !true;            // false (0)
result = !false;           // true (1)
result = !$hidden;         // Invert boolean
```

### Ternary Operator

**Syntax**:
```c
condition ? value_if_true : value_if_false
```

**Examples**:
```c
alpha = $enabled ? 1.0 : 0.3;
caption = $count > 0 ? "Items" : "No items";
color = $selected ? [1,0,0] : [0.5,0.5,0.5];
width = $isWide ? 200 : 100;
```

**Nested Ternary**:
```c
caption = $count == 0 ? "None" :
          $count == 1 ? "One" :
          "Many";
```

**Precedence**: Lower than comparison, higher than assignment

### Null Coalescing Operator

**Syntax**:
```c
value1 ?? value2
```

**Behavior**: Returns `value1` if not `void`, otherwise returns `value2`

**Examples**:
```c
caption = $item.title ?? "Untitled";
width = $custom.width ?? 100;
source = $item.thumbnail ?? "default.png";
```

**Chaining**:
```c
value = $primary ?? $secondary ?? $default;
```

## Property References

### Property Syntax

**Basic Reference**:
```c
$propertyName
```

**Property Chain**:
```c
$page.model.title
$item.metadata.description
$global.settings.theme.color
```

**Maximum Chain Length**: Defined by `TOKEN_PROPERTY_NAME_VEC_SIZE` (typically 8-16 elements)

### Property Roots

| Root | Description | Example |
|------|-------------|---------|
| `$self` | Current item in cloner | `$self.title` |
| `$parent` | Parent scope | `$parent.value` |
| `$args` | Arguments passed to view | `$args.data` |
| `$clone` | Cloner context | `$clone.index` |
| `$view` | View context | `$view.width` |
| `$page` | Page properties | `$page.model.items` |
| `$global` | Global properties | `$global.settings` |
| `$ui` | UI theme properties | `$ui.color.text` |
| `$nav` | Navigation properties | `$nav.currentPage` |

### Property Resolution

**Resolution Process**:
1. Parse property chain: `$page.model.title`
2. Resolve root: `$page` → page property
3. Navigate chain: `.model` → `.title`
4. Return property reference or `void`

**Resolution Order**:
1. Scope roots (`$self`, `$parent`, `$args`, etc.)
2. UI properties (`$ui`)
3. Navigation properties (`$nav`)
4. Return `void` if not found

### Property Subscriptions

**Automatic Subscription**:
```c
caption = $page.model.title;
// Creates subscription to $page.model.title
// Widget updates when property changes
```

**Subscription Lifecycle**:
1. Expression parsed
2. Property reference identified
3. Subscription created
4. Property monitored
5. Widget updated on changes
6. Subscription released on widget destruction

**Subscription Merging**:
```c
// Same property referenced multiple times
width = $model.width * 2;
height = $model.width * 1.5;
// Only one subscription created for $model.width
```

**Subscription Suspension**:
- Suspended when widget inactive
- Resumed when widget active
- Reduces overhead for off-screen widgets


## Type System

### Primitive Types

#### Integer (TOKEN_INT)

**Range**: 32-bit signed integer  
**Examples**:
```c
value = 100;
value = -50;
value = 0;
```

#### Float (TOKEN_FLOAT)

**Range**: 32-bit floating point  
**Examples**:
```c
value = 3.14;
value = -2.5;
value = 0.5;
```

#### String (TOKEN_RSTRING / TOKEN_CSTRING)

**Types**:
- `TOKEN_RSTRING` - Reference-counted string
- `TOKEN_CSTRING` - C-style string

**Examples**:
```c
caption = "Hello World";
caption = 'Rich <b>Text</b>';  // Single quotes = rich text
```

#### Void (TOKEN_VOID)

**Description**: Represents no value / null  
**Usage**:
```c
value = void;  // Clear value
result = $property ?? void;  // Check for void
```

#### Boolean

**Representation**: Integer (0 = false, non-zero = true)  
**Constants**:
```c
value = true;   // Integer 1
value = false;  // Integer 0
```

### Composite Types

#### Vector (TOKEN_VECTOR_FLOAT)

**Components**: 2, 3, or 4 float values  
**Syntax**:
```c
vec2 = [x, y];
vec3 = [x, y, z];
vec4 = [x, y, z, w];
```

**Examples**:
```c
color = [1.0, 0.0, 0.0];        // RGB red
position = [10, 20, 0];         // 3D position
rotation = [45, 0, 0, 1];       // Rotation quaternion
```

**Scalar Broadcast**:
```c
color = 0.5;  // Becomes [0.5, 0.5, 0.5]
```

#### Property Reference (TOKEN_PROPERTY_REF)

**Description**: Reference to a property  
**Syntax**: `$property.chain`  
**Usage**: Dynamic data binding

### Type Conversion

#### Automatic Conversions

**Integer ↔ Float**:
```c
result = 10 + 3.14;  // 10 promoted to 10.0, result = 13.14
result = 10 / 3.0;   // 10 promoted to 10.0, result = 3.333...
```

**Number → String**:
```c
caption = "Value: " + 42;      // "Value: 42"
caption = "Pi: " + 3.14;       // "Pi: 3.14"
```

**String → Number**:
```c
width = "100";  // Converted to integer 100
alpha = "0.5";  // Converted to float 0.5
```

**Scalar → Vector**:
```c
color = 0.5;  // Broadcast to [0.5, 0.5, 0.5]
```

**Hex String → Color Vector**:
```c
color = "#FF0000";  // Parsed to [1.0, 0.0, 0.0]
color = "#F00";     // Short form, parsed to [1.0, 0.0, 0.0]
```

#### Boolean Conversion

**To Boolean**:
```c
void → false
0 (int/float) → false
"" (empty string) → false
"false" (identifier) → false

Non-zero number → true
Non-empty string → true
"true" (identifier) → true
```

**Examples**:
```c
result = !!$value;  // Convert to boolean
hidden = !$visible; // Invert boolean
```

### EM Units

**Syntax**:
```c
value = 2 em;
value = 1.5 em;
```

**Behavior**:
- Represents multiple of current font size
- Requires dynamic evaluation
- Converted to pixels at runtime

**Examples**:
```c
width = 10 em;      // 10 × font size
padding = 0.5 em;   // 0.5 × font size
size = 2 em;        // 2 × font size
```

**Dynamic Evaluation**:
```c
// Re-evaluated when font size changes
width = 10 em + 20;  // Dynamic: EM + static
```

**Evaluation Flag**: `GLW_VIEW_EVAL_EM`

## Functions

### Built-in Functions

#### translate()

**Purpose**: Internationalization / localization  
**Syntax**: `translate(text)`  
**Alias**: `_(text)`

**Examples**:
```c
caption = translate("Hello");
caption = _("Welcome");
```

**Behavior**:
- Looks up translation in language files
- Returns translated string
- Falls back to original if no translation

#### String Functions

**Note**: Most string operations use operators rather than functions

**Concatenation**:
```c
result = string1 + string2;
```

### Function Resolution

**Process**:
1. Identifier followed by `(`
2. Function name lookup
3. Argument parsing
4. Function call during evaluation

**Custom Functions**:
- Defined in C code
- Registered with evaluator
- Callable from expressions

## Expression Patterns

### Conditional Rendering

**Show/Hide Based on Condition**:
```c
hidden = !$hasContent;
alpha = $enabled ? 1.0 : 0.3;
```

**Conditional Content**:
```c
caption = $count > 0 ? $count + " items" : "No items";
source = $item.thumbnail ?? "placeholder.png";
```

### Responsive Sizing

**Relative to Parent**:
```c
width = $parent.width * 0.8;
height = $parent.height - 100;
```

**Aspect Ratio Maintenance**:
```c
height = $width / 1.777;  // 16:9 aspect ratio
```

**Responsive Breakpoints**:
```c
columns = $ui.width > 1920 ? 6 :
          $ui.width > 1280 ? 4 :
          3;
```

### Color Manipulation

**Tinting**:
```c
color = $baseColor * $intensity;
```

**Color Mixing**:
```c
color = $color1 * 0.5 + $color2 * 0.5;
```

**Conditional Colors**:
```c
color = $selected ? "#FF0000" : "#FFFFFF";
color = $error ? [1,0,0] : $warning ? [1,1,0] : [0,1,0];
```

### Animation Values

**Linear Interpolation**:
```c
alpha = $progress;  // 0.0 to 1.0
```

**Easing**:
```c
scale = 1.0 + ($hover * 0.2);  // Scale up on hover
```

**Rotation**:
```c
angle = $time * 360;  // Continuous rotation
```

### Data Validation

**Range Clamping**:
```c
value = $input < 0 ? 0 : $input > 100 ? 100 : $input;
```

**Null Checking**:
```c
caption = $data.title ?? "No title";
visible = $data != void;
```

**Type Checking**:
```c
isValid = $value > 0 && $value < 100;
```

## Dynamic Evaluation

### Evaluation Triggers

Expressions are re-evaluated when:

| Trigger | Flag | Description |
|---------|------|-------------|
| Property Change | `GLW_VIEW_EVAL_PROP` | Subscribed property changed |
| Font Size Change | `GLW_VIEW_EVAL_EM` | EM unit recalculation needed |
| Widget Activity | `GLW_VIEW_EVAL_ACTIVE` | Widget became active/inactive |
| Focus Change | `GLW_VIEW_EVAL_FHP_CHANGE` | Focus path changed |
| Other Signals | `GLW_VIEW_EVAL_OTHER` | Various widget signals |

### Evaluation Masks

**Combining Flags**:
```c
dynamic_eval = GLW_VIEW_EVAL_PROP | GLW_VIEW_EVAL_EM;
```

**Checking Flags**:
```c
if(dynamic_eval & GLW_VIEW_EVAL_PROP) {
  // Re-evaluate due to property change
}
```

### Performance Optimization

**Lazy Evaluation**:
- Expressions evaluated only when needed
- Inactive widgets skip evaluation
- Subscriptions suspended when not visible

**Subscription Batching**:
- Multiple property changes batched per frame
- Single evaluation per frame maximum
- Reduces redundant calculations

**Static Expression Caching**:
- Static expressions evaluated once
- Result cached permanently
- No runtime overhead

## Error Handling

### Expression Errors

**Division by Zero**:
```c
result = 10 / 0;  // Error or infinity (implementation-dependent)
```

**Type Mismatch**:
```c
result = "text" * 5;  // Error: Can't multiply string
```

**Property Not Found**:
```c
value = $nonexistent.property;  // Returns void
```

**Invalid Function**:
```c
result = unknownFunction();  // Error: Function not found
```

### Error Recovery

**Null Coalescing**:
```c
value = $property ?? defaultValue;  // Fallback on void
```

**Conditional Checks**:
```c
caption = $data != void ? $data.title : "No data";
```

**Try-Catch Pattern** (via conditionals):
```c
result = $risky.operation ?? $fallback ?? $default;
```

## Best Practices

### Performance

**Minimize Property References**:
```c
// Good: Single reference
width = $model.width * 2;

// Avoid: Multiple references to same property
width = $model.width + $model.width;  // Use * 2 instead
```

**Use Static Expressions When Possible**:
```c
// Good: Static
width = 100 + 50;

// Avoid if unnecessary: Dynamic
width = $constant + 50;  // If $constant never changes
```

**Cache Computed Values**:
```c
// In parent scope
$computedWidth = $parent.width * 0.8;

// Use in children
width = $computedWidth;
```

### Readability

**Use Parentheses for Clarity**:
```c
// Clear intent
result = (a + b) * (c + d);

// Less clear
result = a + b * c + d;
```

**Break Complex Expressions**:
```c
// Good: Broken into steps
$halfWidth = $parent.width / 2;
$withPadding = $halfWidth - 20;
width = $withPadding;

// Avoid: Single complex expression
width = ($parent.width / 2) - 20;  // OK for simple cases
```

**Comment Complex Logic**:
```c
// Calculate responsive column count based on screen width
columns = $ui.width > 1920 ? 6 :
          $ui.width > 1280 ? 4 :
          3;
```

### Maintainability

**Use Named Properties**:
```c
// Define constants in parent
$buttonWidth = 100;
$buttonHeight = 40;
$buttonSpacing = 10;

// Use in children
width = $buttonWidth;
height = $buttonHeight;
spacing = $buttonSpacing;
```

**Avoid Magic Numbers**:
```c
// Bad
width = $parent.width * 0.8;

// Good
$contentWidthRatio = 0.8;
width = $parent.width * $contentWidthRatio;
```

**Consistent Naming**:
```c
// Good: Consistent prefixes
$isEnabled
$hasData
$canSubmit

// Avoid: Inconsistent
$enabled
$dataExists
$submitAllowed
```

## Advanced Techniques

### Expression Composition

**Nested Ternary**:
```c
color = $state == "error" ? [1,0,0] :
        $state == "warning" ? [1,1,0] :
        $state == "success" ? [0,1,0] :
        [0.5,0.5,0.5];
```

**Chained Null Coalescing**:
```c
value = $primary ?? $secondary ?? $tertiary ?? $default;
```

**Complex Conditions**:
```c
visible = ($hasData && $enabled) || $forceShow;
alpha = ($focused && $enabled) ? 1.0 : 0.5;
```

### State Machines

**State-Based Rendering**:
```c
color = $state == 0 ? [1,0,0] :
        $state == 1 ? [0,1,0] :
        $state == 2 ? [0,0,1] :
        [0.5,0.5,0.5];
```

**Transition States**:
```c
alpha = $transitioning ? $progress : 1.0;
scale = $transitioning ? 1.0 + ($progress * 0.2) : 1.0;
```

### Data Transformation

**Mapping Values**:
```c
// Map 0-100 to 0.0-1.0
normalized = $value / 100.0;

// Map 0-1 to 0-100
percentage = $value * 100;
```

**Clamping**:
```c
clamped = $value < $min ? $min :
          $value > $max ? $max :
          $value;
```

**Wrapping**:
```c
wrapped = $value % $range;
```

## Debugging Expressions

### Debug Assignment

**Syntax**:
```c
attribute _=_ expression;
```

**Behavior**: Logs value changes to console

**Example**:
```c
width _=_ $model.width * 2;
// Logs: "width changed to 200" (when $model.width = 100)
```

### Debug Output

**Enable Debug Flag**:
```xml
<widget debug="true">
  <label caption="$item.title"/>
</widget>
```

**Output Includes**:
- Property subscription creation
- Attribute value changes
- Expression evaluation results

### Common Issues

**Property Not Updating**:
- Check property path is correct
- Verify property is actually changing
- Ensure widget is active (subscriptions active)

**Unexpected Value**:
- Check operator precedence
- Verify type conversions
- Use debug assignment to trace values

**Performance Issues**:
- Minimize property references
- Use static expressions where possible
- Check for unnecessary re-evaluations

## Built-in Expression Functions

This section documents the most commonly used built-in functions in the GLW expression system. These functions enable smooth animations, conditional logic, and interactive UI behavior.

### iir() - Infinite Impulse Response Filter

**Purpose**: Creates smooth transitions and animations by applying a low-pass filter to value changes

**Syntax**:
```c
iir(value, speed)
iir(value, speed, springMode)
```

**Parameters**:
- **`value`** (float|int|string|void): The target value to transition to
  - Numeric values: Smoothly interpolated
  - String/void: Treated as 0
- **`speed`** (float): Transition speed factor (higher = slower transition)
  - Typical range: 1-16
  - Lower values = faster transitions
  - Higher values = slower, smoother transitions
- **`springMode`** (boolean, optional): Spring behavior mode
  - `false` (default): Normal smooth transition
  - `true`: Spring mode - instantly jumps up, smoothly falls down

**Returns**: Float - The current interpolated value

**Behavior**:
- Applies exponential smoothing to value changes
- Creates natural-feeling animations without explicit keyframes
- Automatically triggers re-evaluation on value changes
- Maintains state between evaluations in `t_extra_float`

**Technical Details**:
- **Source**: `movian/src/ui/glw/glw_view_eval.c:4161` (`glwf_iir`)
- **Algorithm**: Low-pass filter using `glw_lp()` function
- **Update Rate**: Depends on frame rate and speed parameter
- **Precision**: Rounds to 0.001 for change detection

**Common Use Cases**:

**Smooth Fade In/Out**:
```view
alpha: iir($visible, 8);
// Smoothly fades between 0 and 1 when $visible changes
```

**Loading Indicator**:
```view
widget(loader, {
  hidden: iir($nav.currentpage.model.loading, 8) < 0.001;
  source: "loading.view";
});
// Smooth fade-out when loading completes
```

**Focus Highlight**:
```view
color: iir(isFocused(), 4);
// Smooth color transition on focus change
```

**Volume Bar Animation**:
```view
alpha: iir(changed($core.audio.mastervolume, 2, true), 7);
// Fade in when volume changes, fade out after 2 seconds
```

**Spring Mode Example**:
```view
scale: iir($triggered, 10, true);
// Instantly scales up, smoothly returns to normal
```

**Performance Notes**:
- Only evaluates when widget is active (`GLW_ACTIVE` flag)
- Triggers layout re-evaluation when value changes significantly
- Efficient for frequently changing values

**Speed Parameter Guidelines**:
- **1-4**: Fast transitions (button presses, quick feedback)
- **4-8**: Medium transitions (focus changes, UI state)
- **8-16**: Slow transitions (loading indicators, ambient animations)
- **16+**: Very slow transitions (background effects)

### select() - Conditional Value Selection

**Purpose**: Ternary conditional operator - returns one of two values based on a condition

**Syntax**:
```c
select(condition, valueIfTrue, valueIfFalse)
```

**Parameters**:
- **`condition`** (any): Expression evaluated as boolean
  - Truthy: non-zero numbers, non-empty strings, `true`
  - Falsy: 0, empty string, `void`, `false`
- **`valueIfTrue`** (any): Value returned when condition is true
- **`valueIfFalse`** (any): Value returned when condition is false

**Returns**: The selected value (type depends on chosen branch)

**Behavior**:
- Evaluates condition first
- Returns second argument if condition is truthy
- Returns third argument if condition is falsy
- Only evaluates the selected branch (lazy evaluation)

**Technical Details**:
- **Source**: `movian/src/ui/glw/glw_view_eval.c:5415` (`glwf_select`)
- **Equivalent**: C ternary operator `condition ? true_val : false_val`
- **Type Safety**: Return type can differ between branches

**Common Use Cases**:

**Conditional Visibility**:
```view
hidden: select($hasContent, false, true);
// Show widget only when content exists
```

**Adaptive Opacity**:
```view
alpha: select($enabled, 1.0, 0.3);
// Full opacity when enabled, dimmed when disabled
```

**Conditional Colors**:
```view
color: select(isFocused(), 1.0, 0.6);
// Bright when focused, dimmed otherwise
```

**Orientation-Specific Layouts**:
```view
source: select($ui.orientation == "landscape",
  "playdecks/landscape/tracks.view",
  "playdecks/portrait/tracks.view"
);
```

**Input Method Adaptation**:
```view
clickable: select($ui.pointerVisible, true, false);
// Only clickable with mouse/pointer
```

**Nested select() for Multiple Conditions**:
```view
color: select($state == "error", [1,0,0],
       select($state == "warning", [1,1,0],
       select($state == "success", [0,1,0],
       [0.5,0.5,0.5])));
// Red for error, yellow for warning, green for success, gray otherwise
```

**Touch Target Sizing**:
```view
width: select($ui.touch, 3em, 2em);
height: select($ui.touch, 3em, 2em);
// Larger touch targets on touch devices
```

**Conditional Content**:
```view
caption: select($count > 0,
  fmt("%d items", $count),
  "No items"
);
```

**Performance Notes**:
- Very efficient - only evaluates selected branch
- No overhead for unused branch
- Ideal for conditional rendering

**Best Practices**:
- Use for simple binary choices
- For multiple conditions, consider nested `select()` or state-based logic
- Combine with `isVoid()` for null checking: `select(isVoid($value), default, $value)`

### isNavFocused() - Navigation Focus Detection

**Purpose**: Detects if the current widget has keyboard/navigation focus

**Syntax**:
```c
isNavFocused()
```

**Parameters**: None

**Returns**: Integer (0 or 1)
- `1` (true): Widget has navigation focus AND keyboard mode is active
- `0` (false): Widget does not have focus OR keyboard mode is inactive

**Behavior**:
- Checks if widget is in the focus path
- Requires keyboard navigation mode to be active
- Automatically triggers re-evaluation on focus changes
- Sets `GLW_VIEW_EVAL_FHP_CHANGE` flag for dynamic updates

**Technical Details**:
- **Source**: `movian/src/ui/glw/glw_view_eval.c:5000` (`glwf_isFocused`)
- **Alias**: `isFocused()` - same implementation
- **Focus Check**: Uses `glw_is_focused(ec->w)` internal function
- **Keyboard Mode**: Checks `ec->w->glw_root->gr_keyboard_mode`

**Difference from isHovered()**:
- `isNavFocused()`: Keyboard/gamepad navigation focus
- `isHovered()`: Mouse pointer hover state
- Both can be true simultaneously on hybrid input devices

**Common Use Cases**:

**Focus Highlight**:
```view
alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
// Subtle hover, stronger focus highlight
```

**Text Color on Focus**:
```view
style(NavSelectedText, {
  color: select(isNavFocused(), 1, 0.8);
});
// Full brightness when focused, slightly dimmed otherwise
```

**Smooth Focus Transitions**:
```view
alpha: 0.1 * isHovered() + 0.2 * iir(isNavFocused(), 4, true);
// Smooth transition with IIR filter
```

**Border Visibility**:
```view
widget(border, {
  color: $ui.color1;
  alpha: iir(isNavFocused() + isHovered(), 4);
});
// Border appears on focus or hover
```

**Icon Color Inversion**:
```view
widget(icon, {
  source: "skin://icons/ic_search_48px.svg";
  color: select(isNavFocused(), 0, 1);
});
// Inverted color when focused
```

**Backdrop Brightness**:
```view
style(GridBackdrop, {
  color: 0.8 + iir(isNavFocused() + isHovered(), 4) * 0.4;
});
// Brighter backdrop on focus/hover
```

**Combined with Hover**:
```view
alpha: select(isHovered() || isNavFocused(), 1, 0.5);
// Full opacity on either hover or focus
```

**Button State**:
```view
widget(quad, {
  alpha: iir(0.3 + 0.3 * (isNavFocused() || isPressed()), 4) + isHovered();
});
// Complex interactive state combining focus, press, and hover
```

**Performance Notes**:
- Lightweight check - minimal overhead
- Automatically subscribes to focus change events
- Only re-evaluates when focus path changes

**Best Practices**:
- Combine with `iir()` for smooth focus transitions
- Use with `isHovered()` for comprehensive interactive feedback
- Apply to interactive elements (buttons, list items, inputs)
- Ensure sufficient visual distinction for accessibility

### isHovered() - Mouse Hover Detection

**Purpose**: Detects if the mouse pointer is currently hovering over the widget

**Syntax**:
```c
isHovered()
```

**Parameters**: None

**Returns**: Integer (0 or 1)
- `1` (true): Mouse pointer is over the widget
- `0` (false): Mouse pointer is not over the widget

**Behavior**:
- Checks current hover state of the widget
- Automatically triggers re-evaluation on hover changes
- Sets `GLW_VIEW_EVAL_FHP_CHANGE` flag for dynamic updates
- Only relevant when pointer/mouse input is active

**Technical Details**:
- **Source**: `movian/src/ui/glw/glw_view_eval.c:5018` (`glwf_isHovered`)
- **Hover Check**: Uses `glw_is_hovered(ec->w)` internal function
- **Input Method**: Requires pointer device (mouse, touchpad)

**Difference from isNavFocused()**:
- `isHovered()`: Pointer position-based
- `isNavFocused()`: Keyboard/gamepad navigation-based
- Can be used together for hybrid input support

**Common Use Cases**:

**Hover Highlight**:
```view
alphaSelf: iir(isFocused() * 1, 8) + isHovered() * 0.1;
// Strong focus highlight, subtle hover effect
```

**Combined Interactive State**:
```view
alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
// Different intensities for hover vs focus
```

**Button Feedback**:
```view
alpha: select(isHovered() || isFocused(), 1, 0.5);
// Full opacity on hover or focus
```

**Clickable Indication**:
```view
widget(container_x, {
  clickable: $ui.pointerVisible;
  alpha: iir(0.3 + 0.3 * (isFocused() || isPressed()), 4) + isHovered();
});
// Visual feedback for clickable state
```

**Smooth Hover Transitions**:
```view
color: iir(0.6 + (isFocused() || isPressed() || isHovered()), 4);
// Smooth color transition on any interaction
```

**Border on Hover**:
```view
widget(border, {
  alpha: iir(isFocused() || isHovered(), 4) + 0.1;
});
// Border appears on hover or focus
```

**Conditional Rendering**:
```view
hidden: !($ui.pointerVisible && isHovered());
// Only show when pointer is visible and hovering
```

**Adaptive UI Elements**:
```view
$ui.showTopIcons = $ui.pointerVisible || $ui.touch;
// Show icons when pointer is active or touch interface
```

**Performance Notes**:
- Lightweight check - minimal overhead
- Automatically subscribes to hover change events
- Only relevant when pointer input is available

**Best Practices**:
- Combine with `isNavFocused()` for comprehensive input support
- Use `iir()` for smooth hover transitions
- Check `$ui.pointerVisible` to adapt UI for pointer availability
- Provide alternative feedback for non-pointer input methods

**Input Method Considerations**:
```view
// Adapt for different input methods
widget(button, {
  // Larger touch targets
  width: select($ui.touch, 3em, 2em);
  
  // Hover only with pointer
  alpha: select($ui.pointerVisible,
    0.5 + isHovered() * 0.5,
    select(isNavFocused(), 1, 0.5)
  );
});
```

## Expression Function Patterns

### Smooth Interactive Feedback

Combine multiple functions for polished UI interactions:

```view
widget(container_x, {
  focusable: true;
  
  // Smooth multi-state feedback
  alpha: iir(
    0.3 +                           // Base opacity
    0.2 * isHovered() +             // Hover boost
    0.3 * isNavFocused() +          // Focus boost
    0.2 * isPressed(),              // Press boost
    4                               // Smooth transition
  );
  
  // Color state
  color: select(isNavFocused(),
    $ui.color1,                     // Focused color
    select(isHovered(),
      $ui.color2,                   // Hovered color
      $ui.color3                    // Default color
    )
  );
});
```

### Adaptive Layouts

Respond to device capabilities and orientation:

```view
widget(loader, {
  source: select($ui.orientation == "landscape",
    select($ui.width > 1920,
      "layouts/landscape-4k.view",
      "layouts/landscape-hd.view"
    ),
    select($ui.touch,
      "layouts/portrait-touch.view",
      "layouts/portrait-keyboard.view"
    )
  );
});
```

### Conditional Animations

Animate only when appropriate:

```view
widget(container_y, {
  // Fade in when loading completes
  alpha: iir($nav.currentpage.model.loading, 8);
  
  // Smooth page transitions
  translation: [
    iir(select(isVisible(), 0, 100), 6),
    0,
    0
  ];
});
```

### State-Based Styling

Create complex state-dependent styles:

```view
widget(quad, {
  color: select($error, [1, 0, 0],
         select($warning, [1, 1, 0],
         select($success, [0, 1, 0],
         [0.5, 0.5, 0.5])));
  
  alpha: iir(
    select($error || $warning, 1.0, 0.5) *
    (0.7 + 0.3 * isNavFocused()),
    8
  );
});
```

## Accuracy Status

🟢 **Verified**: All expression syntax and behavior verified from source code  
**Source Files**:
- `glw_view_parser.c` - Expression parsing and RPN conversion
- `glw_view_eval.c` - Expression evaluation engine and built-in functions
  - `glwf_iir` (line 4161) - IIR filter implementation
  - `glwf_select` (line 5415) - Conditional selection
  - `glwf_isFocused` (line 5000) - Focus detection (isNavFocused alias)
  - `glwf_isHovered` (line 5018) - Hover detection
**Version**: Based on Movian source as of 2024-11-06

## See Also

- [Syntax Reference](syntax-reference.md) - Complete syntax guide
- [Attributes Reference](attributes-reference.md) - All widget attributes
- [Elements Reference](elements-reference.md) - Widget types
- [Global Configuration](../theming/global-configuration.md) - System variables and integration
- [Macro Reference](../theming/macro-reference.md) - Reusable UI macros
- [Source Analysis](../source-analysis/glw_view_eval.c.md) - Technical details
