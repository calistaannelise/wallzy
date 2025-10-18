from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import database
import mcc_data
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

# Pydantic models
class UserCreate(BaseModel):
    email: str
    name: str

class CardCreate(BaseModel):
    issuer: str
    card_name: str
    last_four: str

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

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(database.get_db)):
    """Create a new user"""
    db_user = database.User(email=user.email, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": db_user.id, "email": db_user.email, "name": db_user.name}

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
        last_four=card.last_four
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

@app.post("/recommend")
def recommend_card(request: RecommendRequest, db: Session = Depends(database.get_db)):
    """
    Recommend the best card for a transaction based on MCC code
    """
    # Get category from MCC
    category = mcc_data.get_category_from_mcc(request.mcc_code)
    
    # Get user's cards
    cards = db.query(database.Card).filter(database.Card.user_id == request.user_id).all()
    if not cards:
        raise HTTPException(status_code=404, detail="No cards found for user")
    
    best_card = None
    best_multiplier = 0
    best_cashback = 0
    best_reason = ""
    
    today = datetime.now().date()
    
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
            
            # Check if rule is currently active
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
            cashback = int((request.amount_cents * multiplier) / 100)
            
            # Check spending cap
            if rule.cap_cents and cashback > rule.cap_cents:
                cashback = rule.cap_cents
            
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
