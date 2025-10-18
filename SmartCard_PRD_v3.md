# 🧠 PRD --- "SmartCard": The Autonomous Credit Card Optimizer

### **Version:** v3.0

### **Prepared by:** Andrew Wilbert Vidianto

### **Stack:** FastAPI (Python) · SQLite → Postgres · Draftbit (Frontend) · Lithic/Marqeta (Routing)

------------------------------------------------------------------------

## 1. 🧩 Summary

**Goal:**\
Enable users to **maximize their cashback and rewards automatically** by
detecting merchant type (via MCC) and routing payments to the **optimal
credit card** --- without user input.

Today, users with multiple cards earn only **\~1.6% cashback**, even
though they could reach **3--4%** by using the right card for each
purchase. SmartCard solves this by **automating category detection and
reward updates** using existing payment infrastructure and a dynamic
reward rule engine.

------------------------------------------------------------------------

## 2. 🚨 Problem Statement

Most users: - Have **multiple credit cards** but don't understand how to
optimize them.\
- Forget category bonuses or spend caps.\
- Don't track time-limited promos or first-year offers.\
- End up using random cards for every purchase.

As a result:\
\> 💸 Average real cashback is only 1.6% instead of 3--4%.

Even if people know which card to use, they don't want to think about it
at checkout or manually update category rules. SmartCard handles this
automatically by detecting the merchant type and updating reward
structures dynamically.

------------------------------------------------------------------------

## 3. 🎯 Product Vision

> "A single smart card that always pays with the best one --- and always
> knows the latest rewards."

SmartCard acts as an **intelligent intermediary** between the user and
their real cards.\
It automatically identifies what you're buying, knows which card
performs best *right now* (given date-based promotions or first-year
bonuses), and routes or recommends accordingly.

Core capabilities: 1. **Automatic merchant detection** using Merchant
Category Code (MCC).\
2. **Dynamic reward rule engine** with start/end dates, intro bonuses,
and activations.\
3. **Reward rule auto-updater** (web scraper + parser + scheduler).\
4. **Routing engine** that decides which linked card to use in real
time.\
5. **Learning engine** that improves with user transaction data.

------------------------------------------------------------------------

## 4. 💡 Use Cases

  -----------------------------------------------------------------------
  \#    Use Case              Description                 Value
  ----- --------------------- --------------------------- ---------------
  1     **Automatic           User pays using SmartCard → Effortless
        Optimization**        backend routes to the card  savings
                              with the highest current    
                              reward for that MCC         

  2     **Dynamic Rewards     SmartCard automatically     Always accurate
        Awareness**           tracks changing reward      
                              structures                  

  3     **Education &         User can see "why"          Trust and
        Transparency**        SmartCard picked that card  clarity
                              and what bonuses applied    

  4     **Performance         Track average cashback,     Awareness
        Dashboard**           total rewards, and cap      
                              usage                       

  5     **Hybrid Read Mode**  For users who don't use     Insight-only
                              SmartCard, analyze          mode
                              transactions (via Plaid)    
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. 🏗 Architecture Overview

  ------------------------------------------------------------------------
  Layer                 Tool            Description
  --------------------- --------------- ----------------------------------
  Frontend              **Draftbit**    User app for card linking, viewing
                                        insights, and history

  Backend               **FastAPI       Routing, recommendation, and
                        (Python)**      reward engine

  Database              **SQLite →      Stores users, cards, MCCs, and
                        Postgres**      time-aware reward rules

  Card Processor        **Lithic /      Virtual SmartCard issuing + MCC
                        Marqeta**       webhooks

  Data Updater          **Web Scraper + Keeps rewards up-to-date
                        Parser +        automatically
                        APScheduler**   

  Bank Integration      **Plaid         Reads user transactions for
                        (optional)**    analytics
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 6. ⚙️ Core Features

### Phase 1 (MVP)

-   Users add cards manually (issuer, name, reward structure).\
-   FastAPI recommends the optimal card using static reward rules.\
-   Draftbit app displays comparisons and potential savings.

### Phase 2 (Dynamic Reward Engine)

-   Add time-based rule fields: `start_date`, `end_date`,
    `intro_duration_months`, `requires_activation`.\
-   Support multiple concurrent reward rules (intro bonuses, rotating
    categories).\
-   Recommendation logic becomes **time-aware**.\
-   Automatically refresh reward data via scheduled scraper jobs.

### Phase 3 (Smart Routing)

-   Integrate Lithic or Marqeta for real-time MCC-based routing.\
-   Route in \<300ms using `/route/auth` webhook.\
-   Maintain reward accuracy through daily data updates.

------------------------------------------------------------------------

## 7. 🧠 Dynamic Reward Rule Schema

``` sql
CREATE TABLE card_rules (
  id INTEGER PRIMARY KEY,
  card_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  multiplier REAL,
  cap_cents INTEGER,
  start_date TEXT,
  end_date TEXT,
  intro_duration_months INTEGER,
  requires_activation INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  FOREIGN KEY(card_id) REFERENCES cards(id),
  FOREIGN KEY(category_id) REFERENCES categories(id)
);
```

SmartCard checks these fields on every recommendation to select
*currently active* reward rules.

------------------------------------------------------------------------

## 8. 🕸 Reward Data Collection Layer (Scraper + Parser + Scheduler)

Because banks don't provide APIs for reward programs, SmartCard
maintains its own **reward knowledge base** using an automated update
pipeline.

### Components:

1.  **Web Scraper** --- fetches HTML content from known card issuer
    URLs.\
2.  **Parser** --- extracts reward info like "5% dining until June 30."\
3.  **Normalizer** --- converts text into structured rule objects.\
4.  **Scheduler** --- runs scrapers automatically (daily or weekly).

### Example Scraper (Python):

``` python
import requests
from bs4 import BeautifulSoup

def scrape_rewards():
    url = "https://example-bank.com/rewards"
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")
    offers = soup.find_all("div", class_="reward-offer")

    rewards = []
    for offer in offers:
        text = offer.get_text(strip=True)
        rewards.append(text)
    return rewards
```

### Example Parser:

``` python
import re
from datetime import datetime

def parse_reward_text(text):
    pattern = r"(\d+)%.*?on (.*?) until (\w+ \d{1,2}, \d{4})"
    match = re.search(pattern, text)
    if match:
        return {
            "multiplier": float(match.group(1)),
            "category": match.group(2),
            "end_date": datetime.strptime(match.group(3), "%B %d, %Y")
        }
```

Output:

``` python
{'category': 'dining', 'multiplier': 5.0, 'end_date': datetime(2025, 6, 30)}
```

------------------------------------------------------------------------

## 9. 🔁 Automated Scheduling (Cron / APScheduler)

SmartCard runs its scrapers automatically to keep reward rules fresh.

### Option A --- Cron Job

In Linux, add this line to `crontab -e`:

    0 3 * * * python scrape_rewards.py

→ Runs every day at 3 AM.

### Option B --- APScheduler (Python)

``` python
from apscheduler.schedulers.background import BackgroundScheduler

def daily_update():
    print("Updating reward rules...")
    rewards = scrape_rewards()
    update_db(rewards)

scheduler = BackgroundScheduler()
scheduler.add_job(daily_update, 'interval', hours=24)
scheduler.start()
```

This lets FastAPI self-update card rules daily.

------------------------------------------------------------------------

## 10. 📊 Reward Update Architecture

     [Scheduler (APScheduler)] ─→ [Scraper] ─→ [Parser] ─→ [Normalizer] ─→ [DB Updater] ─→ [FastAPI Engine]

1.  Scheduler triggers scraper job.\
2.  Scraper fetches issuer pages.\
3.  Parser extracts structured data.\
4.  Normalizer validates and saves it into `card_rules`.\
5.  Recommendation engine automatically uses the updated data.

------------------------------------------------------------------------

## 11. 🔌 API Key Endpoints (Recap)

  ---------------------------------------------------------------------------
  Method            Endpoint                     Description
  ----------------- ---------------------------- ----------------------------
  `POST`            `/auth/signup`               Register user

  `POST`            `/users/{id}/cards`          Add linked cards

  `POST`            `/recommend`                 Recommend best card (uses
                                                 live rules)

  `POST`            `/route/auth`                Lithic/Marqeta webhook for
                                                 routing

  `GET`             `/mcc/resolve/{mcc}`         Get merchant category

  `GET`             `/summary/{user_id}`         Rewards summary

  `POST`            `/admin/card-rules/update`   (Internal) Update reward
                                                 data manually
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

## 12. 📊 Success Metrics

  Metric                           Target
  -------------------------------- --------------------
  Avg Cashback Rate                ≥ 3.0% (from 1.6%)
  Reward Rule Accuracy             ≥ 95%
  Auto-Update Frequency            Daily
  Routing Latency                  ≤ 300ms
  User Trust (Accuracy Feedback)   ≥ 90%

------------------------------------------------------------------------

## 13. ⚠️ Risks & Mitigations

  -----------------------------------------------------------------------
  Risk                   Mitigation
  ---------------------- ------------------------------------------------
  Reward site structure  Flexible parsers; fallback to manual input
  changes                

  Missing data from      Manual curation & user contributions
  banks                  

  Scraping blocked       Respect rate limits; request partner feeds
  (robots.txt)           

  Scheduler downtime     Backup cron on server

  Data staleness         Daily re-scrape + verification alerts
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 14. 📅 Development Roadmap

  -----------------------------------------------------------------------
  Phase             Duration                 Deliverable
  ----------------- ------------------------ ----------------------------
  **Phase 0**       2 weeks                  Static card rule DB + MCC
                                             mapping

  **Phase 1**       3 weeks                  Dynamic rule schema +
                                             scraper/parser

  **Phase 2**       3 weeks                  APScheduler integration
                                             (daily updates)

  **Phase 3**       4 weeks                  Lithic/Marqeta routing
                                             engine

  **Phase 4**       Continuous               ML-based trend detection +
                                             partner integrations
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 15. 🚀 Vision Beyond MVP

-   Integrate with OpenAI API to parse unstructured reward text via
    LLMs.\
-   Partner with issuers or aggregators for structured reward feeds.\
-   Offer "Smart Reward Alerts" for upcoming category changes.\
-   Predict next quarter's categories via pattern learning.\
-   Provide APIs for fintechs to embed SmartCard's reward engine.

------------------------------------------------------------------------

## ✅ TL;DR

SmartCard combines **real-time transaction routing** (via MCC detection)
with an **autonomous reward rule updater** powered by scrapers, parsers,
and schedulers.\
The system self-learns, self-updates, and ensures users always earn the
**maximum possible cashback** --- no manual tracking, no outdated data.

------------------------------------------------------------------------
