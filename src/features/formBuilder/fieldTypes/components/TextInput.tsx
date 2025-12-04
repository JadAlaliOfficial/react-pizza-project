import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TextInputPreviewProps = {
  id: string;
  name?: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export const TextInput: React.FC<TextInputPreviewProps> = ({
  id,
  name,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <Input
        id={id}
        name={name ?? id}
        type="text"
        value=""
        disabled={disabled}
        placeholder={placeholder}
        readOnly
        className="cursor-default"
      />

      {helperText && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
