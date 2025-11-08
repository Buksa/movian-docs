#!/bin/bash

# Comprehensive Quality Assurance Validation Runner
# Runs all validation checks for Movian documentation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOVIAN_ROOT="$(cd "$SCRIPT_DIR/../../../../movian" 2>/dev/null && pwd || echo "")"

# Parse arguments
VERBOSE=false
SKIP_INSTALL=false
NO_REPORT=false
CHECK_EXTERNAL=false

for arg in "$@"; do
  case $arg in
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --skip-install)
      SKIP_INSTALL=true
      shift
      ;;
    --no-report)
      NO_REPORT=true
      shift
      ;;
    --check-external)
      CHECK_EXTERNAL=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --verbose, -v       Enable verbose output"
      echo "  --skip-install      Skip npm dependency installation"
      echo "  --no-report         Skip HTML report generation"
      echo "  --check-external    Check external links (slower)"
      echo "  --help, -h          Show this help message"
      exit 0
      ;;
  esac
done

# Helper functions
info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Movian Documentation Quality Assurance Validation        ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  error "Node.js is not installed. Please install Node.js 12+ to run validation."
  exit 1
fi

NODE_VERSION=$(node --version)
info "Node.js version: $NODE_VERSION"

# Install dependencies
if [ "$SKIP_INSTALL" = false ]; then
  info "Installing dependencies..."
  cd "$SCRIPT_DIR"
  npm install --silent 2>&1 | grep -v "npm WARN" || true
  success "Dependencies installed"
else
  info "Skipping dependency installation"
fi

# Create results directory
RESULTS_DIR="$SCRIPT_DIR/results"
mkdir -p "$RESULTS_DIR"

# Track overall status
OVERALL_STATUS=0

# Validation 1: File Reference Validation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. File Reference Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

VERBOSE_FLAG=""
if [ "$VERBOSE" = true ]; then
  VERBOSE_FLAG="--verbose"
fi

MOVIAN_FLAG=""
if [ -n "$MOVIAN_ROOT" ]; then
  MOVIAN_FLAG="--movian-root=$MOVIAN_ROOT"
  info "Using Movian source: $MOVIAN_ROOT"
else
  warning "Movian source not found at expected location"
  warning "File reference validation will be skipped"
fi

if [ -n "$MOVIAN_ROOT" ]; then
  if node "$SCRIPT_DIR/file-reference-validator.js" $VERBOSE_FLAG $MOVIAN_FLAG; then
    success "File reference validation passed"
  else
    error "File reference validation failed"
    OVERALL_STATUS=1
  fi
else
  warning "Skipping file reference validation (Movian source not available)"
fi

# Validation 2: Link Validation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Link Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EXTERNAL_FLAG=""
if [ "$CHECK_EXTERNAL" = true ]; then
  EXTERNAL_FLAG="--check-external"
  info "External link checking enabled"
fi

if node "$SCRIPT_DIR/link-validator.js" $VERBOSE_FLAG $EXTERNAL_FLAG; then
  success "Link validation passed"
else
  error "Link validation failed"
  OVERALL_STATUS=1
fi

# Validation 3: Cross-Reference Validation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Cross-Reference Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if node "$SCRIPT_DIR/cross-reference-validator.js" $VERBOSE_FLAG; then
  success "Cross-reference validation passed"
else
  error "Cross-reference validation failed"
  OVERALL_STATUS=1
fi

# Validation 4: Plugin Integration Tests
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Plugin Integration Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if bash "$SCRIPT_DIR/run-plugin-tests.sh" --no-install $VERBOSE_FLAG; then
  success "Plugin integration tests passed"
else
  error "Plugin integration tests failed"
  OVERALL_STATUS=1
fi

# Validation 5: View Syntax Tests
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. View Syntax Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if bash "$SCRIPT_DIR/run-view-syntax-tests.sh" $VERBOSE_FLAG; then
  success "View syntax validation passed"
else
  error "View syntax validation failed"
  OVERALL_STATUS=1
fi

# Validation 6: Macro Validation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Macro Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if bash "$SCRIPT_DIR/run-macro-validation.sh" $VERBOSE_FLAG; then
  success "Macro validation passed"
else
  error "Macro validation failed"
  OVERALL_STATUS=1
fi

# Validation 7: Skin Structure Validation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Skin Structure Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if bash "$SCRIPT_DIR/run-skin-structure-validation.sh" $VERBOSE_FLAG; then
  success "Skin structure validation passed"
else
  error "Skin structure validation failed"
  OVERALL_STATUS=1
fi

# Generate consolidated report
if [ "$NO_REPORT" = false ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Generating Consolidated Report"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  REPORT_FILE="$RESULTS_DIR/qa-validation-report.html"
  
  cat > "$REPORT_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Movian Documentation QA Validation Report</title>
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
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    .validation-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .validation-section h2 {
      margin: 0 0 15px 0;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
    }
    .status.pass {
      background: #d4edda;
      color: #155724;
    }
    .status.fail {
      background: #f8d7da;
      color: #721c24;
    }
    .status.warn {
      background: #fff3cd;
      color: #856404;
    }
    .footer {
      text-align: center;
      color: #666;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Movian Documentation QA Validation Report</h1>
    <p>Generated: $(date)</p>
  </div>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Overall Status</h3>
      <div class="value">$([ $OVERALL_STATUS -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")</div>
    </div>
    <div class="summary-card">
      <h3>Validations Run</h3>
      <div class="value">7</div>
    </div>
    <div class="summary-card">
      <h3>Results Directory</h3>
      <div class="value" style="font-size: 14px;">results/</div>
    </div>
  </div>
  
  <div class="validation-section">
    <h2>Validation Results</h2>
    <p>Detailed results for each validation check are available in the results directory:</p>
    <ul>
      <li><strong>file-reference-validation.json</strong> - File reference validation results</li>
      <li><strong>link-validation.json</strong> - Link validation results</li>
      <li><strong>cross-reference-validation.json</strong> - Cross-reference validation results</li>
      <li><strong>integration-test-report.json</strong> - Plugin integration test results</li>
      <li><strong>view-syntax-validation.json</strong> - View syntax validation results</li>
      <li><strong>macro-validation.json</strong> - Macro validation results</li>
      <li><strong>skin-structure-validation.json</strong> - Skin structure validation results</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>Movian Documentation Quality Assurance System</p>
    <p>For more information, see docs/tests/README.md</p>
  </div>
</body>
</html>
EOF
  
  success "Consolidated report generated: $REPORT_FILE"
fi

# Final summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    VALIDATION SUMMARY                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
  success "All validations passed!"
  echo ""
  echo "✅ Documentation quality assurance checks completed successfully."
else
  error "Some validations failed!"
  echo ""
  echo "❌ Please review the errors above and fix the issues."
  echo "   Detailed results are available in: $RESULTS_DIR"
fi

echo ""
exit $OVERALL_STATUS
