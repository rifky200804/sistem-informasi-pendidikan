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
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/signup', data);
  },

  async logout(): Promise<void> {
    return api.post<void>('/auth/logout', {});
  },

  async getCurrentUser(token: string): Promise<User> {
    return api.get<User>('/auth/me');
  },
};
