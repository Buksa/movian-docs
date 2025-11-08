#!/usr/bin/env node

/**
 * Movian Skin Template Generator
 * 
 * Generates a new Movian skin with proper universe.view structure
 * based on user preferences (minimal or advanced template).
 * 
 * Usage:
 *   node tools/generate-skin-template.js <skin-name> [--type=minimal|advanced] [--output=path]
 * 
 * Examples:
 *   node tools/generate-skin-template.js my-custom-skin
 *   node tools/generate-skin-template.js my-skin --type=advanced
 *   node tools/generate-skin-template.js my-skin --output=../my-skins/
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }
  
  const skinName = args[0];
  let type = 'minimal';
  let outputPath = './generated-skins';
  let colors = {
    primary: '#4192ff',
    secondary: '#306cbe',
    accent: '#c2ddff'
  };
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--type=')) {
      type = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      outputPath = arg.split('=')[1];
    } else if (arg.startsWith('--color-primary=')) {
      colors.primary = arg.split('=')[1];
    } else if (arg.startsWith('--color-secondary=')) {
      colors.secondary = arg.split('=')[1];
    } else if (arg.startsWith('--color-accent=')) {
      colors.accent = arg.split('=')[1];
    }
  }
  
  if (!['minimal', 'advanced'].includes(type)) {
    console.error(`Error: Invalid type "${type}". Must be "minimal" or "advanced".`);
    process.exit(1);
  }
  
  return { skinName, type, outputPath, colors };
}

function printUsage() {
  console.log(`
Movian Skin Template Generator

Usage:
  node tools/generate-skin-template.js <skin-name> [options]

Arguments:
  <skin-name>              Name of the skin to generate (required)

Options:
  --type=TYPE              Template type: "minimal" or "advanced" (default: minimal)
  --output=PATH            Output directory path (default: ./generated-skins)
  --color-primary=COLOR    Primary color in hex format (default: #4192ff)
  --color-secondary=COLOR  Secondary color in hex format (default: #306cbe)
  --color-accent=COLOR     Accent color in hex format (default: #c2ddff)
  --help, -h               Show this help message

Examples:
  node tools/generate-skin-template.js my-custom-skin
  node tools/generate-skin-template.js my-skin --type=advanced
  node tools/generate-skin-template.js my-skin --output=../my-skins/
  node tools/generate-skin-template.js my-skin --color-primary=#ff0000

Template Types:
  minimal   - Basic skin with essential components (universe.view, theme.view, 
              background, loading, and home page)
  advanced  - Complete skin with OSD, playdecks, popups, and multiple pages
`);
}

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Write file with content
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Created: ${filePath}`);
}

// Generate universe.view content
function generateUniverseView(skinName, colors) {
  return `// ${skinName} - Main Entry Point
// This is the root view file that sets up the entire skin

// Import macro definitions
#import "theme.view"

// Global Configuration
// -------------------

// UI sizing and margins
$ui.sizeOffset = 4;
$ui.xmargin = select($ui.aspect > 1, $ui.width / 100, 0.2em);

// Detect screen orientation
$ui.orientation = select($ui.aspect > 1, "landscape", "portrait");

// Color scheme - customize these for your skin
$ui.color1 = "${colors.primary}";  // Primary color
$ui.color2 = "${colors.secondary}";  // Secondary color
$ui.color3 = "${colors.accent}";  // Accent color

// Global Event Handlers
// ---------------------

// Toggle system info overlay
onEvent(sysinfo, {
  toggle($ui.sysinfo);
});

// Toggle media info overlay
onEvent(mediastats, {
  toggle($ui.mediainfo);
});

// Global Styles
// -------------

// Page container fade effect for layered pages
style(PageContainer, {
  alpha: 1 - iir(clamp(getLayer(), 0, 1), 4) * 0.9;
});

// Text color changes based on navigation focus
style(NavSelectedText, {
  color: select(isNavFocused(), 1, 0.8);
});

// Main Container
// --------------

widget(container_z, {

  // Background layer
  widget(loader, {
    source: "background.view";
  });

  // Loading indicator
  // Shows when current page is loading content
  widget(loader, {
    hidden: iir($nav.currentpage.model.loading, 8) < 0.001;
    zoffset: -999;
    alpha: iir($nav.currentpage.model.loading, 8);
    source: "loading.view";
  });

  // Main content area with underscan (safe area for TV displays)
  widget(underscan, {
    widget(container_z, {

      // Page system layer
      widget(layer, {
        filterConstraintY: true;
        
        // Playfield manages page transitions
        widget(playfield, {
          effect: blend;
          noInitialTransform: true;
          alpha: 1 - iir(clamp(getLayer(), 0, 1), 7) * 0.66;

          // Clone all navigation pages
          cloner($nav.pages, container_z, {
            widget(loader, {
              noInitialTransform: true;
              source: "skin://pages/" + $self.model.type + ".view";
            });
          });
        });

        // Popup system
        cloner($core.popups, loader, {
          source: "popups/" + $self.type + ".view";
        });
      });

      // Bottom area for notifications
      widget(container_y, {
        space(1);
        widget(container_y, {
          delta($ui.universeBottomHeight, getHeight());
          expediteSubscriptions: true;

          // Notifications
          cloner($core.notifications.nodes, container_z, {
            widget(quad, {
              color: 0;
              alpha: 0.6;
            });

            widget(label, {
              padding: [2em, 0.5em];
              caption: $self.text;
            });
          });

          widget(dummy, {
            height: 0;
          });
        });
      });
    });
  });

  // Volume indicator overlay
  widget(container_y, {
    align: bottom;
    spacing: 0.1em;
    padding: [0, 1em];

    widget(container_z, {
      height: 1.3em;

      // Mute indicator
      widget(container_x, {
        alpha: iir($core.audio.mastermute, 7);
        padding: [2em, 0];

        widget(container_z, {
          widget(quad, {
            color: 0;
            alpha: 0.8;
          });
          widget(label, {
            padding: [1em, 0];
            caption: _("Audio muted");
            align: center;
          });
        });
      });

      // Volume level display
      widget(container_x, {
        alpha: iir(changed($core.audio.mastervolume, 2, true), 7);
        align: center;
        
        widget(container_z, {
          width: $ui.width / 2;

          widget(quad, {
            color: 0;
            alpha: 0.8;
          });

          widget(border, {
            color: $ui.color3;
            border: 1;
            margin: -1;
          });

          widget(container_x, {
            padding: 1;
            widget(bar, {
              color1: $ui.color1;
              color2: $ui.color2;
              fill: ($core.audio.mastervolume + 75) / 87;
            });
          });

          widget(label, {
            caption: fmt(_("Master volume: %d dB"), $core.audio.mastervolume);
            align: center;
          });
        });
      });
    });
  });
});
`;
}

// Generate theme.view content
function generateThemeView(skinName) {
  return `// ${skinName} - Macro Definitions
// This file defines reusable UI macros for consistent styling

// ListItemBevel - Adds subtle shadow effect to list items
// Creates a 3D bevel effect with light and dark lines
#define ListItemBevel() {
  widget(container_y, {
    filterConstraintY: true;
    filterConstraintX: true;
    
    // Light line on top
    widget(quad, {
      height: 1;
      alpha: 0.15;
    });
    
    space(1);
    
    // Dark line on bottom
    widget(quad, {
      height: 1;
      color: 0;
      alpha: 0.15;
    });
  });
}

// ListItemHighlight - Highlights list items on hover/focus
// Uses additive blending for a subtle glow effect
#define ListItemHighlight() {
  widget(quad, {
    fhpSpill: true;
    additive: true;
    alpha: 0.1 * isHovered() + 0.2 * isNavFocused();
  });
}

// BackButton - Creates a back navigation button
// Parameters:
//   ENABLED - Whether the button is enabled (default: true)
//   EVENT - Event to trigger on activation (default: back event)
#define BackButton(ENABLED=true, EVENT=event("back")) {
  widget(container_y, {
    align: center;
    width: 4em;
    clickable: $ui.pointerVisible || ($ui.touch && ENABLED);
    alpha: iir($ui.pointerVisible || ($ui.touch && ENABLED), 4);
    onEvent(activate, EVENT);
    navFocusable: false;
    
    widget(icon, {
      color: 0.5 + iir(isHovered(), 4);
      size: 2em;
      source: "dataroot://res/svg/Left.svg";
    });
  });
}

// PageHeader - Creates a standardized page header with title and back button
// Parameters:
//   TITLE - The title text to display
#define PageHeader(TITLE) {
  widget(container_z, {
    height: 3em;
    zoffset: 10;
    
    // Semi-transparent background
    widget(quad, {
      color: 0;
      alpha: 0.2;
    });
    
    // Title text centered
    widget(label, {
      padding: [3em, 0];
      align: center;
      caption: TITLE;
      size: 1.5em;
    });
    
    // Back button (only shown when navigation allows going back)
    widget(container_x, {
      hidden: !$nav.canGoBack;
      BackButton();
      space(1);
    });
  });
}
`;
}

// Generate background.view content
function generateBackgroundView() {
  return `// Background component
// Simple gradient background

widget(container_z, {
  // Gradient background
  widget(quad, {
    color: 0.05;
  });
  
  // Optional: Add pattern or image here
  // widget(image, {
  //   source: "skin://images/background.png";
  //   alpha: 0.1;
  // });
});
`;
}

// Generate loading.view content
function generateLoadingView() {
  return `// Loading screen component
// Displayed while pages are loading content

widget(container_z, {
  // Semi-transparent overlay
  widget(quad, {
    color: 0;
    alpha: 0.7;
  });
  
  // Loading indicator
  widget(container_y, {
    align: center;
    
    widget(icon, {
      source: "dataroot://res/svg/spinner.svg";
      size: 4em;
      color: $ui.color1;
    });
    
    widget(label, {
      caption: _("Loading...");
      size: 1.2em;
      align: center;
    });
  });
});
`;
}

// Generate home page
function generateHomePage() {
  return `// Home page
#import "skin://theme.view"

widget(container_y, {
  style: "PageContainer";
  
  // Page header
  PageHeader(_("Home"));
  
  // Main content area
  widget(container_y, {
    padding: [2em, 2em];
    spacing: 1em;
    
    widget(label, {
      caption: _("Welcome to your custom skin!");
      size: 1.5em;
      align: center;
    });
    
    widget(label, {
      caption: _("This is a basic home page. Customize it to fit your needs.");
      align: center;
    });
  });
});
`;
}

// Generate README
function generateReadme(skinName, type) {
  return `# ${skinName}

A ${type} Movian skin generated using the skin template generator.

## Installation

1. Copy this directory to your Movian skins directory:
   - **Linux**: \`~/.hts/movian/skins/\`
   - **Windows**: \`%APPDATA%\\Movian\\skins\\\`
   - **macOS**: \`~/Library/Application Support/Movian/skins/\`

2. Restart Movian

3. Go to Settings → User Interface → Skin and select "${skinName}"

## Structure

\`\`\`
${skinName}/
├── README.md              # This file
├── universe.view          # Main entry point and global configuration
├── theme.view             # Macro definitions
├── background.view        # Background component
├── loading.view           # Loading screen
└── pages/
    └── home.view          # Home page
${type === 'advanced' ? `    ├── directory.view     # Directory listing page
    └── video.view         # Video playback page
├── popups/
│   ├── message.view       # Message dialog
│   ├── auth.view          # Authentication dialog
│   └── filepicker.view    # File picker dialog
├── playdecks/
│   ├── playdeck_video.view # Video player controls
│   └── playdeck_audio.view # Audio player controls
└── osd/
    ├── osd_main.view      # Main OSD menu
    ├── osd_subs.view      # Subtitle selection
    └── osd_audio.view     # Audio track selection` : ''}
\`\`\`

## Customization

### Colors

Edit the color variables in \`universe.view\`:
\`\`\`view
$ui.color1 = "#4192ff";  // Primary color
$ui.color2 = "#306cbe";  // Secondary color
$ui.color3 = "#c2ddff";  // Accent color
\`\`\`

### Macros

Add or modify macros in \`theme.view\` for reusable UI patterns.

### Pages

Create new page types in the \`pages/\` directory. Pages are automatically loaded based on the page type from the navigation system.

## Resources

- [Movian Documentation](https://github.com/andoma/movian)
- [GLW View Files Guide](../../docs/ui/view-files/)
- [Theming System Guide](../../docs/ui/theming/)

## License

This skin template is provided as-is for use with Movian.
`;
}

// Generate minimal skin
function generateMinimalSkin(skinName, outputPath, colors) {
  const skinPath = path.join(outputPath, skinName);
  
  console.log(`\nGenerating minimal skin: ${skinName}`);
  console.log(`Output path: ${skinPath}\n`);
  
  // Create main files
  writeFile(path.join(skinPath, 'universe.view'), generateUniverseView(skinName, colors));
  writeFile(path.join(skinPath, 'theme.view'), generateThemeView(skinName));
  writeFile(path.join(skinPath, 'background.view'), generateBackgroundView());
  writeFile(path.join(skinPath, 'loading.view'), generateLoadingView());
  writeFile(path.join(skinPath, 'README.md'), generateReadme(skinName, 'minimal'));
  
  // Create pages directory
  writeFile(path.join(skinPath, 'pages', 'home.view'), generateHomePage());
  
  console.log(`\n✓ Minimal skin generated successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review and customize the generated files`);
  console.log(`  2. Copy to Movian skins directory`);
  console.log(`  3. Restart Movian and select your skin\n`);
}

// Generate advanced skin (copies from example)
function generateAdvancedSkin(skinName, outputPath, colors) {
  const skinPath = path.join(outputPath, skinName);
  const examplePath = path.join(__dirname, '..', 'docs', 'ui', 'theming', 'examples', 'advanced-skin');
  
  console.log(`\nGenerating advanced skin: ${skinName}`);
  console.log(`Output path: ${skinPath}\n`);
  
  // Check if example exists
  if (!fs.existsSync(examplePath)) {
    console.error(`Error: Advanced skin example not found at ${examplePath}`);
    console.error(`Please ensure you're running this script from the movian-docs directory.`);
    process.exit(1);
  }
  
  // Copy directory recursively
  function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Replace colors in universe.view
        if (entry.name === 'universe.view') {
          content = content.replace(/#4192ff/g, colors.primary);
          content = content.replace(/#306cbe/g, colors.secondary);
          content = content.replace(/#c2ddff/g, colors.accent);
        }
        
        // Update skin name in comments
        content = content.replace(/Advanced Skin Example/g, skinName);
        content = content.replace(/advanced-skin/g, skinName);
        
        fs.writeFileSync(destPath, content, 'utf8');
        console.log(`  Created: ${destPath}`);
      }
    }
  }
  
  copyDir(examplePath, skinPath);
  
  // Generate custom README
  writeFile(path.join(skinPath, 'README.md'), generateReadme(skinName, 'advanced'));
  
  console.log(`\n✓ Advanced skin generated successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review and customize the generated files`);
  console.log(`  2. Add custom icons and graphics`);
  console.log(`  3. Copy to Movian skins directory`);
  console.log(`  4. Restart Movian and select your skin\n`);
}

// Main function
function main() {
  const { skinName, type, outputPath, colors } = parseArgs();
  
  // Validate skin name
  if (!/^[a-zA-Z0-9_-]+$/.test(skinName)) {
    console.error('Error: Skin name can only contain letters, numbers, hyphens, and underscores.');
    process.exit(1);
  }
  
  // Check if output directory already exists
  const skinPath = path.join(outputPath, skinName);
  if (fs.existsSync(skinPath)) {
    console.error(`Error: Directory "${skinPath}" already exists.`);
    console.error('Please choose a different name or remove the existing directory.');
    process.exit(1);
  }
  
  // Generate skin based on type
  if (type === 'minimal') {
    generateMinimalSkin(skinName, outputPath, colors);
  } else {
    generateAdvancedSkin(skinName, outputPath, colors);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  generateMinimalSkin,
  generateAdvancedSkin,
  parseArgs
};
