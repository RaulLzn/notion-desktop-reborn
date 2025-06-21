#!/bin/bash

# Notion Snap Reborn - Start Script
# This script starts the Notion desktop app with proper GTK configuration

echo "🚀 Starting Notion Snap Reborn..."

# Set environment variables for better compatibility
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
export GDK_BACKEND=x11

# Start the application
npm start
