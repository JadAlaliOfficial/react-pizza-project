import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import FormBuilderPage from '@/features/formBuilder/workspace/pages/FormBuilderPage';
import {RulesBuilderExample} from '@/features/formBuilder/inputRules/pages/RulesBuilderExample';
import {TextInputFieldBuilder} from '@/features/formBuilder/fieldTypes/pages/TextInputFieldBuilder';
import {FormVersionBuilderPage} from '@/features/formBuilder/formVersions/pages/FormVersionBuilderPage'

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
    key="rules-builder"
    path="/rules-builder"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <RulesBuilderExample />
          </MainLayout>
        </RoleGuard>
      </ProtectedRoute>
    }/>
  <Route
    key="text-input-field-builder"
    path="/text-input-field-builder"
    element={
      <ProtectedRoute>
        <RoleGuard role="super-admin">
          <MainLayout>
            <TextInputFieldBuilder />
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
   </>
];
