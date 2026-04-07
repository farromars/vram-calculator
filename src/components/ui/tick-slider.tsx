'use client';

/**
 * TickSlider - 带可点击刻度的滑块组件
 * 
 * 设计参考 GPU 数量滑块：
 * - 上方：原生 range 滑块（可拖拽）
 * - 下方：可点击按钮刻度（点击直接跳到该值）
 * - 刻度对齐滑块轨道（使用百分比定位确保精准对齐）
 */

import React from 'react';

export interface TickMark {
  value: number;
  label: string;
}

interface TickSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  ticks: TickMark[];
  className?: string;
}

export function TickSlider({ value, onChange, min, max, step, ticks, className = '' }: TickSliderProps) {
  const getPercent = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* 原生 range 滑块 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand"
      />

      {/* 可点击刻度按钮 */}
      <div className="relative h-7">
        {ticks.map((tick) => {
          const pct = getPercent(tick.value);
          const isActive = value === tick.value;
          // 对第一个和最后一个刻度做偏移补偿，避免溢出
          let transform = 'translateX(-50%)';
          if (pct === 0) transform = 'translateX(0%)';
          if (pct === 100) transform = 'translateX(-100%)';

          return (
            <button
              key={tick.value}
              onClick={() => onChange(tick.value)}
              style={{ left: `${pct}%`, transform }}
              className={`absolute top-0 px-1.5 py-0.5 rounded text-xs font-mono transition-all ${
                isActive
                  ? 'bg-brand text-white font-semibold shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tick.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
