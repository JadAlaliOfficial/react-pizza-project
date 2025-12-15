import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import FormsListPage from '@/features/formBuilder/forms/pages/index';
import ListFormVersionsPage from '@/features/formBuilder/forms/pages/ListFormVersionsPage';

export const formsRoutes = [
  <Route
    key="forms"
    path="/forms"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <FormsListPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
  <Route
    key="list-form-versions"
    path="/list-form-versions/:formId"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <ListFormVersionsPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

