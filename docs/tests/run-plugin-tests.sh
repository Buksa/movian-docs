#!/bin/bash
#
# Movian Plugin Integration Test Runner
#
# This script runs comprehensive integration tests for all plugin examples
# to ensure they can load and function correctly in Movian.
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
EXAMPLES_DIR="$DOCS_DIR/plugins/examples"

# Test configuration
VERBOSE=0
GENERATE_REPORT=1
INSTALL_DEPS=1

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
    --no-install           Skip dependency installation
    --no-report           Skip HTML report generation
    --verbose             Enable verbose output
    --help                Show this help message

Examples:
    $0                    # Run all plugin integration tests
    $0 --verbose          # Run with detailed output
    $0 --no-install       # Skip npm dependency installation
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-install)
            INSTALL_DEPS=0
            shift
            ;;
        --no-report)
            GENERATE_REPORT=0
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

# Check prerequisites
check_prerequisites() {
    local missing_tools=()
    
    # Check for Node.js
    if ! command -v node >/dev/null 2>&1; then
        missing_tools+=("node")
    fi
    
    # Check for npm
    if ! command -v npm >/dev/null 2>&1; then
        missing_tools+=("npm")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        echo "Please install Node.js and npm to run plugin integration tests."
        echo ""
        echo "Installation instructions:"
        echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  macOS: brew install node"
        echo "  Windows: Download from https://nodejs.org/"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo "$node_version" | cut -d. -f1)
    
    if [ "$major_version" -lt 12 ]; then
        error "Node.js version $node_version is too old. Please upgrade to Node.js 12 or later."
        exit 1
    fi
    
    success "Prerequisites check passed (Node.js $node_version)"
}

# Install dependencies
install_dependencies() {
    if [ "$INSTALL_DEPS" = "0" ]; then
        info "Skipping dependency installation"
        return 0
    fi
    
    info "Installing test dependencies..."
    
    # Check if package.json exists in examples directory
    if [ -f "$EXAMPLES_DIR/package.json" ]; then
        cd "$EXAMPLES_DIR"
        
        if [ "$VERBOSE" = "1" ]; then
            npm install
        else
            npm install --silent
        fi
        
        success "Dependencies installed successfully"
    else
        warning "No package.json found in examples directory"
    fi
    
    # Install vm2 globally if not available
    if ! node -e "require('vm2')" 2>/dev/null; then
        info "Installing vm2 dependency..."
        
        if [ "$VERBOSE" = "1" ]; then
            npm install -g vm2
        else
            npm install -g vm2 --silent
        fi
        
        success "vm2 dependency installed"
    fi
}

# Run plugin validation (existing system)
run_plugin_validation() {
    info "Running plugin validation checks..."
    
    cd "$EXAMPLES_DIR"
    
    if [ -f "validate-examples.js" ]; then
        if node validate-examples.js; then
            success "Plugin validation passed"
            return 0
        else
            error "Plugin validation failed"
            return 1
        fi
    else
        warning "Plugin validation script not found"
        return 0
    fi
}

# Run integration tests
run_integration_tests() {
    info "Running plugin integration tests..."
    
    local test_script="$SCRIPT_DIR/plugin-integration-tests.js"
    
    if [ ! -f "$test_script" ]; then
        error "Integration test script not found: $test_script"
        return 1
    fi
    
    # Make script executable
    chmod +x "$test_script"
    
    # Run integration tests
    if [ "$VERBOSE" = "1" ]; then
        node "$test_script"
    else
        node "$test_script" 2>/dev/null
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        success "Integration tests passed"
    else
        error "Integration tests failed"
    fi
    
    return $exit_code
}

# Generate summary report
generate_summary() {
    local results_dir="$SCRIPT_DIR/results"
    local report_file="$results_dir/integration-test-report.json"
    
    if [ ! -f "$report_file" ]; then
        warning "Test report not found, skipping summary"
        return 0
    fi
    
    info "Generating test summary..."
    
    # Extract key metrics from JSON report
    local total_plugins=$(node -e "
        const report = require('$report_file');
        console.log(report.totalPlugins || 0);
    ")
    
    local passed_plugins=$(node -e "
        const report = require('$report_file');
        console.log(report.passedPlugins || 0);
    ")
    
    local failed_plugins=$(node -e "
        const report = require('$report_file');
        console.log(report.failedPlugins || 0);
    ")
    
    local success_rate=$(node -e "
        const report = require('$report_file');
        const rate = report.totalPlugins > 0 ? (report.passedPlugins / report.totalPlugins * 100).toFixed(1) : 0;
        console.log(rate);
    ")
    
    echo ""
    echo "=================================="
    echo "    PLUGIN INTEGRATION SUMMARY"
    echo "=================================="
    echo "Total Plugins: $total_plugins"
    echo "Passed: $passed_plugins"
    echo "Failed: $failed_plugins"
    echo "Success Rate: $success_rate%"
    echo ""
    
    if [ "$failed_plugins" -eq 0 ]; then
        success "All plugin examples passed integration testing!"
        echo "The plugins are ready for use and properly demonstrate Movian API usage."
    else
        error "Some plugin examples failed integration testing."
        echo "Please review the detailed report for specific issues."
    fi
    
    echo ""
    echo "Detailed reports available at:"
    echo "  JSON: $results_dir/integration-test-report.json"
    echo "  HTML: $results_dir/integration-test-report.html"
}

# Open HTML report (optional)
open_report() {
    local html_report="$SCRIPT_DIR/results/integration-test-report.html"
    
    if [ ! -f "$html_report" ]; then
        return 0
    fi
    
    # Try to open HTML report in browser
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$html_report" 2>/dev/null &
    elif command -v open >/dev/null 2>&1; then
        open "$html_report" 2>/dev/null &
    elif command -v start >/dev/null 2>&1; then
        start "$html_report" 2>/dev/null &
    fi
}

# Main execution
main() {
    echo "Movian Plugin Integration Test Suite"
    echo "===================================="
    echo ""
    
    info "Test directory: $SCRIPT_DIR"
    info "Examples directory: $EXAMPLES_DIR"
    echo ""
    
    local overall_result=0
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Run plugin validation
    if ! run_plugin_validation; then
        warning "Plugin validation failed, but continuing with integration tests"
    fi
    
    echo ""
    
    # Run integration tests
    if ! run_integration_tests; then
        overall_result=1
    fi
    
    echo ""
    
    # Generate summary
    generate_summary
    
    # Open report if requested and available
    if [ "$GENERATE_REPORT" = "1" ]; then
        open_report
    fi
    
    echo ""
    
    if [ $overall_result -eq 0 ]; then
        success "Plugin integration testing completed successfully!"
    else
        error "Plugin integration testing completed with failures."
        echo "Please review the test output and fix any issues."
    fi
    
    exit $overall_result
}

# Cleanup function
cleanup() {
    # Clean up any temporary files if needed
    local temp_files=("/tmp/movian-plugin-test-*")
    for file in "${temp_files[@]}"; do
        if [ -e "$file" ]; then
            rm -rf "$file"
        fi
    done
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"