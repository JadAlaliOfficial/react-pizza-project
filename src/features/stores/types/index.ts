/**
 * Store Management Types
 * Defines all TypeScript interfaces and types for Store entities,
 * API responses, and Redux state management.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Store metadata containing additional information about the store
 */
export interface StoreMetadata {
  phone?: string;
  address?: string;
  [key: string]: any; // Allow for additional metadata fields
}

/**
 * Core Store entity interface
 */
export interface Store {
  id: string;
  name: string;
  metadata: StoreMetadata;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User pivot data when associated with a store
 */
export interface UserStorePivot {
  store_id: string;
  user_id: number;
  role_id: number;
  metadata: string; // JSON string containing additional pivot data
  is_active: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

/**
 * Store User entity with pivot relationship data
 */
export interface StoreUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  pivot: UserStorePivot;
}

/**
 * Role pivot data when associated with a store
 */
export interface RoleStorePivot {
  store_id: string;
  role_id: number;
  user_id: number;
  metadata: string; // JSON string containing additional pivot data
  is_active: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

/**
 * Store Role entity with pivot relationship data
 */
export interface StoreRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: RoleStorePivot;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Pagination link structure from Laravel API
 */
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Pagination metadata from Laravel API
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
 * Paginated stores response from GET /stores
 */
export interface GetStoresResponse {
  success: boolean;
  data: PaginationMeta & {
    data: Store[];
  };
}

/**
 * Single store response from GET /stores/:id
 */
export interface GetStoreResponse {
  success: boolean;
  data: {
    store: Store;
  };
}

/**
 * Store creation response from POST /stores
 */
export interface CreateStoreResponse {
  success: boolean;
  message: string;
  data: {
    store: Store;
  };
}

/**
 * Store update response from PUT /stores/:id
 */
export interface UpdateStoreResponse {
  success: boolean;
  message: string;
  data: {
    store: Store;
  };
}

/**
 * Store users response from GET /stores/:id/users
 */
export interface GetStoreUsersResponse {
  success: boolean;
  data: {
    users: StoreUser[];
  };
}

/**
 * Store roles response from GET /stores/:id/roles
 */
export interface GetStoreRolesResponse {
  success: boolean;
  data: {
    roles: StoreRole[];
  };
}

// ============================================================================
// Request Payload Types
// ============================================================================

/**
 * Query parameters for fetching stores
 */
export interface GetStoresParams {
  per_page?: number;
  page?: number;
  search?: string;
  is_active?: boolean;
}

/**
 * Payload for creating a new store
 */
export interface CreateStorePayload {
  id: string;
  name: string;
  metadata: StoreMetadata;
  is_active: boolean;
}

/**
 * Payload for updating an existing store
 */
export interface UpdateStorePayload {
  name: string;
  metadata: StoreMetadata;
  is_active?: boolean;
}

// ============================================================================
// Redux State Types
// ============================================================================

/**
 * Individual async operation state
 */
export interface AsyncState {
  loading: boolean;
  error: string | null;
}

/**
 * Store-specific async states for different operations
 */
export interface StoreAsyncStates {
  fetchStores: AsyncState;
  fetchStore: AsyncState;
  createStore: AsyncState;
  updateStore: AsyncState;
  fetchStoreUsers: AsyncState;
  fetchStoreRoles: AsyncState;
}

/**
 * Paginated stores data structure
 */
export interface PaginatedStores {
  stores: Store[];
  pagination: PaginationMeta;
}

/**
 * Main Redux state for stores feature
 */
export interface StoresState {
  // Data
  stores: PaginatedStores | null;
  currentStore: Store | null;
  storeUsers: Record<string, StoreUser[]>; // Keyed by store ID
  storeRoles: Record<string, StoreRole[]>; // Keyed by store ID
  
  // Async states
  asyncStates: StoreAsyncStates;
  
  // UI state
  selectedStoreId: string | null;
  searchQuery: string;
  currentPage: number;
  perPage: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Serialized error for Redux store
 */
export interface SerializedError {
  message: string;
  status?: number;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Store operation result for UI feedback
 */
export interface StoreOperationResult {
  success: boolean;
  message: string;
  store?: Store;
}

/**
 * Filter options for stores list
 */
export interface StoreFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}

/**
 * Sort options for stores list
 */
export interface StoreSortOptions {
  field: 'name' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useStores hook
 */
export interface UseStoresReturn {
  stores: Store[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: GetStoresParams) => Promise<void>;
  changePage: (page: number) => void;
}

/**
 * Return type for useStore hook
 */
export interface UseStoreReturn {
  store: Store | null;
  loading: boolean;
  error: string | null;
  refetch: (storeId: string) => Promise<void>;
}

/**
 * Return type for useStoreOperations hook
 */
export interface UseStoreOperationsReturn {
  createStore: (payload: CreateStorePayload) => Promise<StoreOperationResult>;
  updateStore: (storeId: string, payload: UpdateStorePayload) => Promise<StoreOperationResult>;
  deleteStore?: (storeId: string) => Promise<StoreOperationResult>; // For future implementation
  loading: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  errors: {
    create: string | null;
    update: string | null;
    delete: string | null;
  };
}

/**
 * Return type for useStoreUsers hook
 */
export interface UseStoreUsersReturn {
  users: StoreUser[];
  loading: boolean;
  error: string | null;
  refetch: (storeId: string) => Promise<void>;
}

/**
 * Return type for useStoreRoles hook
 */
export interface UseStoreRolesReturn {
  roles: StoreRole[];
  loading: boolean;
  error: string | null;
  refetch: (storeId: string) => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: 5,
} as const;

/**
 * Store status options
 */
export const STORE_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

/**
 * API endpoints (relative to base URL)
 */
export const STORE_ENDPOINTS = {
  STORES: '/stores',
  STORE_DETAIL: (id: string) => `/stores/${id}`,
  STORE_USERS: (id: string) => `/stores/${id}/users`,
  STORE_ROLES: (id: string) => `/stores/${id}/roles`,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if an object is a valid Store
 */
export const isStore = (obj: any): obj is Store => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    obj.metadata &&
    typeof obj.metadata === 'object' &&
    (obj.metadata.phone === undefined || typeof obj.metadata.phone === 'string') &&
    (obj.metadata.address === undefined || typeof obj.metadata.address === 'string') &&
    typeof obj.is_active === 'boolean' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
};

/**
 * Type guard to check if response is a valid API response
 */
export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj.success === 'boolean';
};
