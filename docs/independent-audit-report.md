# LLM 显存计算器 — 独立严格审计报告（第四轮）

**审计日期：** 2026-04-01  
**审计方法：** 三个独立审计维度（核心公式、产品完整性/工程质量、UI/UX/数据质量）并行执行  
**审计基准：** 基于当前代码实际状态，确认三轮修复后仍存在的问题

---

## 一、执行摘要

本报告在已有三轮质量修复（涵盖量化系数、GRPO Reference Model、梯度累积、GQA KV Cache、LoRA hiddenSize、激活值系数等关键问题）的基础上，对产品进行第四轮独立严格审计。审计从三个维度展开：核心计算公式正确性、产品完整性与工程质量、UI/UX与数据质量。

核心发现：三轮修复已显著提升产品基础质量，推理主路径（`calculateInferenceMemory` + `calculateKVCache`）的 GQA/MQA 支持已正确实装，Prefill TTFT 已正确乘以 batchSize。但**高级微调模块**仍存在多个公式缺陷，国际化功能完全失效，部分安全问题未处理。

---

## 二、已确认修复的问题

以下第一至三轮修复的关键问题经代码验证确认已修复：

| 修复项 | 验证状态 |
|--------|---------|
| 量化系数（FP16 基准） | 已修复，FP8/INT8=0.5x，INT4=0.25x |
| GRPO Reference Model | 已修复，双模型均计入显存 |
| 梯度累积步数误乘 | 已修复，移除该乘数 |
| KV Cache GQA/MQA（推理路径） | 已修复，`calculateKVCache` 支持 `numKVHeads` |
| LoRA hiddenSize 硬编码 | 已修复，`calculateLoRAParams` 新增参数 |
| 激活值系数 | 已修正为 12 |
| CSP 安全加固 | 已修复，nonce-based |
| Prefill TTFT 未乘 batchSize | 已修复，当前代码正确包含 `config.batchSize` |
| 高级微调 Tab 入口 | 已修复，`page.tsx` 已渲染 `AdvancedFineTuningCalculator` |
| DeepSeek-V3 numHeads | 已修正为 128 |
| H800 fp16Tflops | 已修正为 495（dense 值） |

---

## 三、仍存在的问题（按严重程度分级）

### P0 — 阻塞性问题

**P0-1：高级微调 NLP KV Cache 公式错误**
- 文件：`src/utils/memory-formulas.ts` 第 796 行
- 问题：公式为 `2 * batchSize * maxLength * hiddenSize * numLayers * modelPrecisionBytes`，使用了 `hiddenSize` 而非 `hiddenSize / numHeads * numKVHeads`，即未使用 `calculateKVCache()` 函数。对 GQA 模型（如 Qwen3-8B 的 GQA-4 配置）KV Cache 会高估 4 倍。
- 正确做法：调用已有的 `calculateKVCache()` 函数，或使用 `headDim = hiddenSize / numAttentionHeads` 和 `kvHeads = numKVHeads ?? numAttentionHeads`。
- 影响：所有使用高级微调计算器的 GQA 模型显存被高估。

**P0-2：高级微调训练中 KV Cache 不应计入总显存**
- 文件：`src/utils/memory-formulas.ts` 第 829 行
- 问题：`kvCacheGB` 被加入 total 计算。在标准训练/微调中，KV Cache 在前向传播中动态生成和释放，不需要预先分配。只有使用 prefix caching 等特殊技术时才需要预留。
- 影响：微调显存被额外高估，幅度取决于序列长度和批大小。

**P0-3：英文翻译完全缺失，国际化功能失效**
- 文件：`src/contexts/language-context.tsx` 第 540-614 行
- 问题：`en` 对象仅包含注释骨架，没有任何翻译内容。`t()` 函数在英文模式下会返回 key 字符串而非翻译文本。
- 叠加问题：`src/app/page.tsx` 第 74-78 行每次页面加载都强制 `localStorage.setItem('language', 'zh')`，即使用户选择英文也会被重置。
- 硬编码中文散布在 `page.tsx`（第 154、176、179 行）和 `history-panel.tsx`（第 48-49 行）。
- 影响：英文用户体验完全破裂。

**P0-4：CORS 配置矛盾**
- 文件：`next.config.ts` 第 50-53 行
- 问题：同时设置 `Access-Control-Allow-Origin: *` 和 `Access-Control-Allow-Credentials: true`，违反 CORS 规范，浏览器会忽略该头部。
- 影响：跨域请求可能失败。

### P1 — 严重问题

**P1-1：高级微调缺少 `numKVHeads` 参数支持**
- 文件：`src/utils/memory-formulas.ts` 第 742 行
- 问题：`calculateNLPFineTuningMemory` 接收 `numAttentionHeads` 但没有 `numKVHeads` 参数，注意力分数计算也未区分 GQA/MQA。
- 影响：GQA 模型的高级微调 KV Cache 和注意力分数均不准确。

**P1-2：注意力分数计算未考虑 Flash Attention**
- 文件：`src/utils/memory-formulas.ts` 第 791-792 行
- 问题：公式 `batchSize * numAttentionHeads * sequenceLength * sequenceLength` 按 vanilla attention 的 S x S 矩阵计算。现代推理框架普遍使用 Flash Attention，注意力分数不需要全量存储。
- 影响：seq=32768 时高估约 2.4 倍，seq=131072 时高估 10 倍以上。

**P1-3：高级微调历史记录无法恢复**
- 文件：`src/store/calculator-store.ts` 第 582、596 行
- 问题：高级微调使用 `addToHistory('finetuning', ...)` 保存，但 `history-panel.tsx` 的 `handleLoadConfig` 中 `case 'finetuning'` 恢复的是普通微调配置，高级微调配置结构不同。
- 影响：用户保存的高级微调历史无法正确恢复。

**P1-4：高级微调组件 71KB 单文件，any 类型泛滥**
- 文件：`src/components/calculators/advanced-fine-tuning-calculator.tsx`
- 问题：单文件 71.51KB，三个 render 函数共 7 处 `any` 类型（第 405-407、412、883-885、890、1299-1301、1306 行）。
- 影响：类型安全失效，维护困难。

**P1-5：激活值系数 12 的论文引用不够精确**
- 文件：`src/utils/memory-formulas.ts` 第 788 行
- 问题：注释声称"对齐 Megatron-LM 论文（Korthikanti et al., 2022）精确推导值"，但该论文主要讨论减少激活重计算的技术，并未直接给出 "12x" 这个数字。不使用梯度检查点时约 10-13x 是社区广泛引用的范围，但直接标注为"精确推导值"不够严谨。

### P2 — 中等问题

**P2-1：位置编码显存不应乘以 batchSize**
- 文件：`src/utils/memory-formulas.ts` 第 821-822 行
- 问题：`maxLength * hiddenSize * modelPrecisionBytes` 作为位置编码显存是合理的（位置编码是预计算的查找表，不需要按 batch 复制），但如果代码中隐含了 batch 维度则需要检查。
- 影响：可能高估位置编码显存。

**P2-2：GPU 价格数据全部为 0**
- 文件：`src/lib/models-data.ts` GPU_DATABASE 所有 25 个条目
- 问题：所有 `price: 0`，GPU 推荐组件的"性价比"建议无数据支撑，`getGPUsByPriceRange()` 返回空数组。
- 影响：用户无法基于成本做决策。

**P2-3：GPU 推荐回退估算过于粗糙**
- 文件：`src/utils/performance-estimator.ts` 第 106-125 行
- 问题：所有 >=80GB 显存的 GPU 回退估算为 bandwidth=2000, fp16Tflops=300，忽略了架构差异（H100 vs A100 vs 国产卡）。
- 影响：未在数据库中的 GPU 性能估算不准确。

**P2-4：TickSlider 缺失可访问性支持**
- 文件：`src/components/ui/tick-slider.tsx`（全文 73 行）
- 问题：无 `aria-label`、`aria-valuemin/max/now`、`role="slider"` 属性。刻度按钮无 `role="radio"` 或 `aria-checked`。搜索 `src/` 整个目录未发现任何 `aria-label` 属性。
- 影响：不符合 WCAG 2.1 AA 标准。

**P2-5：PWA 缓存策略过于宽松**
- 文件：`next.config.ts` 第 11-21 行
- 问题：`urlPattern: /^https?.*/` 匹配所有 HTTP(S) 请求，缓存 1 天。
- 影响：用户可能获得过时的模型/GPU 数据。

**P2-6：文档未更新 GQA/MQA 支持说明**
- 文件：`docs/VRAM_CALCULATION_FORMULAS.md` 和 `.zh.md`
- 问题：代码已支持 GQA/MQA KV Cache，但文档中搜索不到 GQA/MQA 相关内容。
- 影响：开发者/用户无法从文档了解最新计算精度。

### P3 — 轻微问题

**P3-1：`kvCacheRatio` 缺少文档说明**
- 文件：`src/types/index.ts` 第 127 行
- 问题：`kvCacheRatio` 的含义不直观（"动态 KV Cache 相对于最大序列长度的比例"），缺少 JSDoc 注释。

**P3-2：MoE 高级微调激活值系数无理论依据**
- 文件：`calculateMultimodalFineTuningMemory` / `calculateMoEFineTuningMemory`
- 问题：NLP 模式激活值系数有 Megatron 论文支撑，但 MoE 和多模态模式使用固定乘数，无注释说明来源。

**P3-3：窗口事件监听器类型不安全**
- 文件：`src/store/calculator-store.ts` 第 679 行
- 问题：`window.addEventListener('languageChanged', (event: any) => ...)` 应使用 `CustomEvent<string>`。

**P3-4：API 路由暴露过多 HTTP 方法**
- 文件：`next.config.ts` 第 52 行
- 问题：`GET,OPTIONS,PATCH,DELETE,POST,PUT` 全部开放，应限制为必要方法。

**P3-5：缺少自定义模型输入功能**
- 影响：预训练工程师无法评估私有/实验性模型。

---

## 四、综合评级

| 维度 | 评分（/10） | 说明 |
|------|------------|------|
| 推理计算公式正确性 | 8.5 | MHA/GQA/MQA 推理路径准确，KV Cache 正确；Flash Attention 未考虑（P1） |
| 高级微调计算公式 | 5.5 | KV Cache 公式错误（P0），训练中不应计入 KV Cache（P0），缺 numKVHeads（P1） |
| 基础微调/训练/GRPO | 8.0 | 主流场景准确；Flash Attention 未考虑 |
| 产品功能完整性 | 6.5 | 高级微调 Tab 已修复；国际化失效（P0）；高级微调历史不可恢复（P1） |
| 工程质量 | 6.0 | TypeScript strict 已启用；any 泛滥（P1）；组件过大（P1） |
| 数据质量 | 7.5 | 模型数据经三轮修正已较准确；GPU 价格全为 0（P2） |
| 安全性 | 7.0 | CSP nonce-based 完善；CORS 矛盾（P0） |
| UI/UX | 7.0 | TickSlider 体验好；无 a11y 支持（P2）；缓存策略过宽（P2） |

**总体评级：6.5/10 — 基础推理计算可靠，高级微调模块需重点修复，国际化功能需补全或关闭入口**

---

## 五、优先修复清单

### 本周必修（影响计算正确性）

1. **P0-1 + P0-2：修复高级微调 KV Cache** — 改用 `calculateKVCache()` 函数，或添加 Flash Attention 开关；训练模式下 KV Cache 设为 0
2. **P1-1：高级微调添加 `numKVHeads` 支持** — 在 `NLPFineTuningConfig` 中新增参数
3. **P0-3：国际化处理** — 要么补全英文翻译，要么移除语言切换入口避免误导

### 近期迭代（影响可信度）

4. **P0-4：修复 CORS 配置矛盾**
5. **P1-2：添加 Flash Attention 开关**
6. **P1-3：高级微调历史记录支持**
7. **P2-2：GPU 价格数据** — 至少补齐主流消费级 GPU 的市场参考价

### 季度规划

8. **P2-4：TickSlider 可访问性** — 添加 ARIA 属性
9. **P2-6：文档同步更新**
10. **P1-4：拆分高级微调组件 + 消除 any 类型**

---

## 六、与前一轮评估报告的对比

| 前一轮报告中的问题 | 当前状态 |
|-------------------|---------|
| KV Cache GQA/MQA 未连接（高估 4-8x） | 已修复，推理路径正确 |
| 高级微调 Tab 消失 | 已修复，page.tsx 已渲染 |
| 高级微调配置不持久化 | 已修复，partialize 已包含 |
| 微调激活值硬编码 (2, 2048) | 已修复，使用 config 值 |
| 多模态 LoRA 魔法数 100 万 | 未验证（本次审计未覆盖） |
| Prefill TTFT 未乘 batchSize | 已修复 |
| 序列长度上限 32K | 已扩展至 32768（推理和多模态） |
| 英文翻译为空 | 仍然存在（P0-3） |
| GPU 价格全为 0 | 仍然存在（P2-2） |

---

## 七、结论

三轮修复已在推理主路径上取得显著成效，对于 MHA 和 GQA 模型的**推理**显存估算（`calculateInferenceMemory`），工具已可作为可靠的量级参考。但**高级微调模块**（`calculateNLPFineTuningMemory`）存在多个独立的公式缺陷，KV Cache 计算不正确、训练中不应计入 KV Cache、缺少 GQA 支持，这些需要优先修复。国际化功能完全失效是一个产品设计层面的关键决策点——要么投入资源补全翻译，要么关闭语言切换入口以维护产品信誉。

---

## References

1. [Reducing Activation Recomputation in Large Transformer Models (Korthikanti et al., 2022)](https://arxiv.org/abs/2205.05198)
2. [DeepSeek-V3 config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/config.json)
3. [NVIDIA H800 GPU Datasheet](https://www.chaoqing-i.com/upload/20231128/NVIDIA%20H800%20GPU%20Datasheet.pdf)
