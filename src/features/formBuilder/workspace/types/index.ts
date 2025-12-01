export interface FormBuilderHeaderProps {
  onSave: () => void;
  className?: string;
}

export interface FormBuilderDrawerProps {
  open: boolean;
  onToggle: () => void;
  className?: string;
  children?: React.ReactNode;
}

export interface FormBuilderWorkspaceProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormElementProps {
  label: string;
  description?: string;
}

