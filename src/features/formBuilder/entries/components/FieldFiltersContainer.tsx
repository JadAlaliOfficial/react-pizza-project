/**
 * /src/features/entries/components/FieldFiltersContainer.tsx
 * 
 * Container component that manages multiple field-specific filters.
 * Uses the filter registry to dynamically render the appropriate filter component
 * for each field based on its type. Maintains local state for all field filters
 * and reports changes to parent.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FilterX, Layers, AlertCircle } from 'lucide-react';
import {
  getFilterComponent,
  hasFilterComponent,
  getFieldTypeName,
  type FilterData,
} from '../utils/filterRegistry';
import { countActiveFilters } from '../utils/filterSerializer';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Field configuration for rendering filters.
 * Extracted from API field data.
 */
export interface FieldConfig {
  fieldId: number;
  fieldTypeId: number;
  label: string;
  placeholder?: string;
  helperText?: string;
}

/**
 * Props for FieldFiltersContainer component
 */
interface FieldFiltersContainerProps {
  /**
   * Array of fields to render filters for.
   * Only fields with registered filter components will be shown.
   */
  fields: FieldConfig[];

  /**
   * Callback fired whenever any field filter changes.
   * Parent receives the complete current state of all field filters.
   */
  onChange: (filters: Map<number, FilterData>) => void;

  /**
   * Initial filter values for fields.
   * Used for loading saved filters or URL state.
   */
  initialFilters?: Map<number, FilterData>;

  /**
   * Whether to show the card wrapper.
   * Set to false if embedding in another card.
   * @default true
   */
  showCard?: boolean;

  /**
   * Custom title for the card header.
   * @default "Field Filters"
   */
  title?: string;

  /**
   * Custom description for the card header.
   * @default "Filter entries by specific field values"
   */
  description?: string;
}

// ============================================================================
// Component
// ============================================================================

const FieldFiltersContainer: React.FC<FieldFiltersContainerProps> = ({
  fields,
  onChange,
  initialFilters,
  showCard = true,
  title = 'Field Filters',
  description = 'Filter entries by specific field values',
}) => {
  // ========== Local State ==========

  /**
   * Map of field ID to filter data.
   * Only contains entries for fields that have active filters.
   */
  const [fieldFilters, setFieldFilters] = useState<Map<number, FilterData>>(
    initialFilters || new Map()
  );

  // ========== Effects ==========

  /**
   * Notify parent whenever field filters change.
   * Parent decides when to actually apply these to the query.
   */
  useEffect(() => {
    onChange(fieldFilters);
  }, [fieldFilters, onChange]);

  // ========== Event Handlers ==========

  /**
   * Handles filter change from a child filter component.
   * Updates the local state map with the new filter data.
   * If filterData is null, removes the filter for that field.
   */
  const handleFilterChange = useCallback(
    (fieldId: number, filterData: FilterData | null) => {
      setFieldFilters((prev) => {
        const updated = new Map(prev);

        if (filterData === null) {
          // Remove filter if data is null (filter cleared)
          updated.delete(fieldId);
        } else {
          // Update or add filter
          updated.set(fieldId, filterData);
        }

        return updated;
      });
    },
    []
  );

  // ========== Render Helpers ==========

  /**
   * Filters the fields list to only include fields with registered filter components.
   * Also logs warnings for fields without filters.
   */
  const getFilterableFields = (): FieldConfig[] => {
    return fields.filter((field) => {
      const hasFilter = hasFilterComponent(field.fieldTypeId);

      if (!hasFilter && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[FieldFiltersContainer] No filter component registered for field type ${field.fieldTypeId} (field: ${field.label})`
        );
      }

      return hasFilter;
    });
  };

  /**
   * Renders a single field filter by looking up the component in the registry.
   */
  const renderFieldFilter = (field: FieldConfig) => {
    const FilterComponent = getFilterComponent(field.fieldTypeId);

    if (!FilterComponent) {
      // Should not happen due to getFilterableFields filtering, but safety check
      return null;
    }

    // Get initial filter data for this field
    const initialFilter = fieldFilters.get(field.fieldId);

    return (
      <div key={field.fieldId} className="field-filter-item">
        <FilterComponent
          fieldId={field.fieldId}
          fieldLabel={field.label}
          onFilterChange={handleFilterChange}
          initialFilter={initialFilter}
        />
      </div>
    );
  };

  /**
   * Renders the list of all field filters.
   */
  const renderFieldFilters = () => {
    const filterableFields = getFilterableFields();

    if (filterableFields.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No filterable fields available. Make sure filter components are registered
            for the field types in your form.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterableFields.map((field) => renderFieldFilter(field))}
      </div>
    );
  };

  /**
   * Renders the active filters count badge.
   */
  const renderActiveFiltersBadge = () => {
    const activeCount = countActiveFilters(fieldFilters);

    if (activeCount === 0) {
      return null;
    }

    return (
      <Badge variant="secondary" className="ml-2">
        {activeCount} active
      </Badge>
    );
  };

  /**
   * Renders info about fields without filter support.
   */
  const renderUnsupportedFieldsWarning = () => {
    const filterableFields = getFilterableFields();
    const unsupportedCount = fields.length - filterableFields.length;

    if (unsupportedCount === 0) {
      return null;
    }

    const unsupportedFields = fields
      .filter((field) => !hasFilterComponent(field.fieldTypeId))
      .map((field) => ({
        ...field,
        typeName: getFieldTypeName(field.fieldTypeId),
      }));

    return (
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-1">
            {unsupportedCount} field{unsupportedCount > 1 ? 's' : ''} cannot be
            filtered:
          </p>
          <ul className="text-xs list-disc list-inside space-y-0.5">
            {unsupportedFields.map((field) => (
              <li key={field.fieldId}>
                {field.label} ({field.typeName})
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  const renderContent = () => (
    <>
      {renderUnsupportedFieldsWarning()}
      {renderFieldFilters()}
    </>
  );

  // ========== Main Render ==========

  if (!showCard) {
    return <div className="field-filters-container">{renderContent()}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="flex items-center">
                <CardTitle>{title}</CardTitle>
                {renderActiveFiltersBadge()}
              </div>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {countActiveFilters(fieldFilters) > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FilterX className="h-4 w-4" />
              <span className="hidden sm:inline">Filters active</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default FieldFiltersContainer;

// ============================================================================
// Helper Functions for External Use
// ============================================================================

/**
 * Extracts field configurations from API entry data.
 * Utility to convert API fields into FieldConfig format.
 * 
 * @param apiFields - Array of field objects from API
 * @returns Array of FieldConfig objects
 * 
 * @example
 * const fields = extractFieldConfigs(entryData.values.map(v => v.field));
 */
export function extractFieldConfigs(
  apiFields: Array<{
    id: number;
    field_type_id: number;
    label: string;
    placeholder?: string | null;
    helper_text?: string | null;
  }>
): FieldConfig[] {
  return apiFields.map((field) => ({
    fieldId: field.id,
    fieldTypeId: field.field_type_id,
    label: field.label,
    placeholder: field.placeholder || undefined,
    helperText: field.helper_text || undefined,
  }));
}

/**
 * Filters field configs to only include those with registered filter components.
 * Useful for pre-filtering before passing to the container.
 * 
 * @param fields - Array of field configurations
 * @returns Filtered array of only filterable fields
 */
export function getFilterableFieldConfigs(fields: FieldConfig[]): FieldConfig[] {
  return fields.filter((field) => hasFilterComponent(field.fieldTypeId));
}

/**
 * Checks if any field filters are active.
 * 
 * @param filters - Map of field filters
 * @returns True if at least one filter is active
 */
export function hasActiveFieldFilters(filters: Map<number, FilterData>): boolean {
  return countActiveFilters(filters) > 0;
}
