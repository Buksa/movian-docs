# Movian Skin Template Generator - PowerShell Wrapper
# This script provides a convenient wrapper around the Node.js generator

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Error: Node.js is not installed."
    Write-Error "Please install Node.js to use this tool."
    exit 1
}

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Run the Node.js generator
& node "$ScriptDir\generate-skin-template.js" $args
