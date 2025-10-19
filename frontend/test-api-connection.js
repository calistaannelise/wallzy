/**
 * Test API Connection from Node.js
 * Run: node test-api-connection.js
 */

const API_BASE_URL = 'http://localhost:8000';

async function testAPI() {
  console.log('🧪 Testing API Connection...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/`);
    const health = await healthResponse.json();
    console.log('✅ Backend is running:', health.message);

    // Test 2: List users
    console.log('\n2️⃣ Testing user list...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const users = await usersResponse.json();
    console.log(`✅ Found ${users.length} user(s)`);
    if (users.length > 0) {
      console.log(`   User: ${users[0].name} (ID: ${users[0].id})`);
    }

    // Test 3: Get user cards
    console.log('\n3️⃣ Testing card retrieval...');
    const cardsResponse = await fetch(`${API_BASE_URL}/users/1/cards`);
    const cards = await cardsResponse.json();
    console.log(`✅ Found ${cards.length} card(s)`);
    cards.forEach(card => {
      console.log(`   - ${card.card_name} (${card.issuer}) - Last 4: ${card.last_four}`);
    });

    // Test 4: Add a test card
    console.log('\n4️⃣ Testing card creation...');
    const addCardResponse = await fetch(`${API_BASE_URL}/users/1/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issuer: 'Test Bank',
        card_name: 'Test Card from Node.js',
        last_four: '9999',
        network: 'visa',
      }),
    });
    const newCard = await addCardResponse.json();
    console.log(`✅ Card created with ID: ${newCard.id}`);

    // Test 5: Get categories
    console.log('\n5️⃣ Testing categories...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const categories = await categoriesResponse.json();
    const categoryCount = Object.keys(categories).length;
    console.log(`✅ Found ${categoryCount} categories`);

    // Test 6: Get recommendation
    console.log('\n6️⃣ Testing card recommendation...');
    const recommendResponse = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1,
        mcc_code: '5812', // Dining
        amount_cents: 5000, // $50.00
      }),
    });
    const recommendation = await recommendResponse.json();
    console.log(`✅ Best card: ${recommendation.card_name}`);
    console.log(`   Cashback: $${(recommendation.cashback_cents / 100).toFixed(2)}`);
    console.log(`   Reason: ${recommendation.reason}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));
    console.log('\n🎉 Your API is working perfectly!');
    console.log('\nYou can now run the React Native app with confidence.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure backend is running: cd backend && python3 main.py');
    console.error('2. Check if port 8000 is available');
    console.error('3. Verify database is seeded: cd backend && python3 seed_data.py');
  }
}

// Run tests
testAPI();
