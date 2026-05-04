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
    "bucket": "package-images",
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
