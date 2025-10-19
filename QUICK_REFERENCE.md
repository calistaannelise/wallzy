# 🚀 SmartCard - Quick Reference Card

## 🎯 Super Quick Commands

### When Emulator Crashes - Reinstall App
```bash
cd ~/Desktop/dubhacksv3
./reinstall-app.sh
```

### Start All Servers (Backend + Metro)
```bash
cd ~/Desktop/dubhacksv3
./start-dev.sh
```

## 🚀 Daily Workflow

## 3-Terminal Setup

### Terminal 1: Backend Server
```bash
cd ~/Desktop/dubhacksv3/backend
python3 main.py
```
**Status:** Running on http://localhost:8000

### Terminal 2: Metro Bundler
```bash
cd /Users/calistavidianto/Desktop/dubhacksv3/frontend
npm start
```
**Status:** Running on http://localhost:8081

### Terminal 3: Launch Android App
```bash
cd /Users/calistavidianto/Desktop/dubhacksv3/frontend
npm run android
```
**Status:** App running in Android emulator

---

## Quick Commands

### Test Backend API
```bash
cd backend && python3 test_api.py
```

### Restart Metro Bundler
```bash
cd frontend && npx react-native start --reset-cache
```

### Rebuild Android
```bash
cd frontend/android && ./gradlew clean && cd .. && npm run android
```

### Kill Processes
```bash
# Kill backend (port 8000)
lsof -ti:8000 | xargs kill -9

# Kill Metro bundler (port 8081)
lsof -ti:8081 | xargs kill -9
```

---

## Important URLs

- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Metro Bundler:** http://localhost:8081

---

## Backend Connection

- **Android Emulator:** `http://10.0.2.2:8000` ✅
- **Real Android Device:** `http://YOUR_IP:8000` (e.g., 192.168.1.100)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `python: command not found` | Use `python3` instead |
| Backend won't start | Run `python3 seed_data.py` first |
| Metro bundler error | `lsof -ti:8081 \| xargs kill -9` then restart |
| Android build fails | `cd android && ./gradlew clean && cd ..` |
| Can't connect to backend | Use `http://10.0.2.2:8000` (NOT localhost) |
| Java/Gradle version error | Update `android/gradle/wrapper/gradle-wrapper.properties` to Gradle 8.5+ |

---

## File Locations

```
dubhacksv3/
├── backend/
│   ├── main.py              # Start backend server
│   ├── test_api.py          # Test API endpoints
│   └── seed_data.py         # Seed database
├── frontend/
│   ├── App.tsx              # Main React Native app
│   └── android/             # Android native code
├── SETUP_CHECKLIST.md       # Detailed setup guide
├── REACT_NATIVE_GUIDE.md    # React Native specific guide
└── README.md                # Project overview
```

---

## First Time Setup

```bash
# 1. Backend setup
cd backend
pip install -r requirements.txt
python3 seed_data.py

# 2. Frontend setup
cd ../frontend
npm install

# 3. Start everything
# Terminal 1: cd backend && python3 main.py
# Terminal 2: cd frontend && npm start
# Terminal 3: cd frontend && npm run android
```

---

**Need more help?** Check:
- `SETUP_CHECKLIST.md` - Step-by-step setup
- `REACT_NATIVE_GUIDE.md` - Mobile development guide
- `README.md` - Full documentation
