# miniprogram/docs/pages.md

# 广骏供应链服务微信小程序页面与实现说明

> Scope: WeChat native mini program pages, components, utilities, and UI flows.  
> This document is intended for Windsurf implementation.

---

## 1. 推荐目录结构

```text
miniprogram/
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── sitemap.json
├── config/
│   └── index.js
├── utils/
│   ├── request.js
│   ├── auth.js
│   ├── format.js
│   ├── status.js
│   └── storage.js
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── order.service.js
│   ├── package.service.js
│   ├── address.service.js
│   └── notification.service.js
├── components/
│   ├── status-tag/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── empty-state/
│   ├── error-state/
│   ├── package-card/
│   ├── image-gallery/
│   ├── price-row/
│   └── privacy-modal/
└── pages/
    ├── home/
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    ├── address/
    ├── orders/
    │   ├── list/
    │   └── detail/
    ├── profile/
    ├── privacy/
    └── customer-service/
```

---

## 2. app.json

建议：

```json
{
  "pages": [
    "pages/home/index",
    "pages/address/index",
    "pages/orders/list/index",
    "pages/orders/detail/index",
    "pages/profile/index",
    "pages/privacy/index",
    "pages/customer-service/index"
  ],
  "window": {
    "navigationBarTitleText": "广骏供应链服务",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f6f7f9"
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#d6a84f",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/home/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/address/index",
        "text": "地址"
      },
      {
        "pagePath": "pages/orders/list/index",
        "text": "订单"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我的"
      }
    ]
  },
  "sitemapLocation": "sitemap.json"
}
```

图标可以后续补充。MVP 阶段可以先不配置 iconPath，或使用简单本地 icon。

---

## 3. sitemap.json

小程序不需要公开索引订单详情等私人页面。建议：

```json
{
  "rules": [
    {
      "action": "allow",
      "page": "pages/home/index"
    },
    {
      "action": "disallow",
      "page": "*"
    }
  ]
}
```

---

## 4. config/index.js

```js
const ENV = 'dev';

const CONFIG = {
  dev: {
    API_BASE_URL: 'http://localhost:3000',
  },
  staging: {
    API_BASE_URL: 'https://api.gjxpress.net',
  },
  prod: {
    API_BASE_URL: 'https://api.gjxpress.net',
  },
};

module.exports = {
  ENV,
  ...CONFIG[ENV],
};
```

上线前需要改为：

```js
const ENV = 'prod';
```

注意：真机预览和线上审核必须使用 HTTPS API，不能使用 localhost。

---

## 5. utils/status.js

```js
const ORDER_STATUS_LABELS = {
  UNINBOUND: '未入库',
  INBOUNDED: '已入库',
  USER_CONFIRM_PENDING: '待用户确认',
  REVIEW_PENDING: '待审核',
  PAYMENT_PENDING: '待支付',
  PAID: '已支付',
  READY_TO_SHIP: '待发货',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  EXCEPTION: '异常处理中',
};

const PAYMENT_STATUS_LABELS = {
  UNPAID: '未支付',
  PROCESSING: '支付处理中',
  PAID: '已支付',
};

const PACKAGE_STATUS_LABELS = {
  UNINBOUND: '未入库',
  INBOUNDED: '已入库',
  USER_CONFIRM_PENDING: '待确认',
  CONFIRMED: '已确认',
  EXCEPTION: '异常处理中',
  SHIPPED: '已发货',
};

function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status || '-';
}

function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || status || '-';
}

function getPackageStatusLabel(status) {
  return PACKAGE_STATUS_LABELS[status] || status || '-';
}

module.exports = {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PACKAGE_STATUS_LABELS,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getPackageStatusLabel,
};
```

---

## 6. utils/storage.js

```js
const TOKEN_KEY = 'gjxpress_access_token';
const USER_KEY = 'gjxpress_user';

function getToken() {
  return wx.getStorageSync(TOKEN_KEY);
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

function getUser() {
  return wx.getStorageSync(USER_KEY);
}

function setUser(user) {
  wx.setStorageSync(USER_KEY, user);
}

function clearUser() {
  wx.removeStorageSync(USER_KEY);
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  getUser,
  setUser,
  clearUser,
};
```

---

## 7. utils/request.js

### 7.1 要求

- 所有 API 请求统一走 request wrapper。
- 自动加 JWT。
- 统一处理 401。
- 统一处理网络错误。
- 不直接在页面里写 `wx.request`。

### 7.2 示例实现

```js
const { API_BASE_URL } = require('../config/index');
const storage = require('./storage');
const auth = require('./auth');

function request(options) {
  const token = storage.getToken();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
      success: async (res) => {
        if (res.statusCode === 401 && !options.__retried) {
          try {
            await auth.login();
            const retried = await request({ ...options, __retried: true });
            resolve(retried);
          } catch (err) {
            reject(err);
          }
          return;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        reject({
          statusCode: res.statusCode,
          data: res.data,
        });
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

module.exports = request;
```

---

## 8. utils/auth.js

```js
const storage = require('./storage');
const { API_BASE_URL } = require('../config/index');

function wxLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) resolve(res.code);
        else reject(new Error('wx.login did not return code'));
      },
      fail: reject,
    });
  });
}

async function login() {
  const code = await wxLoginCode();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/auth/login`,
      method: 'POST',
      data: { code },
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const { accessToken, user } = res.data;
          storage.setToken(accessToken);
          storage.setUser(user);
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: reject,
    });
  });
}

function ensureLogin() {
  const token = storage.getToken();
  if (token) return Promise.resolve({ token, user: storage.getUser() });
  return login();
}

function logout() {
  storage.clearToken();
  storage.clearUser();
}

module.exports = {
  login,
  ensureLogin,
  logout,
};
```

---

## 9. services

### 9.1 auth.service.js

```js
const auth = require('../utils/auth');
module.exports = auth;
```

### 9.2 user.service.js

```js
const request = require('../utils/request');

function getProfile() {
  return request({ url: '/user/profile' });
}

module.exports = { getProfile };
```

### 9.3 address.service.js

```js
const request = require('../utils/request');

function getWarehouseAddress() {
  return request({ url: '/public/warehouse-address' });
}

module.exports = { getWarehouseAddress };
```

### 9.4 order.service.js

```js
const request = require('../utils/request');

function getOrders(params = {}) {
  return request({
    url: '/orders',
    method: 'GET',
    data: params,
  });
}

function getOrderDetail(id) {
  return request({
    url: `/orders/${id}`,
    method: 'GET',
  });
}

module.exports = {
  getOrders,
  getOrderDetail,
};
```

### 9.5 package.service.js

```js
const request = require('../utils/request');

function confirmPackage(packageId) {
  return request({
    url: `/packages/${packageId}/confirm`,
    method: 'POST',
  });
}

function reportPackageIssue(packageId, data) {
  return request({
    url: `/packages/${packageId}/issue`,
    method: 'POST',
    data,
  });
}

module.exports = {
  confirmPackage,
  reportPackageIssue,
};
```

### 9.6 notification.service.js

```js
function requestSubscribe(tmplIds) {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: resolve,
      fail: reject,
    });
  });
}

module.exports = { requestSubscribe };
```

---

## 10. 页面说明

## 10.1 首页 `pages/home/index`

### 目标

提供品牌入口、地址复制入口、订单入口和用户最新状态摘要。

### 页面结构

```text
┌──────────────────────────────┐
│ 广骏国际快运                  │
│ 看得见的跨境物流              │
├──────────────────────────────┤
│ [复制国内仓地址]              │
│ [查看我的订单]                │
├──────────────────────────────┤
│ 我的物流状态                  │
│ 待确认 0 | 待支付 0 | 已发货 0 │
├──────────────────────────────┤
│ 使用说明                      │
│ 1. 复制仓库地址               │
│ 2. 电商平台下单               │
│ 3. 仓库入库后拍照确认         │
└──────────────────────────────┘
```

### 数据

- 登录用户 profile。
- 可选订单统计：如果后端没有统计接口，可通过 `/orders` 前端计算。

### 交互

- 点击复制地址：跳转到 `pages/address/index`。
- 点击我的订单：跳转到 `pages/orders/list/index`。
- 点击客服：跳转到 `pages/customer-service/index`。

### onLoad

```text
ensureLogin → getProfile → getOrders summary
```

---

## 10.2 地址页 `pages/address/index`

### 目标

展示并复制国内仓地址。

### 页面结构

```text
┌──────────────────────────────┐
│ 国内仓收货地址                │
├──────────────────────────────┤
│ 用户ID：1023                  │
│ 收件人：广骏仓-1023           │
│ 电话：xxx                     │
│ 地址：xxx                     │
├──────────────────────────────┤
│ [一键复制完整地址]            │
├──────────────────────────────┤
│ 使用说明：                    │
│ 在淘宝/京东下单时请保留用户ID │
└──────────────────────────────┘
```

### 核心逻辑

```js
copyAddress() {
  const text = `收件人：${recipient}\n电话：${phone}\n地址：${address}\n备注：请保留用户ID ${user.user_code}`;
  wx.setClipboardData({
    data: text,
    success: () => wx.showToast({ title: '已复制' })
  });
}
```

---

## 10.3 订单列表 `pages/orders/list/index`

### 目标

展示用户所有订单。

### 页面结构

```text
Tabs: 全部 / 待确认 / 待支付 / 已发货 / 异常

订单卡片：
┌──────────────────────────────┐
│ ORD-202605-0001              │
│ 状态：待用户确认              │
│ 支付：未支付                  │
│ 包裹：3件                     │
│ 计费重量：8.5kg               │
│ [查看详情]                    │
└──────────────────────────────┘
```

### 数据请求

```http
GET /orders?status=USER_CONFIRM_PENDING
```

如果后端暂时不支持 query filter，则前端本地过滤。

### 交互

- 点击订单卡片进入详情：

```js
wx.navigateTo({
  url: `/pages/orders/detail/index?id=${order.id}`
});
```

### 空状态

```text
暂无订单
复制国内仓地址后，在电商平台下单，仓库入库后将显示在这里。
```

按钮：`复制仓库地址`。

---

## 10.4 订单详情 `pages/orders/detail/index`

### 目标

展示订单、包裹、费用、物流、异常信息。

### 页面结构

```text
┌──────────────────────────────┐
│ 订单 ORD-202605-0001          │
│ 状态：待用户确认              │
│ 支付：未支付                  │
├──────────────────────────────┤
│ 包裹列表                      │
│ PKG-001                       │
│ 状态：待确认                  │
│ 重量：2.4kg                   │
│ 尺寸：30 x 20 x 10 cm         │
│ 体积重：1.0kg                 │
│ [图片：外包装/面单/内部]       │
│ [确认无误] [有问题]            │
├──────────────────────────────┤
│ 费用信息                      │
│ 实重：7.8kg                   │
│ 体积重：8.5kg                 │
│ 计费重量：8.5kg               │
│ 费用：$xx.xx                  │
├──────────────────────────────┤
│ 物流信息                      │
│ 渠道：DHL                     │
│ 运单号：xxxx                  │
│ 状态：已发货                  │
└──────────────────────────────┘
```

### onLoad

```js
onLoad(options) {
  this.setData({ orderId: options.id });
  this.loadOrder();
}
```

### loadOrder

```text
ensureLogin → GET /orders/:id → setData
```

### 包裹确认

```js
onConfirmPackage(e) {
  const packageId = e.currentTarget.dataset.id;
  wx.showModal({
    title: '确认包裹',
    content: '确认后将进入下一步审核流程，是否确认？',
    success: async (res) => {
      if (res.confirm) {
        await packageService.confirmPackage(packageId);
        wx.showToast({ title: '已确认' });
        this.loadOrder();
      }
    }
  });
}
```

### 提交异常

MVP 可用 modal + input 组件页内实现；如果 `showModal` 不支持输入，使用自定义弹窗。

提交数据：

```json
{
  "type": "OTHER",
  "description": "用户填写内容"
}
```

---

## 10.5 我的页面 `pages/profile/index`

### 页面结构

```text
┌──────────────────────────────┐
│ 广骏供应链服务                │
│ 用户ID：1023                  │
├──────────────────────────────┤
│ 我的订单                      │
│ 地址管理                      │
│ 客服中心                      │
│ 隐私政策                      │
├──────────────────────────────┤
│ 当前版本：v0.1.0              │
└──────────────────────────────┘
```

### 交互

- 我的订单 → orders/list。
- 地址管理 → address。
- 客服中心 → customer-service。
- 隐私政策 → privacy。

---

## 10.6 隐私政策页 `pages/privacy/index`

### 内容

MVP 可以放本地文本，后续可以由后端接口返回。

至少包含：

- 我们收集的信息。
- 信息用途。
- 信息保存与保护。
- 如何联系我们。
- 用户如何停止使用服务。

注意：这不是微信后台「隐私保护指引」的替代品。微信公众平台后台仍需单独配置隐私保护指引。

---

## 10.7 客服页 `pages/customer-service/index`

### 页面结构

```text
┌──────────────────────────────┐
│ 客服中心                      │
├──────────────────────────────┤
│ 客服微信：xxxx                │
│ 服务时间：周一至周六 9:00-18:00 │
│ 邮箱：support@xxx             │
├──────────────────────────────┤
│ 常见问题                      │
│ Q: 入库后多久可以看到照片？    │
│ Q: 未支付订单是否发货？        │
└──────────────────────────────┘
```

如果使用微信客服按钮，后续可以增加：

```xml
<button open-type="contact">联系客服</button>
```

---

## 11. 组件说明

## 11.1 status-tag

### Props

```json
{
  "label": "待用户确认",
  "type": "warning"
}
```

### type 映射

```text
normal: 灰色
warning: 黄色
success: 绿色
danger: 红色
primary: 蓝色
```

## 11.2 empty-state

Props:

```text
title
message
buttonText
```

## 11.3 error-state

Props:

```text
message
retryText
```

## 11.4 package-card

Props:

```text
package
showActions
```

内部显示：

- 包裹号。
- 状态。
- 重量。
- 尺寸。
- 图片。
- 操作按钮。

## 11.5 image-gallery

Props:

```text
images
```

交互：

- 点击图片 `wx.previewImage`。
- 图片类型标签。

---

## 12. 样式规范

### 12.1 色彩

```text
主色：#d6a84f
背景：#f6f7f9
文字主色：#1f1f1f
文字次色：#666666
边框：#eeeeee
成功：#18a058
警告：#d6a84f
危险：#d03050
```

### 12.2 间距

```text
页面 padding：32rpx
卡片圆角：20rpx
卡片内边距：28rpx
模块间距：24rpx
```

### 12.3 字体层级

```text
标题：36rpx bold
二级标题：32rpx bold
正文：28rpx
辅助文字：24rpx
```

---

## 13. 接口数据示例

### 13.1 /auth/login response

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "usr_123",
    "user_code": "1023",
    "nickname": null,
    "avatar_url": null
  }
}
```

### 13.2 /orders response

```json
{
  "items": [
    {
      "id": "ord_123",
      "order_no": "ORD-202605-0001",
      "status": "USER_CONFIRM_PENDING",
      "payment_status": "UNPAID",
      "package_count": 2,
      "chargeable_weight": 8.5,
      "final_price": 68.0,
      "currency": "USD",
      "created_at": "2026-05-01T12:00:00.000Z"
    }
  ]
}
```

### 13.3 /orders/:id response

```json
{
  "id": "ord_123",
  "order_no": "ORD-202605-0001",
  "status": "USER_CONFIRM_PENDING",
  "payment_status": "UNPAID",
  "total_actual_weight": 7.8,
  "total_volume_weight": 8.5,
  "chargeable_weight": 8.5,
  "final_price": 68.0,
  "currency": "USD",
  "packages": [
    {
      "id": "pkg_123",
      "package_no": "PKG-0001",
      "status": "USER_CONFIRM_PENDING",
      "actual_weight": 2.4,
      "length_cm": 30,
      "width_cm": 20,
      "height_cm": 10,
      "volume_weight": 1.0,
      "images": [
        {
          "id": "img_001",
          "image_type": "OUTER",
          "url": "https://api.gjxpress.net/files/img_001"
        }
      ]
    }
  ],
  "shipment": {
    "provider": "DHL",
    "tracking_number": "123456789",
    "status": "SHIPPED"
  }
}
```

---

## 14. Windsurf 任务顺序

### Task 1: Project skeleton

- Create folder structure.
- Create app.json, app.js, app.wxss.
- Create config and request wrapper.

### Task 2: Auth

- Implement wx.login.
- Implement token storage.
- Implement ensureLogin.

### Task 3: Pages

- Home.
- Address.
- Order list.
- Order detail.
- Profile.
- Privacy.
- Customer service.

### Task 4: Package actions

- Confirm package.
- Report issue.
- Refresh detail after action.

### Task 5: UX polish

- Loading states.
- Empty states.
- Error states.
- Image preview.
- Toasts and modals.

### Task 6: Audit readiness

- No sensitive words.
- No unfinished buttons.
- Privacy policy entry.
- API base URL set to production.
- Only `api.gjxpress.net` is used.

