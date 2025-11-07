
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
