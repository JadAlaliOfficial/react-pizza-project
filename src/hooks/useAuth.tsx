import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AuthState } from '../types/authTypes.ts';
import type { UserWithRoles } from '../types/userTypes';
import { authService } from '../services/authService.ts';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<string | null>; // Returns error message or null for success
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const user = await authService.getUserProfile();
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('auth_token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data?.token && response.data?.user) {
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return null; // Success
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return response.message || 'Login failed';
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Check if it's a network error or server error
      if (error.response?.data?.message) {
        return error.response.data.message;
      } else if (error.response?.data?.success === false) {
        return error.response.data.message || 'Invalid credentials';
      } else {
        return 'Network error. Please check your connection.';
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<string | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (response.success) {
        return null; // Success
      } else {
        return response.message || 'Registration failed';
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (error.response?.data?.message) {
        return error.response.data.message;
      } else {
        return 'Registration failed. Please try again.';
      }
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const user: UserWithRoles = await authService.getUserProfile();
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
