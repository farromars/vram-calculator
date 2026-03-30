# 部署指南

本文档提供了多种部署 LLM 显存计算器的方法。

## 目录

- [Docker 部署](#docker-部署)
- [Docker Compose 部署](#docker-compose-部署)
- [Vercel 部署](#vercel-部署)
- [自建服务器部署](#自建服务器部署)
- [Nginx 配置](#nginx-配置)
- [SSL 证书配置](#ssl-证书配置)
- [环境变量](#环境变量)
- [故障排查](#故障排查)

## Docker 部署

### 1. 构建镜像

```bash
# 克隆项目
git clone https://github.com/farromars/vram-calculator.git
cd vram-calculator

# 构建 Docker 镜像
docker build -t llm-vram-calculator:latest .
```

### 2. 运行容器

```bash
# 基础运行
docker run -d \
  --name llm-vram-calculator \
  -p 3000:3000 \
  --restart unless-stopped \
  llm-vram-calculator:latest

# 带资源限制的运行
docker run -d \
  --name llm-vram-calculator \
  -p 3000:3000 \
  --restart unless-stopped \
  --memory="512m" \
  --cpus="1.0" \
  llm-vram-calculator:latest
```

### 3. 查看日志

```bash
docker logs -f llm-vram-calculator
```

## Docker Compose 部署

### 1. 使用预设配置

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 2. 自定义配置

创建 `docker-compose.override.yml`：

```yaml
version: '3.8'

services:
  app:
    environment:
      - CUSTOM_ENV=value
    ports:
      - "8080:3000"
```

### 3. 生产环境配置

```yaml
version: '3.8'

services:
  app:
    image: llm-vram-calculator:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

## Vercel 部署

### 1. Fork 项目

Fork 本项目到你的 GitHub 账号。

### 2. 导入到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你 fork 的仓库
4. 选择根目录作为项目目录
5. 点击 "Deploy"

### 3. 自定义域名

在 Vercel 项目设置中添加自定义域名：

1. 进入项目设置
2. 选择 "Domains"
3. 添加你的域名
4. 配置 DNS 记录

## 自建服务器部署

### 1. 服务器要求

- Ubuntu 20.04+ / CentOS 8+
- 2 核 CPU
- 2GB 内存
- 20GB 存储空间
- Node.js 18+

### 2. 安装步骤

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 克隆项目
git clone https://github.com/farromars/vram-calculator.git
cd vram-calculator

# 安装依赖
npm install

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "vram-calculator" -- start

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 3. PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'vram-calculator',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/vram-calculator',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

## Nginx 配置

创建 `/etc/nginx/sites-available/vram-calculator`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 强制 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 反向代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/vram-calculator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL 证书配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 使用自签名证书（开发环境）

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem
```

## 环境变量

### 应用配置

创建 `.env.production.local`：

```env
# 应用配置
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# 分析工具（可选）
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Docker 环境变量

在 `docker-compose.yml` 中配置：

```yaml
environment:
  - NODE_ENV=production
```

## 故障排查

### 1. 端口占用

```bash
# 检查端口占用
sudo lsof -i :3000

# 杀死占用进程
sudo kill -9 <PID>
```

### 2. 内存不足

```bash
# 检查内存使用
free -h

# 增加 swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 3. Docker 问题

```bash
# 查看容器日志
docker logs llm-vram-calculator

# 进入容器调试
docker exec -it llm-vram-calculator sh

# 重启容器
docker restart llm-vram-calculator
```

### 4. 构建失败

```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build

# Docker 清理
docker system prune -a
```

### 5. 性能优化

```bash
# 启用 Next.js 输出优化
npm run build -- --experimental-app-only

# 使用 CDN
# 修改 next.config.js 添加 assetPrefix
```

## 监控和日志

### 1. 使用 PM2 监控

```bash
pm2 monit
pm2 logs vram-calculator
```

### 2. 使用 Docker 日志

```bash
# 实时日志
docker logs -f llm-vram-calculator

# 导出日志
docker logs llm-vram-calculator > app.log 2>&1
```

### 3. 健康检查

创建 `/app/api/health/route.ts`：

```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
```

## 备份和恢复

### 1. 数据备份

```bash
# 备份用户数据（如果有）
docker exec llm-vram-calculator tar czf /tmp/backup.tar.gz /app/data
docker cp llm-vram-calculator:/tmp/backup.tar.gz ./backup.tar.gz
```

### 2. 恢复数据

```bash
docker cp ./backup.tar.gz llm-vram-calculator:/tmp/
docker exec llm-vram-calculator tar xzf /tmp/backup.tar.gz -C /
```

## 更新部署

### 1. 手动更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建
docker-compose build
docker-compose up -d
```

### 2. 自动部署（CI/CD）

使用 GitHub Actions 示例：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /path/to/project
            git pull
            docker-compose build
            docker-compose up -d
```
