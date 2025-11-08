# System Dependencies

This document provides a comprehensive list of system dependencies required to build and run Movian on different platforms, including version requirements and installation instructions.

## Overview

Movian requires various system libraries and development tools to build from source. The specific dependencies vary by platform, but the core requirements include:

- **Build Tools**: Compiler toolchain, make utilities
- **Media Libraries**: FFmpeg/libav, codec libraries
- **Graphics Libraries**: OpenGL, platform-specific UI frameworks
- **Networking Libraries**: SSL/TLS, HTTP client libraries
- **Database Libraries**: SQLite
- **Optional Libraries**: Platform-specific features

## Common Dependencies (All Platforms)

### Build Essentials

**GCC or Clang Compiler**
- **Version**: GCC 4.8+ or Clang 3.4+
- **Purpose**: C/C++ compilation
- **Required**: Yes

**GNU Make**
- **Version**: 3.81+
- **Purpose**: Build automation
- **Required**: Yes

**pkg-config**
- **Version**: 0.25+
- **Purpose**: Library dependency management
- **Required**: Yes

### Core Libraries

**FFmpeg / libav**
- **Version**: FFmpeg 2.8+ or libav 11+
- **Purpose**: Media decoding, encoding, and format handling
- **Components Required**:
  - libavcodec (codec library)
  - libavformat (container format library)
  - libavutil (utility library)
  - libswscale (video scaling library)
  - libswresample (audio resampling library)
- **Required**: Yes
- **Build Flags**: `--enable-shared --enable-pic`

**SQLite**
- **Version**: 3.7+
- **Purpose**: Local database storage for metadata and settings
- **Required**: Yes

**OpenSSL or GnuTLS**
- **Version**: OpenSSL 1.0.1+ or GnuTLS 3.3+
- **Purpose**: HTTPS support, secure connections
- **Required**: Yes

**zlib**
- **Version**: 1.2.3+
- **Purpose**: Compression support
- **Required**: Yes

**bzip2**
- **Version**: 1.0.6+
- **Purpose**: Additional compression support
- **Required**: Yes

**FreeType**
- **Version**: 2.4+
- **Purpose**: Font rendering
- **Required**: Yes

## Linux Dependencies

### Debian/Ubuntu

```bash
# Build essentials
sudo apt-get install build-essential git pkg-config

# Core libraries
sudo apt-get install libavcodec-dev libavformat-dev libavutil-dev \
                     libswscale-dev libswresample-dev

# Graphics and UI
sudo apt-get install libgl1-mesa-dev libglu1-mesa-dev \
                     libx11-dev libxext-dev libxv-dev

# Additional libraries
sudo apt-get install libsqlite3-dev libssl-dev zlib1g-dev \
                     libbz2-dev libfreetype6-dev

# Optional: PulseAudio support
sudo apt-get install libpulse-dev

# Optional: ALSA support
sudo apt-get install libasound2-dev

# Optional: libdvd support
sudo apt-get install libdvdread-dev libdvdnav-dev
```

**Version Requirements**:
- Ubuntu 16.04 LTS or later
- Debian 9 (Stretch) or later

### Fedora/RHEL/CentOS

```bash
# Build essentials
sudo dnf install gcc gcc-c++ make git pkgconfig

# Core libraries
sudo dnf install ffmpeg-devel

# Graphics and UI
sudo dnf install mesa-libGL-devel mesa-libGLU-devel \
                 libX11-devel libXext-devel libXv-devel

# Additional libraries
sudo dnf install sqlite-devel openssl-devel zlib-devel \
                 bzip2-devel freetype-devel

# Optional: PulseAudio support
sudo dnf install pulseaudio-libs-devel

# Optional: ALSA support
sudo dnf install alsa-lib-devel
```

**Version Requirements**:
- Fedora 28 or later
- RHEL/CentOS 7 or later

### Arch Linux

```bash
# Build essentials
sudo pacman -S base-devel git

# Core libraries
sudo pacman -S ffmpeg sqlite openssl zlib bzip2 freetype2

# Graphics and UI
sudo pacman -S mesa libgl libx11 libxext libxv

# Optional: Audio support
sudo pacman -S pulseaudio alsa-lib
```

## macOS Dependencies

### Using Homebrew

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Xcode Command Line Tools
xcode-select --install

# Install dependencies
brew install pkg-config ffmpeg sqlite openssl zlib bzip2 freetype

# Optional: Additional codecs
brew install libvpx x264 x265
```

**Version Requirements**:
- macOS 10.12 (Sierra) or later
- Xcode 8.0 or later

### Using MacPorts

```bash
# Install dependencies
sudo port install pkgconfig ffmpeg sqlite3 openssl zlib bzip2 freetype

# Optional: Additional codecs
sudo port install libvpx x264 x265
```

## Windows Dependencies

### MSYS2/MinGW-w64

```bash
# Update package database
pacman -Syu

# Install build tools
pacman -S mingw-w64-x86_64-toolchain mingw-w64-x86_64-cmake \
          mingw-w64-x86_64-pkg-config make git

# Install core libraries
pacman -S mingw-w64-x86_64-ffmpeg mingw-w64-x86_64-sqlite3 \
          mingw-w64-x86_64-openssl mingw-w64-x86_64-zlib \
          mingw-w64-x86_64-bzip2 mingw-w64-x86_64-freetype

# Install graphics libraries
pacman -S mingw-w64-x86_64-mesa
```

**Version Requirements**:
- Windows 7 or later
- MSYS2 with MinGW-w64 toolchain

### Visual Studio

**Required Components**:
- Visual Studio 2015 or later
- Windows SDK 10.0 or later
- C++ build tools

**Pre-built Libraries**:
- Download pre-built FFmpeg libraries from [ffmpeg.org](https://ffmpeg.org/download.html)
- Download pre-built OpenSSL from [slproweb.com](https://slproweb.com/products/Win32OpenSSL.html)

## Platform-Specific Dependencies

### Android

**Android NDK**
- **Version**: r21 or later
- **Purpose**: Native code compilation for Android
- **Required**: Yes

**Android SDK**
- **Version**: API Level 21 (Android 5.0) or later
- **Purpose**: Android application packaging
- **Required**: Yes

**Java Development Kit (JDK)**
- **Version**: JDK 8 or later
- **Purpose**: Android build tools
- **Required**: Yes

```bash
# Install Android SDK and NDK via Android Studio
# Or download standalone tools from developer.android.com

# Set environment variables
export ANDROID_HOME=/path/to/android-sdk
export ANDROID_NDK=/path/to/android-ndk
```

### iOS

**Xcode**
- **Version**: 11.0 or later
- **Purpose**: iOS development and compilation
- **Required**: Yes

**iOS SDK**
- **Version**: iOS 12.0 or later
- **Purpose**: iOS framework headers and libraries
- **Required**: Yes

**CocoaPods** (Optional)
- **Version**: 1.8+
- **Purpose**: Dependency management
- **Required**: No

```bash
# Install CocoaPods
sudo gem install cocoapods
```

### Raspberry Pi

**Raspberry Pi OS**
- **Version**: Buster or later
- **Architecture**: armhf or arm64

**Additional Dependencies**:
```bash
# VideoCore IV libraries (for hardware acceleration)
sudo apt-get install libraspberrypi-dev

# EGL and GLES libraries
sudo apt-get install libegl1-mesa-dev libgles2-mesa-dev
```

## Optional Dependencies

### DVD Playback Support

**libdvdread**
- **Version**: 5.0+
- **Purpose**: DVD structure reading
- **Installation**: `apt-get install libdvdread-dev` (Debian/Ubuntu)

**libdvdnav**
- **Version**: 5.0+
- **Purpose**: DVD menu navigation
- **Installation**: `apt-get install libdvdnav-dev` (Debian/Ubuntu)

### Advanced Audio Support

**PulseAudio**
- **Version**: 5.0+
- **Purpose**: Advanced audio routing and mixing
- **Installation**: `apt-get install libpulse-dev` (Debian/Ubuntu)

**ALSA**
- **Version**: 1.0.25+
- **Purpose**: Direct ALSA audio output
- **Installation**: `apt-get install libasound2-dev` (Debian/Ubuntu)

### Network Protocol Support

**librtmp**
- **Version**: 2.4+
- **Purpose**: RTMP streaming protocol support
- **Installation**: Usually included with FFmpeg

**libsmbclient**
- **Version**: 4.0+
- **Purpose**: SMB/CIFS network share access
- **Installation**: `apt-get install libsmbclient-dev` (Debian/Ubuntu)

### Subtitle Support

**libass**
- **Version**: 0.13+
- **Purpose**: Advanced subtitle rendering
- **Installation**: Usually included with FFmpeg

## Dependency Verification

### Checking Installed Versions

```bash
# Check GCC version
gcc --version

# Check pkg-config
pkg-config --version

# Check FFmpeg libraries
pkg-config --modversion libavcodec libavformat libavutil

# Check SQLite
sqlite3 --version

# Check OpenSSL
openssl version
```

### Verifying Build Environment

```bash
# Run Movian's configure script with dependency check
./configure --help

# Configure will check for required dependencies
./configure

# Review config.log for any missing dependencies
cat build/config.log
```

## Troubleshooting

### Common Issues

**Missing pkg-config Files**

If pkg-config cannot find libraries:
```bash
# Check PKG_CONFIG_PATH
echo $PKG_CONFIG_PATH

# Add library paths (example for custom FFmpeg installation)
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
```

**FFmpeg Version Too Old**

If system FFmpeg is outdated:
```bash
# Build FFmpeg from source
git clone https://git.ffmpeg.org/ffmpeg.git
cd ffmpeg
./configure --prefix=/usr/local --enable-shared --enable-pic
make -j$(nproc)
sudo make install
```

**OpenGL Not Found (Linux)**

If OpenGL headers are missing:
```bash
# Install Mesa development files
sudo apt-get install libgl1-mesa-dev libglu1-mesa-dev
```

**Library Conflicts**

If multiple versions of libraries are installed:
```bash
# Use configure flags to specify library paths
./configure --with-ffmpeg=/usr/local --with-sqlite=/usr/local
```

## Dependency Matrix

| Dependency | Linux | macOS | Windows | Android | iOS | Required |
|------------|-------|-------|---------|---------|-----|----------|
| GCC/Clang | ✓ | ✓ | ✓ | ✓ | ✓ | Yes |
| GNU Make | ✓ | ✓ | ✓ | ✓ | ✓ | Yes |
| pkg-config | ✓ | ✓ | ✓ | - | - | Yes |
| FFmpeg | ✓ | ✓ | ✓ | ✓ | ✓ | Yes |
| SQLite | ✓ | ✓ | ✓ | ✓ | ✓ | Yes |
| OpenSSL | ✓ | ✓ | ✓ | ✓ | ✓ | Yes |
| OpenGL | ✓ | ✓ | ✓ | ✓ | ✓ | Yes |
| X11 | ✓ | - | - | - | - | Linux only |
| PulseAudio | ✓ | - | - | - | - | Optional |
| ALSA | ✓ | - | - | - | - | Optional |
| libdvd | ✓ | ✓ | ✓ | - | - | Optional |

## Version Compatibility

### Minimum Versions

- **GCC**: 4.8 (C++11 support required)
- **Clang**: 3.4 (C++11 support required)
- **FFmpeg**: 2.8 (API compatibility)
- **SQLite**: 3.7 (Required SQL features)
- **OpenSSL**: 1.0.1 (TLS 1.2 support)

### Recommended Versions

- **GCC**: 7.0+ (Better optimization)
- **Clang**: 6.0+ (Better diagnostics)
- **FFmpeg**: 4.0+ (Latest codecs and features)
- **SQLite**: 3.30+ (Performance improvements)
- **OpenSSL**: 1.1.1+ (TLS 1.3 support)

## Next Steps

After installing dependencies:

1. **Verify Installation**: Run dependency checks
2. **Configure Build**: See [Build System](build-system.md)
3. **Platform-Specific Setup**: See platform-specific guides:
   - [Linux Build Guide](linux.md)
   - [macOS Build Guide](macos.md)
   - [Windows Build Guide](windows.md)
   - [Cross-Platform Build Guide](cross-platform.md)

## See Also

- [Build System Documentation](build-system.md)
- [Installation Requirements](requirements.md)
- [Troubleshooting Guide](troubleshooting.md)
- [Development Setup](../guides/development-setup.md)
