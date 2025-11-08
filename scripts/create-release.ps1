# Movian Documentation Release Creation Script (PowerShell)
# This script automates the release process for documentation

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$ReleaseNotes = ""
)

# Colors for output
function Write-Header {
    param([string]$Message)
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# Validate version format (semantic versioning)
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-ErrorMsg "Invalid version format. Use semantic versioning (e.g., 1.1.0)"
    exit 1
}

if ([string]::IsNullOrEmpty($ReleaseNotes)) {
    $ReleaseNotes = "Release version $Version"
}

Write-Header "Movian Documentation Release v$Version"

# Check if we're in the correct directory
if (-not (Test-Path "mkdocs.yml")) {
    Write-ErrorMsg "mkdocs.yml not found. Run this script from the repository root."
    exit 1
}

# Check for uncommitted changes
Write-Info "Checking for uncommitted changes..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "You have uncommitted changes"
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-ErrorMsg "Release cancelled"
        exit 1
    }
}

# Check if tag already exists
Write-Info "Checking if tag v$Version already exists..."
$tagExists = git tag -l "v$Version"
if ($tagExists) {
    Write-ErrorMsg "Tag v$Version already exists"
    exit 1
}

# Run tests
Write-Info "Running validation tests..."
if (Get-Command make -ErrorAction SilentlyContinue) {
    try {
        make test-examples 2>$null
        Write-Success "Code examples validated"
    } catch {
        Write-Warning "Code example validation failed or not available"
    }
    
    try {
        make test-links 2>$null
        Write-Success "Links validated"
    } catch {
        Write-Warning "Link validation failed or not available"
    }
} else {
    Write-Warning "Make not available, skipping automated tests"
}

# Build documentation
Write-Info "Building documentation..."
try {
    mkdocs build --clean
    Write-Success "Documentation built successfully"
} catch {
    Write-ErrorMsg "Documentation build failed"
    exit 1
}

# Update CHANGELOG.md
Write-Info "Updating CHANGELOG.md..."
if (Test-Path "CHANGELOG.md") {
    $releaseDate = Get-Date -Format "yyyy-MM-dd"
    $changelog = Get-Content "CHANGELOG.md" -Raw
    
    # Insert new release entry after [Unreleased]
    $newEntry = @"

## [$Version] - $releaseDate

$ReleaseNotes

"@
    
    $changelog = $changelog -replace '(## \[Unreleased\].*?)(\n## \[)', "`$1$newEntry`$2"
    
    Set-Content "CHANGELOG.md" -Value $changelog
    Write-Success "CHANGELOG.md updated"
} else {
    Write-Warning "CHANGELOG.md not found, skipping"
}

# Show changes to be committed
Write-Info "Changes to be committed:"
git status --short

# Confirm release
Write-Host ""
Write-Warning "Ready to create release v$Version"
Write-Host "Release notes: $ReleaseNotes"
Write-Host ""
$proceed = Read-Host "Proceed with release? (y/n)"
if ($proceed -ne 'y' -and $proceed -ne 'Y') {
    Write-ErrorMsg "Release cancelled"
    exit 1
}

# Commit CHANGELOG if modified
if (Test-Path "CHANGELOG.md") {
    $changelogModified = git diff --name-only | Select-String "CHANGELOG.md"
    if ($changelogModified) {
        Write-Info "Committing CHANGELOG.md..."
        git add CHANGELOG.md
        git commit -m "docs: prepare release v$Version"
        Write-Success "CHANGELOG.md committed"
    }
}

# Create annotated tag
Write-Info "Creating tag v$Version..."
$tagMessage = @"
Release v$Version

$ReleaseNotes

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

git tag -a "v$Version" -m $tagMessage
Write-Success "Tag v$Version created"

# Push changes and tag
Write-Info "Pushing to remote..."
git push origin master
git push origin "v$Version"
Write-Success "Changes and tag pushed to remote"

# Display next steps
Write-Header "Release v$Version Created Successfully!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "1. GitHub Actions will automatically deploy the documentation"

$repoUrl = git config --get remote.origin.url
$repoPath = $repoUrl -replace '.*github\.com[:/](.*?)\.git', '$1'

Write-Host "2. Monitor deployment: https://github.com/$repoPath/actions"
Write-Host "3. Create GitHub Release:"
Write-Host "   - Go to: https://github.com/$repoPath/releases/new"
Write-Host "   - Select tag: v$Version"
Write-Host "   - Add release notes from CHANGELOG.md"
Write-Host "   - Publish release"
Write-Host ""

$siteUrl = Select-String -Path "mkdocs.yml" -Pattern "site_url:" | ForEach-Object { $_.Line -replace '.*site_url:\s*', '' }
Write-Success "Documentation will be available at: $siteUrl"
Write-Host ""

# Optional: Open GitHub releases page
$openBrowser = Read-Host "Open GitHub releases page? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Process "https://github.com/$repoPath/releases/new?tag=v$Version"
}

Write-Success "Release process complete!"
