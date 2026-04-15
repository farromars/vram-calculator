'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Tag, PenLine, Link, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useCalculatorStore } from '@/store/calculator-store';
import {
  validateCustomModel,
  estimateParams,
  draftToModelInfo,
  modelInfoToDraft,
} from '@/utils/custom-model-validator';
import { ModelInfo, CustomModelDraft } from '@/types';

// URL 导入状态
type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

interface ImportResult {
  status: ImportStatus;
  message?: string;
  source?: 'huggingface' | 'modelscope';
  isMultimodal?: boolean;
  meta?: { numExperts?: number | null; numActiveExperts?: number | null; modelType?: string };
}

interface CustomModelFormProps {
  onSelect: (model: ModelInfo) => void;
  /** 跟随父页面的主题色，默认 primary */
  accentColor?: 'green' | 'blue' | 'purple' | 'cyan';
  /** 当前页面的架构类型，用于多模态模型导入警告 */
  arch?: 'nlp' | 'multimodal';
}

// URL 来源徽章颜色（亮色主题适配）
const SOURCE_BADGE: Record<string, { cls: string; label: string }> = {
  huggingface: { cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'HuggingFace' },
  modelscope:  { cls: 'bg-blue-100 text-blue-800 border-blue-300',       label: 'ModelScope'  },
};

// 跟随 accentColor 的颜色配置
const ACCENT_COLOR_MAP = {
  green:  {
    btn:         'bg-green-50 text-green-700 border-green-400',
    btnOpen:     'bg-green-50 text-green-700 border-green-400',
    importBtn:   'bg-green-600 text-white border-green-700 hover:bg-green-700',
    focusRing:   'focus:ring-green-400/50 focus:border-green-500',
    successBg:   'bg-green-50 border-green-300',
    successText: 'text-green-800',
    successSub:  'text-green-700',
    successHint: 'text-green-600',
    successIcon: 'text-green-600',
  },
  blue:   {
    btn:         'bg-blue-50 text-blue-700 border-blue-400',
    btnOpen:     'bg-blue-50 text-blue-700 border-blue-400',
    importBtn:   'bg-blue-600 text-white border-blue-700 hover:bg-blue-700',
    focusRing:   'focus:ring-blue-400/50 focus:border-blue-500',
    successBg:   'bg-blue-50 border-blue-300',
    successText: 'text-blue-800',
    successSub:  'text-blue-700',
    successHint: 'text-blue-600',
    successIcon: 'text-blue-600',
  },
  purple: {
    btn:         'bg-purple-50 text-purple-700 border-purple-400',
    btnOpen:     'bg-purple-50 text-purple-700 border-purple-400',
    importBtn:   'bg-purple-600 text-white border-purple-700 hover:bg-purple-700',
    focusRing:   'focus:ring-purple-400/50 focus:border-purple-500',
    successBg:   'bg-purple-50 border-purple-300',
    successText: 'text-purple-800',
    successSub:  'text-purple-700',
    successHint: 'text-purple-600',
    successIcon: 'text-purple-600',
  },
  cyan:   {
    btn:         'bg-cyan-50 text-cyan-700 border-cyan-400',
    btnOpen:     'bg-cyan-50 text-cyan-700 border-cyan-400',
    importBtn:   'bg-cyan-600 text-white border-cyan-700 hover:bg-cyan-700',
    focusRing:   'focus:ring-cyan-400/50 focus:border-cyan-500',
    successBg:   'bg-cyan-50 border-cyan-300',
    successText: 'text-cyan-800',
    successSub:  'text-cyan-700',
    successHint: 'text-cyan-600',
    successIcon: 'text-cyan-600',
  },
};

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

export function CustomModelForm({ onSelect, accentColor = 'green', arch = 'nlp' }: CustomModelFormProps) {
  const {
    savedCustomModels,
    customModelDraft: draft,
    setCustomModelDraft,
    resetCustomModelDraft,
    addCustomModel,
    removeCustomModel,
  } = useCalculatorStore();

  const ac = ACCENT_COLOR_MAP[accentColor];

  const [touched, setTouched] = useState<Partial<Record<keyof CustomModelDraft, boolean>>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<ModelInfo | null>(null);
  const [view, setView] = useState<'saved' | 'new'>(
    savedCustomModels.length > 0 ? 'saved' : 'new'
  );

  // URL 导入状态
  const [urlInput, setUrlInput] = useState('');
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>({ status: 'idle' });

  const handleUrlImport = useCallback(async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImportResult({ status: 'loading' });
    try {
      const res = await fetch('/api/import-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setImportResult({ status: 'error', message: data.error ?? '导入失败，请重试' });
        return;
      }
      setCustomModelDraft(data.draft);
      setTouched({});
      setEditingModel(null);
      setImportResult({
        status: 'success',
        source: data.source,
        isMultimodal: data.isMultimodal,
        message: `已从 ${data.modelId} 导入参数`,
        meta: data.meta,
      });
      setView('new');
    } catch {
      setImportResult({ status: 'error', message: '网络错误，请检查连接后重试' });
    }
  }, [urlInput, setCustomModelDraft]);

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUrlImport();
    if (e.key === 'Escape') {
      setShowUrlImport(false);
      setImportResult({ status: 'idle' });
    }
  };

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
      {/* ── URL 导入入口 ── */}
      <div className="space-y-2">
        <button
          onClick={() => {
            setShowUrlImport(v => !v);
            if (showUrlImport) setImportResult({ status: 'idle' });
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-all ${
            showUrlImport
              ? ac.btnOpen
              : 'bg-secondary text-foreground border-border hover:border-primary hover:text-primary hover:bg-primary/5'
          }`}
        >
          <Link className="w-4 h-4" />
          从 HuggingFace / ModelScope 链接导入
        </button>

        <AnimatePresence>
          {showUrlImport && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => {
                      setUrlInput(e.target.value);
                      if (importResult.status !== 'idle') setImportResult({ status: 'idle' });
                    }}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="粘贴模型页 URL，例如 https://huggingface.co/Qwen/Qwen3-8B"
                    className={`flex-1 px-3 py-2 text-sm text-foreground bg-background border border-border rounded-lg focus:outline-none focus:ring-2 placeholder:text-muted-foreground ${ac.focusRing}`}
                    autoFocus
                  />
                  {urlInput && (
                    <button
                      onClick={() => { setUrlInput(''); setImportResult({ status: 'idle' }); }}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleUrlImport}
                    disabled={!urlInput.trim() || importResult.status === 'loading'}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm ${ac.importBtn}`}
                  >
                    {importResult.status === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      '导入'
                    )}
                  </button>
                </div>

                {/* 导入结果提示 */}
                <AnimatePresence>
                  {importResult.status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex flex-col gap-2 p-3 border rounded-lg ${ac.successBg}`}
                    >
                      {/* 成功主信息 */}
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${ac.successIcon}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${ac.successText}`}>{importResult.message}</span>
                            {importResult.source && SOURCE_BADGE[importResult.source] && (
                              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${SOURCE_BADGE[importResult.source].cls}`}>
                                {SOURCE_BADGE[importResult.source].label}
                              </span>
                            )}
                          </div>
                          {importResult.meta?.modelType && (
                            <div className={`text-xs mt-1 ${ac.successSub}`}>
                              model_type: <span className="font-mono font-medium">{importResult.meta.modelType}</span>
                              {importResult.meta.numExperts != null && (
                                <> · {importResult.meta.numExperts} 专家
                                {importResult.meta.numActiveExperts != null && <>（激活 {importResult.meta.numActiveExperts}）</>}</>
                              )}
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${ac.successHint}`}>参数已填入下方表单，确认后点击「使用」或「保存为常用」</div>
                        </div>
                      </div>

                      {/* 多模态架构不匹配警告 */}
                      {importResult.isMultimodal && arch === 'nlp' && (
                        <div className="flex items-start gap-2 px-2.5 py-2 bg-amber-50 border border-amber-300 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-800">
                            <span className="font-semibold">架构提示：</span>该模型为多模态模型，当前页面使用 NLP 计算模式，导入的参数来自其文本骨干（text backbone）。显存估算结果<span className="font-semibold">不含视觉编码器</span>，实际占用会更高。如需完整估算，请在多模态计算器中使用。
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  {importResult.status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-300 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-red-700">{importResult.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
