/**
 * Search Plugin Example for Movian
 * 
 * Demonstrates advanced search functionality including:
 * - Multi-source search aggregation
 * - Search history and suggestions
 * - Result filtering and sorting
 * - Search performance optimization
 * 
 * Compatible with Movian 5.0+
 */

// Import required Movian modules
var page = require('movian/page');
var service = require('movian/service');
var http = require('movian/http');
var settings = require('movian/settings');
var store = require('movian/store');

// Plugin configuration
var PLUGIN_PREFIX = 'search-plugin';

// Initialize persistent storage
var storage = store.create('search-plugin-data');

// Create main service entry
service.create("Advanced Search", PLUGIN_PREFIX + ":start", "other", true, Plugin.path + "logo.png");

// Plugin settings
settings.globalSettings(PLUGIN_PREFIX, "Search Plugin", Plugin.path + "logo.png", "Search Configuration");

settings.createDivider("Search Sources");

settings.createBool("enableMovies", "Search Movies", true, function(value) {
    console.log("Movie search " + (value ? "enabled" : "disabled"));
});

settings.createBool("enableTVShows", "Search TV Shows", true, function(value) {
    console.log("TV show search " + (value ? "enabled" : "disabled"));
});

settings.createBool("enableMusic", "Search Music", false, function(value) {
    console.log("Music search " + (value ? "enabled" : "disabled"));
});

settings.createDivider("Search Behavior");

settings.createInt("maxResults", "Max Results Per Source", 20, 5, 100, 5, "", function(value) {
    console.log("Max results per source: " + value);
});

settings.createBool("enableHistory", "Save Search History", true, function(value) {
    console.log("Search history " + (value ? "enabled" : "disabled"));
});

settings.createBool("enableSuggestions", "Show Search Suggestions", true, function(value) {
    console.log("Search suggestions " + (value ? "enabled" : "disabled"));
});

settings.createString("defaultSort", "Default Sort Order", "relevance", function(value) {
    console.log("Default sort order: " + value);
});

// Search history management
function getSearchHistory() {
    if (!settings.enableHistory) return [];
    return storage.searchHistory || [];
}

function addToSearchHistory(query) {
    if (!settings.enableHistory || !query.trim()) return;
    
    var history = getSearchHistory();
    
    // Remove if already exists
    history = history.filter(function(item) {
        return item.query !== query;
    });
    
    // Add to beginning
    history.unshift({
        query: query,
        timestamp: Date.now(),
        count: 1
    });
    
    // Keep only last 50 searches
    history = history.slice(0, 50);
    
    storage.searchHistory = history;
}

function getSearchSuggestions(partial) {
    if (!settings.enableSuggestions || !partial) return [];
    
    var history = getSearchHistory();
    var suggestions = [];
    
    // Add matching history items
    history.forEach(function(item) {
        if (item.query.toLowerCase().indexOf(partial.toLowerCase()) === 0) {
            suggestions.push(item.query);
        }
    });
    
    // Add common search terms
    var commonTerms = [
        "action movies", "comedy shows", "drama series", "sci-fi films",
        "thriller movies", "documentary", "animation", "horror movies",
        "romantic comedy", "adventure films", "mystery series", "fantasy movies"
    ];
    
    commonTerms.forEach(function(term) {
        if (term.toLowerCase().indexOf(partial.toLowerCase()) === 0 && 
            suggestions.indexOf(term) === -1) {
            suggestions.push(term);
        }
    });
    
    return suggestions.slice(0, 10);
}

// Search source implementations
var searchSources = {
    movies: {
        name: "Movies",
        enabled: function() { return settings.enableMovies; },
        search: function(query, options, callback) {
            // Simulate movie search API with callback
            setTimeout(function() {
                try {
                    var results = [];
                    var maxResults = options.maxResults || 20;
                    
                    // Generate mock movie results
                    for (var i = 1; i <= maxResults; i++) {
                        var relevance = Math.random();
                        if (relevance > 0.3) { // Filter by relevance
                            results.push({
                                type: 'movie',
                                title: query + " Movie " + i,
                                description: "A movie about " + query + " with exciting plot and characters.",
                                year: 2015 + (i % 8),
                                rating: (6.0 + Math.random() * 4).toFixed(1),
                                genre: ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi"][i % 5],
                                poster: "https://via.placeholder.com/300x450/0066cc/ffffff?text=Movie+" + i,
                                url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                relevance: relevance,
                                source: "movies"
                            });
                        }
                    }
                    
                    callback(null, results);
                } catch (error) {
                    callback(error);
                }
            }, 800 + Math.random() * 400); // Simulate network delay
        }
    },
    
    tvshows: {
        name: "TV Shows",
        enabled: function() { return settings.enableTVShows; },
        search: function(query, options, callback) {
            setTimeout(function() {
                try {
                    var results = [];
                    var maxResults = options.maxResults || 20;
                    
                    for (var i = 1; i <= maxResults; i++) {
                        var relevance = Math.random();
                        if (relevance > 0.4) {
                            results.push({
                                type: 'tvshow',
                                title: query + " Series " + i,
                                description: "A TV series about " + query + " spanning multiple seasons.",
                                year: 2010 + (i % 12),
                                rating: (7.0 + Math.random() * 3).toFixed(1),
                                seasons: 1 + (i % 6),
                                episodes: 10 + (i % 20),
                                poster: "https://via.placeholder.com/300x450/cc6600/ffffff?text=TV+" + i,
                                relevance: relevance,
                                source: "tvshows"
                            });
                        }
                    }
                    
                    callback(null, results);
                } catch (error) {
                    callback(error);
                }
            }, 600 + Math.random() * 600);
        }
    },
    
    music: {
        name: "Music",
        enabled: function() { return settings.enableMusic; },
        search: function(query, options, callback) {
            setTimeout(function() {
                try {
                    var results = [];
                    var maxResults = options.maxResults || 20;
                    
                    for (var i = 1; i <= maxResults; i++) {
                        var relevance = Math.random();
                        if (relevance > 0.35) {
                            results.push({
                                type: 'music',
                                title: query + " Song " + i,
                                artist: "Artist " + (i % 10 + 1),
                                album: query + " Album",
                                duration: 180 + (i % 120), // 3-5 minutes
                                year: 2000 + (i % 23),
                                genre: ["Rock", "Pop", "Jazz", "Electronic", "Classical"][i % 5],
                                url: "http://www.lonelycoder.com/music/Hybris_Intro-remake.mp3",
                                relevance: relevance,
                                source: "music"
                            });
                        }
                    }
                    
                    callback(null, results);
                } catch (error) {
                    callback(error);
                }
            }, 500 + Math.random() * 300);
        }
    }
};

// Search aggregation and sorting with callbacks
function performSearch(query, options, callback) {
    options = options || {};
    var maxResults = options.maxResults || settings.maxResults || 20;
    var sortBy = options.sortBy || settings.defaultSort || 'relevance';
    
    console.log("Performing search for: '" + query + "'");
    
    var enabledSources = [];
    var results = [];
    var completedCount = 0;
    var hasError = false;
    
    // Collect enabled sources
    for (var sourceId in searchSources) {
        var source = searchSources[sourceId];
        if (source.enabled()) {
            enabledSources.push({ id: sourceId, source: source });
        }
    }
    
    if (enabledSources.length === 0) {
        callback(null, []);
        return;
    }
    
    // Helper function to check if all searches completed
    function checkComplete() {
        if (hasError) return;
        
        completedCount++;
        if (completedCount === enabledSources.length) {
            // All searches complete, sort and return results
            results.sort(function(a, b) {
                switch (sortBy) {
                    case 'relevance':
                        return (b.relevance || 0) - (a.relevance || 0);
                    case 'year':
                        return (b.year || 0) - (a.year || 0);
                    case 'rating':
                        return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
                    case 'title':
                        return (a.title || '').localeCompare(b.title || '');
                    default:
                        return (b.relevance || 0) - (a.relevance || 0);
                }
            });
            
            callback(null, results);
        }
    }
    
    // Start searches for all enabled sources
    enabledSources.forEach(function(sourceInfo) {
        sourceInfo.source.search(query, { maxResults: maxResults }, function(err, sourceResults) {
            if (hasError) return;
            
            if (err) {
                hasError = true;
                console.error("Search failed for " + sourceInfo.id + ": " + err.message);
                callback(err);
                return;
            }
            
            // Add results from this source
            if (sourceResults && Array.isArray(sourceResults)) {
                results = results.concat(sourceResults);
            }
            
            checkComplete();
        });
    });
}

// Main page route
new page.Route(PLUGIN_PREFIX + ':start', function(page) {
    page.type = "directory";
    page.metadata.title = "Advanced Search";
    page.metadata.logo = Plugin.path + "logo.png";
    
    // Quick search options
    page.appendItem(PLUGIN_PREFIX + ":search", "directory", {
        title: "🔍 New Search",
        description: "Start a new search",
        icon: "dataroot://resources/svg/Search.svg"
    });
    
    // Search history
    if (settings.enableHistory) {
        var history = getSearchHistory();
        if (history.length > 0) {
            page.appendItem("", "separator", {
                title: "Recent Searches"
            });
            
            history.slice(0, 10).forEach(function(item) {
                page.appendItem(PLUGIN_PREFIX + ":results:" + encodeURIComponent(item.query), "directory", {
                    title: item.query,
                    description: "Search performed " + new Date(item.timestamp).toLocaleDateString(),
                    icon: "dataroot://resources/svg/History.svg"
                });
            });
        }
    }
    
    // Popular searches
    page.appendItem("", "separator", {
        title: "Popular Searches"
    });
    
    var popularSearches = ["action", "comedy", "drama", "sci-fi", "thriller", "documentary"];
    popularSearches.forEach(function(term) {
        page.appendItem(PLUGIN_PREFIX + ":results:" + encodeURIComponent(term), "directory", {
            title: term.charAt(0).toUpperCase() + term.slice(1),
            description: "Browse " + term + " content",
            icon: "dataroot://resources/svg/Star.svg"
        });
    });
    
    // Advanced search options
    page.appendItem(PLUGIN_PREFIX + ":advanced", "directory", {
        title: "⚙️ Advanced Search",
        description: "Search with filters and options",
        icon: "dataroot://resources/svg/Settings.svg"
    });
    
    page.loading = false;
});

// Search input page
new page.Route(PLUGIN_PREFIX + ':search', function(page) {
    page.type = "directory";
    page.metadata.title = "Search";
    
    // Search suggestions based on history
    if (settings.enableSuggestions) {
        var suggestions = getSearchSuggestions("");
        if (suggestions.length > 0) {
            page.appendItem("", "separator", {
                title: "Search Suggestions"
            });
            
            suggestions.forEach(function(suggestion) {
                page.appendItem(PLUGIN_PREFIX + ":results:" + encodeURIComponent(suggestion), "directory", {
                    title: suggestion,
                    description: "Search for '" + suggestion + "'",
                    icon: "dataroot://resources/svg/Lightbulb.svg"
                });
            });
        }
    }
    
    // Search by category
    page.appendItem("", "separator", {
        title: "Search by Category"
    });
    
    if (settings.enableMovies) {
        page.appendItem(PLUGIN_PREFIX + ":category:movies", "directory", {
            title: "Movies",
            description: "Search movies only",
            icon: "dataroot://resources/svg/Movie.svg"
        });
    }
    
    if (settings.enableTVShows) {
        page.appendItem(PLUGIN_PREFIX + ":category:tvshows", "directory", {
            title: "TV Shows",
            description: "Search TV shows only",
            icon: "dataroot://resources/svg/TV.svg"
        });
    }
    
    if (settings.enableMusic) {
        page.appendItem(PLUGIN_PREFIX + ":category:music", "directory", {
            title: "Music",
            description: "Search music only",
            icon: "dataroot://resources/svg/Music.svg"
        });
    }
    
    page.loading = false;
});

// Search results page
new page.Route(PLUGIN_PREFIX + ':results:(.*)', function(page, encodedQuery) {
    var query = decodeURIComponent(encodedQuery);
    page.type = "directory";
    page.metadata.title = "Search: " + query;
    
    if (!query.trim()) {
        page.error("Please enter a search term");
        return;
    }
    
    // Add to search history
    addToSearchHistory(query);
    
    // Show loading message
    page.loading = true;
    
    // Perform search with callback
    performSearch(query, {}, function(err, results) {
        page.loading = false;
        
        if (err) {
            page.error("Search failed: " + err.message);
            return;
        }
        
        if (results.length === 0) {
            page.appendItem("", "info", {
                title: "No Results Found",
                description: "Try different search terms or check your search settings"
            });
            return;
        }
        
        // Group results by source
        var groupedResults = {};
        results.forEach(function(result) {
            if (!groupedResults[result.source]) {
                groupedResults[result.source] = [];
            }
            groupedResults[result.source].push(result);
        });
        
        // Display results by source
        for (var sourceId in groupedResults) {
            var sourceResults = groupedResults[sourceId];
            var sourceName = searchSources[sourceId].name;
            
            page.appendItem("", "separator", {
                title: sourceName + " (" + sourceResults.length + " results)"
            });
            
            sourceResults.forEach(function(result) {
                var itemType = result.type === 'music' ? 'audio' : 
                              result.type === 'movie' ? 'video' : 'directory';
                
                var description = result.description || "";
                if (result.year) description += " (" + result.year + ")";
                if (result.rating) description += " ★ " + result.rating;
                if (result.artist) description += " by " + result.artist;
                if (result.seasons) description += " • " + result.seasons + " seasons";
                
                page.appendItem(result.url || "", itemType, {
                    title: result.title,
                    description: description,
                    icon: result.poster || "dataroot://resources/svg/Movie.svg",
                    year: result.year,
                    rating: result.rating ? parseFloat(result.rating) * 10 : undefined,
                    genre: result.genre,
                    artist: result.artist,
                    album: result.album,
                    duration: result.duration
                });
            });
        }
        
        // Add search refinement options
        page.appendItem("", "separator", {
            title: "Refine Search"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":results:" + encodedQuery + ":sort:year", "directory", {
            title: "Sort by Year",
            description: "Re-sort results by release year",
            icon: "dataroot://resources/svg/Calendar.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":results:" + encodedQuery + ":sort:rating", "directory", {
            title: "Sort by Rating",
            description: "Re-sort results by rating",
            icon: "dataroot://resources/svg/Star.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":results:" + encodedQuery + ":sort:title", "directory", {
            title: "Sort Alphabetically",
            description: "Re-sort results by title",
            icon: "dataroot://resources/svg/Sort.svg"
        });
    });
});

// Sorted search results
new page.Route(PLUGIN_PREFIX + ':results:(.*):sort:(.*)', function(page, encodedQuery, sortBy) {
    var query = decodeURIComponent(encodedQuery);
    page.type = "directory";
    page.metadata.title = "Search: " + query + " (sorted by " + sortBy + ")";
    
    page.loading = true;
    
    performSearch(query, { sortBy: sortBy }, function(err, results) {
        page.loading = false;
        
        if (err) {
            page.error("Search failed: " + err.message);
            return;
        }
        
        if (results.length === 0) {
            page.appendItem("", "info", {
                title: "No Results Found",
                description: "Try different search terms"
            });
            return;
        }
        
        results.forEach(function(result) {
            var itemType = result.type === 'music' ? 'audio' : 
                          result.type === 'movie' ? 'video' : 'directory';
            
            var description = result.description || "";
            if (result.year) description += " (" + result.year + ")";
            if (result.rating) description += " ★ " + result.rating;
            if (result.artist) description += " by " + result.artist;
            
            page.appendItem(result.url || "", itemType, {
                title: result.title,
                description: description,
                icon: result.poster || "dataroot://resources/svg/Movie.svg",
                year: result.year,
                rating: result.rating ? parseFloat(result.rating) * 10 : undefined,
                genre: result.genre
            });
        });
    });
});

// Category-specific search
new page.Route(PLUGIN_PREFIX + ':category:(.*)', function(page, category) {
    page.type = "directory";
    page.metadata.title = "Search " + searchSources[category].name;
    
    // Show popular terms for this category
    var categoryTerms = {
        movies: ["action movies", "comedy films", "drama movies", "sci-fi films", "thriller movies"],
        tvshows: ["comedy series", "drama shows", "sci-fi series", "crime shows", "reality tv"],
        music: ["rock music", "pop songs", "jazz albums", "electronic music", "classical music"]
    };
    
    var terms = categoryTerms[category] || [];
    terms.forEach(function(term) {
        page.appendItem(PLUGIN_PREFIX + ":category:" + category + ":" + encodeURIComponent(term), "directory", {
            title: term,
            description: "Search for " + term,
            icon: "dataroot://resources/svg/Search.svg"
        });
    });
    
    page.loading = false;
});

// Category search results
new page.Route(PLUGIN_PREFIX + ':category:(.*):(.*)', function(page, category, encodedQuery) {
    var query = decodeURIComponent(encodedQuery);
    page.type = "directory";
    page.metadata.title = searchSources[category].name + ": " + query;
    
    page.loading = true;
    
    var source = searchSources[category];
    if (!source || !source.enabled()) {
        page.error("Search source not available");
        return;
    }
    
    source.search(query, { maxResults: settings.maxResults || 20 }, function(err, results) {
        page.loading = false;
        
        if (err) {
            page.error("Search failed: " + err.message);
            return;
        }
        
        if (results.length === 0) {
            page.appendItem("", "info", {
                title: "No Results Found",
                description: "No " + source.name.toLowerCase() + " found for '" + query + "'"
            });
            return;
        }
        
        results.forEach(function(result) {
            var itemType = result.type === 'music' ? 'audio' : 
                          result.type === 'movie' ? 'video' : 'directory';
            
            page.appendItem(result.url || "", itemType, {
                title: result.title,
                description: result.description,
                icon: result.poster || "dataroot://resources/svg/Movie.svg",
                year: result.year,
                rating: result.rating ? parseFloat(result.rating) * 10 : undefined,
                genre: result.genre
            });
        });
    });
});

// Advanced search page
new page.Route(PLUGIN_PREFIX + ':advanced', function(page) {
    page.type = "directory";
    page.metadata.title = "Advanced Search";
    
    page.appendItem("", "info", {
        title: "Advanced Search Options",
        description: "Configure search sources and behavior in plugin settings"
    });
    
    // Search source status
    page.appendItem("", "separator", {
        title: "Search Sources"
    });
    
    for (var sourceId in searchSources) {
        var source = searchSources[sourceId];
        var status = source.enabled() ? "✓ Enabled" : "✗ Disabled";
        
        page.appendItem("", "info", {
            title: source.name + ": " + status,
            description: source.enabled() ? "This source will be included in searches" : "Enable in settings to include this source"
        });
    }
    
    page.loading = false;
});

// Plugin initialization
console.log("Search Plugin loaded successfully!");
console.log("Enabled sources: " + Object.keys(searchSources).filter(function(id) {
    return searchSources[id].enabled();
}).join(", "));

// Initialize search history if not exists
if (!storage.searchHistory) {
    storage.searchHistory = [];
}