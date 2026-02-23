// API Service for backend communication
// In development, Vite proxy handles /api requests
// In production, use VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get headers with auth token
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(!options.skipAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = (data.errors?.length ? data.errors.map(e => e.msg).join(', ') : null)
          || data.message
          || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (response.success && response.data) {
      // Handle both 'accessToken' and 'token' for backward compatibility
      const token = response.data.accessToken || response.data.token;
      if (token) {
        this.setToken(token);
      }
      
      // Store refresh token if available
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response;
  }

  async register(tenantData) {
    const response = await this.request('/tenants/register', {
      method: 'POST',
      body: JSON.stringify(tenantData),
      skipAuth: true,
    });

    if (response.success && response.data) {
      // Registration returns 'token', login returns 'accessToken'
      const token = response.data.token || response.data.accessToken;
      if (token) {
        this.setToken(token);
      }
      
      // Store refresh token if available
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.setToken(null);
    localStorage.removeItem('refreshToken');
  }

  // Tenant endpoints
  async getTenant() {
    return this.request('/tenants/me');
  }

  async getOnboardingStatus() {
    return this.request('/tenants/onboarding/status');
  }

  async updateCompanyDetails(companyData) {
    return this.request('/tenants/onboarding/company', {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async updateChatbotConfig(chatbotData) {
    return this.request('/tenants/onboarding/chatbot', {
      method: 'PUT',
      body: JSON.stringify(chatbotData),
    });
  }

  async completeOnboarding() {
    return this.request('/tenants/onboarding/complete', {
      method: 'POST',
    });
  }

  // Knowledge endpoints
  async getKnowledgePages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/knowledge/pages${queryString ? `?${queryString}` : ''}`);
  }

  async getKnowledgePage(id) {
    return this.request(`/knowledge/pages/${id}`);
  }

  async createKnowledgePage(pageData) {
    return this.request('/knowledge/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async updateKnowledgePage(id, pageData) {
    return this.request(`/knowledge/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  }

  async deleteKnowledgePage(id) {
    return this.request(`/knowledge/pages/${id}`, {
      method: 'DELETE',
    });
  }

  async getKnowledgeTemplates() {
    return this.request('/knowledge/templates');
  }

  async getKnowledgeTemplate(id) {
    return this.request(`/knowledge/templates/${id}`);
  }

  async getCategories() {
    return this.request('/knowledge/categories');
  }

  // API Key Management endpoints
  async getApiKeys() {
    return this.request('/tenants/api-keys');
  }

  async regenerateApiKey() {
    return this.request('/tenants/api-keys/regenerate-key', {
      method: 'POST',
    });
  }

  async regenerateApiSecret() {
    return this.request('/tenants/api-keys/regenerate-secret', {
      method: 'POST',
    });
  }

  async regenerateBoth() {
    return this.request('/tenants/api-keys/regenerate-both', {
      method: 'POST',
    });
  }

  // Subscription endpoints
  async getSubscription() {
    return this.request('/tenants/subscription');
  }

  async updateSubscription({ plan, durationMonths }) {
    return this.request('/tenants/subscription', {
      method: 'PUT',
      body: JSON.stringify({ plan, durationMonths }),
    });
  }
}

export default new ApiService();
