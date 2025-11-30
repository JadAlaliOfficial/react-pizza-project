import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../ui/sidebar';
import {
  Home,
  Settings,
  Store,
  Users,
  ShieldCheck,
  FileText,
  Building,
  UserCheck,
  Calendar,
  CreditCard,
} from 'lucide-react';
import AppSidebarHeader from './SidebarHeader';
import NavigationMenu from './NavigationMenu';
import type { MenuItem, AuthStore } from './types';
import { getStores } from '../../../features/auth/utils/permissionAndRolesStorage';
import { useCurrentStore } from '../../../components/layouts/mainLayout/CurrentStoreContext';

// Transform auth store data to our display format
const transformStoreData = (authStores: any[]): AuthStore[] => {
  return authStores.map((storeData) => ({
    id: storeData.store.id,
    name: storeData.store.name,
    metadata: storeData.store.metadata,
    is_active: storeData.store.is_active,
  }));
};

// Helper to mark active menu items
function isMenuItemActive(currentPath: string, menuUrl: string): boolean {
  if (menuUrl === '/dashboard' || menuUrl === '/settings') {
    return currentPath === menuUrl;
  }
  return currentPath === menuUrl || currentPath.startsWith(menuUrl + '/');
}

const AppSidebar: React.FC = () => {
  const location = useLocation();

  const { currentStore, setCurrentStore } = useCurrentStore();

  const [stores, setStores] = useState<AuthStore[]>([]);
  const [, setActiveMenuItem] = useState<string>('');

  // Load stores from auth data and reconcile with persisted currentStore
  useEffect(() => {
    const authStores = getStores();

    if (authStores && authStores.length > 0) {
      const transformedStores = transformStoreData(authStores);
      const activeStores = transformedStores.filter((s) => s.is_active);

      setStores(activeStores);

      if (activeStores.length === 0) {
        // Nothing selectable
        setCurrentStore(null);
        return;
      }

      // If we have a persisted store and it's still active, keep it.
      const stillActive =
        currentStore && activeStores.find((s) => s.id === currentStore.id);

      if (!stillActive) {
        // Otherwise choose the first active as a sensible default
        setCurrentStore(activeStores[0]);
      }
    } else {
      setStores([]);
      setCurrentStore(null);
    }
    // We intentionally do NOT include currentStore in deps to avoid loops;
    // we only need to run this when the provider setter identity changes (rare).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentStore]);

  // Track the active menu item (optional, for styling/logic parity with your original code)
  useEffect(() => {
    setActiveMenuItem(location.pathname);
  }, [location.pathname]);

  const handleStoreChange = (store: AuthStore) => {
    setCurrentStore(store); // Provider will persist to localStorage
  };

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Blank Page', url: '/blank-page', icon: FileText },
    { title: 'User Management', url: '/user-management', icon: Users },
    { title: 'Employees', url: '/employees', icon: UserCheck },
    {
      title: 'Employment Information',
      url: '/employment-information',
      icon: CreditCard,
    },
    {
      title: 'Service Client Management',
      url: '/service-client-management',
      icon: ShieldCheck,
    },
    { title: 'Auth Rules', url: '/auth-rules', icon: ShieldCheck },
    { title: 'Stores', url: '/stores', icon: Store },
    {
      title: 'User Role Store Assignment',
      url: '/user-role-store-assignment',
      icon: Users,
    },
    { title: 'Positions', url: '/positions', icon: Building },
    {
      title: 'Schedule Preferences',
      url: '/schedule-preferences',
      icon: Calendar,
    },
    { title: 'Field Types', url: '/field-types', icon: FileText },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar-gradient border-r border-sidebar-border shadow-md"
    >
      {stores.length > 0 && currentStore && (
        <AppSidebarHeader
          stores={stores}
          currentStore={currentStore}
          onStoreChange={handleStoreChange}
        />
      )}

      <SidebarContent className="!bg-sidebar">
        <NavigationMenu menuItems={menuItems} />
      </SidebarContent>

      <SidebarFooter className="bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isMenuItemActive(location.pathname, '/settings')}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent/70"
              tooltip="Settings"
            >
              <Link
                to="/settings"
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
