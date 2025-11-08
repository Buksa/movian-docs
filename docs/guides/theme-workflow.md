# Theme Development Workflow

Workflow and best practices for developing Movian themes and skins.

## Development Process

1. **Plan** - Define theme style and features
2. **Setup** - Create skin directory structure
3. **Develop** - Create view files
4. **Test** - Test on different screens
5. **Refine** - Polish and optimize
6. **Package** - Create distributable package

## Skin Structure

```
my-skin/
├── universe.view        # Entry point
├── theme.view           # Macros and styles
├── background.view      # Background
├── loading.view         # Loading screen
├── pages/              # Page templates
│   ├── directory.view
│   ├── video.view
│   └── ...
├── osd/                # On-screen display
└── popups/             # Dialogs
```

## Development Tips

### Start with Existing Skin

Copy `movian/glwskins/flat/` as starting point.

### Test Frequently

Reload skin in Movian to see changes.

### Use Variables

```view
$ui.primaryColor = "#4192ff";
$ui.spacing = 0.5em;
```

### Create Reusable Macros

```view
#define Button(CAPTION) { ... }
#define Card(TITLE, ICON) { ... }
```

## Testing

- Test on different screen sizes
- Test with different content types
- Test navigation with keyboard/remote
- Test on target platforms

## See Also

- [Creating Skins](../ui/theming/creating-skins.md)
- [Theme System](../ui/theming/theme-system.md)
- [Customizing UI](customizing-ui.md)
