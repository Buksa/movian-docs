/**
 * Plugin Examples Validation System
 * 
 * This script validates all plugin examples to ensure they:
 * - Have valid plugin.json manifests
 * - Use correct JavaScript syntax
 * - Follow Movian API best practices
 * - Include proper documentation
 * - Have all required files
 */

const fs = require('fs');
const path = require('path');

// Validation configuration
const EXAMPLES_DIR = __dirname;
const REQUIRED_FILES = ['plugin.json', 'main.js', 'README.md'];
const OPTIONAL_FILES = ['logo.png', 'views/'];

// Validation results
let validationResults = {
    totalExamples: 0,
    passedExamples: 0,
    failedExamples: 0,
    errors: [],
    warnings: []
};

/**
 * Main validation function
 */
function validateAllExamples() {
    console.log('🔍 Starting plugin examples validation...\n');
    
    const exampleDirs = getExampleDirectories();
    validationResults.totalExamples = exampleDirs.length;
    
    exampleDirs.forEach(dir => {
        console.log(`📁 Validating: ${dir}`);
        const result = validateExample(dir);
        
        if (result.passed) {
            validationResults.passedExamples++;
            console.log(`✅ ${dir}: PASSED\n`);
        } else {
            validationResults.failedExamples++;
            console.log(`❌ ${dir}: FAILED`);
            result.errors.forEach(error => console.log(`   - ${error}`));
            console.log('');
        }
        
        validationResults.errors.push(...result.errors);
        validationResults.warnings.push(...result.warnings);
    });
    
    printSummary();
}

/**
 * Get all example directories
 */
function getExampleDirectories() {
    return fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.') && name !== 'node_modules');
}

/**
 * Validate a single plugin example
 */
function validateExample(exampleName) {
    const examplePath = path.join(EXAMPLES_DIR, exampleName);
    const result = {
        passed: true,
        errors: [],
        warnings: []
    };
    
    try {
        // Check required files
        validateRequiredFiles(examplePath, result);
        
        // Validate plugin.json
        validatePluginManifest(examplePath, result);
        
        // Validate main.js
        validateMainScript(examplePath, result);
        
        // Validate README.md
        validateReadme(examplePath, result);
        
        // Check for optional files
        checkOptionalFiles(examplePath, result);
        
        // Validate code quality
        validateCodeQuality(examplePath, result);
        
    } catch (error) {
        result.errors.push(`Validation error: ${error.message}`);
        result.passed = false;
    }
    
    result.passed = result.errors.length === 0;
    return result;
}

/**
 * Validate required files exist
 */
function validateRequiredFiles(examplePath, result) {
    REQUIRED_FILES.forEach(file => {
        const filePath = path.join(examplePath, file);
        if (!fs.existsSync(filePath)) {
            result.errors.push(`Missing required file: ${file}`);
        }
    });
}

/**
 * Validate plugin.json manifest
 */
function validatePluginManifest(examplePath, result) {
    const manifestPath = path.join(examplePath, 'plugin.json');
    
    if (!fs.existsSync(manifestPath)) {
        return; // Already reported in validateRequiredFiles
    }
    
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        // Required fields
        const requiredFields = ['type', 'id', 'file'];
        requiredFields.forEach(field => {
            if (!manifest[field]) {
                result.errors.push(`plugin.json missing required field: ${field}`);
            }
        });
        
        // Validate field values
        if (manifest.type && !['ecmascript', 'javascript'].includes(manifest.type)) {
            result.errors.push(`Invalid plugin type: ${manifest.type}`);
        }
        
        if (manifest.file && manifest.file !== 'main.js') {
            result.warnings.push(`Non-standard main file: ${manifest.file} (recommended: main.js)`);
        }
        
        if (manifest.apiversion && manifest.apiversion < 2) {
            result.warnings.push(`Old API version: ${manifest.apiversion} (recommended: 2)`);
        }
        
        // Recommended fields
        const recommendedFields = ['title', 'synopsis', 'description', 'author', 'version'];
        recommendedFields.forEach(field => {
            if (!manifest[field]) {
                result.warnings.push(`plugin.json missing recommended field: ${field}`);
            }
        });
        
    } catch (error) {
        result.errors.push(`Invalid plugin.json: ${error.message}`);
    }
}

/**
 * Validate main JavaScript file
 */
function validateMainScript(examplePath, result) {
    const scriptPath = path.join(examplePath, 'main.js');
    
    if (!fs.existsSync(scriptPath)) {
        return; // Already reported in validateRequiredFiles
    }
    
    try {
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for basic syntax (simple validation)
        validateJavaScriptSyntax(scriptContent, result);
        
        // Check for required Movian patterns
        validateMovianPatterns(scriptContent, result);
        
        // Check for best practices
        validateBestPractices(scriptContent, result);
        
    } catch (error) {
        result.errors.push(`Error reading main.js: ${error.message}`);
    }
}

/**
 * Basic JavaScript syntax validation
 */
function validateJavaScriptSyntax(content, result) {
    // Check for basic syntax issues
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        result.errors.push('Mismatched braces in main.js');
    }
    
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
        result.errors.push('Mismatched parentheses in main.js');
    }
    
    // Check for common syntax errors
    if (content.includes('function(') && !content.includes('function (')) {
        // This is actually valid, just a style check
    }
    
    // Check for unterminated strings (basic check)
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        
        if (singleQuotes % 2 !== 0 && !line.includes('//')) {
            result.warnings.push(`Possible unterminated string on line ${index + 1}`);
        }
        if (doubleQuotes % 2 !== 0 && !line.includes('//')) {
            result.warnings.push(`Possible unterminated string on line ${index + 1}`);
        }
    });
}

/**
 * Validate Movian-specific patterns
 */
function validateMovianPatterns(content, result) {
    // Check for required imports
    const requiredImports = ['movian/page', 'movian/service'];
    requiredImports.forEach(module => {
        if (!content.includes(`require('${module}')`)) {
            result.warnings.push(`Missing recommended import: ${module}`);
        }
    });
    
    // Check for service creation
    if (!content.includes('service.create')) {
        result.warnings.push('No service creation found - plugin may not appear in Movian menu');
    }
    
    // Check for route handlers
    if (!content.includes('new page.Route') && !content.includes('plugin.addURI')) {
        result.warnings.push('No route handlers found - plugin may not be functional');
    }
    
    // Check for proper error handling
    if (!content.includes('try') && !content.includes('catch')) {
        result.warnings.push('No error handling found - consider adding try/catch blocks');
    }
    
    // Check for console.log usage (should use proper logging)
    if (content.includes('console.log')) {
        // This is actually fine for examples
        result.warnings.push('Using console.log - consider using proper logging in production');
    }
}

/**
 * Validate best practices
 */
function validateBestPractices(content, result) {
    // Check for plugin prefix usage
    if (!content.includes('PLUGIN_PREFIX') && !content.includes('PREFIX')) {
        result.warnings.push('Consider using a plugin prefix constant for route naming');
    }
    
    // Check for settings usage
    if (content.includes('settings.') && !content.includes('settings.globalSettings')) {
        result.warnings.push('Using settings without globalSettings declaration');
    }
    
    // Check for proper page loading handling
    if (content.includes('page.loading = false') || content.includes('page.error')) {
        // Good practice
    } else {
        result.warnings.push('Consider setting page.loading = false when page is ready');
    }
    
    // Check for documentation comments
    if (!content.includes('/**') && !content.includes('//')) {
        result.warnings.push('No documentation comments found');
    }
    
    // Check for magic numbers
    const magicNumbers = content.match(/\b\d{3,}\b/g);
    if (magicNumbers && magicNumbers.length > 2) {
        result.warnings.push('Consider using named constants for large numbers');
    }
}

/**
 * Validate README.md
 */
function validateReadme(examplePath, result) {
    const readmePath = path.join(examplePath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
        return; // Already reported in validateRequiredFiles
    }
    
    try {
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Check for required sections
        const requiredSections = ['#', '##'];
        if (!requiredSections.some(section => readmeContent.includes(section))) {
            result.warnings.push('README.md should include section headers');
        }
        
        // Check for minimum content length
        if (readmeContent.length < 500) {
            result.warnings.push('README.md seems too short - consider adding more documentation');
        }
        
        // Check for code examples
        if (!readmeContent.includes('```')) {
            result.warnings.push('README.md should include code examples');
        }
        
        // Check for installation instructions
        if (!readmeContent.toLowerCase().includes('install')) {
            result.warnings.push('README.md should include installation instructions');
        }
        
    } catch (error) {
        result.errors.push(`Error reading README.md: ${error.message}`);
    }
}

/**
 * Check for optional files
 */
function checkOptionalFiles(examplePath, result) {
    OPTIONAL_FILES.forEach(file => {
        const filePath = path.join(examplePath, file);
        if (fs.existsSync(filePath)) {
            // Optional file exists - good
        } else {
            if (file === 'logo.png') {
                result.warnings.push('Consider adding a logo.png file for better presentation');
            }
        }
    });
}

/**
 * Validate overall code quality
 */
function validateCodeQuality(examplePath, result) {
    const scriptPath = path.join(examplePath, 'main.js');
    
    if (!fs.existsSync(scriptPath)) {
        return;
    }
    
    const content = fs.readFileSync(scriptPath, 'utf8');
    const lines = content.split('\n');
    
    // Check file length
    if (lines.length > 1000) {
        result.warnings.push('main.js is quite long - consider splitting into modules');
    }
    
    // Check for very long lines
    lines.forEach((line, index) => {
        if (line.length > 120) {
            result.warnings.push(`Long line at ${index + 1} (${line.length} chars) - consider breaking it up`);
        }
    });
    
    // Check for proper indentation (basic check)
    let indentationIssues = 0;
    lines.forEach((line, index) => {
        if (line.trim() && line.match(/^\s/)) {
            const spaces = line.match(/^\s*/)[0].length;
            if (spaces % 2 !== 0 && spaces % 4 !== 0) {
                indentationIssues++;
            }
        }
    });
    
    if (indentationIssues > lines.length * 0.1) {
        result.warnings.push('Inconsistent indentation detected');
    }
}

/**
 * Print validation summary
 */
function printSummary() {
    console.log('📊 Validation Summary');
    console.log('='.repeat(50));
    console.log(`Total Examples: ${validationResults.totalExamples}`);
    console.log(`✅ Passed: ${validationResults.passedExamples}`);
    console.log(`❌ Failed: ${validationResults.failedExamples}`);
    console.log(`⚠️  Warnings: ${validationResults.warnings.length}`);
    console.log(`🚫 Errors: ${validationResults.errors.length}`);
    
    const successRate = (validationResults.passedExamples / validationResults.totalExamples * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (validationResults.errors.length > 0) {
        console.log('\n🚫 Critical Errors:');
        validationResults.errors.forEach(error => {
            console.log(`   - ${error}`);
        });
    }
    
    if (validationResults.warnings.length > 0) {
        console.log('\n⚠️  Warnings (non-critical):');
        validationResults.warnings.slice(0, 10).forEach(warning => {
            console.log(`   - ${warning}`);
        });
        
        if (validationResults.warnings.length > 10) {
            console.log(`   ... and ${validationResults.warnings.length - 10} more warnings`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (validationResults.failedExamples === 0) {
        console.log('🎉 All examples passed validation!');
    } else {
        console.log('🔧 Some examples need attention. Please fix the errors above.');
        process.exit(1);
    }
}

/**
 * Generate validation report
 */
function generateReport() {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalExamples: validationResults.totalExamples,
            passedExamples: validationResults.passedExamples,
            failedExamples: validationResults.failedExamples,
            successRate: (validationResults.passedExamples / validationResults.totalExamples * 100).toFixed(1)
        },
        errors: validationResults.errors,
        warnings: validationResults.warnings
    };
    
    const reportPath = path.join(__dirname, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
}

// Run validation if called directly
if (require.main === module) {
    validateAllExamples();
    generateReport();
}

module.exports = {
    validateAllExamples,
    validateExample,
    validationResults
};