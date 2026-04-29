# GJXpress 微信小程序

广骏供应链服务 - 看得见的跨境物流

## 项目结构

```
miniprogram/
├── app.js                 # 小程序入口逻辑
├── app.json               # 小程序全局配置
├── app.wxss               # 小程序全局样式
├── sitemap.json           # 站点地图配置
├── project.config.json    # 项目配置文件
├── utils/
│   └── api.js            # API 请求封装
├── pages/
│   ├── index/            # 首页
│   ├── address/          # 仓库地址页
│   ├── orders/           # 订单列表页
│   ├── order-detail/     # 订单详情页
│   ├── profile/          # 我的页面
│   └── login/            # 登录页
└── images/               # 图片资源目录
```

## 开发环境配置

### 1. 安装微信开发者工具

下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 打开项目

1. 打开微信开发者工具
2. 点击「导入项目」
3. 选择 `/Users/zidianlyu/Desktop/gjxpress/miniprogram` 目录
4. 填入你的小程序 AppID（测试号也可以）
5. 点击「导入」

### 3. 配置后端 API 地址

修改 `app.js` 中的 `apiBaseUrl`：

```javascript
globalData: {
  apiBaseUrl: 'http://localhost:3000/api'  // 开发环境
  // apiBaseUrl: 'https://your-domain.com/api'  // 生产环境
}
```

### 4. 关闭域名校验（本地开发）

在微信开发者工具中：
1. 点击右上角「详情」
2. 找到「本地设置」
3. 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

## 功能说明

### 用户端功能

1. **首页**
   - 品牌展示和 slogan
   - 快捷入口：仓库地址、我的订单、联系客服
   - 使用指南
   - 最近订单展示

2. **地址页**
   - 展示国内仓收货地址
   - 显示用户专属 4 位 user_code
   - 一键复制完整地址
   - 填写示例指导

3. **订单列表页**
   - 查看所有订单
   - 状态筛选（全部/待入库/待确认/待支付/已发货）
   - 显示订单号、状态、金额等信息

4. **订单详情页**
   - 订单状态展示
   - 包裹列表（包含入库照片）
   - 重量信息（实际重量、体积重量、计费重量）
   - 物流追踪信息
   - 包裹确认/问题反馈功能

5. **我的页面**
   - 微信头像和昵称
   - 用户专属代码
   - 订单统计
   - 退出登录

### 状态映射

| 状态值 | 显示文案 |
|--------|----------|
| UNINBOUND | 未入库 |
| INBOUNDED | 已入库 |
| USER_CONFIRM_PENDING | 待用户确认 |
| REVIEW_PENDING | 待审核 |
| PAYMENT_PENDING | 待支付 |
| PAID | 已支付 |
| READY_TO_SHIP | 待发货 |
| SHIPPED | 已发货 |
| COMPLETED | 已完成 |
| EXCEPTION | 异常处理中 |

### 支付状态

| 状态值 | 显示文案 |
|--------|----------|
| UNPAID | 未支付 |
| PROCESSING | 支付处理中 |
| PAID | 已支付 |

## API 接口

### 认证
- `POST /auth/login` - 微信登录

### 用户
- `GET /user/profile` - 获取用户信息

### 订单
- `GET /orders` - 订单列表
- `GET /orders/:id` - 订单详情

### 包裹
- `POST /packages/:id/confirm` - 确认包裹
- `POST /packages/:id/issue` - 报告问题
- `GET /packages/:id/images` - 包裹图片

### 地址
- `GET /address/warehouse` - 仓库地址

## 开发流程

### 登录流程
1. 调用 `wx.login()` 获取 code
2. 将 code 发送到后端 `/auth/login`
3. 后端返回 JWT token
4. 本地存储 token (`wx.setStorageSync`)
5. 后续请求自动带上 `Authorization: Bearer <token>`

### 本地调试

1. 确保后端服务已启动：`npm run start:dev`
2. 关闭微信开发者工具的域名校验
3. 使用测试账号或开发模式登录

### 构建发布

1. 在微信开发者工具中点击「上传」
2. 登录微信公众平台
3. 进入「版本管理」提交审核
4. 审核通过后发布

## 注意事项

- 图片上传目前使用 mock URL，需后续接入 COS
- 微信支付暂未接入
- 身份证认证暂未接入
- 请在生产环境使用 HTTPS

## 技术栈

- 微信原生小程序
- ES6+
- wx.request API

## 相关项目

- [Backend](../backend) - NestJS + Prisma 后端 API
- [Admin](../admin) - React + Ant Design 管理后台
