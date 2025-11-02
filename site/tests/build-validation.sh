#!/bin/bash
#
# Movian Build Validation Test Suite
#
# This script validates that the installation instructions work correctly
# on various platforms and configurations.
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="/tmp/movian-build-test-$$"
MOVIAN_REPO="https://github.com/andoma/movian.git"
LOG_FILE="$TEST_DIR/build-test.log"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Utility functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"
    ((TESTS_PASSED++))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$1")
}

cleanup() {
    if [ -d "$TEST_DIR" ]; then
        log "Cleaning up test directory: $TEST_DIR"
        rm -rf "$TEST_DIR"
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Platform detection
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM="linux"
        if command -v apt-get >/dev/null 2>&1; then
            DISTRO="debian"
        elif command -v dnf >/dev/null 2>&1; then
            DISTRO="fedora"
        elif command -v yum >/dev/null 2>&1; then
            DISTRO="rhel"
        elif command -v pacman >/dev/null 2>&1; then
            DISTRO="arch"
        elif command -v zypper >/dev/null 2>&1; then
            DISTRO="opensuse"
        else
            DISTRO="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
        DISTRO="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        PLATFORM="windows"
        DISTRO="windows"
    else
        PLATFORM="unknown"
        DISTRO="unknown"
    fi
    
    info "Detected platform: $PLATFORM ($DISTRO)"
}

# Test dependency checking
test_dependencies() {
    info "Testing dependency detection..."
    
    local required_tools=("git" "make" "gcc" "pkg-config")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -eq 0 ]; then
        success "All required build tools are available"
    else
        error "Missing required tools: ${missing_tools[*]}"
        return 1
    fi
    
    # Test pkg-config functionality
    if pkg-config --version >/dev/null 2>&1; then
        success "pkg-config is functional"
    else
        error "pkg-config is not working properly"
        return 1
    fi
    
    return 0
}

# Test library detection
test_library_detection() {
    info "Testing library detection..."
    
    local required_libs=("freetype2" "fontconfig")
    local optional_libs=("openssl" "x11" "xext")
    local missing_required=()
    local missing_optional=()
    
    for lib in "${required_libs[@]}"; do
        if ! pkg-config --exists "$lib" 2>/dev/null; then
            missing_required+=("$lib")
        fi
    done
    
    for lib in "${optional_libs[@]}"; do
        if ! pkg-config --exists "$lib" 2>/dev/null; then
            missing_optional+=("$lib")
        fi
    done
    
    if [ ${#missing_required[@]} -eq 0 ]; then
        success "All required libraries are available"
    else
        error "Missing required libraries: ${missing_required[*]}"
        return 1
    fi
    
    if [ ${#missing_optional[@]} -gt 0 ]; then
        warning "Missing optional libraries: ${missing_optional[*]}"
    fi
    
    return 0
}

# Test repository cloning
test_repository_clone() {
    info "Testing repository cloning..."
    
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    if git clone --depth 1 "$MOVIAN_REPO" movian 2>>"$LOG_FILE"; then
        success "Repository cloned successfully"
        return 0
    else
        error "Failed to clone repository"
        return 1
    fi
}

# Test configure script
test_configure() {
    info "Testing configure script..."
    
    cd "$TEST_DIR/movian"
    
    # Test basic configure
    if ./configure 2>>"$LOG_FILE"; then
        success "Basic configure completed successfully"
    else
        error "Basic configure failed"
        return 1
    fi
    
    # Test configure with options
    if ./configure --disable-webkit --disable-vdpau 2>>"$LOG_FILE"; then
        success "Configure with options completed successfully"
    else
        warning "Configure with options failed (may be platform-specific)"
    fi
    
    # Check if config.mak was generated
    if [ -f "build.${PLATFORM}/config.mak" ]; then
        success "Configuration file generated"
    else
        error "Configuration file not generated"
        return 1
    fi
    
    return 0
}

# Test compilation
test_compilation() {
    info "Testing compilation..."
    
    cd "$TEST_DIR/movian"
    
    # Determine number of jobs
    if command -v nproc >/dev/null 2>&1; then
        JOBS=$(nproc)
    elif command -v sysctl >/dev/null 2>&1; then
        JOBS=$(sysctl -n hw.ncpu)
    else
        JOBS=2
    fi
    
    # Limit jobs to prevent resource exhaustion in CI
    if [ "$JOBS" -gt 4 ]; then
        JOBS=4
    fi
    
    info "Compiling with $JOBS parallel jobs..."
    
    # Set timeout for compilation (30 minutes)
    if timeout 1800 make -j"$JOBS" 2>>"$LOG_FILE"; then
        success "Compilation completed successfully"
    else
        error "Compilation failed or timed out"
        return 1
    fi
    
    # Check if binary was created
    local binary_path="build.${PLATFORM}/movian"
    if [ "$PLATFORM" = "macos" ]; then
        binary_path="build.osx/Movian.app/Contents/MacOS/movian"
    fi
    
    if [ -f "$binary_path" ]; then
        success "Binary created successfully: $binary_path"
    else
        error "Binary not found: $binary_path"
        return 1
    fi
    
    return 0
}

# Test binary functionality
test_binary_functionality() {
    info "Testing binary functionality..."
    
    cd "$TEST_DIR/movian"
    
    local binary_path="build.${PLATFORM}/movian"
    if [ "$PLATFORM" = "macos" ]; then
        binary_path="build.osx/Movian.app/Contents/MacOS/movian"
    fi
    
    # Test binary execution (version check)
    if timeout 10 "$binary_path" --version 2>>"$LOG_FILE" >/dev/null; then
        success "Binary executes and responds to --version"
    else
        warning "Binary version check failed (may require display)"
    fi
    
    # Test library dependencies
    if command -v ldd >/dev/null 2>&1; then
        if ldd "$binary_path" 2>>"$LOG_FILE" | grep -q "not found"; then
            error "Binary has missing library dependencies"
            ldd "$binary_path" | grep "not found" | tee -a "$LOG_FILE"
            return 1
        else
            success "All library dependencies satisfied"
        fi
    elif command -v otool >/dev/null 2>&1; then
        # macOS dependency check
        if otool -L "$binary_path" 2>>"$LOG_FILE" >/dev/null; then
            success "Binary dependencies checked (macOS)"
        else
            warning "Could not check binary dependencies on macOS"
        fi
    fi
    
    return 0
}

# Test installation
test_installation() {
    info "Testing installation..."
    
    cd "$TEST_DIR/movian"
    
    # Test dry-run installation
    if make -n install 2>>"$LOG_FILE" >/dev/null; then
        success "Installation dry-run completed"
    else
        warning "Installation dry-run failed"
    fi
    
    # We don't actually install to avoid requiring root privileges
    # and potentially interfering with system
    
    return 0
}

# Platform-specific tests
test_platform_specific() {
    info "Running platform-specific tests..."
    
    case "$PLATFORM" in
        "linux")
            test_linux_specific
            ;;
        "macos")
            test_macos_specific
            ;;
        "windows")
            test_windows_specific
            ;;
        *)
            warning "No platform-specific tests for $PLATFORM"
            ;;
    esac
}

test_linux_specific() {
    info "Running Linux-specific tests..."
    
    # Test X11 availability (if not headless)
    if [ -n "$DISPLAY" ]; then
        if command -v xdpyinfo >/dev/null 2>&1; then
            if xdpyinfo >/dev/null 2>&1; then
                success "X11 display available"
            else
                warning "X11 display not accessible"
            fi
        fi
    fi
    
    # Test audio system availability
    if [ -e /dev/snd ] || command -v pulseaudio >/dev/null 2>&1; then
        success "Audio system detected"
    else
        warning "No audio system detected"
    fi
}

test_macos_specific() {
    info "Running macOS-specific tests..."
    
    # Test Xcode Command Line Tools
    if xcode-select -p >/dev/null 2>&1; then
        success "Xcode Command Line Tools installed"
    else
        error "Xcode Command Line Tools not found"
        return 1
    fi
    
    # Test Homebrew (if available)
    if command -v brew >/dev/null 2>&1; then
        success "Homebrew available"
        
        # Check for common dependencies
        local brew_deps=("yasm" "openssl")
        for dep in "${brew_deps[@]}"; do
            if brew list "$dep" >/dev/null 2>&1; then
                success "Homebrew package available: $dep"
            else
                warning "Homebrew package not installed: $dep"
            fi
        done
    else
        warning "Homebrew not available"
    fi
}

test_windows_specific() {
    info "Running Windows-specific tests..."
    
    # Test MSYS2 environment
    if [ -n "$MSYSTEM" ]; then
        success "MSYS2 environment detected: $MSYSTEM"
    else
        warning "Not running in MSYS2 environment"
    fi
    
    # Test MinGW compiler
    if command -v x86_64-w64-mingw32-gcc >/dev/null 2>&1; then
        success "MinGW-w64 compiler available"
    else
        warning "MinGW-w64 compiler not found"
    fi
}

# Performance benchmarks
test_performance() {
    info "Running performance tests..."
    
    cd "$TEST_DIR/movian"
    
    # Measure build time
    local start_time=$(date +%s)
    
    # Clean and rebuild for timing
    make clean 2>>"$LOG_FILE" >/dev/null
    
    local build_start=$(date +%s)
    if make -j1 2>>"$LOG_FILE" >/dev/null; then
        local build_end=$(date +%s)
        local build_time=$((build_end - build_start))
        info "Single-threaded build time: ${build_time}s"
        
        if [ "$build_time" -lt 1800 ]; then  # 30 minutes
            success "Build completed in reasonable time"
        else
            warning "Build took longer than expected: ${build_time}s"
        fi
    else
        error "Performance test build failed"
        return 1
    fi
}

# Generate test report
generate_report() {
    local total_tests=$((TESTS_PASSED + TESTS_FAILED))
    
    echo
    echo "=================================="
    echo "    BUILD VALIDATION REPORT"
    echo "=================================="
    echo "Platform: $PLATFORM ($DISTRO)"
    echo "Date: $(date)"
    echo "Total Tests: $total_tests"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    echo
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
        echo "The installation instructions work correctly on this platform."
    else
        echo -e "${RED}✗ SOME TESTS FAILED${NC}"
        echo "Failed tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  - $test"
        done
        echo
        echo "Please check the log file for details: $LOG_FILE"
    fi
    
    echo
    echo "Log file: $LOG_FILE"
    echo "Test directory: $TEST_DIR"
}

# Main test execution
main() {
    echo "Movian Build Validation Test Suite"
    echo "=================================="
    
    # Create test directory and log file
    mkdir -p "$TEST_DIR"
    touch "$LOG_FILE"
    
    log "Starting build validation tests"
    
    # Detect platform
    detect_platform
    
    # Run test suite
    info "Running test suite..."
    
    # Basic environment tests
    test_dependencies || true
    test_library_detection || true
    
    # Build process tests
    test_repository_clone || exit 1
    test_configure || exit 1
    test_compilation || exit 1
    test_binary_functionality || true
    test_installation || true
    
    # Platform-specific tests
    test_platform_specific || true
    
    # Performance tests (optional)
    if [ "${RUN_PERFORMANCE_TESTS:-0}" = "1" ]; then
        test_performance || true
    fi
    
    # Generate final report
    generate_report
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Command line options
while [[ $# -gt 0 ]]; do
    case $1 in
        --performance)
            RUN_PERFORMANCE_TESTS=1
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --performance    Run performance benchmarks"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"