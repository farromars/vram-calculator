/**
 * 成本分析和性价比计算工具
 */

import { GPU_DATABASE, MODELS_DATABASE } from '@/lib/models-data';
import { 
  CostAnalysisParamsSchema,
  GPURecommendationParamsSchema
} from '../types';
import { mcpLogger, MCPError, MCP_ERROR_CODES, withErrorHandling } from '../logger';
import { z } from 'zod';

/**
 * 批量比较参数
 */
const BatchComparisonParamsSchema = z.object({
  modelIds: z.array(z.string()).describe('要比较的模型ID列表'),
  mode: z.enum(['inference', 'training', 'finetuning']).describe('计算模式'),
  batchSize: z.number().min(1).describe('批次大小'),
  sequenceLength: z.number().min(1).describe('序列长度'),
  precision: z.enum(['fp32', 'fp16', 'bf16']).describe('精度类型')
});

/**
 * 注册分析工具
 */
export function registerAnalysisTools(server: any) {
  // 成本分析工具
  server.registerTool(
    "analyze_cost",
    {
      title: "成本分析",
      description: "分析GPU使用成本和性价比",
      inputSchema: CostAnalysisParamsSchema
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始成本分析", { 
        gpuName: params.gpuName, 
        hours: params.hours,
        provider: params.provider 
      });
      
      const gpu = GPU_DATABASE.find(g => 
        g.name.toLowerCase().includes(params.gpuName.toLowerCase()) ||
        g.id === params.gpuName
      );
      
      if (!gpu) {
        throw new MCPError(`GPU ${params.gpuName} 未找到`, MCP_ERROR_CODES.MODEL_NOT_FOUND);
      }

      let hourlyRate = 0;
      let costBreakdown: any = {};

      if (params.provider === 'local') {
        // 本地部署成本计算
        const purchasePrice = gpu.price || 0;
        const monthlyElectricity = 100; // 假设每月电费100美元
        const depreciation = purchasePrice / (3 * 365 * 24); // 3年折旧
        const electricityCost = monthlyElectricity / (30 * 24); // 每小时电费
        
        hourlyRate = depreciation + electricityCost;
        costBreakdown = {
          depreciation: depreciation * params.hours,
          electricity: electricityCost * params.hours,
          maintenance: 0.1 * params.hours, // 维护成本
          total: hourlyRate * params.hours
        };
      } else {
        // 云服务成本（使用 GPU 配置的云价格）
        hourlyRate = gpu.cloudPrice || 2.0;
        
        costBreakdown = {
          compute: hourlyRate * params.hours,
          storage: 0.1 * params.hours, // 存储成本
          network: 0.05 * params.hours, // 网络成本
          total: (hourlyRate + 0.15) * params.hours
        };
      }

      const analysis = {
        gpu: {
          name: gpu.name,
          memory: gpu.memory,
          architecture: gpu.architecture,
          price: gpu.price
        },
        usage: {
          hours: params.hours,
          provider: params.provider,
          hourlyRate
        },
        cost: costBreakdown,
        efficiency: {
          costPerGB: costBreakdown.total / gpu.memory,
          costPerHourPerGB: hourlyRate / gpu.memory,
          memoryUtilization: 'N/A' // 需要结合具体计算需求
        },
        recommendations: [
          params.provider === 'local' ? 
            "本地部署适合长期使用，初期投资较高但长期成本较低" :
            "云服务适合短期或不定期使用，按需付费",
          `当前配置每小时成本: $${hourlyRate.toFixed(2)}`,
          `总计算成本: $${costBreakdown.total.toFixed(2)}`
        ]
      };

      mcpLogger.info("成本分析完成", { 
        gpuName: params.gpuName,
        totalCost: costBreakdown.total,
        hourlyRate 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    }, "成本分析")
  );

  // 高级GPU推荐工具
  server.registerTool(
    "recommend_gpu_advanced",
    {
      title: "高级GPU推荐",
      description: "基于多种因素的智能GPU推荐",
      inputSchema: GPURecommendationParamsSchema.extend({
        workloadType: z.enum(['continuous', 'burst', 'development']).optional().describe('工作负载类型'),
        powerLimit: z.number().optional().describe('功耗限制(W)'),
        coolingCapacity: z.enum(['air', 'liquid', 'datacenter']).optional().describe('散热能力')
      })
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始高级GPU推荐", { 
        vramRequired: params.vramRequired,
        useCase: params.useCase,
        budget: params.budget 
      });
      
      let suitableGPUs = GPU_DATABASE.filter(gpu => gpu.memory >= params.vramRequired);
      
      if (params.budget) {
        suitableGPUs = suitableGPUs.filter(gpu => (gpu.price || 0) <= params.budget);
      }

      // 根据功耗限制筛选
      if (params.powerLimit) {
        suitableGPUs = suitableGPUs.filter(gpu => {
          const powerConsumption = gpu.features?.find(f => f.includes('W'))?.replace(/\D/g, '');
          return powerConsumption ? parseInt(powerConsumption) <= params.powerLimit : true;
        });
      }

      // 计算综合评分
      const rankedGPUs = suitableGPUs.map(gpu => {
        const utilization = (params.vramRequired / gpu.memory) * 100;
        const memoryScore = Math.max(0, 100 - Math.abs(utilization - 80)); // 80%利用率最优
        const priceScore = gpu.price ? (1000 / gpu.price) * 10 : 50; // 价格越低分数越高
        const performanceScore = gpu.memory * 2; // 显存越大性能分数越高
        
        const totalScore = (memoryScore * 0.4) + (priceScore * 0.3) + (performanceScore * 0.3);
        
        return {
          ...gpu,
          utilization,
          scores: {
            memory: memoryScore,
            price: priceScore,
            performance: performanceScore,
            total: totalScore
          },
          wastedMemory: gpu.memory - params.vramRequired,
          costEfficiency: gpu.price ? gpu.memory / gpu.price : 0
        };
      }).sort((a, b) => b.scores.total - a.scores.total);

      // 分类推荐
      const recommendations = {
        optimal: rankedGPUs.filter(gpu => gpu.utilization >= 70 && gpu.utilization <= 90),
        budget: rankedGPUs.sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 3),
        performance: rankedGPUs.sort((a, b) => b.memory - a.memory).slice(0, 3),
        efficiency: rankedGPUs.sort((a, b) => b.costEfficiency - a.costEfficiency).slice(0, 3),
        all: rankedGPUs.slice(0, 10)
      };

      const analysis = {
        requirements: {
          vramRequired: params.vramRequired,
          useCase: params.useCase,
          budget: params.budget,
          multiGPU: params.multiGPU
        },
        analysis: {
          totalSuitable: suitableGPUs.length,
          optimalChoices: recommendations.optimal.length,
          averageUtilization: rankedGPUs.reduce((sum, gpu) => sum + gpu.utilization, 0) / rankedGPUs.length,
          priceRange: {
            min: Math.min(...rankedGPUs.filter(g => g.price).map(g => g.price!)),
            max: Math.max(...rankedGPUs.filter(g => g.price).map(g => g.price!))
          }
        },
        recommendations,
        insights: [
          `找到 ${suitableGPUs.length} 个符合显存要求的GPU`,
          `最优选择: ${recommendations.optimal.length} 个GPU利用率在70-90%之间`,
          `预算友好选择: ${recommendations.budget[0]?.name || 'N/A'}`,
          `性能最强选择: ${recommendations.performance[0]?.name || 'N/A'}`
        ]
      };

      mcpLogger.info("高级GPU推荐完成", { 
        vramRequired: params.vramRequired,
        suitableCount: suitableGPUs.length,
        optimalCount: recommendations.optimal.length 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    }, "高级GPU推荐")
  );

  // 批量模型比较工具
  server.registerTool(
    "compare_models_batch",
    {
      title: "批量模型比较",
      description: "批量比较多个模型的显存需求",
      inputSchema: BatchComparisonParamsSchema
    },
    withErrorHandling(async (params) => {
      mcpLogger.info("开始批量模型比较", { 
        modelCount: params.modelIds.length,
        mode: params.mode 
      });
      
      const comparisons = [];
      
      for (const modelId of params.modelIds) {
        const model = MODELS_DATABASE.find(m => m.id === modelId);
        if (!model) {
          mcpLogger.warn("模型未找到，跳过", { modelId });
          continue;
        }

        // 这里应该调用相应的计算函数，简化处理
        const estimatedVRAM = model.params * 2; // 简化估算
        
        comparisons.push({
          modelId,
          modelName: model.name,
          parameters: model.params,
          estimatedVRAM,
          efficiency: model.params / estimatedVRAM,
          category: model.params < 7 ? 'small' : model.params < 30 ? 'medium' : 'large'
        });
      }

      // 排序和分析
      comparisons.sort((a, b) => a.estimatedVRAM - b.estimatedVRAM);
      
      const analysis = {
        summary: {
          totalModels: comparisons.length,
          vramRange: {
            min: Math.min(...comparisons.map(c => c.estimatedVRAM)),
            max: Math.max(...comparisons.map(c => c.estimatedVRAM))
          },
          categories: {
            small: comparisons.filter(c => c.category === 'small').length,
            medium: comparisons.filter(c => c.category === 'medium').length,
            large: comparisons.filter(c => c.category === 'large').length
          }
        },
        comparisons,
        recommendations: {
          mostEfficient: comparisons.sort((a, b) => b.efficiency - a.efficiency)[0],
          leastVRAM: comparisons[0],
          bestBalance: comparisons.find(c => c.category === 'medium') || comparisons[0]
        }
      };

      mcpLogger.info("批量模型比较完成", { 
        comparedModels: comparisons.length,
        vramRange: analysis.summary.vramRange 
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    }, "批量模型比较")
  );

  mcpLogger.info("分析工具注册完成", { 
    tools: ['analyze_cost', 'recommend_gpu_advanced', 'compare_models_batch']
  });
}
