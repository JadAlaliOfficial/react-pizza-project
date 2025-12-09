// src/features/formVersion/components/sections/SectionForm.tsx

/**
 * Detailed section editing form
 * Provides comprehensive controls for all section properties
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { UiSection } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Props
// ============================================================================

interface SectionFormProps {
  section: UiSection;
  onChange: (section: UiSection) => void;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SectionForm Component
 * 
 * Modal dialog for detailed section editing.
 * Provides full control over section properties.
 * 
 * @param section - Section being edited
 * @param onChange - Callback when section is saved
 * @param onClose - Callback to close the dialog
 */
export const SectionForm: React.FC<SectionFormProps> = ({ section, onChange, onClose }) => {
  console.debug('[SectionForm] Opening form for section:', section.id);

  // Local form state
  const [formData, setFormData] = useState<UiSection>(section);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setFormData(section);
  }, [section]);

  /**
   * Validates form data
   */
  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setValidationError('Section name is required');
      return false;
    }

    if (formData.order === undefined || formData.order < 1) {
      setValidationError('Order must be a positive number');
      return false;
    }

    setValidationError(null);
    return true;
  };

  /**
   * Handles form submission
   */
  const handleSave = (): void => {
    console.info('[SectionForm] Saving section:', formData.id);

    if (!validate()) {
      return;
    }

    onChange(formData);
    onClose();
  };

  /**
   * Updates form field
   */
  const updateField = <K extends keyof UiSection>(field: K, value: UiSection[K]): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Section Details</DialogTitle>
          <DialogDescription>
            Configure section properties and visibility rules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Validation error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Section name */}
          <div className="space-y-2">
            <Label htmlFor="section-name">Section Name *</Label>
            <Input
              id="section-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter section name"
              className={validationError ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              A descriptive name for this section
            </p>
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="section-order">Order *</Label>
            <Input
              id="section-order"
              type="number"
              min="1"
              value={formData.order || 1}
              onChange={(e) => updateField('order', parseInt(e.target.value, 10) || 1)}
              placeholder="e.g., 1"
            />
            <p className="text-xs text-gray-500">
              Display order within the stage (lower numbers appear first)
            </p>
          </div>

          {/* Visibility conditions */}
          <div className="space-y-2">
            <Label htmlFor="visibility-conditions">Visibility Conditions</Label>
            <Textarea
              id="visibility-conditions"
              value={formData.visibility_conditions || ''}
              onChange={(e) => updateField('visibility_conditions', e.target.value || null)}
              placeholder="JSON condition (optional)"
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              JSON expression to control section visibility (e.g., based on field values)
            </p>
          </div>

          {/* Field count (read-only info) */}
          <div className="rounded-lg border p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Fields in this section</p>
                <p className="text-xs text-gray-500 mt-1">
                  Manage fields from the Fields tab
                </p>
              </div>
              <Badge variant="secondary" className="text-lg font-semibold">
                {formData.fields.length}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Import Badge component for field count display
import { Badge } from '@/components/ui/badge';
