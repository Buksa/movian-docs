#!/bin/bash
#
# Movian Documentation Test Runner
#
# This script runs all available tests for the Movian documentation
# and installation instructions.
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(dirname "$SCRIPT_DIR")"

# Test configuration
RUN_DEPENDENCY_CHECK=1
RUN_BUILD_VALIDATION=1
RUN_PLUGIN_TESTS=1
RUN_PERFORMANCE_TESTS=0
VERBOSE=0

# Utility functions
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

usage() {
    cat << EOF
Usage: $0 [options]

Options:
    --dependency-only       Run only dependency checks
    --build-only           Run only build validation
    --plugin-only          Run only plugin integration tests
    --performance          Include performance tests
    --verbose              Enable verbose output
    --help                 Show this help message

Examples:
    $0                     # Run all tests
    $0 --dependency-only   # Check dependencies only
    $0 --plugin-only       # Test plugin examples only
    $0 --performance       # Run with performance benchmarks
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dependency-only)
            RUN_BUILD_VALIDATION=0
            RUN_PLUGIN_TESTS=0
            shift
            ;;
        --build-only)
            RUN_DEPENDENCY_CHECK=0
            RUN_PLUGIN_TESTS=0
            shift
            ;;
        --plugin-only)
            RUN_DEPENDENCY_CHECK=0
            RUN_BUILD_VALIDATION=0
            shift
            ;;
        --performance)
            RUN_PERFORMANCE_TESTS=1
            shift
            ;;
        --verbose)
            VERBOSE=1
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main test execution
main() {
    echo "Movian Documentation Test Suite"
    echo "==============================="
    echo
    
    info "Test directory: $SCRIPT_DIR"
    info "Documentation directory: $DOCS_DIR"
    echo
    
    local tests_passed=0
    local tests_failed=0
    
    # Run dependency check
    if [ "$RUN_DEPENDENCY_CHECK" = "1" ]; then
        info "Running dependency check..."
        
        if [ -x "$SCRIPT_DIR/dependency-check.py" ]; then
            if python3 "$SCRIPT_DIR/dependency-check.py" ${VERBOSE:+--quiet}; then
                success "Dependency check passed"
                ((tests_passed++))
            else
                error "Dependency check failed"
                ((tests_failed++))
            fi
        else
            warning "Dependency check script not found or not executable"
        fi
        echo
    fi
    
    # Run build validation
    if [ "$RUN_BUILD_VALIDATION" = "1" ]; then
        info "Running build validation..."
        
        if [ -x "$SCRIPT_DIR/build-validation.sh" ]; then
            local build_args=""
            if [ "$RUN_PERFORMANCE_TESTS" = "1" ]; then
                build_args="--performance"
            fi
            
            if "$SCRIPT_DIR/build-validation.sh" $build_args; then
                success "Build validation passed"
                ((tests_passed++))
            else
                error "Build validation failed"
                ((tests_failed++))
            fi
        else
            warning "Build validation script not found or not executable"
        fi
        echo
    fi
    
    # Run plugin integration tests
    if [ "$RUN_PLUGIN_TESTS" = "1" ]; then
        info "Running plugin integration tests..."
        
        if [ -x "$SCRIPT_DIR/run-plugin-tests.sh" ]; then
            local plugin_args=""
            if [ "$VERBOSE" = "1" ]; then
                plugin_args="--verbose"
            fi
            
            if "$SCRIPT_DIR/run-plugin-tests.sh" $plugin_args; then
                success "Plugin integration tests passed"
                ((tests_passed++))
            else
                error "Plugin integration tests failed"
                ((tests_failed++))
            fi
        else
            warning "Plugin integration test script not found or not executable"
        fi
        echo
    fi
    
    # Run documentation validation
    info "Running documentation validation..."
    
    local doc_errors=0
    
    # Check for required files
    local required_files=(
        "README.md"
        "installation/README.md"
        "installation/linux.md"
        "installation/macos.md"
        "installation/troubleshooting.md"
        "installation/build-system.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$DOCS_DIR/$file" ]; then
            if [ "$VERBOSE" = "1" ]; then
                info "Found: $file"
            fi
        else
            error "Missing required file: $file"
            ((doc_errors++))
        fi
    done
    
    # Check Markdown syntax
    info "Checking Markdown syntax..."
    
    while IFS= read -r -d '' file; do
        if ! python3 -c "
import sys
try:
    with open('$file', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for unmatched code blocks
    if content.count('\`\`\`') % 2 != 0:
        print('Error: Unmatched code blocks in $file')
        sys.exit(1)
    
    # Check for malformed links
    import re
    if re.search(r'\]\(\s*\)', content):
        print('Warning: Empty links in $file')
    
except Exception as e:
    print(f'Error reading $file: {e}')
    sys.exit(1)
        " 2>/dev/null; then
            error "Markdown syntax error in: $file"
            ((doc_errors++))
        fi
    done < <(find "$DOCS_DIR" -name "*.md" -print0)
    
    if [ "$doc_errors" -eq 0 ]; then
        success "Documentation validation passed"
        ((tests_passed++))
    else
        error "Documentation validation failed ($doc_errors errors)"
        ((tests_failed++))
    fi
    
    echo
    
    # Generate summary
    local total_tests=$((tests_passed + tests_failed))
    
    echo "Test Summary"
    echo "============"
    echo "Total tests: $total_tests"
    echo "Passed: $tests_passed"
    echo "Failed: $tests_failed"
    echo
    
    if [ "$tests_failed" -eq 0 ]; then
        success "All tests passed!"
        echo
        echo "The Movian documentation and installation instructions"
        echo "are ready for use on this platform."
    else
        error "Some tests failed!"
        echo
        echo "Please review the errors above and fix any issues"
        echo "before using the installation instructions."
    fi
    
    # Exit with appropriate code
    exit $tests_failed
}

# Check prerequisites
check_prerequisites() {
    local missing_tools=()
    
    # Check for required tools
    if ! command -v python3 >/dev/null 2>&1; then
        missing_tools+=("python3")
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        missing_tools+=("git")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        echo "Please install the missing tools and try again."
        exit 1
    fi
    
    # Make test scripts executable
    chmod +x "$SCRIPT_DIR"/*.sh "$SCRIPT_DIR"/*.py 2>/dev/null || true
}

# Run prerequisite check and main function
check_prerequisites
main "$@"