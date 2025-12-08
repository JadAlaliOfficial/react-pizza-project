import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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

interface SendEmailActionComponentProps {
  props: SendEmailActionProps;
  onChange: (props: SendEmailActionProps) => void;
}

export function SendEmailAction({ props, onChange }: SendEmailActionComponentProps) {
  const updateProp = <K extends keyof SendEmailActionProps>(
    key: K,
    value: SendEmailActionProps[K]
  ) => {
    onChange({ ...props, [key]: value });
  };

  const addEmail = (field: 'receiversEmails' | 'ccEmails' | 'bccEmails') => {
    const current = props[field] || [];
    updateProp(field, [...current, ''] as any);
  };

  const updateEmail = (
    field: 'receiversEmails' | 'ccEmails' | 'bccEmails',
    index: number,
    value: string
  ) => {
    const current = [...(props[field] || [])];
    current[index] = value;
    updateProp(field, current as any);
  };

  const removeEmail = (field: 'receiversEmails' | 'ccEmails' | 'bccEmails', index: number) => {
    const current = [...(props[field] || [])];
    current.splice(index, 1);
    updateProp(field, current as any);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">Send Email</Badge>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Email Subject</Label>
        <Input
          value={props.emailSubject || ''}
          onChange={(e) => updateProp('emailSubject', e.target.value)}
          placeholder="e.g., Form Submission Received"
          className="h-9 text-xs"
        />
        <p className="text-10px text-muted-foreground">
          Supports variables: {'{entryLink}'}, {'{formName}'}, {'{userName}'}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Email Content</Label>
        <Textarea
          value={props.emailContent || ''}
          onChange={(e) => updateProp('emailContent', e.target.value)}
          placeholder="Email body content..."
          className="min-h-[100px] text-xs font-mono"
        />
        <p className="text-10px text-muted-foreground">
          HTML supported. Use variables like {'{entryLink}'}, {'{formName}'}, {'{userName}'}
        </p>
      </div>

      {/* Receiver Emails */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Recipient Emails</Label>
        <div className="space-y-2">
          {(props.receiversEmails || []).map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => updateEmail('receiversEmails', index, e.target.value)}
                placeholder="email@example.com"
                className="h-8 text-xs flex-1"
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
            Add Email
          </Button>
        </div>
      </div>

      {/* CC Emails */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">CC Emails (Optional)</Label>
        <div className="space-y-2">
          {(props.ccEmails || []).map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => updateEmail('ccEmails', index, e.target.value)}
                placeholder="email@example.com"
                className="h-8 text-xs flex-1"
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
          {(props.bccEmails || []).map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => updateEmail('bccEmails', index, e.target.value)}
                placeholder="email@example.com"
                className="h-8 text-xs flex-1"
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
}
