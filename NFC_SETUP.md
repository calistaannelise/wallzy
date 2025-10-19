# NFC Pay Button Setup

## Overview
A Pay button with NFC functionality has been added to the HomeScreen below the "Your Cards" section. The button transmits random payment data to NFC/RFID readers.

## Features
- **NFC Transmission**: Automatically transmits payment data when held near an NFC reader
- **Random Data Generation**: Generates random transaction data (no real payment info)
- **Error Handling**: Comprehensive error handling for NFC issues
- **User Feedback**: Clear alerts and loading states

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. iOS Setup (if building for iOS)
Add NFC capability to your iOS project:
1. Open `ios/FintechAuthApp.xcworkspace` in Xcode
2. Select your project target
3. Go to "Signing & Capabilities"
4. Click "+ Capability" and add "Near Field Communication Tag Reading"

### 3. Android Setup (if building for Android)
Add NFC permission to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

### 4. Rebuild the App
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Usage
1. Open the app and navigate to the Home screen
2. Scroll down to see the "Pay with NFC" button below the cards section
3. Tap the button to start NFC transmission
4. Hold your device near an NFC reader to transmit the data
5. The app will show success/failure messages

## Technical Details
- Uses `react-native-nfc-manager` library
- Transmits NDEF messages with random payment data
- Includes transaction ID, amount, timestamp, merchant ID, and card token
- Handles NFC availability and permission checks
- Provides user-friendly error messages

## Testing
- Test on physical devices with NFC capability
- NFC functionality is not available in simulators/emulators
- Ensure NFC is enabled in device settings
