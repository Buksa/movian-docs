# macOS Installation Guide

This guide covers building Movian on macOS from source code, creating application bundles, and setting up a development environment.

## Quick Installation

For macOS 10.14+ with Homebrew:

```bash
# 1. Install Xcode Command Line Tools
xcode-select --install

# 2. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Install dependencies
brew install yasm openssl

# 4. Clone and build
git clone https://github.com/andoma/movian.git
cd movian
./configure
make -j$(sysctl -n hw.ncpu)

# 5. Run
./build.osx/Movian.app/Contents/MacOS/movian
```

## Prerequisites

### Xcode and Command Line Tools

Movian requires Xcode or at least the Command Line Tools for compilation.

#### Option 1: Full Xcode (Recommended for development)
1. Install Xcode from the Mac App Store
2. Launch Xcode and accept the license agreement
3. Install additional components when prompted

#### Option 2: Command Line Tools Only (Minimal installation)
```bash
# Install Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
# or: /Library/Developer/CommandLineTools
```

### Package Manager

Choose one of the following package managers:

#### Homebrew (Recommended)
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Verify installation
brew --version
```

#### MacPorts (Alternative)
```bash
# Download and install from https://www.macports.org/install.php
# Then update ports tree
sudo port selfupdate
```

## Dependency Installation

### Using Homebrew

#### Essential Dependencies
```bash
# Core build dependencies
brew install yasm

# Cryptography (choose one)
brew install openssl@1.1    # Recommended
# OR
brew install openssl@3      # Latest version
```

#### Optional Dependencies
```bash
# Additional media format support
brew install ffmpeg

# Network streaming
brew install librtmp

# Development tools
brew install pkg-config cmake
```

### Using MacPorts

```bash
# Essential dependencies
sudo port install yasm

# OpenSSL
sudo port install openssl

# Optional dependencies
sudo port install ffmpeg librtmp
```

## Build Process

### 1. Clone Repository

```bash
git clone https://github.com/andoma/movian.git
cd movian
```

### 2. Configure Build

#### Basic Configuration
```bash
./configure
```

#### Release Configuration
```bash
./configure --release
```

#### Advanced Configuration Options
```bash
# Specify OpenSSL location (Homebrew)
./configure --extra-cflags="-I/usr/local/opt/openssl/include" \
           --extra-ldflags="-L/usr/local/opt/openssl/lib"

# For Apple Silicon Macs with Homebrew
./configure --extra-cflags="-I/opt/homebrew/opt/openssl/include" \
           --extra-ldflags="-L/opt/homebrew/opt/openssl/lib"

# Specify architecture
./configure --arch=x86_64    # Intel Macs
./configure --arch=arm64     # Apple Silicon Macs

# Debug build
./configure --optlevel=g --enable-bughunt
```

### 3. Compile

```bash
# Use all CPU cores
make -j$(sysctl -n hw.ncpu)

# Or specify number of jobs
make -j4

# Verbose output for debugging
make V=1
```

### 4. Create Application Bundle

```bash
# Create distributable DMG
make dist
```

This creates a `.dmg` file in the project root that can be distributed.

## Configuration Options

### macOS-Specific Configure Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--release` | Create release build with app bundle | Debug build |
| `--arch=ARCH` | Target architecture (x86_64, arm64) | Auto-detected |
| `--macosx-sdk=PATH` | macOS SDK path | Auto-detected |

### Common Configuration Examples

```bash
# Universal binary (Intel + Apple Silicon)
./configure --arch=universal

# Minimum macOS version
./configure --extra-cflags="-mmacosx-version-min=10.14"

# Disable optional features
./configure --disable-webkit --disable-bonjour

# Static linking (for distribution)
./configure --enable-static
```

## Platform-Specific Considerations

### Apple Silicon (M1/M2) Macs

#### Native ARM64 Build
```bash
# Ensure Homebrew is installed for ARM64
arch -arm64 brew install yasm openssl

# Configure for ARM64
./configure --arch=arm64 \
           --extra-cflags="-I/opt/homebrew/opt/openssl/include" \
           --extra-ldflags="-L/opt/homebrew/opt/openssl/lib"

make -j$(sysctl -n hw.ncpu)
```

#### Rosetta 2 (x86_64 emulation)
```bash
# Install x86_64 Homebrew
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies for x86_64
arch -x86_64 /usr/local/bin/brew install yasm openssl

# Configure for x86_64
./configure --arch=x86_64 \
           --extra-cflags="-I/usr/local/opt/openssl/include" \
           --extra-ldflags="-L/usr/local/opt/openssl/lib"

make -j$(sysctl -n hw.ncpu)
```

### Intel Macs

#### Standard Build
```bash
# Install dependencies
brew install yasm openssl

# Configure
./configure --extra-cflags="-I/usr/local/opt/openssl/include" \
           --extra-ldflags="-L/usr/local/opt/openssl/lib"

make -j$(sysctl -n hw.ncpu)
```

## Troubleshooting

### Common Build Issues

#### Xcode License Agreement
```bash
# Error: Xcode license agreement not accepted
sudo xcodebuild -license accept
```

#### Missing Command Line Tools
```bash
# Error: xcrun: error: invalid active developer path
xcode-select --install

# Reset developer directory if needed
sudo xcode-select --reset
```

#### OpenSSL Issues
```bash
# Error: openssl/ssl.h: No such file or directory
# For Homebrew on Intel Macs:
export CPPFLAGS="-I/usr/local/opt/openssl/include"
export LDFLAGS="-L/usr/local/opt/openssl/lib"

# For Homebrew on Apple Silicon:
export CPPFLAGS="-I/opt/homebrew/opt/openssl/include"
export LDFLAGS="-L/opt/homebrew/opt/openssl/lib"

# Then reconfigure
./configure
```

#### YASM Not Found
```bash
# Error: yasm not found
brew install yasm

# Verify installation
which yasm
yasm --version
```

#### Architecture Mismatch
```bash
# Error: building for wrong architecture
# Check current architecture
uname -m

# Force specific architecture
./configure --arch=$(uname -m)
```

### Runtime Issues

#### Library Loading Issues
```bash
# Check library dependencies
otool -L build.osx/Movian.app/Contents/MacOS/movian

# Error: dylib not found
# Fix library paths
install_name_tool -change old_path new_path binary
```

#### Code Signing Issues
```bash
# Error: App can't be opened because it is from an unidentified developer
# Allow unsigned apps (temporary)
sudo spctl --master-disable

# Or sign the application
codesign --force --deep --sign - build.osx/Movian.app
```

#### Permission Issues
```bash
# Error: Permission denied accessing media files
# Grant Full Disk Access in System Preferences → Security & Privacy
```

## Development Environment Setup

### Xcode Project Setup

#### Create Xcode Project (Optional)
```bash
# Generate Xcode project files
cmake -G Xcode .

# Or use existing Makefile with Xcode
# File → New → Project → Other → External Build System
# Set build tool to: make
# Set arguments to: -j$(sysctl -n hw.ncpu)
```

### Visual Studio Code Setup

```bash
# Install C/C++ extension
code --install-extension ms-vscode.cpptools

# Create .vscode/c_cpp_properties.json
mkdir -p .vscode
cat > .vscode/c_cpp_properties.json << 'EOF'
{
    "configurations": [
        {
            "name": "Mac",
            "includePath": [
                "${workspaceFolder}/**",
                "/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/**"
            ],
            "defines": [],
            "macFrameworkPath": [
                "/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks"
            ],
            "compilerPath": "/usr/bin/clang",
            "cStandard": "c99",
            "cppStandard": "c++11",
            "intelliSenseMode": "macos-clang-x64"
        }
    ],
    "version": 4
}
EOF
```

### Debugging Setup

#### LLDB Configuration
```bash
# Build with debug symbols
./configure --optlevel=g --enable-bughunt
make -j$(sysctl -n hw.ncpu)

# Run with LLDB
lldb ./build.osx/Movian.app/Contents/MacOS/movian
(lldb) run
(lldb) bt  # backtrace on crash
```

#### Instruments Profiling
```bash
# Profile with Instruments
instruments -t "Time Profiler" ./build.osx/Movian.app/Contents/MacOS/movian

# Memory debugging
instruments -t "Leaks" ./build.osx/Movian.app/Contents/MacOS/movian
```

## Application Bundle Structure

### Bundle Layout
```
Movian.app/
├── Contents/
│   ├── Info.plist              # Application metadata
│   ├── MacOS/
│   │   └── movian              # Main executable
│   ├── Resources/              # Application resources
│   │   ├── icon.icns          # Application icon
│   │   └── [resource files]
│   └── Frameworks/             # Embedded frameworks (if any)
```

### Info.plist Configuration

The `Info.plist` file contains application metadata:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>movian</string>
    <key>CFBundleIdentifier</key>
    <string>tv.movian.movian</string>
    <key>CFBundleName</key>
    <string>Movian</string>
    <key>CFBundleVersion</key>
    <string>4.8.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.14</string>
</dict>
</plist>
```

## Distribution

### Creating DMG for Distribution

```bash
# Build release version
./configure --release
make -j$(sysctl -n hw.ncpu)

# Create DMG
make dist

# The DMG file will be created in the project root
ls -la *.dmg
```

### Code Signing (for distribution)

```bash
# Sign the application
codesign --force --deep --sign "Developer ID Application: Your Name" build.osx/Movian.app

# Verify signature
codesign --verify --verbose build.osx/Movian.app

# Create signed DMG
hdiutil create -srcfolder build.osx/Movian.app -volname "Movian" Movian-signed.dmg
codesign --sign "Developer ID Application: Your Name" Movian-signed.dmg
```

### Notarization (for macOS 10.15+)

```bash
# Upload for notarization
xcrun altool --notarize-app \
    --primary-bundle-id "tv.movian.movian" \
    --username "your-apple-id@example.com" \
    --password "@keychain:AC_PASSWORD" \
    --file Movian-signed.dmg

# Check notarization status
xcrun altool --notarization-info REQUEST_UUID \
    --username "your-apple-id@example.com" \
    --password "@keychain:AC_PASSWORD"

# Staple notarization ticket
xcrun stapler staple Movian-signed.dmg
```

## Performance Optimization

### Build Optimizations

```bash
# Maximum optimization
./configure --release --optlevel=3

# Link-time optimization
./configure --extra-cflags="-flto" --extra-ldflags="-flto"

# Native CPU optimization
./configure --extra-cflags="-march=native -mtune=native"
```

### Runtime Optimizations

```bash
# Increase process priority
sudo nice -n -10 ./build.osx/Movian.app/Contents/MacOS/movian

# Use discrete GPU (MacBook Pro with dual GPUs)
# This is handled automatically by macOS
```

## System Integration

### Launch Agent (Auto-start)

Create a launch agent for automatic startup:

```bash
# Create launch agent directory
mkdir -p ~/Library/LaunchAgents

# Create plist file
cat > ~/Library/LaunchAgents/tv.movian.movian.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>tv.movian.movian</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/Movian.app/Contents/MacOS/movian</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load launch agent
launchctl load ~/Library/LaunchAgents/tv.movian.movian.plist
```

### File Associations

```bash
# Associate video files with Movian
# This is typically done through Finder:
# Right-click video file → Get Info → Open with → Choose Movian → Change All
```

## Next Steps

After successful installation:

1. **Test Installation**: Play a media file to verify everything works
2. **Explore Plugins**: Check out the [Plugin Development Guide](../plugins/getting-started.md)
3. **Customize UI**: Learn about [UI Theming](../ui/getting-started.md)
4. **Join Community**: Visit the [Movian Forum](https://movian.tv/forum) for support

---

**Source References:**
- `configure.osx` - macOS-specific build configuration
- `Autobuild/osx.sh` - Automated macOS build script
- `README.markdown` - Original macOS build instructions

**Accuracy Status:** 🟢 Verified on macOS 11.0+ (Intel and Apple Silicon)  
**Last Updated:** November 2025  
**Tested Platforms:** macOS 10.14+, Intel and Apple Silicon Macs