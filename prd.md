# 📦 Logistic OS PRD（广骏供应链服务）

## 1. 基本信息

`- 产品名称：广骏供应链服务（WeChat Mini Program）
- 英文名称：GJ Supply Chain Service
- 项目名称：GJXpress`
- Slogan：看得见的跨境物流

---

## 2. 产品定位

本系统为一个 **跨境集运物流操作系统（Logistic OS）**，提供：

- 国内仓收货与入库管理
- 用户可视化确认（照片 + 数据）
- 支付状态控制
- 国际物流发货管理
- 全流程状态透明

---

## 3. 用户角色

### 3.1 普通用户（User）
- 微信登录
- 查看订单 / 包裹
- 查看入库图片
- 确认或发起异常
- 查看物流状态
- 复制仓库地址

### 3.2 管理员（Admin）
- 包裹入库操作
- 图片上传
- 订单状态控制
- 支付状态管理（支持 override）
- 发货操作
- 异常处理
- 操作日志记录

---

## 4. 核心数据模型
User
└── Order
└── Package
└── GoodsItem

---

## 5. 核心流程
用户电商下单
→ 发货至国内仓
→ 仓库入库（拍照 + 称重）
→ 用户确认
→ 待审核
→ 待支付
→ 已支付
→ 国际发货
→ 已发货
→ 收货确认（二维码）
→ 完成


---

## 6. 状态流（Order）
UNINBOUND
→ INBOUNDED
→ USER_CONFIRM_PENDING
→ REVIEW_PENDING
→ PAYMENT_PENDING
→ PAID
→ READY_TO_SHIP
→ SHIPPED
→ COMPLETED

---

## 7. 核心模块

---

## 7.1 Auth（微信登录）

### 功能
- wx.login 获取 code
- 后端调用 code2Session 获取 openid
- 创建/更新 User
- 返回 JWT session

---

## 7.2 User Module

字段：
- id
- openid
- nickname
- avatar
- user_code（4位）
- created_at

---

## 7.3 Order Module

字段：
- id
- user_id
- status
- payment_status
- total_actual_weight
- total_volume_weight
- chargeable_weight
- estimated_price
- final_price
- currency
- manual_override

---

## 7.4 Package Module（核心）

字段：
- id
- order_id
- domestic_tracking_no
- source_platform
- status
- actual_weight
- length
- width
- height
- volume_weight
- inbound_time
- user_confirmed_at

---

## 7.5 Inbound Module

### 管理员操作

输入：
- 用户ID
- 国内运单号
- 重量
- 长宽高
- 图片上传

输出：
- Package
- InboundRecord

---

## 7.6 Image Module

类型：
- OUTER（外包装）
- LABEL（面单）
- INNER（内部物品）
- EXCEPTION（异常）

---

## 7.7 User Confirmation Module

用户操作：

- CONFIRM（确认无误）
- REPORT_ISSUE（发起异常）

自动机制：
- 48小时未确认 → 自动通过

---

## 7.8 Exception Module

类型：
- MISSING_ITEM
- WRONG_ITEM
- DAMAGED
- RESTRICTED
- OTHER

状态：
- OPEN
- PROCESSING
- RESOLVED

---

## 7.9 Payment Module

状态：
- UNPAID
- PROCESSING
- PAID

说明：
- 不集成支付
- 支持管理员手动确认

---

## 7.10 Admin Override（后门）

管理员可：
- 强制标记已支付
- 强制发货
- 修改状态

要求：
- 必须记录 AdminLog
- 标记 manual_override = true

---

## 7.11 Pricing Module

公式：
volume_weight = L * W * H / 6000
chargeable_weight = max(actual_weight, volume_weight)
price = unit_price * chargeable_weight

---

## 7.12 Shipment Module

字段：
- provider（UPS/DHL/EMS）
- tracking_number
- shipped_at
- estimated_arrival
- status
- raw_json（预留API）

---

## 7.13 QR Module

用途：
- 收货确认

逻辑：
- 生成 token + order_id
- 绑定 openid
- 非本人扫描无效

---

## 7.14 Notification Module

触发：
- 入库完成
- 待确认
- 待支付
- 已发货

---

## 7.15 Address Module

功能：
- 展示仓库地址
- 一键复制
- 指导用户电商下单

---

## 8. API（核心）

### Auth
- POST /auth/login

### User
- GET /user/profile

### Order
- GET /orders
- GET /orders/:id

### Package
- POST /packages/inbound
- GET /packages/:id

### Confirmation
- POST /packages/:id/confirm
- POST /packages/:id/issue

### Payment
- PATCH /orders/:id/payment-status

### Shipment
- POST /shipment
- GET /shipment/:orderId

### QR
- POST /qr/generate
- POST /qr/scan

---

## 9. 非功能要求

### 安全
- openid 必须后端验证
- 所有管理员操作必须记录日志

### 性能
- 图片使用 COS
- API 响应 < 300ms

### 可扩展
- 支持物流 API 接入
- 支持多仓库

---

## 10. MVP开发优先级

### Phase 1
- 登录
- 包裹入库
- 图片上传
- 用户确认

### Phase 2
- 订单系统
- 支付状态
- 管理员后台

### Phase 3
- 发货
- 二维码
- 物流查询

---

## 11. 系统本质

👉 本系统为 Logistic OS（物流操作系统）

核心能力：

1. 信任（入库照片）
2. 控制（支付 gating）
3. 履约（发货 + 物流）
4. 确认（二维码）
