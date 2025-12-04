// src/features/formVersion/components/preview/UrlInputPreview.tsx

/**
 * URL Input Preview Component
 *
 * Displays a preview of how the URL Input field will appear in the form
 * Shows URL input with link icon and validation indicator
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, ExternalLink, CheckCircle } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type UrlInputPreviewProps = {
  field: Field;
};

export function UrlInputPreview({ field }: UrlInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link className="h-3 w-3 text-cyan-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          URL Input
        </Badge>
      </div>

      {/* URL Input with Link Icon */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Link className="h-4 w-4 text-cyan-500" />
        </div>
        <Input
          type="url"
          placeholder={field.placeholder || "https://example.com"}
          defaultValue={field.default_value || ""}
          disabled
          className="pl-9 pr-20 h-10 bg-white"
        />
        {/* Validation Check Icon */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <CheckCircle className="h-4 w-4 text-green-500 opacity-50" />
        </div>
        {/* Open Link Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
          disabled
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-cyan-600 italic">
        ✓ URL input with format validation. Stored as lowercase. Clickable link
        with preview. Filter by domain, protocol, or exact match.
      </p>
    </div>
  );
}
