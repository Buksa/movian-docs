# Skin Template Generator

The Movian Skin Template Generator is a command-line tool that creates a new skin with proper `universe.view` structure based on your preferences. It automates the creation of all necessary files and directories, allowing you to start customizing your skin immediately.

## Overview

The generator creates either a **minimal** or **advanced** skin template:

- **Minimal Template**: Basic skin with essential components (universe.view, theme.view, background, loading, and home page)
- **Advanced Template**: Complete skin with OSD, playdecks, popups, and multiple page types

Both templates follow Movian's skin architecture best practices and include proper macro definitions, global configuration, and component loading systems.

## Installation

The generator is included in the Movian documentation repository under `tools/generate-skin-template.js`.

### Requirements

- **Node.js** (version 12 or higher)
- Access to the movian-docs repository

### Verify Installation

```bash
# Check Node.js version
node --version

# Navigate to movian-docs directory
cd movian-docs

# Test the generator
node tools/generate-skin-template.js --help
```

## Usage

### Basic Syntax

```bash
node tools/generate-skin-template.js <skin-name> [options]
```

### Quick Start Examples

**Generate a minimal skin:**
```bash
node tools/generate-skin-template.js my-custom-skin
```

**Generate an advanced skin:**
```bash
node tools/generate-skin-template.js my-advanced-skin --type=advanced
```

**Generate with custom colors:**
```bash
node tools/generate-skin-template.js my-skin --color-primary=#ff0000 --color-secondary=#cc0000 --color-accent=#ffcccc
```

**Generate to a specific directory:**
```bash
node tools/generate-skin-template.js my-skin --output=../my-skins/
```

### Using Shell Wrappers

For convenience, shell wrappers are provided:

**Linux/macOS:**
```bash
chmod +x tools/generate-skin.sh
./tools/generate-skin.sh my-custom-skin
```

**Windows (PowerShell):**
```powershell
.\tools\generate-skin.ps1 my-custom-skin
```

## Command-Line Options

### Required Arguments

| Argument | Description |
|----------|-------------|
| `<skin-name>` | Name of the skin to generate (letters, numbers, hyphens, and underscores only) |

### Optional Flags

| Option | Description | Default |
|--------|-------------|---------|
| `--type=TYPE` | Template type: `minimal` or `advanced` | `minimal` |
| `--output=PATH` | Output directory path | `./generated-skins` |
| `--color-primary=COLOR` | Primary color in hex format | `#4192ff` |
| `--color-secondary=COLOR` | Secondary color in hex format | `#306cbe` |
| `--color-accent=COLOR` | Accent color in hex format | `#c2ddff` |
| `--help`, `-h` | Show help message | - |

## Template Types

### Minimal Template

The minimal template includes:

```
my-skin/
├── README.md              # Installation and customization guide
├── universe.view          # Main entry point and global configuration
├── theme.view             # Macro definitions (ListItemBevel, PageHeader, BackButton)
├── background.view        # Background component
├── loading.view           # Loading screen
└── pages/
    └── home.view          # Simple home page
```

**Best for:**
- Learning Movian skin development
- Creating simple, focused skins
- Quick prototyping
- Understanding core skin architecture

**Features:**
- Essential macros (ListItemBevel, ListItemHighlight, BackButton, PageHeader)
- Global configuration with color scheme
- Page system with navigation
- Loading indicators
- Volume overlay
- Notification system

### Advanced Template

The advanced template includes everything from the minimal template plus:

```
my-skin/
├── ... (all minimal template files)
├── pages/
│   ├── home.view          # Home page
│   ├── directory.view     # Directory listing
│   └── video.view         # Video playback page
├── popups/
│   ├── message.view       # Message dialog
│   ├── auth.view          # Authentication dialog
│   └── filepicker.view    # File picker dialog
├── playdecks/
│   ├── playdeck_video.view # Video player controls
│   └── playdeck_audio.view # Audio player controls
├── osd/
│   ├── osd_main.view      # Main OSD menu
│   ├── osd_settings.view  # Settings macro definitions
│   ├── osd_subs.view      # Subtitle track selection
│   ├── osd_audio.view     # Audio track selection
│   ├── osd_settings_subs.view   # Subtitle settings
│   ├── osd_settings_audio.view  # Audio settings
│   └── osd_settings_video.view  # Video settings
└── components/
    └── sidebar.view       # Reusable sidebar component
```

**Best for:**
- Production-ready skins
- Complete UI customization
- Media-rich applications
- Advanced theming projects

**Additional Features:**
- Complete OSD system with settings pages
- Media player controls (playdecks) for video and audio
- Popup dialogs for user interaction
- Multiple page types (home, directory, video)
- Reusable components
- Advanced macro library

## Generated Files

### universe.view

The main entry point that sets up:

- **Global Configuration**: UI variables, color scheme, orientation detection
- **Event Handlers**: System info, media stats, back navigation
- **Global Styles**: Page container effects, text styling
- **Component Loading**: Background, loading screen, pages, popups
- **System Integrations**: Navigation, notifications, volume control

**Key Features:**
```view
// Color scheme (customizable via CLI)
$ui.color1 = "#4192ff";  // Primary color
$ui.color2 = "#306cbe";  // Secondary color
$ui.color3 = "#c2ddff";  // Accent color

// Page system with automatic loading
cloner($nav.pages, container_z, {
  widget(loader, {
    source: "skin://pages/" + $self.model.type + ".view";
  });
});

// Volume overlay with mute indicator
// Notification system
// Loading indicators
```

### theme.view

Macro definitions for consistent UI patterns:

- **ListItemBevel()**: Subtle shadow effect for list items
- **ListItemHighlight()**: Hover/focus highlighting
- **BackButton(ENABLED, EVENT)**: Consistent back navigation
- **PageHeader(TITLE)**: Standardized page headers

**Advanced template adds:**
- **GridItemBevel()**: Grid item shadows
- **GridItemHighlight()**: Grid focus effects
- **ScrollBar(TARGET)**: Scrollbar component
- **SearchBar(URLPREFIX)**: Search interface
- **SIDEBAR_ACTION()**: Sidebar navigation items
- **OSD_SETTINGS_MENU()**: Settings page layout

### background.view

Simple gradient background with optional image support:

```view
widget(container_z, {
  widget(quad, {
    color: 0.05;
  });
  
  // Optional: Add pattern or image
  // widget(image, {
  //   source: "skin://images/background.png";
  //   alpha: 0.1;
  // });
});
```

### loading.view

Loading screen with spinner and text:

```view
widget(container_z, {
  widget(quad, {
    color: 0;
    alpha: 0.7;
  });
  
  widget(container_y, {
    align: center;
    
    widget(icon, {
      source: "dataroot://res/svg/spinner.svg";
      size: 4em;
      color: $ui.color1;
    });
    
    widget(label, {
      caption: _("Loading...");
    });
  });
});
```

### README.md

Each generated skin includes a comprehensive README with:

- Installation instructions for all platforms
- Directory structure overview
- Customization guide
- Color scheme configuration
- Links to documentation resources

## Workflow

### 1. Generate Skin

```bash
# Choose your template type
node tools/generate-skin-template.js my-skin --type=minimal

# Or for advanced
node tools/generate-skin-template.js my-skin --type=advanced
```

### 2. Review Generated Files

```bash
cd generated-skins/my-skin
ls -la
```

Check the structure and review the generated files.

### 3. Customize

**Edit colors in universe.view:**
```view
$ui.color1 = "#ff0000";  // Change to red
$ui.color2 = "#cc0000";
$ui.color3 = "#ffcccc";
```

**Add custom macros in theme.view:**
```view
#define MyCustomButton(CAPTION) {
  widget(container_z, {
    height: 2em;
    ListItemBevel();
    ListItemHighlight();
    focusable: true;
    
    widget(label, {
      caption: CAPTION;
      align: center;
    });
  });
}
```

**Create new pages:**
```bash
# Create a new page type
touch pages/settings.view
```

### 4. Test in Movian

**Copy to Movian skins directory:**

```bash
# Linux
cp -r my-skin ~/.hts/movian/skins/

# macOS
cp -r my-skin ~/Library/Application\ Support/Movian/skins/

# Windows (PowerShell)
Copy-Item -Recurse my-skin $env:APPDATA\Movian\skins\
```

**Restart Movian and select your skin:**
1. Open Movian
2. Go to Settings → User Interface → Skin
3. Select your skin from the list
4. Restart Movian if necessary

### 5. Iterate

Make changes to your skin files and reload in Movian to see the results. Movian may require a restart to pick up changes to certain files like `universe.view`.

## Customization Guide

### Changing Colors

Edit the color variables in `universe.view`:

```view
// Warm color scheme
$ui.color1 = "#ff6b35";  // Orange
$ui.color2 = "#f7931e";  // Amber
$ui.color3 = "#ffd700";  // Gold

// Cool color scheme
$ui.color1 = "#00bcd4";  // Cyan
$ui.color2 = "#0097a7";  // Dark cyan
$ui.color3 = "#b2ebf2";  // Light cyan

// Dark theme
$ui.color1 = "#bb86fc";  // Purple
$ui.color2 = "#3700b3";  // Dark purple
$ui.color3 = "#cf6679";  // Pink
```

### Adding Custom Macros

Define new macros in `theme.view`:

```view
// Custom card component
#define Card(CONTENT) {
  widget(container_z, {
    widget(quad, {
      color: 0.1;
      alpha: 0.8;
    });
    
    widget(border, {
      color: $ui.color1;
      border: 2;
    });
    
    widget(container_y, {
      padding: [1em, 1em];
      CONTENT;
    });
  });
}

// Usage in pages
Card({
  widget(label, {
    caption: "This is a card";
  });
});
```

### Creating New Pages

Create a new file in `pages/` directory:

```view
// pages/settings.view
#import "skin://theme.view"

widget(container_y, {
  style: "PageContainer";
  
  PageHeader(_("Settings"));
  
  widget(list_y, {
    padding: [2em, 2em];
    
    // Settings items here
    widget(container_z, {
      height: 3em;
      ListItemBevel();
      ListItemHighlight();
      focusable: true;
      
      widget(label, {
        padding: [1em, 0];
        caption: _("General Settings");
      });
    });
  });
});
```

### Adding Images and Icons

Create an `images/` directory and reference images:

```view
widget(image, {
  source: "skin://images/logo.png";
  width: 10em;
  height: 10em;
});
```

### Customizing Animations

Adjust animation speeds using the `iir()` function:

```view
// Slower fade
alpha: iir($condition, 2);  // Slower (higher number = slower)

// Faster fade
alpha: iir($condition, 8);  // Faster (lower number = faster)
```

## Troubleshooting

### Generator Issues

**Error: Node.js not found**
```bash
# Install Node.js from https://nodejs.org/
# Or use package manager:
# Ubuntu/Debian
sudo apt install nodejs

# macOS
brew install node

# Windows
# Download installer from nodejs.org
```

**Error: Directory already exists**
```bash
# Remove existing directory
rm -rf generated-skins/my-skin

# Or choose a different name
node tools/generate-skin-template.js my-skin-v2
```

**Error: Invalid skin name**
```bash
# Use only letters, numbers, hyphens, and underscores
node tools/generate-skin-template.js my_custom_skin  # ✓ Valid
node tools/generate-skin-template.js my-custom-skin  # ✓ Valid
node tools/generate-skin-template.js "my skin"       # ✗ Invalid (spaces)
node tools/generate-skin-template.js my.skin         # ✗ Invalid (dots)
```

### Skin Installation Issues

**Skin not appearing in Movian**
1. Verify the skin is in the correct directory
2. Check that `universe.view` exists in the skin root
3. Restart Movian completely
4. Check Movian logs for errors

**Skin loads but appears broken**
1. Check for syntax errors in view files
2. Verify all referenced files exist
3. Check that macro imports are correct
4. Review Movian logs for specific errors

**Colors not applying**
1. Verify hex color format: `#RRGGBB`
2. Check that colors are defined before use
3. Ensure color variables use `$ui.color1` format

## Advanced Usage

### Batch Generation

Generate multiple skins with different color schemes:

```bash
#!/bin/bash
# generate-color-variants.sh

colors=(
  "red:#ff0000:#cc0000:#ffcccc"
  "blue:#0000ff:#0000cc:#ccccff"
  "green:#00ff00:#00cc00:#ccffcc"
)

for color in "${colors[@]}"; do
  IFS=':' read -r name primary secondary accent <<< "$color"
  node tools/generate-skin-template.js "my-skin-$name" \
    --color-primary="$primary" \
    --color-secondary="$secondary" \
    --color-accent="$accent"
done
```

### Custom Template Modifications

Modify the generator script to add your own templates:

```javascript
// In generate-skin-template.js

// Add custom macro
function generateCustomMacro() {
  return `
#define MyMacro(PARAM) {
  // Your custom macro code
}
`;
}

// Append to theme.view generation
function generateThemeView(skinName) {
  return baseTheme + generateCustomMacro();
}
```

### Integration with Build Systems

Use the generator in automated workflows:

```javascript
// package.json
{
  "scripts": {
    "generate-skin": "node tools/generate-skin-template.js",
    "build-skin": "npm run generate-skin my-skin && npm run copy-assets"
  }
}
```

## Best Practices

### Naming Conventions

- Use lowercase with hyphens: `my-custom-skin`
- Be descriptive: `dark-blue-minimal` instead of `skin1`
- Avoid special characters and spaces
- Keep names short but meaningful

### File Organization

- Keep related components together
- Use subdirectories for organization (pages/, popups/, osd/)
- Name files descriptively: `video.view` not `v.view`
- Group similar macros in theme.view

### Color Schemes

- Define all colors in universe.view
- Use semantic naming: `$ui.color1` (primary), `$ui.color2` (secondary)
- Test colors on different displays
- Consider accessibility (contrast ratios)

### Testing

- Test on target devices (TV, desktop, mobile)
- Verify all page types load correctly
- Check navigation flow
- Test with different content types
- Verify popup dialogs work

### Documentation

- Update README.md with customizations
- Document custom macros
- Note any dependencies or requirements
- Include screenshots if sharing

## Examples

### Example 1: Minimal Red Theme

```bash
node tools/generate-skin-template.js red-minimal \
  --type=minimal \
  --color-primary=#ff0000 \
  --color-secondary=#cc0000 \
  --color-accent=#ffcccc
```

### Example 2: Advanced Dark Theme

```bash
node tools/generate-skin-template.js dark-advanced \
  --type=advanced \
  --color-primary=#bb86fc \
  --color-secondary=#3700b3 \
  --color-accent=#cf6679
```

### Example 3: Custom Output Directory

```bash
node tools/generate-skin-template.js my-skin \
  --output=/path/to/movian/skins/
```

## Resources

- [Movian Skin Architecture](../ui/theming/skin-architecture.md)
- [Macro System Reference](../ui/theming/macro-reference.md)
- [View File Syntax](../ui/view-files/syntax-reference.md)
- [Minimal Skin Guide](../ui/theming/minimal-skin-guide.md)
- [Advanced Skin Guide](../ui/theming/advanced-skin-guide.md)

## Contributing

To improve the generator:

1. Fork the movian-docs repository
2. Modify `tools/generate-skin-template.js`
3. Test your changes
4. Submit a pull request

Suggestions for improvements:
- Additional template types
- More customization options
- Better error handling
- Interactive mode with prompts
- Template validation

## License

The skin template generator is part of the Movian documentation project and is provided as-is for use with Movian.
