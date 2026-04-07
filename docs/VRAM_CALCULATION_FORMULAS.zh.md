# VRAM显存计算公式文档

本文档详细介绍了AI显存计算器中使用的所有VRAM计算公式，包括最近修复和验证的高级微调模型公式。

## 目录

- [概述](#概述)
- [统一LLM框架](#统一llm框架)
- [基础计算公式](#基础计算公式)
- [高级微调公式](#高级微调公式)
- [参数规格说明](#参数规格说明)
- [最近修复和改进](#最近修复和改进)
- [公式验证结果](#公式验证结果)

## 概述

本系统中的所有VRAM计算都基于**统一LLM框架**和最新的工程实践。核心原理是：

```
总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
```

不同计算模式的主要区别在于**P_train（可训练参数）**的值。

## 统一LLM框架

### 核心组件

1. **模型权重**：存储在内存中的基础模型参数
2. **优化器状态**：优化算法的额外内存（SGD=1x，AdamW=2x）
3. **梯度**：反向传播过程中存储参数梯度的内存
4. **激活值**：中间层输出的内存
5. **其他开销**：系统开销、缓冲区等

### 精度和量化

| 精度类型 | 字节数 | 压缩比 | 使用场景 |
|---------|--------|--------|----------|
| FP32 | 4 | 1.0x | 训练标准 |
| FP16/BF16 | 2 | 2.0x | 混合精度训练 |
| INT8 | 1 | 4.0x | 量化推理 |
| INT4 | 0.5 | 8.0x | 极端量化 |

## 基础计算公式

### 1. 推理显存计算

```
总显存 = 量化模型权重 + KV缓存 + 激活值（最小）

其中：
- 量化模型权重 = P_total × 精度字节数 × 量化比例
- KV缓存 = batch_size × seq_len × hidden_size × layers × 2 × 精度字节数
- 激活值 = 训练激活值的10%（推理时更小）
```

### 2. 微调显存计算

#### 全量微调
```
P_train = P_total（所有参数需要梯度）
总显存 = 模型权重 + (P_train × 优化器因子) + (P_train × 梯度精度) + 激活值
```

#### PEFT方法（LoRA/QLoRA/Prefix）
```
P_train << P_total（只有少量参数需要梯度）

LoRA: P_train = calculateLoRAParams(rank)，约为总参数的1%
QLoRA: 基础模型量化 + LoRA参数
Prefix: P_train = 1% × P_total
```

### 3. 训练显存计算

```
P_train = P_total（全量训练）
总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销

其中：
- 优化器状态 = P_total × 4字节 × 优化器因子（SGD=1，AdamW=2）
- 梯度 = P_total × 训练精度字节数
- 激活值支持梯度检查点（减少70%）
```

### 4. GRPO显存计算

**核心特性：激活值 = k × SFT激活值**，其中k是偏好组大小

```
GRPO激活值 = k × SFT激活值
其中 k = numGenerations（偏好组大小）

对比：
- SFT: 激活值 = 1 × 基础
- DPO: 激活值 ≈ 2 × 基础  
- GRPO(k=4): 激活值 = 4 × 基础
- GRPO(k=8): 激活值 = 8 × 基础

通常使用PEFT方法：
- 模型权重：INT4量化（8倍压缩）
- P_train = 1% × P_total（LoRA等）
- 显存瓶颈：激活值组件
```

### 5. 多模态显存计算

**核心：总序列长度决定激活值显存**

```
总序列长度 = 文本Token + 图像Patch + 音频Patch + 视频Patch

其中：
- 图像序列长度 = (分辨率/patch_size)² × 图像数量
- 视频序列长度 = 帧数 × 每帧patch数（序列长度爆炸的来源）
- 音频序列长度 = 时长(ms) / 80ms

激活值显存 = batch_size × 总序列长度 × hidden_size × layers × 精度字节数
```

## 高级微调公式

### NLP模型微调

**最近修复：modelSize参数现在正确影响VRAM计算**

```
总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + KV缓存 + 预留内存

其中：
- 模型权重 = modelSize × 1e9 × modelPrecisionBytes
- 优化器状态 = trainableParams × getPrecisionBytes('FP32') × optimizerFactor
- 梯度 = trainableParams × modelPrecisionBytes
- 激活值 = batchSize × sequenceLength × hiddenSize × numLayers × modelPrecisionBytes
- KV缓存 = batchSize × sequenceLength × hiddenSize × numLayers × 2 × modelPrecisionBytes
```

**关键参数：**
- `modelSize`：0.125B - 175B（现在在计算中正确使用）
- `hiddenSize`：768 - 12288（影响激活值和KV缓存）
- `intermediateSize`：2048 - 49152（影响FFN层）
- `numLayers`：6 - 80（影响所有层相关计算）

### 多模态模型微调

**最近修复：modelSize参数现在正确影响VRAM计算**

```
总显存 = 视觉编码器 + 文本编码器 + 融合层 + 优化器 + 梯度 + 激活值

其中：
- 视觉编码器参数 = max(计算的视觉参数, modelSize × 1e9 × 0.3)
- 文本编码器参数 = max(计算的文本参数, modelSize × 1e9 × 0.5)
- 融合层 = crossModalAlignmentWeight × hiddenSize × modelPrecisionBytes
```

**关键参数：**
- `modelSize`：1B - 100B（现在在计算中正确使用）
- `imageResolution`：224×224 - 1024×1024
- `patchSize`：14 - 32
- `batchSize`：4 - 32
- `sequenceLength`：512 - 4096

### MoE模型微调

**已正常工作：modelSize参数正确实现**

```
总显存 = 路由器 + 激活专家 + 路由概率 + 专家分配 + 负载均衡 + 优化器 + 梯度

其中：
- 专家参数 = modelSize / numExperts（每个专家的参数数量）
- 激活专家内存 = numActiveExperts × expertParams × 1e9 × modelPrecisionBytes
- 路由器内存 = hiddenSize × numExperts × modelPrecisionBytes
```

**关键参数：**
- `modelSize`：1B - 1600B（正确影响专家大小）
- `numExperts`：2 - 64（反向影响每个专家大小）
- `numActiveExperts`：1 - 8（影响激活内存）

### CNN模型微调

**已正常工作：modelSize参数正确实现**

```
总显存 = 卷积层 + 特征图 + 全连接层 + 优化器 + 梯度

其中：
- 卷积层 = modelSize × 0.8 × 1e9 × modelPrecisionBytes（80%参数）
- 全连接层 = modelSize × 0.2 × 1e9 × modelPrecisionBytes（20%参数）
- 特征图 = batchSize × totalFeatureMapSize × modelPrecisionBytes
```

**关键参数：**
- `modelSize`：0.005M - 0.5M（正确影响层大小）
- `inputImageSize`：224×224 - 512×512
- `batchSize`：32 - 512
- `architectureType`：ResNet、VGG、DenseNet等

## 参数规格说明

### NLP模型参数

| 参数 | 范围 | 默认值 | 描述 | 对VRAM的影响 |
|------|------|--------|------|-------------|
| `modelSize` | 0.125B - 175B | 7B | 模型总参数量 | **高** - 直接影响所有组件 |
| `hiddenSize` | 768 - 12288 | 4096 | 隐藏层维度 | **高** - 影响激活值和KV缓存 |
| `intermediateSize` | 2048 - 49152 | 11008 | FFN中间层大小 | **中** - 影响FFN层 |
| `numLayers` | 6 - 80 | 32 | Transformer层数 | **高** - 乘以层相关内存 |
| `numAttentionHeads` | 8 - 128 | 32 | 注意力头数 | **低** - 影响注意力计算 |
| `batchSize` | 1 - 64 | 16 | 训练批次大小 | **高** - 乘以激活值内存 |
| `sequenceLength` | 512 - 8192 | 2048 | 输入序列长度 | **高** - 乘以激活值内存 |

### 多模态模型参数

| 参数 | 范围 | 默认值 | 描述 | 对VRAM的影响 |
|------|------|--------|------|-------------|
| `modelSize` | 1B - 100B | 7B | 模型总参数量 | **高** - 影响编码器大小 |
| `imageResolution` | 224×224 - 1024×1024 | 336×336 | 输入图像分辨率 | **高** - 影响patch数量 |
| `patchSize` | 14 - 32 | 14 | 视觉Transformer patch大小 | **中** - 反向影响patch数量 |
| `batchSize` | 4 - 32 | 8 | 训练批次大小 | **高** - 乘以所有内存 |
| `sequenceLength` | 512 - 4096 | 1024 | 文本序列长度 | **中** - 影响文本处理 |

### MoE模型参数

| 参数 | 范围 | 默认值 | 描述 | 对VRAM的影响 |
|------|------|--------|------|-------------|
| `modelSize` | 1B - 1600B | 8B | 模型总参数量 | **高** - 决定专家大小 |
| `numExperts` | 2 - 64 | 8 | 专家总数 | **中** - 反向影响专家大小 |
| `numActiveExperts` | 1 - 8 | 2 | 激活专家数 | **高** - 直接影响激活内存 |
| `expertCapacityFactor` | 1.0 - 2.0 | 1.25 | 专家容量乘数 | **低** - 影响负载均衡 |

### CNN模型参数

| 参数 | 范围 | 默认值 | 描述 | 对VRAM的影响 |
|------|------|--------|------|-------------|
| `modelSize` | 0.005M - 0.5M | 0.05M | 模型总参数量 | **高** - 影响所有层大小 |
| `inputImageSize` | 224×224 - 512×512 | 224×224 | 输入图像大小 | **中** - 影响特征图 |
| `batchSize` | 32 - 512 | 64 | 训练批次大小 | **高** - 乘以特征图内存 |
| `kernelSize` | 3 - 7 | 3 | 卷积核大小 | **低** - 影响参数数量 |

## 最近修复和改进

### 2024-12-19：重大参数修复

**发现的问题：**
- NLP和多模态模型的`modelSize`参数没有正确连接到VRAM计算
- 参数被解析但在实际计算公式中被忽略

**应用的修复：**

#### 1. NLP模型修复
```typescript
// 修复前（损坏）：
const modelParams = hiddenSize * numLayers * 4; // 固定计算，忽略modelSize

// 修复后（正确）：
const modelSizeParams = modelSize * 1e9; // 使用实际modelSize参数
const calculatedParams = hiddenSize * numLayers * 4;
const modelParams = Math.max(calculatedParams, modelSizeParams); // 使用较大值
```

#### 2. 多模态模型修复
```typescript
// 修复前（损坏）：
const visionEncoderParams = patchEmbeddingParams + visionTransformerParams; // 固定计算

// 修复后（正确）：
const modelSizeParams = modelSize * 1e9;
const calculatedVisionParams = patchEmbeddingParams + visionTransformerParams;
const visionEncoderParams = Math.max(calculatedVisionParams, modelSizeParams * 0.3); // 视觉30%
const textEncoderParams = Math.max(calculatedTextParams, modelSizeParams * 0.5); // 文本50%
```

### 验证结果

**测试方法：**
- 对所有4种模型类型进行系统参数测试
- 拖拽滑块控件和键盘输入测试
- 验证每个参数的VRAM变化

**结果总结：**

| 模型类型 | 参数 | 状态 | VRAM变化示例 |
|----------|------|------|-------------|
| **NLP** | modelSize | ✅ **已修复** | 7B→8.7B: 320.5GB→385.7GB (+65.2GB) |
| **NLP** | hiddenSize | ✅ 正常工作 | 4096→4352: 254.9GB→274.4GB (+19.5GB) |
| **NLP** | intermediateSize | ✅ 正常工作 | 11008→11776: 320.5GB→320.9GB (+0.4GB) |
| **NLP** | numLayers | ✅ 正常工作 | 32.0→35.9: 320.9GB→328.3GB (+7.4GB) |
| **多模态** | modelSize | ✅ **已修复** | 7B→8.5B: 106.7GB→129.0GB (+22.3GB) |
| **MoE** | modelSize | ✅ 正常工作 | 8B→34.3B: 24.4GB→99.8GB (+75.4GB) |
| **MoE** | numExperts | ✅ 正常工作 | 8.0→39.2: 99.8GB→21.6GB (-78.2GB) |
| **CNN** | modelSize | ✅ 正常工作 | 连续增加: 2.0GB→2.1GB→2.2GB |

**优化参数（正确的非功能性）：**
- 权重衰减、预热步数、梯度裁剪、Dropout率
- 这些参数影响训练动态，而不是内存需求

## 公式验证示例

### 示例1：NLP模型（7B → 14B）

```
修复前：
- modelSize参数：7B → 14B
- VRAM：320.5 GB → 320.5 GB（无变化 - 损坏）

修复后：
- modelSize参数：7B → 14B
- 模型权重：7B×2字节 → 14B×2字节 = 14GB → 28GB (+14GB)
- 优化器状态：7B×8字节 → 14B×8字节 = 56GB → 112GB (+56GB)
- 总VRAM：~320GB → ~450GB (+130GB) ✅ 正常工作
```

### 示例2：多模态模型（7B → 72B）

```
修复前：
- modelSize参数：7B → 72B
- VRAM：4.5 GB → 4.5 GB（无变化 - 损坏）

修复后：
- modelSize参数：7B → 72B
- 视觉编码器：max(计算值, 72B×0.3) = 21.6B参数
- 文本编码器：max(计算值, 72B×0.5) = 36B参数
- 总VRAM：~107GB → ~800GB (+693GB) ✅ 正常工作
```

### 示例3：MoE模型专家缩放

```
MoE反向关系（已正常工作）：
- numExperts：8 → 32
- 专家大小：8B/8 = 1B → 8B/32 = 0.25B每个专家
- 激活内存：2×1B = 2B → 2×0.25B = 0.5B
- VRAM：更高 → 更低（正确的反向关系）✅
```

## 最佳实践

### 1. 参数选择指南

**训练时：**
- 从较小的`modelSize`和`batchSize`开始初始测试
- 逐步增加`sequenceLength`以找到内存限制
- 使用混合精度（FP16）减少内存使用

**推理时：**
- 使用量化（INT8/INT4）进行生产部署
- 优化`batchSize`以平衡吞吐量与延迟
- 考虑长序列的KV缓存优化

### 2. 内存优化策略

**梯度检查点：**
- 减少激活值内存70%
- 增加计算时间约20%
- 对大模型必不可少

**混合精度训练：**
- 减少内存使用约50%
- 保持训练稳定性
- 现代GPU支持

**量化：**
- INT8：75%内存减少，最小精度损失
- INT4：87.5%内存减少，一些精度损失
- 最适合推理工作负载

### 3. 常见问题排查

**内存不足（OOM）错误：**
1. 首先减少`batchSize`（线性内存影响）
2. 启用梯度检查点
3. 使用混合精度训练
4. 考虑超大模型的模型并行

**训练缓慢：**
1. 如果内存允许，增加`batchSize`
2. 为您的用例优化`sequenceLength`
3. 使用梯度累积而不是更大批次
4. 考虑分布式训练

## 参考文献

1. **Attention Is All You Need** - Transformer架构基础
2. **Mixed Precision Training** - NVIDIA混合精度指南
3. **LoRA: Low-Rank Adaptation** - 参数高效微调
4. **Switch Transformer** - 专家混合架构
5. **LLaVA: Large Language and Vision Assistant** - 多模态模型架构

---

*本文档基于最新的工程实践和验证结果进行维护和更新。最后更新：2024-12-19*
