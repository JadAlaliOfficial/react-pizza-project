// src/features/formVersion/utils/normalizers.ts

/**
 * Normalizer utilities for form version data
 * 
 * Ensures data is properly formatted for API requests
 */

import type {
  Stage,
  Section,
  StageTransition,
  TransitionAction,
  AccessRule,
} from "@/features/formBuilder/formVersions/types";

export const normalizeAccessRule = (rule: any | null): AccessRule | null => {
  if (!rule) return null;

  return {
    allowed_users:
      typeof rule.allowed_users === "string" || rule.allowed_users === null
        ? rule.allowed_users
        : null,
    allowed_roles:
      typeof rule.allowed_roles === "string" || rule.allowed_roles === null
        ? rule.allowed_roles
        : "[]",
    allowed_permissions:
      typeof rule.allowed_permissions === "string" ||
      rule.allowed_permissions === null
        ? rule.allowed_permissions
        : null,
    allow_authenticated_users: Boolean(rule.allow_authenticated_users),
    email_field_id:
      typeof rule.email_field_id === "number" || rule.email_field_id === null
        ? rule.email_field_id
        : null,
  };
};

export const normalizeStagesForUpdate = (stages: Stage[]): Stage[] => {
  return stages.map((stage) => ({
    ...stage,
    sections: stage.sections.map((section, index) => {
      const normalizedSection: Section = {
        ...section,
        order: section.order ?? index + 1,
        visibility_conditions:
          section.visibility_conditions ?? section.visibility_condition ?? null,
        fields: (section.fields || []).map((field) => ({
          ...field,
          visibility_conditions:
            (field as any).visibility_conditions ??
            field.visibility_condition ??
            null,
        })),
      };

      return normalizedSection;
    }),
    access_rule: normalizeAccessRule(stage.access_rule as any),
  }));
};

export const normalizeStageTransitionsForUpdate = (
  transitions: StageTransition[]
): StageTransition[] => {
  return transitions.map((t) => {
    const normalizedActions: TransitionAction[] = (t.actions || []).map(
      (a: any) => ({
        id: a.id,
        action_id: a.action_id,
        action_props: a.action_props,
      })
    );

    const normalized: StageTransition = {
      id: t.id,
      form_version_id: t.form_version_id,
      from_stage_id: t.from_stage_id,
      to_stage_id: t.to_stage_id,
      to_complete: t.to_complete,
      label: t.label,
      condition: t.condition,
      created_at: t.created_at,
      updated_at: t.updated_at,
      actions: normalizedActions,
    };

    return normalized;
  });
};
