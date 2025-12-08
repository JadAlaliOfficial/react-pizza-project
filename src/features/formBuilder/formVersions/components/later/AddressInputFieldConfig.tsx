// src/features/formVersion/components/fields/AddressInputFieldConfig.tsx

/**
 * Address Input Field Configuration Component
 *
 * Provides UI for configuring an Address Input field:
 * - Label (main question)
 * - Address components configuration
 * - Autocomplete settings
 * - Country restrictions
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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Home, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type AddressInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function AddressInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: AddressInputFieldConfigProps) {
  const [enableAutocomplete, setEnableAutocomplete] = useState(true);
  const [requiredComponents, setRequiredComponents] = useState({
    street: true,
    city: true,
    state: true,
    postalCode: true,
    country: true,
  });

  return (
    <Card className="p-4 border-l-4 border-l-orange-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-orange-500" />
            <Badge variant="outline" className="text-xs">
              Address Input
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
            Multi-field address input with autocomplete. Stored as JSON with
            street, city, state, postal_code, and country components. Supports
            Google Places API integration.
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
            placeholder="e.g., Enter your address"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Address Autocomplete */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={enableAutocomplete}
              onCheckedChange={(checked) =>
                setEnableAutocomplete(checked as boolean)
              }
            />
            <label className="text-xs font-medium text-muted-foreground">
              Enable Address Autocomplete (Google Places API)
            </label>
          </div>
          <p className="text-[10px] text-muted-foreground pl-6">
            Provides suggestions as users type and auto-fills address components
          </p>
        </div>

        {/* Required Components */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Required Address Components
          </label>
          <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted/30">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={requiredComponents.street}
                onCheckedChange={(checked) =>
                  setRequiredComponents({
                    ...requiredComponents,
                    street: checked as boolean,
                  })
                }
              />
              <span className="text-xs">Street Address</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={requiredComponents.city}
                onCheckedChange={(checked) =>
                  setRequiredComponents({
                    ...requiredComponents,
                    city: checked as boolean,
                  })
                }
              />
              <span className="text-xs">City</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={requiredComponents.state}
                onCheckedChange={(checked) =>
                  setRequiredComponents({
                    ...requiredComponents,
                    state: checked as boolean,
                  })
                }
              />
              <span className="text-xs">State/Province</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={requiredComponents.postalCode}
                onCheckedChange={(checked) =>
                  setRequiredComponents({
                    ...requiredComponents,
                    postalCode: checked as boolean,
                  })
                }
              />
              <span className="text-xs">Postal/ZIP Code</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={requiredComponents.country}
                onCheckedChange={(checked) =>
                  setRequiredComponents({
                    ...requiredComponents,
                    country: checked as boolean,
                  })
                }
              />
              <span className="text-xs">Country</span>
            </div>
          </div>
        </div>

        {/* Address Components Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Address Form Preview
          </label>
          <div className="p-3 border rounded-md bg-white space-y-2">
            <div className="text-[10px] font-medium text-muted-foreground">
              Address Components:
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-2 border rounded bg-muted/30 text-muted-foreground">
                📍 Street Address
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border rounded bg-muted/30 text-muted-foreground">
                  🏙️ City
                </div>
                <div className="p-2 border rounded bg-muted/30 text-muted-foreground">
                  🗺️ State/Province
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border rounded bg-muted/30 text-muted-foreground">
                  📮 Postal Code
                </div>
                <div className="p-2 border rounded bg-muted/30 text-muted-foreground">
                  🌍 Country
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder Text
          </label>
          <Input
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., Start typing your address..."
            className="h-9"
            maxLength={255}
          />
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
            placeholder="Additional information (e.g., 'Provide your complete mailing address')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Address Input Details */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🏠 Address Input Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Storage:</strong> JSON with address components
            </div>
            <div>
              • <strong>Format:</strong>{" "}
              {`{"street": "...", "city": "...", "state": "...", "postal_code": "...", "country": "..."}`}
            </div>
            <div>
              • <strong>Components:</strong> Street, City, State, Postal Code,
              Country
            </div>
            <div>
              • <strong>Autocomplete:</strong> Google Places API integration
              (optional)
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📍 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Shipping:</strong> Delivery addresses, mailing addresses
            </div>
            <div>
              • <strong>Billing:</strong> Payment addresses, invoice addresses
            </div>
            <div>
              • <strong>Contact:</strong> Business addresses, office locations
            </div>
            <div>
              • <strong>Property:</strong> Real estate, service locations
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
          <div className="grid grid-cols-1 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required (address must be provided)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • min/max (for component validation)
            </span>
          </div>
          <p className="text-[10px] text-orange-700 mt-2 font-medium">
            💡 Use "required" rule to ensure address is provided. Address stored
            as JSON with structured components.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Filtering:</strong> Filter entries by city, state, postal
            code, or country. Full-text search across all address components
            supported.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
