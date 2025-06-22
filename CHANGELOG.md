# Changelog

## [2.0.0] - 2025-06-21

### 🚀 Major Release: Enhanced Window Management & Linux Optimization

#### ✨ Added
- **Perfect fullscreen experience** - completely resolved layout issues and blank spaces
- **Native Linux keyboard shortcuts** - all shortcuts now use Ctrl instead of Super/Meta key
- **Force resize functionality** - `Ctrl+Shift+R` for manual layout correction
- **Enhanced window management** - seamless handling of maximize, minimize, and fullscreen transitions
- **Intelligent platform detection** - Linux-specific user agent and behavior optimization
- **Improved event handling** - robust window state listeners for all scenarios
- **Menu integration** - new "Redimensionar vistas" option in View menu
- **IPC communication** - force-resize command for tab bar integration

#### 🔧 Fixed
- Fixed fullscreen resizing issues causing blank spaces
- Resolved keyboard shortcut conflicts on Linux (now uses Ctrl properly)
- Improved window state synchronization across all modes
- Enhanced tab switching performance and reliability
- Better error handling for edge cases and GTK compatibility

#### 🛠️ Technical Improvements
- Enhanced `BrowserView` dimension calculations
- Linux-specific user agent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36`
- JavaScript injection system for platform-specific keyboard overrides
- Comprehensive window event handling (`enter-full-screen`, `leave-full-screen`, etc.)
- New functions: `forceResizeAllViews()`, `injectLinuxKeyboardShortcuts()`
- Improved `resizeAllViews()` and `switchToTab()` with better dimension handling

#### 📦 Distribution
- Added support for multiple package formats (AppImage, Snap, Deb, RPM)
- Enhanced build configuration for Linux desktop integration
- Improved package metadata and descriptions

### 🎯 Key Features
- **Visual tab management** with full functionality
- **Native keyboard shortcuts** for all common operations (Ctrl+Z, Ctrl+K, etc.)
- **Automatic theme synchronization** between system and application
- **Cross-platform compatibility** optimized specifically for Linux
- **Professional window management** with manual override options

---

## [1.3.1] - Previous Version
### Features
- Basic tab management
- Initial Linux support
- Basic keyboard shortcuts

---

**Note**: Version 2.0.0 represents a major rewrite focusing on Linux optimization and professional window management. All users are recommended to upgrade for the best experience.
