/**
 * TypeScript type definitions for User Roles Store Assignment feature
 * 
 * This file contains all type definitions for API requests, responses,
 * and state management related to user role store assignments.
 * 
 * @author Your Team
 * @version 1.0.0
 */

// ==================== Base Entity Types ====================

/**
 * Base user entity structure
 */
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Role entity structure with guard information
 */
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Store entity with flexible metadata structure
 */
export interface Store {
  id: string;
  name: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Flexible metadata structure for assignments
 * Can contain various properties like start_date, notes, department, etc.
 */
export interface AssignmentMetadata {
  start_date?: string;
  end_date?: string;
  notes?: string;
  department?: string;
  [key: string]: any;
}

/**
 * Core assignment entity with related entities
 */
export interface Assignment {
  id?: number;
  user_id: number;
  role_id: number;
  store_id: string;
  metadata: AssignmentMetadata;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  role?: Role;
  store?: Store;
}

// ==================== API Request Types ====================

/**
 * Request payload for assigning a user role to a store
 */
export interface AssignUserRoleRequest {
  user_id: number;
  role_id: number;
  store_id: string;
  metadata: AssignmentMetadata;
  is_active: boolean;
}

/**
 * Request payload for removing user role from store or toggling status
 */
export interface RemoveToggleUserRoleRequest {
  user_id: number;
  role_id: number;
  store_id: string;
}

/**
 * Single assignment item for bulk operations
 */
export interface BulkAssignmentItem {
  role_id: number;
  store_id: string;
  metadata: AssignmentMetadata;
}

/**
 * Request payload for bulk assigning user roles
 */
export interface BulkAssignUserRolesRequest {
  user_id: number;
  assignments: BulkAssignmentItem[];
}

/**
 * Query parameters for fetching store assignments
 */
export interface GetStoreAssignmentsParams {
  store_id: string;
}

/**
 * Query parameters for fetching user assignments
 */
export interface GetUserAssignmentsParams {
  user_id: number;
}

// ==================== API Response Types ====================

/**
 * Base API response structure
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

/**
 * Response for successful assignment operation
 */
export interface AssignUserRoleResponse extends BaseApiResponse {
  data: {
    assignment: Assignment;
  };
}

/**
 * Response for remove/toggle operations (simple success response)
 */
export interface RemoveToggleUserRoleResponse extends BaseApiResponse {}

/**
 * Response for bulk assignment operations
 */
export interface BulkAssignUserRolesResponse extends BaseApiResponse {
  data: {
    assignments: Assignment[];
  };
}

/**
 * Response for fetching assignments (both store and user assignments)
 */
export interface GetAssignmentsResponse extends BaseApiResponse {
  data: {
    assignments: Assignment[];
  };
}

// ==================== Redux State Types ====================

/**
 * Loading state union type for better type safety
 */
export type LoadingState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

/**
 * Error state structure for consistent error handling
 */
export interface ErrorState {
  message: string;
  code?: string | number;
  details?: any;
  timestamp: string;
}

/**
 * Individual operation state for tracking specific API calls
 */
export interface OperationState {
  loading: LoadingState;
  error: ErrorState | null;
}

/**
 * Main Redux state interface for user roles store assignments
 */
export interface UserRolesStoresAssignmentState {
  // Current assignments data
  assignments: Assignment[];
  storeAssignments: Record<string, Assignment[]>; // Keyed by store_id
  userAssignments: Record<number, Assignment[]>; // Keyed by user_id
  
  // Operation states for different API calls
  operations: {
    assign: OperationState;
    remove: OperationState;
    toggle: OperationState;
    bulkAssign: OperationState;
    fetchStoreAssignments: OperationState;
    fetchUserAssignments: OperationState;
  };
  
  // Global loading state (useful for general UI loading indicators)
  isLoading: boolean;
  
  // Last updated timestamps for cache invalidation
  lastUpdated: {
    assignments: string | null;
    storeAssignments: Record<string, string>; // Keyed by store_id
    userAssignments: Record<number, string>; // Keyed by user_id
  };
}

// ==================== Hook Return Types ====================

/**
 * Return type for assignment operations hook
 */
export interface UseAssignmentOperations {
  // Action dispatchers
  assignUserRole: (payload: AssignUserRoleRequest) => Promise<any>;
  removeUserRole: (payload: RemoveToggleUserRoleRequest) => Promise<any>;
  toggleUserRoleStatus: (payload: RemoveToggleUserRoleRequest) => Promise<any>;
  bulkAssignUserRoles: (payload: BulkAssignUserRolesRequest) => Promise<any>;
  
  // Operation states
  isAssigning: boolean;
  isRemoving: boolean;
  isToggling: boolean;
  isBulkAssigning: boolean;
  
  // Error states
  assignError: ErrorState | null;
  removeError: ErrorState | null;
  toggleError: ErrorState | null;
  bulkAssignError: ErrorState | null;
}

/**
 * Return type for assignment data hook
 */
export interface UseAssignmentData {
  // Data getters
  getStoreAssignments: (storeId: string) => Assignment[];
  getUserAssignments: (userId: number) => Assignment[];
  getAllAssignments: () => Assignment[];
  
  // Data fetchers
  fetchStoreAssignments: (storeId: string) => Promise<any>;
  fetchUserAssignments: (userId: number) => Promise<any>;
  
  // Loading states
  isLoadingStoreAssignments: () => boolean;
  isLoadingUserAssignments: () => boolean;
  isLoading: boolean;
  
  // Error states
  getStoreAssignmentsError: () => ErrorState | null;
  getUserAssignmentsError: () => ErrorState | null;
}

// ==================== Utility Types ====================

/**
 * API endpoints constants
 */
export const API_ENDPOINTS = {
  ASSIGN: '/user-role-store/assign',
  REMOVE: '/user-role-store/remove',
  TOGGLE: '/user-role-store/toggle',
  BULK_ASSIGN: '/user-role-store/bulk-assign',
  STORE_ASSIGNMENTS: '/user-role-store/store-assignments',
  USER_ASSIGNMENTS: '/user-role-store/user-assignments'
} as const;

/**
 * HTTP methods constants
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

/**
 * Common headers structure for API requests
 */
export interface ApiHeaders {
  'Authorization': string;
  'Accept': 'application/json';
  'Content-Type'?: 'application/json';
}

/**
 * Generic API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string | number;
}

/**
 * Type guard for checking if response is an error
 */
export type ApiResponse<T> = T | ApiErrorResponse;

/**
 * Discriminated union for operation results
 */
export type OperationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ErrorState };

// ==================== Type Utilities ====================

/**
 * Extract the type of API endpoint values
 */
export type ApiEndpointType = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

/**
 * Extract the type of HTTP method values
 */
export type HttpMethodType = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

/**
 * Utility type for making certain fields optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for making certain fields required
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Type for partial assignment updates
 */
export type PartialAssignment = Optional<Assignment, 'id' | 'created_at' | 'updated_at'>;

// types.ts
export interface AssignmentData {
  selectedUsers: number[];
  selectedRoles: number[];
  selectedStores: string[];
}

export interface AssignmentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface AssignmentResult {
  success: boolean;
  message: string;
}