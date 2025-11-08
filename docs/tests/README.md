# Movian Documentation Test Suite

This directory contains automated tests to validate the Movian installation instructions and build process across different platforms.

## Test Scripts

### `run-tests.sh`
Main test runner that executes all available tests including dependency checks, build validation, and plugin integration tests.

**Usage:**
```bash
# Run all tests
./run-tests.sh

# Run only dependency checks
./run-tests.sh --dependency-only

# Run only build validation
./run-tests.sh --build-only

# Run only plugin integration tests
./run-tests.sh --plugin-only

# Include performance benchmarks
./run-tests.sh --performance

# Verbose output
./run-tests.sh --verbose
```

### `run-plugin-tests.sh`
Dedicated plugin integration test runner that validates all plugin examples.

**Usage:**
```bash
# Run plugin integration tests
./run-plugin-tests.sh

# Skip dependency installation
./run-plugin-tests.sh --no-install

# Skip HTML report generation
./run-plugin-tests.sh --no-report

# Verbose output
./run-plugin-tests.sh --verbose
```

### `run-view-syntax-tests.sh`
GLW view file syntax validation test runner that validates documented syntax.

**Usage:**
```bash
# Run view syntax validation tests
./run-view-syntax-tests.sh

# Verbose output
./run-view-syntax-tests.sh --verbose

# Skip HTML report generation
./run-view-syntax-tests.sh --no-report
```

### `run-macro-validation.sh`
GLW macro usage validation test runner that validates macro definitions and usage patterns.

**Usage:**
```bash
# Run macro validation tests
./run-macro-validation.sh

# Verbose output
./run-macro-validation.sh --verbose

# Validate specific skin
./run-macro-validation.sh --skin-path=../ui/theming/examples/minimal-skin

# Skip HTML report generation
./run-macro-validation.sh --no-report
```

### `run-skin-structure-validation.sh`
GLW skin structure validation test runner that validates skin directory organization.

**Usage:**
```bash
# Run skin structure validation tests
./run-skin-structure-validation.sh

# Verbose output
./run-skin-structure-validation.sh --verbose

# Validate specific skin
./run-skin-structure-validation.sh --skin-path=../ui/theming/examples/advanced-skin

# Skip HTML report generation
./run-skin-structure-validation.sh --no-report
```

### `run-qa-validation.sh`
Comprehensive quality assurance validation runner that executes all validation checks.

**Usage:**
```bash
# Run all QA validation checks
./run-qa-validation.sh

# Verbose output
./run-qa-validation.sh --verbose

# Skip dependency installation
./run-qa-validation.sh --skip-install

# Check external links (slower)
./run-qa-validation.sh --check-external

# Skip HTML report generation
./run-qa-validation.sh --no-report
```

### `plugin-integration-tests.js`
Node.js script that performs comprehensive integration testing of plugin examples.

**Features:**
- Plugin manifest validation (plugin.json)
- JavaScript syntax and API usage validation
- Simulated Movian environment testing
- Plugin loading and initialization verification
- Service registration and route handling tests
- Error handling validation
- Comprehensive HTML and JSON reporting

**Usage:**
```bash
# Run integration tests directly
node plugin-integration-tests.js

# Or use npm script
npm run validate
```

### `view-syntax-validator.js`
Node.js script that validates GLW view file syntax against documented syntax rules.

**Features:**
- Lexical element validation (comments, strings, numbers)
- Operator syntax validation (all operator types)
- Expression syntax validation (static and dynamic)
- Property reference validation
- Widget definition validation
- Preprocessor directive validation
- Macro syntax validation
- Advanced feature validation (cloner, events, loader)
- Comprehensive JSON and HTML reporting

**Usage:**
```bash
# Run syntax validation directly
node view-syntax-validator.js

# With verbose output
node view-syntax-validator.js --verbose

# Or use npm script
npm run validate:view-syntax
```

### `macro-validator.js`
Node.js script that validates macro definitions and usage in view files.

**Features:**
- Macro definition syntax validation
- Parameter naming convention checking (UPPER_CASE)
- Macro naming convention checking (PascalCase)
- Required vs optional parameter ordering validation
- Macro invocation validation
- Category-based macro organization checking
- Cross-file macro usage validation
- Comprehensive JSON and HTML reporting

**Usage:**
```bash
# Run macro validation directly
node macro-validator.js

# With verbose output
node macro-validator.js --verbose

# Validate specific skin
node macro-validator.js --skin-path=../ui/theming/examples/minimal-skin
```

### `skin-structure-validator.js`
Node.js script that validates skin directory structure and organization.

**Features:**
- Automatic skin complexity level detection (minimal/standard/advanced)
- Required file validation (universe.view, theme.view, README.md)
- Recommended file checking
- Directory organization validation
- View file syntax checking
- Structure analysis and reporting
- Size and organization recommendations
- Comprehensive JSON and HTML reporting

**Usage:**
```bash
# Run skin structure validation directly
node skin-structure-validator.js

# With verbose output
node skin-structure-validator.js --verbose

# Validate specific skin
node skin-structure-validator.js --skin-path=../ui/theming/examples/advanced-skin
```

### `file-reference-validator.js`
Node.js script that validates file references and line numbers in documentation.

**Features:**
- Extracts file references from markdown documentation
- Validates file existence in Movian repository
- Checks line number validity and ranges
- Supports multiple reference formats
- Comprehensive JSON reporting

**Usage:**
```bash
# Run file reference validation
node file-reference-validator.js

# With verbose output
node file-reference-validator.js --verbose

# Specify custom Movian source location
node file-reference-validator.js --movian-root=/path/to/movian
```

### `link-validator.js`
Node.js script that validates internal and external links in documentation.

**Features:**
- Validates markdown links, reference-style links, and HTML links
- Checks internal file references
- Validates anchor links to headers
- Optional external link checking
- Identifies broken links with location information
- Comprehensive JSON reporting

**Usage:**
```bash
# Run link validation
node link-validator.js

# With verbose output
node link-validator.js --verbose

# Check external links (slower)
node link-validator.js --check-external
```

### `cross-reference-validator.js`
Node.js script that validates cross-references between related documentation sections.

**Features:**
- Validates expected cross-references between related docs
- Checks API documentation completeness
- Identifies orphaned files not referenced by other docs
- Ensures documentation consistency
- Comprehensive JSON reporting

**Usage:**
```bash
# Run cross-reference validation
node cross-reference-validator.js

# With verbose output
node cross-reference-validator.js --verbose
```

### `dependency-check.py`
Python script that validates all required dependencies are available for building Movian.

**Features:**
- Detects platform and distribution automatically
- Checks for required build tools (gcc, make, git, etc.)
- Validates library availability via pkg-config
- Tests compiler support for C99/C++11
- Generates platform-specific installation commands
- Outputs results in human-readable or JSON format

**Usage:**
```bash
# Basic dependency check
python3 dependency-check.py

# Save results to JSON
python3 dependency-check.py --json results.json

# Quiet mode (errors only)
python3 dependency-check.py --quiet
```

### `build-validation.sh`
Comprehensive build validation script that tests the complete build process.

**Features:**
- Clones Movian repository
- Tests configure script with various options
- Performs full compilation
- Validates binary functionality
- Checks library dependencies
- Platform-specific testing
- Performance benchmarking (optional)

**Usage:**
```bash
# Basic build validation
./build-validation.sh

# Include performance tests
./build-validation.sh --performance
```

## GitHub Actions Integration

The `.github/workflows/build-validation.yml` workflow automatically runs these tests on:

- **Push/PR**: When installation documentation is modified
- **Schedule**: Weekly on Sundays at 2 AM UTC
- **Manual**: Via workflow dispatch with optional performance testing

### Tested Platforms

| Platform | Versions | Status |
|----------|----------|--------|
| **Ubuntu** | 20.04, 22.04 | ✅ Automated |
| **Fedora** | Latest | ✅ Automated |
| **macOS** | 11, 12, 13 | ✅ Automated |
| **Cross-compilation** | ARM | ✅ Limited testing |

## Quality Assurance Validation

The comprehensive QA validation system ensures documentation accuracy and consistency through multiple validation checks:

### Validation Checks

| Check | Purpose | Validator |
|-------|---------|-----------|
| **File References** | Validates source code file references and line numbers | `file-reference-validator.js` |
| **Links** | Checks internal and external links | `link-validator.js` |
| **Cross-References** | Validates cross-references between docs | `cross-reference-validator.js` |
| **Plugin Integration** | Tests plugin examples | `plugin-integration-tests.js` |
| **View Syntax** | Validates GLW view file syntax | `view-syntax-validator.js` |
| **Macros** | Validates macro definitions and usage | `macro-validator.js` |
| **Skin Structure** | Validates skin directory organization | `skin-structure-validator.js` |

### Running QA Validation

```bash
# Run all QA validation checks
./run-qa-validation.sh

# With verbose output
./run-qa-validation.sh --verbose

# Check external links (slower)
./run-qa-validation.sh --check-external
```

### QA Validation Results

Results are generated in multiple formats:

- **Console Output**: Real-time validation progress and summary
- **JSON Reports**: Machine-readable detailed results in `results/` directory
- **HTML Report**: Consolidated visual report (`results/qa-validation-report.html`)

### Accuracy Tracking

The QA system supports comprehensive accuracy tracking:

- **Source Reference Validation**: Ensures file references point to existing files
- **Line Number Validation**: Verifies line numbers are within valid ranges
- **Link Integrity**: Checks all internal and external links
- **Cross-Reference Consistency**: Validates related documentation sections reference each other
- **Version Compatibility**: Tracks Movian version compatibility

For more information, see:
- [Source Reference Tracking](../meta/source-references.md)
- [Accuracy Tracking System](../meta/accuracy-tracking.md)

## Plugin Integration Testing

The test suite includes comprehensive integration testing for all plugin examples to ensure they:

- Have valid plugin.json manifests with required fields
- Use correct JavaScript syntax and Movian API patterns
- Can load and initialize in a simulated Movian environment
- Properly register services and handle routes
- Include appropriate error handling
- Follow documented best practices

### Plugin Test Types

| Test Type | Description | Validation |
|-----------|-------------|------------|
| **Manifest Validation** | Checks plugin.json structure | Required fields, valid types, API version |
| **Structure Validation** | Verifies file organization | Required files (main.js, README.md) |
| **Syntax Validation** | JavaScript syntax checking | Parse validation, basic syntax errors |
| **API Usage** | Movian API pattern validation | Required imports, service creation, routes |
| **Loading Simulation** | Mock environment execution | Plugin initialization, error handling |
| **Service Registration** | Service creation testing | Service.create() calls, proper registration |
| **Route Handling** | Route definition validation | page.Route usage, URI handling |
| **Error Handling** | Exception handling testing | try/catch blocks, graceful failures |

### Plugin Test Results

Test results are generated in multiple formats:

- **Console Output**: Real-time test progress and summary
- **JSON Report**: Machine-readable detailed results (`results/integration-test-report.json`)
- **HTML Report**: Human-readable visual report (`results/integration-test-report.html`)

## Running Tests Locally

### Prerequisites

- **Python 3.6+** - For dependency checking
- **Node.js 12+** - For plugin integration tests
- **npm** - For JavaScript dependencies
- **Bash** - For shell scripts (Linux/macOS)
- **Git** - For repository cloning
- **Internet connection** - For downloading Movian source

### Linux/macOS

```bash
# Make scripts executable
chmod +x tests/*.sh tests/*.py

# Run all tests
cd movian-docs
tests/run-tests.sh

# Or run individual tests
python3 tests/dependency-check.py
tests/build-validation.sh
```

### Windows (MSYS2/Git Bash)

```bash
# In MSYS2 or Git Bash terminal
cd movian-docs
bash tests/run-tests.sh

# Or run individual tests
python tests/dependency-check.py
bash tests/build-validation.sh
```

## Test Results

### Dependency Check Results

The dependency checker provides detailed information about:

- **Build Tools**: gcc, make, git, pkg-config, yasm
- **Required Libraries**: freetype2, fontconfig, x11 (Linux)
- **Optional Libraries**: openssl, pulseaudio, webkit, sqlite3
- **Compiler Features**: C99 and C++11 support

**Example Output:**
```
Movian Dependency Check Results
==================================================
Platform: linux (ubuntu 20.04)
Architecture: x86_64

Build Tools:
  ✓ git (2.25.1)
  ✓ make (4.2.1)
  ✓ gcc (9.4.0)
  ✓ pkg-config (0.29.1)
  ✓ yasm (1.3.0)

Required Libraries:
  ✓ freetype2 (23.1.17)
  ✓ fontconfig (2.13.1)
  ✓ x11 (1.6.9)

✓ Ready to build Movian!
```

### Build Validation Results

The build validator tests the complete workflow:

1. **Repository Cloning** - Tests git clone functionality
2. **Configuration** - Tests ./configure with various options
3. **Compilation** - Full build with parallel jobs
4. **Binary Validation** - Tests executable and dependencies
5. **Platform Testing** - Platform-specific functionality

**Example Output:**
```
[PASS] Repository cloned successfully
[PASS] Basic configure completed successfully
[PASS] Compilation completed successfully
[PASS] Binary created successfully: build.linux/movian
[PASS] All library dependencies satisfied

================================
    BUILD VALIDATION REPORT
================================
Platform: linux (ubuntu)
Total Tests: 8
Passed: 8
Failed: 0

✓ ALL TESTS PASSED
The installation instructions work correctly on this platform.
```

## Continuous Integration

### Workflow Triggers

The GitHub Actions workflow runs on:

- **Code Changes**: Push/PR to main branch affecting installation docs
- **Scheduled**: Weekly validation to catch environment changes
- **Manual**: On-demand testing with optional performance benchmarks

### Artifact Collection

Each test run produces artifacts:

- **Build Logs**: Complete compilation output
- **Dependency Reports**: JSON format dependency analysis
- **Test Results**: Pass/fail status for each platform
- **Performance Data**: Build timing and resource usage (if enabled)

### Failure Handling

When tests fail:

1. **Logs are preserved** in GitHub Actions artifacts
2. **Detailed error messages** are provided in the workflow output
3. **Platform-specific issues** are isolated and reported separately
4. **Suggested fixes** are included in dependency check output

## Adding New Tests

### Test Structure

Each test should:

1. **Be self-contained** - No external dependencies beyond documented requirements
2. **Provide clear output** - Success/failure with descriptive messages
3. **Clean up after itself** - Remove temporary files and directories
4. **Handle errors gracefully** - Don't leave system in broken state
5. **Be platform-aware** - Handle differences between Linux/macOS/Windows

### Example Test Function

```bash
test_new_feature() {
    info "Testing new feature..."
    
    # Setup
    local test_dir="/tmp/test-$$"
    mkdir -p "$test_dir"
    
    # Test logic
    if some_test_command; then
        success "New feature test passed"
        return 0
    else
        error "New feature test failed"
        return 1
    fi
    
    # Cleanup
    rm -rf "$test_dir"
}
```

### Integration

1. Add test function to appropriate script
2. Call from main test runner
3. Update documentation
4. Test on multiple platforms
5. Add to CI workflow if needed

## Troubleshooting Tests

### Common Issues

#### Permission Errors
```bash
# Make scripts executable
chmod +x tests/*.sh tests/*.py

# Or run with explicit interpreter
bash tests/build-validation.sh
python3 tests/dependency-check.py
```

#### Missing Dependencies
```bash
# Install Python 3
sudo apt-get install python3  # Ubuntu/Debian
brew install python3          # macOS

# Install Git
sudo apt-get install git      # Ubuntu/Debian
brew install git              # macOS
```

#### Network Issues
```bash
# Test internet connectivity
ping -c 1 github.com

# Check proxy settings if behind corporate firewall
git config --global http.proxy http://proxy:port
```

#### Disk Space
```bash
# Check available space (need ~2GB for build)
df -h

# Clean up if needed
rm -rf /tmp/movian-build-test-*
```

### Getting Help

If tests fail on your platform:

1. **Check the logs** - Look for specific error messages
2. **Run dependency check** - Ensure all requirements are met
3. **Try manual build** - Follow installation guide step by step
4. **Report issues** - Create GitHub issue with test output
5. **Ask community** - Post in Movian forum with details

---

**Accuracy Status:** 🟢 Verified test scripts  
**Last Updated:** November 2025  
**Platforms Tested:** Ubuntu 20.04+, Fedora 34+, macOS 11+