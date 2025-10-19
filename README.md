# 💳 Wallzy - Smart Credit Card Optimizer

An intelligent credit card recommendation system that automatically suggests the best card for each purchase based on merchant categories and reward multipliers. Built with NFC/RFID tap functionality for seamless real-world usage.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Troubleshooting](#-troubleshooting)
- [Credits](#credits)

## ✨ Features

- 🎯 **Smart Card Recommendations** - Automatically recommends the best card based on merchant category
- 💰 **Real-time Cashback Calculation** - Shows exact cashback earned on each transaction
- 📱 **NFC/RFID Integration** - Tap your card to get instant recommendations
- 🏪 **Merchant Recognition** - Identifies merchants and categorizes transactions
- 📊 **Transaction History** - Track all purchases with detailed cashback information
- 🔐 **Secure Authentication** - User signup/login with encrypted passwords
- 🎨 **Modern UI** - Beautiful React Native interface with real-time updates

## 🛠 Tech Stack
- **Firmware**: FreeRTOS
- **Backend**: FastAPI (Python 3.13)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: React Native (Android)
- **Hardware**: ESP32 with RFID-RC522 module
- **Authentication**: bcrypt password hashing
- **API**: RESTful with automatic OpenAPI documentation

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Android Studio with Android Emulator OR physical Android device
- Java 17 (for Android builds)

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/calistaannelise/dubhacks.git
cd dubhacksv5

# Run the startup script
./start.sh
```

This will:
1. Set up Python virtual environment
2. Install all dependencies
3. Seed the database with sample data
4. Start the backend server
5. Start Metro bundler

Then in a **new terminal**:
```bash
cd frontend
npm run android
```

### Option 2: Manual Setup

**1. Backend Setup**
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed database
python3 seed_data.py

# Start server
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**2. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start Metro bundler
npx react-native start
```

**3. Run on Android**
```bash
# In a new terminal
cd frontend
npx react-native run-android
```

### 📱 Running on Physical Device

If using a physical Android device, update the IP address in:
- `frontend/src/config/api.js` (line 11)
- `frontend/src/screens/LoginScreen.js` (line 56)
- `frontend/src/screens/SignUpScreen.js` (line 84)

Replace `COMPUTER_IP` with your computer's local IP address (find it with `ifconfig` on Mac/Linux or `ipconfig` on Windows).

**Important**: Your phone and computer must be on the same Wi-Fi network!

## 📖 Usage

### 1. Sign Up / Login
- Create an account with email and password
- Login to access your dashboard

### 2. Add Credit Cards
- Tap "Your Cards" to view your card portfolio
- Add new cards with issuer, name, and last 4 digits
- System automatically loads reward rules

### 3. Make Purchases
- Tap "Pay with NFC" button
- Hold your phone near the RFID reader
- System recommends the best card for the merchant
- Transaction is automatically recorded

### 4. View Transaction History
- See all recent transactions on the home screen
- View merchant name, amount spent, and cashback earned
- Compare rewards across different cards

## 💳 Sample Credit Cards

The seed script creates a demo user with these cards:

| Card | Best For | Cashback |
|------|----------|----------|
| **Blue Cash Preferred** (Amex) | Groceries | 6% |
| **Customized Cash Rewards** (BofA) | Dining | 3% |
| **Prime Visa** (Chase) | Online Shopping | 5% |
| **Blue Cash Everyday** (Amex) | Gas | 3% |

## 🔌 API Endpoints

Full API documentation available at `http://localhost:8000/docs`

### Key Endpoints

- **Authentication**
  - `POST /users` - Sign up
  - `POST /login` - Login

- **Cards**
  - `GET /users/{user_id}/cards` - Get user's cards
  - `POST /users/{user_id}/cards` - Add a card
  - `POST /cards/{card_id}/rules` - Add reward rules

- **Recommendations**
  - `POST /recommend` - Get best card (reads from hello.json)

- **Transactions**
  - `GET /transactions/{user_id}` - Get transaction history
  - `GET /analytics/{user_id}` - Get spending analytics

## MCC Codes Reference

Common merchant category codes:

- **5812** - Dining/Restaurants
- **5411** - Grocery Stores
- **5541** - Gas Stations
- **5309** - Online Shopping
- **5912** - Drug Stores
- **7832** - Movie Theaters
- **4111** - Transit
- **4899** - Streaming Services

## 📁 Project Structure

```
dubhacksv5/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLAlchemy models
│   ├── mcc_data.py          # MCC category mappings
│   ├── seed_data.py         # Database seeding
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── screens/         # App screens (Home, Login, SignUp, AddCard)
│   │   ├── components/      # Reusable components (Button, Input, PayButton)
│   │   ├── services/        # API service layer
│   │   └── theme/           # Colors, typography, spacing
│   ├── android/             # Android native code
│   └── package.json         # Node dependencies
├── firmware/
│   ├── ble.py              # ESP32 BLE/RFID integration
│   └── hello.json          # Current tap data
└── start.sh                # Automated startup script
```

## 🎯 How It Works

1. **Card Tap**: User taps RFID card on ESP32 reader
2. **Data Transfer**: ESP32 sends MCC code via BLE to `hello.json`
3. **Recommendation**: Backend reads JSON, calculates best card based on rewards
4. **Transaction**: System records transaction with merchant name and cashback
5. **Display**: Frontend shows transaction history with detailed rewards info

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 8000 and 8081
lsof -ti:8000 | xargs kill -9
lsof -ti:8081 | xargs kill -9
```

### Network Request Failed (Physical Device)
- Update IP address in `frontend/src/config/api.js`
- Ensure phone and computer are on same Wi-Fi
- Check firewall isn't blocking port 8000

### App Won't Build
```bash
cd frontend/android
./gradlew clean
cd ../..
npx react-native run-android
```

### Database Issues
```bash
cd backend
rm smartcard.db  # Delete old database
python3 seed_data.py  # Recreate with fresh data
```

## Credits

Built for **DubHacks 2024** - Based on the SmartCard PRD

**Team Members:**
- George Evans
- Calista Vidianto
- Patrick Widjaya

**Special Thanks:**
- DubHacks organizers and mentors
- React Native community
- FastAPI community

---

Made with ❤️ at DubHacks 2024
