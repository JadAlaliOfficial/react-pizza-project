// ============================================================================
// Filter Data Types
// ============================================================================

/**
 * Base interface that all filter data types must extend.
 * Ensures consistent structure for serialization.
 */
export interface BaseFilterData {
  [key: string]: string | number | boolean;
}

/**
 * Text filter data structure.
 * Used by TextFilter component.
 */
export interface TextFilterData {
  type: 'contains' | 'equals' | 'startswith' | 'endswith' | 'notcontains';
  value: string;
  [key: string]: string | number | boolean; // Index signature to satisfy BaseFilterData
}

/**
 * Union type of all possible filter data types.
 * Extend this as you add more filter types (e.g., NumberFilterData, DateFilterData).
 */
export type FilterData = TextFilterData; // Will become: TextFilterData | EmailFilterData | NumberFilterData | ...
