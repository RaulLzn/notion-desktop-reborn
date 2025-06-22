# Notion Desktop for Linux v2.0

A desktop application for [Notion](https://notion.so) with **visual tab support** and **full Linux keyboard shortcuts**.

## 🚀 What's New in v2.0

### ✨ **Enhanced Features**
- **Perfect fullscreen experience** - no layout issues or blank spaces
- **Native Linux keyboard shortcuts** - uses Ctrl instead of Super/Meta key
- **Enhanced window management** - seamless resize handling for all screen modes
- **Force resize option** - `Ctrl+Shift+R` for instant layout correction
- **Intelligent platform detection** - optimized specifically for Linux desktop environment

## Features

### 🎯 **Tab Management**
- ✅ **Visual tab bar** at the top of the window
- ✅ **"Open in new tab"** creates tabs instead of new windows
- ✅ **Click tabs** to switch between them
- ✅ **Close button (×)** on each tab
- ✅ **+ button** to create new tabs
- ✅ Support for multiple Notion pages in the same window
- ✅ Smart tab handling for internal Notion links

### ⌨️ **Keyboard Shortcuts**
- **Ctrl+T**: New tab
- **Ctrl+W**: Close current tab
- **Ctrl+Tab**: Next tab
- **Ctrl+Shift+Tab**: Previous tab
- **Ctrl+Shift+R**: Force resize views (fixes layout issues)
- **Ctrl+Z**: Undo (works fully in Notion) ✅
- **Ctrl+Shift+Z**: Redo (works fully in Notion) ✅
- **Ctrl+C/V/X**: Copy/Paste/Cut ✅
- **Ctrl+A**: Select all ✅
- **Ctrl+F**: Search in page (triggers Notion's search) ✅
- **Ctrl+K**: Quick command (triggers Notion's command palette) ✅

### 🖥️ **Desktop Integration**
- ✅ Native desktop integration
- ✅ **Auto dark/light theme** support (follows system theme)
- ✅ **Dark theme scrollbars** and UI elements
- ✅ Auto-hide menu bar with **Alt+\\** toggle
- ✅ External link handling (opens in system browser)
- ✅ Window title shows current tab and tab count
- ✅ **Perfect fullscreen experience** - no layout issues or blank spaces
- ✅ **Enhanced window management** - seamless resize handling for all screen modes

### 🐧 **Linux Optimization**
- ✅ **Native Linux keyboard shortcuts** - uses Ctrl instead of Super/Meta key
- ✅ **Intelligent platform detection** - optimized specifically for Linux desktop environment
- ✅ **GTK compatibility** with proper error handling
- ✅ **Linux-specific user agent** for optimal Notion experience

## Development

### Requirements
- Node.js and npm
- Electron 28.3.3 (for better GTK compatibility)

### Running locally
```bash
npm install
npm start
```

### Troubleshooting GTK Issues on Linux
If you encounter GTK-related errors, use the provided start script:
```bash
./start.sh
```

### How Tab System Works

1. **Visual tab bar** appears at the top of the window showing all open tabs ✅
2. **Auto-adapts to theme**: Tab bar automatically switches between light and dark theme ✅
3. **Click any tab** to switch to that page instantly ✅
4. **Click the + button** or use Ctrl+T to create a new tab ✅
5. **Click the × button** on any tab to close it (except the last tab) ✅
6. When you click **"Open in new tab"** in Notion, it creates a new tab in the same window ✅
7. Each tab runs independently with its own browsing context ✅
8. **Scrollbars match theme**: Both horizontal and vertical scrollbars adapt to dark/light theme ✅
9. The window title shows the current tab title and position (e.g., "Page Title (2/3) - Notion") ✅
10. Use keyboard shortcuts to navigate between tabs ✅

### All Features Working ✅

The application now provides a complete desktop experience for Notion with:
- **Full tab management system** with visual interface
- **Native keyboard shortcuts** for all common operations
- **Automatic theme synchronization** between tab bar and content
- **Seamless integration** with Notion's interface
- **Cross-platform compatibility** (optimized for Linux)
