// src/features/formVersion/components/preview/DocumentUploadPreview.tsx

/**
 * Document Upload Preview Component
 *
 * Displays a preview of how the Document Upload field will appear in the form
 * Shows document upload area with type-specific icons
 */

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, File, FileSpreadsheet, FileImage } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type DocumentUploadPreviewProps = {
  field: Field;
};

export function DocumentUploadPreview({ field }: DocumentUploadPreviewProps) {
  const allowedTypes = field.placeholder || "pdf,doc,docx,xls,xlsx,ppt,pptx";
  const typeArray = allowedTypes.split(",").map((t) => t.trim().toUpperCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3 text-orange-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Document Upload
        </Badge>
      </div>

      {/* Upload Area with Document Icons */}
      <div className="border-2 border-dashed border-orange-300 rounded-md bg-orange-50/30">
        {/* Document Type Icons Preview */}
        <div className="p-6 flex items-center justify-center gap-4 border-b border-orange-200">
          <div className="text-center">
            <div className="w-12 h-16 bg-red-100 rounded border-2 border-red-300 flex items-center justify-center mb-1">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              PDF
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-16 bg-blue-100 rounded border-2 border-blue-300 flex items-center justify-center mb-1">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              Word
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-16 bg-green-100 rounded border-2 border-green-300 flex items-center justify-center mb-1">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              Excel
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-16 bg-orange-100 rounded border-2 border-orange-300 flex items-center justify-center mb-1">
              <FileImage className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              PPT
            </span>
          </div>
        </div>

        {/* Upload Button Area */}
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-orange-400" />
            <p className="text-sm text-muted-foreground">
              Drag and drop document here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats: {typeArray.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-orange-600 italic">
        ✓ Document upload for office/business files. Stored in documents/
        directory. Preview/viewer and download available. Filter by document
        type.
      </p>
    </div>
  );
}
