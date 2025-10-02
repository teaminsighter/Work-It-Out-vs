'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'viewer';
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'INIT_COMPLETE' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'viewer';
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent flicker
  error: null,
  token: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false, // Set loading false when logging out
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'INIT_COMPLETE':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Mock users database (replace with real API)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@localpower.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-09-26T09:00:00Z'
  },
  {
    id: '2', 
    email: 'manager@localpower.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-09-25T14:30:00Z'
  }
];

// Mock passwords (in production, these would be hashed)
const mockPasswords: { [key: string]: string } = {
  'admin@localpower.com': 'admin123',
  'manager@localpower.com': 'manager123'
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          // Verify token is not expired (mock check)
          const tokenData = JSON.parse(atob(token.split('.')[1])); // Decode JWT-like token
          if (tokenData.exp > Date.now() / 1000) {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          } else {
            // Token expired
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            dispatch({ type: 'INIT_COMPLETE' });
          }
        } else {
          // No existing session
          dispatch({ type: 'INIT_COMPLETE' });
        }
      } catch (error) {
        // Error during session check
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'INIT_COMPLETE' });
      }
    };

    // Add small delay to prevent flash
    const timer = setTimeout(checkExistingSession, 100);
    return () => clearTimeout(timer);
  }, []);

  // Mock JWT token generation
  const generateMockToken = (user: User, rememberMe: boolean = false): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const expirationTime = rememberMe 
      ? Date.now() / 1000 + (30 * 24 * 60 * 60) // 30 days
      : Date.now() / 1000 + (24 * 60 * 60); // 24 hours
    
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: expirationTime,
      iat: Date.now() / 1000
    };
    
    // Mock token (in production, use proper JWT library)
    return btoa(JSON.stringify(header)) + '.' + 
           btoa(JSON.stringify(payload)) + '.' + 
           btoa('mock-signature');
  };

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user
      const user = mockUsers.find(u => u.email === email && u.isActive);
      if (!user || mockPasswords[email] !== password) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date().toISOString();

      // Generate token
      const token = generateMockToken(user, rememberMe);

      // Store in localStorage (in production, use httpOnly cookies)
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      if (mockUsers.find(u => u.email === userData.email)) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'viewer',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Add to mock database
      mockUsers.push(newUser);
      mockPasswords[userData.email] = userData.password;

      // Generate token
      const token = generateMockToken(newUser);

      // Store in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: newUser, token } });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Registration failed' });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!state.user) throw new Error('No user logged in');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = { ...state.user, ...userData };
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === state.user!.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
      }

      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('No user found with this email address');
      }

      // In production, send email with reset link
    } catch (error) {
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!state.user) throw new Error('No user logged in');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify current password
      if (mockPasswords[state.user.email] !== currentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      mockPasswords[state.user.email] = newPassword;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;