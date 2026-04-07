# 🚀 部署指南

## 📋 部署概述

本项目包含两个独立的部署组件：

1. **演示网站** - Next.js应用
2. **MCP服务器** - npm包 (vram-calculator-mcp-server)

## 🌐 演示网站部署

### Vercel部署（推荐）

#### 自动部署
1. 连接GitHub仓库到Vercel
2. 每次推送到main分支自动部署
3. 环境变量配置（如需要）

#### 手动部署
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

### 其他平台部署

#### Netlify
```bash
# 构建命令
npm run build

# 发布目录
.next
```

#### Docker部署
```bash
# 构建镜像
docker build -t vram-calculator .

# 运行容器
docker run -p 3000:3000 vram-calculator
```

## 📦 MCP服务器发布

### npm发布
```bash
cd mcp-server

# 登录npm
npm login

# 发布
npm publish --access public
```

### 版本更新
```bash
# 更新版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 重新发布
npm publish
```

## 🔄 更新流程

### 代码更新后的部署步骤

1. **提交代码到GitHub**
   ```bash
   git add .
   git commit -m "feat: 新功能描述"
   git push origin main
   ```

2. **演示网站自动部署**
   - Vercel会自动检测GitHub更新
   - 自动构建和部署新版本
   - 通常需要2-5分钟

3. **MCP服务器更新**（如有MCP相关更改）
   ```bash
   cd mcp-server
   npm version patch
   npm publish
   ```

## ⚠️ 重要说明

### 两个独立的部署
- **演示网站**: 展示VRAM计算器的Web界面
- **MCP服务器**: 供AI助手调用的独立服务

### 更新场景
- **只更新Web界面**: 只需重新部署演示网站
- **只更新MCP功能**: 只需重新发布npm包
- **两者都更新**: 需要同时部署网站和发布npm包

## 🔍 部署验证

### 演示网站验证
1. 访问部署后的网站地址
2. 检查新功能是否正常工作
3. 测试各个计算模式

### MCP服务器验证
```bash
# 安装最新版本
npm install -g vram-calculator-mcp-server@latest

# 测试运行
vram-calculator-mcp

# 检查版本
npm list -g vram-calculator-mcp-server
```

## 📊 部署状态监控

### 网站状态
- Vercel Dashboard: 查看部署状态和日志
- 访问网站: 确认功能正常

### npm包状态
- npm网站: https://www.npmjs.com/package/vram-calculator-mcp-server
- 下载统计: 查看使用情况

## 🛠️ 故障排除

### 演示网站问题
1. 检查Vercel部署日志
2. 确认环境变量配置
3. 检查构建错误

### MCP服务器问题
1. 检查npm发布权限
2. 确认版本号递增
3. 验证包内容完整性

## 📈 持续集成

### GitHub Actions（可选）
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-website:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        
  publish-mcp:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, '[mcp]')
    steps:
      - uses: actions/checkout@v2
      - name: Publish to npm
        run: |
          cd mcp-server
          npm publish
```

## 🎯 最佳实践

1. **版本管理**: 使用语义化版本控制
2. **测试验证**: 部署前进行充分测试
3. **回滚准备**: 保留上一版本的部署记录
4. **监控告警**: 设置部署状态监控
5. **文档更新**: 及时更新部署相关文档

通过这个部署指南，您可以确保演示网站和MCP服务器都能正确更新和部署！
