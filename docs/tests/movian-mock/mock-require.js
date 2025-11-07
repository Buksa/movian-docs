
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
