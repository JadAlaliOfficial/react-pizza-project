// src/features/formVersion/pages/FormVersionBuilderPage.tsx

/**
 * Form Version Builder Page - Refactored
 *
 * Main orchestrator component that:
 * - Loads form version data
 * - Manages state for stages, sections, and transitions
 * - Renders a split view: Config Drawer (left) + Live Preview (right)
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useFormVersion,
  useUpdateFormVersion,
  useFormVersionTransitions,
} from "@/features/formBuilder/formVersions/hooks/useFormVersions";
import type {
  Stage,
  StageTransition,
  UpdateFormVersionRequest,
} from "@/features/formBuilder/formVersions/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

import { ConfigDrawer } from "../components/ConfigDrawer";
import { LivePreview } from "../components/LivePreview";
import {
  normalizeStagesForUpdate,
  normalizeStageTransitionsForUpdate,
} from "../utils/normalizers";

type FormVersionBuilderPageProps = {
  formVersionId?: number;
};

export function FormVersionBuilderPage({
  formVersionId,
}: FormVersionBuilderPageProps) {
  const { id } = useParams();
  const parsedId = id ? Number(id) : NaN;
  const effectiveFormVersionId: number | null = Number.isFinite(parsedId)
    ? parsedId
    : formVersionId ?? null;

  // Load version data
  const {
    formVersion,
    stages,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useFormVersion(effectiveFormVersionId);

  const stageTransitions = useFormVersionTransitions();

  // Update hook
  const {
    updateFormVersion: updateFormVersionMutation,
    loading: updateLoading,
    error: updateError,
  } = useUpdateFormVersion();

  // Local editable copy of stages
  const [editableStages, setEditableStages] = useState<Stage[]>([]);

  // Local editable copy of transitions
  const [editableTransitions, setEditableTransitions] = useState<
    StageTransition[]
  >([]);

  // Reset local stages when remote stages change
  useEffect(() => {
    if (stages && stages.length >= 0) {
      const cloned = stages.map((s) => ({
        ...s,
        sections: (s.sections || []).map((sec) => ({
          ...sec,
          fields: [...(sec.fields || [])],
        })),
      }));
      setEditableStages(cloned);
    }
  }, [stages]);

  // Reset local transitions when remote transitions change
  useEffect(() => {
    if (stageTransitions && stageTransitions.length >= 0) {
      const cloned = stageTransitions.map((t) => ({
        ...t,
        actions: t.actions ? [...t.actions] : [],
      }));
      setEditableTransitions(cloned);
    }
  }, [stageTransitions]);

  // Derived flags
  const isLoading = fetchLoading || updateLoading;
  const hasError = Boolean(fetchError || updateError);
  const currentStatus = formVersion?.status ?? "unknown";

  // Reset to server state
  const handleResetToServer = useCallback(() => {
    // Reset stages
    const clonedStages = (stages || []).map((s) => ({
      ...s,
      sections: (s.sections || []).map((sec) => ({
        ...sec,
        fields: [...(sec.fields || [])],
      })),
    }));
    setEditableStages(clonedStages);

    // Reset transitions
    const clonedTransitions = (stageTransitions || []).map((t) => ({
      ...t,
      actions: t.actions ? [...t.actions] : [],
    }));
    setEditableTransitions(clonedTransitions);
  }, [stages, stageTransitions]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!formVersion) return;

    const normalizedStages = normalizeStagesForUpdate(editableStages);
    const normalizedTransitions = normalizeStageTransitionsForUpdate(
      editableTransitions || []
    );

    const payload: UpdateFormVersionRequest = {
      stages: normalizedStages,
      stage_transitions: normalizedTransitions,
    };

    try {
      await updateFormVersionMutation(formVersion.id, payload);
      await refetch();
    } catch (err) {
      console.error("[FormVersionBuilderPage] Save failed:", err);
    }
  }, [
    formVersion,
    editableStages,
    editableTransitions,
    updateFormVersionMutation,
    refetch,
  ]);

  // Header info
  const headerTitle = useMemo(() => {
    if (!formVersion) return "Form Version Builder";
    const base = formVersion.form?.name ?? "Untitled Form";
    return `${base} – v${formVersion.version_number}`;
  }, [formVersion]);

  const headerSubtitle = useMemo(() => {
    if (!formVersion) return "";
    const status = formVersion.status;
    const updatedAt = formVersion.updated_at
      ? new Date(formVersion.updated_at).toLocaleString()
      : "N/A";
    return `Status: ${status.toUpperCase()} • Last updated: ${updatedAt}`;
  }, [formVersion]);

  return (
    <div className="flex flex-col h-full w-full gap-4 p-6">
      {/* Header */}
      <Card className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {headerTitle}
          </h1>
          {headerSubtitle && (
            <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
          )}
          {currentStatus && (
            <Badge
              variant={currentStatus === "published" ? "default" : "secondary"}
            >
              {currentStatus.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={refetch}
            disabled={isLoading}
          >
            <RotateCw
              className={cn("mr-2 h-4 w-4", fetchLoading && "animate-spin")}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleResetToServer}
            disabled={isLoading}
          >
            Reset Changes
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={handleSave}
            disabled={isLoading || !formVersion}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Banner */}
      {hasError && (
        <Card className="border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {fetchError?.message ?? updateError?.message ?? "An error occurred."}
        </Card>
      )}

      {/* Main Content: Config Drawer + Live Preview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[400px,1fr] xl:grid-cols-[450px,1fr]">
        {/* Left: Config Drawer with Tabs */}
        <ConfigDrawer
          stages={editableStages}
          onStagesChange={setEditableStages}
          transitions={editableTransitions}
          onTransitionsChange={setEditableTransitions}
          isLoading={isLoading}
        />

        {/* Right: Live Preview */}
        <LivePreview stages={editableStages} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default FormVersionBuilderPage;
