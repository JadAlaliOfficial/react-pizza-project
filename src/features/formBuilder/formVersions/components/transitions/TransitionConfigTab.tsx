// src/features/formVersion/components/transitions/TransitionConfigTab.tsx

/**
 * Transition Configuration Tab Component
 * Main orchestrator for the Transitions tab in the config drawer
 * Manages stage transitions with create, edit, delete capabilities
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';
import { useTransitionActions, useTransitionSelection } from '../../hooks/useFormVersionBuilder.transitions';
import type { UiStageTransition } from '../../types/formVersion.ui-types';
import { TransitionList } from './TransitionList';
import { TransitionEditor } from './TransitionEditor';

// ============================================================================
// Component
// ============================================================================

/**
 * TransitionConfigTab Component
 * 
 * Renders transition management interface.
 * Features:
 * - List of all transitions
 * - Add transition button
 * - Select transition to edit
 * - Edit transition properties and actions
 */
export const TransitionConfigTab: React.FC = () => {
  const builder = useFormVersionBuilder();
  const transitionActions = useTransitionActions();
  const { transitions, selectedTransition, setSelected } = useTransitionSelection();

  console.debug('[TransitionConfigTab] Rendering with', transitions.length, 'transitions');

  /**
   * Handles adding a new transition
   * Pre-selects the first two stages if available
   */
  const handleAddTransition = (): void => {
    console.info('[TransitionConfigTab] Adding new transition');

    // Default: create transition between first two stages, or first to itself
    const fromStageId = builder.stages[0]?.id;
    const toStageId = builder.stages[1]?.id || builder.stages[0]?.id;

    if (!fromStageId || !toStageId) {
      console.warn('[TransitionConfigTab] Cannot add transition: Need at least one stage');
      alert('Please create at least one stage before adding transitions.');
      return;
    }

    transitionActions.addTransition(fromStageId, toStageId);
    console.info('[TransitionConfigTab] Created new transition');
  };

  /**
   * Handles selecting a transition for editing
   */
  const handleSelectTransition = (transition: UiStageTransition): void => {
    console.debug('[TransitionConfigTab] Selecting transition:', transition.id);
    setSelected(transition.id);
  };

  /**
   * Handles deleting a transition
   */
  const handleDeleteTransition = (transitionId: UiStageTransition['id']): void => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this transition? This cannot be undone.'
    );

    if (!confirmed) {
      console.debug('[TransitionConfigTab] Delete cancelled by user');
      return;
    }

    console.info('[TransitionConfigTab] Deleting transition:', transitionId);
    transitionActions.removeTransition(transitionId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Stage Transitions</h3>
            <p className="mt-1 text-xs text-gray-500">
              Define workflow transitions between stages
            </p>
          </div>
        </div>

        {/* Info if no stages */}
        {builder.stages.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No stages defined. Please add stages first in the Stages tab.
            </AlertDescription>
          </Alert>
        )}

        {/* Info if only one stage */}
        {builder.stages.length === 1 && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-xs">
              You have one stage. You can create transitions to mark this stage as complete,
              or add more stages for a multi-step workflow.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Add transition button */}
      {builder.stages.length > 0 && (
        <Button onClick={handleAddTransition} size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Transition
        </Button>
      )}

      {/* Empty state */}
      {builder.stages.length > 0 && transitions.length === 0 && (
        <Alert>
          <ArrowRightLeft className="h-4 w-4" />
          <AlertDescription>
            No transitions defined. Add your first transition to define workflow steps.
          </AlertDescription>
        </Alert>
      )}

      {/* Content: List + Editor */}
      {transitions.length > 0 && (
        <div className="space-y-4">
          {/* Transition list */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Transitions ({transitions.length})
            </Label>
            <TransitionList
              transitions={transitions}
              selectedTransitionId={selectedTransition?.id || null}
              stages={builder.stages}
              onSelect={handleSelectTransition}
              onDelete={handleDeleteTransition}
            />
          </div>

          {/* Transition editor */}
          {selectedTransition && (
            <div className="border-t pt-4">
              <TransitionEditor
                transition={selectedTransition}
                stages={builder.stages}
                onChange={(changes) =>
                  transitionActions.updateTransition(selectedTransition.id, changes)
                }
                onAddAction={(actionType) =>
                  transitionActions.addAction(selectedTransition.id, actionType)
                }
                onUpdateAction={(actionIndex, changes) =>
                  transitionActions.updateAction(
                    selectedTransition.id,
                    actionIndex,
                    changes
                  )
                }
                onRemoveAction={(actionIndex) =>
                  transitionActions.removeAction(selectedTransition.id, actionIndex)
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add missing Label import for the component to compile
import { Label } from '@/components/ui/label';
