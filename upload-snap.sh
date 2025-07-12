#!/bin/bash

echo "🚀 Notion Desktop Reborn - Snap Store Upload"
echo "============================================="

# Check if snap file exists
SNAP_FILE="notion-desktop-reborn_2.1.0_amd64.snap"

if [ ! -f "$SNAP_FILE" ]; then
    echo "❌ Snap file not found: $SNAP_FILE"
    echo "Please run 'snapcraft' first to build the snap."
    exit 1
fi

echo "✅ Found snap file: $SNAP_FILE"
echo "📏 Size: $(du -h "$SNAP_FILE" | cut -f1)"
echo ""

# Login to Snap Store
echo "🔐 Logging in to Snap Store..."
echo "Please follow the authentication prompts."
snapcraft login

if [ $? -ne 0 ]; then
    echo "❌ Failed to login to Snap Store"
    exit 1
fi

echo "✅ Successfully logged in to Snap Store"
echo ""

# Register the snap name (might fail if already registered)
echo "📝 Registering snap name 'notion-desktop-reborn'..."
snapcraft register notion-desktop-reborn

if [ $? -eq 0 ]; then
    echo "✅ Successfully registered snap name"
else
    echo "⚠️  Snap name might already be registered (this is okay if you own it)"
fi

echo ""

# Upload the snap
echo "📤 Uploading snap to Snap Store..."
echo "This may take several minutes depending on your internet connection..."

snapcraft upload "$SNAP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Successfully uploaded snap to Snap Store!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://snapcraft.io/notion-desktop-reborn"
    echo "2. Complete the store listing (description, screenshots, etc.)"
    echo "3. Release to edge channel for testing:"
    echo "   snapcraft release notion-desktop-reborn <revision> edge"
    echo "4. After testing, release to stable:"
    echo "   snapcraft release notion-desktop-reborn <revision> stable"
    echo ""
    echo "🔗 Snap Store Dashboard: https://snapcraft.io/account/"
else
    echo "❌ Failed to upload snap"
    exit 1
fi
