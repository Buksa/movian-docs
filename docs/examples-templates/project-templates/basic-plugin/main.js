/**
 * Basic Plugin Template for Movian
 * 
 * This template provides a minimal starting point for Movian plugin development.
 * Customize this file to implement your plugin's functionality.
 */

(function(plugin) {
  'use strict';

  // Plugin metadata
  var PREFIX = "basicplugin";
  var PLUGIN_NAME = "Basic Plugin";
  var logo = plugin.path + "logo.png";

  // Service registration
  // Creates a new service entry in Movian's main menu
  service.create(PLUGIN_NAME, PREFIX + ":start", "video", true, logo);

  // Settings (if defined in plugin.json)
  // Access settings using: store.settingName
  // Example: var username = store.username || "default";

  /**
   * Main route handler
   * Handles all URLs matching the pattern: basicplugin:*
   */
  new page.Route(PREFIX + ":(.*)$", function(page, path) {
    // Set page type
    page.type = "directory";
    page.contents = "items";
    
    // Set page metadata
    page.metadata.title = PLUGIN_NAME;
    page.metadata.icon = logo;
    
    // Log page access
    console.log(PLUGIN_NAME + ": Opening page - " + path);
    
    // Add loading indicator
    page.loading = true;
    
    try {
      // Route to different handlers based on path
      if (path === "start") {
        handleStartPage(page);
      } else if (path.match(/^item:/)) {
        handleItemPage(page, path);
      } else {
        // Unknown path
        page.error("Unknown page: " + path);
      }
    } catch(e) {
      // Error handling
      console.error(PLUGIN_NAME + " Error:", e.message);
      page.error("An error occurred: " + e.message);
    } finally {
      // Remove loading indicator
      page.loading = false;
    }
  });

  /**
   * Handle the start/main page
   */
  function handleStartPage(page) {
    page.metadata.title = PLUGIN_NAME + " - Home";
    
    // Add welcome message
    page.appendPassiveItem("bodytext", null, {
      bodytext: "Welcome to " + PLUGIN_NAME + "!\n\n" +
                "This is a basic plugin template. Customize this code to create your own plugin."
    });
    
    // Add sample items
    for (var i = 1; i <= 5; i++) {
      page.appendItem(PREFIX + ":item:" + i, "directory", {
        title: "Sample Item " + i,
        icon: logo
      });
    }
    
    // Add informational item
    page.appendPassiveItem("separator", null, {
      title: "Information"
    });
    
    page.appendPassiveItem("bodytext", null, {
      bodytext: "To customize this plugin:\n" +
                "1. Edit plugin.json with your details\n" +
                "2. Modify this main.js file\n" +
                "3. Add your own functionality\n" +
                "4. Test in Movian"
    });
  }

  /**
   * Handle individual item pages
   */
  function handleItemPage(page, path) {
    var itemId = path.replace("item:", "");
    
    page.metadata.title = "Item " + itemId;
    
    page.appendPassiveItem("bodytext", null, {
      bodytext: "This is item #" + itemId + "\n\n" +
                "You can add custom content here based on the item ID."
    });
    
    // Example: Add sub-items
    page.appendItem(PREFIX + ":start", "directory", {
      title: "Back to Home"
    });
  }

  /**
   * Plugin initialization
   */
  console.log(PLUGIN_NAME + " v" + plugin.getDescriptor().version + " loaded");

})(this);
