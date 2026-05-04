# Miniprogram API Usage

本文档记录小程序调用的后端 API 接口。

Base URL: `https://api.gjxpress.net/api`

---

## Auth

### 微信登录

```http
POST /auth/wechat-login
```

Request:
```json
{
  "code": "wx_login_code",
  "nickname": "optional",
  "avatarUrl": "optional"
}
```

Response:
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
      "avatarUrl": "https://..."
    }
  }
}
```

---

## User

### 获取当前用户信息

```http
GET /user/me
```

Response:
```json
{
  "data": {
    "id": "usr_123",
    "userCode": "1023",
    "nickname": "张三",
    "avatarUrl": "https://..."
  }
}
```

---

## Orders

### 获取订单列表

```http
GET /orders?page=1&pageSize=20&status=&paymentStatus=
```

Response:
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
      "currency": "USD"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### 获取订单详情

```http
GET /orders/:id
```

Response:
```json
{
  "data": {
    "id": "ord_123",
    "orderNo": "ORD-20260504-0001",
    "status": "USER_CONFIRM_PENDING",
    "paymentStatus": "UNPAID",
    "packages": [...],
    "shipment": null
  }
}
```

---

## Packages

### 确认包裹

```http
POST /packages/:id/confirm
```

Request:
```json
{
  "remark": "确认无误"
}
```

### 提交包裹异常

```http
POST /packages/:id/issue
```

Request:
```json
{
  "type": "DAMAGED",
  "description": "外包装破损"
}
```

---

## Warehouse Address

### 获取仓库地址

```http
GET /warehouse-address
```

Response:
```json
{
  "data": {
    "receiverName": "广骏仓库-1023",
    "phone": "13800000000",
    "province": "广东省",
    "city": "广州市",
    "district": "白云区",
    "addressLine": "示例路100号",
    "formattedAddress": "..."
  }
}
```

---

## Common Headers

所有请求（除登录外）需携带：

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```
