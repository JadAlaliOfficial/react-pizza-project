import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import FormBuilderPage from '@/features/formBuilder/workspace/pages/FormBuilderPage';
import {FormVersionBuilderPage} from '@/features/formBuilder/formVersions/pages/FormVersionBuilderPage'
import EndUserFormPage from '@/features/formBuilder/endUserForms/pages/index'

export const formBuilderRoutes = [
  <>
  <Route
    key="form-builder"
    path="/form-builder"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <FormBuilderPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />
  <Route
    key="form-version-builder"
    path="/form-version-builder/:id"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <FormVersionBuilderPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />
  <Route
    key="end-user-form"
    path="/end-user-form/:formVersionId/:languageId"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <EndUserFormPage />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }
  />
   </>
];
