// src/features/formVersion/components/transitions/TransitionList.tsx

/**
 * Transition List Component
 * Displays a list of stage transitions with selection
 */

import React from 'react';
import type { UiStageTransition, UiStage } from '../../types/formVersion.ui-types';
import { TransitionItem } from './TransitionItem';

// ============================================================================
// Component Props
// ============================================================================

interface TransitionListProps {
  /**
   * List of transitions to display
   */
  transitions: UiStageTransition[];

  /**
   * Currently selected transition ID
   */
  selectedTransitionId: UiStageTransition['id'] | null;

  /**
   * Available stages (for displaying names)
   */
  stages: UiStage[];

  /**
   * Callback when a transition is selected
   */
  onSelect: (transition: UiStageTransition) => void;

  /**
   * Callback when a transition should be deleted
   */
  onDelete: (transitionId: UiStageTransition['id']) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * TransitionList Component
 * 
 * Renders a list of transition items with selection state.
 * Features:
 * - Shows each transition with from/to stage names
 * - Highlights selected transition
 * - Click to select
 * - Delete button per item
 */
export const TransitionList: React.FC<TransitionListProps> = ({
  transitions,
  selectedTransitionId,
  stages,
  onSelect,
  onDelete,
}) => {
  console.debug('[TransitionList] Rendering', transitions.length, 'transitions');

  /**
   * Gets stage name by ID
   */
  const getStageName = (stageId: UiStage['id']): string => {
    const stage = stages.find((s) => s.id === stageId);
    return stage?.name || `Stage ${stageId}`;
  };

  return (
    <div className="space-y-2">
      {transitions.map((transition) => (
        <TransitionItem
          key={transition.id}
          transition={transition}
          isSelected={transition.id === selectedTransitionId}
          fromStageName={getStageName(transition.from_stage_id)}
          toStageName={getStageName(transition.to_stage_id)}
          onSelect={() => onSelect(transition)}
          onDelete={() => onDelete(transition.id)}
        />
      ))}
    </div>
  );
};
