// Memory Calculator Worker
// 在独立线程中执行复杂的显存计算

self.addEventListener('message', function(e) {
  const { type, config } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'training':
        result = calculateTrainingMemory(config);
        break;
      case 'inference':
        result = calculateInferenceMemory(config);
        break;
      case 'finetuning':
        result = calculateFineTuningMemory(config);
        break;
      default:
        throw new Error('Unknown calculation type');
    }
    
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});

function getPrecisionBytes(precision) {
  switch (precision) {
    case 'FP32': return 4;
    case 'FP16': 
    case 'BF16': return 2;
    case 'INT8': return 1;
    case 'INT4': return 0.5;
    default: return 4;
  }
}

function calculateTrainingMemory(config) {
  const { modelParams, batchSize, sequenceLength, precision, optimizer, gradientCheckpointing } = config;
  
  const paramBytes = getPrecisionBytes(precision);
  const modelParamsGB = (modelParams * 1e9 * paramBytes) / (1024 ** 3);
  const gradientsGB = modelParamsGB;
  const optimizerGB = (modelParams * 1e9 * getPrecisionBytes('FP32') * (optimizer === 'SGD' ? 1 : 2)) / (1024 ** 3);
  const activationsGB = gradientCheckpointing ? 
    calculateActivations(batchSize, sequenceLength, 4096, 32, precision) * 0.3 :
    calculateActivations(batchSize, sequenceLength, 4096, 32, precision);
  
  const total = modelParamsGB + gradientsGB + optimizerGB + activationsGB;
  
  return {
    modelParams: modelParamsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: activationsGB,
    kvCache: 0,
    total,
    breakdown: [
      { label: '模型参数', value: modelParamsGB, percentage: (modelParamsGB / total) * 100 },
      { label: '梯度', value: gradientsGB, percentage: (gradientsGB / total) * 100 },
      { label: '优化器状态', value: optimizerGB, percentage: (optimizerGB / total) * 100 },
      { label: '激活值', value: activationsGB, percentage: (activationsGB / total) * 100 },
    ]
  };
}

function calculateInferenceMemory(config) {
  // 简化的推理计算
  const { modelParams = 7, precision, quantization, batchSize, sequenceLength, kvCacheRatio } = config;
  const quantizationRatio = quantization === 'INT8' ? 0.25 : quantization === 'INT4' ? 0.125 : 1.0;
  const paramBytes = getPrecisionBytes(precision);
  
  const modelParamsGB = (modelParams * 1e9 * paramBytes * quantizationRatio) / (1024 ** 3);
  const kvCacheGB = calculateKVCache(batchSize, sequenceLength, 4096, 32, 32, precision) * kvCacheRatio;
  const activationsGB = calculateActivations(batchSize, sequenceLength, 4096, 32, precision) * 0.1;
  
  const total = modelParamsGB + kvCacheGB + activationsGB;
  
  return {
    modelParams: modelParamsGB,
    gradients: 0,
    optimizer: 0,
    activations: activationsGB,
    kvCache: kvCacheGB,
    total,
    breakdown: [
      { label: '模型参数', value: modelParamsGB, percentage: (modelParamsGB / total) * 100 },
      { label: 'KV缓存', value: kvCacheGB, percentage: (kvCacheGB / total) * 100 },
      { label: '激活值', value: activationsGB, percentage: (activationsGB / total) * 100 },
    ]
  };
}

function calculateFineTuningMemory(config) {
  // 简化的微调计算
  const { baseModelParams = 7, method, loraRank = 4, quantization, precision } = config;
  const quantizationRatio = quantization === 'INT8' ? 0.25 : quantization === 'INT4' ? 0.125 : 1.0;
  const paramBytes = getPrecisionBytes(precision);
  
  let modelParamsGB = (baseModelParams * 1e9 * paramBytes) / (1024 ** 3);
  let gradientsGB = 0;
  let optimizerGB = 0;
  let activationsGB = 0;
  
  if (method === 'LoRA' || method === 'QLoRA') {
    if (method === 'QLoRA') {
      modelParamsGB *= quantizationRatio;
    }
    const loraParams = baseModelParams * (2 * loraRank) / 4096;
    const loraParamsGB = (loraParams * 1e9 * paramBytes) / (1024 ** 3);
    gradientsGB = loraParamsGB;
    optimizerGB = loraParamsGB * 2;
    activationsGB = method === 'LoRA' ? 1.0 : 0.8;
  } else {
    gradientsGB = modelParamsGB;
    optimizerGB = (baseModelParams * 1e9 * getPrecisionBytes('FP32') * 2) / (1024 ** 3);
    activationsGB = 2.0;
  }
  
  const total = modelParamsGB + gradientsGB + optimizerGB + activationsGB;
  
  return {
    modelParams: modelParamsGB,
    gradients: gradientsGB,
    optimizer: optimizerGB,
    activations: activationsGB,
    kvCache: 0,
    total,
    breakdown: [
      { label: '模型参数', value: modelParamsGB, percentage: (modelParamsGB / total) * 100 },
      { label: '梯度', value: gradientsGB, percentage: (gradientsGB / total) * 100 },
      { label: '优化器状态', value: optimizerGB, percentage: (optimizerGB / total) * 100 },
      { label: '激活值', value: activationsGB, percentage: (activationsGB / total) * 100 },
    ]
  };
}

function calculateActivations(batchSize, sequenceLength, hiddenSize, numLayers, precision) {
  const precisionBytes = getPrecisionBytes(precision);
  const attentionActivations = batchSize * sequenceLength * hiddenSize * 3 + 
                              batchSize * sequenceLength * sequenceLength;
  const ffnActivations = batchSize * sequenceLength * hiddenSize * 4 * 2;
  const totalActivations = (attentionActivations + ffnActivations) * numLayers * precisionBytes;
  return totalActivations / (1024 ** 3);
}

function calculateKVCache(batchSize, sequenceLength, hiddenSize, numLayers, numHeads, precision) {
  const precisionBytes = getPrecisionBytes(precision);
  const kvCacheBytes = batchSize * sequenceLength * hiddenSize * numLayers * 2 * precisionBytes;
  return kvCacheBytes / (1024 ** 3);
} 