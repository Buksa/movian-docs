# GLW View File Syntax Test Suite

This directory contains comprehensive test view files that validate the documented GLW view file syntax. Each test file focuses on specific syntax features and serves as both validation and reference examples.

## Test Files

### test-lexical-elements.view
Tests fundamental lexical elements:
- Comments (single-line `//` and multi-line `/* */`)
- String literals (double-quoted `"..."` and single-quoted `'...'`)
- Numeric literals (integers, floats, EM units)
- Boolean constants (`true`, `false`, `void`)
- Identifiers and naming rules

**Validates**: Syntax Reference § Lexical Elements

### test-operators.view
Tests all operator types and precedence:
- Assignment operators (`=`, `?=`, `<-`, `:=`, `_=_`)
- Arithmetic operators (`+`, `-`, `*`, `/`, `%`)
- Comparison operators (`==`, `!=`, `<`, `>`)
- Logical operators (`&&`, `||`, `^^`, `!`)
- Ternary operator (`? :`)
- Null coalescing operator (`??`)
- Operator precedence and associativity

**Validates**: Syntax Reference § Operators

### test-expressions.view
Tests expression evaluation:
- Static expressions (evaluated at parse time)
- Dynamic expressions (evaluated at runtime)
- Color expressions (hex `#RGB` and RGB vectors `[r,g,b]`)
- Type coercion (int↔float, number↔string)
- Complex nested expressions
- Boolean conversion rules

**Validates**: Syntax Reference § Expressions

### test-properties.view
Tests property reference system:
- Basic property references (`$property`)
- Property chains (`$object.property.subproperty`)
- Property roots (`$self`, `$parent`, `$page`, `$global`, `$ui`, `$args`, `$clone`)
- Property binding with link assignment (`<-`)
- Property references in expressions
- Null coalescing with properties

**Validates**: Syntax Reference § Property References

### test-widgets.view
Tests widget definition syntax:
- Container widgets (`container_x`, `container_y`, `container_z`)
- Content widgets (`label`, `image`, `quad`)
- List widgets (`list_x`, `list_y`)
- Widget attributes and their types
- Widget nesting and hierarchy
- Cloner and loader widgets

**Validates**: Elements Reference (all widget types)

### test-preprocessor.view
Tests preprocessor directives:
- `#include` directive (loads file each time)
- `#import` directive (loads file once)
- File path resolution (relative, skin://, dataroot://)
- Multiple includes/imports
- Nested includes

**Validates**: Syntax Reference § Preprocessor Directives

### test-macros.view
Tests macro system:
- Simple macro definitions
- Macros with arguments
- Macros with default arguments
- Positional argument invocation
- Named argument invocation
- Nested macro invocations
- Complex macros with multiple widgets

**Validates**: Syntax Reference § Preprocessor Directives § #define

### test-advanced.view
Tests advanced features:
- Cloner pattern with `$self` and `$clone.index`
- Event handlers (`onEvent`)
- Loader widget with dynamic sources
- Complex property bindings
- Advanced layout patterns
- Multi-layer compositions with `container_z`

**Validates**: Multiple sections (integration testing)

## Running Tests

### Syntax Validation

Run the syntax validator to check all test files:

```bash
node ../view-syntax-validator.js
```

With verbose output:

```bash
node ../view-syntax-validator.js --verbose
```

### Test a Specific File

```bash
node ../view-syntax-validator.js --test-file=test-lexical-elements.view
```

## Test Results

Test results are saved to:
- **JSON Report**: `../results/view-syntax-validation-report.json`
- **Console Output**: Real-time pass/fail status

## Validation Criteria

Each test file is validated for:

1. **Syntax Correctness**
   - Balanced braces `{}`
   - Properly terminated strings
   - Valid token sequences

2. **Feature Coverage**
   - Contains documented syntax elements
   - Uses correct operator syntax
   - Follows documented patterns

3. **Documentation Alignment**
   - Matches syntax reference documentation
   - Uses documented widget types
   - Follows documented attribute patterns

## Adding New Tests

To add a new test file:

1. Create `test-<feature>.view` in this directory
2. Add comprehensive examples of the feature
3. Include comments explaining what's being tested
4. Update `view-syntax-validator.js` to include the new test
5. Run validator to ensure it passes
6. Update this README with the new test description

## Test File Format

Each test file should follow this structure:

```
/**
 * Test: <Feature Name>
 * 
 * Tests <feature description>:
 * - Feature aspect 1
 * - Feature aspect 2
 * - ...
 */

// Test: Specific aspect
<widget> {
  // Example code
}

// Test: Another aspect
<widget> {
  // Example code
}
```

## Notes

- Test files use syntax that should be valid according to the documentation
- Files don't need to be functionally complete (e.g., referenced files don't need to exist)
- Focus is on syntax validation, not runtime behavior
- Comments explain what each section tests
- Examples should be clear and demonstrate documented features

## Accuracy Status

🟢 **Verified**: All test files based on documented syntax from source code analysis  
**Last Updated**: 2024-11-06  
**Documentation Version**: Movian 4.8+

## See Also

- [Syntax Reference](../../ui/view-files/syntax-reference.md) - Complete syntax documentation
- [Elements Reference](../../ui/view-files/elements-reference.md) - Widget catalog
- [Attributes Reference](../../ui/view-files/attributes-reference.md) - Attribute catalog
- [Test Suite README](../README.md) - Main test documentation
