# 🔧 Android Build Fix Guide

## Problem

You're getting this error when building Android:
```
Unsupported class file major version 65
```

This means **Java 21 is too new** for React Native 0.72.6 and Gradle 7.5.1.

## Solution: Install Java 17 (LTS)

React Native 0.72 requires **Java 17** (not Java 21).

### Option 1: Install Java 17 with Homebrew (Recommended)

```bash
# Install Java 17
brew install openjdk@17

# Link it
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Add to your shell profile (~/.zshrc or ~/.bash_profile)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Reload your shell
source ~/.zshrc  # or source ~/.bash_profile
```

### Option 2: Use jEnv to Manage Multiple Java Versions

```bash
# Install jEnv
brew install jenv

# Add to your shell profile (~/.zshrc)
export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"

# Reload shell
source ~/.zshrc

# Add Java 17
jenv add /Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home

# Set Java 17 as global default
jenv global 17

# Set Java 17 for this project only
cd /Users/calistavidianto/Desktop/dubhacksv3/frontend
jenv local 17
```

### Verify Java Version

```bash
java -version
```

Should show:
```
openjdk version "17.0.x"
```

## After Installing Java 17

1. **Clean Gradle cache:**
   ```bash
   cd /Users/calistavidianto/Desktop/dubhacksv3/frontend
   rm -rf android/.gradle
   rm -rf ~/.gradle/caches
   ```

2. **Clean and rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Run the app:**
   ```bash
   npm run android
   ```

## Alternative: Quick Fix Without Changing Java

If you can't install Java 17 right now, you can temporarily use the iOS simulator instead (Mac only):

```bash
cd frontend
npm run ios
```

But for Android, **Java 17 is required**.

## Compatibility Matrix

| Component | Version | Java Support |
|-----------|---------|--------------|
| React Native 0.72.6 | Current | Java 11-17 |
| Gradle 7.5.1 | Current | Java 8-19 |
| Java 21 | Your system | ❌ Too new |
| **Java 17 (LTS)** | **Recommended** | ✅ Perfect |

## Troubleshooting

### After installing Java 17, still getting errors?

```bash
# 1. Verify Java version
java -version
javac -version
echo $JAVA_HOME

# 2. Clean everything
cd /Users/calistavidianto/Desktop/dubhacksv3/frontend
rm -rf node_modules
rm -rf android/.gradle
rm -rf ~/.gradle/caches
npm install

# 3. Try again
npm run android
```

### "ANDROID_HOME not set" error?

```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload
source ~/.zshrc
```

### "No emulators found" error?

1. Open Android Studio
2. Go to Tools → Device Manager
3. Create a new Virtual Device (e.g., Pixel 5, API 33)
4. Start the emulator
5. Then run `npm run android`

## Summary

**The fix:** Install Java 17 (LTS) instead of Java 21.

```bash
# Quick commands
brew install openjdk@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
cd /Users/calistavidianto/Desktop/dubhacksv3/frontend
rm -rf android/.gradle ~/.gradle/caches
npm run android
```

---

**Need more help?** Check `SETUP_CHECKLIST.md` or `QUICK_REFERENCE.md`
