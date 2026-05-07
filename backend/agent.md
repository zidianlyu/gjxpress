请读取以下文档并实现 backend：

- docs/prd.md
- docs/architecture.md
- docs/api_contract.md
- backend/docs/prd.md
- backend/docs/api.md
- backend/docs/database.md
- backend/docs/deployment.md

本次只允许修改 backend/ 目录。

请优先完成：
1. Prisma schema
2. NestJS module/controller/service 基础结构
3. Auth、User、Order、Package、Inbound、Image、Shipment、Exception、AdminLog 模块
4. Supabase Storage upload URL flow
5. Dockerfile 和 docker-compose 配置
6. /health endpoint
7. README backend 启动和部署说明

不要修改 frontend/ runtime，除非清理过期引用。
不要硬编码任何 secret。
所有敏感配置必须从环境变量读取。
