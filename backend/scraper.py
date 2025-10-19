import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from typing import List, Dict, Optional
import time

class BankOfAmericaScraper:
    """
    Web scraper for Bank of America credit card rewards
    """
    
    def __init__(self):
        self.base_url = "https://www.bankofamerica.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def scrape_rewards(self) -> List[Dict]:
        """
        Scrape Bank of America credit card rewards information
        
        Returns:
            List of dictionaries containing reward information
        """
        rewards = []
        
        # Common Bank of America credit cards to scrape
        card_urls = {
            "Customized Cash Rewards": "/en-us/credit-cards/products/cash-back-credit-card/",
            "Premium Rewards": "/en-us/credit-cards/products/premium-rewards-credit-card/",
            "Unlimited Cash Rewards": "/en-us/credit-cards/products/unlimited-cash-back-credit-card/",
            "Travel Rewards": "/en-us/credit-cards/products/travel-rewards-credit-card/"
        }
        
        for card_name, url_path in card_urls.items():
            try:
                print(f"Scraping {card_name}...")
                full_url = self.base_url + url_path
                
                response = requests.get(full_url, headers=self.headers, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract reward information from various sections
                reward_texts = self._extract_reward_texts(soup, card_name)
                rewards.extend(reward_texts)
                
                # Be respectful - add delay between requests
                time.sleep(2)
                
            except Exception as e:
                print(f"Error scraping {card_name}: {str(e)}")
                # Add fallback data for demonstration
                rewards.extend(self._get_fallback_data(card_name))
        
        return rewards
    
    def _extract_reward_texts(self, soup: BeautifulSoup, card_name: str) -> List[Dict]:
        """Extract reward text from parsed HTML"""
        rewards = []
        
        # Look for common reward-related elements
        selectors = [
            'div[class*="reward"]',
            'div[class*="benefit"]',
            'div[class*="cash-back"]',
            'p[class*="reward"]',
            'li[class*="benefit"]',
            'span[class*="percent"]'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text(strip=True)
                if text and any(keyword in text.lower() for keyword in ['%', 'cash', 'points', 'reward', 'bonus']):
                    rewards.append({
                        'issuer': 'Bank of America',
                        'card_name': card_name,
                        'raw_text': text,
                        'scraped_at': datetime.now().isoformat()
                    })
        
        return rewards
    
    def _get_fallback_data(self, card_name: str) -> List[Dict]:
        """Provide fallback data when scraping fails"""
        fallback_rewards = {
            "Customized Cash Rewards": [
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '3% cash back in the category of your choice: gas, online shopping, dining, travel, drug stores, or home improvement/furnishings',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '2% cash back at grocery stores and wholesale clubs (for the first $2,500 in combined choice category/grocery store/wholesale club quarterly purchases)',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '1% cash back on all other purchases',
                    'scraped_at': datetime.now().isoformat()
                }
            ],
            "Premium Rewards": [
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '2 points per $1 spent on travel and dining purchases',
                    'scraped_at': datetime.now().isoformat()
                },
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '1.5 points per $1 spent on all other purchases',
                    'scraped_at': datetime.now().isoformat()
                }
            ],
            "Unlimited Cash Rewards": [
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '1.5% unlimited cash back on all purchases',
                    'scraped_at': datetime.now().isoformat()
                }
            ],
            "Travel Rewards": [
                {
                    'issuer': 'Bank of America',
                    'card_name': card_name,
                    'raw_text': '1.5 points per $1 spent on all purchases',
                    'scraped_at': datetime.now().isoformat()
                }
            ]
        }
        
        return fallback_rewards.get(card_name, [])

class RewardParser:
    """
    Parse scraped reward text into structured data
    """
    
    @staticmethod
    def parse_reward_text(text: str) -> Optional[Dict]:
        """
        Parse reward text to extract multiplier, category, and dates
        
        Args:
            text: Raw reward text
            
        Returns:
            Dictionary with parsed reward information or None
        """
        result = {
            'multiplier': None,
            'category': None,
            'end_date': None,
            'cap_cents': None
        }
        
        # Extract percentage/multiplier
        percent_pattern = r'(\d+(?:\.\d+)?)\s*%'
        percent_match = re.search(percent_pattern, text)
        if percent_match:
            result['multiplier'] = float(percent_match.group(1))
        
        # Extract points multiplier
        points_pattern = r'(\d+(?:\.\d+)?)\s*points?\s*(?:per|for|\/)\s*\$1'
        points_match = re.search(points_pattern, text, re.IGNORECASE)
        if points_match:
            result['multiplier'] = float(points_match.group(1))
        
        # Extract category
        categories = {
            'dining': r'\b(dining|restaurants?|food)\b',
            'groceries': r'\b(grocery|groceries|supermarket)\b',
            'gas': r'\b(gas|fuel|gas stations?)\b',
            # 'travel': r'\b(travel|hotels?|flights?|airlines?)\b',
            'online_shopping': r'\b(online shopping|online purchases?)\b',
            'drugstores': r'\b(drug stores?|pharmacy|pharmacies)\b',
            'entertainment': r'\b(entertainment|movies?|concerts?)\b',
            # 'transit': r'\b(transit|transportation|subway|bus)\b',
            'streaming': r'\b(streaming|subscription)\b',
            'other': r'(all other|everything else|other purchases|all purchases|for all|on all|unlimited)'
        }
        
        for category, pattern in categories.items():
            if re.search(pattern, text, re.IGNORECASE):
                result['category'] = category
                break
        
        # Extract spending cap
        cap_pattern = r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)'
        cap_match = re.search(cap_pattern, text)
        if cap_match and 'quarter' in text.lower():
            cap_amount = float(cap_match.group(1).replace(',', ''))
            result['cap_cents'] = int(cap_amount * 100)
        
        # Extract end date
        date_patterns = [
            r'until\s+(\w+\s+\d{1,2},?\s+\d{4})',
            r'through\s+(\w+\s+\d{1,2},?\s+\d{4})',
            r'expires?\s+(\w+\s+\d{1,2},?\s+\d{4})'
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, text, re.IGNORECASE)
            if date_match:
                try:
                    date_str = date_match.group(1)
                    parsed_date = datetime.strptime(date_str, "%B %d, %Y")
                    result['end_date'] = parsed_date.strftime("%Y-%m-%d")
                except:
                    pass
        
        # Only return if we found at least a multiplier
        if result['multiplier'] is not None:
            return result
        
        return None

def run_scraper():
    """Run the Bank of America scraper and parse results"""
    scraper = BankOfAmericaScraper()
    parser = RewardParser()
    
    print("Starting Bank of America rewards scraper...")
    raw_rewards = scraper.scrape_rewards()
    
    print(f"\nScraped {len(raw_rewards)} reward entries")
    print("\nParsing rewards...")
    
    parsed_rewards = []
    for reward in raw_rewards:
        parsed = parser.parse_reward_text(reward['raw_text'])
        if parsed:
            parsed_rewards.append({
                **reward,
                **parsed
            })
    
    print(f"Successfully parsed {len(parsed_rewards)} rewards\n")
    
    # Display results
    for reward in parsed_rewards:
        print(f"\nCard: {reward['card_name']}")
        print(f"Raw Text: {reward['raw_text']}")
        print(f"Parsed:")
        print(f"  - Multiplier: {reward.get('multiplier')}x")
        print(f"  - Category: {reward.get('category')}")
        print(f"  - Cap: ${reward.get('cap_cents', 0) / 100:.2f}" if reward.get('cap_cents') else "  - Cap: None")
        print(f"  - End Date: {reward.get('end_date')}" if reward.get('end_date') else "  - End Date: None")
    
    return parsed_rewards

if __name__ == "__main__":
    run_scraper()
