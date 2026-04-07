# Advanced Hyperparameter System Usage Guide

## Overview

The advanced hyperparameter system has been successfully integrated into the AI VRAM Calculator, supporting precise VRAM calculation and intelligent optimization recommendations for four model types. The system now provides an independent "Advanced Fine-tuning" main menu, offering more powerful configuration and calculation capabilities for professional users.

## Main Menu Structure

The AI VRAM Calculator now includes three main menu items:

### 1. NLP/Language Models
- Basic language model inference and training calculations
- Includes inference VRAM, training VRAM, fine-tuning VRAM, GRPO VRAM and other basic functions

### 2. Multimodal Models  
- VRAM calculations for multimodal models
- Supports image-text, video-text and other multimodal scenarios

### 3. Advanced Fine-tuning ⭐ **New Feature**
- **Professional hyperparameter configuration system**
- **Precise calculations for four model types**
- **Intelligent optimization recommendations and parameter validation**
- **GPU recommendations and cost analysis**

## Supported Model Types

### 1. NLP Models (Natural Language Processing)
- **Supported Architectures**: Transformer, BERT, GPT, T5, LLaMA, ChatGLM
- **Key Hyperparameters**: 
  - Model Size: 125M - 175B+
  - Sequence Length: 512 - 32768 tokens
  - LoRA Configuration: rank 4-256, alpha 16-128
  - Learning Rate: 1e-6 ~ 1e-4

### 2. Multimodal Models
- **Supported Architectures**: CLIP, BLIP, LLaVA, GPT-4V, Flamingo
- **Key Hyperparameters**:
  - Image Resolution: 224×224 ~ 1024×1024
  - Patch Size: 14×14 ~ 32×32
  - Vision/Text Encoder Configuration
  - Modal Fusion Strategy

### 3. MoE Models (Mixture of Experts)
- **Supported Architectures**: Switch Transformer, GLaM, PaLM-2, DeepSeek-MoE
- **Key Hyperparameters**:
  - Number of Experts: 8-2048
  - Active Experts: 1-8
  - Routing Strategy: Top-K, Switch, Expert Choice
  - Load Balance Weight

### 4. CNN Models (Convolutional Neural Networks)
- **Supported Architectures**: ResNet, EfficientNet, ConvNeXt, RegNet, DenseNet
- **Key Hyperparameters**:
  - Input Image Size: 224×224 ~ 512×512
  - Batch Size: 32-512
  - Learning Rate: 1e-4 ~ 1e-2
  - Data Augmentation Strategy

## Precise Mathematical Formulas

### NLP Model VRAM Calculation
```
Total VRAM = Model Weights + Optimizer States + Gradients + Activations + KV Cache + LoRA Parameters + Reserved

Where:
- Model Weights = P × B
- Optimizer States = P × B × M (M is optimizer multiplier)
- Gradients = P × B
- Activations = B × S × H × L × N
- KV Cache = 2 × B × S × H × L × precision_bytes
- LoRA Parameters = 2 × Σ(r × (d_in + d_out)) × B
```

### Multimodal Model VRAM Calculation
```
Total VRAM = Vision Encoder + Text Encoder + Fusion Layer + Image Features + Cross-Modal Attention + Optimizer + Gradients + Reserved

Where:
- Vision Encoder = (H×W×C + P_vision) × B_precision
- Text Encoder = P_text × B_precision
- Fusion Layer = P_fusion × B_precision
- Image Features = B × (H×W/P²) × D × B_precision
- Cross-Modal Attention = B × S_text × S_vision × B_precision
```

### MoE Model VRAM Calculation
```
Total VRAM = Router + Active Experts + Routing Probabilities + Expert Assignment + Load Balance + Optimizer + Gradients + Reserved

Where:
- Router = H × E × B_precision
- Active Experts = K × P_expert × B_precision
- Routing Probabilities = B × S × E × B_precision
- Expert Assignment = B × S × K × B_precision
- Load Balance = E × B_precision
```

### CNN Model VRAM Calculation
```
Total VRAM = Convolution Layers + Feature Maps + Fully Connected + Batch Norm + Data Augmentation + Optimizer + Gradients + Reserved

Where:
- Convolution Layers = (K×K×C_in×C_out + C_out) × B_precision
- Feature Maps = B × Σ(H_i × W_i × C_i) × B_precision
- Fully Connected = (D_in × D_out + D_out) × B_precision
- Batch Norm = 4 × C × B_precision
- Data Augmentation = B × H × W × C × B_precision × 2
```

## Intelligent Optimization Features

### 1. Real-time Parameter Validation
The advanced fine-tuning system provides three-layer validation:

#### **Error Checking** (Red Alerts)
- Parameters outside valid ranges
- Incompatible architecture parameters
- Missing required parameters
- Mathematical constraint violations

#### **Warning Alerts** (Orange Alerts)  
- Parameters within valid range but not optimal
- Configurations that may affect performance
- Suboptimal resource utilization settings

#### **Configuration Suggestions** (Blue Tips)
- Parameter recommendations based on best practices
- Hardware-specific optimization suggestions
- Cost-effectiveness optimization recommendations

### 2. Intelligent Optimization Recommendation System

#### **Memory Optimization**
- **High Priority**: Emergency optimization for insufficient VRAM
- **Medium Priority**: VRAM utilization optimization
- **Low Priority**: Memory efficiency improvements

#### **Performance Optimization**
- Computational efficiency analysis
- Optimizer recommendations for different model types
- Parallelization strategies
- Mixed precision training suggestions

#### **Cost Optimization**  
- Hardware cost analysis
- PEFT method recommendations
- Cloud service cost analysis
- Training time vs cost balance

#### **Stability Optimization**
- Learning rate adjustments
- Regularization parameter optimization
- Gradient processing strategies
- Expert load balancing for MoE models

### 3. GPU Recommendation System

#### **Smart Matching Algorithm**
- VRAM requirement analysis
- 75% optimal utilization target
- Cost-effectiveness analysis
- Market availability consideration

#### **Recommendation Levels**
- **🟢 Excellent**: 60-80% utilization, best value
- **🟡 Good**: 45-85% utilization, sufficient performance
- **🟠 Acceptable**: 85-95% utilization, near limit
- **🔴 Insufficient**: >95% utilization, insufficient VRAM

## Usage Methods

### 1. Web Interface
1. Open the AI VRAM Calculator homepage
2. Click the **"Advanced Fine-tuning"** main menu tab at the top
3. Select model type (NLP/Multimodal/MoE/CNN)
4. Configure in the configuration panel:
   - **Basic Configuration**: Core parameter settings
   - **Advanced Configuration**: Detailed architecture parameters
   - **Optimization Settings**: Performance and stability parameters
5. View in real-time:
   - Precise VRAM calculation results
   - Parameter validation and error alerts
   - Intelligent optimization recommendations
   - GPU recommendations and cost analysis

### 2. MCP API Calls

#### New API Interface: `calculate_advanced_finetuning_vram`

**Endpoint**: `POST /api/mcp/tools/call`
**Tool Name**: `calculate_advanced_finetuning_vram`

**Required Parameters**:
- `modelType`: Model type ("nlp" | "multimodal" | "moe" | "cnn")
- `modelSize`: Model size in billions
- `architectureType`: Architecture type
- `precision`: Training precision ("fp32" | "fp16" | "bf16" | "int8" | "int4")
- `batchSize`: Batch size
- `learningRate`: Learning rate
- `optimizer`: Optimizer type ("sgd" | "adam" | "adamw")
- `trainingEpochs`: Number of training epochs

**Example Usage**:
```bash
# NLP Model - LLaMA-7B LoRA Fine-tuning
curl -X POST http://localhost:3000/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "calculate_advanced_finetuning_vram",
    "arguments": {
      "modelType": "nlp",
      "modelSize": 7.0,
      "architectureType": "LLaMA",
      "precision": "fp16",
      "batchSize": 4,
      "sequenceLength": 2048,
      "learningRate": 2e-5,
      "optimizer": "adamw",
      "trainingEpochs": 3,
      "hiddenSize": 4096,
      "numLayers": 32,
      "loraRank": 16,
      "loraAlpha": 32
    }
  }'
```

## Configuration Examples

### LLaMA-7B LoRA Fine-tuning
```typescript
const nlpConfig = {
  modelSize: 7.0,
  architectureType: 'LLaMA',
  precision: 'FP16',
  batchSize: 4,
  sequenceLength: 2048,
  learningRate: 2e-5,
  optimizer: 'AdamW',
  loraRank: 16,
  loraAlpha: 32,
  loraTargetModules: ['q_proj', 'v_proj']
};
```

### LLaVA Multimodal Fine-tuning
```typescript
const multimodalConfig = {
  modelSize: 7.0,
  architectureType: 'LLaVA',
  imageResolution: 336,
  patchSize: 14,
  batchSize: 8,
  visionEncoderType: 'ViT',
  textEncoderType: 'BERT'
};
```

## Technical Features

- ✅ **Precise Calculation**: Based on rigorous mathematical formulas, avoiding approximations
- ✅ **Real-time Validation**: Real-time validation and error alerts for configuration parameters
- ✅ **Intelligent Recommendations**: AI-driven optimization recommendation system
- ✅ **GPU Recommendations**: Hardware recommendations based on requirements
- ✅ **MCP Compatible**: Standardized API interfaces
- ✅ **Type Safety**: Complete TypeScript type definitions
- ✅ **Responsive UI**: Modern user interface

## Notes

1. **Parameter Ranges**: Ensure parameters are within recommended ranges for optimal results
2. **VRAM Reserve**: System automatically reserves 1-2GB VRAM for system overhead
3. **Optimization Recommendations**: Prioritize high-priority optimization suggestions
4. **Hardware Compatibility**: Ensure selected GPU supports required precision types

## Update Log

- **v1.0.0**: Initial version with support for precise calculations of four model types
- Complete hyperparameter configuration system
- Intelligent optimization recommendation features
- MCP tool integration
- Real-time parameter validation
