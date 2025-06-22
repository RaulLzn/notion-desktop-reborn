# 📦 Notion Desktop Reborn v2.0 - Installation Guide

## 🚀 Quick Start

### Snap Store (Recommended)
```bash
# Install from Snap Store (when available)
sudo snap install notion-desktop-reborn

# Run the application
notion-desktop-reborn
```

### AppImage (Universal)
```bash
# Download and make executable
chmod +x "Notion Desktop Reborn-2.0.0.AppImage"

# Run directly
./"Notion Desktop Reborn-2.0.0.AppImage"
```

### Integration with Desktop Environment
```bash
# Move to applications folder (optional)
sudo mv "Notion Desktop Reborn-2.0.0.AppImage" /opt/notion-desktop-reborn.AppImage

# Create desktop entry
cat > ~/.local/share/applications/notion-desktop-reborn.desktop << EOF
[Desktop Entry]
Name=Notion Desktop Reborn
Comment=Desktop application for Notion with tab support and Linux optimization
Exec=/opt/notion-desktop-reborn.AppImage
Icon=notion
Type=Application
Categories=Office;TextEditor;
Keywords=notion;notes;productivity;tabs;linux;reborn;
EOF

# Update desktop database
update-desktop-database ~/.local/share/applications/
```

## 🔧 Alternative Installation Methods

### Build from Source
```bash
# Clone repository
git clone https://github.com/your-username/notion-desktop-reborn.git
cd notion-desktop-reborn

# Install dependencies
npm install

# Build AppImage
npm run build

# Build all formats (AppImage, Snap, Deb, RPM)
npm run build-all
```

### For Developers
```bash
# Run in development mode
npm start

# Run with X11 backend (if needed)
npm run start-x11

# Run with debug logging
npm run start-debug
```

## ✨ What's New in v2.0

- **Perfect fullscreen experience** - no layout issues
- **Native Linux keyboard shortcuts** - uses Ctrl instead of Super/Meta
- **Enhanced window management** - seamless resize handling
- **Force resize option** - `Ctrl+Shift+R` for instant layout correction
- **Intelligent platform detection** - optimized for Linux

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close current tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+Shift+R` | Force resize views |
| `Ctrl+Z` | Undo (in Notion) |
| `Ctrl+K` | Quick command (Notion) |
| `Ctrl+F` | Search in page |

## 🐛 Troubleshooting

### Layout Issues
If you experience blank spaces or layout problems:
1. Press `Ctrl+Shift+R` to force resize all views
2. Toggle fullscreen mode (F11) twice
3. Restart the application if needed

### GTK Errors on Linux
If you get GTK-related errors, try:
```bash
# Use the provided start script
./start.sh

# Or run with X11 backend
GDK_BACKEND=x11 ./notion-desktop-reborn.AppImage
```

### Keyboard Shortcuts Not Working
All shortcuts now use the `Ctrl` key on Linux (not Super/Meta). If shortcuts still don't work:
1. Restart the application
2. Check if other applications are intercepting the shortcuts
3. Try clicking in the Notion content area first

## 📋 System Requirements

- **OS**: Linux (any distribution)
- **Architecture**: x86_64 (64-bit)
- **Memory**: 4GB RAM recommended
- **Disk Space**: 200MB free space
- **Internet**: Required for Notion access

## 🔗 Links

- **GitHub Repository**: https://github.com/your-username/notion-desktop-reborn
- **Bug Reports**: https://github.com/your-username/notion-desktop-reborn/issues
- **Feature Requests**: https://github.com/your-username/notion-desktop-reborn/discussions

## 📝 License

This project is licensed under the ISC License. See LICENSE file for details.

---

**Enjoy your enhanced Notion experience on Linux! 🐧✨**
