/**
 * OAuth Authentication Example
 * 
 * Demonstrates OAuth 2.0 flow with external API.
 * Stores access token securely.
 */

var page = require('movian/page');
var store = require('movian/store');
var settings = require('movian/settings');

// Storage for tokens
var authStore = store.create("oauth_tokens");
var ACCESS_TOKEN = authStore.access_token;

// Settings with auth action
var s = new settings.globalSettings("examples.oauth", "OAuth Demo", null, "OAuth 2.0 authentication flow");

s.createAction("auth", ACCESS_TOKEN ? "Re-authenticate" : "Authenticate with Service", function() {
  // Step 1: Open browser for user to authorize
  // This uses the webpopup or external browser
  var popup = require('native/popup');
  
  // Construct OAuth URL
  var clientId = "your-client-id";
  var redirectUri = "http://localhost:8080/callback";
  var authUrl = "https://api.example.com/oauth/authorize?client_id=" + clientId + "&redirect_uri=" + encodeURIComponent(redirectUri) + "&response_type=code";
  
  // Open web popup for authorization
  popup.web(authUrl, "Authenticate", function(result) {
    // Extract code from callback URL
    var code = extractCode(result.url);
    
    // Step 2: Exchange code for token
    exchangeCodeForToken(code);
  });
});

// Helper: extract authorization code
function extractCode(url) {
  var match = url.match(/[?&]code=([^&]+)/);
  return match ? match[1] : null;
}

// Helper: exchange code for access token
function exchangeCodeForToken(code) {
  var http = require('movian/http');
  
  var response = http.request("https://api.example.com/oauth/token", {
    method: "POST",
    args: {
      grant_type: "authorization_code",
      code: code,
      client_id: "your-client-id",
      client_secret: "your-client-secret",
      redirect_uri: "http://localhost:8080/callback"
    }
  });
  
  var data = JSON.parse(response.toString());
  ACCESS_TOKEN = data.access_token;
  authStore.access_token = ACCESS_TOKEN;
  authStore.refresh_token = data.refresh_token;
  
  console.log("Authenticated! Token saved.");
}

// Authenticated API request
function apiRequest(endpoint) {
  var http = require('movian/http');
  
  return http.request("https://api.example.com" + endpoint, {
    headers: {
      "Authorization": "Bearer " + ACCESS_TOKEN
    }
  });
}
