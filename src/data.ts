import { Role, User, Permission } from './types';

export const mockRoles: Role[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `role-${i + 1}`,
  name: `角色${i + 1}`,
  description: `角色说明${i + 1}`,
  status: true,
}));

export const mockUsers: User[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `user-${i + 1}`,
  account: `1000000000${i + 1}`.slice(-11),
  name: ['刘一', '陈二', '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'][i],
  status: true,
  phone: `1371234567${i}`,
  email: `123456789${i}@qq.com`
}));

export const mockPermissions: Permission[] = [
  { id: 'p1', name: 'system1-email-readaccess', description: '只读系统1邮件推送的权限' },
  { id: 'p2', name: 'system1-email-fullaccess', description: '管理系统1邮件推送的权限' },
  { id: 'p3', name: 'system1-msg-readaccess', description: '只读系统1消息服务的权限' },
  { id: 'p4', name: 'system1-msg-fullaccess', description: '管理系统1消息服务的权限' },
  { id: 'p5', name: 'system2-email-readaccess', description: '只读系统2邮件推送的权限' },
  { id: 'p6', name: 'system2-email-fullaccess', description: '管理系统2邮件推送的权限' },
  { id: 'p7', name: 'system2-msg-readaccess', description: '只读系统2消息服务的权限' },
  { id: 'p8', name: 'system2-msg-fullaccess', description: '管理系统2消息服务的权限' },
  { id: 'p9', name: 'system3-email-readaccess', description: '只读系统3邮件推送的权限' },
  { id: 'p10', name: 'system3-email-fullaccess', description: '管理系统3邮件推送的权限' },
];
