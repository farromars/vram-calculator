import { useState, useCallback } from 'react';

export interface AppError {
  id: string;
  type: 'validation' | 'calculation' | 'network' | 'system' | 'warning';
  message: string;
  details?: string;
  timestamp: Date;
  resolved?: boolean;
}

interface ErrorState {
  errors: AppError[];
  hasError: boolean;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    errors: [],
    hasError: false
  });

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    setErrorState(prev => ({
      errors: [...prev.errors, newError],
      hasError: true
    }));

    // 警告类型5秒后自动移除
    if (error.type === 'warning') {
      setTimeout(() => {
        setErrorState(prev => {
          const newErrors = prev.errors.filter(e => e.id !== newError.id);
          return {
            errors: newErrors,
            hasError: newErrors.length > 0
          };
        });
      }, 5000);
    }

    return newError.id;
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrorState(prev => {
      const newErrors = prev.errors.filter(e => e.id !== errorId);
      return {
        errors: newErrors,
        hasError: newErrors.length > 0
      };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorState({
      errors: [],
      hasError: false
    });
  }, []);

  const resolveError = useCallback((errorId: string) => {
    setErrorState(prev => ({
      ...prev,
      errors: prev.errors.map(e => 
        e.id === errorId ? { ...e, resolved: true } : e
      )
    }));
  }, []);

  // 验证工具函数
  const validateInput = useCallback((value: unknown, validation: {
    required?: boolean;
    min?: number;
    max?: number;
    type?: 'number' | 'string';
    field: string;
  }) => {
    const { required, min, max, type, field } = validation;

    if (required && (value === null || value === undefined || value === '')) {
      addError({
        type: 'validation',
        message: `${field}是必填项`,
        details: `请输入有效的${field}值`
      });
      return false;
    }

    if (type === 'number' && value !== null && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        addError({
          type: 'validation',
          message: `${field}必须是数字`,
          details: `当前值: ${value}`
        });
        return false;
      }

      if (min !== undefined && numValue < min) {
        addError({
          type: 'validation',
          message: `${field}不能小于 ${min}`,
          details: `当前值: ${numValue}`
        });
        return false;
      }

      if (max !== undefined && numValue > max) {
        addError({
          type: 'validation',
          message: `${field}不能大于 ${max}`,
          details: `当前值: ${numValue}`
        });
        return false;
      }
    }

    return true;
  }, [addError]);

  // 计算错误处理
  const handleCalculationError = useCallback((error: Error, context: string) => {
    console.error(`计算错误 [${context}]:`, error);

    if (error.name === 'RangeError') {
      addError({
        type: 'calculation',
        message: '计算结果超出范围',
        details: `在${context}过程中发生数值溢出，请调整输入参数`
      });
    } else if (error.message?.includes('out of memory')) {
      addError({
        type: 'calculation',
        message: '显存需求过大',
        details: '当前配置所需显存超出合理范围，建议调整模型参数或启用优化选项'
      });
    } else {
      addError({
        type: 'calculation',
        message: '计算异常',
        details: `${context}: ${error.message || '未知错误'}`
      });
    }
  }, [addError]);

  // 网络错误处理
  const handleNetworkError = useCallback((error: Error & { status?: number }, operation: string) => {
    console.error(`网络错误 [${operation}]:`, error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      addError({
        type: 'network',
        message: '网络连接失败',
        details: `无法完成${operation}，请检查网络连接`
      });
    } else if (error.status === 404) {
      addError({
        type: 'network',
        message: '资源不存在',
        details: `${operation}请求的资源未找到`
      });
    } else if (error.status && error.status >= 500) {
      addError({
        type: 'network',
        message: '服务器错误',
        details: `${operation}时服务器响应异常 (${error.status})`
      });
    } else {
      addError({
        type: 'network',
        message: '操作失败',
        details: `${operation}: ${error.message || '未知网络错误'}`
      });
    }
  }, [addError]);

  return {
    errors: errorState.errors,
    hasError: errorState.hasError,
    addError,
    removeError,
    clearAllErrors,
    resolveError,
    validateInput,
    handleCalculationError,
    handleNetworkError
  };
} 