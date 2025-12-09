// src/features/formVersion/components/fields/FieldTypeSelector.tsx

/**
 * Field Type Selector Component
 * Dropdown UI to select a field type when adding a new field
 * Uses useFieldTypes hook to get available field types from backend
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, X, AlertCircle } from 'lucide-react';
import { useFieldTypes } from '@/features/formBuilder/fieldTypes/hooks/useFieldTypes';
import type { FieldType } from '@/features/formBuilder/fieldTypes/types';

// ============================================================================
// Props
// ============================================================================

interface FieldTypeSelectorProps {
  /**
   * Callback when user selects a field type
   */
  onSelect: (fieldTypeId: number) => void;

  /**
   * Callback when user cancels selection
   */
  onCancel: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FieldTypeSelector Component
 * 
 * Displays list of available field types from backend
 * Features:
 * - Search/filter by field type name
 * - Loading state while fetching
 * - Error handling
 * - Cancel button
 */
export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({
  onSelect,
  onCancel,
}) => {
  const { fieldTypes, isLoading, error, ensureLoaded } = useFieldTypes();
  const [searchTerm, setSearchTerm] = useState('');

  console.debug('[FieldTypeSelector] Rendering');

  // Ensure field types are loaded
  useEffect(() => {
    console.debug('[FieldTypeSelector] Ensuring field types loaded');
    ensureLoaded();
  }, [ensureLoaded]);

  /**
   * Filters field types based on search term
   */
  const filteredFieldTypes = fieldTypes.filter((fieldType) =>
    fieldType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handles field type selection
   */
  const handleSelect = (fieldType: FieldType): void => {
    console.info('[FieldTypeSelector] Field type selected:', fieldType.id, fieldType.name);
    onSelect(fieldType.id);
  };

  /**
   * Handles search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  /**
   * Clears search term
   */
  const handleClearSearch = (): void => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-3 p-3 border border-blue-200 rounded-md bg-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Select Field Type</h4>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search field types..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-8 pr-8 h-9"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Loading field types...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading field types:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Field Types List */}
      {!isLoading && !error && (
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredFieldTypes.length > 0 ? (
            filteredFieldTypes.map((fieldType) => (
              <button
                key={fieldType.id}
                onClick={() => handleSelect(fieldType)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-300"
              >
                <div className="font-medium text-gray-900">{fieldType.name}</div>
                {/* You can add more details here if available in FieldType */}
                <div className="text-xs text-gray-500 mt-0.5">
                  Field Type ID: {fieldType.id}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              {searchTerm
                ? `No field types match "${searchTerm}"`
                : 'No field types available'}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-blue-200">
        <p className="text-xs text-gray-600">
          {filteredFieldTypes.length} field type{filteredFieldTypes.length !== 1 ? 's' : ''}{' '}
          {searchTerm && 'found'}
        </p>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
};
