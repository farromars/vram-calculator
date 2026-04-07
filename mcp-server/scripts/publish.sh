#!/bin/bash

# VRAM Calculator MCP Server 发布脚本

set -e

echo "🚀 开始发布 VRAM Calculator MCP Server..."

# 检查是否已登录npm
echo "📋 检查npm登录状态..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ 未登录npm，请先运行: npm login"
    exit 1
fi

echo "✅ npm登录状态正常: $(npm whoami)"

# 检查包名是否可用
echo "📋 检查包名可用性..."
if npm view vram-calculator-mcp-server > /dev/null 2>&1; then
    echo "⚠️  包名已存在，将发布新版本"
else
    echo "✅ 包名可用"
fi

# 运行测试
echo "📋 运行测试..."
npm test

# 构建项目
echo "📋 构建项目..."
npm run build

# 检查包内容
echo "📋 检查包内容..."
npm pack --dry-run

# 确认发布
echo ""
echo "📦 准备发布包: vram-calculator-mcp-server@$(node -p "require('./package.json').version")"
echo "📁 包大小: $(npm pack --dry-run 2>/dev/null | grep 'package size' | awk '{print $4 " " $5}')"
echo ""
read -p "🤔 确认发布? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消发布"
    exit 1
fi

# 发布到npm
echo "📤 发布到npm..."
npm publish --access public

echo ""
echo "🎉 发布成功!"
echo ""
echo "📋 安装命令:"
echo "   npm install -g vram-calculator-mcp-server"
echo ""
echo "📋 使用命令:"
echo "   vram-calculator-mcp"
echo ""
echo "📋 查看包信息:"
echo "   npm view vram-calculator-mcp-server"
echo ""
echo "🔗 npm包地址:"
echo "   https://www.npmjs.com/package/vram-calculator-mcp-server"
