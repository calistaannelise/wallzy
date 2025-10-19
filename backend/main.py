from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import json
import random
import database
import mcc_data
import auth
from scraper import BankOfAmericaScraper, RewardParser

app = FastAPI(title="SmartCard API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
database.init_db()

# Helper functions
def read_json():
    """Read data from hello.json file"""
    import os
    # Path to hello.json in the firmware directory
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "firmware", "hello.json")
    with open(json_path, "r") as f:
        return json.load(f)

def get_random_merchant_name(category):
    """Generate a random merchant name based on category"""
    merchants = {
        'dining': [
            'The Cheesecake Factory',
            'Olive Garden',
            'Chipotle Mexican Grill',
            'Panera Bread',
            'Red Lobster',
            'Buffalo Wild Wings',
            'P.F. Chang\'s',
            'Starbucks',
            'Subway',
            'McDonald\'s'
        ],
        'grocery': [
            'Whole Foods Market',
            'Trader Joe\'s',
            'Safeway',
            'Kroger',
            'Costco',
            'Target',
            'Walmart Supercenter',
            'Sprouts Farmers Market',
            'QFC',
            'Fred Meyer'
        ],
        'gas': [
            'Shell',
            'Chevron',
            'BP',
            '76',
            'Arco',
            'Exxon',
            'Mobil',
            'Texaco',
            'Circle K',
            'Costco Gas'
        ],
        'online_shopping': [
            'Amazon.com',
            'eBay',
            'Etsy',
            'Walmart.com',
            'Target.com',
            'Best Buy Online',
            'Wayfair',
            'Chewy',
            'Zappos',
            'Newegg'
        ],
        'travel': [
            'Delta Airlines',
            'United Airlines',
            'American Airlines',
            'Hilton Hotels',
            'Marriott',
            'Airbnb',
            'Expedia',
            'Uber',
            'Lyft',
            'Hertz Rent-A-Car'
        ],
        'entertainment': [
            'AMC Theatres',
            'Regal Cinemas',
            'Netflix',
            'Spotify',
            'Apple Music',
            'PlayStation Store',
            'Xbox Store',
            'Steam',
            'Disney+',
            'Hulu'
        ],
        'other': [
            'CVS Pharmacy',
            'Walgreens',
            'Home Depot',
            'Lowe\'s',
            'Best Buy',
            'Apple Store',
            'AT&T',
            'Verizon',
            'T-Mobile',
            'Amazon'
        ]
    }
    
    # Get merchant list for category, default to 'other' if not found
    merchant_list = merchants.get(category, merchants['other'])
    return random.choice(merchant_list)

# Pydantic models
class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str

class CardCreate(BaseModel):
    issuer: str
    card_name: str
    last_four: str
    expiry_date: Optional[str] = None
    cvv: Optional[str] = None

class CardRuleCreate(BaseModel):
    category: str
    multiplier: float
    cap_cents: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    intro_duration_months: Optional[int] = None
    requires_activation: bool = False
    priority: int = 0

class RecommendRequest(BaseModel):
    user_id: int
    mcc_code: str
    amount_cents: int

class RecommendResponse(BaseModel):
    recommended_card_id: int
    card_name: str
    issuer: str
    multiplier: float
    cashback_cents: int
    category: str
    reason: str

class TransactionCreate(BaseModel):
    user_id: int
    card_id: int
    amount_cents: int
    mcc_code: str
    merchant_name: Optional[str] = None
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    card_id: int
    card_name: str
    amount_cents: int
    mcc_code: str
    category: str
    cashback_cents: int
    multiplier: float
    transaction_date: str
    merchant_name: Optional[str] = None

# API Endpoints

@app.get("/")
def root():
    return {
        "message": "SmartCard API",
        "version": "1.0.0",
        "endpoints": [
            "/users",
            "/users/{user_id}/cards",
            "/recommend",
            "/mcc/{mcc_code}",
            "/scraper/run",
            "/scraper/results"
        ]
    }

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(database.get_db)):
    """Create a new user (signup)"""
    try:
        # Check if user already exists
        existing_user = db.query(database.User).filter(database.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password
        hashed_password = auth.hash_password(user.password)
        
        # Create new user
        db_user = database.User(
            email=user.email,
            name=user.name,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return UserResponse(id=db_user.id, email=db_user.email, name=db_user.name)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error and return a proper JSON response
        print(f"Error creating user: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.post("/login", response_model=UserResponse)
def login(user_login: UserLogin, db: Session = Depends(database.get_db)):
    """Authenticate a user (login)"""
    # Find user by email
    db_user = db.query(database.User).filter(database.User.email == user_login.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not auth.verify_password(user_login.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return UserResponse(id=db_user.id, email=db_user.email, name=db_user.name)

@app.get("/users")
def list_users(db: Session = Depends(database.get_db)):
    """List all users"""
    users = db.query(database.User).all()
    return [{"id": u.id, "email": u.email, "name": u.name} for u in users]

@app.post("/users/{user_id}/cards")
def add_card(user_id: int, card: CardCreate, db: Session = Depends(database.get_db)):
    """Add a credit card to a user"""
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_card = database.Card(
        user_id=user_id,
        issuer=card.issuer,
        card_name=card.card_name,
        last_four=card.last_four,
        expiry_date=card.expiry_date,
        cvv=card.cvv
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return {"id": db_card.id, "issuer": db_card.issuer, "card_name": db_card.card_name}

@app.get("/users/{user_id}/cards")
def get_user_cards(user_id: int, db: Session = Depends(database.get_db)):
    """Get all cards for a user"""
    cards = db.query(database.Card).filter(database.Card.user_id == user_id).all()
    result = []
    for card in cards:
        rules = db.query(database.CardRule).filter(database.CardRule.card_id == card.id).all()
        result.append({
            "id": card.id,
            "issuer": card.issuer,
            "card_name": card.card_name,
            "last_four": card.last_four,
            "expiry_date": card.expiry_date,
            "rules_count": len(rules)
        })
    return result

@app.post("/cards/{card_id}/rules")
def add_card_rule(card_id: int, rule: CardRuleCreate, db: Session = Depends(database.get_db)):
    """Add a reward rule to a card"""
    card = db.query(database.Card).filter(database.Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Get or create category
    category = db.query(database.Category).filter(database.Category.name == rule.category).first()
    if not category:
        mcc_codes = ",".join(mcc_data.get_mcc_codes_for_category(rule.category))
        category = database.Category(name=rule.category, mcc_codes=mcc_codes)
        db.add(category)
        db.commit()
        db.refresh(category)
    
    db_rule = database.CardRule(
        card_id=card_id,
        category_id=category.id,
        multiplier=rule.multiplier,
        cap_cents=rule.cap_cents,
        start_date=rule.start_date,
        end_date=rule.end_date,
        intro_duration_months=rule.intro_duration_months,
        requires_activation=rule.requires_activation,
        priority=rule.priority
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return {"id": db_rule.id, "card_id": card_id, "category": rule.category, "multiplier": rule.multiplier}

@app.get("/cards/{card_id}/rules")
def get_card_rules(card_id: int, db: Session = Depends(database.get_db)):
    """Get all reward rules for a card"""
    rules = db.query(database.CardRule).filter(database.CardRule.card_id == card_id).all()
    result = []
    for rule in rules:
        category = db.query(database.Category).filter(database.Category.id == rule.category_id).first()
        result.append({
            "id": rule.id,
            "category": category.name if category else "unknown",
            "multiplier": rule.multiplier,
            "cap_cents": rule.cap_cents,
            "start_date": rule.start_date,
            "end_date": rule.end_date,
            "priority": rule.priority
        })
    return result

@app.post("/recommend", response_model=RecommendResponse)
def recommend_card(db: Session = Depends(database.get_db)):
    """
    Recommend the best card for a transaction based on MCC code
    Reads data from hello.json file
    """

    # Get json data
    data = read_json()

    # Get category from MCC
    category = mcc_data.get_category_from_mcc(data["mcc"])
    uid = data["uid"]
    random_amount_cents = random.randint(500, 50000)
    
    # Determine user_id based on UID
    # UID "C10AAEA4" maps to user 1, all other UIDs map to user 2
    if uid == "C10AAEA4":
        user_id = 1
    else:
        user_id = 2
    
    # Get user's cards
    cards = db.query(database.Card).filter(database.Card.user_id == user_id).all()
    if not cards:
        raise HTTPException(status_code=404, detail="No cards found for user")
    
    if uid == "C10AAEA4":
        card_ids = [1, 2, 3]
        random_card_id = random.choice(card_ids)
        random_card = db.query(database.Card).filter(database.Card.id == random_card_id).first()

        rules = db.query(database.CardRule).filter(database.CardRule.card_id == random_card_id).all()

        multiplier = 1.0
        cashback = int((random_amount_cents) / 100)

        print("random card: " + random_card.card_name)

        for rule in rules:
            cat = db.query(database.Category).filter(database.Category.id == rule.category_id).first()
            if cat and cat.name == category:
                multiplier = rule.multiplier
                cashback = int((random_amount_cents * multiplier) / 100)
                break

        # Generate random merchant name based on category
        merchant_name = get_random_merchant_name(category)
        
        # Record transaction in database
        db_transaction = database.Transaction(
            user_id=user_id,
            card_id=random_card.id,
            amount_cents=random_amount_cents,
            mcc_code=data["mcc"],
            merchant_name=merchant_name,
            category=category,
            rewards=cashback,
            multiplier=multiplier,
            transaction_date=datetime.now().isoformat(),
            description=f"RFID tap - UID: {uid}"
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        return RecommendResponse(
            recommended_card_id=random_card.id,
            card_name=random_card.card_name,
            issuer=random_card.issuer,
            multiplier=multiplier,
            cashback_cents=cashback,
            category=category,
            reason="Random card"
        )

    best_card = None
    best_multiplier = 0
    best_cashback = 0
    best_reason = ""
    
    # today = datetime.now().date()
    
    for card in cards:
        # Get active rules for this card and category
        rules = db.query(database.CardRule).filter(
            database.CardRule.card_id == card.id
        ).all()
        
        for rule in rules:
            # Get category for this rule
            cat = db.query(database.Category).filter(database.Category.id == rule.category_id).first()
            if not cat:
                continue
            
            # Check if rule applies to this category
            if cat.name != category and cat.name != "other":
                continue
            
            # # Check if rule is currently active
            # is_active = True
            # if rule.start_date:
            #     start = datetime.fromisoformat(rule.start_date).date()
            #     if today < start:
            #         is_active = False
            
            # if rule.end_date:
            #     end = datetime.fromisoformat(rule.end_date).date()
            #     if today > end:
            #         is_active = False
            
            # if not is_active:
            #     continue
            
            # Calculate cashback
            multiplier = rule.multiplier
            cashback = int((random_amount_cents * multiplier) / 100)
            
            # # Check spending cap
            # if rule.cap_cents and cashback > rule.cap_cents:
            #     cashback = rule.cap_cents
            
            # Update best card if this is better
            if cashback > best_cashback or (cashback == best_cashback and multiplier > best_multiplier):
                best_card = card
                best_multiplier = multiplier
                best_cashback = cashback
                best_reason = f"{multiplier}% cashback on {cat.name}"
                if rule.end_date:
                    best_reason += f" (valid until {rule.end_date})"
    
    if not best_card:
        raise HTTPException(status_code=404, detail="No applicable card rules found")
   
    print("best card: " + best_card.card_name)
    
    # Generate random merchant name based on category
    merchant_name = get_random_merchant_name(category)
    
    # Record transaction in database
    db_transaction = database.Transaction(
        user_id=user_id,
        card_id=best_card.id,
        amount_cents=random_amount_cents,
        mcc_code=data["mcc"],
        merchant_name=merchant_name,
        category=category,
        rewards=best_cashback,
        multiplier=best_multiplier,
        transaction_date=datetime.now().isoformat(),
        description=f"RFID tap - UID: {uid}"
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return RecommendResponse(
        recommended_card_id=best_card.id,
        card_name=best_card.card_name,
        issuer=best_card.issuer,
        multiplier=best_multiplier,
        cashback_cents=best_cashback,
        category=category,
        reason=best_reason
    )

@app.get("/mcc/{mcc_code}")
def get_mcc_category(mcc_code: str):
    """Get category name for an MCC code"""
    category = mcc_data.get_category_from_mcc(mcc_code)
    return {
        "mcc_code": mcc_code,
        "category": category
    }

@app.get("/categories")
def list_categories():
    """List all available categories and their MCC codes"""
    return {
        category: codes for category, codes in mcc_data.MCC_CATEGORIES.items()
    }

@app.post("/scraper/run")
def run_scraper(db: Session = Depends(database.get_db)):
    """
    Run the Bank of America web scraper
    """
    scraper = BankOfAmericaScraper()
    parser = RewardParser()
    
    try:
        # Scrape rewards
        raw_rewards = scraper.scrape_rewards()
        
        # Save raw rewards to database
        for reward in raw_rewards:
            parsed = parser.parse_reward_text(reward['raw_text'])
            
            db_reward = database.ScrapedReward(
                issuer=reward['issuer'],
                card_name=reward['card_name'],
                raw_text=reward['raw_text'],
                parsed_category=parsed.get('category') if parsed else None,
                parsed_multiplier=parsed.get('multiplier') if parsed else None,
                parsed_end_date=parsed.get('end_date') if parsed else None,
                scraped_at=reward['scraped_at'],
                processed=False
            )
            db.add(db_reward)
        
        db.commit()
        
        return {
            "status": "success",
            "scraped_count": len(raw_rewards),
            "message": "Rewards scraped and saved to database"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraper error: {str(e)}")

@app.get("/scraper/results")
def get_scraper_results(db: Session = Depends(database.get_db)):
    """Get all scraped rewards"""
    rewards = db.query(database.ScrapedReward).order_by(database.ScrapedReward.scraped_at.desc()).limit(50).all()
    result = []
    for reward in rewards:
        result.append({
            "id": reward.id,
            "issuer": reward.issuer,
            "card_name": reward.card_name,
            "raw_text": reward.raw_text,
            "parsed_category": reward.parsed_category,
            "parsed_multiplier": reward.parsed_multiplier,
            "parsed_end_date": reward.parsed_end_date,
            "scraped_at": reward.scraped_at,
            "processed": reward.processed
        })
    return result

@app.get("/summary/{user_id}")
def get_user_summary(user_id: int, db: Session = Depends(database.get_db)):
    """Get summary of user's cards and potential rewards"""
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    cards = db.query(database.Card).filter(database.Card.user_id == user_id).all()
    
    summary = {
        "user_id": user_id,
        "user_name": user.name,
        "total_cards": len(cards),
        "cards": []
    }
    
    for card in cards:
        rules = db.query(database.CardRule).filter(database.CardRule.card_id == card.id).all()
        card_info = {
            "card_id": card.id,
            "issuer": card.issuer,
            "card_name": card.card_name,
            "last_four": card.last_four,
            "rewards": []
        }
        
        for rule in rules:
            category = db.query(database.Category).filter(database.Category.id == rule.category_id).first()
            card_info["rewards"].append({
                "category": category.name if category else "unknown",
                "multiplier": rule.multiplier,
                "cap_cents": rule.cap_cents,
                "active": True  # TODO: Check date ranges
            })
        
        summary["cards"].append(card_info)
    
    return summary

@app.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(database.get_db)):
    """
    Record a transaction and calculate cashback earned
    """
    # Get the card
    card = db.query(database.Card).filter(database.Card.id == transaction.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Get category from MCC
    category = mcc_data.get_category_from_mcc(transaction.mcc_code)
    
    # Find the best reward rule for this card and category
    rules = db.query(database.CardRule).filter(database.CardRule.card_id == transaction.card_id).all()
    
    best_multiplier = 0
    best_cashback = 0
    today = datetime.now().date()
    
    for rule in rules:
        cat = db.query(database.Category).filter(database.Category.id == rule.category_id).first()
        if not cat or (cat.name != category and cat.name != "other"):
            continue
        
        # Check if rule is active
        is_active = True
        if rule.start_date:
            start = datetime.fromisoformat(rule.start_date).date()
            if today < start:
                is_active = False
        if rule.end_date:
            end = datetime.fromisoformat(rule.end_date).date()
            if today > end:
                is_active = False
        
        if not is_active:
            continue
        
        # Calculate cashback
        multiplier = rule.multiplier
        cashback = int((transaction.amount_cents * multiplier) / 100)
        
        if rule.cap_cents and cashback > rule.cap_cents:
            cashback = rule.cap_cents
        
        if cashback > best_cashback:
            best_multiplier = multiplier
            best_cashback = cashback
    
    # Create transaction record
    db_transaction = database.Transaction(
        user_id=transaction.user_id,
        card_id=transaction.card_id,
        amount_cents=transaction.amount_cents,
        mcc_code=transaction.mcc_code,
        merchant_name=transaction.merchant_name,
        category=category,
        rewards=best_cashback,
        multiplier=best_multiplier,
        transaction_date=datetime.now().isoformat(),
        description=transaction.description
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return TransactionResponse(
        id=db_transaction.id,
        user_id=db_transaction.user_id,
        card_id=db_transaction.card_id,
        card_name=card.card_name,
        amount_cents=db_transaction.amount_cents,
        mcc_code=db_transaction.mcc_code,
        category=db_transaction.category,
        cashback_cents=db_transaction.rewards,
        multiplier=db_transaction.multiplier,
        transaction_date=db_transaction.transaction_date,
        merchant_name=db_transaction.merchant_name
    )

@app.get("/transactions/{user_id}")
def get_user_transactions(user_id: int, limit: int = 50, db: Session = Depends(database.get_db)):
    """
    Get transaction history for a user
    """
    transactions = db.query(database.Transaction).filter(
        database.Transaction.user_id == user_id
    ).order_by(database.Transaction.transaction_date.desc()).limit(limit).all()
    
    result = []
    for txn in transactions:
        card = db.query(database.Card).filter(database.Card.id == txn.card_id).first()
        result.append({
            "id": txn.id,
            "card_name": card.card_name if card else "Unknown",
            "card_issuer": card.issuer if card else "Unknown",
            "amount_cents": txn.amount_cents,
            "amount_dollars": txn.amount_cents / 100,
            "mcc_code": txn.mcc_code,
            "category": txn.category,
            "merchant_name": txn.merchant_name,
            "cashback_cents": txn.rewards,
            "cashback_dollars": txn.rewards / 100,
            "multiplier": txn.multiplier,
            "transaction_date": txn.transaction_date,
            "description": txn.description
        })
    
    return result

@app.get("/transactions/card/{card_id}")
def get_card_transactions(card_id: int, limit: int = 50, db: Session = Depends(database.get_db)):
    """
    Get transaction history for a specific card
    """
    transactions = db.query(database.Transaction).filter(
        database.Transaction.card_id == card_id
    ).order_by(database.Transaction.transaction_date.desc()).limit(limit).all()
    
    result = []
    for txn in transactions:
        result.append({
            "id": txn.id,
            "amount_cents": txn.amount_cents,
            "amount_dollars": txn.amount_cents / 100,
            "mcc_code": txn.mcc_code,
            "category": txn.category,
            "merchant_name": txn.merchant_name,
            "cashback_cents": txn.rewards,
            "cashback_dollars": txn.rewards / 100,
            "multiplier": txn.multiplier,
            "transaction_date": txn.transaction_date,
            "description": txn.description
        })
    
    return result

@app.get("/analytics/{user_id}")
def get_user_analytics(user_id: int, db: Session = Depends(database.get_db)):
    """
    Get analytics for a user's spending and cashback
    """
    transactions = db.query(database.Transaction).filter(
        database.Transaction.user_id == user_id
    ).all()
    
    if not transactions:
        return {
            "total_transactions": 0,
            "total_spent_cents": 0,
            "total_cashback_cents": 0,
            "average_cashback_rate": 0,
            "by_category": {},
            "by_card": {}
        }
    
    total_spent = sum(t.amount_cents for t in transactions)
    total_cashback = sum(t.rewards for t in transactions)
    avg_rate = (total_cashback / total_spent * 100) if total_spent > 0 else 0
    
    # By category
    by_category = {}
    for txn in transactions:
        if txn.category not in by_category:
            by_category[txn.category] = {
                "count": 0,
                "total_spent_cents": 0,
                "total_cashback_cents": 0
            }
        by_category[txn.category]["count"] += 1
        by_category[txn.category]["total_spent_cents"] += txn.amount_cents
        by_category[txn.category]["total_cashback_cents"] += txn.rewards
    
    # By card
    by_card = {}
    for txn in transactions:
        card = db.query(database.Card).filter(database.Card.id == txn.card_id).first()
        card_key = f"{card.card_name}" if card else "Unknown"
        
        if card_key not in by_card:
            by_card[card_key] = {
                "count": 0,
                "total_spent_cents": 0,
                "total_cashback_cents": 0
            }
        by_card[card_key]["count"] += 1
        by_card[card_key]["total_spent_cents"] += txn.amount_cents
        by_card[card_key]["total_cashback_cents"] += txn.rewards
    
    return {
        "total_transactions": len(transactions),
        "total_spent_cents": total_spent,
        "total_spent_dollars": total_spent / 100,
        "total_cashback_cents": total_cashback,
        "total_cashback_dollars": total_cashback / 100,
        "average_cashback_rate": round(avg_rate, 2),
        "by_category": by_category,
        "by_card": by_card
    }

@app.post("/update-json")
def update_json(card_data: dict):
    """Update hello.json with new card scan data"""
    try:
        import os
        json_path = os.path.join(os.path.dirname(__file__), "..", "firmware", "hello.json")
        
        # Write the new card data to hello.json
        with open(json_path, 'w') as f:
            json.dump(card_data, f, indent=2)
        
        print(f"Updated hello.json with: {card_data}")
        return {"status": "success", "data": card_data}
    except Exception as e:
        print(f"Error updating hello.json: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update JSON: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)