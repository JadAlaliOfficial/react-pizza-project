import React from 'react';
import { cn } from '@/lib/utils';
import type { FormBuilderWorkspaceProps } from '../types';

export const FormBuilderWorkspace: React.FC<FormBuilderWorkspaceProps> = ({ className, children }) => {
  return (
    <div className={cn('flex-1 min-h-[60vh] bg-background p-3 sm:p-4', className)}>
      <div className="h-full rounded-md border border-border bg-card p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
};

export default FormBuilderWorkspace;

