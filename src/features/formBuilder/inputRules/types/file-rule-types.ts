// features/formBuilder/inputRules/types/file-rule-types.ts

import type { RuleBase, RuleType } from "./rule-base";

// Narrowed helper type for file-related rule names
export type FileRuleType = Extract<
  RuleType,
  | "mimes"
  | "mimetypes"
  | "size"
  | "max_file_size"
  | "min_file_size"
  | "dimensions"
>;

// 1) MIMES ("mimes") ---------------------------------
//
// File must be of specified MIME types (e.g., jpg, png, pdf)
export type MimesRuleProps = {
  types?: string[]; // e.g. ["jpg", "png", "pdf"]
};

export type MimesRuleData = RuleBase<"mimes", MimesRuleProps>;

// 2) MIMETYPES ("mimetypes") -------------------------
//
// File must match specified MIME type patterns
export type MimetypesRuleProps = {
  types?: string[]; // e.g. ["image/*", "video/*", "application/pdf"]
};

export type MimetypesRuleData = RuleBase<"mimetypes", MimetypesRuleProps>;

// 3) SIZE ("size") -----------------------------------
//
// File size must be equal to specified size in kilobytes
export type SizeRuleProps = {
  size?: number; // size in KB
};

export type SizeRuleData = RuleBase<"size", SizeRuleProps>;

// 4) MAX_FILE_SIZE ("max_file_size") -----------------
//
// Maximum file size in kilobytes (e.g., 30MB = 30720)
export type MaxFileSizeRuleProps = {
  maxsize?: number; // max size in KB
};

export type MaxFileSizeRuleData = RuleBase<"max_file_size", MaxFileSizeRuleProps>;

// 5) MIN_FILE_SIZE ("min_file_size") -----------------
//
// Minimum file size in kilobytes
export type MinFileSizeRuleProps = {
  minsize?: number; // min size in KB
};

export type MinFileSizeRuleData = RuleBase<"min_file_size", MinFileSizeRuleProps>;

// 6) DIMENSIONS ("dimensions") -----------------------
//
// Image must meet dimension requirements
export type DimensionsRuleProps = {
  minwidth?: number;
  maxwidth?: number;
  minheight?: number;
  maxheight?: number;
  width?: number;
  height?: number;
};

export type DimensionsRuleData = RuleBase<"dimensions", DimensionsRuleProps>;

// 7) Union of all file rule data types ---------------

export type FileRuleDataUnion =
  | MimesRuleData
  | MimetypesRuleData
  | SizeRuleData
  | MaxFileSizeRuleData
  | MinFileSizeRuleData
  | DimensionsRuleData;
