import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import LanguagesPreferencesPage from '@/features/formBuilder/languagesPreferences/pages/LanguagesPreferencesPage';

export const languagesPreferencesRoutes = [
  <Route
    key="languages-preferences"
    path="/languages-preferences"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <LanguagesPreferencesPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />,
];

