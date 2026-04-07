# LLM 显存计算器

<div align="center">
  <h1>🧠 AI显存计算器</h1>
  <p>专业的大语言模型和多模态模型显存需求计算工具</p>
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
  
  [GitHub 仓库](https://github.com/farromars/vram-calculator) | [报告问题](https://github.com/farromars/vram-calculator/issues) | [功能请求](https://github.com/farromars/vram-calculator/issues)
</div>

---

## 📖 Language / 语言

[English](README.md) | **中文**

---

## 📖 目录

- [本次版本改动](#-本次版本改动)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [显存计算公式](#-显存计算公式)
- [支持的模型](#-支持的模型)
- [快速开始](#-快速开始)
- [Docker部署](#-docker部署)
- [项目结构](#-项目结构)
- [API文档](#-api文档)
- [MCP协议支持](#-mcp协议支持)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## 🆕 本次版本改动

本版本基于原始开源项目进行了大量二次开发，主要改动如下：

### UI/UX 全面改造
- **现代设计体系**：全局 UI 采用现代品牌风格（品牌蓝 `#0052D9`），玻璃拟态卡片、渐变背景浮动光晕
- **全站中文化**：完整中文界面，移除语言切换功能
- **艺术化视觉风格**：背景网格底纹、浮动渐变光球呼吸动画、毛玻璃导航栏、渐变品牌标识

### 性能估算引擎（新增）
- **性能与内存结果卡片**：环形饼图展示显存占比 + 实时 TPS/TTFT/吞吐量估算
- **基于 InferSim 公式**：Decode 阶段（内存带宽受限）和 Prefill 阶段（计算受限）
- **按 GPU 架构自动估算 MFU**：Hopper 0.40、Blackwell 0.35、Ada 0.22~0.30
- **全场景适配**：6 种计算模式（推理/训练/微调/GRPO/多模态/高级微调）均可显示

### GPU 数据对齐
- **GPU 数据库替换**：15 款主流数据中心 GPU
- **新增 bandwidth 和 fp16Tflops 字段**（用于性能估算）
- **移除市场价格和云服务价格列**，替换为显存带宽和 FP16 算力

### GPU 选择与多卡
- **所有 GPU 卡片可点击选择**，选中后性能卡片实时联动更新
- **GPU 数量滑块（1-8 卡）**替代原有多卡配置开关
- **总显存 = 单卡显存 × 数量**，多卡带通信开销说明

### 帮助与文档
- **新增帮助/FAQ 页面**（`/help`）：计算原理说明和参考论文
- **新增 QA.md**：项目文档（接入方案/板块详解/技术栈说明/待完善项）

## ✨ 功能特性

### 核心功能
- **🎯 六种计算模式**：推理、微调、训练、GRPO、多模态、高级微调
- **📊 精确计算**：基于最新工程实践和通用 LLM 框架的显存计算公式
- **🔧 高级微调**：专门的 NLP、多模态、MoE、CNN 模型计算器，支持参数级控制
- **🎨 可视化展示**：饼图展示显存组成，直观了解各部分占比
- **💾 历史记录**：自动保存计算历史，支持对比分析
- **🔧 配置预设**：12+ 预设模板，快速开始计算
- **📱 响应式设计**：完美适配移动端和桌面端

### 高级特性
- **⚡ PWA 支持**：可安装为本地应用，支持离线使用
- **🔗 结果分享**：生成分享链接，导出计算报告
- **⌨️ 键盘快捷键**：提高操作效率
- **🤖 MCP 协议支持**：AI 助手可直接调用显存计算功能

### 数据支持
- **130+ 预训练模型**：覆盖主流中国和国际开源模型，智能分类显示
- **22+ 多模态模型**：支持 Qwen2.5-VL、QwQ-VL、LLaVA、Whisper 等
- **12+ 向量模型**：支持 Qwen3-Embedding、Qwen3-Reranker 系列
- **15 款数据中心 GPU**：从 T4 到 B200
- **智能推荐**：根据显存需求推荐合适的 GPU

## 🛠 技术栈

- **框架**: Next.js 15.3 + React 19
- **语言**: TypeScript 5.0
- **样式**: Tailwind CSS + 玻璃拟态设计
- **UI 组件**: TDesign React + Radix UI
- **状态管理**: Zustand
- **动画**: Framer Motion
- **图表**: Recharts
- **图标**: Lucide React
- **工具**: ESLint, Prettier

## 📚 支持的模型

### 🤖 NLP/语言模型 (95+个)

#### Qwen 系列
- **Qwen2.5**: 0.5B, 1.5B, 3B, 7B, 14B, 32B, 72B
- **Qwen3**: 1.8B, 7B, 14B, 32B, 72B

#### DeepSeek 系列  
- **DeepSeek-V3-671B**（满血版 MoE，37B 激活）
- **DeepSeek-R1-671B**（满血版推理模型）
- **DeepSeek-R1-0528**（最新推理模型，685B 参数）
- **DeepSeek-R1 系列**: 1.5B, 7B, 8B, 14B, 32B, 70B
- **DeepSeek-Coder**: 1.3B, 6.7B, 33B

#### Llama 系列
- **Llama-3.1**: 8B, 70B, 405B
- **Llama-2**: 7B, 13B, 70B

#### ChatGLM 系列
- **GLM-4-Plus** (100B)、**GLM-Z1-32B**、**GLM-4-9B**、**ChatGLM3-6B**

#### 其他模型
- **Yi 系列**: Yi-Lightning (1000B MoE)、Yi-Large (100B)、Yi-6B、Yi-34B
- **Mistral-7B**、**Mixtral-8x7B**、**Gemma**、**Phi-3**、**CodeLlama**
- **InternLM2.5**、**Baichuan2**、**星火系列**、**MiniMax**、**Moonshot**

### 🎨 多模态模型 (22+个)
- **Qwen2.5-VL 系列**、**QwQ-VL-72B**、**LLaVA**、**Whisper**、**Video-LLaMA**、**Phi-4-Multimodal**

### 🔍 向量模型 (12+个)
- **Qwen3-Embedding**: 0.6B, 4B, 8B
- **Qwen3-Reranker**: 0.6B, 4B, 8B

## 📐 显存计算公式

基于通用 LLM 框架和最新工程实践的精确计算公式。详细文档请参见 [VRAM 计算公式文档](./docs/VRAM_CALCULATION_FORMULAS.zh.md)。

### 通用 LLM 框架

```
总显存占用 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
```

### 1. 推理
```
总显存 = 量化模型权重 + KV缓存 + 激活值（少量）
```

### 2. 微调（全量 / LoRA / QLoRA / Prefix）
```
总显存 = 模型权重 + (P_train × 优化器系数) + (P_train × 梯度精度) + 激活值
```

### 3. 训练
```
总显存 = 模型权重 + 优化器(AdamW: 2×4B) + 梯度 + 激活值（支持梯度检查点）
```

### 4. GRPO
```
激活值 = k × SFT激活值（k = 偏好组大小）
```

### 5. 多模态
```
Total_Seq_Len = 文本Token + 图像Patch + 音频Patch + 视频Patch
```

### 6. 高级微调（NLP / 多模态 / MoE / CNN）

### 性能估算（新增）
```
Decode 生成速度 TPS = GPU显存带宽 × MFU / 模型大小(GB)
首个令牌时间 TTFT = 2 × 参数量 × 输入Token数 / (FP16算力 × MFU)
总吞吐量 = TPS × 批量大小 × 批量效率系数
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/farromars/vram-calculator.git
cd vram-calculator

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

访问 http://localhost:3000 查看应用

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 使用 Docker 构建

```bash
# 构建镜像
docker build -t llm-vram-calculator .

# 运行容器
docker run -d \
  --name llm-vram-calculator \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  llm-vram-calculator
```

## 📁 项目结构

```
vram-calculator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 主页面
│   │   ├── help/              # 帮助/FAQ页面
│   │   └── api/               # API路由
│   ├── components/            # React组件
│   │   ├── calculators/       # 6个计算器组件
│   │   ├── gpu-recommendations.tsx    # GPU推荐 + 选择
│   │   ├── performance-memory-card.tsx # 性能估算卡片
│   │   └── ui/               # UI基础组件
│   ├── hooks/                # 自定义Hooks
│   ├── lib/                  # 数据库
│   │   ├── models-data.ts    # 130+模型 + 15个主流GPU
│   │   └── i18n.ts           # 中文本地化
│   ├── store/                # Zustand状态管理
│   ├── types/                # TypeScript类型
│   └── utils/                # 工具函数
│       ├── memory-formulas.ts      # 显存计算公式
│       └── performance-estimator.ts # TPS/TTFT性能估算引擎
├── public/                   # 静态资源
├── docs/                    # 文档
├── mcp-server/              # MCP协议服务器（独立npm包）
├── docker-compose.yml       # Docker编排
├── Dockerfile              # Docker镜像
└── package.json
```

## 📚 API 文档

### 健康检查

```http
GET /api/health
```

### MCP 端点

```http
POST /api/mcp
```

## 🤖 MCP 协议支持

本项目支持 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)，AI 助手可以通过标准化协议直接调用显存计算功能。

### 快速开始
```bash
# 安装MCP服务器
npm install -g vram-calculator-mcp-server

# 启动MCP服务器
vram-calculator-mcp
```

### 集成配置
```json
{
  "mcpServers": {
    "vram-calculator": {
      "command": "vram-calculator-mcp"
    }
  }
}
```

详见 [MCP实现总结](./MCP_IMPLEMENTATION_SUMMARY.md) 和 [MCP使用示例](./MCP_USAGE_EXAMPLES.md)。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 原始项目与致谢

本项目基于开源项目 **[vram-wuhrai](https://github.com/st-lzh/vram-wuhrai)** 二次开发，原作者为 **[st-lzh (Wuhr AI Team)](https://github.com/st-lzh)**。

原始项目提供了：
- 完整的显存计算引擎（6种计算模式、130+模型数据库）
- GPU推荐系统
- MCP协议服务器实现
- 项目架构和基础设施

**原始作者**: [st-lzh](https://github.com/st-lzh) / [Wuhr AI Team](https://wuhrai.com)  
**原始仓库**: [https://github.com/st-lzh/vram-wuhrai](https://github.com/st-lzh/vram-wuhrai)  
**许可证**: MIT

衷心感谢原作者的优秀开源贡献。
