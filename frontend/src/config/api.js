/**
 * API Configuration
 * 
 * Android Emulator uses 10.0.2.2 to access localhost on the host machine
 * For real devices, replace with your computer's IP address
 */

import { Platform } from 'react-native';

// Computer's IP address on local network
const COMPUTER_IP = '10.19.255.41';

// Backend API base URL
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Use computer's actual IP for physical devices
    return `http://${COMPUTER_IP}:8000`;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000';
  }
  // Default fallback
  return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Users
  CREATE_USER: '/users',
  LIST_USERS: '/users',

  // Cards
  ADD_CARD: (userId) => `/users/${userId}/cards`,
  GET_USER_CARDS: (userId) => `/users/${userId}/cards`,

  // Card Rules
  ADD_CARD_RULE: (cardId) => `/cards/${cardId}/rules`,
  GET_CARD_RULES: (cardId) => `/cards/${cardId}/rules`,

  // Recommendations
  RECOMMEND_CARD: '/recommend',

  // MCC & Categories
  GET_MCC_CATEGORY: (mccCode) => `/mcc/${mccCode}`,
  LIST_CATEGORIES: '/categories',

  // Transactions
  CREATE_TRANSACTION: '/transactions',
  GET_USER_TRANSACTIONS: (userId) => `/transactions/${userId}`,
  GET_CARD_TRANSACTIONS: (cardId) => `/transactions/card/${cardId}`,

  // Analytics
  GET_USER_ANALYTICS: (userId) => `/analytics/${userId}`,
  GET_USER_SUMMARY: (userId) => `/summary/${userId}`,

  // Scraper
  RUN_SCRAPER: '/scraper/run',
  GET_SCRAPER_RESULTS: '/scraper/results',
};

// Default user ID (from seed data)
export const DEFAULT_USER_ID = 1;
