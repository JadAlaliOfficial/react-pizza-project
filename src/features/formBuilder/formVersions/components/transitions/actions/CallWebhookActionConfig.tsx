// src/features/formVersion/components/transitions/actions/CallWebhookActionConfig.tsx

/**
 * Call Webhook Action Configuration Component
 * Provides UI for configuring webhook call action properties
 * Adapted from existing CallWebhookAction component to match new architecture
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Webhook } from 'lucide-react';
import type { ActionComponentProps } from '../actionComponentRegistry';

// ============================================================================
// Props Type
// ============================================================================

/**
 * Call Webhook action properties
 * Matches CallWebhookActionProps from types/formVersion.types.ts
 */
export interface CallWebhookActionProps {
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  webhookHeaders?: Record<string, string>;
  webhookPayload?: Record<string, any>;
  webhookTimeout?: number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * CallWebhookActionConfig Component
 * 
 * Configuration UI for webhook call action
 * Features:
 * - URL input with validation
 * - HTTP method selector
 * - Headers key-value editor
 * - JSON payload editor with variable support
 * - Timeout configuration
 */
export const CallWebhookActionConfig: React.FC<
  ActionComponentProps<CallWebhookActionProps>
> = ({ value, onChange, actionIndex }) => {
  console.debug('[CallWebhookActionConfig] Rendering for action', actionIndex);

  /**
   * Updates a specific property
   */
  const updateProp = <K extends keyof CallWebhookActionProps>(
    key: K,
    propValue: CallWebhookActionProps[K]
  ): void => {
    onChange({ ...value, [key]: propValue });
  };

  // Convert headers object to array for rendering
  const headers = Object.entries(value.webhookHeaders || {});

  /**
   * Adds a new empty header
   */
  const addHeader = (): void => {
    const current = { ...(value.webhookHeaders || {}) };
    current[''] = '';
    updateProp('webhookHeaders', current);
  };

  /**
   * Updates a header key-value pair
   */
  const updateHeader = (oldKey: string, newKey: string, headerValue: string): void => {
    const current = { ...(value.webhookHeaders || {}) };
    if (oldKey !== newKey) {
      delete current[oldKey];
    }
    current[newKey] = headerValue;
    updateProp('webhookHeaders', current);
  };

  /**
   * Removes a header
   */
  const removeHeader = (key: string): void => {
    const current = { ...(value.webhookHeaders || {}) };
    delete current[key];
    updateProp('webhookHeaders', current);
  };

  /**
   * Handles payload JSON change
   */
  const handlePayloadChange = (text: string): void => {
    try {
      const parsed = JSON.parse(text);
      updateProp('webhookPayload', parsed);
    } catch {
      // Invalid JSON, ignore until valid
      console.debug('[CallWebhookActionConfig] Invalid JSON, waiting for valid input');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Webhook className="h-4 w-4 text-blue-600" />
        <Badge variant="secondary" className="text-xs">
          Call Webhook
        </Badge>
        <span className="text-xs text-muted-foreground">
          Action {actionIndex + 1}
        </span>
      </div>

      {/* Webhook URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Webhook URL <span className="text-destructive">*</span>
        </Label>
        <Input
          value={value.webhookUrl || ''}
          onChange={(e) => updateProp('webhookUrl', e.target.value)}
          placeholder="https://api.example.com/webhook"
          className="h-9 text-xs"
          type="url"
        />
        <p className="text-[10px] text-muted-foreground">
          Full URL of the webhook endpoint to call
        </p>
      </div>

      {/* HTTP Method */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">HTTP Method</Label>
        <Select
          value={value.webhookMethod || 'POST'}
          onValueChange={(val) =>
            updateProp('webhookMethod', val as CallWebhookActionProps['webhookMethod'])
          }
        >
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET" className="text-xs">
              GET
            </SelectItem>
            <SelectItem value="POST" className="text-xs">
              POST
            </SelectItem>
            <SelectItem value="PUT" className="text-xs">
              PUT
            </SelectItem>
            <SelectItem value="PATCH" className="text-xs">
              PATCH
            </SelectItem>
            <SelectItem value="DELETE" className="text-xs">
              DELETE
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Headers */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Headers (Optional)</Label>
        <div className="space-y-2">
          {headers.map(([key, headerValue], index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={key}
                onChange={(e) => updateHeader(key, e.target.value, headerValue)}
                placeholder="Header name"
                className="h-8 text-xs flex-1"
              />
              <Input
                value={headerValue}
                onChange={(e) => updateHeader(key, key, e.target.value)}
                placeholder="Header value"
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeHeader(key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHeader}
            className="text-xs h-8"
          >
            Add Header
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Custom HTTP headers to include with the request
        </p>
      </div>

      {/* Payload */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Payload (JSON)</Label>
        <Textarea
          value={
            value.webhookPayload ? JSON.stringify(value.webhookPayload, null, 2) : ''
          }
          onChange={(e) => handlePayloadChange(e.target.value)}
          placeholder={'{\n  "formName": "{formName}",\n  "entryId": "{entryId}"\n}'}
          className="min-h-[120px] text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          JSON payload to send. Supports variables: <code className="text-[9px] bg-muted px-1 rounded">{'{entryLink}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{formName}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{entryId}'}</code>,{' '}
          <code className="text-[9px] bg-muted px-1 rounded">{'{userName}'}</code>
        </p>
      </div>

      {/* Timeout */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Timeout (seconds)</Label>
        <Input
          type="number"
          value={value.webhookTimeout ?? 30}
          onChange={(e) => updateProp('webhookTimeout', Number(e.target.value))}
          placeholder="30"
          className="h-9 text-xs"
          min={1}
          max={300}
        />
        <p className="text-[10px] text-muted-foreground">
          Maximum time to wait for webhook response (1-300 seconds)
        </p>
      </div>
    </div>
  );
};
