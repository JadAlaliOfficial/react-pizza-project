import type { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectRules = (s: RootState) => s.rules.rules;

export const selectRuleById =
  (id: string) =>
  (s: RootState) =>
    s.rules.rules.find((r) => r.id === id);

export const selectEnabledRules = createSelector(
  [selectRules],
  (rules) => rules.filter((r) => r.enabled)
);
