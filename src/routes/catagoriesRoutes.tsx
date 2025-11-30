import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import CatagoriesPage from '@/features/formBuilder/catagories/pages/CatagoriesPage';

export const catagoriesRoutes = [
  <Route
    key="catagories"
    path="/catagories"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <CatagoriesPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

