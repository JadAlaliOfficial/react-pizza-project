import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  RuleData,
  RulesState,
  RuleType,
} from "@/features/formBuilder/inputRules/types/rule-types";
import { RULE_REGISTRY } from "@/features/formBuilder/inputRules/config/ruleRegistry";

const initialState: RulesState = {
  rules: [],
};

export type AddRulePayload = {
  type: RuleType;        // "after" | "after_or_equal" | ...
  inputRuleId: number;   // backend rule id
  initial?: Partial<RuleData>;
};

type UpdateRulePayload = {
  id: string;
  patch: Partial<RuleData>;
};

const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    addRule: (state, action: PayloadAction<AddRulePayload>) => {
      const { type, inputRuleId, initial } = action.payload;

      const registryEntry = RULE_REGISTRY[type];
      if (!registryEntry) {
        console.warn("[rulesSlice] No registry entry for rule type:", type);
        return;
      }

      // Use registry to create the base rule
      const base = registryEntry.makeDefault(inputRuleId);

      // Allow overrides via `initial`
      const merged = { ...base, ...(initial as Partial<RuleData>) } as RuleData;

      state.rules.push(merged);

      console.log("[rulesSlice] addRule", {
        instanceId: base.id,
        type,
        inputRuleId,
        initial,
      });
    },

    removeRule: (state, action: PayloadAction<{ id: string }>) => {
      state.rules = state.rules.filter((r) => r.id !== action.payload.id);
      console.log("[rulesSlice] removeRule", action.payload.id);
    },

    updateRule: (state, action: PayloadAction<UpdateRulePayload>) => {
      const { id, patch } = action.payload;
      const idx = state.rules.findIndex((r) => r.id === id);
      if (idx !== -1) {
        state.rules[idx] = {
          ...state.rules[idx],
          ...patch,
        } as RuleData;
      }

      console.log("[rulesSlice] updateRule", {
        id,
        patch,
        next: idx !== -1 ? state.rules[idx] : undefined,
      });
    },

    setRules: (state, action: PayloadAction<RuleData[]>) => {
      state.rules = action.payload;
    },

    clearRules: (state) => {
      state.rules = [];
    },
  },
});

export const { addRule, removeRule, updateRule, setRules, clearRules } =
  rulesSlice.actions;

export default rulesSlice.reducer;
