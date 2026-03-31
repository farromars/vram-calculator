import {
  PrecisionType,
  OptimizerType,
  QuantizationType,
  TrainingConfig,
  InferenceConfig,
  FineTuningConfig,
  GRPOConfig,
  MultimodalConfig,
  MemoryBreakdown,
  NLPFineTuningConfig,
  MultimodalFineTuningConfig,
  MoEFineTuningConfig,
  CNNFineTuningConfig,
  AdvancedFineTuningConfig,
  AdvancedMemoryBreakdown,
  AdvancedModelType
} from '@/types';

// 翻译工具函数 - 根据当前语言获取标签
function getLabel(key: string, language: string = 'zh'): string {
  // 在浏览器环境中，总是从 localStorage 获取最新的语言设置
  if (typeof window !== 'undefined') {
    const currentLanguage = localStorage.getItem('language') || 'zh';
    language = currentLanguage;
  }
  
  const translations: Record<string, Record<string, string>> = {
    zh: {
      'model.weights': '模型权重',
      'model.params': '模型参数',
      'optimizer.states': '优化器状态',
      'gradients': '梯度',
      'activations': '激活值',
      'activations.k.times': '激活值 (k={k}倍)',
      'kv.cache': 'KV缓存',
      'embedding.layer': '嵌入层',
      'attention.layers': '注意力层',
      'ffn.layers': '前馈网络层',
      'attention.scores': '注意力分数',
      'position.encoding': '位置编码',
      'other.overheads': '其他开销',
      'text.tokens': '文本Token',
      'image.patches': '图像Patch',
      'audio.patches': '音频Patch',
      'video.patches': '视频Patch',
      'vision.encoder': '视觉编码器',
      'text.encoder': '文本编码器',
      'fusion.layer': '融合层',
      'image.features': '图像特征',
      'cross.modal.attention': '跨模态注意力',
      'lora.params': 'LoRA参数',
      'router': '路由器',
      'active.experts': '激活专家',
      'routing.probability': '路由概率',
      'expert.assignment': '专家分配',
      'load.balance': '负载均衡',
      'conv.layers': '卷积层',
      'feature.maps': '特征图',
      'fc.layers': '全连接层',
      'batch.normalization': '批归一化',
      'data.augmentation': '数据增强',
      // 系统建议翻译
      'suggestion.use.qlora.quantization': '考虑使用QLoRA量化技术减少显存占用',
      'suggestion.reduce.batch.size': '减少批次大小并使用梯度累积',
      'suggestion.reduce.sequence.length': '考虑减少序列长度或使用序列并行',
      'suggestion.reduce.lora.rank': '降低LoRA rank可以减少参数量',
      'suggestion.freeze.encoders': '考虑冻结部分编码器以减少训练参数',
      'suggestion.reduce.image.resolution': '降低图像分辨率可以显著减少显存占用',
      'suggestion.use.smaller.batch.multimodal': '多模态训练建议使用较小的批次大小',
      'suggestion.reduce.experts': '减少激活专家数量可以降低显存占用',
      'suggestion.reduce.expert.capacity': '降低专家容量因子可以提高效率',
      'suggestion.partial.lora.experts': '考虑只对部分专家应用LoRA',
      'suggestion.reduce.input.image.size': '降低输入图像尺寸可以减少特征图显存',
      'suggestion.increase.batch.size.cnn': 'CNN训练可以使用更大的批次大小提高效率',
      'suggestion.freeze.more.layers': '冻结更多底层可以减少训练参数'
    },
    en: {
      'model.weights': 'Model Weights',
      'model.params': 'Model Parameters',
      'optimizer.states': 'Optimizer States',
      'gradients': 'Gradients',
      'activations': 'Activations',
      'activations.k.times': 'Activations (k={k}x)',
      'kv.cache': 'KV Cache',
      'embedding.layer': 'Embedding Layer',
      'attention.layers': 'Attention Layers',
      'ffn.layers': 'FFN Layers',
      'attention.scores': 'Attention Scores',
      'position.encoding': 'Position Encoding',
      'other.overheads': 'Other Overheads',
      'text.tokens': 'Text Tokens',
      'image.patches': 'Image Patches',
      'audio.patches': 'Audio Patches',
      'video.patches': 'Video Patches',
      'vision.encoder': 'Vision Encoder',
      'text.encoder': 'Text Encoder',
      'fusion.layer': 'Fusion Layer',
      'image.features': 'Image Features',
      'cross.modal.attention': 'Cross-Modal Attention',
      'lora.params': 'LoRA Parameters',
      'router': 'Router',
      'active.experts': 'Active Experts',
      'routing.probability': 'Routing Probability',
      'expert.assignment': 'Expert Assignment',
      'load.balance': 'Load Balance',
      'conv.layers': 'Convolutional Layers',
      'feature.maps': 'Feature Maps',
      'fc.layers': 'Fully Connected Layers',
      'batch.normalization': 'Batch Normalization',
      'data.augmentation': 'Data Augmentation',
      // 系统建议翻译
      'suggestion.use.qlora.quantization': 'Consider using QLoRA quantization to reduce VRAM usage',
      'suggestion.reduce.batch.size': 'Reduce batch size and use gradient accumulation',
      'suggestion.reduce.sequence.length': 'Consider reducing sequence length or using sequence parallelism',
      'suggestion.reduce.lora.rank': 'Reducing LoRA rank can decrease parameter count',
      'suggestion.freeze.encoders': 'Consider freezing some encoders to reduce training parameters',
      'suggestion.reduce.image.resolution': 'Reducing image resolution can significantly decrease VRAM usage',
      'suggestion.use.smaller.batch.multimodal': 'Multimodal training recommends using smaller batch sizes',
      'suggestion.reduce.experts': 'Reducing the number of active experts can lower VRAM usage',
      'suggestion.reduce.expert.capacity': 'Reducing expert capacity factor can improve efficiency',
      'suggestion.partial.lora.experts': 'Consider applying LoRA to only some experts',
      'suggestion.reduce.input.image.size': 'Reducing input image size can decrease feature map VRAM',
      'suggestion.increase.batch.size.cnn': 'CNN training can use larger batch sizes for better efficiency',
      'suggestion.freeze.more.layers': 'Freezing more bottom layers can reduce training parameters'
    }
  };
  
  return translations[language]?.[key] || translations['zh'][key] || key;
}

/**
 * 获取精度对应的字节数
 */
export function getPrecisionBytes(precision: PrecisionType): number {
  switch (precision) {
    case 'FP32': return 4;
    case 'FP16': 
    case 'BF16': return 2;
    case 'FP8': return 1;
    default: return 4;
  }
}

/**
 * 获取优化器状态倍数
 */
export function getOptimizerMultiplier(optimizer: OptimizerType, precision: PrecisionType = 'FP32'): number {
  const baseBytes = getPrecisionBytes('FP32'); // 优化器状态通常用FP32
  const paramBytes = getPrecisionBytes(precision);
  
  switch (optimizer) {
    case 'SGD': return baseBytes / paramBytes; // 只需要动量，1倍参数
    case 'Adam':
    case 'AdamW': return (baseBytes * 2) / paramBytes; // 需要一阶和二阶动量，2倍参数
    default: return 2;
  }
}

/**
 * 获取量化比例
 */
export function getQuantizationRatio(quantization: QuantizationType): number {
  switch (quantization) {
    case 'None': return 1.0;
    case 'INT8': return 0.25; // 4倍压缩
    case 'INT4': return 0.125; // 8倍压缩
    case 'FP8': return 0.25; // 4倍压缩
    default: return 1.0;
  }
}

/**
 * 计算KV缓存大小 (GB)
 */
export function calculateKVCache(
  batchSize: number,
  sequenceLength: number,
  hiddenSize: number,
  numLayers: number,
  numHeads: number,
  precision: PrecisionType = 'FP16'
): number {
  // KV Cache = batch_size × seq_len × hidden_size × num_layers × 2(K+V) × precision_bytes
  const precisionBytes = getPrecisionBytes(precision);
  const kvCacheBytes = batchSize * sequenceLength * hiddenSize * numLayers * 2 * precisionBytes;
  return kvCacheBytes / (1024 ** 3); // 转换为GB
}

/**
 * 计算激活值大小 (GB)
 */
export function calculateActivations(
  batchSize: number,
  sequenceLength: number,
  hiddenSize: number,
  numLayers: number,
  precision: PrecisionType = 'FP16'
): number {
  // 简化激活值计算：主要包括注意力和FFN层的激活
  const precisionBytes = getPrecisionBytes(precision);
  
  // 注意力层激活值：Q, K, V矩阵 + 注意力分数矩阵
  const attentionActivations = batchSize * sequenceLength * hiddenSize * 3 + 
                              batchSize * sequenceLength * sequenceLength;
  
  // FFN层激活值：通常是hidden_size的4倍
  const ffnActivations = batchSize * sequenceLength * hiddenSize * 4 * 2; // 两个线性层
  
  // 总激活值
  const totalActivations = (attentionActivations + ffnActivations) * numLayers * precisionBytes;
  
  return totalActivations / (1024 ** 3); // 转换为GB
}

/**
 * 计算LoRA参数数量
 */
export function calculateLoRAParams(baseParams: number, rank: number): number {
  // 简化计算：假设LoRA应用到所有线性层
  // 实际LoRA参数 = 2 × rank × 原始权重维度
  // 这里用经验公式：LoRA参数约为原始参数的 (2 × rank / hidden_size) 比例
  const estimatedRatio = (2 * rank) / 4096; // 假设hidden_size=4096
  return baseParams * estimatedRatio;
}

/**
 * 训练显存计算 - 通用LLM框架（全量微调）
 * 总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
 */
export function calculateTrainingMemory(config: TrainingConfig, modelInfo?: { params?: number; hiddenSize?: number; numLayers?: number; numHeads?: number }): MemoryBreakdown {
  const { batchSize, sequenceLength, precision, optimizer, gradientCheckpointing } = config;
  
  // 从模型信息获取参数，如果没有则使用默认值
  const modelParams = modelInfo?.params || 7;
  const hiddenSize = modelInfo?.hiddenSize || 4096;
  const numLayers = modelInfo?.numLayers || 32;
  
  // 1. 模型权重 (Model Weights)
  const modelPrecisionBytes = getPrecisionBytes(precision);
  const modelWeightsGB = (modelParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);
  
  // 2. 优化器状态 (Optimizer States) - 全量微调：P_train = P_total
  const optimizerPrecisionBytes = getPrecisionBytes('FP32'); // 优化器状态通常用FP32
  const optimizerMultiplier = optimizer === 'SGD' ? 1 : 2; // SGD只需动量，AdamW需要一阶+二阶动量
  const optimizerGB = (modelParams * 1e9 * optimizerPrecisionBytes * optimizerMultiplier) / (1024 ** 3);
  
  // 3. 梯度 (Gradients) - 全量微调：P_train = P_total
  const gradientPrecisionBytes = getPrecisionBytes(precision);
  const gradientsGB = (modelParams * 1e9 * gradientPrecisionBytes) / (1024 ** 3);
  
  // 4. 激活值 (Activations)
  const baseActivationsGB = calculateActivations(batchSize, sequenceLength, hiddenSize, numLayers, precision);
  const gradientCheckpointMultiplier = gradientCheckpointing ? 0.3 : 1.0; // 梯度检查点减少70%
  const activationsGB = baseActivationsGB * gradientCheckpointMultiplier;
  
  // 5. 其他开销 (Misc Overheads)
  const otherOverheadGB = 1.5; // CUDA上下文、临时变量、框架开销等
  
  const total = modelWeightsGB + optimizerGB + gradientsGB + activationsGB + otherOverheadGB;
  
  return {
    modelParams: modelWeightsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: activationsGB,
    kvCache: 0, // 训练时通常不缓存KV
    total,
    breakdown: [
      { label: getLabel('model.weights'), value: modelWeightsGB, percentage: (modelWeightsGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('optimizer.states'), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('gradients'), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#10B981' },
      { label: getLabel('activations'), value: activationsGB, percentage: (activationsGB / total) * 100, color: '#EF4444' },
      { label: getLabel('other.overheads'), value: otherOverheadGB, percentage: (otherOverheadGB / total) * 100, color: '#6B7280' },
    ]
  };
}

/**
 * 推理显存计算
 */
export function calculateInferenceMemory(config: InferenceConfig, modelInfo?: { params?: number; hiddenSize?: number; numLayers?: number; numHeads?: number }): MemoryBreakdown {
  const { precision, quantization, batchSize, sequenceLength, kvCacheRatio } = config;
  
  // 从模型信息获取参数，如果没有则使用默认值
  const modelParams = modelInfo?.params || 7; // 参数量（B）
  const hiddenSize = modelInfo?.hiddenSize || 4096;
  const numLayers = modelInfo?.numLayers || 32;
  const numHeads = modelInfo?.numHeads || 32;
  
  const quantizationRatio = getQuantizationRatio(quantization);
  const paramBytes = getPrecisionBytes(precision);
  
  // 量化后的模型参数
  const modelParamsGB = (modelParams * 1e9 * paramBytes * quantizationRatio) / (1024 ** 3);
  
  // KV缓存
  const kvCacheGB = calculateKVCache(batchSize, sequenceLength, hiddenSize, numLayers, numHeads, precision) * kvCacheRatio;
  
  // 推理时的少量激活值
  const activationsGB = calculateActivations(batchSize, sequenceLength, hiddenSize, numLayers, precision) * 0.1;
  
  const total = modelParamsGB + kvCacheGB + activationsGB;
  
  return {
    modelParams: modelParamsGB,
    gradients: 0,
    optimizer: 0,
    activations: activationsGB,
    kvCache: kvCacheGB,
    total,
    breakdown: [
      { label: getLabel('model.params'), value: modelParamsGB, percentage: (modelParamsGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('kv.cache'), value: kvCacheGB, percentage: (kvCacheGB / total) * 100, color: '#8B5CF6' },
      { label: getLabel('activations'), value: activationsGB, percentage: (activationsGB / total) * 100, color: '#EF4444' },
    ]
  };
}

/**
 * 微调显存计算 - 通用LLM框架（支持全量和PEFT）
 * 总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
 */
export function calculateFineTuningMemory(config: FineTuningConfig, modelInfo?: { params?: number; hiddenSize?: number; numLayers?: number }): MemoryBreakdown {
  const { method, loraRank = 4, quantization, precision } = config;
  
  // 从模型信息获取参数，如果没有则使用默认值
  const baseModelParams = modelInfo?.params || 7; // 参数量（B）
  const hiddenSize = modelInfo?.hiddenSize || 4096;
  const numLayers = modelInfo?.numLayers || 32;
  const quantizationRatio = getQuantizationRatio(quantization);
  
  // === 通用LLM显存公式 ===
  
  // 1. 模型权重 (Model Weights)
  const modelPrecisionBytes = getPrecisionBytes(precision);
  
  // 2-3. 优化器状态和梯度：关键区别在于P_train（可训练参数量）
  let modelWeightsGB = 0;
  let trainableParams = 0; // P_train
  let activationsGB = 0;
  
  switch (method) {
    case 'Full':
      // 全量微调：P_train = P_total
      modelWeightsGB = (baseModelParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);
      trainableParams = baseModelParams;
      activationsGB = calculateActivations(2, 2048, hiddenSize, numLayers, precision); // 使用合理的默认值
      break;
      
    case 'LoRA':
      // LoRA微调：基础模型 + 小LoRA参数
      modelWeightsGB = (baseModelParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);
      trainableParams = calculateLoRAParams(baseModelParams, loraRank); // P_train极小
      activationsGB = calculateActivations(2, 2048, hiddenSize, numLayers, precision) * 0.8; // LoRA稍微减少激活值
      break;
      
    case 'QLoRA':
      // QLoRA：量化基础模型 + LoRA参数
      modelWeightsGB = (baseModelParams * 1e9 * modelPrecisionBytes * quantizationRatio) / (1024 ** 3);
      trainableParams = calculateLoRAParams(baseModelParams, loraRank); // P_train极小
      activationsGB = calculateActivations(2, 2048, hiddenSize, numLayers, precision) * 0.6; // QLoRA进一步减少
      break;
      
    case 'Prefix':
      // Prefix Tuning：约1%参数可训练
      modelWeightsGB = (baseModelParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);
      trainableParams = baseModelParams * 0.01; // 1%的参数量
      activationsGB = calculateActivations(2, 2048, hiddenSize, numLayers, precision) * 0.7;
      break;
  }
  
  // 2. 优化器状态 (Optimizer States) - 基于P_train
  const optimizerPrecisionBytes = getPrecisionBytes('FP32'); // 优化器状态用FP32
  const optimizerGB = (trainableParams * 1e9 * optimizerPrecisionBytes * 2) / (1024 ** 3); // AdamW需要2倍
  
  // 3. 梯度 (Gradients) - 基于P_train
  const gradientPrecisionBytes = getPrecisionBytes(precision);
  const gradientsGB = (trainableParams * 1e9 * gradientPrecisionBytes) / (1024 ** 3);
  
  // 5. 其他开销 (Misc Overheads)
  const otherOverheadGB = 1.0; // 微调通常比训练开销小
  
  const total = modelWeightsGB + optimizerGB + gradientsGB + activationsGB + otherOverheadGB;
  
  return {
    modelParams: modelWeightsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: activationsGB,
    kvCache: 0,
    total,
    breakdown: [
      { label: getLabel('model.weights'), value: modelWeightsGB, percentage: (modelWeightsGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('optimizer.states'), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('gradients'), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#10B981' },
      { label: getLabel('activations'), value: activationsGB, percentage: (activationsGB / total) * 100, color: '#EF4444' },
      { label: getLabel('other.overheads'), value: otherOverheadGB, percentage: (otherOverheadGB / total) * 100, color: '#6B7280' },
    ],
    // 附加信息
    metadata: {
      trainableParams,
      totalParams: baseModelParams,
      trainableRatio: (trainableParams / baseModelParams) * 100,
      methodInfo: `${method} (可训练参数: ${(trainableParams / baseModelParams * 100).toFixed(2)}%)`
    }
  };
}

/**
 * 格式化显存大小
 */
export function formatMemorySize(sizeGB: number): string {
  if (sizeGB < 1) {
    return `${(sizeGB * 1024).toFixed(1)} MB`;
  } else if (sizeGB < 1024) {
    return `${sizeGB.toFixed(1)} GB`;
  } else {
    return `${(sizeGB / 1024).toFixed(1)} TB`;
  }
}

/**
 * GRPO显存计算 - 按照正确的通用LLM框架实现
 * Group-wise Ranking Preference Optimization
 * 核心特点：激活值显存 = k × SFT_Activations，其中k是偏好组大小
 */
export function calculateGRPOMemory(config: GRPOConfig, modelInfo?: { params?: number; hiddenSize?: number; numLayers?: number; numHeads?: number }): MemoryBreakdown {
  const { precision, batchSize, numGenerations, sequenceLength, use8BitOptimizer, gradientCheckpointing } = config;
  
  // 从模型信息获取参数，如果没有则使用默认值
  const modelParams = modelInfo?.params || 7; // 参数量（B）
  const hiddenSize = modelInfo?.hiddenSize || 4096;
  const numLayers = modelInfo?.numLayers || 32;
  
  // === 通用LLM显存公式 ===
  // VRAM ≈ 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销
  
  // 1. 模型权重 (Model Weights) - 使用PEFT方法（如QLoRA）
  const modelPrecisionBytes = getPrecisionBytes(precision);
  const quantizationRatio = 0.125; // 假设使用INT4量化（8倍压缩）
  const modelWeightsGB = (modelParams * 1e9 * modelPrecisionBytes * quantizationRatio) / (1024 ** 3);
  
  // 2. 优化器状态 (Optimizer States) - P_train极小（PEFT）
  // GRPO通常使用PEFT方法，P_train << P_total
  const trainableParams = modelParams * 0.01; // 1%的参数量（LoRA等PEFT方法）
  const optimizerPrecisionBytes = getPrecisionBytes('FP32'); // 优化器状态用FP32
  const optimizerMultiplier = use8BitOptimizer ? 1 : 2; // AdamW需要2倍（一阶+二阶动量）
  const optimizerGB = (trainableParams * 1e9 * optimizerPrecisionBytes * optimizerMultiplier) / (1024 ** 3);
  
  // 3. 梯度 (Gradients) - 只针对可训练参数
  const gradientPrecisionBytes = getPrecisionBytes(precision);
  const gradientsGB = (trainableParams * 1e9 * gradientPrecisionBytes) / (1024 ** 3);
  
  // 4. 激活值 (Activations) - GRPO的核心特点
  // GRPO激活值 = k × SFT激活值，其中k是偏好组大小
  const k = numGenerations; // 偏好组大小：1个chosen + (k-1)个rejected
  
  // 基础SFT激活值计算
  const sftActivationsGB = calculateActivations(batchSize, sequenceLength, hiddenSize, numLayers, precision);
  
  // 应用梯度检查点优化
  const gradientCheckpointMultiplier = gradientCheckpointing ? 0.3 : 1.0; // 梯度检查点减少70%
  
  // GRPO激活值 = k倍基础激活值
  const grpoActivationsGB = k * sftActivationsGB * gradientCheckpointMultiplier;
  
  // 5. 其他开销 (Misc Overheads)
  const otherOverheadGB = 2.0; // CUDA上下文、临时变量、框架开销等
  
  const total = modelWeightsGB + optimizerGB + gradientsGB + grpoActivationsGB + otherOverheadGB;
  
  return {
    modelParams: modelWeightsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: grpoActivationsGB,
    kvCache: 0, // GRPO训练时通常不使用KV缓存
    total,
    breakdown: [
      { label: getLabel('model.weights'), value: modelWeightsGB, percentage: (modelWeightsGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('activations.k.times').replace('{k}', k.toString()), value: grpoActivationsGB, percentage: (grpoActivationsGB / total) * 100, color: '#EF4444' },
      { label: getLabel('optimizer.states'), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('gradients'), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#10B981' },
      { label: getLabel('other.overheads'), value: otherOverheadGB, percentage: (otherOverheadGB / total) * 100, color: '#6B7280' },
    ],
    // 附加信息：GRPO特有的参数
    metadata: {
      groupSize: k,
      sftActivationsGB: sftActivationsGB,
      activationMultiplier: k * gradientCheckpointMultiplier,
      trainableParams,
      totalParams: modelParams,
      methodInfo: `GRPO (Group Size=${k}, 激活值=${k}倍SFT)`
    }
  };
}

/**
 * 多模态显存计算 - 按照正确的通用框架重新实现
 * 总显存占用 = A(模型显存) + B(优化器状态) + C(梯度) + D(激活值) + E(其他开销)
 */
export function calculateMultimodalMemory(config: MultimodalConfig, modelInfo?: { params?: number; hiddenSize?: number; numLayers?: number; numHeads?: number }): MemoryBreakdown {
  const { mode, modalityType, textPrecision, batchSize, sequenceLength, 
          imageResolution, patchSize, numImages,
          audioWindowLength, videoFrameRate, videoLength } = config;
  
  // 从模型信息获取参数，如果没有则使用默认值
  const modelParams = modelInfo?.params || 7; // 参数量（B）
  const hiddenSize = modelInfo?.hiddenSize || 4096;
  const numLayers = modelInfo?.numLayers || 32;
  
  // A. 模型显存 (Model Parameters VRAM)
  const modelPrecisionBytes = getPrecisionBytes(textPrecision);
  const modelParamsGB = (modelParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);
  
  // 计算不同模态的序列长度组成
  const textSeqLength = sequenceLength;
  let imageSeqLength = 0;
  let audioSeqLength = 0;
  let videoSeqLength = 0;
  
  // 图像序列长度 = (H / patch_size) × (W / patch_size) × num_images
  if (modalityType?.includes('image')) {
    const patchesPerImage = Math.pow(imageResolution / patchSize, 2);
    imageSeqLength = patchesPerImage * numImages;
  }
  
  // 音频序列长度 = 从声谱图切分出的Patch数量
  if (modalityType?.includes('audio')) {
    const windowLength = audioWindowLength || 30;
    // 音频通常每80ms产生一个patch，转换为序列长度
    audioSeqLength = Math.floor((windowLength * 1000) / 80);
  }
  
  // 视频序列长度 = num_frames × patches_per_frame
  if (modalityType?.includes('video')) {
    const frameRate = videoFrameRate || 25;
    const length = videoLength || 10;
    const totalFrames = frameRate * length;
    const patchesPerFrame = Math.pow(imageResolution / patchSize, 2);
    videoSeqLength = totalFrames * patchesPerFrame;
  }
  
  // 总序列长度 = 各模态序列长度之和
  const totalSequenceLength = textSeqLength + imageSeqLength + audioSeqLength + videoSeqLength;
  
  // B. 优化器状态显存 + C. 梯度显存
  let optimizerGB = 0;
  let gradientsGB = 0;
  let trainableParams = 0; // P_train：需要训练的参数量
  
  if (mode === 'training') {
    // 全量微调：P_train = P_total
    trainableParams = modelParams;
    gradientsGB = (trainableParams * 1e9 * getPrecisionBytes(textPrecision)) / (1024 ** 3);
    optimizerGB = (trainableParams * 1e9 * getPrecisionBytes('FP32') * 2) / (1024 ** 3); // AdamW需要2倍
  } else if (mode === 'finetuning') {
    // PEFT微调：P_train 极小 (通常 < 1% 的 P_total)
    // 这里假设使用LoRA等PEFT方法，只训练很少的参数
    trainableParams = modelParams * 0.01; // 1%的参数量
    gradientsGB = (trainableParams * 1e9 * getPrecisionBytes(textPrecision)) / (1024 ** 3);
    optimizerGB = (trainableParams * 1e9 * getPrecisionBytes('FP32') * 2) / (1024 ** 3);
  }
  // 推理模式：trainableParams = 0，梯度和优化器都为0
  
  // D. 激活值显存 (Activations VRAM) - 多模态的核心计算
  // 概念公式: Batch_Size × Total_Sequence_Length × Hidden_Dim × Num_Layers × precision_bytes
  const activationPrecisionBytes = getPrecisionBytes(textPrecision);
  const activationsGB = (batchSize * totalSequenceLength * hiddenSize * numLayers * activationPrecisionBytes) / (1024 ** 3);
  
  // E. 其他开销 - CUDA上下文、临时变量、框架开销等
  const otherOverheadGB = 1.5; // 1.5GB固定开销
  
  const total = modelParamsGB + optimizerGB + gradientsGB + activationsGB + otherOverheadGB;
  
  // 构建breakdown数组
  const breakdown = [
    { label: getLabel('model.params'), value: modelParamsGB, percentage: (modelParamsGB / total) * 100, color: '#3B82F6' }
  ];
  
  if (optimizerGB > 0) {
    breakdown.push({ label: getLabel('optimizer.states'), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#F59E0B' });
  }
  
  if (gradientsGB > 0) {
    breakdown.push({ label: getLabel('gradients'), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#10B981' });
  }
  
  breakdown.push({ label: getLabel('activations'), value: activationsGB, percentage: (activationsGB / total) * 100, color: '#EF4444' });
  breakdown.push({ label: getLabel('other.overheads'), value: otherOverheadGB, percentage: (otherOverheadGB / total) * 100, color: '#6B7280' });
  
  // 添加序列长度分解信息（用于调试和用户理解）
  const sequenceBreakdown = [];
  if (textSeqLength > 0) {
    sequenceBreakdown.push({ label: getLabel('text.tokens'), value: textSeqLength, color: '#3B82F6' });
  }
  if (imageSeqLength > 0) {
    sequenceBreakdown.push({ label: getLabel('image.patches'), value: imageSeqLength, color: '#10B981' });
  }
  if (audioSeqLength > 0) {
    sequenceBreakdown.push({ label: getLabel('audio.patches'), value: audioSeqLength, color: '#F97316' });
  }
  if (videoSeqLength > 0) {
    sequenceBreakdown.push({ label: getLabel('video.patches'), value: videoSeqLength, color: '#EC4899' });
  }

  return {
    modelParams: modelParamsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: activationsGB,
    kvCache: 0, // 多模态训练通常不需要KV缓存
    total,
    breakdown,
    // 附加信息：序列长度分解
    metadata: {
      totalSequenceLength,
      textSeqLength,
      imageSeqLength,
      audioSeqLength,
      videoSeqLength,
      trainableParams,
      totalParams: modelParams,
      sequenceBreakdown
    }
  };
}

/**
 * 内存使用率评估
 */
export function assessMemoryUsage(requiredGB: number, availableGB: number): {
  utilizationRate: number;
  status: 'optimal' | 'warning' | 'critical';
  message: string;
} {
  const utilizationRate = (requiredGB / availableGB) * 100;

  if (utilizationRate <= 70) {
    return {
      utilizationRate,
      status: 'optimal',
      message: '显存使用率良好，运行稳定'
    };
  } else if (utilizationRate <= 90) {
    return {
      utilizationRate,
      status: 'warning',
      message: '显存使用率较高，建议优化'
    };
  } else {
    return {
      utilizationRate,
      status: 'critical',
      message: '显存不足，无法正常运行'
    };
  }
}

// ===== 高级模型类型的精确显存计算公式 =====

/**
 * NLP模型微调显存计算 - 基于完整超参数与显存计算公式文档
 * 总显存 = 模型权重显存 + 嵌入层显存 + 注意力层显存 + FFN显存 +
 *         优化器显存 + 梯度显存 + 激活值显存 + 注意力分数显存 +
 *         KV缓存显存 + LoRA显存 + 位置编码显存 + 1GB预留
 */
export function calculateNLPFineTuningMemory(config: NLPFineTuningConfig, language: string = 'zh'): AdvancedMemoryBreakdown {
  const {
    modelSize, precision, batchSize, sequenceLength, optimizer,
    hiddenSize, numLayers, loraRank, loraTargetModules, numAttentionHeads,
    vocabSize, intermediateSize, gradientAccumulationSteps, weightDecay,
    maxGenerationLength
  } = config;

  const modelPrecisionBytes = getPrecisionBytes(precision);

  // 1. 精确的模型参数量计算
  // 使用modelSize作为基准，结合具体架构参数
  // P = V × H + L × (H² × 4 + H × intermediate_size × 2)
  const embeddingParams = vocabSize * hiddenSize;
  const attentionParams = numLayers * hiddenSize * hiddenSize * 4; // q_proj, k_proj, v_proj, o_proj
  const ffnParams = numLayers * hiddenSize * intermediateSize * 2; // up_proj, down_proj
  const calculatedParams = embeddingParams + attentionParams + ffnParams;

  // 使用modelSize作为参数量基准，如果与计算值差异较大则以modelSize为准
  const modelSizeParams = modelSize * 1e9; // 将B转换为参数数量
  const totalParams = Math.max(calculatedParams, modelSizeParams);

  // 2. 嵌入层显存 = V × H × B
  const embeddingGB = (embeddingParams * modelPrecisionBytes) / (1024 ** 3);

  // 3. 注意力层显存 = L × H × H × 4 × B
  const attentionLayerGB = (attentionParams * modelPrecisionBytes) / (1024 ** 3);

  // 4. 前馈网络显存 = L × H × intermediate_size × 2 × B
  const ffnLayerGB = (ffnParams * modelPrecisionBytes) / (1024 ** 3);

  // 5. 模型权重总显存
  const modelWeightsGB = embeddingGB + attentionLayerGB + ffnLayerGB;

  // 6. 优化器状态显存 = P × B × M × (1 + gradient_accumulation_steps/batch_size)
  const optimizerMultiplier = getOptimizerMultiplier(optimizer, precision);
  const gradientAccumulationFactor = 1 + (gradientAccumulationSteps / batchSize);
  const optimizerGB = (totalParams * getPrecisionBytes('FP32') * optimizerMultiplier * gradientAccumulationFactor) / (1024 ** 3);

  // 7. 梯度显存 = P × B × gradient_accumulation_steps
  const gradientsGB = (totalParams * modelPrecisionBytes * gradientAccumulationSteps) / (1024 ** 3);

  // 8. 激活值显存 = batch_size × S × H × L × N × B
  // N = 激活值倍数 (4-8，取决于是否使用梯度检查点)
  const activationMultiplier = 6; // 标准值，包括前向和反向传播的激活值
  const activationsGB = (batchSize * sequenceLength * hiddenSize * numLayers * activationMultiplier * modelPrecisionBytes) / (1024 ** 3);

  // 9. 注意力分数显存 = batch_size × num_heads × S × S × L × B
  const attentionScoresGB = (batchSize * numAttentionHeads * sequenceLength * sequenceLength * numLayers * modelPrecisionBytes) / (1024 ** 3);

  // 10. KV缓存显存 = 2 × batch_size × max_length × H × L × B
  const maxLength = maxGenerationLength || sequenceLength;
  const kvCacheGB = (2 * batchSize * maxLength * hiddenSize * numLayers * modelPrecisionBytes) / (1024 ** 3);

  // 11. LoRA显存 = Σ(r × (d_in + d_out)) × B
  // 根据文档公式计算精确的LoRA参数量
  let loraParams = 0;
  loraTargetModules.forEach(module => {
    switch (module) {
      case 'q_proj':
      case 'k_proj':
      case 'v_proj':
      case 'o_proj':
        loraParams += loraRank * (hiddenSize + hiddenSize); // 2rH
        break;
      case 'gate_proj':
      case 'up_proj':
        loraParams += loraRank * (hiddenSize + intermediateSize);
        break;
      case 'down_proj':
        loraParams += loraRank * (intermediateSize + hiddenSize);
        break;
    }
  });
  loraParams *= numLayers; // 每层都有LoRA
  const loraGB = (loraParams * modelPrecisionBytes) / (1024 ** 3);

  // 12. 位置编码显存 = max_length × H × B
  const positionEncodingGB = (maxLength * hiddenSize * modelPrecisionBytes) / (1024 ** 3);

  // 13. 预留显存 + 权重衰减开销
  const baseReservedGB = 1.0;
  const weightDecayOverheadGB = weightDecay > 0 ? modelWeightsGB * 0.1 : 0;
  const reservedGB = baseReservedGB + weightDecayOverheadGB;

  const total = embeddingGB + attentionLayerGB + ffnLayerGB + optimizerGB + gradientsGB +
                activationsGB + attentionScoresGB + kvCacheGB + loraGB + positionEncodingGB + reservedGB;

  return {
    modelParams: modelWeightsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: activationsGB,
    kvCache: kvCacheGB,
    total,
    breakdown: [
      { label: getLabel('embedding.layer', language), value: embeddingGB, percentage: (embeddingGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('attention.layers', language), value: attentionLayerGB, percentage: (attentionLayerGB / total) * 100, color: '#1E40AF' },
      { label: getLabel('ffn.layers', language), value: ffnLayerGB, percentage: (ffnLayerGB / total) * 100, color: '#1E3A8A' },
      { label: getLabel('optimizer.states', language), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('gradients', language), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#10B981' },
      { label: getLabel('activations', language), value: activationsGB, percentage: (activationsGB / total) * 100, color: '#EF4444' },
      { label: getLabel('attention.scores', language), value: attentionScoresGB, percentage: (attentionScoresGB / total) * 100, color: '#DC2626' },
      { label: getLabel('kv.cache', language), value: kvCacheGB, percentage: (kvCacheGB / total) * 100, color: '#8B5CF6' },
      { label: getLabel('lora.params', language), value: loraGB, percentage: (loraGB / total) * 100, color: '#EC4899' },
      { label: getLabel('position.encoding', language), value: positionEncodingGB, percentage: (positionEncodingGB / total) * 100, color: '#7C3AED' },
      { label: getLabel('other.overheads', language), value: reservedGB, percentage: (reservedGB / total) * 100, color: '#6B7280' },
    ],
    advancedMetadata: {
      modelType: 'NLP',
      optimizationSuggestions: generateNLPOptimizationSuggestions(config, total, language),
      memoryEfficiency: calculateMemoryEfficiency(total, modelSize),
      computeEfficiency: calculateComputeEfficiency(config),
      hardwareRecommendations: generateHardwareRecommendations(total, 'NLP')
    }
  };
}

/**
 * 计算高级LoRA参数量
 */
function calculateAdvancedLoRAParams(
  modelSize: number,
  loraRank: number,
  targetModules: string[],
  hiddenSize: number
): number {
  // 估算每个目标模块的参数量
  const moduleParamRatio = {
    'q_proj': 0.25, 'k_proj': 0.25, 'v_proj': 0.25, 'o_proj': 0.25,
    'gate_proj': 0.33, 'up_proj': 0.33, 'down_proj': 0.33
  };

  let totalLoraParams = 0;
  const modules = targetModules || ['q_proj', 'v_proj']; // 默认目标模块
  modules.forEach(module => {
    const ratio = moduleParamRatio[module as keyof typeof moduleParamRatio] || 0.25;
    const moduleParams = modelSize * ratio;
    // LoRA参数 = 2 × rank × (input_dim + output_dim) / 2
    totalLoraParams += 2 * loraRank * hiddenSize * ratio;
  });

  return totalLoraParams / 1e9; // 转换为B
}

/**
 * 多模态模型微调显存计算 - 基于完整超参数与显存计算公式文档
 * 总显存 = 视觉编码器显存 + 文本编码器显存 + 融合层显存 +
 *         图像特征显存 + 文本特征显存 + 跨模态注意力显存 +
 *         图像预处理显存 + 模态对齐显存 + 对比学习显存 +
 *         LoRA显存 + 优化器显存 + 梯度显存 + 2GB预留
 */
export function calculateMultimodalFineTuningMemory(config: MultimodalFineTuningConfig, language: string = 'zh'): AdvancedMemoryBreakdown {
  const {
    modelSize, precision, batchSize, sequenceLength,
    imageResolution, patchSize, visionFeatureDim, textEncoderType,
    visionEncoderType, modalFusionStrategy, crossModalAlignmentWeight,
    gradientAccumulationSteps, optimizer
  } = config;
  const numAttentionHeads = (config as any).numAttentionHeads ?? 12;

  const modelPrecisionBytes = getPrecisionBytes(precision);

  // 计算图像序列长度
  const imageChannels = 3; // RGB
  const S_vision = (imageResolution * imageResolution) / (patchSize * patchSize);
  const D_vision = visionFeatureDim;
  const D_text = 768; // 标准文本特征维度
  const D_fusion = Math.max(D_vision, D_text);
  const L_vision = 12; // 视觉编码器层数
  const L_text = 12; // 文本编码器层数

  // 1. 视觉编码器显存 = P_vision × B
  // P_vision = 图像块嵌入参数 + Transformer参数
  const patchEmbeddingParams = patchSize * patchSize * imageChannels * D_vision;
  const visionTransformerParams = L_vision * D_vision * D_vision * 4;
  const calculatedVisionParams = patchEmbeddingParams + visionTransformerParams;

  // 使用modelSize作为参数量基准
  const modelSizeParams = modelSize * 1e9; // 将B转换为参数数量
  const visionEncoderParams = Math.max(calculatedVisionParams, modelSizeParams * 0.3); // 视觉编码器约占30%
  const visionEncoderGB = (visionEncoderParams * modelPrecisionBytes) / (1024 ** 3);

  // 2. 文本编码器显存 = P_text × B
  const vocabSize = 50000; // 标准词汇表大小
  const textEmbeddingParams = vocabSize * D_text;
  const textTransformerParams = L_text * D_text * D_text * 4;
  const calculatedTextParams = textEmbeddingParams + textTransformerParams;
  const textEncoderParams = Math.max(calculatedTextParams, modelSizeParams * 0.5); // 文本编码器约占50%
  const textEncoderGB = (textEncoderParams * modelPrecisionBytes) / (1024 ** 3);

  // 3. 融合层显存 = P_fusion × B
  const crossAttentionParams = D_vision * D_fusion * 4 + D_text * D_fusion * 4;
  const fusionFFNParams = D_fusion * D_fusion * 4;
  const fusionLayerParams = crossAttentionParams + fusionFFNParams;
  const fusionLayerGB = (fusionLayerParams * modelPrecisionBytes) / (1024 ** 3);

  // 4. 图像特征显存 = B × (H×W/P²) × D × B_precision
  const numPatches = Math.pow(imageResolution / patchSize, 2);
  const imageFeatureGB = (batchSize * numPatches * visionFeatureDim * modelPrecisionBytes) / (1024 ** 3);

  // 5. 文本特征显存 = batch_size × S_text × D_text × B
  const textFeatureGB = (batchSize * sequenceLength * D_text * modelPrecisionBytes) / (1024 ** 3);

  // 6. 跨模态注意力显存 = batch_size × num_heads × S_text × S_vision × B
  const crossModalAttentionGB = (batchSize * numAttentionHeads * sequenceLength * numPatches * modelPrecisionBytes) / (1024 ** 3);

  // 7. 图像预处理显存 = batch_size × H_img × W_img × C_img × B × 2
  const imagePreprocessingGB = (batchSize * imageResolution * imageResolution * imageChannels * modelPrecisionBytes * 2) / (1024 ** 3);

  // 8. 模态对齐显存 = batch_size × max(D_vision, D_text) × B
  const modalAlignmentGB = (batchSize * Math.max(D_vision, D_text) * modelPrecisionBytes) / (1024 ** 3);

  // 9. 对比学习显存 = batch_size × batch_size × B
  const contrastiveLearningGB = (batchSize * batchSize * modelPrecisionBytes) / (1024 ** 3);

  // 10. LoRA显存（多模态）
  const loraParams = 1000000; // 简化计算，实际应根据具体LoRA配置
  const loraGB = (loraParams * modelPrecisionBytes) / (1024 ** 3);

  // 11. 优化器显存
  const totalParams = visionEncoderParams + textEncoderParams + fusionLayerParams;
  const optimizerMultiplier = getOptimizerMultiplier(optimizer || 'AdamW', precision);
  const optimizerGB = (totalParams * getPrecisionBytes('FP32') * optimizerMultiplier) / (1024 ** 3);

  // 12. 梯度显存
  const gradientsGB = (totalParams * modelPrecisionBytes) / (1024 ** 3);

  // 13. 预留显存
  const reservedGB = 2.0;

  const total = visionEncoderGB + textEncoderGB + fusionLayerGB + imageFeatureGB + textFeatureGB +
                crossModalAttentionGB + imagePreprocessingGB + modalAlignmentGB + contrastiveLearningGB +
                loraGB + optimizerGB + gradientsGB + reservedGB;

  return {
    modelParams: visionEncoderGB + textEncoderGB + fusionLayerGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: imageFeatureGB + textFeatureGB + crossModalAttentionGB + imagePreprocessingGB,
    kvCache: 0,
    visionEncoder: visionEncoderGB,
    textEncoder: textEncoderGB,
    fusionLayer: fusionLayerGB,
    total,
    breakdown: [
      { label: getLabel('vision.encoder', language), value: visionEncoderGB, percentage: (visionEncoderGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('text.encoder', language), value: textEncoderGB, percentage: (textEncoderGB / total) * 100, color: '#10B981' },
      { label: getLabel('fusion.layer', language), value: fusionLayerGB, percentage: (fusionLayerGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('image.features', language), value: imageFeatureGB, percentage: (imageFeatureGB / total) * 100, color: '#EF4444' },
      { label: getLabel('text.tokens', language), value: textFeatureGB, percentage: (textFeatureGB / total) * 100, color: '#DC2626' },
      { label: getLabel('cross.modal.attention', language), value: crossModalAttentionGB, percentage: (crossModalAttentionGB / total) * 100, color: '#8B5CF6' },
      { label: getLabel('data.augmentation', language), value: imagePreprocessingGB, percentage: (imagePreprocessingGB / total) * 100, color: '#7C3AED' },
      { label: 'Modal Alignment', value: modalAlignmentGB, percentage: (modalAlignmentGB / total) * 100, color: '#EC4899' },
      { label: 'Contrastive Learning', value: contrastiveLearningGB, percentage: (contrastiveLearningGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('lora.params', language), value: loraGB, percentage: (loraGB / total) * 100, color: '#D97706' },
      { label: getLabel('optimizer.states', language), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#059669' },
      { label: getLabel('gradients', language), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#F97316' },
      { label: getLabel('other.overheads', language), value: reservedGB, percentage: (reservedGB / total) * 100, color: '#6B7280' },
    ],
    advancedMetadata: {
      modelType: 'Multimodal',
      optimizationSuggestions: generateMultimodalOptimizationSuggestions(config, total, language),
      memoryEfficiency: calculateMemoryEfficiency(total, modelSize),
      computeEfficiency: calculateComputeEfficiency(config),
      hardwareRecommendations: generateHardwareRecommendations(total, 'Multimodal')
    }
  };
}

/**
 * MoE模型微调显存计算 - 基于精确数学公式
 */
export function calculateMoEFineTuningMemory(config: MoEFineTuningConfig, language: string = 'zh'): AdvancedMemoryBreakdown {
  const {
    modelSize, precision, batchSize, sequenceLength,
    numExperts, numActiveExperts, expertCapacityFactor
  } = config;

  const modelPrecisionBytes = getPrecisionBytes(precision);
  const hiddenSize = 4096; // 假设隐藏层维度

  // 1. 路由器显存 = H × E × B_precision
  const routerGB = (hiddenSize * numExperts * modelPrecisionBytes) / (1024 ** 3);

  // 2. 激活专家显存 = K × P_expert × B_precision
  const expertParams = modelSize / numExperts; // 每个专家的参数量
  const activeExpertGB = (numActiveExperts * expertParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);

  // 3. 路由概率显存 = B × S × E × B_precision
  const routingProbGB = (batchSize * sequenceLength * numExperts * modelPrecisionBytes) / (1024 ** 3);

  // 4. 专家分配显存 = B × S × K × B_precision
  const expertAssignmentGB = (batchSize * sequenceLength * numActiveExperts * modelPrecisionBytes) / (1024 ** 3);

  // 5. 负载均衡显存 = E × B_precision
  const loadBalanceGB = (numExperts * modelPrecisionBytes) / (1024 ** 3);

  // 6. 优化器和梯度显存（只针对激活的专家）
  const trainableParams = numActiveExperts * expertParams; // 只训练激活的专家
  const optimizerGB = (trainableParams * 1e9 * getPrecisionBytes('FP32') * 2) / (1024 ** 3);
  const gradientsGB = (trainableParams * 1e9 * modelPrecisionBytes) / (1024 ** 3);

  // 7. 预留显存
  const reservedGB = 2.0;

  const total = routerGB + activeExpertGB + routingProbGB + expertAssignmentGB +
                loadBalanceGB + optimizerGB + gradientsGB + reservedGB;

  return {
    modelParams: activeExpertGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: routingProbGB + expertAssignmentGB,
    kvCache: 0,
    expertRouting: routerGB,
    expertActivation: activeExpertGB,
    total,
    breakdown: [
      { label: getLabel('router', language), value: routerGB, percentage: (routerGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('active.experts', language), value: activeExpertGB, percentage: (activeExpertGB / total) * 100, color: '#10B981' },
      { label: getLabel('routing.probability', language), value: routingProbGB, percentage: (routingProbGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('expert.assignment', language), value: expertAssignmentGB, percentage: (expertAssignmentGB / total) * 100, color: '#EF4444' },
      { label: getLabel('load.balance', language), value: loadBalanceGB, percentage: (loadBalanceGB / total) * 100, color: '#8B5CF6' },
      { label: getLabel('optimizer.states', language), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#EC4899' },
      { label: getLabel('gradients', language), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#F97316' },
      { label: getLabel('other.overheads', language), value: reservedGB, percentage: (reservedGB / total) * 100, color: '#6B7280' },
    ],
    advancedMetadata: {
      modelType: 'MoE',
      optimizationSuggestions: generateMoEOptimizationSuggestions(config, total, language),
      memoryEfficiency: calculateMemoryEfficiency(total, modelSize),
      computeEfficiency: calculateComputeEfficiency(config),
      hardwareRecommendations: generateHardwareRecommendations(total, 'MoE')
    }
  };
}

/**
 * CNN模型微调显存计算 - 基于精确数学公式
 */
export function calculateCNNFineTuningMemory(config: CNNFineTuningConfig, language: string = 'zh'): AdvancedMemoryBreakdown {
  const {
    modelSize, precision, batchSize, inputImageSize, kernelSize
  } = config;

  const modelPrecisionBytes = getPrecisionBytes(precision);
  const imageChannels = 3; // RGB

  // 1. 卷积层显存 = (K×K×C_in×C_out + C_out) × B_precision
  // 简化计算：假设平均通道数
  const avgChannels = 256;
  const convLayersGB = (modelSize * 0.8 * 1e9 * modelPrecisionBytes) / (1024 ** 3); // 80%参数在卷积层

  // 2. 特征图显存 = B × Σ(H_i × W_i × C_i) × B_precision
  // 估算特征图总大小（考虑多层特征图）
  let totalFeatureMapSize = 0;
  let currentSize = inputImageSize;
  let currentChannels = imageChannels;

  // 模拟卷积网络的特征图尺寸变化
  for (let layer = 0; layer < 20; layer++) { // 假设20层
    totalFeatureMapSize += currentSize * currentSize * currentChannels;
    currentSize = Math.max(1, Math.floor(currentSize / 2)); // 每层尺寸减半
    currentChannels = Math.min(2048, currentChannels * 2); // 通道数翻倍，最大2048
  }

  const featureMapsGB = (batchSize * totalFeatureMapSize * modelPrecisionBytes) / (1024 ** 3);

  // 3. 全连接层显存 = (D_in × D_out + D_out) × B_precision
  const fcLayersGB = (modelSize * 0.2 * 1e9 * modelPrecisionBytes) / (1024 ** 3); // 20%参数在全连接层

  // 4. 批归一化显存 = 4 × C × B_precision
  const bnGB = (4 * avgChannels * 20 * modelPrecisionBytes) / (1024 ** 3); // 假设20个BN层

  // 5. 数据增强显存 = B × H × W × C × B_precision × 2
  const dataAugmentationGB = (batchSize * inputImageSize * inputImageSize * imageChannels * modelPrecisionBytes * 2) / (1024 ** 3);

  // 6. 优化器和梯度显存
  const optimizerGB = (modelSize * 1e9 * getPrecisionBytes('FP32') * 2) / (1024 ** 3); // AdamW
  const gradientsGB = (modelSize * 1e9 * modelPrecisionBytes) / (1024 ** 3);

  // 7. 预留显存
  const reservedGB = 1.0;

  const total = convLayersGB + featureMapsGB + fcLayersGB + bnGB +
                dataAugmentationGB + optimizerGB + gradientsGB + reservedGB;

  return {
    modelParams: convLayersGB + fcLayersGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: featureMapsGB,
    kvCache: 0,
    convolutionLayers: convLayersGB,
    featureMaps: featureMapsGB,
    dataAugmentation: dataAugmentationGB,
    total,
    breakdown: [
      { label: getLabel('conv.layers', language), value: convLayersGB, percentage: (convLayersGB / total) * 100, color: '#3B82F6' },
      { label: getLabel('feature.maps', language), value: featureMapsGB, percentage: (featureMapsGB / total) * 100, color: '#10B981' },
      { label: getLabel('fc.layers', language), value: fcLayersGB, percentage: (fcLayersGB / total) * 100, color: '#F59E0B' },
      { label: getLabel('batch.normalization', language), value: bnGB, percentage: (bnGB / total) * 100, color: '#EF4444' },
      { label: getLabel('data.augmentation', language), value: dataAugmentationGB, percentage: (dataAugmentationGB / total) * 100, color: '#8B5CF6' },
      { label: getLabel('optimizer.states', language), value: optimizerGB, percentage: (optimizerGB / total) * 100, color: '#EC4899' },
      { label: getLabel('gradients', language), value: gradientsGB, percentage: (gradientsGB / total) * 100, color: '#F97316' },
      { label: getLabel('other.overheads', language), value: reservedGB, percentage: (reservedGB / total) * 100, color: '#6B7280' },
    ],
    advancedMetadata: {
      modelType: 'CNN',
      optimizationSuggestions: generateCNNOptimizationSuggestions(config, total, language),
      memoryEfficiency: calculateMemoryEfficiency(total, modelSize),
      computeEfficiency: calculateComputeEfficiency(config),
      hardwareRecommendations: generateHardwareRecommendations(total, 'CNN')
    }
  };
}

/**
 * 统一的高级微调显存计算入口函数
 */
export function calculateAdvancedFineTuningMemory(config: AdvancedFineTuningConfig, language: string = 'zh'): AdvancedMemoryBreakdown {
  switch (config.modelType) {
    case 'NLP':
      if (!config.nlpConfig) throw new Error('NLP配置不能为空');
      return calculateNLPFineTuningMemory(config.nlpConfig, language);
    case 'Multimodal':
      if (!config.multimodalConfig) throw new Error('多模态配置不能为空');
      return calculateMultimodalFineTuningMemory(config.multimodalConfig, language);
    case 'MoE':
      if (!config.moeConfig) throw new Error('MoE配置不能为空');
      return calculateMoEFineTuningMemory(config.moeConfig, language);
    case 'CNN':
      if (!config.cnnConfig) throw new Error('CNN配置不能为空');
      return calculateCNNFineTuningMemory(config.cnnConfig, language);
    default:
      throw new Error(`不支持的模型类型: ${config.modelType}`);
  }
}

// ===== 辅助函数 =====

/**
 * 计算内存效率
 */
function calculateMemoryEfficiency(totalMemoryGB: number, modelSizeB: number): number {
  // 内存效率 = 模型大小 / 总显存占用
  const modelMemoryGB = modelSizeB * 2; // 假设FP16
  return (modelMemoryGB / totalMemoryGB) * 100;
}

/**
 * 计算计算效率
 */
function calculateComputeEfficiency(config: any): number {
  // 简化的计算效率评估
  const batchSize = config.batchSize || 1;
  const sequenceLength = config.sequenceLength || 2048;

  // 基于批次大小和序列长度的效率评估
  const efficiency = Math.min(100, (batchSize * sequenceLength) / 8192 * 100);
  return efficiency;
}

/**
 * 生成NLP优化建议
 */
function generateNLPOptimizationSuggestions(config: NLPFineTuningConfig, totalMemoryGB: number, language: string = 'zh'): string[] {
  const suggestions: string[] = [];

  if (totalMemoryGB > 40) {
    suggestions.push(getLabel('suggestion.use.qlora.quantization', language));
  }

  if (config.batchSize > 8) {
    suggestions.push(getLabel('suggestion.reduce.batch.size', language));
  }

  if (config.sequenceLength > 4096) {
    suggestions.push(getLabel('suggestion.reduce.sequence.length', language));
  }

  if (config.loraRank > 64) {
    suggestions.push(getLabel('suggestion.reduce.lora.rank', language));
  }

  return suggestions;
}

/**
 * 生成多模态优化建议
 */
function generateMultimodalOptimizationSuggestions(config: MultimodalFineTuningConfig, totalMemoryGB: number, language: string = 'zh'): string[] {
  const suggestions: string[] = [];

  if (config.imageResolution > 512) {
    suggestions.push(getLabel('suggestion.reduce.image.resolution', language));
  }

  if (config.batchSize > 16) {
    suggestions.push(getLabel('suggestion.use.smaller.batch.multimodal', language));
  }

  if (config.freezeVisionEncoder === false && config.freezeTextEncoder === false) {
    suggestions.push(getLabel('suggestion.freeze.encoders', language));
  }

  return suggestions;
}

/**
 * 生成MoE优化建议
 */
function generateMoEOptimizationSuggestions(config: MoEFineTuningConfig, totalMemoryGB: number, language: string = 'zh'): string[] {
  const suggestions: string[] = [];

  if (config.numActiveExperts > 4) {
    suggestions.push(getLabel('suggestion.reduce.experts', language));
  }

  if (config.expertCapacityFactor > 1.5) {
    suggestions.push(getLabel('suggestion.reduce.expert.capacity', language));
  }

  if (config.loraApplicationStrategy === 'All Experts') {
    suggestions.push(getLabel('suggestion.partial.lora.experts', language));
  }

  return suggestions;
}

/**
 * 生成CNN优化建议
 */
function generateCNNOptimizationSuggestions(config: CNNFineTuningConfig, totalMemoryGB: number, language: string = 'zh'): string[] {
  const suggestions: string[] = [];

  if (config.inputImageSize > 384) {
    suggestions.push(getLabel('suggestion.reduce.input.image.size', language));
  }

  if (config.batchSize > 128) {
    suggestions.push(getLabel('suggestion.increase.batch.size.cnn', language));
  }

  if (config.frozenLayers < 10) {
    suggestions.push(getLabel('suggestion.freeze.more.layers', language));
  }

  return suggestions;
}

/**
 * 生成硬件推荐
 */
function generateHardwareRecommendations(totalMemoryGB: number, modelType: AdvancedModelType): string[] {
  const recommendations: string[] = [];

  if (totalMemoryGB <= 8) {
    recommendations.push('RTX 4060 Ti (16GB)');
    recommendations.push('RTX 4070 (12GB)');
  } else if (totalMemoryGB <= 16) {
    recommendations.push('RTX 4070 Ti (16GB)');
    recommendations.push('RTX 4080 (16GB)');
  } else if (totalMemoryGB <= 24) {
    recommendations.push('RTX 4090 (24GB)');
    recommendations.push('RTX 6000 Ada (48GB)');
  } else if (totalMemoryGB <= 48) {
    recommendations.push('A100 PCIe (40GB)');
    recommendations.push('H100 PCIe (80GB)');
  } else {
    recommendations.push('H100 SXM (80GB)');
    recommendations.push('多GPU并行训练');
  }

  // 根据模型类型添加特定建议
  if (modelType === 'Multimodal') {
    recommendations.push('建议使用高带宽显存的GPU');
  } else if (modelType === 'MoE') {
    recommendations.push('建议使用多GPU分布式训练');
  }

  return recommendations;
}