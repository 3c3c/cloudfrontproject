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

export type ViewState = 
  | { type: 'roles' }
  | { type: 'roleDetail'; role: Role }
  | { type: 'users' }
  | { type: 'userDetail'; user: User }
  | { type: 'permissions' };

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
