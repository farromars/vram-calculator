/**
 * 模型数据库资源实现
 * 提供模型信息的查询和筛选功能
 */

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MODELS_DATABASE } from '@/lib/models-data';
import { mcpLogger } from '../logger';

/**
 * 注册模型相关资源
 */
export function registerModelResources(server: any) {
  // NLP模型列表资源
  server.registerResource(
    "models-nlp",
    "models://nlp",
    {
      title: "NLP模型数据库",
      description: "所有NLP/语言模型的详细信息",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取NLP模型列表", { uri: uri.href });
      
      const nlpModels = MODELS_DATABASE.filter(model => 
        ['transformer', 'glm', 'moe'].includes(model.architecture)
      );
      
      mcpLogger.debug("NLP模型筛选结果", { count: nlpModels.length });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            total: nlpModels.length,
            models: nlpModels,
            categories: {
              transformer: nlpModels.filter(m => m.architecture === 'transformer').length,
              glm: nlpModels.filter(m => m.architecture === 'glm').length,
              moe: nlpModels.filter(m => m.architecture === 'moe').length
            }
          }, null, 2)
        }]
      };
    }
  );

  // 多模态模型列表资源
  server.registerResource(
    "models-multimodal",
    "models://multimodal",
    {
      title: "多模态模型数据库",
      description: "所有多模态模型的详细信息",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取多模态模型列表", { uri: uri.href });
      
      const multimodalModels = MODELS_DATABASE.filter(model => 
        ['multimodal', 'vision-text', 'audio-text', 'video-text', 'omnimodal', 'document-ocr'].includes(model.architecture)
      );
      
      mcpLogger.debug("多模态模型筛选结果", { count: multimodalModels.length });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            total: multimodalModels.length,
            models: multimodalModels,
            categories: {
              'vision-text': multimodalModels.filter(m => m.architecture === 'vision-text').length,
              'audio-text': multimodalModels.filter(m => m.architecture === 'audio-text').length,
              'video-text': multimodalModels.filter(m => m.architecture === 'video-text').length,
              'omnimodal': multimodalModels.filter(m => m.architecture === 'omnimodal').length,
              'document-ocr': multimodalModels.filter(m => m.architecture === 'document-ocr').length
            }
          }, null, 2)
        }]
      };
    }
  );

  // 向量模型列表资源
  server.registerResource(
    "models-embedding",
    "models://embedding",
    {
      title: "向量模型数据库",
      description: "所有向量/嵌入模型的详细信息",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取向量模型列表", { uri: uri.href });
      
      const embeddingModels = MODELS_DATABASE.filter(model => 
        model.id.includes('embedding') || model.id.includes('reranker')
      );
      
      mcpLogger.debug("向量模型筛选结果", { count: embeddingModels.length });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            total: embeddingModels.length,
            models: embeddingModels,
            categories: {
              embedding: embeddingModels.filter(m => m.id.includes('embedding')).length,
              reranker: embeddingModels.filter(m => m.id.includes('reranker')).length
            }
          }, null, 2)
        }]
      };
    }
  );

  // 动态模型详情资源
  server.registerResource(
    "model-detail",
    new ResourceTemplate("models://detail/{modelId}", { list: undefined }),
    {
      title: "模型详细信息",
      description: "获取特定模型的详细信息"
    },
    async (uri: URL, { modelId }: { modelId: string }) => {
      mcpLogger.info("获取模型详情", { modelId, uri: uri.href });
      
      const model = MODELS_DATABASE.find(m => m.id === modelId);
      
      if (!model) {
        mcpLogger.warn("模型未找到", { modelId });
        throw new Error(`模型 ${modelId} 未找到`);
      }
      
      // 计算模型的基础信息
      const modelInfo = {
        ...model,
        metadata: {
          parameterSize: `${model.params}B`,
          memoryFootprint: {
            fp32: `${(model.params * 4).toFixed(1)}GB`,
            fp16: `${(model.params * 2).toFixed(1)}GB`,
            int8: `${(model.params * 1).toFixed(1)}GB`,
            int4: `${(model.params * 0.5).toFixed(1)}GB`
          },
          contextWindow: (model as any).contextLength || 'Unknown',
          architecture: model.architecture,
          category: ['transformer', 'glm', 'moe'].includes(model.architecture) ? 'nlp' : 
                   ['multimodal', 'vision-text', 'audio-text', 'video-text', 'omnimodal'].includes(model.architecture) ? 'multimodal' : 'other'
        }
      };
      
      mcpLogger.debug("模型详情获取成功", { modelId, architecture: model.architecture });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(modelInfo, null, 2)
        }]
      };
    }
  );

  // 按参数大小筛选模型资源
  server.registerResource(
    "models-by-size",
    new ResourceTemplate("models://size/{minParams}-{maxParams}", { list: undefined }),
    {
      title: "按参数大小筛选模型",
      description: "根据参数数量范围筛选模型"
    },
    async (uri: URL, { minParams, maxParams }: { minParams: string; maxParams: string }) => {
      const min = parseFloat(minParams);
      const max = parseFloat(maxParams);
      
      mcpLogger.info("按参数大小筛选模型", { min, max, uri: uri.href });
      
      const filteredModels = MODELS_DATABASE.filter(model => 
        model.params >= min && model.params <= max
      );
      
      mcpLogger.debug("参数大小筛选结果", { count: filteredModels.length, min, max });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            filter: { minParams: min, maxParams: max },
            total: filteredModels.length,
            models: filteredModels.sort((a, b) => a.params - b.params)
          }, null, 2)
        }]
      };
    }
  );

  // 按架构筛选模型资源
  server.registerResource(
    "models-by-architecture",
    new ResourceTemplate("models://arch/{architecture}", { list: undefined }),
    {
      title: "按架构筛选模型",
      description: "根据模型架构筛选模型"
    },
    async (uri: URL, { architecture }: { architecture: string }) => {
      mcpLogger.info("按架构筛选模型", { architecture, uri: uri.href });
      
      const filteredModels = MODELS_DATABASE.filter(model => 
        model.architecture === architecture
      );
      
      mcpLogger.debug("架构筛选结果", { count: filteredModels.length, architecture });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            architecture,
            total: filteredModels.length,
            models: filteredModels.sort((a, b) => a.params - b.params)
          }, null, 2)
        }]
      };
    }
  );

  mcpLogger.info("模型资源注册完成", { 
    resources: ['models-nlp', 'models-multimodal', 'models-embedding', 'model-detail', 'models-by-size', 'models-by-architecture']
  });
}
