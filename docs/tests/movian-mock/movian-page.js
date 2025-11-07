
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
