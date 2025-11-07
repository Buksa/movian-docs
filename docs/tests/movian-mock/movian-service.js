
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
