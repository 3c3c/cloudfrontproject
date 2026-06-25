# Cloud Auth 认证服务 API 文档

## 基础信息
- **服务名称**: cloud-auth
- **基础路径**: `/auth`
- **端口**: 8081
- **内容类型**: application/json
- **字符编码**: UTF-8

---

## 认证接口

### 1. 用户登录
**接口描述**: 用户名密码登录

**请求信息**:
- **接口路径**: `POST /auth/login`
- **请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "username": "string (用户名)",
  "password": "string (密码)"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "string (JWT令牌)",
    "tokenHead": "string (令牌前缀，如 Bearer )",
    "userId": 1234567890123456789,
    "username": "string (用户名)",
    "avatar": "string (头像URL)",
    "authorities": ["string (权限列表)"],
    "mustChangePassword": false
  }
}
```

---

### 2. 用户注册
**接口描述**: 新用户注册

**请求信息**:
- **接口路径**: `POST /auth/register`
- **请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "username": "string (用户名)",
  "nickname": "string (昵称)",
  "password": "string (密码)",
  "mobile": "string (手机号)",
  "email": "string (邮箱)",
  "avatar": "string (头像URL，可选)"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| username | String | 是 | 用户名（必须唯一） |
| nickname | String | 是 | 昵称 |
| password | String | 是 | 密码（6-20位） |
| mobile | String | 否 | 手机号 |
| email | String | 否 | 邮箱 |
| avatar | String | 否 | 头像URL |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": 1234567890123456789
}
```

---

### 3. 用户登出
**接口描述**: 用户退出登录

**请求信息**:
- **接口路径**: `POST /auth/logout`
- **请求头**: 
  - `Authorization: Bearer {token}` (必需)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 4. 刷新令牌
**接口描述**: 刷新访问令牌

**请求信息**:
- **接口路径**: `POST /auth/refresh`
- **请求头**: 
  - `Authorization: Bearer {token}` (必需)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "string (新的JWT令牌)",
    "tokenHead": "string (令牌前缀)",
    "userId": 1234567890123456789,
    "username": "string (用户名)",
    "avatar": "string (头像URL)",
    "authorities": ["string (权限列表)"],
    "mustChangePassword": false
  }
}
```

---

## 短信验证码登录（通过MobileAuthenticationFilter处理）
**接口描述**: 手机号验证码登录

**请求信息**:
- **接口路径**: `POST /auth/sms/login`
- **请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "mobile": "string (手机号)",
  "code": "string (验证码)",
  "client_id": "string (客户端ID)",
  "client_secret": "string (客户端密钥)"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "string (JWT令牌)",
    "tokenHead": "string (令牌前缀)",
    "userId": 1234567890123456789,
    "username": "string (用户名)",
    "avatar": "string (头像URL)",
    "authorities": ["string (权限列表)"],
    "mustChangePassword": false
  }
}
```

---

### 5. 发送验证码
**接口描述**: 发送短信验证码

**请求信息**:
- **接口路径**: `POST /auth/sms/send`
- **请求头**: `Content-Type: application/json`

**请求参数**:
```json
{
  "mobile": "string (手机号)"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 用户管理接口

> **认证要求**: 以下所有接口都需要在请求头中携带有效的JWT令牌
> `Authorization: Bearer {token}`

### 6. 分页查询用户列表
**接口描述**: 根据用户名称或账号，分页查询用户列表

**请求信息**:
- **接口路径**: `GET /users`
- **请求头**: `Authorization: Bearer {token}`

**请求参数**:
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| ------ | ---- | ---- | ------ | ---- |
| current | Integer | 否 | 1 | 当前页码 |
| size | Integer | 否 | 10 | 每页大小 |
| keyword | String | 否 | - | 用户名或手机号（模糊搜索） |

**请求示例**:
```
GET /users?current=1&size=10&keyword=admin
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1234567890123456789,
        "username": "admin",
        "nickname": "管理员",
        "mobile": "13800138000",
        "email": "admin@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "enabled": 1,
        "mustChangePassword": false,
        "createTime": "2024-01-01T10:00:00",
        "updateTime": "2024-01-01T10:00:00",
        "createdBy": "system",
        "updatedBy": "admin"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

**UserResponse 参数说明**:
| 参数名 | 类型 | 说明 |
| ------ | ---- | ---- |
| id | Long | 用户ID |
| username | String | 用户名 |
| nickname | String | 昵称 |
| mobile | String | 手机号 |
| email | String | 邮箱 |
| avatar | String | 头像URL |
| enabled | Integer | 状态（1启用 0禁用） |
| mustChangePassword | Boolean | 是否必须修改密码 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |
| createdBy | String | 创建人 |
| updatedBy | String | 更新人 |

---

### 7. 创建用户
**接口描述**: 创建新用户

**请求信息**:
- **接口路径**: `POST /users`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "username": "string (用户名)",
  "nickname": "string (昵称)",
  "password": "string (密码)",
  "mobile": "string (手机号)",
  "email": "string (邮箱)",
  "avatar": "string (头像URL)",
  "enabled": 1,
  "mustChangePassword": false
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 验证规则 | 说明 |
| ------ | ---- | ---- | -------- | ---- |
| username | String | 是 | 最大50字符 | 用户名 |
| nickname | String | 否 | 最大50字符 | 昵称 |
| password | String | 是 | 6-20字符 | 密码 |
| mobile | String | 否 | 最大20字符 | 手机号 |
| email | String | 否 | 最大100字符 | 邮箱 |
| avatar | String | 否 | 最大200字符 | 头像URL |
| enabled | Integer | 否 | - | 状态（1启用 0禁用） |
| mustChangePassword | Boolean | 否 | - | 是否必须修改密码 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1234567890123456789,
    "username": "newuser",
    "nickname": "新用户",
    "mobile": "13800138000",
    "email": "newuser@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "enabled": 1,
    "mustChangePassword": false,
    "createTime": "2024-01-01T10:00:00",
    "updateTime": "2024-01-01T10:00:00",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

---

### 8. 更新用户
**接口描述**: 更新指定用户的信息

**请求信息**:
- **接口路径**: `PUT /users/{id}`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 用户ID |

**请求参数**: 同创建用户

**请求示例**:
```
PUT /users/1234567890123456789
```

**响应示例**: 同创建用户

---

### 9. 删除用户
**接口描述**: 删除指定用户

**请求信息**:
- **接口路径**: `DELETE /users/{id}`
- **请求头**: `Authorization: Bearer {token}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 用户ID |

**请求示例**:
```
DELETE /users/1234567890123456789
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 10. 批量删除用户
**接口描述**: 批量删除多个用户

**请求信息**:
- **接口路径**: `DELETE /users/batch`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`

**请求参数**:
```json
[1234567890123456789, 1234567890123456790, 1234567890123456791]
```

**参数说明**: 用户ID列表（Long数组）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 11. 根据ID查询用户
**接口描述**: 根据用户ID查询用户详情

**请求信息**:
- **接口路径**: `GET /users/{id}`
- **请求头**: `Authorization: Bearer {token}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 用户ID |

**请求示例**:
```
GET /users/1234567890123456789
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1234567890123456789,
    "username": "admin",
    "nickname": "管理员",
    "mobile": "13800138000",
    "email": "admin@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "enabled": 1,
    "mustChangePassword": false,
    "createTime": "2024-01-01T10:00:00",
    "updateTime": "2024-01-01T10:00:00",
    "createdBy": "system",
    "updatedBy": "admin"
  }
}
```

---

### 12. 更新用户状态
**接口描述**: 更新指定用户的启用/禁用状态

**请求信息**:
- **接口路径**: `PUT /users/{id}/status`
- **请求头**: `Authorization: Bearer {token}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| id | Long | 是 | 用户ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |
| enabled | Integer | 是 | 状态值（1启用 0禁用） |

**请求示例**:
```
PUT /users/1234567890123456789/status?enabled=1
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 错误码说明
| 错误码 | 说明 |
| ------ | ---- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

## 注意事项

1. **认证要求**: 所有用户管理接口都需要在请求头中携带有效的JWT令牌
2. **时间格式**: 所有时间字段使用 ISO 8601 格式（如：`2024-01-01T10:00:00`）
3. **分页参数**: 分页接口的 `current` 从 1 开始计数
4. **状态值**: `enabled` 字段使用整数类型：`1` 表示启用，`0` 表示禁用
5. **令牌格式**: 使用 `Bearer` 令牌认证，格式为 `Authorization: Bearer {token}`
6. **验证规则**: 所有必填字段未通过验证时会返回 400 错误，`message` 字段包含具体的验证错误信息
7. **雪花ID**: 所有ID字段使用雪花算法生成的Long类型整数

---
