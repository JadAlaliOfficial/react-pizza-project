/**
 * ================================
 * FORMS MODULE - Service Layer (Axios)
 * ================================
 * Handles all HTTP requests to the Forms API endpoints.
 * - Uses Axios instance with Bearer token authentication
 * - Provides strongly typed methods for all operations
 * - Includes error normalization and logging
 * - Follows clean architecture patterns
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';
import { store } from '@/store'; // Adjust path to your Redux store
import { loadToken } from '../../../auth/utils/tokenStorage'; // Adjust path
import type {
  ListFormsResponse,
  GetFormResponse,
  ActionResponse,
  CreateFormDto,
  UpdateFormDto,
  ListFormsQueryParams,
  ApiError,
  Id,
} from '../types';

/**
 * Base URL for the Forms API
 */
const BASE_URL = 'http://dforms.pnepizza.com/api';

/**
 * Retrieve authentication token from Redux state or token storage.
 * Falls back to stored token if Redux state doesn't have it.
 * @returns Bearer token string or null if unavailable
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) {
      console.debug('[FormsService] Using token from Redux state');
      return reduxToken;
    }
    console.debug('[FormsService] Token not in Redux, loading from storage');
    return loadToken();
  } catch (error) {
    console.error('[FormsService] Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create and configure Axios instance with interceptors for auth and logging.
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach Bearer token to all requests
  instance.interceptors.request.use(
    (config) => {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any)['Accept'] = 'application/json';
      (config.headers as any)['Content-Type'] = 'application/json';
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug(`[FormsService] Request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn('[FormsService] No auth token available for request');
      }
      return config;
    },
    (error) => {
      console.error('[FormsService] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: log responses and errors
  instance.interceptors.response.use(
    (response) => {
      console.debug(
        `[FormsService] Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
      );
      return response;
    },
    (error) => {
      console.error('[FormsService] Response error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Shared Axios instance for all Forms service methods
 */
const axiosInstance = createAxiosInstance();

/**
 * Normalize Axios errors into a consistent ApiError shape.
 * Extracts user-friendly messages for UI consumption.
 * @param error - The error object from Axios
 * @returns Normalized ApiError object
 */
export const normalizeError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Extract message from response body or use default
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An unexpected error occurred';

    console.error('[FormsService] Normalized error:', {
      status: axiosError.response?.status,
      message,
      url: axiosError.config?.url,
    });

    return {
      code: axiosError.response?.status?.toString(),
      message,
      details: axiosError.response?.data,
    };
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    console.error('[FormsService] Non-Axios error:', error.message);
    return {
      message: error.message,
      details: error,
    };
  }

  // Fallback for unknown error types
  console.error('[FormsService] Unknown error type:', error);
  return {
    message: 'An unknown error occurred',
    details: error,
  };
};

/**
 * FormsService: All API methods for Forms module
 */
export class FormsService {
  /**
   * LIST FORMS
   * Fetches a paginated list of forms with optional filters and sorting.
   * @param params - Query parameters for filtering, sorting, and pagination
   * @returns Promise resolving to ListFormsResponse
   */
  static async listForms(params?: ListFormsQueryParams): Promise<ListFormsResponse> {
    try {
      console.debug('[FormsService.listForms] Fetching forms with params:', params);

      const response = await axiosInstance.get<ListFormsResponse>('/forms', {
        params: {
          page: params?.page || 1,
          per_page: params?.per_page || 10,
          name: params?.name || '',
          status: params?.status || '',
          category_id: params?.category_id || '',
          sort_by: params?.sort_by || 'creation_time',
          sort_order: params?.sort_order || 'desc',
        },
      });

      console.debug('[FormsService.listForms] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FormsService.listForms] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * GET FORM
   * Fetches a single form by ID with expanded details.
   * @param id - Form ID
   * @returns Promise resolving to GetFormResponse
   */
  static async getForm(id: Id): Promise<GetFormResponse> {
    try {
      console.debug(`[FormsService.getForm] Fetching form with ID: ${id}`);

      const response = await axiosInstance.get<GetFormResponse>(`/forms/${id}`);

      console.debug('[FormsService.getForm] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FormsService.getForm] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * CREATE FORM
   * Creates a new form with initial version, stage, and section.
   * @param data - CreateFormDto with name and category_id
   * @returns Promise resolving to GetFormResponse
   */
  static async createForm(data: CreateFormDto): Promise<GetFormResponse> {
    try {
      console.debug('[FormsService.createForm] Creating form with data:', data);

      const response = await axiosInstance.post<GetFormResponse>('/forms', data);

      console.debug('[FormsService.createForm] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FormsService.createForm] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * UPDATE FORM
   * Updates an existing form's name and/or category.
   * @param id - Form ID
   * @param data - UpdateFormDto with name and category_id
   * @returns Promise resolving to GetFormResponse
   */
  static async updateForm(id: Id, data: UpdateFormDto): Promise<GetFormResponse> {
    try {
      console.debug(`[FormsService.updateForm] Updating form ID ${id} with data:`, data);

      const response = await axiosInstance.put<GetFormResponse>(`/forms/${id}`, data);

      console.debug('[FormsService.updateForm] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FormsService.updateForm] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * ARCHIVE FORM
   * Archives a form and all its versions.
   * @param id - Form ID
   * @returns Promise resolving to ActionResponse
   */
  static async archiveForm(id: Id): Promise<ActionResponse> {
    try {
      console.debug(`[FormsService.archiveForm] Archiving form ID: ${id}`);

      const response = await axiosInstance.post<ActionResponse>(`/forms/${id}/archive`);

      console.debug('[FormsService.archiveForm] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FormsService.archiveForm] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * RESTORE FORM
   * Restores an archived form and sets latest version as published.
   * @param id - Form ID
   * @returns Promise resolving to ActionResponse
   */
  static async restoreForm(id: Id): Promise<ActionResponse> {
    try {
      console.debug(`[FormsService.restoreForm] Restoring form ID: ${id}`);

      const response = await axiosInstance.post<ActionResponse>(`/forms/${id}/restore`);

      console.debug('[FormsService.restoreForm] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FormsService.restoreForm] Error:', error);
      throw normalizeError(error);
    }
  }
}

/**
 * Export the service class as default for easy importing
 */
export default FormsService;
