// src/features/formVersion/components/StagesTab.tsx

/**
 * Stages Tab Component
 *
 * Handles stage-level configuration:
 * - Add/delete stages
 * - Edit stage name
 * - Set initial stage
 * - Configure visibility conditions
 * - Set access rules
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { Stage, AccessRule } from "@/features/formBuilder/formVersions/types";

type StagesTabProps = {
  stages: Stage[];
  onStagesChange: (stages: Stage[]) => void;
  selectedStageIndex: number;
  onStageSelect: (index: number) => void;
};

export function StagesTab({
  stages,
  onStagesChange,
  selectedStageIndex,
  onStageSelect,
}: StagesTabProps) {
  const handleAddStage = () => {
    const newStage: Stage = {
      name: "New Stage",
      is_initial: stages.length === 0,
      visibility_condition: null,
      sections: [],
      access_rule: {
        allowed_users: null,
        allowed_roles: "[]",
        allowed_permissions: null,
        allow_authenticated_users: false,
        email_field_id: null,
      },
    };
    onStagesChange([...stages, newStage]);
    onStageSelect(stages.length);
  };

  const handleDeleteStage = (index: number) => {
    const next = [...stages];
    next.splice(index, 1);

    if (next.length > 0 && !next.some((s) => s.is_initial)) {
      next[0] = { ...next[0], is_initial: true };
    }

    onStagesChange(next);
    if (selectedStageIndex >= next.length) {
      onStageSelect(Math.max(0, next.length - 1));
    }
  };

  const handleStageNameChange = (index: number, value: string) => {
    const next = [...stages];
    next[index] = { ...next[index], name: value };
    onStagesChange(next);
  };

  const handleToggleInitialStage = (index: number) => {
    const next = stages.map((stage, idx) => ({
      ...stage,
      is_initial: idx === index,
    }));
    onStagesChange(next);
  };

  const handleVisibilityChange = (index: number, value: string) => {
    const next = [...stages];
    next[index] = { ...next[index], visibility_condition: value || null };
    onStagesChange(next);
  };

  const handleAllowedRolesChange = (index: number, value: string) => {
    const next = [...stages];
    const stage = next[index];
    const updatedAccessRule: AccessRule = {
      allowed_users: stage.access_rule?.allowed_users ?? null,
      allowed_roles: value,
      allowed_permissions: stage.access_rule?.allowed_permissions ?? null,
      allow_authenticated_users:
        stage.access_rule?.allow_authenticated_users ?? false,
      email_field_id: stage.access_rule?.email_field_id ?? null,
    };
    next[index] = { ...stage, access_rule: updatedAccessRule };
    onStagesChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Stage Configuration</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage workflow stages and their properties
          </p>
        </div>
        <Button size="sm" onClick={handleAddStage}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Stage
        </Button>
      </div>

      {stages.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p className="text-sm mb-3">No stages defined yet.</p>
          <Button size="sm" onClick={handleAddStage}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add First Stage
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <Card
              key={stage.id ?? `stage-${index}`}
              className={`cursor-pointer transition-all ${
                selectedStageIndex === index
                  ? "border-primary shadow-md"
                  : "hover:border-muted-foreground/50"
              }`}
              onClick={() => onStageSelect(index)}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        Stage {index + 1}
                      </span>
                      {stage.is_initial && (
                        <Badge variant="outline" className="text-xs">
                          Initial
                        </Badge>
                      )}
                    </div>

                    <Input
                      value={stage.name}
                      onChange={(e) =>
                        handleStageNameChange(index, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Stage name"
                      className="h-9"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStage(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {selectedStageIndex === index && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={stage.is_initial}
                        onCheckedChange={() => handleToggleInitialStage(index)}
                        id={`initial-${index}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`initial-${index}`}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Set as initial stage
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Visibility Condition
                      </label>
                      <Textarea
                        value={stage.visibility_condition ?? ""}
                        onChange={(e) =>
                          handleVisibilityChange(index, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g. user.role == 'manager'"
                        className="min-h-[60px] text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Allowed Roles (JSON)
                      </label>
                      <Input
                        value={stage.access_rule?.allowed_roles ?? "[]"}
                        onChange={(e) =>
                          handleAllowedRolesChange(index, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder='e.g. "[2, 3]"'
                        className="h-9 text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        JSON array of role IDs
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
