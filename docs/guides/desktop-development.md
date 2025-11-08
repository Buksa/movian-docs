# Desktop Development

Guide for developing Movian on desktop platforms (Linux, macOS, Windows).

## Linux Development

### Prerequisites

```bash
sudo apt-get install build-essential git pkg-config
sudo apt-get install libavcodec-dev libavformat-dev libavutil-dev
sudo apt-get install libgl1-mesa-dev libx11-dev
```

### Build

```bash
./configure
make
./build.linux/movian
```

## macOS Development

### Prerequisites

```bash
brew install pkg-config ffmpeg sqlite openssl
xcode-select --install
```

### Build

```bash
./configure.osx
make
open build.osx/Movian.app
```

## Windows Development

### Prerequisites

- MSYS2 with MinGW-w64
- Or Visual Studio 2015+

### Build with MSYS2

```bash
pacman -S mingw-w64-x86_64-toolchain
pacman -S mingw-w64-x86_64-ffmpeg
./configure
make
```

## Development Tips

### IDE Setup

- **Linux**: VSCode, CLion
- **macOS**: Xcode, VSCode
- **Windows**: Visual Studio, VSCode

### Debugging

```bash
# GDB on Linux/macOS
gdb ./build.linux/movian

# LLDB on macOS
lldb ./build.osx/Movian.app/Contents/MacOS/Movian
```

### Hot Reload

Restart Movian after code changes.

## See Also

- [Build System](../installation/build-system.md)
- [Dependencies](../installation/dependencies.md)
- [Development Setup](development-setup.md)
