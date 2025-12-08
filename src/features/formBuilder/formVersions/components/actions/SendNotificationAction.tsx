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

interface SendNotificationActionComponentProps {
  props: SendNotificationActionProps;
  onChange: (props: SendNotificationActionProps) => void;
}

export function SendNotificationAction({
  props,
  onChange,
}: SendNotificationActionComponentProps) {
  const updateProp = <K extends keyof SendNotificationActionProps>(
    key: K,
    value: SendNotificationActionProps[K]
  ) => {
    onChange({ ...props, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">Send Notification</Badge>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notification Title</Label>
        <Input
          value={props.notificationTitle || ''}
          onChange={(e) => updateProp('notificationTitle', e.target.value)}
          placeholder="e.g., New Submission"
          className="h-9 text-xs"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notification Body</Label>
        <Textarea
          value={props.notificationBody || ''}
          onChange={(e) => updateProp('notificationBody', e.target.value)}
          placeholder="Notification content..."
          className="min-h-[80px] text-xs"
        />
        <p className="text-10px text-muted-foreground">
          Supports variables: {'{entryLink}'}, {'{formName}'}, {'{userName}'}
        </p>
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notification Type</Label>
        <Select
          value={props.notificationType || 'info'}
          onValueChange={(val) =>
            updateProp('notificationType', val as SendNotificationActionProps['notificationType'])
          }
        >
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info" className="text-xs">
              Info
            </SelectItem>
            <SelectItem value="success" className="text-xs">
              Success
            </SelectItem>
            <SelectItem value="warning" className="text-xs">
              Warning
            </SelectItem>
            <SelectItem value="error" className="text-xs">
              Error
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Icon (Optional)</Label>
        <Input
          value={props.notificationIcon || ''}
          onChange={(e) => updateProp('notificationIcon', e.target.value)}
          placeholder="e.g., bell, check, alert"
          className="h-9 text-xs"
        />
      </div>

      {/* Link */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Link (Optional)</Label>
        <Input
          value={props.notificationLink || ''}
          onChange={(e) => updateProp('notificationLink', e.target.value)}
          placeholder="e.g., /entries/{entryId}"
          className="h-9 text-xs"
        />
        <p className="text-10px text-muted-foreground">URL to navigate when clicked</p>
      </div>
    </div>
  );
}
