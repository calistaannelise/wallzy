#!/bin/bash

# Quick App Reinstall Script
# Use this when emulator crashes or you need to reinstall

echo "📱 Reinstalling App on Emulator..."
echo ""

# Set Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo "✅ Java 17 configured"

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the dubhacksv3 directory"
    exit 1
fi

# Check if emulator is running
if ! adb devices | grep -q "emulator"; then
    echo "⚠️  No emulator detected. Starting emulator..."
    echo "   (This may take a minute...)"
fi

cd frontend

echo ""
echo "🔨 Building and installing app..."
npx react-native run-android

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ App installed successfully!"
    echo ""
    echo "💡 The app should launch automatically"
    echo "   If not, find 'FintechAuthApp' in the emulator app drawer"
else
    echo ""
    echo "❌ Installation failed!"
    echo ""
    echo "🔧 Try these fixes:"
    echo "   1. Clean build: rm -rf android/.gradle android/app/build"
    echo "   2. Check Java version: java -version (should be 17.x)"
    echo "   3. Check emulator: adb devices"
    echo "   4. Restart Metro: npx react-native start --reset-cache"
fi
