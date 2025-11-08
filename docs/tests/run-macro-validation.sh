#!/bin/bash

# GLW Macro Validation Test Runner
# Validates macro definitions and usage in skin examples

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Parse arguments
VERBOSE=""
SKIN_PATH=""
NO_REPORT=false

for arg in "$@"; do
  case $arg in
    --verbose)
      VERBOSE="--verbose"
      ;;
    --skin-path=*)
      SKIN_PATH="${arg#*=}"
      ;;
    --no-report)
      NO_REPORT=true
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --verbose          Enable verbose output"
      echo "  --skin-path=PATH   Validate specific skin directory"
      echo "  --no-report        Skip HTML report generation"
      echo "  --help             Show this help message"
      exit 0
      ;;
  esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GLW Macro Validation Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed${NC}"
  echo "Please install Node.js 12+ to run macro validation tests"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 12 ]; then
  echo -e "${YELLOW}Warning: Node.js version is older than 12${NC}"
  echo "Some features may not work correctly"
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing npm dependencies...${NC}"
  npm install
  echo ""
fi

# Run macro validator
echo -e "${GREEN}Running macro validation tests...${NC}"
echo ""

VALIDATOR_ARGS=""
if [ -n "$VERBOSE" ]; then
  VALIDATOR_ARGS="$VALIDATOR_ARGS $VERBOSE"
fi

if [ -n "$SKIN_PATH" ]; then
  VALIDATOR_ARGS="$VALIDATOR_ARGS --skin-path=$SKIN_PATH"
fi

if node macro-validator.js $VALIDATOR_ARGS; then
  echo ""
  echo -e "${GREEN}✓ All macro validation tests passed!${NC}"
  TEST_RESULT=0
else
  echo ""
  echo -e "${RED}✗ Some macro validation tests failed${NC}"
  TEST_RESULT=1
fi

# Generate HTML report if requested
if [ "$NO_REPORT" = false ] && [ -f "results/macro-validation-report.json" ]; then
  echo ""
  echo -e "${BLUE}Generating HTML report...${NC}"
  
  # Create simple HTML report
  cat > results/macro-validation-report.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Macro Validation Report</title>
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
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    .summary-card.passed .value { color: #10b981; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.warnings .value { color: #f59e0b; }
    .errors {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .error-item {
      padding: 15px;
      margin: 10px 0;
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-radius: 4px;
    }
    .error-item h4 {
      margin: 0 0 5px 0;
      color: #991b1b;
    }
    .error-item p {
      margin: 0;
      color: #7f1d1d;
    }
    .pass-rate {
      text-align: center;
      font-size: 48px;
      font-weight: bold;
      margin: 30px 0;
    }
    .pass-rate.good { color: #10b981; }
    .pass-rate.warning { color: #f59e0b; }
    .pass-rate.bad { color: #ef4444; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 Macro Validation Report</h1>
    <p>GLW macro definition and usage validation results</p>
  </div>
  
  <div id="content">
    <p>Loading report data...</p>
  </div>
  
  <script>
    fetch('macro-validation-report.json')
      .then(response => response.json())
      .then(data => {
        const passRate = data.summary.passRate;
        const passRateClass = passRate === 100 ? 'good' : passRate >= 80 ? 'warning' : 'bad';
        
        let html = `
          <div class="summary">
            <div class="summary-card">
              <h3>Total Tests</h3>
              <div class="value">${data.summary.total}</div>
            </div>
            <div class="summary-card passed">
              <h3>Passed</h3>
              <div class="value">${data.summary.passed}</div>
            </div>
            <div class="summary-card failed">
              <h3>Failed</h3>
              <div class="value">${data.summary.failed}</div>
            </div>
            <div class="summary-card warnings">
              <h3>Warnings</h3>
              <div class="value">${data.summary.warnings || 0}</div>
            </div>
          </div>
          
          <div class="pass-rate ${passRateClass}">
            ${passRate.toFixed(1)}% Pass Rate
          </div>
        `;
        
        if (data.errors && data.errors.length > 0) {
          html += '<div class="errors"><h2>Failed Tests</h2>';
          data.errors.forEach(error => {
            html += `
              <div class="error-item">
                <h4>${error.test}</h4>
                <p>${error.error}</p>
              </div>
            `;
          });
          html += '</div>';
        }
        
        html += `
          <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: center; color: #666;">
            <p>Generated: ${new Date(data.timestamp).toLocaleString()}</p>
          </div>
        `;
        
        document.getElementById('content').innerHTML = html;
      })
      .catch(error => {
        document.getElementById('content').innerHTML = `
          <div class="error-item">
            <h4>Error Loading Report</h4>
            <p>${error.message}</p>
          </div>
        `;
      });
  </script>
</body>
</html>
EOF
  
  echo -e "${GREEN}✓ HTML report generated: results/macro-validation-report.html${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Results Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -f "results/macro-validation-report.json" ]; then
  # Display summary from JSON
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('results/macro-validation-report.json', 'utf8'));
    console.log('Total Tests:  ', data.summary.total);
    console.log('Passed:       ', data.summary.passed);
    console.log('Failed:       ', data.summary.failed);
    console.log('Warnings:     ', data.summary.warnings || 0);
    console.log('Pass Rate:    ', data.summary.passRate.toFixed(1) + '%');
  "
fi

echo ""

exit $TEST_RESULT
