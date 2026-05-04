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

## AWS EC2 Deployment

```bash
ssh -i ~/.ssh/gjxpress-backend-key.pem ubuntu@54.215.255.83

# 更新软件包列表
sudo apt update

# 升级现有软件包
sudo apt upgrade -y

# 安装常用基础工具（以防万一）
sudo apt install -y curl git apt-transport-https ca-certificates gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 添加仓库到 Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
`
# 再次更新索引
sudo apt update

# 配置权限
sudo usermod -aG docker $USER

# EC2 构建镜像
docker build -t zidianlyuaws/gjxpress-backend:latest .
```

## AWS ECR push （Mac执行，后续代码更新需要）

```bash
# 登陆ECR
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 919333998053.dkr.ecr.us-west-1.amazonaws.com

# 构建新镜像
docker build -t gjxpress-backend .

# 打标签
docker tag gjxpress-backend:latest 919333998053.dkr.ecr.us-west-1.amazonaws.com/gjxpress-backend:latest

# 推送到云端
docker push 919333998053.dkr.ecr.us-west-1.amazonaws.com/gjxpress-backend:latest
```

## SSH pull （SSH执行，后续需要）

```bash
# 进入EC2
ssh -i ~/.ssh/gjxpress-backend-key.pem ubuntu@54.215.255.83

# 进入目录（后续）
cd ~/gjxpress-backend

# 登陆ECR （后续）
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 919333998053.dkr.ecr.us-west-1.amazonaws.com

# 拉取最新镜像（后续）
docker compose -f docker-compose.production.yml pull

# 平滑重启，并销毁旧容器（后续）
docker compose -f docker-compose.production.yml up -d

# 拉取镜像（第一次）
docker pull 919333998053.dkr.ecr.us-west-1.amazonaws.com/gjxpress-backend:latest

# 看内容（可选）
docker run --rm -it 919333998053.dkr.ecr.us-west-1.amazonaws.com/gjxpress-backend:latest sh
# 进去后执行 ls 就能看到你的代码了，输入 exit 退出
```

## SSH 重启服务（后续）

```bash
# 要在 ～/gjxpress/backend 目录下
cd ~/gjxpress/backend
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d

docker ps
docker logs -f gjxpress-api
```

## 获取HTTPS证书（SSH内运行）

```bash
# 安装Certbot
sudo apt update
sudo apt install certbot -y

# 获取证书
sudo certbot certonly --standalone -d api.gjxpress.net
# 此时应该会显示 Successfully received certificate。
# 证书会存放在 /etc/letsencrypt/live/api.gjxpress.net/ 目录下。

# 自动续期（可选）
sudo crontab -e
# 添加一行：
0 12 * * * /usr/bin/certbot renew --quiet
```

## 本地测试

```bash
kill -9 $(lsof -t -i:3000)
```
