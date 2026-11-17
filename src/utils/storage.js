export const safeStorage = {
    setItem: (key, value) => {
        try { window.localStorage.setItem(key, value); } 
        catch (e) { console.warn("Storage blocked by context:", e); }
    },
    getItem: (key) => {
        try { return window.localStorage.getItem(key); } 
        catch (e) { return null; }
    },
    removeItem: (key) => {
        try { window.localStorage.removeItem(key); } 
        catch (e) {}
    },
    clear: () => {
        try { 
            window.localStorage.clear(); 
            window.sessionStorage.clear(); 
        } catch (e) { console.warn("Storage clear blocked."); }
    }
};