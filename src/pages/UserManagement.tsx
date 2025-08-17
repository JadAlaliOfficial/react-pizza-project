import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import { useUsers } from '../hooks/useUsers';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Search, 
  Users, 
  RefreshCw, 
  UserPlus,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Key,
  Settings,
  ChevronDown,
  ChevronRight,
  Lock,
  AlertTriangle
} from 'lucide-react';
import type { GetUsersParams } from '../types/userTypes';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('users');
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set());
  const [expandedPermissions, setExpandedPermissions] = useState<Set<number>>(new Set());

  const { 
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
    refetch 
  } = useUsers({
    per_page: perPage,
    page: currentPage,
    search: searchTerm,
    role: roleFilter,
  });

  const { hasPermission } = usePermissions();

  // Check permissions for different actions
  const canManageUsers = hasPermission('manage users');
  const canManageRoles = hasPermission('manage roles');
  const canManagePermissions = hasPermission('manage permissions');

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers({
      per_page: perPage,
      page: 1,
      search: searchTerm,
      role: roleFilter,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers({
      per_page: perPage,
      page,
      search: searchTerm,
      role: roleFilter,
    });
  };

  const handlePerPageChange = (newPerPage: string) => {
    const perPageNum = parseInt(newPerPage);
    setPerPage(perPageNum);
    setCurrentPage(1);
    fetchUsers({
      per_page: perPageNum,
      page: 1,
      search: searchTerm,
      role: roleFilter,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super-admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getPermissionColor = (permissionName: string) => {
    if (permissionName.includes('manage')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  const toggleRoleExpansion = (roleId: number) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const togglePermissionExpansion = (permissionId: number) => {
    const newExpanded = new Set(expandedPermissions);
    if (newExpanded.has(permissionId)) {
      newExpanded.delete(permissionId);
    } else {
      newExpanded.add(permissionId);
    }
    setExpandedPermissions(newExpanded);
  };

  // Filter tabs based on permissions
  const availableTabs = [
    { value: 'users', label: 'Users', icon: Users, permission: 'manage users' },
    { value: 'roles', label: 'Roles', icon: Shield, permission: 'manage roles' },
    { value: 'permissions', label: 'Permissions', icon: Key, permission: 'manage permissions' },
  ].filter(tab => hasPermission(tab.permission));

  if (availableTabs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading || isLoadingRoles || isLoadingPermissions}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || isLoadingRoles || isLoadingPermissions) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Users Tab */}
        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            {/* Filters Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Filters</CardTitle>
                <CardDescription>
                  Search and filter users by name, email, or role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="search">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-filter">Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="per-page">Per Page</Label>
                    <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                      <SelectTrigger className="w-full md:w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} disabled={isLoading}>
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Users Table Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      {pagination?.total ? `${pagination.total} users found` : 'Loading...'}
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email Status</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Loading users...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Users className="w-12 h-12 text-muted-foreground" />
                              <span className="text-muted-foreground">No users found</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {user.email_verified_at ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">Unverified</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <Badge
                                    key={role.id}
                                    variant="outline"
                                    className={getRoleColor(role.name)}
                                  >
                                    <Shield className="w-3 h-3 mr-1" />
                                    {role.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm flex items-center text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(user.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm flex items-center text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(user.updated_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total > 0 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {pagination.from} to {pagination.to} of {pagination.total} users
                    </div>
                    
                    <Pagination>
                      <PaginationContent>
                        {pagination.prev_page_url && (
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                          .filter(page => {
                            return page === 1 || 
                                   page === pagination.last_page || 
                                   Math.abs(page - currentPage) <= 2;
                          })
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          ))}
                        
                        {pagination.next_page_url && (
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Roles Tab */}
        {canManageRoles && (
          <TabsContent value="roles" className="space-y-6">
            {rolesError && (
              <Alert variant="destructive">
                <AlertDescription>{rolesError}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>
                      {roles.length ? `${roles.length} roles available` : 'Loading...'}
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingRoles ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading roles...</span>
                      </div>
                    </div>
                  ) : roles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Shield className="w-12 h-12 text-muted-foreground" />
                      <span className="text-muted-foreground">No roles found</span>
                    </div>
                  ) : (
                    roles.map((role) => (
                      <Card key={role.id} className="border">
                        <Collapsible>
                          <CollapsibleTrigger
                            onClick={() => toggleRoleExpansion(role.id)}
                            className="w-full"
                          >
                            <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {expandedRoles.has(role.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  <Badge className={getRoleColor(role.name)}>
                                    <Shield className="w-3 h-3 mr-1" />
                                    {role.name}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {role.permissions?.length || 0} permissions
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                  Created: {formatDate(role.created_at)}
                                </div>
                                {role.permissions && role.permissions.length > 0 ? (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Permissions:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {role.permissions.map((permission) => (
                                        <Badge
                                          key={permission.id}
                                          variant="outline"
                                          className={getPermissionColor(permission.name)}
                                        >
                                          <Key className="w-3 h-3 mr-1" />
                                          {permission.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    No permissions assigned to this role.
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Permissions Tab */}
        {canManagePermissions && (
          <TabsContent value="permissions" className="space-y-6">
            {permissionsError && (
              <Alert variant="destructive">
                <AlertDescription>{permissionsError}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>
                      {permissions.length ? `${permissions.length} permissions available` : 'Loading...'}
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Add Permission
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingPermissions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading permissions...</span>
                      </div>
                    </div>
                  ) : permissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Key className="w-12 h-12 text-muted-foreground" />
                      <span className="text-muted-foreground">No permissions found</span>
                    </div>
                  ) : (
                    permissions.map((permission) => (
                      <Card key={permission.id} className="border">
                        <Collapsible>
                          <CollapsibleTrigger
                            onClick={() => togglePermissionExpansion(permission.id)}
                            className="w-full"
                          >
                            <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {expandedPermissions.has(permission.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  <Badge className={getPermissionColor(permission.name)}>
                                    <Key className="w-3 h-3 mr-1" />
                                    {permission.name}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {permission.roles?.length || 0} roles
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                  Created: {formatDate(permission.created_at)}
                                </div>
                                {permission.roles && permission.roles.length > 0 ? (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Assigned to roles:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {permission.roles.map((role) => (
                                        <Badge
                                          key={role.id}
                                          variant="outline"
                                          className={getRoleColor(role.name)}
                                        >
                                          <Shield className="w-3 h-3 mr-1" />
                                          {role.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    This permission is not assigned to any role.
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserManagement;
