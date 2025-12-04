// src/features/formVersion/components/fields/ImageUploadFieldConfig.tsx

/**
 * Image Upload Field Configuration Component
 *
 * Provides UI for configuring an Image Upload field:
 * - Label (main question)
 * - Allowed image types
 * - File size limits
 * - Image dimension requirements
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
import { Label } from "@/components/ui/label";
import { Trash2, Image as ImageIcon, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type ImageUploadFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function ImageUploadFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: ImageUploadFieldConfigProps) {
  const [allowedTypes, setAllowedTypes] = useState(
    field.placeholder || "jpg,jpeg,png,gif,webp"
  );
  const [maxSizeMB, setMaxSizeMB] = useState("5");
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");

  return (
    <Card className="p-4 border-l-4 border-l-pink-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-pink-500" />
            <Badge variant="outline" className="text-xs">
              Image Upload
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
        <Alert className="bg-pink-50 border-pink-200">
          <Info className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-xs text-pink-900">
            Image upload field with preview and dimension validation. Images
            stored in public/images/ directory. Supports base64 encoding and
            metadata storage (path, size, dimensions).
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
            placeholder="e.g., Upload your profile picture"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Allowed Image Types */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Allowed Image Types (Extensions)
          </label>
          <Input
            value={allowedTypes}
            onChange={(e) => {
              setAllowedTypes(e.target.value);
              onFieldChange({ placeholder: e.target.value });
            }}
            placeholder="e.g., jpg,jpeg,png,gif,webp,svg"
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Comma-separated list of image extensions. Used for validation via
            "mimes" rule.
          </p>
        </div>

        {/* Image Size Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Maximum Image Size (MB)
          </label>
          <Input
            type="number"
            value={maxSizeMB}
            onChange={(e) => setMaxSizeMB(e.target.value)}
            placeholder="5"
            className="h-9"
            min="1"
            max="50"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Define max size in validation rules. Use "maxfilesize" rule with
            value in KB (e.g., 5MB = 5120KB)
          </p>
        </div>

        {/* Image Dimensions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Image Dimension Limits (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Max Width (px)
              </Label>
              <Input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                placeholder="e.g., 1920"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Max Height (px)
              </Label>
              <Input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                placeholder="e.g., 1080"
                className="h-8"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Set using "dimensions" validation rule with props: minwidth,
            maxwidth, minheight, maxheight, width, height
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
            placeholder="Additional information (e.g., 'Accepted: JPG, PNG. Max size: 5MB. Recommended: 800x600px')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Image Storage Information */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🖼️ Image Storage Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Directory:</strong> public/images/
            </div>
            <div>
              • <strong>Storage Format:</strong> JSON with metadata
            </div>
            <div>
              • <strong>Metadata:</strong> path, originalname, mimetype, size,
              extension, width, height
            </div>
            <div>
              • <strong>Base64 Support:</strong> Yes (data URI format)
            </div>
            <div>
              • <strong>Preview:</strong> Thumbnail/full image preview available
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎨 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Profile Pictures:</strong> User avatars, team photos
            </div>
            <div>
              • <strong>Product Images:</strong> E-commerce listings, galleries
            </div>
            <div>
              • <strong>Logos:</strong> Company branding, organization logos
            </div>
            <div>
              • <strong>Thumbnails:</strong> Preview images, covers
            </div>
            <div>
              • <strong>Photo Uploads:</strong> Event photos, submissions
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
              • mimes (image types)
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
            <span className="text-[10px] text-muted-foreground">
              • dimensions (width/height)
            </span>
          </div>
          <p className="text-[10px] text-pink-700 mt-2 font-medium">
            ⚠️ Stored in images/ directory. Supports base64 and dimension
            validation.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "mimes" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "types": ["jpg", "png"] }`}
            </code>
            , "maxfilesize":{" "}
            <code className="bg-amber-100 px-1 rounded">{`{ "maxsize": 5120 }`}</code>{" "}
            (5MB), and "dimensions":{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "maxwidth": 1920, "maxheight": 1080 }`}
            </code>
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
