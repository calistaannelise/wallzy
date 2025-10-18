# 🏗️ SmartCard MVP Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    React Frontend (Port 3000)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Recommend   │  │   My Cards   │  │    Web Scraper       │ │
│  │     Card     │  │   Portfolio  │  │      Testing         │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                  FastAPI Backend (Port 8000)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Endpoints: /recommend, /users, /cards, /scraper, etc.  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   BUSINESS LOGIC         │  │   WEB SCRAPER            │
│                          │  │                          │
│  • Recommendation Engine │  │  • BofA Scraper          │
│  • Reward Calculator     │  │  • HTML Parser           │
│  • MCC Lookup            │  │  • Regex Extractor       │
│  • Date Validation       │  │  • Data Normalizer       │
│  • Cap Enforcement       │  │                          │
└──────────────────────────┘  └──────────────────────────┘
            │                            │
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│                   SQLite Database                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Users   │  │  Cards   │  │ Categories │  │  Card Rules  │ │
│  └──────────┘  └──────────┘  └────────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Scraped Rewards (Raw + Parsed)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Card Recommendation Flow

```
User Input (MCC + Amount)
         │
         ▼
    Frontend Form
         │
         ▼
  POST /recommend
         │
         ▼
   MCC → Category Lookup
         │
         ▼
  Query User's Cards
         │
         ▼
  Get Active Rules (date check)
         │
         ▼
  Calculate Cashback (with caps)
         │
         ▼
  Select Best Card
         │
         ▼
  Return Recommendation
         │
         ▼
   Display Result
```

### 2. Web Scraper Flow

```
User Clicks "Run Scraper"
         │
         ▼
  POST /scraper/run
         │
         ▼
  BankOfAmericaScraper.scrape_rewards()
         │
         ├─► Fetch HTML from BofA URLs
         │
         ├─► Parse with BeautifulSoup
         │
         └─► Extract reward text
         │
         ▼
  RewardParser.parse_reward_text()
         │
         ├─► Extract multiplier (regex)
         │
         ├─► Extract category (regex)
         │
         ├─► Extract cap (regex)
         │
         └─► Extract dates (regex)
         │
         ▼
  Save to ScrapedReward table
         │
         ▼
  Return results to frontend
         │
         ▼
  Display parsed rewards
```

## Database Schema

```sql
┌─────────────────────┐
│       Users         │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ name                │
└─────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────┐
│       Cards         │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ issuer              │
│ card_name           │
│ last_four           │
└─────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────┐         ┌─────────────────────┐
│    Card Rules       │   N:1   │    Categories       │
├─────────────────────┤ ───────►├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ card_id (FK)        │         │ name                │
│ category_id (FK)    │         │ mcc_codes           │
│ multiplier          │         └─────────────────────┘
│ cap_cents           │
│ start_date          │
│ end_date            │
│ intro_duration      │
│ requires_activation │
│ priority            │
└─────────────────────┘

┌─────────────────────┐
│  Scraped Rewards    │
├─────────────────────┤
│ id (PK)             │
│ issuer              │
│ card_name           │
│ raw_text            │
│ parsed_category     │
│ parsed_multiplier   │
│ parsed_end_date     │
│ scraped_at          │
│ processed           │
└─────────────────────┘
```

## Component Architecture

### Backend Components

```
backend/
├── main.py                 # FastAPI application
│   ├── API Routes          # REST endpoints
│   ├── Request Models      # Pydantic schemas
│   └── Response Models     # Pydantic schemas
│
├── database.py             # Data layer
│   ├── SQLAlchemy Models   # ORM models
│   ├── Database Engine     # SQLite connection
│   └── Session Manager     # DB session handling
│
├── mcc_data.py            # Business logic
│   ├── MCC_CATEGORIES      # Category mappings
│   ├── get_category()      # MCC → Category
│   └── get_mcc_codes()     # Category → MCCs
│
├── scraper.py             # Web scraping
│   ├── BankOfAmericaScraper
│   │   ├── scrape_rewards()
│   │   ├── extract_texts()
│   │   └── get_fallback()
│   └── RewardParser
│       └── parse_reward_text()
│
└── seed_data.py           # Data initialization
    └── seed_database()     # Create sample data
```

### Frontend Components

```
frontend/src/
├── App.js                  # Main component
│   ├── State Management    # React hooks
│   ├── API Integration     # Axios calls
│   └── UI Components       # JSX
│       ├── Tabs
│       ├── RecommendCard
│       ├── MyCards
│       └── WebScraper
│
├── App.css                # Styling
│   ├── Layout
│   ├── Components
│   └── Animations
│
└── index.js               # React entry
    └── ReactDOM.render()
```

## API Endpoints Map

```
GET  /                          → API info
GET  /docs                      → Swagger UI

# User Management
POST /users                     → Create user
GET  /users                     → List users
GET  /summary/{user_id}         → User summary

# Card Management
POST /users/{user_id}/cards     → Add card
GET  /users/{user_id}/cards     → List cards
POST /cards/{card_id}/rules     → Add rule
GET  /cards/{card_id}/rules     → List rules

# Recommendations
POST /recommend                 → Get best card
     Body: {user_id, mcc_code, amount_cents}
     Returns: {card_id, multiplier, cashback, reason}

# MCC Lookup
GET  /mcc/{mcc_code}           → Get category
GET  /categories                → List all categories

# Web Scraper
POST /scraper/run              → Run scraper
GET  /scraper/results          → Get results
```

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Database**: SQLite (SQLAlchemy 2.0.23)
- **Web Scraping**: 
  - Requests 2.31.0
  - BeautifulSoup4 4.12.2
  - lxml 4.9.3
- **Validation**: Pydantic 2.5.0
- **Server**: Uvicorn 0.24.0

### Frontend
- **Framework**: React 18.2.0
- **HTTP Client**: Axios 1.6.0
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Styling**: CSS3 (no framework)

## Recommendation Algorithm

```python
def recommend_card(user_id, mcc_code, amount_cents):
    # 1. Get category from MCC
    category = get_category_from_mcc(mcc_code)
    
    # 2. Get user's cards
    cards = get_user_cards(user_id)
    
    # 3. Initialize best card tracking
    best_card = None
    best_cashback = 0
    
    # 4. Evaluate each card
    for card in cards:
        rules = get_card_rules(card.id)
        
        for rule in rules:
            # Check category match
            if rule.category != category:
                continue
            
            # Check date validity
            if not is_rule_active(rule, today):
                continue
            
            # Calculate cashback
            cashback = (amount_cents * rule.multiplier) / 100
            
            # Apply cap
            if rule.cap_cents:
                cashback = min(cashback, rule.cap_cents)
            
            # Update best if better
            if cashback > best_cashback:
                best_card = card
                best_cashback = cashback
    
    # 5. Return recommendation
    return {
        "card": best_card,
        "cashback": best_cashback,
        "multiplier": rule.multiplier
    }
```

## Web Scraper Architecture

```
BankOfAmericaScraper
    │
    ├─► scrape_rewards()
    │   │
    │   ├─► For each card URL:
    │   │   │
    │   │   ├─► requests.get(url)
    │   │   │
    │   │   ├─► BeautifulSoup(html)
    │   │   │
    │   │   ├─► soup.select(selectors)
    │   │   │
    │   │   └─► Extract text
    │   │
    │   └─► Return raw rewards
    │
    └─► _get_fallback_data()
        └─► Return known rewards

RewardParser
    │
    └─► parse_reward_text(text)
        │
        ├─► Regex: Extract multiplier
        │   Pattern: (\d+(?:\.\d+)?)\s*%
        │
        ├─► Regex: Extract category
        │   Patterns: dining|groceries|gas|...
        │
        ├─► Regex: Extract cap
        │   Pattern: \$\s*(\d+(?:,\d{3})*)
        │
        └─► Regex: Extract dates
            Pattern: until\s+(\w+\s+\d{1,2},?\s+\d{4})
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Setup                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Vercel/Netlify)                                 │
│      ↓                                                      │
│  API Gateway (AWS API Gateway)                             │
│      ↓                                                      │
│  Backend (AWS Lambda / EC2)                                │
│      ↓                                                      │
│  Database (PostgreSQL / RDS)                               │
│      ↓                                                      │
│  Cache (Redis)                                             │
│      ↓                                                      │
│  Scheduler (AWS EventBridge)                               │
│      ↓                                                      │
│  Scraper Jobs (Lambda Functions)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations (Future)

1. **Authentication**: JWT tokens, OAuth2
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Pydantic models
5. **SQL Injection**: SQLAlchemy ORM
6. **XSS Protection**: React auto-escaping
7. **HTTPS**: TLS/SSL certificates
8. **API Keys**: Environment variables
9. **Web Scraping**: Respect robots.txt, rate limits

## Performance Optimizations (Future)

1. **Caching**: Redis for frequent queries
2. **Database Indexing**: On user_id, card_id, category_id
3. **Connection Pooling**: SQLAlchemy pool
4. **Async Operations**: FastAPI async endpoints
5. **CDN**: Static assets on CloudFront
6. **Compression**: Gzip responses
7. **Lazy Loading**: Frontend pagination

## Monitoring & Logging (Future)

1. **Application Logs**: Structured logging
2. **Error Tracking**: Sentry
3. **Performance Monitoring**: New Relic / DataDog
4. **Uptime Monitoring**: Pingdom
5. **Analytics**: Google Analytics
6. **Scraper Success Rate**: Custom metrics

---

**Architecture Version**: 1.0.0 (MVP)
**Last Updated**: 2025-10-18
