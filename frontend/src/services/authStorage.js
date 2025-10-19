/**
 * Authentication Storage Service
 * Simple in-memory storage for current user session
 * In production, use AsyncStorage or SecureStore
 */

let currentUser = null;

export const authStorage = {
  setUser: (user) => {
    currentUser = user;
    console.log('User logged in:', user);
  },

  getUser: () => {
    return currentUser;
  },

  getUserId: () => {
    return currentUser?.id || null;
  },

  clearUser: () => {
    currentUser = null;
    console.log('User logged out');
  },

  isLoggedIn: () => {
    return currentUser !== null;
  }
};
