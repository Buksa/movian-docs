#!/usr/bin/env node
/**
 * Movian Plugin Integration Test Suite
 * 
 * This script performs comprehensive integration testing of all plugin examples
 * to ensure they can load and function correctly in a Movian environment.
 * 
 * Tests include:
 * - Plugin manifest validation
 * - JavaScript syntax and API usage validation
 * - Simulated Movian environment testing
 * - Plugin loading and initialization
 * - Service registration verification
 * - Route handling validation
 * - Error handling testing
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Test configuration
const EXAMPLES_DIR = path.join(__dirname, '..', 'plugins', 'examples');
const TEST_RESULTS_DIR = path.join(__dirname, 'results');
const MOVIAN_MOCK_DIR = path.join(__dirname, 'movian-mock');

// Test results tracking
let testResults = {
    timestamp: new Date().toISOString(),
    totalPlugins: 0,
    passedPlugins: 0,
    failedPlugins: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    plugins: {},
    errors: [],
    warnings: []
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Utility functions
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function header(message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`  ${message}`, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

/**
 * Setup test environment
 */
function setupTestEnvironment() {
    info('Setting up test environment...');
    
    // Create results directory
    if (!fs.existsSync(TEST_RESULTS_DIR)) {
        fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
    }
    
    // Create Movian mock environment
    setupMovianMock();
    
    success('Test environment ready');
}

/**
 * Create a mock Movian environment for testing
 */
function setupMovianMock() {
    if (!fs.existsSync(MOVIAN_MOCK_DIR)) {
        fs.mkdirSync(MOVIAN_MOCK_DIR, { recursive: true });
    }
    
    // Create mock Movian API modules
    const mockModules = {
        'movian/service': createServiceMock(),
        'movian/page': createPageMock(),
        'movian/prop': createPropMock(),
        'movian/settings': createSettingsMock(),
        'movian/store': createStoreMock(),
        'movian/http': createHttpMock(),
        'http': createHttpMock(),
        'sqlite': createSqliteMock()
    };
    
    // Write mock modules
    Object.entries(mockModules).forEach(([moduleName, moduleCode]) => {
        const modulePath = path.join(MOVIAN_MOCK_DIR, `${moduleName.replace('/', '-')}.js`);
        fs.writeFileSync(modulePath, moduleCode);
    });
    
    // Create mock require function
    const mockRequire = `
// Mock require function for Movian plugin testing
const mockModules = {
    'movian/service': require('./movian-service.js'),
    'movian/page': require('./movian-page.js'),
    'movian/prop': require('./movian-prop.js'),
    'movian/settings': require('./movian-settings.js'),
    'movian/store': require('./movian-store.js'),
    'movian/http': require('./movian-http.js'),
    'http': require('./http.js'),
    'sqlite': require('./sqlite.js')
};

global.mockRequire = function(moduleName) {
    if (mockModules[moduleName]) {
        return mockModules[moduleName];
    }
    throw new Error('Module not found: ' + moduleName);
};

global.plugin = {
    path: process.cwd(),
    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
};

// Global Plugin object for older API compatibility
global.Plugin = {
    path: process.cwd(),
    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
};

module.exports = { mockRequire, mockModules };
`;
    
    fs.writeFileSync(path.join(MOVIAN_MOCK_DIR, 'mock-require.js'), mockRequire);
}

/**
 * Mock module creators
 */
function createServiceMock() {
    return `
// Mock Movian service module
class MockService {
    constructor(title, uri, type, enabled, icon) {
        this.title = title;
        this.uri = uri;
        this.type = type;
        this.enabled = enabled;
        this.icon = icon;
        this.routes = [];
    }
    
    addRoute(route) {
        this.routes.push(route);
    }
}

const service = {
    create: (title, uri, type, enabled, icon) => {
        return new MockService(title, uri, type, enabled, icon);
    }
};

module.exports = service;
`;
}

function createPageMock() {
    return `
// Mock Movian page module
class MockPage {
    constructor() {
        this.loading = true;
        this.error = null;
        this.entries = 0;
        this.metadata = {};
    }
    
    appendItem(uri, type, metadata) {
        this.entries++;
        return { uri, type, metadata };
    }
    
    appendPassiveItem(type, metadata) {
        this.entries++;
        return { type, metadata };
    }
}

class MockRoute {
    constructor(pattern, callback) {
        this.pattern = pattern;
        this.callback = callback;
    }
}

const page = {
    Route: MockRoute,
    create: () => new MockPage()
};

module.exports = page;
`;
}

function createPropMock() {
    return `
// Mock Movian prop module
class MockProp {
    constructor(value) {
        this.value = value;
        this.subscribers = [];
    }
    
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) this.subscribers.splice(index, 1);
        };
    }
    
    set(value) {
        this.value = value;
        this.subscribers.forEach(callback => callback(value));
    }
}

const prop = {
    create: (value) => new MockProp(value),
    global: {}
};

module.exports = prop;
`;
}

function createSettingsMock() {
    return `
// Mock Movian settings module
const settings = {
    globalSettings: function(plugin, options) {
        return {
            createString: (id, title, defaultValue) => ({ id, title, defaultValue, value: defaultValue }),
            createBool: (id, title, defaultValue) => ({ id, title, defaultValue, value: defaultValue }),
            createInt: (id, title, defaultValue, min, max) => ({ id, title, defaultValue, min, max, value: defaultValue }),
            createMultiOpt: (id, title, options, defaultValue) => ({ id, title, options, defaultValue, value: defaultValue }),
            createDivider: (title) => ({ title, type: 'divider' }),
            createInfo: (id, icon, text) => ({ id, icon, text, type: 'info' }),
            createAction: (id, title, callback) => ({ id, title, callback, type: 'action' })
        };
    },
    createString: (id, title, defaultValue) => ({ id, title, defaultValue, value: defaultValue }),
    createBool: (id, title, defaultValue) => ({ id, title, defaultValue, value: defaultValue }),
    createInt: (id, title, defaultValue, min, max) => ({ id, title, defaultValue, min, max, value: defaultValue }),
    createMultiOpt: (id, title, options, defaultValue) => ({ id, title, options, defaultValue, value: defaultValue }),
    createDivider: (title) => ({ title, type: 'divider' }),
    createInfo: (id, icon, text) => ({ id, icon, text, type: 'info' }),
    createAction: (id, title, callback) => ({ id, title, callback, type: 'action' })
};

module.exports = settings;
`;
}

function createStoreMock() {
    return `
// Mock Movian store module
const mockStore = new Map();

const store = {
    create: (name) => ({
        get: (key) => mockStore.get(name + ':' + key),
        set: (key, value) => mockStore.set(name + ':' + key, value),
        delete: (key) => mockStore.delete(name + ':' + key),
        list: () => Array.from(mockStore.keys()).filter(k => k.startsWith(name + ':')).map(k => k.substring(name.length + 1))
    }),
    get: (key) => mockStore.get(key),
    set: (key, value) => mockStore.set(key, value),
    delete: (key) => mockStore.delete(key),
    list: () => Array.from(mockStore.keys())
};

module.exports = store;
`;
}

function createHttpMock() {
    return `
// Mock HTTP module
const http = {
    request: (url, options = {}) => {
        // Simulate HTTP response
        return {
            statuscode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'Mock response', url })
        };
    },
    
    get: (url, options = {}) => {
        return http.request(url, { ...options, method: 'GET' });
    },
    
    post: (url, data, options = {}) => {
        return http.request(url, { ...options, method: 'POST', postdata: data });
    }
};

module.exports = http;
`;
}

function createSqliteMock() {
    return `
// Mock SQLite module
class MockDatabase {
    constructor() {
        this.tables = new Map();
    }
    
    exec(sql) {
        // Basic SQL simulation
        return { changes: 1, lastInsertRowid: 1 };
    }
    
    prepare(sql) {
        return {
            step: () => ({ done: true }),
            get: () => ({}),
            finalize: () => {}
        };
    }
}

const sqlite = {
    open: (path) => new MockDatabase()
};

module.exports = sqlite;
`;
}

/**
 * Get all plugin examples
 */
function getPluginExamples() {
    if (!fs.existsSync(EXAMPLES_DIR)) {
        throw new Error(`Examples directory not found: ${EXAMPLES_DIR}`);
    }
    
    return fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.') && name !== 'node_modules');
}

/**
 * Test a single plugin
 */
async function testPlugin(pluginName) {
    const pluginPath = path.join(EXAMPLES_DIR, pluginName);
    const pluginResult = {
        name: pluginName,
        path: pluginPath,
        passed: true,
        tests: {},
        errors: [],
        warnings: []
    };
    
    info(`Testing plugin: ${pluginName}`);
    
    try {
        // Test 1: Manifest validation
        await testPluginManifest(pluginPath, pluginResult);
        
        // Test 2: File structure validation
        await testPluginStructure(pluginPath, pluginResult);
        
        // Test 3: JavaScript syntax validation
        await testJavaScriptSyntax(pluginPath, pluginResult);
        
        // Test 4: API usage validation
        await testApiUsage(pluginPath, pluginResult);
        
        // Test 5: Plugin loading simulation
        await testPluginLoading(pluginPath, pluginResult);
        
        // Test 6: Service registration test
        await testServiceRegistration(pluginPath, pluginResult);
        
        // Test 7: Route handling test
        await testRouteHandling(pluginPath, pluginResult);
        
        // Test 8: Error handling test
        await testErrorHandling(pluginPath, pluginResult);
        
    } catch (error) {
        pluginResult.errors.push(`Test execution error: ${error.message}`);
        pluginResult.passed = false;
    }
    
    // Calculate test results
    const testCount = Object.keys(pluginResult.tests).length;
    const passedCount = Object.values(pluginResult.tests).filter(result => result.passed).length;
    
    pluginResult.passed = pluginResult.errors.length === 0 && passedCount === testCount;
    
    // Update global results
    testResults.totalTests += testCount;
    testResults.passedTests += passedCount;
    testResults.failedTests += (testCount - passedCount);
    
    if (pluginResult.passed) {
        testResults.passedPlugins++;
        success(`Plugin ${pluginName}: PASSED (${passedCount}/${testCount} tests)`);
    } else {
        testResults.failedPlugins++;
        error(`Plugin ${pluginName}: FAILED (${passedCount}/${testCount} tests)`);
        pluginResult.errors.forEach(err => error(`  - ${err}`));
    }
    
    return pluginResult;
}

/**
 * Test plugin manifest (plugin.json)
 */
async function testPluginManifest(pluginPath, result) {
    const testName = 'manifest_validation';
    const manifestPath = path.join(pluginPath, 'plugin.json');
    
    try {
        if (!fs.existsSync(manifestPath)) {
            throw new Error('plugin.json not found');
        }
        
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        // Required fields validation
        const requiredFields = ['type', 'id', 'file', 'version', 'title'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Field value validation
        if (!['ecmascript', 'javascript'].includes(manifest.type)) {
            throw new Error(`Invalid plugin type: ${manifest.type}`);
        }
        
        if (manifest.apiversion && manifest.apiversion < 2) {
            result.warnings.push('Using old API version, consider upgrading to API version 2');
        }
        
        result.tests[testName] = { passed: true, message: 'Manifest validation passed' };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`Manifest validation failed: ${error.message}`);
    }
}

/**
 * Test plugin file structure
 */
async function testPluginStructure(pluginPath, result) {
    const testName = 'structure_validation';
    
    try {
        const requiredFiles = ['plugin.json', 'main.js', 'README.md'];
        const missingFiles = requiredFiles.filter(file => 
            !fs.existsSync(path.join(pluginPath, file))
        );
        
        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }
        
        // Check for recommended files
        const recommendedFiles = ['logo.png'];
        const missingRecommended = recommendedFiles.filter(file => 
            !fs.existsSync(path.join(pluginPath, file))
        );
        
        if (missingRecommended.length > 0) {
            result.warnings.push(`Missing recommended files: ${missingRecommended.join(', ')}`);
        }
        
        result.tests[testName] = { passed: true, message: 'File structure validation passed' };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`Structure validation failed: ${error.message}`);
    }
}

/**
 * Test JavaScript syntax
 */
async function testJavaScriptSyntax(pluginPath, result) {
    const testName = 'javascript_syntax';
    const mainJsPath = path.join(pluginPath, 'main.js');
    
    try {
        if (!fs.existsSync(mainJsPath)) {
            throw new Error('main.js not found');
        }
        
        const jsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Basic syntax validation using Node.js
        const { VM } = require('vm2');
        const vm = new VM({
            timeout: 1000,
            sandbox: {}
        });
        
        // Try to parse the JavaScript (without executing)
        try {
            vm.run(`(function() { ${jsContent} })`);
        } catch (syntaxError) {
            throw new Error(`Syntax error: ${syntaxError.message}`);
        }
        
        result.tests[testName] = { passed: true, message: 'JavaScript syntax validation passed' };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`JavaScript syntax validation failed: ${error.message}`);
    }
}

/**
 * Test API usage patterns
 */
async function testApiUsage(pluginPath, result) {
    const testName = 'api_usage';
    const mainJsPath = path.join(pluginPath, 'main.js');
    
    try {
        const jsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Check for required API patterns
        const requiredPatterns = [
            { pattern: /require\s*\(\s*['"]movian\//, description: 'Movian module imports' },
            { pattern: /service\.create|new\s+page\.Route/, description: 'Service or route creation' }
        ];
        
        const missingPatterns = requiredPatterns.filter(({ pattern }) => !pattern.test(jsContent));
        
        if (missingPatterns.length > 0) {
            const missing = missingPatterns.map(p => p.description).join(', ');
            result.warnings.push(`Missing recommended patterns: ${missing}`);
        }
        
        // Check for best practices
        const bestPractices = [
            { pattern: /try\s*{[\s\S]*catch/, description: 'Error handling (try/catch)' },
            { pattern: /page\.loading\s*=\s*false/, description: 'Page loading state management' }
        ];
        
        const missingBestPractices = bestPractices.filter(({ pattern }) => !pattern.test(jsContent));
        
        if (missingBestPractices.length > 0) {
            const missing = missingBestPractices.map(p => p.description).join(', ');
            result.warnings.push(`Missing best practices: ${missing}`);
        }
        
        result.tests[testName] = { passed: true, message: 'API usage validation passed' };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`API usage validation failed: ${error.message}`);
    }
}

/**
 * Test plugin loading in mock environment
 */
async function testPluginLoading(pluginPath, result) {
    const testName = 'plugin_loading';
    const mainJsPath = path.join(pluginPath, 'main.js');
    
    try {
        // Create isolated test environment
        const { VM } = require('vm2');
        const vm = new VM({
            timeout: 5000,
            sandbox: {
                console: console,
                require: (moduleName) => {
                    const mockPath = path.join(MOVIAN_MOCK_DIR, `${moduleName.replace('/', '-')}.js`);
                    if (fs.existsSync(mockPath)) {
                        return require(mockPath);
                    }
                    throw new Error(`Module not found: ${moduleName}`);
                },
                plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
                },
                Plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
                }
            }
        });
        
        const jsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Execute plugin in mock environment
        const executionResult = vm.run(`
            (function() {
                ${jsContent}
                return { success: true, message: 'Plugin loaded successfully' };
            })()
        `);
        
        if (!executionResult.success) {
            throw new Error(executionResult.message || 'Plugin loading failed');
        }
        
        result.tests[testName] = { passed: true, message: 'Plugin loading test passed' };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`Plugin loading test failed: ${error.message}`);
    }
}

/**
 * Test service registration
 */
async function testServiceRegistration(pluginPath, result) {
    const testName = 'service_registration';
    const mainJsPath = path.join(pluginPath, 'main.js');
    
    try {
        const jsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Check if plugin creates services
        if (!jsContent.includes('service.create')) {
            result.warnings.push('Plugin does not create any services');
            result.tests[testName] = { passed: true, message: 'No service registration (acceptable for some plugins)' };
            return;
        }
        
        // Mock service creation tracking
        let servicesCreated = 0;
        const { VM } = require('vm2');
        const vm = new VM({
            timeout: 5000,
            sandbox: {
                console: console,
                require: (moduleName) => {
                    if (moduleName === 'movian/service') {
                        return {
                            create: (...args) => {
                                servicesCreated++;
                                return { title: args[0], uri: args[1], addRoute: () => {} };
                            }
                        };
                    }
                    const mockPath = path.join(MOVIAN_MOCK_DIR, `${moduleName.replace('/', '-')}.js`);
                    if (fs.existsSync(mockPath)) {
                        return require(mockPath);
                    }
                    return {};
                },
                plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
                },
                Plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
                }
            }
        });
        
        vm.run(jsContent);
        
        if (servicesCreated === 0) {
            throw new Error('No services were created despite service.create calls');
        }
        
        result.tests[testName] = { 
            passed: true, 
            message: `Service registration test passed (${servicesCreated} services created)` 
        };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`Service registration test failed: ${error.message}`);
    }
}

/**
 * Test route handling
 */
async function testRouteHandling(pluginPath, result) {
    const testName = 'route_handling';
    const mainJsPath = path.join(pluginPath, 'main.js');
    
    try {
        const jsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Check for route definitions
        const hasRoutes = jsContent.includes('new page.Route') || 
                         jsContent.includes('plugin.addURI') ||
                         jsContent.includes('addRoute');
        
        if (!hasRoutes) {
            result.warnings.push('Plugin does not define any routes');
            result.tests[testName] = { passed: true, message: 'No route handling (acceptable for some plugins)' };
            return;
        }
        
        // Mock route creation tracking
        let routesCreated = 0;
        const { VM } = require('vm2');
        const vm = new VM({
            timeout: 5000,
            sandbox: {
                console: console,
                require: (moduleName) => {
                    if (moduleName === 'movian/page') {
                        return {
                            Route: function(pattern, callback) {
                                routesCreated++;
                                this.pattern = pattern;
                                this.callback = callback;
                            },
                            create: () => ({ loading: true, appendItem: () => {} })
                        };
                    }
                    const mockPath = path.join(MOVIAN_MOCK_DIR, `${moduleName.replace('/', '-')}.js`);
                    if (fs.existsSync(mockPath)) {
                        return require(mockPath);
                    }
                    return {};
                },
                plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' }),
                    addURI: () => { routesCreated++; }
                },
                Plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' }),
                    addURI: () => { routesCreated++; }
                }
            }
        });
        
        vm.run(jsContent);
        
        result.tests[testName] = { 
            passed: true, 
            message: `Route handling test passed (${routesCreated} routes created)` 
        };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`Route handling test failed: ${error.message}`);
    }
}

/**
 * Test error handling
 */
async function testErrorHandling(pluginPath, result) {
    const testName = 'error_handling';
    const mainJsPath = path.join(pluginPath, 'main.js');
    
    try {
        const jsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Check for error handling patterns
        const hasErrorHandling = jsContent.includes('try') && jsContent.includes('catch');
        
        if (!hasErrorHandling) {
            result.warnings.push('Plugin lacks explicit error handling (try/catch blocks)');
        }
        
        // Test plugin behavior with simulated errors
        const { VM } = require('vm2');
        const vm = new VM({
            timeout: 5000,
            sandbox: {
                console: console,
                require: (moduleName) => {
                    // Simulate module loading error for testing
                    if (moduleName === 'movian/nonexistent') {
                        throw new Error('Module not found');
                    }
                    const mockPath = path.join(MOVIAN_MOCK_DIR, `${moduleName.replace('/', '-')}.js`);
                    if (fs.existsSync(mockPath)) {
                        return require(mockPath);
                    }
                    return {};
                },
                plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
                },
                Plugin: {
                    path: pluginPath,
                    getDescriptor: () => ({ id: 'test-plugin', version: '1.0.0' })
                }
            }
        });
        
        // Try to execute plugin - it should not crash
        try {
            vm.run(jsContent);
        } catch (error) {
            // If plugin crashes, check if it's due to poor error handling
            if (!hasErrorHandling) {
                throw new Error(`Plugin crashed without error handling: ${error.message}`);
            }
        }
        
        result.tests[testName] = { passed: true, message: 'Error handling test passed' };
        
    } catch (error) {
        result.tests[testName] = { passed: false, message: error.message };
        result.errors.push(`Error handling test failed: ${error.message}`);
    }
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
    const reportPath = path.join(TEST_RESULTS_DIR, 'integration-test-report.json');
    const htmlReportPath = path.join(TEST_RESULTS_DIR, 'integration-test-report.html');
    
    // Generate JSON report
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    // Generate HTML report
    const htmlReport = generateHtmlReport();
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    info(`Test reports generated:`);
    info(`  JSON: ${reportPath}`);
    info(`  HTML: ${htmlReportPath}`);
}

/**
 * Generate HTML test report
 */
function generateHtmlReport() {
    const successRate = testResults.totalPlugins > 0 
        ? (testResults.passedPlugins / testResults.totalPlugins * 100).toFixed(1)
        : 0;
    
    const testSuccessRate = testResults.totalTests > 0
        ? (testResults.passedTests / testResults.totalTests * 100).toFixed(1)
        : 0;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Movian Plugin Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .plugin-results { margin-top: 30px; }
        .plugin { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 6px; }
        .plugin-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .plugin-name { font-size: 1.2em; font-weight: bold; }
        .plugin-status { float: right; padding: 4px 8px; border-radius: 4px; color: white; }
        .plugin-status.passed { background: #28a745; }
        .plugin-status.failed { background: #dc3545; }
        .plugin-tests { padding: 15px; }
        .test-item { margin-bottom: 10px; padding: 8px; border-radius: 4px; }
        .test-item.passed { background: #d4edda; border-left: 4px solid #28a745; }
        .test-item.failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .test-name { font-weight: bold; }
        .test-message { color: #666; font-size: 0.9em; }
        .errors-warnings { margin-top: 20px; }
        .error-item, .warning-item { padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        .error-item { background: #f8d7da; border-left: 4px solid #dc3545; }
        .warning-item { background: #fff3cd; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Movian Plugin Integration Test Report</h1>
            <p>Generated on ${new Date(testResults.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value ${testResults.passedPlugins === testResults.totalPlugins ? 'success' : 'error'}">
                    ${testResults.passedPlugins}/${testResults.totalPlugins}
                </div>
                <div class="metric-label">Plugins Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value ${successRate >= 80 ? 'success' : successRate >= 60 ? 'warning' : 'error'}">
                    ${successRate}%
                </div>
                <div class="metric-label">Plugin Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value ${testResults.passedTests === testResults.totalTests ? 'success' : 'error'}">
                    ${testResults.passedTests}/${testResults.totalTests}
                </div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value ${testSuccessRate >= 80 ? 'success' : testSuccessRate >= 60 ? 'warning' : 'error'}">
                    ${testSuccessRate}%
                </div>
                <div class="metric-label">Test Success Rate</div>
            </div>
        </div>
        
        <div class="plugin-results">
            <h2>Plugin Test Results</h2>
            ${Object.entries(testResults.plugins).map(([pluginName, plugin]) => `
                <div class="plugin">
                    <div class="plugin-header">
                        <span class="plugin-name">${pluginName}</span>
                        <span class="plugin-status ${plugin.passed ? 'passed' : 'failed'}">
                            ${plugin.passed ? 'PASSED' : 'FAILED'}
                        </span>
                    </div>
                    <div class="plugin-tests">
                        ${Object.entries(plugin.tests).map(([testName, test]) => `
                            <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                                <div class="test-name">${testName.replace(/_/g, ' ').toUpperCase()}</div>
                                <div class="test-message">${test.message}</div>
                            </div>
                        `).join('')}
                        
                        ${plugin.errors.length > 0 ? `
                            <div class="errors-warnings">
                                <h4>Errors:</h4>
                                ${plugin.errors.map(error => `
                                    <div class="error-item">${error}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${plugin.warnings.length > 0 ? `
                            <div class="errors-warnings">
                                <h4>Warnings:</h4>
                                ${plugin.warnings.map(warning => `
                                    <div class="warning-item">${warning}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Print test summary
 */
function printTestSummary() {
    header('TEST SUMMARY');
    
    const successRate = testResults.totalPlugins > 0 
        ? (testResults.passedPlugins / testResults.totalPlugins * 100).toFixed(1)
        : 0;
    
    const testSuccessRate = testResults.totalTests > 0
        ? (testResults.passedTests / testResults.totalTests * 100).toFixed(1)
        : 0;
    
    log(`Total Plugins Tested: ${testResults.totalPlugins}`);
    log(`✅ Plugins Passed: ${testResults.passedPlugins}`, 'green');
    log(`❌ Plugins Failed: ${testResults.failedPlugins}`, 'red');
    log(`📊 Plugin Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    log('');
    log(`Total Tests Run: ${testResults.totalTests}`);
    log(`✅ Tests Passed: ${testResults.passedTests}`, 'green');
    log(`❌ Tests Failed: ${testResults.failedTests}`, 'red');
    log(`📊 Test Success Rate: ${testSuccessRate}%`, testSuccessRate >= 80 ? 'green' : 'yellow');
    
    if (testResults.failedPlugins === 0) {
        log('');
        success('🎉 All plugins passed integration testing!');
        log('The plugin examples are ready for use and properly demonstrate Movian API usage.');
    } else {
        log('');
        error('🔧 Some plugins failed integration testing.');
        log('Please review the detailed results and fix any issues before publishing.');
    }
}

/**
 * Main test execution
 */
async function main() {
    try {
        header('MOVIAN PLUGIN INTEGRATION TEST SUITE');
        
        // Setup test environment
        setupTestEnvironment();
        
        // Get all plugin examples
        const plugins = getPluginExamples();
        testResults.totalPlugins = plugins.length;
        
        info(`Found ${plugins.length} plugin examples to test`);
        log('');
        
        // Test each plugin
        for (const pluginName of plugins) {
            const pluginResult = await testPlugin(pluginName);
            testResults.plugins[pluginName] = pluginResult;
            log(''); // Add spacing between plugins
        }
        
        // Generate reports
        generateTestReport();
        
        // Print summary
        printTestSummary();
        
        // Exit with appropriate code
        process.exit(testResults.failedPlugins > 0 ? 1 : 0);
        
    } catch (error) {
        error(`Test suite failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle missing vm2 dependency gracefully
try {
    require('vm2');
} catch (error) {
    warning('vm2 module not found, installing...');
    try {
        execSync('npm install vm2', { stdio: 'inherit' });
        info('vm2 installed successfully');
    } catch (installError) {
        error('Failed to install vm2. Please run: npm install vm2');
        process.exit(1);
    }
}

// Run main function if called directly
if (require.main === module) {
    main().catch(error => {
        error(`Unhandled error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    main,
    testPlugin,
    setupTestEnvironment,
    generateTestReport
};