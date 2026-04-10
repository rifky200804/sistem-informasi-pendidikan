import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dummy data for simulation
const DUMMY_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Regular User', email: 'user@example.com', password: 'user123', role: 'user' },
];

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post<void>('/auth/logout', {});
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
