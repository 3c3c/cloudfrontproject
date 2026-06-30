export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  remark: string;
  enabled: number;
  createTime: string;
  updateTime: string;
  createdBy: string;
  updatedBy: string;
}

export interface User {
  id: string;
  account: string;
  username?: string;
  name: string;
  nickname?: string;
  status: boolean;
  phone?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  authorities?: string[];
  mustChangePassword?: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
  authorities: string[];
  mustChangePassword: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Log {
  id: string;
  time: string;
  user: string;
  module: string;
  action: string;
  ip: string;
  status: 'success' | 'fail';
}

export type ViewState =
  | { type: 'roles' }
  | { type: 'roleDetail'; role: Role }
  | { type: 'users' }
  | { type: 'userDetail'; user: User }
  | { type: 'permissions' }
  | { type: 'logs' };

export type ModalState = 
  | { type: 'none' }
  | { type: 'createRole' }
  | { type: 'editRole'; role: Role }
  | { type: 'roleMember'; role: Role }
  | { type: 'rolePermission'; role: Role }
  | { type: 'createUser' }
  | { type: 'editUser'; user: User }
  | { type: 'selectRole'; user?: User }
  | { type: 'userPermission'; user?: User }
  | { type: 'resetPassword'; user: User }
  | { type: 'createPermission' }
  | { type: 'editPermission'; permission: Permission }
  | { type: 'batchAuthorize'; permission: Permission };
