import { Log, Permission, User } from './types';

// 保留日志数据的生成逻辑（因为日志页面需要这个）
export function generateMockLogs(count: number = 12): Log[] {
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

  return Array.from({ length: count }).map((_, i) => {
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
}
