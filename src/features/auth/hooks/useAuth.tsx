import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks'; // Adjust import path as needed
import {
  login,
  forgotPassword,
  resetPassword,
  getUserProfile,
  logout,
  initializeAuth,
  clearError,
} from '../store/authSlice';
import type {
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';

// Custom hook for authentication - UPDATED
export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Select auth state from Redux store - UPDATED (removed refreshToken)
  const {
    user,
    token,
    permissions,
    roles,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
  } = useAppSelector((state) => state.auth);

  // Auth operation dispatchers with proper typing

  const loginUser = useCallback(
    (data: LoginRequest) => dispatch(login(data)),
    [dispatch]
  );

  const forgotUserPassword = useCallback(
    (data: ForgotPasswordRequest) => dispatch(forgotPassword(data)),
    [dispatch]
  );

  const resetUserPassword = useCallback(
    (data: ResetPasswordRequest) => dispatch(resetPassword(data)),
    [dispatch]
  );

  const loadUserProfile = useCallback(
    () => dispatch(getUserProfile()),
    [dispatch]
  );

  const logoutUser = useCallback(
    () => dispatch(logout()),
    [dispatch]
  );

  const initAuth = useCallback(
    () => dispatch(initializeAuth()),
    [dispatch]
  );

  const clearAuthError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  // Permission checking helpers
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (permissionsList: string[]): boolean => {
      if (!permissions || permissions.length === 0 || !permissionsList.length) return false;
      return permissionsList.some((perm) => permissions.includes(perm));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (permissionsList: string[]): boolean => {
      if (!permissions || permissions.length === 0 || !permissionsList.length) return false;
      return permissionsList.every((perm) => permissions.includes(perm));
    },
    [permissions]
  );

  // Role checking helpers
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!roles || roles.length === 0) return false;
      return roles.includes(role);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (rolesList: string[]): boolean => {
      if (!roles || roles.length === 0 || !rolesList.length) return false;
      return rolesList.some((r) => roles.includes(r));
    },
    [roles]
  );

  const hasAllRoles = useCallback(
    (rolesList: string[]): boolean => {
      if (!roles || roles.length === 0 || !rolesList.length) return false;
      return rolesList.every((r) => roles.includes(r));
    },
    [roles]
  );

  // Combined permission and role checking
  const canAccess = useCallback(
    (requiredPermissions?: string[], requiredRoles?: string[]): boolean => {
      let hasRequiredPermissions = true;
      let hasRequiredRoles = true;

      if (requiredPermissions && requiredPermissions.length > 0) {
        hasRequiredPermissions = hasAnyPermission(requiredPermissions);
      }

      if (requiredRoles && requiredRoles.length > 0) {
        hasRequiredRoles = hasAnyRole(requiredRoles);
      }

      return hasRequiredPermissions && hasRequiredRoles;
    },
    [hasAnyPermission, hasAnyRole]
  );

  // Check if user is super-admin (helper for common use case)
  const isSuperAdmin = useCallback(
    (): boolean => hasRole('super-admin'),
    [hasRole]
  );

  // Get user display name
  const getUserDisplayName = useCallback((): string => {
    return user?.name || user?.email || 'Unknown User';
  }, [user]);

  // Check if user has verified email
  const isEmailVerified = useCallback((): boolean => {
    return !!user?.email_verified_at;
  }, [user]);

  return {
    // Auth state - UPDATED (removed refreshToken)
    user,
    token,
    permissions,
    roles,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    
    // Auth operations
    login: loginUser,
    forgotPassword: forgotUserPassword,
    resetPassword: resetUserPassword,
    getUserProfile: loadUserProfile,
    logout: logoutUser,
    initializeAuth: initAuth,
    clearError: clearAuthError,
    
    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role helpers
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Combined access control
    canAccess,
    
    // Convenience helpers
    isSuperAdmin,
    getUserDisplayName,
    isEmailVerified,
  };
};

export default useAuth;
