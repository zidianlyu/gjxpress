# GJXpress - 广骏供应链物流系统

[![Backend](https://img.shields.io/badge/Backend-NestJS%20%2B%20Prisma-blue)](./backend)
[![Admin UI](https://img.shields.io/badge/Admin%20UI-React%20%2B%20Ant%20Design-orange)](./admin)
[![Mini Program](https://img.shields.io/badge/Mini%20Program-WeChat%20Native-brightgreen)](./miniprogram)

## 项目简介

GJXpress 是一个跨境物流管理系统，包含三个主要组件：

- **Backend** - NestJS + Prisma + PostgreSQL REST API
- **Admin UI** - React + Ant Design 管理员后台
- **Mini Program** - 微信原生小程序用户端

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接和微信参数

# 运行数据库迁移
npm run prisma:migrate

# 生成测试数据
npm run prisma:seed

# 启动开发服务器
npm run start:dev
```

后端服务将在 http://localhost:3000 启动，API 文档可在 http://localhost:3000/api 查看。

### 2. 启动 Admin UI

```bash
cd admin

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 设置 VITE_API_URL=http://localhost:3000

# 启动开发服务器
npm run dev
```

Admin UI 将在 http://localhost:5173 启动。

### 3. 打开微信小程序

1. 打开 **微信开发者工具**
2. 点击「导入项目」
3. 选择 `/miniprogram` 目录
4. 在「详情」中勾选「不校验合法域名」
5. 点击「编译」

小程序将在模拟器中运行。

## 测试数据

运行 seed 脚本后会创建以下测试数据：

- **测试用户**: 用户代码 `8888`
- **测试订单**:
  - 订单 1: 待用户确认 (已入库包裹，等待用户确认)
  - 订单 2: 待支付 (已确认，等待支付)
  - 订单 3: 已发货 (已支付并发出)
  - 订单 4: 有异常待处理

小程序开发测试登录时直接使用「开发测试登录」按钮即可登录测试用户。

## 业务流程测试

### 完整业务链路

```
1. 管理员创建订单/入库包裹
   → 访问 Admin UI 登录页
   → 点击「开发登录」
   → 进入「包裹入库」页
   → 填写测试用户 ID 和包裹信息
   → 提交入库

2. 用户小程序查看入库照片
   → 打开小程序「开发测试登录」
   → 进入「我的订单」
   → 点击订单查看详情
   → 查看包裹照片

3. 用户确认或提交异常
   → 在订单详情页查看待确认包裹
   → 点击「确认无误」或「有问题」
   → 提交后查看状态更新

4. 管理员处理支付状态
   → 返回 Admin UI
   → 进入「订单详情」
   → 修改支付状态为「已支付」

5. 管理员发货
   → 在订单详情页点击「标记发货」
   → 填写物流商和追踪号
   → 提交后订单状态变为「已发货」

6. 用户查看物流状态
   → 小程序刷新订单详情
   → 查看物流信息和追踪号
```

## 项目结构

```
gjxpress/
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── auth/              # 微信登录
│   │   ├── user/              # 用户管理
│   │   ├── order/             # 订单管理
│   │   ├── package/           # 包裹管理
│   │   ├── payment/           # 支付状态
│   │   ├── shipment/          # 发货管理
│   │   ├── image/             # 图片管理
│   │   ├── exception/         # 异常处理
│   │   └── adminlog/          # 操作日志
│   └── prisma/
│       ├── schema.prisma      # 数据库模型
│       └── seed.ts            # 测试数据
├── admin/                     # React 管理后台
│   └── src/
│       ├── pages/             # 页面组件
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── OrderListPage.tsx
│       │   ├── InboundPage.tsx
│       │   └── OrderDetailPage.tsx
│       └── api/               # API 客户端
└── miniprogram/               # 微信小程序
    ├── pages/                 # 小程序页面
    │   ├── index/             # 首页
    │   ├── orders/            # 订单列表
    │   ├── order-detail/      # 订单详情
    │   ├── address/           # 仓库地址
    │   ├── profile/           # 我的页面
    │   └── login/             # 登录页
    └── utils/                 # API 封装
        └── api.js
```

## API 接口文档

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/auth/login` | 微信小程序登录 |

### 用户相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/user/profile` | 获取当前用户信息 |

### 订单相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/orders` | 获取当前用户订单列表 |
| GET | `/orders/:id` | 获取订单详情 |

### 包裹相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/packages/inbound` | [Admin] 包裹入库 |
| GET | `/packages/:id` | 获取包裹详情 |
| POST | `/packages/:id/confirm` | 用户确认包裹 |

### 异常相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/packages/:id/exceptions` | 用户提交异常 |
| GET | `/packages/:id/exceptions` | 获取包裹异常列表 |

### 图片相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/packages/:id/images/request-upload-url` | [Admin] 获取上传 URL |
| POST | `/packages/:id/images/confirm-upload` | [Admin] 确认上传 |
| POST | `/packages/:id/images` | [Admin] 批量添加图片 |
| GET | `/packages/:id/images` | 获取包裹图片列表 |

### 支付相关

| 方法 | 路径 | 描述 |
|------|------|------|
| PATCH | `/orders/:id/payment/status` | [Admin] 更新支付状态 |

### 发货相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/shipments/:orderId?force=true` | [Admin] 创建发货信息 |
| GET | `/shipments/:orderId` | 获取发货信息 |

### 地址相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/address/warehouse` | 获取仓库地址 |

### 操作日志

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/admin-logs` | [Admin] 查看操作日志 |

## 状态流转

### 订单状态

```
UNINBOUND → INBOUNDED → USER_CONFIRM_PENDING → REVIEW_PENDING
                                                ↓
                                        PAYMENT_PENDING → PAID → READY_TO_SHIP → SHIPPED → COMPLETED
```

### 包裹状态

```
PENDING → INBOUNDED → CONFIRMED/EXCEPTION
```

### 支付状态

```
UNPAID → PROCESSING → PAID
```

## 状态流保护规则

1. **发货前必须已支付** - 默认情况下，未支付订单不能发货
   - 管理员可通过 `force=true` 参数强制发货（记录操作日志）

2. **用户只能确认自己的包裹** - 后端验证包裹归属

3. **订单归属验证** - 用户只能查看自己的订单

## Admin 操作日志

以下操作会自动记录到 AdminLog：

- 修改订单状态
- 修改支付状态
- 强制发货
- 处理异常
- 创建发货信息

日志可通过 `/admin-logs` API 查询。

## 图片上传流程

当前使用 mock 图片 URL。完整 COS 集成预留：

1. **获取上传 URL** - `POST /packages/:id/images/request-upload-url`
2. **上传文件** - 客户端直接上传到 COS
3. **确认上传** - `POST /packages/:id/images/confirm-upload`

## 环境变量

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gjxpress"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# WeChat Mini Program
WX_APPID="your-wx-appid"
WX_SECRET="your-wx-secret"
WX_CODE2SESSION_URL="https://api.weixin.qq.com/sns/jscode2session"

# Server
PORT=3000
```

### Admin UI (.env.local)

```env
VITE_API_URL=http://localhost:3000
```

## 开发命令

```bash
# Backend
cd backend
npm run start:dev        # 启动开发服务器
npm run prisma:migrate   # 运行数据库迁移
npm run prisma:seed      # 生成测试数据
npm run prisma:studio    # 打开 Prisma Studio

# Admin UI
cd admin
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本

# 小程序
# 使用微信开发者工具打开 miniprogram 目录
```

## 技术栈

- **Backend**: NestJS, Prisma, PostgreSQL, JWT, Swagger
- **Admin UI**: React, Ant Design, Vite, Axios
- **Mini Program**: WeChat Native, wx.request

## 许可证

MIT
