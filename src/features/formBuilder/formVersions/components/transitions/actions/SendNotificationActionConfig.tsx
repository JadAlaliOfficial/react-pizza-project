// src/features/formVersion/components/transitions/actions/SendNotificationActionConfig.tsx

/**
 * Send Notification Action Configuration Component
 * Provides UI for configuring in-app notification action properties
 * Adapted from existing SendNotificationAction component to match new architecture
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell } from 'lucide-react';
import type { ActionComponentProps } from '../actionComponentRegistry';

// ============================================================================
// Props Type
// ============================================================================

/**
 * Send Notification action properties
 * Matches SendNotificationActionProps from types/formVersion.types.ts
 */
export interface SendNotificationActionProps {
  notificationTitle?: string;
  notificationBody?: string;
  notificationType?: 'info' | 'success' | 'warning' | 'error';
  notificationIcon?: string;
  notificationLink?: string;
  receiversUsers?: number[];
  receiversRoles?: number[];
  receiversPermissions?: number[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * SendNotificationActionConfig Component
 * 
 * Configuration UI for in-app notification action
 * Features:
 * - Notification title and body
 * - Notification type (info, success, warning, error)
 * - Custom icon
 * - Navigation link
 * - Receiver configuration (roles, users, permissions)
 * - Variable support for dynamic content
 */
export const SendNotificationActionConfig: React.FC<
  ActionComponentProps<SendNotificationActionProps>
> = ({ value, onChange, actionIndex }) => {
  console.debug('[SendNotificationActionConfig] Rendering for action', actionIndex);

  /**
   * Updates a specific property
   */
  const updateProp = <K extends keyof SendNotificationActionProps>(
    key: K,
    propValue: SendNotificationActionProps[K]
  ): void => {
    onChange({ ...value, [key]: propValue });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-purple-600" />
        <Badge variant="secondary" className="text-xs">
          Send Notification
        </Badge>
        <span className="text-xs text-muted-foreground">
          Action {actionIndex + 1}
        </span>
      </div>

      {/* Notification Title */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Notification Title <span className="text-destructive">*</span>
        </Label>
        <Input
          value={value.notificationTitle || ''}
          onChange={(e) => updateProp('notificationTitle', e.target.value)}
          placeholder="e.g., New Submission"
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Short title for the notification
        </p>
      </div>

      {/* Notification Body */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Notification Body <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={value.notificationBody || ''}
          onChange={(e) => updateProp('notificationBody', e.target.value)}
          placeholder="Notification content..."
          className="min-h-[80px] text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Supports variables: <code className="text-[9px] bg-muted px-1 rounded">{'{entryLink}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{formName}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{userName}'}</code>
        </p>
      </div>

      {/* Notification Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notification Type</Label>
        <Select
          value={value.notificationType || 'info'}
          onValueChange={(val) =>
            updateProp(
              'notificationType',
              val as SendNotificationActionProps['notificationType']
            )
          }
        >
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info" className="text-xs">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">ℹ️</span>
                <span>Info</span>
              </div>
            </SelectItem>
            <SelectItem value="success" className="text-xs">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Success</span>
              </div>
            </SelectItem>
            <SelectItem value="warning" className="text-xs">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span>Warning</span>
              </div>
            </SelectItem>
            <SelectItem value="error" className="text-xs">
              <div className="flex items-center gap-2">
                <span className="text-red-600">❌</span>
                <span>Error</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Visual style of the notification
        </p>
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Icon (Optional)</Label>
        <Input
          value={value.notificationIcon || ''}
          onChange={(e) => updateProp('notificationIcon', e.target.value)}
          placeholder="e.g., bell, check, alert"
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Icon name to display (system-dependent)
        </p>
      </div>

      {/* Link */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Link (Optional)</Label>
        <Input
          value={value.notificationLink || ''}
          onChange={(e) => updateProp('notificationLink', e.target.value)}
          placeholder="e.g., /entries/{entryId}"
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          URL to navigate when notification is clicked. Supports variables like{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{entryId}'}</code>
        </p>
      </div>

      {/* Receiver Roles */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Receiver Roles (JSON Array)</Label>
        <Input
          value={value.receiversRoles ? JSON.stringify(value.receiversRoles) : ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              if (Array.isArray(parsed)) {
                updateProp('receiversRoles', parsed);
              }
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder='e.g., [2, 3]'
          className="h-9 text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          JSON array of role IDs to receive notification, e.g., [2, 3]
        </p>
      </div>

      {/* Receiver Users */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Receiver Users (JSON Array)</Label>
        <Input
          value={value.receiversUsers ? JSON.stringify(value.receiversUsers) : ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              if (Array.isArray(parsed)) {
                updateProp('receiversUsers', parsed);
              }
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder='e.g., [1, 5, 10]'
          className="h-9 text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          JSON array of user IDs to receive notification, e.g., [1, 5, 10]
        </p>
      </div>

      {/* Receiver Permissions */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Receiver Permissions (JSON Array)
        </Label>
        <Input
          value={
            value.receiversPermissions
              ? JSON.stringify(value.receiversPermissions)
              : ''
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              if (Array.isArray(parsed)) {
                updateProp('receiversPermissions', parsed);
              }
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder='e.g., [1, 2]'
          className="h-9 text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          JSON array of permission IDs to receive notification
        </p>
      </div>
    </div>
  );
};
