# Deployment Checklist

## Overview

This checklist ensures all necessary steps are completed before deploying documentation updates. Use this for both routine updates and major releases.

---

## Pre-Deployment Checklist

### Content Validation

- [ ] **Accuracy Review**: All technical information verified against source code
- [ ] **Completeness**: All sections complete with no TODO markers
- [ ] **Grammar & Spelling**: Content proofread for errors
- [ ] **Formatting**: Consistent formatting throughout
- [ ] **Code Examples**: All code examples syntactically correct
- [ ] **Links**: All internal and external links functional
- [ ] **Images**: All images display correctly with alt text
- [ ] **Diagrams**: Mermaid diagrams render properly

### Technical Validation

```bash
# Run all validation tests
make test

# Specific tests
make test-examples      # Validate code syntax
make test-links         # Check all links
make test-references    # Validate source references (if MOVIAN_SOURCE set)

# Build documentation
mkdocs build --clean

# Serve locally for review
mkdocs serve
```

- [ ] **Build Success**: `mkdocs build` completes without errors
- [ ] **No Warnings**: Build produces no warnings
- [ ] **Local Preview**: Documentation reviewed at http://127.0.0.1:8000
- [ ] **Navigation**: All pages accessible through navigation
- [ ] **Search**: Search functionality works correctly
- [ ] **Mobile View**: Responsive design verified

### Version Control

- [ ] **Clean Working Directory**: No uncommitted changes (or intentionally staged)
- [ ] **Correct Branch**: On appropriate branch (master for production)
- [ ] **Changelog Updated**: CHANGELOG.md includes new changes
- [ ] **Commit Messages**: Descriptive semantic commit messages
- [ ] **Version Tag**: Tag created for releases (if applicable)

### Documentation Standards

- [ ] **Style Guide**: Follows [Documentation Standards](documentation-standards.md)
- [ ] **Glossary**: New technical terms added to glossary
- [ ] **Cross-References**: Related sections properly linked
- [ ] **API Documentation**: API changes documented with examples
- [ ] **Deprecations**: Deprecated features clearly marked

---

## Deployment Execution

### Automatic Deployment (Recommended)

```bash
# 1. Ensure all changes committed
git status

# 2. Push to master branch
git push origin master

# 3. Monitor deployment
# Visit: https://github.com/username/movian-docs/actions
```

- [ ] **Push Successful**: Changes pushed to remote
- [ ] **Workflow Triggered**: GitHub Actions workflow started
- [ ] **Build Job**: Build job completes successfully
- [ ] **Deploy Job**: Deploy job completes successfully
- [ ] **No Errors**: No errors in workflow logs

### Manual Deployment (If Needed)

```bash
# Deploy from local machine
mkdocs gh-deploy

# Or with custom message
mkdocs gh-deploy -m "Deploy: [description]"
```

- [ ] **Deployment Command**: Command executed successfully
- [ ] **gh-pages Branch**: gh-pages branch updated
- [ ] **Push Successful**: Changes pushed to remote

---

## Post-Deployment Verification

### Immediate Checks (Within 5 Minutes)

```bash
# Check site accessibility
curl -I https://username.github.io/movian-docs/

# Check specific updated pages
curl -I https://username.github.io/movian-docs/path/to/updated/page/
```

- [ ] **Site Accessible**: Homepage loads (HTTP 200)
- [ ] **Updated Pages**: New/updated pages accessible
- [ ] **No 404 Errors**: All expected pages return 200
- [ ] **Deployment Time**: Site updated within expected timeframe

### Functional Verification

- [ ] **Homepage**: Main page displays correctly
- [ ] **Navigation Menu**: All menu items work
- [ ] **Search**: Search returns relevant results
- [ ] **Internal Links**: Sample internal links work
- [ ] **External Links**: Sample external links work
- [ ] **Code Blocks**: Syntax highlighting applied
- [ ] **Mermaid Diagrams**: Diagrams render correctly
- [ ] **Images**: Images load properly
- [ ] **Dark/Light Mode**: Theme switching works

### Cross-Browser Testing

- [ ] **Chrome/Edge**: Site works in Chromium browsers
- [ ] **Firefox**: Site works in Firefox
- [ ] **Safari**: Site works in Safari (if available)
- [ ] **Mobile Browser**: Site works on mobile devices

### Performance Verification

```bash
# Check page load time
curl -w "@curl-format.txt" -o /dev/null -s https://username.github.io/movian-docs/

# curl-format.txt:
# time_total: %{time_total}s
```

- [ ] **Load Time**: Pages load in < 3 seconds
- [ ] **Search Index**: Search index loads quickly
- [ ] **Images**: Images optimized and load quickly
- [ ] **No Console Errors**: Browser console shows no errors

### Accessibility Verification

- [ ] **Keyboard Navigation**: Can navigate with keyboard only
- [ ] **Screen Reader**: Content accessible to screen readers
- [ ] **Color Contrast**: Sufficient contrast ratios
- [ ] **Alt Text**: Images have descriptive alt text
- [ ] **Semantic HTML**: Proper heading hierarchy

---

## Release-Specific Checklist

### For Version Releases (v1.x.x)

- [ ] **Version Tag**: Git tag created (e.g., v1.1.0)
- [ ] **CHANGELOG.md**: Updated with release notes
- [ ] **GitHub Release**: Release created on GitHub
- [ ] **Release Notes**: Comprehensive release notes written
- [ ] **Assets**: Any supplementary files attached
- [ ] **Announcement**: Release announced (if applicable)

### Release Creation

```bash
# Using automated script
./scripts/create-release.sh 1.1.0 "Release notes"

# Or manually
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

- [ ] **Tag Created**: Version tag exists
- [ ] **Tag Pushed**: Tag pushed to remote
- [ ] **GitHub Release**: Release page created
- [ ] **Release Published**: Release marked as published

---

## Rollback Checklist

### If Issues Detected Post-Deployment

#### Quick Rollback

```bash
# Option 1: Revert commit
git revert <commit-hash>
git push origin master

# Option 2: Deploy previous version
git checkout v1.0.0
mkdocs gh-deploy --force
git checkout master
```

- [ ] **Issue Identified**: Problem clearly identified
- [ ] **Rollback Decision**: Decision made to rollback
- [ ] **Rollback Executed**: Rollback command executed
- [ ] **Verification**: Previous version restored
- [ ] **Issue Documented**: Problem documented for future reference

#### Post-Rollback

- [ ] **Root Cause**: Root cause identified
- [ ] **Fix Prepared**: Fix developed and tested locally
- [ ] **Re-deployment**: Fixed version deployed
- [ ] **Verification**: Fix verified in production
- [ ] **Documentation**: Incident documented

---

## Monitoring Checklist

### First 24 Hours

- [ ] **Error Monitoring**: Check for 404 errors in logs
- [ ] **User Feedback**: Monitor issues and discussions
- [ ] **Analytics**: Review page views and search queries
- [ ] **Performance**: Monitor page load times
- [ ] **Availability**: Ensure site remains accessible

### First Week

- [ ] **Search Queries**: Review search terms for content gaps
- [ ] **Popular Pages**: Identify most-visited pages
- [ ] **Bounce Rate**: Check if users finding what they need
- [ ] **External Links**: Verify external links still valid
- [ ] **User Issues**: Address any reported issues

---

## Emergency Deployment Checklist

### For Critical Fixes

Streamlined checklist for urgent deployments:

- [ ] **Issue Severity**: Confirmed as critical (site down, major error, security)
- [ ] **Minimal Fix**: Fix is minimal and targeted
- [ ] **Local Test**: Fix tested locally
- [ ] **Quick Build**: `mkdocs build` succeeds
- [ ] **Deploy**: Deployed via fastest method
- [ ] **Verify**: Fix verified in production
- [ ] **Notify**: Team notified of emergency deployment
- [ ] **Follow-up**: Proper review scheduled

```bash
# Emergency deployment workflow
git checkout -b hotfix/critical-issue
# Make minimal fix
mkdocs build
mkdocs gh-deploy --force
# Verify fix
git checkout master
git merge hotfix/critical-issue
git push origin master
```

---

## Checklist Templates

### Routine Update Template

```markdown
## Deployment: [Date] - [Brief Description]

### Pre-Deployment
- [ ] Content validated
- [ ] Tests passed
- [ ] Local preview reviewed
- [ ] Changes committed

### Deployment
- [ ] Pushed to master
- [ ] Workflow succeeded
- [ ] Site updated

### Verification
- [ ] Homepage loads
- [ ] Updated pages accessible
- [ ] Navigation works
- [ ] Search functional

### Notes
- [Any relevant notes]
```

### Release Template

```markdown
## Release: v[X.Y.Z] - [Date]

### Pre-Release
- [ ] All tests passed
- [ ] CHANGELOG.md updated
- [ ] Version tag created
- [ ] Release notes prepared

### Release
- [ ] Tag pushed
- [ ] Auto-deployment succeeded
- [ ] GitHub release created
- [ ] Release published

### Post-Release
- [ ] Site verified
- [ ] All features working
- [ ] No critical issues
- [ ] Announcement sent

### Metrics
- Pages added: [N]
- Pages updated: [N]
- Issues resolved: [N]
```

---

## Automation

### Pre-Commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Pre-commit validation

echo "Running pre-commit checks..."

# Check for TODO markers
if git diff --cached | grep -i "TODO\|FIXME\|XXX"; then
    echo "Warning: TODO markers found in staged changes"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Validate Markdown syntax
find docs -name "*.md" -exec python -m markdown {} \; > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Markdown syntax errors found"
    exit 1
fi

echo "Pre-commit checks passed"
```

### CI/CD Integration

GitHub Actions automatically runs:
- Build validation
- Link checking
- Code example testing
- Deployment (on master)

---

## Contact & Support

### Resources

- **Update Procedures**: [update-procedures.md](update-procedures.md)
- **Deployment Guide**: [deployment-guide.md](deployment-guide.md)
- **Documentation Standards**: [documentation-standards.md](documentation-standards.md)

### Getting Help

- **GitHub Issues**: Report problems or ask questions
- **Discussions**: Community discussions and Q&A
- **Documentation**: Review MkDocs and Material theme docs

---

*Last Updated: 2024-11-08*
*Version: 1.0.0*
