/**
 * /src/features/entries/utils/filterSerializer.ts
 *
 * Serializes filter data from UI format to API query parameter format.
 * Supports multiple filter components that share the { type, value } structure.
 *
 * IMPORTANT:
 * - Backend expects: contains | exact | notcontains | startswith | endswith
 * - TextFilter UI might still use "equals" -> we normalize it to "exact" for API.
 */

import type { FilterData } from './filterRegistry';
import type { FieldFilters } from '../types';

type FieldFilterValue = string | number | boolean | string[] | number[];
type SerializedFilter = Record<string, FieldFilterValue>;

// ============================================================================
// Match Types
// ============================================================================

type ApiMatchType =
  | 'contains'
  | 'equals'
  | 'notcontains'
  | 'startswith'
  | 'endswith';

const API_MATCH_TYPES = new Set<ApiMatchType>([
  'contains',
  'equals',
  'notcontains',
  'startswith',
  'endswith',
]);

function normalizeMatchTypeForApi(type: unknown): ApiMatchType | null {
  if (typeof type !== 'string') return null;

  // If you ever had "exact" in old URLs/presets, accept it but normalize to "equals"
  if (type === 'exact') return 'equals';

  if (API_MATCH_TYPES.has(type as ApiMatchType)) {
    return type as ApiMatchType;
  }

  return null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasTypeAndValue(
  value: unknown,
): value is { type: unknown; value: unknown } {
  return isObject(value) && 'type' in value && 'value' in value;
}

// ============================================================================
// Main Serialization Functions
// ============================================================================

export function serializeFieldFilters(
  filters: Map<number, FilterData>,
): FieldFilters | undefined {
  if (filters.size === 0) return undefined;

  const serialized: FieldFilters = {};

  filters.forEach((filterData, fieldId) => {
    if (!filterData) return;

    const serializedFilter = serializeFilterData(filterData);
    if (serializedFilter && Object.keys(serializedFilter).length > 0) {
      serialized[fieldId] = serializedFilter;
    }
  });

  return Object.keys(serialized).length > 0 ? serialized : undefined;
}

function serializeFilterData(filterData: FilterData): SerializedFilter | null {
  // ✅ 0) Checkbox boolean style: { checked: boolean }
  if (
    typeof filterData === 'object' &&
    filterData !== null &&
    'checked' in (filterData as any)
  ) {
    const checked = (filterData as any).checked;

    if (typeof checked !== 'boolean') return null;

    // IMPORTANT: return boolean — api.ts converts boolean -> "1"/"0"
    return { checked };
  }

  // ✅ 1) Radio/Dropdown style: { options: string[] }
  if (
    typeof filterData === 'object' &&
    filterData !== null &&
    'options' in (filterData as any)
  ) {
    const raw = (filterData as any).options;

    if (!Array.isArray(raw)) return null;

    const cleaned = raw
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean);

    if (cleaned.length === 0) return null;

    return { options: cleaned };
  }

  // ✅ 2) Text/Email/URL style: { type: string, value: string }
  if (!hasTypeAndValue(filterData)) {
    console.warn(
      '[FilterSerializer] Filter data missing type/value:',
      filterData,
    );
    return null;
  }

  if (typeof filterData.value !== 'string') {
    console.warn('[FilterSerializer] Filter value must be string:', filterData);
    return null;
  }

  const trimmedValue = filterData.value.trim();
  if (!trimmedValue) return null;

  const apiType = normalizeMatchTypeForApi(filterData.type);
  if (!apiType) {
    console.warn(
      '[FilterSerializer] Invalid/unsupported match type:',
      filterData.type,
    );
    return null;
  }

  return {
    type: apiType,
    value: trimmedValue,
  };
}

// ============================================================================
// Deserialization (optional / for URL-synced filters later)
// ============================================================================

export function deserializeFieldFilters(
  apiFilters: FieldFilters | undefined,
): Map<number, FilterData> {
  const deserialized = new Map<number, FilterData>();
  if (!apiFilters) return deserialized;

  Object.entries(apiFilters).forEach(([fieldIdStr, filterObj]) => {
    const fieldId = parseInt(fieldIdStr, 10);
    if (isNaN(fieldId)) return;

    const filterData = deserializeFilterData(filterObj);
    if (filterData) deserialized.set(fieldId, filterData);
  });

  return deserialized;
}

function deserializeFilterData(
  filterObj: Record<string, FieldFilterValue>,
): FilterData | null {
  if (!isObject(filterObj)) return null;

  const rawType = (filterObj as any).type;
  const rawValue = (filterObj as any).value;

  if (typeof rawType !== 'string' || typeof rawValue !== 'string') {
    return null;
  }

  // We accept both API types (contains/exact/...) and legacy "equals" (if it ever appears).
  const apiType = normalizeMatchTypeForApi(
    rawType === 'equals' ? 'equals' : rawType,
  );
  if (!apiType) return null;

  const value = rawValue.trim();
  if (!value) return null;

  const rawOptions = (filterObj as any).options;

  // ✅ Checkbox boolean style
  if ('checked' in (filterObj as any)) {
    const raw = (filterObj as any).checked;

    // your api.ts encodes booleans as "1"/"0" in URL, so handle string too
    if (raw === '1' || raw === 1) return { checked: true } as FilterData;
    if (raw === '0' || raw === 0) return { checked: false } as FilterData;
    if (typeof raw === 'boolean') return { checked: raw } as FilterData;

    return null;
  }

  // ✅ Radio/Dropdown style
  if (Array.isArray(rawOptions)) {
    const cleaned = rawOptions
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean);

    if (cleaned.length === 0) return null;

    return { options: cleaned } as FilterData;
  }

  // NOTE:
  // We return "exact" (not "equals") here because email/url filters use "exact".
  // If your TextFilter UI still only supports "equals", update TextFilterData to support "exact" too.
  return {
    type: apiType,
    value,
  } as FilterData;
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function validateFieldFilters(filters: Map<number, FilterData>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  filters.forEach((filterData, fieldId) => {
    if (!filterData) {
      errors.push(`Field ${fieldId}: Filter data is null or undefined`);
      return;
    }

    const serialized = serializeFilterData(filterData);
    if (!serialized) {
      errors.push(
        `Field ${fieldId}: Invalid filter (missing/invalid type or empty value)`,
      );
    }
  });

  return { valid: errors.length === 0, errors };
}

export function countActiveFilters(filters: Map<number, FilterData>): number {
  let count = 0;

  filters.forEach((filterData) => {
    if (!filterData) return;
    if (serializeFilterData(filterData)) count++;
  });

  return count;
}

export function hasActiveFilters(filters: Map<number, FilterData>): boolean {
  return countActiveFilters(filters) > 0;
}
