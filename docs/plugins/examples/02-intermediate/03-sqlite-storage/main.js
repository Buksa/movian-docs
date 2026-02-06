/**
 * SQLite & Storage Demo
 * 
 * Demonstrates persistent storage options:
 * 1. SQLite database (structured data)
 * 2. Simple key-value store
 */

var sqlite = require('movian/sqlite');
var store = require('movian/store');
var settings = require('movian/settings');
var page = require('movian/page');

// Initialize SQLite
var db = new sqlite.DB("watch_history");

// Create table if not exists
db.query(
  "CREATE TABLE IF NOT EXISTS history (" +
  "id INTEGER PRIMARY KEY, " +
  "url TEXT UNIQUE, " +
  "title TEXT, " +
  "watched_at INTEGER" +
  ")"
);

// Simple key-value storage
var prefs = store.create("user_prefs");

// Settings UI
var s = new settings.globalSettings("examples.storage", "Storage Demo", null, "SQLite and key-value storage examples");

s.createAction("show_history", "Show Watch History", function() {
  // Query database
  db.query("SELECT * FROM history ORDER BY watched_at DESC LIMIT 10");
  
  console.log("Recent watches:");
  while (db.step()) {
    console.log(db.row.title + " at " + new Date(db.row.watched_at * 1000));
  }
});

s.createAction("clear_history", "Clear History", function() {
  db.query("DELETE FROM history");
  console.log("History cleared");
});

s.createString("username", "Username (stored)", prefs.username || "", function(v) {
  prefs.username = v; // Auto-saved
  console.log("Saved username:", v);
});

// Page showing stored data
new page.Route("example:storage:", function(page) {
  page.type = "directory";
  page.metadata.title = "Storage Demo";
  
  // Show from key-value store
  page.appendPassiveItem("label", { 
    title: "Username: " + (prefs.username || "not set") 
  });
  
  // Count from SQLite
  db.query("SELECT COUNT(*) as cnt FROM history");
  var count = db.step() ? db.row.cnt : 0;
  
  page.appendPassiveItem("label", { 
    title: "Watched videos: " + count 
  });
  
  page.loading = false;
});
