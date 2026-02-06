/**
 * WebSocket Client Example
 * 
 * Real-time communication with WebSocket server.
 * Requires: native/websocket module
 */

var page = require('movian/page');
var prop = require('movian/prop');

// WebSocket connection
var ws = null;

new page.Route("example:websocket:", function(page) {
  page.type = "directory";
  page.metadata.title = "WebSocket Demo";
  
  // Connect button
  page.appendPassiveItem("label", { title: "WebSocket Status: " + (ws ? "Connected" : "Disconnected") });
  
  page.appendItem("", "directory", {
    title: ws ? "Disconnect" : "Connect to Server"
  }).onSelect = function() {
    if (ws) {
      ws.close();
      ws = null;
    } else {
      // Create WebSocket
      ws = new WebSocket("wss://echo.websocket.org/");
      
      ws.onopen = function() {
        console.log("WebSocket connected");
      };
      
      ws.onmessage = function(event) {
        console.log("Received:", event.data);
        // Update UI with received data
        prop.setGlobal("example:websocket:message", event.data);
      };
      
      ws.onerror = function(error) {
        console.error("WebSocket error:", error);
      };
      
      ws.onclose = function() {
        console.log("WebSocket closed");
        ws = null;
      };
    }
    page.redirect("example:websocket:");
  };
  
  // Send message
  if (ws) {
    page.appendItem("", "directory", { title: "Send Test Message" }).onSelect = function() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("Hello from Movian plugin!");
      }
    };
  }
  
  page.loading = false;
});
