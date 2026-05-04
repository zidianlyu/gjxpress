# API Contract：GJXpress / 广骏供应链服务

> 文档版本：v1.0  
> API Base URL：`https://api.gjxpress.io`  
> Backend：NestJS  
> Auth：JWT Bearer Token

---

## 1. API 设计原则

1. 所有接口通过 HTTPS 访问。
2. 所有用户身份由后端 JWT 校验。
3. 微信 openid 只在后端通过微信 code2Session 获取。
4. 小程序和 Next.js frontend 共用 API。
5. 用户 API 只能访问自己的数据。
6. 管理员 API 必须使用 Admin JWT。
7. 所有关键管理员操作写入 `AdminActionLog`。
8. 所有时间使用 ISO 8601 字符串。
9. 所有金额使用 decimal string 或 number，后端保证精度。
10. 分页接口统一使用 `page` 和 `pageSize`。

---

## 2. 通用请求头

### 2.1 用户登录后请求

```http
Authorization: Bearer <USER_JWT>
Content-Type: application/json
```

### 2.2 管理员登录后请求

```http
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json
```

---

## 3. 通用响应结构

### 3.1 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "ok"
}
```

### 3.2 列表响应

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "ok"
}
```

### 3.3 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found",
    "details": {}
  }
}
```

---

## 4. 通用错误码

| Code | 含义 |
|---|---|
| UNAUTHORIZED | 未登录或 token 无效 |
| FORBIDDEN | 无权限 |
| VALIDATION_ERROR | 参数错误 |
| NOT_FOUND | 资源不存在 |
| ORDER_NOT_FOUND | 订单不存在 |
| PACKAGE_NOT_FOUND | 包裹不存在 |
| INVALID_STATUS_TRANSITION | 状态流转不合法 |
| PAYMENT_REQUIRED | 订单未支付，不能发货 |
| WECHAT_LOGIN_FAILED | 微信登录失败 |
| STORAGE_UPLOAD_FAILED | 图片上传失败 |
| QR_NOT_AUTHORIZED | 二维码非本人操作 |
| ADMIN_REASON_REQUIRED | 管理员 override 需要填写原因 |
| INTERNAL_SERVER_ERROR | 服务端错误 |

---

## 5. 枚举定义

### 5.1 OrderStatus

```text
UNINBOUND
INBOUNDED
USER_CONFIRM_PENDING
REVIEW_PENDING
PAYMENT_PENDING
PAID
READY_TO_SHIP
SHIPPED
COMPLETED
EXCEPTION
```

### 5.2 PackageStatus

```text
CREATED
INBOUNDED
USER_CONFIRM_PENDING
CONFIRMED
EXCEPTION
SHIPPED
```

### 5.3 PaymentStatus

```text
UNPAID
PROCESSING
PAID
```

### 5.4 ImageType

```text
OUTER
LABEL
INNER
EXCEPTION
```

### 5.5 ExceptionType

```text
MISSING_ITEM
WRONG_ITEM
DAMAGED
RESTRICTED
OTHER
```

### 5.6 ExceptionStatus

```text
OPEN
PROCESSING
RESOLVED
```

### 5.7 ShipmentProvider

```text
UPS
DHL
EMS
AIR
SEA
OTHER
```

### 5.8 ActorType

```text
USER
ADMIN
SYSTEM
```

---

## 6. Health

### GET `/health`

用于部署和监控。

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "gjxpress-api",
    "timestamp": "2026-01-01T00:00:00.000Z"
  },
  "message": "ok"
}
```

---

## 7. Auth API

## 7.1 微信登录

### POST `/auth/wechat-login`

小程序调用 `wx.login()` 后，将 code 传给后端。

Request:

```json
{
  "code": "wx_login_code",
  "nickname": "optional nickname",
  "avatarUrl": "optional avatar url"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "USER_JWT",
    "user": {
      "id": "usr_123",
      "userCode": "1023",
      "nickname": "微信用户",
      "avatarUrl": "https://..."
    }
  },
  "message": "login success"
}
```

规则：

- 后端调用微信 code2Session。
- 后端获取 openid。
- 如果 openid 不存在，则创建用户。
- 如果已存在，则更新 nickname/avatar，可选。
- 返回 JWT。

---

## 7.2 管理员登录

### POST `/auth/admin-login`

Request:

```json
{
  "username": "admin@example.com",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "ADMIN_JWT",
    "admin": {
      "id": "adm_123",
      "username": "admin@example.com",
      "displayName": "Admin",
      "role": "SUPER_ADMIN"
    }
  },
  "message": "login success"
}
```

---

## 8. User API

## 8.1 当前用户资料

### GET `/user/me`

Auth：User JWT

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "userCode": "1023",
    "nickname": "微信用户",
    "avatarUrl": "https://...",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "message": "ok"
}
```

---

## 9. Warehouse Address API

## 9.1 获取仓库地址

### GET `/warehouse-address/current`

Auth：User JWT

Response:

```json
{
  "success": true,
  "data": {
    "receiverName": "广骏仓-1023",
    "phone": "13800000000",
    "province": "广东省",
    "city": "广州市",
    "district": "白云区",
    "addressLine": "示例仓库地址 1 号",
    "postalCode": "510000",
    "userCode": "1023",
    "fullText": "收件人：广骏仓-1023\n电话：13800000000\n地址：广东省广州市白云区示例仓库地址 1 号"
  },
  "message": "ok"
}
```

---

## 10. Order API - User

## 10.1 用户订单列表

### GET `/orders`

Auth：User JWT

Query:

```text
page=1
pageSize=20
status=USER_CONFIRM_PENDING
paymentStatus=UNPAID
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ord_123",
        "orderNo": "ORD-202604-0001",
        "status": "USER_CONFIRM_PENDING",
        "paymentStatus": "UNPAID",
        "packageCount": 2,
        "chargeableWeight": 8.5,
        "finalPrice": 68.0,
        "currency": "USD",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "ok"
}
```

---

## 10.2 用户订单详情

### GET `/orders/:orderId`

Auth：User JWT

Response:

```json
{
  "success": true,
  "data": {
    "id": "ord_123",
    "orderNo": "ORD-202604-0001",
    "status": "USER_CONFIRM_PENDING",
    "paymentStatus": "UNPAID",
    "totalActualWeight": 7.8,
    "totalVolumeWeight": 8.5,
    "chargeableWeight": 8.5,
    "estimatedPrice": 68.0,
    "finalPrice": 68.0,
    "currency": "USD",
    "packages": [
      {
        "id": "pkg_123",
        "packageNo": "PKG-0001",
        "domesticTrackingNo": "SF123456",
        "sourcePlatform": "TAOBAO",
        "status": "USER_CONFIRM_PENDING",
        "actualWeight": 2.4,
        "lengthCm": 30,
        "widthCm": 20,
        "heightCm": 15,
        "volumeWeight": 1.5,
        "inboundAt": "2026-01-01T00:00:00.000Z",
        "images": [
          {
            "id": "img_123",
            "imageType": "OUTER",
            "url": "https://..."
          }
        ]
      }
    ],
    "shipment": {
      "provider": "DHL",
      "trackingNumber": "DHL123456",
      "status": "SHIPPED",
      "shippedAt": "2026-01-02T00:00:00.000Z",
      "estimatedArrivalAt": "2026-01-10T00:00:00.000Z"
    }
  },
  "message": "ok"
}
```

---

## 11. Package Confirmation API

## 11.1 用户确认包裹

### POST `/packages/:packageId/confirm`

Auth：User JWT

Request:

```json
{
  "confirmNote": "确认无误"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "packageId": "pkg_123",
    "status": "CONFIRMED",
    "confirmedAt": "2026-01-01T00:00:00.000Z"
  },
  "message": "package confirmed"
}
```

规则：

- 只能确认属于自己的包裹。
- 只有 `USER_CONFIRM_PENDING` 状态可确认。
- 确认后写入状态日志。

---

## 11.2 用户提交异常

### POST `/packages/:packageId/issue`

Auth：User JWT

Request:

```json
{
  "type": "DAMAGED",
  "description": "外包装破损，请检查内部物品。"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "exceptionId": "exc_123",
    "packageId": "pkg_123",
    "status": "OPEN"
  },
  "message": "issue reported"
}
```

规则：

- 创建 ExceptionCase。
- Package 状态变为 EXCEPTION。
- Order 可变为 EXCEPTION 或保留当前状态并标记 hasException。

---

## 12. Admin Order API

## 12.1 管理员订单列表

### GET `/admin/orders`

Auth：Admin JWT

Query:

```text
page=1
pageSize=20
status=PAYMENT_PENDING
paymentStatus=UNPAID
userCode=1023
orderNo=ORD-202604-0001
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ord_123",
        "orderNo": "ORD-202604-0001",
        "user": {
          "id": "usr_123",
          "userCode": "1023",
          "nickname": "微信用户"
        },
        "status": "PAYMENT_PENDING",
        "paymentStatus": "UNPAID",
        "packageCount": 2,
        "finalPrice": 68.0,
        "currency": "USD",
        "manualOverride": false,
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "ok"
}
```

---

## 12.2 管理员创建订单

### POST `/admin/orders`

Auth：Admin JWT

Request:

```json
{
  "userCode": "1023",
  "remark": "客户咨询后创建"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "ord_123",
    "orderNo": "ORD-202604-0001",
    "status": "UNINBOUND",
    "paymentStatus": "UNPAID"
  },
  "message": "order created"
}
```

---

## 12.3 管理员修改订单状态

### PATCH `/admin/orders/:orderId/status`

Auth：Admin JWT

Request:

```json
{
  "status": "READY_TO_SHIP",
  "override": true,
  "reason": "客户已线下确认，管理员手动推进。"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "orderId": "ord_123",
    "status": "READY_TO_SHIP",
    "manualOverride": true
  },
  "message": "order status updated"
}
```

规则：

- 普通状态流转需符合状态机。
- override 为 true 时必须传 reason。
- 任何状态修改必须写 AdminActionLog 和 OrderStatusLog。

---

## 13. Admin Package / Inbound API

## 13.1 包裹入库

### POST `/admin/packages/inbound`

Auth：Admin JWT

Request:

```json
{
  "userCode": "1023",
  "orderId": "ord_123",
  "domesticTrackingNo": "SF123456",
  "sourcePlatform": "TAOBAO",
  "actualWeight": 2.4,
  "lengthCm": 30,
  "widthCm": 20,
  "heightCm": 15,
  "remark": "外包装完整"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "package": {
      "id": "pkg_123",
      "packageNo": "PKG-0001",
      "status": "USER_CONFIRM_PENDING",
      "actualWeight": 2.4,
      "volumeWeight": 1.5
    },
    "inboundRecord": {
      "id": "inb_123",
      "inboundTime": "2026-01-01T00:00:00.000Z"
    }
  },
  "message": "package inbounded"
}
```

规则：

- 如果 orderId 不传，可根据 userCode 创建或匹配未完成订单，具体由后端配置。
- 入库后包裹状态为 USER_CONFIRM_PENDING。
- 订单状态应更新为 INBOUNDED 或 USER_CONFIRM_PENDING。

---

## 14. Image API

## 14.1 创建上传请求

### POST `/admin/images/upload-request`

Auth：Admin JWT

Request:

```json
{
  "packageId": "pkg_123",
  "imageType": "OUTER",
  "fileName": "outer.jpg",
  "contentType": "image/jpeg"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "storageKey": "packages/pkg_123/outer/uuid.jpg",
    "method": "PUT"
  },
  "message": "upload url created"
}
```

MVP 可改为后端 multipart 上传接口。

---

## 14.2 保存图片 metadata

### POST `/admin/images`

Auth：Admin JWT

Request:

```json
{
  "packageId": "pkg_123",
  "imageType": "OUTER",
  "storageKey": "packages/pkg_123/outer/uuid.jpg",
  "url": "https://..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "img_123",
    "packageId": "pkg_123",
    "imageType": "OUTER",
    "url": "https://..."
  },
  "message": "image saved"
}
```

---

## 15. Payment API

## 15.1 管理员修改支付状态

### PATCH `/admin/orders/:orderId/payment-status`

Auth：Admin JWT

Request:

```json
{
  "paymentStatus": "PAID",
  "paymentMethod": "WECHAT_OFFLINE",
  "amount": 68.0,
  "remark": "客户已通过微信转账。",
  "reason": "管理员手动确认线下付款"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "orderId": "ord_123",
    "paymentStatus": "PAID",
    "status": "READY_TO_SHIP"
  },
  "message": "payment status updated"
}
```

规则：

- 支付状态变为 PAID 后，订单可进入 READY_TO_SHIP。
- 必须写 PaymentRecord。
- 必须写 AdminActionLog。

---

## 16. Shipment API

## 16.1 管理员创建发货

### POST `/admin/shipments`

Auth：Admin JWT

Request:

```json
{
  "orderId": "ord_123",
  "provider": "DHL",
  "trackingNumber": "DHL123456",
  "shippedAt": "2026-01-02T00:00:00.000Z",
  "estimatedArrivalAt": "2026-01-10T00:00:00.000Z",
  "override": false,
  "reason": ""
}
```

Response:

```json
{
  "success": true,
  "data": {
    "shipmentId": "shp_123",
    "orderId": "ord_123",
    "provider": "DHL",
    "trackingNumber": "DHL123456",
    "status": "SHIPPED"
  },
  "message": "shipment created"
}
```

规则：

- 默认只有 PAID 或 READY_TO_SHIP 订单可发货。
- 未支付订单发货必须 override=true 且 reason 必填。
- 发货后订单状态变为 SHIPPED。
- 必须写 AdminActionLog。

---

## 16.2 用户查看物流

### GET `/orders/:orderId/shipment`

Auth：User JWT

Response:

```json
{
  "success": true,
  "data": {
    "provider": "DHL",
    "trackingNumber": "DHL123456",
    "status": "SHIPPED",
    "shippedAt": "2026-01-02T00:00:00.000Z",
    "estimatedArrivalAt": "2026-01-10T00:00:00.000Z",
    "events": [
      {
        "eventStatus": "已发货",
        "eventLocation": "广州",
        "description": "包裹已交给 DHL",
        "eventTime": "2026-01-02T00:00:00.000Z"
      }
    ]
  },
  "message": "ok"
}
```

---

## 17. Exception API

## 17.1 管理员查看异常列表

### GET `/admin/exceptions`

Auth：Admin JWT

Query:

```text
page=1
pageSize=20
status=OPEN
type=DAMAGED
userCode=1023
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "exc_123",
        "type": "DAMAGED",
        "status": "OPEN",
        "description": "外包装破损",
        "orderNo": "ORD-202604-0001",
        "packageNo": "PKG-0001",
        "userCode": "1023",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "ok"
}
```

---

## 17.2 管理员处理异常

### PATCH `/admin/exceptions/:exceptionId`

Auth：Admin JWT

Request:

```json
{
  "status": "RESOLVED",
  "resolutionNote": "已联系客户确认，继续发货。"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "exceptionId": "exc_123",
    "status": "RESOLVED",
    "resolvedAt": "2026-01-01T00:00:00.000Z"
  },
  "message": "exception updated"
}
```

---

## 18. QR API

## 18.1 管理员生成二维码

### POST `/admin/qr/generate`

Auth：Admin JWT

Request:

```json
{
  "orderId": "ord_123",
  "purpose": "RECEIPT_CONFIRM",
  "expiresInHours": 168
}
```

Response:

```json
{
  "success": true,
  "data": {
    "qrCodeId": "qr_123",
    "token": "raw_token_only_return_once",
    "qrPayload": "gjxpress://qr?token=raw_token_only_return_once",
    "expiresAt": "2026-01-08T00:00:00.000Z"
  },
  "message": "qr generated"
}
```

规则：

- token 只返回一次。
- 数据库存 token hash。

---

## 18.2 用户扫码确认

### POST `/qr/scan`

Auth：User JWT

Request:

```json
{
  "token": "raw_token_from_qr"
}
```

Response 本人扫码：

```json
{
  "success": true,
  "data": {
    "authorized": true,
    "orderId": "ord_123",
    "newStatus": "COMPLETED"
  },
  "message": "receipt confirmed"
}
```

Response 非本人扫码：

```json
{
  "success": false,
  "error": {
    "code": "QR_NOT_AUTHORIZED",
    "message": "该二维码仅限原下单微信账号使用。"
  }
}
```

规则：

- 非本人扫码不产生状态变化。
- 所有扫码都写 QRScanLog。

---

## 19. Notification API

## 19.1 用户订阅消息授权记录

### POST `/notifications/subscribe`

Auth：User JWT

Request:

```json
{
  "templateIds": ["template_id_1", "template_id_2"],
  "source": "ORDER_DETAIL"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "subscribed": true
  },
  "message": "subscription recorded"
}
```

说明：

- 实际授权弹窗由小程序调用 `wx.requestSubscribeMessage`。
- 后端记录用户授权意愿和模板 ID，便于触发通知。

---

## 20. Admin Logs API

## 20.1 查看操作日志

### GET `/admin/action-logs`

Auth：Admin JWT

Query:

```text
page=1
pageSize=20
adminId=adm_123
targetType=ORDER
targetId=ord_123
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "log_123",
        "adminId": "adm_123",
        "adminName": "Admin",
        "targetType": "ORDER",
        "targetId": "ord_123",
        "action": "UPDATE_PAYMENT_STATUS",
        "beforeState": {
          "paymentStatus": "UNPAID"
        },
        "afterState": {
          "paymentStatus": "PAID"
        },
        "reason": "客户已线下支付",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "ok"
}
```

---

## 21. Public Frontend API

外部 SEO 页面尽量使用静态内容或 Next.js server-side fetch。MVP 可不需要公开 API。

未来推荐系统 API 预留：

### GET `/public/recommendations`

返回公开推荐内容。

### GET `/public/articles/:slug`

返回公开文章。

---

## 22. API 兼容规则

1. 不轻易删除字段。
2. 新增字段必须向后兼容。
3. 状态枚举新增时，需要同步更新：
   - backend enum。
   - miniprogram status map。
   - frontend status map。
   - docs/api_contract.md。
4. API 改动需要更新此文档。
5. 后端必须用 DTO 校验请求。
