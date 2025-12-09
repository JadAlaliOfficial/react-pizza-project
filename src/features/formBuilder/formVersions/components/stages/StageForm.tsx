// src/features/formVersion/components/stages/StageForm.tsx

/**
 * Detailed stage editing form
 * Provides comprehensive controls for all stage properties
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { UiStage } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Props
// ============================================================================

interface StageFormProps {
  stage: UiStage;
  onChange: (stage: UiStage) => void;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * StageForm Component
 * 
 * Modal dialog for detailed stage editing.
 * Provides full control over stage properties including access rules.
 * 
 * @param stage - Stage being edited
 * @param onChange - Callback when stage is saved
 * @param onClose - Callback to close the dialog
 */
export const StageForm: React.FC<StageFormProps> = ({ stage, onChange, onClose }) => {
  console.debug('[StageForm] Opening form for stage:', stage.id);

  // Local form state
  const [formData, setFormData] = useState<UiStage>(stage);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with prop changes
  useEffect(() => {
    setFormData(stage);
  }, [stage]);

  /**
   * Validates form data
   */
  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setValidationError('Stage name is required');
      return false;
    }

    setValidationError(null);
    return true;
  };

  /**
   * Handles form submission
   */
  const handleSave = (): void => {
    console.info('[StageForm] Saving stage:', formData.id);

    if (!validate()) {
      return;
    }

    onChange(formData);
    onClose();
  };

  /**
   * Updates form field
   */
  const updateField = <K extends keyof UiStage>(field: K, value: UiStage[K]): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  /**
   * Updates access rule field
   */
  const updateAccessRule = <K extends keyof NonNullable<UiStage['access_rule']>>(
    field: K,
    value: NonNullable<UiStage['access_rule']>[K]
  ): void => {
    setFormData((prev) => ({
      ...prev,
      access_rule: {
        ...(prev.access_rule || {
          allowed_users: null,
          allowed_roles: null,
          allowed_permissions: null,
          allow_authenticated_users: false,
          email_field_id: null,
        }),
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Stage Details</DialogTitle>
          <DialogDescription>
            Configure stage properties and access control
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Validation error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Stage name */}
          <div className="space-y-2">
            <Label htmlFor="stage-name">Stage Name *</Label>
            <Input
              id="stage-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter stage name"
              className={validationError ? 'border-red-500' : ''}
            />
          </div>

          {/* Is initial */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is-initial">Initial Stage</Label>
              <p className="text-sm text-gray-500">
                Mark this as the starting stage of the workflow
              </p>
            </div>
            <Switch
              id="is-initial"
              checked={formData.is_initial}
              onCheckedChange={(checked) => updateField('is_initial', checked)}
            />
          </div>

          {/* Visibility condition */}
          <div className="space-y-2">
            <Label htmlFor="visibility-condition">Visibility Condition</Label>
            <Textarea
              id="visibility-condition"
              value={formData.visibility_condition || ''}
              onChange={(e) => updateField('visibility_condition', e.target.value || null)}
              placeholder="JSON condition (optional)"
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              JSON expression to control stage visibility
            </p>
          </div>

          {/* Access Rule Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Access Control</h4>

            {/* Allow authenticated users */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="allow-authenticated">Allow All Authenticated Users</Label>
                <p className="text-sm text-gray-500">
                  Any logged-in user can access this stage
                </p>
              </div>
              <Switch
                id="allow-authenticated"
                checked={formData.access_rule?.allow_authenticated_users || false}
                onCheckedChange={(checked) =>
                  updateAccessRule('allow_authenticated_users', checked)
                }
              />
            </div>

            {/* Allowed roles */}
            <div className="space-y-2">
              <Label htmlFor="allowed-roles">Allowed Roles (JSON Array)</Label>
              <Input
                id="allowed-roles"
                value={formData.access_rule?.allowed_roles || ''}
                onChange={(e) => updateAccessRule('allowed_roles', e.target.value || null)}
                placeholder='e.g., "[2, 3]"'
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                JSON array of role IDs, e.g., [2, 3]
              </p>
            </div>

            {/* Allowed permissions */}
            <div className="space-y-2">
              <Label htmlFor="allowed-permissions">Allowed Permissions (JSON Array)</Label>
              <Input
                id="allowed-permissions"
                value={formData.access_rule?.allowed_permissions || ''}
                onChange={(e) => updateAccessRule('allowed_permissions', e.target.value || null)}
                placeholder='e.g., "[\"view_entries\"]"'
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                JSON array of permission strings
              </p>
            </div>

            {/* Email field ID */}
            <div className="space-y-2">
              <Label htmlFor="email-field-id">Email Field ID</Label>
              <Input
                id="email-field-id"
                type="number"
                value={formData.access_rule?.email_field_id || ''}
                onChange={(e) =>
                  updateAccessRule(
                    'email_field_id',
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                placeholder="e.g., 2"
              />
              <p className="text-xs text-gray-500">
                Field ID used to determine access by email
              </p>
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
