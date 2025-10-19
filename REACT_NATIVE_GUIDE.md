# 📱 React Native Mobile App Guide

## Overview

SmartCard uses **React Native** for the mobile frontend, which means you need an iOS Simulator or Android Emulator to run the app (not a web browser).

## Prerequisites

### Required for All Platforms
- ✅ Node.js 16+ installed
- ✅ npm installed
- ✅ Backend server running on `http://localhost:8000`

### For iOS Development (Mac only)
- ✅ Xcode installed (from Mac App Store)
- ✅ Xcode Command Line Tools: `xcode-select --install`
- ✅ CocoaPods installed: `sudo gem install cocoapods`
- ✅ iOS Simulator (comes with Xcode)

### For Android Development
- ✅ Android Studio installed
- ✅ Android SDK installed
- ✅ Android Emulator configured
- ✅ `ANDROID_HOME` environment variable set

## Quick Start (3 Terminals)

### Terminal 1: Backend Server
```bash
cd backend
python3 main.py
```
**Expected:** Server running on `http://localhost:8000`

### Terminal 2: Metro Bundler
```bash
cd frontend
npm start
```
**Expected:** Metro bundler running on `http://localhost:8081`

### Terminal 3: Launch App

**For iOS (Mac only):**
```bash
cd frontend
npm run ios
```

**For Android:**
```bash
cd frontend
npm run android
```

**Expected:** App launches in your emulator

## First Time Setup

### iOS Setup (Mac only)
```bash
cd frontend

# Install npm dependencies
npm install

# Install iOS native dependencies
cd ios
pod install
cd ..

# Run the app
npm run ios
```

### Android Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Make sure Android emulator is running first!
# Then run the app
npm run android
```

## Common Commands

### Start Metro Bundler
```bash
cd frontend
npm start
```

### Run on iOS
```bash
cd frontend
npm run ios

# Or specify a device
npm run ios -- --simulator="iPhone 15 Pro"
```

### Run on Android
```bash
cd frontend
npm run android

# Or specify a device
npm run android -- --deviceId=emulator-5554
```

### Clear Cache
```bash
cd frontend
npx react-native start --reset-cache
```

### Rebuild iOS
```bash
cd frontend/ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Rebuild Android
```bash
cd frontend/android
./gradlew clean
cd ..
npm run android
```

## Troubleshooting

### Issue: "Command not found: react-native"
**Solution:**
```bash
cd frontend
npm install
```

### Issue: iOS build fails with CocoaPods error
**Solution:**
```bash
cd frontend/ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: Android build fails
**Solution:**
```bash
# Make sure ANDROID_HOME is set
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean and rebuild
cd frontend/android
./gradlew clean
cd ..
npm run android
```

### Issue: Metro bundler port 8081 already in use
**Solution:**
```bash
lsof -ti:8081 | xargs kill -9
cd frontend
npm start
```

### Issue: Cannot connect to backend from app
**Solution:**
- **iOS Simulator:** Use `http://localhost:8000`
- **Android Emulator:** Use `http://10.0.2.2:8000`
- Make sure backend is running first
- Check firewall settings

### Issue: App crashes on launch
**Solution:**
1. Check Metro bundler console for errors
2. Clear cache: `npx react-native start --reset-cache`
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
4. For iOS: `cd ios && pod install && cd ..`

### Issue: "Unable to resolve module"
**Solution:**
```bash
cd frontend
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

## Development Tips

### Hot Reload
- Press `r` in Metro bundler to reload
- Press `d` to open developer menu
- Shake device/emulator to open developer menu

### Debug Menu
- **iOS Simulator:** Press `Cmd + D`
- **Android Emulator:** Press `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)

### View Logs
```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

### Inspect Element
1. Open debug menu
2. Select "Show Inspector"
3. Tap on any element to inspect

## API Configuration

The app connects to the backend at `http://localhost:8000`. If you need to change this:

1. Find the API configuration file (usually in `src/config` or similar)
2. Update the base URL
3. For Android emulator, use `http://10.0.2.2:8000` instead of `localhost`

## Testing the Backend Connection

Once the app is running, you can test if it's connecting to the backend:

```bash
# In a separate terminal
cd backend
python3 test_api.py
```

This will verify:
- ✅ Backend is running
- ✅ Database is seeded
- ✅ API endpoints are working
- ✅ Card recommendations work

## Next Steps

1. **Explore the App:** Navigate through the authentication screens
2. **Test Features:** Try card recommendations and view your card portfolio
3. **Check API Docs:** Visit `http://localhost:8000/docs`
4. **Customize:** Add your own cards and reward rules via the API

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [iOS Setup Guide](https://reactnative.dev/docs/environment-setup?platform=ios)
- [Android Setup Guide](https://reactnative.dev/docs/environment-setup?platform=android)
- [Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)

---

**Need help?** Check `SETUP_CHECKLIST.md` or `README.md` for more information.
