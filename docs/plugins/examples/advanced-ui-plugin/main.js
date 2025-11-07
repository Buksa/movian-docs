/**
 * Advanced UI Plugin Example for Movian
 * 
 * Demonstrates advanced UI patterns and custom interface elements including:
 * - Custom view files and layouts
 * - Advanced UI components and widgets
 * - Animation and transition effects
 * - Interactive elements and event handling
 * - Custom themes and styling
 * - Property binding and data flow
 * 
 * Compatible with Movian 5.0+
 */

// Import required Movian modules
var page = require('movian/page');
var service = require('movian/service');
var prop = require('movian/prop');
var settings = require('movian/settings');
var store = require('movian/store');

// Plugin configuration
var PLUGIN_PREFIX = 'advanced-ui-plugin';

// Initialize persistent storage
var storage = store.create('advanced-ui-plugin-data');

// Create main service entry
service.create("Advanced UI Demo", PLUGIN_PREFIX + ":start", "other", true, "logo.png");

// Plugin settings for UI customization
settings.globalSettings(PLUGIN_PREFIX, "Advanced UI Plugin", "logo.png", "UI Customization");

settings.createDivider("Theme Options");

settings.createMultiOpt("theme", "UI Theme", [
    ["default", "Default Theme"],
    ["dark", "Dark Theme"],
    ["light", "Light Theme"],
    ["custom", "Custom Theme"]
], "default", function(value) {
    console.log("Theme changed to: " + value);
    storage.theme = value;
});

settings.createBool("enableAnimations", "Enable Animations", true, function(value) {
    console.log("Animations " + (value ? "enabled" : "disabled"));
    storage.animationsEnabled = value;
});

settings.createBool("enableTransitions", "Enable Transitions", true, function(value) {
    console.log("Transitions " + (value ? "enabled" : "disabled"));
    storage.transitionsEnabled = value;
});

settings.createDivider("Layout Options");

settings.createMultiOpt("layoutStyle", "Layout Style", [
    ["grid", "Grid Layout"],
    ["list", "List Layout"],
    ["card", "Card Layout"],
    ["mosaic", "Mosaic Layout"]
], "grid", function(value) {
    console.log("Layout style: " + value);
    storage.layoutStyle = value;
});

settings.createInt("itemSpacing", "Item Spacing", 10, 0, 50, 5, "px", function(value) {
    console.log("Item spacing: " + value + "px");
    storage.itemSpacing = value;
});

settings.createBool("showItemDetails", "Show Item Details", true, function(value) {
    console.log("Item details " + (value ? "shown" : "hidden"));
    storage.showItemDetails = value;
});

// Global properties for UI state management
var uiState = {
    currentView: prop.createRoot(),
    selectedItem: prop.createRoot(),
    animationState: prop.createRoot(),
    themeData: prop.createRoot()
};

// Initialize UI state
uiState.currentView.value = "main";
uiState.selectedItem.value = null;
uiState.animationState.value = "idle";
uiState.themeData.value = {
    primaryColor: "#0066cc",
    secondaryColor: "#cc6600", 
    backgroundColor: "#000000",
    textColor: "#ffffff"
};

// Theme management
function getThemeData(themeName) {
    var themes = {
        default: {
            primaryColor: "#0066cc",
            secondaryColor: "#cc6600",
            backgroundColor: "#000000",
            textColor: "#ffffff",
            accentColor: "#00cc66"
        },
        dark: {
            primaryColor: "#333333",
            secondaryColor: "#666666",
            backgroundColor: "#111111",
            textColor: "#eeeeee",
            accentColor: "#0099ff"
        },
        light: {
            primaryColor: "#ffffff",
            secondaryColor: "#f0f0f0",
            backgroundColor: "#fafafa",
            textColor: "#333333",
            accentColor: "#007acc"
        },
        custom: {
            primaryColor: "#8e44ad",
            secondaryColor: "#e74c3c",
            backgroundColor: "#2c3e50",
            textColor: "#ecf0f1",
            accentColor: "#f39c12"
        }
    };
    
    return themes[themeName] || themes.default;
}

// Update theme when settings change
function updateTheme() {
    var themeName = storage.theme || "default";
    var themeData = getThemeData(themeName);
    uiState.themeData.value = themeData;
    console.log("Theme updated to: " + themeName);
}

// Animation helpers
function createFadeAnimation(element, duration, fromAlpha, toAlpha) {
    if (!storage.animationsEnabled) return;
    
    return {
        type: "fade",
        element: element,
        duration: duration || 500,
        from: fromAlpha || 0,
        to: toAlpha || 1
    };
}

function createSlideAnimation(element, duration, direction) {
    if (!storage.animationsEnabled) return;
    
    return {
        type: "slide",
        element: element,
        duration: duration || 300,
        direction: direction || "left"
    };
}

// Custom UI components data
var demoItems = [
    {
        id: 1,
        title: "Interactive Card Demo",
        description: "Demonstrates interactive card components with hover effects and animations",
        type: "demo",
        category: "Interactive",
        rating: 4.5,
        year: 2024,
        thumbnail: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Card+Demo",
        metadata: {
            duration: "5 min",
            difficulty: "Intermediate",
            features: ["Hover Effects", "Animations", "Click Handlers"]
        }
    },
    {
        id: 2,
        title: "Advanced List View",
        description: "Shows advanced list layouts with custom item renderers and sorting",
        type: "demo",
        category: "Layout",
        rating: 4.8,
        year: 2024,
        thumbnail: "https://via.placeholder.com/300x200/cc6600/ffffff?text=List+Demo",
        metadata: {
            duration: "3 min",
            difficulty: "Advanced",
            features: ["Custom Renderers", "Sorting", "Filtering"]
        }
    },
    {
        id: 3,
        title: "Animation Showcase",
        description: "Comprehensive animation examples including transitions and effects",
        type: "demo",
        category: "Animation",
        rating: 4.7,
        year: 2024,
        thumbnail: "https://via.placeholder.com/300x200/00cc66/ffffff?text=Animation",
        metadata: {
            duration: "7 min",
            difficulty: "Advanced",
            features: ["Transitions", "Keyframes", "Easing"]
        }
    },
    {
        id: 4,
        title: "Custom Controls",
        description: "Custom UI controls including sliders, toggles, and input fields",
        type: "demo",
        category: "Controls",
        rating: 4.6,
        year: 2024,
        thumbnail: "https://via.placeholder.com/300x200/cc0066/ffffff?text=Controls",
        metadata: {
            duration: "4 min",
            difficulty: "Intermediate",
            features: ["Sliders", "Toggles", "Input Fields"]
        }
    },
    {
        id: 5,
        title: "Data Visualization",
        description: "Charts, graphs, and data visualization components",
        type: "demo",
        category: "Visualization",
        rating: 4.9,
        year: 2024,
        thumbnail: "https://via.placeholder.com/300x200/6600cc/ffffff?text=Charts",
        metadata: {
            duration: "6 min",
            difficulty: "Advanced",
            features: ["Charts", "Graphs", "Real-time Data"]
        }
    },
    {
        id: 6,
        title: "Responsive Layout",
        description: "Responsive design patterns that adapt to different screen sizes",
        type: "demo",
        category: "Layout",
        rating: 4.4,
        year: 2024,
        thumbnail: "https://via.placeholder.com/300x200/cc6666/ffffff?text=Responsive",
        metadata: {
            duration: "5 min",
            difficulty: "Intermediate",
            features: ["Responsive", "Adaptive", "Breakpoints"]
        }
    }
];

// Main page route with custom view
new page.Route(PLUGIN_PREFIX + ':start', function(page) {
    page.type = "directory";
    page.metadata.title = "Advanced UI Demo";
    page.metadata.logo = "logo.png";
    
    // Set custom view file if available
    try {
        page.metadata.glwview = Plugin.path + "views/main.view";
    } catch (e) {
        console.log("Custom view not available, using default");
    }
    
    // Update theme
    updateTheme();
    
    // Bind UI state properties to page
    page.metadata.uiState = uiState;
    page.metadata.theme = uiState.themeData.value;
    page.metadata.animationsEnabled = storage.animationsEnabled;
    page.metadata.layoutStyle = storage.layoutStyle || "grid";
    
    // Navigation sections
    page.appendItem(PLUGIN_PREFIX + ":components", "directory", {
        title: "🧩 UI Components",
        description: "Explore various UI components and widgets",
        icon: "dataroot://resources/svg/Grid.svg",
        metadata: {
            section: "components",
            color: uiState.themeData.value.primaryColor
        }
    });
    
    page.appendItem(PLUGIN_PREFIX + ":layouts", "directory", {
        title: "📐 Layout Examples",
        description: "Different layout patterns and responsive designs",
        icon: "dataroot://resources/svg/Layout.svg",
        metadata: {
            section: "layouts",
            color: uiState.themeData.value.secondaryColor
        }
    });
    
    page.appendItem(PLUGIN_PREFIX + ":animations", "directory", {
        title: "✨ Animations",
        description: "Animation and transition demonstrations",
        icon: "dataroot://resources/svg/Animation.svg",
        metadata: {
            section: "animations",
            color: uiState.themeData.value.accentColor
        }
    });
    
    page.appendItem(PLUGIN_PREFIX + ":interactive", "directory", {
        title: "🎮 Interactive Elements",
        description: "Interactive components and event handling",
        icon: "dataroot://resources/svg/Touch.svg",
        metadata: {
            section: "interactive",
            color: "#e74c3c"
        }
    });
    
    page.appendItem(PLUGIN_PREFIX + ":themes", "directory", {
        title: "🎨 Theme Gallery",
        description: "Theme customization and styling examples",
        icon: "dataroot://resources/svg/Palette.svg",
        metadata: {
            section: "themes",
            color: "#9b59b6"
        }
    });
    
    page.appendItem(PLUGIN_PREFIX + ":showcase", "directory", {
        title: "🏆 Showcase",
        description: "Complete examples combining multiple UI concepts",
        icon: "dataroot://resources/svg/Star.svg",
        metadata: {
            section: "showcase",
            color: "#f39c12"
        }
    });
    
    page.loading = false;
});

// UI Components section
new page.Route(PLUGIN_PREFIX + ':components', function(page) {
    page.type = "directory";
    page.metadata.title = "UI Components";
    
    try {
        page.metadata.glwview = Plugin.path + "views/components.view";
    } catch (e) {
        console.log("Components view not available");
    }
    
    // Component categories
    var components = [
        {
            name: "Buttons & Controls",
            description: "Various button styles and interactive controls",
            route: PLUGIN_PREFIX + ":components:buttons",
            icon: "dataroot://resources/svg/Button.svg"
        },
        {
            name: "Cards & Panels",
            description: "Card layouts and information panels",
            route: PLUGIN_PREFIX + ":components:cards",
            icon: "dataroot://resources/svg/Card.svg"
        },
        {
            name: "Lists & Grids",
            description: "Advanced list and grid components",
            route: PLUGIN_PREFIX + ":components:lists",
            icon: "dataroot://resources/svg/List.svg"
        },
        {
            name: "Navigation",
            description: "Navigation components and breadcrumbs",
            route: PLUGIN_PREFIX + ":components:navigation",
            icon: "dataroot://resources/svg/Navigation.svg"
        },
        {
            name: "Media Elements",
            description: "Video players, image galleries, and media controls",
            route: PLUGIN_PREFIX + ":components:media",
            icon: "dataroot://resources/svg/Media.svg"
        },
        {
            name: "Data Display",
            description: "Charts, tables, and data visualization",
            route: PLUGIN_PREFIX + ":components:data",
            icon: "dataroot://resources/svg/Chart.svg"
        }
    ];
    
    components.forEach(function(component) {
        page.appendItem(component.route, "directory", {
            title: component.name,
            description: component.description,
            icon: component.icon,
            metadata: {
                componentType: component.name.toLowerCase().replace(/\s+/g, '_'),
                theme: uiState.themeData.value
            }
        });
    });
    
    page.loading = false;
});

// Layout Examples section
new page.Route(PLUGIN_PREFIX + ':layouts', function(page) {
    page.type = "directory";
    page.metadata.title = "Layout Examples";
    
    try {
        page.metadata.glwview = Plugin.path + "views/layouts.view";
    } catch (e) {
        console.log("Layouts view not available");
    }
    
    var layouts = [
        {
            name: "Grid Layouts",
            description: "Responsive grid systems and masonry layouts",
            items: 12,
            style: "grid"
        },
        {
            name: "Flexbox Layouts", 
            description: "Flexible box layouts with dynamic sizing",
            items: 8,
            style: "flex"
        },
        {
            name: "Card Layouts",
            description: "Card-based layouts with various arrangements",
            items: 15,
            style: "cards"
        },
        {
            name: "List Layouts",
            description: "Advanced list layouts with custom renderers",
            items: 20,
            style: "list"
        }
    ];
    
    layouts.forEach(function(layout, index) {
        page.appendItem(PLUGIN_PREFIX + ":layout:" + layout.style, "directory", {
            title: layout.name,
            description: layout.description + " (" + layout.items + " items)",
            icon: "dataroot://resources/svg/Layout.svg",
            metadata: {
                layoutStyle: layout.style,
                itemCount: layout.items,
                index: index
            }
        });
    });
    
    page.loading = false;
});

// Animations section
new page.Route(PLUGIN_PREFIX + ':animations', function(page) {
    page.type = "directory";
    page.metadata.title = "Animations & Transitions";
    
    if (!storage.animationsEnabled) {
        page.appendItem("", "info", {
            title: "Animations Disabled",
            description: "Enable animations in plugin settings to see examples"
        });
    }
    
    var animations = [
        {
            name: "Fade Transitions",
            description: "Smooth fade in/out effects",
            type: "fade"
        },
        {
            name: "Slide Animations",
            description: "Sliding transitions and movements",
            type: "slide"
        },
        {
            name: "Scale Effects",
            description: "Zoom and scale transformations",
            type: "scale"
        },
        {
            name: "Rotation Effects",
            description: "Rotation and spin animations",
            type: "rotate"
        },
        {
            name: "Complex Sequences",
            description: "Multi-step animation sequences",
            type: "sequence"
        }
    ];
    
    animations.forEach(function(animation) {
        page.appendItem(PLUGIN_PREFIX + ":animation:" + animation.type, "directory", {
            title: animation.name,
            description: animation.description,
            icon: "dataroot://resources/svg/Animation.svg",
            metadata: {
                animationType: animation.type,
                enabled: storage.animationsEnabled
            }
        });
    });
    
    page.loading = false;
});

// Interactive Elements section
new page.Route(PLUGIN_PREFIX + ':interactive', function(page) {
    page.type = "directory";
    page.metadata.title = "Interactive Elements";
    
    // Interactive demo items
    var interactiveItems = [
        {
            title: "Button Interactions",
            description: "Various button states and click handlers",
            type: "buttons"
        },
        {
            title: "Form Controls",
            description: "Input fields, sliders, and form elements",
            type: "forms"
        },
        {
            title: "Drag & Drop",
            description: "Draggable elements and drop zones",
            type: "dragdrop"
        },
        {
            title: "Gesture Handling",
            description: "Touch gestures and multi-touch support",
            type: "gestures"
        },
        {
            title: "Keyboard Navigation",
            description: "Keyboard shortcuts and focus management",
            type: "keyboard"
        }
    ];
    
    interactiveItems.forEach(function(item) {
        page.appendItem(PLUGIN_PREFIX + ":interactive:" + item.type, "directory", {
            title: item.title,
            description: item.description,
            icon: "dataroot://resources/svg/Touch.svg",
            metadata: {
                interactionType: item.type
            }
        });
    });
    
    page.loading = false;
});

// Theme Gallery section
new page.Route(PLUGIN_PREFIX + ':themes', function(page) {
    page.type = "directory";
    page.metadata.title = "Theme Gallery";
    
    var themes = ["default", "dark", "light", "custom"];
    
    themes.forEach(function(themeName) {
        var themeData = getThemeData(themeName);
        var isActive = (storage.theme || "default") === themeName;
        
        page.appendItem(PLUGIN_PREFIX + ":theme:" + themeName, "directory", {
            title: themeName.charAt(0).toUpperCase() + themeName.slice(1) + " Theme" + (isActive ? " (Active)" : ""),
            description: "Preview and apply the " + themeName + " theme",
            icon: "dataroot://resources/svg/Palette.svg",
            metadata: {
                theme: themeData,
                themeName: themeName,
                isActive: isActive
            }
        });
    });
    
    page.loading = false;
});

// Showcase section with complete examples
new page.Route(PLUGIN_PREFIX + ':showcase', function(page) {
    page.type = "directory";
    page.metadata.title = "UI Showcase";
    
    try {
        page.metadata.glwview = Plugin.path + "views/showcase.view";
    } catch (e) {
        console.log("Showcase view not available");
    }
    
    // Use the demo items with enhanced presentation
    demoItems.forEach(function(item) {
        var layoutStyle = storage.layoutStyle || "grid";
        
        page.appendItem(PLUGIN_PREFIX + ":demo:" + item.id, "directory", {
            title: item.title,
            description: item.description,
            icon: item.thumbnail,
            year: item.year,
            rating: item.rating * 20, // Convert to 0-100 scale
            genre: item.category,
            metadata: {
                item: item,
                layoutStyle: layoutStyle,
                theme: uiState.themeData.value,
                showDetails: storage.showItemDetails
            }
        });
    });
    
    page.loading = false;
});

// Individual demo item pages
new page.Route(PLUGIN_PREFIX + ':demo:(\\d+)', function(page, itemId) {
    var item = demoItems.find(function(i) { return i.id == itemId; });
    
    if (!item) {
        page.error("Demo item not found");
        return;
    }
    
    page.type = "directory";
    page.metadata.title = item.title;
    page.metadata.icon = item.thumbnail;
    
    try {
        page.metadata.glwview = Plugin.path + "views/demo-item.view";
    } catch (e) {
        console.log("Demo item view not available");
    }
    
    // Set selected item in UI state
    uiState.selectedItem.value = item;
    
    // Item details
    page.appendItem("", "separator", {
        title: "Demo Information"
    });
    
    page.appendItem("", "info", {
        title: "Category: " + item.category,
        description: "Rating: " + item.rating + "/5 | Duration: " + item.metadata.duration + " | Difficulty: " + item.metadata.difficulty
    });
    
    page.appendItem("", "info", {
        title: "Features",
        description: item.metadata.features.join(", ")
    });
    
    // Interactive elements based on demo type
    page.appendItem("", "separator", {
        title: "Interactive Demo"
    });
    
    if (item.category === "Interactive") {
        page.appendItem(PLUGIN_PREFIX + ":demo:" + itemId + ":interact", "directory", {
            title: "🎮 Try Interactive Features",
            description: "Experience the interactive elements",
            icon: "dataroot://resources/svg/Touch.svg"
        });
    }
    
    if (item.category === "Animation") {
        page.appendItem(PLUGIN_PREFIX + ":demo:" + itemId + ":animate", "directory", {
            title: "✨ View Animations",
            description: "See the animation effects in action",
            icon: "dataroot://resources/svg/Animation.svg"
        });
    }
    
    if (item.category === "Layout") {
        page.appendItem(PLUGIN_PREFIX + ":demo:" + itemId + ":layout", "directory", {
            title: "📐 Explore Layout",
            description: "Examine the layout structure",
            icon: "dataroot://resources/svg/Layout.svg"
        });
    }
    
    // Source code view (simulated)
    page.appendItem(PLUGIN_PREFIX + ":demo:" + itemId + ":source", "directory", {
        title: "📄 View Source",
        description: "Examine the implementation code",
        icon: "dataroot://resources/svg/Code.svg"
    });
    
    page.loading = false;
});

// Layout demonstration routes
new page.Route(PLUGIN_PREFIX + ':layout:(.*)', function(page, layoutType) {
    page.type = "directory";
    page.metadata.title = layoutType.charAt(0).toUpperCase() + layoutType.slice(1) + " Layout";
    
    try {
        page.metadata.glwview = Plugin.path + "views/layout-" + layoutType + ".view";
    } catch (e) {
        console.log("Layout view not available for: " + layoutType);
    }
    
    // Generate items based on layout type
    var itemCount = layoutType === "list" ? 20 : layoutType === "cards" ? 15 : 12;
    
    for (var i = 1; i <= itemCount; i++) {
        var itemTitle = layoutType.charAt(0).toUpperCase() + layoutType.slice(1) + " Item " + i;
        var itemDesc = "This is a demo item for the " + layoutType + " layout style";
        
        page.appendItem("", "directory", {
            title: itemTitle,
            description: itemDesc,
            icon: "https://via.placeholder.com/200x150/" + 
                  ["0066cc", "cc6600", "00cc66", "cc0066", "6600cc"][i % 5] + 
                  "/ffffff?text=Item+" + i,
            metadata: {
                layoutType: layoutType,
                itemIndex: i,
                theme: uiState.themeData.value
            }
        });
    }
    
    page.loading = false;
});

// Theme preview routes
new page.Route(PLUGIN_PREFIX + ':theme:(.*)', function(page, themeName) {
    page.type = "directory";
    page.metadata.title = themeName.charAt(0).toUpperCase() + themeName.slice(1) + " Theme Preview";
    
    var themeData = getThemeData(themeName);
    
    // Temporarily apply theme for preview
    page.metadata.theme = themeData;
    
    try {
        page.metadata.glwview = Plugin.path + "views/theme-preview.view";
    } catch (e) {
        console.log("Theme preview view not available");
    }
    
    // Theme information
    page.appendItem("", "separator", {
        title: "Theme Colors"
    });
    
    page.appendItem("", "info", {
        title: "Primary Color",
        description: themeData.primaryColor,
        metadata: { color: themeData.primaryColor }
    });
    
    page.appendItem("", "info", {
        title: "Secondary Color", 
        description: themeData.secondaryColor,
        metadata: { color: themeData.secondaryColor }
    });
    
    page.appendItem("", "info", {
        title: "Accent Color",
        description: themeData.accentColor,
        metadata: { color: themeData.accentColor }
    });
    
    // Sample content with theme applied
    page.appendItem("", "separator", {
        title: "Sample Content"
    });
    
    for (var i = 1; i <= 6; i++) {
        page.appendItem("", "directory", {
            title: "Sample Item " + i,
            description: "This item demonstrates the " + themeName + " theme styling",
            icon: "https://via.placeholder.com/150x150/" + 
                  themeData.primaryColor.substring(1) + "/" + 
                  themeData.textColor.substring(1) + "?text=" + i,
            metadata: {
                theme: themeData,
                sampleItem: true
            }
        });
    }
    
    // Apply theme action
    page.appendItem(PLUGIN_PREFIX + ":apply-theme:" + themeName, "directory", {
        title: "✓ Apply This Theme",
        description: "Set " + themeName + " as the active theme",
        icon: "dataroot://resources/svg/Check.svg"
    });
    
    page.loading = false;
});

// Apply theme route
new page.Route(PLUGIN_PREFIX + ':apply-theme:(.*)', function(page, themeName) {
    // Update settings (this would normally trigger the settings callback)
    storage.theme = themeName;
    updateTheme();
    
    page.type = "directory";
    page.metadata.title = "Theme Applied";
    
    page.appendItem("", "info", {
        title: "✓ Theme Applied Successfully",
        description: "The " + themeName + " theme is now active"
    });
    
    page.appendItem(PLUGIN_PREFIX + ":themes", "directory", {
        title: "← Back to Theme Gallery",
        description: "Return to theme selection",
        icon: "dataroot://resources/svg/Back.svg"
    });
    
    page.loading = false;
});

// Component detail routes
new page.Route(PLUGIN_PREFIX + ':components:(.*)', function(page, componentType) {
    page.type = "directory";
    page.metadata.title = componentType.charAt(0).toUpperCase() + componentType.slice(1) + " Components";
    
    try {
        page.metadata.glwview = Plugin.path + "views/component-" + componentType + ".view";
    } catch (e) {
        console.log("Component view not available for: " + componentType);
    }
    
    // Generate component examples based on type
    var examples = getComponentExamples(componentType);
    
    examples.forEach(function(example, index) {
        page.appendItem(PLUGIN_PREFIX + ":component:" + componentType + ":" + index, "directory", {
            title: example.title,
            description: example.description,
            icon: example.icon || "dataroot://resources/svg/Component.svg",
            metadata: {
                componentType: componentType,
                example: example,
                theme: uiState.themeData.value
            }
        });
    });
    
    page.loading = false;
});

// Helper function to get component examples
function getComponentExamples(componentType) {
    var examples = {
        buttons: [
            { title: "Primary Button", description: "Standard primary action button" },
            { title: "Secondary Button", description: "Secondary action button" },
            { title: "Icon Button", description: "Button with icon and text" },
            { title: "Toggle Button", description: "Button with on/off states" }
        ],
        cards: [
            { title: "Basic Card", description: "Simple card with title and content" },
            { title: "Media Card", description: "Card with image and metadata" },
            { title: "Interactive Card", description: "Card with hover and click effects" },
            { title: "Expandable Card", description: "Card that expands to show more content" }
        ],
        lists: [
            { title: "Simple List", description: "Basic list with text items" },
            { title: "Rich List", description: "List with images and metadata" },
            { title: "Grouped List", description: "List with section headers" },
            { title: "Virtual List", description: "Efficiently rendered large list" }
        ],
        navigation: [
            { title: "Tab Navigation", description: "Horizontal tab navigation" },
            { title: "Breadcrumbs", description: "Hierarchical navigation path" },
            { title: "Sidebar Menu", description: "Collapsible sidebar navigation" },
            { title: "Pagination", description: "Page navigation controls" }
        ],
        media: [
            { title: "Video Player", description: "Custom video player controls" },
            { title: "Image Gallery", description: "Scrollable image gallery" },
            { title: "Audio Player", description: "Audio playback controls" },
            { title: "Media Carousel", description: "Rotating media carousel" }
        ],
        data: [
            { title: "Bar Chart", description: "Vertical bar chart visualization" },
            { title: "Line Graph", description: "Time series line graph" },
            { title: "Pie Chart", description: "Circular pie chart" },
            { title: "Data Table", description: "Sortable data table" }
        ]
    };
    
    return examples[componentType] || [];
}

// Property subscriptions for reactive UI updates
prop.subscribe(uiState.themeData, function(type, value) {
    if (type === 'set') {
        console.log("Theme data updated:", JSON.stringify(value));
    }
});

prop.subscribe(uiState.selectedItem, function(type, value) {
    if (type === 'set' && value) {
        console.log("Selected item:", value.title);
    }
});

// Plugin initialization
console.log("Advanced UI Plugin loaded successfully!");

// Initialize default values
if (storage.theme === undefined) storage.theme = "default";
if (storage.animationsEnabled === undefined) storage.animationsEnabled = true;
if (storage.transitionsEnabled === undefined) storage.transitionsEnabled = true;
if (storage.layoutStyle === undefined) storage.layoutStyle = "grid";
if (storage.itemSpacing === undefined) storage.itemSpacing = 10;
if (storage.showItemDetails === undefined) storage.showItemDetails = true;

// Set initial theme
updateTheme();

console.log("UI State initialized with theme:", storage.theme);
console.log("Animations enabled:", storage.animationsEnabled);
console.log("Layout style:", storage.layoutStyle);