import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import ActionsPage from '@/features/formBuilder/actions/pages/ActionsPage';

export const actionsRoutes = [
  <Route
    key="actions"
    path="/actions"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <ActionsPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

