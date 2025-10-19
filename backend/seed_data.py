"""
Seed the database with sample users, cards, and reward rules
"""
from database import SessionLocal, init_db, User, Card, Category, CardRule
import mcc_data

def seed_database():
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(CardRule).delete()
        db.query(Card).delete()
        db.query(Category).delete()
        db.query(User).delete()
        db.commit()
        
        print("Creating categories...")
        # Create categories (shared across all users)
        categories = {}
        for cat_name, mcc_codes in mcc_data.MCC_CATEGORIES.items():
            category = Category(name=cat_name, mcc_codes=",".join(mcc_codes))
            db.add(category)
            db.commit()
            db.refresh(category)
            categories[cat_name] = category
            print(f"  - {cat_name}")
        
        print("\nCreating sample users...")
        # Create sample users
        for i in range(1, 3):
            user = User(email=f"user{i}@gmail.com", name=f"user{i}")
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user.name} (ID: {user.id})")
            
            print(f"\nCreating sample cards for {user.name}...")
            # Card 1: Bank of America Customized Cash Rewards
            card1 = Card(
                user_id=user.id,
                issuer="Bank of America",
                card_name="Customized Cash Rewards",
                last_four="1234"
            )
            db.add(card1)
            db.commit()
            db.refresh(card1)
            print(f"  - {card1.card_name}")
            
            # Add rules for card 1
            rules1 = [
                CardRule(card_id=card1.id, category_id=categories["dining"].id, multiplier=3.0, cap_cents=250000),
                CardRule(card_id=card1.id, category_id=categories["groceries"].id, multiplier=2.0, cap_cents=250000),
                CardRule(card_id=card1.id, category_id=categories["other"].id, multiplier=1.0)
            ]
            for rule in rules1:
                db.add(rule)
            
            # Card 2: Blue Cash Preferred® Card from American Express
            card2 = Card(
                user_id=user.id,
                issuer="American Express",
                card_name="Blue Cash Preferred",
                last_four="5678"
            )
            db.add(card2)
            db.commit()
            db.refresh(card2)
            print(f"  - {card2.card_name}")
            
            # Add rules for card 2
            rules2 = [
                CardRule(card_id=card2.id, category_id=categories["groceries"].id, multiplier=6.0),
                CardRule(card_id=card2.id, category_id=categories["entertainment"].id, multiplier=6.0),
                CardRule(card_id=card2.id, category_id=categories["gas"].id, multiplier=3.0),
                CardRule(card_id=card2.id, category_id=categories["other"].id, multiplier=1.0)
            ]
            for rule in rules2:
                db.add(rule)
            
            # Card 3: Prime Visa
            card3 = Card(
                user_id=user.id,
                issuer="Visa",
                card_name="Prime Visa",
                last_four="9012"
            )
            db.add(card3)
            db.commit()
            db.refresh(card3)
            print(f"  - {card3.card_name}")
            
            # Add rules for card 3
            rules3 = [
                CardRule(card_id=card3.id, category_id=categories["online_shopping"].id, multiplier=5.0),
                CardRule(card_id=card3.id, category_id=categories["dining"].id, multiplier=2.0),
                CardRule(card_id=card3.id, category_id=categories["gas"].id, multiplier=2.0),
                CardRule(card_id=card3.id, category_id=categories["other"].id, multiplier=1.0)
            ]
            for rule in rules3:
                db.add(rule)
            
            db.commit()
            
            print("\n✅ Database seeded successfully!")
            print(f"\nDemo User ID: {user.id}")
            print(f"Total Cards: 3")
            print(f"Total Categories: {len(categories)}")
        
        # print("\n📊 Sample Recommendations:")
        # print("  - Groceries (MCC 5411): Amex Blue Cash Preferred (6%)")
        # print("  - Dining (MCC 5812): Visa Prime Visa (2%)")
        # print("  - Gas (MCC 5541): Visa Prime Visa (2%)")
        # print("  - Online Shopping (MCC 5309): BofA Customized Cash (3%)")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
