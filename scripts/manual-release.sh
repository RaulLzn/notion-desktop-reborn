#!/bin/bash

# Manual release script for when you don't have GitHub Actions set up yet
# This creates a GitHub release manually using the GitHub CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed!"
    print_status "Install it with: sudo apt install gh"
    print_status "Or visit: https://cli.github.com/"
    exit 1
fi

# Check if we're authenticated with GitHub
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub!"
    print_status "Run: gh auth login"
    exit 1
fi

# Get version
VERSION=$(node -p "require('./package.json').version")
TAG_NAME="v$VERSION"

print_status "Creating release for version $VERSION"

# Extract changelog for this version
print_status "Extracting changelog for version $VERSION"
CHANGELOG_FILE="current_changelog.md"

# Extract the section for this version from CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    sed -n "/## \[$VERSION\]/,/## \[/p" CHANGELOG.md | sed '$d' > "$CHANGELOG_FILE"
    
    # If the changelog is empty, create a default one
    if [ ! -s "$CHANGELOG_FILE" ]; then
        echo "## Release $VERSION" > "$CHANGELOG_FILE"
        echo "" >> "$CHANGELOG_FILE"
        echo "New release of Notion Desktop Reborn with enhanced features and improvements." >> "$CHANGELOG_FILE"
    fi
else
    echo "## Release $VERSION" > "$CHANGELOG_FILE"
    echo "" >> "$CHANGELOG_FILE"
    echo "New release of Notion Desktop Reborn." >> "$CHANGELOG_FILE"
fi

# Create the release
print_status "Creating GitHub release..."
gh release create "$TAG_NAME" \
    --title "Notion Desktop Reborn $VERSION" \
    --notes-file "$CHANGELOG_FILE"

# Upload assets
DIST_DIR="./dist"
if [ -d "$DIST_DIR" ]; then
    print_status "Uploading release assets..."
    
    # Find and upload each package type
    for file in "$DIST_DIR"/*.{AppImage,snap,deb,rpm}; do
        if [ -f "$file" ]; then
            print_status "Uploading $(basename "$file")..."
            gh release upload "$TAG_NAME" "$file"
        fi
    done
    
    print_success "All assets uploaded!"
else
    print_error "Dist directory not found! Run 'npm run build-all' first."
fi

# Clean up
rm -f "$CHANGELOG_FILE"

print_success "Release $VERSION created successfully! 🚀"
print_status "Visit: $(gh repo view --web)/releases to see your release"
