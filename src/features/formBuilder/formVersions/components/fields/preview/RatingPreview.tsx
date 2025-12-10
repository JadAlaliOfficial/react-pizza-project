// src/features/formVersion/components/fields/preview/RatingPreview.tsx

/**
 * Rating Preview Component
 *
 * Displays a preview of how the Rating field will appear in the form
 * Shows star rating with hover-style visual (5-star fixed scale)
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * RatingPreview Component
 *
 * Preview component for Rating field type
 * Features:
 * - Label with star icon
 * - Disabled 5-star scale showing default rating
 * - Hover-like visual feedback (non-interactive)
 * - Rule/required hints
 */
export const RatingPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[RatingPreview] Rendering for field:', field.id);

  const defaultRating = Math.max(
    0,
    Math.min(5, parseInt(field.default_value || '0', 10))
  );
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const maxStars = 5;

  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Star Rating Display */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: maxStars }).map((_, i) => {
            const starNumber = i + 1;
            const isFilled =
              hoveredStar !== null
                ? starNumber <= hoveredStar
                : starNumber <= defaultRating;

            return (
              <button
                key={i}
                onMouseEnter={() => setHoveredStar(starNumber)}
                onMouseLeave={() => setHoveredStar(null)}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                disabled
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    isFilled
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300 fill-gray-100'
                  }`}
                />
              </button>
            );
          })}
          <span className="ml-2 text-sm text-muted-foreground">
            {hoveredStar || defaultRating || 0} / {maxStars}
          </span>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
