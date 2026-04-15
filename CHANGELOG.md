# Changelog

## [Unreleased] - 2026-04-15

### 新增功能

#### URL 链接导入模型（`/api/import-model`）
- 新增 `src/app/api/import-model/route.ts` API 路由
- 支持粘贴 HuggingFace（`huggingface.co`）和 ModelScope（`modelscope.cn`）模型页链接，自动解析 `config.json` 并填充自定义模型表单
- 支持 `master` / `main` 双分支回退，ModelScope 优先使用 `resolve` 直链，失败时降级到 raw API
- 参数量自动估算：Dense 模型用标准 Transformer 公式，MoE 模型用专家数 × FFN 维度修正公式
- HuggingFace 404 时自动查询仓库文件列表，给出具体原因提示

#### 多模态模型嵌套字段解析
- 支持三种 LLM 参数嵌套结构：`text_config`（Qwen3.5-VL / LLaVA）、`llm_config`（InternVL / 百度千帆 OCR）、`language_config`（Flamingo 衍生）
- 在 NLP 计算页导入多模态模型时，显示架构不匹配警告（"参数来自 text backbone，不含视觉编码器"），允许用户知情后继续使用

#### 非 LLM 模型识别
- 检测 `_diffusers_version` 字段（Diffusers 扩散模型唯一标志），返回友好提示而非报字段缺失错误
- 扩充扩散/视频生成 `model_type` 关键词：`ti2v`、`t2v`、`i2v`、`wan`、`cogvideo`、`hunyuanvideo` 等
- 修复 `dit` 子串误匹配 `ConditionalGeneration` 的问题（改为词边界正则匹配）

#### SSRF 安全防护
- URL 白名单校验：仅允许 `huggingface.co` 和 `modelscope.cn`，拒绝内网 IP、`http://`、任意第三方域名

### 功能改进

#### 导入模块 UI 主题色跟随
- `CustomModelForm` 新增 `accentColor` prop（`green / blue / purple / cyan`）
- `ModelSelector` 将 `accentColor` 和 `arch` 同步透传给 `CustomModelForm`
- 各页面颜色：推理=绿、训练=蓝、微调/GRPO=紫、多模态=青
- 导入按钮、成功提示背景、文字、图标均跟随主题色变化

#### 移除冗余"预设模型"标签
- 删除 `training-calculator.tsx`、`inference-calculator.tsx`、`grpo-calculator.tsx` 中 `ModelSelector` 上方多余的 `<label>` 标签（`ModelSelector` 内部已有"预设模型/自定义模型"页签）

### Bug 修复

- **ModelScope URL 识别失败**：原用 `/api/v1/models/.../repo/files` 文件列表 API（返回目录树），改为 `resolve/master/config.json` 直链，与 HuggingFace 方式对齐
- **MoE 参数量估算不准**：补充 `intermediate_size` 作为 `moe_intermediate_size` 的 fallback（MiniMax-M2 等模型使用此字段名）
- **HuggingFace 307 重定向未跟随**：fetch 加 `redirect: 'follow'`，确保 CDN 重定向正常处理
- **Qwen3.5-9B / Qwen3.5-35B-A3B 字段缺失**：这类模型将 LLM 参数嵌套在 `text_config` 子对象，现已自动下探解析
- **Wan2.2-TI2V-5B 报字段缺失而非扩散模型提示**：通过检测 `_diffusers_version` 字段修复
- **UI 颜色对比度过低**：修复了导入模块在亮色主题下字体/背景颜色不可见的问题
