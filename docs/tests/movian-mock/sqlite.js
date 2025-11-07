
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
