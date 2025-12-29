/**
 * /src/features/entries/utils/filterRegistry.ts
 *
 * Centralized registry for field filter components.
 * Maps field type IDs to their corresponding filter components and metadata.
 * Extensible design - add new filter types by registering them here.
 */

import type { ComponentType } from 'react';

// ============================================================================
// Filter Data Types
// ============================================================================

/**
 * Base interface that all filter data types must extend.
 * Ensures consistent structure for serialization.
 */
export interface BaseFilterData {
  [key: string]: string | number | boolean | string[] | number[];
}

/**
 * Text filter data structure.
 * Used by TextFilter component.
 */
export interface TextFilterData extends BaseFilterData {
  type:
    | 'contains'
    | 'equals'
    | 'startswith'
    | 'endswith'
    | 'notcontains'
    | 'exact';
  value: string;
}

export interface EmailUrlFilterData extends BaseFilterData {
  type: 'contains' | 'exact' | 'notcontains' | 'startswith' | 'endswith';
  value: string;
}

export interface RadioDropdownFilterData extends BaseFilterData {
  options: string[];
}

export interface CheckboxFilterData extends BaseFilterData {
  value: boolean;
}

/**
 * Union type of all possible filter data types.
 * Extend this as you add more filter types (e.g., NumberFilterData, DateFilterData).
 */
export type FilterData =
  | TextFilterData
  | EmailUrlFilterData
  | RadioDropdownFilterData
  | CheckboxFilterData;

// Will become: TextFilterData | EmailFilterData | NumberFilterData | ...

// ============================================================================
// Filter Component Props Interface
// ============================================================================

/**
 * Standard props interface that all filter components must implement.
 * Ensures consistent API across all filter types.
 */
export interface FilterComponentProps<T extends BaseFilterData = FilterData> {
  fieldId: number;
  fieldLabel: string;
  onFilterChange: (fieldId: number, filterData: T | null) => void;
  initialFilter?: T;
}

// ============================================================================
// Registry Entry Interface
// ============================================================================

/**
 * Metadata for a registered filter component.
 * Contains the component itself and information about the filter type.
 *
 * Note: We use 'any' for component props to allow storage of different generic types.
 * Type safety is maintained at the usage site through the generic registerFilter function.
 */
interface FilterRegistryEntry {
  component: ComponentType<FilterComponentProps<any>>;
  fieldTypeName: string; // Human-readable name (e.g., "Text Input", "Email Input")
  defaultFilterData: () => FilterData | null; // Factory function for default/empty filter state
}

// ============================================================================
// Registry Implementation
// ============================================================================

/**
 * Internal registry storage.
 * Maps field_type_id (from API) to filter component metadata.
 */
const registry = new Map<number, FilterRegistryEntry>();

/**
 * Registers a filter component for a specific field type.
 * Call this function to add new filter types to the system.
 *
 * @param fieldTypeId - The field_type_id from API (e.g., 1 for Text Input)
 * @param component - The React component for this filter type
 * @param fieldTypeName - Human-readable name for the field type
 * @param defaultFilterData - Factory function that returns default filter state
 *
 * @example
 * registerFilter(
 *   1,
 *   TextFilter,
 *   'Text Input',
 *   () => null
 * );
 */
export function registerFilter<T extends BaseFilterData = FilterData>(
  fieldTypeId: number,
  component: ComponentType<FilterComponentProps<T>>,
  fieldTypeName: string,
  defaultFilterData: () => T | null,
): void {
  if (registry.has(fieldTypeId)) {
    console.warn(
      `[FilterRegistry] Overwriting existing filter for field type ID ${fieldTypeId}`,
    );
  }

  registry.set(fieldTypeId, {
    component: component as ComponentType<FilterComponentProps<any>>,
    fieldTypeName,
    defaultFilterData: defaultFilterData as () => FilterData | null,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[FilterRegistry] Registered filter component for field type ${fieldTypeId} (${fieldTypeName})`,
    );
  }
}

/**
 * Retrieves the filter component for a specific field type.
 * Returns null if no filter is registered for this field type.
 *
 * @param fieldTypeId - The field_type_id from API
 * @returns The filter component or null if not found
 *
 * @example
 * const FilterComponent = getFilterComponent(1);
 * if (FilterComponent) {
 *   return <FilterComponent fieldId={1454} fieldLabel="First Name" ... />;
 * }
 */
export function getFilterComponent(
  fieldTypeId: number,
): ComponentType<FilterComponentProps<any>> | null {
  const entry = registry.get(fieldTypeId);
  return entry ? entry.component : null;
}

/**
 * Gets the human-readable name for a field type.
 *
 * @param fieldTypeId - The field_type_id from API
 * @returns The field type name or "Unknown" if not registered
 */
export function getFieldTypeName(fieldTypeId: number): string {
  const entry = registry.get(fieldTypeId);
  return entry ? entry.fieldTypeName : 'Unknown';
}

/**
 * Gets the default filter data for a field type.
 * Used when initializing filters or clearing them.
 *
 * @param fieldTypeId - The field_type_id from API
 * @returns Default filter data or null if not registered
 */
export function getDefaultFilterData(fieldTypeId: number): FilterData | null {
  const entry = registry.get(fieldTypeId);
  return entry ? entry.defaultFilterData() : null;
}

/**
 * Checks if a filter component is registered for a field type.
 * Useful for conditional rendering or validation.
 *
 * @param fieldTypeId - The field_type_id from API
 * @returns True if a filter is registered, false otherwise
 */
export function hasFilterComponent(fieldTypeId: number): boolean {
  return registry.has(fieldTypeId);
}

/**
 * Gets all registered field type IDs.
 * Useful for debugging or administrative interfaces.
 *
 * @returns Array of registered field type IDs
 */
export function getRegisteredFieldTypes(): number[] {
  return Array.from(registry.keys());
}

/**
 * Clears all registered filters.
 * Primarily useful for testing or hot module replacement.
 */
export function clearRegistry(): void {
  registry.clear();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[FilterRegistry] Registry cleared');
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if filter data is TextFilterData.
 * Useful for type-safe filter data handling.
 *
 * @param data - Filter data to check
 * @returns True if data is TextFilterData
 */
export function isTextFilterData(data: FilterData): data is TextFilterData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'value' in data &&
    typeof data.value === 'string' &&
    ['contains', 'equals', 'startswith', 'endswith', 'notcontains'].includes(
      (data as TextFilterData).type,
    )
  );
}
