# Backend API Contract — GJXpress Logistic OS

> Scope: `backend/` API specification
> Base API domain: `https://api.gjxpress.net`
> Local dev base URL: `http://localhost:3000`
> API style: REST JSON
> Auth: JWT Bearer token

---

## 1. API Principles

1. All clients call the backend API.
2. Mini Program does not call Supabase directly.
3. Frontend does not call Supabase directly for private data.
4. Backend validates all ownership and permissions.
5. Admin operations must be logged.
6. Response shape should be predictable.
7. Use explicit status enums.
8. Do not expose internal secrets, raw openid in public APIs, service keys, or password hashes.

---

## 2. Base URLs

## 2.1 Local

```text
http://localhost:3000
```

## 2.2 Production

```text
https://api.gjxpress.net
```

## 2.3 Future Staging

```text
https://staging-api.gjxpress.net
```

---

## 3. Common Headers

## 3.1 JSON APIs

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

## 3.2 Public APIs

No auth required unless specified.

## 3.3 Admin APIs

Require admin JWT:

```http
Authorization: Bearer <admin_access_token>
```

---

## 4. Common Response Format

## 4.1 Success: Object

```json
{
  "data": {
    "id": "..."
  }
}
```

## 4.2 Success: List

```json
{
  "data": [
    {}
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 4.3 Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "domesticTrackingNo"
    }
  }
}
```

---

## 5. Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Invalid input |
| `401` | Not authenticated |
| `403` | Not authorized |
| `404` | Resource not found |
| `409` | Conflict or invalid state transition |
| `422` | Business rule violation |
| `500` | Server error |

---

## 6. Enums

## 6.1 User Role

```text
USER
ADMIN
SUPER_ADMIN
```

## 6.2 Order Status

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
CANCELLED
```

## 6.3 Package Status

```text
CREATED
INBOUNDED
USER_CONFIRM_PENDING
CONFIRMED
EXCEPTION
CONSOLIDATED
SHIPPED
COMPLETED
CANCELLED
```

## 6.4 Payment Status

```text
UNPAID
PROCESSING
PAID
REFUNDED
WAIVED
```

## 6.5 Image Type

```text
OUTER
LABEL
INNER
EXCEPTION
PAYMENT_PROOF
OTHER
```

## 6.6 Exception Type

```text
MISSING_ITEM
WRONG_ITEM
DAMAGED
RESTRICTED
OTHER
```

## 6.7 Exception Status

```text
OPEN
PROCESSING
RESOLVED
CANCELLED
```

## 6.8 Shipment Provider

```text
UPS
DHL
EMS
USPS
FEDEX
SEA
AIR
OTHER
```

## 6.9 Shipment Status

```text
CREATED
READY
SHIPPED
IN_TRANSIT
DELIVERED
EXCEPTION
CANCELLED
```

---

## 7. Health

## 7.1 Health Check

```http
GET /health
```

### Response

```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-05-04T00:00:00.000Z",
    "service": "gjxpress-api"
  }
}
```

---

## 8. Auth APIs

## 8.1 WeChat Login

Used by Mini Program.

```http
POST /auth/wechat-login
```

### Request

```json
{
  "code": "wx_login_code",
  "nickname": "optional nickname",
  "avatarUrl": "https://optional-avatar-url"
}
```

### Response

```json
{
  "data": {
    "accessToken": "jwt_token",
    "tokenType": "Bearer",
    "expiresIn": 604800,
    "user": {
      "id": "usr_123",
      "userCode": "1023",
      "nickname": "张三",
      "avatarUrl": "https://...",
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  }
}
```

### Notes

- Backend exchanges `code` with WeChat.
- Backend stores `openid`.
- Do not return `openid` unless explicitly needed for admin debugging.
- `code` can only be used once.

---

## 8.2 Admin Login

```http
POST /auth/admin-login
```

### Request

```json
{
  "username": "admin",
  "password": "password"
}
```

### Response

```json
{
  "data": {
    "accessToken": "jwt_token",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "admin": {
      "id": "adm_123",
      "username": "admin",
      "displayName": "Warehouse Admin",
      "role": "ADMIN"
    }
  }
}
```

---

## 8.3 Current Session

```http
GET /auth/me
```

### Response for User

```json
{
  "data": {
    "type": "USER",
    "user": {
      "id": "usr_123",
      "userCode": "1023",
      "nickname": "张三",
      "avatarUrl": "https://..."
    }
  }
}
```

### Response for Admin

```json
{
  "data": {
    "type": "ADMIN",
    "admin": {
      "id": "adm_123",
      "username": "admin",
      "displayName": "Warehouse Admin",
      "role": "ADMIN"
    }
  }
}
```

---

## 9. User APIs

## 9.1 Get User Profile

```http
GET /user/profile
```

Auth: User

### Response

```json
{
  "data": {
    "id": "usr_123",
    "userCode": "1023",
    "nickname": "张三",
    "avatarUrl": "https://...",
    "createdAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 9.2 Admin List Users

```http
GET /admin/users?page=1&pageSize=20&search=1023
```

Auth: Admin

### Query Params

| Param | Required | Description |
|---|---|---|
| `page` | no | default `1` |
| `pageSize` | no | default `20`, max `100` |
| `search` | no | user code, nickname, partial id |

### Response

```json
{
  "data": [
    {
      "id": "usr_123",
      "userCode": "1023",
      "nickname": "张三",
      "avatarUrl": "https://...",
      "orderCount": 3,
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 10. Warehouse Address APIs

## 10.1 Get Warehouse Address

```http
GET /warehouse-address
```

Auth: User optional, but if authenticated include user-specific formatted address.

### Response

```json
{
  "data": {
    "receiverName": "广骏仓库-1023",
    "phone": "13800000000",
    "country": "中国",
    "province": "广东省",
    "city": "广州市",
    "district": "白云区",
    "addressLine": "示例路100号广骏仓库",
    "postalCode": "510000",
    "formattedAddress": "收件人：广骏仓库-1023，电话：13800000000，地址：广东省广州市白云区示例路100号广骏仓库，邮编：510000",
    "instructions": [
      "请在淘宝/京东下单时复制本地址。",
      "收件人中请保留您的用户ID，方便仓库识别。",
      "仓库收到包裹后会拍照上传至小程序。"
    ]
  }
}
```

---

## 11. Order APIs — User

## 11.1 List My Orders

```http
GET /orders?page=1&pageSize=20&status=USER_CONFIRM_PENDING&paymentStatus=UNPAID
```

Auth: User

### Query Params

| Param | Required | Description |
|---|---|---|
| `page` | no | default `1` |
| `pageSize` | no | default `20`, max `100` |
| `status` | no | order status |
| `paymentStatus` | no | payment status |

### Response

```json
{
  "data": [
    {
      "id": "ord_123",
      "orderNo": "ORD-20260504-0001",
      "status": "USER_CONFIRM_PENDING",
      "paymentStatus": "UNPAID",
      "packageCount": 2,
      "chargeableWeight": 8.5,
      "finalPrice": null,
      "currency": "USD",
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 11.2 Get My Order Detail

```http
GET /orders/:orderId
```

Auth: User

### Response

```json
{
  "data": {
    "id": "ord_123",
    "orderNo": "ORD-20260504-0001",
    "status": "USER_CONFIRM_PENDING",
    "paymentStatus": "UNPAID",
    "totalActualWeight": 7.8,
    "totalVolumeWeight": 8.5,
    "chargeableWeight": 8.5,
    "estimatedPrice": 68.0,
    "finalPrice": null,
    "currency": "USD",
    "manualOverride": false,
    "packages": [
      {
        "id": "pkg_123",
        "packageNo": "PKG-20260504-0001",
        "domesticTrackingNo": "YT123456789",
        "sourcePlatform": "TAOBAO",
        "status": "USER_CONFIRM_PENDING",
        "actualWeight": 2.4,
        "lengthCm": 30,
        "widthCm": 20,
        "heightCm": 15,
        "volumeWeight": 1.5,
        "inboundAt": "2026-05-04T00:00:00.000Z",
        "images": [
          {
            "id": "img_123",
            "imageType": "OUTER",
            "url": "https://signed-url-or-public-url"
          }
        ]
      }
    ],
    "shipment": null,
    "createdAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 12. Order APIs — Admin

## 12.1 Admin List Orders

```http
GET /admin/orders?page=1&pageSize=20&search=1023&status=PAYMENT_PENDING&paymentStatus=UNPAID
```

Auth: Admin

### Query Params

| Param | Required | Description |
|---|---|---|
| `page` | no | page number |
| `pageSize` | no | page size |
| `search` | no | order no, user code, package no, tracking no |
| `status` | no | order status |
| `paymentStatus` | no | payment status |
| `from` | no | ISO date |
| `to` | no | ISO date |

### Response

```json
{
  "data": [
    {
      "id": "ord_123",
      "orderNo": "ORD-20260504-0001",
      "user": {
        "id": "usr_123",
        "userCode": "1023",
        "nickname": "张三"
      },
      "status": "PAYMENT_PENDING",
      "paymentStatus": "UNPAID",
      "packageCount": 2,
      "chargeableWeight": 8.5,
      "finalPrice": 68.0,
      "currency": "USD",
      "manualOverride": false,
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 12.2 Admin Create Order

```http
POST /admin/orders
```

Auth: Admin

### Request

```json
{
  "userId": "usr_123",
  "remark": "Customer asked to consolidate packages."
}
```

Alternative request using `userCode`:

```json
{
  "userCode": "1023",
  "remark": "Created from warehouse inbound."
}
```

### Response

```json
{
  "data": {
    "id": "ord_123",
    "orderNo": "ORD-20260504-0001",
    "status": "UNINBOUND",
    "paymentStatus": "UNPAID",
    "userId": "usr_123"
  }
}
```

---

## 12.3 Admin Get Order Detail

```http
GET /admin/orders/:orderId
```

Auth: Admin

Response same as user detail but includes admin-only fields:

```json
{
  "data": {
    "id": "ord_123",
    "orderNo": "ORD-20260504-0001",
    "user": {
      "id": "usr_123",
      "userCode": "1023",
      "nickname": "张三",
      "openidMasked": "oAbc***xyz"
    },
    "status": "PAYMENT_PENDING",
    "paymentStatus": "UNPAID",
    "manualOverride": false,
    "adminRemark": "internal note",
    "packages": [],
    "paymentRecords": [],
    "shipment": null,
    "exceptions": [],
    "statusLogs": []
  }
}
```

---

## 12.4 Admin Update Order Status

```http
PATCH /admin/orders/:orderId/status
```

Auth: Admin

### Request

```json
{
  "status": "PAYMENT_PENDING",
  "reason": "Review completed."
}
```

### Response

```json
{
  "data": {
    "id": "ord_123",
    "fromStatus": "REVIEW_PENDING",
    "toStatus": "PAYMENT_PENDING",
    "updatedAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 12.5 Admin Update Payment Status

```http
PATCH /admin/orders/:orderId/payment-status
```

Auth: Admin

### Request

```json
{
  "paymentStatus": "PAID",
  "amount": 68.0,
  "currency": "USD",
  "paymentMethod": "WECHAT_EXTERNAL",
  "proofImageId": "img_123",
  "reason": "Payment confirmed outside mini program."
}
```

### Response

```json
{
  "data": {
    "id": "ord_123",
    "paymentStatus": "PAID",
    "status": "PAID",
    "confirmedAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 13. Package APIs — Admin

## 13.1 Create Inbound Package

```http
POST /admin/packages/inbound
```

Auth: Admin

### Request

```json
{
  "userCode": "1023",
  "orderId": "ord_123",
  "domesticTrackingNo": "YT123456789",
  "sourcePlatform": "TAOBAO",
  "actualWeight": 2.4,
  "lengthCm": 30,
  "widthCm": 20,
  "heightCm": 15,
  "imageIds": ["img_123", "img_456"],
  "remark": "Outer package intact."
}
```

`orderId` may be optional if backend should create an open order automatically.

### Response

```json
{
  "data": {
    "package": {
      "id": "pkg_123",
      "packageNo": "PKG-20260504-0001",
      "status": "USER_CONFIRM_PENDING",
      "actualWeight": 2.4,
      "volumeWeight": 1.5
    },
    "order": {
      "id": "ord_123",
      "orderNo": "ORD-20260504-0001",
      "status": "USER_CONFIRM_PENDING"
    }
  }
}
```

---

## 13.2 Admin Update Package

```http
PATCH /admin/packages/:packageId
```

Auth: Admin

### Request

```json
{
  "actualWeight": 2.6,
  "lengthCm": 32,
  "widthCm": 20,
  "heightCm": 15,
  "remark": "Corrected weight."
}
```

### Response

```json
{
  "data": {
    "id": "pkg_123",
    "actualWeight": 2.6,
    "volumeWeight": 1.6,
    "updatedAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 14. Package APIs — User

## 14.1 Get Package Detail

```http
GET /packages/:packageId
```

Auth: User

### Response

```json
{
  "data": {
    "id": "pkg_123",
    "packageNo": "PKG-20260504-0001",
    "status": "USER_CONFIRM_PENDING",
    "actualWeight": 2.4,
    "lengthCm": 30,
    "widthCm": 20,
    "heightCm": 15,
    "volumeWeight": 1.5,
    "images": [
      {
        "id": "img_123",
        "imageType": "OUTER",
        "url": "https://signed-url"
      }
    ]
  }
}
```

---

## 14.2 User Confirm Package

```http
POST /packages/:packageId/confirm
```

Auth: User

### Request

```json
{
  "remark": "确认无误"
}
```

### Response

```json
{
  "data": {
    "packageId": "pkg_123",
    "status": "CONFIRMED",
    "confirmedAt": "2026-05-04T00:00:00.000Z",
    "order": {
      "id": "ord_123",
      "status": "REVIEW_PENDING"
    }
  }
}
```

---

## 14.3 User Report Package Issue

```http
POST /packages/:packageId/issue
```

Auth: User

### Request

```json
{
  "type": "DAMAGED",
  "description": "外包装有破损，请检查内部物品。",
  "imageIds": ["img_789"]
}
```

### Response

```json
{
  "data": {
    "exception": {
      "id": "exc_123",
      "type": "DAMAGED",
      "status": "OPEN",
      "description": "外包装有破损，请检查内部物品。"
    },
    "package": {
      "id": "pkg_123",
      "status": "EXCEPTION"
    },
    "order": {
      "id": "ord_123",
      "status": "EXCEPTION"
    }
  }
}
```

---

## 15. Image / Storage APIs

## 15.1 Create Signed Upload URL

```http
POST /images/upload-url
```

Auth: User or Admin

### Request

```json
{
  "imageType": "OUTER",
  "fileName": "package.jpg",
  "contentType": "image/jpeg",
  "targetType": "PACKAGE",
  "targetId": "pkg_123"
}
```

### Response

```json
{
  "data": {
    "imageId": "img_123",
    "bucket": "gjxpress-storage",
    "path": "packages/pkg_123/OUTER/20260504_uuid.jpg",
    "uploadUrl": "https://...",
    "token": "signed_upload_token",
    "expiresIn": 7200
  }
}
```

### Notes

- Backend generates safe storage path.
- The client uploads binary directly to Supabase signed upload URL if supported.
- After upload, client should call confirm metadata endpoint if needed.

---

## 15.2 Confirm Image Upload

```http
POST /images/:imageId/complete
```

Auth: User or Admin

### Request

```json
{
  "size": 123456,
  "checksum": "optional"
}
```

### Response

```json
{
  "data": {
    "id": "img_123",
    "status": "UPLOADED"
  }
}
```

---

## 15.3 Get Image Signed Read URL

```http
GET /images/:imageId/signed-url
```

Auth: Owner or Admin

### Response

```json
{
  "data": {
    "url": "https://signed-read-url",
    "expiresIn": 3600
  }
}
```

---

## 16. Exception APIs — Admin

## 16.1 List Exceptions

```http
GET /admin/exceptions?page=1&pageSize=20&status=OPEN&type=DAMAGED
```

Auth: Admin

### Response

```json
{
  "data": [
    {
      "id": "exc_123",
      "type": "DAMAGED",
      "status": "OPEN",
      "orderNo": "ORD-20260504-0001",
      "packageNo": "PKG-20260504-0001",
      "userCode": "1023",
      "description": "外包装有破损",
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 16.2 Update Exception

```http
PATCH /admin/exceptions/:exceptionId
```

Auth: Admin

### Request

```json
{
  "status": "RESOLVED",
  "resolution": "已联系客户确认，继续处理。",
  "nextOrderStatus": "REVIEW_PENDING"
}
```

### Response

```json
{
  "data": {
    "id": "exc_123",
    "status": "RESOLVED",
    "resolvedAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 17. Shipment APIs

## 17.1 Admin Create Shipment

```http
POST /admin/shipments
```

Auth: Admin

### Request

```json
{
  "orderId": "ord_123",
  "provider": "DHL",
  "trackingNumber": "DHL123456789",
  "shippedAt": "2026-05-04T00:00:00.000Z",
  "estimatedArrivalAt": "2026-05-12T00:00:00.000Z",
  "override": false,
  "reason": "Normal shipment."
}
```

### Response

```json
{
  "data": {
    "id": "shp_123",
    "orderId": "ord_123",
    "provider": "DHL",
    "trackingNumber": "DHL123456789",
    "status": "SHIPPED",
    "orderStatus": "SHIPPED"
  }
}
```

### Business Rule

If `order.paymentStatus != PAID` and `override = false`, return:

```json
{
  "error": {
    "code": "ORDER_NOT_PAID",
    "message": "Order must be paid before shipment unless admin override is used."
  }
}
```

---

## 17.2 User Get Shipment

```http
GET /shipments/:orderId
```

Auth: User

### Response

```json
{
  "data": {
    "id": "shp_123",
    "provider": "DHL",
    "trackingNumber": "DHL123456789",
    "status": "SHIPPED",
    "shippedAt": "2026-05-04T00:00:00.000Z",
    "estimatedArrivalAt": "2026-05-12T00:00:00.000Z",
    "events": []
  }
}
```

---

## 18. QR APIs

## 18.1 Admin Generate QR Token

```http
POST /admin/orders/:orderId/qr
```

Auth: Admin

### Request

```json
{
  "purpose": "RECEIPT_CONFIRMATION",
  "expiresInHours": 168
}
```

### Response

```json
{
  "data": {
    "qrCodeId": "qr_123",
    "token": "raw_token_for_qr_payload",
    "payload": "gjxpress://qr/scan?token=raw_token_for_qr_payload",
    "expiresAt": "2026-05-11T00:00:00.000Z"
  }
}
```

### Notes

- Store token hash in DB.
- Return raw token only once.

---

## 18.2 User Scan QR

```http
POST /qr/scan
```

Auth: User

### Request

```json
{
  "token": "raw_token_from_qr"
}
```

### Response — Authorized User

```json
{
  "data": {
    "authorized": true,
    "result": "ORDER_COMPLETED",
    "order": {
      "id": "ord_123",
      "status": "COMPLETED"
    }
  }
}
```

### Response — Unauthorized User

```json
{
  "data": {
    "authorized": false,
    "result": "NO_ACTION",
    "message": "该二维码仅限原下单账号使用。"
  }
}
```

---

## 19. Notification APIs

## 19.1 Create Subscription Preference

```http
POST /notifications/subscription
```

Auth: User

### Request

```json
{
  "templateIds": ["template_id_1", "template_id_2"],
  "source": "WECHAT_SUBSCRIBE_MESSAGE"
}
```

### Response

```json
{
  "data": {
    "saved": true
  }
}
```

## 19.2 Admin List Notifications

```http
GET /admin/notifications
```

Auth: Admin

---

## 20. Admin Logs

## 20.1 List Admin Action Logs

```http
GET /admin/action-logs?page=1&pageSize=20&targetType=ORDER&targetId=ord_123
```

Auth: Admin

### Response

```json
{
  "data": [
    {
      "id": "log_123",
      "admin": {
        "id": "adm_123",
        "displayName": "Warehouse Admin"
      },
      "targetType": "ORDER",
      "targetId": "ord_123",
      "action": "UPDATE_PAYMENT_STATUS",
      "beforeState": {
        "paymentStatus": "UNPAID"
      },
      "afterState": {
        "paymentStatus": "PAID"
      },
      "reason": "Payment confirmed externally.",
      "createdAt": "2026-05-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 21. Recommendation APIs

## 21.1 Public List Recommendations

```http
GET /public/recommendations?page=1&pageSize=20&category=food&city=los-angeles
```

Auth: Public

### Response

```json
{
  "data": [
    {
      "id": "rec_123",
      "slug": "best-chinese-market-la",
      "title": "洛杉矶华人超市推荐",
      "summary": "适合新移民和留学生的超市列表。",
      "category": "local-guide",
      "city": "los-angeles",
      "tags": ["华人", "超市"],
      "publishedAt": "2026-05-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 21.2 Public Get Recommendation

```http
GET /public/recommendations/:slug
```

Auth: Public

### Response

```json
{
  "data": {
    "id": "rec_123",
    "slug": "best-chinese-market-la",
    "title": "洛杉矶华人超市推荐",
    "summary": "适合新移民和留学生的超市列表。",
    "body": "Markdown or rich text content",
    "category": "local-guide",
    "city": "los-angeles",
    "tags": ["华人", "超市"],
    "seoTitle": "洛杉矶华人超市推荐 | GJXpress",
    "seoDescription": "整理洛杉矶华人常用超市。",
    "publishedAt": "2026-05-04T00:00:00.000Z"
  }
}
```

---

## 21.3 Admin Create Recommendation

```http
POST /admin/recommendations
```

Auth: Admin

### Request

```json
{
  "title": "洛杉矶华人超市推荐",
  "slug": "best-chinese-market-la",
  "summary": "适合新移民和留学生的超市列表。",
  "body": "Markdown content",
  "category": "local-guide",
  "city": "los-angeles",
  "tags": ["华人", "超市"],
  "status": "DRAFT",
  "seoTitle": "洛杉矶华人超市推荐 | GJXpress",
  "seoDescription": "整理洛杉矶华人常用超市。"
}
```

---

## 22. API Implementation Requirements

## 22.1 DTO Validation

Use DTOs for all body/query params.

Examples:

- `WechatLoginDto`
- `AdminLoginDto`
- `CreateInboundPackageDto`
- `UpdatePaymentStatusDto`
- `CreateShipmentDto`
- `CreateRecommendationDto`

## 22.2 Guards

Use:

- `JwtAuthGuard`
- `UserGuard`
- `AdminGuard`
- `SuperAdminGuard`
- `OwnershipGuard` or service-level ownership validation

## 22.3 Pagination Helper

Implement shared pagination utility.

Input:

```text
page, pageSize
```

Output:

```text
skip, take, pagination metadata
```

## 22.4 Error Helper

Implement domain error helper for common business errors.

## 22.5 API Versioning

V1 can use no prefix or `/v1`.

If versioning is enabled, use:

```text
/v1/orders
/v1/admin/orders
```

Pick one approach and keep consistent.

Recommended for MVP:

```text
No version prefix initially.
```

Add versioning later when external clients depend on API.

---

## 23. Web Logistics Phase 1 — Admin Core CRUD APIs

> Auth: All endpoints require `Authorization: Bearer <ADMIN_TOKEN>`.
> No token → 401. Non-admin token → 403.
> Every response includes header: `X-Request-Id: <uuid>`
> Error responses include `requestId` in body.

---

## 23.1 Customer API

### POST /api/admin/customers

Create a new customer. `customerCode` is auto-generated (format: `GJ####`, e.g. `GJ0427`). Not a login credential.

**Request:**
```json
{
  "phoneCountryCode": "+86",
  "phoneNumber": "13800000000",
  "wechatId": "wx_zhangsan",
  "domesticReturnAddress": "广东省广州市天河区..."
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "customerCode": "GJ0427",
  "phoneCountryCode": "+86",
  "phoneNumber": "13800000000",
  "wechatId": "wx_zhangsan",
  "domesticReturnAddress": "广东省广州市天河区...",
  "status": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Errors:** 409 if phone number already exists.

---

### GET /api/admin/customers

List customers with search and pagination.

**Query params:** `q`, `status` (`ACTIVE`|`DISABLED`), `page`, `pageSize`

`q` searches: `customerCode`, `phoneNumber`, `wechatId`. If `status` is omitted, all customer statuses are returned. Default `page=1`, `pageSize=20`, max `pageSize=100`. Ordered by `createdAt desc`.

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "customerCode": "GJ3178",
      "phoneCountryCode": "+86",
      "phoneNumber": "13800000000",
      "wechatId": "wx_zhangsan",
      "domesticReturnAddress": "广东省广州市天河区...",
      "status": "ACTIVE",
      "createdAt": "2026-05-05T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

---

### GET /api/admin/customers/:id

Get customer detail including recent packages, shipments, and counts.

**Response 200:** Full customer object + `inboundPackages[]` (last 20) + `customerShipments[]` (last 10) + `_count`.

**Errors:** 404 if not found.

---

### PATCH /api/admin/customers/:id

Update customer fields. Cannot change `customerCode`.

**Request (all optional):**
```json
{
  "phoneCountryCode": "+1",
  "phoneNumber": "4155550000",
  "wechatId": "wx_lisi",
  "domesticReturnAddress": "广东省广州市越秀区...",
  "status": "ACTIVE"
}
```

`status` accepts only `ACTIVE` or `DISABLED`. `customerCode` is immutable through this endpoint.

**Errors:** 400 if status is invalid. 401 if bearer token is missing/invalid. 403 if the token is not admin. 404 if not found. 409 if new phone conflicts.

---

### PATCH /api/admin/customers/:id/disable

Soft-disable customer. Sets `status = DISABLED`. **No hard delete.** Customers with associated packages/shipments must never be hard deleted.

**Response 200:**
```json
{
  "data": { "id": "...", "customerCode": "GJ0427", "status": "DISABLED", "updatedAt": "..." }
}
```

**Errors:** 404 if not found.

---

## 23.2 InboundPackage API

### POST /api/admin/inbound-packages

Create an inbound package record.

**Request:**
```json
{
  "domesticTrackingNo": "YT123456789",
  "customerCode": "GJ0427",
  "warehouseReceivedAt": "2026-05-05T10:00:00.000Z",
  "adminNote": "内部备注"
}
```

**Rules:**
- `domesticTrackingNo` is optional. Empty string is normalized to `null`.
- If `domesticTrackingNo` is provided, duplicate non-null values return **409**.
- If `customerCode` provided and not found → **404** (not silent).
- If `customerCode` omitted → status defaults to `UNIDENTIFIED` (`未识别`).
- If `customerCode` is provided and resolved to a Customer → DB stores `customerId` UUID FK and status defaults to `ARRIVED` (`已入库`).
- Admin API uses `customerCode` as the business identifier. The database continues to store `customer_id` as the UUID FK.

**Response 201:** `{ "data": { ...package, "statusText": "已入库", "customer": { "id": "uuid", "customerCode": "GJ0427", "phoneNumber": "...", "wechatId": "..." } } }`

**Errors:** 404 if customerCode not found. 409 if `domesticTrackingNo` duplicate.

---

### GET /api/admin/inbound-packages

**Query params:** `q`, `status`, `customerId`, `customerCode`, `page`, `pageSize`

`q` searches: `domesticTrackingNo`, `customerCode`, `phoneNumber`, `wechatId` via relation. If `status` is omitted, all package statuses are returned. Ordered by `createdAt desc`.

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "domesticTrackingNo": null,
      "status": "ARRIVED",
      "statusText": "已入库",
      "customer": {
        "id": "uuid",
        "customerCode": "GJ3178",
        "phoneCountryCode": "+86",
        "phoneNumber": "13800000000",
        "wechatId": "wx_zhangsan"
      },
      "customerId": "uuid",
      "warehouseReceivedAt": "2026-05-05T10:00:00.000Z",
      "adminNote": "内部备注",
      "issueNote": null,
      "imageUrls": [],
      "inShipment": false,
      "createdAt": "2026-05-05T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

---

### GET /api/admin/inbound-packages/:id

Returns package detail including `customer`, `shipmentItems` (with shipment info), `statusText`, and `imageUrls`.

---

### PATCH /api/admin/inbound-packages/:id

General update. All fields optional.

**Request (all optional):**
```json
{
  "domesticTrackingNo": "...",
  "warehouseReceivedAt": "...",
  "issueNote": "...",
  "adminNote": "...",
  "status": "ARRIVED"
}
```

**Errors:** 404 if not found. 409 if `domesticTrackingNo` conflicts.

---

### PATCH /api/admin/inbound-packages/:id/assign-customer

Bind an unclaimed package to a customer.

**Request:**
```json
{ "customerCode": "GJ0427" }
```

**Rules:** 409 if already assigned. 404 if customerCode not found. Status changes from `UNIDENTIFIED` → `ARRIVED`.

---

### PATCH /api/admin/inbound-packages/:id/status

Update status only.

**Request:**
```json
{ "status": "ARRIVED" }
```

Valid values: `UNIDENTIFIED`, `ARRIVED`, `CONSOLIDATED`.

**Errors:** 400 for invalid status.

---

## 23.3 CustomerShipment API

### POST /api/admin/customer-shipments

Create a customer shipment (集运单).

**Request:**
```json
{
  "customerCode": "GJ0427",
  "inboundPackageIds": ["uuid1", "uuid2"],
  "quantity": 3,
  "actualWeightKg": "2",
  "volumeFormula": "35*28*13/5000=2.548",
  "billingRateCnyPerKg": "80",
  "billingWeightKg": "3",
  "notes": "内部备注"
}
```

**Rules:**
- `shipmentNo` auto-generated: `GJS{yyyyMMdd}{3-digit-rand}` e.g. `GJS20260505001`.
- Admin submits `customerCode`; backend resolves and stores internal `customerId` UUID FK.
- Decimal fields accept JSON strings or numbers and are persisted as decimal values.
- Packages must belong to same customer.
- Packages already in another shipment → 409.
- Packages added → their status set to `CONSOLIDATED`.
- `quantity` is optional, defaults to `1`, and must be an integer >= 1.
- Default `status=PACKED`, `paymentStatus=UNPAID`.

---

### GET /api/admin/customer-shipments

**Query params:** `q`, `status`, `paymentStatus`, `customerId`, `masterShipmentId`, `page`, `pageSize`

`q` searches: `shipmentNo`, `customerCode`, `phoneNumber`

List and detail responses include `customerId`, `customer`, `status`, `paymentStatus`, billing fields, `quantity`, stable `imageUrls: []`, `notes`, timestamps, and `statusText`. Decimal fields are serialized as JSON strings by Prisma.

---

### GET /api/admin/customer-shipments/:id

Returns shipment with `customer`, `items` (with package details), `masterShipment`, `transactions`.

---

### PATCH /api/admin/customer-shipments/:id

General update.

**Request (all optional):**
```json
{
  "customerCode": "GJ0427",
  "notes": "...",
  "internationalTrackingNo": "...",
  "publicTrackingEnabled": true,
  "status": "PACKED",
  "paymentStatus": "PAID",
  "quantity": 3,
  "actualWeightKg": "2",
  "volumeFormula": "35*28*13/5000=2.548",
  "billingRateCnyPerKg": "80",
  "billingWeightKg": "3"
}
```

If `status` is set, timestamp fields are auto-populated (see status endpoint rules). If a timestamp is already set, it is not overwritten.

---

### PATCH /api/admin/customer-shipments/:id/status

Update status with automatic timestamp population.

**Request:**
```json
{ "status": "SHIPPED", "forcedAt": "2026-05-05T10:00:00.000Z" }
```

Auto-populated timestamps (only if not already set):

| Status | Field set |
|---|---|
| `SHIPPED` | `sentToOverseasAt` |
| `ARRIVED` | `arrivedOverseasAt` |
| `READY_FOR_PICKUP` | `localDeliveryRequestedAt` |
| `PICKED_UP` | `pickedUpAt` |

Valid values: `PACKED`, `SHIPPED`, `ARRIVED`, `READY_FOR_PICKUP`, `PICKED_UP`, `EXCEPTION`.

`forcedAt` (optional) overrides the timestamp value. **Errors:** 400 for invalid status.

---

### PATCH /api/admin/customer-shipments/:id/payment-status

Update payment status only. **No online payment integration.** Manual record only.

**Request:**
```json
{ "paymentStatus": "PAID" }
```

Valid values: `UNPAID`, `PROCESSING`, `PENDING`, `PAID`, `WAIVED`, `REFUNDED`

---

### POST /api/admin/customer-shipments/:id/items

Add an inbound package to the shipment.

**Request:**
```json
{ "inboundPackageId": "uuid" }
```

**Rules:** Package must belong to same customer. 409 if already in another shipment. Package status set to `CONSOLIDATED`.

---

### DELETE /api/admin/customer-shipments/:id/items/:itemId

Remove a package from the shipment.

**Rules:** Cannot remove if shipment status is `SHIPPED`, `ARRIVED`, `READY_FOR_PICKUP`, or `PICKED_UP` → 409. Package status restored to `ARRIVED`.

---

## 23.4 Delete / Archive Policy

| Resource | Hard Delete | Soft Disable/Cancel | Reason |
|---|---|---|---|
| Customer | ❌ Never | ✅ `PATCH /:id/disable` (status=DISABLED) | Has packages/shipments |
| InboundPackage | ❌ Never | ❌ Not implemented (no `archivedAt` in schema) | Avoid business record loss |
| CustomerShipment | ✅ `DELETE /:id?confirm=DELETE_HARD` | ❌ Cancel endpoint removed; use status `EXCEPTION` only for exception handling | Hard delete is blocked if in-transit/completed, batched, or has transactions |
| CustomerShipmentItem | N/A | ✅ `DELETE /:id/items/:itemId` (blocked if in transit) | Restores package to ARRIVED |

---

## 23.5 Error Response Shape

All error responses from admin APIs:

```json
{
  "statusCode": 409,
  "error": "ConflictException",
  "message": "Phone number already exists",
  "requestId": "abc-123-uuid",
  "timestamp": "2026-05-05T10:00:00.000Z",
  "path": "/api/admin/customers"
}
```

- `requestId` matches the `X-Request-Id` response header.
- Stack traces never returned to client.
- 400: validation/bad enum. 401: no token. 403: user token on admin route. 404: entity not found. 409: conflict (duplicate/locked).

---

## 23.6 curl Quick Reference

```bash
ADMIN_TOKEN="<ADMIN_TOKEN>"
BASE="http://localhost:3000/api"

# Customers
curl -s -X POST "$BASE/admin/customers" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"13800000001","wechatId":"wx_test","domesticReturnAddress":"广东省广州市..."}'

curl -s "$BASE/admin/customers?q=GJ&page=1&pageSize=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -s "$BASE/admin/customers/<id>" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -s -X PATCH "$BASE/admin/customers/<id>" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DISABLED"}'

curl -s -X PATCH "$BASE/admin/customers/<id>/disable" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# InboundPackages
curl -s -X POST "$BASE/admin/inbound-packages" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerCode":"GJ0001","warehouseReceivedAt":"2026-05-05T10:00:00.000Z","adminNote":"无国内单号也可创建"}'

curl -s "$BASE/admin/inbound-packages?status=ARRIVED" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -s -X PATCH "$BASE/admin/inbound-packages/<id>" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adminNote":"已确认重量"}'

curl -s -X PATCH "$BASE/admin/inbound-packages/<id>/assign-customer" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerCode":"GJ0001"}'

# CustomerShipments
curl -s -X POST "$BASE/admin/customer-shipments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerCode":"GJ0001","inboundPackageIds":["<pkg-uuid>"],"quantity":3}'

curl -s "$BASE/admin/customer-shipments?status=PACKED" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl -s -X PATCH "$BASE/admin/customer-shipments/<id>/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"SHIPPED"}'

curl -s -X PATCH "$BASE/admin/customer-shipments/<id>/payment-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus":"PAID"}'

# Transactions
curl -s -X POST "$BASE/admin/transactions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerShipmentId":"<shipment-uuid>","type":"SHIPPING_FEE","amountCents":16000,"adminNote":"运费支付订单"}'

# Transaction creation derives customerId from customerShipmentId, creates a
# TransactionRecord, and for SHIPPING_FEE marks CustomerShipment.paymentStatus=PAID.
# GET /admin/transactions returns all types by default, including SHIPPING_FEE.

# Check X-Request-Id in response
curl -si "$BASE/admin/customers" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | grep -i x-request-id
```

---

## 24. Web Logistics Phase 2 — Images, Billing & Batch Management

> Auth: All endpoints require admin JWT.
> Image uploads use `multipart/form-data` (field name: `file`).
> Max image size: **10 MB**. Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/heic`.
> Images stored in Supabase Storage bucket configured by `SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES`. Public URLs are stable and stored in `imageUrls[]`.
> Hard deleting an inbound package or customer shipment removes its own `imageUrls[]` Storage objects first. If Storage deletion fails, the database record is not deleted.

---

## 24.1 InboundPackage — Image Endpoints

### GET /api/admin/inbound-packages/:id/images

List image URLs for an inbound package.

**Response 200:**
```json
{ "items": ["https://storage.url/..."] }
```

---

### POST /api/admin/inbound-packages/:id/images

Upload a new image. Multipart form-data, field `file`.

**Response 201:**
```json
{ "url": "https://storage.url/...", "imageUrls": ["https://..."] }
```

**Errors:** 400 for missing file, unsupported MIME type, or file > 10 MB. 404 if package not found.

---

### DELETE /api/admin/inbound-packages/:id/images?imageUrl=<encoded-url>&confirm=DELETE_HARD

Delete an image. Removes from Supabase Storage and from `imageUrls[]`.

**Query params:**
| Param | Required | Description |
|---|---|---|
| `imageUrl` | yes | Full public URL of the image to delete |
| `confirm` | yes | Must be `DELETE_HARD` |

**Response 200:**
```json
{ "deleted": true, "url": "https://...", "imageUrls": ["https://..."] }
```

**Errors:** 400 if `confirm` missing or invalid, `imageUrl` missing, or URL not in package. 404 if package not found.

---

## 24.2 CustomerShipment — Image Endpoints

### GET /api/admin/customer-shipments/:id/images

List image URLs for a customer shipment.

**Response 200:**
```json
{ "items": ["https://storage.url/..."] }
```

---

### POST /api/admin/customer-shipments/:id/images

Upload a new image. Multipart form-data, field `file`.

**Response 201:**
```json
{ "url": "https://storage.url/...", "imageUrls": ["https://..."] }
```

**Errors:** 400 for missing file, unsupported MIME type, or file > 10 MB. 404 if shipment not found.

---

### DELETE /api/admin/customer-shipments/:id/images?imageUrl=<encoded-url>&confirm=DELETE_HARD

Delete an image. Removes from Supabase Storage and from `imageUrls[]`.

**Query params:**
| Param | Required | Description |
|---|---|---|
| `imageUrl` | yes | Full public URL of the image to delete |
| `confirm` | yes | Must be `DELETE_HARD` |

**Response 200:**
```json
{ "deleted": true, "url": "https://...", "imageUrls": ["https://..."] }
```

---

## 24.3 CustomerShipment — Billing Fields

Billing fields can be set on **create** (`POST`) and **update** (`PATCH`). All are optional strings (store as text to avoid float precision issues on client side).

| Field | Description |
|---|---|
| `actualWeightKg` | Measured weight in kg |
| `volumeFormula` | Formula string e.g. `"30x20x15/6000"` |
| `billingRateCnyPerKg` | Rate per kg in CNY e.g. `"28.5"` |
| `billingWeightKg` | Chargeable weight after formula e.g. `"2.1"` |

**Create example:**
```json
{
  "customerCode": "GJ0427",
  "inboundPackageIds": ["uuid"],
  "actualWeightKg": "1.800",
  "volumeFormula": "30x20x15/6000",
  "billingRateCnyPerKg": "28.5",
  "billingWeightKg": "2.1"
}
```

**Update example:**
```json
{
  "actualWeightKg": "2.100",
  "billingWeightKg": "2.1",
  "billingRateCnyPerKg": "30.0"
}
```

---

## 24.4 CustomerShipment — Unbatched Filter

Get shipments not yet associated with any `MasterShipment`:

```http
GET /api/admin/customer-shipments?unbatched=true
```

Combine with other filters: `status`, `paymentStatus`, `customerId`, `q`, `page`, `pageSize`.

---

## 24.5 MasterShipment — Create with Batch

### POST /api/admin/master-shipments

Create a batch and atomically link customer shipments.

**Request:**
```json
{
  "shipmentType": "AIR_GENERAL",
  "vendorName": "DHL",
  "vendorTrackingNo": "DHL1234567890",
  "customerShipmentIds": ["uuid1", "uuid2"],
  "adminNote": "First batch of May"
}
```

**Rules:**
- `vendorName`, `vendorTrackingNo`, `customerShipmentIds` are all **required**.
- `shipmentType` is optional for backward compatibility and defaults to `AIR_GENERAL`.
- Allowed `shipmentType` values: `AIR_GENERAL`（空运普货）, `AIR_SENSITIVE`（空运敏货）, `SEA`（海运）.
- `customerShipmentIds` must be non-empty.
- No duplicate IDs in the array → 400.
- All IDs must exist → 404 with list of missing IDs.
- None of the shipments may already belong to another batch → 409 with conflicting IDs.
- Creation and linking happen in a single database transaction.

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "batchNo": "GJB20260515001",
    "shipmentType": "AIR_GENERAL",
    "vendorName": "DHL",
    "vendorTrackingNo": "DHL1234567890",
    "status": "CREATED",
    "adminNote": "First batch of May",
    "customerShipments": [
      {
        "id": "uuid1",
        "shipmentNo": "GJS20260515001",
        "status": "PACKED",
        "paymentStatus": "UNPAID",
        "customer": { "id": "...", "customerCode": "GJ0001" }
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:** 400 for missing/empty fields or duplicate IDs. 404 for unknown shipment IDs. 409 for already-batched shipments.

Migration `add_master_shipment_type` adds `master_shipments.shipment_type` with default `AIR_GENERAL`.

---

## 24.6 curl Quick Reference — Phase 2

```bash
ADMIN_TOKEN="<ADMIN_TOKEN>"
BASE="http://localhost:3000/api"
PKG_ID="<inbound-package-id>"
CS_ID="<customer-shipment-id>"

# Upload image to inbound package
curl -s -X POST "$BASE/admin/inbound-packages/$PKG_ID/images" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@/tmp/package_photo.jpg"

# List images of inbound package
curl -s "$BASE/admin/inbound-packages/$PKG_ID/images" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Delete image from inbound package
IMAGE_URL="https://...supabase.co/storage/v1/object/public/..."
curl -s -X DELETE "$BASE/admin/inbound-packages/$PKG_ID/images?imageUrl=$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))' "$IMAGE_URL")&confirm=DELETE_HARD" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Upload image to customer shipment
curl -s -X POST "$BASE/admin/customer-shipments/$CS_ID/images" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@/tmp/shipment_label.jpg"

# List unbatched customer shipments
curl -s "$BASE/admin/customer-shipments?unbatched=true&status=PACKED" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Create master shipment batch
curl -s -X POST "$BASE/admin/master-shipments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorName":"DHL","vendorTrackingNo":"DHL123456","customerShipmentIds":["<uuid1>","<uuid2>"]}'
```

---

## 25. Phase 3 — Customer Registration Review & domesticReturnAddress

> Auth: Public registration requires no auth. All Admin endpoints require `ADMIN_TOKEN`.
> customerCode format: `GJ` + 4 digits (e.g. `GJ0427`). Generated uniquely across both `Customer` and `CustomerRegistration` tables.
> Duplicate phone (PENDING or APPROVED) → 409. Already a formal Customer → 409.

---

## 25.1 Customer — domesticReturnAddress Field

The `Customer` model now includes `domesticReturnAddress` (optional text). Available on all admin endpoints.

**Create:**
```json
{
  "phoneCountryCode": "+86",
  "phoneNumber": "13800000000",
  "wechatId": "wechat_optional",
  "domesticReturnAddress": "广东省广州市天河区..."
}
```

**Update (PATCH /admin/customers/:id):**
```json
{
  "domesticReturnAddress": "新地址"
}
```

**Response** includes `domesticReturnAddress` in all list/detail responses.

---

## 25.2 Public — Submit Customer Registration

### POST /api/customer-registrations

`POST /api/public/customer-registrations` is also supported for compatibility.

No auth required.

**Request:**
```json
{
  "phoneCountryCode": "+86",
  "phoneNumber": "13800000000",
  "wechatId": "wechat_optional",
  "domesticReturnAddress": "广东省广州市天河区..."
}
```

**Validation:**
- `phoneCountryCode` max 8 chars (default `+86`)
- `phoneNumber` required, max 32 chars, digits/+/spaces/hyphens only
- `wechatId` optional, max 64 chars
- `domesticReturnAddress` optional, max 2000 chars
- `notes` is not accepted

**Response 201:**
```json
{
  "id": "uuid",
  "customerCode": "GJ0427",
  "status": "PENDING",
  "message": "注册信息已提交，请等待工作人员审核。"
}
```

**Errors:**
- 400 — validation failure
- 409 — same phone already has PENDING registration (waiting review)
- 409 — same phone already has APPROVED registration (already a customer)
- 409 — same phone already exists as formal Customer

**Privacy:**
- Does NOT return list of registrations
- Does NOT return other applicants' data
- Does NOT return ipHash, userAgent, reviewNote, approvedByAdminId, notes
- Reject/rejected flow is no longer used.

---

## 25.3 Admin — Customer Registration List

### GET /api/admin/customer-registrations

**Query params:**
| Param | Required | Description |
|---|---|---|
| `q` | no | Search customerCode, phoneNumber, wechatId |
| `status` | no | `PENDING` only; defaults to pending records |
| `page` | no | Default 1 |
| `pageSize` | no | Default 20, max 100 |

**Response 200:**
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 20,
  "total": 5,
  "totalPages": 1
}
```

Each item includes: `id`, `customerCode`, `phoneCountryCode`, `phoneNumber`, `wechatId`, `domesticReturnAddress`, `status`, `createdAt`, `updatedAt`. It does not include `notes`, `reviewNote`, or rejection fields.

---

## 25.4 Admin — Create Registration (Manual)

### POST /api/admin/customer-registrations

Admin creates a registration manually, enters PENDING queue.

**Request:** Same as Public (`phoneNumber` required, others optional).

**Response 201:** Full registration object.

**Errors:** Same 409 conflicts as Public endpoint.

---

## 25.5 Admin — Get Registration Detail

### GET /api/admin/customer-registrations/:id

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "customerCode": "GJ0427",
    "phoneCountryCode": "+86",
    "phoneNumber": "13800000000",
    "wechatId": "optional",
    "domesticReturnAddress": "...",
    "status": "PENDING",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

After approval, the registration row is hard deleted, so this endpoint returns 404 for the approved registration id.

**Errors:** 404 if not found.

---

## 25.6 Admin — Update Registration

### PATCH /api/admin/customer-registrations/:id

Update registration info before approval. Does NOT approve.

**Allowed fields:**
- `phoneCountryCode`, `phoneNumber`, `wechatId`, `domesticReturnAddress`

**Response 200:** `{ data: updatedRegistration }`

---

## 25.7 Admin — Approve Registration

### POST /api/admin/customer-registrations/:id/approve

Approve and atomically create a formal `Customer`.

**Rules:**
- `customerCode` must not already exist in `Customer` table
- Phone must not already be a formal Customer (409)
- Uses `$transaction`: reads registration → creates `Customer` with the same `customerCode` → hard deletes the `CustomerRegistration`
- Does not store an APPROVED registration row and does not accept review notes

**Response 200:**
```json
{
  "approved": true,
  "deletedRegistrationId": "uuid",
  "customer": {
    "id": "uuid",
    "customerCode": "GJ0427",
    "phoneCountryCode": "+86",
    "phoneNumber": "13800000000",
    "wechatId": "optional",
    "domesticReturnAddress": "...",
    "status": "ACTIVE",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**
- 404 — registration not found
- 409 — phone already a formal Customer
- 409 — Customer already exists for customerCode GJ####

---

## 25.9 Admin — Hard Delete Registration

### DELETE /api/admin/customer-registrations/:id?confirm=DELETE_HARD

**Rules:**
- `confirm=DELETE_HARD` required (400 if missing)
- Deletes registration record only
- Does NOT delete any `Customer`

**Response 200:**
```json
{ "deleted": true, "id": "uuid" }
```

---

## 25.10 curl Quick Reference — Phase 3

```bash
ADMIN_TOKEN="<ADMIN_TOKEN>"
BASE="http://localhost:3000/api"

# Public: submit registration (no token)
curl -s -X POST "$BASE/public/customer-registrations" \
  -H "Content-Type: application/json" \
  -d '{"phoneCountryCode":"+86","phoneNumber":"13800000000","wechatId":"wx123","domesticReturnAddress":"广东省..."}'

# Admin: list pending registrations
curl -s "$BASE/admin/customer-registrations?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin: get detail
curl -s "$BASE/admin/customer-registrations/<reg-id>" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin: update registration info
curl -s -X PATCH "$BASE/admin/customer-registrations/<reg-id>" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"wechatId":"wx123","domesticReturnAddress":"广东省..."}'

# Admin: approve (creates Customer, deletes registration)
curl -s -X POST "$BASE/admin/customer-registrations/<reg-id>/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin: hard delete registration (does NOT delete Customer)
curl -s -X DELETE "$BASE/admin/customer-registrations/<reg-id>?confirm=DELETE_HARD" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin: create customer with domesticReturnAddress
curl -s -X POST "$BASE/admin/customers" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"13800000000","domesticReturnAddress":"广东省广州市..."}'

# Admin: update customer domesticReturnAddress
curl -s -X PATCH "$BASE/admin/customers/<cust-id>" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domesticReturnAddress":"新地址"}'
```
