# 🔌 API Integration Guide

## Overview

The frontend React Native app is now connected to the FastAPI backend. All API calls use the Android emulator address `http://10.0.2.2:8000`.

## Architecture

```
Frontend (React Native)
    ↓
src/services/apiService.js (API calls)
    ↓
src/config/api.js (Configuration)
    ↓
Backend (FastAPI) at http://10.0.2.2:8000
    ↓
SQLite Database
```

## Files Created

### 1. `/frontend/src/config/api.js`
**Purpose:** API configuration and endpoint definitions

**Key Features:**
- Automatically uses `10.0.2.2:8000` for Android emulator
- Uses `localhost:8000` for iOS simulator
- Defines all API endpoints
- Exports `DEFAULT_USER_ID = 1` (from seed data)

### 2. `/frontend/src/services/apiService.js`
**Purpose:** Centralized API service for all backend calls

**Available Methods:**

#### User APIs
- `createUser(email, name)` - Create new user
- `listUsers()` - Get all users

#### Card APIs
- `addCard(userId, cardData)` - Add credit card to user
- `getUserCards(userId)` - Get user's cards

#### Card Rule APIs
- `addCardRule(cardId, ruleData)` - Add reward rule to card
- `getCardRules(cardId)` - Get card's reward rules

#### Recommendation API
- `getRecommendation(userId, mccCode, amountCents)` - Get best card for purchase

#### MCC & Category APIs
- `getMccCategory(mccCode)` - Get category for MCC code
- `listCategories()` - List all categories

#### Transaction APIs
- `createTransaction(transactionData)` - Record transaction
- `getUserTransactions(userId, limit)` - Get user's transactions
- `getCardTransactions(cardId, limit)` - Get card's transactions

#### Analytics APIs
- `getUserAnalytics(userId)` - Get spending analytics
- `getUserSummary(userId)` - Get user summary

#### Scraper APIs
- `runScraper()` - Run Bank of America scraper
- `getScraperResults()` - Get scraped rewards

## Files Updated

### 1. `/frontend/src/screens/AddCardScreen.js`
**Changes:**
- ✅ Imports `apiService` and `DEFAULT_USER_ID`
- ✅ Calls `apiService.addCard()` to save card to backend
- ✅ Extracts card issuer and network from card number
- ✅ Shows error messages from API
- ✅ Refreshes card list after adding

**API Call:**
```javascript
const response = await apiService.addCard(DEFAULT_USER_ID, {
    issuer: issuer,
    card_name: formData.cardName,
    last_four: lastFour,
    network: network,
});
```

### 2. `/frontend/src/screens/HomeScreen.js`
**Changes:**
- ✅ Imports `apiService` and `DEFAULT_USER_ID`
- ✅ Fetches cards from API on mount using `useEffect`
- ✅ Transforms API response to UI format
- ✅ Shows loading spinner while fetching
- ✅ Shows error state with retry button
- ✅ Refreshes cards after adding new card

**API Call:**
```javascript
const cards = await apiService.getUserCards(DEFAULT_USER_ID);
```

## How It Works

### Adding a Card Flow

1. **User fills form** in `AddCardScreen`
2. **Validates input** (card number, CVV, expiry)
3. **Extracts card info:**
   - Issuer (Visa, Mastercard, Amex, etc.)
   - Network type
   - Last 4 digits
4. **Calls API:**
   ```javascript
   POST http://10.0.2.2:8000/users/1/cards
   {
     "issuer": "Visa",
     "card_name": "Visa Classic",
     "last_four": "1234",
     "network": "visa"
   }
   ```
5. **Backend saves to database**
6. **Returns card ID**
7. **Frontend refreshes card list**

### Viewing Cards Flow

1. **HomeScreen mounts**
2. **Calls API:**
   ```javascript
   GET http://10.0.2.2:8000/users/1/cards
   ```
3. **Backend queries database**
4. **Returns array of cards:**
   ```json
   [
     {
       "id": 1,
       "issuer": "Bank of America",
       "card_name": "Customized Cash Rewards",
       "last_four": "1234",
       "network": "visa"
     }
   ]
   ```
5. **Frontend transforms and displays**

## Testing the Integration

### 1. Start Backend
```bash
cd backend
python3 main.py
```

**Expected:** Server running on `http://localhost:8000`

### 2. Test Backend API
```bash
cd backend
python3 test_api.py
```

**Expected:** All 6 tests pass ✅

### 3. Start Frontend
```bash
# Terminal 1: Metro bundler
cd frontend
npm start

# Terminal 2: Android app
cd frontend
npm run android
```

### 4. Test in App

**View Cards:**
1. Open app
2. See "Your Cards" section
3. Should show "4 cards available" (from seed data)
4. Tap to view all cards
5. Should see:
   - Customized Cash Rewards (Bank of America)
   - Freedom Unlimited (Chase)
   - Custom Cash (Citi)
   - Blue Cash Preferred (American Express)

**Add Card:**
1. Tap "Add New Card"
2. Fill in form:
   - Card Name: "Test Card"
   - Card Number: "4111 1111 1111 1111"
   - CVV: "123"
   - Expiry: "12/25"
3. Tap "Add Credit Card"
4. Should see success message
5. Card list should refresh with new card

## API Response Formats

### Get User Cards Response
```json
[
  {
    "id": 1,
    "issuer": "Bank of America",
    "card_name": "Customized Cash Rewards",
    "last_four": "1234",
    "network": "visa",
    "rewards": [
      {
        "id": 1,
        "category": "online_shopping",
        "multiplier": 3.0,
        "cap_cents": null
      }
    ]
  }
]
```

### Add Card Response
```json
{
  "id": 5,
  "issuer": "Visa",
  "card_name": "Test Card"
}
```

## Error Handling

### Connection Errors
```javascript
try {
  const cards = await apiService.getUserCards();
} catch (error) {
  // Shows: "Failed to connect to backend"
  // User can tap to retry
}
```

### API Errors
```javascript
try {
  await apiService.addCard(userId, cardData);
} catch (error) {
  // Shows: error.message from backend
  // e.g., "User not found" or "Invalid card data"
}
```

## Environment Configuration

### Android Emulator
- Backend URL: `http://10.0.2.2:8000` ✅
- Reason: `10.0.2.2` is Android's special address for host machine's localhost

### iOS Simulator (if needed)
- Backend URL: `http://localhost:8000`
- Reason: iOS can access localhost directly

### Real Device
- Backend URL: `http://YOUR_COMPUTER_IP:8000`
- Example: `http://192.168.1.100:8000`
- Find your IP: `ifconfig` (Mac) or `ipconfig` (Windows)

## Next Steps

### Implement More Features

1. **Card Recommendations:**
   ```javascript
   const recommendation = await apiService.getRecommendation(
     userId, 
     "5812", // Dining MCC code
     5000    // $50.00 in cents
   );
   ```

2. **Transaction History:**
   ```javascript
   const transactions = await apiService.getUserTransactions(userId);
   ```

3. **Analytics:**
   ```javascript
   const analytics = await apiService.getUserAnalytics(userId);
   ```

4. **User Summary:**
   ```javascript
   const summary = await apiService.getUserSummary(userId);
   ```

## Troubleshooting

### "Cannot connect to backend"

**Check:**
1. Backend is running: `curl http://localhost:8000`
2. Using correct URL: `10.0.2.2:8000` for Android
3. Firewall not blocking port 8000

**Fix:**
```bash
# Restart backend
cd backend
python3 main.py
```

### "User not found"

**Check:**
1. Database is seeded: `ls backend/smartcard.db`
2. User ID is correct (should be 1)

**Fix:**
```bash
cd backend
python3 seed_data.py
```

### "Network request failed"

**Check:**
1. Android emulator is running
2. Metro bundler is running
3. Backend URL is correct in `src/config/api.js`

**Fix:**
```bash
# Check API config
cat frontend/src/config/api.js
# Should show: http://10.0.2.2:8000 for Android
```

## Summary

✅ **API Service Created** - Centralized API calls in `apiService.js`
✅ **Configuration Set** - Android emulator uses `10.0.2.2:8000`
✅ **AddCardScreen Connected** - Saves cards to backend database
✅ **HomeScreen Connected** - Fetches cards from backend database
✅ **Error Handling** - Shows loading states and error messages
✅ **Auto-refresh** - Card list updates after adding new card

The frontend is now fully connected to the backend API!
