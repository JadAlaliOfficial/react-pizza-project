// formVersion.types.ts

/**
 * Production-ready TypeScript types for Form Version feature
 * Covers GET, UPDATE, and PUBLISH endpoints with exact API response structures
 */

// ============================================================================
// Core Domain Models
// ============================================================================

/**
 * Field Type entity - represents the type of input field
 */
export interface FieldType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Input Rule entity - validation rules applied to fields
 */
export interface InputRule {
  id: number;
  input_rule_id: number;
  rule_props: string | null;
  rule_condition: string | null;
}

/**
 * Field entity - represents a field instance within a section
 */
export interface Field {
  id?: number; // Optional for create operations
  section_id?: number; // Present in GET response, optional in UPDATE request
  field_type_id: number;
  label: string;
  placeholder: string | null;
  helper_text: string | null;
  default_value: string | null;
  visibility_condition: string | null;
  visibility_conditions?: string | null; // Alternate naming in UPDATE
  created_at?: string;
  updated_at?: string;
  field_type?: FieldType; // Present in GET response
  rules: InputRule[];
}

/**
 * Section entity - groups fields within a stage
 */
export interface Section {
  id?: number; // Optional for create operations
  stage_id?: number; // Present in GET response, optional in UPDATE request
  name: string;
  order?: number; // Present in UPDATE request
  visibility_condition?: string | null; // Present in GET response
  visibility_conditions?: string | null; // Present in UPDATE request
  created_at?: string;
  updated_at?: string;
  fields: Field[];
}

/**
 * Access Rule entity - controls who can access a stage
 */
export interface AccessRule {
  allowed_users: string | null;
  allowed_roles: string | null;
  allowed_permissions: string | null;
  allow_authenticated_users: boolean;
  email_field_id: number | null;
}

/**
 * Stage entity - represents a workflow step in the form
 */
export interface Stage {
  id?: number; // Optional for create operations
  form_version_id?: number; // Present in GET response, optional in UPDATE request
  name: string;
  is_initial: boolean;
  visibility_condition: string | null;
  created_at?: string;
  updated_at?: string;
  sections: Section[];
  access_rule: AccessRule | null;
}

/**
 * Action entity - side-effects executed on stage transitions
 */
export interface TransitionAction {
  action_id: number;
  action_props: string; // JSON string containing action configuration
}

/**
 * Stage Transition entity - defines transitions between stages
 */
export interface StageTransition {
  id?: number; // Optional for create operations
  form_version_id?: number; // Present in GET response, optional in UPDATE request
  from_stage_id: number;
  to_stage_id: number;
  to_complete: boolean;
  label: string;
  condition: string | null;
  created_at?: string;
  updated_at?: string;
  actions: TransitionAction[];
}

/**
 * Form entity - top-level form metadata
 */
export interface Form {
  id: number;
  name: string;
  category_id: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Form Version entity - specific snapshot of a form configuration
 */
export interface FormVersion {
  id: number;
  form_id: number;
  version_number: number;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  form?: Form; // Present in GET response
  stages?: Stage[]; // Present in GET response
  stage_transitions?: StageTransition[]; // Present in GET response
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Update Form Version request body
 * Matches the structure expected by PUT /api/form-versions/{id}
 */
export interface UpdateFormVersionRequest {
  stages: Stage[];
  stage_transitions: StageTransition[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic API success wrapper for responses that include success flag
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * GET Form Version response
 * GET /api/form-versions/{id}
 */
export interface GetFormVersionResponse {
  success: true;
  data: FormVersion;
}

/**
 * UPDATE Form Version response (no wrapper, returns data directly)
 * PUT /api/form-versions/{id}
 * Note: This endpoint returns the request body structure, not a wrapped response
 */
export type UpdateFormVersionResponse = UpdateFormVersionRequest;

/**
 * PUBLISH Form Version response
 * POST /api/form-versions/{id}/publish
 */
export interface PublishFormVersionResponse {
  success: true;
  message: string;
  data: {
    id: number;
    form_id: number;
    version_number: number;
    status: 'published';
    published_at: string;
    created_at: string;
    updated_at: string;
  };
}

// ============================================================================
// Service Layer Types
// ============================================================================

/**
 * Normalized service error structure
 * Used for consistent error handling across all service methods
 */
export interface ServiceError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Service method return types
 */
export type GetFormVersionResult = FormVersion;
export type UpdateFormVersionResult = UpdateFormVersionRequest;
export type PublishFormVersionResult = PublishFormVersionResponse['data'];

// ============================================================================
// Redux State Types
// ============================================================================

/**
 * Loading states for async operations
 */
export interface FormVersionLoadingState {
  fetch: boolean;
  update: boolean;
  publish: boolean;
}

/**
 * Error states for async operations
 */
export interface FormVersionErrorState {
  fetch: ServiceError | null;
  update: ServiceError | null;
  publish: ServiceError | null;
}

/**
 * Redux slice state for form versions
 * Normalized structure for scalability
 */
export interface FormVersionState {
  // Current form version being worked on
  current: FormVersion | null;
  
  // Normalized data for quick access
  stages: Stage[];
  stageTransitions: StageTransition[];
  
  // Loading flags per operation
  loading: FormVersionLoadingState;
  
  // Error state per operation
  errors: FormVersionErrorState;
  
  // Last fetch timestamp for cache invalidation
  lastFetched: number | null;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useFormVersion hook
 */
export interface UseFormVersionReturn {
  formVersion: FormVersion | null;
  stages: Stage[];
  stageTransitions: StageTransition[];
  loading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<void>;
}

/**
 * Return type for useUpdateFormVersion hook
 */
export interface UseUpdateFormVersionReturn {
  updateFormVersion: (id: number, data: UpdateFormVersionRequest) => Promise<void>;
  loading: boolean;
  error: ServiceError | null;
}

/**
 * Return type for usePublishFormVersion hook
 */
export interface UsePublishFormVersionReturn {
  publishFormVersion: (id: number) => Promise<void>;
  loading: boolean;
  error: ServiceError | null;
}
