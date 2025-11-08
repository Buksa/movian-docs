# Movian API Reference Index

## Overview

This comprehensive API reference index provides a complete catalog of all APIs available in Movian, organized by category and functionality. Each entry includes method signatures, parameter types, return values, and links to detailed documentation.

**Version:** Movian 4.8+  
**Last Updated:** 2024-11-08  
**Status:** 🟢 Verified from source code

## Quick Navigation

- [Plugin APIs](#plugin-apis)
  - [Core Plugin APIs](#core-plugin-apis)
  - [HTTP and Networking](#http-and-networking)
  - [Storage and Database](#storage-and-database)
  - [Settings and Configuration](#settings-and-configuration)
- [UI System APIs](#ui-system-apis)
  - [View File Elements](#view-file-elements)
  - [Widget System](#widget-system)
  - [Expression Functions](#expression-functions)
  - [Theming and Styling](#theming-and-styling)
- [Media System APIs](#media-system-apis)
- [Core System APIs](#core-system-apis)
- [API Quick Reference Tables](#api-quick-reference-tables)

---

## Plugin APIs

### Core Plugin APIs

Core APIs for plugin registration, service creation, page management, and property system.

**Module:** `movian/service`, `movian/page`, `movian/prop`

**Detailed Documentation:** [Core API Reference](../plugins/api/core-api.md)

**Source References:**
- `movian/src/ecmascript/es_service.c`
- `movian/src/ecmascript/es_route.c`
- `movian/res/ecmascript/modules/movian/service.js`
- `movian/res/ecmascript/modules/movian/page.js`

#### Service API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `service.create()` | `title, url, type, enabled, icon` | `Service` | Creates and registers a new service |
| `service.destroy()` | - | `void` | Removes service from interface |
| `service.enabled` | - | `boolean` | Gets/sets service enabled state |

**Service Object Properties:**
- `enabled` (boolean) - Service enabled state
- `title` (string) - Service display name
- `url` (string) - Service URL

#### Page API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `Page()` | `route, callback` | `Page` | Creates a page route handler |
| `page.appendItem()` | `url, type, metadata` | `void` | Adds item to page |
| `page.appendPassiveItem()` | `type, metadata` | `void` | Adds non-interactive item |
| `page.loading` | `boolean` | - | Sets page loading state |
| `page.type` | `string` | - | Sets page type |
| `page.metadata` | `object` | - | Sets page metadata |
| `page.redirect()` | `url` | `void` | Redirects to another URL |
| `page.error()` | `message` | `void` | Displays error message |

**Page Object Properties:**
- `model` - Property tree for page data
- `metadata` - Page metadata object
- `loading` - Loading state indicator
- `type` - Page type identifier

#### Property (Prop) API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `prop.createRoot()` | - | `Prop` | Creates root property node |
| `prop.subscribe()` | `callback, options` | `Subscription` | Subscribes to property changes |
| `prop.set()` | `value` | `void` | Sets property value |
| `prop.get()` | - | `any` | Gets property value |
| `prop.destroy()` | - | `void` | Destroys property node |

**Property Types:**
- String properties
- Integer properties
- Float properties
- Boolean properties
- Directory properties (for lists)

---

### HTTP and Networking

Comprehensive HTTP client, WebSocket support, and content parsing capabilities.

**Modules:** `movian/http`, `http`, `websocket`, `html`, `xml`

**Detailed Documentation:** [HTTP API Reference](../plugins/api/http-api.md)

**Source References:**
- `movian/src/ecmascript/es_io.c`
- `movian/res/ecmascript/modules/movian/http.js`
- `movian/res/ecmascript/modules/http.js`
- `movian/res/ecmascript/modules/websocket.js`

#### HTTP Request API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `http.request()` | `url, options, callback` | `Response` | Makes HTTP request |
| `http.get()` | `url, options, callback` | `Response` | Makes GET request |
| `http.post()` | `url, data, options, callback` | `Response` | Makes POST request |

**Request Options:**
- `method` (string) - HTTP method (GET, POST, PUT, DELETE, etc.)
- `headers` (object) - Request headers
- `postdata` (string|object|buffer) - Request body
- `args` (object) - Query parameters
- `caching` (boolean) - Enable caching
- `cacheTime` (number) - Cache duration in seconds
- `compression` (boolean) - Enable gzip/deflate
- `noFollow` (boolean) - Don't follow redirects
- `verifySSL` (boolean) - Verify SSL certificates
- `debug` (boolean) - Enable debug logging

**Response Object:**
- `statuscode` (number) - HTTP status code
- `headers` (object) - Response headers
- `toString()` - Get response as string
- `bytes` - Raw response data

#### WebSocket API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `WebSocket()` | `url, protocols` | `WebSocket` | Creates WebSocket connection |
| `ws.send()` | `data` | `void` | Sends data through WebSocket |
| `ws.close()` | `code, reason` | `void` | Closes WebSocket connection |

**WebSocket Events:**
- `onopen` - Connection established
- `onmessage` - Message received
- `onerror` - Error occurred
- `onclose` - Connection closed

#### HTML Parsing API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `html.parse()` | `htmlString` | `Document` | Parses HTML using Gumbo parser |
| `doc.root` | - | `Element` | Gets root element |
- `element.getElementByTagName()` | `tagName` | `Element[]` | Finds elements by tag |
| `element.getElementByClassName()` | `className` | `Element[]` | Finds elements by class |
| `element.getAttribute()` | `name` | `string` | Gets attribute value |
| `element.textContent` | - | `string` | Gets text content |

#### XML Parsing API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `xml.parse()` | `xmlString` | `Document` | Parses XML document |
| `doc.root` | - | `Element` | Gets root element |
| `element.children` | - | `Element[]` | Gets child elements |
| `element.attributes` | - | `object` | Gets all attributes |

---

### Storage and Database

Persistent storage, key-value store, and SQLite database access.

**Modules:** `movian/store`, `native/kvstore`, `native/sqlite`

**Detailed Documentation:** [Storage API Reference](../plugins/api/storage-api.md)

**Source References:**
- `movian/src/ecmascript/es_kvstore.c`
- `movian/src/ecmascript/es_sqlite.c`
- `movian/res/ecmascript/modules/movian/store.js`

#### Key-Value Store (KVStore)

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `kvstore.getString()` | `url, domain, key` | `string\|null` | Gets string value |
| `kvstore.getInteger()` | `url, domain, key, default` | `number` | Gets integer value |
| `kvstore.getBoolean()` | `url, domain, key, default` | `boolean` | Gets boolean value |
| `kvstore.set()` | `url, domain, key, value` | `void` | Sets value |

**Storage Domains:**
- `'plugin'` - Plugin-specific storage
- `'sys'` - System-wide storage
- `'app'` - Application storage

#### Store Module

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `store.create()` | `filename` | `Store` | Creates file-based store |
| `store.get()` | `key, defaultValue` | `any` | Gets value from store |
| `store.set()` | `key, value` | `void` | Sets value in store |
| `store.delete()` | `key` | `void` | Deletes key from store |
| `store.list()` | - | `string[]` | Lists all keys |

#### SQLite Database

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `sqlite.open()` | `filename` | `Database` | Opens SQLite database |
| `db.query()` | `sql, params` | `ResultSet` | Executes SQL query |
| `db.exec()` | `sql, params` | `number` | Executes SQL statement |
| `db.close()` | - | `void` | Closes database |
| `db.begin()` | - | `void` | Begins transaction |
| `db.commit()` | - | `void` | Commits transaction |
| `db.rollback()` | - | `void` | Rolls back transaction |

**ResultSet Methods:**
- `next()` - Move to next row
- `get(column)` - Get column value
- `getInt(column)` - Get integer value
- `getString(column)` - Get string value

---

### Settings and Configuration

Plugin settings management with automatic UI generation.

**Modules:** `movian/settings`

**Detailed Documentation:** [Settings API Reference](../plugins/api/settings-api.md)

**Source References:**
- `movian/res/ecmascript/modules/movian/settings.js`
- `movian/src/ecmascript/es_kvstore.c`

#### Settings API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `settings.globalSettings()` | `id, title, icon, desc` | `void` | Creates global settings group |
| `settings.createBool()` | `id, title, default, callback` | `Setting` | Creates boolean setting |
| `settings.createString()` | `id, title, default, callback` | `Setting` | Creates string setting |
| `settings.createInt()` | `id, title, default, min, max, step, unit, callback` | `Setting` | Creates integer setting |
| `settings.createMultiOpt()` | `id, title, options, callback` | `Setting` | Creates multi-option setting |
| `settings.createDivider()` | `title` | `void` | Creates visual divider |
| `settings.createInfo()` | `icon, text` | `void` | Creates info display |

**Setting Object Properties:**
- `value` - Current setting value
- `enabled` - Whether setting is enabled
- `destroy()` - Removes setting

**Settings Storage Backends:**
- `kvstoreSettings` - URL-scoped settings using kvstore
- `storeSettings` - File-based settings using store module

---

## UI System APIs

### View File Elements

Complete catalog of GLW view file elements for UI construction.

**Detailed Documentation:** [Elements Reference](../ui/view-files/elements-reference.md)

**Source References:**
- `movian/src/ui/glw/glw_view_parser.c`
- `movian/src/ui/glw/glw_view_attrib.c`

#### Container Elements

| Element | Purpose | Key Attributes |
|---------|---------|----------------|
| `container_x` | Horizontal layout | `spacing`, `align`, `padding` |
| `container_y` | Vertical layout | `spacing`, `valign`, `padding` |
| `container_z` | Stacked layout | `alpha`, `filterConstraintX/Y` |
| `list_x` | Horizontal scrollable list | `spacing`, `scrollable` |
| `list_y` | Vertical scrollable list | `spacing`, `scrollable` |
| `grid` | Grid layout | `columns`, `rows`, `spacing` |

#### Content Display Elements

| Element | Purpose | Key Attributes |
|---------|---------|----------------|
| `label` | Text display | `caption`, `size`, `color`, `align` |
| `text` | Editable text | `bind`, `description`, `focusable` |
| `image` | Image display | `source`, `width`, `height`, `align` |
| `icon` | Icon display | `source`, `color`, `size` |
| `quad` | Colored rectangle | `color`, `alpha`, `additive` |
| `backdrop` | Background element | `source`, `alpha`, `blur` |

#### Interactive Elements

| Element | Purpose | Key Attributes |
|---------|---------|----------------|
| `cloner` | Data-driven replication | `source`, `template` |
| `loader` | Dynamic content loading | `source`, `time`, `effect`, `autohide` |
| `playfield` | Media playback surface | `source` |
| `slider_x` | Horizontal slider | `bind`, `min`, `max`, `step` |
| `slider_y` | Vertical slider | `bind`, `min`, `max`, `step` |
| `bar` | Progress bar | `fill`, `color1`, `color2` |

#### Layout Control Elements

| Element | Purpose | Key Attributes |
|---------|---------|----------------|
| `layer` | Z-order management | `alpha` |
| `underscan` | Screen boundary management | - |
| `displacement` | Position offset | `scaling`, `translation` |
| `border` | Visual boundary | `color`, `border` |
| `dummy` | Placeholder | `width`, `height` |

---

### Widget System

Comprehensive widget documentation with properties and usage patterns.

**Detailed Documentation:** 
- [Container Widgets](../ui/widgets/container.md)
- [Text Widgets](../ui/widgets/text.md)
- [Image Widgets](../ui/widgets/image.md)
- [List Widgets](../ui/widgets/list.md)
- [Grid Widgets](../ui/widgets/grid.md)

**Source References:**
- `movian/src/ui/glw/glw_container.c`
- `movian/src/ui/glw/glw_text_*.c`
- `movian/src/ui/glw/glw_image.c`
- `movian/src/ui/glw/glw_list.c`

#### Common Widget Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `width` | size | Widget width | `10em`, `50%`, `100` |
| `height` | size | Widget height | `2em`, `25%`, `50` |
| `alpha` | float | Opacity (0-1) | `0.5`, `iir($value, 4)` |
| `color` | color | Color value | `1`, `#ff0000`, `$ui.color1` |
| `hidden` | boolean | Visibility | `true`, `!$condition` |
| `focusable` | boolean | Can receive focus | `true`, `$enabled` |
| `padding` | array | Internal spacing | `[1em, 0.5em]` |
| `spacing` | size | Child spacing | `0.5em` |
| `align` | enum | Horizontal alignment | `left`, `center`, `right` |
| `valign` | enum | Vertical alignment | `top`, `middle`, `bottom` |

#### Event Handling Attributes

| Attribute | Parameters | Description | Example |
|-----------|-----------|-------------|---------|
| `onEvent` | `eventType, action, condition` | Event handler | `onEvent(activate, navOpen($self.url))` |
| `onClick` | `action` | Click handler | `onClick(toggle($value))` |
| `onFocus` | `action` | Focus handler | `onFocus(print("focused"))` |
| `onBlur` | `action` | Blur handler | `onBlur(print("blurred"))` |

**Common Event Types:**
- `activate` - Item activated (Enter/Click)
- `back` - Back button pressed
- `menu` - Menu button pressed
- `left`, `right`, `up`, `down` - Navigation
- `itemMenu` - Context menu requested

---

### Expression Functions

Built-in functions for view file expressions and dynamic behavior.

**Detailed Documentation:** [Expressions Reference](../ui/view-files/expressions.md)

**Source References:**
- `movian/src/ui/glw/glw_view_eval.c`

#### Conditional Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `select()` | `condition, trueVal, falseVal` | `any` | Ternary conditional | 
| `translate()` | `value, default, key1, val1, ...` | `any` | Multi-way switch |
| `iif()` | `condition, trueVal, falseVal` | `any` | Immediate if |

**Examples:**
```view
// Simple conditional
alpha: select($enabled, 1, 0.5);

// Multi-way selection
source: translate($type, "default.png",
  "video", "video.png",
  "audio", "audio.png",
  "image", "image.png"
);
```

#### State Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `isHovered()` | - | `boolean` | Mouse/touch hover state |
| `isNavFocused()` | - | `boolean` | Keyboard navigation focus |
| `isFocused()` | - | `boolean` | Any focus state |
| `canScroll()` | - | `boolean` | Can scroll in direction |
| `changed()` | `value, timeout, initial` | `boolean` | Value changed recently |

**Examples:**
```view
// Highlight on hover/focus
alpha: 0.1 * isHovered() + 0.2 * isNavFocused();

// Show scrollbar when scrollable
alpha: iir(canScroll(), 16);

// Flash on change
alpha: changed($value, 2, true);
```

#### Animation Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `iir()` | `value, speed, absolute` | `float` | Smooth interpolation |
| `delay()` | `value, time` | `any` | Delayed value |
| `sin()` | `value` | `float` | Sine function |
| `cos()` | `value` | `float` | Cosine function |

**Examples:**
```view
// Smooth fade in/out
alpha: iir($visible, 4);

// Delayed hide
hidden: delay(!$active, 2);

// Pulsing animation
alpha: 0.5 + 0.5 * sin($core.clock.time * 2);
```

#### Math Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `clamp()` | `value, min, max` | `number` | Constrain value |
| `min()` | `a, b` | `number` | Minimum value |
| `max()` | `a, b` | `number` | Maximum value |
| `abs()` | `value` | `number` | Absolute value |
| `floor()` | `value` | `number` | Round down |
| `ceil()` | `value` | `number` | Round up |
| `round()` | `value` | `number` | Round to nearest |

**Examples:**
```view
// Constrain alpha
alpha: clamp($value, 0, 1);

// Calculate percentage
width: max($ui.width * 0.5, 300);
```

#### String Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `fmt()` | `format, ...args` | `string` | Format string |
| `strcat()` | `...strings` | `string` | Concatenate strings |
| `strlen()` | `string` | `number` | String length |

**Examples:**
```view
// Format display text
caption: fmt("%s - %d items", $title, $count);

// Build URL
source: strcat("skin://icons/", $icon, ".svg");
```

#### Navigation Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `navOpen()` | `url, view, item, parent, how, parent_url` | `void` | Navigate to URL |
| `focus()` | `id` | `void` | Set focus to widget |
| `deliverEvent()` | `target, event, ...args` | `void` | Send event to target |
| `fireEvent()` | `event, ...args` | `void` | Fire event |
| `toggle()` | `variable` | `void` | Toggle boolean |
| `print()` | `...values` | `void` | Debug print |

**Examples:**
```view
// Navigate on activate
onEvent(activate, navOpen($self.url));

// Focus specific widget
onEvent(menu, { $osdpage = 1; focus("osd_main"); });

// Send media control event
onEvent(activate, deliverEvent($core.media.eventSink, "PlayPause"));
```

#### Property Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `bind()` | `target` | `void` | Bind to property |
| `getLayer()` | - | `number` | Get current layer depth |
| `vectorize()` | `value` | `array` | Convert to array |
| `selectedElement()` | `array` | `any` | Get selected element |

---

### Theming and Styling

Macro system, global configuration, and skin architecture.

**Detailed Documentation:**
- [Macro Reference](../ui/theming/macro-reference.md)
- [Global Configuration](../ui/theming/global-configuration.md)
- [Skin Architecture](../ui/theming/skin-architecture.md)

**Source References:**
- `movian/glwskins/flat/theme.view`
- `movian/glwskins/flat/universe.view`

#### Standard Macros

| Macro | Parameters | Description |
|-------|-----------|-------------|
| `ListItemBevel()` | - | Subtle shadow effect for list items |
| `GridItemBevel()` | - | Shadow effect for grid items |
| `ListItemHighlight()` | - | Hover/focus highlight for lists |
| `GridItemHighlight()` | - | Hover/focus highlight for grids |
| `BackButton()` | `ENABLED, EVENT` | Standard back button |
| `PageHeader()` | `TITLE` | Standard page header |
| `ScrollBar()` | `TARGET, TOP_PAD, BOTTOM_PAD` | Scrollbar indicator |
| `SearchBar()` | `URLPREFIX, TEXT, ICON` | Search input interface |

**Example Usage:**
```view
widget(container_z, {
  ListItemBevel();
  ListItemHighlight();
  focusable: true;
  
  widget(container_x, {
    widget(label, { caption: $self.title; });
  });
});
```

#### Global UI Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$ui.width` | number | Screen width |
| `$ui.height` | number | Screen height |
| `$ui.aspect` | number | Aspect ratio |
| `$ui.sizeOffset` | number | Size adjustment |
| `$ui.xmargin` | size | Horizontal margin |
| `$ui.color1` | color | Primary theme color |
| `$ui.color2` | color | Secondary theme color |
| `$ui.color3` | color | Tertiary theme color |
| `$ui.pointerVisible` | boolean | Mouse/touch active |
| `$ui.touch` | boolean | Touch interface |
| `$ui.orientation` | string | "landscape" or "portrait" |

#### Navigation System Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$nav.pages` | array | All open pages |
| `$nav.currentpage` | object | Current page |
| `$nav.canGoBack` | boolean | Can navigate back |
| `$nav.currentpage.model.loading` | boolean | Page loading state |

#### Core System Variables

| Variable | Type | Description |
|----------|------|-------------|
| `$core.audio.mastervolume` | number | Master volume (-75 to 12 dB) |
| `$core.audio.mastermute` | boolean | Mute state |
| `$core.media.current.type` | string | Current media type |
| `$core.media.current.playstatus` | string | "play" or "pause" |
| `$core.popups` | array | Active popups |
| `$core.notifications.nodes` | array | Active notifications |
| `$core.clock.time` | number | Current time |

---

## Media System APIs

Media playback control, track management, and player integration.

**Detailed Documentation:**
- [OSD System](../media/osd-system.md)
- [Audio/Video UI](../media/audio-video-ui.md)
- [Playdeck System](../media/playdeck-system.md)

**Source References:**
- `movian/src/media/media.c`
- `movian/glwskins/flat/osd/`
- `movian/glwskins/flat/playdecks/`

### Media Control Events

| Event | Target | Description |
|-------|--------|-------------|
| `PlayPause` | `$core.media.eventSink` | Toggle play/pause |
| `Stop` | `$core.media.eventSink` | Stop playback |
| `NextTrack` | `$core.media.eventSink` | Skip to next |
| `PreviousTrack` | `$core.media.eventSink` | Skip to previous |
| `SeekForward` | `$core.media.eventSink` | Seek forward |
| `SeekReverse` | `$core.media.eventSink` | Seek backward |

**Example:**
```view
onEvent(activate, deliverEvent($core.media.eventSink, "PlayPause"));
```

### Media Properties

| Property | Type | Description |
|----------|------|-------------|
| `$core.media.current.type` | string | Media type (tracks, radio, video) |
| `$core.media.current.playstatus` | string | "play", "pause", "stop" |
| `$core.media.current.canPause` | boolean | Can pause |
| `$core.media.current.canSeek` | boolean | Can seek |
| `$core.media.current.canSkipForward` | boolean | Can skip forward |
| `$core.media.current.canSkipBackward` | boolean | Can skip backward |
| `$core.media.current.repeat` | boolean | Repeat mode |
| `$core.media.current.shuffle` | boolean | Shuffle mode |

### Track Selection

| Property | Type | Description |
|----------|------|-------------|
| `$self.media.audio.sorted` | array | Available audio tracks |
| `$self.media.subtitle.sorted` | array | Available subtitle tracks |
| `$self.media.audio.current` | string | Current audio track URL |
| `$self.media.subtitle.current` | string | Current subtitle track URL |

**Track Selection Functions:**
- `selectAudioTrack(url)` - Select audio track
- `selectSubtitleTrack(url)` - Select subtitle track

---

## Core System APIs

System-level functionality and utilities.

### Plugin Object

Global `Plugin` object available to all plugins.

| Property | Type | Description |
|----------|------|-------------|
| `Plugin.id` | string | Plugin identifier |
| `Plugin.path` | string | Plugin directory path |
| `Plugin.manifest` | object | Plugin manifest data |

### Console API

| Function | Parameters | Description |
|----------|-----------|-------------|
| `console.log()` | `...args` | Log message |
| `console.error()` | `...args` | Log error |
| `console.warn()` | `...args` | Log warning |
| `console.info()` | `...args` | Log info |

### Timer Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `setTimeout()` | `callback, delay` | `number` | Schedule one-time callback |
| `setInterval()` | `callback, delay` | `number` | Schedule repeating callback |
| `clearTimeout()` | `id` | `void` | Cancel timeout |
| `clearInterval()` | `id` | `void` | Cancel interval |

### JSON API

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `JSON.parse()` | `string` | `object` | Parse JSON string |
| `JSON.stringify()` | `object` | `string` | Convert to JSON string |

---

## API Quick Reference Tables

### Plugin Development Quick Reference

| Task | API | Example |
|------|-----|---------|
| Create service | `service.create()` | `service.create('My Service', 'plugin:id:browse', 'video', true)` |
| Make HTTP request | `http.request()` | `http.request('https://api.example.com/data')` |
| Store data | `store.set()` | `store.set('key', 'value')` |
| Create setting | `settings.createBool()` | `settings.createBool('enable', 'Enable Feature', false)` |
| Add page item | `page.appendItem()` | `page.appendItem(url, 'video', {title: 'Video'})` |

### UI Development Quick Reference

| Task | Element/Function | Example |
|------|-----------------|---------|
| Horizontal layout | `container_x` | `widget(container_x, { spacing: 0.5em; })` |
| Vertical layout | `container_y` | `widget(container_y, { spacing: 0.5em; })` |
| Display text | `label` | `widget(label, { caption: "Hello"; })` |
| Display image | `image` | `widget(image, { source: "icon.png"; })` |
| Handle click | `onEvent` | `onEvent(activate, navOpen($self.url))` |
| Conditional display | `select()` | `hidden: select($enabled, false, true);` |
| Smooth animation | `iir()` | `alpha: iir($visible, 4);` |
| Data-driven list | `cloner` | `cloner($items, container_y, { ... })` |

### Common Patterns Quick Reference

| Pattern | Code |
|---------|------|
| **List item with highlight** | `ListItemBevel(); ListItemHighlight(); focusable: true;` |
| **Conditional loading** | `widget(loader, { source: select($show, "file.view", ""); })` |
| **Smooth fade** | `alpha: iir($visible, 4);` |
| **Navigate on click** | `onEvent(activate, navOpen($self.url));` |
| **Toggle value** | `onEvent(activate, toggle($value));` |
| **Format text** | `caption: fmt("%s - %d", $title, $count);` |
| **Bind to property** | `bind($view.searchQuery);` |
| **Focus widget** | `focus("widget_id");` |

---

## Error Handling

### Common Error Conditions

| API | Error Condition | Handling |
|-----|----------------|----------|
| HTTP requests | Network timeout, 404, 500 | Check `response.statuscode`, use try-catch |
| Database | SQL syntax error, constraint violation | Use try-catch, check return values |
| Storage | File not found, permission denied | Check return values, use defaults |
| Navigation | Invalid URL | Validate URLs before navigation |
| Property access | Undefined property | Check existence before access |

### Error Handling Patterns

**HTTP Requests:**
```javascript
try {
  var response = http.request(url);
  if (response.statuscode !== 200) {
    console.error('HTTP error:', response.statuscode);
    return;
  }
  // Process response
} catch (e) {
  console.error('Request failed:', e);
}
```

**Database Operations:**
```javascript
try {
  db.exec('INSERT INTO table VALUES (?, ?)', [val1, val2]);
} catch (e) {
  console.error('Database error:', e);
  db.rollback();
}
```

**Property Access:**
```javascript
if (page.model && page.model.metadata) {
  var title = page.model.metadata.title || 'Untitled';
}
```

---

## Version Compatibility

| API Category | Minimum Version | Notes |
|-------------|----------------|-------|
| Core Plugin APIs | 4.0+ | Stable across versions |
| HTTP API | 4.0+ | WebSocket added in 4.2 |
| Storage API | 4.0+ | SQLite improvements in 4.5 |
| Settings API | 4.0+ | Multi-option added in 4.3 |
| View File System | 4.0+ | New elements added incrementally |
| Expression Functions | 4.0+ | Additional functions in 4.6+ |
| Media System | 4.0+ | OSD improvements in 4.8 |

---

## Additional Resources

### Detailed Documentation

- **Plugin Development:**
  - [Getting Started Guide](../plugins/getting-started.md)
  - [Plugin Architecture](../plugins/architecture.md)
  - [Best Practices](../plugins/best-practices.md)
  - [Plugin Examples](../plugins/examples/)

- **UI Development:**
  - [View Files Syntax](../ui/view-files/syntax-reference.md)
  - [Widget System](../ui/widgets/)
  - [Theming Guide](../ui/theming/)
  - [UI Examples](../ui/examples/)

- **Reference Materials:**
  - [Glossary](glossary.md)
  - [Troubleshooting](troubleshooting.md)
  - [FAQ](faq.md)

### Source Code References

- **Plugin System:** `movian/src/ecmascript/`, `movian/res/ecmascript/modules/`
- **UI System:** `movian/src/ui/glw/`
- **Media System:** `movian/src/media/`
- **Example Skins:** `movian/glwskins/flat/`
- **Example Plugins:** `movian/plugin_examples/`

---

**Document Status:** 🟢 Complete and Verified  
**Last Updated:** 2024-11-08  
**Movian Version:** 4.8+  
**Maintainer:** Movian Documentation Team

For corrections or additions, please refer to the [contribution guidelines](../../CONTRIBUTING.md).
