import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  initializeAuth,
  registerUser,
  verifyEmailOtp,
  resendVerificationOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  logoutUser,
  refreshToken,
  refreshCacheData,
  fetchUserProfile,
  clearError,
  setRegistrationStep,
  setRegistrationEmail,
  resetRegistration,
  logout as logoutAction,
  setToken,
  clearToken,
  extendCacheExpiry,
  clearCache,
  updateCacheValidity,
} from '../store/slices/authSlice';
import type {
  RegisterRequest,
  RegisterResponse,
  RegisterErrorResponse,
  VerifyEmailOtpRequest,
  ResendVerificationOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/authTypes';

/**
 * Enhanced custom hook that provides Redux-based authentication functionality
 * with encrypted token storage, cached user data, automatic initialization,
 * and improved error handling for registration
 */
export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    registrationStep,
    registrationEmail,
    isInitialized,
    userCache,
    isCacheValid,
    cacheExpiry,
  } = useAppSelector((state) => state.auth);

  // Initialize auth state from encrypted storage on first load
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Auth actions with enhanced error handling for registration
  const register = async (data: RegisterRequest) => {
    const result = await dispatch(registerUser(data));
    
    // Return the complete result including any error response for component handling
    if (result.type.endsWith('/rejected')) {
      // The payload contains the structured error response from the API
      return {
        ...result,
        errorResponse: result.payload as RegisterErrorResponse,
      };
    }
    
    return result;
  };

  const verifyEmail = async (data: VerifyEmailOtpRequest) => {
    return dispatch(verifyEmailOtp(data));
  };

  const resendOtp = async (data: ResendVerificationOtpRequest) => {
    return dispatch(resendVerificationOtp(data));
  };

  const login = async (data: LoginRequest) => {
    return dispatch(loginUser(data));
  };

  const forgotPass = async (data: ForgotPasswordRequest) => {
    return dispatch(forgotPassword(data));
  };

  const resetPass = async (data: ResetPasswordRequest) => {
    return dispatch(resetPassword(data));
  };

  const getProfile = async () => {
    return dispatch(getUserProfile());
  };

  // New action for fetching user profile during initialization
  const fetchProfile = async () => {
    return dispatch(fetchUserProfile());
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const refresh = async () => {
    return dispatch(refreshToken());
  };

  // Cache-related actions
  const refreshCache = async () => {
    return dispatch(refreshCacheData());
  };

  const extendCache = () => {
    dispatch(extendCacheExpiry());
  };

  const clearCacheData = () => {
    dispatch(clearCache());
  };

  // Utility actions
  const clearAuthError = () => {
    dispatch(clearError());
  };

  const setRegStep = (step: 'register' | 'verify' | 'completed') => {
    dispatch(setRegistrationStep(step));
  };

  const setRegEmail = (email: string | null) => {
    dispatch(setRegistrationEmail(email));
  };

  const resetReg = () => {
    dispatch(resetRegistration());
  };

  const logoutLocal = () => {
    dispatch(logoutAction());
  };

  const updateToken = (newToken: string) => {
    dispatch(setToken(newToken));
  };

  const removeToken = () => {
    dispatch(clearToken());
  };

  const updateCacheValidityState = () => {
    dispatch(updateCacheValidity());
  };

  // Helper functions to access cached data
  const getCachedRoles = () => {
    return userCache?.global_roles || user?.global_roles || [];
  };

  const getCachedRolesPermissions = () => {
    return userCache?.roles_permissions || [];
  };

  const getCachedGlobalPermissions = () => {
    return userCache?.global_permissions || user?.global_permissions || [];
  };

  const getCachedAllPermissions = () => {
    return userCache?.all_permissions || user?.all_permissions || [];
  };

  const getCachedStores = () => {
    return userCache?.stores || user?.stores || [];
  };

  const getCachedSummary = () => {
    return userCache?.summary || user?.summary || {
      total_stores: 0,
      total_roles: 0,
      total_permissions: 0,
      manageable_users_count: 0,
    };
  };

  // Permission checking helpers
  const hasPermission = (permission: string): boolean => {
    const allPermissions = getCachedAllPermissions();
    return allPermissions.some(perm => perm.name === permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    const allPermissions = getCachedAllPermissions();
    return permissions.some(permission => 
      allPermissions.some(perm => perm.name === permission)
    );
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    const allPermissions = getCachedAllPermissions();
    return permissions.every(permission => 
      allPermissions.some(perm => perm.name === permission)
    );
  };

  // Role checking helpers
  const hasRole = (roleName: string): boolean => {
    const roles = getCachedRoles();
    return roles.some(role => role.name === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    const roles = getCachedRoles();
    return roleNames.some(roleName => 
      roles.some(role => role.name === roleName)
    );
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    const roles = getCachedRoles();
    return roleNames.every(roleName => 
      roles.some(role => role.name === roleName)
    );
  };

  // Enhanced validation helpers for registration
  const validateRegistrationData = (data: RegisterRequest): string[] => {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.password || data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (data.password !== data.password_confirmation) {
      errors.push('Passwords do not match');
    }

    return errors;
  };

  // Check if registration data is valid
  const isRegistrationDataValid = (data: RegisterRequest): boolean => {
    return validateRegistrationData(data).length === 0;
  };

  // Get current registration progress
  const getRegistrationProgress = () => {
    switch (registrationStep) {
      case 'register':
        return { step: 1, total: 3, label: 'Account Details' };
      case 'verify':
        return { step: 2, total: 3, label: 'Email Verification' };
      case 'completed':
        return { step: 3, total: 3, label: 'Registration Complete' };
      default:
        return { step: 1, total: 3, label: 'Account Details' };
    }
  };

  // Check if user can proceed to next registration step
  const canProceedToVerification = (): boolean => {
    return registrationStep === 'verify' && !!registrationEmail;
  };

  // Check if registration is completed
  const isRegistrationCompleted = (): boolean => {
    return registrationStep === 'completed';
  };

  return {
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    registrationStep,
    registrationEmail,
    isInitialized,
    
    // Cache state
    userCache,
    isCacheValid,
    cacheExpiry,
    
    // Enhanced registration actions
    register,
    verifyEmail,
    resendOtp,
    
    // Other auth actions
    login,
    forgotPassword: forgotPass,
    resetPassword: resetPass,
    getUserProfile: getProfile,
    fetchUserProfile: fetchProfile,
    logout,
    refreshToken: refresh,
    refreshCache,
    
    // Utility actions
    clearError: clearAuthError,
    setRegistrationStep: setRegStep,
    setRegistrationEmail: setRegEmail,
    resetRegistration: resetReg,
    logoutLocal,
    updateToken,
    removeToken,
    extendCacheExpiry: extendCache,
    clearCache: clearCacheData,
    updateCacheValidity: updateCacheValidityState,
    
    // Helper functions for cached data
    getCachedRoles,
    getCachedRolesPermissions,
    getCachedGlobalPermissions,
    getCachedAllPermissions,
    getCachedStores,
    getCachedSummary,
    
    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role helpers
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Enhanced registration helpers
    validateRegistrationData,
    isRegistrationDataValid,
    getRegistrationProgress,
    canProceedToVerification,
    isRegistrationCompleted,
  };
};
