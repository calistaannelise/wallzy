/**
 * API Service
 * Handles all API calls to the backend
 */

import { API_BASE_URL, API_ENDPOINTS, DEFAULT_USER_ID } from '../config/api';

class ApiService {
  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response: Success`);
      return data;
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }

  // ============ User APIs ============

  async createUser(email, name) {
    return this.request(API_ENDPOINTS.CREATE_USER, {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  async listUsers() {
    return this.request(API_ENDPOINTS.LIST_USERS);
  }

  // ============ Card APIs ============

  async addCard(userId, cardData) {
    const payload = {
      issuer: cardData.issuer,
      card_name: cardData.card_name,
      last_four: cardData.last_four,
      expiry_date: cardData.expiry_date || null,
      cvv: cardData.cvv || null,
    };

    return this.request(API_ENDPOINTS.ADD_CARD(userId), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUserCards(userId = DEFAULT_USER_ID) {
    return this.request(API_ENDPOINTS.GET_USER_CARDS(userId));
  }

  // ============ Card Rule APIs ============

  async addCardRule(cardId, ruleData) {
    const payload = {
      category: ruleData.category,
      multiplier: ruleData.multiplier,
      cap_cents: ruleData.cap_cents || null,
      start_date: ruleData.start_date || null,
      end_date: ruleData.end_date || null,
      intro_duration_months: ruleData.intro_duration_months || null,
      activation_required: ruleData.activation_required || false,
    };

    return this.request(API_ENDPOINTS.ADD_CARD_RULE(cardId), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCardRules(cardId) {
    return this.request(API_ENDPOINTS.GET_CARD_RULES(cardId));
  }

  // ============ Recommendation API ============

  async getRecommendation(userId, mccCode, amountCents) {
    const payload = {
      user_id: userId,
      mcc_code: mccCode,
      amount_cents: amountCents,
    };

    return this.request(API_ENDPOINTS.RECOMMEND_CARD, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ============ MCC & Category APIs ============

  async getMccCategory(mccCode) {
    return this.request(API_ENDPOINTS.GET_MCC_CATEGORY(mccCode));
  }

  async listCategories() {
    return this.request(API_ENDPOINTS.LIST_CATEGORIES);
  }

  // ============ Transaction APIs ============

  async createTransaction(transactionData) {
    const payload = {
      user_id: transactionData.user_id,
      card_id: transactionData.card_id,
      amount_cents: transactionData.amount_cents,
      mcc_code: transactionData.mcc_code,
      merchant_name: transactionData.merchant_name || 'Unknown Merchant',
    };

    return this.request(API_ENDPOINTS.CREATE_TRANSACTION, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUserTransactions(userId = DEFAULT_USER_ID, limit = 50) {
    return this.request(`${API_ENDPOINTS.GET_USER_TRANSACTIONS(userId)}?limit=${limit}`);
  }

  async getCardTransactions(cardId, limit = 50) {
    return this.request(`${API_ENDPOINTS.GET_CARD_TRANSACTIONS(cardId)}?limit=${limit}`);
  }

  // ============ Analytics APIs ============

  async getUserAnalytics(userId = DEFAULT_USER_ID) {
    return this.request(API_ENDPOINTS.GET_USER_ANALYTICS(userId));
  }

  async getUserSummary(userId = DEFAULT_USER_ID) {
    return this.request(API_ENDPOINTS.GET_USER_SUMMARY(userId));
  }

  // ============ Scraper APIs ============

  async runScraper() {
    return this.request(API_ENDPOINTS.RUN_SCRAPER, {
      method: 'POST',
    });
  }

  async getScraperResults() {
    return this.request(API_ENDPOINTS.GET_SCRAPER_RESULTS);
  }

  // ============ Health Check ============

  async healthCheck() {
    return this.request('/');
  }
}

// Export singleton instance
export default new ApiService();
