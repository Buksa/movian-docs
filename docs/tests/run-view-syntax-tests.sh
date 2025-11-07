#!/bin/bash

###############################################################################
# GLW View File Syntax Test Runner
#
# Runs comprehensive syntax validation tests for GLW view files.
# Tests all documented syntax features against test view files.
#
# Usage:
#   ./run-view-syntax-tests.sh [options]
#
# Options:
#   --verbose         Show detailed test output
#   --no-report       Skip HTML report generation
#   --help            Show this help message
###############################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$SCRIPT_DIR/view-syntax-tests"
RESULTS_DIR="$SCRIPT_DIR/results"

# Options
VERBOSE=false
GENERATE_REPORT=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose)
      VERBOSE=true
      shift
      ;;
    --no-report)
      GENERATE_REPORT=false
      shift
      ;;
    --help)
      head -n 20 "$0" | tail -n +3 | sed 's/^# //'
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Functions
print_header() {
  echo -e "${BOLD}${CYAN}$1${NC}"
  echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Main execution
main() {
  print_header "GLW View File Syntax Test Runner"
  echo ""
  
  # Check if Node.js is available
  if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    print_info "Please install Node.js to run the syntax validator"
    exit 1
  fi
  
  print_success "Node.js found: $(node --version)"
  echo ""
  
  # Check if test directory exists
  if [ ! -d "$TEST_DIR" ]; then
    print_error "Test directory not found: $TEST_DIR"
    exit 1
  fi
  
  print_success "Test directory found: $TEST_DIR"
  
  # Count test files
  TEST_FILE_COUNT=$(find "$TEST_DIR" -name "test-*.view" | wc -l)
  print_info "Found $TEST_FILE_COUNT test view files"
  echo ""
  
  # Create results directory if it doesn't exist
  mkdir -p "$RESULTS_DIR"
  
  # Run the validator
  print_header "Running Syntax Validation Tests"
  echo ""
  
  VALIDATOR_SCRIPT="$SCRIPT_DIR/view-syntax-validator.js"
  
  if [ ! -f "$VALIDATOR_SCRIPT" ]; then
    print_error "Validator script not found: $VALIDATOR_SCRIPT"
    exit 1
  fi
  
  # Build node command
  NODE_CMD="node $VALIDATOR_SCRIPT"
  
  if [ "$VERBOSE" = true ]; then
    NODE_CMD="$NODE_CMD --verbose"
  fi
  
  # Run validator and capture exit code
  set +e
  $NODE_CMD
  EXIT_CODE=$?
  set -e
  
  echo ""
  
  # Check results
  if [ $EXIT_CODE -eq 0 ]; then
    print_success "All syntax validation tests passed!"
  else
    print_error "Some syntax validation tests failed"
  fi
  
  # Generate HTML report if requested
  if [ "$GENERATE_REPORT" = true ]; then
    echo ""
    print_header "Generating HTML Report"
    
    JSON_REPORT="$RESULTS_DIR/view-syntax-validation-report.json"
    HTML_REPORT="$RESULTS_DIR/view-syntax-validation-report.html"
    
    if [ -f "$JSON_REPORT" ]; then
      generate_html_report "$JSON_REPORT" "$HTML_REPORT"
      print_success "HTML report generated: $HTML_REPORT"
    else
      print_warning "JSON report not found, skipping HTML generation"
    fi
  fi
  
  echo ""
  print_header "Test Run Complete"
  
  exit $EXIT_CODE
}

# Generate HTML report from JSON
generate_html_report() {
  local json_file="$1"
  local html_file="$2"
  
  # Read JSON report
  local json_content=$(cat "$json_file")
  
  # Extract values using basic text processing
  local timestamp=$(echo "$json_content" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)
  local total=$(echo "$json_content" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  local passed=$(echo "$json_content" | grep -o '"passed":[0-9]*' | cut -d':' -f2)
  local failed=$(echo "$json_content" | grep -o '"failed":[0-9]*' | cut -d':' -f2)
  local pass_rate=$(echo "$json_content" | grep -o '"passRate":[0-9.]*' | cut -d':' -f2)
  
  # Generate HTML
  cat > "$html_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLW View Syntax Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 36px;
      font-weight: bold;
      margin: 0;
    }
    .summary-card.total .value { color: #667eea; }
    .summary-card.passed .value { color: #10b981; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.rate .value { color: #f59e0b; }
    .test-files {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-files h2 {
      margin-top: 0;
    }
    .test-file {
      padding: 15px;
      border-left: 4px solid #10b981;
      background: #f0fdf4;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .test-file h3 {
      margin: 0 0 5px 0;
      color: #065f46;
    }
    .test-file p {
      margin: 0;
      color: #047857;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>GLW View Syntax Validation Report</h1>
    <p>Generated: $timestamp</p>
  </div>
  
  <div class="summary">
    <div class="summary-card total">
      <h3>Total Tests</h3>
      <p class="value">$total</p>
    </div>
    <div class="summary-card passed">
      <h3>Passed</h3>
      <p class="value">$passed</p>
    </div>
    <div class="summary-card failed">
      <h3>Failed</h3>
      <p class="value">$failed</p>
    </div>
    <div class="summary-card rate">
      <h3>Pass Rate</h3>
      <p class="value">$pass_rate%</p>
    </div>
  </div>
  
  <div class="test-files">
    <h2>Test Files Validated</h2>
    
    <div class="test-file">
      <h3>test-lexical-elements.view</h3>
      <p>Comments, strings, numbers, identifiers, constants</p>
    </div>
    
    <div class="test-file">
      <h3>test-operators.view</h3>
      <p>Assignment, arithmetic, comparison, logical, ternary operators</p>
    </div>
    
    <div class="test-file">
      <h3>test-expressions.view</h3>
      <p>Static/dynamic expressions, colors, type coercion</p>
    </div>
    
    <div class="test-file">
      <h3>test-properties.view</h3>
      <p>Property references, chains, roots, bindings</p>
    </div>
    
    <div class="test-file">
      <h3>test-widgets.view</h3>
      <p>Container, content, list widgets, attributes, nesting</p>
    </div>
    
    <div class="test-file">
      <h3>test-preprocessor.view</h3>
      <p>#include, #import directives, path resolution</p>
    </div>
    
    <div class="test-file">
      <h3>test-macros.view</h3>
      <p>Macro definitions, arguments, defaults, invocations</p>
    </div>
    
    <div class="test-file">
      <h3>test-advanced.view</h3>
      <p>Cloner, event handlers, loader, complex patterns</p>
    </div>
  </div>
  
  <div class="footer">
    <p>GLW View File Syntax Validation • Movian Documentation Project</p>
  </div>
</body>
</html>
EOF
}

# Run main function
main
