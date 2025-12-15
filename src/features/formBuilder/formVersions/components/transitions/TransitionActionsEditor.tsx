// src/features/formVersion/components/transitions/TransitionActionsEditor.tsx

/**
 * Transition Actions Editor Component
 * Manages the list of actions within a transition
 * Provides add/remove/edit capabilities for transition actions
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { UiTransitionAction, ActionType } from '../../types/formVersion.ui-types';
import {
  getActionConfigComponent,
  getActionTypeIcon,
} from './actionComponentRegistry';
import { useActions } from '@/features/formBuilder/actions/hooks/useActions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// ============================================================================
// Component Props
// ============================================================================

interface TransitionActionsEditorProps {
  /**
   * List of actions for this transition
   */
  actions: UiTransitionAction[];

  /**
   * Callback when a new action is added
   */
  onAddAction: (actionType: ActionType) => void;

  /**
   * Callback when an action is updated
   */
  onUpdateAction: (actionIndex: number, changes: Partial<UiTransitionAction>) => void;

  /**
   * Callback when an action is removed
   */
  onRemoveAction: (actionIndex: number) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * TransitionActionsEditor Component
 * 
 * Manages actions for a transition.
 * Features:
 * - Add action dropdown
 * - List of configured actions
 * - Action-specific config components
 * - Delete action buttons
 * - Reorder handles (visual only for now)
 */
export const TransitionActionsEditor: React.FC<TransitionActionsEditorProps> = ({
  actions,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
}) => {
  console.debug('[TransitionActionsEditor] Rendering with', actions.length, 'actions');

  const [selectedActionType, setSelectedActionType] = React.useState<ActionType | ''>('');
  const { actions: availableActions, isLoading, error, refetch } = useActions({ autoFetch: true });
  const actionTypeOptions = React.useMemo<ActionType[]>(
    () =>
      availableActions
        .map((a) => a.name as ActionType)
        .filter((name, idx, arr) => arr.indexOf(name) === idx),
    [availableActions]
  );

  /**
   * Handles adding a new action
   */
  const handleAddAction = (): void => {
    if (!selectedActionType) {
      console.warn('[TransitionActionsEditor] No action type selected');
      return;
    }

    console.info('[TransitionActionsEditor] Adding action:', selectedActionType);
    onAddAction(selectedActionType);
    setSelectedActionType(''); // Reset selector
  };

  /**
   * Handles updating action props
   */
  const handleUpdateActionProps = (
    actionIndex: number,
    newProps: Record<string, any>
  ): void => {
    console.debug('[TransitionActionsEditor] Updating action', actionIndex, 'props');
    onUpdateAction(actionIndex, { actionProps: newProps });
  };

  /**
   * Handles deleting an action
   */
  const handleDeleteAction = (actionIndex: number): void => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this action? This cannot be undone.'
    );

    if (!confirmed) {
      console.debug('[TransitionActionsEditor] Delete cancelled by user');
      return;
    }

    console.info('[TransitionActionsEditor] Deleting action', actionIndex);
    onRemoveAction(actionIndex);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Label className="text-xs font-medium">Actions</Label>
        <p className="text-[10px] text-muted-foreground mt-1">
          Define actions to execute when this transition occurs
        </p>
      </div>

      {/* Action List */}
      {actions.length > 0 && (
        <div className="space-y-3">
          {actions.map((action, index) => {
            const ActionConfigComponent = getActionConfigComponent(action.actionType);
            const icon = getActionTypeIcon(action.actionType);

            return (
              <div key={index} className="relative">
                {/* Action Header */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline" className="text-xs gap-1">
                      {icon} {action.actionType}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleDeleteAction(index)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Action Config Component */}
                <ActionConfigComponent
                  value={action.actionProps}
                  onChange={(newProps) => handleUpdateActionProps(index, newProps)}
                  actionIndex={index}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {actions.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-md bg-gray-50">
          <p className="text-xs text-gray-500">
            No actions configured. Add an action to trigger when this transition occurs.
          </p>
        </div>
      )}

      {/* Add Action */}
      <div className="flex gap-2">
        <Select
          value={selectedActionType}
          onValueChange={(val) => setSelectedActionType(val as ActionType)}
          disabled={isLoading || !!error}
        >
          <SelectTrigger className="flex-1 h-9 text-xs">
            <SelectValue placeholder="Select action type" />
          </SelectTrigger>
          <SelectContent>
            {isLoading && (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading actions...
              </div>
            )}
            {!isLoading &&
              actionTypeOptions.map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {getActionTypeIcon(type)} {type}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddAction}
          disabled={!selectedActionType || !!error}
          size="sm"
          className="gap-2 h-9"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}{' '}
            <button
              type="button"
              onClick={() => refetch(true)}
              className="underline ml-1"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
