export interface Role {
  id: string;
  name: string;
  description: string;
  status: boolean;
}

export interface User {
  id: string;
  account: string;
  name: string;
  status: boolean;
  phone?: string;
  email?: string;
  avatar?: string;
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
