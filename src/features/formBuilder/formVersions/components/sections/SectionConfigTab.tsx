// src/features/formVersion/components/sections/SectionConfigTab.tsx

/**
 * Section configuration tab component
 * Manages sections for the selected stage
 * Provides create, edit, delete, and reorder capabilities
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, AlertCircle, Layers } from 'lucide-react';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';
import type { UiSection } from '../../types/formVersion.ui-types';
import { generateFakeId } from '../../utils/fakeId';
import { SectionItem } from './SectionItem';
import { SectionForm } from './SectionForm';

// ============================================================================
// Component
// ============================================================================

/**
 * SectionConfigTab Component
 * 
 * Renders section management interface for the selected stage.
 * Includes stage selector, section list, and CRUD operations.
 */
export const SectionConfigTab: React.FC = () => {
  const builder = useFormVersionBuilder();
  const [editingSection, setEditingSection] = useState<UiSection | null>(null);

  console.debug('[SectionConfigTab] Rendering');

  // Use selectedStageId from Redux, or default to first stage
  const workingStageId = builder.selectedStageId || (builder.stages[0]?.id ?? null);
  const workingStage = builder.stages.find((s) => s.id === workingStageId);
  const sections = workingStage?.sections || [];

  // Auto-select first stage on mount if nothing is selected
  useEffect(() => {
    if (!builder.selectedStageId && builder.stages.length > 0) {
      console.debug('[SectionConfigTab] Auto-selecting first stage on mount');
      builder.setSelectedStageId(builder.stages[0].id);
    }
  }, [builder.stages.length]); // Only run when stages are loaded

  /**
   * Handles stage selection change from dropdown
   */
  const handleStageChange = (stageIdString: string): void => {
    console.debug('[SectionConfigTab] Stage selection changed:', stageIdString);
    
    // setSelectedStageId now handles string parsing internally
    builder.setSelectedStageId(stageIdString);
  };

  /**
   * Creates a new section with fake ID and default values
   */
  const handleAddSection = (): void => {
    if (!workingStageId) {
      console.warn('[SectionConfigTab] Cannot add section: No stage selected');
      return;
    }

    console.info('[SectionConfigTab] Adding new section to stage', workingStageId);

    // Calculate next order number
    const maxOrder = sections.reduce((max, sec) => Math.max(max, sec.order || 0), 0);

    const newSection: UiSection = {
      id: generateFakeId(),
      stage_id: workingStageId,
      name: `Section ${sections.length + 1}`,
      order: maxOrder + 1,
      visibility_conditions: null,
      fields: [],
    };

    builder.addSection(workingStageId, newSection);
    console.info('[SectionConfigTab] Created section:', newSection.id);
  };

  /**
   * Updates a specific section
   */
  const handleUpdateSection = (updatedSection: UiSection): void => {
    if (!workingStageId) {
      console.warn('[SectionConfigTab] Cannot update section: No stage selected');
      return;
    }

    console.info('[SectionConfigTab] Updating section:', updatedSection.id);
    builder.updateSection(workingStageId, updatedSection);
  };

  /**
   * Deletes a section by ID
   */
  const handleDeleteSection = (sectionId: UiSection['id']): void => {
    if (!workingStageId) {
      console.warn('[SectionConfigTab] Cannot delete section: No stage selected');
      return;
    }

    console.info('[SectionConfigTab] Deleting section:', sectionId);
    builder.removeSection(workingStageId, sectionId);
  };

  /**
   * Moves a section up in order
   */
  const handleMoveUp = (section: UiSection, index: number): void => {
    if (index === 0 || !workingStageId) return;

    console.debug('[SectionConfigTab] Moving section up:', section.id);

    const newSections = [...sections];
    const targetSection = { ...newSections[index] };
    const aboveSection = { ...newSections[index - 1] };

    // Swap order values
    const tempOrder = targetSection.order;
    targetSection.order = aboveSection.order;
    aboveSection.order = tempOrder;

    // Update array
    newSections[index - 1] = targetSection;
    newSections[index] = aboveSection;

    builder.reorderSections(workingStageId, newSections);
  };

  /**
   * Moves a section down in order
   */
  const handleMoveDown = (section: UiSection, index: number): void => {
    if (index === sections.length - 1 || !workingStageId) return;

    console.debug('[SectionConfigTab] Moving section down:', section.id);

    const newSections = [...sections];
    const targetSection = { ...newSections[index] };
    const belowSection = { ...newSections[index + 1] };

    // Swap order values
    const tempOrder = targetSection.order;
    targetSection.order = belowSection.order;
    belowSection.order = tempOrder;

    // Update array
    newSections[index] = belowSection;
    newSections[index + 1] = targetSection;

    builder.reorderSections(workingStageId, newSections);
  };

  /**
   * Opens the section form for editing
   */
  const handleEditSection = (section: UiSection): void => {
    console.debug('[SectionConfigTab] Opening edit form for section:', section.id);
    setEditingSection(section);
  };

  /**
   * Closes the section form
   */
  const handleCloseForm = (): void => {
    console.debug('[SectionConfigTab] Closing edit form');
    setEditingSection(null);
  };

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Convert workingStageId to string for Select component
  const selectValue = workingStageId !== null ? String(workingStageId) : '';

  return (
    <div className="space-y-4">
      {/* Header with stage selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Stage Sections</h3>
            <p className="mt-1 text-xs text-gray-500">
              Manage sections for the selected stage
            </p>
          </div>
        </div>

        {/* Stage selector */}
        {builder.stages.length > 0 ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Select Stage</label>
            <Select value={selectValue} onValueChange={handleStageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a stage">
                  {workingStage ? `${workingStage.name}${workingStage.is_initial ? ' (Initial)' : ''}` : 'Select a stage'}
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
      </div>

      {/* Add section button */}
      {workingStageId && (
        <Button onClick={handleAddSection} size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Section to {workingStage?.name}
        </Button>
      )}

      {/* Empty state */}
      {workingStageId && sortedSections.length === 0 && (
        <Alert>
          <Layers className="h-4 w-4" />
          <AlertDescription>
            No sections in this stage. Add your first section to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Section list */}
      {workingStageId && sortedSections.length > 0 && (
        <div className="space-y-2">
          {sortedSections.map((section, index) => (
            <SectionItem
              key={section.id}
              section={section}
              index={index}
              total={sortedSections.length}
              onChange={handleUpdateSection}
              onDelete={() => handleDeleteSection(section.id)}
              onEdit={() => handleEditSection(section)}
              onMoveUp={() => handleMoveUp(section, index)}
              onMoveDown={() => handleMoveDown(section, index)}
            />
          ))}
        </div>
      )}

      {/* Section form dialog */}
      {editingSection && workingStageId && (
        <SectionForm
          section={editingSection}
          onChange={handleUpdateSection}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
