/**
 * Test API Connection
 * Run this to verify backend connectivity
 */

import apiService from '../services/apiService';

export const testConnection = async () => {
  console.log('🧪 Testing API Connection...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const health = await apiService.healthCheck();
    console.log('✅ Backend is running:', health.message);

    // Test 2: List users
    console.log('\n2️⃣ Testing user list...');
    const users = await apiService.listUsers();
    console.log(`✅ Found ${users.length} user(s)`);
    if (users.length > 0) {
      console.log(`   User: ${users[0].name} (ID: ${users[0].id})`);
    }

    // Test 3: Get user cards
    console.log('\n3️⃣ Testing card retrieval...');
    const cards = await apiService.getUserCards(1);
    console.log(`✅ Found ${cards.length} card(s)`);
    cards.forEach(card => {
      console.log(`   - ${card.card_name} (${card.issuer})`);
    });

    // Test 4: Get categories
    console.log('\n4️⃣ Testing categories...');
    const categories = await apiService.listCategories();
    const categoryCount = Object.keys(categories).length;
    console.log(`✅ Found ${categoryCount} categories`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));
    console.log('\n🎉 Your API connection is working perfectly!');

    return true;
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure backend is running: cd backend && python3 main.py');
    console.error('2. Check backend URL in src/config/api.js');
    console.error('3. For Android emulator, use http://10.0.2.2:8000');
    return false;
  }
};

// Export for use in components
export default testConnection;
