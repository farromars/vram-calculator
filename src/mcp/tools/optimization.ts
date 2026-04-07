/**
 * 配置优化建议工具
 */

import { MODELS_DATABASE, GPU_DATABASE } from '@/lib/models-data';
import { mcpLogger, MCPError, MCP_ERROR_CODES, withErrorHandling } from '../logger';
import { z } from 'zod';

/**
 * 配置优化参数
 */
const OptimizationParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  targetVRAM: z.number().min(1).describe('目标显存限制(GB)'),
  mode: z.enum(['inference', 'training', 'finetuning']).describe('计算模式'),
  currentConfig: z.object({
    batchSize: z.number(),
    sequenceLength: z.number(),
    precision: z.string()
  }).describe('当前配置'),
  constraints: z.object({
    minBatchSize: z.number().optional().describe('最小批次大小'),
    maxSequenceLength: z.number().optional().describe('最大序列长度'),
    allowQuantization: z.boolean().default(true).describe('是否允许量化'),
    allowPEFT: z.boolean().default(true).describe('是否允许PEFT方法')
  }).optional().describe('优化约束')
});

/**
 * 自动调优参数
 */
const AutoTuneParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  gpuMemory: z.number().min(1).describe('GPU显存大小(GB)'),
  mode: z.enum(['inference', 'training', 'finetuning']).describe('计算模式'),
  priority: z.enum(['throughput', 'latency', 'memory']).describe('优化优先级'),
  constraints: z.object({
    minBatchSize: z.number().default(1).describe('最小批次大小'),
    maxBatchSize: z.number().default(64).describe('最大批次大小'),
    minSequenceLength: z.number().default(512).describe('最小序列长度'),
    maxSequenceLength: z.number().default(4096).describe('最大序列长度')
  }).optional().describe('参数约束')
});

/**
 * 生成优化建议
 */
function generateOptimizationSuggestions(
  model: any,
  currentVRAM: number,
  targetVRAM: number,
  mode: string,
  currentConfig: any
) {
  const suggestions = [];
  const reductionNeeded = currentVRAM - targetVRAM;
  const reductionPercent = (reductionNeeded / currentVRAM) * 100;

  if (reductionNeeded <= 0) {
    return [{
      type: 'success',
      message: '当前配置已满足显存要求',
      impact: 0,
      newConfig: currentConfig
    }];
  }

  // 精度优化
  if (currentConfig.precision === 'fp32') {
    suggestions.push({
      type: 'precision',
      message: '使用FP16精度可减少约50%显存占用',
      impact: currentVRAM * 0.5,
      newConfig: { ...currentConfig, precision: 'fp16' },
      tradeoffs: ['可能轻微影响数值稳定性', '大多数现代GPU支持良好']
    });
  }

  // 批次大小优化
  if (currentConfig.batchSize > 1) {
    const newBatchSize = Math.max(1, Math.floor(currentConfig.batchSize * 0.5));
    const memoryReduction = currentVRAM * 0.3; // 估算
    suggestions.push({
      type: 'batch_size',
      message: `减少批次大小到 ${newBatchSize} 可减少约30%显存`,
      impact: memoryReduction,
      newConfig: { ...currentConfig, batchSize: newBatchSize },
      tradeoffs: ['训练速度可能降低', '需要更多迭代步数']
    });
  }

  // 序列长度优化
  if (currentConfig.sequenceLength > 512) {
    const newSeqLength = Math.max(512, Math.floor(currentConfig.sequenceLength * 0.75));
    const memoryReduction = currentVRAM * 0.25; // 估算
    suggestions.push({
      type: 'sequence_length',
      message: `减少序列长度到 ${newSeqLength} 可减少约25%显存`,
      impact: memoryReduction,
      newConfig: { ...currentConfig, sequenceLength: newSeqLength },
      tradeoffs: ['可能影响长文本处理能力', '需要文本截断或分段处理']
    });
  }

  // 量化建议
  if (mode === 'inference') {
    suggestions.push({
      type: 'quantization',
      message: 'INT8量化可减少75%模型权重显存',
      impact: currentVRAM * 0.6, // 模型权重通常占大部分
      newConfig: { ...currentConfig, quantization: 'int8' },
      tradeoffs: ['轻微精度损失', '推理速度可能提升']
    });

    suggestions.push({
      type: 'quantization',
      message: 'INT4量化可减少87.5%模型权重显存',
      impact: currentVRAM * 0.7,
      newConfig: { ...currentConfig, quantization: 'int4' },
      tradeoffs: ['较明显精度损失', '需要仔细评估模型性能']
    });
  }

  // PEFT方法建议
  if (mode === 'finetuning') {
    suggestions.push({
      type: 'peft',
      message: 'LoRA微调可减少90%+可训练参数显存',
      impact: currentVRAM * 0.7,
      newConfig: { ...currentConfig, method: 'lora', loraRank: 4 },
      tradeoffs: ['微调效果可能略有差异', '训练速度更快']
    });

    suggestions.push({
      type: 'peft',
      message: 'QLoRA结合量化可最大化显存节省',
      impact: currentVRAM * 0.8,
      newConfig: { ...currentConfig, method: 'qlora', quantization: 'int4' },
      tradeoffs: ['需要更仔细的超参数调优', '可能需要更多训练步数']
    });
  }

  // 梯度检查点
  if (mode === 'training' || mode === 'finetuning') {
    suggestions.push({
      type: 'gradient_checkpointing',
      message: '梯度检查点可减少70%激活值显存',
      impact: currentVRAM * 0.4,
      newConfig: { ...currentConfig, gradientCheckpointing: true },
      tradeoffs: ['训练速度降低约20%', '显存节省显著']
    });
  }

  // 按影响排序
  suggestions.sort((a, b) => b.impact - a.impact);

  return suggestions;
}

/**
 * 注册优化工具
 */
export function registerOptimizationTools(server: any) {
  // 配置优化建议工具
  server.registerTool(
    "optimize_config",
    {
      title: "配置优化建议",
      description: "基于显存限制提供配置优化建议",
      inputSchema: OptimizationParamsSchema
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始配置优化分析", { 
        modelId: params.modelId,
        targetVRAM: params.targetVRAM,
        mode: params.mode 
      });
      
      const model = MODELS_DATABASE.find(m => m.id === params.modelId);
      if (!model) {
        throw new MCPError(`模型 ${params.modelId} 未找到`, MCP_ERROR_CODES.MODEL_NOT_FOUND);
      }

      // 估算当前配置的显存使用
      const currentVRAM = estimateVRAMUsage(model, params.currentConfig, params.mode);
      
      const suggestions = generateOptimizationSuggestions(
        model,
        currentVRAM,
        params.targetVRAM,
        params.mode,
        params.currentConfig
      );

      // 生成组合优化方案
      const combinedOptimizations = [];
      let cumulativeReduction = 0;
      let combinedConfig = { ...params.currentConfig };

      for (const suggestion of suggestions) {
        if (cumulativeReduction < (currentVRAM - params.targetVRAM)) {
          cumulativeReduction += suggestion.impact;
          combinedConfig = { ...combinedConfig, ...suggestion.newConfig };
          combinedOptimizations.push(suggestion);
        }
      }

      const analysis = {
        model: {
          id: model.id,
          name: model.name,
          parameters: model.params
        },
        current: {
          config: params.currentConfig,
          estimatedVRAM: currentVRAM
        },
        target: {
          vramLimit: params.targetVRAM,
          reductionNeeded: Math.max(0, currentVRAM - params.targetVRAM)
        },
        suggestions: suggestions.slice(0, 5), // 前5个建议
        combinedOptimization: {
          config: combinedConfig,
          estimatedVRAM: currentVRAM - cumulativeReduction,
          reductionAchieved: cumulativeReduction,
          feasible: (currentVRAM - cumulativeReduction) <= params.targetVRAM,
          steps: combinedOptimizations.map(s => s.message)
        },
        recommendations: [
          suggestions.length > 0 ? `推荐优先尝试: ${suggestions[0].message}` : '当前配置已优化',
          `预计可减少显存: ${cumulativeReduction.toFixed(1)}GB`,
          combinedOptimizations.length > 1 ? '建议逐步应用优化措施并测试效果' : '单一优化措施可能足够'
        ]
      };

      mcpLogger.info("配置优化分析完成", { 
        modelId: params.modelId,
        suggestionsCount: suggestions.length,
        reductionAchieved: cumulativeReduction 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    }, "配置优化建议")
  );

  // 自动调优工具
  server.registerTool(
    "auto_tune_config",
    {
      title: "自动配置调优",
      description: "自动寻找最优配置参数",
      inputSchema: AutoTuneParamsSchema
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始自动配置调优", { 
        modelId: params.modelId,
        gpuMemory: params.gpuMemory,
        priority: params.priority 
      });
      
      const model = MODELS_DATABASE.find(m => m.id === params.modelId);
      if (!model) {
        throw new MCPError(`模型 ${params.modelId} 未找到`, MCP_ERROR_CODES.MODEL_NOT_FOUND);
      }

      const constraints = params.constraints || {
        minBatchSize: 1,
        maxBatchSize: 64,
        minSequenceLength: 512,
        maxSequenceLength: 4096
      };

      // 搜索最优配置
      const configurations = [];
      
      for (let batchSize = constraints.minBatchSize; batchSize <= constraints.maxBatchSize; batchSize *= 2) {
        for (let seqLen = constraints.minSequenceLength; seqLen <= constraints.maxSequenceLength; seqLen *= 2) {
          const config = {
            batchSize,
            sequenceLength: seqLen,
            precision: 'fp16'
          };
          
          const estimatedVRAM = estimateVRAMUsage(model, config, params.mode);
          
          if (estimatedVRAM <= params.gpuMemory) {
            const throughput = (batchSize * seqLen) / estimatedVRAM; // 简化的吞吐量指标
            const efficiency = (params.gpuMemory - estimatedVRAM) / params.gpuMemory; // 显存利用率
            
            configurations.push({
              config,
              estimatedVRAM,
              throughput,
              efficiency,
              score: calculateScore(params.priority, throughput, efficiency, estimatedVRAM)
            });
          }
        }
      }

      // 排序并选择最优配置
      configurations.sort((a, b) => b.score - a.score);
      const optimalConfig = configurations[0];

      const analysis = {
        model: {
          id: model.id,
          name: model.name,
          parameters: model.params
        },
        constraints: {
          gpuMemory: params.gpuMemory,
          priority: params.priority,
          searchSpace: constraints
        },
        results: {
          totalConfigurations: configurations.length,
          optimalConfig: optimalConfig?.config,
          estimatedVRAM: optimalConfig?.estimatedVRAM,
          expectedThroughput: optimalConfig?.throughput,
          memoryEfficiency: optimalConfig?.efficiency
        },
        alternatives: configurations.slice(1, 4), // 前3个备选方案
        recommendations: [
          optimalConfig ? `推荐配置: batch_size=${optimalConfig.config.batchSize}, seq_len=${optimalConfig.config.sequenceLength}` : '未找到合适配置',
          `预计显存使用: ${optimalConfig?.estimatedVRAM.toFixed(1)}GB / ${params.gpuMemory}GB`,
          `优化目标: ${params.priority === 'throughput' ? '最大吞吐量' : params.priority === 'latency' ? '最低延迟' : '最高显存利用率'}`
        ]
      };

      mcpLogger.info("自动配置调优完成", { 
        modelId: params.modelId,
        configurationsFound: configurations.length,
        optimalVRAM: optimalConfig?.estimatedVRAM 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    }, "自动配置调优")
  );

  mcpLogger.info("优化工具注册完成", { 
    tools: ['optimize_config', 'auto_tune_config']
  });
}

/**
 * 估算显存使用（简化版本）
 */
function estimateVRAMUsage(model: any, config: any, mode: string): number {
  const baseMemory = model.params * (config.precision === 'fp32' ? 4 : 2);
  const activationMemory = config.batchSize * config.sequenceLength * 0.001; // 简化计算
  
  switch (mode) {
    case 'inference':
      return baseMemory + activationMemory * 0.1;
    case 'training':
      return baseMemory + activationMemory + baseMemory * 2; // 优化器和梯度
    case 'finetuning':
      return baseMemory + activationMemory + baseMemory * 0.1; // PEFT方法
    default:
      return baseMemory + activationMemory;
  }
}

/**
 * 计算配置评分
 */
function calculateScore(priority: string, throughput: number, efficiency: number, vramUsage: number): number {
  switch (priority) {
    case 'throughput':
      return throughput * 0.7 + efficiency * 0.3;
    case 'latency':
      return (1 / vramUsage) * 0.6 + efficiency * 0.4;
    case 'memory':
      return efficiency * 0.8 + throughput * 0.2;
    default:
      return throughput * 0.4 + efficiency * 0.6;
  }
}
