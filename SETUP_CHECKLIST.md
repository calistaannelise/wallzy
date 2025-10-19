# ✅ SmartCard MVP - Setup Checklist

## Pre-Flight Check

Before starting, verify you have:

- [ ] **Python 3.8+** installed
  ```bash
  python3 --version
  ```

- [ ] **Node.js 16+** installed
  ```bash
  node --version
  ```

- [ ] **npm** installed
  ```bash
  npm --version
  ```

- [ ] **Android Studio** with Android Emulator installed
  - Android SDK installed
  - At least one Android Virtual Device (AVD) configured

## Installation Steps

### Step 1: Backend Setup ⚙️

```bash
cd backend
```

- [ ] Install Python dependencies
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Seed the database
  ```bash
  python seed_data.py
  ```
  
  **Expected output:**
  ```
  Creating sample user...
  Created user: Demo User (ID: 1)
  
  Creating categories...
  Creating sample cards...
  ✅ Database seeded successfully!
  ```

- [ ] Test the API
  ```bash
  python test_api.py
  ```
  
  **Expected output:**
  ```
  🧪 Testing SmartCard API...
  1️⃣ Testing server connection...
     ✅ Server is running!
  ...
  ✅ All tests completed!
  ```

### Step 2: Frontend Setup 🎨 (React Native Mobile App)

```bash
cd ../frontend
```

- [ ] Install Node dependencies
  ```bash
  npm install
  ```
  
  **Expected:** No errors, packages installed

- [ ] Verify Android setup
  ```bash
  # Check if Android SDK is accessible
  echo $ANDROID_HOME
  # Should show path like: /Users/YOUR_USERNAME/Library/Android/sdk
  ```

### Step 3: Start the Application 🚀

**You need 3 terminals for React Native:**

**Terminal 1 - Backend:**
```bash
cd backend
python3 main.py
```

**Terminal 2 - Metro Bundler:**
```bash
cd frontend
npm start
```

**Terminal 3 - Run App on Android Emulator:**

```bash
cd frontend
npm run android
```

**Note:** Make sure your Android Emulator is running before executing this command. You can start it from Android Studio or use `emulator -avd YOUR_AVD_NAME`

## Verification Checklist

### Backend Verification ✅

- [ ] Backend running on http://localhost:8000
- [ ] Visit http://localhost:8000 - Should see API info
- [ ] Visit http://localhost:8000/docs - Should see Swagger UI
- [ ] API returns user list at http://localhost:8000/users

### Frontend Verification ✅

- [ ] Metro bundler running on http://localhost:8081
- [ ] App opens in Android Emulator
- [ ] See authentication/login screen
- [ ] App connects to backend at http://10.0.2.2:8000 (Android emulator special address)
- [ ] No errors in Metro bundler console

### Feature Testing ✅

#### Test 1: Android App Launch
- [ ] App launches successfully in Android emulator
- [ ] Authentication screen displays correctly
- [ ] Can navigate through app screens
- [ ] Backend API calls work from mobile app (using http://10.0.2.2:8000)

#### Test 2: Backend API (Use test_api.py)
- [ ] Run `python3 test_api.py` in backend directory
- [ ] All 6 tests pass:
  - [ ] Server connection
  - [ ] User list retrieval
  - [ ] Card retrieval (4 cards)
  - [ ] MCC lookup
  - [ ] Card recommendations
  - [ ] User summary

### API Testing ✅

Run the test script:
```bash
cd backend
python test_api.py
```

Expected tests to pass:
- [ ] Server connection
- [ ] User list retrieval
- [ ] Card retrieval
- [ ] MCC lookup (5812 → dining)
- [ ] Dining recommendation
- [ ] Groceries recommendation
- [ ] Gas recommendation
- [ ] User summary

## Common Issues & Solutions

### Issue: Port 8000 already in use
**Solution:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

### Issue: Port 8081 already in use (Metro bundler)
**Solution:**
```bash
# Kill the Metro bundler process
lsof -ti:8081 | xargs kill -9
# Then restart
npm start
```

### Issue: Android build fails
**Solution:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: Module not found (Python)
**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: Module not found (Node)
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database not found
**Solution:**
```bash
cd backend
python seed_data.py
```

### Issue: Cannot connect to backend from Android emulator
**Solution:**
- Android Emulator must use `http://10.0.2.2:8000` (NOT localhost)
- Make sure backend is running first on port 8000
- Check backend console for errors
- Verify firewall isn't blocking the connection

### Issue: Metro bundler won't start
**Solution:**
```bash
cd frontend
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

## File Structure Verification

Your project should look like this:

```
DUBHACKS/
├── ✅ README.md
├── ✅ QUICKSTART.md
├── ✅ PROJECT_SUMMARY.md
├── ✅ ARCHITECTURE.md
├── ✅ SETUP_CHECKLIST.md
├── ✅ start.sh
├── ✅ SmartCard_PRD_v3.md
├── backend/
│   ├── ✅ main.py
│   ├── ✅ database.py
│   ├── ✅ mcc_data.py
│   ├── ✅ scraper.py
│   ├── ✅ seed_data.py
│   ├── ✅ test_api.py
│   └── ✅ requirements.txt
└── frontend/
    ├── ✅ package.json
    ├── ✅ App.tsx
    ├── ✅ index.js
    ├── android/          # Android native code
    └── src/
        ├── ✅ navigation/
        ├── ✅ screens/
        ├── ✅ components/
        └── ✅ theme/
```

## Quick Test Commands

### Test Backend Only
```bash
cd backend
python3 main.py &
sleep 2
curl http://localhost:8000
curl http://localhost:8000/users
curl http://localhost:8000/categories
```

### Test Recommendation
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"mcc_code":"5812","amount_cents":5000}'
```

### Test Scraper
```bash
curl -X POST http://localhost:8000/scraper/run
curl http://localhost:8000/scraper/results
```

## Success Criteria ✅

You're ready to demo when:

- [ ] Backend starts without errors on http://localhost:8000
- [ ] Metro bundler runs without errors on http://localhost:8081
- [ ] Android app launches in Android Emulator
- [ ] App can communicate with backend API at http://10.0.2.2:8000
- [ ] API test script passes all tests (`python3 test_api.py`)
- [ ] No errors in Metro bundler console
- [ ] Swagger docs accessible at http://localhost:8000/docs

## Next Steps

Once everything is working:

1. **Explore the API Docs**: http://localhost:8000/docs
2. **Test on Real Android Device**: Connect your phone via USB, enable USB debugging, and run `npm run android`
3. **Review the Code**: Check out the React Native implementation
4. **Customize**: Add your own credit cards and rules to the backend
5. **Extend**: Add more mobile screens and features

## Support

If you encounter issues:

1. Check this checklist
2. Review the README.md
3. Check console logs (backend and browser)
4. Verify all dependencies are installed
5. Try restarting both servers

## Demo Script

For presenting the project:

1. **Introduction** (30 seconds)
   - "SmartCard is an Android mobile app that automatically recommends the best credit card for each purchase"

2. **Show Mobile App** (1 minute)
   - Launch app in Android Emulator
   - Navigate through authentication screens
   - Show mobile UI and user experience

3. **Show Backend API** (1 minute)
   - Open http://localhost:8000/docs
   - Show interactive API documentation
   - Demonstrate card recommendation endpoint

4. **Run API Tests** (1 minute)
   - Run `python3 test_api.py`
   - Show all 6 tests passing
   - Explain card recommendation logic

5. **Explain Architecture** (1 minute)
   - FastAPI backend with SQLite
   - React Native Android mobile frontend
   - Dynamic reward rules with date validation
   - Real-time card recommendations

Total: ~4 minutes

---

**Ready to start?** 
1. Terminal 1: `cd backend && python3 main.py`
2. Terminal 2: `cd frontend && npm start`
3. Terminal 3: `cd frontend && npm run android`

**Need help?** Check: `README.md` or `QUICKSTART.md`
