# Reference Documentation

Quick reference materials for Movian development.

## API References

- [Complete API Index](api-index.md) - All APIs organized by category
- [Element Reference](element-reference.md) - All view file elements
- [Attribute Reference](attribute-reference.md) - All element attributes

## General References

- [Glossary](glossary.md) - Technical terms and definitions
- [FAQ](faq.md) - Frequently asked questions
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Quick Lookup Tables

### Plugin APIs
| API | Purpose | Documentation |
|-----|---------|---------------|
| `http` | Network requests | [HTTP API](../plugins/api/http-api.md) |
| `page` | UI pages | [Page API](../plugins/api/page-api.md) |
| `store` | Data storage | [Storage API](../plugins/api/storage-api.md) |
| `sqlite` | Database | [SQLite API](../plugins/api/sqlite-api.md) |

### View File Elements
| Element | Purpose | Documentation |
|---------|---------|---------------|
| `container` | Layout container | [Container Widgets](../ui/widgets/container.md) |
| `text` | Text display | [Text Widgets](../ui/widgets/text.md) |
| `image` | Image display | [Image Widgets](../ui/widgets/image.md) |
| `list` | Scrollable lists | [List Widgets](../ui/widgets/list.md) |

### Common File Locations
| Type | Location | Purpose |
|------|----------|---------|
| Plugin manifest | `plugin.json` | Plugin configuration |
| Main plugin file | `*.js` | Plugin implementation |
| View files | `*.view` | UI layout definitions |
| Skin directory | `glwskins/*/` | Theme files |