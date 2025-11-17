import { AxiosError } from 'axios';
import type { ErrorResponse, ValidationError } from '../types';

/**
 * Parse API errors into user-friendly messages
 * Handles Laravel-style validation errors, auth errors, and other error formats
 */
export const parseApiError = (error: AxiosError<ErrorResponse | ValidationError> | any): string => {
  // Handle network errors or unknown errors
  if (!error || !error.response) {
    if (error?.message) {
      return error.message;
    }
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  // Handle validation errors (422)
  if (status === 422 && data?.errors) {
    const errorMessages: string[] = [];
    
    // Extract all validation error messages
    Object.keys(data.errors).forEach((field) => {
      const fieldErrors = data.errors[field];
      if (Array.isArray(fieldErrors)) {
        errorMessages.push(...fieldErrors);
      } else if (typeof fieldErrors === 'string') {
        errorMessages.push(fieldErrors);
      }
    });
    
    if (errorMessages.length > 0) {
      // Return the first error message or join multiple messages
      return errorMessages.length === 1 
        ? errorMessages[0] 
        : errorMessages.join(', ');
    }
    
    return data.message || 'Invalid data provided';
  }

  // Handle unauthorized errors (401)
  if (status === 401) {
    if (data?.message) {
      // Handle specific auth error messages
      if (data.message.includes('Invalid credentials')) {
        return 'Invalid email or password';
      }
      if (data.message.includes('verify your email')) {
        return 'Please verify your email before logging in';
      }
      if (data.message.includes('Unauthenticated')) {
        return 'Your session has expired. Please login again';
      }
      return data.message;
    }
    return 'Authentication required. Please login';
  }

  // Handle bad request errors (400)
  if (status === 400) {
    if (data?.message) {
      // Handle specific bad request messages
      if (data.message.includes('Invalid or expired OTP')) {
        return 'The verification code is invalid or has expired';
      }
      if (data.message.includes('already been taken')) {
        return 'This email address is already registered';
      }
      if (data.message.includes('already verified')) {
        return 'Your email is already verified';
      }
      return data.message;
    }
    return 'Invalid request';
  }

  // Handle forbidden errors (403)
  if (status === 403) {
    return data?.message || 'You do not have permission to perform this action';
  }

  // Handle not found errors (404)
  if (status === 404) {
    return data?.message || 'The requested resource was not found';
  }

  // Handle rate limiting (429)
  if (status === 429) {
    return 'Too many requests. Please try again later';
  }

  // Handle server errors (500+)
  if (status >= 500) {
    return 'Server error. Please try again later';
  }

  // Handle other status codes
  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  return 'An unexpected error occurred';
};

/**
 * Parse validation errors and return them as an object
 * Useful for displaying field-specific errors in forms
 */
export const parseValidationErrors = (error: any): Record<string, string[]> => {
  if (!error?.response?.data?.errors) {
    return {};
  }

  const { errors } = error.response.data;
  const validationErrors: Record<string, string[]> = {};

  Object.keys(errors).forEach((field) => {
    const fieldErrors = errors[field];
    if (Array.isArray(fieldErrors)) {
      validationErrors[field] = fieldErrors;
    } else if (typeof fieldErrors === 'string') {
      validationErrors[field] = [fieldErrors];
    }
  });

  return validationErrors;
};

/**
 * Get the first error message for a specific field
 */
export const getFieldError = (error: any, fieldName: string): string | null => {
  const validationErrors = parseValidationErrors(error);
  const fieldErrors = validationErrors[fieldName];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
};

/**
 * Check if error is a validation error (422)
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401;
};

/**
 * Check if error is a bad request error (400)
 */
export const isBadRequestError = (error: any): boolean => {
  return error?.response?.status === 400;
};

/**
 * Parse generic errors to string (fallback for non-API errors)
 */
export const parseGenericError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Create user-friendly error messages for common auth operations
 */
export const getAuthErrorMessage = (operation: string, error: any): string => {
  const baseMessage = parseApiError(error);
  
  switch (operation) {
    case 'login':
      if (isAuthError(error)) {
        return baseMessage;
      }
      return 'Login failed. Please check your credentials and try again.';
      
    case 'forgotPassword':
      return 'Password reset request failed: ' + baseMessage;
      
    case 'resetPassword':
      return 'Password reset failed: ' + baseMessage;
      
    default:
      return baseMessage;
  }
};

export default parseApiError;
