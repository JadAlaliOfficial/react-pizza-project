// src/features/formVersion/components/preview/FileUploadPreview.tsx

/**
 * File Upload Preview Component
 *
 * Displays a preview of how the File Upload field will appear in the form
 * Shows file upload area with accepted formats
 */

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type FileUploadPreviewProps = {
  field: Field;
};

export function FileUploadPreview({ field }: FileUploadPreviewProps) {
  const allowedTypes = field.placeholder || "pdf,doc,docx,txt";
  const typeArray = allowedTypes.split(",").map((t) => t.trim());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Upload className="h-3 w-3 text-violet-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          File Upload
        </Badge>
      </div>

      {/* Upload Area Preview */}
      <div className="border-2 border-dashed border-violet-300 rounded-md p-6 bg-violet-50/30 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-violet-400" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Drag and drop file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats:{" "}
              {typeArray.map((type, index) => (
                <span key={index}>
                  {index > 0 && ", "}
                  <strong className="text-violet-600">{type.toUpperCase()}</strong>
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-violet-600 italic">
        ✓ File upload with drag-and-drop. Stored as JSON with metadata (path,
        name, size, type). Secure server-side validation.
      </p>
    </div>
  );
}