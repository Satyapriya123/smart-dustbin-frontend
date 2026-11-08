export const safeStorage = {
  getItem: (key) => {
    try { return safeStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key, value) => {
    try { safeStorage.setItem(key, value); } catch (e) {}
  },
  removeItem: (key) => {
    try { safeStorage.removeItem(key); } catch (e) {}
  }
};
