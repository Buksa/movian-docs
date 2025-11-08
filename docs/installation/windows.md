# Building Movian on Windows

This guide covers building Movian from source on Windows systems.

## Prerequisites

### Required Software

- **Visual Studio 2019 or later** (Community Edition is sufficient)
  - Install "Desktop development with C++" workload
  - Include Windows 10 SDK

- **Git for Windows**
  - Download from [git-scm.com](https://git-scm.com/download/win)

- **CMake** (3.15 or later)
  - Download from [cmake.org](https://cmake.org/download/)
  - Add to PATH during installation

- **Python 3.7+**
  - Download from [python.org](https://www.python.org/downloads/)
  - Add to PATH during installation

### Optional Tools

- **Ninja Build System** (recommended for faster builds)
  - Download from [ninja-build.org](https://ninja-build.org/)
  - Add to PATH

## Build Steps

### 1. Clone the Repository

```cmd
git clone https://github.com/andoma/movian.git
cd movian
git submodule update --init --recursive
```

### 2. Install Dependencies

Movian uses vcpkg for dependency management on Windows:

```cmd
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
bootstrap-vcpkg.bat
vcpkg integrate install
```

Install required libraries:

```cmd
vcpkg install openssl:x64-windows
vcpkg install curl:x64-windows
vcpkg install sqlite3:x64-windows
vcpkg install freetype:x64-windows
```

### 3. Configure Build

Using Visual Studio:

```cmd
mkdir build
cd build
cmake .. -G "Visual Studio 16 2019" -A x64 ^
  -DCMAKE_TOOLCHAIN_FILE=path\to\vcpkg\scripts\buildsystems\vcpkg.cmake
```

Using Ninja (faster):

```cmd
mkdir build
cd build
cmake .. -G Ninja ^
  -DCMAKE_BUILD_TYPE=Release ^
  -DCMAKE_TOOLCHAIN_FILE=path\to\vcpkg\scripts\buildsystems\vcpkg.cmake
```

### 4. Build

Visual Studio:

```cmd
cmake --build . --config Release
```

Ninja:

```cmd
ninja
```

### 5. Run Movian

```cmd
cd Release
movian.exe
```

## Build Configuration Options

### Debug Build

```cmd
cmake .. -DCMAKE_BUILD_TYPE=Debug
cmake --build . --config Debug
```

### Custom Install Location

```cmd
cmake .. -DCMAKE_INSTALL_PREFIX=C:\Movian
cmake --build . --target install
```

### Enable/Disable Features

```cmd
cmake .. ^
  -DENABLE_WEBSERVER=ON ^
  -DENABLE_LIBAV=ON ^
  -DENABLE_VMIR=ON
```

## Troubleshooting

### CMake Configuration Fails

**Problem**: CMake cannot find dependencies

**Solution**:
- Verify vcpkg integration: `vcpkg integrate install`
- Check CMAKE_TOOLCHAIN_FILE path
- Ensure all dependencies are installed

### Build Errors

**Problem**: Compilation errors in C/C++ code

**Solution**:
- Update Visual Studio to latest version
- Clean build directory: `rmdir /s /q build`
- Verify Windows SDK is installed
- Check for missing dependencies

### Missing DLLs at Runtime

**Problem**: Application fails to start due to missing DLLs

**Solution**:
- Copy DLLs from vcpkg installed directory
- Add vcpkg bin directory to PATH
- Use static linking: `-DVCPKG_TARGET_TRIPLET=x64-windows-static`

### OpenGL Issues

**Problem**: Graphics rendering problems

**Solution**:
- Update graphics drivers
- Check OpenGL version: `glxinfo` or GPU-Z
- Verify GPU supports OpenGL 3.0+

## Development Setup

### Visual Studio Integration

1. Open `build/movian.sln` in Visual Studio
2. Set movian as startup project
3. Configure debugging:
   - Right-click project → Properties
   - Debugging → Working Directory: `$(OutDir)`
   - Debugging → Command Arguments: `--debug`

### Debugging

Enable debug logging:

```cmd
movian.exe --debug --trace
```

Set breakpoints in Visual Studio and press F5 to debug.

### Code Formatting

Install clang-format:

```cmd
vcpkg install llvm:x64-windows
```

Format code:

```cmd
clang-format -i src/**/*.c src/**/*.h
```

## Performance Optimization

### Release Build Optimizations

```cmd
cmake .. ^
  -DCMAKE_BUILD_TYPE=Release ^
  -DCMAKE_C_FLAGS="/O2 /GL" ^
  -DCMAKE_EXE_LINKER_FLAGS="/LTCG"
```

### Profile-Guided Optimization (PGO)

1. Build with instrumentation
2. Run typical workload
3. Rebuild with profile data

## Cross-Compilation

### Building for ARM64

```cmd
cmake .. -G "Visual Studio 16 2019" -A ARM64
```

## Packaging

### Create Installer

Using NSIS:

```cmd
cmake --build . --target package
```

### Portable Build

Copy required files:

```cmd
mkdir movian-portable
copy Release\movian.exe movian-portable\
copy Release\*.dll movian-portable\
xcopy /E /I resources movian-portable\resources
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Windows Build

on: [push, pull_request]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup vcpkg
        run: |
          git clone https://github.com/Microsoft/vcpkg.git
          .\vcpkg\bootstrap-vcpkg.bat
      - name: Build
        run: |
          mkdir build
          cd build
          cmake .. -G Ninja
          ninja
```

## Next Steps

- [Development Setup](../guides/development-setup.md)
- [Plugin Development](../plugins/getting-started.md)
- [UI Customization](../ui/getting-started.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

## See Also

- [Linux Build Instructions](linux.md)
- [macOS Build Instructions](macos.md)
- [Cross-Platform Build Guide](cross-platform.md)
- [Troubleshooting Guide](troubleshooting.md)
