// src/features/formVersion/components/stages/StageConfigTab.tsx

/**
 * Stage configuration tab component
 * Manages the list of stages with create, edit, and delete operations
 * Enforces business rule: only one stage can be marked as initial
 * Now uses builder actions directly for better integration
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import type { UiStage } from '../../types/formVersion.ui-types';
import { generateFakeId } from '../../utils/fakeId';
import { StageItem } from './StageItem';
import { StageForm } from './StageForm';

// ============================================================================
// Component Props
// ============================================================================

interface StageConfigTabProps {
  stages: UiStage[];
  onChange: (stages: UiStage[]) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * StageConfigTab Component
 * 
 * Renders a list of stages with controls to add, edit, and delete.
 * Enforces business logic for initial stage uniqueness.
 * 
 * @param stages - Current stages array
 * @param onChange - Callback when stages are modified
 */
export const StageConfigTab: React.FC<StageConfigTabProps> = ({ stages, onChange }) => {
  const [editingStage, setEditingStage] = useState<UiStage | null>(null);

  console.debug('[StageConfigTab] Rendering with', stages.length, 'stages');

  /**
   * Creates a new stage with fake ID and default values
   */
  const handleAddStage = (): void => {
    console.info('[StageConfigTab] Adding new stage');

    const newStage: UiStage = {
      id: generateFakeId(),
      name: `Stage ${stages.length + 1}`,
      description: null,
      order: stages.length,
      is_initial: stages.length === 0, // First stage is initial by default
      allow_rejection: false,
      visibility_condition: null,
      visibility_conditions: null,
      access_rule: {
        allowed_users: null,
        allowed_roles: null,
        allowed_permissions: null,
        allow_authenticated_users: false,
        email_field_id: null,
      },
      sections: [],
    };

    onChange([...stages, newStage]);
    console.info('[StageConfigTab] Created stage:', newStage.id);
  };

  /**
   * Updates a specific stage
   * Enforces that only one stage can be initial
   */
  const handleUpdateStage = (updatedStage: UiStage): void => {
    console.info('[StageConfigTab] Updating stage:', updatedStage.id);

    const newStages = stages.map((stage) => {
      // If this is the stage being updated
      if (stage.id === updatedStage.id) {
        return updatedStage;
      }

      // If the updated stage is now initial, clear is_initial from this stage
      if (updatedStage.is_initial) {
        return { ...stage, is_initial: false };
      }

      return stage;
    });

    onChange(newStages);
  };

  /**
   * Deletes a stage by ID
   * If deleting the initial stage, makes the first remaining stage initial
   */
  const handleDeleteStage = (stageId: UiStage['id']): void => {
    console.info('[StageConfigTab] Deleting stage:', stageId);

    const stageToDelete = stages.find((s) => s.id === stageId);
    const newStages = stages.filter((s) => s.id !== stageId);

    // If we deleted the initial stage and there are remaining stages, make the first one initial
    if (stageToDelete?.is_initial && newStages.length > 0) {
      console.debug('[StageConfigTab] Deleted initial stage, making first remaining stage initial');
      newStages[0] = { ...newStages[0], is_initial: true };
    }

    onChange(newStages);
  };

  /**
   * Opens the stage form for editing
   */
  const handleEditStage = (stage: UiStage): void => {
    console.debug('[StageConfigTab] Opening edit form for stage:', stage.id);
    setEditingStage(stage);
  };

  /**
   * Closes the stage form
   */
  const handleCloseForm = (): void => {
    console.debug('[StageConfigTab] Closing edit form');
    setEditingStage(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Workflow Stages</h3>
          <p className="mt-1 text-xs text-gray-500">
            Define the stages in your form workflow
          </p>
        </div>
        <Button onClick={handleAddStage} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Stage
        </Button>
      </div>

      {/* Empty state */}
      {stages.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No stages defined. Add your first stage to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Stage list */}
      <div className="space-y-3">
        {stages.map((stage) => (
          <StageItem
            key={stage.id}
            stage={stage}
            onChange={handleUpdateStage}
            onDelete={() => handleDeleteStage(stage.id)}
            onEdit={() => handleEditStage(stage)}
          />
        ))}
      </div>

      {/* Stage form dialog */}
      {editingStage && (
        <StageForm
          stage={editingStage}
          onChange={handleUpdateStage}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
