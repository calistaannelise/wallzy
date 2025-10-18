# 🧠 SmartCard MVP - Autonomous Credit Card Optimizer

An MVP implementation of the SmartCard system that automatically recommends the best credit card for each purchase based on merchant category codes (MCC) and dynamic reward rules.

## Features

✅ **Card Recommendation Engine** - Get the best card for any purchase based on MCC codes
✅ **Dynamic Reward Rules** - Support for time-based rewards, spending caps, and intro bonuses
✅ **Web Scraper** - Automatically scrape Bank of America credit card rewards
✅ **Modern UI** - Clean React interface to test the system
✅ **RESTful API** - FastAPI backend with full documentation

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Frontend**: React
- **Web Scraping**: BeautifulSoup4, Requests
- **Scheduling**: APScheduler (for automated updates)
- **Firmware**: FreeRTOS ESP32, RFID, BLE

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed_data.py

# Start the FastAPI server
python main.py
```

The backend will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will open automatically at `http://localhost:3000`

## Usage

### 1. Card Recommendations

1. Go to the **"Recommend Card"** tab
2. Select an MCC code (merchant category) - e.g., "5812 - Dining/Restaurants"
3. Enter a purchase amount - e.g., "$50.00"
4. Click **"Get Recommendation"**
5. See which card gives you the best cashback!

### 2. View Your Cards

1. Go to the **"My Cards"** tab
2. See all your linked credit cards and their reward rules
3. The sample data includes 4 popular cards:
   - Bank of America Customized Cash Rewards
   - Chase Freedom Unlimited
   - Citi Custom Cash
   - American Express Blue Cash Preferred

### 3. Web Scraper (Bank of America)

1. Go to the **"Web Scraper"** tab
2. Click **"Run Scraper"**
3. The system will scrape Bank of America's credit card pages
4. View parsed reward information including:
   - Cashback percentages
   - Categories
   - Spending caps
   - Expiration dates

## Sample Data

The seed script creates a demo user with 4 credit cards:

| Card | Best Categories | Cashback Rate |
|------|----------------|---------------|
| **Amex Blue Cash Preferred** | Groceries | 6% |
| **BoFA Customized Cash Rewards** | Dining | 3% |
| **Amex Blue Cash Everyday** | Online Shopping | 3% |
| **Delta Skymiles Blue American Express** | Travel | 2% |

## API Endpoints

### Core Endpoints

- `POST /users` - Create a new user
- `GET /users` - List all users
- `POST /users/{user_id}/cards` - Add a credit card
- `GET /users/{user_id}/cards` - Get user's cards
- `POST /cards/{card_id}/rules` - Add reward rules
- `GET /cards/{card_id}/rules` - Get card's reward rules

### Recommendation

- `POST /recommend` - Get best card recommendation
  ```json
  {
    "user_id": 1,
    "mcc_code": "5812",
    "amount_cents": 5000
  }
  ```

### MCC Lookup

- `GET /mcc/{mcc_code}` - Get category for MCC code
- `GET /categories` - List all categories and MCC codes

### Web Scraper

- `POST /scraper/run` - Run Bank of America scraper
- `GET /scraper/results` - Get scraped reward data

### Analytics

- `GET /summary/{user_id}` - Get user summary with all cards and rewards

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

## Project Structure

```
DUBHACKS/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLAlchemy models
│   ├── mcc_data.py          # MCC category mappings
│   ├── scraper.py           # Bank of America web scraper
│   ├── seed_data.py         # Database seeding script
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Styles
│   │   └── index.js        # React entry point
│   ├── public/
│   │   └── index.html      # HTML template
│   └── package.json        # Node dependencies
└── README.md               # This file
```

## How It Works

### 1. Recommendation Engine

When you request a recommendation:

1. System looks up the category from the MCC code
2. Queries all your cards and their reward rules
3. Checks which rules are currently active (based on dates)
4. Calculates cashback for each card
5. Applies spending caps if applicable
6. Returns the card with the highest cashback

### 2. Web Scraper

The Bank of America scraper:

1. Fetches HTML from BofA credit card pages
2. Extracts reward text using BeautifulSoup
3. Parses text with regex to extract:
   - Cashback percentages
   - Categories
   - Spending caps
   - Expiration dates
4. Stores raw and parsed data in the database
5. Falls back to known data if scraping fails

### 3. Dynamic Reward Rules

Each card can have multiple reward rules with:

- **Multiplier** - Cashback percentage (e.g., 3.0 for 3%)
- **Category** - Spending category (dining, groceries, etc.)
- **Cap** - Maximum cashback per period
- **Start/End Dates** - Time-limited promotions
- **Intro Duration** - First-year bonus periods
- **Activation Required** - Whether user must activate

## Testing the Scraper

The scraper is configured to work with Bank of America's website. It includes:

1. **Real scraping** - Attempts to fetch live data from BofA
2. **Fallback data** - Uses known reward structures if scraping fails
3. **Respectful delays** - 2-second delays between requests
4. **Error handling** - Graceful failures with informative messages

To test:
1. Click "Run Scraper" in the Web Scraper tab
2. Wait for completion (may take 10-20 seconds)
3. View parsed results below

## Future Enhancements

Based on the PRD, future phases could include:

- **Phase 2**: Automated scheduling with APScheduler
- **Phase 3**: Real-time routing with Lithic/Marqeta
- **Phase 4**: ML-based category prediction
- **Phase 5**: LLM-powered reward text parsing
- **Phase 6**: Partner integrations for structured data feeds

## Troubleshooting

### Backend won't start
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8000 is available
- Run seed script first: `python seed_data.py`

### Frontend won't start
- Install dependencies: `npm install`
- Check if port 3000 is available
- Make sure backend is running first

### No recommendations returned
- Verify you ran the seed script
- Check that user_id=1 exists
- Try different MCC codes

### Scraper fails
- This is expected! The scraper includes fallback data
- Bank websites often block scrapers
- The fallback data demonstrates the parsing logic

## License

MIT License - Feel free to use this for your projects!

## Credits

Built for DubHacks - Based on the SmartCard PRD by Andrew Wilbert Vidianto
# dubhacks
