import {
  AdvancedModelType,
  NLPFineTuningConfig,
  MultimodalFineTuningConfig,
  MoEFineTuningConfig,
  CNNFineTuningConfig,
  AdvancedFineTuningConfig
} from '@/types';

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// 参数范围定义
export const PARAMETER_RANGES = {
  NLP: {
    modelSize: { min: 0.125, max: 175, optimal: [1, 70] },
    batchSize: { min: 1, max: 64, optimal: [2, 16] },
    sequenceLength: { min: 512, max: 32768, optimal: [1024, 4096] },
    learningRate: { min: 1e-6, max: 1e-4, optimal: [1e-5, 5e-5] },
    loraRank: { min: 4, max: 256, optimal: [8, 64] },
    loraAlpha: { min: 16, max: 128, optimal: [16, 64] },
    hiddenSize: { min: 768, max: 12288, optimal: [2048, 8192] },
    numLayers: { min: 12, max: 96, optimal: [24, 48] },
    numAttentionHeads: { min: 8, max: 128, optimal: [16, 64] },
    vocabSize: { min: 30000, max: 100000, optimal: [32000, 65000] }
  },
  Multimodal: {
    modelSize: { min: 1, max: 100, optimal: [3, 30] },
    batchSize: { min: 4, max: 32, optimal: [8, 16] },
    sequenceLength: { min: 256, max: 2048, optimal: [512, 1024] },
    learningRate: { min: 1e-5, max: 1e-4, optimal: [2e-5, 8e-5] },
    imageResolution: { min: 224, max: 1024, optimal: [336, 512] },
    patchSize: { min: 14, max: 32, optimal: [14, 16] },
    visionFeatureDim: { min: 768, max: 1024, optimal: [768, 1024] }
  },
  MoE: {
    modelSize: { min: 1, max: 1600, optimal: [8, 100] },
    batchSize: { min: 8, max: 64, optimal: [16, 32] },
    sequenceLength: { min: 512, max: 8192, optimal: [1024, 4096] },
    learningRate: { min: 1e-5, max: 5e-5, optimal: [2e-5, 4e-5] },
    numExperts: { min: 8, max: 2048, optimal: [8, 64] },
    numActiveExperts: { min: 1, max: 8, optimal: [2, 4] },
    expertCapacityFactor: { min: 1.0, max: 2.0, optimal: [1.0, 1.5] }
  },
  CNN: {
    modelSize: { min: 0.005, max: 0.5, optimal: [0.01, 0.1] },
    batchSize: { min: 32, max: 512, optimal: [64, 256] },
    learningRate: { min: 1e-4, max: 1e-2, optimal: [1e-3, 5e-3] },
    inputImageSize: { min: 224, max: 512, optimal: [224, 384] },
    trainingEpochs: { min: 50, max: 300, optimal: [100, 200] },
    dropoutRate: { min: 0.1, max: 0.5, optimal: [0.2, 0.3] },
    weightDecay: { min: 1e-4, max: 1e-2, optimal: [1e-4, 1e-3] }
  }
};

/**
 * 验证NLP模型配置
 */
export function validateNLPConfig(config: NLPFineTuningConfig): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const ranges = PARAMETER_RANGES.NLP;

  // 模型大小验证
  if (config.modelSize < ranges.modelSize.min || config.modelSize > ranges.modelSize.max) {
    result.errors.push(`模型大小应在 ${ranges.modelSize.min}B - ${ranges.modelSize.max}B 之间`);
    result.isValid = false;
  } else if (config.modelSize < ranges.modelSize.optimal[0] || config.modelSize > ranges.modelSize.optimal[1]) {
    result.warnings.push(`建议模型大小在 ${ranges.modelSize.optimal[0]}B - ${ranges.modelSize.optimal[1]}B 之间以获得最佳性能`);
  }

  // 批次大小验证
  if (config.batchSize < ranges.batchSize.min || config.batchSize > ranges.batchSize.max) {
    result.errors.push(`批次大小应在 ${ranges.batchSize.min} - ${ranges.batchSize.max} 之间`);
    result.isValid = false;
  }

  // 序列长度验证
  if (config.sequenceLength < ranges.sequenceLength.min || config.sequenceLength > ranges.sequenceLength.max) {
    result.errors.push(`序列长度应在 ${ranges.sequenceLength.min} - ${ranges.sequenceLength.max} 之间`);
    result.isValid = false;
  }

  // 学习率验证
  if (config.learningRate < ranges.learningRate.min || config.learningRate > ranges.learningRate.max) {
    result.errors.push(`学习率应在 ${ranges.learningRate.min} - ${ranges.learningRate.max} 之间`);
    result.isValid = false;
  }

  // LoRA参数验证
  if (config.loraRank < ranges.loraRank.min || config.loraRank > ranges.loraRank.max) {
    result.warnings.push(`LoRA rank建议在 ${ranges.loraRank.min} - ${ranges.loraRank.max} 之间`);
  }

  // 架构一致性检查
  if (config.hiddenSize % config.numAttentionHeads !== 0) {
    result.errors.push('隐藏层维度必须能被注意力头数整除');
    result.isValid = false;
  }

  // 性能优化建议
  if (config.batchSize > 16 && config.sequenceLength > 4096) {
    result.suggestions.push('大批次大小和长序列可能导致显存不足，建议使用梯度累积');
  }

  if (config.loraRank > 64) {
    result.suggestions.push('较大的LoRA rank会增加参数量，考虑降低以提高效率');
  }

  if (config.optimizer === 'SGD' && config.learningRate < 1e-4) {
    result.suggestions.push('SGD优化器通常需要更高的学习率，建议使用AdamW');
  }

  return result;
}

/**
 * 验证多模态模型配置
 */
export function validateMultimodalConfig(config: MultimodalFineTuningConfig): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const ranges = PARAMETER_RANGES.Multimodal;

  // 图像分辨率验证
  if (config.imageResolution < ranges.imageResolution.min || config.imageResolution > ranges.imageResolution.max) {
    result.errors.push(`图像分辨率应在 ${ranges.imageResolution.min} - ${ranges.imageResolution.max} 之间`);
    result.isValid = false;
  }

  // Patch大小验证
  if (config.imageResolution % config.patchSize !== 0) {
    result.errors.push('图像分辨率必须能被patch大小整除');
    result.isValid = false;
  }

  // 批次大小验证（多模态通常需要较小的批次）
  if (config.batchSize > 16) {
    result.warnings.push('多模态训练建议使用较小的批次大小以避免显存不足');
  }

  // 序列长度建议
  if (config.sequenceLength > 1024) {
    result.suggestions.push('多模态模型的文本序列长度通常较短，考虑减少以提高效率');
  }

  // 编码器冻结建议
  if (!config.freezeVisionEncoder && !config.freezeTextEncoder) {
    result.suggestions.push('考虑冻结部分编码器以减少训练参数和显存占用');
  }

  return result;
}

/**
 * 验证MoE模型配置
 */
export function validateMoEConfig(config: MoEFineTuningConfig): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const ranges = PARAMETER_RANGES.MoE;

  // 专家数量验证
  if (config.numActiveExperts > config.numExperts) {
    result.errors.push('激活专家数量不能超过总专家数量');
    result.isValid = false;
  }

  // 专家容量因子验证
  if (config.expertCapacityFactor < ranges.expertCapacityFactor.min || 
      config.expertCapacityFactor > ranges.expertCapacityFactor.max) {
    result.warnings.push(`专家容量因子建议在 ${ranges.expertCapacityFactor.min} - ${ranges.expertCapacityFactor.max} 之间`);
  }

  // 负载均衡建议
  if (config.loadBalanceLossWeight < 0.01) {
    result.suggestions.push('增加负载均衡损失权重以改善专家利用率');
  }

  // 路由策略建议
  if (config.routingStrategy === 'Top-K' && config.numActiveExperts > 4) {
    result.suggestions.push('Top-K路由策略建议使用较少的激活专家数量');
  }

  return result;
}

/**
 * 验证CNN模型配置
 */
export function validateCNNConfig(config: CNNFineTuningConfig): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const ranges = PARAMETER_RANGES.CNN;

  // 学习率验证（CNN通常需要更高的学习率）
  if (config.learningRate < ranges.learningRate.min || config.learningRate > ranges.learningRate.max) {
    result.errors.push(`CNN学习率应在 ${ranges.learningRate.min} - ${ranges.learningRate.max} 之间`);
    result.isValid = false;
  }

  // 批次大小建议
  if (config.batchSize < 32) {
    result.warnings.push('CNN训练建议使用较大的批次大小以提高训练稳定性');
  }

  // 数据增强建议
  if (config.dataAugmentationStrategy.length === 0) {
    result.suggestions.push('建议使用数据增强技术提高模型泛化能力');
  }

  // 优化器建议
  if (config.optimizer === 'Adam' || config.optimizer === 'AdamW') {
    result.suggestions.push('CNN训练通常使用SGD优化器效果更好');
  }

  return result;
}

/**
 * 统一的高级微调配置验证
 */
export function validateAdvancedFineTuningConfig(config: AdvancedFineTuningConfig): ValidationResult {
  switch (config.modelType) {
    case 'NLP':
      return config.nlpConfig ? validateNLPConfig(config.nlpConfig) : {
        isValid: false,
        errors: ['NLP配置不能为空'],
        warnings: [],
        suggestions: []
      };
    case 'Multimodal':
      return config.multimodalConfig ? validateMultimodalConfig(config.multimodalConfig) : {
        isValid: false,
        errors: ['多模态配置不能为空'],
        warnings: [],
        suggestions: []
      };
    case 'MoE':
      return config.moeConfig ? validateMoEConfig(config.moeConfig) : {
        isValid: false,
        errors: ['MoE配置不能为空'],
        warnings: [],
        suggestions: []
      };
    case 'CNN':
      return config.cnnConfig ? validateCNNConfig(config.cnnConfig) : {
        isValid: false,
        errors: ['CNN配置不能为空'],
        warnings: [],
        suggestions: []
      };
    default:
      return {
        isValid: false,
        errors: [`不支持的模型类型: ${config.modelType}`],
        warnings: [],
        suggestions: []
      };
  }
}
