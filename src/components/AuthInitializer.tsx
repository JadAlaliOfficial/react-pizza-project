import React, { useEffect, useRef } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';

// Props interface for AuthInitializer
interface AuthInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Default loading component
const DefaultLoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <div className="flex flex-col items-center space-y-4">
      {/* Loading spinner */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      
      {/* Loading text */}
      <div className="text-lg font-medium text-foreground">
        Initializing application...
      </div>
      
      {/* Optional subtitle */}
      <div className="text-sm text-muted-foreground">
        Please wait while we set up your session
      </div>
    </div>
  </div>
);

/**
 * AuthInitializer Component
 * 
 * This component wraps the application and ensures authentication is properly
 * initialized before rendering children. It handles:
 * 
 * 1. Auth initialization from localStorage
 * 2. Automatic profile fetching for authenticated users
 * 3. Loading states during initialization
 * 4. Preventing duplicate profile fetches
 * 
 * @param children - The application components to render after auth is ready
 * @param fallback - Optional custom loading component (defaults to DefaultLoadingScreen)
 */
export const AuthInitializer: React.FC<AuthInitializerProps> = ({ 
  children, 
  fallback = <DefaultLoadingScreen /> 
}) => {
  const {
    isInitialized,
    isAuthenticated,
    user,
    isLoading,
    initializeAuth,
    getUserProfile,
  } = useAuth();
  
  // Track if we've already attempted to fetch the profile
  const profileFetchAttempted = useRef(false);
  
  // Initialize auth on component mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);
  
  // Fetch user profile if authenticated but profile is incomplete
  useEffect(() => {
    // Only fetch profile if:
    // 1. Auth is initialized
    // 2. User is authenticated
    // 3. User object exists but has incomplete data (id is 0 from localStorage reconstruction)
    // 4. We haven't already attempted to fetch the profile
    // 5. Not currently loading
    if (
      isInitialized &&
      isAuthenticated &&
      user &&
      user.id === 0 &&
      !profileFetchAttempted.current &&
      !isLoading
    ) {
      profileFetchAttempted.current = true;
      getUserProfile();
    }
  }, [isInitialized, isAuthenticated, user, isLoading, getUserProfile]);
  
  // Reset profile fetch flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      profileFetchAttempted.current = false;
    }
  }, [isAuthenticated]);
  
  // Show loading screen while auth is initializing or fetching profile
  if (!isInitialized || (isAuthenticated && user?.id === 0)) {
    return <>{fallback}</>;
  }
  
  // Auth is ready, render children
  return <>{children}</>;
};

export default AuthInitializer;