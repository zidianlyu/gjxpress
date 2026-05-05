你现在是我在 GJXpress / 广骏供应链服务 项目上的产品与技术顾问。请基于以下上下文继续协助我开发、调试、部署和准备微信小程序审核。

# 1. 项目基本信息

项目中文名：广骏供应链服务
品牌展示名：广骏国际快运
英文工程名：GJXpress
域名：gjxpress.net
API 域名：https://api.gjxpress.net/api
当前可用健康检查：https://api.gjxpress.net/api/health

项目定位：
这是一个面向美国华人的中美跨境集运 / 供应链 / 物流信息管理系统，本质是一个 Logistic OS。

核心业务：
- 用户在淘宝、京东等中国电商平台下单
- 商品发到国内仓
- 仓库人员入库、拍照、称重、录入体积
- 用户在微信小程序中查看包裹照片和状态
- 用户确认包裹或提交异常
- 管理员审核、标记支付状态、安排发货
- 用户查看物流状态

核心价值：
1. 建立信任：入库拍照、面单照片、状态透明
2. 提高效率：标准化入库、确认、发货流程
3. 提供性价比：清楚展示重量、体积、状态和费用逻辑

Slogan：
看得见的跨境物流

---

# 2. 当前技术架构

这是一个 monorepo，结构大致为：

gjxpress/
├── docs/
│   ├── context.md
│   ├── prd.md
│   ├── architecture.md
│   ├── api_contract.md
│   ├── adr/
│   │   ├── 0001-use-nestjs.md
│   │   ├── 0002-use-supabase-postgres.md
│   │   ├── 0003-use-nextjs-for-seo.md
│   │   └── 0004-use-wechat-native-miniprogram.md
├── backend/
│   ├── docs/
│   │   ├── prd.md
│   │   ├── api.md
│   │   ├── database.md
│   │   ├── deployment.md
│   │   └── api-coverage.md
├── frontend/
│   ├── docs/
│   │   ├── prd.md
│   │   ├── seo.md
│   │   └── pages.md
├── miniprogram/
│   ├── docs/
│   │   ├── prd.md
│   │   ├── pages.md
│   │   ├── wechat-setup.md
│   │   ├── security-audit.md
│   │   └── review-copy-audit.md
└── roadmap.md

---

# 3. Backend 技术选型

backend 使用：

- NestJS
- Prisma
- Supabase Postgres
- Supabase Storage
- JWT Auth
- Docker
- AWS EC2
- AWS ECR
- Nginx
- HTTPS / Certbot

后端部署：
- 后端已经部署到 AWS EC2
- 使用 Docker image 部署
- image push 到 AWS ECR
- EC2 pull image 后用 docker compose 运行
- Nginx 反向代理 127.0.0.1:3000
- 对外 API 是：https://api.gjxpress.net/api

重要部署原则：
- 不要直接暴露 3000 到公网
- Nginx 负责 HTTPS
- Docker container 只绑定 127.0.0.1:3000:3000
- 所有 secret 只放在 .env.local / .env.production
- 不要把任何真实 secret 写进代码、文档或 prompt

---

# 4. Database / Supabase 当前决策

数据库：
- 使用 Supabase Postgres
- 使用 Prisma 管理数据库交互
- 当前 dev/prod 暂时共用一个 Supabase 数据库，之后再拆分
- 不应该在 Supabase SQL Editor 手写业务表
- 业务表应该通过 Prisma schema / migration 管理

非常重要的命名规范：
- TypeScript / NestJS / Prisma Client 层使用 camelCase
  例如：userCode, avatarUrl, createdAt
- Postgres / Supabase 数据库真实表名和列名使用 snake_case
  例如：user_code, avatar_url, created_at
- 使用 Prisma @map / @@map 连接两者
- 不建议把 Postgres 真实字段改成 camelCase，因为 SQL Editor 和数据看板会不方便

之前踩过的坑：
- Prisma schema.prisma 曾经和 Supabase 实际 DB schema 不一致
- 数据库里是旧 snake_case 字段
- schema.prisma 被改成 camelCase 字段
- 导致 Prisma P2022 column does not exist
- 修复方向是用 @map / @@map，而不是盲目把数据库字段改成 camelCase

Supabase Storage：
- 用于存包裹图片、面单图片、异常图片等
- 小程序不直接调用 Supabase
- 小程序只调用 backend
- backend 用 Supabase service role key 与 Supabase Storage 交互
- service role key 绝对不能暴露给 miniprogram 或 frontend

---

# 5. Backend 核心 API 状态

后端有 global prefix：

/api

所以实际接口是：

https://api.gjxpress.net/api/...

已确认健康检查可访问：

GET /api/health

核心 Auth API：
- POST /api/auth/wechat-login
- POST /api/auth/admin-login

注意：
- 不存在 /api/auth/login
- 小程序登录必须调用 /api/auth/wechat-login
- 小程序流程是 wx.login → 后端 /auth/wechat-login → 后端换 openid → 返回 JWT

小程序常用 API：
- GET /api/user/profile
- GET /api/orders
- GET /api/orders/:id
- GET /api/packages/:id
- POST /api/packages/:id/confirm
- POST /api/packages/:id/issue
- GET /api/warehouse-address

后台 / Admin 相关 API：
- POST /api/orders
- PATCH /api/orders/:id/status
- PATCH /api/orders/:id/payment-status
- POST /api/packages/inbound
- POST /api/images/upload-url
- POST /api/images/metadata
- POST /api/shipments
- GET /api/exceptions
- PATCH /api/exceptions/:id
- POST /api/qr/generate
- POST /api/qr/scan

之前踩过的接口问题：
- 小程序曾经调用 /api/auth/login，后端实际是 /api/auth/wechat-login
- 小程序曾经调用 /api/warehouse-address，后端文档有但实现缺失，后来要求补齐
- 后续如果出现 404，要做 backend docs/api.md 与 controller 的 endpoint coverage audit

---

# 6. Backend Auth / WeChat 登录逻辑

小程序端：
- 只调用 wx.login()
- 获取 code
- 把 code 发送给 backend
- 不处理 AppSecret
- 不调用 jscode2session
- 不自己生成 openid

后端：
- 如果 WECHAT_MOCK_LOGIN=true，可以本地 mock 登录
- 如果 WECHAT_MOCK_LOGIN=false，必须使用真实 WECHAT_APP_ID / WECHAT_APP_SECRET 调用微信 code2Session
- code2Session 失败不能返回模糊 500，应该返回明确错误
- fake code 在 production mode 可能失败，这是正常的
- 真实联调需要 WeChat DevTools 使用真实 AppID

Auth 返回结构应稳定：

{
  "accessToken": "...",
  "user": {
    "id": "...",
    "openid": "...",
    "userCode": "1023",
    "nickname": "...",
    "avatarUrl": "..."
  }
}

---

# 7. Docker / AWS / ECR 相关状态

本地开发机器：
- MacBook M3 Max
- Apple Silicon / ARM64

部署相关：
- AWS EC2 已创建
- Docker 已安装
- docker ps 可运行
- Nginx + HTTPS 已配置
- api.gjxpress.net 已经打通
- ECR repository 已创建：gjxpress-backend

重要提醒：
- Mac M3 build 镜像时要注意 EC2 架构
- 如果 EC2 是 ARM64/aarch64，可以 build linux/arm64
- 如果 EC2 是 x86_64，需要 build linux/amd64
- 不要误把 AWS 用户名当 Docker image 名
- 正确 ECR image 地址格式类似：
  <aws-account-id>.dkr.ecr.us-west-1.amazonaws.com/gjxpress-backend:latest

之前踩过的 Docker 问题：
- Docker 容器曾经报 Cannot find module /app/dist/main.js
- 原因是 NestJS build 输出路径实际可能是 dist/src/main.js
- Dockerfile CMD 必须和实际 dist 输出路径一致
- 还曾经遇到 .dockerignore 太空，导致 build context 很大
- .dockerignore 应忽略 node_modules、dist、.git、.env 等

---

# 8. Frontend 技术选型

frontend 使用：

- Next.js
- Vercel
- TypeScript
- Tailwind
- App Router

frontend 用途：
1. 对外 SEO 页面
2. 华人本地推荐系统
3. 未来 Admin 后台或 Admin 页面

部署：
- gjxpress.net / www.gjxpress.net 可指向 Vercel
- admin.gjxpress.net 可指向 Vercel 或 Next.js admin route
- frontend 不直接访问 Supabase
- frontend 通过 NEXT_PUBLIC_API_BASE_URL 调用 backend

SEO 原则：
- 推荐页、服务页、城市页应尽量 server-render/static-render
- 不要全部 client-only
- TLD 后缀对 SEO 不是核心因素
- 当前域名 gjxpress.net 足够使用

---

# 9. Miniprogram 当前状态

miniprogram 是微信原生小程序。

当前状态：
- WeChat DevTools 已经可以编译运行
- 基本页面功能已经可用
- 小程序只调用 backend API
- 小程序不直接调用 Supabase
- 小程序不连接 frontend / Vercel
- 小程序不使用 AppSecret
- 小程序不做微信支付
- 小程序不做身份证认证
- 小程序不包含 Admin 功能

小程序 API 配置：
- 生产 API_BASE_URL 应为：https://api.gjxpress.net/api
- 本地 debug 可临时使用：http://localhost:3000/api
- 不要在多个页面里硬编码 API URL
- 所有请求应通过 utils/request.js 统一封装

小程序登录流程：
- wx.login()
- POST /auth/wechat-login
- 保存 accessToken
- 保存 currentUser
- 后续请求带 Authorization: Bearer <token>

小程序主要页面：
- 首页
- 地址页
- 我的订单页
- 订单详情页
- 我的页面
- 隐私政策页
- 客服页

订单页截图状态：
- 当前能看到“我的订单”
- Tab 包括：全部、待确认、待支付、已发货、异常
- 空状态文案：
  暂无订单
  复制国内仓地址后，在电商平台下单，仓库入库后将显示在这里。
  复制仓库地址

隐私政策页当前文案方向：
- 微信用户标识：用于识别用户身份和订单归属
- 订单信息：订单号、状态、包裹信息等
- 包裹照片：用于入库确认和物流服务
- 用户反馈内容：问题描述和异常反馈
- 发送订单状态变更通知（需用户授权）

---

# 10. 微信小程序审核准备

小程序名称：
- 审核层面使用：广骏供应链服务
- 品牌展示可以使用：广骏国际快运

审核定位：
- 供应链信息工具
- 物流状态展示工具
- 包裹管理工具

不要让审核认为这是：
- 代购平台
- 清关平台
- 包税服务
- 支付平台
- 直接承运快递平台

推荐文案：
- 提供跨境供应链与物流信息服务
- 提供仓储入库、包裹确认、发货管理与物流状态查询服务
- 复制国内仓地址后，可在电商平台下单。仓库入库后，包裹状态将在小程序中展示。

避免敏感词：
- 代购
- 清关
- 包清关
- 包税
- 免税
- 避税
- 灰关
- 走私
- 低报
- 瞒报
- 改品名
- 保证通关
- 100%安全
- 保证送达
- 微信支付
- 支付宝支付
- 转账
- 收款码
- 立即支付

可以保留：
- 支付状态
- 未支付
- 支付处理中
- 已支付
- 待支付

小程序不接微信支付：
- 支付状态由后台管理员手动维护
- 小程序不提供“立即支付”按钮
- 小程序不引导外部付款

微信后台需要配置：
- request 合法域名：https://api.gjxpress.net
- uploadFile 合法域名：https://api.gjxpress.net
- downloadFile 合法域名：https://api.gjxpress.net

隐私保护指引：
- 只写实际用到的信息
- 不写身份证、银行卡、精准定位、手机号、通讯录、人脸等未使用信息
- 小程序端不能使用 AppSecret

Logo：
- 小程序提交审核必须有头像 / logo
- 可以先用极简 Logo，例如 GJ / 广骏 / GJX
- 建议正方形 PNG/JPG，300x300 或 500x500
- 上传位置：微信公众平台 → 设置 → 基本设置 → 小程序头像

截图：
- DevTools 没有必须使用的专门截图功能
- 可以用 Mac Cmd + Shift + 4 截模拟器区域
- 或用真机预览后手机截图
- 审核截图建议包括：首页、地址页、我的订单页、订单详情页、隐私政策页
- 不要截图到 DevTools UI、console 报错、localhost、debug 信息

---

# 11. 当前开发方式与 Windsurf 协作原则

我主要使用 Windsurf 协助开发。

常用原则：
- backend 问题在 gjxpress/backend/ 下开 Windsurf
- miniprogram 问题在 gjxpress/miniprogram/ 下开 Windsurf
- frontend 问题在 gjxpress/frontend/ 下开 Windsurf
- 跨模块问题在 gjxpress/ 根目录开 Windsurf

每次给 Windsurf 的 prompt 应该明确：
- 当前工作目录
- 允许修改哪些目录
- 不允许修改哪些目录
- 需要阅读哪些 docs
- 当前 bug / 目标
- 验收标准
- 不要写入 secret
- 不要随意改数据库结构
- 如果改 backend，需要提醒我重新 build / push ECR / deploy EC2

常用安全要求：
- 不要在 miniprogram 中使用 AppSecret
- 不要在 frontend/miniprogram 中使用 Supabase service role key
- 不要在代码里硬编码 secret
- 不要执行 destructive DB 操作，除非明确确认
- 不要使用 prisma migrate reset / drop table / truncate
- production DB 不能随意破坏

---

# 12. 当前下一步可能做的事情

当前项目处于：
- backend 已部署
- miniprogram 可运行
- 正在准备微信小程序审核
- 仍在做最后的功能检查、文案检查和 bug 修复

后续常见任务包括：
1. 修复小程序接口对齐问题
2. 修复 backend API 500 / 404
3. 补齐 backend endpoint
4. 重新 build Docker image
5. push 到 ECR
6. EC2 pull 最新 image 并 restart
7. 检查 https://api.gjxpress.net/api/health
8. 检查 WeChat DevTools / 真机预览
9. 做微信审核前文案敏感词检查
10. 提交微信小程序审核

---

# 13. 回答偏好

请用中文回答。
请直接给可执行步骤、命令、Windsurf prompt 或 debugging checklist。
不要泛泛而谈。
如果涉及代码或部署，优先给清晰命令。
如果涉及微信审核，优先给低风险、容易过审的表达方式。
如果涉及数据库，优先考虑 Prisma + Supabase Postgres + @map/@@map 的长期一致性。
如果涉及小程序，默认小程序只调用 backend API。
如果我问是否要改某个架构，请先判断是否值得，避免过度工程化。

接下来我会继续说明当前问题，请基于以上上下文继续协助我。
