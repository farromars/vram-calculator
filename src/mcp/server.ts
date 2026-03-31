// @ts-nocheck
/**
 * MCP (Model Context Protocol) 服务器核心实现
 * 为AI显存计算器提供标准化的MCP接口
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// 导入日志和错误处理工具
import { mcpLogger, MCPError, MCP_ERROR_CODES, withErrorHandling, validateParams } from './logger';

// 导入资源注册函数
import { registerModelResources } from './resources/models';
import { registerGPUResources } from './resources/gpu';
import { registerFormulaResources } from './resources/formulas';
import { registerHistoryResources, addCalculationHistory } from './resources/history';

// 导入工具注册函数
import { registerCalculationTools } from './tools/calculations';
import { registerAnalysisTools } from './tools/analysis';
import { registerOptimizationTools } from './tools/optimization';

// 导入提示模板注册函数
import { registerPromptTemplates } from './prompts/templates';

// 导入现有的计算逻辑和数据
import { 
  calculateInferenceMemory,
  calculateTrainingMemory,
  calculateFineTuningMemory,
  calculateGRPOMemory,
  calculateMultimodalMemory,
  formatMemorySize
} from '@/utils/memory-formulas';
import { MODELS_DATABASE, GPU_DATABASE } from '@/lib/models-data';
import { 
  InferenceParamsSchema,
  TrainingParamsSchema,
  FineTuningParamsSchema,
  GRPOParamsSchema,
  MultimodalParamsSchema,
  GPURecommendationParamsSchema,
  CostAnalysisParamsSchema,
  OptimizationPromptParamsSchema,
  GPUSelectionPromptParamsSchema,
  type VRAMCalculationResult,
  type ModelInfo,
  type GPUSpec
} from './types';

/**
 * 创建并配置MCP服务器
 */
export function createVRAMCalculatorMCPServer(): McpServer {
  const server = new McpServer({
    name: "vram-calculator-mcp-server",
    version: "1.0.0"
  });

  mcpLogger.info("正在创建VRAM计算器MCP服务器", {
    name: "vram-calculator-mcp-server",
    version: "1.0.0"
  });

  // ===== 注册Resources（资源） =====

  // 注册所有资源
  registerModelResources(server);
  registerGPUResources(server);
  registerFormulaResources(server);
  registerHistoryResources(server);



  // ===== 注册Tools（工具） =====

  // 注册所有工具
  registerCalculationTools(server);
  registerAnalysisTools(server);
  registerOptimizationTools(server);

  // ===== 注册Prompts（提示模板） =====

  // 注册所有提示模板
  registerPromptTemplates(server);

  // 推理显存计算工具
  server.registerTool(
    "calculate_inference_vram",
    {
      title: "推理显存计算",
      description: "计算模型推理时的显存需求",
      inputSchema: {
        type: "object",
        properties: {
          modelId: { type: "string" },
          batchSize: { type: "number" },
          sequenceLength: { type: "number" },
          precision: { type: "string", enum: ["fp32", "fp16", "bf16", "int8", "int4"] }
        },
        required: ["modelId"]
      } as any
    },
    async (params) => {
      try {
        const model = MODELS_DATABASE.find(m => m.id === params.modelId);
        if (!model) {
          throw new Error(`模型 ${params.modelId} 未找到`);
        }

        const config = {
          precision: params.precision as any,
          quantization: params.quantization as any,
          batchSize: params.batchSize,
          sequenceLength: params.sequenceLength,
          kvCacheRatio: 1.0
        };

        const result = calculateInferenceMemory(config, {
          params: model.params,
          hiddenSize: model.hiddenSize,
          numLayers: model.numLayers,
          numHeads: model.numHeads
        });

        const calculationResult: VRAMCalculationResult = {
          totalVRAM: result.total,
          breakdown: {
            modelWeights: result.breakdown.find(b => b.label.includes('模型'))?.value || 0,
            kvCache: result.breakdown.find(b => b.label.includes('KV'))?.value || 0,
            activations: result.breakdown.find(b => b.label.includes('激活'))?.value || 0,
            other: result.breakdown.find(b => b.label.includes('其他'))?.value || 0
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
            optimizations: [
              "考虑使用量化技术减少显存占用",
              "调整批次大小以适应可用显存",
              "使用KV缓存优化长序列推理"
            ]
          }
        };

        // 添加到历史记录
        addCalculationHistory(
          'inference',
          params.modelId,
          model.name,
          params,
          {
            totalVRAM: result.total,
            breakdown: calculationResult.breakdown
          },
          calculationResult.recommendations
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(calculationResult, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `计算错误: ${error instanceof Error ? error.message : '未知错误'}`
          }],
          isError: true
        };
      }
    }
  );

  // 训练显存计算工具
  server.registerTool(
    "calculate_training_vram",
    {
      title: "训练显存计算",
      description: "计算模型训练时的显存需求",
      inputSchema: TrainingParamsSchema
    },
    async (params) => {
      try {
        const model = MODELS_DATABASE.find(m => m.id === params.modelId);
        if (!model) {
          throw new Error(`模型 ${params.modelId} 未找到`);
        }

        const config = {
          modelParams: model.params,
          batchSize: params.batchSize,
          sequenceLength: params.sequenceLength,
          precision: params.precision as any,
          optimizer: params.optimizer as any,
          gradientCheckpointing: params.gradientCheckpointing
        };

        const result = calculateTrainingMemory(config);

        const calculationResult: VRAMCalculationResult = {
          totalVRAM: result.total,
          breakdown: {
            modelWeights: result.breakdown.find(b => b.label.includes('模型'))?.value || 0,
            optimizer: result.breakdown.find(b => b.label.includes('优化器'))?.value || 0,
            gradients: result.breakdown.find(b => b.label.includes('梯度'))?.value || 0,
            activations: result.breakdown.find(b => b.label.includes('激活'))?.value || 0,
            other: result.breakdown.find(b => b.label.includes('其他'))?.value || 0
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
            optimizations: [
              "启用梯度检查点可减少70%激活值显存",
              "使用混合精度训练",
              "考虑梯度累积减少批次大小"
            ]
          }
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(calculationResult, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `计算错误: ${error instanceof Error ? error.message : '未知错误'}`
          }],
          isError: true
        };
      }
    }
  );

  // GPU推荐工具
  server.registerTool(
    "recommend_gpu",
    {
      title: "GPU推荐",
      description: "根据显存需求推荐合适的GPU",
      inputSchema: GPURecommendationParamsSchema
    },
    async (params) => {
      try {
        let suitableGPUs = GPU_DATABASE.filter(gpu => gpu.memory >= params.vramRequired);
        
        if (params.budget) {
          suitableGPUs = suitableGPUs.filter(gpu => (gpu.price || 0) <= params.budget);
        }

        // 按性价比排序
        suitableGPUs.sort((a, b) => {
          const aRatio = a.memory / (a.price || 1);
          const bRatio = b.memory / (b.price || 1);
          return bRatio - aRatio;
        });

        const recommendations = suitableGPUs.slice(0, 5).map(gpu => ({
          name: gpu.name,
          vram: gpu.memory,
          utilization: (params.vramRequired / gpu.memory) * 100,
          price: gpu.price,
          architecture: gpu.architecture,
          features: gpu.features?.slice(0, 3) || []
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              vramRequired: params.vramRequired,
              useCase: params.useCase,
              recommendations,
              summary: `找到 ${recommendations.length} 个符合要求的GPU选项`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `推荐错误: ${error instanceof Error ? error.message : '未知错误'}`
          }],
          isError: true
        };
      }
    }
  );

  // 微调显存计算工具
  server.registerTool(
    "calculate_finetuning_vram",
    {
      title: "微调显存计算",
      description: "计算模型微调时的显存需求，支持全量微调和PEFT方法",
      inputSchema: FineTuningParamsSchema
    },
    async (params) => {
      try {
        const model = MODELS_DATABASE.find(m => m.id === params.modelId);
        if (!model) {
          throw new Error(`模型 ${params.modelId} 未找到`);
        }

        const config = {
          method: params.method as any,
          loraRank: params.loraRank || 4,
          quantization: params.quantization as any || 'None',
          precision: params.precision as any,
          batchSize: params.batchSize,
          sequenceLength: params.sequenceLength
        };

        const result = calculateFineTuningMemory(config, {
          params: model.params,
          hiddenSize: model.hiddenSize,
          numLayers: model.numLayers
        });

        const calculationResult: VRAMCalculationResult = {
          totalVRAM: result.total,
          breakdown: {
            modelWeights: result.breakdown.find(b => b.label.includes('模型'))?.value || 0,
            optimizer: result.breakdown.find(b => b.label.includes('优化器'))?.value || 0,
            gradients: result.breakdown.find(b => b.label.includes('梯度'))?.value || 0,
            activations: result.breakdown.find(b => b.label.includes('激活'))?.value || 0,
            other: result.breakdown.find(b => b.label.includes('其他'))?.value || 0
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
            optimizations: [
              params.method === 'full' ? "考虑使用LoRA等PEFT方法减少显存占用" : "已使用PEFT方法，显存占用较低",
              "QLoRA可进一步减少基础模型显存占用",
              "调整LoRA rank以平衡性能和显存"
            ]
          }
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(calculationResult, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `计算错误: ${error instanceof Error ? error.message : '未知错误'}`
          }],
          isError: true
        };
      }
    }
  );

  mcpLogger.info("VRAM计算器MCP服务器创建完成", {
    resources: ['models', 'gpu', 'formulas', 'history'],
    tools: ['calculations', 'analysis', 'optimization'],
    prompts: ['optimization', 'selection', 'diagnosis', 'training']
  });

  return server;
}
