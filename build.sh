#!/bin/bash

echo "🚀 Building Notion Desktop for Linux v2.0"
echo "========================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build all Linux packages
echo "🔨 Building all Linux packages..."
echo "This may take a few minutes..."

npm run build-all

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📦 Generated packages:"
    echo "===================="
    ls -la dist/ | grep -E '\.(AppImage|snap|deb|rpm)$'
    echo ""
    echo "🎉 Notion Desktop v2.0 is ready!"
    echo ""
    echo "📋 Installation options:"
    echo "• AppImage: ./dist/Notion-Desktop-2.0.0.AppImage (universal)"
    echo "• Snap: sudo snap install ./dist/notion-desktop_2.0.0_amd64.snap --dangerous"
    echo "• Deb: sudo dpkg -i ./dist/notion-desktop_2.0.0_amd64.deb"
    echo "• RPM: sudo rpm -i ./dist/notion-desktop-2.0.0.x86_64.rpm"
else
    echo "❌ Build failed"
    exit 1
fi
