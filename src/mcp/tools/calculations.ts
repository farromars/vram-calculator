/**
 * 显存计算工具实现
 * 提供各种显存计算功能
 */

import {
  calculateInferenceMemory,
  calculateTrainingMemory,
  calculateFineTuningMemory,
  calculateGRPOMemory,
  calculateMultimodalMemory,
  calculateAdvancedFineTuningMemory
} from '@/utils/memory-formulas';
import { MODELS_DATABASE, GPU_DATABASE } from '@/lib/models-data';
import {
  InferenceParamsSchema,
  TrainingParamsSchema,
  FineTuningParamsSchema,
  GRPOParamsSchema,
  MultimodalParamsSchema,
  AdvancedFineTuningParamsSchema,
  type VRAMCalculationResult,
  type AdvancedFineTuningParams
} from '../types';
import { mcpLogger, MCPError, MCP_ERROR_CODES, withErrorHandling } from '../logger';
import { addCalculationHistory } from '../resources/history';

/**
 * 创建标准化的计算结果
 */
function createCalculationResult(
  result: any,
  mode: string,
  modelName: string
): VRAMCalculationResult {
  return {
    totalVRAM: result.total,
    breakdown: {
      modelWeights: result.breakdown.find((b: any) => b.label.includes('模型'))?.value || 0,
      optimizer: result.breakdown.find((b: any) => b.label.includes('优化器'))?.value || 0,
      gradients: result.breakdown.find((b: any) => b.label.includes('梯度'))?.value || 0,
      activations: result.breakdown.find((b: any) => b.label.includes('激活'))?.value || 0,
      kvCache: result.breakdown.find((b: any) => b.label.includes('KV'))?.value || 0,
      other: result.breakdown.find((b: any) => b.label.includes('其他'))?.value || 0
    },
    recommendations: {
      gpus: GPU_DATABASE
        .filter(gpu => gpu.memory >= result.total)
        .slice(0, 3)
        .map(gpu => ({
          name: gpu.name,
          vram: gpu.memory,
          utilization: (result.total / gpu.memory) * 100,
          price: gpu.price
        })),
      optimizations: getOptimizationSuggestions(mode, result.total)
    }
  };
}

/**
 * 获取优化建议
 */
function getOptimizationSuggestions(mode: string, totalVRAM: number): string[] {
  const suggestions: string[] = [];
  
  switch (mode) {
    case 'inference':
      suggestions.push("考虑使用量化技术减少显存占用");
      suggestions.push("调整批次大小以适应可用显存");
      suggestions.push("使用KV缓存优化长序列推理");
      break;
    case 'training':
      suggestions.push("启用梯度检查点可减少70%激活值显存");
      suggestions.push("使用混合精度训练");
      suggestions.push("考虑梯度累积减少批次大小");
      break;
    case 'finetuning':
      suggestions.push("使用LoRA等PEFT方法大幅减少显存占用");
      suggestions.push("QLoRA可进一步减少基础模型显存占用");
      suggestions.push("调整LoRA rank以平衡性能和显存");
      break;
    case 'grpo':
      suggestions.push("使用PEFT方法减少可训练参数");
      suggestions.push("基础模型量化减少权重显存");
      suggestions.push("调整偏好组大小平衡性能和显存");
      break;
    case 'multimodal':
      suggestions.push("降低图像分辨率减少patch数量");
      suggestions.push("减少视频帧数控制序列长度");
      suggestions.push("使用更大的patch_size");
      break;
  }
  
  if (totalVRAM > 24) {
    suggestions.push("考虑使用多GPU分布式计算");
  }
  
  return suggestions;
}

/**
 * 注册显存计算工具
 */
export function registerCalculationTools(server: any) {
  // GRPO显存计算工具
  server.registerTool(
    "calculate_grpo_vram",
    {
      title: "GRPO显存计算",
      description: "计算Group-wise Ranking Preference Optimization的显存需求",
      inputSchema: GRPOParamsSchema
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始GRPO显存计算", { modelId: params.modelId, numGenerations: params.numGenerations });
      
      const model = MODELS_DATABASE.find(m => m.id === params.modelId);
      if (!model) {
        throw new MCPError(`模型 ${params.modelId} 未找到`, MCP_ERROR_CODES.MODEL_NOT_FOUND);
      }

      const config = {
        precision: params.precision,
        batchSize: params.batchSize,
        numGenerations: params.numGenerations,
        sequenceLength: params.sequenceLength,
        use8BitOptimizer: true,
        gradientCheckpointing: true
      };

      const result = calculateGRPOMemory(config, {
        params: model.params,
        hiddenSize: model.hiddenSize,
        numLayers: model.numLayers,
        numHeads: model.numHeads
      });

      const calculationResult = createCalculationResult(result, 'grpo', model.name);

      // 添加到历史记录
      addCalculationHistory(
        'grpo',
        params.modelId,
        model.name,
        params,
        {
          totalVRAM: result.total,
          breakdown: calculationResult.breakdown
        },
        calculationResult.recommendations
      );

      mcpLogger.info("GRPO显存计算完成", { 
        modelId: params.modelId, 
        totalVRAM: result.total,
        numGenerations: params.numGenerations 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(calculationResult, null, 2)
        }]
      };
    }, "GRPO显存计算")
  );

  // 多模态显存计算工具
  server.registerTool(
    "calculate_multimodal_vram",
    {
      title: "多模态显存计算",
      description: "计算多模态模型的显存需求",
      inputSchema: MultimodalParamsSchema
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始多模态显存计算", { 
        modelId: params.modelId, 
        mode: params.mode,
        imageCount: params.imageCount,
        audioSeconds: params.audioSeconds,
        videoFrames: params.videoFrames
      });
      
      const model = MODELS_DATABASE.find(m => m.id === params.modelId);
      if (!model) {
        throw new MCPError(`模型 ${params.modelId} 未找到`, MCP_ERROR_CODES.MODEL_NOT_FOUND);
      }

      // 计算总序列长度
      const textSeqLength = params.textTokens;
      const imageSeqLength = params.imageCount > 0 ? 
        Math.pow(params.imageResolution / 14, 2) * params.imageCount : 0; // 假设patch_size=14
      const audioSeqLength = params.audioSeconds > 0 ? 
        (params.audioSeconds * 1000) / 80 : 0; // 80ms per token
      const videoSeqLength = params.videoFrames > 0 ? 
        params.videoFrames * Math.pow(params.imageResolution / 14, 2) : 0;
      
      const totalSequenceLength = textSeqLength + imageSeqLength + audioSeqLength + videoSeqLength;

      const config = {
        batchSize: params.batchSize,
        sequenceLength: totalSequenceLength,
        textPrecision: params.precision,
        modalityType: ['text'],
        imageResolution: params.imageResolution,
        numImages: params.imageCount,
        patchSize: 14,
        mode: params.mode
      };

      // 添加模态类型
      if (params.imageCount > 0) config.modalityType.push('image');
      if (params.audioSeconds > 0) config.modalityType.push('audio');
      if (params.videoFrames > 0) config.modalityType.push('video');

      const result = calculateMultimodalMemory(config, {
        params: model.params,
        hiddenSize: model.hiddenSize,
        numLayers: model.numLayers
      });

      const calculationResult = createCalculationResult(result, 'multimodal', model.name);

      // 添加多模态特定信息
      calculationResult.breakdown.sequenceBreakdown = {
        text: textSeqLength,
        image: imageSeqLength,
        audio: audioSeqLength,
        video: videoSeqLength,
        total: totalSequenceLength
      };

      // 添加到历史记录
      addCalculationHistory(
        'multimodal',
        params.modelId,
        model.name,
        params,
        {
          totalVRAM: result.total,
          breakdown: calculationResult.breakdown
        },
        calculationResult.recommendations
      );

      mcpLogger.info("多模态显存计算完成", { 
        modelId: params.modelId, 
        totalVRAM: result.total,
        totalSequenceLength 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(calculationResult, null, 2)
        }]
      };
    }, "多模态显存计算")
  );

  // 高级微调显存计算工具
  server.setRequestHandler(
    { method: "tools/call", params: { name: "calculate_advanced_finetuning_vram" } },
    withErrorHandling(async (request) => {
      mcpLogger.info("收到高级微调请求参数", { arguments: request.params?.arguments });
      const params = validateParams(AdvancedFineTuningParamsSchema, request.params?.arguments);

      mcpLogger.info("开始高级微调显存计算", {
        modelType: params.modelType,
        modelSize: params.modelSize,
        architectureType: params.architectureType,
        language: params.language
      });

      // 构建高级微调配置
      const advancedConfig = {
        modelType: params.modelType.toUpperCase() as any,
        nlpConfig: params.modelType === 'nlp' ? {
          modelSize: params.modelSize,
          architectureType: params.architectureType as any,
          precision: params.precision.toUpperCase() as any,
          quantizationTech: 'None' as any,
          batchSize: params.batchSize,
          sequenceLength: params.sequenceLength || 2048,
          gradientAccumulationSteps: 4,
          learningRate: params.learningRate,
          optimizer: params.optimizer.toUpperCase() as any,
          trainingEpochs: params.trainingEpochs,
          vocabSize: params.vocabSize || 50000,
          numAttentionHeads: params.numAttentionHeads || 32,
          hiddenSize: params.hiddenSize || 4096,
          intermediateSize: (params.hiddenSize || 4096) * 4,
          numLayers: params.numLayers || 32,
          positionEncodingType: 'RoPE' as any,
          loraRank: params.loraRank || 16,
          loraAlpha: params.loraAlpha || 32,
          loraTargetModules: ['q_proj', 'v_proj'] as any,
          maxGenerationLength: 2048,
          temperature: 0.7,
          topP: 0.9,
          repetitionPenalty: 1.1,
          weightDecay: params.weightDecay || 0.01,
          warmupSteps: params.warmupSteps || 100,
          gradientClipping: params.gradientClipping || 1.0,
          dropoutRate: params.dropoutRate || 0.1
        } : undefined,
        multimodalConfig: params.modelType === 'multimodal' ? {
          modelSize: params.modelSize,
          architectureType: params.architectureType as any,
          precision: params.precision.toUpperCase() as any,
          quantizationSupport: true,
          batchSize: params.batchSize,
          sequenceLength: params.sequenceLength || 1024,
          gradientAccumulationSteps: 4,
          learningRate: params.learningRate,
          optimizer: params.optimizer.toUpperCase() as any,
          trainingEpochs: params.trainingEpochs,
          imageResolution: params.imageResolution || 336,
          patchSize: params.patchSize || 14,
          visionEncoderType: 'ViT' as any,
          textEncoderType: 'BERT' as any,
          modalFusionStrategy: 'Cross-attention' as any,
          visionFeatureDim: params.visionFeatureDim || 1024,
          crossModalAlignmentWeight: 0.5,
          imageTextContrastWeight: 0.3,
          freezeVisionEncoder: false,
          freezeTextEncoder: false,
          loraVisionEncoder: true,
          loraTextEncoder: true,
          loraFusionLayer: true,
          weightDecay: params.weightDecay || 0.01,
          warmupSteps: params.warmupSteps || 100,
          gradientClipping: params.gradientClipping || 1.0,
          mixedPrecisionTraining: true
        } : undefined,
        moeConfig: params.modelType === 'moe' ? {
          modelSize: params.modelSize,
          architectureType: params.architectureType as any,
          precision: params.precision.toUpperCase() as any,
          quantizationSupport: true,
          batchSize: params.batchSize,
          sequenceLength: params.sequenceLength || 2048,
          gradientAccumulationSteps: 2,
          learningRate: params.learningRate,
          optimizer: params.optimizer.toUpperCase() as any,
          trainingEpochs: params.trainingEpochs,
          numExperts: params.numExperts || 8,
          numActiveExperts: params.numActiveExperts || 2,
          expertCapacityFactor: params.expertCapacityFactor || 1.25,
          loadBalanceLossWeight: 0.01,
          expertDropoutRate: 0.1,
          routingStrategy: 'Top-K' as any,
          expertSpecialization: 0.8,
          auxiliaryLossWeight: 0.001,
          expertParallelism: 2,
          expertInitStrategy: 'Random' as any,
          loraApplicationStrategy: 'Partial Experts' as any,
          weightDecay: params.weightDecay || 0.01,
          warmupSteps: params.warmupSteps || 50,
          gradientClipping: params.gradientClipping || 1.0,
          expertRegularization: 0.01
        } : undefined,
        cnnConfig: params.modelType === 'cnn' ? {
          modelSize: params.modelSize,
          architectureType: params.architectureType as any,
          precision: params.precision.toUpperCase() as any,
          quantizationSupport: true,
          batchSize: params.batchSize,
          gradientAccumulationSteps: 1,
          learningRate: params.learningRate,
          optimizer: params.optimizer.toUpperCase() as any,
          trainingEpochs: params.trainingEpochs,
          inputImageSize: params.inputImageSize || 224,
          kernelSize: params.kernelSize || 3,
          poolingStrategy: 'MaxPool' as any,
          dataAugmentationStrategy: ['RandomCrop', 'RandomFlip'] as any,
          frozenLayers: 0,
          classificationHeadDim: 1000,
          dropoutRate: params.dropoutRate || 0.2,
          weightDecay: params.weightDecay || 1e-4,
          lrScheduler: 'StepLR' as any,
          freezeBatchNorm: false,
          mixedPrecisionTraining: true,
          warmupSteps: params.warmupSteps || 0,
          gradientClipping: params.gradientClipping || 1.0,
          labelSmoothing: 0.1
        } : undefined
      };

      const result = calculateAdvancedFineTuningMemory(advancedConfig, params.language || 'zh');

      const calculationResult = {
        totalVRAM: result.total,
        breakdown: {
          modelWeights: result.modelParams,
          optimizer: result.optimizer,
          gradients: result.gradients,
          activations: result.activations,
          kvCache: result.kvCache || 0,
          visionEncoder: result.visionEncoder || 0,
          textEncoder: result.textEncoder || 0,
          fusionLayer: result.fusionLayer || 0,
          expertRouting: result.expertRouting || 0,
          expertActivation: result.expertActivation || 0,
          convolutionLayers: result.convolutionLayers || 0,
          featureMaps: result.featureMaps || 0,
          dataAugmentation: result.dataAugmentation || 0,
          other: 0
        },
        recommendations: {
          gpus: generateGPURecommendations(result.total),
          optimizations: result.advancedMetadata?.optimizationSuggestions || []
        },
        metadata: result.advancedMetadata
      };

      // 添加到历史记录
      addCalculationHistory(
        'advanced_finetuning',
        `${params.modelType}_${params.architectureType}`,
        `${params.modelType.toUpperCase()} ${params.architectureType} (${params.modelSize}B)`,
        params,
        {
          totalVRAM: result.total,
          breakdown: calculationResult.breakdown
        },
        calculationResult.recommendations
      );

      mcpLogger.info("高级微调显存计算完成", {
        modelType: params.modelType,
        totalVRAM: result.total,
        memoryEfficiency: result.advancedMetadata?.memoryEfficiency
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(calculationResult, null, 2)
        }]
      };
    }, "高级微调显存计算")
  );

  mcpLogger.info("显存计算工具注册完成", {
    tools: ['calculate_grpo_vram', 'calculate_multimodal_vram', 'calculate_advanced_finetuning_vram']
  });
}

// 生成GPU推荐的辅助函数
function generateGPURecommendations(totalVRAM: number) {
  const gpus = [];

  if (totalVRAM <= 8) {
    gpus.push({ name: 'RTX 4060 Ti', vram: 16, utilization: (totalVRAM / 16) * 100 });
    gpus.push({ name: 'RTX 4070', vram: 12, utilization: (totalVRAM / 12) * 100 });
  } else if (totalVRAM <= 16) {
    gpus.push({ name: 'RTX 4070 Ti', vram: 16, utilization: (totalVRAM / 16) * 100 });
    gpus.push({ name: 'RTX 4080', vram: 16, utilization: (totalVRAM / 16) * 100 });
  } else if (totalVRAM <= 24) {
    gpus.push({ name: 'RTX 4090', vram: 24, utilization: (totalVRAM / 24) * 100 });
    gpus.push({ name: 'RTX 6000 Ada', vram: 48, utilization: (totalVRAM / 48) * 100 });
  } else if (totalVRAM <= 48) {
    gpus.push({ name: 'A100 PCIe', vram: 40, utilization: (totalVRAM / 40) * 100 });
    gpus.push({ name: 'H100 PCIe', vram: 80, utilization: (totalVRAM / 80) * 100 });
  } else {
    gpus.push({ name: 'H100 SXM', vram: 80, utilization: (totalVRAM / 80) * 100 });
    gpus.push({ name: '多GPU并行', vram: 160, utilization: (totalVRAM / 160) * 100 });
  }

  return gpus.filter(gpu => gpu.utilization <= 90);
}
