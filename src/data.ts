import { Role, User, Permission, Log } from './types';

export const mockRoles: Role[] = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  roleCode: `ROLE_${i + 1}`,
  roleName: `角色${i + 1}`,
  remark: `角色说明${i + 1}`,
  enabled: 1,
  createTime: '2024-01-01T10:00:00',
  updateTime: '2024-01-01T10:00:00',
  createdBy: 'admin',
  updatedBy: 'admin',
}));

export const mockUsers: User[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
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

const logUsers = ['刘一', '陈二', '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
const logModules = ['角色管理', '用户管理', '权限管理', '日志管理'];
const logActions: Array<[string, Log['status']]> = [
  ['创建角色', 'success'],
  ['编辑用户信息', 'success'],
  ['删除权限策略', 'success'],
  ['登录系统', 'success'],
  ['批量授权', 'success'],
  ['重置用户密码', 'success'],
  ['修改角色权限', 'fail'],
  ['导出日志', 'success'],
  ['禁用用户账号', 'success'],
  ['退出登录', 'success'],
];

export const mockLogs: Log[] = Array.from({ length: 12 }).map((_, i) => {
  const [action, status] = logActions[i % logActions.length];
  const day = String(i + 5).padStart(2, '0');
  const minute = String((i * 7) % 60).padStart(2, '0');
  return {
    id: `log-${i + 1}`,
    time: `2026-06-${day} 1${i % 9}:${minute}:2${i % 6}`,
    user: logUsers[i % logUsers.length],
    module: logModules[i % logModules.length],
    action,
    ip: `192.168.${i + 10}.${(i * 13) % 200}`,
    status,
  };
});
