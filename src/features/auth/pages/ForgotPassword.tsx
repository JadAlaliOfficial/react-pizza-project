import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ForgotPasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    forgotPassword, 
    isLoading, 
    error, 
    isAuthenticated, 
    clearError 
  } = useAuth();

  // Form state
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const [localErrors, setLocalErrors] = useState<FormErrors>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear local error when user starts typing
    if (localErrors[name as keyof FormErrors]) {
      setLocalErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear global error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setLocalErrors({});
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const result = await forgotPassword({
        email: formData.email.trim(),
      });

      // ✅ FIXED: Redirect to reset password page on success
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/reset-password', {
          state: {
            email: formData.email.trim(),
            message: 'Password reset OTP sent to your email. Please check your inbox.',
          }
        });
      }
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  // Handle navigation link clicks
  const handleLinkClick = () => {
    clearError();
  };

  return (
    <div className=" flex items-center justify-cente  px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you an OTP to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Redux error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${
                    localErrors.email ? 'border-destructive' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {localErrors.email && (
                <p className="text-sm text-destructive">{localErrors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                We'll send a 6-digit OTP to this email address
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reset OTP
                </>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-4">
              You'll receive a 6-digit OTP code to reset your password. 
              The code will expire in 15 minutes for security reasons.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-2 text-center text-sm">
            <Link
              to="/login"
              className="text-primary hover:underline flex items-center justify-center"
              onClick={handleLinkClick}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
