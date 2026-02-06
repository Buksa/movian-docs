# XML API

Complete reference for parsing and working with XML documents in Movian plugins.

## Overview

The XML API provides functionality for parsing XML documents and accessing their contents through a JavaScript-friendly interface using ES6 Proxy objects.

## Module Import

```javascript
var xml = require('movian/xml');
```

## Core Functions

### xml.parse(xmlString)

Parses an XML string and returns a Proxy-wrapped XML document object.

```javascript
var xmlString = '<root><item>Hello</item></root>';
var doc = xml.parse(xmlString);
console.log(doc.root.item.valueOf());  // "Hello"
```

### xml.htsmsg(htsmsgObject)

Wraps an existing native htsmsg object in a Proxy for easy access.

```javascript
var wrapped = xml.htsmsg(nativeResult);
```

## XML Object Interface

### Property Access

```javascript
var xmlString = `
<library>
    <book>
        <title>Example Book</title>
        <author>John Doe</author>
    </book>
</library>
`;

var doc = xml.parse(xmlString);
console.log(doc.library.book.title.valueOf());  // "Example Book"
```

### Methods

- **valueOf()** - Returns text content
- **toString()** - String representation
- **dump()** - Debug output to console
- **filterNodes(tagName)** - Filter children by tag name

### Properties

- **length** - Number of child elements

## Practical Examples

### RSS Feed Parser

```javascript
var xml = require('movian/xml');
var http = require('movian/http');

function parseRSSFeed(feedUrl, callback) {
    http.request(feedUrl, function(err, response) {
        if (err) {
            callback(err);
            return;
        }
        
        try {
            var doc = xml.parse(response.toString());
            var channel = doc.rss ? doc.rss.channel : doc.feed;
            var items = channel.item || channel.entry;
            
            if (!items) {
                callback(null, []);
                return;
            }
            
            var articles = [];
            // Process items...
            
            callback(null, articles);
        } catch (e) {
            callback(e);
        }
    });
}
```

## API Quick Reference

```javascript
// Parse XML
var doc = xml.parse(xmlString);

// Access elements
var value = doc.root.child.valueOf();

// Get attribute
var attr = doc.root['@id'];

// Filter nodes
var items = doc.root.filterNodes('item');

// Get count
var count = doc.root.item.length;
```

## See Also

- Source: `res/ecmascript/modules/movian/xml.js`
