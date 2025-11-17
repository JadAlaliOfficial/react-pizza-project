import React from 'react';
import { User } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Logo and Brand Section */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-foreground">Auth Portal</h1>
            <p className="text-xs text-muted-foreground">Secure Access</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="h-16 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Auth Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
