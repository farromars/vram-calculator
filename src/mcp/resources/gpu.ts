/**
 * GPU规格资源实现
 * 提供GPU信息的查询和筛选功能
 */

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GPU_DATABASE } from '@/lib/models-data';
import { mcpLogger } from '../logger';

/**
 * 注册GPU相关资源
 */
export function registerGPUResources(server: any) {
  // 所有GPU规格资源
  server.registerResource(
    "gpu-specs",
    "gpu://specs",
    {
      title: "GPU规格数据库",
      description: "所有GPU的详细规格和价格信息",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取GPU规格列表", { uri: uri.href });
      
      const gpuStats = {
        total: GPU_DATABASE.length,
        architectures: [...new Set(GPU_DATABASE.map(gpu => gpu.architecture))],
        memoryRange: {
          min: Math.min(...GPU_DATABASE.map(gpu => gpu.memory)),
          max: Math.max(...GPU_DATABASE.map(gpu => gpu.memory))
        },
        priceRange: {
          min: Math.min(...GPU_DATABASE.filter(gpu => gpu.price).map(gpu => gpu.price!)),
          max: Math.max(...GPU_DATABASE.filter(gpu => gpu.price).map(gpu => gpu.price!))
        }
      };
      
      mcpLogger.debug("GPU规格统计", gpuStats);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            statistics: gpuStats,
            gpus: GPU_DATABASE.sort((a, b) => b.memory - a.memory)
          }, null, 2)
        }]
      };
    }
  );

  // 按显存大小筛选GPU
  server.registerResource(
    "gpu-by-memory",
    new ResourceTemplate("gpu://memory/{minMemory}-{maxMemory}", { list: undefined }),
    {
      title: "按显存大小筛选GPU",
      description: "根据显存大小范围筛选GPU"
    },
    async (uri: URL, { minMemory, maxMemory }: { minMemory: string; maxMemory: string }) => {
      const min = parseInt(minMemory);
      const max = parseInt(maxMemory);
      
      mcpLogger.info("按显存大小筛选GPU", { min, max, uri: uri.href });
      
      const filteredGPUs = GPU_DATABASE.filter(gpu => 
        gpu.memory >= min && gpu.memory <= max
      );
      
      mcpLogger.debug("显存大小筛选结果", { count: filteredGPUs.length, min, max });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            filter: { minMemory: min, maxMemory: max },
            total: filteredGPUs.length,
            gpus: filteredGPUs.sort((a, b) => a.memory - b.memory)
          }, null, 2)
        }]
      };
    }
  );

  // 按价格范围筛选GPU
  server.registerResource(
    "gpu-by-price",
    new ResourceTemplate("gpu://price/{minPrice}-{maxPrice}", { list: undefined }),
    {
      title: "按价格范围筛选GPU",
      description: "根据价格范围筛选GPU"
    },
    async (uri: URL, { minPrice, maxPrice }: { minPrice: string; maxPrice: string }) => {
      const min = parseInt(minPrice);
      const max = parseInt(maxPrice);
      
      mcpLogger.info("按价格范围筛选GPU", { min, max, uri: uri.href });
      
      const filteredGPUs = GPU_DATABASE.filter(gpu => 
        gpu.price && gpu.price >= min && gpu.price <= max
      );
      
      mcpLogger.debug("价格范围筛选结果", { count: filteredGPUs.length, min, max });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            filter: { minPrice: min, maxPrice: max },
            total: filteredGPUs.length,
            gpus: filteredGPUs.sort((a, b) => (a.price || 0) - (b.price || 0))
          }, null, 2)
        }]
      };
    }
  );

  // 按架构筛选GPU
  server.registerResource(
    "gpu-by-architecture",
    new ResourceTemplate("gpu://arch/{architecture}", { list: undefined }),
    {
      title: "按架构筛选GPU",
      description: "根据GPU架构筛选GPU"
    },
    async (uri: URL, { architecture }: { architecture: string }) => {
      mcpLogger.info("按架构筛选GPU", { architecture, uri: uri.href });
      
      const filteredGPUs = GPU_DATABASE.filter(gpu => 
        gpu.architecture.toLowerCase() === architecture.toLowerCase()
      );
      
      mcpLogger.debug("架构筛选结果", { count: filteredGPUs.length, architecture });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            architecture,
            total: filteredGPUs.length,
            gpus: filteredGPUs.sort((a, b) => b.memory - a.memory)
          }, null, 2)
        }]
      };
    }
  );

  // GPU推荐资源（基于显存需求）
  server.registerResource(
    "gpu-recommendations",
    new ResourceTemplate("gpu://recommend/{vramRequired}", { list: undefined }),
    {
      title: "GPU推荐",
      description: "基于显存需求推荐合适的GPU"
    },
    async (uri: URL, { vramRequired }: { vramRequired: string }) => {
      const requiredVRAM = parseFloat(vramRequired);
      
      mcpLogger.info("GPU推荐查询", { requiredVRAM, uri: uri.href });
      
      // 筛选满足显存需求的GPU
      const suitableGPUs = GPU_DATABASE.filter(gpu => gpu.memory >= requiredVRAM);
      
      // 按性价比排序（显存/价格比）
      const rankedGPUs = suitableGPUs
        .filter(gpu => gpu.price) // 只考虑有价格信息的GPU
        .map(gpu => ({
          ...gpu,
          utilization: (requiredVRAM / gpu.memory) * 100,
          memoryPriceRatio: gpu.memory / (gpu.price || 1),
          wastedMemory: gpu.memory - requiredVRAM
        }))
        .sort((a, b) => {
          // 优先考虑利用率高且浪费少的GPU
          const aScore = a.utilization - (a.wastedMemory * 0.1);
          const bScore = b.utilization - (b.wastedMemory * 0.1);
          return bScore - aScore;
        });

      // 分类推荐
      const recommendations = {
        optimal: rankedGPUs.filter(gpu => gpu.utilization >= 70 && gpu.utilization <= 90),
        budget: rankedGPUs.sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 3),
        performance: rankedGPUs.sort((a, b) => b.memory - a.memory).slice(0, 3),
        all: rankedGPUs.slice(0, 10)
      };
      
      mcpLogger.debug("GPU推荐结果", { 
        requiredVRAM, 
        suitableCount: suitableGPUs.length,
        optimalCount: recommendations.optimal.length 
      });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            requiredVRAM,
            analysis: {
              totalSuitable: suitableGPUs.length,
              optimalChoices: recommendations.optimal.length,
              budgetOptions: recommendations.budget.length,
              performanceOptions: recommendations.performance.length
            },
            recommendations
          }, null, 2)
        }]
      };
    }
  );

  // GPU详细信息资源
  server.registerResource(
    "gpu-detail",
    new ResourceTemplate("gpu://detail/{gpuId}", { list: undefined }),
    {
      title: "GPU详细信息",
      description: "获取特定GPU的详细信息"
    },
    async (uri: URL, { gpuId }: { gpuId: string }) => {
      mcpLogger.info("获取GPU详情", { gpuId, uri: uri.href });
      
      const gpu = GPU_DATABASE.find(g => g.id === gpuId);
      
      if (!gpu) {
        mcpLogger.warn("GPU未找到", { gpuId });
        throw new Error(`GPU ${gpuId} 未找到`);
      }
      
      // 计算GPU的扩展信息
      const gpuInfo = {
        ...gpu,
        metadata: {
          memoryBandwidth: gpu.memory * 1000, // 估算带宽
          powerEfficiency: gpu.memory / (Number(gpu.features?.find(f => f.includes('W'))?.replace(/\D/g, '')) || 300),
          category: gpu.memory >= 24 ? 'enterprise' : gpu.memory >= 16 ? 'professional' : 'consumer',
          suitableFor: {
            inference: gpu.memory >= 8,
            training: gpu.memory >= 16,
            largeModels: gpu.memory >= 24
          }
        }
      };
      
      mcpLogger.debug("GPU详情获取成功", { gpuId, memory: gpu.memory });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(gpuInfo, null, 2)
        }]
      };
    }
  );

  mcpLogger.info("GPU资源注册完成", { 
    resources: ['gpu-specs', 'gpu-by-memory', 'gpu-by-price', 'gpu-by-architecture', 'gpu-recommendations', 'gpu-detail']
  });
}
