/**
 * Configurable Plugin Example
 * 
 * Demonstrates comprehensive settings and configuration management in Movian plugins.
 * Shows all setting types, persistent storage, and configuration patterns.
 */

// === IMPORTS ===
var page = require('movian/page');
var service = require('movian/service');
var settings = require('movian/settings');
var store = require('movian/store');
var prop = require('movian/prop');

// === PLUGIN INITIALIZATION ===
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;

console.log(plugin.title + ' ' + plugin.version + ' loaded');

// === CONFIGURATION MANAGEMENT ===

// Configuration object with defaults
var config = {
    // API Configuration
    apiUrl: 'https://api.example.com',
    apiKey: '',
    timeout: 30,
    retries: 3,
    
    // Feature Toggles
    enableCache: true,
    enableNotifications: false,
    debugMode: false,
    
    // User Preferences
    defaultQuality: '720p',
    language: 'en',
    theme: 'dark',
    
    // Advanced Settings
    cacheSize: 100,
    updateInterval: 60
};

// Persistent user data store
var userStore = store.create('userdata');

// Initialize user data structure
userStore.favorites = userStore.favorites || [];
userStore.watchHistory = userStore.watchHistory || {};
userStore.preferences = userStore.preferences || {};
userStore.statistics = userStore.statistics || {
    itemsViewed: 0,
    totalWatchTime: 0,
    lastAccess: null
};

// === SERVICE REGISTRATION ===
service.create(plugin.title, PREFIX + ':start', 'video', true, Plugin.path + plugin.icon);

// === SETTINGS CONFIGURATION ===

// Create global settings group
settings.globalSettings(plugin.id, plugin.title, Plugin.path + plugin.icon, plugin.synopsis);

// Plugin Information Section
settings.createInfo('info', Plugin.path + plugin.icon, 
    'Plugin: ' + plugin.title + ' v' + plugin.version + '\n' +
    'Author: ' + plugin.author + '\n' +
    'Description: ' + plugin.description
);

// === API CONFIGURATION SECTION ===
settings.createDivider('API Configuration');

var apiUrlSetting = settings.createString('apiUrl', 'API Server URL', config.apiUrl, 
    function(value) {
        // Validate URL format
        try {
            new URL(value);
            config.apiUrl = value;
            console.log('API URL updated:', value);
        } catch (e) {
            console.error('Invalid URL format:', value);
            // In a real plugin, you might want to show an error popup
        }
    }
);

var apiKeySetting = settings.createString('apiKey', 'API Key', config.apiKey,
    function(value) {
        config.apiKey = value;
        console.log('API Key updated:', value ? '[HIDDEN]' : '[EMPTY]');
    }
);

var timeoutSetting = settings.createInt('timeout', 'Request Timeout', config.timeout, 
    5, 300, 5, 'seconds', function(value) {
        config.timeout = value;
        console.log('Timeout set to:', value, 'seconds');
    }
);

var retriesSetting = settings.createInt('retries', 'Max Retries', config.retries,
    0, 10, 1, 'attempts', function(value) {
        config.retries = value;
        console.log('Max retries set to:', value);
    }
);

// === FEATURE TOGGLES SECTION ===
settings.createDivider('Features');

var cacheSetting = settings.createBool('enableCache', 'Enable Caching', config.enableCache,
    function(value) {
        config.enableCache = value;
        console.log('Caching', value ? 'enabled' : 'disabled');
        
        if (!value) {
            // Clear cache when disabled
            clearCache();
        }
    }
);

var notificationsSetting = settings.createBool('enableNotifications', 'Show Notifications', 
    config.enableNotifications, function(value) {
        config.enableNotifications = value;
        console.log('Notifications', value ? 'enabled' : 'disabled');
    }
);

var debugSetting = settings.createBool('debugMode', 'Debug Mode', config.debugMode,
    function(value) {
        config.debugMode = value;
        console.log('Debug mode', value ? 'enabled' : 'disabled');
    }, false  // Not persistent - session only
);

// === USER PREFERENCES SECTION ===
settings.createDivider('User Preferences');

var qualitySetting = settings.createMultiOpt('defaultQuality', 'Default Video Quality', [
    ['480p', '480p (SD)', false],
    ['720p', '720p (HD)', true],      // Default option
    ['1080p', '1080p (Full HD)', false],
    ['1440p', '1440p (2K)', false],
    ['2160p', '2160p (4K)', false]
], function(value) {
    config.defaultQuality = value;
    console.log('Default quality set to:', value);
});

var languageSetting = settings.createMultiOpt('language', 'Interface Language', [
    ['en', 'English', true],
    ['es', 'Español', false],
    ['fr', 'Français', false],
    ['de', 'Deutsch', false],
    ['ru', 'Русский', false]
], function(value) {
    config.language = value;
    console.log('Language set to:', value);
});

var themeSetting = settings.createMultiOpt('theme', 'Color Theme', [
    ['light', 'Light Theme', false],
    ['dark', 'Dark Theme', true],
    ['auto', 'Auto (System)', false]
], function(value) {
    config.theme = value;
    console.log('Theme set to:', value);
});

// === ADVANCED SETTINGS SECTION ===
settings.createDivider('Advanced Settings');

var cacheSizeSetting = settings.createInt('cacheSize', 'Cache Size', config.cacheSize,
    10, 1000, 10, 'MB', function(value) {
        config.cacheSize = value;
        console.log('Cache size set to:', value, 'MB');
    }
);

var updateIntervalSetting = settings.createInt('updateInterval', 'Update Interval', 
    config.updateInterval, 15, 3600, 15, 'minutes', function(value) {
        config.updateInterval = value;
        console.log('Update interval set to:', value, 'minutes');
    }
);

// === ACTIONS SECTION ===
settings.createDivider('Actions');

settings.createAction('clearCache', 'Clear Cache', function() {
    clearCache();
    if (config.enableNotifications) {
        console.log('Cache cleared successfully');
    }
});

settings.createAction('resetSettings', 'Reset to Defaults', function() {
    resetToDefaults();
});

settings.createAction('exportSettings', 'Export Settings', function() {
    exportSettings();
});

settings.createAction('showStats', 'Show Statistics', function() {
    showUserStatistics();
});

// === UTILITY FUNCTIONS ===

function clearCache() {
    // Clear cache implementation
    console.log('Clearing cache...');
    
    // In a real plugin, you would clear actual cache data
    userStore.cache = {};
    
    console.log('Cache cleared');
}

function resetToDefaults() {
    console.log('Resetting settings to defaults...');
    
    // Reset all settings to their default values
    apiUrlSetting.value = 'https://api.example.com';
    apiKeySetting.value = '';
    timeoutSetting.value = 30;
    retriesSetting.value = 3;
    cacheSetting.value = true;
    notificationsSetting.value = false;
    qualitySetting.value = '720p';
    languageSetting.value = 'en';
    themeSetting.value = 'dark';
    cacheSizeSetting.value = 100;
    updateIntervalSetting.value = 60;
    
    console.log('Settings reset to defaults');
}

function exportSettings() {
    console.log('Exporting settings...');
    
    var exportData = {
        version: plugin.version,
        timestamp: new Date().toISOString(),
        settings: {
            apiUrl: config.apiUrl,
            timeout: config.timeout,
            retries: config.retries,
            enableCache: config.enableCache,
            enableNotifications: config.enableNotifications,
            defaultQuality: config.defaultQuality,
            language: config.language,
            theme: config.theme,
            cacheSize: config.cacheSize,
            updateInterval: config.updateInterval
        }
    };
    
    console.log('Settings exported:', JSON.stringify(exportData, null, 2));
    // In a real plugin, you might save this to a file or show it to the user
}

function showUserStatistics() {
    console.log('User Statistics:');
    console.log('- Favorites:', userStore.favorites.length);
    console.log('- Watch History Items:', Object.keys(userStore.watchHistory).length);
    console.log('- Items Viewed:', userStore.statistics.itemsViewed);
    console.log('- Total Watch Time:', userStore.statistics.totalWatchTime, 'minutes');
    console.log('- Last Access:', userStore.statistics.lastAccess);
}

// === HELPER FUNCTIONS FOR USER DATA ===

function addToFavorites(itemId, itemTitle) {
    if (userStore.favorites.indexOf(itemId) === -1) {
        userStore.favorites.push(itemId);
        console.log('Added to favorites:', itemTitle);
        
        if (config.enableNotifications) {
            // Show notification
            console.log('Notification: Added to favorites');
        }
    }
}

function removeFromFavorites(itemId, itemTitle) {
    var index = userStore.favorites.indexOf(itemId);
    if (index !== -1) {
        userStore.favorites.splice(index, 1);
        console.log('Removed from favorites:', itemTitle);
    }
}

function markAsWatched(itemId, position, duration) {
    userStore.watchHistory[itemId] = {
        position: position,
        duration: duration,
        timestamp: new Date().toISOString(),
        completed: position / duration > 0.9
    };
    
    // Update statistics
    userStore.statistics.itemsViewed++;
    userStore.statistics.totalWatchTime += duration;
    userStore.statistics.lastAccess = new Date().toISOString();
}

function getWatchProgress(itemId) {
    var history = userStore.watchHistory[itemId];
    if (history) {
        return {
            position: history.position,
            percentage: (history.position / history.duration) * 100,
            completed: history.completed,
            lastWatched: history.timestamp
        };
    }
    return null;
}

// === URL-SCOPED SETTINGS EXAMPLE ===

function createPageSettings(pageUrl) {
    // Create settings scoped to a specific page/service
    var kvstore = require('native/kvstore');
    
    return {
        get: function(key, defaultValue, type) {
            type = type || 'string';
            
            if (type === 'string') {
                return kvstore.getString(pageUrl, 'plugin', key) || defaultValue;
            } else if (type === 'int') {
                return kvstore.getInteger(pageUrl, 'plugin', key, defaultValue);
            } else if (type === 'bool') {
                return kvstore.getBoolean(pageUrl, 'plugin', key, defaultValue);
            }
        },
        
        set: function(key, value) {
            kvstore.set(pageUrl, 'plugin', key, value);
        }
    };
}

// === ROUTE HANDLERS ===

new page.Route(PREFIX + ':start', function(page) {
    page.type = 'directory';
    page.metadata.title = plugin.title + ' - Configuration Demo';
    page.metadata.logo = Plugin.path + plugin.icon;
    
    // Update access statistics
    userStore.statistics.lastAccess = new Date().toISOString();
    
    // Show current configuration
    page.appendItem('', 'separator', {
        title: 'Current Configuration'
    });
    
    page.appendItem('', 'item', {
        title: 'API URL: ' + config.apiUrl
    });
    
    page.appendItem('', 'item', {
        title: 'Timeout: ' + config.timeout + ' seconds'
    });
    
    page.appendItem('', 'item', {
        title: 'Cache: ' + (config.enableCache ? 'Enabled' : 'Disabled')
    });
    
    page.appendItem('', 'item', {
        title: 'Quality: ' + config.defaultQuality
    });
    
    page.appendItem('', 'item', {
        title: 'Language: ' + config.language
    });
    
    // Show user statistics
    page.appendItem('', 'separator', {
        title: 'User Statistics'
    });
    
    page.appendItem('', 'item', {
        title: 'Favorites: ' + userStore.favorites.length + ' items'
    });
    
    page.appendItem('', 'item', {
        title: 'Watch History: ' + Object.keys(userStore.watchHistory).length + ' items'
    });
    
    page.appendItem('', 'item', {
        title: 'Total Views: ' + userStore.statistics.itemsViewed
    });
    
    // Demo actions
    page.appendItem('', 'separator', {
        title: 'Demo Actions'
    });
    
    page.appendItem(PREFIX + ':demo:favorites', 'item', {
        title: 'Demo: Add to Favorites'
    });
    
    page.appendItem(PREFIX + ':demo:watch', 'item', {
        title: 'Demo: Mark as Watched'
    });
    
    page.appendItem(PREFIX + ':demo:settings', 'item', {
        title: 'Demo: Page-specific Settings'
    });
});

// Demo routes
new page.Route(PREFIX + ':demo:favorites', function(page) {
    page.type = 'directory';
    page.metadata.title = 'Favorites Demo';
    
    // Add some demo items to favorites
    addToFavorites('demo1', 'Demo Movie 1');
    addToFavorites('demo2', 'Demo Movie 2');
    
    page.appendItem('', 'item', {
        title: 'Added demo items to favorites'
    });
    
    page.appendItem('', 'item', {
        title: 'Total favorites: ' + userStore.favorites.length
    });
});

new page.Route(PREFIX + ':demo:watch', function(page) {
    page.type = 'directory';
    page.metadata.title = 'Watch History Demo';
    
    // Mark some demo items as watched
    markAsWatched('demo1', 1800, 3600);  // 50% watched
    markAsWatched('demo2', 3400, 3600);  // 94% watched (completed)
    
    page.appendItem('', 'item', {
        title: 'Marked demo items as watched'
    });
    
    page.appendItem('', 'item', {
        title: 'Total watch history: ' + Object.keys(userStore.watchHistory).length
    });
});

new page.Route(PREFIX + ':demo:settings', function(page) {
    page.type = 'directory';
    page.metadata.title = 'Page Settings Demo';
    
    // Create page-specific settings
    var pageSettings = createPageSettings('demo://page:settings');
    
    // Set some page-specific values
    pageSettings.set('viewMode', 'grid');
    pageSettings.set('sortBy', 'title');
    pageSettings.set('showThumbnails', true);
    
    // Read them back
    var viewMode = pageSettings.get('viewMode', 'list');
    var sortBy = pageSettings.get('sortBy', 'date');
    var showThumbnails = pageSettings.get('showThumbnails', false, 'bool');
    
    page.appendItem('', 'item', {
        title: 'View Mode: ' + viewMode
    });
    
    page.appendItem('', 'item', {
        title: 'Sort By: ' + sortBy
    });
    
    page.appendItem('', 'item', {
        title: 'Show Thumbnails: ' + showThumbnails
    });
});

console.log(plugin.title + ' initialization complete');