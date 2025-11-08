# Contributing to Movian Documentation

Thank you for your interest in contributing to the Movian documentation! This guide will help you get started.

## How to Contribute

### Documentation Improvements

We welcome contributions that:

- Fix typos and grammatical errors
- Clarify existing documentation
- Add missing information
- Provide additional examples
- Improve code samples
- Add diagrams and visualizations

### Ways to Contribute

1. **Report Issues**: Found an error or unclear section? [Open an issue](https://github.com/andoma/movian/issues)
2. **Submit Pull Requests**: Fix issues directly by submitting a PR
3. **Suggest Improvements**: Share ideas for better documentation
4. **Add Examples**: Contribute working code examples

## Getting Started

### Prerequisites

- Git
- Python 3.7+
- MkDocs: `pip install mkdocs mkdocs-material`
- Text editor or IDE

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/movian.git
   cd movian/movian-docs
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start local server:
   ```bash
   mkdocs serve
   ```

5. Open http://localhost:8000 in your browser

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b improve-plugin-docs
   ```

2. Make your changes to files in `docs/`

3. Preview changes locally:
   ```bash
   mkdocs serve
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Improve plugin API documentation"
   ```

5. Push to your fork:
   ```bash
   git push origin improve-plugin-docs
   ```

6. Open a Pull Request

## Documentation Standards

### Writing Style

- **Clear and Concise**: Use simple language
- **Active Voice**: "The plugin creates a page" not "A page is created"
- **Present Tense**: "The function returns" not "The function will return"
- **Second Person**: Address the reader as "you"

### Code Examples

- **Complete**: Examples should be runnable
- **Commented**: Explain non-obvious code
- **Tested**: Verify examples work
- **Realistic**: Use practical scenarios

Example:

```javascript
// Good: Complete and commented
new page.Route("myplugin:start", function(page) {
  // Set page type to directory listing
  page.type = "directory";
  
  // Add a video item
  page.appendItem("myplugin:video:1", "video", {
    title: "Example Video",
    icon: "http://example.com/thumb.jpg"
  });
  
  // Hide loading indicator
  page.loading = false;
});

// Bad: Incomplete and unclear
page.appendItem(url, type, data);
```

### Markdown Formatting

#### Headers

Use ATX-style headers:

```markdown
# H1 - Page Title
## H2 - Major Section
### H3 - Subsection
#### H4 - Minor Section
```

#### Code Blocks

Always specify language:

````markdown
```javascript
var x = 10;
```

```xml
<widget type="label">
  <caption>Hello</caption>
</widget>
```
````

#### Links

Use relative links for internal documentation:

```markdown
[Plugin API](plugins/api/core-api.md)
[Getting Started](plugins/getting-started.md)
```

Use absolute URLs for external links:

```markdown
[Movian GitHub](https://github.com/andoma/movian)
```

#### Lists

Use consistent formatting:

```markdown
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
- Item 3
```

#### Tables

Use tables for structured data:

```markdown
| Property | Type | Description |
|----------|------|-------------|
| title | string | Page title |
| icon | string | Icon URL |
```

### File Organization

```
docs/
├── index.md                    # Homepage
├── installation/               # Installation guides
│   ├── README.md
│   ├── linux.md
│   ├── windows.md
│   └── macos.md
├── plugins/                    # Plugin documentation
│   ├── README.md
│   ├── getting-started.md
│   └── api/                    # API reference
├── ui/                         # UI documentation
│   ├── README.md
│   ├── getting-started.md
│   └── widgets/                # Widget reference
└── reference/                  # General reference
    ├── glossary.md
    └── faq.md
```

### Naming Conventions

- **Files**: Use lowercase with hyphens: `getting-started.md`
- **Directories**: Use lowercase with hyphens: `api-reference/`
- **Anchors**: Use lowercase with hyphens: `#plugin-basics`

## Documentation Types

### Tutorials

Step-by-step guides for specific tasks:

```markdown
# Creating Your First Plugin

## Step 1: Setup

Create a new directory...

## Step 2: Configuration

Create plugin.json...

## Step 3: Implementation

Write your main.js...
```

### How-To Guides

Task-oriented instructions:

```markdown
# How to Add Settings to Your Plugin

This guide shows you how to...

## Prerequisites

- Existing plugin
- Basic JavaScript knowledge

## Steps

1. Create settings object
2. Add setting fields
3. Handle setting changes
```

### Reference Documentation

Complete API documentation:

```markdown
# Page API Reference

## page.appendItem()

Adds an item to the page.

**Syntax:**
```javascript
page.appendItem(url, type, metadata)
```

**Parameters:**
- `url` (string): Item URL
- `type` (string): Item type
- `metadata` (object): Item metadata

**Returns:** void

**Example:**
```javascript
page.appendItem("plugin:video:1", "video", {
  title: "Video Title"
});
```
```

### Explanations

Conceptual documentation:

```markdown
# Understanding the Plugin System

Movian's plugin system allows...

## Architecture

The plugin system consists of...

## How It Works

When a plugin is loaded...
```

## Testing

### Before Submitting

- [ ] Build documentation: `mkdocs build`
- [ ] Check for broken links
- [ ] Verify code examples work
- [ ] Test on local server
- [ ] Check spelling and grammar
- [ ] Ensure proper formatting

### Validation

```bash
# Build and check for errors
mkdocs build --strict

# Serve locally
mkdocs serve

# Check links (if link checker installed)
linkchecker http://localhost:8000
```

## Pull Request Process

### PR Checklist

- [ ] Branch is up to date with main
- [ ] Changes are focused and related
- [ ] Commit messages are clear
- [ ] Documentation builds without errors
- [ ] Examples are tested
- [ ] Links are valid

### PR Description

Provide a clear description:

```markdown
## Changes

- Fixed typo in plugin API documentation
- Added example for page.appendItem()
- Clarified parameter descriptions

## Testing

- Built documentation locally
- Verified examples work
- Checked all links

## Related Issues

Fixes #123
```

### Review Process

1. Maintainers review your PR
2. Address any feedback
3. PR is merged when approved

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Questions?

- **Documentation Issues**: [GitHub Issues](https://github.com/andoma/movian/issues)
- **General Questions**: [Movian Forum](https://movian.tv/forum)
- **Chat**: [Discord/IRC if available]

## Recognition

Contributors are recognized in:

- Git commit history
- Release notes
- Contributors list

Thank you for helping improve Movian documentation!

## Additional Resources

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Movian Source Code](https://github.com/andoma/movian)
- [Documentation Standards](meta/documentation-standards.md)
