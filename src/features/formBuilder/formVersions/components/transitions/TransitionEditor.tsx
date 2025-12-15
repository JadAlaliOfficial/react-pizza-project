// src/features/formVersion/components/transitions/TransitionEditor.tsx

/**
 * Transition Editor Component
 * Provides detailed editing interface for a single transition
 * Includes stage selection, properties, and action management
 */

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  UiStageTransition,
  UiStage,
  UiTransitionAction,
  ActionType,
} from '../../types/formVersion.ui-types';
import { TransitionActionsEditor } from './TransitionActionsEditor';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../shared/VisibilityConditionsBuilder';

// ============================================================================
// Component Props
// ============================================================================

interface TransitionEditorProps {
  /**
   * Transition being edited
   */
  transition: UiStageTransition;

  /**
   * Available stages for from/to selection
   */
  stages: UiStage[];

  /**
   * Callback when transition properties change
   */
  onChange: (changes: Partial<Omit<UiStageTransition, 'id' | 'actions'>>) => void;

  /**
   * Callback when an action is added
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
 * TransitionEditor Component
 * 
 * Detailed editor for a single transition.
 * Features:
 * - From stage selector
 * - To stage selector
 * - Label input
 * - Completion toggle
 * - Condition input (JSON)
 * - Actions editor
 */
export const TransitionEditor: React.FC<TransitionEditorProps> = ({
  transition,
  stages,
  onChange,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
}) => {
  console.debug('[TransitionEditor] Rendering for transition:', transition.id);

  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const builderValue = useMemo(
    () => parseVisibilityConditions(transition.condition as any),
    [transition.condition],
  );

  /**
   * Updates a field in the transition
   */
  const updateField = <K extends keyof Omit<UiStageTransition, 'id' | 'actions'>>(
    field: K,
    value: UiStageTransition[K]
  ): void => {
    onChange({ [field]: value } as any);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Edit Transition</h4>
        <p className="text-xs text-gray-500 mt-1">
          Configure transition properties and actions
        </p>
      </div>

      {/* From Stage */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          From Stage <span className="text-destructive">*</span>
        </Label>
        <Select
          value={String(transition.from_stage_id)}
          onValueChange={(val) => {
            // Parse to number if it's a numeric string, otherwise keep as is
            const parsed = parseInt(val, 10);
            updateField('from_stage_id', isNaN(parsed) ? val : parsed);
          }}
        >
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Select from stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={String(stage.id)} className="text-xs">
                {stage.name} {stage.is_initial && '(Initial)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Stage where this transition originates
        </p>
      </div>

      {/* To Stage */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          To Stage <span className="text-destructive">*</span>
        </Label>
        <Select
          value={transition.to_stage_id === null ? '__COMPLETE__' : String(transition.to_stage_id)}
          onValueChange={(val) => {
            if (val === '__COMPLETE__') {
              updateField('to_stage_id', null as any);
              updateField('to_complete', true as any);
              return;
            }
            const parsed = parseInt(val, 10);
            updateField('to_stage_id', isNaN(parsed) ? (val as any) : (parsed as any));
          }}
        >
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Select to stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__COMPLETE__" className="text-xs">
              Complete Workflow (no next stage)
            </SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={String(stage.id)} className="text-xs">
                {stage.name} {stage.is_initial && '(Initial)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Stage where this transition leads to
        </p>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Transition Label <span className="text-destructive">*</span>
        </Label>
        <Input
          value={transition.label}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="e.g., Submit for Review, Approve, Reject"
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Button text shown to users for this transition
        </p>
      </div>

      {/* Completes Workflow */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium">Completes Workflow</Label>
          <p className="text-[10px] text-muted-foreground">
            Mark this transition as completing the entire form workflow
          </p>
        </div>
        <Switch
          disabled={transition.to_stage_id === null}
          checked={transition.to_complete}
          onCheckedChange={(checked) => updateField('to_complete', checked)}
        />
      </div>

      {/* Condition */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Visibility Conditions</Label>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground">
              Define when this transition is available based on field values
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setVisibilityEditorOpen(true)}
          >
            Edit Conditions
          </Button>
        </div>
      </div>

      {/* Validation warning */}
      {transition.from_stage_id === transition.to_stage_id && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900 text-xs">
            Invalid transition: cannot transition to the same stage.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions Section */}
      <div className="border-t pt-4">
        <TransitionActionsEditor
          actions={transition.actions}
          onAddAction={onAddAction}
          onUpdateAction={onUpdateAction}
          onRemoveAction={onRemoveAction}
        />
      </div>
      {visibilityEditorOpen && (
        <VisibilityConditionsBuilder
          value={builderValue}
          onChange={(condition) => {
            const serialized = serializeVisibilityConditions(condition);
            updateField('condition', serialized as any);
          }}
          stages={stages}
          open={visibilityEditorOpen}
          onClose={() => setVisibilityEditorOpen(false)}
        />
      )}
    </div>
  );
};
