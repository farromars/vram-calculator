"use client"

import { useEffect, useRef, useCallback } from 'react';

export function useWebWorker<T, R>(workerPath: string) {
  const workerRef = useRef<Worker | null>(null);
  const callbackRef = useRef<((result: R) => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Worker) {
      workerRef.current = new Worker(workerPath);
      
      workerRef.current.onmessage = (e) => {
        if (e.data.success && callbackRef.current) {
          callbackRef.current(e.data.result);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerPath]);

  const postMessage = useCallback((data: T, callback: (result: R) => void) => {
    if (workerRef.current) {
      callbackRef.current = callback;
      workerRef.current.postMessage(data);
    } else {
      // Fallback for environments without Worker support
      console.warn('Web Worker not supported, falling back to main thread');
      // 这里应该调用主线程的计算函数
    }
  }, []);

  return { postMessage };
}