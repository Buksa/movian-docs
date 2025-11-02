# [GLW](../../reference/glossary.md#glw-opengl-widget) Source Code Analysis

Detailed analysis of Movian's [GLW](../../reference/glossary.md#glw-opengl-widget) ([OpenGL](../../reference/glossary.md#opengl) [Widget](../../reference/glossary.md#widget)) system source code.

## Overview

This section contains comprehensive analysis of all [GLW](../../reference/glossary.md#glw-opengl-widget) source files in `src/ui/glw/`. Each file is analyzed for:
- Purpose and responsibility
- Data structures and types
- Function catalog and [APIs](../../reference/glossary.md#api-application-programming-interface)
- Key algorithms and logic
- Constants and enums
- Error handling patterns

## Analysis Files

### Core [GLW](../../reference/glossary.md#glw-opengl-widget) System
- [glw.c](glw.c.md) - Main [GLW](../../reference/glossary.md#glw-opengl-widget) implementation and core functionality
- [glw_view.c](glw_view.c.md) - View file processing and management

### View File Processing (Critical)
- [glw_view_parser.c](glw_view_parser.c.md) - XML element definitions and parsing
- [glw_view_attrib.c](glw_view_attrib.c.md) - Complete attribute catalog
- [glw_view_eval.c](glw_view_eval.c.md) - Expression syntax and evaluation
- [glw_view_lexer.c](glw_view_lexer.c.md) - Token definitions and syntax rules
- [glw_view_loader.c](glw_view_loader.c.md) - File loading and path resolution
- [glw_view_preproc.c](glw_view_preproc.c.md) - Preprocessing directives

### Rendering System
- [glw_renderer.c](glw_renderer.c.md) - [OpenGL](../../reference/glossary.md#opengl) rendering pipeline
- [glw_texture.c](glw_texture.c.md) - Texture management

### [Widget](../../reference/glossary.md#widget) Implementations
- [glw_container.c](glw_container.c.md) - Container [widget](../../reference/glossary.md#widget) types
- [glw_image.c](glw_image.c.md) - Image display [widgets](../../reference/glossary.md#widget)
- [glw_text_*.c](glw_text.md) - Text rendering [widgets](../../reference/glossary.md#widget)

## Analysis Summary

- [Summary](summary.md) - Consolidated findings from all source analysis
- [Architecture Insights](architecture-insights.md) - Key architectural patterns
- [API Extraction](api-extraction.md) - Public [APIs](../../reference/glossary.md#api-application-programming-interface) discovered from source

## Accuracy Status

All analysis is marked with accuracy indicators:
- 🟢 **Verified**: Directly from source code analysis
- 🟡 **Tested**: Verified through working examples
- 🟠 **Inferred**: Based on code behavior observation
- 🔴 **Assumed**: Needs verification

## Version Information

Analysis based on Movian source code as of:
- **Repository**: https://github.com/andoma/movian
- **Commit**: [To be updated during analysis]
- **Date**: [To be updated during analysis]