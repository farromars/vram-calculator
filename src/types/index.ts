// 数值精度类型
export type PrecisionType = 'FP32' | 'FP16' | 'BF16' | 'FP8';

// 优化器类型
export type OptimizerType = 'SGD' | 'Adam' | 'AdamW';

// 微调方法类型
export type FineTuningMethod = 'Full' | 'LoRA' | 'QLoRA' | 'Prefix';

// 量化类型
export type QuantizationType = 'None' | 'INT8' | 'INT4' | 'FP8';

// 模型架构类型
export type ModelArchitectureType =
  // NLP架构
  | 'Transformer' | 'BERT' | 'GPT' | 'T5' | 'LLaMA' | 'ChatGLM'
  // 多模态架构
  | 'CLIP' | 'BLIP' | 'LLaVA' | 'GPT-4V' | 'Flamingo'
  // MoE架构
  | 'Switch Transformer' | 'GLaM' | 'PaLM-2' | 'DeepSeek-MoE'
  // CNN架构
  | 'ResNet' | 'EfficientNet' | 'ConvNeXt' | 'RegNet' | 'DenseNet';

// 位置编码类型
export type PositionEncodingType = 'Absolute' | 'Relative' | 'RoPE' | 'ALiBi';

// LoRA目标模块类型
export type LoRATargetModule = 'q_proj' | 'k_proj' | 'v_proj' | 'o_proj' | 'gate_proj' | 'up_proj' | 'down_proj';

// 视觉编码器类型
export type VisionEncoderType = 'ViT' | 'ConvNext' | 'ResNet';

// 文本编码器类型
export type TextEncoderType = 'BERT' | 'RoBERTa' | 'T5';

// 模态融合策略
export type ModalFusionStrategy = 'Cross-attention' | 'Co-attention' | 'Gated fusion';

// 路由策略类型
export type RoutingStrategy = 'Top-K' | 'Switch' | 'Expert Choice';

// 专家初始化策略
export type ExpertInitStrategy = 'Random' | 'Pretrained Inherit';

// LoRA应用策略（MoE）
export type LoRAApplicationStrategy = 'All Experts' | 'Partial Experts' | 'Router Only';

// 池化策略类型
export type PoolingStrategy = 'MaxPool' | 'AvgPool' | 'AdaptiveAvgPool';

// 数据增强策略
export type DataAugmentationStrategy = 'RandomCrop' | 'RandomFlip' | 'ColorJitter' | 'AutoAugment';

// 学习率调度器类型
export type LRSchedulerType = 'StepLR' | 'CosineAnnealingLR' | 'ReduceLROnPlateau';

// 高级模型类型
export type AdvancedModelType = 'NLP' | 'Multimodal' | 'MoE' | 'CNN';

// 计算器类型
export type CalculatorType = 'training' | 'inference' | 'finetuning' | 'grpo' | 'multimodal';

// 添加主分组类型
export type PrimaryTab = 'nlp' | 'multimodal' | 'advanced';

// 多模态模式类型
export type MultimodalMode = 'training' | 'inference' | 'finetuning';

// 定义每个主分组包含的计算器类型
export const NLP_CALCULATOR_TYPES: CalculatorType[] = ['training', 'inference', 'finetuning', 'grpo'];
export const MULTIMODAL_CALCULATOR_TYPES: MultimodalMode[] = ['training', 'inference', 'finetuning'];

// 多模态类型扩展
export type ModalityType = 'text-image' | 'text-audio' | 'text-video' | 'audio-video' | 'text-audio-video';

// GPU类型
export interface GPU {
  id: string;
  name: string;
  memory: number; // GB
  architecture: string;
  computeCapability: string;
  price: number; // USD
  cloudPrice?: number; // USD/hour
  features?: string[]; // GPU特性列表
  bandwidth?: number; // 内存带宽 GB/s
  fp16Tflops?: number; // FP16算力 TFLOPS
}

// 模型供应商类型
export type ModelVendor = 'DeepSeek' | 'Kimi' | 'GLM' | 'Qwen' | 'Hunyuan' | '其他';

// 模型信息
export interface ModelInfo {
  id: string;
  name: string;
  params: number; // billions
  architecture: string; // transformer, multimodal, moe, glm, embedding, reranker, etc.
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  numKVHeads?: number; // GQA/MQA 模型的 KV head 数；缺省 = numHeads（标准 MHA）
  vocabSize: number;
  activeParams?: number; // billions, for MoE models
  vendor?: ModelVendor; // 模型供应商
  huggingfaceUrl?: string; // HuggingFace链接
}

// 训练配置
export interface TrainingConfig {
  modelId: string;
  batchSize: number;
  sequenceLength: number;
  precision: PrecisionType;
  optimizer: OptimizerType;
  gradientCheckpointing: boolean;
  mixedPrecision: boolean;
}

// 推理配置
export interface InferenceConfig {
  modelId: string;
  precision: PrecisionType;
  quantization: QuantizationType;
  batchSize: number;
  sequenceLength: number;
  kvCacheRatio: number;
  concurrentUsers: number;
}

// 微调配置
export interface FineTuningConfig {
  baseModel: string;
  method: FineTuningMethod;
  loraRank?: number;
  loraAlpha?: number;
  quantization: QuantizationType;
  precision: PrecisionType;
  batchSize: number;
  sequenceLength: number;
}

// NLP模型微调超参数配置
export interface NLPFineTuningConfig {
  // 基础超参数
  modelSize: number; // 125M ~ 175B+ 参数
  architectureType: ModelArchitectureType;
  precision: PrecisionType;
  quantizationTech: QuantizationType;
  batchSize: number; // 1-64
  sequenceLength: number; // 512-32768
  gradientAccumulationSteps: number; // 1-128
  learningRate: number; // 1e-6 ~ 1e-4
  optimizer: OptimizerType;
  trainingEpochs: number; // 1-10

  // NLP特有超参数
  vocabSize: number; // 30k-100k
  numAttentionHeads: number; // 8-128
  hiddenSize: number; // 768-12288
  intermediateSize: number; // 3072-49152
  numLayers: number; // 12-96
  positionEncodingType: PositionEncodingType;
  loraRank: number; // 4-256
  loraAlpha: number; // 16-128
  loraTargetModules: LoRATargetModule[];
  maxGenerationLength: number; // 256-4096
  temperature: number; // 0.1-1.0
  topP: number; // 0.9-0.95
  repetitionPenalty: number; // 1.0-1.2

  // 优化相关
  weightDecay: number;
  warmupSteps: number;
  gradientClipping: number;
  dropoutRate: number;
}

// 多模态模型微调超参数配置
export interface MultimodalFineTuningConfig {
  // 基础超参数
  modelSize: number; // 1B ~ 100B+ 参数
  architectureType: ModelArchitectureType;
  precision: PrecisionType;
  quantizationSupport: boolean;
  batchSize: number; // 4-32
  sequenceLength: number; // 256-2048
  gradientAccumulationSteps: number; // 2-32
  learningRate: number; // 1e-5 ~ 1e-4
  optimizer: OptimizerType;
  trainingEpochs: number; // 3-30

  // 多模态特有超参数
  imageResolution: number; // 224×224 ~ 1024×1024
  patchSize: number; // 14×14 ~ 32×32
  visionEncoderType: VisionEncoderType;
  textEncoderType: TextEncoderType;
  modalFusionStrategy: ModalFusionStrategy;
  visionFeatureDim: number; // 768-1024
  crossModalAlignmentWeight: number; // 0.1-1.0
  imageTextContrastWeight: number; // 0.1-1.0
  freezeVisionEncoder: boolean;
  freezeTextEncoder: boolean;
  loraVisionEncoder: boolean;
  loraTextEncoder: boolean;
  loraFusionLayer: boolean;

  // 优化相关
  weightDecay: number;
  warmupSteps: number;
  gradientClipping: number;
  mixedPrecisionTraining: boolean;
}

// MoE模型微调超参数配置
export interface MoEFineTuningConfig {
  // 基础超参数
  modelSize: number; // 1B ~ 1.6T 参数
  architectureType: ModelArchitectureType;
  precision: PrecisionType; // FP16, BF16推荐
  quantizationSupport: boolean;
  batchSize: number; // 8-64
  sequenceLength: number; // 512-8192
  gradientAccumulationSteps: number; // 2-16
  learningRate: number; // 1e-5 ~ 5e-5
  optimizer: OptimizerType; // AdamW推荐
  trainingEpochs: number; // 1-5

  // MoE特有超参数
  numExperts: number; // 8-2048
  numActiveExperts: number; // 1-8 (Top-K)
  expertCapacityFactor: number; // 1.0-2.0
  loadBalanceLossWeight: number; // 0.01-0.1
  expertDropoutRate: number; // 0.0-0.1
  routingStrategy: RoutingStrategy;
  expertSpecialization: number; // 0.1-1.0
  auxiliaryLossWeight: number; // 0.001-0.01
  expertParallelism: number; // 1-8
  expertInitStrategy: ExpertInitStrategy;
  loraApplicationStrategy: LoRAApplicationStrategy;

  // 优化相关
  weightDecay: number;
  warmupSteps: number;
  gradientClipping: number;
  expertRegularization: number;
}

// CNN模型微调超参数配置
export interface CNNFineTuningConfig {
  // 基础超参数
  modelSize: number; // 5M ~ 500M 参数
  architectureType: ModelArchitectureType;
  precision: PrecisionType; // FP32, FP16, INT8
  quantizationSupport: boolean;
  batchSize: number; // 32-512
  gradientAccumulationSteps: number; // 1-8
  learningRate: number; // 1e-4 ~ 1e-2
  optimizer: OptimizerType;
  trainingEpochs: number; // 50-300

  // CNN特有超参数
  inputImageSize: number; // 224×224 ~ 512×512
  kernelSize: number; // 3×3, 5×5, 7×7
  poolingStrategy: PoolingStrategy;
  dataAugmentationStrategy: DataAugmentationStrategy[];
  frozenLayers: number; // 0-全部层数
  classificationHeadDim: number; // 等于类别数
  dropoutRate: number; // 0.1-0.5
  weightDecay: number; // 1e-4 ~ 1e-2
  lrScheduler: LRSchedulerType;
  freezeBatchNorm: boolean;
  mixedPrecisionTraining: boolean;

  // 优化相关
  warmupSteps: number;
  gradientClipping: number;
  labelSmoothing: number;
}

// 统一的高级微调配置
export interface AdvancedFineTuningConfig {
  modelType: AdvancedModelType;
  nlpConfig?: NLPFineTuningConfig;
  multimodalConfig?: MultimodalFineTuningConfig;
  moeConfig?: MoEFineTuningConfig;
  cnnConfig?: CNNFineTuningConfig;
}

// 扩展现有的MemoryBreakdown以支持新的计算结果
export interface AdvancedMemoryBreakdown extends MemoryBreakdown {
  // 新增的显存组成部分
  visionEncoder?: number;
  textEncoder?: number;
  fusionLayer?: number;
  expertRouting?: number;
  expertActivation?: number;
  convolutionLayers?: number;
  featureMaps?: number;
  dataAugmentation?: number;

  // 扩展元数据
  advancedMetadata?: {
    modelType: AdvancedModelType;
    optimizationSuggestions: string[];
    memoryEfficiency: number;
    computeEfficiency: number;
    hardwareRecommendations: string[];
  };
}

// GRPO配置
export interface GRPOConfig {
  modelId: string;
  precision: PrecisionType;
  batchSize: number;
  sequenceLength: number;
  numGenerations: number; // 每个提示生成的响应数量
  maxPromptLength: number;
  maxCompletionLength: number;
  gradientAccumulationSteps: number;
  use8BitOptimizer: boolean;
  gradientCheckpointing: boolean;
}

// 多模态配置
export interface MultimodalConfig {
  modelId: string;
  mode: MultimodalMode; // 多模态模式：训练/推理/微调
  modalityType: ModalityType; // 模态类型
  textPrecision: PrecisionType;
  visionPrecision: PrecisionType;
  audioPrecision?: PrecisionType; // 音频精度
  batchSize: number;
  sequenceLength: number;
  concurrentUsers: number; // 并发用户数（推理场景）
  // 图像相关配置
  imageResolution: number; // 图像分辨率 (eg. 224, 336, 448)
  patchSize: number; // patch大小 (eg. 14, 16)
  numImages: number; // 每个样本的图像数量
  hasVisionEncoder: boolean; // 是否有独立的视觉编码器
  // 音频相关配置
  audioSampleRate?: number; // 音频采样率 (eg. 16000, 44100)
  audioWindowLength?: number; // 音频窗口长度(秒)
  hasAudioEncoder?: boolean; // 是否有独立的音频编码器
  // 视频相关配置
  videoFrameRate?: number; // 视频帧率
  videoLength?: number; // 视频长度(秒)
  hasVideoEncoder?: boolean; // 是否有独立的视频编码器
}

// 显存计算结果
export interface MemoryBreakdown {
  modelParams: number;
  gradients: number;
  optimizer: number;
  activations: number;
  kvCache: number;
  total: number;
  breakdown: {
    label: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  // 可选的元数据信息（用于多模态等特殊计算）
  metadata?: {
    // 多模态相关
    totalSequenceLength?: number;
    textSeqLength?: number;
    imageSeqLength?: number;
    audioSeqLength?: number;
    videoSeqLength?: number;
    sequenceBreakdown?: {
      label: string;
      value: number;
      color: string;
    }[];
    // 通用参数信息
    trainableParams?: number;
    totalParams?: number;
    trainableRatio?: number;
    methodInfo?: string;
    // GRPO特有
    groupSize?: number;
    sftActivationsGB?: number;
    activationMultiplier?: number;
  };
}

// GPU推荐结果
export interface GPURecommendation {
  gpu: GPU;
  fitScore: number;
  warnings: string[];
  suggestions: string[];
} 