/**
 * ================================
 * CATEGORIES MODULE - Service Layer (Axios)
 * ================================
 * Handles all HTTP requests to the Categories API endpoints.
 * - Uses Axios instance with Bearer token authentication
 * - Provides strongly typed methods for all operations
 * - Includes error normalization helper
 * - Includes logging
 * - Return strictly typed responses
 * - Handles empty-body POST/DELETE requests correctly
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';
import { store } from '@/store'; // Adjust path to your Redux store
import { loadToken } from '../../../auth/utils/tokenStorage'; // Adjust path
import type {
  ListCategoriesResponse,
  GetCategoryResponse,
  CategoryActionResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  AssignFormsToCategoryDto,
  UnassignFormsFromCategoryDto,
  ApiError,
  Id,
} from '../types';

/**
 * Base URL for the Categories API
 */
const BASE_URL = import.meta.env.VITE_DYNAMIC_FORMS_BASE_URL;

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
      console.debug('[CategoriesService] Using token from Redux state');
      return reduxToken;
    }
    console.debug('[CategoriesService] Token not in Redux, loading from storage');
    return loadToken();
  } catch (error) {
    console.error('[CategoriesService] Error retrieving auth token:', error);
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
      'Accept': import.meta.env.VITE_API_ACCEPT,
      'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    },
    timeout: import.meta.env.VITE_API_TIMEOUT,
  });

  // Request interceptor: attach Bearer token to all requests
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug(`[CategoriesService] Request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn('[CategoriesService] No auth token available for request');
      }
      return config;
    },
    (error) => {
      console.error('[CategoriesService] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: log responses and errors
  instance.interceptors.response.use(
    (response) => {
      console.debug(
        `[CategoriesService] Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
      );
      return response;
    },
    (error) => {
      console.error('[CategoriesService] Response error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Shared Axios instance for all Categories service methods
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

    console.error('[CategoriesService] Normalized error:', {
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
    console.error('[CategoriesService] Non-Axios error:', error.message);
    return {
      message: error.message,
      details: error,
    };
  }

  // Fallback for unknown error types
  console.error('[CategoriesService] Unknown error type:', error);
  return {
    message: 'An unknown error occurred',
    details: error,
  };
};

/**
 * CategoriesService: All API methods for Categories module
 */
export class CategoriesService {
  /**
   * LIST CATEGORIES
   * Fetches all categories (no pagination - returns full list).
   * @returns Promise resolving to ListCategoriesResponse
   */
  static async listCategories(): Promise<ListCategoriesResponse> {
    try {
      console.debug('[CategoriesService.listCategories] Fetching all categories');

      const response = await axiosInstance.get<ListCategoriesResponse>('/categories');

      console.debug('[CategoriesService.listCategories] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.listCategories] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * GET CATEGORY
   * Fetches a single category by ID.
   * @param id - Category ID
   * @returns Promise resolving to GetCategoryResponse
   */
  static async getCategory(id: Id): Promise<GetCategoryResponse> {
    try {
      console.debug(`[CategoriesService.getCategory] Fetching category with ID: ${id}`);

      const response = await axiosInstance.get<GetCategoryResponse>(`/categories/${id}`);

      console.debug('[CategoriesService.getCategory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.getCategory] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * CREATE CATEGORY
   * Creates a new category.
   * @param data - CreateCategoryDto with name
   * @returns Promise resolving to GetCategoryResponse
   */
  static async createCategory(data: CreateCategoryDto): Promise<GetCategoryResponse> {
    try {
      console.debug('[CategoriesService.createCategory] Creating category with data:', data);

      const response = await axiosInstance.post<GetCategoryResponse>('/categories', data);

      console.debug('[CategoriesService.createCategory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.createCategory] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * UPDATE CATEGORY
   * Updates an existing category's name.
   * @param id - Category ID
   * @param data - UpdateCategoryDto with name
   * @returns Promise resolving to GetCategoryResponse
   */
  static async updateCategory(id: Id, data: UpdateCategoryDto): Promise<GetCategoryResponse> {
    try {
      console.debug(`[CategoriesService.updateCategory] Updating category ID ${id} with data:`, data);

      const response = await axiosInstance.put<GetCategoryResponse>(`/categories/${id}`, data);

      console.debug('[CategoriesService.updateCategory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.updateCategory] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * ASSIGN FORMS TO CATEGORY
   * Assigns one or multiple forms to a specific category.
   * @param data - AssignFormsToCategoryDto with category_id and form_ids
   * @returns Promise resolving to CategoryActionResponse
   */
  static async assignFormsToCategory(data: AssignFormsToCategoryDto): Promise<CategoryActionResponse> {
    try {
      console.debug('[CategoriesService.assignFormsToCategory] Assigning forms with data:', data);

      const response = await axiosInstance.post<CategoryActionResponse>(
        '/categories/assign-forms',
        data
      );

      console.debug('[CategoriesService.assignFormsToCategory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.assignFormsToCategory] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * UNASSIGN FORMS FROM CATEGORY
   * Removes category assignment from one or multiple forms.
   * Forms will become "without category" (category_id = null).
   * @param data - UnassignFormsFromCategoryDto with form_ids
   * @returns Promise resolving to CategoryActionResponse
   */
  static async unassignFormsFromCategory(data: UnassignFormsFromCategoryDto): Promise<CategoryActionResponse> {
    try {
      console.debug('[CategoriesService.unassignFormsFromCategory] Unassigning forms with data:', data);

      const response = await axiosInstance.post<CategoryActionResponse>(
        '/categories/unassign-forms',
        data
      );

      console.debug('[CategoriesService.unassignFormsFromCategory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.unassignFormsFromCategory] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * DELETE CATEGORY
   * Deletes a category by ID.
   * All forms in this category will become "without category".
   * @param id - Category ID
   * @returns Promise resolving to CategoryActionResponse
   */
  static async deleteCategory(id: Id): Promise<CategoryActionResponse> {
    try {
      console.debug(`[CategoriesService.deleteCategory] Deleting category ID: ${id}`);

      const response = await axiosInstance.delete<CategoryActionResponse>(`/categories/${id}`);

      console.debug('[CategoriesService.deleteCategory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CategoriesService.deleteCategory] Error:', error);
      throw normalizeError(error);
    }
  }
}

/**
 * Export the service class as default for easy importing
 */
export default CategoriesService;
