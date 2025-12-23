// src/features/formVersion/components/fields/FieldConfigTab.tsx

/**
 * Field Configuration Tab Component
 * Main orchestrator for the Fields tab in the config drawer
 * Manages field CRUD operations with stage/section context
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, AlertCircle, Box } from 'lucide-react';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';
import { useFieldSelection } from '../../hooks/useFormVersionBuilder.fields';
import { FieldList } from './FieldList';
import { FieldEditor } from './FieldEditor';
import { FieldTypeSelector } from './FieldTypeSelector';

// ============================================================================
// Component
// ============================================================================

/**
 * FieldConfigTab Component
 * 
 * Renders field management interface for the selected stage and section.
 * Features:
 * - Stage selector
 * - Section selector
 * - Field list with CRUD operations
 * - Field editor with dynamic config component
 * - Field type selector for adding new fields
 */
export const FieldConfigTab: React.FC = () => {
  const builder = useFormVersionBuilder();
  
  // Local state for field type selector visibility
  const [showFieldTypeSelector, setShowFieldTypeSelector] = useState(false);

  console.debug('[FieldConfigTab] Rendering');

  // Get working stage (selected or first)
  const workingStageId = builder.selectedStageId || builder.stages[0]?.id || null;
  const workingStage = builder.stages.find((s) => String(s.id) === String(workingStageId));
  
  // Get working section (selected or first in stage)
  const sections = workingStage?.sections || [];
  const workingSectionId = builder.selectedSectionId || sections[0]?.id || null;
  const workingSection = sections.find((s) => String(s.id) === String(workingSectionId));

  // Get fields for the selected section
  const { fields, selectedFieldId, setSelected: setSelectedField } = useFieldSelection(
    workingStageId,
    workingSectionId
  );

  // Auto-select first stage on mount if nothing selected
  useEffect(() => {
    if (!builder.selectedStageId && builder.stages.length > 0) {
      console.debug('[FieldConfigTab] Auto-selecting first stage on mount');
      builder.setSelectedStageId(builder.stages[0].id);
    }
  }, [builder.stages.length]);

  // Check if selected section is valid for current stage
  const isSectionValid = sections.some((s) => String(s.id) === String(workingSectionId));

  // Auto-select first section when stage changes or section becomes invalid
  useEffect(() => {
    if (workingStageId && sections.length > 0) {
      if (!workingSectionId || !isSectionValid) {
        console.debug('[FieldConfigTab] Auto-selecting first section');
        builder.setSelectedSectionId(sections[0].id);
      }
    }
  }, [workingStageId, sections, workingSectionId, isSectionValid]);

  /**
   * Handles stage selection change
   */
  const handleStageChange = (stageIdString: string): void => {
    console.debug('[FieldConfigTab] Stage selection changed:', stageIdString);
    const stage = builder.stages.find((s) => String(s.id) === stageIdString);
    if (stage) {
      builder.setSelectedStageId(stage.id);
    }
  };

  /**
   * Handles section selection change
   */
  const handleSectionChange = (sectionIdString: string): void => {
    console.debug('[FieldConfigTab] Section selection changed:', sectionIdString);
    const section = sections.find((s) => String(s.id) === sectionIdString);
    if (section) {
      builder.setSelectedSectionId(section.id);
    }
  };

  /**
   * Opens field type selector
   */
  const handleAddFieldClick = (): void => {
    console.debug('[FieldConfigTab] Opening field type selector');
    setShowFieldTypeSelector(true);
  };

  /**
   * Handles field type selection (creates new field)
   */
  const handleFieldTypeSelected = (fieldTypeId: number): void => {
    if (!workingStageId || !workingSectionId) {
      console.warn('[FieldConfigTab] Cannot add field: No stage or section selected');
      return;
    }

    console.info('[FieldConfigTab] Adding field with type', fieldTypeId);
    
    // Add field via builder action
    builder.addField(workingStageId, workingSectionId, fieldTypeId);
    
    // Close selector
    setShowFieldTypeSelector(false);
  };

  /**
   * Handles field selection for editing
   */
  const handleFieldSelect = (fieldId: string | number): void => {
    console.debug('[FieldConfigTab] Field selected:', fieldId);
    setSelectedField(fieldId);
  };

  // Convert IDs to strings for Select components
  const stageSelectValue = workingStageId !== null ? String(workingStageId) : '';
  const sectionSelectValue = workingSectionId !== null ? String(workingSectionId) : '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Section Fields</h3>
          <p className="mt-1 text-xs text-gray-500">
            Manage fields for the selected section
          </p>
        </div>

        {/* Stage Selector */}
        {builder.stages.length > 0 ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Select Stage</label>
            <Select value={stageSelectValue} onValueChange={handleStageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a stage">
                  {workingStage
                    ? `${workingStage.name}${workingStage.is_initial ? ' (Initial)' : ''}`
                    : 'Select a stage'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {builder.stages.map((stage) => (
                  <SelectItem key={stage.id} value={String(stage.id)}>
                    {stage.name} {stage.is_initial && '(Initial)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No stages defined. Please add stages first in the Stages tab.
            </AlertDescription>
          </Alert>
        )}

        {/* Section Selector */}
        {workingStageId && sections.length > 0 ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Select Section</label>
            <Select value={sectionSelectValue} onValueChange={handleSectionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section">
                  {workingSection ? workingSection.name : 'Select a section'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : workingStageId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No sections in this stage. Add sections in the Sections tab.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* Add Field Button / Field Type Selector */}
      {workingStageId && workingSectionId && (
        <div>
          {!showFieldTypeSelector ? (
            <Button onClick={handleAddFieldClick} size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Field to {workingSection?.name}
            </Button>
          ) : (
            <FieldTypeSelector
              onSelect={handleFieldTypeSelected}
              onCancel={() => setShowFieldTypeSelector(false)}
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {workingStageId && workingSectionId && fields.length === 0 && !showFieldTypeSelector && (
        <Alert>
          <Box className="h-4 w-4" />
          <AlertDescription>
            No fields in this section. Add your first field to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Field List */}
      {workingStageId && workingSectionId && fields.length > 0 && (
        <div className="space-y-3">
          <div className="border-t pt-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Fields</h4>
            <FieldList
              stageId={workingStageId}
              sectionId={workingSectionId}
              fields={fields}
              selectedFieldId={selectedFieldId}
              onFieldSelect={handleFieldSelect}
            />
          </div>

          {/* Field Editor (when field is selected) */}
          {selectedFieldId && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Edit Field</h4>
              <FieldEditor
                stageId={workingStageId}
                sectionId={workingSectionId}
                fieldId={selectedFieldId}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
