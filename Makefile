# Movian Documentation Build System

.PHONY: help install dev build deploy test clean analyze

# Default target
help:
	@echo "Movian Documentation Build System"
	@echo "================================="
	@echo ""
	@echo "Available targets:"
	@echo "  install    - Install dependencies"
	@echo "  dev        - Start development server"
	@echo "  build      - Build static site"
	@echo "  deploy     - Deploy to GitHub Pages"
	@echo "  test       - Run all validation tests"
	@echo "  clean      - Clean build artifacts"
	@echo "  analyze    - Analyze Movian source code"
	@echo ""
	@echo "Testing targets:"
	@echo "  test-examples    - Test code examples"
	@echo "  test-references  - Validate source references"
	@echo "  test-links       - Check internal/external links"
	@echo ""
	@echo "Analysis targets:"
	@echo "  analyze-source   - Analyze Movian source code"
	@echo "  generate-api     - Generate API documentation"

# Installation
install:
	@echo "📦 Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "📦 Installing Node.js dependencies..."
	npm install
	@echo "✅ Installation complete!"

# Development
dev:
	@echo "🚀 Starting development server..."
	mkdocs serve

# Build
build:
	@echo "🏗️  Building static site..."
	mkdocs build
	@echo "✅ Build complete! Output in site/"

# Deploy
deploy:
	@echo "🚀 Deploying to GitHub Pages..."
	mkdocs gh-deploy
	@echo "✅ Deployment complete!"

# Testing
test: test-examples test-links
	@echo "✅ All tests completed!"

test-examples:
	@echo "🧪 Testing code examples..."
	node tools/test-examples.js

test-references:
	@echo "🔗 Validating source references..."
	@if [ -z "$(MOVIAN_SOURCE)" ]; then \
		echo "⚠️  MOVIAN_SOURCE not set, skipping reference validation"; \
		echo "   Set MOVIAN_SOURCE=/path/to/movian to enable validation"; \
	else \
		node tools/validate-references.js --movian-source "$(MOVIAN_SOURCE)"; \
	fi

test-links:
	@echo "🔗 Checking links..."
	node tools/check-links.js

# Analysis
analyze: analyze-source
	@echo "✅ Analysis complete!"

analyze-source:
	@echo "🔍 Analyzing Movian source code..."
	@if [ -z "$(MOVIAN_SOURCE)" ]; then \
		echo "❌ MOVIAN_SOURCE not set"; \
		echo "   Usage: make analyze-source MOVIAN_SOURCE=/path/to/movian"; \
		exit 1; \
	else \
		node tools/analyze-source.js "$(MOVIAN_SOURCE)"; \
	fi

generate-api:
	@echo "📚 Generating API documentation..."
	@if [ -z "$(MOVIAN_SOURCE)" ]; then \
		echo "❌ MOVIAN_SOURCE not set"; \
		echo "   Usage: make generate-api MOVIAN_SOURCE=/path/to/movian"; \
		exit 1; \
	else \
		node tools/generate-api-docs.js "$(MOVIAN_SOURCE)"; \
	fi

# Cleanup
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf site/
	rm -f analysis-report.json
	rm -f analysis-summary.md
	rm -rf tools/temp_*
	@echo "✅ Cleanup complete!"

# Development helpers
watch-build:
	@echo "👀 Watching for changes and rebuilding..."
	while inotifywait -e modify -r .; do make build; done

serve-build:
	@echo "🌐 Serving built site locally..."
	cd site && python -m http.server 8080

# Validation with external Movian source
validate-all: MOVIAN_SOURCE ?= ../movian
validate-all: test-examples test-references test-links
	@echo "✅ Full validation complete!"

# Quick development setup
setup: install
	@echo "🎯 Quick setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Run 'make dev' to start development server"
	@echo "2. Set MOVIAN_SOURCE to enable source validation:"
	@echo "   export MOVIAN_SOURCE=/path/to/movian"
	@echo "3. Run 'make analyze-source' to analyze Movian code"
	@echo "4. Run 'make test' to validate documentation"

# CI/CD targets
ci-test: test-examples test-links
	@echo "✅ CI tests passed!"

ci-build: build
	@echo "✅ CI build completed!"

# Documentation maintenance
update-deps:
	@echo "📦 Updating dependencies..."
	pip install --upgrade -r requirements.txt
	npm update
	@echo "✅ Dependencies updated!"

check-deps:
	@echo "🔍 Checking dependency versions..."
	pip list --outdated
	npm outdated

# Help for specific tasks
help-analysis:
	@echo "Source Code Analysis Help"
	@echo "========================"
	@echo ""
	@echo "To analyze Movian source code:"
	@echo "1. Clone Movian repository:"
	@echo "   git clone https://github.com/andoma/movian.git"
	@echo ""
	@echo "2. Run analysis:"
	@echo "   make analyze-source MOVIAN_SOURCE=/path/to/movian"
	@echo ""
	@echo "3. Generate API docs:"
	@echo "   make generate-api MOVIAN_SOURCE=/path/to/movian"
	@echo ""
	@echo "4. Validate references:"
	@echo "   make test-references MOVIAN_SOURCE=/path/to/movian"

help-testing:
	@echo "Testing Help"
	@echo "============"
	@echo ""
	@echo "Available test types:"
	@echo "- Code examples: Validates JavaScript, JSON, XML syntax"
	@echo "- Source references: Checks file paths and line numbers"
	@echo "- Links: Validates internal and external links"
	@echo ""
	@echo "Run individual tests:"
	@echo "  make test-examples"
	@echo "  make test-references MOVIAN_SOURCE=/path/to/movian"
	@echo "  make test-links"
	@echo ""
	@echo "Run all tests:"
	@echo "  make test"