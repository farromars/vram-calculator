# 发布VRAM Calculator MCP Server到npm

## 准备工作

### 1. 注册npm账号
如果还没有npm账号，请访问 https://www.npmjs.com/ 注册。

### 2. 登录npm
```bash
npm login
# 或者
npm adduser
```

输入您的npm用户名、密码和邮箱。

### 3. 验证登录状态
```bash
npm whoami
```

应该显示您的npm用户名。

## 发布步骤

### 1. 检查包名可用性
```bash
npm view vram-calculator-mcp-server
```

如果显示404错误，说明包名可用。

### 2. 最终测试
```bash
npm test
```

确保所有测试通过。

### 3. 构建项目
```bash
npm run build
```

### 4. 发布到npm
```bash
npm publish
```

### 5. 验证发布
```bash
npm view vram-calculator-mcp-server
```

应该显示包的详细信息。

## 发布后的使用

### 全局安装
```bash
npm install -g vram-calculator-mcp-server
```

### 运行MCP服务器
```bash
vram-calculator-mcp
```

### Claude Desktop集成
在Claude Desktop配置文件中添加：

```json
{
  "mcpServers": {
    "vram-calculator": {
      "command": "vram-calculator-mcp"
    }
  }
}
```

### Cline/Continue集成
在MCP配置中添加：

```json
{
  "name": "vram-calculator",
  "command": ["vram-calculator-mcp"]
}
```

## 更新版本

### 1. 更新版本号
```bash
npm version patch  # 补丁版本 1.0.0 -> 1.0.1
npm version minor  # 次要版本 1.0.0 -> 1.1.0
npm version major  # 主要版本 1.0.0 -> 2.0.0
```

### 2. 重新发布
```bash
npm publish
```

## 注意事项

1. **包名唯一性**: 确保包名在npm上是唯一的
2. **版本管理**: 遵循语义化版本控制 (SemVer)
3. **测试**: 发布前确保所有测试通过
4. **文档**: 保持README和文档更新
5. **许可证**: 确保包含正确的许可证文件

## 故障排除

### 发布权限错误
```bash
npm publish --access public
```

### 包名冲突
修改package.json中的name字段，使用唯一的包名。

### 版本冲突
确保版本号高于已发布的版本。

## 推广和使用

发布成功后，可以：

1. 在GitHub README中添加npm安装说明
2. 在MCP社区分享
3. 在AI开发者社区推广
4. 创建使用教程和示例

## 维护

定期：
1. 更新依赖包
2. 修复bug
3. 添加新功能
4. 更新文档
5. 响应用户反馈

这样，其他开发者就可以通过简单的npm命令安装和使用您的VRAM计算器MCP服务器了！
