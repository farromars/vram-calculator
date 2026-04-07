import { useState, useCallback, useRef, useEffect } from 'react';

export interface PerformanceMetrics {
  calculationTime: number;
  renderTime: number;
  memoryUsage: number;
  userInteractions: number;
  errorCount: number;
  lastCalculation: Date | null;
  totalCalculations: number;
  averageCalculationTime: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  recommendations: string[];
  healthScore: number;
}

const STORAGE_KEY = 'ai-calculator-performance';
const MAX_CALCULATION_TIME = 1000; // 1秒警告阈值
const MAX_RENDER_TIME = 100; // 100ms警告阈值

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            lastCalculation: parsed.lastCalculation ? new Date(parsed.lastCalculation) : null
          };
        } catch {
          // 如果解析失败，使用默认值
        }
      }
    }
    
    return {
      calculationTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      userInteractions: 0,
      errorCount: 0,
      lastCalculation: null,
      totalCalculations: 0,
      averageCalculationTime: 0
    };
  });

  const calculationStartTime = useRef<number | null>(null);
  const renderStartTime = useRef<number | null>(null);
  const calculationTimes = useRef<number[]>([]);

  // 保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    }
  }, [metrics]);

  // 开始计算性能监控
  const startCalculation = useCallback(() => {
    calculationStartTime.current = performance.now();
  }, []);

  // 结束计算性能监控
  const endCalculation = useCallback(() => {
    if (calculationStartTime.current) {
      const duration = performance.now() - calculationStartTime.current;
      calculationTimes.current.push(duration);
      
      // 只保留最近50次计算时间
      if (calculationTimes.current.length > 50) {
        calculationTimes.current = calculationTimes.current.slice(-50);
      }

      const averageTime = calculationTimes.current.reduce((a, b) => a + b, 0) / calculationTimes.current.length;

      setMetrics(prev => ({
        ...prev,
        calculationTime: duration,
        lastCalculation: new Date(),
        totalCalculations: prev.totalCalculations + 1,
        averageCalculationTime: averageTime
      }));

      calculationStartTime.current = null;
    }
  }, []);

  // 开始渲染性能监控
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // 结束渲染性能监控
  const endRender = useCallback(() => {
    if (renderStartTime.current) {
      const duration = performance.now() - renderStartTime.current;
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.max(prev.renderTime, duration)
      }));
      renderStartTime.current = null;
    }
  }, []);

  // 记录用户交互
  const recordInteraction = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      userInteractions: prev.userInteractions + 1
    }));
  }, []);

  // 记录错误
  const recordError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));
  }, []);

  // 获取内存使用情况
  const updateMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as typeof performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.max(prev.memoryUsage, usedMB)
        }));
      }
    }
  }, []);

  // 生成性能报告
  const generateReport = useCallback((): PerformanceReport => {
    const recommendations: string[] = [];
    let healthScore = 100;

    // 计算时间分析
    if (metrics.averageCalculationTime > MAX_CALCULATION_TIME) {
      recommendations.push(`平均计算时间过长 (${metrics.averageCalculationTime.toFixed(0)}ms)，建议优化计算逻辑`);
      healthScore -= 20;
    } else if (metrics.averageCalculationTime > MAX_CALCULATION_TIME / 2) {
      recommendations.push('计算性能良好，但仍有优化空间');
      healthScore -= 10;
    }

    // 渲染时间分析
    if (metrics.renderTime > MAX_RENDER_TIME) {
      recommendations.push(`渲染时间过长 (${metrics.renderTime.toFixed(0)}ms)，建议优化组件渲染`);
      healthScore -= 15;
    }

    // 内存使用分析
    if (metrics.memoryUsage > 100) {
      recommendations.push(`内存使用较高 (${metrics.memoryUsage.toFixed(1)}MB)，注意内存泄漏`);
      healthScore -= 15;
    } else if (metrics.memoryUsage > 50) {
      recommendations.push('内存使用正常，持续监控');
      healthScore -= 5;
    }

    // 错误率分析
    const errorRate = metrics.totalCalculations > 0 ? (metrics.errorCount / metrics.totalCalculations) * 100 : 0;
    if (errorRate > 5) {
      recommendations.push(`错误率较高 (${errorRate.toFixed(1)}%)，需要改进错误处理`);
      healthScore -= 25;
    } else if (errorRate > 1) {
      recommendations.push('错误率适中，建议进一步优化');
      healthScore -= 10;
    }

    // 使用频率分析
    if (metrics.totalCalculations > 100) {
      recommendations.push('使用频率很高，系统运行稳定');
    } else if (metrics.totalCalculations > 20) {
      recommendations.push('使用频率良好，用户体验积极');
    }

    // 性能趋势分析
    if (calculationTimes.current.length >= 10) {
      const recentTimes = calculationTimes.current.slice(-10);
      const oldTimes = calculationTimes.current.slice(0, Math.min(10, calculationTimes.current.length - 10));
      
      if (oldTimes.length > 0) {
        const recentAvg = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
        const oldAvg = oldTimes.reduce((a, b) => a + b, 0) / oldTimes.length;
        
        if (recentAvg > oldAvg * 1.5) {
          recommendations.push('性能有下降趋势，建议检查系统负载');
          healthScore -= 15;
        } else if (recentAvg < oldAvg * 0.8) {
          recommendations.push('性能有改善趋势，优化措施有效');
        }
      }
    }

    // 确保健康分数在0-100范围内
    healthScore = Math.max(0, Math.min(100, healthScore));

    // 如果没有建议，添加正面反馈
    if (recommendations.length === 0) {
      recommendations.push('系统性能优秀，各项指标均在正常范围内');
    }

    return {
      metrics,
      recommendations,
      healthScore
    };
  }, [metrics]);

  // 重置性能统计
  const resetMetrics = useCallback(() => {
    const resetData: PerformanceMetrics = {
      calculationTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      userInteractions: 0,
      errorCount: 0,
      lastCalculation: null,
      totalCalculations: 0,
      averageCalculationTime: 0
    };
    
    setMetrics(resetData);
    calculationTimes.current = [];
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // 定期更新内存使用情况
  useEffect(() => {
    const interval = setInterval(updateMemoryUsage, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [updateMemoryUsage]);

  return {
    metrics,
    startCalculation,
    endCalculation,
    startRender,
    endRender,
    recordInteraction,
    recordError,
    updateMemoryUsage,
    generateReport,
    resetMetrics
  };
} 