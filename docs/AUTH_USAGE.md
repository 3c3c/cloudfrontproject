# 认证系统使用文档

本文档说明如何使用 CloudFront 项目的认证功能，包括登录、注册、会话管理和自动刷新机制。

## 功能概述

认证系统提供以下功能：

1. **用户登录** - 用户名/密码登录
2. **用户注册** - 新用户注册
3. **会话管理** - Token 存储和自动刷新
4. **自动登出** - Token 过期自动清理
5. **统一 API 请求** - 自动处理认证头和 token 刷新

## 技术架构

### 目录结构

```
src/
├── api/
│   ├── authApi.ts          # 认证相关 API 接口
│   └── index.ts            # 统一的 API 请求工具
├── contexts/
│   └── AuthContext.tsx     # 认证上下文管理
├── components/
│   └── Auth.tsx            # 登录/注册组件
└── types.ts                # TypeScript 类型定义
```

### 核心组件

#### 1. AuthContext（认证上下文）

提供全局的认证状态管理：

```typescript
interface AuthContextType {
  isAuthenticated: boolean;  // 是否已认证
  user: AuthUser | null;      // 当前用户信息
  token: string | null;        // JWT Token
  login: (params) => Promise<void>;      // 登录方法
  register: (params) => Promise<string>; // 注册方法
  logout: () => Promise<void>;           // 登出方法
  loading: boolean;           // 加载状态
}
```

#### 2. authApi（认证 API）

提供与认证服务交互的接口：

- `login(params)` - 用户登录
- `register(params)` - 用户注册
- `logout(token)` - 用户登出
- `refreshToken(token)` - 刷新 token
- `sendSms(mobile)` - 发送验证码
- `smsLogin(params)` - 短信验证码登录

#### 3. API 工具函数

提供统一的 API 请求接口：

```typescript
// GET 请求
get<T>(path, params?, skipAuth?)

// POST 请求
post<T>(path, body?, skipAuth?)

// PUT 请求
put<T>(path, body?)

// DELETE 请求
del<T>(path)

// 通用请求
apiRequest<T>(path, config?)
```

## 使用方法

### 1. 环境配置

创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://localhost:8081
```

### 2. 使用认证上下文

在任何组件中使用 `useAuth` hook：

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        username: 'admin',
        password: '123456'
      });
      console.log('登录成功');
    } catch (error) {
      console.error('登录失败', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>欢迎, {user?.username}!</p>
          <button onClick={logout}>登出</button>
        </div>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  );
}
```

### 3. 发起 API 请求

使用统一的 API 工具函数：

```typescript
import { get, post, put, del } from '../api';

// GET 请求
const users = await get('/users', { current: 1, size: 10 });

// POST 请求
const newUser = await post('/users', {
  username: 'newuser',
  nickname: '新用户',
  password: '123456'
});

// PUT 请求
await put('/users/123', { nickname: '更新昵称' });

// DELETE 请求
await del('/users/123');
```

### 4. 自动 Token 刷新

系统会自动处理 token 过期刷新：

1. Token 存储在 localStorage 中
2. 在 token 过期前 5 分钟自动刷新
3. 如果 API 请求返回 401，自动尝试刷新 token
4. 刷新失败则清除认证状态并重定向到登录页

### 5. 保护路由

使用 `withAuth` HOC 保护需要认证的组件：

```typescript
import { withAuth } from '../contexts/AuthContext';

function ProtectedComponent() {
  // 这个组件需要用户登录才能访问
  return <div>受保护的内容</div>;
}

export default withAuth(ProtectedComponent);
```

## API 端点说明

### 认证接口

#### POST /auth/login
用户登录

**请求体：**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenHead": "Bearer ",
    "userId": "1234567890123456789",
    "username": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "authorities": ["ROLE_ADMIN", "ROLE_USER"],
    "mustChangePassword": false
  }
}
```

#### POST /auth/register
用户注册

**请求体：**
```json
{
  "username": "newuser",
  "nickname": "新用户",
  "password": "123456",
  "mobile": "13800138000",
  "email": "user@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "1234567890123456789"
}
```

#### POST /auth/logout
用户登出

**请求头：**
```
Authorization: Bearer {token}
```

#### POST /auth/refresh
刷新令牌

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "新的JWT令牌",
    "tokenHead": "Bearer ",
    "userId": "1234567890123456789",
    "username": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "authorities": ["ROLE_ADMIN", "ROLE_USER"],
    "mustChangePassword": false
  }
}
```

## 错误处理

### 登录/注册错误

```typescript
try {
  await login({ username, password });
} catch (error) {
  if (error instanceof Error) {
    // 显示错误信息
    setError(error.message);
  }
}
```

### API 请求错误

```typescript
try {
  const data = await get('/users');
} catch (error) {
  if (error instanceof Error) {
    // 处理错误
    console.error(error.message);
  }
}
```

## 安全考虑

1. **Token 存储** - Token 存储在 localStorage 中（可根据需要改为 sessionStorage 或 HttpOnly Cookie）
2. **HTTPS** - 生产环境务必使用 HTTPS 传输
3. **密码强度** - 密码长度限制为 6-20 个字符
4. **自动刷新** - Token 在过期前自动刷新，避免频繁重新登录
5. **登出清理** - 登出时清除所有认证信息

## 开发注意事项

1. **API 基础地址** - 在 `.env.development` 中配置本地 API 地址
2. **CORS** - 确保 API 服务配置了正确的 CORS 头
3. **Token 格式** - Token 格式为 `Bearer {token}`
4. **错误处理** - 所有异步操作都应包含错误处理

## 测试

### 本地测试

1. 启动认证服务（端口 8081）
2. 启动前端应用（端口 3000）
3. 访问 http://localhost:3000
4. 使用测试账号登录或注册新账号

### 测试账号

可以使用以下接口创建测试用户：
- 用户名：testuser
- 密码：123456
- 昵称：测试用户

## 扩展功能

可以根据需要扩展以下功能：

1. **记住我** - 延长 token 有效期
2. **多因素认证** - 添加短信或邮箱验证
3. **社交登录** - 支持第三方登录
4. **密码重置** - 实现忘记密码功能
5. **权限控制** - 基于角色的访问控制

## 故障排查

### 问题：登录后刷新页面，认证状态丢失
**解决**：检查 localStorage 中是否有 `auth_token` 和 `auth_user`

### 问题：API 请求返回 401
**解决**：
1. 检查 token 是否有效
2. 检查 API 服务器是否正常运行
3. 查看浏览器控制台的错误信息

### 问题：Token 刷新失败
**解决**：
1. 检查 `/auth/refresh` 接口是否正常
2. 检查 token 是否已过期
3. 查看网络请求的详细错误信息

## 相关文档

- [Cloud Auth API 文档](./cloud-auth-api.md)
- [项目 README](./README.md)
- [开发指南](./DEVELOPMENT.md)
