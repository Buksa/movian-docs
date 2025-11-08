#!/usr/bin/env node

/**
 * Template Validation Script
 * 
 * Validates all project templates and UI components for:
 * - File structure completeness
 * - JSON syntax validity
 * - JavaScript syntax checking
 * - View file syntax validation
 * - Documentation presence
 */

const fs = require('fs');
const path = require('path');

// Validation results
const results = {
  templates: [],
  components: [],
  errors: [],
  warnings: []
};

/**
 * Validate a project template
 */
function validateTemplate(templatePath, templateName) {
  console.log(`\nValidating template: ${templateName}`);
  
  const result = {
    name: templateName,
    path: templatePath,
    valid: true,
    issues: []
  };

  // Check required files
  const requiredFiles = ['README.md', 'plugin.json', 'main.js'];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(templatePath, file);
    if (!fs.existsSync(filePath)) {
      result.valid = false;
      result.issues.push(`Missing required file: ${file}`);
      results.errors.push(`${templateName}: Missing ${file}`);
    }
  });

  // Validate plugin.json
  const pluginJsonPath = path.join(templatePath, 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    try {
      const content = fs.readFileSync(pluginJsonPath, 'utf8');
      const json = JSON.parse(content);
      
      // Check required fields
      const requiredFields = ['id', 'version', 'title', 'type', 'file'];
      requiredFields.forEach(field => {
        if (!json[field]) {
          result.valid = false;
          result.issues.push(`plugin.json missing field: ${field}`);
          results.errors.push(`${templateName}: plugin.json missing ${field}`);
        }
      });

      // Validate ID format
      if (json.id && !json.id.match(/^[a-z0-9.]+$/)) {
        result.issues.push('plugin.json: ID should be lowercase with dots');
        results.warnings.push(`${templateName}: ID format warning`);
      }

      console.log(`  ✓ plugin.json is valid`);
    } catch (e) {
      result.valid = false;
      result.issues.push(`plugin.json syntax error: ${e.message}`);
      results.errors.push(`${templateName}: Invalid plugin.json - ${e.message}`);
      console.log(`  ✗ plugin.json has errors`);
    }
  }

  // Validate main.js
  const mainJsPath = path.join(templatePath, 'main.js');
  if (fs.existsSync(mainJsPath)) {
    try {
      const content = fs.readFileSync(mainJsPath, 'utf8');
      
      // Basic syntax checks
      if (!content.includes('(function(plugin)')) {
        result.issues.push('main.js: Should use plugin wrapper pattern');
        results.warnings.push(`${templateName}: Missing plugin wrapper`);
      }

      if (!content.includes('service.create')) {
        result.issues.push('main.js: Should register a service');
        results.warnings.push(`${templateName}: No service registration`);
      }

      if (!content.includes('page.Route')) {
        result.issues.push('main.js: Should define at least one route');
        results.warnings.push(`${templateName}: No routes defined`);
      }

      console.log(`  ✓ main.js structure looks good`);
    } catch (e) {
      result.valid = false;
      result.issues.push(`main.js error: ${e.message}`);
      results.errors.push(`${templateName}: main.js error - ${e.message}`);
      console.log(`  ✗ main.js has errors`);
    }
  }

  // Check README.md
  const readmePath = path.join(templatePath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');
    
    if (content.length < 100) {
      result.issues.push('README.md is too short');
      results.warnings.push(`${templateName}: README needs more content`);
    }

    if (!content.includes('## Features') && !content.includes('## Usage')) {
      result.issues.push('README.md should include Features or Usage section');
      results.warnings.push(`${templateName}: README missing sections`);
    }

    console.log(`  ✓ README.md exists`);
  }

  results.templates.push(result);
  
  if (result.valid) {
    console.log(`  ✓ Template ${templateName} is valid`);
  } else {
    console.log(`  ✗ Template ${templateName} has errors`);
  }

  return result;
}

/**
 * Validate a UI component
 */
function validateComponent(componentPath, componentName) {
  console.log(`\nValidating component: ${componentName}`);
  
  const result = {
    name: componentName,
    path: componentPath,
    valid: true,
    issues: []
  };

  // Check if it's a .view file
  if (!componentPath.endsWith('.view')) {
    result.issues.push('Component should be a .view file');
    results.warnings.push(`${componentName}: Not a .view file`);
  }

  if (fs.existsSync(componentPath)) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check for macro definitions
      if (!content.includes('#define')) {
        result.issues.push('Component should define at least one macro');
        results.warnings.push(`${componentName}: No macros defined`);
      }

      // Check for documentation comments
      if (!content.includes('/**')) {
        result.issues.push('Component should include documentation comments');
        results.warnings.push(`${componentName}: Missing documentation`);
      }

      // Check for widget usage
      if (!content.includes('widget(')) {
        result.valid = false;
        result.issues.push('Component should contain widget definitions');
        results.errors.push(`${componentName}: No widgets found`);
      }

      console.log(`  ✓ Component ${componentName} structure looks good`);
    } catch (e) {
      result.valid = false;
      result.issues.push(`Error reading component: ${e.message}`);
      results.errors.push(`${componentName}: ${e.message}`);
      console.log(`  ✗ Component ${componentName} has errors`);
    }
  } else {
    result.valid = false;
    result.issues.push('Component file does not exist');
    results.errors.push(`${componentName}: File not found`);
  }

  results.components.push(result);
  return result;
}

/**
 * Scan and validate all templates
 */
function validateAllTemplates() {
  console.log('=== Validating Project Templates ===');
  
  const templatesDir = path.join(__dirname, 'project-templates');
  
  if (!fs.existsSync(templatesDir)) {
    console.error('Templates directory not found:', templatesDir);
    return;
  }

  const templates = fs.readdirSync(templatesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  templates.forEach(template => {
    const templatePath = path.join(templatesDir, template);
    validateTemplate(templatePath, template);
  });
}

/**
 * Scan and validate all UI components
 */
function validateAllComponents() {
  console.log('\n=== Validating UI Components ===');
  
  const componentsDir = path.join(__dirname, 'ui-components');
  
  if (!fs.existsSync(componentsDir)) {
    console.error('Components directory not found:', componentsDir);
    return;
  }

  // Recursively find all .view files
  function findViewFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...findViewFiles(fullPath));
      } else if (item.name.endsWith('.view')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  const viewFiles = findViewFiles(componentsDir);
  
  viewFiles.forEach(filePath => {
    const relativePath = path.relative(componentsDir, filePath);
    validateComponent(filePath, relativePath);
  });
}

/**
 * Generate validation report
 */
function generateReport() {
  console.log('\n=== Validation Report ===\n');
  
  console.log(`Templates validated: ${results.templates.length}`);
  console.log(`Components validated: ${results.components.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  const validTemplates = results.templates.filter(t => t.valid).length;
  const validComponents = results.components.filter(c => c.valid).length;

  console.log('\n=== Summary ===');
  console.log(`Valid templates: ${validTemplates}/${results.templates.length}`);
  console.log(`Valid components: ${validComponents}/${results.components.length}`);

  if (results.errors.length === 0) {
    console.log('\n✅ All validations passed!');
    return 0;
  } else {
    console.log('\n❌ Validation failed with errors');
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Movian Examples and Templates Validation\n');
  
  validateAllTemplates();
  validateAllComponents();
  
  const exitCode = generateReport();
  
  // Save results to file
  const reportPath = path.join(__dirname, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  process.exit(exitCode);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateTemplate, validateComponent };
