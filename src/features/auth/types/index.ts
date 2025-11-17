// Base interfaces for permissions and roles
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface Store {
  id: number;
  name: string;
  // Add other store properties as needed
}

export interface UserSummary {
  total_stores: number;
  total_roles: number;
  total_permissions: number;
  manageable_users_count: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  global_roles: Role[];
  global_permissions: Permission[];
  all_permissions: Permission[];
  stores: Store[];
  summary: UserSummary;
}

// Permissions and roles storage structure
export interface PermissionsAndRolesData {
  cached_at: string;
  expires_at: string;
  all_permissions: Permission[];
  global_roles: Role[];
  global_permissions: Permission[];
  roles_permissions: Permission[];
  stores: Store[];
  summary: UserSummary;
}

// Auth state interface - UPDATED (removed refreshToken)
export interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  roles: string[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// Request interfaces

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  password_confirmation: string;
  otp: string;
}

// Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}


export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface RefreshTokenResponse {
  token: string;
  token_type: string;
}

export interface UserProfileResponse {
  user: User;
}

// Validation error interface
export interface ValidationError {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

// Error response interface
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: {
    [key: string]: string[];
  };
}

// Token storage interface - UPDATED (removed refreshToken)
export interface TokenData {
  token: string | null;
}

// Auth operation types for better type safety
export type AuthOperation = 
  | 'login'
  | 'forgotPassword'
  | 'resetPassword'
  | 'getUserProfile'
  | 'refreshToken'
  | 'logout';

// Permission check types
export type PermissionCheckType = 'any' | 'all';
export type RoleCheckType = 'any' | 'all';
