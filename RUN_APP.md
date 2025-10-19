# Quick Start Guide - Fixed Application

## Prerequisites
- Python 3.x with venv
- Node.js and npm
- React Native development environment (Android Studio or Xcode)

## Step 1: Start the Backend

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies (if needed)
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend should start on `http://localhost:8000`

## Step 2: Start the Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Start Metro bundler
npm start
```

## Step 3: Run on Device/Emulator

### For Android Emulator:
```bash
# In another terminal
cd frontend
npm run android
```

The app is configured to connect to `http://10.0.2.2:8000` for Android emulator.

### For iOS Simulator:
```bash
# In another terminal
cd frontend
npm run ios
```

The app is configured to connect to `http://127.0.0.1:8000` for iOS simulator.

### For Physical Device:
Update the API_URL in the following files to use your computer's LAN IP:
- `frontend/src/screens/SignUpScreen.js` (line 83)
- `frontend/src/screens/LoginScreen.js` (if applicable)

Example: `http://192.168.1.100:8000`

## Testing Signup

1. Open the app
2. Click "Sign Up" 
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: +1 555-123-4567
   - Password: TestPass123 (must have uppercase, lowercase, and number)
   - Confirm Password: TestPass123
4. Click "Create Account"
5. Should see success message and auto-login to home screen

## Troubleshooting

### Backend not responding
- Check if backend is running: `lsof -i:8000`
- Check backend logs for errors
- Ensure database is initialized: `ls backend/smartcard.db`

### Frontend connection errors
- Verify API_URL matches your setup (emulator/simulator/device)
- Check that backend is accessible from your device
- Review console logs in Metro bundler

### JSON Parse Errors (should be fixed now)
- Ensure backend is running and returning JSON
- Check backend logs for Python errors
- Run `python3 backend/test_signup.py` to verify backend

## Quick Test Script

To verify the backend is working:
```bash
cd backend
python3 test_signup.py
```

Should see: ✅ SUCCESS! User created
