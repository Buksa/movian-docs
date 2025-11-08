/**
 * Content Parser Module
 * 
 * Parses API responses and HTML content into structured data.
 * Customize parsing logic based on your content source format.
 */

/**
 * Parse JSON API response into media items
 */
exports.parseMediaItems = function(data) {
  if (!data || !data.items) {
    return [];
  }

  return data.items.map(function(item) {
    return {
      id: item.id || item._id,
      title: item.title || item.name || "Untitled",
      description: item.description || item.synopsis || "",
      thumbnail: item.thumbnail || item.poster || item.image,
      videoUrl: item.video_url || item.stream_url,
      duration: parseDuration(item.duration),
      year: parseInt(item.year) || null,
      rating: parseFloat(item.rating) || null,
      type: item.type || "video"
    };
  });
};

/**
 * Parse HTML content (for scraping)
 */
exports.parseHTML = function(htmlString) {
  try {
    var dom = html.parse(htmlString);
    var items = [];

    // Example: Parse video items from HTML
    var videoElements = dom.root.getElementByClassName('video-item');
    
    videoElements.forEach(function(element) {
      var titleEl = element.getElementByClassName('title')[0];
      var linkEl = element.getElementByTagName('a')[0];
      var imgEl = element.getElementByTagName('img')[0];

      if (titleEl && linkEl) {
        items.push({
          title: titleEl.textContent,
          url: linkEl.attributes.href,
          thumbnail: imgEl ? imgEl.attributes.src : null
        });
      }
    });

    return items;
  } catch(e) {
    console.error("HTML parsing error:", e.message);
    return [];
  }
};

/**
 * Parse duration string to seconds
 * Supports formats: "1:30:45", "90:45", "45", "1h 30m", "90m"
 */
function parseDuration(duration) {
  if (!duration) return null;
  
  // If already a number, return it
  if (typeof duration === 'number') {
    return duration;
  }

  var str = duration.toString().trim();
  
  // Format: "1h 30m 45s"
  var hourMatch = str.match(/(\d+)h/);
  var minMatch = str.match(/(\d+)m/);
  var secMatch = str.match(/(\d+)s/);
  
  if (hourMatch || minMatch || secMatch) {
    var hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    var minutes = minMatch ? parseInt(minMatch[1]) : 0;
    var seconds = secMatch ? parseInt(secMatch[1]) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Format: "1:30:45" or "90:45" or "45"
  var parts = str.split(':');
  if (parts.length === 3) {
    // HH:MM:SS
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  } else if (parts.length === 2) {
    // MM:SS
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (parts.length === 1) {
    // SS
    return parseInt(parts[0]);
  }

  return null;
}

/**
 * Parse video quality from string
 */
exports.parseQuality = function(qualityStr) {
  if (!qualityStr) return null;
  
  var match = qualityStr.match(/(\d+)p/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Extract video ID from various URL formats
 */
exports.extractVideoId = function(url) {
  // Example patterns - customize for your service
  var patterns = [
    /\/video\/([a-zA-Z0-9_-]+)/,
    /[?&]v=([a-zA-Z0-9_-]+)/,
    /\/([a-zA-Z0-9_-]+)$/
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = url.match(patterns[i]);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Clean and normalize text content
 */
exports.cleanText = function(text) {
  if (!text) return "";
  
  return text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/&nbsp;/g, ' ')        // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

/**
 * Parse date string to timestamp
 */
exports.parseDate = function(dateStr) {
  try {
    return new Date(dateStr).getTime();
  } catch(e) {
    return null;
  }
};

/**
 * Format file size
 */
exports.formatFileSize = function(bytes) {
  if (!bytes) return "Unknown";
  
  var units = ['B', 'KB', 'MB', 'GB', 'TB'];
  var i = 0;
  
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  
  return bytes.toFixed(2) + ' ' + units[i];
};
