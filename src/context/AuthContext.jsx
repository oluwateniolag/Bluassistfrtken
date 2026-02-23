import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = apiService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        apiService.setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        setUser(userData);
        
        // Store refresh token if available
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Refresh user data to get latest onboarding status
        await checkAuth();
        
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (tenantData) => {
    try {
      setError(null);
      const response = await apiService.register(tenantData);
      
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        setUser(userData);
        
        // Store refresh token if available
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Refresh user data to get latest onboarding status
        await checkAuth();
        
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
