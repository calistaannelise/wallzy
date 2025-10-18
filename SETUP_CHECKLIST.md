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

### Step 2: Frontend Setup 🎨

```bash
cd ../frontend
```

- [ ] Install Node dependencies
  ```bash
  npm install
  ```
  
  **Expected:** No errors, packages installed

### Step 3: Start the Application 🚀

**Option A: Automated (Recommended)**

```bash
cd ..
chmod +x start.sh
./start.sh
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```bash
cd backend
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## Verification Checklist

### Backend Verification ✅

- [ ] Backend running on http://localhost:8000
- [ ] Visit http://localhost:8000 - Should see API info
- [ ] Visit http://localhost:8000/docs - Should see Swagger UI
- [ ] API returns user list at http://localhost:8000/users

### Frontend Verification ✅

- [ ] Frontend opens at http://localhost:3000
- [ ] See "SmartCard MVP" header with purple gradient
- [ ] Three tabs visible: "Recommend Card", "My Cards", "Web Scraper"
- [ ] No console errors in browser DevTools

### Feature Testing ✅

#### Test 1: Card Recommendation
- [ ] Go to "Recommend Card" tab
- [ ] Select "5812 - Dining/Restaurants"
- [ ] Enter "$50.00"
- [ ] Click "Get Recommendation"
- [ ] Should see: **Citi Custom Cash (5%) = $2.50**

#### Test 2: View Cards
- [ ] Go to "My Cards" tab
- [ ] Should see 4 cards:
  - [ ] Bank of America Customized Cash Rewards
  - [ ] Chase Freedom Unlimited
  - [ ] Citi Custom Cash
  - [ ] American Express Blue Cash Preferred

#### Test 3: Web Scraper
- [ ] Go to "Web Scraper" tab
- [ ] Click "Run Scraper"
- [ ] Wait 10-20 seconds
- [ ] Should see scraped Bank of America rewards
- [ ] Each result shows raw text and parsed data

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

### Issue: Port 3000 already in use
**Solution:**
```bash
# Use a different port
PORT=3001 npm start
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

### Issue: CORS errors in browser
**Solution:**
- Make sure backend is running first
- Check backend console for errors
- Verify backend URL in frontend/src/App.js (line 5)

### Issue: Scraper returns no results
**Solution:**
- This is expected! Bank websites often block scrapers
- The scraper includes fallback data for demonstration
- Check the console for error messages

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
    ├── public/
    │   └── ✅ index.html
    └── src/
        ├── ✅ App.js
        ├── ✅ App.css
        ├── ✅ index.js
        └── ✅ index.css
```

## Quick Test Commands

### Test Backend Only
```bash
cd backend
python main.py &
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

- [x] Backend starts without errors
- [x] Frontend loads in browser
- [x] Can get card recommendations
- [x] Can view all 4 sample cards
- [x] Can run web scraper
- [x] API test script passes all tests
- [x] No console errors in browser
- [x] Swagger docs accessible

## Next Steps

Once everything is working:

1. **Explore the API Docs**: http://localhost:8000/docs
2. **Try Different MCC Codes**: Test various merchant categories
3. **Review the Code**: Check out the implementation details
4. **Customize**: Add your own credit cards and rules
5. **Extend**: Implement Phase 2 features from the PRD

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
   - "SmartCard automatically recommends the best credit card for each purchase"

2. **Show Recommendation** (1 minute)
   - Open frontend
   - Select dining, enter $50
   - Show Citi Custom Cash with 5% = $2.50

3. **Show Card Portfolio** (30 seconds)
   - Switch to "My Cards" tab
   - Show 4 different cards with different rewards

4. **Show Web Scraper** (1 minute)
   - Switch to "Web Scraper" tab
   - Click "Run Scraper"
   - Show parsed Bank of America rewards

5. **Show API** (30 seconds)
   - Open http://localhost:8000/docs
   - Show interactive API documentation

6. **Explain Architecture** (1 minute)
   - FastAPI backend with SQLite
   - React frontend
   - Web scraper with BeautifulSoup
   - Dynamic reward rules with date validation

Total: ~4 minutes

---

**Ready to start?** Run: `./start.sh`

**Need help?** Check: `README.md` or `QUICKSTART.md`
