// SANMATI CONSTRUCTIONS ERP - Frontend API Client
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API GET ${endpoint} error:`, err.message);
      return { success: false, error: err.message };
    }
  },

  async post(endpoint, data) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API POST ${endpoint} error:`, err.message);
      return { success: false, error: err.message };
    }
  }
};
