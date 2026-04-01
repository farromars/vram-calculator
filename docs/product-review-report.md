# LLM 显存计算器 — 产品与工程双视角深度评估报告

**评估日期：** 2026-04-01  
**评估角色：** 产品高级经理 + 资深 LLM 工程师  
**评估方法：** 产品完整性走查 + 6 个真实工程场景数值验证 + 全量代码功能扫描（含边界情况、国际化、持久化、性能估算）

---

## 一、执行摘要

产品在技术广度上属同类工具中上乘，支持 6 种计算模式、130+ 主流模型、并行部署方案建议，视觉体验精良。但本次多维度测试揭示了若干**直接影响决策正确性的公式问题**，以及**功能入口缺失**和**系统性工程缺陷**，在当前状态下不建议作为生产采购决策的唯一依据。

核心结论：**对于 MHA 模型的推理显存估算整体准确；对于 GQA 模型（LLaMA-3、Qwen）KV Cache 会高估 4-8 倍，是目前最严重的单点错误。**

---

## 二、6 大工程场景测试结果

### 场景 1：Llama-3.1-70B 生产部署（4×A100 80GB，vLLM）

**测试配置：** BF16，batch=16，seq=4096，numKVHeads=8（GQA）

| 项目 | 工具估算（错误） | 正确值 | 差异 |
|---|---|---|---|
| 模型权重 | ~130 GiB | ~130 GiB | 正确 |
| KV Cache | **~320 GiB** | **~40 GiB** | 高估 **8×** |
| 总计 | **~450 GiB** | **~170 GiB** | |
| 4×A100 是否可用 | **显示"超额"** | **实际可用（有150GiB余量）** | 严重误导 |

**根本原因：** `calculateInferenceMemory`（`memory-formulas.ts` L322）调用 `calculateKVCache` 时从未传入 `numKVHeads` 参数，且 `ModelInfo` 接口没有 `numKVHeads` 字段，无法从模型数据库读取 GQA 配置。`calculateKVCache` 函数本身已支持 GQA（新增了 `numKVHeads` 参数），但上层调用者未连接，导致所有 GQA 模型（LLaMA-3、Qwen2/3 系列）均按 MHA 全 head 计算，KV Cache 高估倍数 = numHeads/numKVHeads。

**对决策影响：** 工程师会误判"4 张 A100 不够"，多花 1-2 倍预算。

---

### 场景 2：Qwen2.5-7B QLoRA 微调（RTX 4090 24GB）

**测试配置：** INT4 量化，rank=16，batch=2，seq=2048

| 项目 | 工具估算 | 参考值 | 结论 |
|---|---|---|---|
| 量化基础模型 | ~3.26 GB | ~3.5-4 GB | 基本正确（歪打正着*） |
| LoRA 参数（q+v） | ~0.05 GB | ~0.1-0.15 GB（q,k,v,o 更常见） | 低估约 2× |
| 激活值 | ~2.1 GB（硬编码 b=2, s=2048） | 与用户配置相同，不响应输入变化 | 设计缺陷 |
| 总计 | ~5.7 GB | ~6-8 GB | **24GB 结论正确** |

> *注：QLoRA 权重计算公式逻辑有误（modelPrecisionBytes × quantizationRatio 歪打正着等于 0.5 bytes/param），但数值结果恰好正确。

**发现的代码缺陷：** `calculateFineTuningMemory` 中激活值路径全部使用硬编码 `calculateActivations(2, 2048, ...)` 而非 `config.batchSize/sequenceLength`，用户无论如何调节批量和序列，激活值显示永远不变，是严重的交互欺骗。

---

### 场景 3：DeepSeek-R1（671B MoE）8×H100 80GB 评估

**测试结果：** 模型数据已修正（`numHeads=128`），INT4 权重约 313 GiB，8×H100（640 GiB）可行。**方向正确。**

但发现：`ModelInfo` 中 `activeParams=37.0` 字段**在所有计算函数中从未被使用**，MoE 推理时 KV Cache 和激活值均按 `params=671B`（全量参数）估算，不反映 MoE 推理的实际激活参数机制。

---

### 场景 4：GRPO 训练 Qwen2.5-7B（k=8，梯度检查点开启）

**测试结果：** Policy/Reference 双模型区分正确，梯度检查点系数合理。工具估算约 47 GB，而实际使用 Flash Attention 时约 20-25 GB，**高估约 2×**，主要来源是 vanilla attention S×S 矩阵。

**结论：** 可能误导工程师认为 RTX 4090（24 GB）不够，实际上 Flash Attention + 梯度检查点下 7B GRPO (k=8) 在边界可行。

---

### 场景 5：InternVL2-26B 多模态推理

**测试结果：** 图像 Patch 计算（448/14）²=1024 正确，视觉编码器独立计算已实现，总量方向正确（约 60+ GB，需要 H100 80GB）。但 InternVL 系列不在模型数据库中，需用户手动输入参数，且视觉编码器比例固定为 `modelParams × 0.2`（不精确）。

---

### 场景 6：Flash Attention 高估量化

| 序列长度 | 工具 vs Flash Attention 高估倍数 | 实际影响 |
|---|---|---|
| seq=2048 | ~1.04× | 可忽略 |
| seq=8192 | ~1.7× | 中等 |
| seq=32768 | ~2.4× | 影响显著 |
| seq=131072 | ~10×+ | 严重误导长文本场景 |

工具完全无 Flash Attention 处理（全文搜索 0 处），按 vanilla S×S 矩阵估算激活值。

---

## 三、产品完整性评估（产品高级经理视角）

### P0 级缺陷：核心功能缺失 / 直接误导用户

**P0-1：KV Cache GQA/MQA 未连接**（场景 1 中已量化，高估 4-8×）
- 影响：LLaMA-3、Qwen 所有版本的推理 KV Cache 高估
- 修复：在 `ModelInfo` 增加 `numKVHeads` 字段；更新主流 GQA 模型的数据；`calculateInferenceMemory` 传入 `numKVHeads`

**P0-2：`AdvancedFineTuningCalculator` 从主导航完全消失**
- `page.tsx` 主 Tab 只有 `nlp` 和 `multimodal`，代码中无任何对 `advanced` Tab 的渲染
- 71KB 的高级微调计算器组件、完整的类型定义、i18n 文案全部存在，但用户根本无法访问
- 这不是设计决策，是遗漏

**P0-3：高级微调配置不持久化**
- `calculator-store.ts` 的 `partialize` 没有包含 `advancedFineTuningConfig`
- 用户在高级微调页面精心调整的 NLP/MoE/Multimodal/CNN 配置（约 30+ 字段），刷新后完全丢失

**P0-4：`calculateFineTuningMemory` 激活值无视用户输入**
- 全部方法（Full/LoRA/QLoRA/Prefix）的激活值均使用硬编码 `(2, 2048)`
- 用户调整批量大小和序列长度时，激活值数字不变，用户误以为这两个参数对显存没影响

**P0-5：多模态高级微调中 LoRA 参数量魔法数 100 万**
- `calculateMultimodalFineTuningMemory` 第 960 行：`const loraParams = 1000000`
- 与任何用户输入完全无关，对用户无任何参考价值

---

### P1 级缺陷：严重影响专业可信度

**P1-1：历史记录 GRPO/多模态支持缺失（约 40% 功能盲区）**
- `history-panel.tsx` 中 `getTypeLabel` 和 `handleLoadConfig` 的 switch 语句仅处理 training/inference/finetuning
- GRPO 历史标签显示原始 key 字符串 `"grpo"`，点击加载无任何反应

**P1-2：英文模式完全不可用**
- `language-context.tsx` 的 `en` 翻译对象为空（只有注释骨架）
- `page.tsx` 每次挂载时强制将 localStorage 写为 `'zh'`，用户切换后刷新被重置
- 但 README.md 和 header 上有英文版链接，外国用户访问后会体验极差

**P1-3：PerformanceMemoryCard 的 Info 图标悬停无内容**
- 3 个 `<Info>` 图标设置了 `cursor-help`，但没有任何 tooltip 实现
- 用户期望看到 TTFT/TPS 说明，实际是空操作

**P1-4：序列长度上限 32K，无法覆盖主流长文本场景**
- 当前模型库中 Qwen2.5（128K）、DeepSeek（164K）等主流模型上下文均超过 32K
- 推理计算器无法模拟真实长文本场景的 KV Cache 需求，严重低估

**P1-5：Prefill TTFT 公式未乘 batchSize**
- `performance-estimator.ts` L60：`prefillFlops = 2 × params × seq`，缺少 `× batchSize`
- batch=256 时 TTFT 低估约 256 倍，大批量场景性能估算完全失效

---

### P2 级缺陷：体验与精度问题

| 编号 | 问题 | 影响 |
|---|---|---|
| P2-1 | 自定义模型入口缺失 | 预训练工程师无法评估私有模型 |
| P2-2 | `calculateLoRAParams` 假设仅 q+v 2个 target | 实际默认 q,k,v,o 低估 2× |
| P2-3 | MoE 高级微调 `hiddenSize` 硬编码 4096 | DeepSeek 等 hiddenSize=7168 时路由显存误差 73% |
| P2-4 | `activeParams` 字段在推理计算中从未使用 | MoE 模型 KV Cache/激活值不反映真实激活参数量 |
| P2-5 | `calculateActivations` 注意力项缺 numHeads | LLaMA-70B（64 heads）注意力激活低估 64× |
| P2-6 | GPU 价格全为 0，"性价比均衡"建议无数据支撑 | 预算决策完全无法依靠 |
| P2-7 | 对比功能仅并排展示，无差值高亮 | 多方案对比体验差 |
| P2-8 | `assessMemoryUsage` 消息硬编码中文 | 英文模式下消息仍为中文 |

---

## 四、场景覆盖分析

| 用户场景 | 支持度 | 主要问题 |
|---|---|---|
| vLLM 部署规划（MHA 模型） | ✅ 正确 | — |
| vLLM 部署规划（GQA 模型，LLaMA/Qwen） | ❌ 严重高估 | KV Cache 高估 4-8× |
| 消费级 GPU LoRA/QLoRA 微调 | ✅ 方向正确 | 激活值不随输入变化 |
| GRPO 训练资源规划 | ⚠️ 高估约 2× | 未考虑 Flash Attention |
| 大模型 MoE 推理（DeepSeek/Qwen-MoE） | ⚠️ KV Cache 偏大 | activeParams 未使用 |
| 多模态 VLM 部署 | ✅ 总量方向正确 | 编码器比例固定 |
| 128K+ 长文本推理 | ❌ 无法配置 | 序列长度上限 32K |
| 私有/实验性模型评估 | ❌ 无入口 | 缺自定义模型输入 |
| 高级精细化微调参数规划 | ❌ 无法访问 | Tab 入口缺失 |
| 多方案对比决策 | ⚠️ 只能 GRPO/多模态以外 | 历史记录支持不完整 |

---

## 五、综合评级

| 维度 | 评分（/5） | 主要说明 |
|---|---|---|
| 核心计算公式（MHA 模型） | 4.0 | 主流 MHA 场景准确；GQA 严重高估 |
| 核心计算公式（GQA/MoE） | 2.0 | KV Cache 严重高估；activeParams 未使用 |
| 产品功能完整性 | 2.5 | 高级微调 Tab 消失；历史记录有盲区 |
| 模型数据库质量 | 4.0 | 缺 numKVHeads；主要参数已修正 |
| 用户体验 | 4.0 | 视觉好；国际化缺失；参数无 Tooltip |
| 工程质量 | 3.5 | 有测试；持久化漏洞；公式硬编码 |

**总体评级：★★★（参考工具，MHA 模型可信，GQA 模型需谨慎）**

---

## 六、优先修复清单

### 本周必修（影响正确性）

1. **P0-1：为 ModelInfo 增加 `numKVHeads` 字段**，补充 LLaMA-3/Qwen 系列的 KV heads 数据，`calculateInferenceMemory` 传入 `numKVHeads`
2. **P0-2：接通高级微调主导航 Tab**，`page.tsx` TabsList 改为 3 列，添加 AdvancedFineTuningCalculator 渲染
3. **P0-4：微调激活值使用 `config.batchSize/sequenceLength`**，移除硬编码 `(2, 2048)`

### 近期迭代（影响可信度）

4. **P0-3：`partialize` 添加 `advancedFineTuningConfig`**
5. **P1-1：历史记录补充 GRPO/多模态支持**
6. **P1-5：Prefill TTFT 乘以 batchSize**
7. **P2-4：推理计算使用 `activeParams` 或 KV Cache 中区分 MoE**
8. 序列长度上限扩展至 128K

### 季度规划（影响产品深度）

9. 英文翻译补全或移除语言切换入口
10. 自定义模型输入功能
11. GPU 价格数据补充
12. 对比功能增加差值高亮
13. 参数 Tooltip 系统建设

---

## 七、总结

本产品在视觉层、架构设计层、技术覆盖广度方面均表现优秀，已经过三轮公式修复，主流 MHA 场景（如 DeepSeek-R1/V3 系列、全量训练、GRPO 基础场景）的计算正确性已显著提升。**核心瓶颈在于 GQA KV Cache 未连接**，这是当下生产中最常用的模型（LLaMA-3、Qwen2/3 全系列）的主要推理部署场景，一旦修复，产品可信度将有实质性跃升。

对于 MHA 架构的 DeepSeek 系列、GLM 系列，以及基础微调/训练场景，当前工具可作为可靠的量级参考；对于 LLaMA/Qwen GQA 模型的推理 KV Cache 规划，建议配合 vLLM profiling 实测验证。
