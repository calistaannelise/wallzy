import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('recommend');
  const [userId, setUserId] = useState(1);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [scraperResults, setScraperResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [mccCode, setMccCode] = useState('5812');
  const [amount, setAmount] = useState('50.00');

  useEffect(() => {
    loadUserCards();
    loadCategories();
  }, [userId]);

  const loadUserCards = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/cards`);
      setCards(response.data);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation(null);
    
    try {
      const response = await axios.post(`${API_BASE}/recommend`, {
        user_id: userId,
        mcc_code: mccCode,
        amount_cents: Math.round(parseFloat(amount) * 100)
      });
      setRecommendation(response.data);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      alert('Error getting recommendation. Make sure the backend is running and you have cards set up.');
    } finally {
      setLoading(false);
    }
  };

  const runScraper = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/scraper/run`);
      alert(`Scraper completed! Scraped ${response.data.scraped_count} rewards.`);
      loadScraperResults();
    } catch (error) {
      console.error('Error running scraper:', error);
      alert('Error running scraper. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const loadScraperResults = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scraper/results`);
      setScraperResults(response.data);
    } catch (error) {
      console.error('Error loading scraper results:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'scraper') {
      loadScraperResults();
    }
  }, [activeTab]);

  const getCategoryName = (mcc) => {
    for (const [category, codes] of Object.entries(categories)) {
      if (codes.includes(mcc)) {
        return category;
      }
    }
    return 'other';
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🧠 SmartCard MVP</h1>
        <p>Autonomous Credit Card Optimizer</p>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'recommend' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('recommend')}
        >
          💳 Recommend Card
        </button>
        <button 
          className={activeTab === 'cards' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('cards')}
        >
          📊 My Cards
        </button>
        <button 
          className={activeTab === 'scraper' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('scraper')}
        >
          🕸️ Web Scraper
        </button>
      </div>

      <div className="content">
        {activeTab === 'recommend' && (
          <div className="tab-content">
            <h2>Get Card Recommendation</h2>
            <form onSubmit={handleRecommend} className="form">
              <div className="form-group">
                <label>MCC Code (Merchant Category)</label>
                <select 
                  value={mccCode} 
                  onChange={(e) => setMccCode(e.target.value)}
                  className="input"
                >
                  <option value="5812">5812 - Dining/Restaurants</option>
                  <option value="5411">5411 - Grocery Stores</option>
                  <option value="5541">5541 - Gas Stations</option>
                  <option value="5309">5309 - Online Shopping</option>
                  <option value="5912">5912 - Drug Stores</option>
                  <option value="7832">7832 - Movie Theaters</option>
                  <option value="4111">4111 - Transit</option>
                  <option value="4899">4899 - Streaming Services</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purchase Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                  placeholder="50.00"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Analyzing...' : 'Get Recommendation'}
              </button>
            </form>

            {recommendation && (
              <div className="recommendation-result">
                <h3>✅ Best Card Found!</h3>
                <div className="card-result">
                  <div className="card-header">
                    <h4>{recommendation.card_name}</h4>
                    <span className="issuer">{recommendation.issuer}</span>
                  </div>
                  <div className="reward-details">
                    <div className="reward-item">
                      <span className="label">Category:</span>
                      <span className="value">{recommendation.category}</span>
                    </div>
                    <div className="reward-item">
                      <span className="label">Cashback Rate:</span>
                      <span className="value highlight">{recommendation.multiplier}%</span>
                    </div>
                    <div className="reward-item">
                      <span className="label">You'll Earn:</span>
                      <span className="value highlight">${(recommendation.cashback_cents / 100).toFixed(2)}</span>
                    </div>
                    <div className="reason">
                      <strong>Why?</strong> {recommendation.reason}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="tab-content">
            <h2>My Credit Cards</h2>
            <div className="cards-grid">
              {cards.length === 0 ? (
                <p className="empty-state">No cards found. Run the seed script to add sample cards.</p>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="card-item">
                    <div className="card-item-header">
                      <h3>{card.card_name}</h3>
                      <span className="issuer-badge">{card.issuer}</span>
                    </div>
                    <p className="card-number">•••• {card.last_four}</p>
                    <p className="rules-count">{card.rules_count} reward rules</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'scraper' && (
          <div className="tab-content">
            <h2>Bank of America Web Scraper</h2>
            <p className="description">
              This tool scrapes Bank of America's credit card reward information and parses it into structured data.
            </p>
            
            <button 
              onClick={runScraper} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Scraping...' : '🕸️ Run Scraper'}
            </button>

            {scraperResults.length > 0 && (
              <div className="scraper-results">
                <h3>Recent Scraper Results ({scraperResults.length})</h3>
                <div className="results-list">
                  {scraperResults.map(result => (
                    <div key={result.id} className="result-item">
                      <div className="result-header">
                        <strong>{result.card_name}</strong>
                        <span className="issuer-badge">{result.issuer}</span>
                      </div>
                      <p className="raw-text">{result.raw_text}</p>
                      {result.parsed_category && (
                        <div className="parsed-info">
                          <span className="parsed-label">Parsed:</span>
                          <span className="parsed-value">
                            {result.parsed_multiplier}% on {result.parsed_category}
                            {result.parsed_end_date && ` (until ${result.parsed_end_date})`}
                          </span>
                        </div>
                      )}
                      <p className="timestamp">Scraped: {new Date(result.scraped_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
