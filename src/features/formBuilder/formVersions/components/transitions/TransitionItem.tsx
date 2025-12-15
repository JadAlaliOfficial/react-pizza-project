// src/features/formVersion/components/transitions/TransitionItem.tsx

/**
 * Transition Item Component
 * Displays a single transition in the list with selection and delete
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trash2, CheckCircle } from 'lucide-react';
import type { UiStageTransition } from '../../types/formVersion.ui-types';
import { isFakeId } from '../../types/formVersion.ui-types';
import { getActionTypeIcon } from './actionComponentRegistry';

// ============================================================================
// Component Props
// ============================================================================

interface TransitionItemProps {
  /**
   * Transition to display
   */
  transition: UiStageTransition;

  /**
   * Whether this transition is currently selected
   */
  isSelected: boolean;

  /**
   * Name of the source stage
   */
  fromStageName: string;

  /**
   * Name of the destination stage
   */
  toStageName: string;

  /**
   * Callback when transition is selected
   */
  onSelect: () => void;

  /**
   * Callback when transition should be deleted
   */
  onDelete: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * TransitionItem Component
 * 
 * Renders a single transition card.
 * Features:
 * - Shows from → to stage names
 * - Shows transition label
 * - Shows action count
 * - Shows completion status
 * - Highlights when selected
 * - Click to select
 * - Delete button
 */
export const TransitionItem: React.FC<TransitionItemProps> = ({
  transition,
  isSelected,
  fromStageName,
  toStageName,
  onSelect,
  onDelete,
}) => {
  console.debug('[TransitionItem] Rendering transition:', transition.id);

  const isFake = isFakeId(transition.id);
  const hasActions = transition.actions.length > 0;

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-3 border rounded-lg cursor-pointer transition-all
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {/* Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Stage flow */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-700 truncate">
              {fromStageName}
            </span>
            <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {toStageName}
            </span>
          </div>

          {/* Transition label */}
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {transition.label}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Completion badge */}
            {transition.to_complete && (
              <Badge variant="default" className="text-[10px] gap-1">
                <CheckCircle className="h-3 w-3" />
                Completes Workflow
              </Badge>
            )}

            {/* Action count */}
            {hasActions && (
              <Badge variant="outline" className="text-[10px]">
                {transition.actions.length} action{transition.actions.length !== 1 ? 's' : ''}
              </Badge>
            )}

            {/* Condition indicator */}
            {transition.condition && (
              <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300">
                Has condition
              </Badge>
            )}

            {/* Fake ID indicator */}
            {isFake && (
              <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-300">
                New
              </Badge>
            )}
          </div>

          {/* Actions preview */}
          {hasActions && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {transition.actions.map((a, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px]">
                  {getActionTypeIcon(a.actionType)} {a.actionType}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
      )}
    </div>
  );
};
