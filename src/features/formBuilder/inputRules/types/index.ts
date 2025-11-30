// inputRules.types.ts

/**
 * Pivot table relationship between InputRule and FieldType
 */
export interface FieldTypePivot {
  input_rule_id: number;
  field_type_id: number;
}

/**
 * Field type entity that can be associated with input rules
 */
export interface FieldType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: FieldTypePivot;
}

/**
 * Input rule entity with associated field types
 */
export interface InputRule {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  field_types: FieldType[];
}

/**
 * Generic API response wrapper
 * @template T - The type of data contained in the response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Specific response type for input rules endpoint
 */
export type InputRulesResponse = ApiResponse<InputRule[]>;

/**
 * Error response structure from API
 */
export interface ApiErrorResponse {
  success: false;
  message?: string;
  errors?: Record<string, string[]>;
}
