# Run Backend

## Local (no Docker)

```bash
npm run start:dev
```

## Docker (production-like)

```bash
docker compose -f docker-compose.local.yml up --build # 启动容器
docker compose -f docker-compose.local.yml down # 停止容器
docker ps # 检查容器是否运行
docker image prune # 清理镜像
```

## Test

```bash
curl http://localhost:3000/api/health
```
