import { Role, User, Permission, Log, DictionaryType, DictionaryItem } from './types';

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

export const mockDictionaryTypes: DictionaryType[] = [
  { id: 'sys_config', name: '系统配置', code: 'sys_config', description: '系统级根字典', parentId: null, enabled: true },
  { id: 'biz', name: '业务字典', code: 'biz', description: '业务相关字典', parentId: 'sys_config', enabled: true },
  { id: 'sys', name: '系统字典', code: 'sys', description: '系统内置字典', parentId: 'sys_config', enabled: true },
  { id: 'user_gender', name: '用户性别', code: 'user_gender', description: '用户性别选项', parentId: 'biz', enabled: true },
  { id: 'account_status', name: '账号状态', code: 'account_status', description: '账号启用状态', parentId: 'biz', enabled: true },
  { id: 'yes_no', name: '是否', code: 'yes_no', description: '通用是否选项', parentId: 'biz', enabled: false },
  { id: 'menu_type', name: '菜单类型', code: 'menu_type', description: '菜单分类', parentId: 'sys', enabled: true },
  { id: 'notice_type', name: '通知类型', code: 'notice_type', description: '消息通知分类', parentId: 'sys', enabled: true },
];

export const mockDictionaryItems: DictionaryItem[] = [
  // 用户性别
  { id: 'g1', typeId: 'user_gender', label: '男', value: 'M', sortOrder: 1, description: '男性' },
  { id: 'g2', typeId: 'user_gender', label: '女', value: 'F', sortOrder: 2, description: '女性' },
  { id: 'g3', typeId: 'user_gender', label: '未知', value: 'U', sortOrder: 3, description: '未知性别' },
  // 是否
  { id: 'yn1', typeId: 'yes_no', label: '是', value: 'Y', sortOrder: 1 },
  { id: 'yn2', typeId: 'yes_no', label: '否', value: 'N', sortOrder: 2 },
  // 菜单类型
  { id: 'mt1', typeId: 'menu_type', label: '目录', value: 'directory', sortOrder: 1 },
  { id: 'mt2', typeId: 'menu_type', label: '菜单', value: 'menu', sortOrder: 2 },
  { id: 'mt3', typeId: 'menu_type', label: '按钮', value: 'button', sortOrder: 3 },
  // 通知类型
  { id: 'nt1', typeId: 'notice_type', label: '系统通知', value: 'system', sortOrder: 1 },
  { id: 'nt2', typeId: 'notice_type', label: '邮件通知', value: 'email', sortOrder: 2 },
  { id: 'nt3', typeId: 'notice_type', label: '短信通知', value: 'sms', sortOrder: 3 },
  // 账号状态（多造一些以演示分页）
  ...Array.from({ length: 13 }).map((_, i) => ({
    id: `as_${i + 1}`,
    typeId: 'account_status',
    label: `状态${i + 1}`,
    value: `status_${i + 1}`,
    sortOrder: i + 1,
    description: `账号状态选项 ${i + 1}`,
  })),
];
