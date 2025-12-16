/**
 * ================================
 * RATING COMPONENT
 * ================================
 * Production-ready Rating field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Interactive star rating (5-star scale)
 * - Hover preview
 * - Click to select
 * - ForwardRef support for parent scrolling
 */

import { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RatingProps } from './types/ratingField.types';
import {
  getDefaultRatingValue,
  clampRating,
} from './validation/ratingValidation';

/**
 * Rating Component
 * 
 * Renders an interactive star rating field
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <Rating
 *   ref={ratingRef}
 *   field={fieldData}
 *   value={ratingValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.rating?.message}
 * />
 * ```
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  ({ field, value, onChange, error, disabled = false, className, maxStars = 5 }, ref) => {
    console.debug('[Rating] Rendering for field:', field.field_id);

    // State for current rating and hover state
    const [localValue, setLocalValue] = useState<number>(() => {
      if (typeof value === 'number') return clampRating(value, maxStars);
      
      if (field.current_value && typeof field.current_value === 'number') {
        return clampRating(field.current_value, maxStars);
      }
      
      return getDefaultRatingValue(field);
    });

    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (typeof value === 'number') {
        setLocalValue(clampRating(value, maxStars));
      }
    }, [value, maxStars]);

    /**
     * Handle star click
     */
    const handleStarClick = (starNumber: number) => {
      if (disabled) return;

      // If clicking the same star that's already selected, deselect it (set to 0)
      const newValue = localValue === starNumber ? 0 : starNumber;
      
      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[Rating] Rating changed:', {
        fieldId: field.field_id,
        rating: newValue,
      });
    };

    /**
     * Handle star hover
     */
    const handleStarHover = (starNumber: number) => {
      if (disabled) return;
      setHoveredStar(starNumber);
    };

    /**
     * Handle mouse leave
     */
    const handleMouseLeave = () => {
      setHoveredStar(null);
    };

    // Generate unique ID for accessibility
    const ratingId = `rating-${field.field_id}`;

    // Determine which stars should be filled
    const displayValue = hoveredStar !== null ? hoveredStar : localValue;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <div
            className="flex items-center gap-1"
            onMouseLeave={handleMouseLeave}
            role="radiogroup"
            aria-labelledby={ratingId}
            aria-required={isRequired}
            aria-invalid={!!error}
          >
            {Array.from({ length: maxStars }).map((_, i) => {
              const starNumber = i + 1;
              const isFilled = starNumber <= displayValue;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarClick(starNumber)}
                  onMouseEnter={() => handleStarHover(starNumber)}
                  disabled={disabled}
                  className={cn(
                    'transition-transform',
                    !disabled && 'hover:scale-110 cursor-pointer',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                  aria-label={`Rate ${starNumber} out of ${maxStars} stars`}
                  role="radio"
                  aria-checked={localValue === starNumber}
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isFilled
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300 fill-gray-100',
                      error && 'text-destructive fill-destructive/20'
                    )}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-muted-foreground">
              {displayValue} / {maxStars}
            </span>
          </div>

          {/* Clear rating button (if not required and has value) */}
          {!isRequired && localValue > 0 && !disabled && (
            <button
              type="button"
              onClick={() => {
                setLocalValue(0);
                onChange(0);
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear rating
            </button>
          )}
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Rating.displayName = 'Rating';

export default Rating;
