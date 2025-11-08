# Development Environment Setup

This guide helps you set up a complete development environment for Movian development.

## Prerequisites

### Required Tools

- **Git**: Version control
- **C/C++ Compiler**: GCC, Clang, or MSVC
- **CMake**: Build system (3.15+)
- **Python**: Build scripts (3.7+)

### Platform-Specific Requirements

#### Linux

```bash
sudo apt-get install build-essential cmake git python3
sudo apt-get install libfreetype6-dev libssl-dev libsqlite3-dev
```

#### Windows

- Visual Studio 2019+ with C++ workload
- Git for Windows
- CMake
- Python 3.7+

#### macOS

```bash
xcode-select --install
brew install cmake python3
```

## IDE Setup

### Visual Studio Code

#### Extensions

Install these extensions:

- C/C++ (Microsoft)
- CMake Tools
- GitLens
- Markdown All in One

#### Configuration

Create `.vscode/settings.json`:

```json
{
  "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools",
  "cmake.buildDirectory": "${workspaceFolder}/build",
  "files.associations": {
    "*.view": "xml"
  }
}
```

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Movian",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/build/movian",
      "args": ["--debug"],
      "cwd": "${workspaceFolder}",
      "environment": [],
      "externalConsole": false
    }
  ]
}
```

### CLion

1. Open project folder
2. CLion auto-detects CMake configuration
3. Set build configuration to Debug
4. Configure run configuration with `--debug` flag

### Xcode

```bash
mkdir build && cd build
cmake .. -G Xcode
open movian.xcodeproj
```

## Building from Source

### Clone Repository

```bash
git clone https://github.com/andoma/movian.git
cd movian
git submodule update --init --recursive
```

### Configure Build

```bash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug
```

### Build

```bash
cmake --build . --parallel
```

### Run

```bash
./movian --debug
```

## Development Workflow

### Code Changes

1. Create feature branch
2. Make changes
3. Build and test
4. Commit changes
5. Push and create PR

### Testing

```bash
# Run tests
ctest

# Run with debug logging
./movian --debug --trace
```

### Debugging

#### GDB (Linux)

```bash
gdb ./movian
(gdb) run --debug
(gdb) bt  # backtrace on crash
```

#### LLDB (macOS)

```bash
lldb ./movian
(lldb) run --debug
(lldb) bt  # backtrace on crash
```

#### Visual Studio (Windows)

1. Open solution in Visual Studio
2. Set breakpoints
3. Press F5 to debug

## Plugin Development

### Setup Plugin Directory

```bash
mkdir -p ~/.hts/movian/plugins/my-plugin
cd ~/.hts/movian/plugins/my-plugin
```

### Live Development

1. Edit plugin files
2. Restart Movian or reload plugins
3. Test changes

### Debugging Plugins

Enable plugin debug logging:

```bash
movian --debug plugin
```

## UI Development

### View File Editing

1. Edit view files in skin directory
2. Some builds support live reload (Ctrl+R)
3. Check logs for syntax errors

### Testing UI Changes

```bash
movian --debug glw
```

## Documentation Development

### Setup

```bash
cd movian-docs
pip install -r requirements.txt
```

### Live Preview

```bash
mkdocs serve
```

Open http://localhost:8000

### Build Documentation

```bash
mkdocs build
```

## Useful Tools

### Code Formatting

```bash
clang-format -i src/**/*.c src/**/*.h
```

### Static Analysis

```bash
cppcheck src/
```

### Memory Debugging

```bash
valgrind --leak-check=full ./movian
```

## Troubleshooting

### Build Fails

- Clean build directory: `rm -rf build`
- Update submodules: `git submodule update --init --recursive`
- Check dependencies are installed

### Runtime Crashes

- Build with debug symbols: `-DCMAKE_BUILD_TYPE=Debug`
- Run with debugger
- Check logs in `~/.hts/movian/log`

## Next Steps

- [Building on Linux](../installation/linux.md)
- [Building on Windows](../installation/windows.md)
- [Building on macOS](../installation/macos.md)
- [Plugin Development](../plugins/getting-started.md)
- [UI Development](../ui/getting-started.md)

## See Also

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Architecture Overview](../architecture/overview.md)
- [Debugging Guide](debugging-plugins.md)
