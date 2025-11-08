#!/usr/bin/env node

/**
 * GLW Skin Structure Validator
 * 
 * Validates skin directory structure and organization against documented patterns.
 * Tests file organization, required components, and structural integrity.
 * 
 * Usage:
 *   node skin-structure-validator.js [--verbose] [--skin-path=path]
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
  errors: [],
  skinResults: []
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
 * Skin structure requirements
 */
const skinRequirements = {
  minimal: {
    required: ['universe.view', 'theme.view', 'README.md'],
    recommended: ['background.view', 'loading.view'],
    optional: ['pages/', 'components/']
  },
  standard: {
    required: ['universe.view', 'theme.view', 'README.md', 'pages/'],
    recommended: ['background.view', 'loading.view', 'components/', 'icons/'],
    optional: ['osd/', 'playdecks/', 'popups/', 'items/']
  },
  advanced: {
    required: ['universe.view', 'theme.view', 'README.md', 'pages/', 'osd/', 'playdecks/'],
    recommended: ['background.view', 'loading.view', 'components/', 'icons/', 'popups/', 'items/'],
    optional: ['menu/', 'settings/', 'fonts/', 'images/']
  }
};

/**
 * Detect skin complexity level
 */
function detectSkinLevel(skinDir) {
  const entries = fs.readdirSync(skinDir, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const files = entries.filter(e => e.isFile()).map(e => e.name);
  
  // Count components
  const hasOSD = dirs.includes('osd');
  const hasPlaydecks = dirs.includes('playdecks');
  const hasPages = dirs.includes('pages');
  const hasPopups = dirs.includes('popups');
  const hasComponents = dirs.includes('components');
  
  if (hasOSD && hasPlaydecks && hasPages) {
    return 'advanced';
  } else if (hasPages || hasComponents) {
    return 'standard';
  } else {
    return 'minimal';
  }
}

/**
 * Validate required files
 */
function validateRequiredFiles(skinDir, level) {
  const requirements = skinRequirements[level];
  const missing = [];
  const present = [];
  
  requirements.required.forEach(item => {
    const itemPath = path.join(skinDir, item);
    if (fs.existsSync(itemPath)) {
      present.push(item);
    } else {
      missing.push(item);
    }
  });
  
  return { missing, present, requirements };
}

/**
 * Validate recommended files
 */
function validateRecommendedFiles(skinDir, level) {
  const requirements = skinRequirements[level];
  const missing = [];
  const present = [];
  
  requirements.recommended.forEach(item => {
    const itemPath = path.join(skinDir, item);
    if (fs.existsSync(itemPath)) {
      present.push(item);
    } else {
      missing.push(item);
    }
  });
  
  return { missing, present };
}

/**
 * Analyze directory structure
 */
function analyzeStructure(skinDir) {
  const structure = {
    files: [],
    directories: [],
    viewFiles: [],
    totalSize: 0
  };
  
  function scan(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        structure.directories.push(relPath);
        scan(fullPath, relPath);
      } else {
        structure.files.push(relPath);
        
        if (entry.name.endsWith('.view')) {
          structure.viewFiles.push(relPath);
        }
        
        try {
          const stats = fs.statSync(fullPath);
          structure.totalSize += stats.size;
        } catch (err) {
          // Ignore stat errors
        }
      }
    });
  }
  
  scan(skinDir);
  return structure;
}

/**
 * Validate universe.view
 */
function validateUniverseView(skinDir) {
  const universePath = path.join(skinDir, 'universe.view');
  
  runTest('universe.view exists', () => {
    assert(fs.existsSync(universePath), 'universe.view not found');
  });
  
  if (!fs.existsSync(universePath)) {
    return;
  }
  
  const content = fs.readFileSync(universePath, 'utf8');
  
  runTest('universe.view imports theme.view', () => {
    assert(
      content.includes('#import') && content.includes('theme.view'),
      'universe.view should import theme.view'
    );
  });
  
  runTest('universe.view contains root widget', () => {
    assert(
      content.includes('widget(container_z') || content.includes('widget(container_y') || content.includes('widget(container_x'),
      'universe.view should contain a root container widget'
    );
  });
  
  runTest('universe.view has proper structure', () => {
    // Check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    assert(openBraces === closeBraces, 'Unbalanced braces in universe.view');
  });
  
  // Check for common patterns
  if (content.includes('$ui.')) {
    info('Uses global UI variables');
  }
  
  if (content.includes('$nav.')) {
    info('Uses navigation system');
  }
  
  if (content.includes('loader')) {
    info('Uses dynamic component loading');
  }
  
  if (content.includes('cloner')) {
    info('Uses data-driven widget cloning');
  }
}

/**
 * Validate theme.view
 */
function validateThemeView(skinDir) {
  const themePath = path.join(skinDir, 'theme.view');
  
  runTest('theme.view exists', () => {
    assert(fs.existsSync(themePath), 'theme.view not found');
  });
  
  if (!fs.existsSync(themePath)) {
    return;
  }
  
  const content = fs.readFileSync(themePath, 'utf8');
  
  runTest('theme.view contains macro definitions', () => {
    assert(content.includes('#define'), 'theme.view should contain macro definitions');
  });
  
  runTest('theme.view has proper structure', () => {
    // Check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    assert(openBraces === closeBraces, 'Unbalanced braces in theme.view');
  });
  
  // Count macros
  const macroCount = (content.match(/#define/g) || []).length;
  info(`Contains ${macroCount} macro definitions`);
  
  // Check for common macro categories
  const categories = {
    visual: content.includes('Bevel') || content.includes('Shadow'),
    interactive: content.includes('Highlight'),
    navigation: content.includes('Button') || content.includes('Header'),
    controls: content.includes('ScrollBar') || content.includes('SearchBar')
  };
  
  const foundCategories = Object.keys(categories).filter(k => categories[k]);
  if (foundCategories.length > 0) {
    info(`Macro categories: ${foundCategories.join(', ')}`);
  }
}

/**
 * Validate README.md
 */
function validateReadme(skinDir) {
  const readmePath = path.join(skinDir, 'README.md');
  
  runTest('README.md exists', () => {
    assert(fs.existsSync(readmePath), 'README.md not found');
  });
  
  if (!fs.existsSync(readmePath)) {
    return;
  }
  
  const content = fs.readFileSync(readmePath, 'utf8');
  
  runTest('README.md has title', () => {
    assert(/^#\s+.+/m.test(content), 'README.md should have a title (# heading)');
  });
  
  runTest('README.md has description', () => {
    assert(content.length > 100, 'README.md should have substantial content');
  });
  
  // Check for recommended sections
  const sections = {
    overview: /##\s+Overview/i.test(content),
    features: /##\s+Features/i.test(content),
    installation: /##\s+Installation/i.test(content),
    usage: /##\s+Usage/i.test(content),
    structure: /##\s+Structure/i.test(content)
  };
  
  const foundSections = Object.keys(sections).filter(k => sections[k]);
  if (foundSections.length > 0) {
    info(`Documentation sections: ${foundSections.join(', ')}`);
  } else {
    warning('README.md should include sections like Overview, Features, Installation, Usage');
  }
}

/**
 * Validate directory organization
 */
function validateDirectoryOrganization(skinDir, level) {
  const structure = analyzeStructure(skinDir);
  
  runTest('Skin has view files', () => {
    assert(structure.viewFiles.length > 0, 'No .view files found in skin');
    info(`Found ${structure.viewFiles.length} view files`);
  });
  
  runTest('Skin has reasonable size', () => {
    const sizeMB = (structure.totalSize / (1024 * 1024)).toFixed(2);
    info(`Total size: ${sizeMB} MB`);
    
    // Warn if skin is very large
    if (structure.totalSize > 50 * 1024 * 1024) {
      warning(`Skin size (${sizeMB} MB) is quite large. Consider optimizing assets.`);
    }
  });
  
  // Check for common directories based on level
  if (level === 'advanced' || level === 'standard') {
    runTest('Has pages directory', () => {
      assert(structure.directories.includes('pages'), 'pages/ directory not found');
    });
  }
  
  if (level === 'advanced') {
    runTest('Has OSD directory', () => {
      assert(structure.directories.includes('osd'), 'osd/ directory not found for advanced skin');
    });
    
    runTest('Has playdecks directory', () => {
      assert(structure.directories.includes('playdecks'), 'playdecks/ directory not found for advanced skin');
    });
  }
  
  // Check for organization patterns
  const hasComponents = structure.directories.includes('components');
  const hasIcons = structure.directories.includes('icons');
  const hasPopups = structure.directories.includes('popups');
  
  if (hasComponents) {
    info('Uses components/ for reusable UI elements');
  }
  
  if (hasIcons) {
    info('Uses icons/ for icon assets');
  }
  
  if (hasPopups) {
    info('Uses popups/ for modal dialogs');
  }
}

/**
 * Validate view file syntax
 */
function validateViewFileSyntax(skinDir) {
  const structure = analyzeStructure(skinDir);
  let syntaxErrors = 0;
  
  structure.viewFiles.forEach(viewFile => {
    const filePath = path.join(skinDir, viewFile);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic syntax checks
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        warning(`Unbalanced braces in ${viewFile}`);
        syntaxErrors++;
      }
      
      // Check for unterminated strings
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
          return;
        }
        
        const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
        if (doubleQuotes % 2 !== 0) {
          warning(`Possible unterminated string in ${viewFile}:${idx + 1}`);
          syntaxErrors++;
        }
      });
    } catch (err) {
      warning(`Error reading ${viewFile}: ${err.message}`);
      syntaxErrors++;
    }
  });
  
  runTest('View files have valid syntax', () => {
    assert(syntaxErrors === 0, `Found ${syntaxErrors} syntax issues in view files`);
  });
}

/**
 * Validate complete skin
 */
function validateSkin(skinDir) {
  const skinName = path.basename(skinDir);
  section(`Validating Skin: ${skinName}`);
  
  const skinResult = {
    name: skinName,
    path: skinDir,
    level: null,
    tests: {
      total: results.total,
      passed: results.passed,
      failed: results.failed
    }
  };
  
  // Detect skin level
  const level = detectSkinLevel(skinDir);
  skinResult.level = level;
  info(`Detected skin level: ${level}`);
  
  // Validate required files
  const fileValidation = validateRequiredFiles(skinDir, level);
  runTest('Required files present', () => {
    if (fileValidation.missing.length > 0) {
      throw new Error(`Missing required files: ${fileValidation.missing.join(', ')}`);
    }
    info(`All required files present: ${fileValidation.present.join(', ')}`);
  });
  
  // Validate recommended files
  const recommendedValidation = validateRecommendedFiles(skinDir, level);
  if (recommendedValidation.missing.length > 0) {
    warning(`Missing recommended files: ${recommendedValidation.missing.join(', ')}`);
  } else {
    info(`All recommended files present`);
  }
  
  // Validate core files
  validateUniverseView(skinDir);
  validateThemeView(skinDir);
  validateReadme(skinDir);
  
  // Validate directory organization
  validateDirectoryOrganization(skinDir, level);
  
  // Validate view file syntax
  validateViewFileSyntax(skinDir);
  
  // Update skin result
  skinResult.tests = {
    total: results.total - skinResult.tests.total,
    passed: results.passed - skinResult.tests.passed,
    failed: results.failed - skinResult.tests.failed
  };
  
  results.skinResults.push(skinResult);
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
  
  if (results.skinResults.length > 0) {
    log('\nSkin Results:', colors.bright);
    results.skinResults.forEach(skin => {
      const status = skin.tests.failed === 0 ? '✓' : '✗';
      const color = skin.tests.failed === 0 ? colors.green : colors.red;
      log(`  ${status} ${skin.name} (${skin.level}): ${skin.tests.passed}/${skin.tests.total} passed`, color);
    });
  }
  
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
  const reportPath = path.join(__dirname, 'results', 'skin-structure-validation-report.json');
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
    skins: results.skinResults,
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
  log('GLW Skin Structure Validator', colors.bright + colors.cyan);
  log('=============================\n', colors.cyan);
  
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
    validateSkin(skinDir);
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
  detectSkinLevel,
  validateRequiredFiles,
  validateRecommendedFiles,
  analyzeStructure
};
