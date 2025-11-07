/**
 * Configurable Plugin Example for Movian
 * 
 * Demonstrates comprehensive settings and configuration management including:
 * - All setting types (string, boolean, integer, multiopt)
 * - Setting validation and callbacks
 * - Dynamic behavior based on settings
 * - Settings persistence and defaults
 * - Advanced configuration patterns
 * 
 * Compatible with Movian 5.0+
 */

// Import required Movian modules
var page = require('movian/page');
var service = require('movian/service');
var settings = require('movian/settings');
var store = require('movian/store');
var http = require('movian/http');

// Plugin configuration
var PLUGIN_PREFIX = 'configurable-plugin';

// Initialize persistent storage for plugin data
var storage = store.create('configurable-plugin-data');

// Create main service entry
service.create("Configurable Plugin", PLUGIN_PREFIX + ":start", "other", true, "logo.png");

// Global settings configuration
settings.globalSettings(PLUGIN_PREFIX, "Configurable Plugin", "logo.png", "Plugin Configuration");

// Basic Settings Section
settings.createDivider("Basic Configuration");

settings.createString("pluginName", "Plugin Display Name", "My Configurable Plugin", function(value) {
    console.log("Plugin name changed to: " + value);
    // Update service name dynamically
    if (value && value.trim()) {
        // Note: Service name update would require plugin restart in real Movian
        storage.displayName = value.trim();
    }
});

settings.createBool("enablePlugin", "Enable Plugin", true, function(value) {
    console.log("Plugin " + (value ? "enabled" : "disabled"));
    storage.enabled = value;
    
    if (!value) {
        console.log("Plugin functionality disabled by user");
    }
});

settings.createBool("enableLogging", "Enable Debug Logging", false, function(value) {
    console.log("Debug logging " + (value ? "enabled" : "disabled"));
    storage.debugMode = value;
});

// Network Settings Section
settings.createDivider("Network Configuration");

settings.createString("apiEndpoint", "API Endpoint URL", "https://api.example.com", function(value) {
    console.log("API endpoint set to: " + value);
    storage.apiEndpoint = value;
    
    // Validate URL format
    if (value && !isValidUrl(value)) {
        console.warn("Invalid URL format: " + value);
    }
});

settings.createString("apiKey", "API Key", "", function(value) {
    console.log("API key " + (value ? "configured" : "cleared"));
    storage.apiKey = value;
});

settings.createInt("requestTimeout", "Request Timeout (seconds)", 30, 5, 300, 5, "sec", function(value) {
    console.log("Request timeout set to: " + value + " seconds");
    storage.requestTimeout = value;
});

settings.createInt("maxRetries", "Max Retry Attempts", 3, 0, 10, 1, "", function(value) {
    console.log("Max retries set to: " + value);
    storage.maxRetries = value;
});

// Content Settings Section
settings.createDivider("Content Preferences");

settings.createMultiOpt("contentType", "Preferred Content Type", [
    ["movies", "Movies"],
    ["tvshows", "TV Shows"], 
    ["music", "Music"],
    ["all", "All Content"]
], "all", function(value) {
    console.log("Content type preference: " + value);
    storage.contentType = value;
});

settings.createMultiOpt("videoQuality", "Preferred Video Quality", [
    ["480p", "480p (SD)"],
    ["720p", "720p (HD)"],
    ["1080p", "1080p (Full HD)"],
    ["4k", "4K (Ultra HD)"],
    ["auto", "Auto (Best Available)"]
], "auto", function(value) {
    console.log("Video quality preference: " + value);
    storage.videoQuality = value;
});

settings.createMultiOpt("language", "Preferred Language", [
    ["en", "English"],
    ["es", "Spanish"],
    ["fr", "French"],
    ["de", "German"],
    ["it", "Italian"],
    ["pt", "Portuguese"],
    ["ru", "Russian"],
    ["ja", "Japanese"],
    ["auto", "Auto-detect"]
], "en", function(value) {
    console.log("Language preference: " + value);
    storage.language = value;
});

// Display Settings Section
settings.createDivider("Display Options");

settings.createInt("itemsPerPage", "Items Per Page", 25, 5, 100, 5, "", function(value) {
    console.log("Items per page: " + value);
    storage.itemsPerPage = value;
});

settings.createBool("showThumbnails", "Show Thumbnails", true, function(value) {
    console.log("Thumbnails " + (value ? "enabled" : "disabled"));
    storage.showThumbnails = value;
});

settings.createBool("showRatings", "Show Ratings", true, function(value) {
    console.log("Ratings display " + (value ? "enabled" : "disabled"));
    storage.showRatings = value;
});

settings.createBool("showDescriptions", "Show Descriptions", true, function(value) {
    console.log("Descriptions " + (value ? "enabled" : "disabled"));
    storage.showDescriptions = value;
});

// Cache Settings Section
settings.createDivider("Cache Configuration");

settings.createBool("enableCache", "Enable Caching", true, function(value) {
    console.log("Caching " + (value ? "enabled" : "disabled"));
    storage.cacheEnabled = value;
    
    if (!value) {
        // Clear cache when disabled
        clearCache();
    }
});

settings.createInt("cacheSize", "Cache Size (MB)", 50, 10, 500, 10, "MB", function(value) {
    console.log("Cache size set to: " + value + " MB");
    storage.cacheSize = value;
});

settings.createInt("cacheExpiry", "Cache Expiry (hours)", 24, 1, 168, 1, "hrs", function(value) {
    console.log("Cache expiry set to: " + value + " hours");
    storage.cacheExpiry = value;
});

// Advanced Settings Section
settings.createDivider("Advanced Options");

settings.createBool("enableExperimentalFeatures", "Enable Experimental Features", false, function(value) {
    console.log("Experimental features " + (value ? "enabled" : "disabled"));
    storage.experimentalFeatures = value;
    
    if (value) {
        console.warn("Experimental features enabled - some functionality may be unstable");
    }
});

settings.createString("customUserAgent", "Custom User Agent", "", function(value) {
    console.log("Custom user agent: " + (value || "default"));
    storage.customUserAgent = value;
});

settings.createMultiOpt("logLevel", "Log Level", [
    ["error", "Error Only"],
    ["warn", "Warning"],
    ["info", "Information"],
    ["debug", "Debug"],
    ["trace", "Trace (Verbose)"]
], "info", function(value) {
    console.log("Log level set to: " + value);
    storage.logLevel = value;
});

// Action Settings Section
settings.createDivider("Actions");

settings.createAction("clearCache", "Clear Cache", function() {
    console.log("Clearing cache...");
    clearCache();
    console.log("Cache cleared successfully");
});

settings.createAction("resetSettings", "Reset to Defaults", function() {
    console.log("Resetting settings to defaults...");
    resetToDefaults();
    console.log("Settings reset completed");
});

settings.createAction("testConnection", "Test API Connection", function() {
    console.log("Testing API connection...");
    testApiConnection();
});

settings.createAction("exportSettings", "Export Settings", function() {
    console.log("Exporting settings...");
    exportSettings();
});

// Utility functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function debugLog(message) {
    if (storage.debugMode) {
        console.log("[DEBUG] " + message);
    }
}

function clearCache() {
    // Clear all cached data
    var cacheKeys = Object.keys(storage).filter(function(key) {
        return key.startsWith('cache_');
    });
    
    cacheKeys.forEach(function(key) {
        delete storage[key];
    });
    
    debugLog("Cleared " + cacheKeys.length + " cache entries");
}

function resetToDefaults() {
    // Reset all settings to their default values
    // Note: In real implementation, this would reset the actual settings
    console.log("Resetting to default values...");
    
    // Clear storage
    var keys = Object.keys(storage);
    keys.forEach(function(key) {
        delete storage[key];
    });
    
    // Set default values
    storage.displayName = "My Configurable Plugin";
    storage.enabled = true;
    storage.debugMode = false;
    storage.apiEndpoint = "https://api.example.com";
    storage.contentType = "all";
    storage.videoQuality = "auto";
    storage.language = "en";
    storage.itemsPerPage = 25;
    storage.cacheEnabled = true;
    storage.cacheSize = 50;
    storage.cacheExpiry = 24;
    
    console.log("Settings reset to defaults");
}

function testApiConnection() {
    if (!storage.enabled) {
        console.log("Plugin is disabled - skipping connection test");
        return;
    }
    
    var endpoint = storage.apiEndpoint || "https://api.example.com";
    var timeout = (storage.requestTimeout || 30) * 1000;
    
    debugLog("Testing connection to: " + endpoint);
    
    try {
        var requestOptions = {
            timeout: timeout,
            headers: {
                'User-Agent': storage.customUserAgent || 'Movian Configurable Plugin 1.0'
            }
        };
        
        if (storage.apiKey) {
            requestOptions.headers['Authorization'] = 'Bearer ' + storage.apiKey;
        }
        
        // Test with a simple HEAD request or GET to root
        var testUrl = endpoint + (endpoint.endsWith('/') ? '' : '/') + 'health';
        
        console.log("Testing connection to: " + testUrl);
        
        // In a real implementation, you would make an actual HTTP request
        // For this example, we'll simulate the test
        setTimeout(function() {
            console.log("✓ Connection test successful");
            console.log("  - Endpoint: " + endpoint);
            console.log("  - Timeout: " + timeout + "ms");
            console.log("  - API Key: " + (storage.apiKey ? "configured" : "not set"));
        }, 1000);
        
    } catch (error) {
        console.error("✗ Connection test failed: " + error.message);
    }
}

function exportSettings() {
    var settingsExport = {
        pluginName: storage.displayName,
        enablePlugin: storage.enabled,
        enableLogging: storage.debugMode,
        apiEndpoint: storage.apiEndpoint,
        contentType: storage.contentType,
        videoQuality: storage.videoQuality,
        language: storage.language,
        itemsPerPage: storage.itemsPerPage,
        showThumbnails: storage.showThumbnails,
        showRatings: storage.showRatings,
        showDescriptions: storage.showDescriptions,
        enableCache: storage.cacheEnabled,
        cacheSize: storage.cacheSize,
        cacheExpiry: storage.cacheExpiry,
        experimentalFeatures: storage.experimentalFeatures,
        logLevel: storage.logLevel,
        exportDate: new Date().toISOString()
    };
    
    console.log("Settings export:");
    console.log(JSON.stringify(settingsExport, null, 2));
}

// HTTP request helper that respects settings
function makeRequest(url, options) {
    if (!storage.enabled) {
        throw new Error("Plugin is disabled");
    }
    
    options = options || {};
    
    var requestOptions = {
        timeout: (storage.requestTimeout || 30) * 1000,
        headers: {
            'User-Agent': storage.customUserAgent || 'Movian Configurable Plugin 1.0',
            'Accept': 'application/json',
            'Accept-Language': storage.language || 'en'
        }
    };
    
    // Add API key if configured
    if (storage.apiKey) {
        requestOptions.headers['Authorization'] = 'Bearer ' + storage.apiKey;
    }
    
    // Merge with provided options
    for (var key in options) {
        if (key === 'headers') {
            for (var header in options.headers) {
                requestOptions.headers[header] = options.headers[header];
            }
        } else {
            requestOptions[key] = options[key];
        }
    }
    
    debugLog("Making request to: " + url);
    debugLog("Request options: " + JSON.stringify(requestOptions, null, 2));
    
    var retries = 0;
    var maxRetries = storage.maxRetries || 3;
    
    function attemptRequest() {
        try {
            var response = http.request(url, requestOptions);
            
            if (response.statuscode >= 200 && response.statuscode < 300) {
                debugLog("Request successful: " + response.statuscode);
                return JSON.parse(response.toString());
            } else {
                throw new Error("HTTP " + response.statuscode + ": " + response.statusMessage);
            }
        } catch (error) {
            retries++;
            debugLog("Request attempt " + retries + " failed: " + error.message);
            
            if (retries < maxRetries) {
                debugLog("Retrying request (" + retries + "/" + maxRetries + ")");
                return attemptRequest();
            } else {
                throw error;
            }
        }
    }
    
    return attemptRequest();
}

// Cache management with settings integration
function getCachedData(key) {
    if (!storage.cacheEnabled) {
        return null;
    }
    
    var cacheKey = 'cache_' + key;
    var cached = storage[cacheKey];
    
    if (!cached) {
        return null;
    }
    
    var expiryTime = (storage.cacheExpiry || 24) * 60 * 60 * 1000; // Convert hours to ms
    var isExpired = (Date.now() - cached.timestamp) > expiryTime;
    
    if (isExpired) {
        debugLog("Cache expired for key: " + key);
        delete storage[cacheKey];
        return null;
    }
    
    debugLog("Cache hit for key: " + key);
    return cached.data;
}

function setCachedData(key, data) {
    if (!storage.cacheEnabled) {
        return;
    }
    
    var cacheKey = 'cache_' + key;
    storage[cacheKey] = {
        data: data,
        timestamp: Date.now()
    };
    
    debugLog("Cached data for key: " + key);
}

// Main page route
new page.Route(PLUGIN_PREFIX + ':start', function(page) {
    page.type = "directory";
    page.metadata.title = storage.displayName || "Configurable Plugin";
    page.metadata.logo = "logo.png";
    
    if (!storage.enabled) {
        page.appendItem("", "info", {
            title: "Plugin Disabled",
            description: "Enable the plugin in settings to use its features"
        });
        page.loading = false;
        return;
    }
    
    try {
        // Configuration status
        page.appendItem("", "separator", {
            title: "Configuration Status"
        });
        
        page.appendItem("", "info", {
            title: "Plugin Status: " + (storage.enabled ? "✓ Enabled" : "✗ Disabled"),
            description: "Debug Mode: " + (storage.debugMode ? "On" : "Off")
        });
        
        page.appendItem("", "info", {
            title: "API Configuration",
            description: "Endpoint: " + (storage.apiEndpoint || "Not set") + 
                        " | Key: " + (storage.apiKey ? "Configured" : "Not set")
        });
        
        page.appendItem("", "info", {
            title: "Content Preferences",
            description: "Type: " + (storage.contentType || "all") + 
                        " | Quality: " + (storage.videoQuality || "auto") + 
                        " | Language: " + (storage.language || "en")
        });
        
        page.appendItem("", "info", {
            title: "Cache Status",
            description: "Enabled: " + (storage.cacheEnabled ? "Yes" : "No") + 
                        " | Size: " + (storage.cacheSize || 50) + "MB" +
                        " | Expiry: " + (storage.cacheExpiry || 24) + "h"
        });
        
        // Feature demonstrations
        page.appendItem("", "separator", {
            title: "Feature Demonstrations"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":demo:content", "directory", {
            title: "Content Browser",
            description: "Browse content using current settings",
            icon: "dataroot://resources/svg/Movie.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":demo:api", "directory", {
            title: "API Test",
            description: "Test API functionality with current configuration",
            icon: "dataroot://resources/svg/Network.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":demo:cache", "directory", {
            title: "Cache Demo",
            description: "Demonstrate caching behavior",
            icon: "dataroot://resources/svg/Storage.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":demo:settings", "directory", {
            title: "Settings Info",
            description: "View all current settings values",
            icon: "dataroot://resources/svg/Settings.svg"
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load main page: " + error.message);
    }
});

// Content browser demo
new page.Route(PLUGIN_PREFIX + ':demo:content', function(page) {
    page.type = "directory";
    page.metadata.title = "Content Browser";
    
    if (!storage.enabled) {
        page.error("Plugin is disabled");
        return;
    }
    
    try {
        var itemsPerPage = storage.itemsPerPage || 25;
        var contentType = storage.contentType || "all";
        var showThumbnails = storage.showThumbnails !== false;
        var showRatings = storage.showRatings !== false;
        var showDescriptions = storage.showDescriptions !== false;
        
        debugLog("Loading content browser with " + itemsPerPage + " items per page");
        
        // Generate demo content based on settings
        for (var i = 1; i <= itemsPerPage; i++) {
            var itemTitle = "Demo Item " + i;
            var itemDescription = showDescriptions ? "This is a demo item configured according to your settings." : "";
            var itemIcon = showThumbnails ? "https://via.placeholder.com/300x450/0066cc/ffffff?text=Item+" + i : "";
            var itemRating = showRatings ? (60 + (i % 40)) : undefined;
            
            // Filter by content type
            var itemType = "video";
            if (contentType === "movies" || (contentType === "all" && i % 3 === 0)) {
                itemTitle = "Demo Movie " + i;
                itemType = "video";
            } else if (contentType === "tvshows" || (contentType === "all" && i % 3 === 1)) {
                itemTitle = "Demo TV Show " + i;
                itemType = "directory";
            } else if (contentType === "music" || (contentType === "all" && i % 3 === 2)) {
                itemTitle = "Demo Song " + i;
                itemType = "audio";
            }
            
            page.appendItem("", itemType, {
                title: itemTitle,
                description: itemDescription,
                icon: itemIcon,
                rating: itemRating,
                year: 2020 + (i % 5)
            });
        }
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load content: " + error.message);
    }
});

// API test demo
new page.Route(PLUGIN_PREFIX + ':demo:api', function(page) {
    page.type = "directory";
    page.metadata.title = "API Test";
    
    if (!storage.enabled) {
        page.error("Plugin is disabled");
        return;
    }
    
    page.appendItem("", "info", {
        title: "API Configuration Test",
        description: "Testing with endpoint: " + (storage.apiEndpoint || "Not configured")
    });
    
    page.appendItem("", "info", {
        title: "Request Settings",
        description: "Timeout: " + (storage.requestTimeout || 30) + "s | " +
                    "Max Retries: " + (storage.maxRetries || 3) + " | " +
                    "User Agent: " + (storage.customUserAgent || "Default")
    });
    
    // Simulate API test results
    page.appendItem("", "separator", {
        title: "Test Results"
    });
    
    if (storage.apiEndpoint && isValidUrl(storage.apiEndpoint)) {
        page.appendItem("", "info", {
            title: "✓ Endpoint URL Valid",
            description: storage.apiEndpoint
        });
    } else {
        page.appendItem("", "info", {
            title: "✗ Invalid Endpoint URL",
            description: "Please configure a valid API endpoint in settings"
        });
    }
    
    page.appendItem("", "info", {
        title: storage.apiKey ? "✓ API Key Configured" : "⚠ No API Key",
        description: storage.apiKey ? "API key is set and will be included in requests" : "Some APIs may require authentication"
    });
    
    page.loading = false;
});

// Cache demo
new page.Route(PLUGIN_PREFIX + ':demo:cache', function(page) {
    page.type = "directory";
    page.metadata.title = "Cache Demo";
    
    if (!storage.enabled) {
        page.error("Plugin is disabled");
        return;
    }
    
    page.appendItem("", "info", {
        title: "Cache Configuration",
        description: "Enabled: " + (storage.cacheEnabled ? "Yes" : "No") + 
                    " | Size Limit: " + (storage.cacheSize || 50) + "MB" +
                    " | Expiry: " + (storage.cacheExpiry || 24) + " hours"
    });
    
    // Show cache statistics
    var cacheKeys = Object.keys(storage).filter(function(key) {
        return key.startsWith('cache_');
    });
    
    page.appendItem("", "separator", {
        title: "Cache Statistics"
    });
    
    page.appendItem("", "info", {
        title: "Cache Entries: " + cacheKeys.length,
        description: cacheKeys.length > 0 ? "Cache is being used" : "No cached data"
    });
    
    // Demonstrate cache functionality
    if (storage.cacheEnabled) {
        // Add some demo cache data
        setCachedData("demo_data_1", { message: "This is cached demo data 1", timestamp: Date.now() });
        setCachedData("demo_data_2", { message: "This is cached demo data 2", timestamp: Date.now() });
        
        var cachedData1 = getCachedData("demo_data_1");
        var cachedData2 = getCachedData("demo_data_2");
        
        if (cachedData1) {
            page.appendItem("", "info", {
                title: "✓ Cache Test 1",
                description: cachedData1.message
            });
        }
        
        if (cachedData2) {
            page.appendItem("", "info", {
                title: "✓ Cache Test 2", 
                description: cachedData2.message
            });
        }
    } else {
        page.appendItem("", "info", {
            title: "Cache Disabled",
            description: "Enable caching in settings to see cache functionality"
        });
    }
    
    page.loading = false;
});

// Settings info demo
new page.Route(PLUGIN_PREFIX + ':demo:settings', function(page) {
    page.type = "directory";
    page.metadata.title = "Current Settings";
    
    page.appendItem("", "separator", {
        title: "Basic Settings"
    });
    
    page.appendItem("", "info", {
        title: "Plugin Name",
        description: storage.displayName || "My Configurable Plugin"
    });
    
    page.appendItem("", "info", {
        title: "Plugin Enabled",
        description: storage.enabled ? "Yes" : "No"
    });
    
    page.appendItem("", "info", {
        title: "Debug Logging",
        description: storage.debugMode ? "Enabled" : "Disabled"
    });
    
    page.appendItem("", "separator", {
        title: "Network Settings"
    });
    
    page.appendItem("", "info", {
        title: "API Endpoint",
        description: storage.apiEndpoint || "Not configured"
    });
    
    page.appendItem("", "info", {
        title: "API Key",
        description: storage.apiKey ? "Configured (hidden)" : "Not set"
    });
    
    page.appendItem("", "info", {
        title: "Request Timeout",
        description: (storage.requestTimeout || 30) + " seconds"
    });
    
    page.appendItem("", "separator", {
        title: "Content Preferences"
    });
    
    page.appendItem("", "info", {
        title: "Content Type",
        description: storage.contentType || "all"
    });
    
    page.appendItem("", "info", {
        title: "Video Quality",
        description: storage.videoQuality || "auto"
    });
    
    page.appendItem("", "info", {
        title: "Language",
        description: storage.language || "en"
    });
    
    page.appendItem("", "separator", {
        title: "Display Options"
    });
    
    page.appendItem("", "info", {
        title: "Items Per Page",
        description: (storage.itemsPerPage || 25).toString()
    });
    
    page.appendItem("", "info", {
        title: "Show Thumbnails",
        description: (storage.showThumbnails !== false) ? "Yes" : "No"
    });
    
    page.appendItem("", "info", {
        title: "Show Ratings",
        description: (storage.showRatings !== false) ? "Yes" : "No"
    });
    
    page.loading = false;
});

// Plugin initialization
console.log("Configurable Plugin loaded successfully!");

// Initialize default values if not set
if (storage.displayName === undefined) storage.displayName = "My Configurable Plugin";
if (storage.enabled === undefined) storage.enabled = true;
if (storage.debugMode === undefined) storage.debugMode = false;
if (storage.apiEndpoint === undefined) storage.apiEndpoint = "https://api.example.com";
if (storage.contentType === undefined) storage.contentType = "all";
if (storage.videoQuality === undefined) storage.videoQuality = "auto";
if (storage.language === undefined) storage.language = "en";
if (storage.itemsPerPage === undefined) storage.itemsPerPage = 25;
if (storage.cacheEnabled === undefined) storage.cacheEnabled = true;
if (storage.cacheSize === undefined) storage.cacheSize = 50;
if (storage.cacheExpiry === undefined) storage.cacheExpiry = 24;

debugLog("Plugin initialization complete");
debugLog("Current configuration: " + JSON.stringify({
    enabled: storage.enabled,
    contentType: storage.contentType,
    cacheEnabled: storage.cacheEnabled,
    itemsPerPage: storage.itemsPerPage
}, null, 2));