// src/features/formVersion/components/transitions/actions/SendEmailActionConfig.tsx

/**
 * Send Email Action Configuration Component
 * Provides UI for configuring email sending action properties
 * Adapted from existing SendEmailAction component to match new architecture
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Mail } from 'lucide-react';
import type { ActionComponentProps } from '../actionComponentRegistry';

// ============================================================================
// Props Type
// ============================================================================

/**
 * Send Email action properties
 * Matches SendEmailActionProps from types/formVersion.types.ts
 */
export interface SendEmailActionProps {
  emailSubject?: string;
  emailContent?: string;
  emailAttachments?: string[];
  receiversUsers?: number[];
  receiversRoles?: number[];
  receiversPermissions?: number[];
  receiversEmails?: string[];
  ccUsers?: number[];
  ccEmails?: string[];
  bccUsers?: number[];
  bccEmails?: string[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * SendEmailActionConfig Component
 * 
 * Configuration UI for email sending action
 * Features:
 * - Email subject with variable support
 * - Email content (HTML supported)
 * - Recipient emails management (add/remove)
 * - CC emails management
 * - BCC emails management
 * - Variable hints for dynamic content
 */
export const SendEmailActionConfig: React.FC<
  ActionComponentProps<SendEmailActionProps>
> = ({ value, onChange, actionIndex }) => {
  console.debug('[SendEmailActionConfig] Rendering for action', actionIndex);

  /**
   * Updates a specific property
   */
  const updateProp = <K extends keyof SendEmailActionProps>(
    key: K,
    propValue: SendEmailActionProps[K]
  ): void => {
    onChange({ ...value, [key]: propValue });
  };

  /**
   * Adds an email to a specific field
   */
  const addEmail = (field: 'receiversEmails' | 'ccEmails' | 'bccEmails'): void => {
    const current = value[field] || [];
    updateProp(field, [...current, ''] as any);
  };

  /**
   * Updates an email at a specific index
   */
  const updateEmail = (
    field: 'receiversEmails' | 'ccEmails' | 'bccEmails',
    index: number,
    email: string
  ): void => {
    const current = [...(value[field] || [])];
    current[index] = email;
    updateProp(field, current as any);
  };

  /**
   * Removes an email at a specific index
   */
  const removeEmail = (
    field: 'receiversEmails' | 'ccEmails' | 'bccEmails',
    index: number
  ): void => {
    const current = [...(value[field] || [])];
    current.splice(index, 1);
    updateProp(field, current as any);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-green-600" />
        <Badge variant="secondary" className="text-xs">
          Send Email
        </Badge>
        <span className="text-xs text-muted-foreground">
          Action {actionIndex + 1}
        </span>
      </div>

      {/* Email Subject */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Email Subject <span className="text-destructive">*</span>
        </Label>
        <Input
          value={value.emailSubject || ''}
          onChange={(e) => updateProp('emailSubject', e.target.value)}
          placeholder="e.g., Form Submission Received"
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Supports variables: <code className="text-[9px] bg-muted px-1 rounded">{'{entryLink}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{formName}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{userName}'}</code>
        </p>
      </div>

      {/* Email Content */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Email Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={value.emailContent || ''}
          onChange={(e) => updateProp('emailContent', e.target.value)}
          placeholder="Email body content..."
          className="min-h-[100px] text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          HTML supported. Use variables like <code className="text-[9px] bg-muted px-1 rounded">{'{entryLink}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{formName}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{userName}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{field_X}'}</code> (where X is field ID)
        </p>
      </div>

      {/* Recipient Emails */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Recipient Emails <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2">
          {(value.receiversEmails || []).map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => updateEmail('receiversEmails', index, e.target.value)}
                placeholder="email@example.com or {field_2}"
                className="h-8 text-xs flex-1"
                type="email"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeEmail('receiversEmails', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addEmail('receiversEmails')}
            className="text-xs h-8"
          >
            Add Recipient Email
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Can use field variables like <code className="text-[9px] bg-muted px-1 rounded">{'{field_2}'}</code> to dynamically get email from form field
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
          JSON array of role IDs to send email to, e.g., [2, 3]
        </p>
      </div>

      {/* CC Emails */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">CC Emails (Optional)</Label>
        <div className="space-y-2">
          {(value.ccEmails || []).map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => updateEmail('ccEmails', index, e.target.value)}
                placeholder="email@example.com"
                className="h-8 text-xs flex-1"
                type="email"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeEmail('ccEmails', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addEmail('ccEmails')}
            className="text-xs h-8"
          >
            Add CC Email
          </Button>
        </div>
      </div>

      {/* BCC Emails */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">BCC Emails (Optional)</Label>
        <div className="space-y-2">
          {(value.bccEmails || []).map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => updateEmail('bccEmails', index, e.target.value)}
                placeholder="email@example.com"
                className="h-8 text-xs flex-1"
                type="email"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeEmail('bccEmails', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addEmail('bccEmails')}
            className="text-xs h-8"
          >
            Add BCC Email
          </Button>
        </div>
      </div>
    </div>
  );
};
