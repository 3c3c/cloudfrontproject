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
  id: number;
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
  createTime?: string;
  updateTime?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
  authorities: string[];
  mustChangePassword: boolean;
}

export interface Permission {
  id: number;
  permCode: string;
  permName: string;
  type: number; // 1=目录，2=菜单，3=按钮
  parentId: number;
  icon?: string;
  path?: string;
  component?: string;
  visible: number; // 0=隐藏，1=显示
  serviceCode?: string;
  enabled: number; // 0=禁用，1=启用
  sort: number;
  remark?: string;
  children?: Permission[];
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

export interface DictionaryType {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId: string | null;
  enabled: boolean;
  sortOrder?: number;
}

export interface DictionaryItem {
  id: string;
  typeId: string;
  label: string;
  value: string;
  sortOrder: number;
  description?: string;
}

export type ViewState =
  | { type: 'roles' }
  | { type: 'roleDetail'; role: Role }
  | { type: 'users' }
  | { type: 'userDetail'; user: User }
  | { type: 'permissions' }
  | { type: 'logs' }
  | { type: 'dictionaries' };

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
  | { type: 'createChildPermission'; parent: Permission };
