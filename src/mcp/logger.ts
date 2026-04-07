/**
 * MCP服务器日志记录工具
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
  sessionId?: string;
  requestId?: string;
}

class MCPLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最大日志条数

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    data?: unknown,
    sessionId?: string,
    requestId?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId,
      requestId
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 输出到控制台
    const logMessage = `[MCP ${entry.level.toUpperCase()}] ${entry.timestamp} - ${entry.message}`;
    
    switch (entry.level) {
      case 'error':
        console.error(logMessage, entry.data);
        break;
      case 'warn':
        console.warn(logMessage, entry.data);
        break;
      case 'debug':
        console.debug(logMessage, entry.data);
        break;
      default:
        console.log(logMessage, entry.data);
    }
  }

  info(message: string, data?: any, sessionId?: string, requestId?: string) {
    this.addLog(this.createLogEntry('info', message, data, sessionId, requestId));
  }

  warn(message: string, data?: any, sessionId?: string, requestId?: string) {
    this.addLog(this.createLogEntry('warn', message, data, sessionId, requestId));
  }

  error(message: string, data?: any, sessionId?: string, requestId?: string) {
    this.addLog(this.createLogEntry('error', message, data, sessionId, requestId));
  }

  debug(message: string, data?: any, sessionId?: string, requestId?: string) {
    this.addLog(this.createLogEntry('debug', message, data, sessionId, requestId));
  }

  // 获取最近的日志
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // 根据会话ID获取日志
  getLogsBySession(sessionId: string): LogEntry[] {
    return this.logs.filter(log => log.sessionId === sessionId);
  }

  // 根据级别获取日志
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
  }

  // 获取日志统计
  getLogStats() {
    const stats = {
      total: this.logs.length,
      info: 0,
      warn: 0,
      error: 0,
      debug: 0
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
}

// 单例实例
export const mcpLogger = new MCPLogger();

/**
 * 错误处理工具
 */
export class MCPError extends Error {
  constructor(
    message: string,
    public code: number = -32603,
    public data?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
}

/**
 * 常见MCP错误代码
 */
export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_ERROR: -32000,
  MODEL_NOT_FOUND: -32001,
  CALCULATION_ERROR: -32002,
  VALIDATION_ERROR: -32003
} as const;

/**
 * 创建标准化的MCP错误响应
 */
export function createMCPErrorResponse(
  error: MCPError | Error,
  id: any = null
) {
  const mcpError = error instanceof MCPError ? error : new MCPError(error.message);
  
  return {
    jsonrpc: '2.0',
    error: mcpError.toJSON(),
    id
  };
}

/**
 * 包装异步函数以添加错误处理和日志记录
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      mcpLogger.debug(`开始执行: ${context}`, { args });
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      mcpLogger.info(`成功完成: ${context}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      mcpLogger.error(`执行失败: ${context}`, { 
        error: error instanceof Error ? error.message : error,
        duration: `${duration}ms`,
        args 
      });
      throw error;
    }
  };
}

/**
 * 验证参数的工具函数
 */
export function validateParams<T>(
  params: unknown,
  schema: any,
  context: string
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    mcpLogger.error(`参数验证失败: ${context}`, { error, params });
    throw new MCPError(
      `参数验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
      MCP_ERROR_CODES.VALIDATION_ERROR,
      { context, params }
    );
  }
}
