export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type?: string;
    model_id?: number;
    role_id?: number;
    permission_id?: number;
  };
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type?: string;
    model_id?: number;
    permission_id?: number;
    role_id?: number;
  };
  roles?: Role[];
}

export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface UsersPaginationResponse extends PaginationResponse<UserWithRoles> {}
export interface RolesPaginationResponse extends PaginationResponse<Role> {}
export interface PermissionsPaginationResponse extends PaginationResponse<Permission> {}

export interface GetUsersParams {
  per_page?: number;
  page?: number;
  search?: string;
  role?: string;
}

export interface UsersApiResponse {
  success: boolean;
  data: UsersPaginationResponse;
  message?: string;
}

export interface RolesApiResponse {
  success: boolean;
  data: RolesPaginationResponse;
  message?: string;
}

export interface PermissionsApiResponse {
  success: boolean;
  data: PermissionsPaginationResponse;
  message?: string;
}
