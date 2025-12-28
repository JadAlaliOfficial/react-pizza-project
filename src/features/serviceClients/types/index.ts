// src/features/serviceClients/types/index.ts

/**
 * Core Service Client entity interface
 * Represents a service client with all its properties
 */
export interface ServiceClient {
  id: number;
  name: string;
  token_hash: string;
  is_active: boolean;
  expires_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  use_count: number;
}

/**
 * Pagination link structure used in API responses
 */
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Pagination metadata for service clients list
 */
export interface PaginationMeta {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Paginated service clients data structure
 */
export interface PaginatedServiceClients extends PaginationMeta {
  data: ServiceClient[];
}

/**
 * Base API response structure
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

/**
 * API response for fetching all service clients
 */
export interface GetServiceClientsResponse extends BaseApiResponse {
  data: PaginatedServiceClients;
}

/**
 * Service client creation data (with token)
 */
export interface ServiceClientWithToken {
  service: ServiceClient;
  token: string;
}

/**
 * API response for creating a new service client
 */
export interface CreateServiceClientResponse extends BaseApiResponse {
  message: string;
  data: ServiceClientWithToken;
}

/**
 * API response for rotating service token
 */
export interface RotateTokenResponse extends BaseApiResponse {
  message: string;
  data: ServiceClientWithToken;
}

/**
 * API response for toggling service status
 */
export interface ToggleStatusResponse extends BaseApiResponse {
  message: string;
  data: {
    service: ServiceClient;
  };
}

/**
 * Request payload for creating a new service client
 */
export interface CreateServiceClientRequest {
  name: string;
  is_active: boolean;
  expires_at: string | null;
  notes: string;
}

/**
 * Request payload for rotating service token
 */
export interface RotateTokenRequest {
  expires_at?: string;
}

/**
 * Query parameters for fetching service clients
 */
export interface GetServiceClientsParams {
  per_page?: number;
  page?: number;
  search?: string;
}

/**
 * Validation error structure for form fields
 */
export interface ValidationErrors {
  [field: string]: string[];
}

/**
 * API error response for validation failures (422)
 */
export interface ValidationErrorResponse {
  message: string;
  errors: ValidationErrors;
}

/**
 * API error response for general failures (400, 500, etc.)
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

/**
 * Union type for all possible error responses
 */
export type ErrorResponse = ValidationErrorResponse | ApiErrorResponse;

/**
 * Loading states for different operations
 */
export interface LoadingStates {
  fetching: boolean;
  creating: boolean;
  rotating: boolean;
  toggling: boolean;
}

/**
 * Error states for different operations
 */
export interface ErrorStates {
  fetch: string | null;
  create: string | null;
  rotate: string | null;
  toggle: string | null;
}

/**
 * Complete service clients state structure for Redux store
 */
export interface ServiceClientsState {
  clients: ServiceClient[];
  pagination: PaginationMeta | null;
  loading: LoadingStates;
  errors: ErrorStates;
  selectedClient: ServiceClient | null;
  lastCreatedToken: string | null;
}

/**
 * Action payload for successful service client creation
 */
export interface CreateServiceClientSuccessPayload {
  client: ServiceClient;
  token: string;
}

/**
 * Action payload for successful token rotation
 */
export interface RotateTokenSuccessPayload {
  client: ServiceClient;
  token: string;
}

/**
 * Action payload for successful status toggle
 */
export interface ToggleStatusSuccessPayload {
  client: ServiceClient;
}

/**
 * Generic API call result type for hooks
 */
export interface ApiCallResult<T = unknown> {
  data?: T;
  error?: string;
  isLoading: boolean;
}

/**
 * Hook return type for useServiceClients
 */
export interface UseServiceClientsReturn {
  // State
  clients: ServiceClient[];
  pagination: PaginationMeta | null;
  loading: LoadingStates;
  errors: ErrorStates;
  selectedClient: ServiceClient | null;
  lastCreatedToken: string | null;
  
  // Actions
  fetchClients: (params?: GetServiceClientsParams) => Promise<void>;
  createClient: (data: CreateServiceClientRequest) => Promise<string | null>;
  rotateToken: (clientId: number, data?: RotateTokenRequest) => Promise<string | null>;
  toggleStatus: (clientId: number) => Promise<boolean>;
  selectClient: (client: ServiceClient | null) => void;
  clearErrors: () => void;
  clearLastCreatedToken: () => void;
}

/**
 * HTTP status codes using const assertion
 */
export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCodeType = typeof HttpStatusCode[keyof typeof HttpStatusCode];

/**
 * Service client status using union type
 */
export type ServiceClientStatus = 'active' | 'inactive';

/**
 * Sort order using union type
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort field options for service clients
 */
export type ServiceClientSortField = 
  | 'name' 
  | 'created_at' 
  | 'updated_at' 
  | 'expires_at' 
  | 'use_count';

/**
 * Constants for service client operations
 */
export const SERVICE_CLIENT_OPERATIONS = {
  FETCH: 'fetch',
  CREATE: 'create',
  ROTATE: 'rotate',
  TOGGLE: 'toggle',
} as const;

export type ServiceClientOperation = typeof SERVICE_CLIENT_OPERATIONS[keyof typeof SERVICE_CLIENT_OPERATIONS];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  PER_PAGE: 3,
  PAGE: 1,
} as const;

/**
 * API endpoints constants - Fixed parameter ordering
 */
export const API_ENDPOINTS = {
  SERVICE_CLIENTS: '/service-clients',
  ROTATE_TOKEN: (id: number) => `/service-clients/${id}/rotate-token`,
  TOGGLE_STATUS: (id: number) => `/service-clients/${id}/toggle-status`,
} as const;

/**
 * Helper functions for API endpoints
 */
export const getRotateTokenEndpoint = (id: number): string => `/service-clients/${id}/rotate-token`;
export const getToggleStatusEndpoint = (id: number): string => `/service-clients/${id}/toggle-status`;
