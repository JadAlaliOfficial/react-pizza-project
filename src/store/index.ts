import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import permissionsReducer from '../features/permissions/store/permissionsSlice';
import rolesReducer from '../features/roles/store/rolesSlice';
import usersReducer from '../features/users/store/usersSlice';
import authRulesReducer from '../features/authorizationRules/store/authRulesSlice';
import serviceClientsReducer from '../features/serviceClients/store/serviceClientsSlice';
import storesReducer from '../features/stores/store/storesSlice';
import userRolesStoresAssignmentReducer from '../features/userRolesStoresAssignment/store/userRolesStoresAssignmentSlice';
import roleHierarchyReducer from '../features/storeHierarchy/store/roleHierarchySlice';
import positionsReducer from '../features/positions/store/positionsSlice';
import statusesReducer from '../features/statuses/store/statusesSlice';
import skillsReducer from '../features/skills/store/skillSlice';
import preferencesReducer from '../features/preference/store/preferencesSlice';
import employeesReducer from '../features/employees/store/employeesSlice';
import schedulePreferencesReducer from '../features/schedulePreferences/store/schedulePreferencesSlice';
import employmentInformationReducer from '../features/employmentInformation/store/employmentInformationSlice';
import dailySchedulesReducer from '../features/dailySchedules/store/slices/dailySchedulesSlice';
import weeklySchedulesReducer from '../features/dailySchedules/store/slices/weeklySchedulesSlice';


// Import the new DSPR slices
import dsprApiReducer from '../features/DSPR/store/dsprApiSlice';
import dsprHourlySalesSlice from '../features/DSPR/store/dsprHourlySalesSlice';
import dsprDsqrSlice   from '../features/DSPR/store/dsprDsqrSlice';
import dsprDailySlice from '../features/DSPR/store/dsprDailySlice';
import dsprWeeklySlice from '../features/DSPR/store/dsprWeeklySlice';
import dsprWeeklyPrevSlice from '../features/DSPR/store/dsprWeeklyPrevSlice';
import dsprDailyByDateSlice from '../features/DSPR/store/dsprDailyByDateSlice';

import fieldTypesReducer from '../features/formBuilder/fieldTypes/store/fieldTypesSlice';
import inputRulesReducer from '../features/formBuilder/inputRules/store/inputRulesSlice';
import actionsReducer from '../features/formBuilder/actions/store/actionsSlice';
import fieldTypeFiltersReducer from '../features/formBuilder/fieldTypeFilters/store/fieldTypeFiltersSlice';
import languagesReducer from '../features/formBuilder/languages/store/languagesSlice';
import formsReducer from '../features/formBuilder/forms/store/formsSlice';
import categoriesReducer from '../features/formBuilder/categories/store/categoriesSlice';
import translationsReducer from '../features/formBuilder/translations/store/translationsSlice';
import languagesPreferencesReducer from '../features/formBuilder/languagesPreferences/store/languagesPreferencesSlice';
import formVersionsReducer from '../features/formBuilder/formVersions/store/formVersionsSlice';
import formVersionBuilderReducer from '../features/formBuilder/formVersions/store/formVersionBuilderSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionsReducer,
    roles: rolesReducer,
    users: usersReducer,
    authRules: authRulesReducer,
    serviceClients: serviceClientsReducer,
    positions: positionsReducer,
    stores: storesReducer,
    userRolesStoresAssignment: userRolesStoresAssignmentReducer,
    roleHierarchy: roleHierarchyReducer,
    statuses: statusesReducer,
    skills: skillsReducer,
    preferences: preferencesReducer,
    employees: employeesReducer,
    schedulePreferences: schedulePreferencesReducer,
    employmentInformation: employmentInformationReducer,
    dailySchedules: dailySchedulesReducer,
    weeklySchedules: weeklySchedulesReducer,
    
    // Add the new DSPR-related slices
    dsprApi: dsprApiReducer,           // Main API coordinator slice
    dsprHourlySales: dsprHourlySalesSlice,   // Hourly sales domain slice
    dsprDsqr: dsprDsqrSlice,                 // DSQR domain slice
    dsprDaily: dsprDailySlice,   // DSPR metrics domain slice
    dsprWeekly: dsprWeeklySlice,   // DSPR metrics domain slice
    dsprWeeklyPrev: dsprWeeklyPrevSlice,   // DSPR metrics domain slice
    dsprDailyByDate: dsprDailyByDateSlice,   // DSPR metrics domain slice
    
    fieldTypes: fieldTypesReducer,
    inputRules: inputRulesReducer,
    actions: actionsReducer,
    fieldTypeFilters: fieldTypeFiltersReducer,
    languages: languagesReducer,
    forms: formsReducer,
    categories: categoriesReducer,
    translations: translationsReducer,
    languagesPreferences: languagesPreferencesReducer,
    formVersion: formVersionsReducer,
    formVersionBuilder: formVersionBuilderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
