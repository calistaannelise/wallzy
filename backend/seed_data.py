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
        
        print("Creating sample user...")
        # Create a sample user
        user = User(email="demo@smartcard.com", name="Demo User")
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user: {user.name} (ID: {user.id})")
        
        print("\nCreating categories...")
        # Create categories
        categories = {}
        for cat_name, mcc_codes in mcc_data.MCC_CATEGORIES.items():
            category = Category(name=cat_name, mcc_codes=",".join(mcc_codes))
            db.add(category)
            db.commit()
            db.refresh(category)
            categories[cat_name] = category
            print(f"  - {cat_name}")
        
        print("\nCreating sample cards...")
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
            CardRule(card_id=card1.id, category_id=categories["online_shopping"].id, multiplier=3.0, cap_cents=250000),
            CardRule(card_id=card1.id, category_id=categories["groceries"].id, multiplier=2.0, cap_cents=250000),
            CardRule(card_id=card1.id, category_id=categories["other"].id, multiplier=1.0)
        ]
        for rule in rules1:
            db.add(rule)
        
        # Card 2: Chase Freedom Unlimited
        card2 = Card(
            user_id=user.id,
            issuer="Chase",
            card_name="Freedom Unlimited",
            last_four="5678"
        )
        db.add(card2)
        db.commit()
        db.refresh(card2)
        print(f"  - {card2.card_name}")
        
        # Add rules for card 2
        rules2 = [
            CardRule(card_id=card2.id, category_id=categories["dining"].id, multiplier=3.0),
            CardRule(card_id=card2.id, category_id=categories["drugstores"].id, multiplier=3.0),
            CardRule(card_id=card2.id, category_id=categories["other"].id, multiplier=1.5)
        ]
        for rule in rules2:
            db.add(rule)
        
        # Card 3: Citi Custom Cash
        card3 = Card(
            user_id=user.id,
            issuer="Citi",
            card_name="Custom Cash",
            last_four="9012"
        )
        db.add(card3)
        db.commit()
        db.refresh(card3)
        print(f"  - {card3.card_name}")
        
        # Add rules for card 3
        rules3 = [
            CardRule(card_id=card3.id, category_id=categories["gas"].id, multiplier=5.0, cap_cents=50000),
            CardRule(card_id=card3.id, category_id=categories["groceries"].id, multiplier=5.0, cap_cents=50000),
            CardRule(card_id=card3.id, category_id=categories["dining"].id, multiplier=5.0, cap_cents=50000),
            CardRule(card_id=card3.id, category_id=categories["other"].id, multiplier=1.0)
        ]
        for rule in rules3:
            db.add(rule)
        
        # Card 4: American Express Blue Cash Preferred
        card4 = Card(
            user_id=user.id,
            issuer="American Express",
            card_name="Blue Cash Preferred",
            last_four="3456"
        )
        db.add(card4)
        db.commit()
        db.refresh(card4)
        print(f"  - {card4.card_name}")
        
        # Add rules for card 4
        rules4 = [
            CardRule(card_id=card4.id, category_id=categories["groceries"].id, multiplier=6.0, cap_cents=600000),
            CardRule(card_id=card4.id, category_id=categories["streaming"].id, multiplier=6.0),
            CardRule(card_id=card4.id, category_id=categories["transit"].id, multiplier=3.0),
            CardRule(card_id=card4.id, category_id=categories["gas"].id, multiplier=3.0),
            CardRule(card_id=card4.id, category_id=categories["other"].id, multiplier=1.0)
        ]
        for rule in rules4:
            db.add(rule)
        
        db.commit()
        
        print("\n✅ Database seeded successfully!")
        print(f"\nDemo User ID: {user.id}")
        print(f"Total Cards: 4")
        print(f"Total Categories: {len(categories)}")
        
        print("\n📊 Sample Recommendations:")
        print("  - Groceries (MCC 5411): Amex Blue Cash Preferred (6%)")
        print("  - Dining (MCC 5812): Citi Custom Cash (5%)")
        print("  - Gas (MCC 5541): Citi Custom Cash (5%)")
        print("  - Online Shopping (MCC 5309): BofA Customized Cash (3%)")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
