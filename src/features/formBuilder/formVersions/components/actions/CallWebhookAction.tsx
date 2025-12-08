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
import { X } from 'lucide-react';

export interface CallWebhookActionProps {
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  webhookHeaders?: Record<string, string>;
  webhookPayload?: Record<string, any>;
  webhookTimeout?: number;
}

interface CallWebhookActionComponentProps {
  props: CallWebhookActionProps;
  onChange: (props: CallWebhookActionProps) => void;
}

export function CallWebhookAction({ props, onChange }: CallWebhookActionComponentProps) {
  const updateProp = <K extends keyof CallWebhookActionProps>(
    key: K,
    value: CallWebhookActionProps[K]
  ) => {
    onChange({ ...props, [key]: value });
  };

  const headers = Object.entries(props.webhookHeaders || {});

  const addHeader = () => {
    const current = { ...(props.webhookHeaders || {}) };
    current[''] = '';
    updateProp('webhookHeaders', current);
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const current = { ...(props.webhookHeaders || {}) };
    if (oldKey !== newKey) {
      delete current[oldKey];
    }
    current[newKey] = value;
    updateProp('webhookHeaders', current);
  };

  const removeHeader = (key: string) => {
    const current = { ...(props.webhookHeaders || {}) };
    delete current[key];
    updateProp('webhookHeaders', current);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">Call Webhook</Badge>
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Webhook URL</Label>
        <Input
          value={props.webhookUrl || ''}
          onChange={(e) => updateProp('webhookUrl', e.target.value)}
          placeholder="https://api.example.com/webhook"
          className="h-9 text-xs"
        />
      </div>

      {/* Method */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">HTTP Method</Label>
        <Select
          value={props.webhookMethod || 'POST'}
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
          {headers.map(([key, value], index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={key}
                onChange={(e) => updateHeader(key, e.target.value, value)}
                placeholder="Header name"
                className="h-8 text-xs flex-1"
              />
              <Input
                value={value}
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
      </div>

      {/* Payload */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Payload (JSON)</Label>
        <Textarea
          value={
            props.webhookPayload ? JSON.stringify(props.webhookPayload, null, 2) : ''
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateProp('webhookPayload', parsed);
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder={'{\n  "formName": "{formName}",\n  "entryId": "{entryId}"\n}'}
          className="min-h-[120px] text-xs font-mono"
        />
        <p className="text-10px text-muted-foreground">
          Supports variables: {'{entryLink}'}, {'{formName}'}, {'{entryId}'}
        </p>
      </div>

      {/* Timeout */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Timeout (seconds)</Label>
        <Input
          type="number"
          value={props.webhookTimeout || 30}
          onChange={(e) => updateProp('webhookTimeout', Number(e.target.value))}
          placeholder="30"
          className="h-9 text-xs"
          min={1}
          max={300}
        />
      </div>
    </div>
  );
}
