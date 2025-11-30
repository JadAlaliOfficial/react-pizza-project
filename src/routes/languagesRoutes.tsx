import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import LanguagesPage from '@/features/formBuilder/languages/pages/LanguagesPage';

export const languagesRoutes = [
  <Route
    key="languages"
    path="/languages"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <LanguagesPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

