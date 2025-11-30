import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import InputRulesPage from '@/features/formBuilder/inputRules/pages/InputRulesPage';

export const inputRulesRoutes = [
  <Route
    key="input-rules"
    path="/input-rules"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <InputRulesPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

