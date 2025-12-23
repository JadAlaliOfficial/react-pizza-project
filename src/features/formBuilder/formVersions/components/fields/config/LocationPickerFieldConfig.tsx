// src/features/formVersion/components/fields/config/LocationPickerFieldConfig.tsx

/**
 * Location Picker Field Configuration Component
 *
 * Provides UI for configuring a Location Picker field:
 * - Label (main question)
 * - Default location (lat/lng + address) stored as JSON
 * - Helper text
 * - Visibility conditions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, MapPin } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';
import { useFormVersionBuilder } from '../../../hooks/useFormVersionBuilder';
import type { VisibilityCondition } from '../../shared/VisibilityConditionsBuilder';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../../shared/VisibilityConditionsBuilder';

// ============================================================================
// Helpers
// ============================================================================

type LocationValue = {
  lat: number;
  lng: number;
  address: string;
};

const parseLocationValue = (raw: string | null | undefined): LocationValue => {
  if (!raw) {
    return {
      lat: 40.7128,
      lng: -74.006,
      address: 'New York, NY, USA',
    };
  }

  try {
    const decoded = JSON.parse(raw) as Partial<LocationValue>;
    return {
      lat: typeof decoded.lat === 'number' ? decoded.lat : 40.7128,
      lng: typeof decoded.lng === 'number' ? decoded.lng : -74.006,
      address:
        typeof decoded.address === 'string'
          ? decoded.address
          : 'New York, NY, USA',
    };
  } catch {
    return {
      lat: 40.7128,
      lng: -74.006,
      address: 'New York, NY, USA',
    };
  }
};

const serializeLocationValue = (loc: LocationValue): string => {
  return JSON.stringify({
    lat: Number.isFinite(loc.lat) ? loc.lat : 0,
    lng: Number.isFinite(loc.lng) ? loc.lng : 0,
    address: loc.address ?? '',
  });
};

// ============================================================================
// Component
// ============================================================================

export const LocationPickerFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[LocationPickerFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);
  // Initialize from field.default_value so existing defaults round-trip correctly
  const initial = parseLocationValue(field.default_value ?? null);

  const [defaultLat, setDefaultLat] = useState<string>(initial.lat.toString());
  const [defaultLng, setDefaultLng] = useState<string>(initial.lng.toString());
  const [defaultAddress, setDefaultAddress] = useState<string>(initial.address);

  // Keep local state in sync if default_value changes externally
  useEffect(() => {
    const parsed = parseLocationValue(field.default_value ?? null);
    setDefaultLat(parsed.lat.toString());
    setDefaultLng(parsed.lng.toString());
    setDefaultAddress(parsed.address);
  }, [field.default_value]);

  // Ensure default value is preserved on mount/init
  useEffect(() => {
    if (!field.default_value) {
      const defaultLoc = serializeLocationValue({
        lat: 40.7128,
        lng: -74.006,
        address: 'New York, NY, USA',
      });
      onFieldChange({ default_value: defaultLoc });
    }
  }, []);

  const updateDefaultLocation = useCallback(() => {
    const latNum = parseFloat(defaultLat);
    const lngNum = parseFloat(defaultLng);

    const loc: LocationValue = {
      lat: Number.isFinite(latNum) ? latNum : 0,
      lng: Number.isFinite(lngNum) ? lngNum : 0,
      address: defaultAddress || '',
    };

    onFieldChange({
      default_value: serializeLocationValue(loc),
    });
  }, [defaultLat, defaultLng, defaultAddress, onFieldChange]);

  return (
    <>
      <Card className="p-4 border-l-4 border-l-emerald-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <Badge variant="outline" className="text-xs">
                Location Picker
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

          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Label <span className="text-destructive">*</span>
            </label>
            <Input
              value={field.label}
              onChange={(e) => onFieldChange({ label: e.target.value })}
              placeholder="e.g., Select your location"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Default Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Latitude
                </label>
                <Input
                  type="number"
                  value={defaultLat}
                  onChange={(e) => setDefaultLat(e.target.value)}
                  onBlur={updateDefaultLocation}
                  placeholder="40.7128"
                  className="h-9 text-xs"
                  step={0.000001}
                  min={-90}
                  max={90}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">
                  Longitude
                </label>
                <Input
                  type="number"
                  value={defaultLng}
                  onChange={(e) => setDefaultLng(e.target.value)}
                  onBlur={updateDefaultLocation}
                  placeholder="-74.0060"
                  className="h-9 text-xs"
                  step={0.000001}
                  min={-180}
                  max={180}
                />
              </div>
            </div>
            <Input
              value={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.value)}
              onBlur={updateDefaultLocation}
              placeholder="New York, NY, USA"
              className="h-9 text-xs"
            />
          </div>



          {/* Helper Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Helper Text
            </label>
            <Textarea
              value={field.helper_text ?? ''}
              onChange={(e) =>
                onFieldChange({ helper_text: e.target.value || null })
              }
              placeholder="Additional information (e.g., 'Use the search bar or click on the map')"
              className="min-h-[60px] text-xs"
            />
          </div>

          {/* Visibility Conditions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility Conditions
            </label>
            <div className="flex items-center justify-between rounded border p-2">
              <div className="text-[11px] text-muted-foreground">
                {field.visibility_conditions
                  ? 'Conditions configured'
                  : 'No conditions'}
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setVisibilityEditorOpen(true)}
              >
                Edit Conditions
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {visibilityEditorOpen && (
        <VisibilityConditionsBuilder
          value={builderValue}
          onChange={(condition) => {
            setBuilderValue(condition);
            const serialized = serializeVisibilityConditions(condition);
            onFieldChange({ visibility_conditions: serialized });
          }}
          stages={stages}
          excludeFieldId={field.id}
          open={visibilityEditorOpen}
          onClose={() => setVisibilityEditorOpen(false)}
        />
      )}
    </>
  );
};
