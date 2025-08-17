import { useAuth } from './useAuth';
import type { Permission } from '../types/userTypes';

interface UsePermissionsResult {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getUserPermissions: () => string[];
}

export const usePermissions = (): UsePermissionsResult => {
  const { user } = useAuth();

  const getUserPermissions = (): string[] => {
    if (!user?.roles) return [];
    
    const permissions = new Set<string>();
    
    // Add direct permissions
    user.permissions?.forEach(permission => {
      permissions.add(permission.name);
    });
    
    // Add role-based permissions
    user.roles.forEach(role => {
      role.permissions?.forEach(permission => {
        permissions.add(permission.name);
      });
    });
    
    return Array.from(permissions);
  };

  const hasPermission = (permission: string): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
  };
};
