# 推送到 GitHub 指南

## 1. 在 GitHub 创建新仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" -> "New repository"
3. 填写仓库信息：
   - Repository name: `vram-calculator` 或 `ai-memory-calculator`
   - Description: `专业的AI模型显存计算器 - Professional AI Model VRAM Calculator`
   - 选择 "Public" (开源)
   - **不要**勾选 "Initialize this repository with a README"
   - **不要**添加 .gitignore 或 license

## 2. 推送代码到 GitHub

在本地终端执行以下命令：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/vram-calculator.git

# 或者使用 SSH（如果配置了 SSH key）
git remote add origin git@github.com:YOUR_USERNAME/vram-calculator.git

# 推送代码
git branch -M main
git push -u origin main
```

## 3. 配置仓库设置

推送成功后，在 GitHub 仓库页面进行以下设置：

### 基本设置
1. 进入 Settings -> General
2. 添加 Topics: `ai`, `gpu`, `vram`, `calculator`, `llm`, `deep-learning`
3. 在 Features 中启用：
   - Issues
   - Discussions（可选）
   - Sponsorships（可选）

### 添加仓库描述
在仓库主页右侧，点击齿轮图标编辑：
- Website: 部署后的网站地址
- Topics: 添加相关标签

### 配置 GitHub Pages（可选）
如果要使用 GitHub Pages：
1. Settings -> Pages
2. Source: Deploy from a branch
3. Branch: main / docs (如果有文档目录)

### 添加 Secrets（用于 CI/CD）
如果要使用 Docker Hub 自动构建：
1. Settings -> Secrets and variables -> Actions
2. 添加以下 secrets：
   - `DOCKER_USERNAME`: Docker Hub 用户名
   - `DOCKER_PASSWORD`: Docker Hub 密码

## 4. 创建首个 Release

1. 在仓库主页点击 "Releases" -> "Create a new release"
2. Tag version: `v1.0.0`
3. Release title: `v1.0.0 - 首个正式版本`
4. 描述主要功能特性
5. 点击 "Publish release"

## 5. 更新 README 中的链接

推送后，记得更新 README.md 中的链接：

```markdown
# 将示例链接替换为实际链接
[报告问题](https://github.com/YOUR_USERNAME/vram-calculator/issues)
[功能请求](https://github.com/YOUR_USERNAME/vram-calculator/issues)
```

## 6. 推广你的项目

- 在相关社区分享（Reddit, Hacker News, V2EX 等）
- 写一篇介绍博客
- 在 Twitter/LinkedIn 上分享
- 提交到 Awesome 列表

## 常见问题

### 如果推送失败
```bash
# 查看远程仓库
git remote -v

# 删除错误的远程仓库
git remote remove origin

# 重新添加
git remote add origin https://github.com/YOUR_USERNAME/vram-calculator.git
```

### 如果需要强制推送
```bash
git push -f origin main
```

### 更新本地仓库
```bash
git pull origin main
``` 