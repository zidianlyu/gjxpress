# ADR 0004: Use WeChat Native Mini Program for Customer Logistics App

## Status

Accepted

## Date

2026-05-04

## Decision

Use **WeChat native Mini Program** as the customer-facing Mini Program implementation.

Do not use Taro, uni-app, React Native, H5 WebView, or a cross-platform wrapper for the initial version.

The Mini Program will only call the backend API at:

```text
https://api.gjxpress.net
```

The Mini Program will not directly interact with the Next.js public website, admin frontend, Supabase database, or Supabase Storage service-role credentials.

## Context

The target users are Chinese-speaking customers in the United States who use WeChat and need to:

- Copy the warehouse address.
- View logistics orders.
- View package inbound photos.
- Confirm packages.
- Report issues.
- View payment status.
- View shipment and tracking status.
- Receive WeChat subscription message reminders.

The Mini Program is not intended to be the public SEO site. It is an authenticated logistics utility inside WeChat.

To reduce review risk and implementation complexity, the Mini Program should remain focused on logistics information service and customer confirmation, not payment processing or external web content.

## Decision Drivers

- Best compatibility with WeChat APIs.
- Lower risk during WeChat review.
- Direct support for `wx.login`, subscription messages, copy-to-clipboard, image preview, and Mini Program lifecycle.
- No need for cross-platform output at MVP stage.
- Avoid complexity from Taro/uni-app build layers.
- Keep Mini Program scope narrow: logistics status and customer confirmation only.
- Review-friendly because it only calls backend APIs and does not embed external web pages.

## Chosen Architecture

Mini Program:

```text
miniprogram/
→ WeChat native Mini Program files
→ app.js / app.json / app.wxss
→ pages/*
```

Backend:

```text
https://api.gjxpress.net
→ NestJS
→ Supabase Postgres / Storage
```

Auth flow:

```text
wx.login()
→ Mini Program receives code
→ POST /auth/wechat-login
→ backend calls WeChat code2Session
→ backend creates or updates User
→ backend returns JWT
→ Mini Program stores JWT
→ Mini Program calls API with Authorization: Bearer <token>
```

## Mini Program Scope

### Required Pages

```text
/pages/index/index             首页
/pages/address/address         仓库地址复制
/pages/orders/orders           我的订单
/pages/order-detail/index      订单详情
/pages/package-detail/index    包裹详情
/pages/profile/profile         我的
/pages/privacy/privacy         隐私说明
/pages/support/support         客服
```

### Optional Later Pages

```text
/pages/notifications/index     通知授权
/pages/qr-scan/index           二维码确认
/pages/exception-detail/index  异常详情
```

## Core User Flows

### Address Copy

```text
User opens address page
→ sees domestic warehouse recipient / phone / address
→ taps copy
→ uses address in Taobao / JD / other platforms
```

### Package Confirmation

```text
User opens order detail
→ sees package photos and measurements
→ taps Confirm if correct
→ backend moves package/order forward
```

### Issue Report

```text
User opens package detail
→ taps 有问题
→ enters description
→ backend creates ExceptionCase
→ order/package enters exception flow
```

### Shipment Tracking

```text
User opens order detail
→ sees provider, tracking number, shipment status
→ future API polling may update tracking events
```

## Review and Compliance Principles

The Mini Program should use neutral, review-friendly wording.

Preferred wording:

```text
广骏供应链服务
跨境供应链与物流信息服务
仓储入库、包裹确认、发货管理与物流查询服务
```

Avoid wording:

```text
代购
清关
免税
避税
灰关
走私
包税
```

The first review version should avoid:

- In-app payment.
- External payment guidance.
- WebView to external website.
- Complex recommendation system content.
- Unnecessary claims about delivery guarantees.
- Sensitive customs/compliance wording.

The Mini Program should remain a logistics information and confirmation tool.

## Domain Policy

Mini Program should only use:

```text
https://api.gjxpress.net
```

Configure in WeChat Official Account Platform:

```text
request 合法域名: https://api.gjxpress.net
uploadFile 合法域名: https://api.gjxpress.net
downloadFile 合法域名: https://api.gjxpress.net
```

If files are later uploaded directly to Supabase Storage, the storage domain must also be reviewed and configured. For MVP, route upload/download through backend where possible to reduce review and security complexity.

## Auth and Token Rules

- Mini Program uses `wx.login` to obtain login code.
- Backend exchanges code for OpenID and session info.
- Backend does not send WeChat session_key to client.
- Backend returns application JWT.
- Mini Program stores JWT locally.
- Mini Program sends `Authorization: Bearer <token>` for protected API calls.
- Backend must verify ownership before returning orders or images.

## Privacy Rules

The Mini Program handles:

- WeChat user identifier.
- Nickname and avatar if user grants permission.
- Order information.
- Package photos.
- Logistics tracking information.
- Issue descriptions submitted by users.

The Mini Program must include a privacy policy entry and user-facing privacy explanation.

Recommended privacy usage description:

```text
为了识别用户身份，我们会使用微信用户标识。
为了展示订单归属，我们可能使用头像和昵称。
为了提供包裹入库确认服务，我们会展示包裹照片、面单照片和物流状态。
为了处理异常反馈，我们会记录用户提交的问题描述。
```

## Alternatives Considered

### Taro

Pros:

- React-like development.
- Possible future multi-platform support.

Cons:

- Additional build layer.
- More compatibility and debugging complexity.
- No immediate need for multi-platform output.

Rejected for MVP.

### uni-app

Pros:

- Strong Chinese ecosystem.
- Multi-platform output.

Cons:

- Adds abstraction layer.
- We only need WeChat Mini Program at this stage.
- Native WeChat APIs are the main target.

Rejected for MVP.

### H5 WebView inside Mini Program

Pros:

- Reuse Next.js pages.
- Faster if everything is already web-based.

Cons:

- Adds review complexity.
- Adds domain/web-view configuration complexity.
- Worse fit for WeChat-native features.
- Harder to keep first review low-risk.

Rejected.

### Native iOS / Android App

Pros:

- Full mobile control.

Cons:

- Too expensive and unnecessary.
- Target users are already inside WeChat.

Rejected.

## Consequences

### Positive

- Best fit for WeChat ecosystem.
- Lower review risk.
- Simple runtime architecture.
- Easier access to WeChat-specific APIs.
- Clear separation from SEO frontend and admin UI.

### Negative

- Separate codebase from Next.js frontend.
- Less reuse of web components.
- Requires WeChat DevTools and Mini Program-specific testing.
- Some UI/UX needs to be implemented specifically for Mini Program.

## Implementation Notes

### API Wrapper

Create a central request wrapper:

```text
miniprogram/utils/request.js
```

Responsibilities:

- Read `API_BASE_URL` from config.
- Add JWT token.
- Handle 401 logout.
- Normalize errors.
- Show user-friendly toast messages.

### Environment Config

Recommended config:

```text
config/dev.js          http://localhost:3000
config/staging.js      https://api.gjxpress.net
config/production.js   https://api.gjxpress.net
```

### Status Mapping

Mini Program should map backend enum values to Chinese labels.

Order statuses:

```text
UNINBOUND              未入库
INBOUNDED              已入库
USER_CONFIRM_PENDING   待用户确认
REVIEW_PENDING         待审核
PAYMENT_PENDING        待支付
PAID                   已支付
READY_TO_SHIP          待发货
SHIPPED                已发货
COMPLETED              已完成
EXCEPTION              异常处理中
```

Payment statuses:

```text
UNPAID       未支付
PROCESSING   支付处理中
PAID         已支付
```

## Related Documents

- `docs/prd.md`
- `docs/architecture.md`
- `docs/api_contract.md`
- `miniprogram/docs/prd.md`
- `miniprogram/docs/wechat-setup.md`

## References

- WeChat Mini Program Documentation: https://developers.weixin.qq.com/miniprogram/dev/framework/
- WeChat code2Session Documentation: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
- Tencent Cloud Mini Program Domain Configuration Reference: https://www.tencentcloud.com/document/product/436/30609
