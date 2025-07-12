#!/bin/bash

# Complete Release Script for Notion Desktop Reborn v2.1.0
# This script handles the entire release process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Starting Complete Release Process for Notion Desktop Reborn v2.1.0"
print_status "=================================================================="

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "main.js" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Working directory is not clean. Uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Aborting release process"
        exit 1
    fi
fi

# Step 1: Build the snap
print_status "📦 Step 1: Building the snap package..."
print_status "This may take several minutes..."

if [ -f "notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap" ]; then
    print_warning "Snap file already exists. Do you want to rebuild?"
    read -p "Rebuild snap? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap"
        snapcraft clean
        snapcraft
    fi
else
    snapcraft
fi

# Check if snap was built successfully
if [ ! -f "notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap" ]; then
    print_error "Snap build failed or snap file not found"
    exit 1
fi

print_success "✅ Snap built successfully: notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap"
print_status "📏 Size: $(du -h "notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap" | cut -f1)"

# Step 2: Test the snap locally (optional)
print_status "🧪 Step 2: Local testing (optional)"
read -p "Do you want to test the snap locally before uploading? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing snap locally for testing..."
    sudo snap install "notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap" --dangerous --devmode
    print_status "Snap installed locally. Please test it and press Enter when ready to continue..."
    read -p "Press Enter to continue with upload..."
    sudo snap remove notion-desktop-reborn
fi

# Step 3: Upload to Snap Store
print_status "📤 Step 3: Uploading to Snap Store..."

# Check if logged in
if ! snapcraft whoami > /dev/null 2>&1; then
    print_status "🔐 Logging in to Snap Store..."
    snapcraft login
fi

print_success "✅ Logged in to Snap Store as: $(snapcraft whoami)"

# Register the snap name if needed
print_status "📝 Ensuring snap name is registered..."
snapcraft register notion-desktop-reborn 2>/dev/null || print_warning "Snap name already registered (this is expected)"

# Upload the snap
print_status "📤 Uploading snap to Snap Store..."
print_status "This may take several minutes depending on your internet connection..."

UPLOAD_OUTPUT=$(snapcraft upload "notion-desktop-reborn_${CURRENT_VERSION}_amd64.snap" 2>&1)
echo "$UPLOAD_OUTPUT"

# Extract revision number from output
REVISION=$(echo "$UPLOAD_OUTPUT" | grep -o "revision [0-9]\+" | grep -o "[0-9]\+")

if [ -z "$REVISION" ]; then
    print_error "Failed to extract revision number from upload output"
    exit 1
fi

print_success "✅ Successfully uploaded to Snap Store! Revision: $REVISION"

# Step 4: Release to channels
print_status "🎯 Step 4: Releasing to channels..."

# Release to edge first
print_status "Releasing to edge channel for initial testing..."
snapcraft release notion-desktop-reborn $REVISION edge

print_success "✅ Released to edge channel"

# Ask about stable release
echo ""
read -p "Do you want to release to stable channel immediately? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Releasing to stable channel..."
    snapcraft release notion-desktop-reborn $REVISION stable
    print_success "✅ Released to stable channel"
else
    print_warning "⚠️  Not released to stable. You can do this later with:"
    print_warning "   snapcraft release notion-desktop-reborn $REVISION stable"
fi

# Step 5: Git tagging and GitHub release
print_status "🏷️  Step 5: Git tagging and release preparation..."

TAG_NAME="v${CURRENT_VERSION}"

# Check if tag already exists
if git tag -l | grep -q "^${TAG_NAME}$"; then
    print_warning "Tag $TAG_NAME already exists"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -d $TAG_NAME
        git push origin :refs/tags/$TAG_NAME 2>/dev/null || true
    else
        print_status "Skipping git tagging"
        TAG_NAME=""
    fi
fi

if [ -n "$TAG_NAME" ]; then
    # Create git tag
    print_status "Creating git tag: $TAG_NAME"
    git tag -a $TAG_NAME -m "Release $TAG_NAME

🚀 Enhanced Tab Management & Performance Improvements

✨ New Features:
- Improved tab creation debouncing
- Enhanced IPC handler registration
- Global action counters for debugging
- Better window open handling

🔧 Fixes:
- Fixed multiple rapid tab creation issue
- Improved tab switching reliability
- Better error handling and recovery

📦 Snap Store: https://snapcraft.io/notion-desktop-reborn"

    # Push tag
    print_status "Pushing tag to remote repository..."
    git push origin $TAG_NAME

    print_success "✅ Git tag created and pushed"
fi

# Step 6: Summary and next steps
print_success "🎉 Release Process Complete!"
print_success "=============================="
echo ""
print_status "📋 Summary:"
print_status "• Version: $CURRENT_VERSION"
print_status "• Snap revision: $REVISION"
print_status "• Channels: edge $(if [[ $REPLY =~ ^[Yy]$ ]]; then echo "and stable"; fi)"
if [ -n "$TAG_NAME" ]; then
    print_status "• Git tag: $TAG_NAME"
fi
echo ""
print_status "🔗 Important Links:"
print_status "• Snap Store: https://snapcraft.io/notion-desktop-reborn"
print_status "• Dashboard: https://snapcraft.io/account/"
print_status "• Install command: snap install notion-desktop-reborn"
echo ""
print_status "📝 Next Steps:"
print_status "1. Check the app in Snap Store"
print_status "2. Test installation on different systems"
print_status "3. Update documentation if needed"
print_status "4. Announce the release"
echo ""
print_success "🚀 Notion Desktop Reborn v$CURRENT_VERSION is now available!"
