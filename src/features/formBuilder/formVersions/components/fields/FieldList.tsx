// src/features/formVersion/components/fields/FieldList.tsx

/**
 * Field List Component
 * Displays list of fields in a section with CRUD operations
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { UiField, StageIdLike, SectionIdLike, FieldIdLike } from '../../types/formVersion.ui-types';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';
import { useFieldTypes } from '@/features/formBuilder/fieldTypes/hooks/useFieldTypes';
import { isFakeId } from '../../types/formVersion.ui-types';

// ============================================================================
// Props
// ============================================================================

interface FieldListProps {
  stageId: StageIdLike;
  sectionId: SectionIdLike;
  fields: UiField[];
  selectedFieldId: FieldIdLike | null;
  onFieldSelect: (fieldId: FieldIdLike) => void;
}

interface FieldItemProps {
  field: UiField;
  index: number;
  total: number;
  isSelected: boolean;
  fieldTypeName: string | null;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

// ============================================================================
// Field Item Component
// ============================================================================

const FieldItem: React.FC<FieldItemProps> = ({
  field,
  index,
  total,
  isSelected,
  fieldTypeName,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <div
      className={`
        p-3 border rounded-md cursor-pointer transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-sm font-medium text-gray-900 truncate">
              {field.label || 'Untitled Field'}
            </h5>
            {isFakeId(field.id) && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {fieldTypeName || `Type ${field.field_type_id}`}
            </Badge>
            {field.rules.length > 0 && (
              <span className="text-xs text-gray-500">
                {field.rules.length} rule{field.rules.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Move Up */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* Move Down */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Delete */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete field"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Helper text preview */}
      {field.helper_text && (
        <p className="mt-2 text-xs text-gray-500 truncate">{field.helper_text}</p>
      )}
    </div>
  );
};

// ============================================================================
// Field List Component
// ============================================================================

/**
 * FieldList Component
 * 
 * Renders list of fields with CRUD operations
 * Features:
 * - Click to select field for editing
 * - Reorder with up/down buttons
 * - Delete field
 * - Shows field type name from backend data
 */
export const FieldList: React.FC<FieldListProps> = ({
  stageId,
  sectionId,
  fields,
  selectedFieldId,
  onFieldSelect,
}) => {
  const builder = useFormVersionBuilder();
  const { fieldTypes } = useFieldTypes();

  console.debug('[FieldList] Rendering', fields.length, 'fields');

  /**
   * Gets field type name by ID
   */
  const getFieldTypeName = (fieldTypeId: number): string | null => {
    const fieldType = fieldTypes.find((ft) => ft.id === fieldTypeId);
    return fieldType?.name || null;
  };

  /**
   * Handles field deletion
   */
  const handleDeleteField = (fieldId: FieldIdLike): void => {
    const confirmDelete = window.confirm('Are you sure you want to delete this field?');
    if (!confirmDelete) return;

    console.info('[FieldList] Deleting field:', fieldId);
    builder.removeField(stageId, sectionId, fieldId);
  };

  /**
   * Moves field up in order
   */
  const handleMoveUp = (field: UiField, index: number): void => {
    if (index === 0) return;

    console.debug('[FieldList] Moving field up:', field.id);

    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];

    builder.reorderFields(stageId, sectionId, newFields);
  };

  /**
   * Moves field down in order
   */
  const handleMoveDown = (field: UiField, index: number): void => {
    if (index === fields.length - 1) return;

    console.debug('[FieldList] Moving field down:', field.id);

    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];

    builder.reorderFields(stageId, sectionId, newFields);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <FieldItem
          key={field.id}
          field={field}
          index={index}
          total={fields.length}
          isSelected={selectedFieldId === field.id}
          fieldTypeName={getFieldTypeName(field.field_type_id)}
          onSelect={() => onFieldSelect(field.id)}
          onDelete={() => handleDeleteField(field.id)}
          onMoveUp={() => handleMoveUp(field, index)}
          onMoveDown={() => handleMoveDown(field, index)}
        />
      ))}
    </div>
  );
};
