import { api } from './api';
import { ApiResponse } from '../types/api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    // The actual data is nested inside response.data.data because:
    // response.data is the Axios body (ApiResponse structure)
    // response.data.data is the generic T (AuthResponse)
    const authData = response.data.data;
    
    if (authData.token) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }
    return authData;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optional: Call logout endpoint if exists
    // return api.post('/auth/logout', {}); 
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};
