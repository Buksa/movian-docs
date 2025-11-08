# Documentation Scripts

This directory contains utility scripts for maintaining, validating, and releasing the Movian documentation.

## Available Scripts

### Release Management

#### `create-release.sh` (Linux/Mac)

Automates the release process for documentation versions.

**Usage:**
```bash
# Create release with version and notes
./scripts/create-release.sh 1.1.0 "Added OSD system documentation"

# Create release with default notes
./scripts/create-release.sh 1.1.0
```

**Features:**
- Validates semantic versioning format
- Checks for uncommitted changes
- Runs validation tests
- Builds documentation
- Updates CHANGELOG.md automatically
- Creates annotated Git tag
- Pushes changes and tag to remote
- Provides next steps for GitHub Release

**Requirements:**
- Git
- MkDocs
- Bash shell
- Make (optional, for tests)

#### `create-release.ps1` (Windows)

PowerShell version of the release automation script.

**Usage:**
```powershell
# Create release with version and notes
.\scripts\create-release.ps1 -Version "1.1.0" -ReleaseNotes "Added OSD system documentation"

# Create release with default notes
.\scripts\create-release.ps1 -Version "1.1.0"
```

**Features:**
- Same functionality as bash version
- Native PowerShell implementation
- Windows-compatible commands
- Color-coded output

**Requirements:**
- Git
- MkDocs
- PowerShell 5.0+

### Documentation Maintenance

#### `create-task-report.py`

Automates the creation of task completion reports and progress tracking.

**Usage:**
```bash
python scripts/create-task-report.py <task-id> [task-description]
```

**Examples:**
```bash
# Create report for task 3.3
python scripts/create-task-report.py 3.3 "Create comprehensive glossary"

# Create report for task 4.1
python scripts/create-task-report.py 4.1 "Analyze plugin architecture"
```

**What it does:**
1. Creates a new task report from template in `task-reports/task-[id]-report.md`
2. Updates `PROGRESS.md` with a new completed task entry
3. Provides reminders for next steps (editing details, committing changes)

**Requirements:**
- Python 3.6+
- Run from the `movian-docs` directory root

#### `link-glossary-terms.py`

Automatically links technical terms in documentation to the glossary.

**Usage:**
```bash
# Process all documentation files
python scripts/link-glossary-terms.py

# Check for unlinked terms without modifying files
python scripts/link-glossary-terms.py --check

# Process specific directory
python scripts/link-glossary-terms.py --dir docs/plugins
```

**Features:**
- Scans documentation for glossary terms
- Adds markdown links to glossary entries
- Preserves existing links
- Handles term variations (singular/plural)
- Skips code blocks and existing links

**Configuration:**
Terms are read from `docs/reference/glossary.md`

## Release Workflow

### Standard Release Process

```bash
# 1. Ensure all changes are committed
git status

# 2. Run release script
./scripts/create-release.sh 1.1.0 "Release notes here"

# 3. Script automatically:
#    - Validates version format
#    - Runs tests
#    - Builds documentation
#    - Updates CHANGELOG.md
#    - Creates Git tag
#    - Pushes to remote

# 4. Create GitHub Release manually:
#    - Visit GitHub releases page
#    - Select tag v1.1.0
#    - Add release notes from CHANGELOG.md
#    - Publish release

# 5. Monitor automatic deployment
#    - GitHub Actions deploys to GitHub Pages
#    - Verify at https://username.github.io/movian-docs/
```

### Quick Release (Patch)

```bash
# For minor fixes and corrections
./scripts/create-release.sh 1.0.1 "Fix typos in installation guide"
```

### Major Release

```bash
# For significant updates
./scripts/create-release.sh 2.0.0 "Complete documentation restructure"
```

## Task Completion Workflow

When completing a task, follow this workflow:

### 1. Complete the Task Work
- Implement all required deliverables
- Create/modify documentation files
- Test examples and validate content

### 2. Create Task Report
```bash
python scripts/create-task-report.py [task-id] "[task-description]"
```

### 3. Fill in Report Details
Edit the generated report file to include:
- Specific deliverables and files created
- Key findings and insights
- Challenges encountered and solutions
- Technical implementation details
- Quality assurance checklist

### 4. Update Progress Tracking
Edit `PROGRESS.md` to add:
- Accurate completion duration
- Specific deliverables list
- Any important notes or achievements

### 5. Commit Changes
```bash
git add .
git commit -m "docs: [task-id] - [brief description]

- [List of main deliverables]
- [Key achievements]
- [Any important notes]"
```

## Script Integration

### Makefile Integration

Scripts are integrated into the Makefile:

```bash
# Run tests before release
make test

# Build documentation
make build

# Deploy manually if needed
make deploy
```

### GitHub Actions Integration

Release scripts work with GitHub Actions:

1. **Local**: Run `create-release.sh` to create tag
2. **Automatic**: GitHub Actions detects tag push
3. **Deploy**: Workflow builds and deploys documentation
4. **Verify**: Check deployment status in Actions tab

## Adding New Scripts

When adding new scripts:

1. **Naming**: Use descriptive kebab-case names
2. **Documentation**: Add usage instructions to this README
3. **Shebang**: Include appropriate shebang line
4. **Error Handling**: Implement proper error handling
5. **Help Text**: Provide `--help` option
6. **Testing**: Test with various inputs
7. **Cross-platform**: Consider Windows compatibility

### Script Template (Bash)

```bash
#!/bin/bash
# Script description

set -e  # Exit on error

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --option)
            OPTION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Script logic here
```

### Script Template (PowerShell)

```powershell
# Script description

param(
    [Parameter(Mandatory=$true)]
    [string]$RequiredParam,
    
    [Parameter(Mandatory=$false)]
    [string]$OptionalParam = "default"
)

# Script logic here
```

## Dependencies

### Python Scripts
- Python 3.6+
- Standard library modules (no external dependencies)

### Bash Scripts
- Bash 4.0+
- Git
- MkDocs
- Standard Unix utilities (awk, sed, grep)

### PowerShell Scripts
- PowerShell 5.0+
- Git
- MkDocs

## Best Practices

- **Idempotent**: Scripts should be safe to run multiple times
- **Non-destructive**: Validate before modifying files
- **Verbose**: Provide clear output about actions taken
- **Reversible**: Consider backup or dry-run options
- **Error Handling**: Fail gracefully with helpful messages
- **Documentation**: Keep this README updated

## Examples

### Creating a Release

```bash
# Standard release
./scripts/create-release.sh 1.1.0 "Added OSD documentation and media player guide"

# The script will:
# 1. Validate version format (1.1.0 is valid)
# 2. Check for uncommitted changes
# 3. Run validation tests
# 4. Build documentation
# 5. Update CHANGELOG.md
# 6. Create tag v1.1.0
# 7. Push to remote
# 8. Display next steps
```

### Creating a Task Report

```bash
# Create report for task 4.2
python scripts/create-task-report.py 4.2 "Create comprehensive ECMAScript API reference"

# Output: task-reports/task-4.2-report.md
# Also updates: PROGRESS.md
```

### Linking Glossary Terms

```bash
# Check for unlinked terms
python scripts/link-glossary-terms.py --check

# Link terms in all files
python scripts/link-glossary-terms.py

# Link terms in specific section
python scripts/link-glossary-terms.py --dir docs/plugins
```

## Troubleshooting

### Permission Errors

```bash
# Make scripts executable (Unix/Linux/Mac)
chmod +x scripts/*.sh
chmod +x scripts/*.py

# Windows: Run PowerShell as Administrator if needed
```

### Python Not Found

```bash
# Use python3 explicitly
python3 scripts/create-task-report.py 4.2

# Or create alias
alias python=python3
```

### Git Tag Already Exists

```bash
# Delete local tag
git tag -d v1.1.0

# Delete remote tag
git push origin :refs/tags/v1.1.0

# Recreate tag
./scripts/create-release.sh 1.1.0 "Updated release notes"
```

### Build Failures

```bash
# Test build locally first
mkdocs build --clean

# Check for errors
mkdocs build --verbose

# Validate configuration
python -c "import yaml; yaml.safe_load(open('mkdocs.yml'))"
```

### Release Script Fails

```bash
# Check prerequisites
which git
which mkdocs
which python

# Verify you're in repository root
ls mkdocs.yml

# Check Git status
git status

# Run tests manually
make test
```

## Automation Opportunities

### Pre-commit Hooks

```bash
# Install pre-commit hook
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Scheduled Tasks

```bash
# Weekly link validation (cron)
0 2 * * 0 cd /path/to/movian-docs && make test-links

# Monthly dependency updates
0 3 1 * * cd /path/to/movian-docs && pip install --upgrade -r requirements.txt
```

## Contributing

When contributing new scripts:

1. Follow existing code style
2. Add comprehensive docstrings
3. Update this README
4. Test thoroughly on multiple platforms
5. Consider cross-platform compatibility
6. Add error handling
7. Provide helpful output messages

## Support

For issues or questions:
- Check script `--help` output
- Review this README
- Consult [Update Procedures](../docs/meta/update-procedures.md)
- Consult [Deployment Guide](../docs/meta/deployment-guide.md)
- Create an issue on GitHub
- Contact documentation team

## Related Documentation

- [Update Procedures](../docs/meta/update-procedures.md) - Complete maintenance workflow
- [Deployment Guide](../docs/meta/deployment-guide.md) - Deployment process
- [Deployment Checklist](../docs/meta/deployment-checklist.md) - Pre/post deployment checks
- [Documentation Standards](../docs/meta/documentation-standards.md) - Style guide

---

*Last Updated: 2024-11-08*
