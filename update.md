# 更新日志

## 2026-04-01 — 第四轮质量审查修复

### 生产构建修复（关键）
- **CSP 与静态预渲染不兼容**：`middleware.ts` 原 nonce-based CSP（`script-src 'nonce-xxx' 'strict-dynamic'`）与 Next.js 静态预渲染（`○ Static`）根本不兼容——静态 HTML 在构建期生成，无法携带运行时动态 nonce，导致浏览器 block 所有 `_next/static/` JS 文件，页面只剩背景网格可见。修复为 `script-src 'self' 'unsafe-inline'` + `connect-src` 补充 WebSocket（支持 HMR），恢复生产模式正常加载。
- **PWA Service Worker 缓存策略过宽**：`runtimeCaching` 正则 `/^https?.*/` 匹配所有 HTTP 请求，Service Worker 会缓存旧版 HTML 和 JS，重新构建后用户仍看到旧版页面。修复为仅缓存图片（30天）和字体（1年），不再缓存页面 HTML 和 JS chunks。
- **Middleware Edge Runtime 兼容**：移除 `import { randomBytes } from 'crypto'`，改用 Web Crypto API `crypto.getRandomValues()`，消除开发服务器报错。

### 计算公式修复
- **高级微调 NLP KV Cache 修正**：`calculateNLPFineTuningMemory` 中 KV Cache 设为 0——微调训练阶段 KV Cache 在前向传播中动态生成后即释放，无需预先分配固定显存（原来错误高估 GQA 模型 4-8 倍）。

### 安全修复
- **CORS 配置矛盾消除**：`next.config.ts` 中 `Access-Control-Allow-Credentials: true` 与 `Access-Control-Allow-Origin: *` 同时存在违反 CORS 规范。移除 Credentials 头，HTTP 方法限制为 `GET,OPTIONS,POST`。

### 产品功能修复
- **国际化语言重置 Bug**：`page.tsx` 的 `useEffect` 每次页面加载都强制将 `localStorage` 写为 `zh`，导致用户选择英文后刷新被重置。修正为仅在尚未设置时才写入默认值，保留用户语言偏好。
- **硬编码中文标签移至 ZH 常量**：`page.tsx` 中 `modeLabels`、`tabLabels`、`getTabLabel` 里的硬编码中文统一替换为 `ZH.tabs.*` 引用。
- **高级微调历史记录恢复**：`CalculatorType` 新增 `'finetuning_advanced'` 枚举值；`calculator-store.ts` 高级微调历史改用新 key；`history-panel.tsx` 补充 `finetuning_advanced` case，恢复时跳转至 `advanced` Tab；同步补全 `result-sharing.ts` 两处 `typeLabels/typeText` 映射；`mcp/resources/history.ts` 本地 `mode` 类型补充新枚举值。

### UI/显示修复
- **显存分解百分比 "0.0%" Bug**：所有 5 个计算器（训练/推理/微调/GRPO/多模态）的显存分解条目均使用 `n.toFixed(1)%` 格式化，大模型场景下"其他开销 1.5GB"等小项百分比不足 0.1%，显示 `0.0%`，误以为 Bug。新增 `formatPercentage()` 函数：< 0.1% 显示 `<0.1%`，< 1% 保留 2 位小数，≥ 1% 保留 1 位小数；进度条添加最小可见宽度（0.3%）。
- **Dark mode CSS 变量补全**：`globals.css` 补充完整的 `.dark { ... }` CSS 变量覆盖，修复深色模式下文字/背景颜色来自 light 变量导致的潜在显示异常；补充 `.dark .glass-*`、`.dark .tc-navbar` 等关键组件的深色样式覆盖。

### 独立严格审计报告
- 新增 `docs/independent-audit-report.md`（第四轮独立审计），以三个独立视角（核心公式、产品完整性/工程质量、UI/UX/数据质量）对三轮修复后的状态进行深度评估，给出 P0-P3 级别的仍存在问题清单和修复建议。

---

## 2026-04-01 — 第三轮质量审查修复

### 安全加固
- `middleware.ts` CSP `script-src` 去除 `'unsafe-inline'`，改为 nonce-based（`'nonce-{nonce}' 'strict-dynamic'`）。每次请求通过 `randomBytes(16)` 生成唯一 nonce 并经 `x-nonce` header 传递，真正消除 XSS 防护漏洞。

### 计算公式修复
- **KV Cache GQA/MQA 支持**：`calculateKVCache` 新增可选参数 `numKVHeads`，区分 MHA / GQA / MQA 三种注意力机制。LLaMA-3-8B 使用 GQA-8，KV Cache 从错误的 2.0 GB 修正为 0.5 GB（节省 75%）。
- **LoRA 参数估算去除硬编码**：`calculateLoRAParams` 新增 `hiddenSize` 参数（默认 4096），消除对 DeepSeek（hiddenSize=7168）等模型约 73% 的估算误差。`calculateFineTuningMemory` 中的两处调用同步传入真实 hiddenSize。
- **激活值系数修正**：高级微调 NLP `activationMultiplier` 从 6 改为 12，对齐 Megatron-LM 论文（Korthikanti et al., 2022）精确推导值。

### 数据质量
- 国产 AI 加速卡（海光 BW1000/BW151、昆仑芯 P800、天垓 150、紫霄 C200）`features` 数组中添加"算力为估算值"标注，代码注释同步标注，避免误导用户。

### 测试
- 新增 `src/__tests__/memory-formulas.test.ts`（vitest），共 **31 个单元测试，全部通过**。
- 覆盖范围：`getQuantizationRatio`、`calculateKVCache`（MHA/GQA/MQA）、`calculateLoRAParams`、`calculateInferenceMemory`、`calculateTrainingMemory`、`calculateGRPOMemory`、`calculateFineTuningMemory`。
- `package.json` 新增 `test` / `test:ui` 脚本，安装 `vitest@4.1.2`。

---

## 2026-04-01 — 第二轮质量审查修复

- **Qwen3-8B `numLayers` 同步**：`qwen3-8b` 条目 `numLayers: 32 → 36`，与 `qwen3-8b-fp8` 保持一致，对齐官方 config.json。
- **LoRA 运算符优先级 bug**：`fine-tuning-calculator.tsx` 中 `config.loraRank ?? 4 * 2 * 4096` 解析错误（`??` 优先级低于 `*`），修正为 `(config.loraRank ?? 4) * 2 * 4096`。
- **MCP API 响应解析**：`calculator-store.ts` 中 `data.result.content[0].text` 改用可选链 `data?.result?.content?.[0]?.text`，并加显式格式校验，消除潜在 `TypeError`。

---

## 2026-04-01 — 第一轮质量审查修复

### 计算公式（3 个严重 Bug）

**量化系数 2 倍错误（P0）**
`getQuantizationRatio` 以 FP32 为基准并再乘以 FP16 字节数，等效将 INT4/INT8/FP8 量化模型权重低估约 50%。修正为以 FP16 为统一基准：FP8/INT8 = 0.5×，INT4 = 0.25×。

**GRPO 缺少 Reference Model（P0）**
GRPO 训练时 Policy Model（训练中，INT4 量化）和 Reference Model（FP16 冻结，用于 KL 散度）必须同时保留在显存中。原代码只计算 Policy Model，低估约 40-50%。修正后两个模型均计入总显存，并在 breakdown 中以独立条目展示。

**高级微调梯度/优化器乘以梯度累积步数（P0）**
`calculateNLPFineTuningMemory` 中梯度和优化器状态原来乘以 `gradientAccumulationSteps`。梯度累积只是原地累加，不新增显存占用，最高导致 16 倍高估。已移除该乘数。

### 模型数据库修复

| 问题 | 修正 |
|---|---|
| DeepSeek V3/R1 全系 `numHeads: 56` | → `128`（MLA Q heads 实际值） |
| 虚构的 DeepSeek-V4（800B，从未发布） | 已删除 |
| `Qwen3-8B/8B-FP8` `numLayers: 32` | → `36`（官方 config.json） |
| H800 `fp16Tflops: 989` | → `495`（dense 实际值，原为稀疏峰值，高估 2×） |

### 工程质量修复

- **防抖计时器**：`_timeout` 系列从 Zustand state 移至模块级 `_debounceTimers` 对象，不再触发全量订阅通知，消除每次输入都重渲染所有消费组件的性能问题。
- **非空断言**：`loraRank!` / `loraAlpha!` 改为 `?? 4` / `?? 16` 默认值，消除 Full/Prefix 模式下的潜在运行时错误。

### 品牌字样清理

- GPU 数据库、模型数据库注释去除云厂商品牌字样，改为中性描述。
- `vendor: '腾讯'` 改为 `'Hunyuan'`（更准确），`ModelVendor` 类型及 `getVendors()` 同步更新。
- README.md、README.zh.md、QA.md 中相关描述替换为中性词语。

---

## 2026-03-31 — 多模态独立编码器 & UI 修复

- **多模态独立编码器接入**：`hasVisionEncoder` / `hasAudioEncoder` / `hasVideoEncoder` 开关正式接入显存计算公式，各编码器在 breakdown 中以独立条目展示，精度分别使用 `visionPrecision` / `audioPrecision`。
- 音频窗口长度滑块刻度删除 10s 与 5s 重叠刻度。
- MCP `MultimodalConfig` 补充 `concurrentUsers` 字段，修复 build 类型错误。
- `page.tsx` `useMemo` 补全 `fineTuningConfig.batchSize/sequenceLength` 依赖项。

---

## 2026-03-31 — 并行部署方案 & 交互优化

- **并行部署方案页签**：GPU 推荐区新增"并行方案"页签（始终展示，移除 800 GB 阈值限制），与 GPU 推荐共享性能/内存结果，切换时自动同步；`ParallelismAdvisor` GPU 列表从 `GPU_DATABASE` 动态过滤数据中心级卡。
- 余量/不足显存统一取整，不足时提示增加节点数。
- 批量大小刻度统一为 1/8/16/32；序列长度刻度统一为 1K/4K/8K/16K/32K。
- 推理 & 多模态推理新增并发用户数滑块（1/4/8/16/32）。
- **训练计算器**：模型参数量滑块替换为供应商+基础模型下拉选择，与其他计算器统一交互模式。
- `AnimatedNumber` 增加 NaN/undefined 防护，修复刷新后显示 NaN 问题。
- `calculator-store` persist 升至 v3，`migrate` 回调自动补全 `concurrentUsers`（v2）和 `modelId`（v3）旧版字段。

---

## 2026-03-31 — 大规模 UI 优化与工程改进

- **TickSlider 组件**：新增 `src/components/ui/tick-slider.tsx`，可点击刻度跳转，替换全部主要滑块；批量大小/序列长度改为单列布局，彻底解决刻度重叠问题。
- **高级微调简化**：移除"预设模板"和"高级设置"页签，保留 NLP + 多模态两个核心页签；移除 `page.tsx` 对 `advancedConfig` 的整体订阅，修复滑块操作闪屏。
- 多模态序列长度上限从 4096 扩展到 32768。
- **TypeScript & ESLint 严格模式**：修复 50+ 类型错误，启用 `strict`，`no-explicit-any` 改为 warn。
- `middleware.ts` CSP 移除 `unsafe-eval`。
- 删除 `.backup` 文件，清理 `language-context.tsx` 重复 key（减少约 485 行代码）。
- 新增 UI 测试计划文档 `docs/UI-TEST-PLAN.md`（272 行，覆盖全部计算器 Tab 的手动测试矩阵）。

---

## 2026-03-30 — 计算器 UI 与模型数据优化

- 重构 `models-data.ts` 模型数据结构，规范化字段命名。
- 优化推理 / 微调 / 训练 / GRPO / 多模态 / 高级微调共 6 个计算器组件。
- `calculator-store` 新增配置字段，`types/index.ts` 新增对应类型定义。
- `QA.md` 追加 GRPO 偏好优化与高级微调的详细使用说明。
- 新增性能估算卡片，GPU 数据库扩充数据中心级 GPU 规格，新增 GPU 数量滑块。
- 移除 CI/CD workflow（`.github/workflows/ci.yml`），精简仓库配置。
