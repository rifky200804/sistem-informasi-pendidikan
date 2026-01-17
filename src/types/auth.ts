export interface User {
  id: number | string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  role?: User['role'];
}

export interface AuthResponse {
  user: User;
  token: string;
}
