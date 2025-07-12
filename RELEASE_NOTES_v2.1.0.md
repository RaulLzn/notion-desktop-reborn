# Release Instructions for Notion Desktop Reborn v2.1.0

## Summary of Changes in v2.1.0

✨ **New Features:**
- Improved tab creation debouncing (prevents rapid duplicate tab creation)
- Enhanced IPC handler registration (single registration prevents duplicate handlers)
- Global action counters for debugging tab operations and IPC calls
- Better window open handling with improved event management
- Enhanced debugging output with comprehensive logging

🔧 **Fixes:**
- Fixed multiple rapid tab creation issue
- Improved tab switching reliability and performance
- Better handling of window open events to prevent duplicates
- Enhanced keyboard shortcut injection (single injection per webContents)
- Improved error handling and recovery mechanisms

🛠️ **Technical Improvements:**
- Debounce mechanism for new tab actions (500ms cooldown)
- Global action tracking for debugging purposes
- Enhanced window open handler with creation flags
- Improved theme detection and application
- Better memory management for closed tabs

## Release Process

### 1. Build Completion Check
```bash
# Check if the snap was built successfully
ls -la notion-desktop-reborn_2.1.0_amd64.snap
```

### 2. Run Complete Release Script
```bash
# Execute the comprehensive release script
./scripts/complete-release.sh
```

This script will:
- ✅ Verify the snap file exists
- 🧪 Offer local testing option
- 📤 Upload to Snap Store
- 🎯 Release to edge channel
- ❓ Ask about stable release
- 🏷️  Create git tag v2.1.0
- 📋 Provide complete summary

### 3. Manual Steps (if needed)

If you prefer to do it manually:

```bash
# Login to Snap Store
snapcraft login

# Upload the snap
snapcraft upload notion-desktop-reborn_2.1.0_amd64.snap

# Release to edge channel (replace REVISION with actual number)
snapcraft release notion-desktop-reborn REVISION edge

# Release to stable (when ready)
snapcraft release notion-desktop-reborn REVISION stable

# Push changes to GitHub
git push origin main
git push origin v2.1.0
```

### 4. Post-Release Actions

1. **Verify on Snap Store:** https://snapcraft.io/notion-desktop-reborn
2. **Test installation:** `snap install notion-desktop-reborn`
3. **Update documentation** if needed
4. **Announce the release** on relevant channels

### 5. Important Links

- 🏪 **Snap Store:** https://snapcraft.io/notion-desktop-reborn
- 🎛️ **Dashboard:** https://snapcraft.io/account/
- 📦 **Install Command:** `snap install notion-desktop-reborn`
- 🔧 **Development Install:** `snap install notion-desktop-reborn --edge`

## Version Information

- **Version:** 2.1.0
- **Previous Version:** 2.0.0
- **Release Date:** July 11, 2025
- **Type:** Feature release with performance improvements

## Files Updated

- ✅ `main.js` - Enhanced tab management and debouncing
- ✅ `package.json` - Version 2.1.0
- ✅ `snap/snapcraft.yaml` - Version 2.1.0
- ✅ `CHANGELOG.md` - Added v2.1.0 entry
- ✅ `scripts/complete-release.sh` - New comprehensive release script
- ✅ `upload-snap.sh` - Updated for v2.1.0

## Ready for Release! 🚀

Once the snap build completes successfully, you can run:
```bash
./scripts/complete-release.sh
```

This will handle the entire release process automatically!
