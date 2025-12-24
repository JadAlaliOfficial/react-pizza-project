/**
 * ================================
 * VALIDATION ENGINE TYPES
 * ================================
 */

import type {
  FormField,
  FieldRule,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type { RuntimeFieldValues } from '../../types/runtime.types';

/**
 * Result of validating a single field
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Extracted cross-field validation rules
 */
export interface CrossFieldRules {
  sameAs: number | null;
  differentFrom: number | null;
}

export type {
  FormField,
  FieldRule,
  JsonValue,
  RuntimeFieldValues,
};

