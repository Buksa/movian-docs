
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
