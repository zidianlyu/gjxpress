# Roadmap：GJXpress / 广骏供应链服务

> 文档版本：v1.0  
> 当前目标：从本地 MVP 进入可部署、可测试、可提交微信审核的阶段

---

## 1. 总体策略

当前系统是一个 Logistic OS，不应一次性追求完整大系统。应按以下原则推进：

1. 先把数据模型和业务闭环做稳。
2. 先上线最小可用版本，再扩展自动化。
3. 小程序审核风险优先降低。
4. 后端作为唯一可信业务层。
5. 前端和小程序都通过后端 API 获取数据。
6. 文档先行，Windsurf 按模块推进。
7. 先用 Supabase 降低数据库和存储运维成本。
8. 先用 AWS EC2 部署后端，不上 Kubernetes。
9. 先用 Vercel 部署 Next.js，提高 SEO 和部署效率。

---

## 2. 当前技术路线

```text
backend      NestJS + Prisma + Supabase Postgres + Supabase Storage + AWS EC2
frontend     Next.js + Vercel
miniprogram  微信原生小程序 + backend API
```

域名规划：

```text
api.gjxpress.io       Backend API
www.gjxpress.io       Public frontend
admin.gjxpress.io     Admin UI, optional
```

---

## 3. Milestone 0：项目重构与文档统一

### 目标

将现有项目整理成 monorepo，建立清晰文档和模块边界。

### 任务

- [ ] 建立根目录 `docs/`。
- [ ] 放入 `docs/prd.md`。
- [ ] 放入 `docs/architecture.md`。
- [ ] 放入 `docs/api_contract.md`。
- [ ] 放入 `roadmap.md`。
- [ ] 建立 `backend/docs/`。
- [ ] 建立 `frontend/docs/`。
- [ ] 建立 `miniprogram/docs/`。
- [ ] 增加根目录 README。
- [ ] 增加 root package scripts。
- [ ] 确认 Git branch 策略。

### 验收标准

- 从根目录能理解整个项目结构。
- Windsurf 可按 backend/frontend/miniprogram 分别读取文档。
- 每个模块有明确边界。

---

## 4. Milestone 1：Supabase 数据库和存储接入

### 目标

将数据库和图片存储确定为 Supabase，并让 backend 可正常连接。

### 任务

- [ ] 创建 Supabase project。
- [ ] 获取 Postgres connection string。
- [ ] 配置 `DATABASE_URL`。
- [ ] 配置 `DIRECT_URL`。
- [ ] 配置 Prisma datasource。
- [ ] 运行 Prisma migration。
- [ ] 创建 Supabase Storage bucket。
- [ ] 配置 `SUPABASE_URL`。
- [ ] 配置 `SUPABASE_SERVICE_ROLE_KEY`。
- [ ] 实现 Storage service。
- [ ] 实现图片 metadata 保存。
- [ ] 实现 seed 数据。

### 验收标准

- `npx prisma migrate deploy` 可运行。
- 后端可读取 Supabase Postgres。
- 后端可上传或模拟上传图片到 Supabase Storage。
- 数据库中可看到 User、Order、Package、Image 等数据。

---

## 5. Milestone 2：Backend MVP 稳定化

### 目标

后端完成 Logistic OS 核心业务 API。

### 任务

#### Auth

- [ ] 微信登录 API。
- [ ] Admin 登录 API。
- [ ] JWT guard。
- [ ] User guard。
- [ ] Admin guard。

#### User

- [ ] 用户创建。
- [ ] user_code 生成。
- [ ] 当前用户 profile。

#### Order

- [ ] 用户订单列表。
- [ ] 用户订单详情。
- [ ] 管理员订单列表。
- [ ] 管理员创建订单。
- [ ] 管理员修改状态。
- [ ] OrderStatusLog。

#### Package

- [ ] 管理员包裹入库。
- [ ] 包裹重量和尺寸。
- [ ] 体积重计算。
- [ ] 用户确认包裹。
- [ ] 用户提交异常。

#### Image

- [ ] 图片上传 request。
- [ ] 图片 metadata 保存。
- [ ] 图片权限检查。

#### Payment

- [ ] 管理员修改支付状态。
- [ ] PaymentRecord。
- [ ] 未支付发货限制。

#### Shipment

- [ ] 创建发货。
- [ ] 运单号。
- [ ] 出货时间。
- [ ] 预计到达时间。

#### AdminActionLog

- [ ] 修改状态写日志。
- [ ] 修改支付写日志。
- [ ] 强制发货写日志。
- [ ] 异常处理写日志。

### 验收标准

- 能跑通：入库 → 用户确认 → 待支付 → 已支付 → 发货。
- 用户不能访问他人订单。
- 未支付默认不能发货。
- override 必须写 reason 和 log。
- Seed 数据可生成完整业务状态。

---

## 6. Milestone 3：Admin UI MVP

### 目标

管理员可以通过 Web UI 操作核心业务。

### 技术

- Next.js 中的 `/admin` 或单独 Admin route。
- 后续可升级独立后台。

### 页面

- [ ] Admin login。
- [ ] Dashboard。
- [ ] 订单列表。
- [ ] 订单详情。
- [ ] 包裹入库。
- [ ] 图片上传。
- [ ] 支付状态修改。
- [ ] 创建发货。
- [ ] 异常处理。
- [ ] 操作日志。

### 验收标准

- 管理员不需要 Postman 也能完成核心流程。
- Admin UI 调用真实 backend API。
- 错误有提示。
- override 有二次确认。
- 关键操作后可在日志看到记录。

---

## 7. Milestone 4：Miniprogram MVP

### 目标

小程序用户可以完成登录、地址复制、订单查看、包裹确认和异常反馈。

### 页面

- [ ] 首页。
- [ ] 地址页。
- [ ] 我的订单。
- [ ] 订单详情。
- [ ] 我的页面。
- [ ] 隐私政策页。

### 功能

- [ ] wx.login。
- [ ] /auth/wechat-login。
- [ ] JWT 存储。
- [ ] 地址复制。
- [ ] 订单列表。
- [ ] 订单详情。
- [ ] 图片预览。
- [ ] 确认包裹。
- [ ] 提交异常。
- [ ] 查看物流信息。
- [ ] 网络错误提示。
- [ ] 空状态。

### 审核注意

- [ ] 使用名称：广骏供应链服务。
- [ ] 不出现高风险词。
- [ ] 有隐私政策入口。
- [ ] 有客服入口。
- [ ] 不接小程序内支付。

### 验收标准

- 微信开发者工具可打开。
- 真机预览可登录。
- 真机可调用 `https://api.gjxpress.io`。
- 用户能查看 seed 或真实订单。
- 用户能确认包裹。
- 用户能提交异常。

---

## 8. Milestone 5：Next.js Public Frontend

### 目标

建立对外 SEO 站点，为美国华人用户提供服务介绍和未来推荐系统入口。

### 页面

- [ ] 首页。
- [ ] 服务介绍。
- [ ] 中美集运指南。
- [ ] 常见问题。
- [ ] 联系方式。
- [ ] 推荐系统占位页。
- [ ] 小程序引导页。

### SEO 要求

- [ ] 每页有 title。
- [ ] 每页有 description。
- [ ] Open Graph metadata。
- [ ] sitemap。
- [ ] robots.txt。
- [ ] 页面内容可被搜索引擎读取。

### 验收标准

- Vercel 可部署。
- `www.gjxpress.io` 可访问。
- 首页能引导用户扫码或打开小程序。
- 内容没有审核高风险文案。

---

## 9. Milestone 6：AWS EC2 Staging Deployment

### 目标

将后端部署到 AWS EC2，提供稳定 HTTPS API。

### 任务

- [ ] 创建 EC2。
- [ ] 配置安全组：22、80、443。
- [ ] 安装 Docker。
- [ ] 安装 Docker Compose。
- [ ] 安装 Nginx。
- [ ] 配置 `api.gjxpress.io` DNS。
- [ ] 配置 SSL。
- [ ] 部署 backend Docker container。
- [ ] 配置 `.env.staging`。
- [ ] 运行 `prisma migrate deploy`。
- [ ] 验证 `/health`。

### 验收标准

- `https://api.gjxpress.io/health` 返回 ok。
- 小程序真机可以调用 API。
- Vercel frontend 可以调用 API。
- API 不直接暴露 3000 端口。

---

## 10. Milestone 7：微信小程序真实环境联调

### 目标

让小程序使用真实 AppID 和真实 API 域名运行。

### 任务

- [ ] 替换真实 AppID。
- [ ] 后端配置真实 WECHAT_APP_ID。
- [ ] 后端配置真实 WECHAT_APP_SECRET。
- [ ] 小程序 API base URL 改为 `https://api.gjxpress.io`。
- [ ] 微信公众平台配置 request 合法域名。
- [ ] 配置隐私保护指引。
- [ ] 配置客服入口。
- [ ] 配置体验成员。
- [ ] 真机预览测试。

### 验收标准

- 真机 `wx.login` 成功。
- 后端拿到真实 openid。
- 用户表出现真实微信用户。
- 小程序可获取订单。
- 无明显 console error。

---

## 11. Milestone 8：首次审核版本

### 目标

提交一个低风险、可审核的小程序版本。

### 审核版本范围

- 首页。
- 登录。
- 地址复制。
- 空订单或测试订单列表。
- 订单详情。
- 我的页面。
- 隐私政策。
- 客服入口。

### 文案策略

使用：

- 广骏供应链服务。
- 跨境供应链与物流信息服务。
- 仓储入库、包裹确认、发货管理与物流查询。

避免：

- 代购。
- 清关。
- 免税。
- 避税。
- 灰关。
- 走私。

### 验收标准

- 上传体验版。
- 体验成员测试通过。
- 提交审核资料完整。
- 页面无空白。
- 隐私授权正常。
- API 域名合法。

---

## 12. Milestone 9：试运营

### 目标

用真实用户和真实包裹跑小规模业务。

### 任务

- [ ] 接收第一批真实用户。
- [ ] 人工创建或匹配订单。
- [ ] 国内仓入库。
- [ ] 上传照片。
- [ ] 用户确认。
- [ ] 管理员标记支付。
- [ ] 管理员发货。
- [ ] 用户查看物流。
- [ ] 收集反馈。

### 指标

- 用户能否独立复制地址。
- 入库照片是否足够建立信任。
- 用户确认率。
- 异常件比例。
- 客服咨询数量。
- 后台操作耗时。

---

## 13. Milestone 10：V1 增强

### 功能增强

- [ ] 二维码确认。
- [ ] 微信订阅消息。
- [ ] 更完整价格规则。
- [ ] 自动 48 小时确认。
- [ ] 多包裹合单优化。
- [ ] 数据看板。
- [ ] 推荐系统第一版。
- [ ] 物流轨迹手动事件。

### 技术增强

- [ ] CI/CD。
- [ ] Sentry。
- [ ] 更完善日志。
- [ ] API rate limit。
- [ ] 数据备份策略。
- [ ] 更细管理员权限。

---

## 14. Milestone 11：V2 自动化

### 方向

- [ ] UPS/DHL/EMS API 接入。
- [ ] 定时拉取物流轨迹。
- [ ] 物流 adapter 层。
- [ ] 多仓库支持。
- [ ] 用户 referral。
- [ ] 数据仓库或 BI。
- [ ] 公开推荐系统内容增长。
- [ ] 图片 CDN 优化。
- [ ] 从 Supabase Storage 迁移到 S3，可选。
- [ ] 从 Supabase Postgres 迁移到 AWS RDS，可选。

---

## 15. 推荐开发节奏

### Week 1

- 完成 monorepo 文档整理。
- Supabase 项目创建。
- 后端连接 Supabase。
- Storage service 初版。

### Week 2

- Backend MVP API 稳定。
- Seed 数据。
- Admin UI 对接。

### Week 3

- Miniprogram 真实 API 对接。
- 微信登录联调。
- 小程序页面体验优化。

### Week 4

- AWS EC2 部署。
- Vercel 部署。
- 真机预览。
- 审核文案和隐私政策。

### Week 5

- 提交微信审核。
- 小规模内部试运营。
- 修复用户反馈。

---

## 16. 风险与缓解

### 16.1 微信审核风险

风险：名称、业务描述或页面文案触发资质审核。

缓解：

- 使用广骏供应链服务。
- 使用信息服务、仓储入库、物流查询等描述。
- 不接小程序内支付。
- 不使用高风险词。

### 16.2 业务流程复杂度风险

风险：订单、包裹、合单、支付、发货状态混乱。

缓解：

- 保持 Order 和 Package 分层。
- 明确状态机。
- 所有状态变更写日志。

### 16.3 数据权限风险

风险：用户看到他人订单或图片。

缓解：

- 后端 ownership check。
- 不让小程序直接访问数据库。
- 图片访问走后端或签名 URL。

### 16.4 图片成本风险

风险：包裹图片数量增长导致存储和流量成本上升。

缓解：

- 图片压缩。
- 限制上传大小。
- 后期 CDN。
- 后期迁移 S3。

### 16.5 Supabase 锁定风险

风险：后期业务大后 Supabase 成本或能力不适合。

缓解：

- 使用 Prisma。
- 保持 PostgreSQL 标准模型。
- 后期可迁移 AWS RDS。
- Storage 路径和 metadata 独立设计。

---

## 17. Windsurf 工作方式建议

### Backend Context

读取：

```text
docs/prd.md
docs/architecture.md
docs/api_contract.md
backend/docs/prd.md
```

限制：

```text
只修改 backend/ 下文件。
```

### Frontend Context

读取：

```text
docs/prd.md
docs/architecture.md
docs/api_contract.md
frontend/docs/prd.md
```

限制：

```text
只修改 frontend/ 下文件。
```

### Miniprogram Context

读取：

```text
docs/prd.md
docs/architecture.md
docs/api_contract.md
miniprogram/docs/prd.md
```

限制：

```text
只修改 miniprogram/ 下文件。
```

---

## 18. 当前最优下一步

现在应立即执行：

1. 建立 monorepo 目录结构。
2. 将四份根文档放入项目。
3. 创建 Supabase project。
4. 后端切换到 Supabase Postgres。
5. 后端接入 Supabase Storage。
6. Next.js frontend 初始化。
7. 保持小程序调用后端 API。
8. 准备 AWS EC2 staging deployment。
