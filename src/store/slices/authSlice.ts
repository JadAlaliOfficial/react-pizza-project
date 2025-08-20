import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../utils/tokenStorage';
import { cacheStorage } from '../../utils/cacheStorage';
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyEmailOtpRequest,
  ResendVerificationOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  UserCacheData,
} from '../../types/authTypes';

// Define the auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registrationStep: 'register' | 'verify' | 'completed';
  registrationEmail: string | null;
  isInitialized: boolean;
  // Cache-related state
  userCache: UserCacheData | null;
  isCacheValid: boolean;
  cacheExpiry: string | null;
}

// Helper function to extract cache data from user
const extractCacheData = (user: User): Omit<UserCacheData, 'cached_at' | 'expires_at'> => {
  return {
    global_roles: user.global_roles,
    roles_permissions: [], // Will be calculated in cacheStorage
    global_permissions: user.global_permissions,
    all_permissions: user.all_permissions,
    stores: user.stores,
    summary: user.summary,
  };
};

// Initial state - check for existing token and cache
const getInitialToken = (): string | null => {
  return tokenStorage.getToken();
};

const getInitialCache = (): { userCache: UserCacheData | null; isCacheValid: boolean; cacheExpiry: string | null } => {
  const cachedData = cacheStorage.getCacheData();
  const isValid = cacheStorage.isCacheValid();
  const expiry = cacheStorage.getCacheExpiry();
  
  return {
    userCache: cachedData,
    isCacheValid: isValid,
    cacheExpiry: expiry,
  };
};

const initialToken = getInitialToken();
const initialCacheData = getInitialCache();

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isLoading: false,
  isAuthenticated: !!initialToken,
  error: null,
  registrationStep: 'register',
  registrationEmail: null,
  isInitialized: false,
  userCache: initialCacheData.userCache,
  isCacheValid: initialCacheData.isCacheValid,
  cacheExpiry: initialCacheData.cacheExpiry,
};

// FIXED: Simplified initialization that doesn't cause loops
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        // No token, clear everything
        cacheStorage.clearCacheData();
        return { token: null, user: null, fromCache: false };
      }

      // Check if we have valid cached data
      const cachedData = cacheStorage.getCacheData();
      if (cachedData && cacheStorage.isCacheValid()) {
        // Use cached data - create basic user object with cached info
        const user: User = {
          id: cachedData.summary?.manageable_users_count || 0, // Fallback ID
          name: '', // Will be populated when we fetch fresh data
          email: '',
          email_verified_at: '',
          created_at: '',
          updated_at: '',
          global_roles: cachedData.global_roles,
          global_permissions: cachedData.global_permissions,
          all_permissions: cachedData.all_permissions,
          stores: cachedData.stores,
          summary: cachedData.summary,
        };
        return { token, user, fromCache: true };
      }

      // No valid cache, but we have token - we'll fetch data later
      return { token, user: null, fromCache: false };
    } catch (error: any) {
      // Clear everything on error
      tokenStorage.removeToken();
      cacheStorage.clearCacheData();
      return { token: null, user: null, fromCache: false };
    }
  }
);

// FIXED: Separate thunk for fetching fresh user data
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getUserProfile();
      // Cache the new data
      cacheStorage.setCacheData(extractCacheData(user));
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

// New async thunk to refresh cache data
export const refreshCacheData = createAsyncThunk(
  'auth/refreshCacheData',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getUserProfile();
      // Update cache
      cacheStorage.setCacheData(extractCacheData(user));
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh cache data');
    }
  }
);

// Enhanced registerUser thunk with proper error handling
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response: RegisterResponse = await authService.register(data);
      
      if (!response.success) {
        // Return the entire error response for processing by the error handler
        return rejectWithValue(response);
      }
      
      return { response, email: data.email };
    } catch (error: any) {
      // Handle unexpected errors
      console.error('Registration thunk error:', error);
      return rejectWithValue({
        success: false,
        message: 'An unexpected error occurred during registration',
        error: error.message || 'Registration failed',
      });
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmailOtp',
  async (data: VerifyEmailOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmailOtp(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Email verification failed');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Email verification failed');
    }
  }
);

export const resendVerificationOtp = createAsyncThunk(
  'auth/resendVerificationOtp',
  async (data: ResendVerificationOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerificationOtp(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to resend verification code');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to resend verification code');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Login failed');
      }
      // Cache user data if user is present in response
      if (response.data?.user) {
        cacheStorage.setCacheData(extractCacheData(response.data.user));
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to send password reset email');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send password reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Password reset failed');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getUserProfile();
      // Update cache with fresh data
      cacheStorage.setCacheData(extractCacheData(user));
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user profile');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      // Clear cache on logout
      cacheStorage.clearCacheData();
      return null;
    } catch (error: any) {
      // Even if logout fails on server, we still want to clear local state and cache
      cacheStorage.clearCacheData();
      return null;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      if (!response.success) {
        return rejectWithValue(response.message || 'Token refresh failed');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRegistrationStep: (state, action: PayloadAction<'register' | 'verify' | 'completed'>) => {
      state.registrationStep = action.payload;
    },
    setRegistrationEmail: (state, action: PayloadAction<string | null>) => {
      state.registrationEmail = action.payload;
    },
    resetRegistration: (state) => {
      state.registrationStep = 'register';
      state.registrationEmail = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.userCache = null;
      state.isCacheValid = false;
      state.cacheExpiry = null;
      tokenStorage.removeToken();
      cacheStorage.clearCacheData();
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      tokenStorage.setToken(action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.userCache = null;
      state.isCacheValid = false;
      state.cacheExpiry = null;
      tokenStorage.removeToken();
      cacheStorage.clearCacheData();
    },
    // New cache-related actions
    extendCacheExpiry: (state) => {
      cacheStorage.extendCacheExpiry();
      state.cacheExpiry = cacheStorage.getCacheExpiry();
    },
    clearCache: (state) => {
      cacheStorage.clearCacheData();
      state.userCache = null;
      state.isCacheValid = false;
      state.cacheExpiry = null;
    },
    updateCacheValidity: (state) => {
      state.isCacheValid = cacheStorage.isCacheValid();
      if (!state.isCacheValid) {
        state.userCache = null;
        state.cacheExpiry = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.token;
        
        // Update cache state
        if (action.payload.fromCache) {
          const cachedData = cacheStorage.getCacheData();
          state.userCache = cachedData;
          state.isCacheValid = cacheStorage.isCacheValid();
          state.cacheExpiry = cacheStorage.getCacheExpiry();
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.userCache = null;
        state.isCacheValid = false;
        state.cacheExpiry = null;
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        const cachedData = cacheStorage.getCacheData();
        state.userCache = cachedData;
        state.isCacheValid = cacheStorage.isCacheValid();
        state.cacheExpiry = cacheStorage.getCacheExpiry();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If fetching profile fails, user might not be authenticated
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.userCache = null;
        state.isCacheValid = false;
        state.cacheExpiry = null;
        tokenStorage.removeToken();
        cacheStorage.clearCacheData();
      })

      // Refresh Cache Data
      .addCase(refreshCacheData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshCacheData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        const cachedData = cacheStorage.getCacheData();
        state.userCache = cachedData;
        state.isCacheValid = cacheStorage.isCacheValid();
        state.cacheExpiry = cacheStorage.getCacheExpiry();
      })
      .addCase(refreshCacheData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register - Enhanced with proper error handling
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationStep = 'verify';
        state.registrationEmail = action.payload.email;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error here anymore - let the component handle the structured error
        // The component will handle the error response using the error handler
        state.error = null;
      })
      
      // Verify Email OTP
      .addCase(verifyEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationStep = 'completed';
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Resend Verification OTP
      .addCase(resendVerificationOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendVerificationOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user || null;
        state.token = action.payload.data?.token || null;
        if (action.payload.data?.token) {
          tokenStorage.setToken(action.payload.data.token);
        }
        
        // Update cache state
        if (action.payload.data?.user) {
          const cachedData = cacheStorage.getCacheData();
          state.userCache = cachedData;
          state.isCacheValid = cacheStorage.isCacheValid();
          state.cacheExpiry = cacheStorage.getCacheExpiry();
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        
        // Update cache state
        const cachedData = cacheStorage.getCacheData();
        state.userCache = cachedData;
        state.isCacheValid = cacheStorage.isCacheValid();
        state.cacheExpiry = cacheStorage.getCacheExpiry();
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If getting profile fails, user might not be authenticated
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.userCache = null;
        state.isCacheValid = false;
        state.cacheExpiry = null;
        tokenStorage.removeToken();
        cacheStorage.clearCacheData();
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.userCache = null;
        state.isCacheValid = false;
        state.cacheExpiry = null;
        tokenStorage.removeToken();
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear local state and cache
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.userCache = null;
        state.isCacheValid = false;
        state.cacheExpiry = null;
        tokenStorage.removeToken();
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.data?.token || null;
        state.isAuthenticated = true;
        if (action.payload.data?.token) {
          tokenStorage.setToken(action.payload.data.token);
        }
        // Extend cache expiry on successful token refresh
        if (state.userCache) {
          cacheStorage.extendCacheExpiry();
          state.cacheExpiry = cacheStorage.getCacheExpiry();
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.userCache = null;
        state.isCacheValid = false;
        state.cacheExpiry = null;
        tokenStorage.removeToken();
        cacheStorage.clearCacheData();
      });
  },
});

export const {
  clearError,
  setRegistrationStep,
  setRegistrationEmail,
  resetRegistration,
  logout,
  setToken,
  clearToken,
  extendCacheExpiry,
  clearCache,
  updateCacheValidity,
} = authSlice.actions;

export default authSlice.reducer;
