/**
 * ================================
 * FORMS MODULE - Type Definitions
 * ================================
 * All structures, DTOs, API responses, and query params used in the Forms feature.
 * Applies strict typing, nullability where detected,
 * and full JSDoc comments for code intelligence and documentation.
 */

/**
 * Unique identifier for entities (database ID)
 */
export type Id = number;

/**
 * Date/time in ISO 8601 string format
 */
export type IsoDateString = string;

/**
 * Category used to group forms.
 */
export interface Category {
  /** Category ID (unique) */
  id: Id;
  /** Human-readable category name */
  name: string;
  /** Date/time the category was created */
  created_at: IsoDateString;
  /** Date/time the category was last updated */
  updated_at: IsoDateString;
}

/**
 * A Section is a logical group of fields inside a Stage.
 * Appears conditionally, based on field values (visibility_condition).
 */
export interface Section {
  /** Section ID (unique) */
  id: Id;
  /** ID of the Stage this Section belongs to */
  stage_id: Id;
  /** Displayed name of the Section */
  name: string;
  /** Condition for visibility (optional, structure TBD) */
  visibility_condition: string | null;
  /** Date/time the Section was created */
  created_at: IsoDateString;
  /** Date/time the Section was last updated */
  updated_at: IsoDateString;
}

/**
 * Stage: a step in a FormVersion workflow.
 * Always has is_initial=true for the first stage.
 */
export interface Stage {
  /** Stage ID (unique) */
  id: Id;
  /** ID of the FormVersion this Stage belongs to */
  form_version_id: Id;
  /** Human-readable name for the Stage */
  name: string;
  /** True if initial stage in workflow */
  is_initial: boolean;
  /** Condition for displaying this stage (optional, structure TBD) */
  visibility_condition?: string | null;
  /** Creation date/time */
  created_at: IsoDateString;
  /** Last updated date/time */
  updated_at: IsoDateString;
  /** List of Sections that are part of this Stage (optional, included when expanding) */
  sections?: Section[];
}

/**
 * Status of a form version.
 */
export type FormVersionStatus = 'draft' | 'published' | 'archived';

/**
 * Version of a Form, containing a specific structure (stages/sections).
 */
export interface FormVersion {
  /** Version ID (unique) */
  id: Id;
  /** The parent Form's ID */
  form_id: Id;
  /** Version number, starting from 0 */
  version_number: number;
  /** Current status (draft/published/archived) */
  status: FormVersionStatus;
  /** Date/time published (null if not published) */
  published_at: IsoDateString | null;
  /** Date/time created */
  created_at: IsoDateString;
  /** Date/time last updated */
  updated_at: IsoDateString;
  /** Stages in this version structure (optional, for detailed expansion or editing) */
  stages?: Stage[];
}

/**
 * Top-level Form entity representing a business process.
 */
export interface Form {
  /** Form ID (unique) */
  id: Id;
  /** Name of the form (default language or localized) */
  name: string;
  /** ID of the category (or null if unassigned) */
  category_id: Id | null;
  /** Is this form currently archived? */
  is_archived: boolean;
  /** Date/time created */
  created_at: IsoDateString;
  /** Date/time last updated */
  updated_at: IsoDateString;
  /** Category data (populated by API when included) */
  category?: Category;
  /** All versions of the form (populated when included in API response) */
  form_versions: FormVersion[];
}

/**
 * Pagination metadata for paginated responses (lists).
 */
export interface Pagination {
  /** Number of the current page */
  current_page: number;
  /** Number of the last available page */
  last_page: number;
  /** Number of items per page */
  per_page: number;
  /** Total items in all pages */
  total: number;
}

/**
 * API Responses for listing Forms.
 */
export interface ListFormsResponse {
  /** Success status of the request */
  success: boolean;
  /** Array of Form entities for this page */
  data: Form[];
  /** Pagination detail */
  pagination: Pagination;
}

/**
 * API Response for a single Form (GET, POST, PUT)
 */
export interface GetFormResponse {
  /** Success status */
  success: boolean;
  /** Form with expanded details */
  data: Form;
  /** Optional success message */
  message?: string;
}

/**
 * API Response for successful archive/restore actions.
 */
export interface ActionResponse {
  /** Success flag for the action */
  success: boolean;
  /** Human-friendly message (required) */
  message: string;
}

/**
 * CreateForm DTO for requests (POST)
 */
export interface CreateFormDto {
  name: string;
  /** Optional category; if omitted or null, form is without category */
  category_id?: number | null;
}

/**
 * UpdateForm DTO for requests (PUT)
 */
export interface UpdateFormDto {
  /** New name for the form */
  name: string;
  /** Category for assignment */
  category_id: number | null;
}

/**
 * Query params for List Forms endpoint.
 * Use to construct search, sort, and pagination queries.
 */
export interface ListFormsQueryParams {
  /** Page number (starts at 1) */
  page?: number;
  /** Number of items per page */
  per_page?: number;
  /** Optional name filter */
  name?: string;
  /** Optional status filter (draft/published/archived) */
  status?: FormVersionStatus | '';
  /** Optional category ID filter */
  category_id?: Id | '';
  /** Sort key (e.g. creation_time) */
  sort_by?: 'creation_time' | 'publish_time' | 'latest_submission';
  /** Sort order (asc or desc) */
  sort_order?: 'asc' | 'desc';
}

/**
 * General API Error shape used for normalization.
 */
export interface ApiError {
  /** Error code if applicable (optional) */
  code?: string;
  /** Error message (human-consumable) */
  message: string;
  /** Source of error or details (optional) */
  details?: unknown;
}
