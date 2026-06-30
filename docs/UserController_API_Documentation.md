# UserController API 文档

## 概述
UserController 提供用户管理的完整功能，包括用户的增删改查、状态管理和批量操作。

## 基础信息
- **Base URL**: `/auth/users`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

---

## API 接口详情

### 1. 分页查询用户列表
- **接口**: `GET /auth/users`
- **描述**: 根据用户名称或账号，分页查询用户列表。列表包含用户账号、用户名称、手机号、邮箱、用户状态等信息。
- **权限要求**: `user:list` 或 `ROLE_ADMIN`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|-------|------|------|------|--------|
| current | Long | 是 | 当前页码，从1开始 | 1 |
| size | Long | 是 | 每页大小 | 10 |
| keyword | String | 否 | 用户名或手机号（模糊查询） | "admin" |

#### 请求示例
```bash
GET /auth/users?current=1&size=10&keyword=admin
```

#### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "系统管理员",
        "mobile": "13800138000",
        "email": "admin@example.com",
        "avatar": "https://cdn.example.com/avatars/admin.jpg",
        "enabled": 1,
        "createTime": "2024-01-15T10:30:00",
        "updateTime": "2024-06-28T15:45:00",
        "createdBy": "system",
        "updatedBy": "admin"
      },
      {
        "id": 2,
        "username": "user001",
        "nickname": "张三",
        "mobile": "13900139001",
        "email": "zhangsan@example.com",
        "avatar": "https://cdn.example.com/avatars/user001.jpg",
        "enabled": 1,
        "createTime": "2024-02-01T09:15:00",
        "updateTime": "2024-06-25T14:20:00",
        "createdBy": "admin",
        "updatedBy": "admin"
      }
    ],
    "total": 156,
    "size": 10,
    "current": 1,
    "pages": 16
  }
}
```

#### 响应字段说明

| 字段名 | 类型 | 描述 |
|-------|------|------|
| records | Array | 用户数据列表 |
| total | Long | 总记录数 |
| size | Long | 每页大小 |
| current | Long | 当前页码 |
| pages | Long | 总页数 |

#### 用户对象字段说明

| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | Long | 用户ID |
| username | String | 用户账号（登录标识，唯一） |
| nickname | String | 用户昵称/真实姓名 |
| mobile | String | 手机号（唯一，可选） |
| email | String | 邮箱地址（可选） |
| avatar | String | 头像URL（可选） |
| enabled | Integer | 状态：1=启用，0=禁用 |
| createTime | DateTime | 创建时间 |
| updateTime | DateTime | 更新时间 |
| createdBy | String | 创建人 |
| updatedBy | String | 更新人 |

---

### 2. 创建用户
- **接口**: `POST /auth/users`
- **描述**: 创建新用户，创建时默认启用状态。密码需要使用RSA公钥加密后传输。
- **权限要求**: `user:add` 或 `ROLE_ADMIN`

#### 请求体

```json
{
  "username": "newuser",
  "nickname": "新用户",
  "password": "RSA加密后的密码字符串",
  "mobile": "13900139002",
  "email": "newuser@example.com",
  "avatar": "https://cdn.example.com/avatars/newuser.jpg"
}
```

#### 请求字段说明

| 字段名 | 类型 | 必填 | 约束 | 描述 |
|-------|------|------|------|------|
| username | String | 是 | 长度≤64，唯一 | 用户账号（登录标识） |
| nickname | String | 是 | 长度≤64 | 用户昵称/真实姓名 |
| password | String | 是 | RSA加密 | 密码（RSA加密后传输） |
| mobile | String | 否 | 长度≤20，唯一 | 手机号 |
| email | String | 否 | 长度≤128 | 邮箱地址 |
| avatar | String | 否 | 长度≤255 | 头像URL |

#### 请求示例
```bash
POST /auth/users
Content-Type: application/json

{
  "username": "newuser",
  "nickname": "李四",
  "password": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...",
  "mobile": "13900139002",
  "email": "lisi@example.com"
}
```

#### 响应示例（成功）
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 3,
    "username": "newuser",
    "nickname": "李四",
    "mobile": "13900139002",
    "email": "lisi@example.com",
    "avatar": null,
    "enabled": 1,
    "createTime": "2024-06-30T10:00:00",
    "updateTime": "2024-06-30T10:00:00",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

#### 响应示例（失败）
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

### 3. 编辑用户
- **接口**: `PUT /auth/users/{id}`
- **描述**: 根据用户ID编辑用户信息。如果提供了新密码，则加密更新；否则保持原密码。
- **权限要求**: `user:edit` 或 `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| id | Long | 是 | 用户ID |

#### 请求体

```json
{
  "username": "updateduser",
  "nickname": "更新后的昵称",
  "password": "新密码（RSA加密，可选）",
  "mobile": "13900139003",
  "email": "updated@example.com",
  "avatar": "https://cdn.example.com/avatars/updated.jpg"
}
```

#### 请求示例
```bash
PUT /auth/users/3
Content-Type: application/json

{
  "username": "updateduser",
  "nickname": "李四（更新）",
  "mobile": "13900139003",
  "email": "lisi_updated@example.com"
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 3,
    "username": "updateduser",
    "nickname": "李四（更新）",
    "mobile": "13900139003",
    "email": "lisi_updated@example.com",
    "avatar": null,
    "enabled": 1,
    "createTime": "2024-06-30T10:00:00",
    "updateTime": "2024-06-30T11:30:00",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

---

### 4. 删除用户
- **接口**: `DELETE /auth/users/{id}`
- **描述**: 根据用户ID删除用户，同时删除用户和角色的绑定关系。
- **权限要求**: `user:delete` 或 `ROLE_ADMIN`
- **注意**: 删除操作不可恢复，请谨慎操作

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| id | Long | 是 | 用户ID |

#### 请求示例
```bash
DELETE /auth/users/3
```

#### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 5. 批量删除用户 ⭐
- **接口**: `DELETE /auth/users/batch`
- **描述**: 批量删除用户，同时删除用户和角色的绑定关系。
- **权限要求**: `user:delete` 或 `ROLE_ADMIN`
- **注意**: 批量删除不可恢复，请谨慎操作

#### 请求体

```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

#### 请求字段说明

| 字段名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| ids | Array[Long] | 是 | 用户ID列表 |

#### 请求示例
```bash
DELETE /auth/users/batch
Content-Type: application/json

{
  "ids": [4, 5, 6, 7, 8]
}
```

#### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 6. 根据ID查询用户
- **接口**: `GET /auth/users/{id}`
- **描述**: 根据用户ID查询用户详细信息。
- **权限要求**: `user:view` 或 `ROLE_ADMIN`

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| id | Long | 是 | 用户ID |

#### 请求示例
```bash
GET /auth/users/1
```

#### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "系统管理员",
    "mobile": "13800138000",
    "email": "admin@example.com",
    "avatar": "https://cdn.example.com/avatars/admin.jpg",
    "enabled": 1,
    "createTime": "2024-01-15T10:30:00",
    "updateTime": "2024-06-28T15:45:00",
    "createdBy": "system",
    "updatedBy": "admin"
  }
}
```

---

### 7. 更新用户状态
- **接口**: `PUT /auth/users/{id}/status`
- **描述**: 根据用户ID更新用户状态（启用/禁用）。
- **权限要求**: `user:status` 或 `ROLE_ADMIN`
- **注意**: 禁用用户后，该用户无法登录系统

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| id | Long | 是 | 用户ID |

#### 查询参数

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|-------|------|------|------|--------|
| enabled | Integer | 是 | 状态值：1=启用，0=禁用 | 1 |

#### 请求示例
```bash
# 启用用户
PUT /auth/users/1/status?enabled=1

# 禁用用户
PUT /auth/users/2/status?enabled=0
```

#### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 8. 批量更新用户状态 ⭐
- **接口**: `PUT /auth/users/batch/status`
- **描述**: 批量更新多个用户的状态，支持同时启用或禁用多个用户。
- **权限要求**: `user:status` 或 `ROLE_ADMIN`
- **特点**: 高效的批量操作，适用于用户状态管理场景

#### 请求体

```json
{
  "userIds": [1, 2, 3, 4, 5],
  "enabled": 1
}
```

#### 请求字段说明

| 字段名 | 类型 | 必填 | 约束 | 描述 |
|-------|------|------|------|------|
| userIds | Array[Long] | 是 | 不能为空 | 用户ID列表 |
| enabled | Integer | 是 | 不能为空 | 状态值：1=启用，0=禁用 |

#### 请求示例
```bash
# 批量启用用户
PUT /auth/users/batch/status
Content-Type: application/json

{
  "userIds": [1, 2, 3, 4, 5],
  "enabled": 1
}

# 批量禁用用户
PUT /auth/users/batch/status
Content-Type: application/json

{
  "userIds": [6, 7, 8, 9, 10],
  "enabled": 0
}
```

#### 响应示例（成功）
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

#### 响应示例（失败）
```json
{
  "code": 400,
  "message": "用户ID列表不能为空",
  "data": null
}
```

#### 业务场景
- **批量启用**: 用于激活新注册用户、恢复被禁用的用户账号
- **批量禁用**: 用于清理离职员工账号、临时冻结可疑账号
- **状态管理**: 在用户维护窗口中提供快速状态切换功能

---

## 通用响应说明

### 成功响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": { /* 具体数据 */ }
}
```

### 错误响应格式
```json
{
  "code": 400,
  "message": "错误描述信息",
  "data": null
}
```

### HTTP状态码说明

| 状态码 | 描述 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 业务错误码说明

| 错误码 | 描述 | 解决方案 |
|-------|------|----------|
| BAD_REQUEST | 请求参数错误 | 检查请求参数格式和内容 |
| ACCOUNT_DISABLED | 账户已被禁用 | 联系管理员启用账户 |
| USER_NOT_FOUND | 用户不存在 | 检查用户ID是否正确 |

---

## 使用注意事项

### 密码安全
1. **密码加密**: 创建和编辑用户时，密码必须使用RSA公钥加密后传输
2. **密码存储**: 系统使用BCrypt算法加密存储密码，数据库中不存储明文密码
3. **密码更新**: 编辑用户时，如不提供密码字段，则保持原密码不变

### 删除操作
1. **级联删除**: 删除用户时会自动删除用户与角色的绑定关系
2. **不可恢复**: 删除操作会从数据库中永久删除用户数据
3. **权限检查**: 执行删除操作前建议先进行权限确认

### 批量操作
1. **批量删除**: 支持一次删除多个用户，提高操作效率
2. **批量状态更新**: 支持批量启用/禁用用户，适用于用户维护场景
3. **操作限制**: 建议单次批量操作数量不超过100个

### 分页查询
1. **分页参数**: 必须提供 current（当前页码）和 size（每页大小）参数
2. **关键词搜索**: keyword参数支持用户名和手机号的模糊查询
3. **排序规则**: 默认按创建时间倒序排列（最新的在前）

### 状态管理
1. **默认状态**: 新创建的用户默认为启用状态（enabled=1）
2. **禁用影响**: 被禁用的用户无法登录系统
3. **状态验证**: 登录时会验证用户状态，禁用用户无法通过认证

---

## 前端集成示例

### JavaScript/TypeScript 示例

```typescript
// 定义用户API客户端
class UserApi {
  private baseUrl = '/auth/users';

  // 分页查询用户
  async pageUsers(current: number, size: number, keyword?: string) {
    const params = new URLSearchParams({
      current: current.toString(),
      size: size.toString()
    });
    if (keyword) params.append('keyword', keyword);
    
    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  // 创建用户
  async createUser(user: any) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    return response.json();
  }

  // 批量更新用户状态
  async batchUpdateStatus(userIds: number[], enabled: number) {
    const response = await fetch(`${this.baseUrl}/batch/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userIds, enabled })
    });
    return response.json();
  }

  // 批量删除用户
  async batchDelete(ids: number[]) {
    const response = await fetch(`${this.baseUrl}/batch`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    });
    return response.json();
  }
}

// 使用示例
const userApi = new UserApi();

// 分页查询
const users = await userApi.pageUsers(1, 10, 'admin');
console.log(users.data);

// 批量启用用户
await userApi.batchUpdateStatus([1, 2, 3], 1);

// 批量禁用用户
await userApi.batchUpdateStatus([4, 5, 6], 0);
```

### Vue 3 Composition API 示例

```vue
<template>
  <div>
    <!-- 用户列表表格 -->
    <el-table :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="mobile" label="手机号" />
      <el-table-column prop="enabled" label="状态">
        <template #default="{ row }">
          <el-switch 
            v-model="row.enabled" 
            :active-value="1" 
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量操作按钮 -->
    <div class="batch-actions">
      <el-button 
        type="success" 
        :disabled="selectedUsers.length === 0"
        @click="batchEnableUsers"
      >
        批量启用
      </el-button>
      <el-button 
        type="warning" 
        :disabled="selectedUsers.length === 0"
        @click="batchDisableUsers"
      >
        批量禁用
      </el-button>
      <el-button 
        type="danger" 
        :disabled="selectedUsers.length === 0"
        @click="batchDeleteUsers"
      >
        批量删除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const userList = ref([]);
const selectedUsers = ref([]);

// 加载用户列表
const loadUsers = async () => {
  const response = await fetch('/auth/users?current=1&size=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  userList.value = data.data.records;
};

// 选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection;
};

// 批量启用用户
const batchEnableUsers = async () => {
  const userIds = selectedUsers.value.map(user => user.id);
  const response = await fetch('/auth/users/batch/status', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userIds, enabled: 1 })
  });
  
  if (response.ok) {
    ElMessage.success('批量启用成功');
    loadUsers();
  }
};

// 批量禁用用户
const batchDisableUsers = async () => {
  const userIds = selectedUsers.value.map(user => user.id);
  const response = await fetch('/auth/users/batch/status', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userIds, enabled: 0 })
  });
  
  if (response.ok) {
    ElMessage.success('批量禁用成功');
    loadUsers();
  }
};

// 批量删除用户
const batchDeleteUsers = async () => {
  const userIds = selectedUsers.value.map(user => user.id);
  const response = await fetch('/auth/users/batch', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ids: userIds })
  });
  
  if (response.ok) {
    ElMessage.success('批量删除成功');
    loadUsers();
  }
};

onMounted(() => {
  loadUsers();
});
</script>
```

---

## 测试用例

### Postman 测试集合

```json
{
  "info": {
    "name": "UserController API 测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "分页查询用户",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/auth/users?current=1&size=10",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "users"],
          "query": [
            {"key": "current", "value": "1"},
            {"key": "size", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "创建用户",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"nickname\": \"测试用户\",\n  \"password\": \"encrypted_password\",\n  \"mobile\": \"13900139999\",\n  \"email\": \"test@example.com\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/users",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "users"]
        }
      }
    },
    {
      "name": "批量更新用户状态",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userIds\": [1, 2, 3],\n  \"enabled\": 1\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/users/batch/status",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "users", "batch", "status"]
        }
      }
    },
    {
      "name": "批量删除用户",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"ids\": [4, 5, 6]\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/users/batch",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "users", "batch"]
        }
      }
    }
  ]
}
```

---

## 附录

### 相关文档
- [RoleController API 文档](./RoleController_API_Documentation.md)
- [PermissionController API 文档](./PermissionController_API_Documentation.md)
- [认证服务技术规范](./Authentication_Service_Specification.md)

### 更新日志

#### v1.0.0 (2024-06-30)
- 初始版本发布
- 支持用户的基本CRUD操作
- 支持批量删除和批量状态更新功能
- 提供完整的API文档和使用示例

---

*文档生成时间: 2024-06-30*
*文档维护者: CloudProject Team*