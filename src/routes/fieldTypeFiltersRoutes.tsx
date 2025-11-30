import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import FieldTypeFiltersPage from '@/features/formBuilder/fieldTypeFilters/pages/FieldTypeFiltersPage';

export const fieldTypeFiltersRoutes = [
  <Route
    key="field-type-filters"
    path="/field-type-filters"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <FieldTypeFiltersPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

