# Movian Documentation Test Suite

This directory contains automated tests to validate the Movian installation instructions and build process across different platforms.

## Test Scripts

### `run-tests.sh`
Main test runner that executes all available tests.

**Usage:**
```bash
# Run all tests
./run-tests.sh

# Run only dependency checks
./run-tests.sh --dependency-only

# Run only build validation
./run-tests.sh --build-only

# Include performance benchmarks
./run-tests.sh --performance

# Verbose output
./run-tests.sh --verbose
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

## Running Tests Locally

### Prerequisites

- **Python 3.6+** - For dependency checking
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