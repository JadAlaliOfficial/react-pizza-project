import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormBuilderHeaderProps } from '../types';

export const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({ onSave, className }) => {
  return (
    <div className={cn('flex justify-end items-center w-full', className)}>
      <Button
        onClick={onSave}
        size="lg"
        className={cn(
          'gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90',
          'hover:scale-[1.02] hover:shadow-lg transition-transform'
        )}
      >
        <ShieldCheck className="h-5 w-5" />
        Safe
      </Button>
    </div>
  );
};

export default FormBuilderHeader;

