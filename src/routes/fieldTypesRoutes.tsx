import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import FieldTypesPage from '@/features/formBuilder/fieldTypes/pages/FieldTypesPage';

export const fieldTypesRoutes = [
  <Route
    key="field-types"
    path="/field-types"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <FieldTypesPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

