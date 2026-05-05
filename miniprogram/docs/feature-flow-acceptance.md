# GJXpress 微信小程序功能链路与验收文档

> **文档版本**: v1.0.0  
> **创建日期**: 2026-05-04  
> **维护者**: Windsurf / 开发团队  
> **适用范围**: miniprogram/ 目录下所有功能、页面、API、状态、文案

---

## 1. 文档目的与维护规则

### 1.1 文档目的

本文档用于记录小程序所有 feature、页面、用户链路、API 依赖、状态流转、异常链路和验收用例。作为以下场景的 **single source of truth**：

- 功能验收测试
- 微信审核前检查
- 回归测试参考
- 需求变更影响评估
- 新成员 onboarding

### 1.2 必须同步更新本文档的情况

任何涉及以下内容的变更，都必须同步更新本文档：

- 新增 / 删除 / 重命名页面
- 修改 `app.json` 页面配置或 tabBar
- 修改用户登录流程
- 修改首页入口
- 修改仓库地址展示或复制逻辑
- 修改订单列表 tab 或筛选逻辑
- 修改订单详情字段、按钮、状态展示
- 修改包裹确认逻辑
- 修改异常反馈逻辑
- 修改客服入口
- 修改隐私政策或授权文案
- 修改任何 miniprogram 调用的 backend API
- 修改 `request.js`、token、Authorization header、错误处理逻辑
- 修改微信审核敏感文案
- 新增任何用户输入表单
- 新增图片上传、预览、下载、删除逻辑
- 新增支付、支付状态、费用展示相关逻辑
- 新增订阅消息、客服消息、通知授权相关逻辑

### 1.3 无需更新本文档的情况

以下纯代码优化、不影响功能链路的变更，可在开发总结中明确说明"**本次无 feature-flow 文档更新需求**"：

- UI 样式调整（颜色、间距、字体大小）
- 代码重构（提取函数、重命名变量、优化算法）
- 性能优化（减少重渲染、缓存策略）
- 注释完善
- 错误日志格式调整

---

## 2. 当前小程序边界

### 2.1 明确边界

| 边界项 | 说明 |
|--------|------|
| **用户端定位** | 小程序是用户端，不是 Admin 后台 |
| **后端调用** | 小程序只通过 `https://api.gjxpress.net/api` 调用 backend API |
| **不直连 Supabase** | 小程序不直接调用 Supabase，所有数据通过 backend 中转 |
| **不持有 AppSecret** | AppSecret 只保存在后端 EC2 环境变量 |
| **不做微信支付** | 小程序内无微信支付功能 |
| **不提供立即支付按钮** | 仅展示支付状态，支付行为由用户与客服线下完成 |
| **不做身份证认证** | 不采集身份证、银行卡、手机号、通讯录、人脸、精准定位等敏感信息 |
| **核心功能** | 展示仓库地址、订单、包裹、照片、状态、异常反馈、客服与隐私政策 |
| **支付状态展示** | 仅作为信息展示，实际状态由后台管理员维护 |

### 2.2 数据流向

```
用户操作 → 小程序页面 → miniprogram/services/*.service.js
    → utils/request.js (加 JWT)
    → https://api.gjxpress.net/api/*
    → NestJS backend
    → Supabase Postgres / Storage
```

### 2.3 安全边界

- ✅ 小程序代码中不出现 `SUPABASE_ANON_KEY`
- ✅ 小程序代码中不出现 `WECHAT_APP_SECRET`
- ✅ 小程序代码中不出现 `JWT_SECRET`
- ✅ 小程序不直接访问 Supabase Storage URL
- ✅ 图片通过 `api.gjxpress.net` 代理访问

---

## 3. 页面清单

### 3.1 页面配置一致性检查

| 页面 ID | 页面路径 | app.json 配置 | 代码存在 | 一致性 |
|---------|----------|---------------|----------|--------|
| HOME | `pages/home/index` | ✅ | ✅ | ✅ 一致 |
| ADDRESS | `pages/address/index` | ✅ | ✅ | ✅ 一致 |
| ORDER_LIST | `pages/orders/list/index` | ✅ | ✅ | ✅ 一致 |
| ORDER_DETAIL | `pages/orders/detail/index` | ✅ | ✅ | ✅ 一致 |
| PROFILE | `pages/profile/index` | ✅ | ✅ | ✅ 一致 |
| PRIVACY | `pages/privacy/index` | ✅ | ✅ | ✅ 一致 |
| CUSTOMER_SERVICE | `pages/customer-service/index` | ✅ | ✅ | ✅ 一致 |

**风险**: 无。所有配置页面均有对应代码文件。

### 3.2 页面详细信息

| 页面 ID | 页面路径 | 页面名称 | 是否入口页 | 主要功能 | 主要 API | 主要状态 | 备注 |
|---------|----------|----------|------------|----------|----------|----------|------|
| HOME | `pages/home/index` | 首页 | ✅ TabBar | 品牌展示、入口导航、订单统计 | `GET /orders` | `loading`, `error`, `stats`, `user` | 自动登录，展示待确认/待支付/已发货/异常数量 |
| ADDRESS | `pages/address/index` | 地址 | ✅ TabBar | 展示国内仓地址、一键复制 | `GET /warehouse-address` | `loading`, `error`, `copied`, `address` | API 失败时使用默认地址 |
| ORDER_LIST | `pages/orders/list/index` | 订单列表 | ✅ TabBar | 订单列表、tab 筛选、分页加载 | `GET /orders` | `loading`, `error`, `hasMore`, `orders[]` | 5 个 tabs: 全部/待确认/待支付/已发货/异常 |
| ORDER_DETAIL | `pages/orders/detail/index` | 订单详情 | ❌ | 订单详情、包裹列表、费用、物流 | `GET /orders/:id` | `loading`, `error`, `order`, `showIssueModal` | 包含包裹确认/异常反馈功能 |
| PROFILE | `pages/profile/index` | 我的 | ✅ TabBar | 用户信息、功能入口、退出登录 | 无直接 API | `user`, `version` | 导航到其他页面 |
| PRIVACY | `pages/privacy/index` | 隐私政策 | ❌ | 隐私政策展示 | 无 | `privacyContent[]` | 本地静态内容 |
| CUSTOMER_SERVICE | `pages/customer-service/index` | 客服中心 | ❌ | 客服信息、FAQ | 无 | `serviceInfo`, `faqs[]` | 可复制客服微信号 |

### 3.3 TabBar 配置

```json
{
  "list": [
    { "pagePath": "pages/home/index", "text": "首页" },
    { "pagePath": "pages/address/index", "text": "地址" },
    { "pagePath": "pages/orders/list/index", "text": "订单" },
    { "pagePath": "pages/profile/index", "text": "我的" }
  ]
}
```

---

## 4. 全局能力清单

### 4.1 登录与鉴权

| 能力项 | 实现细节 |
|--------|----------|
| **首次打开自动登录** | ✅ 是。`home/index.js` `onLoad` 调用 `authService.ensureLogin()` |
| **wx.login 调用位置** | `utils/auth.js` → `wxLoginCode()` 函数 |
| **后端登录 API** | `POST /auth/wechat-login` |
| **accessToken 存储 key** | `accessToken` (localStorage) |
| **currentUser 存储 key** | `currentUser` (localStorage) |
| **Authorization Header** | ✅ 由 `request.js` 统一添加 `Authorization: Bearer ${token}` |
| **token 缺失处理** | `ensureLogin()` 自动触发登录流程 |
| **token 过期/401 处理** | `request.js` 自动清除 token，重新 `wx.login`，重试一次 |
| **登录失败用户提示** | `wx.showToast({ title: '登录失败，请重试', icon: 'none' })` |

**登录流程时序**:
```
页面 onLoad/onShow
  → authService.ensureLogin()
    → 检查 localStorage token
    → 无 token: wx.login() 获取 code
    → POST /auth/wechat-login (code)
    → 后端返回 { accessToken, user }
    → 保存到 localStorage
    → 更新 getApp().globalData
    → 返回登录成功
```

### 4.2 API 请求封装

| 配置项 | 值 |
|--------|-----|
| **API_BASE_URL** | `https://api.gjxpress.net/api` (config/index.js) |
| **生产环境** | ✅ `https://api.gjxpress.net/api` |
| **开发环境** | `http://localhost:3000/api` (ENV=dev 时) |
| **硬编码 URL** | ❌ 无。所有请求通过 `${API_BASE_URL}${url}` 拼接 |
| **统一处理** | ✅ request.js 统一处理 loading、error、token、response |
| **401 自动重试** | ✅ 收到 401 时清除 token，重新登录，重试原请求 |
| **超时设置** | 10s (wx.request timeout) + 15s (failsafe abort) |

### 4.3 API 调用点清单

| API 路径 | Method | 调用文件 | 调用函数 | 用途 |
|----------|--------|----------|----------|------|
| `/auth/wechat-login` | POST | `utils/auth.js` | `login()` | 微信登录 |
| `/user/me` | GET | `utils/auth.js` | `getUserProfile()` | 获取用户信息 |
| `/warehouse-address` | GET | `services/address.service.js` | `getWarehouseAddress()` | 获取仓库地址 |
| `/orders` | GET | `services/order.service.js` | `getOrders()` | 获取订单列表 |
| `/orders/:id` | GET | `services/order.service.js` | `getOrderById()` | 获取订单详情 |
| `/orders/:id/shipment` | GET | `services/order.service.js` | `getOrderShipment()` | 获取物流信息 |
| `/packages/:id/confirm` | POST | `services/package.service.js` | `confirmPackage()` | 确认包裹 |
| `/packages/:id/issue` | POST | `services/package.service.js` | `reportPackageIssue()` | 提交异常 |
| `wx.requestSubscribeMessage` | - | `services/notification.service.js` | `requestSubscribe()` | 订阅消息 |

### 4.4 状态展示

#### 订单状态 (utils/status.js)

| 状态值 | 中文展示 | 类型颜色 | 出现页面 |
|--------|----------|----------|----------|
| `UNINBOUND` | 未入库 | normal | 订单列表、详情 |
| `INBOUNDED` | 已入库 | normal | 订单列表、详情 |
| `USER_CONFIRM_PENDING` | 待用户确认 | warning | 订单列表、详情 |
| `REVIEW_PENDING` | 待审核 | warning | 订单列表、详情 |
| `PAYMENT_PENDING` | 待支付 | warning | 订单列表、详情 |
| `PAID` | 已支付 | success | 订单列表、详情 |
| `READY_TO_SHIP` | 待发货 | success | 订单列表、详情 |
| `SHIPPED` | 已发货 | primary | 订单列表、详情 |
| `COMPLETED` | 已完成 | success | 订单列表、详情 |
| `EXCEPTION` | 异常处理中 | danger | 订单列表、详情 |

#### 支付状态

| 状态值 | 中文展示 | 类型颜色 |
|--------|----------|----------|
| `UNPAID` | 未支付 | warning |
| `PROCESSING` | 支付处理中 | warning |
| `PAID` | 已支付 | success |

#### 包裹状态

| 状态值 | 中文展示 | 类型颜色 |
|--------|----------|----------|
| `CREATED` | 已创建 | normal |
| `INBOUNDED` | 已入库 | normal |
| `USER_CONFIRM_PENDING` | 待用户确认 | warning |
| `CONFIRMED` | 已确认 | success |
| `EXCEPTION` | 异常处理中 | danger |
| `CONSOLIDATED` | 已合单 | success |
| `SHIPPED` | 已发货 | primary |

#### 其他状态

| 状态类型 | 说明 |
|----------|------|
| 空状态 | `暂无订单`，提供复制仓库地址按钮 |
| 加载状态 | `加载中...` 转圈动画 |
| 错误状态 | `error-state` 组件，显示错误信息 + 重试按钮 |
| 复制成功 | `已复制` Toast 提示 |

### 4.5 图片相关

| 能力 | 实现 |
|------|------|
| **包裹照片展示** | `package-card` 组件展示缩略图 |
| **面单照片展示** | `package-card` 组件，标签显示"面单" |
| **异常图片** | 当前版本异常反馈仅文字描述，无图片上传 |
| **图片预览** | 点击照片调用 `wx.previewImage()` |
| **图片加载失败** | 显示占位图和"图片加载失败"文字 |
| **图片上传** | ❌ 当前版本不支持用户上传图片 |
| **图片 URL 来源** | 后端返回 `https://api.gjxpress.net/files/{imageId}` |
| **直连 Supabase** | ❌ 无。所有图片通过 backend 代理 |

### 4.6 微信审核相关能力

| 检查项 | 状态 |
|--------|------|
| 敏感词检查 | ✅ 已通过审核。无代购、清关、包税等词 |
| 支付引导检查 | ✅ 无立即支付、微信支付、转账、收款码等词 |
| localhost 检查 | ✅ 生产环境使用 `https://api.gjxpress.net/api` |
| debug 信息检查 | ✅ 无 console.log 敏感信息 |
| 合法域名配置 | ✅ 应配置 `https://api.gjxpress.net` |

---

## 5. 用户角色与测试账号假设

### 5.1 测试角色矩阵

| 测试角色 | 数据状态 | 用途 |
|----------|----------|------|
| 新用户 | 无订单 | 测试空状态、复制仓库地址、隐私政策、客服 |
| 普通用户-待确认 | 有 1+ 待确认包裹 | 测试订单详情、包裹照片、确认包裹按钮 |
| 普通用户-待支付 | 有 1+ 待支付订单 | 测试支付状态展示，验证不出现立即支付按钮 |
| 普通用户-已发货 | 有 1+ 已发货订单 | 测试物流状态展示、运单号复制 |
| 普通用户-异常 | 有 1+ 异常订单 | 测试异常 tab、异常详情、异常反馈功能 |
| 登录失败用户 | wx.login 或 backend 失败 | 测试错误提示、重试机制 |
| token 失效用户 | 401 响应 | 测试自动重新登录流程 |

---

## 6. 完整用户链路

### FLOW-AUTH-001: 首次打开小程序并登录

| 项目 | 内容 |
|------|------|
| **入口** | 小程序启动 |
| **前置条件** | 用户首次打开，localStorage 无 token |
| **操作步骤** | 1. 小程序启动 → 2. `onLaunch` 检查 token → 3. 无 token，首页 `onLoad` 调用 `ensureLogin()` → 4. `wx.login()` 获取 code → 5. `POST /auth/wechat-login` → 6. 后端返回 JWT + user → 7. 保存 token，更新全局数据 → 8. 加载首页数据 |
| **涉及页面** | `pages/home/index` |
| **涉及 API** | `POST /auth/wechat-login`, `GET /orders` |
| **成功结果** | 首页展示用户信息和订单统计 |
| **失败状态** | 显示"登录失败，请重试"Toast，提供重试按钮 |
| **验收重点** | 登录成功后能正常加载订单数据；token 正确存储 |
| **微信审核风险** | 低。标准微信登录流程 |

---

### FLOW-HOME-001: 首页浏览

| 项目 | 内容 |
|------|------|
| **入口** | TabBar "首页" |
| **前置条件** | 已登录 |
| **操作步骤** | 1. 进入首页 → 2. 加载用户信息 → 3. 加载订单统计 → 4. 展示品牌、服务说明、使用说明 → 5. 展示入口按钮 |
| **涉及页面** | `pages/home/index` |
| **涉及 API** | `GET /orders` (统计用) |
| **成功结果** | 展示品牌名"广骏供应链服务"、标语、使用说明4步骤、订单统计卡片 |
| **空状态** | 订单统计均为 0 |
| **失败状态** | 显示 error-state 组件，提供重试按钮 |
| **验收重点** | 品牌文案合规（无"快运"）；统计数字正确；入口可点击 |
| **微信审核风险** | 低。已替换"快运"为"供应链服务" |

---

### FLOW-ADDRESS-001: 查看并复制国内仓地址

| 项目 | 内容 |
|------|------|
| **入口** | TabBar "地址" 或 首页入口 |
| **前置条件** | 已登录 |
| **操作步骤** | 1. 进入地址页 → 2. 调用 `ensureLogin()` → 3. `GET /warehouse-address` → 4. 展示收件人、电话、完整地址 → 5. 用户点击"复制完整地址" → 6. `wx.setClipboardData` → 7. Toast 提示"已复制" |
| **涉及页面** | `pages/address/index` |
| **涉及 API** | `GET /warehouse-address` |
| **成功结果** | 地址信息完整展示，复制成功提示 |
| **失败状态** | API 失败时使用默认地址（本地 mock） |
| **验收重点** | 地址包含用户ID；复制内容格式正确；Toast 提示正常 |
| **微信审核风险** | 低。标准剪贴板功能 |

---

### FLOW-ORDER-LIST-001: 查看我的订单列表

| 项目 | 内容 |
|------|------|
| **入口** | TabBar "订单" |
| **前置条件** | 已登录 |
| **操作步骤** | 1. 进入订单页 → 2. `ensureLogin()` → 3. `GET /orders` → 4. 展示订单卡片列表 → 5. 点击 tab 筛选 → 6. 带 status 参数重新请求 |
| **涉及页面** | `pages/orders/list/index` |
| **涉及 API** | `GET /orders?status=xxx` |
| **成功结果** | 展示订单列表，每条显示订单号、状态、支付状态、包裹数、费用 |
| **空状态** | "暂无订单" + "复制国内仓地址后，在电商平台下单，仓库入库后将显示在这里" + "复制仓库地址"按钮 |
| **失败状态** | error-state 组件，显示"加载失败" |
| **验收重点** | 5 个 tabs 切换正常；分页加载正常；空状态按钮可跳转 |
| **微信审核风险** | 低。文案已审核合规 |

---

### FLOW-ORDER-LIST-EMPTY-001: 新用户无订单

| 项目 | 内容 |
|------|------|
| **入口** | TabBar "订单" |
| **前置条件** | 新用户，无任何订单 |
| **操作步骤** | 1. 进入订单页 → 2. `GET /orders` 返回空数组 → 3. 展示 empty-state 组件 |
| **涉及页面** | `pages/orders/list/index` |
| **涉及 API** | `GET /orders` |
| **成功结果** | 空状态文案清晰，提供"复制仓库地址"按钮和"联系客服"入口 |
| **验收重点** | 空状态不显示错误；按钮可点击跳转；文案友好 |
| **微信审核风险** | 低。空状态说明服务用途，便于审核理解 |

---

### FLOW-ORDER-DETAIL-001: 查看订单详情

| 项目 | 内容 |
|------|------|
| **入口** | 订单列表点击卡片 |
| **前置条件** | 有订单数据 |
| **操作步骤** | 1. 点击订单卡片 → 2. `wx.navigateTo` 到详情页 → 3. `onLoad` 获取 `id` 参数 → 4. `ensureLogin()` → 5. `GET /orders/:id` → 6. 展示订单状态、支付状态、包裹列表、费用、物流 |
| **涉及页面** | `pages/orders/detail/index` |
| **涉及 API** | `GET /orders/:id` |
| **成功结果** | 完整展示订单信息，包裹卡片可展开，照片可预览 |
| **失败状态** | 404 显示"订单不存在"；403 显示"无权查看" |
| **验收重点** | 不同状态下按钮正确显示/隐藏；返回上一页正常 |
| **微信审核风险** | 低。仅信息展示 |

---

### FLOW-PACKAGE-CONFIRM-001: 确认包裹

| 项目 | 内容 |
|------|------|
| **入口** | 订单详情页，待确认包裹卡片 |
| **前置条件** | 包裹状态为 `USER_CONFIRM_PENDING` |
| **操作步骤** | 1. 点击"确认无误"按钮 → 2. 弹出 Modal 二次确认 → 3. 用户点击确认 → 4. `POST /packages/:id/confirm` → 5. Toast 提示"已确认，等待审核" → 6. 刷新订单详情 |
| **涉及页面** | `pages/orders/detail/index` |
| **涉及 API** | `POST /packages/:id/confirm` |
| **成功结果** | 包裹状态变为"已确认"，按钮消失 |
| **失败状态** | Toast 提示"确认失败" |
| **验收重点** | 二次确认弹窗；非待确认状态不显示按钮；重复点击处理 |
| **微信审核风险** | 低。正常业务流程确认 |

---

### FLOW-PACKAGE-ISSUE-001: 提交包裹异常

| 项目 | 内容 |
|------|------|
| **入口** | 订单详情页，待确认包裹卡片"有问题"按钮 |
| **前置条件** | 包裹状态为 `USER_CONFIRM_PENDING` |
| **操作步骤** | 1. 点击"有问题"按钮 → 2. 弹出 Modal 输入框 → 3. 用户输入问题描述 → 4. 点击"提交" → 5. 校验非空 → 6. `POST /packages/:id/issue` → 7. Toast 提示"已提交异常" → 8. 关闭弹窗，刷新订单 |
| **涉及页面** | `pages/orders/detail/index` |
| **涉及 API** | `POST /packages/:id/issue` |
| **成功结果** | 异常提交成功，包裹状态变为"异常处理中" |
| **失败状态** | 空内容提示"请输入问题描述"；网络失败提示"提交失败" |
| **验收重点** | 必填校验；超长内容处理；重复提交防止 |
| **微信审核风险** | 低。用户反馈功能 |

---

### FLOW-PAYMENT-STATUS-001: 查看支付状态

| 项目 | 内容 |
|------|------|
| **入口** | 订单列表/详情页 |
| **前置条件** | 订单有待支付/已支付等状态 |
| **操作步骤** | 系统自动展示支付状态标签 |
| **涉及页面** | `pages/orders/list/index`, `pages/orders/detail/index` |
| **涉及 API** | 无额外 API |
| **成功结果** | 展示"未支付"/"支付处理中"/"已支付"状态 |
| **验收重点** | **不出现**"立即支付"按钮；**不出现**"微信支付"/"支付宝"等引导 |
| **微信审核风险** | 低。仅展示状态，无支付功能 |

---

### FLOW-SHIPMENT-001: 查看已发货/物流状态

| 项目 | 内容 |
|------|------|
| **入口** | 订单详情页 |
| **前置条件** | 订单已发货 |
| **操作步骤** | 1. 进入已发货订单详情 → 2. 展示物流信息卡片 → 3. 显示物流渠道、运单号、发货状态 |
| **涉及页面** | `pages/orders/detail/index` |
| **涉及 API** | `GET /orders/:id` (包含 shipment 数据) |
| **成功结果** | 展示物流渠道、运单号（可复制）、发货状态 |
| **验收重点** | 运单号可复制；无物流信息时友好提示 |
| **微信审核风险** | 低。仅信息展示 |

---

### FLOW-EXCEPTION-001: 查看异常订单

| 项目 | 内容 |
|------|------|
| **入口** | 订单列表"异常" tab |
| **前置条件** | 有异常状态订单 |
| **操作步骤** | 1. 点击"异常" tab → 2. `GET /orders?status=EXCEPTION` → 3. 展示异常订单列表 |
| **涉及页面** | `pages/orders/list/index` |
| **涉及 API** | `GET /orders?status=EXCEPTION` |
| **成功结果** | 异常订单列表，状态标签为红色"异常处理中" |
| **验收重点** | 异常 tab 筛选正常；异常状态醒目展示 |
| **微信审核风险** | 低 |

---

### FLOW-MY-001: 我的页面

| 项目 | 内容 |
|------|------|
| **入口** | TabBar "我的" |
| **前置条件** | 已登录 |
| **操作步骤** | 1. 进入我的页 → 2. 展示用户ID (userCode) → 3. 点击菜单项跳转 |
| **涉及页面** | `pages/profile/index` |
| **涉及 API** | 无直接 API，使用全局 user 数据 |
| **菜单项** | 我的订单、地址管理、客服中心、隐私政策 |
| **其他功能** | 退出登录（清除 token，刷新页面） |
| **验收重点** | 各入口跳转正常；退出登录后重新登录正常 |
| **微信审核风险** | 低 |

---

### FLOW-PRIVACY-001: 查看隐私政策

| 项目 | 内容 |
|------|------|
| **入口** | 我的页 → 隐私政策 |
| **前置条件** | 无 |
| **操作步骤** | 1. 点击隐私政策菜单 → 2. `wx.navigateTo` 到隐私页 → 3. 展示隐私政策内容 |
| **涉及页面** | `pages/privacy/index` |
| **展示内容** | 收集的信息、信息用途、信息保存与保护、联系方式、停止使用 |
| **验收重点** | 内容完整；只声明实际使用的信息（微信标识、订单信息、包裹照片、反馈内容） |
| **微信审核风险** | 低。未声明身份证、银行卡、精准定位等敏感信息 |

---

### FLOW-CUSTOMER-SERVICE-001: 客服页

| 项目 | 内容 |
|------|------|
| **入口** | 我的页 → 客服中心 |
| **前置条件** | 无 |
| **操作步骤** | 1. 进入客服页 → 2. 展示客服微信号、服务时间、邮箱 → 3. 点击"复制微信号" → 4. 展开/收起 FAQ |
| **涉及页面** | `pages/customer-service/index` |
| **功能** | 复制客服微信号、查看常见问题 |
| **FAQ 列表** | 入库照片时间、如何确认包裹、未支付是否发货、包裹有问题、查询物流、多包裹合并 |
| **验收重点** | 微信号可复制；FAQ 可展开收起；无支付引导文案 |
| **微信审核风险** | 低。FAQ 已审核合规 |

---

### FLOW-ERROR-001: 网络失败/API 失败

| 项目 | 内容 |
|------|------|
| **入口** | 任意需要网络请求的页面 |
| **前置条件** | 网络断开或 API 返回错误 |
| **处理流程** | 1. `wx.request` fail → 2. `request.js` handleError → 3. 显示 Toast 或 error-state 组件 |
| **错误类型** | 网络错误、401、403、404、500、超时 |
| **用户提示** | "网络连接失败"、"登录已过期"、"无权访问"、"订单不存在"、"服务器错误" |
| **重试机制** | error-state 组件提供"重试"按钮 |
| **验收重点** | 错误提示友好；不暴露技术细节；提供重试入口 |
| **微信审核风险** | 低 |

---

### FLOW-AUTH-EXPIRED-001: Token 过期/401

| 项目 | 内容 |
|------|------|
| **入口** | 任意需要鉴权的 API 请求 |
| **前置条件** | token 过期，后端返回 401 |
| **处理流程** | 1. `request.js` 收到 401 → 2. 检查 `__retried` 标记 → 3. 清除 token → 4. 调用 `auth.login()` 重新获取 token → 5. 重试原请求 → 6. 成功则继续，失败则提示登录过期 |
| **涉及文件** | `utils/request.js`, `utils/auth.js` |
| **验收重点** | 401 后自动重新登录；不无限循环；失败时提示清晰 |
| **微信审核风险** | 低 |

---

## 7. API 使用矩阵

| API ID | Method | Path | 调用页面/文件 | 调用时机 | 需 token | 请求参数 | 返回字段使用 | 失败处理 |
|--------|--------|------|---------------|----------|----------|----------|--------------|----------|
| AUTH-001 | POST | `/auth/wechat-login` | `utils/auth.js` | 登录时 | ❌ | `{ code, nickname?, avatarUrl? }` | `accessToken`, `user` | Toast 提示登录失败 |
| USER-001 | GET | `/user/me` | `utils/auth.js` | 获取用户信息 | ✅ | - | `user` 对象 | 401 时清除 token |
| ADDR-001 | GET | `/warehouse-address` | `services/address.service.js` | 地址页加载 | ✅ | - | `receiverName`, `phone`, `addressLine` 等 | 使用默认地址 |
| ORDER-001 | GET | `/orders` | `services/order.service.js` | 订单列表加载 | ✅ | `page`, `pageSize`, `status?` | `items[]`, `pagination` | error-state 组件 |
| ORDER-002 | GET | `/orders/:id` | `services/order.service.js` | 订单详情加载 | ✅ | URL param `id` | 完整 order 对象 | 404/403 特殊提示 |
| ORDER-003 | GET | `/orders/:id/shipment` | `services/order.service.js` | 物流信息加载 | ✅ | URL param `id` | `provider`, `trackingNumber`, `status` | 静默失败 |
| PKG-001 | POST | `/packages/:id/confirm` | `services/package.service.js` | 确认包裹 | ✅ | URL param `id`, `{ confirmNote? }` | success | Toast 提示确认失败 |
| PKG-002 | POST | `/packages/:id/issue` | `services/package.service.js` | 提交异常 | ✅ | URL param `id`, `{ type, description }` | success | Toast 提示提交失败 |

### 7.1 API 风险检查

| 检查项 | 结果 |
|--------|------|
| 调用不存在 API | ❌ 无。所有 API 均与 backend 约定一致 |
| 硬编码完整 URL | ❌ 无。使用 `${API_BASE_URL}${url}` |
| 绕过 request.js | ❌ 无。所有请求通过 request.js |
| 直连 Supabase | ❌ 无。无 Supabase URL 调用 |

---

## 8. 页面级验收用例

### 8.1 首页 (pages/home/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | API | 优先级 |
|---------|----------|----------|----------|-----|--------|
| HOME-001 | 已登录，有订单 | 进入首页 | 展示品牌名、标语、订单统计、使用说明 | `GET /orders` | P0 |
| HOME-002 | 未登录 | 进入首页 | 自动登录成功，展示首页 | `POST /auth/wechat-login` | P0 |
| HOME-003 | 登录失败 | 进入首页 | 显示"登录失败，请重试"Toast | - | P0 |
| HOME-004 | 网络断开 | 进入首页 | 显示 error-state 组件，可重试 | - | P1 |
| HOME-005 | 点击"复制仓库地址"入口 | 点击入口 | 跳转到地址页 | - | P1 |
| HOME-006 | 点击"查看我的订单" | 点击入口 | 跳转到订单列表 | - | P1 |

### 8.2 地址页 (pages/address/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | API | 优先级 |
|---------|----------|----------|----------|-----|--------|
| ADDR-001 | 已登录，API 正常 | 进入地址页 | 展示完整仓库地址，含用户ID | `GET /warehouse-address` | P0 |
| ADDR-002 | API 失败 | 进入地址页 | 展示默认地址，不报错 | - | P1 |
| ADDR-003 | 点击"复制完整地址" | 点击按钮 | 剪贴板有地址内容，Toast 提示"已复制" | - | P0 |
| ADDR-004 | 未登录 | 进入地址页 | 自动登录后加载地址 | `POST /auth/wechat-login` | P0 |

### 8.3 订单列表 (pages/orders/list/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | API | 优先级 |
|---------|----------|----------|----------|-----|--------|
| ORDER-L-001 | 有订单 | 进入订单页 | 展示订单列表，默认"全部"tab | `GET /orders` | P0 |
| ORDER-L-002 | 有订单 | 点击"待确认"tab | 筛选显示待确认订单 | `GET /orders?status=USER_CONFIRM_PENDING` | P0 |
| ORDER-L-003 | 无订单 | 进入订单页 | 显示空状态，有"复制仓库地址"按钮 | `GET /orders` | P0 |
| ORDER-L-004 | 多页订单 | 上拉加载 | 加载更多订单，分页正常 | `GET /orders?page=2` | P1 |
| ORDER-L-005 | 点击订单卡片 | 点击卡片 | 跳转到订单详情页 | - | P0 |
| ORDER-L-006 | 网络失败 | 进入订单页 | 显示 error-state，可重试 | - | P1 |

### 8.4 订单详情 (pages/orders/detail/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | API | 优先级 |
|---------|----------|----------|----------|-----|--------|
| ORDER-D-001 | 有待确认包裹 | 进入详情 | 展示包裹卡片，有"确认无误"/"有问题"按钮 | `GET /orders/:id` | P0 |
| ORDER-D-002 | 有待确认包裹 | 点击"确认无误" | 弹出二次确认，确认后提交成功 | `POST /packages/:id/confirm` | P0 |
| ORDER-D-003 | 有待确认包裹 | 点击"有问题" | 弹出输入框，输入内容后提交 | `POST /packages/:id/issue` | P0 |
| ORDER-D-004 | 包裹已确认 | 进入详情 | "确认无误"/"有问题"按钮不显示 | - | P0 |
| ORDER-D-005 | 已发货订单 | 进入详情 | 展示物流信息，运单号可复制 | - | P0 |
| ORDER-D-006 | 订单不存在 | 进入详情 | 显示"订单不存在或已删除" | `GET /orders/:id` (404) | P1 |
| ORDER-D-007 | 点击包裹照片 | 点击照片 | 打开图片预览 | `wx.previewImage` | P1 |

### 8.5 我的页 (pages/profile/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | 优先级 |
|---------|----------|----------|----------|--------|
| PROFILE-001 | 已登录 | 进入我的页 | 展示用户ID、功能入口 | P0 |
| PROFILE-002 | 点击"我的订单" | 点击菜单 | 跳转到订单列表 | P0 |
| PROFILE-003 | 点击"隐私政策" | 点击菜单 | 跳转到隐私政策页 | P0 |
| PROFILE-004 | 点击"退出登录" | 点击按钮，确认 | 退出成功，页面刷新 | P1 |

### 8.6 隐私政策 (pages/privacy/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | 优先级 |
|---------|----------|----------|----------|--------|
| PRIVACY-001 | - | 进入隐私页 | 完整展示隐私政策内容 | P0 |
| PRIVACY-002 | - | 查看内容 | 只声明实际使用的信息类型 | P0 |

### 8.7 客服页 (pages/customer-service/index)

| Test ID | 前置条件 | 操作步骤 | 预期结果 | 优先级 |
|---------|----------|----------|----------|--------|
| CS-001 | - | 进入客服页 | 展示客服微信号、服务时间、FAQ | P0 |
| CS-002 | - | 点击"复制微信号" | 剪贴板有微信号，Toast 提示 | P0 |
| CS-003 | - | 点击 FAQ 问题 | 展开/收起答案 | P1 |

---

## 9. 微信审核前验收 checklist

### 9.1 功能检查

- [ ] 首页可正常打开，展示品牌名"广骏供应链服务"
- [ ] 登录不报错，token 正确存储
- [ ] 地址页可打开，地址可复制
- [ ] 订单页可打开，列表正常展示
- [ ] 空订单状态正常显示，有引导文案
- [ ] 订单详情可打开，包裹信息展示正常
- [ ] 隐私政策页可打开，内容完整
- [ ] 客服页可打开，FAQ 可展开
- [ ] 无白屏、无明显报错

### 9.2 接口检查

- [ ] `config/index.js` 中 `API_BASE_URL` 为 `https://api.gjxpress.net/api`
- [ ] `request` 合法域名已配置 `https://api.gjxpress.net`
- [ ] `downloadFile` 合法域名已配置 `https://api.gjxpress.net`
- [ ] 不调用 `localhost`
- [ ] 不调用未备案域名
- [ ] 不直连 Supabase

### 9.3 文案检查（禁止出现）

- [ ] 无"代购"
- [ ] 无"清关"
- [ ] 无"包清关"
- [ ] 无"包税"
- [ ] 无"免税"
- [ ] 无"避税"
- [ ] 无"灰关"
- [ ] 无"走私"
- [ ] 无"保证通关"
- [ ] 无"100%安全"
- [ ] 无"微信支付"
- [ ] 无"支付宝支付"
- [ ] 无"立即支付"
- [ ] 无"转账"
- [ ] 无"收款码"

### 9.4 截图建议（审核用）

建议提供以下截图：

1. **首页** - 展示品牌、服务说明、使用说明
2. **地址页** - 展示仓库地址、复制功能
3. **订单列表页** - 展示订单列表（如有）或空状态
4. **订单详情页** - 展示订单信息、包裹、费用
5. **隐私政策页** - 完整展示隐私政策
6. **客服页** - 展示客服信息、FAQ

**截图注意事项**:
- 不包含 DevTools UI
- 不包含 localhost 或 debug 信息
- 不包含 console 报错
- 不包含测试账号敏感信息

---

## 10. 回归测试 checklist

每次发布前的 smoke test：

| 编号 | 检查项 | 操作 | 预期结果 | 是否 P0 |
|------|--------|------|----------|---------|
| 1 | 编译通过 | 微信开发者工具编译 | 无编译错误 | ✅ P0 |
| 2 | 小程序启动 | 打开小程序 | 正常进入首页 | ✅ P0 |
| 3 | wx.login | 首次打开 | 调用 wx.login 成功 | ✅ P0 |
| 4 | 后端登录 | 首次打开 | POST /auth/wechat-login 成功 | ✅ P0 |
| 5 | 首页正常 | 查看首页 | 展示品牌、统计、入口 | ✅ P0 |
| 6 | 地址页正常 | 进入地址页 | 展示完整地址 | ✅ P0 |
| 7 | 复制地址 | 点击复制按钮 | 剪贴板有内容，Toast 提示 | ✅ P0 |
| 8 | 订单列表正常 | 进入订单页 | 列表或空状态正常 | ✅ P0 |
| 9 | 订单详情正常 | 进入详情页 | 订单信息展示正常 | ✅ P0 |
| 10 | 确认包裹 | 待确认包裹点击确认 | 提交成功，状态更新 | ✅ P0 |
| 11 | 提交异常 | 待确认包裹点击有问题 | 提交成功，状态更新 | ✅ P0 |
| 12 | 隐私政策正常 | 进入隐私政策页 | 内容完整 | ✅ P0 |
| 13 | 客服页正常 | 进入客服页 | 客服信息展示正常 | ✅ P0 |
| 14 | API_BASE_URL | 检查 config | 为生产环境 URL | ✅ P0 |
| 15 | 无 localhost | 全局搜索 | 无 localhost 硬编码 | ✅ P0 |
| 16 | 无敏感词 | 文案检查 | 无审核敏感词 | ✅ P0 |
| 17 | 无支付按钮 | 订单页检查 | 无立即支付按钮 | ✅ P0 |

---

## 11. 状态流转图/表

### 11.1 订单状态流转

| 状态值 | 中文展示 | 用户可操作 | 后台操作来源 | 备注 |
|--------|----------|------------|--------------|------|
| `UNINBOUND` | 未入库 | 无 | 后台初始创建 | 等待仓库入库 |
| `INBOUNDED` | 已入库 | 查看信息 | 后台入库完成 | 等待拍照上传 |
| `USER_CONFIRM_PENDING` | 待用户确认 | 确认包裹/提交异常 | 后台照片上传完成 | 需要用户确认 |
| `REVIEW_PENDING` | 待审核 | 无 | 用户确认后 | 后台审核 |
| `PAYMENT_PENDING` | 待支付 | 查看支付状态 | 后台审核通过 | 等待线下支付 |
| `PAID` | 已支付 | 无 | 后台确认收款 | 等待发货 |
| `READY_TO_SHIP` | 待发货 | 无 | 后台准备发货 | - |
| `SHIPPED` | 已发货 | 查看物流 | 后台发货完成 | 可查看运单号 |
| `COMPLETED` | 已完成 | 无 | 订单完成 | - |
| `EXCEPTION` | 异常处理中 | 查看异常 | 用户提交异常或后台标记 | 客服介入处理 |

### 11.2 包裹状态流转

| 状态值 | 中文展示 | 用户可操作 | 后台操作来源 | 备注 |
|--------|----------|------------|--------------|------|
| `CREATED` | 已创建 | 无 | 系统创建 | - |
| `INBOUNDED` | 已入库 | 查看信息 | 后台入库 | - |
| `USER_CONFIRM_PENDING` | 待用户确认 | 确认/异常 | 后台照片上传 | 显示操作按钮 |
| `CONFIRMED` | 已确认 | 无 | 用户确认后 | - |
| `EXCEPTION` | 异常处理中 | 查看 | 用户提交异常 | 客服处理中 |
| `CONSOLIDATED` | 已合单 | 无 | 合并到订单 | - |
| `SHIPPED` | 已发货 | 查看物流 | 随订单发货 | - |

### 11.3 支付状态流转

| 状态值 | 中文展示 | 用户可操作 | 后台操作来源 | 备注 |
|--------|----------|------------|--------------|------|
| `UNPAID` | 未支付 | 查看状态 | 初始状态 | 仅展示，不引导支付 |
| `PROCESSING` | 支付处理中 | 查看状态 | 用户已付款，后台确认中 | - |
| `PAID` | 已支付 | 查看状态 | 后台确认收款 | 等待发货 |

**注意**: 支付状态仅作为信息展示，小程序内不提供支付功能。用户通过客服线下完成支付。

---

## 12. 不一致项、风险项、待确认项

### 12.1 风险清单

| 风险 ID | 类型 | 位置 | 描述 | 严重级别 | 建议处理 |
|---------|------|------|------|----------|----------|
| RISK-001 | 中风险 | `config/index.js` | `ENV = 'prod'` 硬编码，开发和生产使用同一配置 | Medium | 建议通过构建脚本或环境变量注入，避免手动修改 |
| RISK-002 | 低风险 | `pages/address/index.js` | API 失败时使用默认 mock 地址 | Low | 确保生产环境 API 稳定，或改为更明显的错误提示 |
| RISK-003 | 低风险 | `project.config.json` | `urlCheck: false` 关闭 URL 校验 | Low | 提交审核前确认设为 `true` |
| RISK-004 | 中风险 | 订阅消息 | `notification.service.js` 有订阅消息功能，但未在页面中使用 | Medium | 确认是否已实现 UI 入口，如未实现建议隐藏相关代码 |

### 12.2 待确认项

| 待确认 ID | 描述 | 影响 |
|-----------|------|------|
| TODO-001 | 后端 `/orders` API 是否支持 `status` 参数筛选？ | 影响订单列表 tab 筛选功能实现方式 |
| TODO-002 | 后端 `/orders/:id/shipment` 物流信息格式？ | 影响订单详情物流展示 |
| TODO-003 | 图片 URL 是否已统一为 `api.gjxpress.net/files/{id}`？ | 影响 downloadFile 合法域名配置 |
| TODO-004 | 是否已申请订阅消息模板 ID？ | 影响订阅消息功能启用 |

### 12.3 文档与代码一致性

| 检查项 | 状态 |
|--------|------|
| `app.json` 页面配置 vs 实际页面文件 | ✅ 一致 |
| `pages.md` 设计文档 vs 实际实现 | ✅ 基本一致 |
| `prd.md` 功能定义 vs 实际实现 | ✅ 一致 |
| `review-copy-audit.md` 文案修改 vs 实际代码 | ✅ 一致 |

---

## 13. 后续开发维护规则

### 13.1 必须同步更新本文档的场景

后续任何涉及以下内容的改动，都必须同步更新本文档：

- 新增/删除/修改页面
- 新增/删除/修改用户入口或按钮
- 新增/删除/修改 API 调用
- 改变订单、包裹、支付、异常状态
- 改变登录、token、request.js 逻辑
- 改变隐私政策、客服、审核相关文案
- 新增用户输入或图片能力
- 涉及支付、费用、支付状态变更
- 需要新增验收用例

### 13.2 开发者检查清单

在提交功能改动前，必须回答：

1. [ ] 是否新增/删除/修改了页面？
2. [ ] 是否新增/删除/修改了用户入口或按钮？
3. [ ] 是否新增/删除/修改了 API？
4. [ ] 是否改变了订单、包裹、支付、异常状态？
5. [ ] 是否改变了登录、token、request.js？
6. [ ] 是否改变了隐私政策、客服、审核相关文案？
7. [ ] 是否新增了用户输入或图片能力？
8. [ ] 是否涉及支付、费用、支付状态？
9. [ ] 是否需要新增验收用例？
10. [ ] **是否已更新 `miniprogram/docs/feature-flow-acceptance.md`？**

如果答案中任何一个是 **yes**，必须更新本文档。

---

## 14. 附录

### 14.1 目录结构

```
miniprogram/
├── app.js                    # 全局应用逻辑
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json              # 站点地图
├── config/
│   └── index.js              # 环境配置
├── utils/
│   ├── request.js            # API 请求封装
│   ├── auth.js               # 登录鉴权
│   ├── status.js             # 状态映射
│   └── storage.js            # 本地存储
├── services/
│   ├── auth.service.js       # 登录服务
│   ├── user.service.js       # 用户服务
│   ├── order.service.js      # 订单服务
│   ├── package.service.js    # 包裹服务
│   ├── address.service.js    # 地址服务
│   └── notification.service.js # 通知服务
├── components/
│   ├── status-tag/           # 状态标签组件
│   ├── empty-state/          # 空状态组件
│   ├── error-state/          # 错误状态组件
│   ├── package-card/         # 包裹卡片组件
│   └── image-gallery/        # 图片画廊组件
└── pages/
    ├── home/index            # 首页
    ├── address/index         # 地址页
    ├── orders/list/index     # 订单列表
    ├── orders/detail/index   # 订单详情
    ├── profile/index         # 我的页
    ├── privacy/index         # 隐私政策
    └── customer-service/index # 客服页
```

### 14.2 变更日志

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1.0.0 | 2026-05-04 | 初始创建，完成全量功能盘点 | Windsurf |

---

**文档结束**

> 本文档由 Windsurf 生成并维护。如有疑问，请联系开发团队。
