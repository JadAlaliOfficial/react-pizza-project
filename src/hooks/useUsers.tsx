import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { 
  UserWithRoles, 
  UsersPaginationResponse, 
  GetUsersParams,
  Role,
  Permission,
  RolesPaginationResponse,
  PermissionsPaginationResponse
} from '../types/userTypes';

interface UseUsersResult {
  users: UserWithRoles[];
  pagination: Omit<UsersPaginationResponse, 'data'> | null;
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  isLoadingRoles: boolean;
  isLoadingPermissions: boolean;
  error: string | null;
  rolesError: string | null;
  permissionsError: string | null;
  fetchUsers: (params?: GetUsersParams) => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useUsers = (initialParams: GetUsersParams = {}): UseUsersResult => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [pagination, setPagination] = useState<Omit<UsersPaginationResponse, 'data'> | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<GetUsersParams>(initialParams);

  const fetchUsers = async (params: GetUsersParams = currentParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.getAllUsers(params);

      if (response.success) {
        const { data: usersData, ...paginationData } = response.data;
        setUsers(usersData);
        setPagination(paginationData);
        setCurrentParams(params);
      } else {
        setError(response.message || 'Failed to fetch users');
        setUsers([]);
        setPagination(null);
      }
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    setRolesError(null);

    try {
      const response = await userService.getAllRoles();

      if (response.success) {
        setRoles(response.data.data);
      } else {
        setRolesError(response.message || 'Failed to fetch roles');
        setRoles([]);
      }
    } catch (err: any) {
      console.error('Fetch roles error:', err);
      setRolesError(err.response?.data?.message || 'Failed to fetch roles');
      setRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchPermissions = async () => {
    setIsLoadingPermissions(true);
    setPermissionsError(null);

    try {
      const response = await userService.getAllPermissions();

      if (response.success) {
        setPermissions(response.data.data);
      } else {
        setPermissionsError(response.message || 'Failed to fetch permissions');
        setPermissions([]);
      }
    } catch (err: any) {
      console.error('Fetch permissions error:', err);
      setPermissionsError(err.response?.data?.message || 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const refetch = async () => {
    await Promise.all([
      fetchUsers(currentParams),
      fetchRoles(),
      fetchPermissions(),
    ]);
  };

  useEffect(() => {
    fetchUsers(initialParams);
    fetchRoles();
    fetchPermissions();
  }, []); // Only run on mount

  return {
    users,
    pagination,
    roles,
    permissions,
    isLoading,
    isLoadingRoles,
    isLoadingPermissions,
    error,
    rolesError,
    permissionsError,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    refetch,
  };
};
