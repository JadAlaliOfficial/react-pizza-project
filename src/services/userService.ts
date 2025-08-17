import axios from 'axios';
import type { 
  GetUsersParams, 
  UsersApiResponse, 
  RolesApiResponse, 
  PermissionsApiResponse 
} from '../types/userTypes';

const API_BASE_URL = 'https://auth.pnepizza.com/api/v1';

// Create axios instance for user management
const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token to requests if available
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 responses
userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get all users with pagination and filters
  getAllUsers: async (params: GetUsersParams = {}): Promise<UsersApiResponse> => {
    const {
      per_page = 10,
      page = 1,
      search = '',
      role = '',
    } = params;

    const queryParams = new URLSearchParams({
      per_page: per_page.toString(),
      page: page.toString(),
      search,
      role,
    });

    try {
      const response = await userApi.get(`/users?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Get users error:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          data: {
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: per_page,
            prev_page_url: null,
            to: 0,
            total: 0,
          },
          message: error.response.data.message || 'Failed to fetch users',
        };
      }
      
      throw error;
    }
  },

  // Get all roles
  getAllRoles: async (): Promise<RolesApiResponse> => {
    try {
      const response = await userApi.get('/roles');
      return response.data;
    } catch (error: any) {
      console.error('Get roles error:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          data: {
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: 15,
            prev_page_url: null,
            to: 0,
            total: 0,
          },
          message: error.response.data.message || 'Failed to fetch roles',
        };
      }
      
      throw error;
    }
  },

  // Get all permissions
  getAllPermissions: async (): Promise<PermissionsApiResponse> => {
    try {
      const response = await userApi.get('/permissions');
      return response.data;
    } catch (error: any) {
      console.error('Get permissions error:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          data: {
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: 15,
            prev_page_url: null,
            to: 0,
            total: 0,
          },
          message: error.response.data.message || 'Failed to fetch permissions',
        };
      }
      
      throw error;
    }
  },
};
