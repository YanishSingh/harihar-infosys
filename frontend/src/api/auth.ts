// src/api/auth.ts
import { AxiosResponse } from 'axios';
import api from '../utils/axiosConfig';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Company';
  // other returned user fields...
}

// payload for frontend login
export interface LoginPayload {
  email: string;
  password: string;
}

// define a branch sub‐payload to match your form
export interface BranchPayload {
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}

// payload for frontend register
export interface RegisterPayload {
  role: 'Company';              // fixed to "Company" in UI
  name: string;                 // personal name
  email: string;                // personal email
  phone: string;                // personal phone
  password: string;
  confirmPassword: string;
  companyName: string;
  companyEmail: string;
  businessType: string;
  vatOrPan: string;
  branches: BranchPayload[];
}

export interface AuthResponse {
  user: User;
  // token or other fields if any
}

export function login(data: LoginPayload): Promise<AuthResponse> {
  return api
    .post<AuthResponse>('/auth/login', data)
    .then((res: AxiosResponse<AuthResponse>) => res.data);
}

export function register(data: RegisterPayload): Promise<AuthResponse> {
  return api
    .post<AuthResponse>('/auth/register', data)
    .then((res: AxiosResponse<AuthResponse>) => res.data);
}

export function me(): Promise<AuthResponse> {
  return api
    .get<AuthResponse>('/auth/me')
    .then((res: AxiosResponse<AuthResponse>) => res.data);
}

export function logout(): Promise<void> {
  return api.post('/auth/logout').then(() => {});
}
