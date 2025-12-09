// src/features/formVersion/components/fields/FieldEditor.tsx

/**
 * Field Editor Component
 * Dynamically renders the appropriate config component for a field type
 * Shows field rules management below config
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertCircle } from 'lucide-react';
import type { UiField, StageIdLike, SectionIdLike, FieldIdLike } from '../../types/formVersion.ui-types';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';
import { useFieldById } from '../../hooks/useFormVersionBuilder.fields';
import { getFieldConfigComponent } from './fieldComponentRegistry';
import { FieldRulesManager } from './FieldRulesManager';
import { isFakeId } from '../../types/formVersion.ui-types';

// ============================================================================
// Props
// ============================================================================

interface FieldEditorProps {
  stageId: StageIdLike;
  sectionId: SectionIdLike;
  fieldId: FieldIdLike;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FieldEditor Component
 * 
 * Renders dynamic field configuration based on field_type_id
 * Features:
 * - Uses fieldComponentRegistry to get correct config component
 * - Handles field updates via builder actions
 * - Shows FieldRulesManager for rule configuration
 * - Delete field action
 */
export const FieldEditor: React.FC<FieldEditorProps> = ({
  stageId,
  sectionId,
  fieldId,
}) => {
  const builder = useFormVersionBuilder();
  const field = useFieldById(stageId, sectionId, fieldId);

  console.debug('[FieldEditor] Rendering for field:', fieldId);

  // If field not found, show error
  if (!field) {
    console.warn('[FieldEditor] Field not found:', fieldId);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Field not found. It may have been deleted.
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Handles field property changes
   * Merges partial changes with existing field
   */
  const handleFieldChange = (changes: Partial<UiField>): void => {
    console.debug('[FieldEditor] Field change:', changes);
    builder.updateField(stageId, sectionId, fieldId, changes);
  };

  /**
   * Handles field deletion
   */
  const handleDeleteField = (): void => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the field "${field.label}"? This cannot be undone.`
    );

    if (!confirmDelete) return;

    console.info('[FieldEditor] Deleting field:', fieldId);
    builder.removeField(stageId, sectionId, fieldId);
  };

  // Get the appropriate config component for this field type
  const FieldConfigComponent = getFieldConfigComponent(field.field_type_id);

  // Calculate field index (for display purposes)
  const section = builder.stages
    .find((s) => s.id === stageId)
    ?.sections.find((sec) => sec.id === sectionId);
  const fieldIndex = section?.fields.findIndex((f) => f.id === fieldId) ?? 0;

  return (
    <div className="space-y-4">
      {/* Field Status Badge */}
      {isFakeId(field.id) && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900 text-xs">
            This is a new field. Save the form to persist it to the database.
          </AlertDescription>
        </Alert>
      )}

      {/* Dynamic Field Config Component */}
      <div>
        <FieldConfigComponent
          field={field}
          fieldIndex={fieldIndex}
          onFieldChange={handleFieldChange}
          onDelete={handleDeleteField}
        />
      </div>

      {/* Field Rules Manager */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Field Validation Rules</h5>
        <FieldRulesManager
          field={field}
          onRulesChange={(newRules) => handleFieldChange({ rules: newRules })}
        />
      </div>

      {/* Additional Actions */}
      <div className="border-t pt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Field ID: {field.id} | Type: {field.field_type_id}
        </div>
        <Button
          onClick={handleDeleteField}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Field
        </Button>
      </div>
    </div>
  );
};
