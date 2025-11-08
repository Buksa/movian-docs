#!/usr/bin/env node

/**
 * GLW Macro Usage Validator
 * 
 * Validates macro definitions and usage in view files against documented patterns.
 * Tests macro syntax, parameter handling, and invocation patterns.
 * 
 * Usage:
 *   node macro-validator.js [--verbose] [--skin-path=path]
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
  warnings: 0,
  errors: []
};

// Verbose mode flag
let verbose = process.argv.includes('--verbose');

// Extract skin path from arguments
let skinPath = null;
const skinPathArg = process.argv.find(arg => arg.startsWith('--skin-path='));
if (skinPathArg) {
  skinPath = skinPathArg.split('=')[1];
}

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

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
  results.warnings++;
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

/**
 * Macro pattern definitions
 */
const macroPatterns = {
  // Macro definition pattern: #define NAME(PARAMS) { ... }
  definition: /#define\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*{/g,
  
  // Macro invocation pattern: NAME(args);
  invocation: /\b([A-Z][A-Za-z0-9_]*)\s*\(/g,
  
  // Parameter with default: PARAM=value
  paramWithDefault: /([A-Z_][A-Z0-9_]*)\s*=\s*([^,)]+)/g,
  
  // Parameter without default: PARAM
  paramWithoutDefault: /([A-Z_][A-Z0-9_]*)/g
};

/**
 * Known macro categories from theme.view
 */
const knownMacroCategories = {
  visual: ['ListItemBevel', 'GridItemBevel', 'CardShadow'],
  interactive: ['ListItemHighlight', 'GridItemHighlight', 'GridItemHighlight2', 'ButtonHighlight'],
  navigation: ['BackButton', 'PageHeader', 'PageHeader0', 'SidebarAction'],
  controls: ['ScrollBar', 'SearchBar', 'PlaydeckButton', 'SettingsItem', 'SidebarButton', 'SidebarButtonToggle', 'SidebarInteger'],
  layout: ['GridContainer', 'ListContainer']
};

/**
 * Parse macro definitions from a file
 */
function parseMacroDefinitions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const macros = [];
  
  let match;
  const defPattern = /#define\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*{/g;
  
  while ((match = defPattern.exec(content)) !== null) {
    const name = match[1];
    const paramsStr = match[2].trim();
    
    // Parse parameters
    const params = [];
    if (paramsStr) {
      const paramList = paramsStr.split(',').map(p => p.trim());
      paramList.forEach(param => {
        if (param.includes('=')) {
          const [paramName, defaultValue] = param.split('=').map(s => s.trim());
          params.push({ name: paramName, hasDefault: true, defaultValue });
        } else {
          params.push({ name: param, hasDefault: false });
        }
      });
    }
    
    macros.push({
      name,
      params,
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return macros;
}

/**
 * Parse macro invocations from a file
 */
function parseMacroInvocations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const invocations = [];
  
  // Remove comments to avoid false positives
  const cleanContent = content
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  
  let match;
  const invPattern = /\b([A-Z][A-Za-z0-9_]*)\s*\(/g;
  
  while ((match = invPattern.exec(cleanContent)) !== null) {
    const name = match[1];
    
    // Skip if it's a #define
    const beforeMatch = cleanContent.substring(Math.max(0, match.index - 10), match.index);
    if (beforeMatch.includes('#define')) {
      continue;
    }
    
    invocations.push({
      name,
      line: cleanContent.substring(0, match.index).split('\n').length
    });
  }
  
  return invocations;
}

/**
 * Validate macro definition syntax
 */
function validateMacroDefinition(macro, filePath) {
  const issues = [];
  
  // Check naming convention (PascalCase)
  if (!/^[A-Z][A-Za-z0-9]*$/.test(macro.name)) {
    issues.push(`Macro name '${macro.name}' should use PascalCase`);
  }
  
  // Check parameter naming (UPPER_CASE)
  macro.params.forEach(param => {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(param.name)) {
      issues.push(`Parameter '${param.name}' should use UPPER_CASE`);
    }
  });
  
  // Check that required parameters come before optional ones
  let foundOptional = false;
  macro.params.forEach(param => {
    if (param.hasDefault) {
      foundOptional = true;
    } else if (foundOptional) {
      issues.push(`Required parameter '${param.name}' should come before optional parameters`);
    }
  });
  
  return issues;
}

/**
 * Validate theme.view file
 */
function validateThemeFile(themeFilePath) {
  section('Validating theme.view');
  
  runTest('theme.view file exists', () => {
    assert(fs.existsSync(themeFilePath), `File not found: ${themeFilePath}`);
  });
  
  if (!fs.existsSync(themeFilePath)) {
    return;
  }
  
  const macros = parseMacroDefinitions(themeFilePath);
  
  runTest('Contains macro definitions', () => {
    assert(macros.length > 0, 'No macro definitions found in theme.view');
    info(`Found ${macros.length} macro definitions`);
  });
  
  runTest('Macro naming conventions', () => {
    const issues = [];
    macros.forEach(macro => {
      const macroIssues = validateMacroDefinition(macro, themeFilePath);
      issues.push(...macroIssues.map(issue => `${macro.name}: ${issue}`));
    });
    
    if (issues.length > 0) {
      throw new Error(`Naming issues found:\n  ${issues.join('\n  ')}`);
    }
  });
  
  runTest('Contains visual effect macros', () => {
    const visualMacros = macros.filter(m => 
      m.name.includes('Bevel') || m.name.includes('Shadow')
    );
    assert(visualMacros.length > 0, 'No visual effect macros found');
    info(`Found ${visualMacros.length} visual effect macros`);
  });
  
  runTest('Contains interactive state macros', () => {
    const interactiveMacros = macros.filter(m => 
      m.name.includes('Highlight')
    );
    assert(interactiveMacros.length > 0, 'No interactive state macros found');
    info(`Found ${interactiveMacros.length} interactive state macros`);
  });
  
  runTest('Contains navigation macros', () => {
    const navMacros = macros.filter(m => 
      m.name.includes('Button') || m.name.includes('Header')
    );
    assert(navMacros.length > 0, 'No navigation macros found');
    info(`Found ${navMacros.length} navigation macros`);
  });
  
  runTest('Macro parameter validation', () => {
    macros.forEach(macro => {
      if (macro.params.length > 0) {
        info(`${macro.name} has ${macro.params.length} parameters`);
        
        // Check for common parameter patterns
        const paramNames = macro.params.map(p => p.name);
        
        if (macro.name.includes('Button') && !paramNames.includes('EVENT')) {
          warning(`${macro.name} button macro should have EVENT parameter`);
        }
        
        if (macro.name.includes('Header') && !paramNames.includes('TITLE') && !paramNames.includes('CONTENTS')) {
          warning(`${macro.name} header macro should have TITLE or CONTENTS parameter`);
        }
      }
    });
  });
  
  return macros;
}

/**
 * Validate macro usage in view files
 */
function validateMacroUsage(viewFilePath, definedMacros) {
  const fileName = path.basename(viewFilePath);
  
  runTest(`Macro usage in ${fileName}`, () => {
    assert(fs.existsSync(viewFilePath), `File not found: ${viewFilePath}`);
    
    const invocations = parseMacroInvocations(viewFilePath);
    
    if (invocations.length === 0) {
      info(`No macro invocations found in ${fileName}`);
      return;
    }
    
    info(`Found ${invocations.length} macro invocations`);
    
    // Check if invoked macros are defined
    const definedMacroNames = definedMacros.map(m => m.name);
    const undefinedMacros = [];
    
    invocations.forEach(inv => {
      if (!definedMacroNames.includes(inv.name)) {
        // Check if it's a known widget type (not a macro)
        const knownWidgets = ['widget', 'cloner', 'loader', 'style', 'onEvent', 'space'];
        if (!knownWidgets.includes(inv.name)) {
          undefinedMacros.push(`${inv.name} at line ${inv.line}`);
        }
      }
    });
    
    if (undefinedMacros.length > 0) {
      warning(`Potentially undefined macros in ${fileName}:\n  ${undefinedMacros.join('\n  ')}`);
    }
  });
}

/**
 * Validate skin directory structure
 */
function validateSkinStructure(skinDir) {
  section('Validating Skin Structure');
  
  runTest('Skin directory exists', () => {
    assert(fs.existsSync(skinDir), `Skin directory not found: ${skinDir}`);
  });
  
  if (!fs.existsSync(skinDir)) {
    return;
  }
  
  runTest('Required files present', () => {
    const requiredFiles = ['universe.view', 'theme.view', 'README.md'];
    const missingFiles = [];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(skinDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
  });
  
  runTest('universe.view structure', () => {
    const universePath = path.join(skinDir, 'universe.view');
    const content = fs.readFileSync(universePath, 'utf8');
    
    // Check for theme.view import
    assert(content.includes('#import') && content.includes('theme.view'), 
      'universe.view should import theme.view');
    
    // Check for basic widget structure
    assert(content.includes('widget('), 
      'universe.view should contain widget definitions');
  });
  
  runTest('theme.view structure', () => {
    const themePath = path.join(skinDir, 'theme.view');
    const content = fs.readFileSync(themePath, 'utf8');
    
    // Check for macro definitions
    assert(content.includes('#define'), 
      'theme.view should contain macro definitions');
  });
  
  runTest('README.md documentation', () => {
    const readmePath = path.join(skinDir, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf8');
    
    // Check for basic documentation sections
    const hasTitle = /^#\s+.+/m.test(content);
    const hasDescription = content.length > 100;
    
    assert(hasTitle && hasDescription, 
      'README.md should contain title and description');
  });
}

/**
 * Validate complete skin example
 */
function validateSkinExample(skinDir) {
  section(`Validating Skin: ${path.basename(skinDir)}`);
  
  // Validate structure
  validateSkinStructure(skinDir);
  
  // Parse macros from theme.view
  const themeFilePath = path.join(skinDir, 'theme.view');
  const macros = validateThemeFile(themeFilePath);
  
  // Validate macro usage in universe.view
  const universeFilePath = path.join(skinDir, 'universe.view');
  if (fs.existsSync(universeFilePath)) {
    validateMacroUsage(universeFilePath, macros);
  }
  
  // Check for additional view files
  const viewFiles = [];
  function findViewFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findViewFiles(fullPath);
      } else if (entry.name.endsWith('.view') && entry.name !== 'theme.view' && entry.name !== 'universe.view') {
        viewFiles.push(fullPath);
      }
    });
  }
  
  findViewFiles(skinDir);
  
  if (viewFiles.length > 0) {
    info(`Found ${viewFiles.length} additional view files`);
    viewFiles.slice(0, 5).forEach(file => {
      validateMacroUsage(file, macros);
    });
    
    if (viewFiles.length > 5) {
      info(`Skipping validation of ${viewFiles.length - 5} additional view files`);
    }
  }
}

/**
 * Generate test report
 */
function generateReport() {
  section('Test Summary');
  
  log(`Total Tests: ${results.total}`, colors.bright);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, results.failed > 0 ? colors.red : colors.green);
  log(`Warnings: ${results.warnings}`, results.warnings > 0 ? colors.yellow : colors.green);
  
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
  const reportPath = path.join(__dirname, 'results', 'macro-validation-report.json');
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
      warnings: results.warnings,
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
  log('GLW Macro Usage Validator', colors.bright + colors.cyan);
  log('==========================\n', colors.cyan);
  
  // Determine skin paths to validate
  const skinPaths = [];
  
  if (skinPath) {
    skinPaths.push(skinPath);
  } else {
    // Default: validate example skins
    const examplesDir = path.join(__dirname, '..', 'ui', 'theming', 'examples');
    if (fs.existsSync(examplesDir)) {
      const entries = fs.readdirSync(examplesDir, { withFileTypes: true });
      entries.forEach(entry => {
        if (entry.isDirectory()) {
          skinPaths.push(path.join(examplesDir, entry.name));
        }
      });
    }
  }
  
  if (skinPaths.length === 0) {
    error('No skin directories found to validate');
    error('Use --skin-path=<path> to specify a skin directory');
    process.exit(1);
  }
  
  info(`Validating ${skinPaths.length} skin(s)\n`);
  
  // Validate each skin
  skinPaths.forEach(skinDir => {
    validateSkinExample(skinDir);
  });
  
  // Generate report and exit
  const success = generateReport();
  process.exit(success ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  parseMacroDefinitions,
  parseMacroInvocations,
  validateMacroDefinition,
  validateSkinStructure
};
