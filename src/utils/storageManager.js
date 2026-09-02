/**
 * Storage Manager - Handles localStorage/sessionStorage with fallback for incognito mode
 * Provides a unified interface for storing and retrieving data regardless of browser restrictions
 */

class StorageManager {
  constructor() {
    this.memoryStorage = new Map();
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.isSessionStorageAvailable = this.checkSessionStorageAvailability();
  }

  checkLocalStorageAvailability() {
    if (typeof window === 'undefined') return false;

    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkSessionStorageAvailability() {
    if (typeof window === 'undefined') return false;

    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  setItem(key, value) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(key, stringValue);
        return true;
      } catch (e) {
        // console.warn('localStorage failed, falling back to sessionStorage:', e);
      }
    }

    if (this.isSessionStorageAvailable) {
      try {
        sessionStorage.setItem(key, stringValue);
        return true;
      } catch (e) {
        // console.warn('sessionStorage failed, falling back to memory storage:', e);
      }
    }

    // Fallback to in-memory storage
    this.memoryStorage.set(key, stringValue);
    return true;
  }

  getItem(key) {
    if (this.isLocalStorageAvailable) {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) return value;
      } catch (e) {
        // console.warn('localStorage failed, trying sessionStorage:', e);
      }
    }

    if (this.isSessionStorageAvailable) {
      try {
        const value = sessionStorage.getItem(key);
        if (value !== null) return value;
      } catch (e) {
        // console.warn('sessionStorage failed, trying memory storage:', e);
      }
    }

    // Fallback to in-memory storage
    return this.memoryStorage.get(key) || null;
  }

  removeItem(key) {
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // console.warn('localStorage removeItem failed:', e);
      }
    }

    if (this.isSessionStorageAvailable) {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        // console.warn('sessionStorage removeItem failed:', e);
      }
    }

    // Always remove from memory storage
    this.memoryStorage.delete(key);
  }

  clear() {
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.clear();
      } catch (e) {
        // console.warn('localStorage clear failed:', e);
      }
    }

    if (this.isSessionStorageAvailable) {
      try {
        sessionStorage.clear();
      } catch (e) {
        // console.warn('sessionStorage clear failed:', e);
      }
    }

    // Always clear memory storage
    this.memoryStorage.clear();
  }

  // Get parsed JSON value
  getParsedItem(key) {
    const value = this.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch (e) {
      // console.warn('Failed to parse stored value:', e);
      return value; // Return as string if parsing fails
    }
  }

  // Check if storage is available
  isStorageAvailable() {
    return this.isLocalStorageAvailable || this.isSessionStorageAvailable;
  }

  // Get storage info for debugging
  getStorageInfo() {
    return {
      localStorage: this.isLocalStorageAvailable,
      sessionStorage: this.isSessionStorageAvailable,
      memoryStorage: true,
      memoryStorageSize: this.memoryStorage.size
    };
  }
}

// Create singleton instance
const storageManager = new StorageManager();

export default storageManager;
