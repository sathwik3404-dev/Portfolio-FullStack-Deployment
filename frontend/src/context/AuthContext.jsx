import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '../api/apiClient';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify existing token on app mount
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userData = await apiClient.getProfile(storedToken);
        if (isMounted) {
          setUser(userData);
          setToken(storedToken);
          setError(null);
        }
      } catch (err) {
        // Token invalid or expired - clear local session
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await apiClient.login({ username, password });
      const authToken = data.token;
      const authUser = data.user;

      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);
      setUser(authUser);
      return authUser;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setError(null);
    try {
      const data = await apiClient.register({ username, email, password });
      const authToken = data.token;
      const authUser = data.user;

      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);
      setUser(authUser);
      return authUser;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed. Please check your details.';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        // Ignore API logout failures during cleanup
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    token,
    user,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
