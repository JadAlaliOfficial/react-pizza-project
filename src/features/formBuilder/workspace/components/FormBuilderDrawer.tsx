import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormBuilderDrawerProps } from '../types';

export const FormBuilderDrawer: React.FC<FormBuilderDrawerProps> = ({ open, onToggle, className, children }) => {
  const widthClass = open ? 'w-64' : 'w-12';
  return (
    <div className={cn('h-full border-r border-border bg-muted/20 transition-all duration-200', widthClass, className)}>
      <div className="flex items-center justify-between p-2">
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0 hover:bg-primary/10">
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      {open && <div className="p-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
};

export default FormBuilderDrawer;

