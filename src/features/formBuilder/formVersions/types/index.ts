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

// ============================================================================
// Action Types
// ============================================================================

/**
 * Send Email Action Props
 */
export interface SendEmailActionProps {
  emailSubject?: string;
  emailContent?: string;
  emailAttachments?: string[];
  receiversUsers?: number[];
  receiversRoles?: number[];
  receiversPermissions?: number[];
  receiversEmails?: string[];
  ccUsers?: number[];
  ccEmails?: string[];
  bccUsers?: number[];
  bccEmails?: string[];
}

/**
 * Send Notification Action Props
 */
export interface SendNotificationActionProps {
  notificationTitle?: string;
  notificationBody?: string;
  notificationType?: 'info' | 'success' | 'warning' | 'error';
  notificationIcon?: string;
  notificationLink?: string;
  receiversUsers?: number[];
  receiversRoles?: number[];
  receiversPermissions?: number[];
}

/**
 * Call Webhook Action Props
 */
export interface CallWebhookActionProps {
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  webhookHeaders?: Record<string, string>;
  webhookPayload?: Record<string, any>;
  webhookTimeout?: number;
}

/**
 * Union type for all action props
 */
export type ActionProps =
  | SendEmailActionProps
  | SendNotificationActionProps
  | CallWebhookActionProps;

/**
 * Action type discriminator
 */
export type ActionType = 'Send Email' | 'Send Notification' | 'Call Webhook';

/**
 * Transition Action entity - side-effects executed on stage transitions
 * Generic version for UI state management
 */
export interface TransitionAction<T extends ActionProps = ActionProps> {
  id?: number; // Optional, present after save
  stage_transition_id?: number; // Present in GET response
  action_id?: number; // Backend action ID (optional for static actions)
  actionType: ActionType; // UI-friendly action type
  actionProps: T; // Typed action configuration
}

/**
 * Backend API format for Transition Action
 * Used for serialization to/from API
 */
export interface TransitionActionAPI {
  id: number | null;
  action_id: number;
  action_props: string; // JSON string containing action configuration
}

// ============================================================================
// Stage Transition Types
// ============================================================================

/**
 * Stage Transition entity - defines transitions between stages
 */
export interface StageTransition {
  id?: number | string | null; // Supports fake IDs in some contexts
  form_version_id?: number; // Present in GET response, optional in UPDATE request
  from_stage_id: number;
  to_stage_id: number | null;
  to_complete: boolean;
  label: string;
  condition: string | null;
  created_at?: string;
  updated_at?: string;
  actions: TransitionAction[];
}

/**
 * Backend API format for Stage Transition
 * Used for serialization to/from API
 */
export interface StageTransitionAPI {
  id?: number | string | null;
  form_version_id?: number;
  from_stage_id: number | string; // Can be fake ID
  to_stage_id: number | string | null;   // Can be fake ID or null for completion
  to_complete: boolean;
  label: string;
  condition: string | null;
  created_at?: string;
  updated_at?: string;
  actions: TransitionActionAPI[];
}

// ============================================================================
// Form Types
// ============================================================================

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
  stage_transitions: StageTransitionAPI[];
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

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Type guard to check if action is Send Email
 */
export function isSendEmailAction(
  action: TransitionAction
): action is TransitionAction<SendEmailActionProps> {
  return action.actionType === 'Send Email';
}

/**
 * Type guard to check if action is Send Notification
 */
export function isSendNotificationAction(
  action: TransitionAction
): action is TransitionAction<SendNotificationActionProps> {
  return action.actionType === 'Send Notification';
}

/**
 * Type guard to check if action is Call Webhook
 */
export function isCallWebhookAction(
  action: TransitionAction
): action is TransitionAction<CallWebhookActionProps> {
  return action.actionType === 'Call Webhook';
}

// ============================================================================
// Serialization Helpers
// ============================================================================

/**
 * Convert UI TransitionAction to API format
 */
export function serializeTransitionAction(
  action: TransitionAction,
  actionIdMap: Record<ActionType, number>
): TransitionActionAPI {
  return {
    id: typeof action.id === 'number' ? action.id : null,
    action_id: actionIdMap[action.actionType],
    action_props: JSON.stringify(action.actionProps),
  };
}

/**
 * Convert API TransitionAction to UI format
 */
export function deserializeTransitionAction(
  apiAction: TransitionActionAPI,
  actionTypeMap: Record<number, ActionType>
): TransitionAction {
  const actionType = actionTypeMap[apiAction.action_id];
  return {
    id: apiAction.id ?? undefined,
    action_id: apiAction.action_id,
    actionType,
    actionProps: JSON.parse(apiAction.action_props),
  };
}

/**
 * Convert UI StageTransition to API format
 */
export function serializeStageTransition(
  transition: StageTransition,
  actionIdMap: Record<ActionType, number>
): StageTransitionAPI {
  return {
    ...transition,
    actions: transition.actions.map((action) =>
      serializeTransitionAction(action, actionIdMap)
    ),
  };
}

/**
 * Convert API StageTransition to UI format
 */
export function deserializeStageTransition(
  apiTransition: StageTransitionAPI,
  actionTypeMap: Record<number, ActionType>
): StageTransition {
  return {
    id: apiTransition.id,
    form_version_id: apiTransition.form_version_id,
    from_stage_id: typeof apiTransition.from_stage_id === 'number' 
      ? apiTransition.from_stage_id 
      : parseInt(apiTransition.from_stage_id, 10),
    to_stage_id:
      apiTransition.to_stage_id === null
        ? null
        : typeof apiTransition.to_stage_id === 'number'
        ? apiTransition.to_stage_id
        : parseInt(apiTransition.to_stage_id, 10),
    to_complete: apiTransition.to_complete,
    label: apiTransition.label,
    condition: apiTransition.condition,
    created_at: apiTransition.created_at,
    updated_at: apiTransition.updated_at,
    actions: apiTransition.actions.map((action) =>
      deserializeTransitionAction(action, actionTypeMap)
    ),
  };
}

