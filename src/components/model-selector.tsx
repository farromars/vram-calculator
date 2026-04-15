'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomModelForm } from '@/components/custom-model-form';
import { getModelById, getModelsByCategoryArchitectureAndVendor, getModelsByArchitectureAndVendor, getVendorsForArchitecture } from '@/lib/models-data';
import { useCalculatorStore } from '@/store/calculator-store';
import { ModelInfo, ModelVendor } from '@/types';

type ArchCategory = 'nlp' | 'multimodal';

interface ModelSelectorProps {
  /** 当前选中的 modelId */
  value: string;
  /** 模型切换回调 */
  onChange: (modelId: string) => void;
  /** 架构类型，决定加载哪类模型 */
  arch?: ArchCategory;
  /** 主题色，用于供应商按钮激活态，默认 green */
  accentColor?: 'green' | 'blue' | 'purple' | 'cyan';
  /** 是否按参数量分组（微调用），默认 false（按系列分组） */
  groupBySize?: boolean;
}

const COLOR_MAP = {
  green:  { active: 'bg-green-500/20 text-green-400 border-green-500/40',  tab: 'bg-green-500/20 text-green-400' },
  blue:   { active: 'bg-blue-500/20 text-blue-400 border-blue-500/40',    tab: 'bg-blue-500/20 text-blue-400' },
  purple: { active: 'bg-purple-500/20 text-purple-400 border-purple-500/40', tab: 'bg-purple-500/20 text-purple-400' },
  cyan:   { active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',    tab: 'bg-cyan-500/20 text-cyan-400' },
};

export function ModelSelector({
  value,
  onChange,
  arch = 'nlp',
  accentColor = 'green',
  groupBySize = false,
}: ModelSelectorProps) {
  const { savedCustomModels } = useCalculatorStore();

  // 当前 modelId 是否来自自定义列表
  const isCustomSelected = useMemo(
    () => savedCustomModels.some(m => m.id === value),
    [savedCustomModels, value]
  );

  // 页签：preset / custom
  const [tab, setTab] = useState<'preset' | 'custom'>(isCustomSelected ? 'custom' : 'preset');

  // 供应商
  const vendors = useMemo(() => getVendorsForArchitecture(arch), [arch]);
  const initialVendor = useMemo((): ModelVendor => {
    const m = getModelById(value);
    return (m?.vendor as ModelVendor) || vendors[0] || 'DeepSeek';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedVendor, setSelectedVendor] = useState<ModelVendor>(initialVendor);

  // 按供应商分组模型
  const modelsByCategory = useMemo(() => {
    if (groupBySize) {
      const list = getModelsByArchitectureAndVendor(arch, selectedVendor);
      return {
        '小型 (≤3B)': list.filter(m => m.params <= 3),
        '中型 (3–15B)': list.filter(m => m.params > 3 && m.params <= 15),
        '大型 (15–50B)': list.filter(m => m.params > 15 && m.params <= 50),
        '超大 (>50B)': list.filter(m => m.params > 50),
      };
    }
    return getModelsByCategoryArchitectureAndVendor(arch, selectedVendor);
  }, [arch, selectedVendor, groupBySize]);

  // 当前选中模型信息
  const selectedModel = useMemo(() => {
    const db = getModelById(value);
    if (db) return db;
    return savedCustomModels.find(m => m.id === value) ?? null;
  }, [value, savedCustomModels]);

  const colors = COLOR_MAP[accentColor];

  const handleCustomSelect = (model: ModelInfo) => {
    onChange(model.id);
    // 不切换页签，保持在自定义模型视图，避免切到预设页签后下拉框显示空白
  };

  return (
    <div className="space-y-3">
      {/* 页签：预设模型 / 自定义模型 */}
      <div className="flex gap-0 mb-1 rounded-xl overflow-hidden border border-white/20">
        <button
          onClick={() => setTab('preset')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${
            tab === 'preset'
              ? `${colors.tab} border-b-2 border-current`
              : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
          }`}
        >
          预设模型
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${
            tab === 'custom'
              ? 'bg-primary/20 text-primary dark:text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
          }`}
        >
          自定义模型
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── 预设模型 ── */}
        {tab === 'preset' && (
          <motion.div
            key="preset"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {/* 供应商筛选 */}
            <div className="flex flex-wrap gap-1.5">
              {vendors.map(vendor => (
                <button
                  key={vendor}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    selectedVendor === vendor
                      ? colors.active
                      : 'bg-white/5 text-foreground/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {vendor}
                </button>
              ))}
            </div>

            {/* 模型下拉 */}
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Object.entries(modelsByCategory)
                  .filter(([, models]) => models.length > 0)
                  .map(([category, models]) => (
                    <div key={category}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                        {category}
                      </div>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.params}B)
                        </SelectItem>
                      ))}
                    </div>
                  ))}
              </SelectContent>
            </Select>

            {/* 模型信息卡 */}
            {selectedModel && (
              <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-xs space-y-1">
                {selectedModel.isCustom && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                      自定义
                    </span>
                    <span className="text-muted-foreground">{selectedModel.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">参数量：</span>
                  <span className="font-mono">{selectedModel.params}B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">隐藏层维度：</span>
                  <span className="font-mono">{selectedModel.hiddenSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">层数：</span>
                  <span className="font-mono">{selectedModel.numLayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">注意力头数：</span>
                  <span className="font-mono">{selectedModel.numHeads}</span>
                </div>
                {selectedModel.numKVHeads && selectedModel.numKVHeads !== selectedModel.numHeads && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KV 头数（GQA）：</span>
                    <span className="font-mono">{selectedModel.numKVHeads}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── 自定义模型 ── */}
        {tab === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
          >
            <CustomModelForm onSelect={handleCustomSelect} accentColor={accentColor} arch={arch} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
