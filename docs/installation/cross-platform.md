# Cross-Platform Build Guide

This guide covers building Movian for multiple platforms and cross-compilation scenarios.

## Overview

Movian supports building for various platforms:

- **Desktop**: Linux, Windows, macOS
- **Mobile**: Android, iOS (limited)
- **Embedded**: Raspberry Pi, other ARM devices

## Build System

Movian uses CMake as its primary build system, providing:

- Cross-platform configuration
- Dependency management
- Multiple generator support (Make, Ninja, Visual Studio, Xcode)
- Toolchain file support for cross-compilation

## Platform-Specific Builds

### Quick Reference

| Platform | Generator | Toolchain |
|----------|-----------|-----------|
| Linux | Unix Makefiles / Ninja | Native |
| Windows | Visual Studio / Ninja | vcpkg |
| macOS | Xcode / Unix Makefiles | Homebrew |
| Android | Ninja | NDK |
| iOS | Xcode | iOS SDK |
| Raspberry Pi | Unix Makefiles | ARM toolchain |

## Cross-Compilation Basics

### Toolchain Files

Create a toolchain file for your target platform:

```cmake
# arm-linux-toolchain.cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)

set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
set(CMAKE_CXX_COMPILER arm-linux-gnueabihf-g++)

set(CMAKE_FIND_ROOT_PATH /usr/arm-linux-gnueabihf)
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
```

Use the toolchain:

```bash
cmake .. -DCMAKE_TOOLCHAIN_FILE=arm-linux-toolchain.cmake
```

## Android Build

### Prerequisites

- Android NDK r21 or later
- Android SDK with API level 21+
- CMake 3.15+

### Build Steps

```bash
# Set NDK path
export ANDROID_NDK=/path/to/android-ndk

# Configure
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-21 \
  -DANDROID_STL=c++_shared

# Build
cmake --build .
```

### Android ABIs

Build for multiple architectures:

```bash
# ARM 64-bit
-DANDROID_ABI=arm64-v8a

# ARM 32-bit
-DANDROID_ABI=armeabi-v7a

# x86 64-bit (emulator)
-DANDROID_ABI=x86_64

# x86 32-bit (emulator)
-DANDROID_ABI=x86
```

### Creating APK

```bash
# Build native libraries
./gradlew assembleRelease

# Output: app/build/outputs/apk/release/movian-release.apk
```

## iOS Build (Experimental)

### Prerequisites

- Xcode 12+
- iOS SDK 13.0+
- macOS development machine

### Build Steps

```bash
# Configure for iOS
cmake .. -G Xcode \
  -DCMAKE_SYSTEM_NAME=iOS \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=13.0 \
  -DCMAKE_OSX_ARCHITECTURES=arm64

# Build
cmake --build . --config Release
```

### iOS Simulator

```bash
cmake .. -G Xcode \
  -DCMAKE_SYSTEM_NAME=iOS \
  -DCMAKE_OSX_SYSROOT=iphonesimulator \
  -DCMAKE_OSX_ARCHITECTURES=x86_64
```

## Raspberry Pi Build

### On Raspberry Pi (Native)

```bash
# Install dependencies
sudo apt-get install build-essential cmake git
sudo apt-get install libfreetype6-dev libssl-dev libsqlite3-dev

# Build
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
```

### Cross-Compilation from Linux

```bash
# Install cross-compiler
sudo apt-get install gcc-arm-linux-gnueabihf g++-arm-linux-gnueabihf

# Configure
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=../cmake/rpi-toolchain.cmake \
  -DCMAKE_BUILD_TYPE=Release

# Build
make -j$(nproc)
```

## Embedded Linux Devices

### Generic ARM Device

```bash
# Configure
cmake .. \
  -DCMAKE_SYSTEM_NAME=Linux \
  -DCMAKE_SYSTEM_PROCESSOR=arm \
  -DCMAKE_C_COMPILER=arm-linux-gnueabihf-gcc \
  -DCMAKE_CXX_COMPILER=arm-linux-gnueabihf-g++

# Build
make
```

### OpenWrt

```bash
# Use OpenWrt SDK
source /path/to/openwrt/staging_dir/target-*/environment

cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=openwrt-toolchain.cmake \
  -DCMAKE_BUILD_TYPE=Release

make
```

## Dependency Management

### vcpkg (Windows, Linux, macOS)

```bash
# Install vcpkg
git clone https://github.com/Microsoft/vcpkg.git
./vcpkg/bootstrap-vcpkg.sh

# Install dependencies
./vcpkg/vcpkg install openssl curl sqlite3 freetype

# Use in CMake
cmake .. -DCMAKE_TOOLCHAIN_FILE=./vcpkg/scripts/buildsystems/vcpkg.cmake
```

### Conan (Cross-Platform)

```bash
# Install Conan
pip install conan

# Install dependencies
conan install .. --build=missing

# Configure
cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake
```

## Build Optimization

### Parallel Builds

```bash
# Make
make -j$(nproc)

# Ninja
ninja -j$(nproc)

# CMake (any generator)
cmake --build . --parallel $(nproc)
```

### Compiler Optimizations

```bash
cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_C_FLAGS="-O3 -march=native" \
  -DCMAKE_CXX_FLAGS="-O3 -march=native"
```

### Link-Time Optimization (LTO)

```bash
cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=ON
```

## Static vs Dynamic Linking

### Static Build

```bash
cmake .. \
  -DBUILD_SHARED_LIBS=OFF \
  -DCMAKE_EXE_LINKER_FLAGS="-static"
```

### Dynamic Build

```bash
cmake .. \
  -DBUILD_SHARED_LIBS=ON
```

## Packaging

### Linux Packages

```bash
# DEB package
cmake .. -DCPACK_GENERATOR=DEB
make package

# RPM package
cmake .. -DCPACK_GENERATOR=RPM
make package

# AppImage
cmake .. -DCPACK_GENERATOR=External
make package
```

### Windows Installer

```bash
# NSIS installer
cmake .. -DCPACK_GENERATOR=NSIS
cmake --build . --target package
```

### macOS Bundle

```bash
# DMG image
cmake .. -DCPACK_GENERATOR=DragNDrop
make package
```

## Continuous Integration

### Multi-Platform CI Matrix

```yaml
# .github/workflows/build.yml
name: Multi-Platform Build

on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        include:
          - os: ubuntu-latest
            generator: Unix Makefiles
          - os: windows-latest
            generator: Visual Studio 16 2019
          - os: macos-latest
            generator: Xcode
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure
        run: |
          mkdir build
          cd build
          cmake .. -G "${{ matrix.generator }}"
      
      - name: Build
        run: cmake --build build --config Release
```

## Troubleshooting

### Cross-Compilation Issues

**Problem**: Cannot find libraries for target platform

**Solution**:
- Set CMAKE_FIND_ROOT_PATH to target sysroot
- Use CMAKE_FIND_ROOT_PATH_MODE_* variables
- Install target platform development packages

### Architecture Mismatches

**Problem**: Binary won't run on target device

**Solution**:
- Verify CMAKE_SYSTEM_PROCESSOR matches target
- Check compiler flags for correct architecture
- Use `file` command to verify binary architecture

### Missing Dependencies

**Problem**: Build fails due to missing libraries

**Solution**:
- Install development packages for target platform
- Use package manager (vcpkg, conan)
- Build dependencies from source

## Best Practices

### Version Control

- Commit toolchain files
- Document build requirements
- Use submodules for dependencies
- Tag releases consistently

### Build Scripts

Create platform-specific build scripts:

```bash
#!/bin/bash
# build-linux.sh
mkdir -p build-linux
cd build-linux
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
```

### Testing

Test builds on actual target hardware:

```bash
# Copy to device
scp movian user@device:/tmp/

# Run on device
ssh user@device /tmp/movian --version
```

## Next Steps

- [Linux Build Guide](linux.md)
- [Windows Build Guide](windows.md)
- [macOS Build Guide](macos.md)
- [Development Setup](../guides/development-setup.md)

## See Also

- [CMake Documentation](https://cmake.org/documentation/)
- [Android NDK Guide](https://developer.android.com/ndk/guides)
- [vcpkg Documentation](https://vcpkg.io/)
- [Troubleshooting](troubleshooting.md)
