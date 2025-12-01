import React, { useCallback, useState } from 'react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import FormBuilderHeader from '@/features/formBuilder/workspace/components/FormBuilderHeader';
import FormBuilderDrawer from '@/features/formBuilder/workspace/components/FormBuilderDrawer';
import FormBuilderWorkspace from '@/features/formBuilder/workspace/components/FormBuilderWorkspace';
import FormElement from '@/features/formBuilder/workspace/components/FormElement';

const FormBuilderPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const handleToggleDrawer = useCallback(() => setDrawerOpen((v) => !v), []);
  const handleSave = useCallback(() => {}, []);

  return (
    <ManageLayout
      title="Form Builder"
      subtitle="Build and configure forms"
      mainButtons={<FormBuilderHeader onSave={handleSave} />}
      backButton={{ show: false }}
    >
      <div className="flex w-full h-[70vh]">
        <FormBuilderDrawer open={drawerOpen} onToggle={handleToggleDrawer} />
        <FormBuilderWorkspace>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormElement label="Text Field" description="Single-line input" />
            <FormElement label="Email Field" description="Email input" />
            <FormElement label="Number Field" description="Numeric input" />
          </div>
        </FormBuilderWorkspace>
      </div>
    </ManageLayout>
  );
};

export default FormBuilderPage;

