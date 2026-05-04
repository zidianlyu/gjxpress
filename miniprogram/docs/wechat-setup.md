# miniprogram/docs/wechat-setup.md

# 微信小程序开发、配置、真机预览与审核准备

> Scope: WeChat Mini Program setup for 广骏供应链服务.  
> Backend domain: `https://api.gjxpress.net`.  
> This document is written for developer and Windsurf implementation.

---

## 1. 小程序整体接入原则

小程序只连接后端 API：

```text
WeChat Mini Program
→ https://api.gjxpress.net
→ NestJS backend on AWS EC2
→ Supabase Postgres / Supabase Storage
```

小程序不直接连接：

```text
Supabase URL
Vercel frontend
Vercel admin
Third-party logistics APIs
AWS EC2 IP address
localhost in production
```

上线和审核时，小程序代码中只应出现：

```text
https://api.gjxpress.net
```

不要出现：

```text
http://localhost:3000
https://admin.gjxpress.net
https://www.gjxpress.net
Supabase project URL
Supabase service role key
WeChat AppSecret
JWT secret
```

---

## 2. 需要准备的账号和工具

### 2.1 账号

- 微信公众平台小程序账号。
- 小程序管理员微信。
- AWS EC2 后端服务。
- Supabase project。
- Namecheap 域名 `gjxpress.net`。

### 2.2 工具

- 微信开发者工具。
- Windsurf / VS Code。
- Node.js LTS。
- Git。
- Postman / Apifox，可选。

---

## 3. 小程序后台基础设置

登录微信公众平台：

```text
https://mp.weixin.qq.com
```

进入小程序后台后完成以下配置。

---

## 4. AppID / AppSecret

路径：

```text
微信公众平台
→ 开发管理
→ 开发设置
```

需要获取：

```text
AppID
AppSecret
```

### 4.1 AppID

用于微信开发者工具和小程序项目配置：

```json
{
  "appid": "你的 AppID"
}
```

### 4.2 AppSecret

AppSecret 只允许放在后端 EC2 的 `.env.production`：

```env
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
```

禁止放在：

- 小程序前端代码。
- GitHub repo。
- project.config.json。
- config/index.js。

---

## 5. project.config.json

`miniprogram/project.config.json` 需要使用真实 AppID。

示例：

```json
{
  "description": "广骏供应链服务",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": true
  },
  "compileType": "miniprogram",
  "libVersion": "latest",
  "appid": "你的真实 AppID",
  "projectname": "gjxpress-miniprogram",
  "condition": {}
}
```

开发阶段可在微信开发者工具中临时关闭合法域名校验，但提交审核前必须开启并使用线上域名。

---

## 6. 服务器域名配置

路径：

```text
微信公众平台
→ 开发管理
→ 开发设置
→ 服务器域名
```

配置：

```text
request 合法域名：https://api.gjxpress.net
uploadFile 合法域名：https://api.gjxpress.net
downloadFile 合法域名：https://api.gjxpress.net
```

### 6.1 为什么只配置 api.gjxpress.net

为了降低审核和安全复杂度，小程序不直接访问 Supabase Storage。图片展示通过后端返回或代理：

```text
https://api.gjxpress.net/files/{imageId}
```

这样小程序只需要一个合法域名。

### 6.2 不要配置这些域名

首版不建议配置：

```text
https://www.gjxpress.net
https://admin.gjxpress.net
Supabase Storage domain
Vercel preview domain
AWS EC2 raw IP
```

如果后续确实需要用户在小程序上传图片，也仍然建议先走 backend upload signed URL flow，而不是直接暴露 storage provider。

---

## 7. 本地开发设置

### 7.1 开发工具本地调试

开发时可以在微信开发者工具中开启：

```text
详情
→ 本地设置
→ 不校验合法域名、web-view、TLS版本以及 HTTPS 证书
```

这样可以使用：

```text
http://localhost:3000
```

仅限开发工具内调试。

### 7.2 真机预览

真机预览不能依赖本机 localhost。

真机预览应使用：

```text
https://api.gjxpress.net
```

并确保：

- DNS 已解析。
- Nginx HTTPS 正常。
- `/health` 可访问。
- 微信后台服务器域名已配置。

---

## 8. 微信登录配置

### 8.1 前端流程

```text
wx.login()
→ 获得 code
→ POST https://api.gjxpress.net/auth/login
→ 后端返回 JWT + user
→ wx.setStorageSync 保存 token
```

### 8.2 请求体

```json
{
  "code": "wx_login_code"
}
```

### 8.3 响应体

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "usr_xxx",
    "user_code": "1023",
    "nickname": null,
    "avatar_url": null
  }
}
```

### 8.4 注意事项

- `code` 只能由后端拿去换 openid。
- 小程序不保存 AppSecret。
- 小程序不以 openid 作为前端权限依据。
- 用户权限由 JWT + 后端校验决定。

---

## 9. 隐私保护指引配置

### 9.1 后台配置路径

```text
微信公众平台
→ 设置
→ 服务内容声明 / 用户隐私保护指引
```

具体入口名称可能随微信后台版本变化，以当前后台为准。

### 9.2 需要声明的信息类型

建议声明：

| 信息类型 | 用途 |
|---|---|
| 微信用户标识 | 识别用户身份与订单归属 |
| 头像昵称（如使用） | 展示用户资料，可选 |
| 订单信息 | 展示物流订单状态 |
| 包裹照片 | 提供入库确认和物流证据 |
| 用户反馈内容 | 处理异常和客服沟通 |
| 联系方式（如后续收集） | 客服联系用户 |

### 9.3 建议用途文案

```text
为了识别用户身份，我们会使用您的微信用户标识。
为了展示订单归属和物流状态，我们会处理您的订单信息、包裹信息和物流信息。
为了提供包裹入库确认服务，我们会展示包裹外包装、面单及物品照片。
为了处理异常反馈，我们会记录您提交的问题描述。
```

### 9.4 小程序代码隐私授权

建议实现一个 `privacy-modal` 或全局隐私检查逻辑。

如使用微信隐私相关 API：

```js
wx.getPrivacySetting({
  success(res) {
    if (res.needAuthorization) {
      // show privacy modal
    }
  }
});
```

在需要用户同意时：

```js
wx.requirePrivacyAuthorize({
  success() {
    // user agreed
  },
  fail() {
    wx.showToast({ title: '需要同意隐私政策后继续使用', icon: 'none' });
  }
});
```

如果相关 API 在当前基础库版本中不可用，应 fallback 到自定义隐私弹窗，并引导用户查看隐私政策页。

---

## 10. 订阅消息配置

### 10.1 后台开通

路径：

```text
微信公众平台
→ 功能
→ 订阅消息
```

申请或选择模板：

- 包裹入库提醒。
- 待确认提醒。
- 支付状态提醒。
- 发货提醒。

记录模板 ID，并在小程序 config 中配置：

```js
const SUBSCRIBE_TEMPLATE_IDS = {
  PACKAGE_INBOUNDED: 'template-id-1',
  PACKAGE_CONFIRM_PENDING: 'template-id-2',
  SHIPPED: 'template-id-3',
};
```

### 10.2 前端触发

订阅消息授权必须由用户点击触发，不要在 `onLoad` 自动弹出。

示例：

```js
wx.requestSubscribeMessage({
  tmplIds: [SUBSCRIBE_TEMPLATE_IDS.PACKAGE_INBOUNDED],
  success(res) {
    console.log('subscribe result', res);
  },
  fail(err) {
    console.error('subscribe failed', err);
  }
});
```

### 10.3 后端发送

后端负责真正发送订阅消息。小程序只负责获取用户授权。

小程序可将用户授权结果回传：

```http
POST /notifications/subscribe-result
```

请求体：

```json
{
  "template_id": "xxx",
  "result": "accept"
}
```

MVP 可先不实现后端发送，仅保留订阅入口。

---

## 11. 图片与文件

### 11.1 图片显示

小程序从后端拿到图片 URL：

```text
https://api.gjxpress.net/files/{imageId}
```

使用：

```xml
<image src="{{image.url}}" mode="aspectFill" />
```

点击后：

```js
wx.previewImage({
  current: currentUrl,
  urls: imageUrls,
});
```

### 11.2 不直接调用 Supabase

小程序不应出现：

```text
supabase.co/storage
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

原因：

- 降低审核域名数量。
- 降低 key 泄露风险。
- 后端统一做权限校验。

---

## 12. 审核前文案检查

### 12.1 推荐使用

```text
广骏供应链服务
广骏国际快运
看得见的跨境物流
跨境供应链与物流信息服务
仓储入库
包裹确认
发货管理
物流查询
```

### 12.2 避免使用

```text
代购
清关
免税
避税
灰关
走私
包税
低价清关
```

### 12.3 支付相关

首版小程序不提供支付按钮。

支付状态可展示为：

```text
未支付
支付处理中
已支付
```

不要提供：

```text
立即支付
微信支付
支付宝支付
```

除非后续正式接入支付能力。

---

## 13. 首版审核页面要求

必须确保以下页面可访问：

```text
首页
地址页
订单列表页
订单详情页
我的页面
隐私政策页
客服页
```

### 13.1 无订单用户体验

审核人员可能使用自己的微信登录，没有真实订单。因此空状态必须完整：

```text
暂无订单
请复制国内仓地址，在电商平台下单后等待仓库入库。
```

同时提供按钮：

```text
复制仓库地址
联系客服
```

### 13.2 Demo 订单策略

如果希望审核人员能看到订单详情，后端可以配置：

```text
REVIEW_MODE=true
```

在 review mode 下，新用户登录后可看到一条 demo order。该订单必须明确是示例数据，不涉及真实交易。

如果不做 demo order，也必须保证空状态足够清晰。

---

## 14. 真机预览 Checklist

在提交审核前，用真机完成：

- [ ] 打开小程序无报错。
- [ ] 能登录。
- [ ] `/auth/login` 成功。
- [ ] 能进入首页。
- [ ] 能复制仓库地址。
- [ ] 能进入订单列表。
- [ ] 空订单状态正常。
- [ ] 有测试订单时能进入详情。
- [ ] 图片能展示和预览。
- [ ] 确认包裹成功。
- [ ] 提交异常成功。
- [ ] 隐私政策入口可打开。
- [ ] 客服入口可打开。
- [ ] 不出现 localhost。
- [ ] 不出现未实现按钮。
- [ ] 不出现敏感文案。

---

## 15. 微信开发者工具发布流程

### 15.1 上传体验版

```text
微信开发者工具
→ 上传
→ 填写版本号和备注
```

版本号示例：

```text
0.1.0
```

备注：

```text
首次审核版本：物流信息查询、地址复制、包裹确认、隐私政策入口。
```

### 15.2 设置体验成员

路径：

```text
微信公众平台
→ 管理
→ 成员管理
→ 体验成员
```

添加：

- 你自己。
- 开发者。
- 测试人员。

### 15.3 提交审核

提交前检查：

- 服务类目是否匹配。
- 隐私指引是否配置。
- 服务器域名是否配置。
- 小程序无敏感词。
- 页面可完整访问。
- API 在公网 HTTPS 可访问。

---

## 16. 推荐服务类目与说明

具体服务类目需以微信后台可选项为准。建议选择偏中性的服务类目，避免首版直接选择高度监管的「快递」「国际货运」等强资质类目，除非已有对应资质。

页面描述建议：

```text
本小程序用于提供供应链物流信息查询、包裹入库确认、发货状态展示与客户服务。
```

---

## 17. 审核失败常见原因与处理

### 17.1 功能不完整

处理：

- 确保所有按钮能点击。
- 空状态可解释服务。
- 客服和隐私页可访问。

### 17.2 隐私未配置

处理：

- 完成微信后台隐私保护指引。
- 小程序内提供隐私政策入口。

### 17.3 域名错误

处理：

- 确认 `https://api.gjxpress.net/health` 正常。
- 确认微信后台配置了 request/downloadFile 合法域名。
- 确认代码无 localhost。

### 17.4 资质问题

处理：

- 页面用「供应链服务」「物流信息服务」描述。
- 避免强调直接承运、清关、支付。

### 17.5 无法体验核心功能

处理：

- 后端提供 demo order。
- 或者空状态说明完整，并提供客服入口。

---

## 18. 上线环境变量对应关系

小程序只需要配置 API URL 和 template IDs，不需要 secret。

```js
module.exports = {
  ENV: 'prod',
  API_BASE_URL: 'https://api.gjxpress.net',
  SUBSCRIBE_TEMPLATE_IDS: {
    PACKAGE_INBOUNDED: '',
    PACKAGE_CONFIRM_PENDING: '',
    PAYMENT_PENDING: '',
    SHIPPED: '',
  },
};
```

后端 secrets 放在 EC2：

```env
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
JWT_SECRET=xxx
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=xxx
DIRECT_URL=xxx
```

---

## 19. Windsurf 开发 Prompt 建议

```text
请读取以下文档并实现 miniprogram：

- docs/prd.md
- docs/architecture.md
- docs/api_contract.md
- miniprogram/docs/prd.md
- miniprogram/docs/pages.md
- miniprogram/docs/wechat-setup.md

本次只允许修改 miniprogram/ 目录。

请优先完成：
1. app.json / app.js / app.wxss / sitemap.json
2. config/index.js
3. utils/request.js, utils/auth.js, utils/status.js, utils/storage.js
4. services/*.service.js
5. pages/home/index
6. pages/address/index
7. pages/orders/list/index
8. pages/orders/detail/index
9. pages/profile/index
10. pages/privacy/index
11. pages/customer-service/index
12. components/status-tag, empty-state, error-state, package-card, image-gallery

要求：
- 只调用 https://api.gjxpress.net 或 config API_BASE_URL。
- 不直接调用 Supabase。
- 不写任何 secret。
- 不实现微信支付。
- 不做身份证认证。
- 不添加 admin 功能。
- 页面文案使用「广骏供应链服务」和「广骏国际快运」。
- 审核版避免敏感词。
```

