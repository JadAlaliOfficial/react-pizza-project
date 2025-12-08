import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Shuffle, ArrowRight, X } from 'lucide-react';
import type { Stage, StageTransition, ActionType } from '@/features/formBuilder/formVersions/types';
import { SendEmailAction } from './actions/SendEmailAction';
import type { SendEmailActionProps } from './actions/SendEmailAction';
import { SendNotificationAction } from './actions/SendNotificationAction';
import type { SendNotificationActionProps } from './actions/SendNotificationAction';
import { CallWebhookAction } from './actions/CallWebhookAction';
import type { CallWebhookActionProps } from './actions/CallWebhookAction';

type TransitionsTabProps = {
  stages: Stage[];
  transitions: StageTransition[];
  onTransitionsChange: (transitions: StageTransition[]) => void;
};

const ACTION_TYPES: ActionType[] = ['Send Email', 'Send Notification', 'Call Webhook'];

export function TransitionsTab({
  stages,
  transitions,
  onTransitionsChange,
}: TransitionsTabProps) {
  // Only stages that have an ID can be used in transitions
  const stageOptions = stages.filter((stage) => stage.id !== null);

  const handleAddTransition = () => {
    if (stageOptions.length === 0) return;

    const defaultStageId = stageOptions[0].id as number;
    const newTransition: StageTransition = {
      from_stage_id: defaultStageId,
      to_stage_id: defaultStageId,
      to_complete: false,
      label: 'New Transition',
      condition: null,
      actions: [],
    };

    onTransitionsChange([...transitions, newTransition]);
  };

  const handleDeleteTransition = (index: number) => {
    const next = [...transitions];
    next.splice(index, 1);
    onTransitionsChange(next);
  };

  const updateTransition = (index: number, updated: Partial<StageTransition>) => {
    const next = [...transitions];
    next[index] = { ...next[index], ...updated };
    onTransitionsChange(next);
  };

  const getStageNameById = (stageId: number | null | undefined): string => {
    if (stageId === null || stageId === undefined) return 'Unknown';
    const stage = stageOptions.find((s) => s.id === stageId);
    return stage?.name ?? `Stage ${stageId}`;
  };

  // Action management
  const addAction = (transitionIndex: number, actionType: ActionType) => {
    const transition = transitions[transitionIndex];
    const newAction = {
      actionType,
      actionProps: {},
    };

    updateTransition(transitionIndex, {
      actions: [...(transition.actions || []), newAction as any],
    });
  };

  const updateAction = (
    transitionIndex: number,
    actionIndex: number,
    actionProps: SendEmailActionProps | SendNotificationActionProps | CallWebhookActionProps
  ) => {
    const transition = transitions[transitionIndex];
    const actions = [...(transition.actions || [])];
    actions[actionIndex] = { ...actions[actionIndex], actionProps };
    updateTransition(transitionIndex, { actions });
  };

  const deleteAction = (transitionIndex: number, actionIndex: number) => {
    const transition = transitions[transitionIndex];
    const actions = [...(transition.actions || [])];
    actions.splice(actionIndex, 1);
    updateTransition(transitionIndex, { actions });
  };

  const renderActionComponent = (
    action: any,
    transitionIndex: number,
    actionIndex: number
  ) => {
    const handleChange = (props: any) => {
      updateAction(transitionIndex, actionIndex, props);
    };

    switch (action.actionType) {
      case 'Send Email':
        return (
          <SendEmailAction
            props={action.actionProps as SendEmailActionProps}
            onChange={handleChange}
          />
        );
      case 'Send Notification':
        return (
          <SendNotificationAction
            props={action.actionProps as SendNotificationActionProps}
            onChange={handleChange}
          />
        );
      case 'Call Webhook':
        return (
          <CallWebhookAction
            props={action.actionProps as CallWebhookActionProps}
            onChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  if (stageOptions.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p className="text-sm mb-1">No stages with IDs available.</p>
        <p className="text-xs">
          Please save or load a form version with existing stages before configuring transitions.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Stage Transitions</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Define how submissions move between stages in the workflow
          </p>
        </div>
        <Button size="sm" onClick={handleAddTransition}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Transition
        </Button>
      </div>

      {transitions.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p className="text-sm mb-3">No transitions defined yet.</p>
          <p className="text-xs mb-4">Create transitions to move submissions between stages.</p>
          <Button size="sm" onClick={handleAddTransition}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add First Transition
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {transitions.map((transition, index) => (
            <Card key={index} className="p-4 space-y-3 border-l-4 border-l-primary/60">
              {/* Transition Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        Transition {index + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {getStageNameById(transition.from_stage_id)}
                        <ArrowRight className="inline-block h-3 w-3 mx-1" />
                        {getStageNameById(transition.to_stage_id)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Controls how entries move between stages
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTransition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* From/To stages */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">From Stage</label>
                  <Select
                    value={
                      transition.from_stage_id !== null
                        ? String(transition.from_stage_id)
                        : undefined
                    }
                    onValueChange={(val) =>
                      updateTransition(index, { from_stage_id: Number(val) })
                    }
                  >
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Select from stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map((stage) => (
                        <SelectItem key={stage.id} value={String(stage.id)} className="text-xs">
                          {stage.name}
                          {stage.is_initial && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              (Initial)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">To Stage</label>
                  <Select
                    value={
                      transition.to_stage_id !== null ? String(transition.to_stage_id) : undefined
                    }
                    onValueChange={(val) => updateTransition(index, { to_stage_id: Number(val) })}
                  >
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Select to stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map((stage) => (
                        <SelectItem key={stage.id} value={String(stage.id)} className="text-xs">
                          {stage.name}
                          {stage.is_initial && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              (Initial)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Label & to_complete */}
              <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Label</label>
                  <Input
                    value={transition.label ?? ''}
                    onChange={(e) => updateTransition(index, { label: e.target.value })}
                    placeholder="e.g. Submit for Review"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5 md:pt-0">
                  <Switch
                    checked={Boolean(transition.to_complete)}
                    onCheckedChange={(checked) =>
                      updateTransition(index, { to_complete: checked })
                    }
                    id={`to-complete-${index}`}
                  />
                  <label
                    htmlFor={`to-complete-${index}`}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Marks submission as completed when this transition is used
                  </label>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1.5 pt-2 border-t">
                <label className="text-xs font-medium text-muted-foreground">
                  Condition (optional)
                </label>
                <Textarea
                  value={transition.condition ?? ''}
                  onChange={(e) =>
                    updateTransition(index, { condition: e.target.value || null })
                  }
                  placeholder="e.g. applicant.score > 80"
                  className="min-h-[60px] text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Leave empty for unconditional transition. This maps to the{' '}
                  <code>condition</code> field in the API payload.
                </p>
              </div>

              {/* Actions Section */}
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Actions ({transition.actions?.length || 0})
                  </label>
                  <Select onValueChange={(val) => addAction(index, val as ActionType)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Add action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-xs">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Render Action Components */}
                {(transition.actions || []).map((action, actionIndex) => (
                  <div key={actionIndex} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute top-2 right-2 h-6 w-6 z-10 text-destructive hover:text-destructive"
                      onClick={() => deleteAction(index, actionIndex)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {renderActionComponent(action, index, actionIndex)}
                  </div>
                ))}

                {(!transition.actions || transition.actions.length === 0) && (
                  <p className="text-[10px] text-muted-foreground text-center py-2">
                    No actions configured. Use the dropdown above to add actions.
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
