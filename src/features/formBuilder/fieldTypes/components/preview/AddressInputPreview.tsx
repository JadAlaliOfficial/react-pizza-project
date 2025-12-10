// src/features/formVersion/components/preview/AddressInputPreview.tsx

/**
 * Address Input Preview Component
 *
 * Displays a preview of how the Address Input field will appear in the form
 * Shows multi-field address input with autocomplete
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, MapPin, CheckCircle2 } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type AddressInputPreviewProps = {
  field: Field;
};

export function AddressInputPreview({ field }: AddressInputPreviewProps) {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });
  const [isVerified, ] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Home className="h-3 w-3 text-orange-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Address
        </Badge>
      </div>

      {/* Address Input Fields */}
      <div className="space-y-2">
        {/* Street Address */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              placeholder={
                field.placeholder || "123 Main Street, Apt 4B..."
              }
              disabled
              className="pl-9 h-10 border-orange-200 focus:border-orange-500"
            />
          </div>
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
              placeholder="New York"
              disabled
              className="h-10 border-orange-200"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              State/Province <span className="text-destructive">*</span>
            </Label>
            <Select
              value={address.state}
              onValueChange={(value) =>
                setAddress({ ...address, state: value })
              }
              disabled
            >
              <SelectTrigger className="h-10 border-orange-200">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Postal/ZIP Code <span className="text-destructive">*</span>
            </Label>
            <Input
              value={address.postalCode}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
              placeholder="10001"
              disabled
              className="h-10 border-orange-200"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Country <span className="text-destructive">*</span>
            </Label>
            <Select
              value={address.country}
              onValueChange={(value) =>
                setAddress({ ...address, country: value })
              }
              disabled
            >
              <SelectTrigger className="h-10 border-orange-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Address Summary */}
      <div className="p-3 border border-orange-200 rounded-md bg-orange-50/50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Address Summary:
            </span>
            {isVerified ? (
              <Badge className="bg-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not entered
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {address.street ? (
              <div className="space-y-0.5">
                <p className="font-medium text-orange-900">{address.street}</p>
                <p>
                  {address.city}
                  {address.state && `, ${address.state}`}{" "}
                  {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="italic">Address not yet provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Autocomplete Info */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <MapPin className="h-3 w-3 text-orange-500" />
        <span>Address autocomplete enabled - Start typing for suggestions</span>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-orange-600 italic">
        🏠 Multi-field address input with autocomplete. Stored as JSON with
        structured components. Filter by city, state, postal code, or country.
      </p>
    </div>
  );
}