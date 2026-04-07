/**
 * VRAM Calculator MCP Server Implementation
 */

import { z } from 'zod';

// Types
interface ModelInfo {
  id: string;
  name: string;
  params: number;
  architecture: string;
  type: 'nlp' | 'multimodal' | 'embedding';
  memoryFootprint?: number;
}

interface GPUInfo {
  name: string;
  vram: number;
  price: number;
  architecture: string;
  powerConsumption: number;
  memoryBandwidth: number;
}

interface VRAMCalculationResult {
  totalVRAM: number;
  breakdown: {
    modelWeights: number;
    optimizer: number;
    gradients: number;
    activations: number;
    overhead: number;
  };
  recommendations: GPUInfo[];
  optimizations: string[];
}

export class VRAMCalculatorServer {
  private models: ModelInfo[] = [
    // NLP Models
    { id: 'llama-2-7b', name: 'Llama 2 7B', params: 7, architecture: 'transformer', type: 'nlp' },
    { id: 'llama-2-13b', name: 'Llama 2 13B', params: 13, architecture: 'transformer', type: 'nlp' },
    { id: 'llama-2-70b', name: 'Llama 2 70B', params: 70, architecture: 'transformer', type: 'nlp' },
    { id: 'qwen2.5-7b', name: 'Qwen2.5 7B', params: 7, architecture: 'transformer', type: 'nlp' },
    { id: 'qwen2.5-14b', name: 'Qwen2.5 14B', params: 14, architecture: 'transformer', type: 'nlp' },
    { id: 'qwen2.5-32b', name: 'Qwen2.5 32B', params: 32, architecture: 'transformer', type: 'nlp' },
    { id: 'qwen2.5-72b', name: 'Qwen2.5 72B', params: 72, architecture: 'transformer', type: 'nlp' },
    { id: 'deepseek-v2', name: 'DeepSeek V2', params: 236, architecture: 'moe', type: 'nlp' },
    { id: 'yi-34b', name: 'Yi 34B', params: 34, architecture: 'transformer', type: 'nlp' },
    { id: 'baichuan2-13b', name: 'Baichuan2 13B', params: 13, architecture: 'transformer', type: 'nlp' },
    
    // Multimodal Models
    { id: 'qwen2-vl-7b', name: 'Qwen2-VL 7B', params: 7, architecture: 'multimodal', type: 'multimodal' },
    { id: 'llava-1.5-7b', name: 'LLaVA 1.5 7B', params: 7, architecture: 'multimodal', type: 'multimodal' },
    { id: 'llava-1.5-13b', name: 'LLaVA 1.5 13B', params: 13, architecture: 'multimodal', type: 'multimodal' },
    { id: 'cogvlm-17b', name: 'CogVLM 17B', params: 17, architecture: 'multimodal', type: 'multimodal' },
    { id: 'internvl-chat-v1.5', name: 'InternVL Chat V1.5', params: 26, architecture: 'multimodal', type: 'multimodal' },
    
    // Embedding Models
    { id: 'bge-large-zh', name: 'BGE Large ZH', params: 0.3, architecture: 'bert', type: 'embedding' },
    { id: 'text2vec-large', name: 'Text2Vec Large', params: 0.3, architecture: 'bert', type: 'embedding' },
    { id: 'gte-large', name: 'GTE Large', params: 0.3, architecture: 'bert', type: 'embedding' }
  ];

  private gpus: GPUInfo[] = [
    { name: 'RTX 4060', vram: 8, price: 299, architecture: 'Ada Lovelace', powerConsumption: 115, memoryBandwidth: 272 },
    { name: 'RTX 4060 Ti', vram: 16, price: 499, architecture: 'Ada Lovelace', powerConsumption: 165, memoryBandwidth: 288 },
    { name: 'RTX 4070', vram: 12, price: 599, architecture: 'Ada Lovelace', powerConsumption: 200, memoryBandwidth: 504 },
    { name: 'RTX 4070 Ti', vram: 12, price: 799, architecture: 'Ada Lovelace', powerConsumption: 285, memoryBandwidth: 504 },
    { name: 'RTX 4080', vram: 16, price: 1199, architecture: 'Ada Lovelace', powerConsumption: 320, memoryBandwidth: 717 },
    { name: 'RTX 4090', vram: 24, price: 1599, architecture: 'Ada Lovelace', powerConsumption: 450, memoryBandwidth: 1008 },
    { name: 'RTX 5090', vram: 32, price: 1999, architecture: 'Blackwell', powerConsumption: 575, memoryBandwidth: 1792 },
    { name: 'A100 40GB', vram: 40, price: 10000, architecture: 'Ampere', powerConsumption: 400, memoryBandwidth: 1555 },
    { name: 'A100 80GB', vram: 80, price: 15000, architecture: 'Ampere', powerConsumption: 400, memoryBandwidth: 1935 },
    { name: 'H100 80GB', vram: 80, price: 25000, architecture: 'Hopper', powerConsumption: 700, memoryBandwidth: 3350 },
    { name: 'L40S', vram: 48, price: 8000, architecture: 'Ada Lovelace', powerConsumption: 350, memoryBandwidth: 864 },
    { name: 'A6000', vram: 48, price: 4500, architecture: 'Ampere', powerConsumption: 300, memoryBandwidth: 768 }
  ];

  // Resource handlers
  async listResources() {
    return {
      resources: [
        {
          uri: 'models://nlp',
          name: 'NLP Models Database',
          description: 'Comprehensive database of NLP/Language models with detailed specifications'
        },
        {
          uri: 'models://multimodal',
          name: 'Multimodal Models Database', 
          description: 'Database of multimodal models supporting text, image, audio, and video'
        },
        {
          uri: 'models://embedding',
          name: 'Embedding Models Database',
          description: 'Database of text embedding and reranking models'
        },
        {
          uri: 'gpu://specs',
          name: 'GPU Specifications Database',
          description: 'Detailed specifications and pricing for consumer and datacenter GPUs'
        },
        {
          uri: 'gpu://recommendations',
          name: 'GPU Recommendations',
          description: 'Intelligent GPU recommendations based on VRAM requirements'
        },
        {
          uri: 'formulas://vram',
          name: 'VRAM Calculation Formulas',
          description: 'Comprehensive documentation of VRAM calculation methodologies'
        }
      ]
    };
  }

  async readResource(uri: string) {
    switch (uri) {
      case 'models://nlp':
        return {
          contents: [{
            uri,
            text: JSON.stringify({
              total: this.models.filter(m => m.type === 'nlp').length,
              models: this.models.filter(m => m.type === 'nlp')
            }, null, 2)
          }]
        };
        
      case 'models://multimodal':
        return {
          contents: [{
            uri,
            text: JSON.stringify({
              total: this.models.filter(m => m.type === 'multimodal').length,
              models: this.models.filter(m => m.type === 'multimodal')
            }, null, 2)
          }]
        };
        
      case 'models://embedding':
        return {
          contents: [{
            uri,
            text: JSON.stringify({
              total: this.models.filter(m => m.type === 'embedding').length,
              models: this.models.filter(m => m.type === 'embedding')
            }, null, 2)
          }]
        };
        
      case 'gpu://specs':
        return {
          contents: [{
            uri,
            text: JSON.stringify({
              total: this.gpus.length,
              gpus: this.gpus
            }, null, 2)
          }]
        };
        
      case 'formulas://vram':
        return {
          contents: [{
            uri,
            text: `# VRAM Calculation Formulas

## Universal LLM VRAM Framework

Total VRAM = Model Weights + Optimizer States + Gradients + Activations + Overhead

### 1. Model Weights
- FP32: params × 4 bytes
- FP16/BF16: params × 2 bytes  
- INT8: params × 1 byte
- INT4: params × 0.5 bytes

### 2. Optimizer States (Training)
- Adam: model_weights × 2 (momentum + variance)
- AdamW: model_weights × 2
- SGD: model_weights × 1

### 3. Gradients (Training)
- Same precision as model weights
- Size = model_weights

### 4. Activations
- Depends on: batch_size, sequence_length, hidden_size, num_layers
- Approximate: batch_size × seq_len × hidden_size × num_layers × precision_bytes

### 5. Overhead
- Framework overhead: ~10-20% of total
- CUDA context: ~1-2GB
- Other buffers: ~5-10% of model size

## Calculation Modes

### Inference Mode
Total = Model Weights + Activations + Overhead

### Training Mode  
Total = Model Weights + Optimizer States + Gradients + Activations + Overhead

### Fine-tuning Mode
- LoRA: Reduced optimizer states and gradients
- Full fine-tuning: Same as training mode
`
          }]
        };
        
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  // Tool handlers
  async listTools() {
    return {
      tools: [
        {
          name: 'calculate_vram',
          description: 'Calculate VRAM requirements for model training or inference',
          inputSchema: {
            type: 'object',
            properties: {
              modelId: { type: 'string', description: 'Model identifier' },
              mode: { type: 'string', enum: ['inference', 'training', 'finetuning'], description: 'Calculation mode' },
              batchSize: { type: 'number', description: 'Batch size', default: 1 },
              sequenceLength: { type: 'number', description: 'Sequence length', default: 2048 },
              precision: { type: 'string', enum: ['fp32', 'fp16', 'bf16', 'int8', 'int4'], default: 'fp16' }
            },
            required: ['modelId', 'mode']
          }
        },
        {
          name: 'recommend_gpu',
          description: 'Recommend suitable GPUs based on VRAM requirements',
          inputSchema: {
            type: 'object',
            properties: {
              vramRequired: { type: 'number', description: 'Required VRAM in GB' },
              budget: { type: 'number', description: 'Budget limit in USD', default: 10000 },
              useCase: { type: 'string', enum: ['inference', 'training', 'development'], default: 'training' },
              multiGPU: { type: 'boolean', description: 'Allow multi-GPU recommendations', default: false }
            },
            required: ['vramRequired']
          }
        },
        {
          name: 'compare_models',
          description: 'Compare VRAM requirements across multiple models',
          inputSchema: {
            type: 'object',
            properties: {
              modelIds: { type: 'array', items: { type: 'string' }, description: 'List of model IDs to compare' },
              mode: { type: 'string', enum: ['inference', 'training', 'finetuning'], default: 'training' },
              batchSize: { type: 'number', default: 1 },
              sequenceLength: { type: 'number', default: 2048 },
              precision: { type: 'string', enum: ['fp32', 'fp16', 'bf16', 'int8', 'int4'], default: 'fp16' }
            },
            required: ['modelIds']
          }
        }
      ]
    };
  }

  async callTool(name: string, args: any) {
    switch (name) {
      case 'calculate_vram':
        return this.calculateVRAM(args);
      case 'recommend_gpu':
        return this.recommendGPU(args);
      case 'compare_models':
        return this.compareModels(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async calculateVRAM(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    const { modelId, mode, batchSize = 1, sequenceLength = 2048, precision = 'fp16' } = args;
    
    const model = this.models.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Precision multipliers
    const precisionBytes: Record<string, number> = {
      fp32: 4, fp16: 2, bf16: 2, int8: 1, int4: 0.5
    };

    const bytesPerParam = precisionBytes[precision];
    const modelWeights = model.params * 1e9 * bytesPerParam / (1024 ** 3); // GB

    let optimizer = 0;
    let gradients = 0;
    
    if (mode === 'training') {
      optimizer = modelWeights * 2; // Adam optimizer
      gradients = modelWeights;
    } else if (mode === 'finetuning') {
      optimizer = modelWeights * 0.1; // LoRA approximation
      gradients = modelWeights * 0.1;
    }

    // Activations (simplified calculation)
    const hiddenSize = Math.sqrt(model.params * 1e9 / 12); // Rough estimate
    const numLayers = Math.log2(model.params) * 4; // Rough estimate
    const activations = (batchSize * sequenceLength * hiddenSize * numLayers * bytesPerParam) / (1024 ** 3);

    const overhead = (modelWeights + optimizer + gradients + activations) * 0.15; // 15% overhead

    const result: VRAMCalculationResult = {
      totalVRAM: modelWeights + optimizer + gradients + activations + overhead,
      breakdown: {
        modelWeights,
        optimizer,
        gradients,
        activations,
        overhead
      },
      recommendations: this.gpus.filter(gpu => gpu.vram >= (modelWeights + optimizer + gradients + activations + overhead)).slice(0, 3),
      optimizations: [
        precision !== 'fp16' ? 'Consider using FP16 precision to reduce memory usage' : '',
        batchSize > 1 ? 'Reduce batch size to lower activation memory' : '',
        mode === 'training' ? 'Consider LoRA fine-tuning instead of full training' : ''
      ].filter(Boolean)
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async recommendGPU(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    const { vramRequired, budget = 10000, useCase = 'training', multiGPU = false } = args;
    
    let suitableGPUs = this.gpus.filter(gpu => 
      gpu.vram >= vramRequired && gpu.price <= budget
    );

    if (suitableGPUs.length === 0 && multiGPU) {
      // Consider multi-GPU setups
      suitableGPUs = this.gpus.filter(gpu => 
        gpu.vram * 2 >= vramRequired && gpu.price * 2 <= budget
      ).map(gpu => ({
        ...gpu,
        name: `2x ${gpu.name}`,
        vram: gpu.vram * 2,
        price: gpu.price * 2
      }));
    }

    // Sort by price-performance ratio
    suitableGPUs.sort((a, b) => (a.price / a.vram) - (b.price / b.vram));

    const result = {
      vramRequired,
      budget,
      useCase,
      recommendations: suitableGPUs.slice(0, 5).map(gpu => ({
        ...gpu,
        utilization: Math.min(100, (vramRequired / gpu.vram) * 100),
        pricePerGB: gpu.price / gpu.vram
      })),
      summary: `Found ${suitableGPUs.length} GPU options within budget for ${vramRequired}GB VRAM requirement`
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async compareModels(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
    const { modelIds, mode = 'training', batchSize = 1, sequenceLength = 2048, precision = 'fp16' } = args;
    
    const comparisons = [];
    
    for (const modelId of modelIds) {
      try {
        const result = await this.calculateVRAM({ modelId, mode, batchSize, sequenceLength, precision });
        const calculation = JSON.parse(result.content[0].text);
        comparisons.push({
          modelId,
          modelName: this.models.find(m => m.id === modelId)?.name || modelId,
          totalVRAM: calculation.totalVRAM,
          breakdown: calculation.breakdown
        });
      } catch (error) {
        comparisons.push({
          modelId,
          error: (error as Error).message
        });
      }
    }

    // Sort by total VRAM
    comparisons.sort((a, b) => (a.totalVRAM || 0) - (b.totalVRAM || 0));

    const result = {
      mode,
      configuration: { batchSize, sequenceLength, precision },
      comparisons,
      summary: `Compared ${modelIds.length} models in ${mode} mode`
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}
