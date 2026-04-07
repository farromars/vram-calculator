# MCP npm镜像源更新指导

## 概述

本指南提供详细的步骤说明如何更新AI显存计算器项目中MCP相关npm包的镜像源配置，以提高在中国大陆地区的安装速度和稳定性。

## 当前配置状态

项目已经配置了基础的国内镜像源，但可能需要进一步优化或更新。

### 已有配置文件

1. **`.npmrc`** - npm镜像源配置文件
2. **`package.json`** - 包含镜像相关的npm脚本

## 详细更新步骤

### 步骤1：检查当前镜像源配置

```bash
# 检查当前npm镜像源
npm config get registry

# 检查项目根目录的.npmrc文件
cat .npmrc
```

**预期输出**：
```
https://registry.npmmirror.com/
```

### 步骤2：更新.npmrc配置文件

如果`.npmrc`文件不存在或配置不完整，请创建或更新：

```bash
# 在项目根目录创建或编辑.npmrc文件
cat > .npmrc << 'EOF'
# 使用国内镜像源提高安装速度
registry=https://registry.npmmirror.com/

# MCP相关包的镜像配置
@modelcontextprotocol:registry=https://registry.npmmirror.com/

# 其他常用镜像源备选
# registry=https://registry.npm.taobao.org/
# registry=https://mirrors.huaweicloud.com/repository/npm/

# 安全配置
audit-level=moderate
fund=false
save-exact=true

# 性能优化
prefer-offline=true
cache-max=86400000
EOF
```

### 步骤3：清理npm缓存

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json（如果存在）
rm -rf node_modules package-lock.json
```

### 步骤4：验证镜像源配置

```bash
# 验证镜像源设置
npm config list

# 测试镜像源连接
npm ping
```

### 步骤5：重新安装依赖

```bash
# 使用国内镜像源重新安装所有依赖
npm install

# 或者使用项目提供的专用脚本
npm run install:cn
```

### 步骤6：验证MCP包安装

```bash
# 验证MCP SDK版本
npm run mcp:validate

# 检查MCP相关包是否正确安装
npm list @modelcontextprotocol/sdk
```

**预期输出**：
```
@modelcontextprotocol/sdk@1.13.2
```

### 步骤7：测试MCP功能

```bash
# 启动开发服务器
npm run dev

# 在另一个终端测试MCP工具
npm run test:mcp
```

## 高级配置选项

### 选项1：使用多个镜像源

如果某个镜像源不稳定，可以配置多个备选源：

```bash
# 创建.npmrc文件，包含多个镜像源配置
cat > .npmrc << 'EOF'
# 主镜像源
registry=https://registry.npmmirror.com/

# 备选镜像源（注释状态）
# registry=https://registry.npm.taobao.org/
# registry=https://mirrors.huaweicloud.com/repository/npm/
# registry=https://mirrors.cloud.tencent.com/npm/

# MCP包专用配置
@modelcontextprotocol:registry=https://registry.npmmirror.com/
EOF
```

### 选项2：临时使用不同镜像源

```bash
# 临时使用特定镜像源安装包
npm install --registry=https://registry.npmmirror.com/

# 临时使用官方源（如果镜像源有问题）
npm install --registry=https://registry.npmjs.org/
```

### 选项3：使用nrm管理镜像源

```bash
# 安装nrm（npm registry manager）
npm install -g nrm

# 查看可用镜像源
nrm ls

# 切换到淘宝镜像
nrm use taobao

# 切换到npmmirror镜像
nrm use npmmirror

# 测试镜像源速度
nrm test
```

## 常见问题解决

### 问题1：镜像源连接超时

**解决方案**：
```bash
# 尝试不同的镜像源
npm config set registry https://registry.npm.taobao.org/

# 或者使用华为云镜像
npm config set registry https://mirrors.huaweicloud.com/repository/npm/
```

### 问题2：MCP包安装失败

**解决方案**：
```bash
# 清理缓存并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 如果仍然失败，尝试使用官方源安装MCP包
npm install @modelcontextprotocol/sdk --registry=https://registry.npmjs.org/
```

### 问题3：包版本不一致

**解决方案**：
```bash
# 检查package-lock.json中的版本
cat package-lock.json | grep "@modelcontextprotocol/sdk" -A 5

# 强制更新到最新版本
npm install @modelcontextprotocol/sdk@latest

# 验证版本
npm run mcp:validate
```

## 验证清单

完成配置后，请验证以下项目：

- [ ] `.npmrc`文件存在且配置正确
- [ ] `npm config get registry`返回国内镜像源
- [ ] `npm ping`测试成功
- [ ] `npm install`安装成功
- [ ] `npm run mcp:validate`显示正确版本
- [ ] `npm run dev`启动成功
- [ ] MCP工具功能正常

## 性能优化建议

1. **使用本地缓存**：
   ```bash
   npm config set cache ~/.npm-cache
   npm config set prefer-offline true
   ```

2. **并行安装**：
   ```bash
   npm config set maxsockets 20
   ```

3. **定期清理**：
   ```bash
   # 每周清理一次缓存
   npm cache clean --force
   ```

## 监控和维护

### 定期检查镜像源状态

```bash
# 创建检查脚本
cat > check-mirrors.sh << 'EOF'
#!/bin/bash
echo "检查镜像源状态..."
curl -I https://registry.npmmirror.com/ | head -1
curl -I https://registry.npm.taobao.org/ | head -1
curl -I https://mirrors.huaweicloud.com/repository/npm/ | head -1
EOF

chmod +x check-mirrors.sh
./check-mirrors.sh
```

### 自动化更新脚本

```bash
# 创建自动更新脚本
cat > update-mcp.sh << 'EOF'
#!/bin/bash
echo "更新MCP相关包..."
npm cache clean --force
npm install @modelcontextprotocol/sdk@latest
npm run mcp:validate
echo "更新完成！"
EOF

chmod +x update-mcp.sh
```

## 总结

通过以上步骤，您可以：

1. ✅ 配置稳定的国内npm镜像源
2. ✅ 确保MCP相关包正确安装
3. ✅ 提高依赖安装速度和稳定性
4. ✅ 建立监控和维护机制

如果遇到问题，请按照故障排除步骤逐一检查，或者参考项目的GitHub Issues页面获取更多帮助。
