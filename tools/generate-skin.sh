#!/bin/bash

# Movian Skin Template Generator - Shell Wrapper
# This script provides a convenient wrapper around the Node.js generator

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js to use this tool."
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run the Node.js generator
node "$SCRIPT_DIR/generate-skin-template.js" "$@"
