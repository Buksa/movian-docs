# Android Development

Guide for developing Movian on Android platform.

## Prerequisites

- Android SDK (API Level 21+)
- Android NDK (r21+)
- Java Development Kit (JDK 8+)
- Android Studio (recommended)

## Setup

### Install Android SDK/NDK

```bash
# Via Android Studio
# Or download standalone tools from developer.android.com

export ANDROID_HOME=/path/to/android-sdk
export ANDROID_NDK=/path/to/android-ndk
```

### Clone Repository

```bash
git clone https://github.com/andoma/movian.git
cd movian
```

## Building

### Configure Build

```bash
./configure.android
```

### Build APK

```bash
make
```

### Install on Device

```bash
adb install build/android/movian.apk
```

## Development

### Android-Specific Code

Located in `movian/android/` directory.

### Native Code

C/C++ code in `movian/src/` compiled via NDK.

### Java Code

Java wrapper in `movian/android/src/`.

## Debugging

### Logcat

```bash
adb logcat | grep Movian
```

### Native Debugging

```bash
ndk-gdb --start
```

## Testing

- Test on different Android versions
- Test on different screen sizes
- Test with hardware buttons
- Test performance

## See Also

- [Build System](../installation/build-system.md)
- [Cross-Platform Guide](../installation/cross-platform.md)
- [Development Setup](development-setup.md)
