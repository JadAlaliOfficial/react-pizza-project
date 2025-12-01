import React from 'react';
import { cn } from '@/lib/utils';
import type { FormElementProps } from '../types';

export const FormElement: React.FC<FormElementProps> = ({ label, description }) => {
  return (
    <div className={cn('rounded-md border p-3 bg-accent/40')}> 
      <div className="text-sm font-medium">{label}</div>
      {description ? <div className="text-xs text-muted-foreground mt-1">{description}</div> : null}
    </div>
  );
};

export default FormElement;

