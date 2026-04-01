import { ModelInfo, GPU, ModelVendor } from '@/types';

/**
 * 主流大模型数据库
 * 涵盖 DeepSeek、Qwen、GLM、Llama、Mistral、Hunyuan 等主流系列
 */
export const MODELS_DATABASE: ModelInfo[] = [
  // ==================== DeepSeek 系列 ====================,
  {
    id: 'deepseek-v3.2',
    name: 'DeepSeek-V3.2',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.2'
  },
  {
    id: 'deepseek-v3.2-angelacc-pd',
    name: 'DeepSeek-V3.2-AngelACC-PD',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.2'
  },
  {
    id: 'deepseek-v3.2-int8-xpu',
    name: 'DeepSeek-V3.2-int8-xpu',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.2'
  },
  {
    id: 'deepseek-v3.2-exp',
    name: 'DeepSeek-V3.2-Exp',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp'
  },
  {
    id: 'deepseek-v3.2-special',
    name: 'DeepSeek-V3.2-Special',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Special'
  },
  {
    id: 'deepseek-r1-0528',
    name: 'DeepSeek-R1-0528',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-0528'
  },
  {
    id: 'deepseek-r1-0528-angelacc',
    name: 'DeepSeek-R1-0528-AngelACC',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-0528'
  },
  {
    id: 'deepseek-r1-0528-angelacc-pd',
    name: 'DeepSeek-R1-0528-AngelACC-PD',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-0528'
  },
  {
    id: 'deepseek-r1-0528-int8-xpu',
    name: 'DeepSeek-R1-0528-int8-xpu',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-0528'
  },
  {
    id: 'deepseek-v3-0324',
    name: 'DeepSeek-V3-0324',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3-0324'
  },
  {
    id: 'deepseek-v3-0324-angelacc',
    name: 'DeepSeek-V3-0324-AngelACC',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3-0324'
  },
  {
    id: 'deepseek-v3-0324-angelacc-pd',
    name: 'DeepSeek-V3-0324-AngelACC-PD',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3-0324'
  },
  {
    id: 'deepseek-v3-0324-int8-xpu',
    name: 'DeepSeek-V3-0324-int8-xpu',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3-0324'
  },
  {
    id: 'deepseek-v3.1',
    name: 'DeepSeek-V3.1',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1'
  },
  {
    id: 'deepseek-v3.1-angelacc',
    name: 'DeepSeek-V3.1-AngelACC',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1'
  },
  {
    id: 'deepseek-v3.1-terminus',
    name: 'DeepSeek-V3.1-Terminus',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus'
  },
  {
    id: 'deepseek-v3.1-terminus-angelacc',
    name: 'DeepSeek-V3.1-Terminus-AngelACC',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus'
  },
  {
    id: 'deepseek-v3.1-terminus-int8-xpu',
    name: 'DeepSeek-V3.1-Terminus-int8-xpu',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus'
  },
  {
    id: 'deepseek-ocr',
    name: 'DeepSeek-OCR',
    params: 8.0,
    architecture: 'multimodal',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 129000,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-OCR'
  },
  {
    id: 'deepseek-prover-v2-7b',
    name: 'DeepSeek-Prover-V2-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 129000,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-Prover-V2-7B'
  },
  {
    id: 'deepseek-prover-v2-671b',
    name: 'DeepSeek-Prover-V2-671B',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-Prover-V2-671B'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1'
  },
  {
    id: 'deepseek-r1-angelacc',
    name: 'DeepSeek-R1-AngelACC',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1'
  },
  {
    id: 'deepseek-r1-angelacc-pd',
    name: 'DeepSeek-R1-AngelACC-PD',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1'
  },
  {
    id: 'deepseek-r1-distill-qwen-1.5b',
    name: 'DeepSeek-R1-Distill-Qwen-1.5B',
    params: 1.5,
    architecture: 'transformer',
    hiddenSize: 1536,
    numLayers: 28,
    numHeads: 12,
    vocabSize: 151643,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B'
  },
  {
    id: 'deepseek-r1-distill-qwen-7b',
    name: 'DeepSeek-R1-Distill-Qwen-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 28,
    numHeads: 28,
    vocabSize: 151643,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'
  },
  {
    id: 'deepseek-r1-distill-qwen-14b',
    name: 'DeepSeek-R1-Distill-Qwen-14B',
    params: 14.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 48,
    numHeads: 40,
    vocabSize: 151643,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B'
  },
  {
    id: 'deepseek-r1-distill-qwen-32b',
    name: 'DeepSeek-R1-Distill-Qwen-32B',
    params: 32.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 64,
    numHeads: 40,
    vocabSize: 151643,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
  },
  {
    id: 'deepseek-r1-distill-qwen-32b-angelacc',
    name: 'DeepSeek-R1-Distill-Qwen-32B-AngelACC',
    params: 32.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 64,
    numHeads: 40,
    vocabSize: 151643,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3'
  },
  {
    id: 'deepseek-v3-angelacc',
    name: 'DeepSeek-V3-AngelACC',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-V3'
  },
  {
    id: 'deepseek-math-v2',
    name: 'DeepSeek-Math-V2',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 128,
    vocabSize: 129000,
    activeParams: 37.0,
    vendor: 'DeepSeek',
    huggingfaceUrl: 'https://huggingface.co/deepseek-ai/DeepSeek-Math-V2'
  },

  // ==================== Kimi 系列 ====================
  {
    id: 'kimi-k2.5',
    name: 'Kimi-K2.5',
    params: 100.0,
    architecture: 'multimodal',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 200000,
    vendor: 'Kimi',
    huggingfaceUrl: 'https://huggingface.co/moonshotai/Kimi-K2.5'
  },
  {
    id: 'kimi-k2.5-w4a8-xpu',
    name: 'Kimi-K2.5-w4a8-xpu',
    params: 100.0,
    architecture: 'multimodal',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 200000,
    vendor: 'Kimi',
    huggingfaceUrl: 'https://huggingface.co/moonshotai/Kimi-K2.5'
  },
  {
    id: 'kimi-k2-instruct',
    name: 'Kimi-K2-Instruct',
    params: 1000.0,
    architecture: 'moe',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 200000,
    activeParams: 32.0,
    vendor: 'Kimi',
    huggingfaceUrl: 'https://huggingface.co/moonshotai/Kimi-K2-Instruct'
  },
  {
    id: 'kimi-k2-thinking',
    name: 'Kimi-K2-Thinking',
    params: 1000.0,
    architecture: 'moe',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 200000,
    activeParams: 32.0,
    vendor: 'Kimi',
    huggingfaceUrl: 'https://huggingface.co/moonshotai/Kimi-K2-THINKING'
  },
  {
    id: 'kimi-k2-instruct-0905',
    name: 'Kimi-K2-Instruct-0905',
    params: 1000.0,
    architecture: 'moe',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 200000,
    activeParams: 32.0,
    vendor: 'Kimi',
    huggingfaceUrl: 'https://huggingface.co/moonshotai/Kimi-K2-Instruct-0905'
  },

  // ==================== GLM 系列 ====================
  {
    id: 'glm-5',
    name: 'GLM-5',
    params: 400.0,
    architecture: 'glm',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-5'
  },
  {
    id: 'glm-5-fp8',
    name: 'GLM-5-FP8',
    params: 400.0,
    architecture: 'glm',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-5-FP8'
  },
  {
    id: 'glm-5-int8-xpu',
    name: 'GLM-5-int8-xpu',
    params: 400.0,
    architecture: 'glm',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-5'
  },
  {
    id: 'glm-4.7',
    name: 'GLM-4.7',
    params: 9.0,
    architecture: 'glm',
    hiddenSize: 4096,
    numLayers: 40,
    numHeads: 32,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-4.7'
  },
  {
    id: 'glm-4.7-fp8',
    name: 'GLM-4.7-FP8',
    params: 9.0,
    architecture: 'glm',
    hiddenSize: 4096,
    numLayers: 40,
    numHeads: 32,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-4.7-FP8'
  },
  {
    id: 'glm-4.7-w8a8-xpu',
    name: 'GLM-4.7-W8A8-xpu',
    params: 9.0,
    architecture: 'glm',
    hiddenSize: 4096,
    numLayers: 40,
    numHeads: 32,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-4.7'
  },
  {
    id: 'glm-4.5v',
    name: 'GLM-4.5V',
    params: 9.0,
    architecture: 'multimodal',
    hiddenSize: 4096,
    numLayers: 40,
    numHeads: 32,
    vocabSize: 151329,
    vendor: 'GLM',
    huggingfaceUrl: 'https://huggingface.co/zai-org/GLM-4.5V'
  },

  // ==================== Qwen 系列 ====================
  {
    id: 'qwen3.5-27b', name: 'Qwen3.5-27B', params: 27.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3.5-27B'
  },
  {
    id: 'qwen3.5-35b-a3b', name: 'Qwen3.5-35B-A3B', params: 35.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3.5-35B-A3B'
  },
  {
    id: 'qwen3.5-122b-a10b', name: 'Qwen3.5-122B-A10B', params: 122.0, architecture: 'multimodal', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 151936, activeParams: 10.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3.5-122B-A10B'
  },
  {
    id: 'qwen3.5-397b-a17b', name: 'Qwen3.5-397B-A17B', params: 397.0, architecture: 'multimodal', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 17.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3.5-397B-A17B'
  },
  {
    id: 'qwen3.5-397b-a17b-fp8', name: 'Qwen3.5-397B-A17B-FP8', params: 397.0, architecture: 'multimodal', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 17.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8'
  },
  {
    id: 'qwen3-omni-30b-a3b-thinking', name: 'Qwen3-Omni-30B-A3B-Thinking', params: 30.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Thinking'
  },
  {
    id: 'qwen3-235b-a22b-instruct-2507', name: 'Qwen3-235B-A22B-Instruct-2507', params: 235.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507'
  },
  {
    id: 'qwen3-235b-a22b-instruct-2507-fp8', name: 'Qwen3-235B-A22B-Instruct-2507-FP8', params: 235.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507-FP8'
  },
  {
    id: 'qwen3-235b-a22b-thinking-2507', name: 'Qwen3-235B-A22B-Thinking-2507', params: 235.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507'
  },
  {
    id: 'qwen3-235b-a22b-thinking-2507-fp8', name: 'Qwen3-235B-A22B-Thinking-2507-FP8', params: 235.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507-FP8'
  },
  {
    id: 'qwen3-30b-a3b-instruct-2507', name: 'Qwen3-30B-A3B-Instruct-2507', params: 30.0, architecture: 'moe', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507'
  },
  { id: 'qwen3-0.6b', name: 'Qwen3-0.6B', params: 0.6, architecture: 'transformer', hiddenSize: 1024, numLayers: 28, numHeads: 16, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-0.6B' },
  { id: 'qwen3-0.6b-fp8', name: 'Qwen3-0.6B-FP8', params: 0.6, architecture: 'transformer', hiddenSize: 1024, numLayers: 28, numHeads: 16, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-0.6B-FP8' },
  { id: 'qwen3-1.7b', name: 'Qwen3-1.7B', params: 1.7, architecture: 'transformer', hiddenSize: 1536, numLayers: 28, numHeads: 12, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-1.7B' },
  { id: 'qwen3-1.7b-fp8', name: 'Qwen3-1.7B-FP8', params: 1.7, architecture: 'transformer', hiddenSize: 1536, numLayers: 28, numHeads: 12, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-1.7B-FP8' },
  { id: 'qwen3-4b', name: 'Qwen3-4B', params: 4.0, architecture: 'transformer', hiddenSize: 2560, numLayers: 36, numHeads: 20, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-4B' },
  { id: 'qwen3-4b-fp8', name: 'Qwen3-4B-FP8', params: 4.0, architecture: 'transformer', hiddenSize: 2560, numLayers: 36, numHeads: 20, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-4B-FP8' },
  { id: 'qwen3-8b', name: 'Qwen3-8B', params: 8.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 36, numHeads: 32, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-8B' },
  { id: 'qwen3-8b-fp8', name: 'Qwen3-8B-FP8', params: 8.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 36, numHeads: 32, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-8B-FP8' },
  { id: 'qwen3-14b', name: 'Qwen3-14B', params: 14.0, architecture: 'transformer', hiddenSize: 5120, numLayers: 48, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-14B' },
  { id: 'qwen3-14b-fp8', name: 'Qwen3-14B-FP8', params: 14.0, architecture: 'transformer', hiddenSize: 5120, numLayers: 48, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-14B-FP8' },
  { id: 'qwen3-30b-a3b', name: 'Qwen3-30B-A3B', params: 30.0, architecture: 'moe', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-30B-A3B' },
  { id: 'qwen3-30b-a3b-fp8', name: 'Qwen3-30B-A3B-FP8', params: 30.0, architecture: 'moe', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8' },
  { id: 'qwen3-32b', name: 'Qwen3-32B', params: 32.0, architecture: 'transformer', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-32B' },
  { id: 'qwen3-32b-fp8', name: 'Qwen3-32B-FP8', params: 32.0, architecture: 'transformer', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-32B-FP8' },
  { id: 'qwen3-235b-a22b', name: 'Qwen3-235B-A22B', params: 235.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-235B-A22B' },
  { id: 'qwen3-235b-a22b-fp8', name: 'Qwen3-235B-A22B-FP8', params: 235.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8' },
  { id: 'qwen3-coder-30b-a3b-instruct', name: 'Qwen3-Coder-30B-A3B-Instruct', params: 30.0, architecture: 'moe', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct' },
  { id: 'qwen3-coder-480b-a35b-instruct', name: 'Qwen3-Coder-480B-A35B-Instruct', params: 480.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 35.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct' },
  { id: 'qwen3-coder-480b-a35b-instruct-fp8', name: 'Qwen3-Coder-480B-A35B-Instruct-FP8', params: 480.0, architecture: 'moe', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 35.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8' },
  { id: 'qwen3-embedding-8b', name: 'Qwen3-Embedding-8B', params: 8.0, architecture: 'embedding', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Embedding-8B' },
  { id: 'qwen3-embedding-8b-gguf', name: 'Qwen3-Embedding-8B-GGUF', params: 8.0, architecture: 'embedding', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Embedding-8B-GGUF' },
  { id: 'qwen3-reranker-8b', name: 'Qwen3-Reranker-8B', params: 8.0, architecture: 'reranker', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Reranker-8B' },
  { id: 'qwen3-vl-8b-instruct', name: 'Qwen3-VL-8B-Instruct', params: 8.3, architecture: 'multimodal', hiddenSize: 4096, numLayers: 28, numHeads: 28, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct' },
  { id: 'qwen3-vl-30b-a3b-instruct', name: 'Qwen3-VL-30B-A3B-Instruct', params: 30.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct' },
  { id: 'qwen3-vl-30b-a3b-instruct-fp8', name: 'Qwen3-VL-30B-A3B-Instruct-FP8', params: 30.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct-FP8' },
  { id: 'qwen3-vl-30b-a3b-thinking', name: 'Qwen3-VL-30B-A3B-Thinking', params: 30.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Thinking' },
  { id: 'qwen3-vl-30b-a3b-thinking-fp8', name: 'Qwen3-VL-30B-A3B-Thinking-FP8', params: 30.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Thinking-FP8' },
  { id: 'qwen3-vl-32b-instruct', name: 'Qwen3-VL-32B-Instruct', params: 32.5, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct' },
  { id: 'qwen3-vl-235b-a22b-instruct', name: 'Qwen3-VL-235B-A22B-Instruct', params: 235.0, architecture: 'multimodal', hiddenSize: 8192, numLayers: 94, numHeads: 64, vocabSize: 151936, activeParams: 22.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct' },
  { id: 'qwen3-next-80b-a3b-instruct', name: 'Qwen3-Next-80B-A3B-Instruct', params: 80.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct' },
  { id: 'qwen3-next-80b-a3b-thinking', name: 'Qwen3-Next-80B-A3B-Thinking', params: 80.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 151936, activeParams: 3.0, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking' },
  { id: 'qwen2.5-vl-7b-instruct', name: 'Qwen2.5-VL-7B-Instruct', params: 8.3, architecture: 'multimodal', hiddenSize: 4096, numLayers: 28, numHeads: 28, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct' },
  { id: 'qwen2.5-vl-32b-instruct', name: 'Qwen2.5-VL-32B-Instruct', params: 32.5, architecture: 'multimodal', hiddenSize: 6400, numLayers: 64, numHeads: 50, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen2.5-VL-32B-Instruct' },
  { id: 'qwen2.5-vl-72b-instruct', name: 'Qwen2.5-VL-72B-Instruct', params: 72.7, architecture: 'multimodal', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct' },
  { id: 'qwen2.5-vl-72b-instruct-awq', name: 'Qwen2.5-VL-72B-Instruct-AWQ', params: 72.7, architecture: 'multimodal', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct-AWQ' },
  { id: 'qwq-32b', name: 'QwQ-32B', params: 32.0, architecture: 'transformer', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 151936, vendor: 'Qwen', huggingfaceUrl: 'https://huggingface.co/Qwen/QwQ-32B' },

  // ==================== Hunyuan 系列 ====================
  { id: 'tairos-embodied-planning-v1', name: 'Tairos-Embodied-Planning-v1', params: 7.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'tairos-embodied-planning-for-guided-tours-v1', name: 'Tairos-Embodied-Planning-for-Guided-Tours-v1', params: 7.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-large-instruct', name: 'Hunyuan-Large-Instruct', params: 389.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 52.0, vendor: 'Hunyuan', huggingfaceUrl: 'https://huggingface.co/tencent/Tencent-Hunyuan-Large' },
  { id: 'hunyuan-a13b-instruct', name: 'Hunyuan-A13B-Instruct', params: 80.0, architecture: 'moe', hiddenSize: 6400, numLayers: 64, numHeads: 50, vocabSize: 100000, activeParams: 13.0, vendor: 'Hunyuan', huggingfaceUrl: 'https://huggingface.co/tencent/Hunyuan-A13B-Instruct' },
  { id: 'hy2.0-406b-a32b-144k-instruct-fp8', name: 'HY2.0-406B-A32B-144k-Instruct-FP8', params: 406.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 32.0, vendor: 'Hunyuan' },
  { id: 'hy2.0-406b-a32b-192k-thinking-fp8', name: 'HY2.0-406B-A32B-192k-Thinking-FP8', params: 406.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 32.0, vendor: 'Hunyuan' },
  { id: 'hunyuan-13b-32k-sft', name: 'Hunyuan-13b-32k-SFT-241021', params: 13.0, architecture: 'transformer', hiddenSize: 5120, numLayers: 40, numHeads: 40, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-2b-256k-sft-v2', name: 'Hunyuan-2b-256k-SFT-V2-241229', params: 2.0, architecture: 'transformer', hiddenSize: 2048, numLayers: 24, numHeads: 16, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-2b-32k-instruct-v2', name: 'Hunyuan-2b-32k-Instruct-V2-250606', params: 2.0, architecture: 'transformer', hiddenSize: 2048, numLayers: 24, numHeads: 16, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-7b-256k-dpo-v2', name: 'Hunyuan-7b-256k-DPO-V2-250117', params: 7.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-7b-256k-instruct-v2-0528', name: 'Hunyuan-7b-256k-Instruct-V2-250528', params: 7.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-7b-256k-instruct-v2-0613', name: 'Hunyuan-7b-256k-Instruct-V2-250613', params: 7.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 100000, vendor: 'Hunyuan' },
  { id: 'hunyuan-7b-256k-instruct-v2-0724', name: 'Hunyuan-7b-256k-Instruct-V2-250724', params: 7.0, architecture: 'transformer', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 100000, vendor: 'Hunyuan', huggingfaceUrl: 'https://huggingface.co/tencent/Hunyuan-7B-Instruct' },
  { id: 'hunyuan-4b-256k-instruct-v2', name: 'hunyuan-4b-256k-Instruct-V2-250721', params: 4.0, architecture: 'transformer', hiddenSize: 2560, numLayers: 36, numHeads: 20, vocabSize: 100000, vendor: 'Hunyuan', huggingfaceUrl: 'https://huggingface.co/tencent/Hunyuan-4B-Instruct' },
  { id: 'hunyuan-a3b-moe-64k', name: 'Hunyuan-A3B-MoE-64K-250930', params: 30.0, architecture: 'moe', hiddenSize: 5120, numLayers: 48, numHeads: 40, vocabSize: 100000, activeParams: 3.0, vendor: 'Hunyuan' },
  { id: 'hunyuan-vision-t1-a56b', name: 'Hunyuan-Vision-T1-A56B-32k-251027', params: 400.0, architecture: 'multimodal', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 56.0, vendor: 'Hunyuan' },
  { id: 'hunyuan-vision-turbos-a56b', name: 'Hunyuan-Vision-TurboS-A56B-32k-251027', params: 400.0, architecture: 'multimodal', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 56.0, vendor: 'Hunyuan' },
  { id: 'hunyuan-t1-20250321', name: 'hunyuan-t1-20250321', params: 400.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 52.0, vendor: 'Hunyuan' },
  { id: 'hunyuan-t1-32k-250710', name: 'hunyuan-t1-32k-250710', params: 400.0, architecture: 'moe', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 100000, activeParams: 52.0, vendor: 'Hunyuan' },
  { id: 'youtu-llm-2b', name: 'Youtu-LLM-2B', params: 2.0, architecture: 'transformer', hiddenSize: 2048, numLayers: 24, numHeads: 16, vocabSize: 100000, vendor: 'Hunyuan', huggingfaceUrl: 'https://huggingface.co/tencent/Youtu-LLM-2B' },
  { id: 'youtu-embedding', name: 'Youtu-Embedding', params: 0.3, architecture: 'embedding', hiddenSize: 768, numLayers: 12, numHeads: 12, vocabSize: 100000, vendor: 'Hunyuan', huggingfaceUrl: 'https://huggingface.co/tencent/Youtu-Embedding' },

  // ==================== 其他 ====================
  { id: 'gpt-oss-20b', name: 'GPT-OSS-20B', params: 20.0, architecture: 'transformer', hiddenSize: 6144, numLayers: 48, numHeads: 48, vocabSize: 200064, vendor: '其他', huggingfaceUrl: 'https://huggingface.co/openai/gpt-oss-20b' },
  { id: 'gpt-oss-120b', name: 'GPT-OSS-120B', params: 120.0, architecture: 'transformer', hiddenSize: 8192, numLayers: 80, numHeads: 64, vocabSize: 200064, vendor: '其他', huggingfaceUrl: 'https://huggingface.co/openai/gpt-oss-120b' },
  { id: 'gemma3-12b-it', name: 'Gemma3-12B-IT', params: 12.0, architecture: 'multimodal', hiddenSize: 4096, numLayers: 40, numHeads: 32, vocabSize: 256000, vendor: '其他', huggingfaceUrl: 'https://huggingface.co/google/gemma-3-12b-it' },
  { id: 'gemma3-27b-it', name: 'Gemma3-27B-IT', params: 27.0, architecture: 'multimodal', hiddenSize: 5120, numLayers: 64, numHeads: 40, vocabSize: 256000, vendor: '其他', huggingfaceUrl: 'https://huggingface.co/google/gemma-3-27b-it' },
  { id: 'whisper-large-v3', name: 'Whisper-Large-V3', params: 1.55, architecture: 'audio-text', hiddenSize: 1280, numLayers: 32, numHeads: 20, vocabSize: 51865, vendor: '其他', huggingfaceUrl: 'https://huggingface.co/openai/whisper-large-v3' },
  { id: 'cosmos-reason1-7b', name: 'Cosmos-Reason1-7B', params: 7.0, architecture: 'multimodal', hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 128256, vendor: '其他', huggingfaceUrl: 'https://huggingface.co/nvidia/Cosmos-Reason1-7B' },
];

/**
 * GPU 数据库 - 主流 AI 加速卡规格参数
 * 数据来源: 各芯片厂商官方规格表及云厂商产品文档
 */
export const GPU_DATABASE: GPU[] = [
  // 数据中心级 GPU - Blackwell 架构
  {
    id: 'pnv6s',
    name: 'PNV6s 141GB',
    memory: 141,
    architecture: 'Blackwell',
    computeCapability: '10.0',
    price: 0,
    bandwidth: 8000,
    fp16Tflops: 2250,
    features: ['HBM3e', 'NVLink 5.0', '邀测', '云厂商']
  },
  {
    id: 'pnv6',
    name: 'PNV6 96GB',
    memory: 96,
    architecture: 'Blackwell',
    computeCapability: '10.0',
    price: 0,
    bandwidth: 8000,
    fp16Tflops: 2250,
    features: ['HBM3e', 'NVLink 5.0', '邀测', '云厂商']
  },

  // 数据中心级 GPU - Hopper 架构
  {
    id: 'h800',
    name: 'NVIDIA H800',
    memory: 80,
    architecture: 'Hopper',
    computeCapability: '9.0',
    price: 0,
    bandwidth: 3350,
    fp16Tflops: 495,
    features: ['HBM3', 'NVLink 4.0', '主售/白名单', '云厂商 / HCC集群']
  },

  // 数据中心级 GPU - Ampere 架构
  {
    id: 'a800',
    name: 'NVIDIA A800',
    memory: 80,
    architecture: 'Ampere',
    computeCapability: '8.0',
    price: 0,
    bandwidth: 2039,
    fp16Tflops: 312,
    features: ['HBM2e', 'NVLink 3.0', '主售/白名单', '云厂商 / HCC集群']
  },
  {
    id: 'a100-80gb',
    name: 'NVIDIA A100 80GB',
    memory: 80,
    architecture: 'Ampere',
    computeCapability: '8.0',
    price: 0,
    bandwidth: 2039,
    fp16Tflops: 312,
    features: ['HBM2e', 'NVLink 3.0', '云厂商']
  },
  {
    id: 'a100-40gb',
    name: 'NVIDIA A100 40GB',
    memory: 40,
    architecture: 'Ampere',
    computeCapability: '8.0',
    price: 0,
    bandwidth: 1555,
    fp16Tflops: 312,
    features: ['HBM2e', 'NVLink 3.0', '云厂商 / HCC集群']
  },

  // 专业推理/训练 GPU - Ada Lovelace 架构
  {
    id: 'pnv5b',
    name: 'PNV5b 48GB',
    memory: 48,
    architecture: 'Ada Lovelace',
    computeCapability: '8.9',
    price: 0,
    bandwidth: 864,
    fp16Tflops: 182,
    features: ['GDDR6', '邀测', '云厂商 / HCC集群']
  },
  {
    id: 'l40',
    name: 'NVIDIA L40',
    memory: 48,
    architecture: 'Ada Lovelace',
    computeCapability: '8.9',
    price: 0,
    bandwidth: 864,
    fp16Tflops: 182,
    features: ['GDDR6', '云厂商']
  },

  // 数据中心级 GPU - Volta 架构
  {
    id: 'v100',
    name: 'NVIDIA V100 32GB',
    memory: 32,
    architecture: 'Volta',
    computeCapability: '7.0',
    price: 0,
    bandwidth: 900,
    fp16Tflops: 125,
    features: ['HBM2', 'NVLink 2.0', '云厂商 / HCC集群 / CVM']
  },

  // 消费级 GPU - Blackwell 架构
  {
    id: 'rtx-5090d',
    name: 'RTX 5090D',
    memory: 32,
    architecture: 'Blackwell',
    computeCapability: '9.0',
    price: 0,
    bandwidth: 1792,
    fp16Tflops: 190,
    features: ['GDDR7', '云厂商 / CVM']
  },

  // 消费级 GPU - Ada Lovelace 架构
  {
    id: 'rtx-4090',
    name: 'RTX 4090',
    memory: 24,
    architecture: 'Ada Lovelace',
    computeCapability: '8.9',
    price: 0,
    bandwidth: 1008,
    fp16Tflops: 165,
    features: ['GDDR6X', '云厂商 / CVM']
  },
  {
    id: 'rtx-4090d',
    name: 'RTX 4090D',
    memory: 24,
    architecture: 'Ada Lovelace',
    computeCapability: '8.9',
    price: 0,
    bandwidth: 1008,
    fp16Tflops: 148,
    features: ['GDDR6X', '云厂商 / CVM']
  },
  {
    id: 'a10',
    name: 'NVIDIA A10',
    memory: 24,
    architecture: 'Ampere',
    computeCapability: '8.6',
    price: 0,
    bandwidth: 600,
    fp16Tflops: 125,
    features: ['GDDR6', '云厂商 / CVM']
  },

  // 消费级 GPU - Ampere 架构
  {
    id: 'rtx-3090',
    name: 'RTX 3090',
    memory: 24,
    architecture: 'Ampere',
    computeCapability: '8.6',
    price: 0,
    bandwidth: 936,
    fp16Tflops: 71,
    features: ['GDDR6X', '云厂商 / CVM']
  },

  // 推理级 GPU - Turing 架构
  {
    id: 't4',
    name: 'NVIDIA T4',
    memory: 16,
    architecture: 'Turing',
    computeCapability: '7.5',
    price: 0,
    bandwidth: 320,
    fp16Tflops: 65,
    features: ['GDDR6', 'INT8 130 TOPS', '云厂商 / CVM']
  },

  // ──────────────────────────────────────────────────
  // 国产 AI 加速卡
  // ──────────────────────────────────────────────────

  // 海光 DCU 系列
  {
    id: 'hygon-bw1000',
    name: '海光 BW1000',
    memory: 64,
    architecture: '海光 DCU',
    computeCapability: 'N/A',
    price: 0,
    bandwidth: 1600,
    fp16Tflops: 256,
    features: ['HBM2e', 'RDMA', '云厂商 / HCC集群']
  },
  {
    id: 'hygon-bw151',
    name: '海光 BW151',
    memory: 32,
    architecture: '海光 DCU',
    computeCapability: 'N/A',
    price: 0,
    bandwidth: 900,
    fp16Tflops: 128,
    features: ['HBM2', '云厂商']
  },

  // 百度昆仑芯系列
  {
    id: 'kunlunxin-p800',
    name: '昆仑芯 P800',
    memory: 64,
    architecture: '昆仑芯',
    computeCapability: 'N/A',
    price: 0,
    bandwidth: 1600,
    fp16Tflops: 256,
    features: ['HBM2e', 'RDMA', '云厂商 / HCC集群']
  },

  // 燧原科技天垓系列
  {
    id: 'enflame-t150',
    name: '天垓 150',
    memory: 64,
    architecture: '燧原 GCU',
    computeCapability: 'N/A',
    price: 0,
    bandwidth: 1600,
    fp16Tflops: 256,
    features: ['HBM2e', '云厂商']
  },

  // 沐曦紫霄系列
  {
    id: 'metax-c200',
    name: '紫霄 C200',
    memory: 64,
    architecture: '沐曦 GPU',
    computeCapability: 'N/A',
    price: 0,
    bandwidth: 1600,
    fp16Tflops: 256,
    features: ['HBM2e', '云厂商']
  },
];

/**
 * 根据模型ID获取模型信息
 */
export function getModelById(modelId: string): ModelInfo | undefined {
  return MODELS_DATABASE.find(model => model.id === modelId);
}

/**
 * 根据GPU ID获取GPU信息
 */
export function getGPUById(gpuId: string): GPU | undefined {
  return GPU_DATABASE.find(gpu => gpu.id === gpuId);
}

/**
 * 获取适合的GPU推荐
 */
export function getGPURecommendations(requiredMemoryGB: number): GPU[] {
  return GPU_DATABASE
    .filter(gpu => gpu.memory >= requiredMemoryGB)
    .sort((a, b) => {
      // 按显存利用率排序，优先推荐利用率在70-90%之间的
      const aUtilization = (requiredMemoryGB / a.memory) * 100;
      const bUtilization = (requiredMemoryGB / b.memory) * 100;
      
      const aOptimal = Math.abs(aUtilization - 80);
      const bOptimal = Math.abs(bUtilization - 80);
      
      return aOptimal - bOptimal;
    });
}

/**
 * 多机GPU配置推荐（支持多台8卡机器）
 */
export interface MultiGPUConfig {
  gpu: GPU;
  gpusPerNode: number; // 每台机器的GPU数量
  numNodes: number;    // 机器数量
  totalGPUs: number;   // 总GPU数量
  totalMemory: number; // 总显存（GB）
  totalCost: number;   // 总成本
  memoryPerNode: number; // 每台机器总显存
  suggestion: string;  // 推荐理由
  suggestionKey?: string; // 翻译键
  suggestionParams?: Record<string, string | number>; // 翻译参数
}

export function getMultiGPURecommendations(requiredMemoryGB: number): MultiGPUConfig[] {
  const recommendations: MultiGPUConfig[] = [];
  
  // 单卡无法满足的情况下，推荐多卡配置
  const suitableGPUs = GPU_DATABASE.filter(gpu => gpu.memory >= 8); // 至少8GB显存的GPU
  
  for (const gpu of suitableGPUs) {
    const gpuMemory = gpu.memory;
    
    // 计算需要的GPU数量（考虑70%利用率为最优）
    const optimalGPUsNeeded = Math.ceil(requiredMemoryGB / (gpuMemory * 0.7));
    
    // 尝试不同的机器配置
    for (const gpusPerNode of [1, 2, 4, 8]) {
      if (optimalGPUsNeeded <= gpusPerNode) {
        // 单台机器就够了
        const config: MultiGPUConfig = {
          gpu,
          gpusPerNode,
          numNodes: 1,
          totalGPUs: gpusPerNode,
          totalMemory: gpuMemory * gpusPerNode,
          totalCost: gpu.price * gpusPerNode,
          memoryPerNode: gpuMemory * gpusPerNode,
          suggestion: `单机${gpusPerNode}卡配置，${(gpuMemory * gpusPerNode).toFixed(0)}GB总显存`,
          suggestionKey: 'gpu.multi.single.machine.config',
          suggestionParams: { 
            gpusPerNode, 
            totalMemory: (gpuMemory * gpusPerNode).toFixed(0) 
          }
        };
        recommendations.push(config);
      } else {
        // 需要多台机器
        const nodesNeeded = Math.ceil(optimalGPUsNeeded / gpusPerNode);
        if (nodesNeeded <= 16) { // 最多推荐16台机器
          const totalGPUs = nodesNeeded * gpusPerNode;
          const config: MultiGPUConfig = {
            gpu,
            gpusPerNode,
            numNodes: nodesNeeded,
            totalGPUs,
            totalMemory: gpuMemory * totalGPUs,
            totalCost: gpu.price * totalGPUs,
            memoryPerNode: gpuMemory * gpusPerNode,
            suggestion: `${nodesNeeded}台机器，每台${gpusPerNode}卡，共${totalGPUs}卡 ${(gpuMemory * totalGPUs).toFixed(0)}GB总显存`,
            suggestionKey: 'gpu.multi.multiple.machines.config',
            suggestionParams: { 
              numNodes: nodesNeeded,
              gpusPerNode,
              totalGPUs,
              totalMemory: (gpuMemory * totalGPUs).toFixed(0)
            }
          };
          recommendations.push(config);
        }
      }
    }
  }
  
  // 排序：优先考虑成本效益和实用性
  return recommendations
    .filter(config => config.totalMemory >= requiredMemoryGB)
    .sort((a, b) => {
      // 计算成本效益（每GB显存的成本）
      const aCostPerGB = a.totalCost / a.totalMemory;
      const bCostPerGB = b.totalCost / b.totalMemory;
      
      // 优先推荐成本效益好的配置
      if (Math.abs(aCostPerGB - bCostPerGB) > 50) {
        return aCostPerGB - bCostPerGB;
      }
      
      // 成本相近时，优先推荐机器数量少的
      return a.numNodes - b.numNodes;
    })
    .slice(0, 20); // 最多返回20个推荐
}

/**
 * 按参数量分类模型
 */
export function getModelsByCategory() {
  return {
    small: MODELS_DATABASE.filter(m => m.params <= 3),
    medium: MODELS_DATABASE.filter(m => m.params > 3 && m.params <= 15),
    large: MODELS_DATABASE.filter(m => m.params > 15 && m.params <= 50),
    xlarge: MODELS_DATABASE.filter(m => m.params > 50)
  };
}

/**
 * 按价格范围分类GPU
 */
export function getGPUsByPriceRange() {
  return {
    budget: GPU_DATABASE.filter(gpu => gpu.price <= 1000),
    mid: GPU_DATABASE.filter(gpu => gpu.price > 1000 && gpu.price <= 5000),
    high: GPU_DATABASE.filter(gpu => gpu.price > 5000 && gpu.price <= 20000),
    enterprise: GPU_DATABASE.filter(gpu => gpu.price > 20000)
  };
}

/**
 * 根据架构类型过滤模型
 */
export function getModelsByArchitecture(type: 'nlp' | 'multimodal' | 'embedding'): ModelInfo[] {
  if (type === 'nlp') {
    // NLP模型：transformer, glm, moe 架构
    return MODELS_DATABASE.filter(model => 
      ['transformer', 'glm', 'moe'].includes(model.architecture)
    );
  } else if (type === 'multimodal') {
    // 多模态模型：multimodal 架构
    return MODELS_DATABASE.filter(model => 
      model.architecture === 'multimodal'
    );
  } else {
    // 向量模型：embedding, reranker 架构
    return MODELS_DATABASE.filter(model => 
      ['embedding', 'reranker'].includes(model.architecture)
    );
  }
}

/**
 * 根据架构类型按系列分组模型
 */
export function getModelsByCategoryAndArchitecture(type: 'nlp' | 'multimodal') {
  const filteredModels = getModelsByArchitecture(type);
  
  const categories = filteredModels.reduce((acc, model) => {
    const category = model.name.split('-')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);
  
  return categories;
}

/**
 * 获取所有供应商列表
 */
export function getVendors(): ModelVendor[] {
  return ['DeepSeek', 'Kimi', 'GLM', 'Qwen', 'Hunyuan', '其他'];
}

/**
 * 根据供应商过滤模型
 */
export function getModelsByVendor(vendor: ModelVendor): ModelInfo[] {
  return MODELS_DATABASE.filter(model => model.vendor === vendor);
}

/**
 * 根据架构类型和供应商过滤模型
 */
export function getModelsByArchitectureAndVendor(
  type: 'nlp' | 'multimodal' | 'embedding',
  vendor?: ModelVendor
): ModelInfo[] {
  let models = getModelsByArchitecture(type);
  if (vendor) {
    models = models.filter(model => model.vendor === vendor);
  }
  return models;
}

/**
 * 根据架构类型和供应商按系列分组模型
 */
export function getModelsByCategoryArchitectureAndVendor(
  type: 'nlp' | 'multimodal',
  vendor?: ModelVendor
) {
  const filteredModels = getModelsByArchitectureAndVendor(type, vendor);
  
  const categories = filteredModels.reduce((acc, model) => {
    const category = model.name.split('-')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);
  
  return categories;
}

/**
 * 获取指定架构类型下有模型的供应商列表
 */
export function getVendorsForArchitecture(type: 'nlp' | 'multimodal' | 'embedding'): ModelVendor[] {
  const models = getModelsByArchitecture(type);
  const vendors = [...new Set(models.map(m => m.vendor).filter(Boolean))] as ModelVendor[];
  // 保持固定顺序
  const order: ModelVendor[] = ['DeepSeek', 'Kimi', 'GLM', 'Qwen', 'Hunyuan', '其他'];
  return order.filter(v => vendors.includes(v));
} 