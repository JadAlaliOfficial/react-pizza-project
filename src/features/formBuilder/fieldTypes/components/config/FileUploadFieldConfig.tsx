// src/features/formVersion/components/fields/FileUploadFieldConfig.tsx

/**
 * File Upload Field Configuration Component
 *
 * Provides UI for configuring a File Upload field:
 * - Label (main question)
 * - Allowed file types
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
import { Trash2, Upload, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type FileUploadFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function FileUploadFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: FileUploadFieldConfigProps) {
  const [allowedTypes, setAllowedTypes] = useState(
    field.placeholder || "pdf,doc,docx,txt"
  );
  const [maxSizeMB, setMaxSizeMB] = useState("10");

  return (
    <Card className="p-4 border-l-4 border-l-violet-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-violet-500" />
            <Badge variant="outline" className="text-xs">
              File Upload
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
        <Alert className="bg-violet-50 border-violet-200">
          <Info className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-xs text-violet-900">
            File upload field with drag-and-drop support. Files are stored
            securely with metadata (path, name, size, type). Value stored as JSON
            with file information.
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
            placeholder="e.g., Upload your resume"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Allowed File Types */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Allowed File Types (Extensions)
          </label>
          <Input
            value={allowedTypes}
            onChange={(e) => {
              setAllowedTypes(e.target.value);
              onFieldChange({ placeholder: e.target.value });
            }}
            placeholder="e.g., pdf,doc,docx,txt,jpg,png"
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Comma-separated list of file extensions. Used for validation via
            "mimes" rule.
          </p>
        </div>

        {/* File Size Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Maximum File Size (MB)
          </label>
          <Input
            type="number"
            value={maxSizeMB}
            onChange={(e) => setMaxSizeMB(e.target.value)}
            placeholder="10"
            className="h-9"
            min="1"
            max="100"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Define max size in validation rules. Use "maxfilesize" rule with
            value in KB (e.g., 10MB = 10240KB)
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
            placeholder="Additional information (e.g., 'Accepted formats: PDF, DOC. Max size: 10MB')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* File Storage Information */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📁 File Storage Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Directory:</strong> public/files/
            </div>
            <div>
              • <strong>Storage Format:</strong> JSON with metadata
            </div>
            <div>
              • <strong>Metadata:</strong> path, originalname, mimetype, size,
              extension
            </div>
            <div>
              • <strong>Security:</strong> Server-side validation enforced
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📎 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Resumes/CVs:</strong> PDF, DOC, DOCX
            </div>
            <div>
              • <strong>Documents:</strong> PDF, TXT, XLS, PPTX
            </div>
            <div>
              • <strong>Certificates:</strong> PDF, JPG, PNG
            </div>
            <div>
              • <strong>Attachments:</strong> Any file type with size limits
            </div>
            <div>
              • <strong>Submissions:</strong> Assignment files, reports
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
              • mimes (file types)
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
          <p className="text-[10px] text-violet-700 mt-2 font-medium">
            ⚠️ File stored as JSON with metadata. Use validation rules for
            security.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "mimes" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "types": ["pdf", "doc", "docx"] }`}
            </code>{" "}
            and "maxfilesize" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">{`{ "maxsize": 10240 }`}</code>{" "}
            (10MB)
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}