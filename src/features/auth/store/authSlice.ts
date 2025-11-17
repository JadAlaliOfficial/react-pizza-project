import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, isUnauthorizedError } from '../services/api';
import type {
  AuthState,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  LoginResponse,
} from '../types';
import { parseApiError } from '../utils/errorUtils';
import {
  saveToken,
  loadToken,
  clearToken,
} from '../utils/tokenStorage';
import {
  savePermissionsAndRoles,
  clearPermissionsAndRoles,
  loadPermissionsAndRoles,
} from '../utils/permissionAndRolesStorage';

// Type for thunk API configuration
interface ThunkApiConfig {
  rejectValue: string;
}

// Retry constants
const RETRY_MAX = 2;
const RETRY_COUNT_KEY = 'authRetryCount';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  permissions: [],
  roles: [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,
};

// Helper function to extract permissions and roles from user object
const extractPermissionsAndRoles = (user: User) => {
  const permissions = user.all_permissions?.map((p) => p.name) || [];
  const roles = user.global_roles?.map((r) => r.name) || [];
  return { permissions, roles };
};

// Helper function to store user data with tokens and permissions
const storeUserData = (user: User, token: string) => {
  // Save encrypted token
  saveToken(token);
  
  // Save unencrypted permissions and roles
  const permissionsData = {
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    all_permissions: user.all_permissions || [],
    global_roles: user.global_roles || [],
    global_permissions: user.global_permissions || [],
    roles_permissions: user.all_permissions || [],
    stores: user.stores || [],
    summary: user.summary,
  };
  
  savePermissionsAndRoles(permissionsData);
};

// Refresh token thunk
export const refreshToken = createAsyncThunk<
  string,
  void,
  ThunkApiConfig
>('auth/refreshToken', async (_, thunkAPI) => {
  try {
    const response = await authService.refreshToken();
    
    if (response.data.success && response.data.data?.token) {
      const newToken = response.data.data.token;
      
      // Update stored token
      saveToken(newToken);
      
      // Reset retry count
      localStorage.removeItem(RETRY_COUNT_KEY);
      
      return newToken;
    }
    
    return thunkAPI.rejectWithValue('Failed to refresh token');
  } catch (error) {
    return thunkAPI.rejectWithValue(parseApiError(error));
  }
});


// Login thunk
export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  ThunkApiConfig
>('auth/login', async (data, thunkAPI) => {
  try {
    const response = await authService.login(data);
    
    if (response.data.success && response.data.data?.user && response.data.data?.token) {
      const loginData = response.data.data;
      
      // Store user data with token
      storeUserData(loginData.user, loginData.token);
      
      return loginData;
    }
    
    return thunkAPI.rejectWithValue(response.data.message || 'Login failed');
  } catch (error) {
    return thunkAPI.rejectWithValue(parseApiError(error));
  }
});

// Forgot password thunk
export const forgotPassword = createAsyncThunk<
  void,
  ForgotPasswordRequest,
  ThunkApiConfig
>('auth/forgotPassword', async (data, thunkAPI) => {
  try {
    const response = await authService.forgotPassword(data);
    
    if (response.data.success) {
      return;
    }
    
    return thunkAPI.rejectWithValue(response.data.message || 'Forgot password failed');
  } catch (error) {
    return thunkAPI.rejectWithValue(parseApiError(error));
  }
});

// Reset password thunk
export const resetPassword = createAsyncThunk<
  void,
  ResetPasswordRequest,
  ThunkApiConfig
>('auth/resetPassword', async (data, thunkAPI) => {
  try {
    const response = await authService.resetPassword(data);
    
    if (response.data.success) {
      return;
    }
    
    return thunkAPI.rejectWithValue(response.data.message || 'Reset password failed');
  } catch (error) {
    return thunkAPI.rejectWithValue(parseApiError(error));
  }
});

// Get user profile thunk with retry logic
export const getUserProfile = createAsyncThunk<
  User,
  void,
  ThunkApiConfig
>('auth/getUserProfile', async (_, thunkAPI) => {
  let retryCount = parseInt(localStorage.getItem(RETRY_COUNT_KEY) || '0');
  
  const executeRequest = async (): Promise<User> => {
    try {
      const response = await authService.getUserProfile();
      
      if (response.data.success && response.data.data?.user) {
        localStorage.removeItem(RETRY_COUNT_KEY);
        return response.data.data.user;
      }
      
      throw new Error('Failed to load profile');
    } catch (error) {
      if (isUnauthorizedError(error) && retryCount < RETRY_MAX) {
        retryCount++;
        localStorage.setItem(RETRY_COUNT_KEY, retryCount.toString());
        
        const refreshResult = await thunkAPI.dispatch(refreshToken());
        
        if (refreshResult.meta.requestStatus === 'fulfilled') {
          return executeRequest();
        } else {
          thunkAPI.dispatch(logout());
          throw new Error('Session expired. Please login again.');
        }
      }
      
      if (retryCount >= RETRY_MAX && isUnauthorizedError(error)) {
        thunkAPI.dispatch(logout());
        throw new Error('Session expired. Please login again.');
      }
      
      throw error;
    }
  };
  
  try {
    return await executeRequest();
  } catch (error) {
    return thunkAPI.rejectWithValue(parseApiError(error));
  }
});

// Logout thunk - FIXED: Removed unused thunkAPI parameter
export const logout = createAsyncThunk<void, void, ThunkApiConfig>(
  'auth/logout',
  async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout API errors - we still want to clear local data
    }
    
    // Clear all stored data
    clearToken();
    clearPermissionsAndRoles();
    localStorage.removeItem(RETRY_COUNT_KEY);
    
    return;
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to initialize auth state from localStorage on app start
    initializeAuth: (state) => {
      const token = loadToken();
      const permissionsData = loadPermissionsAndRoles();
      
      if (token && permissionsData) {
        state.token = token;
        state.isAuthenticated = true;
        
        // Reconstruct user object from stored permissions data
        if (permissionsData.all_permissions || permissionsData.global_roles) {
          state.user = {
            id: 0, // Will be updated when getUserProfile is called
            name: '',
            email: '',
            email_verified_at: null,
            created_at: '',
            updated_at: '',
            global_roles: permissionsData.global_roles || [],
            global_permissions: permissionsData.global_permissions || [],
            all_permissions: permissionsData.all_permissions || [],
            stores: permissionsData.stores || [],
            summary: permissionsData.summary || {
              total_stores: 0,
              total_roles: 0,
              total_permissions: 0,
              manageable_users_count: 0,
            },
          };
          
          // Extract and set permissions and roles
          const { permissions, roles } = extractPermissionsAndRoles(state.user);
          state.permissions = permissions;
          state.roles = roles;
        }
      }
      
      // Mark auth as initialized regardless of whether we found stored data
      state.isInitialized = true;
    },
    
    // Clear error action
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        
        // Extract and set permissions and roles
        const { permissions, roles } = extractPermissionsAndRoles(action.payload.user);
        state.permissions = permissions;
        state.roles = roles;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
        state.isAuthenticated = false;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Forgot password failed';
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Reset password failed';
      })
      
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
        state.isAuthenticated = true;
        
        // Extract and set permissions and roles
        const { permissions, roles } = extractPermissionsAndRoles(action.payload);
        state.permissions = permissions;
        state.roles = roles;
        
        // Update stored permissions data
        const permissionsData = {
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          all_permissions: action.payload.all_permissions || [],
          global_roles: action.payload.global_roles || [],
          global_permissions: action.payload.global_permissions || [],
          roles_permissions: action.payload.all_permissions || [],
          stores: action.payload.stores || [],
          summary: action.payload.summary,
        };
        savePermissionsAndRoles(permissionsData);
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load profile';
      })
      
      // Refresh Token - FIXED: Added underscore to unused parameter
      .addCase(refreshToken.pending, (_state) => {
        // Don't set loading for refresh token as it should be transparent
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Clear auth state on refresh token failure
        Object.assign(state, initialState);
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        // Reset to initial state
        Object.assign(state, initialState);
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout API fails, clear local state
        Object.assign(state, initialState);
      });
  },
});

// Export actions
export const { initializeAuth, clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
