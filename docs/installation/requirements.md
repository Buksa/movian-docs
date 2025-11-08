# System Requirements and Dependencies

This document provides comprehensive information about the system requirements, dependencies, and prerequisites needed to build and run Movian on various platforms.

## Overview

Movian is a cross-platform media player that requires specific system resources, build tools, and runtime libraries. Requirements vary significantly between platforms and build configurations.

## Minimum System Requirements

### Hardware Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **CPU** | x86/x86_64, ARM | Multi-core x86_64 | ARM support varies by platform |
| **RAM** | 512 MB | 2 GB+ | More for HD/4K content |
| **Storage** | 2 GB free | 5 GB+ free | For build process and dependencies |
| **GPU** | OpenGL 2.0+ | OpenGL 3.0+ | Hardware acceleration recommended |
| **Display** | 800x600 | 1920x1080+ | Higher resolution for better experience |

### Platform Support Matrix

| Platform | Architecture | Status | Notes |
|----------|-------------|--------|-------|
| **Linux** | x86_64, ARM | ✅ Fully Supported | Primary development platform |
| **macOS** | x86_64, ARM64 | ✅ Fully Supported | macOS 10.12+ required |
| **Windows** | x86_64 | ⚠️ Experimental | Cross-compilation or MinGW |
| **Android** | ARM, ARM64 | ✅ Supported | Android 5.0+ (API 21+) |
| **Raspberry Pi** | ARM | ✅ Supported | Pi 2+ recommended |
| **PlayStation 3** | PowerPC | ⚠️ Experimental | Homebrew environment |
| **iOS** | ARM64 | ⚠️ Experimental | Requires jailbreak |

## Build Dependencies

### Core Build Tools

All platforms require these fundamental build tools:

#### Compiler Requirements

| Tool | Minimum Version | Recommended | Purpose |
|------|----------------|-------------|---------|
| **GCC** | 4.8+ | 9.0+ | C/C++ compiler (Linux) |
| **Clang** | 3.5+ | 11.0+ | C/C++ compiler (macOS) |
| **Make** | 3.81+ | 4.0+ | Build automation |
| **pkg-config** | 0.25+ | Latest | Dependency management |
| **Git** | 2.0+ | Latest | Source code management |

**Compiler Feature Requirements:**
- C99 standard support
- C++11 standard support (for some components)
- POSIX thread support
- Inline assembly support (optional, for optimizations)

#### Build System Tools

```bash
# Required tools
- GNU Make or compatible
- Shell (bash, sh)
- Standard UNIX utilities (sed, awk, grep)
- pkg-config for library detection
```

### Required Libraries

These libraries are mandatory for building Movian:

#### Graphics and UI Libraries

| Library | Minimum Version | Purpose | Package Names |
|---------|----------------|---------|---------------|
| **FreeType** | 2.4.0+ | Font rendering | `libfreetype6-dev` (Debian)<br>`freetype-devel` (Fedora) |
| **Fontconfig** | 2.8.0+ | Font configuration | `libfontconfig1-dev` (Debian)<br>`fontconfig-devel` (Fedora) |
| **OpenGL** | 2.0+ | 3D graphics | `libgl1-mesa-dev` (Debian)<br>`mesa-libGL-devel` (Fedora) |
| **X11** | 1.4+ | Window system (Linux) | `libx11-dev` (Debian)<br>`libX11-devel` (Fedora) |
| **Xext** | 1.3+ | X11 extensions | `libxext-dev` (Debian)<br>`libXext-devel` (Fedora) |

#### Audio Libraries

| Library | Minimum Version | Purpose | Package Names |
|---------|----------------|---------|---------------|
| **ALSA** | 1.0.20+ | Audio output (Linux) | `libasound2-dev` (Debian)<br>`alsa-lib-devel` (Fedora) |
| **PulseAudio** | 0.9.21+ | Audio server | `libpulse-dev` (Debian)<br>`pulseaudio-libs-devel` (Fedora) |

#### System Libraries

| Library | Minimum Version | Purpose | Package Names |
|---------|----------------|---------|---------------|
| **SQLite** | 3.7.0+ | Database | `libsqlite3-dev` (Debian)<br>`sqlite-devel` (Fedora) |
| **OpenSSL** | 1.0.0+ | Cryptography/TLS | `libssl-dev` (Debian)<br>`openssl-devel` (Fedora) |
| **zlib** | 1.2.3+ | Compression | `zlib1g-dev` (Debian)<br>`zlib-devel` (Fedora) |
| **pthread** | POSIX | Threading | Usually included with libc |

### Optional Libraries

These libraries enable additional features but are not strictly required:

#### Enhanced Features

| Library | Purpose | Impact if Missing | Package Names |
|---------|---------|-------------------|---------------|
| **GTK+ 2** | File dialogs, UI integration | No native dialogs | `libgtk2.0-dev` (Debian)<br>`gtk2-devel` (Fedora) |
| **WebKit** | Web browsing features | No web content | `libwebkitgtk-dev` (Debian)<br>`webkit2gtk3-devel` (Fedora) |
| **Avahi** | Network service discovery | No auto-discovery | `libavahi-client-dev` (Debian)<br>`avahi-devel` (Fedora) |
| **libcurl** | HTTP client | Limited networking | `libcurl4-openssl-dev` (Debian)<br>`libcurl-devel` (Fedora) |

#### Video Acceleration

| Library | Purpose | Impact if Missing | Package Names |
|---------|---------|-------------------|---------------|
| **VDPAU** | NVIDIA video acceleration | No HW decode (NVIDIA) | `libvdpau-dev` (Debian)<br>`libvdpau-devel` (Fedora) |
| **VA-API** | Intel/AMD video acceleration | No HW decode (Intel/AMD) | `libva-dev` (Debian)<br>`libva-devel` (Fedora) |
| **libXv** | X Video extension | Software video only | `libxv-dev` (Debian)<br>`libXv-devel` (Fedora) |

#### Additional Features

| Library | Purpose | Impact if Missing | Package Names |
|---------|---------|-------------------|---------------|
| **libXss** | Screen saver control | No screensaver inhibit | `libxss-dev` (Debian)<br>`libXScrnSaver-devel` (Fedora) |
| **libXxf86vm** | Video mode switching | No resolution change | `libxxf86vm-dev` (Debian)<br>`libXxf86vm-devel` (Fedora) |
| **LIRC** | IR remote control | No remote support | `liblircclient-dev` (Debian)<br>`lirc-devel` (Fedora) |
| **librtmp** | RTMP streaming | No RTMP support | `librtmp-dev` (Debian)<br>`librtmp-devel` (Fedora) |

### Build-Time Tools

| Tool | Purpose | Required | Package Names |
|------|---------|----------|---------------|
| **yasm** | Assembly optimizer | Recommended | `yasm` (all distros) |
| **nasm** | Alternative assembler | Optional | `nasm` (all distros) |
| **ccache** | Compiler cache | Optional | `ccache` (all distros) |
| **distcc** | Distributed compilation | Optional | `distcc` (all distros) |

## Platform-Specific Requirements

### Linux

#### Debian/Ubuntu

**Minimum Versions:**
- Ubuntu 16.04 LTS or later
- Debian 9 (Stretch) or later

**Complete Dependency Installation:**
```bash
sudo apt-get update
sudo apt-get install -y \
    git build-essential pkg-config \
    libfreetype6-dev libfontconfig1-dev \
    libxext-dev libgl1-mesa-dev \
    libasound2-dev libpulse-dev \
    libgtk2.0-dev libxss-dev \
    libxxf86vm-dev libxv-dev libvdpau-dev \
    yasm libssl-dev curl \
    libwebkitgtk-dev libsqlite3-dev \
    libavahi-client-dev
```

**Disk Space Requirements:**
- Source code: ~200 MB
- Build artifacts: ~500 MB
- Dependencies: ~300 MB
- **Total:** ~1 GB minimum

#### Fedora/CentOS/RHEL

**Minimum Versions:**
- Fedora 30+
- CentOS 8+ / RHEL 8+
- CentOS 7 / RHEL 7 (with devtoolset-8)

**Complete Dependency Installation:**
```bash
sudo dnf install -y \
    git gcc gcc-c++ make pkg-config \
    freetype-devel fontconfig-devel \
    libXext-devel mesa-libGL-devel \
    alsa-lib-devel pulseaudio-libs-devel \
    gtk2-devel libXScrnSaver-devel \
    libXxf86vm-devel libXv-devel \
    libvdpau-devel yasm openssl-devel \
    curl-devel webkitgtk3-devel \
    sqlite-devel avahi-devel
```

**CentOS 7 Special Requirements:**
```bash
# Install newer GCC toolchain
sudo yum install -y centos-release-scl
sudo yum install -y devtoolset-8-gcc devtoolset-8-gcc-c++
scl enable devtoolset-8 bash
```

#### Arch Linux

**Complete Dependency Installation:**
```bash
sudo pacman -S --needed \
    git base-devel pkg-config \
    freetype2 fontconfig libxext \
    mesa alsa-lib pulseaudio gtk2 \
    libxss libxxf86vm libxv libvdpau \
    yasm openssl curl webkit2gtk \
    sqlite avahi
```

### macOS

**Minimum Version:** macOS 10.12 (Sierra)  
**Recommended:** macOS 11.0 (Big Sur) or later

**Required Tools:**
- Xcode 9.0+ (or Xcode Command Line Tools)
- Homebrew package manager

**Xcode Installation:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or install full Xcode from App Store
# Then accept license
sudo xcodebuild -license accept
```

**Homebrew Dependencies:**
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install \
    pkg-config freetype fontconfig \
    yasm openssl@1.1 sqlite
```

**Disk Space Requirements:**
- Xcode: ~10 GB
- Homebrew dependencies: ~500 MB
- Build artifacts: ~300 MB
- **Total:** ~11 GB

### Windows

**Build Methods:**
1. **Cross-compilation from Linux** (Recommended)
2. **MinGW-w64 on Windows**
3. **MSYS2 environment**

#### Cross-Compilation (Linux → Windows)

**Host Requirements:**
- Linux system with MinGW-w64 toolchain
- 2 GB free disk space

**Toolchain Installation (Ubuntu/Debian):**
```bash
sudo apt-get install -y \
    mingw-w64 gcc-mingw-w64 g++-mingw-w64 \
    binutils-mingw-w64 wine
```

#### Native Windows Build (MSYS2)

**Minimum Version:** Windows 7 SP1 or later  
**Recommended:** Windows 10 or later

**MSYS2 Installation:**
1. Download MSYS2 from https://www.msys2.org/
2. Install to `C:\msys64`
3. Update package database:
```bash
pacman -Syu
```

**Dependencies:**
```bash
pacman -S --needed \
    base-devel mingw-w64-x86_64-toolchain \
    mingw-w64-x86_64-pkg-config \
    mingw-w64-x86_64-freetype \
    mingw-w64-x86_64-fontconfig \
    mingw-w64-x86_64-sqlite3 \
    mingw-w64-x86_64-openssl \
    git yasm
```

### Android

**Minimum Version:** Android 5.0 (Lollipop, API 21)  
**Recommended:** Android 8.0+ (Oreo, API 26+)

**Build Requirements:**
- Android NDK r21+ (r23+ recommended)
- Android SDK with API 21+ platform
- Java JDK 8 or 11
- Linux or macOS host system

**NDK Installation:**
```bash
# Download NDK
wget https://dl.google.com/android/repository/android-ndk-r23c-linux.zip
unzip android-ndk-r23c-linux.zip
export ANDROID_NDK_ROOT=$PWD/android-ndk-r23c
```

**Disk Space Requirements:**
- Android NDK: ~1 GB
- Android SDK: ~2 GB
- Build artifacts: ~500 MB
- **Total:** ~3.5 GB

### Raspberry Pi

**Supported Models:**
- Raspberry Pi 2 Model B or later
- Raspberry Pi 3 Model B/B+ (Recommended)
- Raspberry Pi 4 Model B (Best performance)

**OS Requirements:**
- Raspberry Pi OS (formerly Raspbian) Buster or later
- 64-bit OS recommended for Pi 3/4

**Memory Requirements:**
- Minimum: 1 GB RAM
- Recommended: 2 GB+ RAM
- Swap space: 1 GB+ for compilation

**Dependencies:**
```bash
sudo apt-get update
sudo apt-get install -y \
    git build-essential pkg-config \
    libfreetype6-dev libfontconfig1-dev \
    libgles2-mesa-dev libegl1-mesa-dev \
    libasound2-dev libpulse-dev \
    libsqlite3-dev libssl-dev \
    yasm
```

## Runtime Requirements

### System Resources

**During Playback:**
- CPU: 10-50% (varies by codec and resolution)
- RAM: 100-500 MB (varies by content)
- GPU: Hardware acceleration recommended for HD+

**Codec Support:**
- H.264/AVC: Universal support
- H.265/HEVC: Requires hardware support or powerful CPU
- VP9: Requires hardware support or powerful CPU
- Audio: AAC, MP3, FLAC, Vorbis, Opus

### Network Requirements

**For Streaming:**
- Bandwidth: 5 Mbps+ for HD, 25 Mbps+ for 4K
- Latency: <100ms for smooth streaming
- Protocols: HTTP, HTTPS, RTSP, RTMP

**For Plugin Functionality:**
- Internet connection for content providers
- DNS resolution
- Firewall: Allow outbound HTTP/HTTPS

### Display Requirements

**Supported Outputs:**
- HDMI (preferred)
- DisplayPort
- DVI
- VGA (with adapter)

**Resolution Support:**
- Minimum: 800x600
- Maximum: 4K (3840x2160) with capable hardware
- Aspect ratios: 4:3, 16:9, 16:10, 21:9

## Dependency Version Matrix

### Critical Version Combinations

| Component | Ubuntu 20.04 | Fedora 34 | macOS 11 | Notes |
|-----------|-------------|-----------|----------|-------|
| GCC/Clang | 9.3.0 | 11.0.0 | 12.0.0 | Minimum C99 support |
| FreeType | 2.10.1 | 2.10.4 | 2.11.0 | Font rendering |
| OpenGL | 3.0 | 3.3 | 4.1 | Hardware acceleration |
| SQLite | 3.31.1 | 3.34.1 | 3.36.0 | Database |
| OpenSSL | 1.1.1f | 1.1.1k | 1.1.1l | TLS/crypto |

### Known Incompatibilities

**Avoid These Combinations:**
- GCC < 4.8 (missing C99 features)
- FreeType < 2.4.0 (API incompatibilities)
- OpenSSL 3.0.0-3.0.3 (known bugs, use 3.0.4+)
- SQLite < 3.7.0 (missing features)

## Verification Commands

### Check Installed Versions

```bash
# Compiler versions
gcc --version
g++ --version
clang --version

# Library versions (pkg-config)
pkg-config --modversion freetype2
pkg-config --modversion fontconfig
pkg-config --modversion sqlite3
pkg-config --modversion openssl

# OpenGL version
glxinfo | grep "OpenGL version"

# System information
uname -a
lsb_release -a  # Linux only
sw_vers         # macOS only
```

### Test Build Environment

```bash
# Test C compiler
echo 'int main() { return 0; }' | gcc -x c - -o /tmp/test && echo "C compiler OK"

# Test C++ compiler
echo 'int main() { return 0; }' | g++ -x c++ - -o /tmp/test && echo "C++ compiler OK"

# Test pkg-config
pkg-config --exists freetype2 && echo "FreeType found"
pkg-config --exists fontconfig && echo "Fontconfig found"
pkg-config --exists sqlite3 && echo "SQLite found"

# Test OpenGL
pkg-config --exists gl && echo "OpenGL found"
```

## Troubleshooting

### Common Dependency Issues

#### Missing pkg-config Files

**Problem:** `Package 'xxx' not found`

**Solution:**
```bash
# Debian/Ubuntu
sudo apt-get install pkg-config
export PKG_CONFIG_PATH=/usr/lib/pkgconfig:/usr/local/lib/pkgconfig

# Fedora
sudo dnf install pkg-config
```

#### Library Version Conflicts

**Problem:** Multiple versions installed

**Solution:**
```bash
# Check installed versions
dpkg -l | grep libfreetype  # Debian/Ubuntu
rpm -qa | grep freetype     # Fedora/RHEL

# Remove old versions
sudo apt-get remove libfreetype6-dev  # Debian/Ubuntu
sudo dnf remove freetype-devel        # Fedora
```

#### Compiler Too Old

**Problem:** GCC < 4.8 or Clang < 3.5

**Solution:**
```bash
# Ubuntu: Install newer GCC
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get update
sudo apt-get install gcc-9 g++-9

# CentOS 7: Use devtoolset
sudo yum install centos-release-scl
sudo yum install devtoolset-8
scl enable devtoolset-8 bash
```

#### OpenGL Not Found

**Problem:** No OpenGL development files

**Solution:**
```bash
# Debian/Ubuntu
sudo apt-get install libgl1-mesa-dev mesa-common-dev

# Fedora
sudo dnf install mesa-libGL-devel

# Verify
pkg-config --modversion gl
```

### Platform-Specific Issues

#### macOS: Xcode License Not Accepted

```bash
sudo xcodebuild -license accept
```

#### macOS: OpenSSL Not Found

```bash
# Install OpenSSL via Homebrew
brew install openssl@1.1

# Set PKG_CONFIG_PATH
export PKG_CONFIG_PATH="/usr/local/opt/openssl@1.1/lib/pkgconfig:$PKG_CONFIG_PATH"
```

#### Linux: Missing X11 Development Files

```bash
# Debian/Ubuntu
sudo apt-get install xorg-dev

# Fedora
sudo dnf groupinstall "X Software Development"
```

## Next Steps

After verifying all requirements are met:

1. **[Linux Installation Guide](linux.md)** - Build on Linux
2. **[macOS Installation Guide](macos.md)** - Build on macOS
3. **[Windows Installation Guide](windows.md)** - Build on Windows
4. **[Cross-Platform Guide](cross-platform.md)** - Android, Raspberry Pi, etc.
5. **[Troubleshooting Guide](troubleshooting.md)** - Common build issues

## See Also

- [Build System Overview](build-system.md) - Understanding Movian's build system
- [Development Setup](../guides/development-setup.md) - IDE configuration
- [Contributing Guide](../CONTRIBUTING.md) - Contributing to Movian
- [FAQ](../reference/faq.md) - Frequently asked questions

---

**Last Updated:** 2025-11-08  
**Movian Version:** 4.8+  
**Accuracy Status:** 🟢 Verified from source code analysis
