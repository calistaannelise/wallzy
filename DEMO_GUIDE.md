# 🎬 SmartCard MVP - Demo Guide

## What You'll Demonstrate

A working MVP that automatically recommends the best credit card for any purchase, with a live web scraper for Bank of America rewards.

## Demo Flow (5 minutes)

### 1. Introduction (30 seconds)

**Script:**
> "SmartCard solves a common problem: people have multiple credit cards but don't know which one to use for maximum cashback. The average person earns only 1.6% cashback when they could be earning 3-6% by using the right card."
>
> "SmartCard automatically detects what you're buying and routes to the optimal card. Let me show you how it works."

### 2. Card Recommendation Demo (90 seconds)

**Action:** Open http://localhost:3000

**What to show:**
- Beautiful gradient UI with three tabs
- "Recommend Card" tab is active

**Script:**
> "Here's the recommendation engine. Let's say I'm buying dinner at a restaurant."

**Action:** 
- Select "5812 - Dining/Restaurants" from dropdown
- Enter "$50.00" in amount field
- Click "Get Recommendation"

**Expected Result:**
```
✅ Best Card Found!

Citi Custom Cash
Bank: Citi

Category: dining
Cashback Rate: 5%
You'll Earn: $2.50

Why? 5% cashback on dining
```

**Script:**
> "The system instantly recommends my Citi Custom Cash card because it offers 5% on dining. I'll earn $2.50 back on this $50 purchase."

**Action:** Try another example
- Select "5411 - Grocery Stores"
- Enter "$100.00"
- Click "Get Recommendation"

**Expected Result:**
```
American Express Blue Cash Preferred
6% cashback = $6.00
```

**Script:**
> "For groceries, it switches to my Amex Blue Cash Preferred with 6% cashback. That's $6 back on $100 of groceries."

### 3. Card Portfolio View (30 seconds)

**Action:** Click "My Cards" tab

**What to show:**
- 4 credit cards displayed as gradient cards
- Each showing issuer, name, and number of reward rules

**Script:**
> "Here's my card portfolio. I have 4 cards linked, each with different reward structures. The system knows all their categories, cashback rates, and spending caps."

### 4. Web Scraper Demo (90 seconds)

**Action:** Click "Web Scraper" tab

**Script:**
> "Now here's the cool part - the automated reward updater. Credit card rewards change constantly: rotating categories, limited-time promos, spending caps. Banks don't provide APIs for this data, so we built a web scraper."

**Action:** Click "Run Scraper"

**What happens:**
- Button shows "Scraping..."
- After 10-20 seconds, alert: "Scraper completed! Scraped X rewards."
- Results appear below

**What to show:**
- Raw text from Bank of America website
- Parsed structured data (multiplier, category, caps, dates)

**Example Result:**
```
Card: Customized Cash Rewards
Issuer: Bank of America

Raw Text: "3% cash back in the category of your choice: gas, 
online shopping, dining, travel, drug stores, or home 
improvement/furnishings"

Parsed:
  - Multiplier: 3.0x
  - Category: online_shopping
  - Cap: $2,500.00
```

**Script:**
> "The scraper fetches Bank of America's credit card pages, extracts reward information, and parses it into structured data. It identifies cashback percentages, categories, spending caps, and expiration dates. This would run automatically on a schedule in production."

### 5. API Documentation (30 seconds)

**Action:** Open http://localhost:8000/docs in new tab

**What to show:**
- Swagger UI with all endpoints
- Expand one endpoint (e.g., POST /recommend)
- Show request/response schemas

**Script:**
> "The backend is a FastAPI REST API with full documentation. Here are all the endpoints: user management, card management, recommendations, MCC lookups, and the web scraper."

### 6. Technical Architecture (60 seconds)

**Script:**
> "Let me explain how this works technically:"

**Backend:**
- FastAPI (Python) - modern async web framework
- SQLite database with SQLAlchemy ORM
- Dynamic reward rule engine with date validation
- Web scraper using BeautifulSoup and regex parsing
- MCC (Merchant Category Code) lookup system

**Frontend:**
- React with modern hooks
- Clean, responsive UI
- Real-time API integration

**Recommendation Algorithm:**
1. User provides MCC code and amount
2. System looks up category from MCC (e.g., 5812 → dining)
3. Queries all user's cards and their active reward rules
4. Checks date validity (start/end dates, intro periods)
5. Calculates cashback with spending caps
6. Returns card with highest reward

**Web Scraper:**
1. Fetches HTML from Bank of America card pages
2. Parses with BeautifulSoup
3. Extracts reward text using CSS selectors
4. Parses text with regex patterns
5. Stores raw and structured data
6. Falls back to known data if scraping fails

## Key Talking Points

### Problem Statement
- Average cashback: 1.6%
- Potential cashback: 3-6%
- Gap caused by: wrong card usage, forgotten categories, missed promos

### Solution
- Automatic merchant detection (MCC codes)
- Dynamic reward rule engine
- Automated reward updates via web scraping
- Smart routing to optimal card

### Technical Highlights
- Time-aware reward rules (start/end dates, intro bonuses)
- Spending cap enforcement
- Priority-based tie-breaking
- Graceful fallbacks (scraper)
- Full API documentation

### Business Value
- 2-4x increase in cashback earnings
- Zero user effort required
- Always up-to-date reward information
- Educational transparency (shows why card was chosen)

## Sample Test Cases

### Test Case 1: Dining
- **Input:** MCC 5812, $50
- **Expected:** Citi Custom Cash, 5%, $2.50
- **Why:** Highest dining cashback

### Test Case 2: Groceries
- **Input:** MCC 5411, $100
- **Expected:** Amex Blue Cash Preferred, 6%, $6.00
- **Why:** Highest grocery cashback

### Test Case 3: Gas
- **Input:** MCC 5541, $40
- **Expected:** Citi Custom Cash, 5%, $2.00
- **Why:** Highest gas cashback (tied with Amex at 3%)

### Test Case 4: Online Shopping
- **Input:** MCC 5309, $75
- **Expected:** BofA Customized Cash, 3%, $2.25
- **Why:** Highest online shopping cashback

### Test Case 5: Streaming
- **Input:** MCC 4899, $15
- **Expected:** Amex Blue Cash Preferred, 6%, $0.90
- **Why:** Highest streaming cashback

## Questions & Answers

**Q: How do you get the MCC code?**
A: In production, this comes from the payment processor (Lithic/Marqeta) in real-time. For the MVP, users select from a dropdown.

**Q: What if the web scraper fails?**
A: We have fallback data for demonstration. In production, we'd have multiple strategies: retry logic, manual curation, user contributions, and partner APIs.

**Q: How do you handle rotating categories?**
A: The database supports start_date and end_date fields. The recommendation engine only considers currently active rules.

**Q: What about spending caps?**
A: Each rule can have a cap_cents field. The system tracks spending and stops rewarding once the cap is reached.

**Q: How would this work in real life?**
A: Phase 3 integrates with Lithic or Marqeta to issue a virtual "SmartCard". When you pay, it detects the MCC and routes to your best physical card in <300ms.

**Q: What about security?**
A: Production would have: JWT authentication, OAuth2, rate limiting, input validation, HTTPS, encrypted card storage, and PCI compliance.

**Q: Can I add my own cards?**
A: Yes! Use the API endpoints POST /users/{user_id}/cards and POST /cards/{card_id}/rules. Or extend the frontend with a card management UI.

## Advanced Features to Mention

### From the PRD (Future Phases):

**Phase 2: Automated Scheduling**
- APScheduler runs scrapers daily
- Automatic reward rule updates
- Stale data alerts

**Phase 3: Real-time Routing**
- Lithic/Marqeta integration
- Virtual card issuing
- Sub-300ms routing decisions
- Real transaction processing

**Phase 4: Machine Learning**
- Category prediction from merchant names
- Spending pattern analysis
- Personalized recommendations
- Fraud detection

**Phase 5: LLM Integration**
- OpenAI API for parsing unstructured reward text
- Natural language queries
- Conversational interface
- Smart reward alerts

## Demo Tips

### Do's ✅
- Start with the problem statement
- Show real calculations ($50 → $2.50)
- Demonstrate multiple categories
- Explain the technical architecture
- Show the web scraper in action
- Mention future phases

### Don'ts ❌
- Don't skip the problem statement
- Don't just show code
- Don't apologize for MVP limitations
- Don't rush through the scraper demo
- Don't forget to show API docs

## Backup Plan

If something breaks during demo:

1. **Frontend won't load:** Show API docs at /docs instead
2. **Recommendation fails:** Use curl command to show API
3. **Scraper fails:** Expected! Show the fallback data
4. **Database empty:** Run seed_data.py quickly

## Curl Commands (Backup)

```bash
# Get recommendation
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"mcc_code":"5812","amount_cents":5000}'

# Run scraper
curl -X POST http://localhost:8000/scraper/run

# Get user summary
curl http://localhost:8000/summary/1
```

## Closing Statement

**Script:**
> "This MVP demonstrates the core SmartCard concept: automatic credit card optimization through merchant detection and dynamic reward rules. The web scraper shows how we'd keep reward data fresh automatically. In production, this would integrate with payment processors for real-time routing, use PostgreSQL for scale, and run on AWS with automated scheduling. The result? Users earn 2-4x more cashback without thinking about it."

## Time Breakdown

- Introduction: 30 seconds
- Recommendation Demo: 90 seconds
- Card Portfolio: 30 seconds
- Web Scraper: 90 seconds
- API Docs: 30 seconds
- Architecture: 60 seconds
- **Total: 5 minutes**

Add Q&A: +2-5 minutes

---

**Remember:** The goal is to show a working system that solves a real problem. Focus on the user value first, then the technical implementation.

**Good luck! 🚀**
