# 大模型显存计算公式详解

本文档详细说明了 AI 显存计算器使用的所有计算公式，这些公式基于通用LLM框架和最新的工程实践。

## 目录

- [基础概念](#基础概念)
- [通用LLM框架](#通用llm框架)
- [推理模式计算](#推理模式计算)
- [微调模式计算](#微调模式计算)
- [训练模式计算](#训练模式计算)
- [GRPO模式计算](#grpo模式计算)
- [多模态模式计算](#多模态模式计算)
- [实际案例](#实际案例)
- [优化建议](#优化建议)
- [参考文献](#参考文献)

## 基础概念

### 1. 精度类型与字节数

不同的数值精度占用不同的内存空间：

| 精度类型 | 字节数 | 位数 | 说明 |
|---------|--------|------|------|
| FP32 (Float32) | 4 | 32 | 单精度浮点，训练标准精度 |
| FP16 (Float16) | 2 | 16 | 半精度浮点，常用于混合精度训练 |
| BF16 (BFloat16) | 2 | 16 | Brain Float，保持FP32的指数范围 |
| INT8 | 1 | 8 | 8位整数量化（4倍压缩） |
| INT4 | 0.5 | 4 | 4位整数量化（8倍压缩） |

### 2. 量化比例

| 量化类型 | 压缩比例 | 显存节省 | 说明 |
|---------|---------|---------|------|
| None | 1.0 | 0% | 无量化 |
| INT8 | 0.25 | 75% | 相比FP32减少75% |
| INT4 | 0.125 | 87.5% | 相比FP32减少87.5% |

### 3. 模型参数计算

```
参数显存 = 参数数量 × 精度字节数 × 量化比例
```

例如：7B 模型使用 FP16：
```
7 × 10^9 × 2 bytes = 14 GB
```

例如：7B 模型使用 INT4量化：
```
7 × 10^9 × 0.5 bytes = 3.5 GB
```

## 通用LLM框架

### 核心公式

所有显存计算都基于这个统一框架：

```
总显存占用 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
```

### 关键概念：P_train（可训练参数量）

不同训练/推理模式的核心区别在于**P_train**的大小：

- **推理模式**: P_train = 0（无需梯度）
- **全量训练/微调**: P_train = P_total（所有参数需要梯度）
- **PEFT方法**: P_train << P_total（只有少量参数需要梯度）

### 显存组成详解

1. **模型权重**：网络参数本身
2. **优化器状态**：如Adam的一阶、二阶动量（仅当P_train > 0）
3. **梯度**：反向传播计算的梯度（仅当P_train > 0）
4. **激活值**：前向传播的中间结果
5. **其他开销**：KV缓存、系统开销等

## 推理模式计算

### 完整公式

```
总显存 = 量化模型权重 + KV缓存 + 激活值（少量）
```

### 详细计算

```python
def calculate_inference_memory(model_params, batch_size, seq_len, precision, quantization):
    # 1. 量化模型权重
    model_memory = model_params * get_precision_bytes(precision) * get_quantization_ratio(quantization)
    
    # 2. KV缓存（推理的主要显存消耗）
    kv_cache = batch_size * seq_len * hidden_size * num_layers * 2 * get_precision_bytes(precision)
    
    # 3. 激活值（推理时很小）
    activations = calculate_inference_activations(batch_size, seq_len)
    
    return (model_memory + kv_cache + activations) / (1024^3)  # 转换为GB
```

### KV缓存详解

KV缓存是推理时的主要显存消耗，随序列长度二次增长：

```
KV缓存 = batch_size × seq_len × hidden_size × num_layers × 2 × precision_bytes
```

其中`× 2`是因为需要存储Key和Value两部分。

## 微调模式计算

### 全量微调

```
P_train = P_total（所有参数需要梯度）
总显存 = 模型权重 + (P_train × 优化器系数) + (P_train × 梯度精度) + 激活值
```

#### 优化器系数
- **SGD**: 1（只需动量）
- **AdamW**: 2（一阶动量 + 二阶动量）

### PEFT方法（参数高效微调）

```
P_train << P_total（只有少量参数需要梯度）
```

#### LoRA微调

```python
def calculate_lora_params(model_params, lora_rank, target_modules_ratio=0.5):
    # LoRA参数量 = 2 × rank × 目标模块维度
    # 假设目标模块占总参数的50%，平均维度为hidden_size
    lora_params = 2 * lora_rank * (model_params * target_modules_ratio / hidden_size)
    return lora_params

# 典型值：7B模型，rank=8，约为总参数的1%
```

#### QLoRA微调

QLoRA = 量化基础模型 + LoRA参数（FP16）

```python
def calculate_qlora_memory(model_params, lora_rank):
    # 基础模型INT4量化
    quantized_base = model_params * 0.5 / (1024^3)
    
    # LoRA参数（FP16）+ 梯度 + 优化器
    lora_params = calculate_lora_params(model_params, lora_rank)
    lora_memory = lora_params * 2 * 3 / (1024^3)  # 参数+梯度+优化器(AdamW)
    
    # 激活值（减少）
    activations = calculate_reduced_activations()
    
    return quantized_base + lora_memory + activations
```

#### Prefix Tuning

```python
def calculate_prefix_params(model_params, prefix_length=128):
    # Prefix参数通常为总参数的1%
    return model_params * 0.01
```

## 训练模式计算

### 完整公式

```
P_train = P_total（全量训练）
总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
```

### 详细计算

```python
def calculate_training_memory(model_params, batch_size, seq_len, precision, optimizer):
    # 1. 模型权重（FP16/BF16）
    model_memory = model_params * get_precision_bytes(precision)
    
    # 2. 优化器状态（通常FP32）
    optimizer_memory = model_params * 4 * get_optimizer_factor(optimizer)
    
    # 3. 梯度（与训练精度一致）
    gradient_memory = model_params * get_precision_bytes(precision)
    
    # 4. 激活值（训练时最大的显存消耗）
    activation_memory = calculate_training_activations(batch_size, seq_len, precision)
    
    # 5. 其他开销（约10%）
    overhead = (model_memory + optimizer_memory + gradient_memory + activation_memory) * 0.1
    
    return (model_memory + optimizer_memory + gradient_memory + activation_memory + overhead) / (1024^3)
```

### 激活值计算（关键）

激活值是训练时的主要显存消耗：

```python
def calculate_training_activations(batch_size, seq_len, hidden_size, num_layers, precision, gradient_checkpointing=False):
    precision_bytes = get_precision_bytes(precision)
    
    # 注意力机制激活值
    attention_activations = (
        batch_size * seq_len * hidden_size * 3 +  # Q, K, V投影
        batch_size * seq_len * seq_len            # 注意力权重矩阵
    )
    
    # FFN层激活值（通常是4倍hidden_size）
    ffn_activations = batch_size * seq_len * hidden_size * 4 * 2  # 上升+下降投影
    
    # 每层激活值
    per_layer_activations = (attention_activations + ffn_activations) * precision_bytes
    
    # 总激活值
    total_activations = per_layer_activations * num_layers

    # 梯度检查点优化
if gradient_checkpointing:
        total_activations *= 0.3  # 减少约70%
    
    return total_activations / (1024^3)
```

## GRPO模式计算

### 核心特点

**GRPO的关键特征：激活值 = k × SFT激活值**

其中k是偏好组大小（numGenerations）。

### 算法对比

```
SFT训练:     激活值 = 1 × 基础激活值
DPO训练:     激活值 ≈ 2 × 基础激活值（偏好对比较）
GRPO(k=4):   激活值 = 4 × 基础激活值
GRPO(k=8):   激活值 = 8 × 基础激活值
```

### GRPO显存计算

```python
def calculate_grpo_memory(model_params, batch_size, seq_len, num_generations, method="qlora"):
    # GRPO通常使用PEFT方法减少参数显存
    if method == "qlora":
        # 1. 量化基础模型（INT4）
        model_memory = model_params * 0.5 / (1024^3)
        
        # 2. LoRA参数（约1%，FP16）
        lora_params = model_params * 0.01
        lora_memory = lora_params * 2 * 3 / (1024^3)  # 参数+梯度+优化器
        
    elif method == "full":
        # 全量GRPO（很少使用，显存需求巨大）
        model_memory = model_params * 2 / (1024^3)  # FP16
        optimizer_memory = model_params * 8 / (1024^3)  # AdamW, FP32
        gradient_memory = model_params * 2 / (1024^3)  # FP16
    
    # 3. GRPO核心：k倍激活值
    base_activations = calculate_sft_activations(batch_size, seq_len)
    grpo_activations = base_activations * num_generations  # 关键：k倍效应
    
    # 4. 其他开销
    overhead = calculate_overhead()
    
    if method == "qlora":
        return model_memory + lora_memory + grpo_activations + overhead
    else:
        return model_memory + optimizer_memory + gradient_memory + grpo_activations + overhead
```

### GRPO激活值详解

GRPO需要为每个偏好组生成多个候选回答，导致激活值成倍增长：

```python
def calculate_grpo_activations(batch_size, seq_len, num_generations, hidden_size, num_layers):
    # 基础SFT激活值
    base_activations = batch_size * seq_len * hidden_size * num_layers * coefficient
    
    # GRPO激活值 = k × 基础激活值
    grpo_activations = base_activations * num_generations
    
    return grpo_activations * precision_bytes / (1024^3)
```

## 多模态模式计算

### 核心概念：Total_Sequence_Length

多模态模型的关键是**Total_Sequence_Length**，它决定了激活值显存：

```
Total_Sequence_Length = 文本Token + 图像Patch + 音频Patch + 视频Patch
```

### 各模态序列长度计算

#### 1. 文本模态
```
文本序列长度 = token_count
```

#### 2. 图像模态
```
图像序列长度 = (分辨率 / patch_size)² × 图像数量

例如：1024×1024图像，patch_size=16
序列长度 = (1024/16)² = 4096 tokens
```

#### 3. 音频模态
```
音频序列长度 = 时长(ms) / 80ms

例如：10秒音频
序列长度 = 10000ms / 80ms = 125 tokens
```

#### 4. 视频模态（序列长度爆炸）
```
视频序列长度 = 帧数 × 每帧patch数

例如：30秒视频，30fps，1024×1024分辨率
序列长度 = 30 × 30 × (1024/16)² = 36,864,000 tokens！
```

### 多模态显存计算

```python
def calculate_multimodal_memory(model_params, inputs, precision):
    # 1. 模型权重
    model_memory = model_params * get_precision_bytes(precision) / (1024^3)
    
    # 2. 计算总序列长度
    total_seq_len = 0
    
    # 文本
    total_seq_len += inputs.text_tokens
    
    # 图像
    for image in inputs.images:
        image_patches = (image.resolution / image.patch_size) ** 2
        total_seq_len += image_patches
    
    # 音频
    for audio in inputs.audios:
        audio_patches = audio.duration_ms / 80
        total_seq_len += audio_patches
    
    # 视频（注意序列长度爆炸）
    for video in inputs.videos:
        frames = video.duration_sec * video.fps
        patches_per_frame = (video.resolution / video.patch_size) ** 2
        video_patches = frames * patches_per_frame
        total_seq_len += video_patches
    
    # 3. 激活值显存（核心）
    activation_memory = calculate_multimodal_activations(
        inputs.batch_size, 
        total_seq_len, 
        model_params.hidden_size, 
        model_params.num_layers, 
        precision
    )
    
    # 4. 其他显存开销
    kv_cache = calculate_kv_cache(inputs.batch_size, total_seq_len, precision)
    overhead = (model_memory + activation_memory + kv_cache) * 0.1
    
    return model_memory + activation_memory + kv_cache + overhead
```

### 多模态优化策略

#### 1. 分辨率控制
```python
# 降低图像分辨率大幅减少序列长度
resolution_512 = (512/16)² = 1024 tokens
resolution_1024 = (1024/16)² = 4096 tokens  # 4倍增长
```

#### 2. 视频帧率控制
```python
# 降低视频帧率
fps_30 = 30 * patches_per_frame * duration
fps_5 = 5 * patches_per_frame * duration  # 6倍减少
```

#### 3. 分片处理
对于超长视频，可以分片处理避免显存爆炸。

## 实际案例

### 案例1：Qwen2.5-7B 推理

```
模型：Qwen2.5-7B
精度：FP16
量化：INT4
批次：1
序列：4096

计算：
- 模型权重：7B × 0.5 bytes = 3.5 GB
- KV缓存：1 × 4096 × 4096 × 28 × 2 × 2 bytes ≈ 3.7 GB
- 激活值：0.2 GB
总计：7.4 GB
```

### 案例2：Llama-3.1-70B QLoRA微调

```
模型：Llama-3.1-70B
方法：QLoRA (rank=16)
批次：4
序列：2048

计算：
- 量化模型：70B × 0.5 bytes = 35 GB
- LoRA参数：~0.7B × 2 × 3 bytes = 4.2 GB
- 激活值：~8 GB
总计：47.2 GB（单个80GB A100可训练）
```

### 案例3：Qwen2.5-VL-7B 多模态推理

```
模型：Qwen2.5-VL-7B
输入：文本100 tokens + 4张1024×1024图像
批次：1

计算序列长度：
- 文本：100 tokens
- 图像：4 × (1024/16)² = 16,384 tokens
- 总计：16,484 tokens

显存：
- 模型权重：7B × 2 bytes = 14 GB
- KV缓存：1 × 16,484 × 4096 × 28 × 2 × 2 bytes ≈ 15.3 GB
- 激活值：~2 GB
总计：31.3 GB
```

### 案例4：GRPO训练 (k=8)

```
基础模型：Qwen2.5-7B
方法：LoRA GRPO
偏好组大小：8
批次：2
序列：2048

计算：
- 量化模型：7B × 0.5 bytes = 3.5 GB
- LoRA内存：~0.5 GB
- GRPO激活值：基础激活值 × 8 = ~16 GB
总计：20 GB（激活值占主导）
```

## 优化建议

### 1. 通用优化

#### 减少批次大小
```
显存 ∝ batch_size
```

#### 梯度累积
```python
effective_batch_size = batch_size × gradient_accumulation_steps
# 用小batch_size + 多步累积模拟大batch_size
```

#### 混合精度训练
```python
# 使用FP16/BF16可减少50%显存
memory_saving = 0.5
```

### 2. 激活值优化

#### 梯度检查点
```python
# 减少70%激活值，增加30%计算时间
if gradient_checkpointing:
    activation_memory *= 0.3
    compute_time *= 1.3
```

#### 序列长度控制
```python
# 激活值与序列长度成正比
activation_memory ∝ sequence_length
```

### 3. 模型并行

#### 数据并行
- 每个GPU存储完整模型
- 适合中小模型

#### 模型并行  
- 模型分片存储
- 适合超大模型

#### 流水线并行
- 按层划分模型
- 提高GPU利用率

### 4. 量化优化

#### 推理量化
```python
# INT8: 75%显存节省，<1%性能损失
# INT4: 87.5%显存节省，1-3%性能损失
```

#### 训练量化
```python
# QLoRA: 基础模型INT4 + LoRA FP16
# 显存节省巨大，性能损失可接受
```

### 5. 多模态优化

#### 分辨率控制
```python
# 降低图像分辨率成平方级减少序列长度
memory_reduction = (old_resolution / new_resolution) ** 2
```

#### 模态选择
```python
# 避免视频输入导致的序列长度爆炸
# 优先使用音频+文本组合
```

## 参考文献

### 核心论文

1. **Transformer架构**
   - Vaswani et al. "Attention Is All You Need" (2017)
   
2. **混合精度训练**
   - Micikevicius et al. "Mixed Precision Training" (2018)
   
3. **梯度检查点**
   - Chen et al. "Training Deep Nets with Sublinear Memory Cost" (2016)
   
4. **LoRA**
   - Hu et al. "LoRA: Low-Rank Adaptation of Large Language Models" (2021)
   
5. **QLoRA**
   - Dettmers et al. "QLoRA: Efficient Finetuning of Quantized LLMs" (2023)
   
6. **GRPO算法**
   - Group-wise Ranking Preference Optimization相关论文

7. **多模态模型**
   - Qwen2.5-VL技术报告
   - LLaVA系列论文

### 工程实践

1. **量化技术**
   - Dettmers et al. "8-bit Optimizers via Block-wise Quantization" (2022)
   
2. **显存优化**
   - ZeRO论文系列
   - DeepSpeed技术文档

3. **多模态训练**
   - 各大模型厂商技术博客
   - 开源项目实现

## 工具和库

### 显存监控工具
1. **PyTorch**: `torch.cuda.memory_allocated()`
2. **Transformers**: `model.get_memory_footprint()`
3. **nvidia-smi**: GPU显存监控

### 优化库
1. **DeepSpeed**: ZeRO优化器，模型并行
2. **bitsandbytes**: 8-bit和4-bit量化
3. **PEFT**: 参数高效微调方法
4. **Accelerate**: 分布式训练简化

### 多模态库
1. **transformers**: 统一多模态模型接口
2. **timm**: 图像模型
3. **whisper**: 音频处理

## 总结

### 通用LLM框架的优势

1. **统一性**：所有模式使用相同的基础框架
2. **准确性**：基于P_train的精确区分
3. **可扩展性**：容易添加新的训练方法

### 关键要点

1. **激活值是瓶颈**：训练和GRPO模式下，激活值通常是最大的显存消耗
2. **P_train决定优化器开销**：PEFT方法的核心优势是大幅减少P_train
3. **序列长度影响巨大**：多模态场景下需要特别注意序列长度控制
4. **量化是必需的**：对于大模型推理和训练，量化几乎是必需的

### 未来发展

1. **更高效的PEFT方法**：减少可训练参数的同时保持性能
2. **更好的量化技术**：更低精度，更少性能损失
3. **多模态优化**：更高效的多模态表示和处理方法
4. **硬件协同设计**：专门为LLM优化的硬件架构

这个计算器基于这些公式提供精确的显存预估，帮助用户在各种场景下做出明智的硬件和配置选择。 