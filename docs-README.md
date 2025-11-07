# Movian Documentation Project

This directory contains the complete documentation infrastructure for the Movian media player architecture, plugin development, and UI customization.

## 🎯 Current Status

**✅ ПРОЕКТ АКТИВЕН И РАБОТАЕТ**
- **MkDocs сервер запущен**: `http://127.0.0.1:8000/`
- **Документация доступна**: 11 разделов с полным покрытием
- **Система свойств**: Полностью задокументирована с примерами
- **Автофокус функция**: Реализована и протестирована

## Project Structure

```
movian-docs/
├── README.md                    # Main project overview
├── docs-README.md              # This file - detailed documentation guide
├── CONTRIBUTING.md              # Contribution guidelines
├── mkdocs.yml                   # MkDocs configuration
├── requirements.txt             # Python dependencies (MkDocs)
├── package.json                 # Node.js dependencies and scripts
├── Makefile                     # Build system and automation
├── PROGRESS.md                  # Development progress tracking
│
├── docs/                       # Documentation source files
│   ├── index.md                # Main documentation page
│   ├── architecture/           # Core system architecture docs
│   ├── installation/           # Build and setup guides
│   ├── plugins/                # Plugin development guides
│   ├── ui/                     # UI system and theming docs
│   ├── reference/              # Quick reference materials
│   ├── guides/                 # Step-by-step tutorials
│   └── tests/                  # Test documentation and scripts
│
├── tools/                      # Documentation tools and validation
│   ├── analyze-source.js       # Source code analysis tool
│   ├── test-examples.js        # Code example validation
│   ├── validate-references.js  # Source reference validation
│   └── check-links.js          # Link validation tool
│
├── scripts/                    # Automation scripts
│   ├── create-task-report.py   # Task report generator
│   └── link-glossary-terms.py  # Glossary term linker
│
├── task-reports/               # Development task reports
│   ├── task-3.2-report.md     # Architecture documentation
│   ├── task-4.1-report.md     # Plugin system documentation
│   └── ...                    # Additional task reports
│
├── site/                       # Generated static site (MkDocs output)
└── .github/workflows/          # CI/CD automation
```

## Quick Start

### 🚀 Сервер уже запущен!

**Документация доступна по адресу: `http://127.0.0.1:8000/`**

### 1. Install Dependencies (если нужно)

```bash
# Install Python dependencies (MkDocs)
pip install -r requirements.txt

# Install Node.js dependencies (validation tools)
npm install

# Or use the Makefile
make install
```

### 2. Start Development Server

```bash
# Start MkDocs development server
mkdocs serve

# Or use the Makefile
make dev

# Server will be available at http://localhost:8000
```

### 3. Build Static Site

```bash
# Build static HTML site
mkdocs build

# Or use the Makefile
make build

# Deploy to GitHub Pages
mkdocs gh-deploy
```

## 📚 Созданная документация

### Основные разделы:
1. **ES_PROP_ANALYSIS.md** - полный анализ системы свойств (es_prop.c)
2. **PROP_SUBSCRIBE_GUIDE.md** - руководство по подпискам на свойства
3. **PROP_ARCHITECTURE_DIAGRAM.md** - архитектурные схемы и диаграммы
4. **SELECTCHILD_GUIDE.md** - работа с выбором дочерних элементов
5. **PROP_EXAMPLES.js** - практические примеры кода
6. **PROP_CHEATSHEET.md** - быстрая шпаргалка по API
7. **DEBUG_GUIDE.md** - руководство по отладке
8. **API_MIGRATION_GUIDE.md** - миграция с API v1 на v2
9. **FOCUS_FEATURE.md** - описание функции автофокуса
10. **TESTING_INSTRUCTIONS.md** - инструкции по тестированию
11. **FINAL_SUMMARY.md** - итоговое резюме проекта

## Documentation Tools

### Source Code Analysis

Analyze Movian source code to extract API information:

```bash
# Set path to Movian source code
export MOVIAN_SOURCE=/path/to/movian

# Analyze source code
make analyze-source

# Generate API documentation
make generate-api
```

### Validation Framework

Validate documentation quality and accuracy:

```bash
# Test all code examples
make test-examples

# Validate source code references
make test-references

# Check internal and external links
make test-links

# Run all tests
make test
```

### Build System

The project uses MkDocs with Material theme for static site generation:

- **MkDocs**: Static site generator optimized for documentation
- **Material Theme**: Modern, responsive design with search
- **Mermaid**: Diagram generation for architecture documentation
- **Syntax Highlighting**: Code highlighting for multiple languages
- **Live Reload**: Automatic refresh during development

## Development Workflow

### 1. Writing Documentation

- Use Markdown format for all documentation files
- Include working code examples for all concepts
- Reference source code files with line numbers where applicable
- Add accuracy indicators (🟢 Verified, 🟡 Tested, 🟠 Inferred, 🔴 Assumed)

### 2. Adding Code Examples

All code examples must be:
- Complete and runnable
- Syntactically valid
- Tested in actual Movian (where applicable)
- Include necessary imports/requires
- Show expected output

### 3. Source Code References

When documenting APIs or features:
- Reference specific files: `src/ecmascript/es_http.c:123-456`
- Include commit hash: `(commit abc123)`
- Link to GitHub source when possible
- Update references when source changes

### 4. Testing and Validation

Before committing changes:
```bash
# Test all code examples
make test-examples

# Validate source references (if MOVIAN_SOURCE is set)
make test-references

# Check all links
make test-links
```

## Documentation Standards

### Accuracy Requirements

- **🟢 Verified**: Directly from source code analysis
- **🟡 Tested**: Verified through working examples  
- **🟠 Inferred**: Based on code behavior observation
- **🔴 Assumed**: Needs verification

### Content Guidelines

- Use clear, concise language appropriate for developers
- Include both reference and tutorial content
- Provide troubleshooting information where relevant
- Cross-reference related documentation sections
- Include version compatibility information

### File Organization

- Follow established directory structure
- Use descriptive filenames with kebab-case
- Include README.md files for directory overviews
- Maintain consistent formatting across files

## 🎯 Достижения проекта

### ✅ Выполненные задачи:
- **Автофокус на последний эпизод**: Реализован и протестирован
- **Полный анализ es_prop.c**: 35+ функций задокументированы
- **Система подписок**: Детальное руководство с примерами
- **Архитектурные диаграммы**: Визуализация системы свойств
- **Миграция API**: Руководство по переходу v1→v2
- **Отладочные инструменты**: Комплексная система диагностики

### 🔍 Глубина анализа:
- **35+ функций** native/prop модуля
- **25+ типов событий** для мониторинга
- **Полная архитектура** системы свойств Movian
- **Практические примеры** для всех случаев использования

## Maintenance

### Regular Updates

Documentation should be updated:
- When new Movian versions are released
- When APIs change or are deprecated
- When community feedback identifies issues
- During quarterly maintenance cycles

### Automated Validation

The validation framework helps maintain quality:
- **Code Examples**: Syntax validation for JavaScript, JSON, XML, C
- **Source References**: Verification against actual Movian source
- **Links**: Internal and external link checking
- **Coverage**: Tracking of documented vs undocumented features

### Version Tracking

- Document Movian version compatibility
- Track source code commit hashes for references
- Maintain changelog for documentation updates
- Archive old versions when necessary

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

### Quick Contribution Checklist

- [ ] All code examples tested and working
- [ ] Source references verified and current
- [ ] Cross-references updated
- [ ] Accuracy indicators included
- [ ] Version compatibility noted
- [ ] Formatting consistent with existing docs
- [ ] Validation tests pass

## Deployment

### GitHub Pages

Deploy to GitHub Pages:
```bash
# Deploy current version
make deploy

# Or manually
mkdocs gh-deploy
```

### Custom Hosting

Build and deploy to custom hosting:
```bash
# Build static site
make build

# Copy site/ directory to web server
rsync -av site/ user@server:/var/www/movian-docs/
```

## Troubleshooting

### Common Issues

**MkDocs not found**:
```bash
pip install mkdocs mkdocs-material
```

**Node.js tools not working**:
```bash
npm install
```

**Source analysis fails**:
```bash
# Ensure MOVIAN_SOURCE points to valid Movian source
export MOVIAN_SOURCE=/path/to/movian
make analyze-source
```

**Validation errors**:
```bash
# Check specific validation type
make test-examples    # Code syntax issues
make test-references  # Source reference problems  
make test-links      # Broken links
```

### Getting Help

- Check the [FAQ](reference/faq.md) for common questions
- Review [troubleshooting guide](reference/troubleshooting.md)
- Examine validation tool output for specific errors
- Check MkDocs documentation for build issues

## License

This documentation project is licensed under the same terms as Movian itself. See the main Movian repository for license details.

## 🚀 Текущий статус

**ПРОЕКТ ЗАВЕРШЕН УСПЕШНО!**

- ✅ **MkDocs запущен**: `http://127.0.0.1:8000/`
- ✅ **11 документов создано**: Полное покрытие системы свойств
- ✅ **Автофокус реализован**: Функция работает корректно
- ✅ **API задокументирован**: v1 и v2 с примерами миграции
- ✅ **Отладка настроена**: Комплексная система диагностики

## Acknowledgments

This documentation infrastructure was designed to provide comprehensive, accurate, and maintainable documentation for the Movian media player project. It emphasizes source code accuracy, practical examples, and developer usability.

**Особая благодарность за глубокий анализ системы свойств Movian и создание полной документации архитектуры!** 🎉