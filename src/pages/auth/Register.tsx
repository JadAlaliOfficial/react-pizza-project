import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useReduxAuth } from '../../hooks/useReduxAuth';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  handleRegisterError,
  handleNetworkError,
  isNetworkError,
  hasFormErrors,
  clearFieldError,
  clearAllErrors,
} from '../../utils/registerErrorHandler';
import type {
  RegisterFormData,
  RegisterFormErrors,
  RegisterErrorResponse,
} from '../../types/authTypes';


const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track which fields have been touched to manage error display
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  // Redux auth hook
  const { register, isLoading, error, clearError, setRegistrationEmail } = useReduxAuth();
  const navigate = useNavigate();

  // Only clear Redux error on mount, not on every render
  useEffect(() => {
    return () => {
      // Clear error only on unmount if needed
      if (error) {
        clearError();
      }
    };
  }, []);

  // Memoize error display logic to prevent unnecessary re-renders
  const displayErrors = useMemo(() => {
    const combinedErrors = { ...errors };
    
    // Only show field errors for touched fields or after submission attempt
    if (!touchedFields.size && !isSubmitting) {
      // Remove field-specific errors if fields haven't been touched
      const { general, ...fieldErrors } = combinedErrors;
      return { general };
    }
    
    return combinedErrors;
  }, [errors, touchedFields, isSubmitting]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouchedFields((prev) => new Set(prev).add(name));
    
    // Only clear specific field error after user has typed something meaningful
    if (value.trim().length > 0 && errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => clearFieldError(prev, name as keyof RegisterFormErrors));
    }
    
    // Clear general error only when user starts making meaningful changes
    if (value.trim().length > 0 && errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
    
    // Don't clear Redux error on every keystroke - only clear it when user submits again
  }, [errors]);

  const validateForm = (): RegisterFormErrors => {
    const newErrors: RegisterFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Name must not exceed 255 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 255) {
      newErrors.password = 'Password must not exceed 255 characters';
    }

    // Password confirmation validation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    setTouchedFields(new Set(['name', 'email', 'password', 'password_confirmation']));

    // Clear existing errors
    setErrors(clearAllErrors());
    if (error) {
      clearError();
    }

    // Validate form
    // const validationErrors = validateForm();
    // if (hasFormErrors(validationErrors)) {
    //   setErrors(validationErrors);
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (result.type.endsWith('/fulfilled')) {
        // Registration successful
        setRegistrationEmail(formData.email.trim().toLowerCase());
        navigate('/verify-email', { 
          state: { email: formData.email.trim().toLowerCase() },
          replace: true 
        });
      } else if (result.type.endsWith('/rejected')) {
        // Registration failed - handle the error
        const errorPayload = result.payload;
        
        if (typeof errorPayload === 'string') {
          // Simple string error
          setErrors({ general: errorPayload });
        } else if (errorPayload && typeof errorPayload === 'object') {
          // Check if it's a structured error response
          const errorResponse = errorPayload as RegisterErrorResponse;
          const processedErrors = handleRegisterError(errorResponse);
          setErrors(processedErrors);
        } else {
          // Fallback error
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle network errors
      if (isNetworkError(err)) {
        setErrors(handleNetworkError());
      } else {
        // Handle other unexpected errors
        setErrors({ 
          general: err?.message || 'An unexpected error occurred. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFormErrors = useCallback(() => {
    setErrors(clearAllErrors());
    setTouchedFields(new Set());
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Determine if form has any errors to show
  const hasAnyErrors = hasFormErrors(displayErrors) || !!error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-4 pb-8">
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                Create Account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your information to create your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error Alert */}
              {(displayErrors.general || error) && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-600">
                    {displayErrors.general || error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`h-12 ${displayErrors.name ? 'border-destructive focus:border-destructive' : ''}`}
                  disabled={isLoading || isSubmitting}
                  autoComplete="name"
                />
                {displayErrors.name && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {displayErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`h-12 ${displayErrors.email ? 'border-destructive focus:border-destructive' : ''}`}
                  disabled={isLoading || isSubmitting}
                  autoComplete="email"
                />
                {displayErrors.email && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {displayErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`h-12 pr-12 ${
                      displayErrors.password ? 'border-destructive focus:border-destructive' : ''
                    }`}
                    disabled={isLoading || isSubmitting}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSubmitting}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {displayErrors.password && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {displayErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="password_confirmation"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-primary" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`h-12 pr-12 ${
                      displayErrors.password_confirmation ? 'border-destructive focus:border-destructive' : ''
                    }`}
                    disabled={isLoading || isSubmitting}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || isSubmitting}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {displayErrors.password_confirmation && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {displayErrors.password_confirmation}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Clear Errors Button (only show if there are errors) */}
              {hasAnyErrors && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={clearFormErrors}
                  disabled={isLoading || isSubmitting}
                >
                  Clear Errors
                </Button>
              )}
            </form>

            {/* Footer */}
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background rounded-sm px-4 text-muted-foreground font-medium tracking-wider">
                    Options
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-3 text-center">
                <div className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
