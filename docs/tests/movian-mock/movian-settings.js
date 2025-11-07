
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
