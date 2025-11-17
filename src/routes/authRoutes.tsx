import { Route } from 'react-router-dom';
import PublicRoute from '@/components/PublicRoute';
import AuthLayout from '@/components/layouts/AuthLayout';

// Auth Pages
import Login from '@/features/auth/pages/Login';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import ResetPassword from '@/features/auth/pages/ResetPassword';

export const authRoutes = [
  <Route
    key="login"
    path="/login"
    element={
      <PublicRoute>
        <AuthLayout>
          <Login />
        </AuthLayout>
      </PublicRoute>
    }
  />,
  <Route
    key="forgot-password"
    path="/forgot-password"
    element={
      <PublicRoute>
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      </PublicRoute>
    }
  />,
  <Route
    key="reset-password"
    path="/reset-password"
    element={
      <PublicRoute>
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      </PublicRoute>
    }
  />,
];