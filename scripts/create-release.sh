#!/bin/bash

# Movian Documentation Release Creation Script
# This script automates the release process for documentation

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if version argument provided
if [ -z "$1" ]; then
    print_error "Version number required"
    echo "Usage: $0 <version> [release-notes]"
    echo "Example: $0 1.1.0 \"Added OSD documentation\""
    exit 1
fi

VERSION=$1
RELEASE_NOTES=${2:-"Release version $VERSION"}

# Validate version format (semantic versioning)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format. Use semantic versioning (e.g., 1.1.0)"
    exit 1
fi

print_header "Movian Documentation Release v$VERSION"

# Check if we're in the correct directory
if [ ! -f "mkdocs.yml" ]; then
    print_error "mkdocs.yml not found. Run this script from the repository root."
    exit 1
fi

# Check for uncommitted changes
print_info "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Release cancelled"
        exit 1
    fi
fi

# Check if tag already exists
print_info "Checking if tag v$VERSION already exists..."
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    print_error "Tag v$VERSION already exists"
    exit 1
fi

# Run tests
print_info "Running validation tests..."
if command -v make &> /dev/null; then
    if make test-examples 2>/dev/null; then
        print_success "Code examples validated"
    else
        print_warning "Code example validation failed or not available"
    fi
    
    if make test-links 2>/dev/null; then
        print_success "Links validated"
    else
        print_warning "Link validation failed or not available"
    fi
else
    print_warning "Make not available, skipping automated tests"
fi

# Build documentation
print_info "Building documentation..."
if mkdocs build --clean; then
    print_success "Documentation built successfully"
else
    print_error "Documentation build failed"
    exit 1
fi

# Update CHANGELOG.md
print_info "Updating CHANGELOG.md..."
if [ -f "CHANGELOG.md" ]; then
    # Get current date
    RELEASE_DATE=$(date +%Y-%m-%d)
    
    # Create temporary file with new release entry
    TEMP_FILE=$(mktemp)
    
    # Read CHANGELOG and insert new release
    awk -v version="$VERSION" -v date="$RELEASE_DATE" -v notes="$RELEASE_NOTES" '
    /^## \[Unreleased\]/ {
        print $0
        print ""
        print "### Added"
        print "- New sections in progress"
        print ""
        print "### Changed"
        print "- Updates to existing content"
        print ""
        print "### Fixed"
        print "- Corrections and bug fixes"
        print ""
        print "## [" version "] - " date
        print ""
        print notes
        print ""
        next
    }
    { print }
    ' CHANGELOG.md > "$TEMP_FILE"
    
    mv "$TEMP_FILE" CHANGELOG.md
    print_success "CHANGELOG.md updated"
else
    print_warning "CHANGELOG.md not found, skipping"
fi

# Show changes to be committed
print_info "Changes to be committed:"
git status --short

# Confirm release
echo ""
print_warning "Ready to create release v$VERSION"
echo "Release notes: $RELEASE_NOTES"
echo ""
read -p "Proceed with release? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Release cancelled"
    exit 1
fi

# Commit CHANGELOG if modified
if [ -f "CHANGELOG.md" ] && ! git diff --quiet CHANGELOG.md; then
    print_info "Committing CHANGELOG.md..."
    git add CHANGELOG.md
    git commit -m "docs: prepare release v$VERSION"
    print_success "CHANGELOG.md committed"
fi

# Create annotated tag
print_info "Creating tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION

$RELEASE_NOTES

Generated: $(date '+%Y-%m-%d %H:%M:%S')"
print_success "Tag v$VERSION created"

# Push changes and tag
print_info "Pushing to remote..."
git push origin master
git push origin "v$VERSION"
print_success "Changes and tag pushed to remote"

# Display next steps
print_header "Release v$VERSION Created Successfully!"
echo ""
print_info "Next steps:"
echo "1. GitHub Actions will automatically deploy the documentation"
echo "2. Monitor deployment: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
echo "3. Create GitHub Release:"
echo "   - Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/new"
echo "   - Select tag: v$VERSION"
echo "   - Add release notes from CHANGELOG.md"
echo "   - Publish release"
echo ""
print_success "Documentation will be available at: $(grep 'site_url:' mkdocs.yml | awk '{print $2}')"
echo ""

# Optional: Open GitHub releases page
if command -v xdg-open &> /dev/null; then
    read -p "Open GitHub releases page? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        REPO_URL=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
        xdg-open "https://github.com/$REPO_URL/releases/new?tag=v$VERSION" 2>/dev/null || true
    fi
elif command -v open &> /dev/null; then
    read -p "Open GitHub releases page? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        REPO_URL=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
        open "https://github.com/$REPO_URL/releases/new?tag=v$VERSION" 2>/dev/null || true
    fi
fi

print_success "Release process complete!"
