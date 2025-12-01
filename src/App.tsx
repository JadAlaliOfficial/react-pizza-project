import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
// import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import AuthInitializer from '@/components/AuthInitializer';
import CustomLoadingScreen from '@/components/CustomLoadingScreen';
import { Toaster } from '@/components/ui/sonner';

// Import all route modules
import {
  authRoutes,
  mainRoutes,
  userManagementRoutes,
  serviceClientRoutes,
  authRulesRoutes,
  storesRoutes,
  userRoleStoreAssignmentRoutes,
  storeHierarchyRoutes,
  positionsRoutes,
  skillsRoutes,
  preferencesRoutes,
  employeesRoutes,
  employmentInformationRoutes,
  schedulePreferencesRoutes,
  dailySchedulesRoutes,
  fieldTypesRoutes,
  inputRulesRoutes,
  actionsRoutes,
  fieldTypeFiltersRoutes,
  languagesRoutes,
  languagesPreferencesRoutes,
  catagoriesRoutes,
  formsRoutes,
  translationsRoutes,
  formBuilderRoutes,
} from '@/routes';


function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pizza-app-theme">
      {/* <AuthProvider> */}
      <AuthInitializer fallback={<CustomLoadingScreen />}>
        <Router>
          <div className="min-h-screen bg-background text-foreground transition-colors">
            <Routes>
              {/* Authentication Routes */}
              {authRoutes}

              {/* Main Application Routes */}
              {mainRoutes}

              {/* User Management Routes */}
              {userManagementRoutes}

              {/* Service Client Management Routes */}
              {serviceClientRoutes}

              {/* Authorization Rules Management Routes */}
              {authRulesRoutes}

              {/* Stores Management Routes */}
              {storesRoutes}

              {/* User Role Store Assignment Routes */}
              {userRoleStoreAssignmentRoutes}

              {/* Store Hierarchy Management Routes */}
              {storeHierarchyRoutes}

              {/* Positions Management Routes */}
              {positionsRoutes}

              {/* Skills Management Routes */}
              {skillsRoutes}

              {/* Preferences Management Routes */}
              {preferencesRoutes}

              {/* Employees Management Routes */}
              {employeesRoutes}

              {/* Employment Information Management Routes */}
              {employmentInformationRoutes}

              {/* Schedule Preferences Management Routes */}
              {schedulePreferencesRoutes}

              {/* Daily Schedules Management Routes */}
              {dailySchedulesRoutes}

              {/* Field Types Management Routes */}
              {fieldTypesRoutes}

              {/* Field Type Filters Management Routes */}
              {fieldTypeFiltersRoutes}

              {/* Languages Management Routes */}
              {languagesRoutes}

              {/* Languages Preferences Routes */}
              {languagesPreferencesRoutes}

              {/* Categories Management Routes */}
              {catagoriesRoutes}

              {/* Input Rules Management Routes */}
              {inputRulesRoutes}

              {/* Actions Management Routes */}
              {actionsRoutes}

              {/* Forms Management Routes */}
              {formsRoutes}

              {/* Form Builder Workspace Routes */}
              {formBuilderRoutes}

              {/* Translations Management Routes */}
              {translationsRoutes}

              {/* Default and catch-all routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster richColors closeButton position="top-right" />
          </div>
        </Router>
      </AuthInitializer>
      {/* </AuthProvider> */}
    </ThemeProvider>
  );
}

export default App;
