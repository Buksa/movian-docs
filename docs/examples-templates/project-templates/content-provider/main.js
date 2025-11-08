/**
 * Content Provider Template for Movian
 * 
 * This template demonstrates how to create a media content provider plugin
 * that fetches content from external APIs and presents it in Movian.
 */

(function(plugin) {
  'use strict';

  var PREFIX = "contentprovider";
  var PLUGIN_NAME = "Content Provider";
  var logo = plugin.path + "logo.png";

  // Load modules
  var api = require('./api');
  var parser = require('./parser');

  // Service registration
  service.create(PLUGIN_NAME, PREFIX + ":start", "video", true, logo);

  // Register search functionality
  searcher.create(PLUGIN_NAME, logo, function(page, query) {
    page.redirect(PREFIX + ":search:" + encodeURIComponent(query));
  });

  /**
   * Main page route
   */
  new page.Route(PREFIX + ":start$", function(page) {
    page.type = "directory";
    page.contents = "items";
    page.metadata.title = PLUGIN_NAME;
    page.metadata.icon = logo;

    // Add categories
    var categories = [
      { id: "trending", title: "Trending Now", icon: "trending" },
      { id: "popular", title: "Most Popular", icon: "popular" },
      { id: "recent", title: "Recently Added", icon: "recent" },
      { id: "genres", title: "Browse by Genre", icon: "genres" }
    ];

    categories.forEach(function(cat) {
      page.appendItem(PREFIX + ":category:" + cat.id, "directory", {
        title: cat.title,
        icon: logo
      });
    });

    // Add search option
    page.appendItem(PREFIX + ":search:", "search", {
      title: "Search " + PLUGIN_NAME
    });
  });

  /**
   * Category page route
   */
  new page.Route(PREFIX + ":category:(.*)$", function(page, categoryId) {
    page.type = "directory";
    page.contents = "items";
    page.metadata.title = getCategoryTitle(categoryId);
    page.loading = true;

    try {
      loadCategoryContent(page, categoryId, 1);
    } catch(e) {
      console.error("Category error:", e.message);
      page.error("Failed to load category: " + e.message);
    } finally {
      page.loading = false;
    }
  });

  /**
   * Pagination route
   */
  new page.Route(PREFIX + ":category:(.*):(\\d+)$", function(page, categoryId, pageNum) {
    page.type = "directory";
    page.contents = "items";
    page.metadata.title = getCategoryTitle(categoryId) + " - Page " + pageNum;
    page.loading = true;

    try {
      loadCategoryContent(page, categoryId, parseInt(pageNum));
    } catch(e) {
      console.error("Pagination error:", e.message);
      page.error("Failed to load page: " + e.message);
    } finally {
      page.loading = false;
    }
  });

  /**
   * Search route
   */
  new page.Route(PREFIX + ":search:(.*)$", function(page, query) {
    page.type = "directory";
    page.contents = "items";
    page.metadata.title = "Search: " + decodeURIComponent(query);
    page.loading = true;

    if (!query) {
      page.appendPassiveItem("bodytext", null, {
        bodytext: "Enter a search term to find content."
      });
      page.loading = false;
      return;
    }

    try {
      var results = api.search(decodeURIComponent(query));
      
      if (results.length === 0) {
        page.appendPassiveItem("bodytext", null, {
          bodytext: "No results found for: " + decodeURIComponent(query)
        });
      } else {
        results.forEach(function(item) {
          addMediaItem(page, item);
        });
      }
    } catch(e) {
      console.error("Search error:", e.message);
      page.error("Search failed: " + e.message);
    } finally {
      page.loading = false;
    }
  });

  /**
   * Item detail route
   */
  new page.Route(PREFIX + ":item:(.*)$", function(page, itemId) {
    page.type = "directory";
    page.contents = "items";
    page.loading = true;

    try {
      var item = api.getItemDetails(itemId);
      
      page.metadata.title = item.title;
      page.metadata.icon = item.thumbnail;
      
      // Add item information
      page.appendPassiveItem("bodytext", null, {
        bodytext: item.description || "No description available."
      });

      // Add metadata
      if (item.year) {
        page.appendPassiveItem("label", null, {
          title: "Year: " + item.year
        });
      }
      
      if (item.duration) {
        page.appendPassiveItem("label", null, {
          title: "Duration: " + formatDuration(item.duration)
        });
      }

      // Add play button
      if (item.videoUrl) {
        page.appendItem(item.videoUrl, "video", {
          title: "▶ Play",
          icon: item.thumbnail
        });
      }

      // Add related items
      if (item.related && item.related.length > 0) {
        page.appendPassiveItem("separator", null, {
          title: "Related Content"
        });
        
        item.related.forEach(function(relatedItem) {
          addMediaItem(page, relatedItem);
        });
      }
    } catch(e) {
      console.error("Item detail error:", e.message);
      page.error("Failed to load item: " + e.message);
    } finally {
      page.loading = false;
    }
  });

  /**
   * Load category content with pagination
   */
  function loadCategoryContent(page, categoryId, pageNum) {
    var itemsPerPage = store.itemsPerPage || 20;
    var items = api.getCategoryItems(categoryId, pageNum, itemsPerPage);

    if (items.length === 0 && pageNum === 1) {
      page.appendPassiveItem("bodytext", null, {
        bodytext: "No content available in this category."
      });
      return;
    }

    items.forEach(function(item) {
      addMediaItem(page, item);
    });

    // Add "Load More" button if there are more items
    if (items.length === itemsPerPage) {
      page.appendItem(PREFIX + ":category:" + categoryId + ":" + (pageNum + 1), "directory", {
        title: "▼ Load More..."
      });
    }
  }

  /**
   * Add a media item to the page
   */
  function addMediaItem(page, item) {
    var itemUrl;
    
    if (item.videoUrl) {
      // Direct video URL
      itemUrl = item.videoUrl;
    } else {
      // Link to item detail page
      itemUrl = PREFIX + ":item:" + item.id;
    }

    page.appendItem(itemUrl, item.type || "video", {
      title: item.title,
      icon: item.thumbnail || logo,
      description: item.description,
      duration: item.duration,
      year: item.year,
      rating: item.rating
    });
  }

  /**
   * Get category title by ID
   */
  function getCategoryTitle(categoryId) {
    var titles = {
      "trending": "Trending Now",
      "popular": "Most Popular",
      "recent": "Recently Added",
      "genres": "Browse by Genre"
    };
    return titles[categoryId] || categoryId;
  }

  /**
   * Format duration in seconds to readable string
   */
  function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return hours + "h " + minutes + "m";
    }
    return minutes + "m";
  }

  // Plugin initialization
  console.log(PLUGIN_NAME + " v" + plugin.getDescriptor().version + " loaded");
  console.log("Settings - Items per page:", store.itemsPerPage || 20);
  console.log("Settings - Cache enabled:", store.enableCache !== false);

})(this);
