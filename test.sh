#!/bin/bash

echo "🧪 Testing Notion Desktop v2.0"
echo "=============================="

# Check if AppImage exists
if [ -f "dist/Notion Desktop-2.0.0.AppImage" ]; then
    echo "✅ AppImage found: Notion Desktop-2.0.0.AppImage"
    echo "📏 Size: $(du -h "dist/Notion Desktop-2.0.0.AppImage" | cut -f1)"
    echo ""
    
    # Make executable if not already
    chmod +x "dist/Notion Desktop-2.0.0.AppImage"
    
    echo "🚀 Starting Notion Desktop..."
    echo "Press Ctrl+C to stop testing"
    echo ""
    
    # Run the AppImage
    ./dist/"Notion Desktop-2.0.0.AppImage"
else
    echo "❌ AppImage not found. Please run 'npm run build' first."
    exit 1
fi
