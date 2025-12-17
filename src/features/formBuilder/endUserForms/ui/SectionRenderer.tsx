/**
 * ================================
 * SECTION RENDERER
 * ================================
 *
 * Renders a form section with its fields.
 * Handles section visibility, layout, and field organization.
 *
 * Key Responsibilities:
 * - Render section header (title, description)
 * - Render all fields within the section
 * - Handle section visibility
 * - Apply section-level styling and layout
 * - Support RTL/LTR layouts
 * - Handle empty sections gracefully
 *
 * Architecture Decisions:
 * - Pure presentational component
 * - Delegates field rendering to FieldListRenderer
 * - Receives visibility state from parent
 * - Supports custom section layouts via props
 * - Semantic HTML with proper accessibility
 *
 * Usage Pattern:
 * - Used by FormStageRenderer to render each section
 * - Should not be used directly in application code
 * - All state management handled by parent
 */

import React from 'react';
import type { FormSection } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type { Direction } from '../types/runtime.types';
import { FieldListRenderer } from './FieldRenderer';

// ================================
// COMPONENT PROPS
// ================================

export interface SectionRendererProps {
  /**
   * Section definition from API
   */
  section: FormSection;

  /**
   * Whether section is visible (from visibility engine)
   */
  isVisible: boolean;

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
   * Optional CSS class name for section container
   */
  className?: string;

  /**
   * Optional CSS class name for section header
   */
  headerClassName?: string;

  /**
   * Optional CSS class name for fields container
   */
  fieldsContainerClassName?: string;

  /**
   * Optional CSS class name for individual fields
   */
  fieldClassName?: string;

  /**
   * Whether to show section even if it has no visible fields
   */
  showEmptySections?: boolean;
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * SectionRenderer - Renders a form section with header and fields
 *
 * @example
 * ```
 * <SectionRenderer
 *   section={section}
 *   isVisible={isSectionVisible(section.section_id)}
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
export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  isVisible,
  getFieldValue,
  getFieldError,
  getFieldTouched,
  isFieldVisible,
  disabled = false,
  direction,
  onChange,
  onBlur,
  className,
  headerClassName,
  fieldsContainerClassName,
  fieldClassName,
  showEmptySections = false,
}) => {
  // Don't render if section is not visible
  if (!isVisible) {
    return null;
  }

  // Check if section has any visible fields
  const visibleFields = section.fields.filter((field) =>
    isFieldVisible(field.field_id),
  );

  // Don't render if no visible fields and showEmptySections is false
  if (visibleFields.length === 0 && !showEmptySections) {
    return null;
  }

  // Determine if section has a header (title or description)
  // Determine if section has a header (section_name only, no title/description in API)
  const hasHeader = Boolean(section.section_name);

  return (
    <section
      className={className}
      data-section-id={section.section_id}
      data-section-order={section.section_order}
      dir={direction}
    >
      {/* Section Header */}
      {hasHeader && (
        <div className={headerClassName || 'mb-6'}>
          {/* Section Title */}
          {section.section_name && (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {section.section_name}
            </h2>
          )}
        </div>
      )}

      {/* Section Fields */}
      {visibleFields.length > 0 ? (
        <FieldListRenderer
          fields={section.fields}
          getFieldValue={getFieldValue}
          getFieldError={getFieldError}
          getFieldTouched={getFieldTouched}
          isFieldVisible={isFieldVisible}
          disabled={disabled}
          direction={direction}
          onChange={onChange}
          onBlur={onBlur}
          containerClassName={fieldsContainerClassName || 'space-y-6'}
          fieldClassName={fieldClassName}
        />
      ) : (
        // Empty section message (only shown if showEmptySections is true)
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No fields to display in this section
          </p>
        </div>
      )}
    </section>
  );
};

// ================================
// MEMOIZED VERSION
// ================================

/**
 * Memoized version of SectionRenderer for performance optimization
 */
export const MemoizedSectionRenderer = React.memo(
  SectionRenderer,
  (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.section.section_id === nextProps.section.section_id &&
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.direction === nextProps.direction
      // Field state changes are handled by individual field memoization
    );
  },
);

MemoizedSectionRenderer.displayName = 'MemoizedSectionRenderer';

// ================================
// SECTION LIST RENDERER
// ================================

/**
 * Props for rendering a list of sections
 */
export interface SectionListRendererProps {
  /**
   * Array of sections to render
   */
  sections: FormSection[];

  /**
   * Check if section is visible
   */
  isSectionVisible: (sectionId: number) => boolean;

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
   * Optional section class name
   */
  sectionClassName?: string;

  /**
   * Optional section header class name
   */
  sectionHeaderClassName?: string;

  /**
   * Optional fields container class name
   */
  fieldsContainerClassName?: string;

  /**
   * Optional field class name
   */
  fieldClassName?: string;

  /**
   * Whether to show empty sections
   */
  showEmptySections?: boolean;
}

/**
 * SectionListRenderer - Renders multiple sections efficiently
 *
 * @example
 * ```
 * <SectionListRenderer
 *   sections={formStructure.stage.sections}
 *   isSectionVisible={isSectionVisible}
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
export const SectionListRenderer: React.FC<SectionListRendererProps> = ({
  sections,
  isSectionVisible,
  getFieldValue,
  getFieldError,
  getFieldTouched,
  isFieldVisible,
  disabled = false,
  direction,
  onChange,
  onBlur,
  containerClassName,
  sectionClassName,
  sectionHeaderClassName,
  fieldsContainerClassName,
  fieldClassName,
  showEmptySections = false,
}) => {
  // Sort sections by section_order (not order)
  const sortedSections = [...sections].sort(
    (a, b) => a.section_order - b.section_order,
  );

  return (
    <div className={containerClassName || 'space-y-8'}>
      {sortedSections.map((section) => (
        <MemoizedSectionRenderer
          key={section.section_id}
          section={section}
          isVisible={isSectionVisible(section.section_id)}
          getFieldValue={getFieldValue}
          getFieldError={getFieldError}
          getFieldTouched={getFieldTouched}
          isFieldVisible={isFieldVisible}
          disabled={disabled}
          direction={direction}
          onChange={onChange}
          onBlur={onBlur}
          className={sectionClassName}
          headerClassName={sectionHeaderClassName}
          fieldsContainerClassName={fieldsContainerClassName}
          fieldClassName={fieldClassName}
          showEmptySections={showEmptySections}
        />
      ))}
    </div>
  );
};

// ================================
// COMPACT SECTION RENDERER
// ================================

/**
 * CompactSectionRenderer - Renders section without header
 * Useful for single-section forms or wizard-style layouts
 *
 * @example
 * ```
 * <CompactSectionRenderer
 *   section={section}
 *   isVisible={isSectionVisible(section.section_id)}
 *   getFieldValue={getFieldValue}
 *   // ... other props
 * />
 * ```
 */
export const CompactSectionRenderer: React.FC<SectionRendererProps> = (
  props,
) => {
  // Don't render if section is not visible
  if (!props.isVisible) {
    return null;
  }

  // Check if section has any visible fields
  const visibleFields = props.section.fields.filter((field) =>
    props.isFieldVisible(field.field_id),
  );

  // Don't render if no visible fields
  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div
      className={props.className}
      data-section-id={props.section.section_id}
      dir={props.direction}
    >
      <FieldListRenderer
        fields={props.section.fields}
        getFieldValue={props.getFieldValue}
        getFieldError={props.getFieldError}
        getFieldTouched={props.getFieldTouched}
        isFieldVisible={props.isFieldVisible}
        disabled={props.disabled}
        direction={props.direction}
        onChange={props.onChange}
        onBlur={props.onBlur}
        containerClassName={props.fieldsContainerClassName || 'space-y-6'}
        fieldClassName={props.fieldClassName}
      />
    </div>
  );
};

// ================================
// CARD SECTION RENDERER
// ================================

/**
 * CardSectionRenderer - Renders section in a card layout
 * Useful for visually separating sections
 *
 * @example
 * ```
 * <CardSectionRenderer
 *   section={section}
 *   isVisible={isSectionVisible(section.section_id)}
 *   // ... other props
 * />
 * ```
 */
export const CardSectionRenderer: React.FC<SectionRendererProps> = (props) => {
  return (
    <SectionRenderer
      {...props}
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${props.className || ''}`}
      headerClassName="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700"
    />
  );
};

// ================================
// DEBUG SECTION RENDERER
// ================================

/**
 * DebugSectionRenderer - Renders section with debug information
 * Only shows debug info in development mode
 */
export const DebugSectionRenderer: React.FC<SectionRendererProps> = (props) => {
  if (process.env.NODE_ENV !== 'development') {
    return <SectionRenderer {...props} />;
  }

  const visibleFieldsCount = props.section.fields.filter((field) =>
    props.isFieldVisible(field.field_id),
  ).length;

  return (
    <div className="relative">
      {/* Debug info badge */}
      <div className="absolute right-0 top-0 z-50 rounded-bl bg-blue-800 px-3 py-1 text-xs text-white">
        <div>Section ID: {props.section.section_id}</div>
        <div>Order: {props.section.section_order}</div>
        <div>Visible: {props.isVisible ? '✅' : '❌'}</div>
        <div>
          Fields: {visibleFieldsCount}/{props.section.fields.length}
        </div>
      </div>

      {/* Actual section */}
      <SectionRenderer {...props} />
    </div>
  );
};

// ================================
// DEFAULT EXPORT
// ================================

export default SectionRenderer;
