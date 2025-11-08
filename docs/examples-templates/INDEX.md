# Movian Examples and Templates - Complete Index

This document provides a comprehensive index of all available examples, templates, and reusable components in the Movian documentation.

## Quick Navigation

- [Project Templates](#project-templates)
- [UI Components](#ui-components)
- [Plugin Examples](#plugin-examples)
- [View File Examples](#view-file-examples)
- [Skin Examples](#skin-examples)

---

## Project Templates

Complete starter templates for rapid development.

### Plugin Templates

| Template | Description | Complexity | Files |
|----------|-------------|------------|-------|
| **basic-plugin** | Minimal plugin structure | Beginner | 3 files |
| **content-provider** | Media content provider with API | Intermediate | 5 files |
| **search-service** | Search integration | Intermediate | Coming Soon |
| **settings-plugin** | Configuration management | Intermediate | Coming Soon |
| **ui-extension** | Custom UI elements | Advanced | Coming Soon |

### Skin Templates

| Template | Description | Complexity | Files |
|----------|-------------|------------|-------|
| **minimal-skin** | Basic skin structure | Beginner | See theming examples |

**Location**: `docs/examples-templates/project-templates/`

---

## UI Components

Reusable view file components organized by category.

### Navigation Components

| Component | File | Description |
|-----------|------|-------------|
| **Sidebar Menu** | `navigation/sidebar-menu.view` | Vertical navigation with icons |
| **Tab Bar** | `navigation/tab-bar.view` | Horizontal tab navigation (Coming Soon) |
| **Breadcrumbs** | `navigation/breadcrumbs.view` | Hierarchical navigation (Coming Soon) |

### Media Controls

| Component | File | Description |
|-----------|------|-------------|
| **Playback Controls** | `media-controls/playback-controls.view` | Complete media player controls |
| **Volume Control** | `media-controls/volume-control.view` | Standalone volume slider (Coming Soon) |
| **Seek Bar** | `media-controls/seek-bar.view` | Progress and seek control (Coming Soon) |

### Lists and Grids

| Component | File | Description |
|-----------|------|-------------|
| **Scrollable List** | `lists-grids/scrollable-list.view` | Vertical list with scrollbar |
| **Grid Layout** | `lists-grids/grid-layout.view` | Multi-column grid (Coming Soon) |
| **Carousel** | `lists-grids/carousel.view` | Horizontal scrolling (Coming Soon) |

### Forms and Inputs

| Component | File | Description |
|-----------|------|-------------|
| **Button Components** | `forms-inputs/button-components.view` | Various button styles |
| **Text Input** | `forms-inputs/text-input.view` | Text field component (Coming Soon) |
| **Slider** | `forms-inputs/slider.view` | Numeric value slider (Coming Soon) |
| **Checkbox** | `forms-inputs/checkbox.view` | Toggle checkbox (Coming Soon) |

### Dialogs and Popups

| Component | File | Description |
|-----------|------|-------------|
| **Modal Dialog** | `dialogs-popups/modal-dialog.view` | Alert, confirm, input dialogs |
| **Loading Overlay** | `dialogs-popups/loading-overlay.view` | Loading indicator (Coming Soon) |
| **Toast Notification** | `dialogs-popups/toast.view` | Temporary messages (Coming Soon) |

### Animations

| Component | File | Description |
|-----------|------|-------------|
| **Fade Transitions** | `animations/fade.view` | Opacity animations (Coming Soon) |
| **Slide Transitions** | `animations/slide.view` | Position animations (Coming Soon) |
| **Scale Transitions** | `animations/scale.view` | Size animations (Coming Soon) |

**Location**: `docs/examples-templates/ui-components/`

---

## Plugin Examples

Working plugin examples from the documentation.

| Example | Description | Features | Location |
|---------|-------------|----------|----------|
| **hello-world** | Minimal plugin | Basic structure | `docs/plugins/examples/hello-world/` |
| **content-provider** | Media provider | HTTP, parsing, pagination | `docs/plugins/examples/content-provider/` |
| **search-plugin** | Search service | Search integration | `docs/plugins/examples/search-plugin/` |
| **configurable-plugin** | Settings demo | Configuration UI | `docs/plugins/examples/configurable-plugin/` |
| **advanced-ui-plugin** | Custom UI | View files, theming | `docs/plugins/examples/advanced-ui-plugin/` |

**Location**: `docs/plugins/examples/`

---

## View File Examples

Standalone view file examples demonstrating UI concepts.

| Example | Description | Concepts | Location |
|---------|-------------|----------|----------|
| **basic-layout.view** | Simple layouts | Containers, spacing | `docs/ui/examples/` |
| **containers.view** | Container types | container_x, container_y, container_z | `docs/ui/examples/` |
| **text-and-images.view** | Content display | Labels, images, icons | `docs/ui/examples/` |
| **lists-and-grids.view** | Data presentation | Lists, grids, cloners | `docs/ui/examples/` |
| **interactive-elements.view** | User interaction | Focus, events, navigation | `docs/ui/examples/` |
| **animations.view** | Transitions | iir(), alpha, scaling | `docs/ui/examples/` |

**Location**: `docs/ui/examples/`

---

## Skin Examples

Complete skin implementations.

### Minimal Skin

**Location**: `docs/ui/theming/examples/minimal-skin/`

**Structure**:
```
minimal-skin/
├── universe.view       # Root entry point
├── theme.view         # Macro definitions
├── background.view    # Background component
├── loading.view       # Loading screen
├── pages/            # Page templates
│   ├── directory.view
│   └── video.view
└── README.md
```

**Features**:
- Essential macros (ListItemBevel, PageHeader, BackButton)
- Basic page templates
- Simple navigation
- Clean, minimal design

### Advanced Skin

**Location**: `docs/ui/theming/examples/advanced-skin/`

**Structure**:
```
advanced-skin/
├── universe.view       # Root with full system integration
├── theme.view         # Complete macro library
├── background.view
├── loading.view
├── components/        # Reusable components
│   └── sidebar.view
├── pages/            # All page types
├── osd/              # On-screen display
│   └── osd_subs.view
├── playdecks/        # Media player UI
│   ├── playdeck_video.view
│   └── playdeck_audio.view
├── popups/           # Modal dialogs
│   ├── auth.view
│   ├── message.view
│   └── filepicker.view
└── README.md
```

**Features**:
- Complete macro system (11 macros)
- OSD integration
- Media player UI
- Popup system
- Notification system
- Full navigation

---

## Usage Patterns

### Using Project Templates

1. **Copy template**:
   ```bash
   cp -r docs/examples-templates/project-templates/basic-plugin/ ~/my-plugin/
   ```

2. **Customize**:
   - Edit `plugin.json`
   - Modify `main.js`
   - Add functionality

3. **Install**:
   ```bash
   cp -r ~/my-plugin/ ~/.movian/plugins/
   ```

### Using UI Components

1. **Copy component code**:
   ```bash
   cp docs/examples-templates/ui-components/navigation/sidebar-menu.view \
      my-skin/components/
   ```

2. **Import in view file**:
   ```view
   #import "components/sidebar-menu.view"
   
   SidebarMenu();
   ```

3. **Customize parameters**:
   ```view
   SidebarMenuItem("icon.svg", "Label", navOpen("page:url"));
   ```

### Using Plugin Examples

1. **Study example**:
   ```bash
   cd docs/plugins/examples/content-provider/
   cat README.md
   ```

2. **Copy patterns**:
   - HTTP request handling
   - Response parsing
   - Page routing
   - Error handling

3. **Adapt to your needs**:
   - Change API endpoints
   - Modify data parsing
   - Customize UI

---

## Validation

All templates and components are validated using automated scripts.

### Validate Templates

```bash
cd docs/examples-templates/
node validate-templates.js
```

### Validate Plugins

```bash
cd docs/tests/
npm test
```

### Validate View Files

```bash
cd docs/tests/
./run-view-syntax-tests.sh
```

---

## Documentation References

### For Plugin Development
- **Getting Started**: `docs/plugins/README.md`
- **API Reference**: `docs/reference/api-index.md`
- **Best Practices**: `docs/plugins/best-practices.md`
- **Architecture**: `docs/plugins/architecture.md`

### For UI Development
- **View Files**: `docs/ui/view-files/syntax-reference.md`
- **Widgets**: `docs/ui/widgets/`
- **Theming**: `docs/ui/theming/`
- **Examples**: `docs/ui/examples/`

### For Skin Development
- **Skin Structure**: `docs/ui/theming/skin-structure.md`
- **Macro System**: `docs/ui/theming/macro-reference.md`
- **Global Config**: `docs/ui/theming/global-configuration.md`
- **OSD System**: `docs/media/osd-system.md`

---

## Contributing

### Adding New Templates

1. Create template directory
2. Include all required files
3. Write comprehensive README.md
4. Add to this index
5. Run validation
6. Submit pull request

### Adding New Components

1. Create component .view file
2. Add documentation comments
3. Include usage examples
4. Test thoroughly
5. Update component README
6. Add to this index

---

## Version Information

- **Last Updated**: 2024-11-08
- **Movian Version**: 4.8+
- **Documentation Version**: 1.0
- **Total Templates**: 2 (5 planned)
- **Total Components**: 5 (15 planned)
- **Total Examples**: 11

---

## Quick Reference

### Template Selection Guide

| Need | Use Template |
|------|--------------|
| Learning | basic-plugin |
| Media content | content-provider |
| Search | search-service |
| Configuration | settings-plugin |
| Custom UI | ui-extension |
| Theme | minimal-skin |

### Component Selection Guide

| Need | Use Component |
|------|---------------|
| Navigation menu | sidebar-menu.view |
| Media player | playback-controls.view |
| Item list | scrollable-list.view |
| Buttons | button-components.view |
| Dialogs | modal-dialog.view |

---

## Support

For questions and issues:
- Check component/template README
- Review documentation
- See troubleshooting guide: `docs/reference/troubleshooting.md`
- Check FAQ: `docs/reference/faq.md`

---

## License

All examples and templates are provided as-is for use in Movian plugin and skin development.
