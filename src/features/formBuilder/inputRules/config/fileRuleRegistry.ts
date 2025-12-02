// features/formBuilder/inputRules/config/fileRuleRegistry.ts

import type {
  FileRuleType,
  FileRuleDataUnion,
  MimesRuleData,
  MimetypesRuleData,
  SizeRuleData,
  MaxFileSizeRuleData,
  MinFileSizeRuleData,
  DimensionsRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";
import type { RuleRegistryEntry } from "./ruleRegistry.types";

// Connected UI components
import { MimesRuleNew } from "@/features/formBuilder/inputRules/components/MimesRuleNew";
import { MimeTypesRuleNew } from "@/features/formBuilder/inputRules/components/MimetypesRuleNew";
import { SizeRuleNew } from "@/features/formBuilder/inputRules/components/SizeRuleNew";
import { MaxFileSizeRuleNew } from "@/features/formBuilder/inputRules/components/MaxFileSizeRuleNew";
import { MinFileSizeRuleNew } from "@/features/formBuilder/inputRules/components/MinFileSizeRuleNew";
import { DimensionsRuleNew } from "@/features/formBuilder/inputRules/components/DimensionsRuleNew";

export const FILE_RULE_REGISTRY: Record<FileRuleType, RuleRegistryEntry> = {
  mimes: {
    label: "Mimes",
    description: "File must be of specified MIME types (e.g., jpg, png, pdf)",
    makeDefault: (inputRuleId: number): FileRuleDataUnion => {
      const rule: MimesRuleData = {
        id: crypto.randomUUID(),
        type: "mimes",
        inputRuleId,
        enabled: false,
        props: {
          types: undefined,
        },
      };
      return rule;
    },
    Component: MimesRuleNew,
  },

  mimetypes: {
    label: "Mimetypes",
    description: "File must match specified MIME type patterns",
    makeDefault: (inputRuleId: number): FileRuleDataUnion => {
      const rule: MimetypesRuleData = {
        id: crypto.randomUUID(),
        type: "mimetypes",
        inputRuleId,
        enabled: false,
        props: {
          types: undefined,
        },
      };
      return rule;
    },
    Component: MimeTypesRuleNew,
  },

  size: {
    label: "Exact Size",
    description: "File size must be equal to specified size in kilobytes",
    makeDefault: (inputRuleId: number): FileRuleDataUnion => {
      const rule: SizeRuleData = {
        id: crypto.randomUUID(),
        type: "size",
        inputRuleId,
        enabled: false,
        props: {
          size: undefined,
        },
      };
      return rule;
    },
    Component: SizeRuleNew,
  },

  max_file_size: {
    label: "Max File Size",
    description: "Maximum file size in kilobytes (e.g., 30MB = 30720)",
    makeDefault: (inputRuleId: number): FileRuleDataUnion => {
      const rule: MaxFileSizeRuleData = {
        id: crypto.randomUUID(),
        type: "max_file_size",
        inputRuleId,
        enabled: false,
        props: {
          maxsize: undefined,
        },
      };
      return rule;
    },
    Component: MaxFileSizeRuleNew,
  },

  min_file_size: {
    label: "Min File Size",
    description: "Minimum file size in kilobytes",
    makeDefault: (inputRuleId: number): FileRuleDataUnion => {
      const rule: MinFileSizeRuleData = {
        id: crypto.randomUUID(),
        type: "min_file_size",
        inputRuleId,
        enabled: false,
        props: {
          minsize: undefined,
        },
      };
      return rule;
    },
    Component: MinFileSizeRuleNew,
  },

  dimensions: {
    label: "Dimensions",
    description:
      "Image must meet dimension requirements (width, height, min_width, etc.)",
    makeDefault: (inputRuleId: number): FileRuleDataUnion => {
      const rule: DimensionsRuleData = {
        id: crypto.randomUUID(),
        type: "dimensions",
        inputRuleId,
        enabled: false,
        props: {
          minwidth: undefined,
          maxwidth: undefined,
          minheight: undefined,
          maxheight: undefined,
          width: undefined,
          height: undefined,
        },
      };
      return rule;
    },
    Component: DimensionsRuleNew,
  },
};
