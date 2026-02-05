/**
 * Content Provider Plugin for Movian
 * 
 * Demonstrates comprehensive media content provider patterns including:
 * - HTTP API integration with proper error handling
 * - Caching system for performance optimization
 * - Async content loading with pagination
 * - Search functionality and content filtering
 * - Settings management and user configuration
 * - Media metadata handling and transformation
 * - Real-world plugin architecture patterns
 * 
 * Based on patterns from successful Movian plugins like anilibria.tv
 * Compatible with Movian 5.0+ (ECMAScript API version 2)
 */

// Import required Movian modules
var page = require('movian/page');
var service = require('movian/service');
var http = require('movian/http');
var settings = require('movian/settings');
var io = require('native/io');

// Plugin configuration
var PLUGIN_PREFIX = 'content-provider';
var API_BASE_URL = 'https://jsonplaceholder.typicode.com'; // Demo API

// Plugin metadata - Best Practice: Always log plugin initialization
var plugin = JSON.parse(Plugin.manifest);
console.log(plugin.id + ' ' + plugin.version + ' initialized');

// Create main service entry - Best Practice: Use descriptive service names
service.create(plugin.title, PLUGIN_PREFIX + ":start", "video", true, Plugin.path + "logo.png");

// HTTP Inspector setup - Best Practice: Set proper headers for all requests
io.httpInspectorCreate('.*jsonplaceholder.*', function(ctrl) {
    ctrl.setHeader('Accept-Encoding', 'gzip');
    ctrl.setHeader('User-Agent', 'Movian Content Provider Plugin 1.0');
    ctrl.setHeader('Accept', 'application/json');
});

// Plugin settings
settings.globalSettings(plugin.id, plugin.title, Plugin.path + "logo.png", plugin.synopsis);

settings.createDivider("API Configuration");

settings.createString("apiKey", "API Key", "", function(value) {
    console.log("API Key updated");
});

settings.createBool("enableCache", "Enable Caching", true, function(value) {
    console.log("Caching " + (value ? "enabled" : "disabled"));
});

settings.createInt("itemsPerPage", "Items Per Page", 20, 5, 100, 5, "", function(value) {
    console.log("Items per page: " + value);
});

// Utility functions - Best Practice: Centralize common functionality
var utils = {
    /**
     * Format duration in seconds to human readable string
     * Best Practice: Handle edge cases and provide fallbacks
     */
    formatDuration: function(seconds) {
        if (!seconds || isNaN(seconds)) return '';
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        
        if (hours > 0) {
            return hours + 'h ' + minutes + 'm';
        }
        return minutes + 'm ' + secs + 's';
    },
    
    /**
     * Format file size in bytes to human readable string
     * Pattern from real plugins: Handle different size units
     */
    formatSize: function(bytes) {
        if (!bytes || isNaN(bytes)) return '';
        var units = ['B', 'KB', 'MB', 'GB', 'TB'];
        var size = bytes;
        var unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return size.toFixed(1) + ' ' + units[unitIndex];
    },
    
    /**
     * Pad number with leading zero - Common utility in media plugins
     */
    padZero: function(n) {
        return (n < 10 ? '0' : '') + n;
    },
    
    /**
     * Build URL with query parameters
     * Best Practice: Proper URL encoding and parameter handling
     */
    buildUrl: function(endpoint, params) {
        var url = API_BASE_URL + endpoint;
        if (params) {
            var queryString = [];
            for (var key in params) {
                if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
                    queryString.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                }
            }
            if (queryString.length > 0) {
                url += '?' + queryString.join('&');
            }
        }
        return url;
    },
    
    /**
     * Sanitize text for display
     * Best Practice: Prevent XSS and handle encoding issues
     */
    sanitizeText: function(text) {
        if (!text) return '';
        return text.replace(/[<>&"']/g, function(match) {
            var escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match];
        }).substring(0, 500);
    },
    
    /**
     * Extend object properties - Common pattern for configuration merging
     */
    extend: function(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
        return target;
    },
    
    /**
     * Debounce function calls - Useful for search and API rate limiting
     */
    debounce: function(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
};

// Advanced cache implementation - Best Practice: Efficient memory management
var cache = {};
var CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
var MAX_CACHE_ENTRIES = 100; // Prevent memory leaks

function getCachedData(key) {
    if (!settings.enableCache) return null;
    
    var cached = cache[key];
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        // Update access time for LRU eviction
        cached.lastAccess = Date.now();
        return cached.data;
    }
    
    // Clean expired entry
    if (cached) {
        delete cache[key];
    }
    return null;
}

function setCachedData(key, data) {
    if (!settings.enableCache) return;
    
    // Implement cache size limit with LRU eviction
    var cacheKeys = Object.keys(cache);
    if (cacheKeys.length >= MAX_CACHE_ENTRIES) {
        // Find oldest entry by last access time
        var oldestKey = cacheKeys.reduce(function(oldest, current) {
            var oldestTime = cache[oldest] ? cache[oldest].lastAccess : 0;
            var currentTime = cache[current] ? cache[current].lastAccess : 0;
            return currentTime < oldestTime ? current : oldest;
        });
        delete cache[oldestKey];
    }
    
    var now = Date.now();
    cache[key] = {
        data: data,
        timestamp: now,
        lastAccess: now
    };
}

// Cache cleanup function - Best Practice: Prevent memory leaks
function cleanExpiredCache() {
    var now = Date.now();
    for (var key in cache) {
        if ((now - cache[key].timestamp) > CACHE_DURATION) {
            delete cache[key];
        }
    }
}

// Run cache cleanup every 10 minutes
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// HTTP request helper with comprehensive error handling
// Best Practice: Centralized request handling with retry logic and detailed error reporting
function makeRequest(url, options) {
    var maxRetries = 3;
    var retryDelay = 1000; // Start with 1 second
    
    function attemptRequest(attempt) {
        try {
            console.log("Making request to: " + url + " (attempt " + attempt + "/" + maxRetries + ")");
            
            var requestOptions = {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Movian Content Provider Plugin 1.0',
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'Cache-Control': 'no-cache'
                }
            };
            
            // Add API key if configured - Best Practice: Secure authentication handling
            if (settings.apiKey && settings.apiKey.trim()) {
                requestOptions.headers['Authorization'] = 'Bearer ' + settings.apiKey.trim();
            }
            
            // Merge with provided options - Best Practice: Flexible configuration
            if (options) {
                requestOptions = utils.extend(requestOptions, options);
                if (options.headers) {
                    requestOptions.headers = utils.extend(requestOptions.headers, options.headers);
                }
            }
            
            var response = http.request(url, requestOptions);
            
            // Best Practice: Comprehensive status code handling
            if (response.statuscode >= 200 && response.statuscode < 300) {
                var responseText = response.toString();
                if (!responseText || responseText.trim() === '') {
                    throw new Error("Empty response from server");
                }
                
                // Validate JSON before parsing
                try {
                    var data = JSON.parse(responseText);
                    console.log("Request successful, received " + (data.length || 'object') + " items");
                    return data;
                } catch (parseError) {
                    throw new Error("Invalid JSON response: " + parseError.message);
                }
            } else {
                var errorMsg = "HTTP " + response.statuscode;
                
                // Detailed error messages for common status codes
                switch (response.statuscode) {
                    case 400:
                        errorMsg += ": Bad request. Check your parameters.";
                        break;
                    case 401:
                        errorMsg += ": Authentication failed. Check your API key.";
                        break;
                    case 403:
                        errorMsg += ": Access forbidden. Check your permissions.";
                        break;
                    case 404:
                        errorMsg += ": Resource not found. Check the URL.";
                        break;
                    case 429:
                        errorMsg += ": Rate limit exceeded. Please try again later.";
                        break;
                    case 500:
                        errorMsg += ": Internal server error. Please try again later.";
                        break;
                    case 502:
                        errorMsg += ": Bad gateway. Server is temporarily unavailable.";
                        break;
                    case 503:
                        errorMsg += ": Service unavailable. Please try again later.";
                        break;
                    default:
                        if (response.statuscode >= 500) {
                            errorMsg += ": Server error. Please try again later.";
                        } else {
                            errorMsg += ": Request failed.";
                        }
                }
                
                // For server errors, attempt retry
                if (response.statuscode >= 500 && attempt < maxRetries) {
                    console.warn(errorMsg + " Retrying in " + retryDelay + "ms...");
                    setTimeout(function() {
                        return attemptRequest(attempt + 1);
                    }, retryDelay);
                    retryDelay *= 2; // Exponential backoff
                    return;
                }
                
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("Request failed: " + error.message);
            
            // Network-level errors - attempt retry for transient issues
            if ((error.message.indexOf('timeout') !== -1 || 
                 error.message.indexOf('network') !== -1 ||
                 error.message.indexOf('connection') !== -1) && 
                attempt < maxRetries) {
                console.warn("Network error, retrying in " + retryDelay + "ms...");
                setTimeout(function() {
                    return attemptRequest(attempt + 1);
                }, retryDelay);
                retryDelay *= 2;
                return;
            }
            
            // Re-throw with more context
            if (error.message.indexOf('JSON') !== -1) {
                throw new Error("Invalid response format from server");
            }
            throw error;
        }
    }
    
    return attemptRequest(1);
}

// Error handling wrapper - Best Practice: Consistent error handling across routes
function handlePageError(page, error, context) {
    console.error("Error in " + (context || "unknown context") + ": " + error.message);
    
    // Provide user-friendly error messages
    var userMessage = "An error occurred";
    if (error.message.indexOf('network') !== -1 || error.message.indexOf('timeout') !== -1) {
        userMessage = "Network connection failed. Please check your internet connection.";
    } else if (error.message.indexOf('HTTP 401') !== -1) {
        userMessage = "Authentication failed. Please check your API key in settings.";
    } else if (error.message.indexOf('HTTP 429') !== -1) {
        userMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.message.indexOf('JSON') !== -1) {
        userMessage = "Server returned invalid data. Please try again later.";
    }
    
    page.error(userMessage);
    page.loading = false;
}

// Content transformation functions - Best Practice: Robust data validation and transformation
function transformToMovie(post) {
    // Validate required fields
    if (!post || !post.id || !post.title) {
        throw new Error("Invalid movie data: missing required fields");
    }
    
    return {
        id: post.id,
        title: utils.sanitizeText(post.title),
        description: utils.sanitizeText(post.body || 'No description available'),
        year: 2020 + (post.id % 5), // Fake years for demo
        rating: Math.max(1.0, Math.min(10.0, (7.0 + (post.id % 30) / 10))).toFixed(1),
        genre: ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi"][post.id % 5],
        poster: "https://via.placeholder.com/300x450/0066cc/ffffff?text=Movie+" + post.id,
        backdrop: "https://via.placeholder.com/1280x720/003366/ffffff?text=Backdrop+" + post.id,
        duration: 90 + (post.id % 60), // Fake duration in minutes
        // Additional metadata for richer content
        director: "Director " + (post.userId || 1),
        cast: ["Actor A", "Actor B", "Actor C"],
        country: ["USA", "UK", "Canada", "France", "Germany"][post.id % 5],
        language: ["English", "French", "German", "Spanish", "Italian"][post.id % 5]
    };
}

function transformToTVShow(album) {
    if (!album || !album.id || !album.title) {
        throw new Error("Invalid TV show data: missing required fields");
    }
    
    return {
        id: album.id,
        title: utils.sanitizeText(album.title),
        description: "A compelling TV series with multiple seasons and episodes.",
        seasons: 1 + (album.id % 5),
        episodes: 10 + (album.id % 15),
        year: 2015 + (album.id % 8),
        rating: Math.max(1.0, Math.min(10.0, (6.5 + (album.id % 35) / 10))).toFixed(1),
        poster: "https://via.placeholder.com/300x450/cc6600/ffffff?text=TV+" + album.id,
        backdrop: "https://via.placeholder.com/1280x720/663300/ffffff?text=TVBackdrop+" + album.id,
        status: ["Ongoing", "Completed", "Cancelled"][album.id % 3],
        network: ["HBO", "Netflix", "Amazon Prime", "BBC", "Showtime"][album.id % 5],
        genre: ["Drama", "Comedy", "Action", "Mystery", "Sci-Fi"][album.id % 5]
    };
}

// Content validation function - Best Practice: Validate data before display
function validateContent(content, type) {
    var requiredFields = type === 'movie' ? 
        ['id', 'title', 'year', 'rating'] : 
        ['id', 'title', 'seasons', 'episodes'];
    
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!content[field] && content[field] !== 0) {
            console.warn("Missing required field '" + field + "' in " + type + " content");
            return false;
        }
    }
    
    return true;
}

// Main page route
new page.Route(PLUGIN_PREFIX + ':start', function(page) {
    page.type = "directory";
    page.metadata.title = "Content Provider";
    page.metadata.logo = Plugin.path + "logo.png";
    
    try {
        // Add navigation categories
        page.appendItem(PLUGIN_PREFIX + ":movies", "directory", {
            title: "Movies",
            description: "Browse movie content",
            icon: "dataroot://resources/svg/Movie.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":tv", "directory", {
            title: "TV Shows", 
            description: "Browse TV show content",
            icon: "dataroot://resources/svg/TV.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":popular", "directory", {
            title: "Popular Content",
            description: "Most popular items",
            icon: "dataroot://resources/svg/Star.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":search", "directory", {
            title: "Search",
            description: "Search for content",
            icon: "dataroot://resources/svg/Search.svg"
        });
        
        page.appendItem(PLUGIN_PREFIX + ":trending", "directory", {
            title: "Trending Now",
            description: "Currently trending content",
            icon: "dataroot://resources/svg/Fire.svg"
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load main page: " + error.message);
    }
});

// Movies page route - Demonstrates comprehensive content loading patterns
new page.Route(PLUGIN_PREFIX + ':movies', function(page) {
    page.type = "directory";
    page.metadata.title = "Movies";
    page.metadata.icon = "dataroot://resources/svg/Movie.svg";
    page.loading = true;
    
    try {
        // Check cache first - Best Practice: Always check cache before API calls
        var cacheKey = "movies_list_" + (settings.itemsPerPage || 20);
        var cachedData = getCachedData(cacheKey);
        
        var movies;
        if (cachedData) {
            console.log("Using cached movie data (" + cachedData.length + " items)");
            movies = cachedData;
        } else {
            // Fetch from API with proper error handling
            console.log("Fetching movies from API");
            var posts = makeRequest(API_BASE_URL + '/posts');
            
            if (!posts || !Array.isArray(posts)) {
                throw new Error("Invalid response: expected array of posts");
            }
            
            // Transform and validate data - Best Practice: Always validate external data
            movies = posts.slice(0, settings.itemsPerPage || 20)
                .map(function(post) {
                    try {
                        return transformToMovie(post);
                    } catch (transformError) {
                        console.warn("Failed to transform post " + post.id + ": " + transformError.message);
                        return null;
                    }
                })
                .filter(function(movie) {
                    return movie && validateContent(movie, 'movie');
                });
            
            if (movies.length === 0) {
                throw new Error("No valid movies found in response");
            }
            
            setCachedData(cacheKey, movies);
            console.log("Processed " + movies.length + " movies from API");
        }
        
        // Add category separator
        page.appendItem("", "separator", {
            title: "Movies (" + movies.length + " items)"
        });
        
        // Add movies to page with rich metadata
        movies.forEach(function(movie) {
            page.appendItem(PLUGIN_PREFIX + ":movie:" + movie.id, "video", {
                title: movie.title,
                description: movie.description.length > 100 ? 
                    movie.description.substring(0, 100) + "..." : 
                    movie.description,
                icon: movie.poster,
                year: movie.year,
                rating: parseFloat(movie.rating) * 10, // Movian uses 0-100 scale
                genre: movie.genre,
                duration: movie.duration,
                // Additional metadata for richer display
                director: movie.director,
                country: movie.country,
                language: movie.language
            });
        });
        
        // Add "Load More" option if there might be more content
        if (movies.length >= (settings.itemsPerPage || 20)) {
            page.appendItem(PLUGIN_PREFIX + ":movies:page:2", "directory", {
                title: "Load More Movies...",
                description: "View additional movies",
                icon: "dataroot://resources/svg/Add.svg"
            });
        }
        
        page.loading = false;
        
    } catch (error) {
        handlePageError(page, error, "movies page");
    }
});

// TV Shows page route
new page.Route(PLUGIN_PREFIX + ':tv', function(page) {
    page.type = "directory";
    page.metadata.title = "TV Shows";
    
    try {
        var cacheKey = "tv_shows";
        var cachedData = getCachedData(cacheKey);
        
        var shows;
        if (cachedData) {
            shows = cachedData;
        } else {
            // Fetch albums as TV shows (demo)
            var albums = makeRequest(API_BASE_URL + '/albums');
            
            shows = albums.slice(0, settings.itemsPerPage || 20).map(function(album) {
                return transformToTVShow(album);
            });
            
            setCachedData(cacheKey, shows);
        }
        
        shows.forEach(function(show) {
            page.appendItem(PLUGIN_PREFIX + ":show:" + show.id, "directory", {
                title: show.title,
                description: "Seasons: " + show.seasons + " | Episodes: " + show.episodes + " | Year: " + show.year,
                icon: show.poster,
                year: show.year,
                rating: parseFloat(show.rating) * 10
            });
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load TV shows: " + error.message);
    }
});

// Individual movie page
new page.Route(PLUGIN_PREFIX + ':movie:(\\d+)', function(page, movieId) {
    page.type = "directory";
    
    try {
        var cacheKey = "movie_" + movieId;
        var cachedData = getCachedData(cacheKey);
        
        var movie;
        if (cachedData) {
            movie = cachedData;
        } else {
            // Fetch movie details
            var post = makeRequest(API_BASE_URL + '/posts/' + movieId);
            var user = makeRequest(API_BASE_URL + '/users/' + post.userId);
            
            var baseMovie = transformToMovie(post);
            movie = {
                id: baseMovie.id,
                title: baseMovie.title,
                description: baseMovie.description,
                director: user.name,
                year: baseMovie.year,
                rating: baseMovie.rating,
                genre: baseMovie.genre,
                poster: baseMovie.poster,
                duration: baseMovie.duration,
                // Fake video URLs for demo
                videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            };
            
            setCachedData(cacheKey, movie);
        }
        
        page.metadata.title = movie.title;
        page.metadata.icon = movie.poster;
        
        // Add play option
        page.appendItem(movie.videoUrl, "video", {
            title: "▶ Play Movie",
            description: "Watch " + movie.title,
            icon: movie.poster,
            year: movie.year,
            rating: parseFloat(movie.rating) * 10,
            genre: movie.genre
        });
        
        // Add movie information
        page.appendItem("", "separator", {
            title: "Movie Information"
        });
        
        page.appendItem("", "info", {
            title: "Director: " + movie.director,
            description: "Year: " + movie.year + " | Rating: " + movie.rating + "/10 | Genre: " + movie.genre + " | Duration: " + utils.formatDuration(movie.duration * 60)
        });
        
        page.appendItem("", "info", {
            title: "Synopsis",
            description: movie.description
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load movie details: " + error.message);
    }
});

// TV Show details page
new page.Route(PLUGIN_PREFIX + ':show:(\\d+)', function(page, showId) {
    page.type = "directory";
    page.metadata.title = "TV Show Details";
    
    try {
        // Fetch show details and episodes
        var album = makeRequest(API_BASE_URL + '/albums/' + showId);
        var photos = makeRequest(API_BASE_URL + '/albums/' + showId + '/photos');
        
        page.metadata.title = album.title;
        
        // Add show information
        page.appendItem("", "separator", {
            title: "Episodes"
        });
        
        // Use photos as episodes
        photos.slice(0, 12).forEach(function(photo, index) {
            var episodeNum = index + 1;
            page.appendItem(PLUGIN_PREFIX + ":episode:" + showId + ":" + episodeNum, "video", {
                title: "Episode " + episodeNum + ": " + photo.title,
                description: "Season 1, Episode " + episodeNum,
                icon: photo.thumbnailUrl,
                episode: episodeNum,
                season: 1
            });
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load show details: " + error.message);
    }
});

// Popular content with async loading
new page.Route(PLUGIN_PREFIX + ':popular', function(page) {
    page.type = "directory";
    page.metadata.title = "Popular Content";
    
    var offset = 0;
    var itemsPerPage = settings.itemsPerPage || 20;
    
    function loadMoreContent() {
        setTimeout(function() {
            try {
                if (offset >= 100) {
                    page.haveMore(false);
                    return;
                }
                
                // Fetch more content
                var startId = offset + 1;
                var endId = Math.min(offset + itemsPerPage, 100);
                
                for (var i = startId; i <= endId; i++) {
                    var isMovie = i % 2 === 0;
                    var itemType = isMovie ? "video" : "directory";
                    var route = isMovie ? PLUGIN_PREFIX + ":movie:" + i : PLUGIN_PREFIX + ":show:" + i;
                    
                    page.appendItem(route, itemType, {
                        title: (isMovie ? "Popular Movie " : "Popular Show ") + i,
                        description: "Trending content item #" + i,
                        icon: "https://via.placeholder.com/300x450/" + 
                              (isMovie ? "0066cc" : "cc6600") + "/ffffff?text=" + 
                              (isMovie ? "Movie" : "TV") + "+" + i,
                        rating: (60 + (i % 40)) // 60-100 rating
                    });
                }
                
                offset = endId;
                page.haveMore(offset < 100);
                
            } catch (error) {
                console.error("Failed to load more content: " + error.message);
                page.haveMore(false);
            }
        }, 1500); // Simulate network delay
    }
    
    page.asyncPaginator = loadMoreContent;
    loadMoreContent();
});

// Trending content page
new page.Route(PLUGIN_PREFIX + ':trending', function(page) {
    page.type = "directory";
    page.metadata.title = "Trending Now";
    
    try {
        var cacheKey = "trending_content";
        var cachedData = getCachedData(cacheKey);
        
        var trendingItems;
        if (cachedData) {
            trendingItems = cachedData;
        } else {
            // Fetch trending content (using comments as trending items)
            var comments = makeRequest(utils.buildUrl('/comments', { _limit: 15 }));
            
            trendingItems = comments.map(function(comment, index) {
                var isMovie = index % 3 !== 0; // Mix of movies and shows
                var baseItem = isMovie ? 
                    transformToMovie({ id: comment.id, title: comment.name, body: comment.body }) :
                    transformToTVShow({ id: comment.id, title: comment.name });
                
                return {
                    id: baseItem.id,
                    title: baseItem.title,
                    description: utils.sanitizeText(comment.body),
                    type: isMovie ? 'movie' : 'show',
                    poster: isMovie ? baseItem.poster : baseItem.poster,
                    rating: baseItem.rating,
                    year: baseItem.year,
                    trendingRank: index + 1
                };
            });
            
            setCachedData(cacheKey, trendingItems);
        }
        
        trendingItems.forEach(function(item) {
            var route = item.type === 'movie' ? 
                PLUGIN_PREFIX + ":movie:" + item.id : 
                PLUGIN_PREFIX + ":show:" + item.id;
            
            page.appendItem(route, item.type === 'movie' ? "video" : "directory", {
                title: "#" + item.trendingRank + " " + item.title,
                description: item.description.substring(0, 100) + "...",
                icon: item.poster,
                year: item.year,
                rating: parseFloat(item.rating) * 10
            });
        });
        
        page.loading = false;
    } catch (error) {
        page.error("Failed to load trending content: " + error.message);
    }
});

// Search functionality
new page.Route(PLUGIN_PREFIX + ':search', function(page) {
    page.type = "directory";
    page.metadata.title = "Search Content";
    
    // Add search suggestions
    var suggestions = ["action movies", "comedy shows", "drama series", "sci-fi films", "thriller movies"];
    
    page.appendItem("", "separator", {
        title: "Search Suggestions"
    });
    
    suggestions.forEach(function(suggestion) {
        page.appendItem(PLUGIN_PREFIX + ":search:" + encodeURIComponent(suggestion), "directory", {
            title: "Search: " + suggestion,
            description: "Find content matching '" + suggestion + "'",
            icon: "dataroot://resources/svg/Search.svg"
        });
    });
    
    page.loading = false;
});

// Advanced search implementation with caching and filtering
new page.Route(PLUGIN_PREFIX + ':search:(.*)', function(page, query) {
    page.type = "directory";
    var searchTerm = decodeURIComponent(query);
    page.metadata.title = "Search: " + searchTerm;
    page.metadata.icon = "dataroot://resources/svg/Search.svg";
    page.loading = true;
    
    try {
        var normalizedQuery = searchTerm.toLowerCase().trim();
        
        if (normalizedQuery.length < 2) {
            page.appendItem("", "info", {
                title: "Search Query Too Short",
                description: "Please enter at least 2 characters to search"
            });
            page.loading = false;
            return;
        }
        
        // Check cache for search results
        var cacheKey = "search_" + normalizedQuery;
        var cachedResults = getCachedData(cacheKey);
        
        var results;
        if (cachedResults) {
            console.log("Using cached search results for: " + normalizedQuery);
            results = cachedResults;
        } else {
            console.log("Performing new search for: " + normalizedQuery);
            
            // Fetch content for searching
            var posts = makeRequest(API_BASE_URL + '/posts');
            var albums = makeRequest(API_BASE_URL + '/albums');
            
            if (!posts || !albums) {
                throw new Error("Failed to fetch content for search");
            }
            
            // Search in movies (posts)
            var movieResults = posts.filter(function(post) {
                return post.title.toLowerCase().indexOf(normalizedQuery) !== -1 ||
                       post.body.toLowerCase().indexOf(normalizedQuery) !== -1;
            }).slice(0, 10).map(function(post) {
                var movie = transformToMovie(post);
                return {
                    type: 'movie',
                    data: movie,
                    relevance: calculateRelevance(post, normalizedQuery)
                };
            });
            
            // Search in TV shows (albums)
            var tvResults = albums.filter(function(album) {
                return album.title.toLowerCase().indexOf(normalizedQuery) !== -1;
            }).slice(0, 10).map(function(album) {
                var show = transformToTVShow(album);
                return {
                    type: 'tv',
                    data: show,
                    relevance: calculateRelevance(album, normalizedQuery)
                };
            });
            
            // Combine and sort by relevance
            results = movieResults.concat(tvResults)
                .sort(function(a, b) {
                    return b.relevance - a.relevance;
                })
                .slice(0, 20);
            
            setCachedData(cacheKey, results);
        }
        
        // Display results
        if (results.length === 0) {
            page.appendItem("", "separator", {
                title: "No Results Found"
            });
            
            page.appendItem("", "info", {
                title: "No matches for '" + searchTerm + "'",
                description: "Try different keywords or check spelling"
            });
            
            // Suggest alternative searches
            var suggestions = ["action", "comedy", "drama", "thriller"];
            page.appendItem("", "separator", {
                title: "Search Suggestions"
            });
            
            suggestions.forEach(function(suggestion) {
                page.appendItem(PLUGIN_PREFIX + ":search:" + encodeURIComponent(suggestion), "directory", {
                    title: "Search: " + suggestion,
                    description: "Try searching for " + suggestion,
                    icon: "dataroot://resources/svg/Search.svg"
                });
            });
        } else {
            page.appendItem("", "separator", {
                title: "Search Results (" + results.length + " found)"
            });
            
            results.forEach(function(result) {
                var item = result.data;
                var route = result.type === 'movie' ? 
                    PLUGIN_PREFIX + ":movie:" + item.id : 
                    PLUGIN_PREFIX + ":show:" + item.id;
                
                var itemType = result.type === 'movie' ? "video" : "directory";
                
                page.appendItem(route, itemType, {
                    title: item.title + " (" + (result.type === 'movie' ? 'Movie' : 'TV Show') + ")",
                    description: item.description ? 
                        item.description.substring(0, 100) + "..." : 
                        "No description available",
                    icon: item.poster,
                    year: item.year,
                    rating: parseFloat(item.rating) * 10,
                    genre: item.genre
                });
            });
        }
        
        page.loading = false;
        
    } catch (error) {
        handlePageError(page, error, "search");
    }
});

// Search relevance calculation - Best Practice: Implement smart search ranking
function calculateRelevance(item, query) {
    var score = 0;
    var title = (item.title || '').toLowerCase();
    var body = (item.body || '').toLowerCase();
    
    // Exact title match gets highest score
    if (title === query) {
        score += 100;
    } else if (title.indexOf(query) === 0) {
        // Title starts with query
        score += 50;
    } else if (title.indexOf(query) !== -1) {
        // Title contains query
        score += 25;
    }
    
    // Body content matches
    if (body.indexOf(query) !== -1) {
        score += 10;
    }
    
    // Boost score for shorter titles (more specific matches)
    if (title.length < 50) {
        score += 5;
    }
    
    return score;
}

// Plugin searcher integration - Best Practice: Enable global search
page.Searcher(plugin.title, Plugin.path + "logo.png", function(page, query) {
    page.metadata.icon = Plugin.path + "logo.png";
    page.metadata.title = plugin.title + " - Search results for: " + query;
    page.type = 'directory';
    page.loading = true;
    
    try {
        // Redirect to our search route for consistency
        page.redirect(PLUGIN_PREFIX + ':search:' + encodeURIComponent(query));
    } catch (error) {
        handlePageError(page, error, "searcher");
    }
});

// Plugin lifecycle management - Best Practice: Proper cleanup and monitoring
function onPluginUnload() {
    console.log("Content Provider Plugin unloading...");
    
    // Clear cache to free memory
    cache = {};
    
    // Clear any intervals
    if (typeof cleanupInterval !== 'undefined') {
        clearInterval(cleanupInterval);
    }
    
    console.log("Content Provider Plugin unloaded successfully");
}

// Register cleanup handler if available
if (typeof Plugin !== 'undefined' && Plugin.addURI) {
    Plugin.addURI(PLUGIN_PREFIX + ':unload', onPluginUnload);
}

// Plugin initialization and status logging
console.log("=== Content Provider Plugin Initialization ===");
console.log("Plugin ID: " + plugin.id);
console.log("Plugin Version: " + plugin.version);
console.log("API Base URL: " + API_BASE_URL);
console.log("Cache enabled: " + (settings.enableCache ? "Yes" : "No"));
console.log("Items per page: " + (settings.itemsPerPage || 20));
console.log("Max cache entries: " + MAX_CACHE_ENTRIES);
console.log("Cache duration: " + (CACHE_DURATION / 1000 / 60) + " minutes");
console.log("=== Plugin loaded successfully! ===");

// Performance monitoring - Best Practice: Track plugin performance
var startTime = Date.now();
setTimeout(function() {
    var loadTime = Date.now() - startTime;
    console.log("Plugin initialization completed in " + loadTime + "ms");
}, 100);