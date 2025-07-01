/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  me as apiMe,
  logout as apiLogout,
  User,
  LoginPayload,
  RegisterPayload
} from '../api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  // login now returns the User so callers can inspect .role immediately
  login: (creds: LoginPayload) => Promise<User>;
  register: (creds: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  // default stub returns dummy user shape—won’t actually be called
  login: async () =>
    ({ _id: '', name: '', email: '', role: 'Admin' } as User),
  register: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, fetch current user
  useEffect(() => {
    apiMe()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Return the user so callers (e.g. Login.tsx) can redirect on role
  const login = async (creds: LoginPayload): Promise<User> => {
    const { user } = await apiLogin(creds);
    setUser(user);
    return user;
  };

  const register = async (creds: RegisterPayload) => {
    const { user } = await apiRegister(creds);
    setUser(user);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
