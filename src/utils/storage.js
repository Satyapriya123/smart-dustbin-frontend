// Fallback memory store in case browser blocks localStorage
const memoryStore = {};

export const safeStorage = {
  getItem: (key) => {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch (e) {
      // Ignored: browser storage blocked
    }
    return memoryStore[key] || null;
  },
  setItem: (key, value) => {
    memoryStore[key] = value;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignored: browser storage blocked
    }
  },
  removeItem: (key) => {
    delete memoryStore[key];
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignored: browser storage blocked
    }
  }
};
