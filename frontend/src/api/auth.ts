/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../utils/axiosConfig';

export interface Branch {
  _id: string;
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Company' | 'Technician';
  phone: string;
  companyName?: string;
  vatOrPan?: string;
  branches?: Branch[];
  isApproved?: boolean;
  token?: string; 
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BranchPayload {
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}

export interface RegisterPayload {
  role: 'Company';
  name: string;
  email: string;
  phone: string;
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
}

export interface RegisterResponse {
  message: string;
}

// Universal response parser: supports .data, .data.data, or direct object
function getDataWithUser(res: any): AuthResponse {
  let dataPart = res?.data && typeof res.data === 'object' ? res.data : res;
  if (dataPart && dataPart.data && typeof dataPart.data === 'object') {
    dataPart = dataPart.data;
  }
  if (!dataPart || typeof dataPart !== 'object' || !dataPart.user) {
    console.error('DEBUG LOGIN RESPONSE:', res);
    throw new Error('Invalid server response');
  }
  return dataPart as AuthResponse;
}

function getDataWithMessage(res: any): RegisterResponse {
  let dataPart = res?.data && typeof res.data === 'object' ? res.data : res;
  if (dataPart && dataPart.data && typeof dataPart.data === 'object') {
    dataPart = dataPart.data;
  }
  if (!dataPart || typeof dataPart !== 'object' || !dataPart.message) {
    console.error('DEBUG REGISTER RESPONSE:', res);
    throw new Error('Invalid server response');
  }
  return dataPart as RegisterResponse;
}

export function login(data: LoginPayload): Promise<AuthResponse> {
  return api
    .post<AuthResponse>('/auth/login', data)
    .then(getDataWithUser);
}

export function register(data: RegisterPayload): Promise<RegisterResponse> {
  return api
    .post<RegisterResponse>('/auth/register', data)
    .then(getDataWithMessage);
}

export function me(): Promise<AuthResponse> {
  return api
    .get<AuthResponse>('/auth/me')
    .then(getDataWithUser);
}

export function logout(): Promise<void> {
  return api.post('/auth/logout').then(() => {});
}

export interface ChangePasswordPayload {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function changePassword(data: ChangePasswordPayload) {
  return api.post('/users/change-password', data);
}
