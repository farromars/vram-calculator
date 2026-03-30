import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  TrainingConfig,
  InferenceConfig,
  FineTuningConfig,
  GRPOConfig,
  MultimodalConfig,
  MemoryBreakdown,
  CalculatorType,
  PrimaryTab,
  NLP_CALCULATOR_TYPES,
  AdvancedFineTuningConfig,
  AdvancedMemoryBreakdown,
  AdvancedModelType,
  NLPFineTuningConfig,
  MultimodalFineTuningConfig,
  MoEFineTuningConfig,
  CNNFineTuningConfig
} from '@/types';
import {
  calculateTrainingMemory,
  calculateInferenceMemory,
  calculateFineTuningMemory,
  calculateGRPOMemory,
  calculateMultimodalMemory,
  calculateAdvancedFineTuningMemory
} from '@/utils/memory-formulas';

interface CalculationHistory {
  id: string;
  timestamp: number;
  type: CalculatorType;
  config: unknown;
  result: MemoryBreakdown;
  modelName?: string;
  tags?: string[];
}

interface CalculatorStore {
  // 当前活跃的主分组和子标签页
  primaryTab: PrimaryTab;
  setPrimaryTab: (tab: PrimaryTab) => void;
  activeTab: CalculatorType;
  setActiveTab: (tab: CalculatorType) => void;

  // 防抖计算超时处理器（内部使用）
  _trainingTimeout?: NodeJS.Timeout;
  _inferenceTimeout?: NodeJS.Timeout;
  _fineTuningTimeout?: NodeJS.Timeout;
  _grpoTimeout?: NodeJS.Timeout;
  _multimodalTimeout?: NodeJS.Timeout;
  _advancedFineTuningTimeout?: NodeJS.Timeout;

  // 训练配置
  trainingConfig: TrainingConfig;
  setTrainingConfig: (config: Partial<TrainingConfig>) => void;
  trainingResult: MemoryBreakdown | null;

  // 推理配置
  inferenceConfig: InferenceConfig;
  setInferenceConfig: (config: Partial<InferenceConfig>) => void;
  inferenceResult: MemoryBreakdown | null;

  // 微调配置
  fineTuningConfig: FineTuningConfig;
  setFineTuningConfig: (config: Partial<FineTuningConfig>) => void;
  fineTuningResult: MemoryBreakdown | null;

  // GRPO配置
  grpoConfig: GRPOConfig;
  setGrpoConfig: (config: Partial<GRPOConfig>) => void;
  grpoResult: MemoryBreakdown | null;

  // 多模态配置
  multimodalConfig: MultimodalConfig;
  setMultimodalConfig: (config: Partial<MultimodalConfig>) => void;
  multimodalResult: MemoryBreakdown | null;

  // 加载状态
  trainingLoading: boolean;
  inferenceLoading: boolean;
  fineTuningLoading: boolean;
  grpoLoading: boolean;
  multimodalLoading: boolean;
  advancedFineTuningLoading: boolean;

  // 高级微调配置
  advancedFineTuningConfig: AdvancedFineTuningConfig;
  setAdvancedFineTuningConfig: (config: Partial<AdvancedFineTuningConfig>) => void;
  advancedFineTuningResult: AdvancedMemoryBreakdown | null;

  // 计算历史
  history: CalculationHistory[];
  addToHistory: (type: CalculatorType, config: unknown, result: MemoryBreakdown, modelName?: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // 比较功能
  compareList: CalculationHistory[];
  addToCompare: (item: CalculationHistory) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;

  // 用户偏好设置
  preferences: {
    autoSave: boolean;
    showOptimizationTips: boolean;
    defaultPrecision: 'FP32' | 'FP16' | 'BF16';
    theme: 'light' | 'dark' | 'auto';
  };
  setPreferences: (prefs: Partial<CalculatorStore['preferences']>) => void;

  // 计算方法
  calculateTrainingMemory: () => Promise<void>;
  calculateInferenceMemory: () => Promise<void>;
  calculateFineTuningMemory: () => Promise<void>;
  calculateGRPOMemory: () => Promise<void>;
  calculateMultimodalMemory: () => Promise<void>;
  calculateAdvancedFineTuningMemory: () => Promise<void>;
  
  // 获取当前结果
  getCurrentResult: () => MemoryBreakdown | null;
}

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      primaryTab: 'nlp',
      activeTab: 'inference',
      
      // 训练配置默认值
      trainingConfig: {
        modelParams: 7.0,
        batchSize: 4,
        sequenceLength: 2048,
        precision: 'FP16',
        optimizer: 'AdamW',
        gradientCheckpointing: false,
        mixedPrecision: true
      },
      trainingResult: null,

      // 推理配置默认值
      inferenceConfig: {
        modelId: 'qwen3-8b',
        precision: 'FP16',
        quantization: 'None',
        batchSize: 1,
        sequenceLength: 2048,
        kvCacheRatio: 1.0
      },
      inferenceResult: null,

      // 微调配置默认值
      fineTuningConfig: {
        baseModel: 'qwen3-8b',
        method: 'LoRA',
        loraRank: 4,
        loraAlpha: 32,
        quantization: 'None',
        precision: 'FP16'
      },
      fineTuningResult: null,

      // GRPO配置默认值
      grpoConfig: {
        modelId: 'qwen3-8b',
        precision: 'FP16',
        batchSize: 4,
        sequenceLength: 2048,
        numGenerations: 8,
        maxPromptLength: 512,
        maxCompletionLength: 1536,
        gradientAccumulationSteps: 4,
        use8BitOptimizer: true,
        gradientCheckpointing: true
      },
      grpoResult: null,

      // 多模态配置默认值
      multimodalConfig: {
        modelId: 'qwen3-vl-8b-instruct',
        mode: 'inference',
        modalityType: 'text-image',
        textPrecision: 'FP16',
        visionPrecision: 'FP16',
        audioPrecision: 'FP16',
        batchSize: 2,
        sequenceLength: 2048,
        imageResolution: 336,
        patchSize: 16,
        numImages: 1,
        hasVisionEncoder: true,
        audioSampleRate: 16000,
        audioWindowLength: 30,
        hasAudioEncoder: true,
        videoFrameRate: 25,
        videoLength: 10,
        hasVideoEncoder: true
      },
      multimodalResult: null,

      // 加载状态默认值
      trainingLoading: false,
      inferenceLoading: false,
      fineTuningLoading: false,
      grpoLoading: false,
      multimodalLoading: false,
      advancedFineTuningLoading: false,

      // 高级微调配置默认值
      advancedFineTuningConfig: {
        modelType: 'NLP',
        nlpConfig: {
          modelSize: 7.0,
          architectureType: 'LLaMA',
          precision: 'FP16',
          quantizationTech: 'None',
          batchSize: 4,
          sequenceLength: 2048,
          gradientAccumulationSteps: 4,
          learningRate: 2e-5,
          optimizer: 'AdamW',
          trainingEpochs: 3,
          vocabSize: 50000,
          numAttentionHeads: 32,
          hiddenSize: 4096,
          intermediateSize: 11008,
          numLayers: 32,
          positionEncodingType: 'RoPE',
          loraRank: 16,
          loraAlpha: 32,
          loraTargetModules: ['q_proj', 'v_proj'],
          maxGenerationLength: 2048,
          temperature: 0.7,
          topP: 0.9,
          repetitionPenalty: 1.1,
          weightDecay: 0.01,
          warmupSteps: 100,
          gradientClipping: 1.0,
          dropoutRate: 0.1
        }
      },
      advancedFineTuningResult: null,

      // 历史记录
      history: [],
      compareList: [],

      // 用户偏好
      preferences: {
        autoSave: true,
        showOptimizationTips: true,
        defaultPrecision: 'FP16',
        theme: 'auto'
      },

      // Actions
      setPrimaryTab: (tab) => {
        set({ primaryTab: tab });
      },

      setActiveTab: (tab) => {
        const state = get();
        // 只处理NLP分组的标签页切换
        if (NLP_CALCULATOR_TYPES.includes(tab)) {
          set({ activeTab: tab, primaryTab: 'nlp' });
          
          // 切换NLP标签页时自动计算
        switch (tab) {
          case 'training':
            state.calculateTrainingMemory();
            break;
          case 'inference':
            state.calculateInferenceMemory();
            break;
          case 'finetuning':
            state.calculateFineTuningMemory();
            break;
            case 'grpo':
              state.calculateGRPOMemory();
              break;
          }
        } else {
          // 不是NLP类型的标签页，只更新activeTab（用于其他逻辑）
          set({ activeTab: tab });
        }
      },

      setTrainingConfig: (config) => {
        set((state) => ({
          trainingConfig: { ...state.trainingConfig, ...config }
        }));
        // 防抖计算 - 300ms后执行
        clearTimeout(get()._trainingTimeout);
        const timeout = setTimeout(() => get().calculateTrainingMemory(), 300);
        set({ _trainingTimeout: timeout });
      },

      setInferenceConfig: (config) => {
        set((state) => ({
          inferenceConfig: { ...state.inferenceConfig, ...config }
        }));
        // 防抖计算 - 300ms后执行
        clearTimeout(get()._inferenceTimeout);
        const timeout = setTimeout(() => get().calculateInferenceMemory(), 300);
        set({ _inferenceTimeout: timeout });
      },

      setFineTuningConfig: (config) => {
        set((state) => ({
          fineTuningConfig: { ...state.fineTuningConfig, ...config }
        }));
        // 防抖计算 - 300ms后执行
        clearTimeout(get()._fineTuningTimeout);
        const timeout = setTimeout(() => get().calculateFineTuningMemory(), 300);
        set({ _fineTuningTimeout: timeout });
      },

      setAdvancedFineTuningConfig: (config) => {
        set((state) => ({
          advancedFineTuningConfig: { ...state.advancedFineTuningConfig, ...config }
        }));
        // 防抖计算 - 300ms后执行
        clearTimeout(get()._advancedFineTuningTimeout);
        const timeout = setTimeout(() => get().calculateAdvancedFineTuningMemory(), 300);
        set({ _advancedFineTuningTimeout: timeout });
      },

      setGrpoConfig: (config) => {
        set((state) => ({
          grpoConfig: { ...state.grpoConfig, ...config }
        }));
        // 防抖计算 - 300ms后执行
        clearTimeout(get()._grpoTimeout);
        const timeout = setTimeout(() => get().calculateGRPOMemory(), 300);
        set({ _grpoTimeout: timeout });
      },

      setMultimodalConfig: (config) => {
        set((state) => ({
          multimodalConfig: { ...state.multimodalConfig, ...config }
        }));
        
        // 如果是模式切换，立即计算；其他情况防抖计算
        if (config.mode) {
          // 模式切换时立即计算
          get().calculateMultimodalMemory();
        } else {
          // 其他配置变化时防抖计算 - 300ms后执行
          clearTimeout(get()._multimodalTimeout);
          const timeout = setTimeout(() => get().calculateMultimodalMemory(), 300);
          set({ _multimodalTimeout: timeout });
        }
      },

      addToHistory: (type, config: unknown, result, modelName) => {
        const newItem: CalculationHistory = {
          id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type,
          config,
          result,
          modelName,
          tags: []
        };
        
        set((state) => ({
          history: [newItem, ...state.history].slice(0, 50) // 最多保存50条记录
        }));
      },

      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter(item => item.id !== id)
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      addToCompare: (item) => {
        set((state) => {
          const exists = state.compareList.find(i => i.id === item.id);
          if (exists || state.compareList.length >= 4) return state; // 最多比较4个
          return {
            compareList: [...state.compareList, item]
          };
        });
      },

      removeFromCompare: (id) => {
        set((state) => ({
          compareList: state.compareList.filter(item => item.id !== id)
        }));
      },

      clearCompare: () => {
        set({ compareList: [] });
      },

      setPreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },

      // 计算方法
      calculateTrainingMemory: async () => {
        const { trainingConfig, preferences } = get();
        set({ trainingLoading: true });
        
        try {
          // 模拟异步计算（实际可能涉及复杂计算）
          await new Promise(resolve => setTimeout(resolve, 100));
          const result = calculateTrainingMemory(trainingConfig);
          set({ trainingResult: result, trainingLoading: false });
          
          // 自动保存到历史记录
          if (preferences.autoSave) {
            get().addToHistory('training', trainingConfig, result);
          }
        } catch (error) {
          console.error('Training memory calculation error:', error);
          set({ trainingResult: null, trainingLoading: false });
        }
      },

      calculateInferenceMemory: async () => {
        const { inferenceConfig, preferences } = get();
        set({ inferenceLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          // 从模型数据库获取模型信息
          const { getModelById } = await import('@/lib/models-data');
          const modelInfo = getModelById(inferenceConfig.modelId);
          const result = calculateInferenceMemory(inferenceConfig, modelInfo);
          set({ inferenceResult: result, inferenceLoading: false });
          
          // 自动保存到历史记录
          if (preferences.autoSave) {
            get().addToHistory('inference', inferenceConfig, result, modelInfo?.name || inferenceConfig.modelId);
          }
        } catch (error) {
          console.error('Inference memory calculation error:', error);
          set({ inferenceResult: null, inferenceLoading: false });
        }
      },

      calculateFineTuningMemory: async () => {
        const { fineTuningConfig, preferences } = get();
        set({ fineTuningLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          // 从模型数据库获取模型信息
          const { getModelById } = await import('@/lib/models-data');
          const modelInfo = getModelById(fineTuningConfig.baseModel);
          const result = calculateFineTuningMemory(fineTuningConfig, modelInfo);
          set({ fineTuningResult: result, fineTuningLoading: false });
          
          // 自动保存到历史记录
          if (preferences.autoSave) {
            get().addToHistory('finetuning', fineTuningConfig, result, modelInfo?.name || fineTuningConfig.baseModel);
          }
        } catch (error) {
          console.error('Fine-tuning memory calculation error:', error);
          set({ fineTuningResult: null, fineTuningLoading: false });
        }
      },

      calculateGRPOMemory: async () => {
        const { grpoConfig, preferences } = get();
        set({ grpoLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          // 从模型数据库获取模型信息
          const { getModelById } = await import('@/lib/models-data');
          const modelInfo = getModelById(grpoConfig.modelId);
          const result = calculateGRPOMemory(grpoConfig, modelInfo);
          set({ grpoResult: result, grpoLoading: false });
          
          // 自动保存到历史记录
          if (preferences.autoSave) {
            get().addToHistory('grpo', grpoConfig, result, modelInfo?.name || grpoConfig.modelId);
          }
        } catch (error) {
          console.error('GRPO memory calculation error:', error);
          set({ grpoResult: null, grpoLoading: false });
        }
      },

      calculateMultimodalMemory: async () => {
        const { multimodalConfig, preferences } = get();
        set({ multimodalLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          // 从模型数据库获取模型信息
          const { getModelById } = await import('@/lib/models-data');
          const modelInfo = getModelById(multimodalConfig.modelId);
          const result = calculateMultimodalMemory(multimodalConfig, modelInfo);
          set({ multimodalResult: result, multimodalLoading: false });
          
          // 自动保存到历史记录
          if (preferences.autoSave) {
            get().addToHistory('multimodal', multimodalConfig, result, modelInfo?.name || multimodalConfig.modelId);
          }
        } catch (error) {
          console.error('Multimodal memory calculation error:', error);
          set({ multimodalResult: null, multimodalLoading: false });
        }
      },

      calculateAdvancedFineTuningMemory: async () => {
        const { advancedFineTuningConfig, preferences } = get();
        set({ advancedFineTuningLoading: true });

        try {
          // 获取当前语言设置
          const currentLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') || 'zh' : 'zh';

          // 使用MCP API进行计算
          const response = await fetch('/api/mcp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'tools/call',
              params: {
                name: 'calculate_advanced_finetuning_vram',
                arguments: {
                  ...advancedFineTuningConfig,
                  language: currentLanguage
                }
              },
              id: Date.now()
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error.message || 'MCP API calculation failed');
          }

          // 解析MCP API返回的结果
          const result = JSON.parse(data.result.content[0].text);
          set({ advancedFineTuningResult: result, advancedFineTuningLoading: false });

          // 自动保存到历史记录
          if (preferences.autoSave) {
            const modelName = `${advancedFineTuningConfig.modelType} Model`;
            get().addToHistory('finetuning', advancedFineTuningConfig, result, modelName);
          }
        } catch (error) {
          console.error('Advanced fine-tuning memory calculation error:', error);

          // 如果MCP API失败，回退到本地计算
          try {
            console.log('Falling back to local calculation...');
            const currentLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') || 'zh' : 'zh';
            const result = calculateAdvancedFineTuningMemory(advancedFineTuningConfig, currentLanguage);
            set({ advancedFineTuningResult: result, advancedFineTuningLoading: false });

            if (preferences.autoSave) {
              const modelName = `${advancedFineTuningConfig.modelType} Model`;
              get().addToHistory('finetuning', advancedFineTuningConfig, result, modelName);
            }
          } catch (fallbackError) {
            console.error('Local calculation also failed:', fallbackError);
            set({ advancedFineTuningResult: null, advancedFineTuningLoading: false });
          }
        }
      },

      getCurrentResult: () => {
        const { primaryTab, activeTab, trainingResult, inferenceResult, fineTuningResult, grpoResult, multimodalResult } = get();
        
        // 如果是多模态分组，直接返回多模态结果
        if (primaryTab === 'multimodal') {
          return multimodalResult;
        }
        
        // NLP分组根据activeTab返回对应结果
        switch (activeTab) {
          case 'training':
            return trainingResult;
          case 'inference':
            return inferenceResult;
          case 'finetuning':
            return fineTuningResult;
          case 'grpo':
            return grpoResult;
          default:
            return null;
        }
      }
    }),
    {
      name: 'ai-memory-calculator-store',
      storage: createJSONStorage(() => localStorage),
      // 只持久化配置和偏好，不持久化计算结果
      partialize: (state) => ({
        primaryTab: state.primaryTab,
        activeTab: state.activeTab,
        trainingConfig: state.trainingConfig,
        inferenceConfig: state.inferenceConfig,
        fineTuningConfig: state.fineTuningConfig,
        grpoConfig: state.grpoConfig,
        multimodalConfig: state.multimodalConfig,
        preferences: state.preferences,
        history: state.history.slice(0, 10), // 只保存最近10条历史记录
      }),
    }
  )
);

// 监听语言变化事件，重新计算高级微调显存
if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', (event: any) => {
    const store = useCalculatorStore.getState();
    // 如果当前有高级微调结果，延迟重新计算以确保localStorage已更新
    if (store.advancedFineTuningResult) {
      setTimeout(() => {
        store.calculateAdvancedFineTuningMemory();
      }, 500); // 增加延迟到500ms确保localStorage已更新
    }
  });
}