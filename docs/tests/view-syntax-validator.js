#!/usr/bin/env node

/**
 * GLW View File Syntax Validator
 * 
 * Validates view file syntax against documented GLW syntax rules.
 * Tests lexical elements, operators, expressions, and widget definitions.
 * 
 * Usage:
 *   node view-syntax-validator.js [--verbose] [--test-file=path]
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Verbose mode flag
let verbose = process.argv.includes('--verbose');

/**
 * Log functions
 */
function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  if (verbose) {
    log(`  ${message}`, colors.cyan);
  }
}

function section(title) {
  log(`\n${title}`, colors.bright + colors.blue);
  log('='.repeat(title.length), colors.blue);
}

/**
 * Test runner
 */
function runTest(name, testFn) {
  results.total++;
  try {
    testFn();
    results.passed++;
    success(name);
    return true;
  } catch (err) {
    results.failed++;
    error(`${name}: ${err.message}`);
    results.errors.push({ test: name, error: err.message });
    return false;
  }
}

/**
 * Assertion helpers
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertFileExists(filePath) {
  assert(fs.existsSync(filePath), `File does not exist: ${filePath}`);
}

function assertFileContains(filePath, pattern, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  assert(regex.test(content), `File ${filePath} should contain ${description}`);
}

function assertValidSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Basic syntax checks
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  assert(openBraces === closeBraces, `Unbalanced braces in ${filePath}`);
  
  // Check for unterminated strings
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }
    
    // Check for unterminated double-quoted strings
    const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
    if (doubleQuotes % 2 !== 0) {
      throw new Error(`Unterminated string on line ${idx + 1}: ${line.trim()}`);
    }
    
    // Check for unterminated single-quoted strings
    const singleQuotes = (line.match(/(?<!\\)'/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      throw new Error(`Unterminated string on line ${idx + 1}: ${line.trim()}`);
    }
  });
}

/**
 * Test view file paths
 */
const testDir = path.join(__dirname, 'view-syntax-tests');
const testFiles = {
  lexical: path.join(testDir, 'test-lexical-elements.view'),
  operators: path.join(testDir, 'test-operators.view'),
  expressions: path.join(testDir, 'test-expressions.view'),
  properties: path.join(testDir, 'test-properties.view'),
  widgets: path.join(testDir, 'test-widgets.view'),
  preprocessor: path.join(testDir, 'test-preprocessor.view'),
  macros: path.join(testDir, 'test-macros.view'),
  advanced: path.join(testDir, 'test-advanced.view')
};

/**
 * Test Suite: Lexical Elements
 */
function testLexicalElements() {
  section('Testing Lexical Elements');
  
  runTest('Lexical test file exists', () => {
    assertFileExists(testFiles.lexical);
  });
  
  runTest('Contains comment examples', () => {
    assertFileContains(testFiles.lexical, /\/\/.*Single line comment/, 'single-line comments');
    assertFileContains(testFiles.lexical, /\/\*[\s\S]*?\*\//, 'multi-line comments');
  });
  
  runTest('Contains string literals', () => {
    assertFileContains(testFiles.lexical, /"[^"]*"/, 'double-quoted strings');
    assertFileContains(testFiles.lexical, /'[^']*'/, 'single-quoted strings');
  });
  
  runTest('Contains numeric literals', () => {
    assertFileContains(testFiles.lexical, /\b\d+\b/, 'integer literals');
    assertFileContains(testFiles.lexical, /\b\d+\.\d+\b/, 'float literals');
  });
  
  runTest('Contains EM units', () => {
    assertFileContains(testFiles.lexical, /\d+(\.\d+)?\s*em\b/, 'EM unit literals');
  });
  
  runTest('Contains boolean constants', () => {
    assertFileContains(testFiles.lexical, /\btrue\b/, 'true constant');
    assertFileContains(testFiles.lexical, /\bfalse\b/, 'false constant');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.lexical);
  });
}

/**
 * Test Suite: Operators
 */
function testOperators() {
  section('Testing Operators');
  
  runTest('Operators test file exists', () => {
    assertFileExists(testFiles.operators);
  });
  
  runTest('Contains assignment operators', () => {
    assertFileContains(testFiles.operators, /=\s*[^=]/, 'standard assignment');
    assertFileContains(testFiles.operators, /\?=/, 'conditional assignment');
    assertFileContains(testFiles.operators, /<-/, 'link assignment');
  });
  
  runTest('Contains arithmetic operators', () => {
    assertFileContains(testFiles.operators, /\+/, 'addition');
    assertFileContains(testFiles.operators, /-/, 'subtraction');
    assertFileContains(testFiles.operators, /\*/, 'multiplication');
    assertFileContains(testFiles.operators, /\//, 'division');
  });
  
  runTest('Contains comparison operators', () => {
    assertFileContains(testFiles.operators, /==/, 'equality');
    assertFileContains(testFiles.operators, /!=/, 'inequality');
    assertFileContains(testFiles.operators, /<[^-]/, 'less than');
    assertFileContains(testFiles.operators, />/, 'greater than');
  });
  
  runTest('Contains logical operators', () => {
    assertFileContains(testFiles.operators, /&&/, 'logical AND');
    assertFileContains(testFiles.operators, /\|\|/, 'logical OR');
    assertFileContains(testFiles.operators, /!/, 'logical NOT');
  });
  
  runTest('Contains ternary operator', () => {
    assertFileContains(testFiles.operators, /\?[^=].*:/, 'ternary operator');
  });
  
  runTest('Contains null coalescing operator', () => {
    assertFileContains(testFiles.operators, /\?\?/, 'null coalescing');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.operators);
  });
}

/**
 * Test Suite: Expressions
 */
function testExpressions() {
  section('Testing Expressions');
  
  runTest('Expressions test file exists', () => {
    assertFileExists(testFiles.expressions);
  });
  
  runTest('Contains static expressions', () => {
    assertFileContains(testFiles.expressions, /=\s*\d+\s*[+\-*/]\s*\d+/, 'arithmetic expressions');
  });
  
  runTest('Contains dynamic expressions', () => {
    assertFileContains(testFiles.expressions, /\$\w+/, 'property references');
  });
  
  runTest('Contains color expressions', () => {
    assertFileContains(testFiles.expressions, /#[0-9A-Fa-f]{3,6}/, 'hex colors');
    assertFileContains(testFiles.expressions, /\[\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\]/, 'RGB vectors');
  });
  
  runTest('Contains complex expressions', () => {
    assertFileContains(testFiles.expressions, /\(.*\?.*:.*\)/, 'nested ternary');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.expressions);
  });
}

/**
 * Test Suite: Property References
 */
function testProperties() {
  section('Testing Property References');
  
  runTest('Properties test file exists', () => {
    assertFileExists(testFiles.properties);
  });
  
  runTest('Contains property references', () => {
    assertFileContains(testFiles.properties, /\$\w+/, 'basic property reference');
    assertFileContains(testFiles.properties, /\$\w+\.\w+/, 'property chain');
  });
  
  runTest('Contains property roots', () => {
    assertFileContains(testFiles.properties, /\$self\b/, '$self reference');
    assertFileContains(testFiles.properties, /\$parent\b/, '$parent reference');
    assertFileContains(testFiles.properties, /\$page\b/, '$page reference');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.properties);
  });
}

/**
 * Test Suite: Widget Definitions
 */
function testWidgets() {
  section('Testing Widget Definitions');
  
  runTest('Widgets test file exists', () => {
    assertFileExists(testFiles.widgets);
  });
  
  runTest('Contains container widgets', () => {
    assertFileContains(testFiles.widgets, /container_x\s*{/, 'container_x');
    assertFileContains(testFiles.widgets, /container_y\s*{/, 'container_y');
    assertFileContains(testFiles.widgets, /container_z\s*{/, 'container_z');
  });
  
  runTest('Contains content widgets', () => {
    assertFileContains(testFiles.widgets, /label\s*{/, 'label widget');
    assertFileContains(testFiles.widgets, /image\s*{/, 'image widget');
  });
  
  runTest('Contains list widgets', () => {
    assertFileContains(testFiles.widgets, /list_[xy]\s*{/, 'list widgets');
  });
  
  runTest('Contains widget attributes', () => {
    assertFileContains(testFiles.widgets, /caption\s*=/, 'caption attribute');
    assertFileContains(testFiles.widgets, /width\s*=/, 'width attribute');
    assertFileContains(testFiles.widgets, /alpha\s*=/, 'alpha attribute');
  });
  
  runTest('Contains nested widgets', () => {
    const content = fs.readFileSync(testFiles.widgets, 'utf8');
    const hasNesting = /container_[xyz]\s*{[^}]*(?:label|image|container_[xyz])\s*{/.test(content);
    assert(hasNesting, 'Should contain nested widget definitions');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.widgets);
  });
}

/**
 * Test Suite: Preprocessor Directives
 */
function testPreprocessor() {
  section('Testing Preprocessor Directives');
  
  runTest('Preprocessor test file exists', () => {
    assertFileExists(testFiles.preprocessor);
  });
  
  runTest('Contains #include directive', () => {
    assertFileContains(testFiles.preprocessor, /#include\s+"[^"]+\.view"/, '#include directive');
  });
  
  runTest('Contains #import directive', () => {
    assertFileContains(testFiles.preprocessor, /#import\s+"[^"]+\.view"/, '#import directive');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.preprocessor);
  });
}

/**
 * Test Suite: Macros
 */
function testMacros() {
  section('Testing Macros');
  
  runTest('Macros test file exists', () => {
    assertFileExists(testFiles.macros);
  });
  
  runTest('Contains macro definitions', () => {
    assertFileContains(testFiles.macros, /#define\s+\w+\s*\([^)]*\)\s*{/, 'macro definition');
  });
  
  runTest('Contains macro invocations', () => {
    const content = fs.readFileSync(testFiles.macros, 'utf8');
    // Look for macro calls (identifier followed by parentheses)
    const hasMacroCalls = /\w+\s*\([^)]*\)/.test(content);
    assert(hasMacroCalls, 'Should contain macro invocations');
  });
  
  runTest('Contains macro with default arguments', () => {
    assertFileContains(testFiles.macros, /#define\s+\w+\s*\([^)]*=/, 'macro with defaults');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.macros);
  });
}

/**
 * Test Suite: Advanced Features
 */
function testAdvanced() {
  section('Testing Advanced Features');
  
  runTest('Advanced test file exists', () => {
    assertFileExists(testFiles.advanced);
  });
  
  runTest('Contains cloner pattern', () => {
    assertFileContains(testFiles.advanced, /cloner\s*{/, 'cloner widget');
    assertFileContains(testFiles.advanced, /\$self/, '$self in cloner context');
  });
  
  runTest('Contains event handlers', () => {
    assertFileContains(testFiles.advanced, /onEvent\s*\(/, 'event handler');
  });
  
  runTest('Contains loader widget', () => {
    assertFileContains(testFiles.advanced, /loader\s*{/, 'loader widget');
  });
  
  runTest('Valid syntax structure', () => {
    assertValidSyntax(testFiles.advanced);
  });
}

/**
 * Generate test report
 */
function generateReport() {
  section('Test Summary');
  
  log(`Total Tests: ${results.total}`, colors.bright);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, results.failed > 0 ? colors.red : colors.green);
  
  if (results.failed > 0) {
    log('\nFailed Tests:', colors.red + colors.bright);
    results.errors.forEach(err => {
      log(`  • ${err.test}`, colors.red);
      log(`    ${err.error}`, colors.yellow);
    });
  }
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%`, passRate === '100.0' ? colors.green : colors.yellow);
  
  // Save JSON report
  const reportPath = path.join(__dirname, 'results', 'view-syntax-validation-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      passRate: parseFloat(passRate)
    },
    errors: results.errors
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nReport saved to: ${reportPath}`, colors.cyan);
  
  return results.failed === 0;
}

/**
 * Main execution
 */
function main() {
  log('GLW View File Syntax Validator', colors.bright + colors.cyan);
  log('================================\n', colors.cyan);
  
  // Check if test directory exists
  if (!fs.existsSync(testDir)) {
    error(`Test directory not found: ${testDir}`);
    error('Please run the test file generator first.');
    process.exit(1);
  }
  
  // Run all test suites
  testLexicalElements();
  testOperators();
  testExpressions();
  testProperties();
  testWidgets();
  testPreprocessor();
  testMacros();
  testAdvanced();
  
  // Generate report and exit
  const success = generateReport();
  process.exit(success ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runTest,
  assert,
  assertFileExists,
  assertFileContains,
  assertValidSyntax
};
