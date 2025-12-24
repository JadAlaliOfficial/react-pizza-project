# React Pizza Project

This is a comprehensive React application built with a feature-based architecture. It manages various aspects of a pizza business, including store hierarchies, user permissions, employee management, and complex scheduling systems.

> [!CAUTION]
> **CRITICAL SECURITY NOTE**
>
> The encryption secret key is currently hardcoded in:
> `src/features/auth/utils/tokenStorage.ts`
>
> **Action Required**: This key MUST be moved to an environment variable (`.env`) immediately before any deployment. This file handles the encryption of the bearer token, which is attached to the header of almost every API request.

## 🛠 Tech Stack

- **Framework**: React (Vite)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Data Fetching**: Axios
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix Primitives)
- **Forms**: React Hook Form + Zod
- **Scheduling**: Schedule-X / Syncfusion / DayPilot

## 📂 Project Architecture

The project follows a **Feature-Based Architecture**. Each domain of the application is encapsulated within its own directory in `src/features/`.

Typical feature structure:
```text
src/features/exampleFeature/
├── types/       # TypeScript interfaces/types
├── services/    # API calls (Axios)
├── store/       # Redux slices
├── hooks/       # Custom React hooks
└── pages/       # Main page components
```

---

## 📊 Feature Status Overview

### ✅ Stable & Connected (Working APIs)
These features are fully integrated with working backend APIs and function correctly:

- **Auth**: Login, password management (Forgot/Reset).
- **AuthorizationRules**: Management of access rules.
- **Dashboard**: Sales, performance, and channel metrics.
- **DSPR**: Daily Sales & Performance Reports (Note: Large feature, sees partial updates).
- **Permissions**: System permission management.
- **Roles**: User role configuration.
- **ServiceClients**: Management of external service clients.
- **StoreHierarchy**: Organization of store structures.
- **Stores**: Individual store management.
- **UserRolesStoresAssignment**: Linking users to roles and specific stores.
- **Users**: User account management.

### ⚠️ Functional but Needs Refactoring (Local APIs)
These features work correctly but are currently connected to local/mock APIs. They require restructuring to connect to the real backend:

- **Employees**
- **EmploymentInformation**
- **Positions**
- **Preference**
- **SchedulePreferences**
- **Skills**
- **Statuses**
- **StoreItems**

### 🚧 In Progress
These features are currently under active development and are not yet complete:

- **FormBuilder**: A massive feature for dynamic form generation.
- **DailySchedules**: A complex scheduling interface.

---

## 🔍 Deep Dive: Complex Features

### 1. FormBuilder (`src/features/formBuilder`)
This is the largest and most complex feature in the system. It is designed to build, configure, and render dynamic forms.

**Core Components:**
- **Hooks & Basics**: Several sub-features provide the building blocks:
  - `actions`, `categories`, `fieldTypeFilters`, `fieldTypes`, `inputRules`, `languages`, `languagesPreferences`.
- **`endUserForms` (Runtime Engine)**:
  - This is where the "magic" happens for the user filling out the form.
  - It includes sophisticated engines for **Validation**, **Visibility** (conditional logic), and **Transitions**.
  - Renders fields dynamically based on configuration.
- **`formVersions` (Configuration)**:
  - Handles the "Admin" side of configuring specific versions of a form.
  - Allows setting specific rules and configs for fields (e.g., `AddressInputFieldConfig`, `CheckboxFieldConfig`).

### 2. DailySchedules (`src/features/dailySchedules`)
- **Status**: **Early Stage / Mockup**.
- **Current State**: The UI components exist and give a visual representation of how the schedule should look.
- **Missing**: The underlying data logic is not yet connected or correct. It relies heavily on mock data and needs significant backend integration work.

### 3. DSPR (`src/features/DSPR`)
- **Status**: **Working but Incomplete**.
- **Details**: This is a critical reporting feature (Daily Sales & Performance). While parts of it work with the API, it is a large scope feature that requires additional files and logic to be fully comprehensive.

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
