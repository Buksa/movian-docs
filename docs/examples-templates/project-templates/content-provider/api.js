/**
 * API Client Module
 * 
 * Handles all HTTP requests to the external content API.
 * Customize this module to work with your specific API.
 */

// API Configuration
var API_BASE = "https://api.example.com/v1";
var API_TIMEOUT = 30000; // 30 seconds

// Cache configuration
var cache = {};
var CACHE_DURATION = 3600; // 1 hour in seconds

/**
 * Make HTTP GET request with caching
 */
function makeRequest(endpoint, useCache) {
  useCache = useCache !== false && store.enableCache !== false;
  
  var url = API_BASE + endpoint;
  var cacheKey = url;

  // Check cache
  if (useCache) {
    var cached = getCachedData(cacheKey);
    if (cached) {
      console.log("Cache hit:", endpoint);
      return cached;
    }
  }

  // Make request
  console.log("API request:", endpoint);
  
  try {
    var headers = {
      'User-Agent': 'Movian Content Provider Plugin',
      'Accept': 'application/json'
    };

    // Add API key if configured
    if (store.apiKey) {
      headers['Authorization'] = 'Bearer ' + store.apiKey;
    }

    var response = http.request(url, {
      method: 'GET',
      headers: headers,
      timeout: API_TIMEOUT
    });

    if (response.statuscode !== 200) {
      throw new Error("HTTP " + response.statuscode + ": " + response.statusMessage);
    }

    var data = JSON.parse(response.toString());

    // Cache the response
    if (useCache) {
      setCachedData(cacheKey, data);
    }

    return data;
  } catch(e) {
    console.error("API request failed:", e.message);
    throw e;
  }
}

/**
 * Get cached data if available and not expired
 */
function getCachedData(key) {
  if (cache[key]) {
    var age = (Date.now() - cache[key].timestamp) / 1000;
    if (age < CACHE_DURATION) {
      return cache[key].data;
    }
    // Expired, remove from cache
    delete cache[key];
  }
  return null;
}

/**
 * Store data in cache
 */
function setCachedData(key, data) {
  cache[key] = {
    data: data,
    timestamp: Date.now()
  };
}

/**
 * Get items for a category
 */
exports.getCategoryItems = function(categoryId, page, limit) {
  page = page || 1;
  limit = limit || 20;
  
  var offset = (page - 1) * limit;
  var endpoint = "/categories/" + categoryId + "/items?offset=" + offset + "&limit=" + limit;
  
  var response = makeRequest(endpoint);
  return response.items || [];
};

/**
 * Search for content
 */
exports.search = function(query) {
  var endpoint = "/search?q=" + encodeURIComponent(query);
  var response = makeRequest(endpoint, false); // Don't cache search results
  return response.results || [];
};

/**
 * Get detailed information about an item
 */
exports.getItemDetails = function(itemId) {
  var endpoint = "/items/" + itemId;
  var response = makeRequest(endpoint);
  return response;
};

/**
 * Get video stream URL
 */
exports.getStreamUrl = function(itemId) {
  var endpoint = "/items/" + itemId + "/stream";
  var quality = store.quality || "1080p";
  
  var response = makeRequest(endpoint + "?quality=" + quality, false);
  return response.url;
};

/**
 * Clear cache (useful for debugging)
 */
exports.clearCache = function() {
  cache = {};
  console.log("Cache cleared");
};
