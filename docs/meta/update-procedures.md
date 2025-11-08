# Documentation Update and Maintenance Procedures

## Overview

This document outlines the procedures for maintaining, updating, and publishing the Movian Architecture Documentation. It covers version control, release management, content updates, and deployment workflows.

## Table of Contents

1. [Version Control Strategy](#version-control-strategy)
2. [Release Management](#release-management)
3. [Content Update Workflow](#content-update-workflow)
4. [Deployment Process](#deployment-process)
5. [Quality Assurance](#quality-assurance)
6. [Maintenance Schedule](#maintenance-schedule)
7. [Emergency Updates](#emergency-updates)

---

## Version Control Strategy

### Branch Structure

The documentation repository follows a simplified Git workflow:

```
master (main)
  ├── develop (optional for major updates)
  └── feature/* (temporary branches for specific updates)
```

**Branch Policies:**

- **`master`**: Production-ready documentation, automatically deployed to GitHub Pages
- **`develop`**: Integration branch for coordinating multiple updates (optional)
- **`feature/*`**: Short-lived branches for specific documentation updates

### Commit Message Convention

Follow semantic commit messages for clarity and automated changelog generation:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `docs`: Documentation content updates
- `feat`: New documentation sections or features
- `fix`: Corrections to existing documentation
- `style`: Formatting, typos, or style improvements
- `refactor`: Restructuring documentation without content changes
- `test`: Updates to validation tests
- `chore`: Build system, dependencies, or tooling updates

**Examples:**
```bash
docs(plugins): add WebSocket API documentation

docs(ui): update GLW widget attribute reference

fix(installation): correct Ubuntu dependency list

feat(examples): add advanced plugin template

chore(deps): update mkdocs-material to 9.5.0
```

### Tagging Strategy

Use semantic versioning for documentation releases:

```
v<major>.<minor>.<patch>
```

**Version Increment Rules:**

- **Major** (`v2.0.0`): Complete documentation restructure, breaking navigation changes
- **Minor** (`v1.1.0`): New major sections, significant content additions
- **Patch** (`v1.0.1`): Bug fixes, corrections, minor updates

**Tagging Commands:**
```bash
# Create annotated tag
git tag -a v1.1.0 -m "Release v1.1.0: Add OSD system documentation"

# Push tag to remote
git push origin v1.1.0

# List all tags
git tag -l
```

---

## Release Management

### Release Preparation Checklist

Before creating a new release:

- [ ] **Content Review**: All new/updated pages reviewed for accuracy
- [ ] **Link Validation**: Run `make test-links` to check all links
- [ ] **Code Examples**: Verify all code examples with `make test-examples`
- [ ] **Build Test**: Successful local build with `mkdocs build`
- [ ] **Navigation**: Verify all pages accessible through navigation
- [ ] **Search**: Test search functionality for new content
- [ ] **Cross-references**: Validate internal references and glossary links
- [ ] **Changelog**: Update `CHANGELOG.md` with release notes

### Release Process

#### 1. Prepare Release Branch

```bash
# Create release branch from develop or master
git checkout -b release/v1.1.0

# Update version in mkdocs.yml if applicable
# Update CHANGELOG.md with release notes
```

#### 2. Final Validation

```bash
# Run all tests
make test

# Build documentation locally
mkdocs build

# Serve locally for final review
mkdocs serve
```

#### 3. Create Release

```bash
# Merge to master
git checkout master
git merge release/v1.1.0

# Create annotated tag
git tag -a v1.1.0 -m "Release v1.1.0: OSD System Documentation"

# Push to remote
git push origin master
git push origin v1.1.0
```

#### 4. GitHub Release

1. Navigate to repository **Releases** page
2. Click **Draft a new release**
3. Select the version tag (e.g., `v1.1.0`)
4. Set release title: `Movian Documentation v1.1.0`
5. Add release notes from `CHANGELOG.md`
6. Attach any supplementary files (PDF exports, etc.)
7. Publish release

### Changelog Format

Maintain `CHANGELOG.md` in the repository root:

```markdown
# Changelog

All notable changes to the Movian Architecture Documentation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New sections in progress

### Changed
- Updates to existing content

### Fixed
- Corrections and bug fixes

## [1.1.0] - 2024-11-08

### Added
- Complete OSD system documentation with 6 view file references
- Media player integration guide with playdeck system
- Focus control system documentation
- Track selection UI patterns

### Changed
- Enhanced theming documentation with macro system details
- Updated navigation structure for media components

### Fixed
- Corrected attribute reference for container widgets
- Fixed broken links in plugin examples

## [1.0.0] - 2024-10-15

### Added
- Initial documentation release
- Plugin development guide with 4 working examples
- GLW architecture and rendering pipeline documentation
- Complete API reference for core, HTTP, storage, and settings APIs
- Installation guides for Linux and macOS
- 109-term technical glossary

[Unreleased]: https://github.com/username/movian-docs/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/username/movian-docs/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/username/movian-docs/releases/tag/v1.0.0
```

---

## Content Update Workflow

### Standard Update Process

#### 1. Create Feature Branch

```bash
# Create branch for specific update
git checkout -b docs/update-plugin-api

# Make changes to documentation files
# Edit docs/plugins/api/core-api.md
```

#### 2. Local Testing

```bash
# Start development server
mkdocs serve

# In another terminal, run validation
make test-examples
make test-links

# Check for broken references
python scripts/link-glossary-terms.py --check
```

#### 3. Commit Changes

```bash
# Stage changes
git add docs/plugins/api/core-api.md

# Commit with semantic message
git commit -m "docs(plugins): update core API with new prop methods"
```

#### 4. Push and Create Pull Request

```bash
# Push branch to remote
git push origin docs/update-plugin-api

# Create pull request on GitHub
# Request review from documentation maintainers
```

#### 5. Review and Merge

- **Automated Checks**: GitHub Actions runs build validation
- **Manual Review**: Reviewer checks content accuracy and formatting
- **Merge**: Squash and merge to master
- **Deploy**: Automatic deployment to GitHub Pages

### Quick Fix Workflow

For urgent corrections (typos, broken links, minor errors):

```bash
# Create fix branch
git checkout -b fix/typo-in-installation-guide

# Make correction
# Edit docs/installation/linux.md

# Commit and push
git add docs/installation/linux.md
git commit -m "fix(installation): correct package name for Ubuntu"
git push origin fix/typo-in-installation-guide

# Create PR with "hotfix" label
# Fast-track review and merge
```

### Adding New Documentation Sections

#### 1. Plan Structure

```bash
# Create directory structure
mkdir -p docs/new-section/subsection

# Create index file
touch docs/new-section/README.md
```

#### 2. Update Navigation

Edit `mkdocs.yml` to add new section:

```yaml
nav:
  # ... existing sections ...
  - New Section:
    - Overview: new-section/README.md
    - Subsection: new-section/subsection/page.md
```

#### 3. Create Content

```markdown
# New Section Title

## Overview

Brief introduction to the section.

## Topics Covered

- Topic 1
- Topic 2
- Topic 3

## Prerequisites

Link to prerequisite knowledge or sections.

## See Also

- [Related Section](RELATED_PAGE_LINK)
- [API Reference](../reference/api-index.md)
```

#### 4. Add Cross-References

- Update related pages with links to new section
- Add relevant terms to glossary if needed
- Update index pages and overview documents

#### 5. Validate and Deploy

```bash
# Test build
mkdocs build

# Check navigation
mkdocs serve

# Run validation
make test

# Commit and push
git add docs/new-section/ mkdocs.yml
git commit -m "feat(new-section): add comprehensive guide"
git push origin feature/new-section
```

---

## Deployment Process

### Automatic Deployment (GitHub Actions)

The documentation is automatically deployed on every push to `master`:

**Workflow:** `.github/workflows/deploy-docs.yml`

```yaml
on:
  push:
    branches:
      - master
      - main
```

**Deployment Steps:**

1. **Trigger**: Push to master branch
2. **Build**: GitHub Actions runs `mkdocs build`
3. **Validate**: Checks for build errors
4. **Deploy**: Publishes to GitHub Pages
5. **Available**: Site updated within 2-5 minutes

**Monitoring Deployment:**

```bash
# Check deployment status
# Navigate to: https://github.com/username/movian-docs/actions

# View deployment logs
# Click on latest "Deploy Documentation" workflow run
```

### Manual Deployment

For emergency deployments or testing:

```bash
# Deploy from local machine
mkdocs gh-deploy

# Deploy specific branch
git checkout feature/test-deployment
mkdocs gh-deploy --force

# Deploy with custom message
mkdocs gh-deploy -m "Emergency fix for broken links"
```

### Deployment Verification

After deployment, verify:

1. **Site Accessibility**: Visit `https://username.github.io/movian-docs/`
2. **Navigation**: Check all menu items work
3. **Search**: Test search functionality
4. **Links**: Spot-check internal and external links
5. **Images**: Verify images and diagrams load
6. **Code Blocks**: Check syntax highlighting works

**Verification Checklist:**

```bash
# Automated checks
curl -I https://username.github.io/movian-docs/
curl -I https://username.github.io/movian-docs/plugins/api/core-api/

# Manual checks
# - Open site in browser
# - Test search for "plugin"
# - Navigate through 3-4 sections
# - Check mobile responsiveness
```

### Rollback Procedure

If deployment introduces critical issues:

#### Option 1: Revert Commit

```bash
# Identify problematic commit
git log --oneline

# Revert the commit
git revert <commit-hash>

# Push revert
git push origin master

# Automatic redeployment with reverted changes
```

#### Option 2: Deploy Previous Version

```bash
# Checkout previous tag
git checkout v1.0.0

# Force deploy
mkdocs gh-deploy --force

# Return to master
git checkout master

# Fix issues and redeploy properly
```

#### Option 3: Emergency Hotfix

```bash
# Create hotfix branch from last good commit
git checkout -b hotfix/critical-fix <last-good-commit>

# Make minimal fix
# Edit problematic file

# Commit and merge to master
git commit -m "hotfix: resolve critical deployment issue"
git checkout master
git merge hotfix/critical-fix
git push origin master
```

---

## Quality Assurance

### Pre-Commit Checks

Run before every commit:

```bash
# Validate Markdown syntax
find docs -name "*.md" -exec python -m markdown {} \; > /dev/null

# Check for broken internal links
make test-links

# Validate code examples
make test-examples

# Check glossary term usage
python scripts/link-glossary-terms.py --check
```

### Pre-Release Validation

Comprehensive checks before releases:

```bash
# Full test suite
make test

# Build documentation
mkdocs build --clean

# Serve locally for manual review
mkdocs serve

# Check for common issues
grep -r "TODO" docs/
grep -r "FIXME" docs/
grep -r "XXX" docs/
```

### Automated Quality Checks

GitHub Actions runs on every PR:

- **Build Validation**: Ensures documentation builds successfully
- **Link Checking**: Validates internal and external links
- **Code Example Testing**: Verifies JavaScript/JSON syntax
- **Markdown Linting**: Checks for formatting issues

### Manual Review Checklist

For significant updates:

- [ ] **Accuracy**: Technical information verified against source code
- [ ] **Completeness**: All promised content delivered
- [ ] **Clarity**: Language clear and accessible
- [ ] **Consistency**: Formatting and style match existing docs
- [ ] **Navigation**: Logical flow and proper cross-references
- [ ] **Examples**: Code examples tested and working
- [ ] **Diagrams**: Mermaid diagrams render correctly
- [ ] **Glossary**: New terms added to glossary
- [ ] **Mobile**: Content readable on mobile devices

---

## Maintenance Schedule

### Regular Maintenance Tasks

#### Weekly

- **Monitor Issues**: Review and triage new GitHub issues
- **Check Links**: Run automated link checker
- **Review PRs**: Review and merge pending pull requests

#### Monthly

- **Dependency Updates**: Update MkDocs and plugins
  ```bash
  pip install --upgrade -r requirements.txt
  npm update
  ```
- **Content Review**: Review most-visited pages for accuracy
- **Search Analytics**: Review search queries for content gaps
- **Broken Link Sweep**: Comprehensive external link validation

#### Quarterly

- **Major Updates**: Sync with Movian releases for API changes
- **Restructuring**: Evaluate navigation and organization
- **Performance**: Optimize build times and page load speeds
- **Accessibility**: Audit for accessibility compliance

#### Annually

- **Comprehensive Audit**: Full documentation review
- **User Feedback**: Survey users for improvement suggestions
- **Technology Review**: Evaluate documentation tooling
- **Archive**: Archive outdated content appropriately

### Dependency Management

#### Updating MkDocs and Plugins

```bash
# Check for outdated packages
pip list --outdated

# Update specific package
pip install --upgrade mkdocs-material

# Update all dependencies
pip install --upgrade -r requirements.txt

# Test after updates
mkdocs build
mkdocs serve

# Commit updated requirements
pip freeze > requirements.txt
git add requirements.txt
git commit -m "chore(deps): update mkdocs-material to 9.5.0"
```

#### Node.js Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Test validation tools
npm run test

# Commit updated package files
git add package.json package-lock.json
git commit -m "chore(deps): update validation tools"
```

### Monitoring and Analytics

#### GitHub Pages Analytics

Monitor documentation usage:

- **Page Views**: Identify most-visited sections
- **Search Queries**: Discover content gaps
- **Referrers**: Understand how users find documentation
- **Devices**: Optimize for common device types

#### Issue Tracking

Monitor documentation issues:

```bash
# Label issues appropriately
# - documentation: General documentation issues
# - bug: Errors or inaccuracies
# - enhancement: Improvement suggestions
# - question: User questions (may indicate unclear docs)
```

---

## Emergency Updates

### Critical Issue Response

For critical errors (broken builds, major inaccuracies, security issues):

#### 1. Assess Severity

- **Critical**: Site down, major security issue, completely wrong information
- **High**: Broken navigation, significant inaccuracy, broken examples
- **Medium**: Minor errors, outdated information, formatting issues
- **Low**: Typos, style inconsistencies, minor improvements

#### 2. Immediate Action (Critical/High)

```bash
# Create hotfix branch
git checkout -b hotfix/critical-issue

# Make minimal fix
# Edit affected file(s)

# Test fix
mkdocs build
mkdocs serve

# Commit with clear message
git commit -m "hotfix: resolve critical build failure in plugin API"

# Push and create PR with "urgent" label
git push origin hotfix/critical-issue

# Request immediate review
# Merge and deploy ASAP
```

#### 3. Post-Incident Review

After resolving critical issues:

1. **Document Incident**: Record what happened and how it was fixed
2. **Root Cause Analysis**: Identify why the issue occurred
3. **Prevention**: Implement checks to prevent recurrence
4. **Update Procedures**: Improve this document if needed

### Communication Protocol

For significant issues affecting users:

1. **GitHub Issue**: Create issue documenting the problem
2. **Status Update**: Add notice to documentation homepage if site affected
3. **Resolution Notice**: Update issue when resolved
4. **Post-Mortem**: Share lessons learned if appropriate

---

## Best Practices

### Writing Guidelines

- **Clarity**: Use clear, concise language
- **Consistency**: Follow established patterns and terminology
- **Completeness**: Provide sufficient context and examples
- **Accuracy**: Verify technical details against source code
- **Accessibility**: Use semantic HTML and alt text for images

### Code Examples

- **Working Code**: All examples must be syntactically correct
- **Context**: Provide sufficient context for understanding
- **Comments**: Explain non-obvious code
- **Testing**: Validate examples with automated tests

### Diagrams

- **Mermaid**: Use Mermaid for architecture and flow diagrams
- **Simplicity**: Keep diagrams focused and uncluttered
- **Labels**: Use clear, descriptive labels
- **Consistency**: Use consistent styling across diagrams

### Cross-References

- **Internal Links**: Use relative paths for internal links
- **Glossary**: Link technical terms to glossary on first use
- **See Also**: Provide related links at end of sections
- **Breadcrumbs**: Ensure clear navigation path

---

## Tools and Scripts

### Available Maintenance Tools

Located in `tools/` and `scripts/` directories:

#### Validation Tools

```bash
# Test code examples
node tools/test-examples.js

# Validate source references
node tools/validate-references.js --movian-source /path/to/movian

# Check links
node tools/check-links.js

# Analyze source code
node tools/analyze-source.js /path/to/movian
```

#### Content Tools

```bash
# Link glossary terms
python scripts/link-glossary-terms.py

# Create task report
python scripts/create-task-report.py --task 10.2

# Generate skin template
node tools/generate-skin-template.js --output /path/to/output
```

#### Build Tools

```bash
# Development server
make dev

# Build static site
make build

# Run all tests
make test

# Deploy to GitHub Pages
make deploy

# Clean build artifacts
make clean
```

### Creating New Tools

When adding new maintenance tools:

1. **Location**: Place in `tools/` (Node.js) or `scripts/` (Python)
2. **Documentation**: Add README.md explaining usage
3. **Integration**: Add to Makefile if appropriate
4. **Testing**: Include basic error handling and validation
5. **Dependencies**: Update package.json or requirements.txt

---

## Troubleshooting

### Common Issues

#### Build Failures

**Symptom**: `mkdocs build` fails

**Solutions**:
```bash
# Check for syntax errors in mkdocs.yml
python -c "import yaml; yaml.safe_load(open('mkdocs.yml'))"

# Verify all referenced files exist
mkdocs build --verbose

# Check for malformed Markdown
find docs -name "*.md" -exec python -m markdown {} \; > /dev/null
```

#### Broken Links

**Symptom**: Links return 404 errors

**Solutions**:
```bash
# Run link checker
make test-links

# Check for moved/renamed files
git log --follow -- docs/path/to/file.md

# Update links in referencing files
grep -r "old-path" docs/
```

#### Deployment Issues

**Symptom**: GitHub Pages not updating

**Solutions**:
```bash
# Check GitHub Actions status
# Visit: https://github.com/username/movian-docs/actions

# Verify gh-pages branch exists
git branch -r | grep gh-pages

# Manual deployment
mkdocs gh-deploy --force

# Check GitHub Pages settings
# Settings → Pages → Source should be "gh-pages branch"
```

#### Search Not Working

**Symptom**: Search returns no results

**Solutions**:
```bash
# Rebuild search index
mkdocs build --clean

# Check search plugin configuration in mkdocs.yml
# Verify 'search' plugin is enabled

# Clear browser cache and retry
```

### Getting Help

- **Documentation Issues**: Create issue on GitHub repository
- **MkDocs Help**: https://www.mkdocs.org/
- **Material Theme**: https://squidfunk.github.io/mkdocs-material/
- **Movian Project**: https://github.com/andoma/movian

---

## Appendix

### Quick Reference Commands

```bash
# Development
mkdocs serve                    # Start dev server
mkdocs build                    # Build static site
mkdocs build --clean            # Clean build

# Testing
make test                       # Run all tests
make test-examples              # Test code examples
make test-links                 # Check links

# Deployment
mkdocs gh-deploy                # Deploy to GitHub Pages
git push origin master          # Trigger auto-deployment

# Maintenance
pip install --upgrade -r requirements.txt  # Update dependencies
npm update                                 # Update Node packages
make clean                                 # Clean build artifacts

# Version Control
git tag -a v1.1.0 -m "Release v1.1.0"     # Create tag
git push origin v1.1.0                     # Push tag
```

### File Locations

- **Configuration**: `mkdocs.yml`
- **Content**: `docs/`
- **Build Output**: `site/`
- **Workflows**: `.github/workflows/`
- **Tools**: `tools/`, `scripts/`
- **Dependencies**: `requirements.txt`, `package.json`
- **Changelog**: `CHANGELOG.md`
- **Task Reports**: `task-reports/`

### Contact Information

- **Repository**: https://github.com/username/movian-docs
- **Issues**: https://github.com/username/movian-docs/issues
- **Discussions**: https://github.com/username/movian-docs/discussions
- **Movian Project**: https://github.com/andoma/movian

---

*Last Updated: 2024-11-08*
*Version: 1.0.0*
