import type {
  RegisterErrorResponse,
  RegisterValidationErrors,
  RegisterFormErrors,
  StructuredError,
  ErrorSeverity,
} from '../types/authTypes';

/**
 * Maps API validation error keys to user-friendly field names
 */
const FIELD_NAME_MAP: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  password: 'Password',
  password_confirmation: 'Password confirmation',
};

/**
 * Default error messages for common validation scenarios
 */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  min: 'This field is too short',
  confirmed: 'Passwords do not match',
  unique: 'This email is already registered',
  generic: 'Registration failed. Please try again.',
};

/**
 * Extracts the first error message from an array of error messages
 */
const getFirstErrorMessage = (errors: string[]): string => {
  return errors && errors.length > 0 ? errors[0] : '';
};

/**
 * Converts API field name to user-friendly display name
 */
const getFieldDisplayName = (fieldName: string): string => {
  return FIELD_NAME_MAP[fieldName] || fieldName;
};

/**
 * Determines error severity based on error type
 */
const getErrorSeverity = (errorMessage: string): ErrorSeverity => {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('required') || lowerMessage.includes('invalid')) {
    return 'warning';
  }
  if (lowerMessage.includes('already taken') || lowerMessage.includes('exists')) {
    return 'error';
  }
  return 'error'; // Default severity
};

/**
 * Creates a user-friendly error message from API validation error
 */
const createUserFriendlyMessage = (fieldName: string, apiMessage: string): string => {
  const displayName = getFieldDisplayName(fieldName);
  
  // Common patterns and their user-friendly replacements
  const patterns: Array<{ pattern: RegExp; replacement: string }> = [
    {
      pattern: /The .+ field is required\./,
      replacement: `${displayName} is required`,
    },
    {
      pattern: /The .+ must be a valid email address\./,
      replacement: 'Please enter a valid email address',
    },
    {
      pattern: /The .+ must be at least (\d+) characters\./,
      replacement: `${displayName} must be at least $1 characters long`,
    },
    {
      pattern: /The .+ confirmation does not match\./,
      replacement: 'Passwords do not match',
    },
    {
      pattern: /The .+ has already been taken\./,
      replacement: 'This email is already registered',
    },
  ];

  // Try to match and replace with user-friendly message
  for (const { pattern, replacement } of patterns) {
    if (pattern.test(apiMessage)) {
      return apiMessage.replace(pattern, replacement);
    }
  }

  // If no pattern matches, return the original message
  return apiMessage;
};

/**
 * Processes validation errors from API response
 */
export const processValidationErrors = (validationErrors: RegisterValidationErrors): RegisterFormErrors => {
  const formErrors: RegisterFormErrors = {};

  Object.entries(validationErrors).forEach(([fieldName, errorMessages]) => {
    if (errorMessages && errorMessages.length > 0) {
      const firstError = getFirstErrorMessage(errorMessages);
      const userFriendlyMessage = createUserFriendlyMessage(fieldName, firstError);
      
      // Map to form field names
      switch (fieldName) {
        case 'name':
          formErrors.name = userFriendlyMessage;
          break;
        case 'email':
          formErrors.email = userFriendlyMessage;
          break;
        case 'password':
          formErrors.password = userFriendlyMessage;
          break;
        case 'password_confirmation':
          formErrors.password_confirmation = userFriendlyMessage;
          break;
        default:
          // If it's an unknown field, add it to general errors
          formErrors.general = userFriendlyMessage;
      }
    }
  });

  return formErrors;
};

/**
 * Handles single error messages (like "email already taken")
 */
export const processSingleError = (errorMessage: string): RegisterFormErrors => {
  const lowerMessage = errorMessage.toLowerCase();
  
  // Determine which field this error belongs to
  if (lowerMessage.includes('email') && (lowerMessage.includes('taken') || lowerMessage.includes('exists'))) {
    return {
      email: 'This email is already registered',
    };
  }
  
  if (lowerMessage.includes('name')) {
    return {
      name: createUserFriendlyMessage('name', errorMessage),
    };
  }
  
  if (lowerMessage.includes('password')) {
    return {
      password: createUserFriendlyMessage('password', errorMessage),
    };
  }
  
  // If we can't determine the field, it's a general error
  return {
    general: errorMessage,
  };
};

/**
 * Main error handler for registration API responses
 */
export const handleRegisterError = (errorResponse: RegisterErrorResponse): RegisterFormErrors => {
  // Handle validation errors (422 responses)
  if (errorResponse.errors) {
    return processValidationErrors(errorResponse.errors);
  }
  
  // Handle single error messages (400 responses)
  if (errorResponse.error) {
    return processSingleError(errorResponse.error);
  }
  
  // Handle general message errors
  if (errorResponse.message && errorResponse.message !== 'The given data was invalid.') {
    return {
      general: errorResponse.message,
    };
  }
  
  // Fallback error
  return {
    general: DEFAULT_ERROR_MESSAGES.generic,
  };
};

/**
 * Converts form errors to structured errors for advanced error handling
 */
export const createStructuredErrors = (formErrors: RegisterFormErrors): StructuredError[] => {
  const structuredErrors: StructuredError[] = [];
  
  Object.entries(formErrors).forEach(([field, message]) => {
    if (message) {
      structuredErrors.push({
        field: field === 'general' ? undefined : field,
        message,
        severity: getErrorSeverity(message),
      });
    }
  });
  
  return structuredErrors;
};

/**
 * Checks if there are any form errors
 */
export const hasFormErrors = (formErrors: RegisterFormErrors): boolean => {
  return Object.values(formErrors).some(error => error && error.trim() !== '');
};

/**
 * Gets the first error message for display purposes
 */
export const getFirstError = (formErrors: RegisterFormErrors): string | null => {
  const errors = Object.values(formErrors).filter(error => error && error.trim() !== '');
  return errors.length > 0 ? errors[0] : null;
};

/**
 * Clears specific field error
 */
export const clearFieldError = (formErrors: RegisterFormErrors, fieldName: keyof RegisterFormErrors): RegisterFormErrors => {
  return {
    ...formErrors,
    [fieldName]: undefined,
  };
};

/**
 * Clears all form errors
 */
export const clearAllErrors = (): RegisterFormErrors => {
  return {
    name: undefined,
    email: undefined,
    password: undefined,
    password_confirmation: undefined,
    general: undefined,
  };
};

/**
 * Utility to check if error is a network/connection error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    !error.response || 
    error.code === 'NETWORK_ERROR' || 
    error.message?.includes('Network Error') ||
    error.message?.includes('fetch')
  );
};

/**
 * Handles network errors specifically for registration
 */
export const handleNetworkError = (): RegisterFormErrors => {
  return {
    general: 'Unable to connect to the server. Please check your internet connection and try again.',
  };
};
