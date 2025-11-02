# User Interface System

Documentation for Movian's [GLW](../reference/glossary.md#glw-opengl-widget) ([OpenGL](../reference/glossary.md#opengl) [Widget](../reference/glossary.md#widget)) [UI system](../reference/glossary.md#ui-system) and [view files](../reference/glossary.md#view-files).

**Note**: Movian [view files](../reference/glossary.md#view-files) use a JavaScript-like syntax, not XML. The [GLW](../reference/glossary.md#glw-opengl-widget) system provides a powerful [widget](../reference/glossary.md#widget)-based approach to creating custom user interfaces.

## [GLW](../reference/glossary.md#glw-opengl-widget) Architecture

- [GLW Overview](glw-architecture.md) - [OpenGL](../reference/glossary.md#opengl) [Widget](../reference/glossary.md#widget) system basics
- [Rendering Pipeline](rendering-pipeline.md) - How UI is rendered
- [Source Analysis](source-analysis/README.md) - Detailed [GLW](../reference/glossary.md#glw-opengl-widget) source code analysis

## [View Files](../reference/glossary.md#view-files)

[View files](../reference/glossary.md#view-files) use a JavaScript-like syntax with [widget](../reference/glossary.md#widget) functions and property objects:

- [Syntax Reference](view-files/syntax-reference.md) - Complete view file syntax
- [Widget Reference](view-files/widget-reference.md) - All available [widgets](../reference/glossary.md#widget)
- [Properties Reference](view-files/properties-reference.md) - [Widget](../reference/glossary.md#widget) properties
- [Expressions](view-files/expressions.md) - Expression syntax and evaluation
- [Preprocessor](view-files/preprocessor.md) - Include and macro system
- [Examples](examples/) - Working view file examples

## Theming and Skins

- [Skin Structure](theming/skin-structure.md) - How skins are organized
- [Creating Skins](theming/creating-skins.md) - Step-by-step skin creation
- [Theme Variables](theming/theme-variables.md) - Customization system
- [Examples](theming/examples/) - Complete working skins

## [Widgets](../reference/glossary.md#widget)

- [Container Widgets](widgets/container.md) - Layout containers
- [Text Widgets](widgets/text.md) - Text display and formatting
- [Image Widgets](widgets/image.md) - Image display and manipulation
- [List Widgets](widgets/list.md) - Scrollable lists
- [Grid Widgets](widgets/grid.md) - Grid layouts
- [Custom Widgets](widgets/custom-widgets.md) - Creating new [widget](../reference/glossary.md#widget) types