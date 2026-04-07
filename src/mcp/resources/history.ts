/**
 * 历史记录资源实现
 * 提供计算历史记录的存储和查询功能
 */

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpLogger } from '../logger';

/**
 * 计算历史记录接口
 */
interface CalculationHistory {
  id: string;
  timestamp: string;
  mode: 'inference' | 'training' | 'finetuning' | 'finetuning_advanced' | 'grpo' | 'multimodal';
  modelId: string;
  modelName: string;
  parameters: Record<string, any>;
  result: {
    totalVRAM: number;
    breakdown: Record<string, number>;
  };
  recommendations?: {
    gpus: Array<{ name: string; vram: number; utilization: number; price?: number }>;
    optimizations: string[];
  };
  sessionId?: string;
  userAgent?: string;
}

/**
 * 内存中的历史记录存储（生产环境中应使用数据库）
 */
class HistoryStore {
  private records: CalculationHistory[] = [];
  private maxRecords = 1000;

  addRecord(record: Omit<CalculationHistory, 'id' | 'timestamp'>): CalculationHistory {
    const historyRecord: CalculationHistory = {
      ...record,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    this.records.unshift(historyRecord); // 新记录添加到开头

    // 保持记录数量在限制内
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(0, this.maxRecords);
    }

    mcpLogger.info("添加计算历史记录", { 
      id: historyRecord.id, 
      mode: historyRecord.mode,
      modelId: historyRecord.modelId 
    });

    return historyRecord;
  }

  getRecords(limit: number = 50, offset: number = 0): CalculationHistory[] {
    return this.records.slice(offset, offset + limit);
  }

  getRecordById(id: string): CalculationHistory | undefined {
    return this.records.find(record => record.id === id);
  }

  getRecordsByMode(mode: string, limit: number = 50): CalculationHistory[] {
    return this.records
      .filter(record => record.mode === mode)
      .slice(0, limit);
  }

  getRecordsByModel(modelId: string, limit: number = 50): CalculationHistory[] {
    return this.records
      .filter(record => record.modelId === modelId)
      .slice(0, limit);
  }

  getRecordsBySession(sessionId: string): CalculationHistory[] {
    return this.records.filter(record => record.sessionId === sessionId);
  }

  getRecordsByDateRange(startDate: string, endDate: string): CalculationHistory[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= start && recordDate <= end;
    });
  }

  getStatistics() {
    const stats = {
      total: this.records.length,
      byMode: {} as Record<string, number>,
      byModel: {} as Record<string, number>,
      recentActivity: this.records.slice(0, 10).map(r => ({
        id: r.id,
        mode: r.mode,
        modelName: r.modelName,
        timestamp: r.timestamp,
        totalVRAM: r.result.totalVRAM
      }))
    };

    // 按模式统计
    this.records.forEach(record => {
      stats.byMode[record.mode] = (stats.byMode[record.mode] || 0) + 1;
    });

    // 按模型统计（取前10个）
    this.records.forEach(record => {
      stats.byModel[record.modelName] = (stats.byModel[record.modelName] || 0) + 1;
    });

    // 只保留前10个最常用的模型
    const sortedModels = Object.entries(stats.byModel)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    stats.byModel = Object.fromEntries(sortedModels);

    return stats;
  }

  clearRecords() {
    this.records = [];
    mcpLogger.info("清除所有历史记录");
  }

  private generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 全局历史记录存储实例
export const historyStore = new HistoryStore();

/**
 * 注册历史记录相关资源
 */
export function registerHistoryResources(server: any) {
  // 获取历史记录列表
  server.registerResource(
    "history-list",
    "history://list",
    {
      title: "计算历史记录",
      description: "获取最近的计算历史记录",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取历史记录列表", { uri: uri.href });
      
      const records = historyStore.getRecords(50);
      const stats = historyStore.getStatistics();
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            statistics: stats,
            records: records
          }, null, 2)
        }]
      };
    }
  );

  // 按模式筛选历史记录
  server.registerResource(
    "history-by-mode",
    new ResourceTemplate("history://mode/{mode}", { list: undefined }),
    {
      title: "按模式筛选历史记录",
      description: "获取特定计算模式的历史记录"
    },
    async (uri: URL, { mode }: { mode: string }) => {
      mcpLogger.info("按模式获取历史记录", { mode, uri: uri.href });
      
      const records = historyStore.getRecordsByMode(mode, 50);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            mode,
            total: records.length,
            records: records
          }, null, 2)
        }]
      };
    }
  );

  // 按模型筛选历史记录
  server.registerResource(
    "history-by-model",
    new ResourceTemplate("history://model/{modelId}", { list: undefined }),
    {
      title: "按模型筛选历史记录",
      description: "获取特定模型的历史记录"
    },
    async (uri: URL, { modelId }: { modelId: string }) => {
      mcpLogger.info("按模型获取历史记录", { modelId, uri: uri.href });
      
      const records = historyStore.getRecordsByModel(modelId, 50);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            modelId,
            total: records.length,
            records: records
          }, null, 2)
        }]
      };
    }
  );

  // 获取特定历史记录详情
  server.registerResource(
    "history-detail",
    new ResourceTemplate("history://detail/{recordId}", { list: undefined }),
    {
      title: "历史记录详情",
      description: "获取特定历史记录的详细信息"
    },
    async (uri: URL, { recordId }: { recordId: string }) => {
      mcpLogger.info("获取历史记录详情", { recordId, uri: uri.href });
      
      const record = historyStore.getRecordById(recordId);
      
      if (!record) {
        mcpLogger.warn("历史记录未找到", { recordId });
        throw new Error(`历史记录 ${recordId} 未找到`);
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(record, null, 2)
        }]
      };
    }
  );

  // 按日期范围筛选历史记录
  server.registerResource(
    "history-by-date",
    new ResourceTemplate("history://date/{startDate}/{endDate}", { list: undefined }),
    {
      title: "按日期范围筛选历史记录",
      description: "获取指定日期范围内的历史记录"
    },
    async (uri: URL, { startDate, endDate }: { startDate: string; endDate: string }) => {
      mcpLogger.info("按日期范围获取历史记录", { startDate, endDate, uri: uri.href });
      
      const records = historyStore.getRecordsByDateRange(startDate, endDate);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            dateRange: { startDate, endDate },
            total: records.length,
            records: records
          }, null, 2)
        }]
      };
    }
  );

  // 历史记录统计
  server.registerResource(
    "history-stats",
    "history://statistics",
    {
      title: "历史记录统计",
      description: "获取历史记录的统计信息",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取历史记录统计", { uri: uri.href });
      
      const stats = historyStore.getStatistics();
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(stats, null, 2)
        }]
      };
    }
  );

  mcpLogger.info("历史记录资源注册完成", { 
    resources: ['history-list', 'history-by-mode', 'history-by-model', 'history-detail', 'history-by-date', 'history-stats']
  });
}

/**
 * 添加计算历史记录的辅助函数
 */
export function addCalculationHistory(
  mode: CalculationHistory['mode'],
  modelId: string,
  modelName: string,
  parameters: Record<string, any>,
  result: CalculationHistory['result'],
  recommendations?: CalculationHistory['recommendations'],
  sessionId?: string
): CalculationHistory {
  return historyStore.addRecord({
    mode,
    modelId,
    modelName,
    parameters,
    result,
    recommendations,
    sessionId
  });
}
