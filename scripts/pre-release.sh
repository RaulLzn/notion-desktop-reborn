#!/bin/bash

# Pre-release preparation script
# This script helps prepare for a new release by:
# 1. Checking the environment
# 2. Running tests/builds
# 3. Updating changelog template
# 4. Validating package.json

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Preparing for release..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the project root?"
    exit 1
fi

# Check Node.js and npm
print_status "Checking Node.js and npm..."
node --version
npm --version

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Check git status
print_status "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Working directory has uncommitted changes:"
    git status --short
    echo ""
fi

# Current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Check if electron-builder is available
if ! npm list electron-builder --depth=0 &> /dev/null; then
    print_warning "electron-builder not found as dependency. Installing globally..."
    npm install -g electron-builder
fi

# Test build
print_status "Testing build process..."
if npm run build > /dev/null 2>&1; then
    print_success "Test build successful!"
else
    print_error "Test build failed! Please fix build issues before releasing."
    exit 1
fi

# Check changelog
if [ ! -f "CHANGELOG.md" ]; then
    print_warning "CHANGELOG.md not found. Creating template..."
    cat > CHANGELOG.md << 'EOF'
# Changelog - Notion Desktop Reborn

## [Unreleased]
### Added
- New features go here

### Changed
- Changes go here

### Fixed
- Bug fixes go here

---

## [Previous versions]
Previous version information...
EOF
    print_status "Please update CHANGELOG.md with your changes"
fi

# Check required files
REQUIRED_FILES=("README.md" "main.js" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files present!"

# Check build icons
if [ ! -f "build/icons/icon.png" ]; then
    print_warning "Icon file not found at build/icons/icon.png"
    print_status "This may cause build issues for some package formats"
fi

# Summary
echo ""
print_success "✅ Pre-release checks completed!"
echo ""
print_status "Next steps:"
echo "1. Update CHANGELOG.md with your changes"
echo "2. Run './scripts/release.sh [version]' to create a release"
echo "   Or run './scripts/manual-release.sh' if you prefer manual release"
echo "3. Make sure you have a GitHub repository set up as origin"
echo ""
print_status "Current git remote:"
git remote -v || print_warning "No git remote configured"
