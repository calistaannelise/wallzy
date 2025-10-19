# Development Workflow Guide

## Quick Start (Daily Development)

### 1. Start Backend Server
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Keep this terminal running. The `--reload` flag auto-restarts when you change Python files.

### 2. Start Metro Bundler (React Native)
```bash
cd frontend
npx react-native start
```
Keep this terminal running. Metro will hot-reload your JavaScript changes.

### 3. Launch App (First Time or After Emulator Restart)
```bash
cd frontend
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
npx react-native run-android
```

## When You DON'T Need to Reinstall

### ✅ JavaScript/React Changes
- Just save your files
- Metro will hot-reload automatically
- Or press `R` twice in the emulator to reload manually

### ✅ Backend Python Changes
- Just save your files
- Uvicorn will auto-restart with `--reload` flag
- No need to touch the app

### ✅ Emulator Minimized/Backgrounded
- Just bring the emulator back to foreground
- App should still be running

## When You NEED to Reinstall

### ❌ Emulator Fully Closed/Crashed
Run this command:
```bash
cd frontend
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
npx react-native run-android
```

### ❌ Native Code Changes (android/ folder)
- Changes to `build.gradle`, `AndroidManifest.xml`, etc.
- Run the reinstall command above

### ❌ New Dependencies Added
```bash
cd frontend
npm install
npx react-native run-android
```

## Quick Reload Commands

### Reload JavaScript Only
In the emulator, press `R` twice quickly, or:
```bash
adb shell input text "RR"
```

### Open Dev Menu
In the emulator, press `M`, or:
```bash
adb shell input keyevent 82
```

### Clear Metro Cache (if things break)
```bash
cd frontend
npx react-native start --reset-cache
```

## Keeping Emulator Alive

### Option 1: Keep Emulator Running
- Don't close the emulator window
- Just minimize it when not in use
- The app stays installed and running

### Option 2: Create Emulator Snapshot
1. Open Android Studio → Device Manager
2. Click the dropdown on your emulator
3. Select "Cold Boot Now" to save current state
4. Next time, it will restore with your app installed

## Troubleshooting

### "Metro bundler not running"
```bash
cd frontend
npx react-native start
```

### "Backend not responding"
```bash
cd backend
lsof -i :8000  # Check if running
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### "Java version error"
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version  # Should show 17.x
```

### "Build failed"
```bash
cd frontend
rm -rf android/.gradle android/app/build
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
npx react-native run-android
```

## Recommended Setup

### Terminal Layout (3 terminals)
1. **Terminal 1**: Backend server (always running)
   ```bash
   cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Terminal 2**: Metro bundler (always running)
   ```bash
   cd frontend && npx react-native start
   ```

3. **Terminal 3**: Commands (as needed)
   - Git commands
   - Database queries
   - One-off tasks

### Add to ~/.zshrc (Optional)
```bash
# React Native Development
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Aliases for quick commands
alias rn-start="cd ~/Desktop/dubhacksv3/frontend && npx react-native start"
alias rn-android="cd ~/Desktop/dubhacksv3/frontend && npx react-native run-android"
alias backend-start="cd ~/Desktop/dubhacksv3/backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
```

Then reload: `source ~/.zshrc`

## Summary

**For normal development:**
1. Keep backend server running
2. Keep Metro bundler running
3. Keep emulator open (just minimize it)
4. Edit code and save - changes reload automatically!

**Only reinstall when:**
- Emulator fully crashes/closes
- Native Android code changes
- New npm packages added
