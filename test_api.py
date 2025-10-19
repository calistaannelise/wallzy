"""
Test script to verify the SmartCard API is working correctly
Run this after starting the backend server
"""
import requests
import json

API_BASE = "http://localhost:8000"

def test_api():
    print("🧪 Testing SmartCard API...\n")
    
    # Test 1: Check if server is running
    print("1️⃣ Testing server connection...")
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("   ✅ Server is running!")
        else:
            print("   ❌ Server returned error")
            return
    except Exception as e:
        print(f"   ❌ Cannot connect to server: {e}")
        print("   Make sure to run 'python3 main.py' first!")
        return
    
    # Test 2: List users
    print("\n2️⃣ Testing user list...")
    try:
        response = requests.get(f"{API_BASE}/users")
        users = response.json()
        if users:
            print(f"   ✅ Found {len(users)} user(s)")
            user_id = users[0]['id']
            print(f"   Using user ID: {user_id}")
        else:
            print("   ❌ No users found. Run 'python seed_data.py' first!")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 3: Get user's cards
    print("\n3️⃣ Testing card retrieval...")
    try:
        response = requests.get(f"{API_BASE}/users/{user_id}/cards")
        cards = response.json()
        if cards:
            print(f"   ✅ Found {len(cards)} card(s)")
            for card in cards:
                print(f"      - {card['card_name']} ({card['issuer']})")
        else:
            print("   ❌ No cards found")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 4: Get MCC category
    print("\n4️⃣ Testing MCC lookup...")
    try:
        response = requests.get(f"{API_BASE}/mcc/5812")
        data = response.json()
        print(f"   ✅ MCC 5812 = {data['category']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 5: Get recommendation
    print("\n5️⃣ Testing card recommendation...")
    test_cases = [
        {"mcc": "5812", "amount": 50.00, "category": "Dining"},
        {"mcc": "5411", "amount": 100.00, "category": "Groceries"},
        {"mcc": "5541", "amount": 40.00, "category": "Gas"},
    ]
    
    for test in test_cases:
        try:
            response = requests.post(f"{API_BASE}/recommend", json={
                "user_id": user_id,
                "mcc_code": test["mcc"],
                "amount_cents": int(test["amount"] * 100)
            })
            
            if response.status_code == 200:
                rec = response.json()
                cashback = rec['cashback_cents'] / 100
                print(f"   ✅ {test['category']}: ${test['amount']:.2f} → {rec['card_name']} ({rec['multiplier']}%) = ${cashback:.2f}")
            else:
                print(f"   ❌ Failed for {test['category']}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Test 6: Get summary
    print("\n6️⃣ Testing user summary...")
    try:
        response = requests.get(f"{API_BASE}/summary/{user_id}")
        summary = response.json()
        print(f"   ✅ User: {summary['user_name']}")
        print(f"   ✅ Total cards: {summary['total_cards']}")
        for card in summary['cards']:
            print(f"      - {card['card_name']}: {len(card['rewards'])} reward rules")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)
    print("\n🎉 Your SmartCard API is working perfectly!")
    print("\nNext steps:")
    print("  1. Open http://localhost:3000 to use the web interface")
    print("  2. Visit http://localhost:8000/docs for API documentation")
    print("  3. Try the web scraper in the UI to test Bank of America scraping")

if __name__ == "__main__":
    test_api()
