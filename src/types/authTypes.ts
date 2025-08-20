// Role and Permission interfaces
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
}

export interface UserSummary {
  total_stores: number;
  total_roles: number;
  total_permissions: number;
  manageable_users_count: number;
}

export interface Store {
  id: number;
  name: string;
  // Add other store properties based on your requirements
}

// New interface for cached user data
export interface UserCacheData {
  global_roles: Role[];
  roles_permissions: Permission[]; // flattened permissions from roles
  global_permissions: Permission[];
  all_permissions: Permission[];
  stores: Store[];
  summary: UserSummary;
  cached_at: string; // timestamp when cached
  expires_at: string; // expiry timestamp
}

// Registration-specific interfaces
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Validation error structure for registration
export interface RegisterValidationErrors {
  name?: string[];
  email?: string[];
  password?: string[];
  password_confirmation?: string[];
}

// Registration error response structure
export interface RegisterErrorResponse {
  success: false;
  message: string;
  errors?: RegisterValidationErrors;
  error?: string; // For single error messages like "The email has already been taken."
}

// Registration success response structure
export interface RegisterSuccessResponse {
  success: true;
  message: string;
  data?: {
    user?: Partial<User>;
    [key: string]: any;
  };
}

// Combined registration response type
export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

// Other auth request interfaces
export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface ResendVerificationOtpRequest {
  email: string;
}

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

// Generic auth response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    token_type?: string;
    user?: User;
    [key: string]: any;
  };
  errors?: Record<string, string[]>;
  error?: string;
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  global_roles: Role[];
  global_permissions: Permission[];
  all_permissions: Permission[];
  stores: Store[];
  summary: UserSummary;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // New cache-related state
  userCache: UserCacheData | null;
  isCacheValid: boolean;
  cacheExpiry: string | null;
}

// Registration step types - using string literals instead of enum
export type RegistrationStep = 'register' | 'verify' | 'completed';

// Error severity levels for better error categorization
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Structured error interface for better error handling
export interface StructuredError {
  field?: string;
  message: string;
  severity: ErrorSeverity;
  code?: string;
}

// Registration form validation state
export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  general?: string;
}

// Registration form state
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Helper type for API error checking
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
  status?: number;
}

// Helper type to check if response is an error
export const isApiError = (response: any): response is ApiError => {
  return response && response.success === false;
};

// Helper type to check if response is a registration error
export const isRegisterError = (response: any): response is RegisterErrorResponse => {
  return response && response.success === false;
};

// Helper type to check if response has validation errors
export const hasValidationErrors = (response: any): response is { errors: Record<string, string[]> } => {
  return response && response.errors && typeof response.errors === 'object';
};
