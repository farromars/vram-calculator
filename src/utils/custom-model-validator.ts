import { CustomModelDraft, ModelInfo } from '@/types';

export interface ValidationError {
  field: keyof CustomModelDraft;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/** 验证自定义模型草稿，返回所有字段的错误列表 */
export function validateCustomModel(draft: CustomModelDraft): ValidationResult {
  const errors: ValidationError[] = [];

  if (!draft.name.trim()) {
    errors.push({ field: 'name', message: 'errorName' });
  }

  const params = parseFloat(draft.params);
  if (!draft.params || isNaN(params) || params <= 0) {
    errors.push({ field: 'params', message: 'errorParams' });
  }

  const hiddenSize = parseInt(draft.hiddenSize, 10);
  if (!draft.hiddenSize || isNaN(hiddenSize) || hiddenSize <= 0 || !Number.isInteger(hiddenSize)) {
    errors.push({ field: 'hiddenSize', message: 'errorHiddenSize' });
  }

  const numLayers = parseInt(draft.numLayers, 10);
  if (!draft.numLayers || isNaN(numLayers) || numLayers <= 0 || !Number.isInteger(numLayers)) {
    errors.push({ field: 'numLayers', message: 'errorNumLayers' });
  }

  const numHeads = parseInt(draft.numHeads, 10);
  if (!draft.numHeads || isNaN(numHeads) || numHeads <= 0 || !Number.isInteger(numHeads)) {
    errors.push({ field: 'numHeads', message: 'errorNumHeads' });
  }

  const vocabSize = parseInt(draft.vocabSize, 10);
  if (!draft.vocabSize || isNaN(vocabSize) || vocabSize <= 0 || !Number.isInteger(vocabSize)) {
    errors.push({ field: 'vocabSize', message: 'errorVocabSize' });
  }

  // KV 头数（选填）
  if (draft.numKVHeads.trim()) {
    const numKVHeads = parseInt(draft.numKVHeads, 10);
    if (isNaN(numKVHeads) || numKVHeads <= 0 || !Number.isInteger(numKVHeads)) {
      errors.push({ field: 'numKVHeads', message: 'errorNumKVHeads' });
    } else if (!isNaN(numHeads) && numKVHeads > numHeads) {
      errors.push({ field: 'numKVHeads', message: 'errorNumKVHeads' });
    }
  }

  // MoE 激活参数量（仅 MoE 时选填）
  if (draft.architecture === 'moe' && draft.activeParams.trim()) {
    const activeParams = parseFloat(draft.activeParams);
    if (isNaN(activeParams) || activeParams <= 0) {
      errors.push({ field: 'activeParams', message: 'errorActiveParams' });
    } else if (!isNaN(params) && activeParams > params) {
      errors.push({ field: 'activeParams', message: 'errorActiveParams' });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 根据标准 Transformer 公式估算参数量（十亿）
 * Params ≈ (12 × numLayers × hiddenSize²) + (2 × vocabSize × hiddenSize)
 */
export function estimateParams(
  hiddenSize: number,
  numLayers: number,
  vocabSize: number
): number {
  if (hiddenSize <= 0 || numLayers <= 0 || vocabSize <= 0) return 0;
  const total =
    12 * numLayers * hiddenSize * hiddenSize +
    2 * vocabSize * hiddenSize;
  return parseFloat((total / 1e9).toFixed(2));
}

/** 将合法的草稿转换为 ModelInfo 对象 */
export function draftToModelInfo(draft: CustomModelDraft, id: string): ModelInfo {
  const numKVHeads = draft.numKVHeads.trim()
    ? parseInt(draft.numKVHeads, 10)
    : undefined;
  const activeParams = draft.architecture === 'moe' && draft.activeParams.trim()
    ? parseFloat(draft.activeParams)
    : undefined;

  return {
    id,
    name: draft.name.trim(),
    params: parseFloat(draft.params),
    architecture: draft.architecture,
    hiddenSize: parseInt(draft.hiddenSize, 10),
    numLayers: parseInt(draft.numLayers, 10),
    numHeads: parseInt(draft.numHeads, 10),
    numKVHeads,
    vocabSize: parseInt(draft.vocabSize, 10),
    activeParams,
    isCustom: true,
  };
}

/** 将 ModelInfo 反向转为草稿（用于编辑已保存的自定义模型） */
export function modelInfoToDraft(model: ModelInfo): CustomModelDraft {
  return {
    name: model.name,
    architecture: model.architecture,
    params: String(model.params),
    hiddenSize: String(model.hiddenSize),
    numLayers: String(model.numLayers),
    numHeads: String(model.numHeads),
    numKVHeads: model.numKVHeads != null ? String(model.numKVHeads) : '',
    vocabSize: String(model.vocabSize),
    activeParams: model.activeParams != null ? String(model.activeParams) : '',
  };
}

export const EMPTY_DRAFT: CustomModelDraft = {
  name: '',
  architecture: 'transformer',
  params: '',
  hiddenSize: '',
  numLayers: '',
  numHeads: '',
  numKVHeads: '',
  vocabSize: '',
  activeParams: '',
};
