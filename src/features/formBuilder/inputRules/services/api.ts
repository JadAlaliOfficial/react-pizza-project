// inputRules.service.ts

import axios, { AxiosError, type AxiosInstance } from 'axios';
import { type InputRule, type InputRulesResponse } from '../types';
import { loadToken } from '../../../auth/utils/tokenStorage';
import { store } from '@/store'; // Adjust path as needed

/**
 * API Configuration Constants
 * Centralized to avoid magic strings and simplify maintenance
 */
const API_CONFIG = {
  BASE_URL: 'http://dforms.pnepizza.com/api',
  ENDPOINTS: {
    INPUT_RULES: '/input-rules',
  },
  TIMEOUT: 10000, // 10 seconds
} as const;

/**
 * Custom error class for authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication token is missing') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error class for API-related failures
 */
export class ApiError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Retrieve authentication token from Redux store or localStorage
 * Tries Redux first for performance, falls back to tokenStorage
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) return reduxToken;
    return loadToken();
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create a configured Axios instance for API calls
 * Separated for testability and reusability across services
 */
const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
};

const apiClient = createApiClient();

/**
 * Fetches all input rules from the API
 *
 * @returns Promise<InputRule[]> - Array of input rules
 * @throws {AuthenticationError} - When auth token is missing
 * @throws {ApiError} - When API request fails or returns unexpected data
 *
 * Why this approach:
 * - Returns only the data array (not wrapped response) for cleaner consumption
 * - Validates response shape to catch API contract changes early
 * - Provides detailed error context for debugging
 * - Logs strategically without noise
 */
export const fetchInputRules = async (): Promise<InputRule[]> => {
  console.info('[InputRules Service] Fetching input rules...');

  // Check for authentication token before making request
  const token = getAuthToken();
  if (!token) {
    console.error('[InputRules Service] Missing authentication token');
    throw new AuthenticationError();
  }

  try {
    const response = await apiClient.get<InputRulesResponse>(
      API_CONFIG.ENDPOINTS.INPUT_RULES,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Validate response structure to ensure API contract is met
    if (!response.data || typeof response.data.success !== 'boolean') {
      console.error(
        '[InputRules Service] Invalid response structure:',
        response.data,
      );
      throw new ApiError('Invalid API response structure');
    }

    if (!response.data.success) {
      console.warn('[InputRules Service] API returned success:false');
      throw new ApiError('API request was not successful');
    }

    if (!Array.isArray(response.data.data)) {
      console.error(
        '[InputRules Service] Expected array in response.data.data',
      );
      throw new ApiError('Expected array of input rules in response');
    }

    console.info(
      `[InputRules Service] Successfully fetched ${response.data.data.length} input rules`,
    );

    return response.data.data;
  } catch (error) {
    // Handle Axios-specific errors with detailed context
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // Server responded with error status
        const statusCode = axiosError.response.status;
        console.error(
          `[InputRules Service] HTTP ${statusCode} error:`,
          axiosError.response.data,
        );

        throw new ApiError(
          `Request failed with status ${statusCode}`,
          statusCode,
          axiosError,
        );
      } else if (axiosError.request) {
        // Request made but no response received (network error)
        console.error(
          '[InputRules Service] Network error - no response received',
        );
        throw new ApiError(
          'Network error: No response from server',
          undefined,
          axiosError,
        );
      } else {
        // Error in request configuration
        console.error(
          '[InputRules Service] Request setup error:',
          axiosError.message,
        );
        throw new ApiError(
          `Request error: ${axiosError.message}`,
          undefined,
          axiosError,
        );
      }
    }

    // Re-throw our custom errors as-is
    if (error instanceof AuthenticationError || error instanceof ApiError) {
      throw error;
    }

    // Handle unexpected errors
    console.error('[InputRules Service] Unexpected error:', error);
    throw new ApiError('An unexpected error occurred', undefined, error);
  }
};
