# 🚀 Quick Start Guide

## Option 1: Automated Start (Recommended)

```bash
chmod +x start.sh
./start.sh
```

This will:
- Set up Python virtual environment
- Install all dependencies
- Seed the database
- Start both backend and frontend

## Option 2: Manual Start

### Terminal 1 - Backend

```bash
cd backend
pip install -r requirements.txt
python seed_data.py
python main.py
```

Backend will run on: http://localhost:8000

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm start
```

Frontend will open automatically at: http://localhost:3000

## What to Try

1. **Get a Recommendation**
   - Go to "Recommend Card" tab
   - Select "5812 - Dining/Restaurants"
   - Enter "$50.00"
   - Click "Get Recommendation"
   - See which card gives the best cashback!

2. **View Your Cards**
   - Go to "My Cards" tab
   - See 4 sample credit cards with their reward rules

3. **Test the Web Scraper**
   - Go to "Web Scraper" tab
   - Click "Run Scraper"
   - See Bank of America rewards being scraped and parsed

## Troubleshooting

**Port already in use?**
- Backend: Change port in `backend/main.py` (last line)
- Frontend: Set `PORT=3001` before running `npm start`

**Dependencies not installing?**
- Backend: Make sure Python 3.8+ is installed
- Frontend: Make sure Node.js 16+ is installed

**No cards showing up?**
- Make sure you ran `python seed_data.py` first

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI)

## Sample MCC Codes to Try

- 5812 - Dining/Restaurants
- 5411 - Grocery Stores  
- 5541 - Gas Stations
- 5309 - Online Shopping
- 5912 - Drug Stores
- 4899 - Streaming Services

Enjoy! 🎉
