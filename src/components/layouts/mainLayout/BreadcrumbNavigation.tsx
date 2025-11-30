import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../ui/breadcrumb';
import type { BreadcrumbNavigationProps, BreadcrumbItem as BreadcrumbItemType } from './types';

// Helper function to generate breadcrumbs
function generateBreadcrumbs(pathname: string): BreadcrumbItemType[] {
 

  // Route to label mapping
  const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/blank-page': 'Blank Page',
    '/settings': 'Settings',
    '/terms': 'Terms of Service',
    '/privacy': 'Privacy Policy',
    '/user-management': 'User Management',
    '/user-management/create/user': 'Create User',
    '/user-management/edit/user': 'Edit User',
    '/user-management/view/user': 'View User',
    '/user-management/create/role': 'Create Role',
    '/user-management/roles/assign-permissions': 'Assign Permissions',
    '/user-management/create/permission': 'Create Permission',
    '/employees': 'Employees',
    '/employees/create': 'Create Employee',
    '/employees/edit': 'Edit Employee',
    '/employees/view': 'View Employee',
    '/employment-information': 'Employment Information',
    '/service-client-management': 'Service Client Management',
    '/auth-rules': 'Auth Rules',
    '/auth-rules/create': 'Create Auth Rule',
    '/stores': 'Stores',
    '/stores/create': 'Create Store',
    '/stores/edit': 'Edit Store',
    '/stores/view': 'View Store',
    '/user-role-store-assignment': 'User Role Store Assignment',
    '/user-role-store-assignment/bulk': 'Bulk Assignment',
    '/user-role-store-assignment/assign': 'Assign Roles',
    '/user-role-store-assignment/view/user': 'View User Assignments',
    '/user-role-store-assignment/view/store': 'View Store Assignments',
    '/stores-hierarchy': 'Stores Hierarchy',
    '/stores-hierarchy/view': 'View Hierarchy',
    '/stores-hierarchy/create': 'Create Hierarchy',
    '/stores-hierarchy/delete': 'Delete Hierarchy',
    '/stores-hierarchy/validate': 'Validate Hierarchy',
    '/positions': 'Positions',
    '/positions/create': 'Create Position',
    '/positions/edit': 'Edit Position',
    '/positions/view': 'View Position',
    '/schedule-preferences': 'Schedule Preferences',
    '/schedule-preferences/create': 'Create Schedule Preference',
    '/schedule-preferences/edit': 'Edit Schedule Preference',
    '/schedule-preferences/view': 'View Schedule Preference',
    '/daily-schedules': 'Daily Schedules',
    '/daily-schedules/create': 'Create Daily Schedule',
    '/daily-schedules/edit': 'Edit Daily Schedule',
    '/daily-schedules/view': 'View Daily Schedule',
    '/weekly-schedules': 'Weekly Schedules',
    '/weekly-schedules/create': 'Create Weekly Schedule',
    '/weekly-schedules/edit': 'Edit Weekly Schedule',
    '/weekly-schedules/view': 'View Weekly Schedule',
    '/field-types': 'Field Types',
  };

  const breadcrumbs: BreadcrumbItemType[] = [];
  
  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    isActive: pathname === '/dashboard'
  });

  // If we're on dashboard, return early
  if (pathname === '/dashboard') {
    return breadcrumbs;
  }

  // Split the pathname into segments
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  // Build breadcrumbs from segments
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    
    // Check if this is a valid route or a parameter
    let label = routeLabels[currentPath];
    
    // If no direct match, try to find a pattern match
    if (!label) {
      // Handle dynamic routes with parameters
      const pathPattern = currentPath.replace(/\/[^/]+$/, '');
      label = routeLabels[pathPattern];
      
      // If still no match, use the segment as label (capitalize first letter)
      if (!label) {
        const segment = segments[i];
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }
    }

    const isActive = currentPath === pathname;
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isActive
    });
  }

  return breadcrumbs;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ pathname }) => {
  // Generate breadcrumbs based on pathname
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <div className="flex items-center px-2 py-1 sm:py-2 bg-muted/30">
      <Breadcrumb>
        <BreadcrumbList className="text-xs sm:text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbItem>
                {breadcrumb.isActive ? (
                  <BreadcrumbPage className="text-foreground font-medium text-xs sm:text-sm">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : // Special case for 'stores' - make it clickable and navigate to /stores
                breadcrumb.label.toLowerCase() === 'stores' ? (
                  <BreadcrumbLink
                    href="/stores"
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm cursor-pointer"
                  >
                    {breadcrumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink
                    href={breadcrumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
                  >
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNavigation;
