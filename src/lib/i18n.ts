/**
 * 中文文案集中管理
 * 所有UI文案统一存放，模型名称和GPU型号保留英文原名
 */
export const ZH = {
  // 站点信息
  site: {
    title: 'LLM 显存计算器',
    subtitle: '专业GPU显存需求分析工具',
    description: '精确估算大语言模型在不同GPU硬件上的显存需求及推理性能，为您的AI部署规划提供专业指导。',
  },

  // 导航
  nav: {
    calculator: '计算器',
    history: '历史记录',
    help: '帮助',
    presets: '预设模板',
    settings: '设置',
  },

  // 主标签页
  tabs: {
    nlp: 'NLP / 语言模型',
    multimodal: '多模态模型',
    advanced: '高级微调',
    inference: '推理计算',
    finetuning: '微调计算',
    training: '训练计算',
    grpo: 'GRPO 偏好优化',
  },

  // 模型配置
  model: {
    title: '模型配置',
    selectModel: '选择模型',
    selectModelPlaceholder: '请选择要计算的模型',
    modelParams: '模型参数量',
    quantization: '推理量化',
    kvCacheQuant: 'KV 缓存量化',
    precision: '计算精度',
    architecture: '模型架构',
  },

  // GPU配置
  gpu: {
    title: '硬件配置',
    selectGPU: '选择 GPU',
    customVRAM: '自定义显存 (GB)',
    gpuCount: 'GPU 数量',
    gpuRecommendation: 'GPU 推荐方案',
    memoryCapacity: '显存容量',
    marketPrice: '市场价格',
    cloudPrice: '云服务价格',
    architecture: '架构',
    fitScore: '适合度',
    singleCard: '单卡推荐',
    multiCard: '多卡配置',
    totalMemory: '总显存',
    utilization: '利用率',
    noSuitable: '暂无合适的GPU推荐',
  },

  // 运行参数
  runtime: {
    title: '运行参数',
    batchSize: '批量大小',
    seqLength: '序列长度',
    concurrentUsers: '并发用户数',
    kvCacheRatio: 'KV 缓存比例',
  },

  // 高级选项
  advanced: {
    title: '高级选项',
    enableOffload: '启用 CPU/RAM 卸载',
    offloadDesc: '当GPU显存不足时，将部分数据卸载到系统内存',
    gradientCheckpoint: '梯度检查点',
    mixedPrecision: '混合精度训练',
    optimizer: '优化器',
  },

  // 微调配置
  finetune: {
    method: '微调方法',
    loraRank: 'LoRA Rank',
    loraAlpha: 'LoRA Alpha',
    baseModel: '基础模型',
    trainableParams: '可训练参数',
    trainableRatio: '可训练比例',
  },

  // GRPO 配置
  grpo: {
    numGenerations: '生成数量 (组大小)',
    maxPromptLength: '最大提示长度',
    maxCompletionLength: '最大生成长度',
    gradAccumSteps: '梯度累积步数',
    use8BitOptimizer: '使用 8-bit 优化器',
  },

  // 结果展示
  results: {
    title: '计算结果',
    vramUsage: '显存使用',
    vramTotal: '总显存需求',
    ready: '就绪',
    insufficient: '显存不足',
    tps: '生成速度',
    tpsUnit: 'tokens/s',
    ttft: '首个令牌时间',
    ttftUnit: 'ms',
    throughput: '总吞吐量',
    throughputUnit: 'tokens/s',
    breakdown: '显存组成',
    configSummary: '配置摘要',
  },

  // 显存组成标签
  breakdown: {
    modelWeights: '模型权重',
    modelParams: '模型参数',
    optimizerStates: '优化器状态',
    gradients: '梯度',
    activations: '激活值',
    kvCache: 'KV 缓存',
    embeddingLayer: '嵌入层',
    attentionLayers: '注意力层',
    ffnLayers: '前馈网络层',
    attentionScores: '注意力分数',
    positionEncoding: '位置编码',
    otherOverheads: '其他开销',
    loraParams: 'LoRA 参数',
    visionEncoder: '视觉编码器',
    textEncoder: '文本编码器',
    fusionLayer: '融合层',
    router: '路由器',
    activeExperts: '激活专家',
    convLayers: '卷积层',
    featureMaps: '特征图',
    fcLayers: '全连接层',
    batchNorm: '批归一化',
    dataAugmentation: '数据增强',
  },

  // 量化选项
  quant: {
    none: '无量化',
    fp32: 'FP32 (32位浮点)',
    fp16: 'FP16 (16位浮点)',
    bf16: 'BF16 (Brain Float16)',
    fp8: 'FP8 (8位浮点)',
    int8: 'INT8 (8位整数)',
    int4: 'INT4 (4位整数)',
  },

  // 功能特色
  features: {
    preciseCalc: '精确计算公式',
    preciseCalcDesc: '基于最新AI工程实践，支持混合精度、梯度检查点、量化等优化技术的精确显存计算',
    richModels: '130+ 主流模型',
    richModelsDesc: '涵盖 Qwen、DeepSeek、Llama、ChatGLM 等热门模型系列，参数规格实时更新',
    smartGPU: '智能 GPU 推荐',
    smartGPUDesc: '基于显存需求自动匹配最适合的 NVIDIA GPU，包含价格对比和利用率分析',
  },

  // 预设模板分类
  presetCategory: {
    beginner: '入门级',
    professional: '专业级',
    enterprise: '企业级',
    research: '科研级',
  },

  // 历史记录
  history: {
    title: '计算历史',
    clearAll: '清空全部',
    compare: '对比',
    export: '导出',
    noRecords: '暂无历史记录',
    addToCompare: '添加到对比',
    removeFromCompare: '从对比中移除',
  },

  // 帮助
  help: {
    title: '帮助与说明',
    calcPrinciple: '计算原理',
    faq: '常见问题',
    references: '参考文献',
  },

  // FAQ 条目
  faq: [
    {
      q: '计算结果的准确性如何？',
      a: '本工具基于理论公式进行估算，考虑了模型参数量、量化方式、KV缓存、激活值等关键因素。实际显存占用可能因推理框架（如 vLLM、llama.cpp）、CUDA 版本、驱动程序开销等因素有所差异，通常误差在 10-20% 以内。',
    },
    {
      q: '如何计算 MoE（混合专家）模型的显存？',
      a: 'MoE 模型虽然总参数量很大，但推理时只激活部分专家。计算器会根据活跃参数量（而非总参数量）来估算实际显存需求。例如 DeepSeek-V3 总参数 671B，但活跃参数仅 37B。',
    },
    {
      q: '量化对显存和性能有什么影响？',
      a: '量化可以显著减少显存占用：INT8 约为 FP16 的一半，INT4 约为 FP16 的四分之一。但量化可能会略微降低模型精度。对于推理场景，INT4/INT8 量化通常是性价比最优的选择。',
    },
    {
      q: '什么是 KV 缓存？为什么它占用这么多显存？',
      a: 'KV 缓存存储了已经计算过的 Key 和 Value 矩阵，避免重复计算。它的大小与序列长度、批量大小、模型层数和隐藏维度成正比。长上下文场景下，KV 缓存可能占据大量显存。',
    },
    {
      q: '多GPU并行如何影响显存需求？',
      a: '多GPU并行时，模型参数可以在多个GPU间分摊（模型并行），每个GPU只需存储部分参数。但KV缓存和激活值通常需要在每个GPU上完整存储。因此多GPU并不能线性减少每卡显存需求。',
    },
  ],

  // 页脚
  footer: {
    description: 'LLM 显存计算器 · 专业GPU显存需求分析工具',
    features: '支持推理、训练、微调等多场景 · 130+模型数据库 · 40+ NVIDIA GPU规格对比',
    copyright: '© 2024 LLM VRAM Calculator',
  },

  // 通用
  common: {
    loading: '加载中...',
    calculating: '计算中...',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    reset: '重置',
    save: '保存',
    delete: '删除',
    copy: '复制',
    share: '分享',
    download: '下载',
    gb: 'GB',
    mb: 'MB',
    tb: 'TB',
    unit: '张',
    card: '卡',
    machine: '台',
  },
} as const;
