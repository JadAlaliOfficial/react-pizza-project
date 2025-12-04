// src/features/formVersion/components/fields/DocumentUploadFieldConfig.tsx

/**
 * Document Upload Field Configuration Component
 *
 * Provides UI for configuring a Document Upload field:
 * - Label (main question)
 * - Allowed document types
 * - File size limits
 * - Helper text
 * - Visibility conditions
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, FileText, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type DocumentUploadFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function DocumentUploadFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: DocumentUploadFieldConfigProps) {
  const [allowedTypes, setAllowedTypes] = useState(
    field.placeholder || "pdf,doc,docx,xls,xlsx,ppt,pptx"
  );
  const [maxSizeMB, setMaxSizeMB] = useState("50");

  return (
    <Card className="p-4 border-l-4 border-l-orange-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <Badge variant="outline" className="text-xs">
              Document Upload
            </Badge>
            <span className="text-xs text-muted-foreground">
              Field {fieldIndex + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="bg-orange-50 border-orange-200">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-xs text-orange-900">
            Document upload field for office/business documents. Documents stored
            in public/documents/ directory. Supports preview/viewer for PDFs and
            download functionality.
          </AlertDescription>
        </Alert>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Upload your financial report"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Allowed Document Types */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Allowed Document Types (Extensions)
          </label>
          <Input
            value={allowedTypes}
            onChange={(e) => {
              setAllowedTypes(e.target.value);
              onFieldChange({ placeholder: e.target.value });
            }}
            placeholder="e.g., pdf,doc,docx,xls,xlsx,ppt,pptx,txt"
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Comma-separated list of document extensions. Used for validation
            via "mimes" rule.
          </p>
        </div>

        {/* Document Size Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Maximum Document Size (MB)
          </label>
          <Input
            type="number"
            value={maxSizeMB}
            onChange={(e) => setMaxSizeMB(e.target.value)}
            placeholder="50"
            className="h-9"
            min="1"
            max="200"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Documents typically 5-50MB. Use "maxfilesize" rule with value in
            KB (e.g., 50MB = 51200KB)
          </p>
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ""}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Accepted: PDF, Word, Excel. Max size: 50MB. Please ensure document is readable')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Document Storage Information */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📄 Document Storage Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Directory:</strong> public/documents/
            </div>
            <div>
              • <strong>Storage Format:</strong> JSON with metadata
            </div>
            <div>
              • <strong>Metadata:</strong> path, originalname, mimetype, size,
              extension, pages (PDF)
            </div>
            <div>
              • <strong>Preview:</strong> Document viewer (PDF, Word, Excel)
            </div>
            <div>
              • <strong>Download:</strong> Original file download available
            </div>
          </div>
        </div>

        {/* Common Document Types */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📋 Common Document Types:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>PDF:</strong> Reports, contracts, forms
            </div>
            <div>
              • <strong>Word (DOC/DOCX):</strong> Letters, proposals
            </div>
            <div>
              • <strong>Excel (XLS/XLSX):</strong> Spreadsheets, budgets
            </div>
            <div>
              • <strong>PowerPoint (PPT/PPTX):</strong> Presentations
            </div>
            <div>
              • <strong>TXT:</strong> Plain text documents
            </div>
            <div>
              • <strong>CSV:</strong> Data exports
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            💼 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Business Reports:</strong> Financial, quarterly, annual
            </div>
            <div>
              • <strong>Legal Documents:</strong> Contracts, agreements, forms
            </div>
            <div>
              • <strong>Invoices & Receipts:</strong> Billing, expenses
            </div>
            <div>
              • <strong>Spreadsheets:</strong> Data, budgets, calculations
            </div>
            <div>
              • <strong>Presentations:</strong> Slides, proposals, pitches
            </div>
          </div>
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ""
            }
            onChange={(e) =>
              onFieldChange({
                visibility_conditions: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
        </div>

        {/* Available Validation Rules Info */}
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            📋 Available Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required (must upload)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • mimes (document types)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • mimetypes
            </span>
            <span className="text-[10px] text-muted-foreground">• size</span>
            <span className="text-[10px] text-muted-foreground">
              • maxfilesize (KB)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • minfilesize (KB)
            </span>
          </div>
          <p className="text-[10px] text-orange-700 mt-2 font-medium">
            ⚠️ Stored in documents/ directory. Filter by document type (PDF,
            Word, Excel, etc.).
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "mimes" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "types": ["pdf", "doc", "docx", "xls", "xlsx"] }`}
            </code>{" "}
            and "maxfilesize" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "maxsize": 51200 }`}
            </code>{" "}
            (50MB)
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
