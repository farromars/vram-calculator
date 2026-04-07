'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/store/calculator-store';
import { X, Settings, Lightbulb, Save, RotateCcw, Download, Upload } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { preferences, setPreferences, clearHistory, clearCompare } = useCalculatorStore();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    setPreferences(localPrefs);
    onClose();
  };

  const handleReset = () => {
    const defaultPrefs = {
      autoSave: true,
      showOptimizationTips: true,
      defaultPrecision: 'FP16' as const,
      theme: 'auto' as const
    };
    setLocalPrefs(defaultPrefs);
    setPreferences(defaultPrefs);
  };

  const exportSettings = () => {
    const data = {
      preferences: localPrefs,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-memory-calculator-settings-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.preferences) {
          setLocalPrefs(data.preferences);
        }
      } catch {
        alert('导入设置文件失败：格式错误');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-2xl font-bold">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="glass-button !p-2 hover:bg-red-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 计算设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              计算设置
            </h3>
            
            <div className="space-y-4 pl-4">
              {/* 默认精度 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">默认精度</label>
                  <p className="text-sm text-gray-600">新建计算器时的默认精度设置</p>
                </div>
                <select
                  value={localPrefs.defaultPrecision}
                  onChange={(e) => setLocalPrefs({
                    ...localPrefs,
                    defaultPrecision: e.target.value as 'FP32' | 'FP16' | 'BF16'
                  })}
                  className="glass-input w-24 !py-2"
                >
                  <option value="FP32">FP32</option>
                  <option value="FP16">FP16</option>
                  <option value="BF16">BF16</option>
                </select>
              </div>

              {/* 自动保存 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">自动保存</label>
                  <p className="text-sm text-gray-600">计算完成后自动保存到历史记录</p>
                </div>
                <button
                  onClick={() => setLocalPrefs({
                    ...localPrefs,
                    autoSave: !localPrefs.autoSave
                  })}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    localPrefs.autoSave 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    localPrefs.autoSave ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* 优化提示 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    优化提示
                  </label>
                  <p className="text-sm text-gray-600">显示GPU选择和内存优化建议</p>
                </div>
                <button
                  onClick={() => setLocalPrefs({
                    ...localPrefs,
                    showOptimizationTips: !localPrefs.showOptimizationTips
                  })}
                  className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    localPrefs.showOptimizationTips 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    localPrefs.showOptimizationTips ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* 界面设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              界面设置
            </h3>
            
            <div className="space-y-4 pl-4">
              {/* 主题 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">主题</label>
                  <p className="text-sm text-gray-600">选择界面主题风格</p>
                </div>
                <select
                  value={localPrefs.theme}
                  onChange={(e) => setLocalPrefs({
                    ...localPrefs,
                    theme: e.target.value as 'light' | 'dark' | 'auto'
                  })}
                  className="glass-input w-24 !py-2"
                >
                  <option value="auto">自动</option>
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>
            </div>
          </div>

          {/* 数据管理 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              数据管理
            </h3>
            
            <div className="space-y-4 pl-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={clearHistory}
                  className="glass-button !justify-start gap-2 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                  清空历史记录
                </button>
                <button
                  onClick={clearCompare}
                  className="glass-button !justify-start gap-2 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                  清空对比列表
                </button>
              </div>
            </div>
          </div>

          {/* 导入导出 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              导入导出
            </h3>
            
            <div className="space-y-4 pl-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={exportSettings}
                  className="glass-button !justify-start gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出设置
                </button>
                <label className="glass-button !justify-start gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  导入设置
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-white/20">
          <button
            onClick={handleReset}
            className="glass-button !justify-start gap-2 hover:bg-yellow-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            重置为默认
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="glass-button"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="glass-button bg-blue-500/30 hover:bg-blue-500/50 gap-2"
            >
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 