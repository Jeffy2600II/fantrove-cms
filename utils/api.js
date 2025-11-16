/**
 * API Client for Vercel environment
 */

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_API_URL or current origin
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  // Server-side: use direct URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const apiClient = {
  async get(endpoint) {
    try {
      const url = `${getApiUrl()}/api${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  
  async post(endpoint, data) {
    try {
      const url = `${getApiUrl()}/api${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },
  
  async delete(endpoint, data) {
    try {
      const url = `${getApiUrl()}/api${endpoint}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};