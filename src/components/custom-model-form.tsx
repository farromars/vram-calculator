'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Tag, PenLine } from 'lucide-react';
import { useCalculatorStore } from '@/store/calculator-store';
import {
  validateCustomModel,
  estimateParams,
  draftToModelInfo,
  modelInfoToDraft,
} from '@/utils/custom-model-validator';
import { ModelInfo, CustomModelDraft } from '@/types';

interface CustomModelFormProps {
  onSelect: (model: ModelInfo) => void;
}

const ARCH_OPTIONS = [
  { value: 'transformer', label: 'Transformer（标准）' },
  { value: 'moe', label: 'MoE（混合专家）' },
  { value: 'glm', label: 'GLM' },
];

const ERROR_MESSAGES: Record<string, string> = {
  errorName: '请输入模型名称',
  errorParams: '参数量必须为正数',
  errorHiddenSize: '隐藏层维度必须为正整数',
  errorNumLayers: '层数必须为正整数',
  errorNumHeads: '注意力头数必须为正整数',
  errorVocabSize: '词表大小必须为正整数',
  errorNumKVHeads: 'KV 头数必须为正整数且不大于注意力头数',
  errorActiveParams: 'MoE 激活参数量必须为正数且不大于总参数量',
};

function FieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function CustomModelForm({ onSelect }: CustomModelFormProps) {
  const {
    savedCustomModels,
    customModelDraft: draft,
    setCustomModelDraft,
    resetCustomModelDraft,
    addCustomModel,
    removeCustomModel,
  } = useCalculatorStore();

  const [touched, setTouched] = useState<Partial<Record<keyof CustomModelDraft, boolean>>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<ModelInfo | null>(null);
  // 'saved'：展示已保存列表；'new'：展示新建表单
  const [view, setView] = useState<'saved' | 'new'>(
    savedCustomModels.length > 0 ? 'saved' : 'new'
  );

  const validation = useMemo(() => validateCustomModel(draft), [draft]);

  const errorFor = (field: keyof CustomModelDraft): string | undefined => {
    if (!touched[field]) return undefined;
    const err = validation.errors.find(e => e.field === field);
    return err ? ERROR_MESSAGES[err.message] : undefined;
  };

  const markAllTouched = () => {
    const all = Object.keys(draft).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof CustomModelDraft, boolean>
    );
    setTouched(all);
  };

  const handleChange = (field: keyof CustomModelDraft, value: string) => {
    setCustomModelDraft({ [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const estimatedParams = useMemo(() => {
    const h = parseInt(draft.hiddenSize, 10);
    const l = parseInt(draft.numLayers, 10);
    const v = parseInt(draft.vocabSize, 10);
    if (h > 0 && l > 0 && v > 0) return estimateParams(h, l, v);
    return null;
  }, [draft.hiddenSize, draft.numLayers, draft.vocabSize]);

  const handleUse = () => {
    markAllTouched();
    if (!validation.valid) return;
    const id = editingModel?.id ?? `custom-${Date.now()}`;
    const model = draftToModelInfo(draft, id);
    onSelect(model);
  };

  const handleSave = () => {
    markAllTouched();
    if (!validation.valid) return;
    const id = editingModel?.id ?? `custom-${Date.now()}`;
    const model = draftToModelInfo(draft, id);
    addCustomModel(model);
    resetCustomModelDraft();
    setTouched({});
    setEditingModel(null);
    setView('saved');
  };

  const handleSelectSaved = (model: ModelInfo) => {
    onSelect(model);
  };

  const handleEditSaved = (model: ModelInfo) => {
    const d = modelInfoToDraft(model);
    setCustomModelDraft(d);
    setTouched({});
    setEditingModel(model);
    setView('new');
  };

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      removeCustomModel(id);
      setDeleteConfirmId(null);
      if (savedCustomModels.length <= 1) setView('new');
    } else {
      setDeleteConfirmId(id);
    }
  };

  const handleNewModel = () => {
    resetCustomModelDraft();
    setTouched({});
    setEditingModel(null);
    setView('new');
  };

  const inputCls = (field: keyof CustomModelDraft) =>
    `w-full px-3 py-2 text-sm text-foreground bg-white/10 border rounded-lg focus:outline-none focus:ring-1 transition-all placeholder:text-muted-foreground ${
      errorFor(field)
        ? 'border-red-500/60 focus:ring-red-500/40'
        : 'border-white/20 focus:ring-blue-500/40 focus:border-blue-500/40'
    }`;

  return (
    <div className="space-y-3">
      {/* 已保存 / 新建 内部切换（当有已保存模型时显示） */}
      {savedCustomModels.length > 0 && (
        <div className="flex gap-0 rounded-lg overflow-hidden border border-white/20">
          <button
            onClick={() => setView('saved')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${
              view === 'saved'
                ? 'bg-blue-500/20 text-blue-400 dark:text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
            }`}
          >
            已保存（{savedCustomModels.length}）
          </button>
          <button
            onClick={handleNewModel}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${
              view === 'new'
                ? 'bg-amber-500/20 text-amber-400 dark:text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
            }`}
          >
            + 新建模型
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── 已保存列表 ── */}
        {view === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {savedCustomModels.map(model => (
              <div
                key={model.id}
                className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{model.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 border border-blue-500/30 shrink-0">
                      自定义
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {model.params}B · {model.architecture.toUpperCase()} · {model.hiddenSize}d · {model.numLayers}层
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEditSaved(model)}
                    className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    title="编辑"
                  >
                    <PenLine className="w-3 h-3" />
                  </button>
                  {deleteConfirmId === model.id ? (
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      确认删除
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectSaved(model)}
                    className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-500 border border-blue-500/30 hover:bg-blue-500/30 transition-colors font-medium"
                  >
                    使用
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── 新建 / 编辑表单 ── */}
        {view === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {editingModel && (
              <div className="text-xs text-primary flex items-center gap-1">
                <PenLine className="w-3 h-3" />
                正在编辑：{editingModel.name}
              </div>
            )}

            {/* 模型名称 */}
            <FieldRow label="模型名称" error={errorFor('name')}>
              <input
                type="text"
                className={inputCls('name')}
                placeholder="例如：MyLLM-13B"
                value={draft.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </FieldRow>

            {/* 架构类型 */}
            <FieldRow label="架构类型">
              <div className="flex gap-2">
                {ARCH_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleChange('architecture', opt.value)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                      draft.architecture === opt.value
                        ? 'bg-blue-500/20 text-primary border-blue-500/40'
                        : 'bg-white/5 text-foreground border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FieldRow>

            {/* 参数量 + 层数 */}
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="参数量 (B)" error={errorFor('params')}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputCls('params')}
                  placeholder="例如：13"
                  value={draft.params}
                  onChange={e => handleChange('params', e.target.value)}
                />
              </FieldRow>
              <FieldRow label="层数" error={errorFor('numLayers')}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputCls('numLayers')}
                  placeholder="例如：40"
                  value={draft.numLayers}
                  onChange={e => handleChange('numLayers', e.target.value)}
                />
              </FieldRow>
            </div>

            {/* 隐藏层维度 + 注意力头数 */}
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="隐藏层维度" error={errorFor('hiddenSize')}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputCls('hiddenSize')}
                  placeholder="例如：5120"
                  value={draft.hiddenSize}
                  onChange={e => handleChange('hiddenSize', e.target.value)}
                />
              </FieldRow>
              <FieldRow label="注意力头数" error={errorFor('numHeads')}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputCls('numHeads')}
                  placeholder="例如：40"
                  value={draft.numHeads}
                  onChange={e => handleChange('numHeads', e.target.value)}
                />
              </FieldRow>
            </div>

            {/* 词表大小 + KV 头数 */}
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="词表大小" error={errorFor('vocabSize')}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputCls('vocabSize')}
                  placeholder="例如：32000"
                  value={draft.vocabSize}
                  onChange={e => handleChange('vocabSize', e.target.value)}
                />
              </FieldRow>
              <FieldRow label="KV 头数（GQA，选填）" error={errorFor('numKVHeads')}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputCls('numKVHeads')}
                  placeholder="默认与注意力头数相同"
                  value={draft.numKVHeads}
                  onChange={e => handleChange('numKVHeads', e.target.value)}
                />
              </FieldRow>
            </div>

            {/* MoE 激活参数（仅 moe） */}
            <AnimatePresence>
              {draft.architecture === 'moe' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <FieldRow label="MoE 激活参数量 (B)" error={errorFor('activeParams')}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className={inputCls('activeParams')}
                      placeholder="例如：13（仅 MoE 架构）"
                      value={draft.activeParams}
                      onChange={e => handleChange('activeParams', e.target.value)}
                    />
                  </FieldRow>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 估算参数量提示 */}
            {estimatedParams !== null && estimatedParams > 0 && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                <Tag className="w-3 h-3 shrink-0" />
                <span>
                  估算参数量：<span className="font-mono font-semibold">{estimatedParams}B</span>
                  {draft.params && Math.abs(estimatedParams - parseFloat(draft.params)) > 1 && (
                    <span className="text-warning ml-1">（与填写值相差较大，请确认）</span>
                  )}
                </span>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  resetCustomModelDraft();
                  setTouched({});
                  setEditingModel(null);
                  // 仅清空表单，不跳转到已保存列表
                }}
                className="flex-1 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
              >
                重置
              </button>
              <button
                onClick={handleSave}
                disabled={savedCustomModels.length >= 10}
                className="flex items-center justify-center gap-1.5 flex-1 py-2 text-xs rounded-lg bg-white/10 border border-white/20 text-foreground hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title={savedCustomModels.length >= 10 ? '最多保存 10 个自定义模型' : undefined}
              >
                <Save className="w-3 h-3" />
                保存为常用
              </button>
              <button
                onClick={handleUse}
                className="flex-1 py-2 text-xs rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-all font-medium"
              >
                使用此配置
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
