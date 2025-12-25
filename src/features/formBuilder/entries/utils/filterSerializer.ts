/**
 * /src/features/entries/utils/filterSerializer.ts
 * 
 * Utilities for serializing filter data from UI format to API query parameter format.
 * Handles the conversion of filter objects into the nested query param structure
 * required by the API (e.g., field_filters[fieldId][key]=value).
 */

import type { FilterData, TextFilterData } from './filterRegistry';
import type { FieldFilters } from '../types';

// ============================================================================
// Main Serialization Functions
// ============================================================================

/**
 * Serializes field filters from UI format to API format.
 * Converts filter data objects into the nested structure expected by the API.
 * 
 * @param filters - Map of field IDs to their filter data
 * @returns API-compatible field filters object or undefined if no filters
 * 
 * @example
 * Input:
 * {
 *   1454: { type: 'contains', value: 'charlie' }
 * }
 * 
 * Output:
 * {
 *   1454: { match_type: 'contains', value: 'charlie' }
 * }
 */
export function serializeFieldFilters(
  filters: Map<number, FilterData>
): FieldFilters | undefined {
  // Return undefined if no filters to avoid sending empty object
  if (filters.size === 0) {
    return undefined;
  }

  const serialized: FieldFilters = {};

  filters.forEach((filterData, fieldId) => {
    // Skip null or invalid filter data
    if (!filterData) {
      return;
    }

    // Serialize based on filter data type
    const serializedFilter = serializeFilterData(filterData);
    
    if (serializedFilter && Object.keys(serializedFilter).length > 0) {
      serialized[fieldId] = serializedFilter;
    }
  });

  // Return undefined if all filters were invalid/empty
  return Object.keys(serialized).length > 0 ? serialized : undefined;
}

/**
 * Serializes a single filter data object based on its type.
 * Delegates to type-specific serializers.
 * 
 * @param filterData - The filter data to serialize
 * @returns Serialized filter object for API
 */
function serializeFilterData(
  filterData: FilterData
): Record<string, string | number | boolean> | null {
  // Determine filter type and delegate to appropriate serializer
  if (isTextFilterData(filterData)) {
    return serializeTextFilter(filterData);
  }

  // Future filter types will be handled here:
  // if (isNumberFilterData(filterData)) {
  //   return serializeNumberFilter(filterData);
  // }

  console.warn('[FilterSerializer] Unknown filter data type:', filterData);
  return null;
}

// ============================================================================
// Type-Specific Serializers
// ============================================================================

/**
 * Serializes TextFilterData to API format.
 * Converts the 'type' property to 'match_type' as expected by the API.
 * 
 * @param filterData - Text filter data
 * @returns API-compatible filter object
 * 
 * @example
 * Input: { type: 'contains', value: 'charlie' }
 * Output: { match_type: 'contains', value: 'charlie' }
 */
function serializeTextFilter(
  filterData: TextFilterData
): Record<string, string> | null {
  const trimmedValue = filterData.value.trim();

  // Don't serialize empty values
  if (!trimmedValue) {
    return null;
  }

  return {
    match_type: filterData.type, // API expects 'match_type' key
    value: trimmedValue,
  };
}

// ============================================================================
// Deserialization Functions (for loading saved filters)
// ============================================================================

/**
 * Deserializes API format filters back to UI format.
 * Useful for loading saved filter presets or URL-synced filters.
 * 
 * @param apiFilters - Filters in API format
 * @returns Map of field IDs to filter data
 * 
 * @example
 * Input:
 * {
 *   1454: { match_type: 'contains', value: 'charlie' }
 * }
 * 
 * Output:
 * Map {
 *   1454 => { type: 'contains', value: 'charlie' }
 * }
 */
export function deserializeFieldFilters(
  apiFilters: FieldFilters | undefined
): Map<number, FilterData> {
  const deserialized = new Map<number, FilterData>();

  if (!apiFilters) {
    return deserialized;
  }

  Object.entries(apiFilters).forEach(([fieldIdStr, filterObj]) => {
    const fieldId = parseInt(fieldIdStr, 10);

    if (isNaN(fieldId)) {
      console.warn('[FilterSerializer] Invalid field ID:', fieldIdStr);
      return;
    }

    const filterData = deserializeFilterData(filterObj);
    
    if (filterData) {
      deserialized.set(fieldId, filterData);
    }
  });

  return deserialized;
}

/**
 * Deserializes a single API filter object to UI format.
 * Attempts to detect the filter type and convert appropriately.
 * 
 * @param filterObj - API filter object
 * @returns UI filter data or null if invalid
 */
function deserializeFilterData(
  filterObj: Record<string, string | number | boolean>
): FilterData | null {
  // Detect and deserialize text filter (has match_type and value)
  if ('match_type' in filterObj && 'value' in filterObj) {
    return deserializeTextFilter(filterObj);
  }

  // Future filter types will be detected here

  console.warn('[FilterSerializer] Unknown API filter format:', filterObj);
  return null;
}

/**
 * Deserializes API text filter to TextFilterData.
 * 
 * @param filterObj - API filter object
 * @returns TextFilterData or null if invalid
 */
function deserializeTextFilter(
  filterObj: Record<string, string | number | boolean>
): TextFilterData | null {
  const matchType = filterObj.match_type;
  const value = filterObj.value;

  // Validate match_type
  const validTypes = ['contains', 'equals', 'startswith', 'endswith', 'notcontains'];
  if (typeof matchType !== 'string' || !validTypes.includes(matchType)) {
    console.warn('[FilterSerializer] Invalid match_type:', matchType);
    return null;
  }

  // Validate value
  if (typeof value !== 'string') {
    console.warn('[FilterSerializer] Invalid value type:', value);
    return null;
  }

  return {
    type: matchType as TextFilterData['type'],
    value: value,
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if filter data is TextFilterData.
 * 
 * @param data - Filter data to check
 * @returns True if data is TextFilterData
 */
function isTextFilterData(data: FilterData): data is TextFilterData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'value' in data &&
    typeof data.value === 'string' &&
    ['contains', 'equals', 'startswith', 'endswith', 'notcontains'].includes(
      (data as TextFilterData).type
    )
  );
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates that field filters are properly formatted.
 * Useful for form validation before submitting.
 * 
 * @param filters - Map of field IDs to filter data
 * @returns Validation result with any error messages
 */
export function validateFieldFilters(
  filters: Map<number, FilterData>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  filters.forEach((filterData, fieldId) => {
    if (!filterData) {
      errors.push(`Field ${fieldId}: Filter data is null or undefined`);
      return;
    }

    // Validate text filters
    if (isTextFilterData(filterData)) {
      if (!filterData.value.trim()) {
        errors.push(`Field ${fieldId}: Text filter value cannot be empty`);
      }
      if (!filterData.type) {
        errors.push(`Field ${fieldId}: Text filter type is required`);
      }
    }

    // Future: Add validation for other filter types
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Counts the number of active (non-empty) filters.
 * Useful for displaying filter count badges in UI.
 * 
 * @param filters - Map of field IDs to filter data
 * @returns Number of active filters
 */
export function countActiveFilters(filters: Map<number, FilterData>): number {
  let count = 0;

  filters.forEach((filterData) => {
    if (!filterData) {
      return;
    }

    // Count text filters with non-empty values
    if (isTextFilterData(filterData) && filterData.value.trim()) {
      count++;
    }

    // Future: Count other filter types
  });

  return count;
}

/**
 * Checks if any filters are active.
 * Useful for conditional rendering of "Clear Filters" button.
 * 
 * @param filters - Map of field IDs to filter data
 * @returns True if at least one filter is active
 */
export function hasActiveFilters(filters: Map<number, FilterData>): boolean {
  return countActiveFilters(filters) > 0;
}
