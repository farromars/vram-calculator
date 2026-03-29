import { ModelInfo, GPU } from '@/types';

/**
 * 主流AI模型数据库 (50+ 模型)
 */
export const MODELS_DATABASE: ModelInfo[] = [
  // Qwen系列
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen2.5-0.5B',
    params: 0.5,
    architecture: 'transformer',
    hiddenSize: 1024,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 151643
  },
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen2.5-1.5B',
    params: 1.5,
    architecture: 'transformer',
    hiddenSize: 1536,
    numLayers: 28,
    numHeads: 12,
    vocabSize: 151643
  },
  {
    id: 'qwen2.5-3b',
    name: 'Qwen2.5-3B',
    params: 3.0,
    architecture: 'transformer',
    hiddenSize: 2048,
    numLayers: 36,
    numHeads: 16,
    vocabSize: 151643
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen2.5-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 28,
    numHeads: 28,
    vocabSize: 151643
  },
  {
    id: 'qwen2.5-14b',
    name: 'Qwen2.5-14B',
    params: 14.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 48,
    numHeads: 40,
    vocabSize: 151643
  },
  {
    id: 'qwen2.5-32b',
    name: 'Qwen2.5-32B',
    params: 32.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 64,
    numHeads: 40,
    vocabSize: 151643
  },
  {
    id: 'qwen2.5-72b',
    name: 'Qwen2.5-72B',
    params: 72.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151643
  },

  // Qwen3系列 (最新)
  {
    id: 'qwen3-1.8b',
    name: 'Qwen3-1.8B',
    params: 1.8,
    architecture: 'transformer',
    hiddenSize: 1536,
    numLayers: 30,
    numHeads: 16,
    vocabSize: 151936
  },
  {
    id: 'qwen3-7b',
    name: 'Qwen3-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 151936
  },
  {
    id: 'qwen3-14b',
    name: 'Qwen3-14B',
    params: 14.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 48,
    numHeads: 40,
    vocabSize: 151936
  },
  {
    id: 'qwen3-32b',
    name: 'Qwen3-32B',
    params: 32.0,
    architecture: 'transformer',
    hiddenSize: 6400,
    numLayers: 64,
    numHeads: 50,
    vocabSize: 151936
  },
  {
    id: 'qwen3-72b',
    name: 'Qwen3-72B',
    params: 72.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151936
  },

  // DeepSeek系列
  {
    id: 'deepseek-v3-671b',
    name: 'DeepSeek-V3-671B (满血版)',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 56,
    vocabSize: 129000,
    activeParams: 37.0
  },
  {
    id: 'deepseek-v3-0324',
    name: 'DeepSeek-V3-0324',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 56,
    vocabSize: 129000,
    activeParams: 37.0
  },
  {
    id: 'deepseek-r1-671b',
    name: 'DeepSeek-R1-671B (满血版)',
    params: 671.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 56,
    vocabSize: 129000,
    activeParams: 37.0
  },
  {
    id: 'deepseek-r1-0528',
    name: 'DeepSeek-R1-0528 (最新版)',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 56,
    vocabSize: 129000,
    activeParams: 37.0
  },
  {
    id: 'deepseek-ai-deepseek-r1-0528',
    name: 'deepseek-ai/DeepSeek-R1-0528',
    params: 685.0,
    architecture: 'moe',
    hiddenSize: 7168,
    numLayers: 61,
    numHeads: 56,
    vocabSize: 129000,
    activeParams: 37.0
  },
  {
    id: 'deepseek-ai-deepseek-r1-0528-qwen3-8b',
    name: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
    params: 8.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 151936
  },
  {
    id: 'deepseek-r1-70b',
    name: 'DeepSeek-R1-70B',
    params: 70.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 128000
  },
  {
    id: 'deepseek-r1-32b',
    name: 'DeepSeek-R1-32B',
    params: 32.0,
    architecture: 'transformer',
    hiddenSize: 6400,
    numLayers: 64,
    numHeads: 50,
    vocabSize: 128000
  },
  {
    id: 'deepseek-r1-14b',
    name: 'DeepSeek-R1-14B',
    params: 14.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 48,
    numHeads: 40,
    vocabSize: 128000
  },
  {
    id: 'deepseek-r1-8b',
    name: 'DeepSeek-R1-8B',
    params: 8.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 128000
  },
  {
    id: 'deepseek-r1-7b',
    name: 'DeepSeek-R1-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 128000
  },
  {
    id: 'deepseek-r1-1.5b',
    name: 'DeepSeek-R1-1.5B',
    params: 1.5,
    architecture: 'transformer',
    hiddenSize: 1536,
    numLayers: 28,
    numHeads: 12,
    vocabSize: 128000
  },
  {
    id: 'deepseek-coder-1.3b',
    name: 'DeepSeek-Coder-1.3B',
    params: 1.3,
    architecture: 'transformer',
    hiddenSize: 2048,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 32000
  },
  {
    id: 'deepseek-coder-6.7b',
    name: 'DeepSeek-Coder-6.7B',
    params: 6.7,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },
  {
    id: 'deepseek-coder-33b',
    name: 'DeepSeek-Coder-33B',
    params: 33.0,
    architecture: 'transformer',
    hiddenSize: 7168,
    numLayers: 62,
    numHeads: 56,
    vocabSize: 32000
  },
  {
    id: 'deepseek-moe-16b',
    name: 'DeepSeek-MoE-16B',
    params: 16.0,
    architecture: 'moe',
    hiddenSize: 2048,
    numLayers: 28,
    numHeads: 16,
    vocabSize: 100000
  },

  // Llama系列
  {
    id: 'llama-3.1-8b',
    name: 'Llama-3.1-8B',
    params: 8.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 128256
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama-3.1-70B',
    params: 70.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 128256
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama-3.1-405B',
    params: 405.0,
    architecture: 'transformer',
    hiddenSize: 16384,
    numLayers: 126,
    numHeads: 128,
    vocabSize: 128256
  },
  {
    id: 'llama-2-7b',
    name: 'Llama-2-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },
  {
    id: 'llama-2-13b',
    name: 'Llama-2-13B',
    params: 13.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 40,
    numHeads: 40,
    vocabSize: 32000
  },
  {
    id: 'llama-2-70b',
    name: 'Llama-2-70B',
    params: 70.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 32000
  },

  // ChatGLM系列
  {
    id: 'glm-4-9b',
    name: 'GLM-4-9B',
    params: 9.0,
    architecture: 'glm',
    hiddenSize: 4096,
    numLayers: 40,
    numHeads: 32,
    vocabSize: 151329
  },
  {
    id: 'glm-4-plus',
    name: 'GLM-4-Plus',
    params: 100.0,
    architecture: 'glm',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151329
  },
  {
    id: 'glm-z1-32b',
    name: 'GLM-Z1-32B (推理模型)',
    params: 32.0,
    architecture: 'glm',
    hiddenSize: 6400,
    numLayers: 64,
    numHeads: 50,
    vocabSize: 151329
  },
  {
    id: 'chatglm3-6b',
    name: 'ChatGLM3-6B',
    params: 6.0,
    architecture: 'glm',
    hiddenSize: 4096,
    numLayers: 28,
    numHeads: 32,
    vocabSize: 65024
  },
  {
    id: 'chatglm4-9b',
    name: 'ChatGLM4-9B',
    params: 9.0,
    architecture: 'glm',
    hiddenSize: 4096,
    numLayers: 40,
    numHeads: 32,
    vocabSize: 151329
  },

  // Baichuan系列
  {
    id: 'baichuan2-7b',
    name: 'Baichuan2-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 125696
  },
  {
    id: 'baichuan2-13b',
    name: 'Baichuan2-13B',
    params: 13.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 40,
    numHeads: 40,
    vocabSize: 125696
  },

  // MiniMax系列
  {
    id: 'minimax-abab6.5',
    name: 'MiniMax-ABAB6.5',
    params: 100.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 250000
  },
  {
    id: 'minimax-abab6.5s',
    name: 'MiniMax-ABAB6.5s',
    params: 70.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 70,
    numHeads: 64,
    vocabSize: 250000
  },

  // 月之暗面系列
  {
    id: 'moonshot-v1-128k',
    name: 'Moonshot-v1-128K',
    params: 70.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151936
  },
  {
    id: 'moonshot-v1-32k',
    name: 'Moonshot-v1-32K',
    params: 70.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151936
  },

  // 阶跃星辰系列
  {
    id: 'step-1v',
    name: 'Step-1V',
    params: 300.0,
    architecture: 'multimodal',
    hiddenSize: 8192,
    numLayers: 100,
    numHeads: 64,
    vocabSize: 200000
  },
  {
    id: 'step-2',
    name: 'Step-2',
    params: 800.0,
    architecture: 'moe',
    hiddenSize: 8192,
    numLayers: 120,
    numHeads: 64,
    vocabSize: 200000,
    activeParams: 40.0
  },

  // 书生·浦语系列
  {
    id: 'internlm2.5-7b',
    name: 'InternLM2.5-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 92544
  },
  {
    id: 'internlm2.5-20b',
    name: 'InternLM2.5-20B',
    params: 20.0,
    architecture: 'transformer',
    hiddenSize: 6144,
    numLayers: 48,
    numHeads: 48,
    vocabSize: 92544
  },

  // 星火系列
  {
    id: 'spark-max',
    name: 'Spark-Max',
    params: 340.0,
    architecture: 'moe',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 100000,
    activeParams: 30.0
  },
  {
    id: 'spark-pro',
    name: 'Spark-Pro',
    params: 175.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 96,
    numHeads: 64,
    vocabSize: 100000
  },

  // Yi系列
  {
    id: 'yi-lightning',
    name: 'Yi-Lightning',
    params: 1000.0,
    architecture: 'moe',
    hiddenSize: 8192,
    numLayers: 100,
    numHeads: 64,
    vocabSize: 200000,
    activeParams: 50.0
  },
  {
    id: 'yi-large',
    name: 'Yi-Large',
    params: 100.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 200000
  },
  {
    id: 'yi-medium',
    name: 'Yi-Medium',
    params: 200.0,
    architecture: 'moe',
    hiddenSize: 6400,
    numLayers: 60,
    numHeads: 50,
    vocabSize: 200000,
    activeParams: 20.0
  },
  {
    id: 'yi-6b',
    name: 'Yi-6B',
    params: 6.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 64000
  },
  {
    id: 'yi-34b',
    name: 'Yi-34B',
    params: 34.0,
    architecture: 'transformer',
    hiddenSize: 7168,
    numLayers: 60,
    numHeads: 56,
    vocabSize: 64000
  },

  // Mistral系列
  {
    id: 'mistral-7b',
    name: 'Mistral-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral-8x7B',
    params: 47.0,
    architecture: 'moe',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },

  // 其他热门模型
  {
    id: 'gemma-2b',
    name: 'Gemma-2B',
    params: 2.0,
    architecture: 'transformer',
    hiddenSize: 2048,
    numLayers: 18,
    numHeads: 8,
    vocabSize: 256000
  },
  {
    id: 'gemma-7b',
    name: 'Gemma-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 3072,
    numLayers: 28,
    numHeads: 16,
    vocabSize: 256000
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3-Mini',
    params: 3.8,
    architecture: 'transformer',
    hiddenSize: 3072,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32064
  },
  {
    id: 'phi-3-small',
    name: 'Phi-3-Small',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 100352
  },
  {
    id: 'codellama-7b',
    name: 'CodeLlama-7B',
    params: 7.0,
    architecture: 'transformer',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32016
  },
  {
    id: 'codellama-13b',
    name: 'CodeLlama-13B',
    params: 13.0,
    architecture: 'transformer',
    hiddenSize: 5120,
    numLayers: 40,
    numHeads: 40,
    vocabSize: 32016
  },
  {
    id: 'codellama-34b',
    name: 'CodeLlama-34B',
    params: 34.0,
    architecture: 'transformer',
    hiddenSize: 8192,
    numLayers: 48,
    numHeads: 64,
    vocabSize: 32016
  },

  // Qwen向量模型系列
  {
    id: 'qwen3-embedding-0.6b',
    name: 'Qwen3-Embedding-0.6B',
    params: 0.6,
    architecture: 'embedding',
    hiddenSize: 768,
    numLayers: 12,
    numHeads: 12,
    vocabSize: 151936
  },
  {
    id: 'qwen3-embedding-4b',
    name: 'Qwen3-Embedding-4B',
    params: 4.0,
    architecture: 'embedding',
    hiddenSize: 2048,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 151936
  },
  {
    id: 'qwen3-embedding-8b',
    name: 'Qwen3-Embedding-8B',
    params: 8.0,
    architecture: 'embedding',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 151936
  },
  {
    id: 'qwen3-reranker-0.6b',
    name: 'Qwen3-Reranker-0.6B',
    params: 0.6,
    architecture: 'reranker',
    hiddenSize: 768,
    numLayers: 12,
    numHeads: 12,
    vocabSize: 151936
  },
  {
    id: 'qwen3-reranker-4b',
    name: 'Qwen3-Reranker-4B',
    params: 4.0,
    architecture: 'reranker',
    hiddenSize: 2048,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 151936
  },
  {
    id: 'qwen3-reranker-8b',
    name: 'Qwen3-Reranker-8B',
    params: 8.0,
    architecture: 'reranker',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 151936
  },

  // 多模态模型 - 视觉语言模型
  {
    id: 'qwen2-vl-7b',
    name: 'Qwen2-VL-7B',
    params: 7.6,
    architecture: 'multimodal',
    hiddenSize: 4096,
    numLayers: 28,
    numHeads: 28,
    vocabSize: 151936
  },
  {
    id: 'qwen2.5-vl-3b',
    name: 'Qwen2.5-VL-3B',
    params: 3.1,
    architecture: 'multimodal',
    hiddenSize: 2048,
    numLayers: 36,
    numHeads: 16,
    vocabSize: 151936
  },
  {
    id: 'qwen2.5-vl-7b',
    name: 'Qwen2.5-VL-7B',
    params: 8.3,
    architecture: 'multimodal',
    hiddenSize: 4096,
    numLayers: 28,
    numHeads: 28,
    vocabSize: 151936
  },
  {
    id: 'qwen2.5-vl-72b',
    name: 'Qwen2.5-VL-72B',
    params: 72.7,
    architecture: 'multimodal',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151936
  },
  {
    id: 'qwq-vl-72b',
    name: 'QwQ-VL-72B (推理多模态)',
    params: 72.0,
    architecture: 'multimodal',
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 151936
  },
  {
    id: 'qwen2.5-vl-32b',
    name: 'Qwen2.5-VL-32B',
    params: 32.5,
    architecture: 'multimodal',
    hiddenSize: 6400,
    numLayers: 64,
    numHeads: 50,
    vocabSize: 151936
  },

  // LLaVA系列
  {
    id: 'llava-1.5-7b',
    name: 'LLaVA-1.5-7B',
    params: 7.0,
    architecture: 'multimodal',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },
  {
    id: 'llava-1.5-13b',
    name: 'LLaVA-1.5-13B',
    params: 13.0,
    architecture: 'multimodal',
    hiddenSize: 5120,
    numLayers: 40,
    numHeads: 40,
    vocabSize: 32000
  },
  {
    id: 'llava-next-34b',
    name: 'LLaVA-NeXT-34B',
    params: 34.0,
    architecture: 'multimodal',
    hiddenSize: 8192,
    numLayers: 60,
    numHeads: 64,
    vocabSize: 32064
  },

  // Idefics系列
  {
    id: 'idefics2-8b',
    name: 'Idefics2-8B',
    params: 8.0,
    architecture: 'multimodal',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },

  // Microsoft Phi多模态
  {
    id: 'phi-4-multimodal',
    name: 'Phi-4-Multimodal',
    params: 5.6,
    architecture: 'multimodal',
    hiddenSize: 3072,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 200064
  },

  // 音频模型
  {
    id: 'whisper-large-v3',
    name: 'Whisper-Large-v3',
    params: 1.55,
    architecture: 'audio-text',
    hiddenSize: 1280,
    numLayers: 32,
    numHeads: 20,
    vocabSize: 51865
  },
  {
    id: 'whisper-medium',
    name: 'Whisper-Medium',
    params: 0.769,
    architecture: 'audio-text',
    hiddenSize: 1024,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 51865
  },
  {
    id: 'whisper-small',
    name: 'Whisper-Small',
    params: 0.244,
    architecture: 'audio-text',
    hiddenSize: 768,
    numLayers: 12,
    numHeads: 12,
    vocabSize: 51865
  },

  // 多模态音频视频模型
  {
    id: 'jamba-1.5-mini',
    name: 'Jamba-1.5-Mini',
    params: 12.0,
    architecture: 'hybrid-mamba',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 65536
  },
  {
    id: 'openomni-7b',
    name: 'OpenOmni-7B',
    params: 7.0,
    architecture: 'omnimodal',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },

  // 视频理解模型
  {
    id: 'video-llama-7b',
    name: 'Video-LLaMA-7B',
    params: 7.0,
    architecture: 'video-text',
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000
  },

  // 文档理解模型
  {
    id: 'nougat-base',
    name: 'Nougat-Base',
    params: 0.35,
    architecture: 'document-ocr',
    hiddenSize: 1024,
    numLayers: 4,
    numHeads: 16,
    vocabSize: 8842
  }
];

/**
 * GPU数据库 - 腾讯云 TI-ONE 平台支持的 GPU 资源规格
 * 数据来源: https://cloud.tencent.com/document/product/851/74108
 *           https://cloud.tencent.com/document/product/560/19700
 *           https://cloud.tencent.com/document/product/1646/81562
 */
export const GPU_DATABASE: GPU[] = [
  // 数据中心级 GPU - Blackwell 架构
  {
    id: 'pnv6s',
    name: 'PNV6s (B200 141GB)',
    memory: 141,
    architecture: 'Blackwell',
    computeCapability: '10.0',
    price: 0,
    bandwidth: 8000,
    fp16Tflops: 2250,
    features: ['HBM3e', 'NVLink 5.0', '邀测', '腾讯云 TI-ONE']
  },
  {
    id: 'pnv6',
    name: 'PNV6 (B200 96GB)',
    memory: 96,
    architecture: 'Blackwell',
    computeCapability: '10.0',
    price: 0,
    bandwidth: 8000,
    fp16Tflops: 2250,
    features: ['HBM3e', 'NVLink 5.0', '邀测', '腾讯云 TI-ONE']
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
    fp16Tflops: 989,
    features: ['HBM3', 'NVLink 4.0', '主售/白名单', '腾讯云 TI-ONE / HCC']
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
    features: ['HBM2e', 'NVLink 3.0', '主售/白名单', '腾讯云 TI-ONE / HCC']
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
    features: ['HBM2e', 'NVLink 3.0', '腾讯云 TI-ONE']
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
    features: ['HBM2e', 'NVLink 3.0', '腾讯云 TI-ONE / HCC']
  },

  // 专业推理/训练 GPU - Ada Lovelace 架构
  {
    id: 'pnv5b',
    name: 'PNV5b (L40S 48GB)',
    memory: 48,
    architecture: 'Ada Lovelace',
    computeCapability: '8.9',
    price: 0,
    bandwidth: 864,
    fp16Tflops: 182,
    features: ['GDDR6', '邀测', '腾讯云 TI-ONE / HCC']
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
    features: ['GDDR6', '腾讯云 TI-ONE']
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
    features: ['HBM2', 'NVLink 2.0', '腾讯云 TI-ONE / HCC / CVM']
  },

  // 消费级 GPU - Blackwell 架构
  {
    id: 'rtx-5090d',
    name: 'RTX 5090D',
    memory: 24,
    architecture: 'Blackwell',
    computeCapability: '9.0',
    price: 0,
    bandwidth: 1792,
    fp16Tflops: 190,
    features: ['GDDR7', '腾讯云 TI-ONE / CVM']
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
    features: ['GDDR6X', '腾讯云 TI-ONE / CVM']
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
    features: ['GDDR6X', '腾讯云 TI-ONE / CVM']
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
    features: ['GDDR6', '腾讯云 TI-ONE / CVM (PNV4)']
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
    features: ['GDDR6X', '腾讯云 TI-ONE / CVM']
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
    features: ['GDDR6', 'INT8 130 TOPS', '腾讯云 TI-ONE / CVM (GN7)']
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