// src/features/skills/services/api.ts
/**
 * Skill API Service
 *
 * This service provides all CRUD operations for the Skill entity.
 * It handles HTTP requests using Axios with proper error handling,
 * logging, and TypeScript typing for production-ready applications.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path to your store
import { loadToken } from '../../auth/utils/tokenStorage';
import type {
  Skill,
  SkillWithEmpInfos,
  CreateSkillDto,
  UpdateSkillDto,
  ApiError,
} from '../types';

/**
 * Base URL and endpoints
 */
const API_BASE_URL = import.meta.env.VITE_EMPLOYEMENT_INFO_NOT_WORKING_API_BASE_URL;
const SKILLS_ENDPOINT = '/skills';

/**
 * Helper function to get authentication token with fallback
 * Prioritizes Redux store token, falls back to localStorage
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) {
      return reduxToken;
    }
    // Fallback to decrypt token from localStorage
    return loadToken();
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Creates Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT), 
  headers: {
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    'Accept': import.meta.env.VITE_API_ACCEPT,
  },
});

/**
 * Request interceptor to add authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for global error handling and logging
 */
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

/**
 * Transforms Axios error to standardized ApiError format
 * @param error - Unknown error object (Axios error or generic error)
 * @returns Standardized error object
 */
const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as any;

    return {
      message:
        responseData?.message ||
        axiosError.message ||
        'An unexpected error occurred',
      status: axiosError.response?.status || 500,
      errors: responseData?.errors || undefined,
      code: responseData?.code || 'UNKNOWN_ERROR',
      details: responseData || undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: 'NETWORK_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Skill API Service Class
 * Contains all CRUD operations for Skills management
 */
class SkillApiService {
  /**
   * Fetches all skills
   * @returns Promise resolving to an array of skills
   * @throws ApiError on request failure
   */
  async getAllSkills(): Promise<Skill[]> {
    try {
      console.log('📋 Fetching all skills');

      const response: AxiosResponse<Skill[]> = await apiClient.get(SKILLS_ENDPOINT);

      console.log(`✅ Successfully fetched ${response.data.length} skills`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('❌ Failed to fetch skills:', apiError);
      throw apiError;
    }
  }

  /**
   * Fetches a single skill by ID, including related employee info
   * @param id - Skill ID
   * @returns Promise resolving to Skill with emp_infos
   * @throws ApiError on request failure
   */
  async getSkillById(id: number): Promise<SkillWithEmpInfos> {
    try {
      console.log(`📄 Fetching skill with ID: ${id}`);

      const response: AxiosResponse<SkillWithEmpInfos> = await apiClient.get(`${SKILLS_ENDPOINT}/${id}`);

      console.log(`✅ Successfully fetched skill: ${response.data.name}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to fetch skill ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Creates a new skill
   * @param skillData - Data for creating the skill
   * @returns Promise resolving to created skill
   * @throws ApiError on request failure or validation errors
   */
  async createSkill(skillData: CreateSkillDto): Promise<Skill> {
    try {
      console.log('➕ Creating new skill:', skillData);

      if (!skillData.name?.trim()) {
        throw {
          message: 'Skill name is required',
          status: 400,
          errors: { name: ['Skill name is required'] },
          code: 'VALIDATION_ERROR',
        } as ApiError;
      }

      const response: AxiosResponse<Skill> = await apiClient.post(SKILLS_ENDPOINT, skillData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`✅ Successfully created skill: ${response.data.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('❌ Failed to create skill:', apiError);
      throw apiError;
    }
  }

  /**
   * Updates an existing skill
   * @param id - Skill ID to update
   * @param skillData - Updated skill data
   * @returns Promise resolving to updated skill
   * @throws ApiError on request failure or validation errors
   */
  async updateSkill(id: number, skillData: UpdateSkillDto): Promise<Skill> {
    try {
      console.log(`✏️ Updating skill ${id}:`, skillData);

      if (!skillData.name?.trim()) {
        throw {
          message: 'Skill name is required',
          status: 400,
          errors: { name: ['Skill name is required'] },
          code: 'VALIDATION_ERROR',
        } as ApiError;
      }

      const response: AxiosResponse<Skill> = await apiClient.put(`${SKILLS_ENDPOINT}/${id}`, skillData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`✅ Successfully updated skill: ${response.data.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to update skill ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Deletes a skill by ID
   * @param id - Skill ID to delete
   * @returns Promise resolving to void on successful deletion
   * @throws ApiError on request failure
   */
  async deleteSkill(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting skill with ID: ${id}`);

      await apiClient.delete(`${SKILLS_ENDPOINT}/${id}`);

      console.log(`✅ Successfully deleted skill with ID: ${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to delete skill ${id}:`, apiError);
      throw apiError;
    }
  }
}

/**
 * Export singleton instance of the API service
 */
export const skillApiService = new SkillApiService();

/**
 * Export individual methods for named imports if preferred
 */
export const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = skillApiService;

export default SkillApiService;
