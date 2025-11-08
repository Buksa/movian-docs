# iOS Development

Guide for developing Movian on iOS platform.

## Prerequisites

- macOS with Xcode 11+
- iOS SDK 12.0+
- CocoaPods (optional)
- Apple Developer Account (for device testing)

## Setup

### Install Xcode

Download from Mac App Store or developer.apple.com.

### Clone Repository

```bash
git clone https://github.com/andoma/movian.git
cd movian
```

## Building

### Open Xcode Project

```bash
open movian/ios/Movian.xcodeproj
```

### Configure Signing

1. Select project in Xcode
2. Go to Signing & Capabilities
3. Select your team
4. Configure bundle identifier

### Build and Run

1. Select target device/simulator
2. Click Run (⌘R)

## Development

### iOS-Specific Code

Located in `movian/ios/` directory.

### Objective-C Code

iOS wrapper and UI code.

### C/C++ Code

Core functionality in `movian/src/`.

## Debugging

### Xcode Debugger

Use Xcode's built-in debugger for breakpoints and inspection.

### Console Output

View logs in Xcode console.

## Testing

- Test on different iOS versions
- Test on iPhone and iPad
- Test with different orientations
- Test performance

## See Also

- [Build System](../installation/build-system.md)
- [macOS Development](../installation/macos.md)
- [Development Setup](development-setup.md)
