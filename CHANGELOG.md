# Changelog - Notion Desktop Reborn

## [2.1.0] - 2025-07-11

### 🚀 Enhanced Tab Management & Performance Improvements

#### ✨ Added
- **Improved tab creation debouncing** - prevents rapid duplicate tab creation
- **Enhanced IPC handler registration** - single registration prevents duplicate handlers
- **Global action counters** - debugging support for tab operations and IPC calls
- **Better window open handling** - improved handling of new window requests
- **Enhanced debugging output** - comprehensive logging for tab operations

#### 🔧 Fixed
- Fixed multiple rapid tab creation issue
- Improved tab switching reliability and performance
- Better handling of window open events to prevent duplicates
- Enhanced keyboard shortcut injection (single injection per webContents)
- Improved error handling and recovery mechanisms

#### 🛠️ Technical Improvements
- Debounce mechanism for new tab actions (500ms cooldown)
- Global action tracking for debugging purposes
- Enhanced window open handler with creation flags
- Improved theme detection and application
- Better memory management for closed tabs

---

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
- **Snap Store packaging** - ready for distribution via Ubuntu Snap Store
- **Automated deployment scripts** - `upload-snap.sh` for streamlined publishing

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
- **Snap Store ready** - `notion-desktop-reborn` package configured for Ubuntu Snap Store
- Added support for multiple package formats (AppImage, Snap, Deb, RPM)
- Enhanced build configuration for Linux desktop integration
- Improved package metadata and descriptions
- Complete Snap Store documentation and deployment workflow

### 🎯 Key Features of Notion Desktop Reborn
- **Visual tab management** with full functionality
- **Native keyboard shortcuts** for all common operations (Ctrl+Z, Ctrl+K, etc.)
- **Automatic theme synchronization** between system and application
- **Cross-platform compatibility** optimized specifically for Linux
- **Professional window management** with manual override options
- **Snap Store distribution** for easy installation and updates

---

## [1.3.1] - Previous Version
### Features
- Basic tab management
- Initial Linux support
- Basic keyboard shortcuts

---

**Note**: Version 2.1.0 and 2.0.0 represents a major rewrite of Notion Desktop Reborn focusing on Linux optimization, professional window management, and enhanced tab management. All users are recommended to upgrade for the best experience.
