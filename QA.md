# 项目问答记录

---

## 一、腾讯云官方页面接入方案

### 1.1 项目定位

本项目是一个**GPU显存需求预估工具**，目标用户是即将在腾讯云 TI-ONE 平台上部署/训练/微调大模型的开发者。用户在购买GPU资源前，可通过本工具预估所需显存，避免资源浪费或不足。

### 1.2 接入整体步骤

```
步骤1: 静态部署
  将 npm run build 产物部署到腾讯云 EdgeOne Pages 或 COS + CDN
  本项目是纯前端应用，无后端依赖，所有计算在浏览器完成

步骤2: 域名与路由
  配置为腾讯云官网子路径，如 cloud.tencent.com/tools/vram-calculator
  或独立二级域名，如 vram.cloud.tencent.com

步骤3: UI 风格对齐
  已完成腾讯云 TDesign 设计体系适配（品牌蓝 #0052D9）
  导航栏、卡片、按钮均使用 tc-* 样式类

步骤4: 数据联动
  GPU 数据库已对齐 TI-ONE 平台支持的 GPU 资源规格
  数据来源: https://cloud.tencent.com/document/product/851/74108
  未来可通过 API 动态拉取 TI-ONE 实时机型和价格

步骤5: 购买引导
  在 GPU 推荐卡片中添加"立即购买"按钮
  跳转至 TI-ONE 控制台对应机型页面

步骤6: 用户体系（可选）
  接入腾讯云账号登录，保存用户计算历史到云端
  当前历史记录存储在 localStorage，仅本地有效
```

### 1.3 部署命令

```bash
npm run build        # 生成 .next/ 构建产物
npm start            # 启动生产服务器（Node.js）
# 或
docker build -t vram-calc .   # Docker 镜像构建
docker run -p 3000:3000 vram-calc
```

---

## 二、页面板块详解

### 2.1 主页面 (`/`) — 计算器

> 代码文件: [src/app/page.tsx](src/app/page.tsx)

#### 板块组成

| 序号 | 板块 | 组件 | 代码位置 |
|------|------|------|----------|
| 1 | 顶部导航栏 | 内联 JSX | [page.tsx#L99-L131](src/app/page.tsx) |
| 2 | 页面描述 | 内联 JSX + `ZH.site.description` | [page.tsx#L137-L146](src/app/page.tsx) |
| 3 | 主分组标签 (NLP/多模态/高级微调) | `Tabs` (Radix UI) | [page.tsx#L154-L170](src/app/page.tsx) |
| 4 | NLP子标签 (推理/微调/训练/GRPO) | `Tabs` 嵌套 | [page.tsx#L174-L199](src/app/page.tsx) |
| 5 | 推理计算器 | `InferenceCalculator` | [calculators/inference-calculator.tsx](src/components/calculators/inference-calculator.tsx) |
| 6 | 微调计算器 | `FineTuningCalculator` | [calculators/fine-tuning-calculator.tsx](src/components/calculators/fine-tuning-calculator.tsx) |
| 7 | 训练计算器 | `TrainingCalculator` | [calculators/training-calculator.tsx](src/components/calculators/training-calculator.tsx) |
| 8 | GRPO计算器 | `GRPOCalculator` | [calculators/grpo-calculator.tsx](src/components/calculators/grpo-calculator.tsx) |
| 9 | 多模态计算器 | `MultimodalCalculator` | [calculators/multimodal-calculator.tsx](src/components/calculators/multimodal-calculator.tsx) |
| 10 | 高级微调计算器 | `AdvancedFineTuningCalculator` | [calculators/advanced-fine-tuning-calculator.tsx](src/components/calculators/advanced-fine-tuning-calculator.tsx) |
| 11 | 性能与内存结果卡片 | `PerformanceMemoryCard` | [performance-memory-card.tsx](src/components/performance-memory-card.tsx) |
| 12 | GPU推荐(单卡/多卡) | `GPURecommendations` | [gpu-recommendations.tsx](src/components/gpu-recommendations.tsx) |
| 13 | 功能特色展示 | 内联3列卡片 | [page.tsx#L358-L386](src/app/page.tsx) |
| 14 | 历史记录面板 | `HistoryPanel` | [history-panel.tsx](src/components/history-panel.tsx) |
| 15 | 配置预设面板 | `ConfigPresetsPanel` | [config-presets-panel.tsx](src/components/config-presets-panel.tsx) |

#### 核心计算流程

```
用户调整参数 → Zustand Store 更新 → 300ms防抖 → 调用计算函数 → 更新结果
                                                      ↓
                                          memory-formulas.ts 中的公式
                                                      ↓
                                          MemoryBreakdown 结果对象
                                                      ↓
                              GPURecommendations 读取 total 值 → 推荐GPU
                                                      ↓
                              PerformanceMemoryCard 读取 GPU + 模型 → 估算TPS/TTFT
```

### 2.2 帮助页面 (`/help`)

> 代码文件: [src/app/help/page.tsx](src/app/help/page.tsx)

| 板块 | 内容 |
|------|------|
| 显存计算原理 | 推理/训练/微调(LoRA/QLoRA)公式、量化对照表 |
| 常见问题 FAQ | 折叠面板，数据驱动自 `ZH.faq` |
| 参考文献 | 5篇学术论文链接 |

### 2.3 显存计算公式

> 代码文件: [src/utils/memory-formulas.ts](src/utils/memory-formulas.ts)

**推理场景** (`calculateInferenceMemory`):
```
总显存 = 模型权重 + KV缓存 + 激活值
模型权重 = 参数量(B) × 10^9 × 精度字节数 × 量化比例 / 1024^3
KV缓存  = batch × seqLen × hiddenSize × numLayers × 2 × 精度字节数 × kvRatio
激活值  = 标准激活值 × 10%
```

**训练场景** (`calculateTrainingMemory`):
```
总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 1.5GB固定开销
优化器(AdamW) = 参数量 × 4字节 × 2(一阶+二阶动量)
梯度 = 参数量 × 精度字节数
```

### 2.4 性能估算公式

> 代码文件: [src/utils/performance-estimator.ts](src/utils/performance-estimator.ts)

基于 [alibaba/InferSim](https://github.com/alibaba/InferSim) 的公式:

```
Decode阶段(内存带宽受限):
  每token延迟 = 模型大小(GB) / (显存带宽 × MFU)
  生成速度TPS = 1 / 每token延迟

Prefill阶段(计算受限):
  TTFT = 2 × 参数量 × 输入token数 / (FP16算力 × MFU)

MFU(实际算力利用率):
  Hopper架构: 0.40 | Blackwell: 0.35 | Ada: 0.22~0.30
  Ampere(数据中心): 0.30 | Ampere(消费级): 0.20
```

---

## 三、技术栈详解（面向初学者）

### 3.1 项目架构总览

```
┌─ Next.js 15 ─────── 全栈框架（本项目仅用前端部分）
│  ├─ App Router ──── /app 目录下的文件即页面路由
│  ├─ Turbopack ───── 开发模式下的超快打包器
│  └─ Standalone ──── 生产构建输出独立Node.js服务器
│
├─ React 19 ────────── UI渲染库
│  ├─ 'use client' ── 声明客户端组件（需要交互的组件）
│  ├─ useMemo ─────── 缓存计算结果，避免重复计算
│  ├─ useState ────── 组件内部状态
│  └─ useEffect ───── 副作用处理（如初始化、监听事件）
│
├─ TypeScript 5 ───── 类型安全
│  └─ src/types/index.ts ── 所有接口定义集中在这里
│
├─ Zustand 5 ────────── 全局状态管理（比Redux轻量得多）
│  └─ src/store/calculator-store.ts
│     ├─ 所有计算配置的状态
│     ├─ 防抖计算触发（300ms）
│     └─ localStorage 持久化
│
├─ Tailwind CSS 3 ──── 原子化CSS框架
│  └─ tailwind.config.js 中定义了腾讯云品牌色
│
├─ TDesign React ───── 腾讯云官方组件库
│  └─ 引入了全局CSS变量
│
├─ Radix UI ─────────── 无障碍基础组件
│  ├─ Select ── 下拉选择器
│  ├─ Slider ── 滑块
│  ├─ Tabs ──── 标签页
│  └─ Tooltip ─ 提示框
│
├─ Framer Motion ───── 动画库
│  ├─ motion.div ── 动画容器
│  ├─ initial/animate ── 进场动画
│  └─ whileHover ── 悬停效果
│
├─ Lucide React ───── 图标库（500+图标）
│
└─ Docker ──────────── 容器化部署
   └─ 多阶段构建，生产镜像约200MB
```

### 3.2 关键文件说明

| 文件 | 作用 | 初学者说明 |
|------|------|-----------|
| `src/app/layout.tsx` | 根布局 | 所有页面的外壳，引入全局CSS和Provider |
| `src/app/page.tsx` | 首页 | 整个计算器的主入口，组装所有子组件 |
| `src/store/calculator-store.ts` | 状态管理 | 所有配置参数和计算结果的"数据中心" |
| `src/utils/memory-formulas.ts` | 计算公式 | 核心——所有VRAM计算数学公式都在这里 |
| `src/utils/performance-estimator.ts` | 性能估算 | TPS/TTFT的估算公式 |
| `src/lib/models-data.ts` | 数据库 | 130+模型参数 + 15个腾讯云GPU规格 |
| `src/lib/i18n.ts` | 中文文案 | 所有界面文字集中管理 |
| `src/contexts/language-context.tsx` | 多语言 | 提供`t(key)`翻译函数 |
| `src/components/gpu-recommendations.tsx` | GPU推荐 | 根据计算结果推荐合适的GPU |
| `src/components/performance-memory-card.tsx` | 性能卡片 | 环形图+TPS+模型配置信息 |

### 3.3 数据流（一次完整的计算过程）

以"NLP推理"为例：

```
1. 用户在 InferenceCalculator 中选择模型"Qwen2.5-7B"
2. InferenceCalculator 调用 setInferenceConfig({ modelId: 'qwen2.5-7b' })
3. calculator-store.ts 更新 inferenceConfig 状态
4. 300ms 防抖后自动调用 calculateInferenceMemory()
5. calculateInferenceMemory() 从 models-data.ts 获取模型参数
6. 调用 memory-formulas.ts 的 calculateInferenceMemory() 计算
7. 结果写入 inferenceResult（MemoryBreakdown 对象）
8. page.tsx 通过 getCurrentResult() 获取 total 值
9. GPURecommendations 接收 requiredMemoryGB 筛选合适GPU
10. PerformanceMemoryCard 接收 GPU + 模型信息 估算TPS/TTFT
```

---

## 四、待完善项（多角度分析）

### 4.1 功能层面

| 问题 | 说明 | 优先级 |
|------|------|--------|
| 无单元测试 | 计算公式没有测试覆盖，修改后可能引入错误 | 高 |
| 性能估算仅理论值 | TPS/TTFT 基于理论公式，未与实际 benchmark 校验 | 高 |
| 高级微调页getCurrentResult返回null | `primaryTab='advanced'` 时 `getCurrentResult()` 未处理该分支 | 中 |
| 微调配置缺少batchSize/seqLen | FineTuningConfig 接口无此字段，性能卡片使用硬编码默认值 | 中 |
| 多卡推荐无通信开销 | 多GPU并行的NVLink/通信开销未纳入显存计算 | 中 |

### 4.2 数据层面

| 问题 | 说明 |
|------|------|
| 模型数据可能过时 | 130+模型参数为静态数据，新模型需手动添加 |
| GPU带宽/算力为公开规格 | 实际云环境可能因虚拟化有10-20%损耗 |
| 量化压缩比是理论值 | INT4实际压缩比受实现方案(GPTQ/AWQ/GGUF)影响 |

### 4.3 工程层面

| 问题 | 说明 |
|------|------|
| TypeScript类型检查被跳过 | `next.config.ts` 中 `ignoreBuildErrors: true` |
| ESLint检查被跳过 | `ignoreDuringBuilds: true` |
| 无CI/CD流程 | 缺少GitHub Actions自动构建/部署 |
| 有.backup文件未清理 | `multimodal-calculator.tsx.backup` 应删除 |
| language-context.tsx 过大 | 58KB，中英翻译数据应拆分为JSON文件 |

### 4.4 用户体验层面

| 问题 | 说明 |
|------|------|
| 无移动端适配 | 设计要求仅PC端，但基础响应式可做 |
| 无加载骨架屏 | 动态组件加载时仅显示"加载中..."文字 |
| 计算历史无导出 | 历史记录存localStorage，换浏览器丢失 |
| 无暗色模式 | ThemeProvider已存在但UI未全面适配 |
| 帮助页无搜索 | FAQ数量少时无问题，增多后需要搜索功能 |

### 4.5 安全层面

| 问题 | 说明 |
|------|------|
| API路由无鉴权 | `/api/mcp` 和 `/api/analytics` 无权限校验 |
| CSP策略含unsafe-eval | middleware.ts 中允许 `unsafe-eval`，存在XSS风险 |

---

## 五、历史问答

### 问题A：三种运行命令分别生成什么？

| 命令 | 产物 | 用途 |
|------|------|------|
| `npm run dev` | 无（内存编译） | 本地开发调试 |
| `npm run build` | `.next/` 文件夹 | 编译为可部署版本 |
| `npm start` | 无（读取.next/） | 启动生产服务器 |

### 问题B：llm-inference-advisor 是否为数据来源？

**不是。** plan.md 中的 Agent Extensions 仅为计划阶段的建议工具，实际未调用。所有计算公式来自原始开源项目的计算引擎，GPU数据来自腾讯云官方文档。

---

## 六、GRPO偏好优化与高级微调的作用

### 6.1 GRPO偏好优化——为什么已有训练、微调、推理还需要它？

GRPO（**G**roup-wise **R**anking **P**reference **O**ptimization，分组排序偏好优化）对应的是 LLM 开发流程中**对齐阶段（Alignment/RLHF）**，与训练、微调、推理是完全不同的场景：

| 页签 | 对应 LLM 开发阶段 | 核心目标 |
|------|-------------------|---------|
| 训练 | 预训练（Pre-training） | 从零训练模型，学习语言能力 |
| 微调 | 监督微调（SFT） | 用标注数据教模型"怎么回答" |
| **GRPO** | **对齐阶段（Alignment/RLHF）** | 教模型"哪个回答更好"，让模型与人类偏好对齐 |
| 推理 | 部署推理（Inference） | 模型上线对外服务 |

#### 为什么需要单独的页签？

1. **对应独立的训练阶段**：GRPO 不是预训练，不是SFT微调，而是RLHF对齐——属于 LLM 开发的第三阶段（预训练 → SFT → RLHF/对齐 → 部署推理）
2. **显存计算公式不同**：GRPO 每个 prompt 生成 k 个候选回答（偏好组），因此激活值是 SFT 的 **k 倍**，显存需求公式为：
   ```
   GRPO激活值 = k × SFT激活值（k = 偏好组大小，通常 4~16）
   ```
   这是 GRPO 最大的显存瓶颈，与普通微调的线性增长完全不同
3. **独有配置参数**：`numGenerations`（偏好组大小 k）、`maxPromptLength`、`maxCompletionLength` 等参数在普通微调中不存在

#### 与其他RLHF方法的对比

| 方法 | 激活值倍数 | 说明 |
|------|-----------|------|
| SFT | 1× | 基线 |
| DPO | ≈2× | 一对偏好对（chosen + rejected） |
| GRPO (k=4) | 4× | 4个候选回答 |
| GRPO (k=8) | 8× | 8个候选回答 |

### 6.2 高级微调——为什么已有普通微调还需要它？

"微调"和"高级微调"是**快速评估 vs 精确规划**两种不同定位：

| 维度 | 微调（Fine-Tuning） | 高级微调（Advanced Fine-Tuning） |
|------|---------------------|-------------------------------|
| 模型类型 | 仅 NLP 文本模型 | NLP + 多模态 + MoE + CNN 四种架构 |
| 参数粒度 | 选模型 → 选方法 → 看结果（约 5 个参数） | 手动配置 **20+ 超参数**（hiddenSize、numLayers、vocabSize 等） |
| 计算精度 | 简化公式估算（5 项分拆） | 逐层精确计算（嵌入层 + 注意力层 + FFN + 注意力分数 + KV缓存 + LoRA + 位置编码，共 12 项） |
| 附加功能 | 无 | 超参数验证 + 智能优化建议 + 硬件推荐 + 计算效率评估 |
| 目标用户 | "我想微调这个模型大概需要多少显存？" | "我要配置精确的训练超参数来计算精确的显存需求" |

#### 高级微调独有能力

1. **多架构支持**：
   - **NLP**：精确到嵌入层/注意力层/FFN/LoRA各模块的显存分拆
   - **MoE**：额外计算路由器显存、专家分配显存、负载均衡显存
   - **CNN**：卷积层、特征图、批归一化、数据增强显存
   - **多模态**：视觉编码器、文本编码器、融合层显存

2. **超参数精调**：可配置 LoRA rank、LoRA 目标模块（q_proj/v_proj/gate_proj 等）、梯度累积步数、权重衰减、学习率预热步数、梯度裁剪等

3. **智能辅助**：
   - 实时超参数合理性验证（标记错误和警告）
   - 智能优化建议（按优先级排序的显存优化方案）
   - 系统建议（硬件推荐和效率评估）

#### 使用场景示例

- **普通微调**：选 `DeepSeek-R1-Distill-Qwen-7B` + `LoRA` → 直接显示约需 X GB 显存
- **高级微调**：指定 `hiddenSize=4096, numLayers=32, loraRank=16, loraTargetModules=[q_proj, v_proj, gate_proj], optimizer=AdamW, gradientAccumulationSteps=8, sequenceLength=4096` → 精确分拆每一项显存组成并给出优化建议
