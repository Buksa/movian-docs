/**
 * Search Provider Example
 * 
 * Adds custom search to Movian's global search.
 * User searches from home screen, results appear from this plugin.
 * 
 * NOTE: Uses sample videos for demonstration. 
 * In production, query your actual video database/API.
 */

var page = require('movian/page');

// Sample video database for mock search
var VIDEO_DATABASE = [
  { title: "Big Buck Bunny", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", tags: ["animation", "bunny", "short"] },
  { title: "Elephants Dream", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", tags: ["animation", "dream", "open source"] },
  { title: "Sintel", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", tags: ["animation", "fantasy", "dragon"] },
  { title: "Tears of Steel", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", tags: ["scifi", "robot", "short"] },
  { title: "Volkswagen GTI", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", tags: ["car", "review", "gti"] }
];

// Global searcher registration
new page.Searcher("Example Search", "icon.png", function(page, query) {
  page.metadata.title = "Search: " + query;
  page.type = "directory";
  
  // Mock search: filter sample database by query
  var lowerQuery = query.toLowerCase();
  var results = VIDEO_DATABASE.filter(function(video) {
    return video.title.toLowerCase().indexOf(lowerQuery) !== -1 ||
           video.tags.some(function(tag) { return tag.indexOf(lowerQuery) !== -1; });
  });
  
  if (results.length === 0) {
    page.appendPassiveItem("label", { 
      title: "No results for '" + query + "'" 
    });
  } else {
    results.forEach(function(r) {
      page.appendItem(r.url, "video", {
        title: r.title,
        description: "Tags: " + r.tags.join(", ")
      });
    });
  }
  
  page.loading = false;
});

// Optional: searchable directory with autocomplete
new page.Route("example:searchable:", function(page) {
  page.type = "directory";
  page.metadata.title = "Searchable Directory";
  
  // Enable search in this directory
  page.searchable = true;
  
  // Handle search within this page
  page.onsearch = function(query) {
    page.flush(); // Clear current items
    
    var lowerQuery = query.toLowerCase();
    var matches = VIDEO_DATABASE.filter(function(video) {
      return video.title.toLowerCase().indexOf(lowerQuery) !== -1;
    });
    
    matches.forEach(function(video) {
      page.appendItem(video.url, "video", {
        title: video.title,
        description: "Matched: '" + query + "'"
      });
    });
    
    if (matches.length === 0) {
      page.appendPassiveItem("label", { 
        title: "No matches for '" + query + "'" 
      });
    }
  };
  
  // Initial content
  page.appendPassiveItem("label", { 
    title: "Type to search within this page. Try: 'animation', 'sci-fi', 'car'" 
  });
  page.loading = false;
});
