/**
 * ================================
 * CATEGORIES MODULE - Type Definitions
 * ================================
 * All structures, DTOs, API responses, and query params used in the Categories feature.
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
 * Category entity used to group forms.
 * Forms can be assigned to a category or remain without category (null reference).
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
 * API Response for listing all categories (GET)
 */
export interface ListCategoriesResponse {
  /** Success status of the request */
  success: boolean;
  /** Array of Category entities */
  data: Category[];
}

/**
 * API Response for a single Category (GET, POST, PUT)
 */
export interface GetCategoryResponse {
  /** Success status */
  success: boolean;
  /** Category with details */
  data: Category;
  /** Optional success message (present in POST/PUT responses) */
  message?: string;
}

/**
 * API Response for successful actions (assign, unassign, delete)
 */
export interface CategoryActionResponse {
  /** Success flag for the action */
  success: boolean;
  /** Human-friendly message (required) */
  message: string;
}

/**
 * CreateCategory DTO for requests (POST)
 */
export interface CreateCategoryDto {
  /** Name of the new category */
  name: string;
}

/**
 * UpdateCategory DTO for requests (PUT)
 */
export interface UpdateCategoryDto {
  /** Updated name for the category */
  name: string;
}

/**
 * AssignFormsToCategory DTO for requests (POST)
 * Used to assign one or multiple forms to a specific category.
 */
export interface AssignFormsToCategoryDto {
  /** The category ID to assign forms to */
  category_id: Id;
  /** Array of form IDs to assign to the category */
  form_ids: Id[];
}

/**
 * UnassignFormsFromCategory DTO for requests (POST)
 * Used to remove category assignment from one or multiple forms.
 * Forms will become "without category" (category_id = null).
 */
export interface UnassignFormsFromCategoryDto {
  /** Array of form IDs to unassign from their current categories */
  form_ids: Id[];
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
