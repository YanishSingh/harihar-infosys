/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  me as apiMe,
  logout as apiLogout,
} from '../api/auth';
import type { User, LoginPayload, RegisterPayload } from '../api/auth';
import api from '../utils/axiosConfig'; // Needed for token attach below

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (creds: LoginPayload) => Promise<{ user: User }>;
  register: (creds: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({
    user: {
      _id: '',
      name: '',
      email: '',
      role: 'Admin',
      phone: '',
    }
  }),
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure axios always sends the token if present
  function setAxiosAuthToken(token?: string | null) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // On mount, restore token from localStorage if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAxiosAuthToken(token);

    apiMe()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds: LoginPayload): Promise<{ user: User }> => {
    const result = await apiLogin(creds); // will throw if response is invalid
    if (!result || !result.user) {
      throw new Error('Login failed: Invalid server response');
    }
    // Save token for future requests
    if (result.user.token) {
      localStorage.setItem('token', result.user.token);
      setAxiosAuthToken(result.user.token);
    }
    setUser(result.user);
    return result;
  };

  const register = async (creds: RegisterPayload): Promise<void> => {
    await apiRegister(creds);
    // Do NOT auto-login on register
  };

  const logout = async (): Promise<void> => {
    await apiLogout();
    localStorage.removeItem('token');
    setAxiosAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
