import { useState } from 'react';
import { authService, LoginCredentials, SignupData, User } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      toast({
        title: 'Login berhasil',
        description: `Selamat datang, ${response.user.name}!`,
      });
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Login gagal',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(data);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      toast({
        title: 'Registrasi berhasil',
        description: `Selamat datang, ${response.user.name}!`,
      });
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Registrasi gagal',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast({
        title: 'Logout berhasil',
        description: 'Sampai jumpa!',
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Logout gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    setLoading(true);
    setError(null);
    try {
      const user = await authService.getCurrentUser(token);
      setUser(user);
      return user;
    } catch (err) {
      const error = err as Error;
      setError(error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    getCurrentUser,
  };
}
