/**
 * Hello World Plugin for Movian
 * 
 * Demonstrates basic plugin development using Movian API 2 (ECMAScript)
 * Compatible with Movian 5.0+
 */

// Import required Movian modules
var page = require('movian/page');
var service = require('movian/service');
var settings = require('movian/settings');
var prop = require('movian/prop');

// Plugin configuration
var PLUGIN_PREFIX = 'hello-world';

// Create main service entry in Movian
service.create("Hello World", PLUGIN_PREFIX + ":start", "video", true, Plugin.path + "logo.png");

// Create plugin settings
settings.globalSettings(PLUGIN_PREFIX, "Hello World Plugin", Plugin.path + "logo.png", "Hello World Plugin Settings");

settings.createDivider("General Settings");

settings.createString("username", "Your Name", "Anonymous", function(value) {
    // This callback is called when the setting changes
    console.log("Username changed to: " + value);
});

settings.createBool("showWelcome", "Show Welcome Message", true, function(value) {
    console.log("Show welcome setting: " + value);
});

settings.createInt("itemCount", "Number of Items", 10, 1, 100, 1, "", function(value) {
    console.log("Item count changed to: " + value);
});

// Main page route
new page.Route(PLUGIN_PREFIX + ':start', function(page) {
    page.type = "directory";
    page.metadata.title = "Hello World Plugin";
    page.metadata.logo = Plugin.path + "logo.png";
    
    // Get username from settings
    var username = settings.username || "Anonymous";
    var showWelcome = settings.showWelcome;
    
    if (showWelcome) {
        page.appendItem("", "separator", {
            title: "Welcome, " + username + "!"
        });
    }
    
    // Add navigation items
    page.appendItem(PLUGIN_PREFIX + ":content", "directory", {
        title: "Sample Content",
        description: "Browse sample content items",
        icon: "dataroot://resources/svg/Movie.svg"
    });
    
    page.appendItem(PLUGIN_PREFIX + ":videos", "directory", {
        title: "Sample Videos",
        description: "Sample video content",
        icon: "dataroot://resources/svg/Video.svg"
    });
    
    page.appendItem(PLUGIN_PREFIX + ":search", "directory", {
        title: "Search Example",
        description: "Demonstrates search functionality",
        icon: "dataroot://resources/svg/Search.svg"
    });
    
    page.appendItem(PLUGIN_PREFIX + ":async", "directory", {
        title: "Async Loading",
        description: "Demonstrates asynchronous content loading",
        icon: "dataroot://resources/svg/Refresh.svg"
    });
    
    page.loading = false;
});

// Content page route
new page.Route(PLUGIN_PREFIX + ':content', function(page) {
    page.type = "directory";
    page.metadata.title = "Sample Content";
    
    var itemCount = settings.itemCount || 10;
    
    for (var i = 1; i <= itemCount; i++) {
        page.appendItem("", "directory", {
            title: "Content Item " + i,
            description: "This is sample content item number " + i,
            icon: "dataroot://resources/svg/Folder.svg"
        });
    }
    
    page.loading = false;
});

// Videos page route
new page.Route(PLUGIN_PREFIX + ':videos', function(page) {
    page.type = "directory";
    page.metadata.title = "Sample Videos";
    
    // Sample video items
    var videos = [
        {
            title: "Big Buck Bunny",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            description: "Open source animated short film"
        },
        {
            title: "Elephant's Dream",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
            description: "First open movie made entirely with open source graphics software"
        },
        {
            title: "Sintel",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            description: "Third open movie created by the Blender Foundation"
        }
    ];
    
    videos.forEach(function(video) {
        page.appendItem(video.url, "video", {
            title: video.title,
            description: video.description,
            icon: "dataroot://resources/svg/Play.svg"
        });
    });
    
    page.loading = false;
});

// Search page route
new page.Route(PLUGIN_PREFIX + ':search', function(page) {
    page.type = "directory";
    page.metadata.title = "Search Example";
    
    // Add search input
    page.appendItem("", "separator", {
        title: "Search Functionality"
    });
    
    // In a real plugin, you would implement actual search
    // This is just a demonstration
    var searchTerms = ["movies", "tv shows", "documentaries", "music", "podcasts"];
    
    searchTerms.forEach(function(term) {
        page.appendItem(PLUGIN_PREFIX + ":search:" + encodeURIComponent(term), "directory", {
            title: "Search: " + term,
            description: "Search results for '" + term + "'",
            icon: "dataroot://resources/svg/Search.svg"
        });
    });
    
    page.loading = false;
});

// Search results route
new page.Route(PLUGIN_PREFIX + ':search:(.*)', function(page, query) {
    page.type = "directory";
    page.metadata.title = "Search Results: " + decodeURIComponent(query);
    
    // Simulate search results
    for (var i = 1; i <= 5; i++) {
        page.appendItem("", "video", {
            title: decodeURIComponent(query) + " Result " + i,
            description: "Search result " + i + " for query: " + decodeURIComponent(query),
            icon: "dataroot://resources/svg/Movie.svg"
        });
    }
    
    page.loading = false;
});

// Async loading page route
new page.Route(PLUGIN_PREFIX + ':async', function(page) {
    page.type = "directory";
    page.metadata.title = "Async Loading Example";
    
    var offset = 0;
    var itemsPerPage = 20;
    
    function loadMoreItems() {
        // Simulate async loading with setTimeout
        setTimeout(function() {
            if (offset >= 100) {
                page.haveMore(false);
                return;
            }
            
            for (var i = 0; i < itemsPerPage; i++) {
                var itemNumber = offset + i + 1;
                page.appendItem("", "directory", {
                    title: "Async Item " + itemNumber,
                    description: "Dynamically loaded item " + itemNumber,
                    icon: "dataroot://resources/svg/Download.svg"
                });
            }
            
            offset += itemsPerPage;
            page.haveMore(true);
        }, 1000); // 1 second delay to simulate network request
    }
    
    // Set up async paginator
    page.asyncPaginator = loadMoreItems;
    
    // Load initial items
    loadMoreItems();
    
    // Note: page.loading is managed by async loading
});

// Plugin initialization
console.log("Hello World Plugin loaded successfully!");
console.log("Plugin API Version: 2");
console.log("Movian Compatibility: 5.0+");