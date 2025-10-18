from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    cards = relationship("Card", back_populates="user")

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    issuer = Column(String)
    card_name = Column(String)
    last_four = Column(String)
    user = relationship("User", back_populates="cards")
    rules = relationship("CardRule", back_populates="card")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    mcc_codes = Column(Text)  # Comma-separated MCC codes
    rules = relationship("CardRule", back_populates="category")

class CardRule(Base):
    __tablename__ = "card_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    multiplier = Column(Float)
    cap_cents = Column(Integer, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    intro_duration_months = Column(Integer, nullable=True)
    requires_activation = Column(Boolean, default=False)
    priority = Column(Integer, default=0)
    
    card = relationship("Card", back_populates="rules")
    category = relationship("Category", back_populates="rules")

class ScrapedReward(Base):
    __tablename__ = "scraped_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    issuer = Column(String)
    card_name = Column(String)
    raw_text = Column(Text)
    parsed_category = Column(String, nullable=True)
    parsed_multiplier = Column(Float, nullable=True)
    parsed_end_date = Column(String, nullable=True)
    scraped_at = Column(String)
    processed = Column(Boolean, default=False)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_id = Column(Integer, ForeignKey("cards.id"))
    amount_cents = Column(Integer)  # Amount in cents
    mcc_code = Column(String)  # Merchant Category Code
    merchant_name = Column(String, nullable=True)
    category = Column(String)  # Derived from MCC
    rewards = Column(Integer)  # Cashback earned
    multiplier = Column(Float)  # Cashback rate used
    transaction_date = Column(String)  # ISO format timestamp
    description = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", backref="transactions")
    card = relationship("Card", backref="transactions")

# Database setup
DATABASE_URL = "sqlite:///./smartcard.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
