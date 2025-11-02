# Movian Documentation Project

Comprehensive developer documentation for the Movian media player, built with MkDocs Material.

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd movian-docs

# Install dependencies
pip install -r requirements.txt

# Serve documentation locally
mkdocs serve
```

The documentation will be available at `http://localhost:8000`

### Build for Production
```bash
# Build static site
mkdocs build

# Deploy to GitHub Pages (if configured)
mkdocs gh-deploy
```

## 📁 Project Structure

```
movian-docs/
├── docs/                          # Documentation source files
│   ├── index.md                   # Main documentation page
│   ├── installation/              # Installation guides
│   │   ├── README.md              # Installation overview
│   │   ├── linux.md               # Linux installation
│   │   ├── macos.md               # macOS installation
│   │   ├── build-system.md        # Build system documentation
│   │   └── troubleshooting.md     # Troubleshooting guide
│   ├── tests/                     # Test scripts and documentation
│   │   ├── README.md              # Test suite overview
│   │   ├── build-validation.sh    # Build validation script
│   │   ├── dependency-check.py    # Dependency checker
│   │   └── run-tests.sh           # Test runner
│   ├── architecture/              # Architecture documentation
│   ├── plugins/                   # Plugin development guides
│   ├── ui/                        # UI system documentation
│   └── reference/                 # Reference materials
├── .github/workflows/             # CI/CD workflows
│   └── build-validation.yml       # Automated testing
├── mkdocs.yml                     # MkDocs configuration
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## 🧪 Testing

The project includes comprehensive testing for installation instructions:

```bash
# Run all tests
docs/tests/run-tests.sh

# Run only dependency checks
docs/tests/run-tests.sh --dependency-only

# Run with performance benchmarks
docs/tests/run-tests.sh --performance
```

### Automated Testing

GitHub Actions automatically tests the installation instructions on:
- Ubuntu 20.04, 22.04
- Fedora Latest
- macOS 11, 12, 13

## 📝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-documentation`
3. **Make your changes** in the `docs/` directory
4. **Test locally**: `mkdocs serve`
5. **Run tests**: `docs/tests/run-tests.sh`
6. **Commit with descriptive messages**
7. **Push and create a pull request**

### Documentation Guidelines

- Use clear, concise language
- Include code examples where appropriate
- Test all installation instructions
- Update navigation in `mkdocs.yml` for new pages
- Follow existing file naming conventions

## 🛠️ Development

### Local Development
```bash
# Start development server with auto-reload
mkdocs serve --dev-addr=0.0.0.0:8000

# Build and check for warnings
mkdocs build --strict
```

### Adding New Documentation

1. Create new `.md` files in appropriate `docs/` subdirectories
2. Update `mkdocs.yml` navigation
3. Test locally with `mkdocs serve`
4. Ensure all internal links work
5. Run validation tests

### Testing Installation Instructions

Before committing changes to installation guides:

```bash
# Test dependency detection
python3 docs/tests/dependency-check.py

# Test full build process (requires time and resources)
docs/tests/build-validation.sh
```

## 📄 License

This documentation is licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

The Movian media player itself is licensed under GNU General Public License v3.0.

## 🔗 Links

- **Movian Source Code**: [https://github.com/andoma/movian](https://github.com/andoma/movian)
- **Movian Website**: [https://movian.tv/](https://movian.tv/)
- **MkDocs Documentation**: [https://www.mkdocs.org/](https://www.mkdocs.org/)
- **Material Theme**: [https://squidfunk.github.io/mkdocs-material/](https://squidfunk.github.io/mkdocs-material/)

---

**Documentation Status**: ✅ Task 2 Complete - Project overview and installation documentation  
**Last Updated**: November 2025  
**MkDocs Version**: 1.6.1  
**Material Theme Version**: 9.6.23