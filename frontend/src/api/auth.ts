// src/api/auth.ts
import api from '../utils/axiosConfig';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Company';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

// Each of these returns the { user: … } object directly.
export function login(data: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', data);
}

export function register(data: RegisterPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', data);
}

export function me(): Promise<AuthResponse> {
  return api.get<AuthResponse>('/auth/me');
}

export function logout(): Promise<void> {
  return api.post('/auth/logout').then(() => {});
}
