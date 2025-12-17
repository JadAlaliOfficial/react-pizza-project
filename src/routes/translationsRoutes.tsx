import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import TranslationsPage from '@/features/formBuilder/translations/pages/TranslationsPage';

export const translationsRoutes = [
  <Route
    key="translations"
    path="/translations/:formId/:versionId"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <TranslationsPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

