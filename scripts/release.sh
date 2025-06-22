#!/bin/bash

# Release script for Notion Desktop Reborn
# This script automates the release process

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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "This is not a git repository!"
    exit 1
fi

# Check if we have a remote repository
if ! git remote get-url origin > /dev/null 2>&1; then
    print_error "No remote origin found! Please add a GitHub repository as origin."
    echo "Example: git remote add origin https://github.com/yourusername/notion-snap-reborn.git"
    exit 1
fi

# Get the current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Ask for new version if not provided
if [ -z "$1" ]; then
    echo -n "Enter new version (current: $CURRENT_VERSION): "
    read NEW_VERSION
else
    NEW_VERSION=$1
fi

if [ -z "$NEW_VERSION" ]; then
    print_error "Version is required!"
    exit 1
fi

print_status "Preparing release for version $NEW_VERSION"

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Working directory is not clean. Uncommitted changes:"
    git status --short
    echo -n "Continue anyway? (y/N): "
    read CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        print_error "Aborted by user"
        exit 1
    fi
fi

# Update version in package.json
print_status "Updating package.json version to $NEW_VERSION"
npm version $NEW_VERSION --no-git-tag-version

# Update version in README if it exists
if [ -f "README.md" ]; then
    print_status "Updating README.md version references"
    sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+/v$NEW_VERSION/g" README.md
fi

# Build all packages
print_status "Building all packages..."
npm run build-all

# Check if builds were successful
DIST_DIR="./dist"
if [ ! -d "$DIST_DIR" ]; then
    print_error "Build failed! Dist directory not found."
    exit 1
fi

print_success "All packages built successfully!"

# List built files
print_status "Built files:"
ls -la "$DIST_DIR"/*.{AppImage,snap,deb,rpm} 2>/dev/null || print_warning "Some package formats might not have been built"

# Commit changes
print_status "Committing version bump"
git add package.json
if [ -f "README.md" ]; then
    git add README.md
fi
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
TAG_NAME="v$NEW_VERSION"
print_status "Creating and pushing tag $TAG_NAME"
git tag -a "$TAG_NAME" -m "Release $NEW_VERSION"
git push origin main
git push origin "$TAG_NAME"

print_success "Release $NEW_VERSION has been tagged and pushed!"
print_status "GitHub Actions will automatically create the release and upload packages."
print_status "Check the Actions tab in your GitHub repository for progress."

# Open GitHub releases page if possible
REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
if command -v xdg-open > /dev/null; then
    print_status "Opening GitHub releases page..."
    xdg-open "$REPO_URL/releases"
elif command -v open > /dev/null; then
    print_status "Opening GitHub releases page..."
    open "$REPO_URL/releases"
else
    print_status "Visit: $REPO_URL/releases to see your release"
fi

print_success "Release process completed! 🚀"
