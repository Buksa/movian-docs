# Basic Plugin Template

A minimal Movian plugin template for learning and quick prototyping. This template provides the essential structure needed for any Movian plugin.

## Features

- ✅ Minimal plugin.json configuration
- ✅ Basic service registration
- ✅ Simple page creation
- ✅ Logging and debugging setup
- ✅ Clean code structure with comments

## File Structure

```
basic-plugin/
├── plugin.json          # Plugin manifest
├── main.js             # Main plugin code
├── logo.png            # Plugin icon (optional)
└── README.md           # This file
```

## Installation

1. **Copy this template** to your development directory:
   ```bash
   cp -r basic-plugin/ ~/my-plugin/
   ```

2. **Customize plugin.json**:
   - Change `id`, `title`, `description`
   - Update `author` and `homepage`
   - Modify `version` as needed

3. **Edit main.js**:
   - Implement your plugin logic
   - Add service handlers
   - Create custom pages

4. **Install in Movian**:
   ```bash
   # Copy to Movian plugins directory
   cp -r ~/my-plugin/ ~/.movian/plugins/
   
   # Or create symlink for development
   ln -s ~/my-plugin/ ~/.movian/plugins/my-plugin
   ```

5. **Enable plugin**:
   - Restart Movian
   - Go to Settings → Plugins
   - Enable your plugin

## Customization Guide

### Change Plugin Identity

Edit `plugin.json`:
```json
{
  "id": "com.yourname.yourplugin",
  "title": "Your Plugin Name",
  "description": "What your plugin does"
}
```

### Add Service Handler

In `main.js`:
```javascript
service.create("Your Service", "yourservice:start", "video", true, logo);

new page.Route("yourservice:(.*)$", function(page, path) {
  page.type = "directory";
  page.contents = "items";
  page.metadata.title = "Your Service";
  
  // Add your content here
  page.appendItem("yourservice:item1", "directory", {
    title: "Item 1"
  });
});
```

### Add Settings

In `plugin.json`:
```json
{
  "settings": [
    {
      "id": "username",
      "title": "Username",
      "type": "string",
      "defaultValue": ""
    }
  ]
}
```

Access in code:
```javascript
var username = store.username || "";
```

## Development Tips

1. **Enable Debug Logging**:
   ```javascript
   console.log("Debug message:", variable);
   ```

2. **Check Movian Logs**:
   - Press `Ctrl+D` in Movian to open log window
   - Look for your plugin messages

3. **Reload Plugin**:
   - Disable and re-enable in settings
   - Or restart Movian

4. **Test Error Handling**:
   ```javascript
   try {
     // Your code
   } catch(e) {
     console.error("Error:", e.message);
     page.error("Something went wrong");
   }
   ```

## Next Steps

- Add HTTP requests: See `docs/plugins/api/http-api.md`
- Create custom UI: See `docs/ui/examples/`
- Add persistent storage: See `docs/plugins/api/storage-api.md`
- Review best practices: See `docs/plugins/best-practices.md`

## Examples

Based on this template, you can create:
- Content aggregators
- Search services
- Media scrapers
- Custom navigation pages
- Settings interfaces

## Troubleshooting

**Plugin doesn't appear in Movian:**
- Check plugin.json syntax (use JSON validator)
- Verify file permissions
- Check Movian logs for errors

**Plugin crashes on load:**
- Check JavaScript syntax
- Review error messages in logs
- Add try-catch blocks

**Service doesn't register:**
- Verify service.create() parameters
- Check route pattern syntax
- Ensure logo file exists

## Resources

- **API Reference**: `docs/reference/api-index.md`
- **Plugin Architecture**: `docs/plugins/architecture.md`
- **More Examples**: `docs/plugins/examples/`
