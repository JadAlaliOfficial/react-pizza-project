/**
 * ================================
 * FIELD RENDERER
 * ================================
 * 
 * Renders a single form field dynamically based on field type.
 * This is the bridge between the runtime form system and field components.
 * 
 * Key Responsibilities:
 * - Look up field component from registry
 * - Map runtime form state to field component props
 * - Handle field visibility
 * - Render field with error states
 * - Emit onChange and onBlur events
 * 
 * Architecture Decisions:
 * - Pure presentational component - no business logic
 * - Receives all state via props (no hooks except registry lookup)
 * - Respects visibility state from parent
 * - RTL/LTR support via direction prop
 * - Handles unknown field types gracefully
 * 
 * Usage Pattern:
 * - Used by FormStageRenderer to render each field in a section
 * - Should not be used directly in application code
 * - All state management handled by parent (useRuntimeForm)
 */

import React from 'react';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type { Direction } from '../types/runtime.types';
import { getFieldComponent } from './fieldRegistry';

// ================================
// COMPONENT PROPS
// ================================

export interface FieldRendererProps {
  /**
   * Field definition from API
   */
  field: FormField;

  /**
   * Current field value
   */
  value: JsonValue;

  /**
   * Validation error message (null if no error)
   */
  error: string | null;

  /**
   * Whether field has been touched by user
   */
  touched: boolean;

  /**
   * Whether field is disabled
   */
  disabled?: boolean;

  /**
   * Whether field is visible (from visibility engine)
   */
  isVisible: boolean;

  /**
   * Text direction for RTL/LTR support
   */
  direction: Direction;

  /**
   * Callback when field value changes
   */
  onChange: (fieldId: number, value: JsonValue) => void;

  /**
   * Callback when field loses focus
   */
  onBlur: (fieldId: number) => void;

  /**
   * Optional CSS class name for container
   */
  className?: string;
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * FieldRenderer - Dynamically renders a form field
 * 
 * This component is responsible for:
 * 1. Looking up the appropriate field component from the registry
 * 2. Mapping runtime props to field component props
 * 3. Handling visibility (hidden fields don't render)
 * 4. Providing consistent container structure
 * 
 * @example
 * ```
 * <FieldRenderer
 *   field={field}
 *   value={fieldValue}
 *   error={fieldError}
 *   touched={fieldTouched}
 *   isVisible={isFieldVisible(field.field_id)}
 *   direction={languageConfig.direction}
 *   onChange={handleFieldChange}
 *   onBlur={handleFieldBlur}
 * />
 * ```
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  error,
  touched,
  disabled = false,
  isVisible,
  direction,
  onChange,
  onBlur,
  className,
}) => {
  // Don't render if field is not visible
  if (!isVisible) {
    return null;
  }

  // Look up field component from registry
  const FieldComponent = getFieldComponent(field.field_type);

  // Build props for field component
  const fieldProps = {
    field,
    value,
    error,
    touched,
    disabled,
    direction,
    onChange,
    onBlur,
  };

  // Render field with optional container class
  return (
    <div className={className} data-field-id={field.field_id} data-field-type={field.field_type}>
      <FieldComponent {...fieldProps} />
    </div>
  );
};

// ================================
// MEMOIZED VERSION
// ================================

/**
 * Memoized version of FieldRenderer for performance optimization
 * Use this in lists or when rendering many fields
 * 
 * Prevents re-renders when parent re-renders but field props haven't changed
 */
export const MemoizedFieldRenderer = React.memo(
  FieldRenderer,
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if these props change
    return (
      prevProps.field.field_id === nextProps.field.field_id &&
      prevProps.value === nextProps.value &&
      prevProps.error === nextProps.error &&
      prevProps.touched === nextProps.touched &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.direction === nextProps.direction
      // onChange and onBlur are stable references from useCallback, so we don't compare them
    );
  }
);

// Set display name for debugging
MemoizedFieldRenderer.displayName = 'MemoizedFieldRenderer';

// ================================
// FIELD LIST RENDERER
// ================================

/**
 * Props for rendering a list of fields
 */
export interface FieldListRendererProps {
  /**
   * Array of fields to render
   */
  fields: FormField[];

  /**
   * Get value for a field by ID
   */
  getFieldValue: (fieldId: number) => JsonValue;

  /**
   * Get error for a field by ID
   */
  getFieldError: (fieldId: number) => string | null;

  /**
   * Get touched state for a field by ID
   */
  getFieldTouched: (fieldId: number) => boolean;

  /**
   * Check if field is visible
   */
  isFieldVisible: (fieldId: number) => boolean;

  /**
   * Whether all fields are disabled
   */
  disabled?: boolean;

  /**
   * Text direction
   */
  direction: Direction;

  /**
   * Change handler
   */
  onChange: (fieldId: number, value: JsonValue) => void;

  /**
   * Blur handler
   */
  onBlur: (fieldId: number) => void;

  /**
   * Optional container class name
   */
  containerClassName?: string;

  /**
   * Optional field wrapper class name
   */
  fieldClassName?: string;
}

/**
 * FieldListRenderer - Renders multiple fields efficiently
 * 
 * Uses memoized field renderers for performance
 * Useful for rendering all fields in a section
 * 
 * @example
 * ```
 * <FieldListRenderer
 *   fields={section.fields}
 *   getFieldValue={getFieldValue}
 *   getFieldError={getFieldError}
 *   getFieldTouched={(id) => fieldValues[id]?.touched}
 *   isFieldVisible={isFieldVisible}
 *   direction={languageConfig.direction}
 *   onChange={setFieldValue}
 *   onBlur={setFieldTouched}
 * />
 * ```
 */
export const FieldListRenderer: React.FC<FieldListRendererProps> = ({
  fields,
  getFieldValue,
  getFieldError,
  getFieldTouched,
  isFieldVisible,
  disabled = false,
  direction,
  onChange,
  onBlur,
  containerClassName,
  fieldClassName,
}) => {
  return (
    <div className={containerClassName}>
      {fields.map((field) => (
        <MemoizedFieldRenderer
          key={field.field_id}
          field={field}
          value={getFieldValue(field.field_id)}
          error={getFieldError(field.field_id)}
          touched={getFieldTouched(field.field_id)}
          disabled={disabled}
          isVisible={isFieldVisible(field.field_id)}
          direction={direction}
          onChange={onChange}
          onBlur={onBlur}
          className={fieldClassName}
        />
      ))}
    </div>
  );
};

// ================================
// CONDITIONAL FIELD RENDERER
// ================================

/**
 * Props for conditional field rendering
 */
export interface ConditionalFieldRendererProps extends FieldRendererProps {
  /**
   * Custom render function when field is hidden
   * If not provided, nothing is rendered
   */
  renderWhenHidden?: () => React.ReactNode;

  /**
   * Whether to preserve space when hidden (render empty div)
   */
  preserveSpace?: boolean;
}

/**
 * ConditionalFieldRenderer - Renders field with custom hidden behavior
 * 
 * Allows custom rendering when field is hidden (e.g., placeholder, skeleton)
 * Useful for maintaining layout when fields show/hide
 * 
 * @example
 * ```
 * <ConditionalFieldRenderer
 *   {...fieldProps}
 *   preserveSpace={true}
 *   renderWhenHidden={() => <div className="h-16" />}
 * />
 * ```
 */
export const ConditionalFieldRenderer: React.FC<ConditionalFieldRendererProps> = ({
  renderWhenHidden,
  preserveSpace = false,
  className,
  ...fieldProps
}) => {
  // Field is not visible
  if (!fieldProps.isVisible) {
    // Custom render function provided
    if (renderWhenHidden) {
      return <div className={className}>{renderWhenHidden()}</div>;
    }

    // Preserve space with empty div
    if (preserveSpace) {
      return <div className={className} aria-hidden="true" />;
    }

    // Don't render anything
    return null;
  }

  // Field is visible - render normally
  return <FieldRenderer {...fieldProps} className={className} />;
};

// ================================
// DEBUGGING COMPONENT
// ================================

/**
 * DebugFieldRenderer - Renders field with debug information
 * Only renders debug info in development mode
 * 
 * @example
 * ```
 * <DebugFieldRenderer
 *   field={field}
 *   value={value}
 *   error={error}
 *   touched={touched}
 *   isVisible={isVisible}
 *   direction={direction}
 *   onChange={onChange}
 *   onBlur={onBlur}
 * />
 * ```
 */
export const DebugFieldRenderer: React.FC<FieldRendererProps> = (props) => {
  if (process.env.NODE_ENV !== 'development') {
    return <FieldRenderer {...props} />;
  }

  return (
    <div className="relative">
      {/* Debug info overlay */}
      <div className="absolute right-0 top-0 z-50 rounded-bl bg-gray-800 px-2 py-1 text-xs text-white opacity-75">
        <div>ID: {props.field.field_id}</div>
        <div>Type: {props.field.field_type}</div>
        <div>Visible: {props.isVisible ? '✅' : '❌'}</div>
        <div>Touched: {props.touched ? '✅' : '❌'}</div>
        <div>Error: {props.error ? '❌' : '✅'}</div>
      </div>

      {/* Actual field */}
      <FieldRenderer {...props} />
    </div>
  );
};

// ================================
// DEFAULT EXPORT
// ================================

export default FieldRenderer;
