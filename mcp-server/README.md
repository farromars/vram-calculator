# VRAM Calculator MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with professional VRAM calculation and GPU recommendation capabilities for Large Language Models and Multimodal Models.

## Features

### 📚 Resources
- **Model Database**: 20+ pre-trained models (NLP, Multimodal, Embedding)
- **GPU Specifications**: 12+ GPU detailed specs and pricing
- **Calculation Formulas**: Comprehensive VRAM calculation documentation

### 🔨 Tools
- **VRAM Calculator**: Calculate memory requirements for inference, training, and fine-tuning
- **GPU Recommender**: Intelligent GPU recommendations based on requirements and budget
- **Model Comparator**: Compare VRAM usage across multiple models

### 🎯 Supported Models
- **NLP Models**: Llama 2, Qwen2.5, DeepSeek V2, Yi, Baichuan2, etc.
- **Multimodal Models**: Qwen2-VL, LLaVA, CogVLM, InternVL, etc.
- **Embedding Models**: BGE, Text2Vec, GTE, etc.

### 💻 Supported GPUs
- **Consumer**: RTX 4060-5090 series
- **Professional**: A100, H100, L40S, A6000
- **Latest**: RTX 50 series with up to 32GB VRAM

## Installation

```bash
npm install -g vram-calculator-mcp-server
```

## Usage

### Command Line
```bash
# Start the MCP server
vram-calculator-mcp

# The server will run on stdio and wait for MCP client connections
```

### Claude Desktop Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "vram-calculator": {
      "command": "vram-calculator-mcp"
    }
  }
}
```

### Cline/Continue Integration

Add to your MCP configuration:

```json
{
  "name": "vram-calculator",
  "command": ["vram-calculator-mcp"]
}
```

## Example Usage

### Calculate VRAM for Training
```
Calculate VRAM requirements for training Llama 2 7B with batch size 4, sequence length 2048, using FP16 precision.
```

### Get GPU Recommendations
```
Recommend GPUs for 24GB VRAM requirement with a budget of $2000 for training use case.
```

### Compare Models
```
Compare VRAM usage between Llama 2 7B, Qwen2.5 7B, and Yi 34B for inference mode.
```

## API Reference

### Resources

#### `models://nlp`
Returns database of NLP/Language models with specifications.

#### `models://multimodal` 
Returns database of multimodal models supporting text, image, audio, video.

#### `models://embedding`
Returns database of text embedding and reranking models.

#### `gpu://specs`
Returns detailed GPU specifications including VRAM, pricing, and performance metrics.

#### `formulas://vram`
Returns comprehensive documentation of VRAM calculation methodologies.

### Tools

#### `calculate_vram`
Calculate VRAM requirements for model operations.

**Parameters:**
- `modelId` (string): Model identifier
- `mode` (string): 'inference', 'training', or 'finetuning'
- `batchSize` (number, optional): Batch size (default: 1)
- `sequenceLength` (number, optional): Sequence length (default: 2048)
- `precision` (string, optional): 'fp32', 'fp16', 'bf16', 'int8', 'int4' (default: 'fp16')

#### `recommend_gpu`
Recommend suitable GPUs based on requirements.

**Parameters:**
- `vramRequired` (number): Required VRAM in GB
- `budget` (number, optional): Budget limit in USD (default: 10000)
- `useCase` (string, optional): 'inference', 'training', 'development' (default: 'training')
- `multiGPU` (boolean, optional): Allow multi-GPU recommendations (default: false)

#### `compare_models`
Compare VRAM requirements across multiple models.

**Parameters:**
- `modelIds` (array): List of model IDs to compare
- `mode` (string, optional): Calculation mode (default: 'training')
- `batchSize` (number, optional): Batch size (default: 1)
- `sequenceLength` (number, optional): Sequence length (default: 2048)
- `precision` (string, optional): Precision format (default: 'fp16')

## VRAM Calculation Formula

The server uses a comprehensive VRAM calculation framework:

```
Total VRAM = Model Weights + Optimizer States + Gradients + Activations + Overhead
```

### Components:
1. **Model Weights**: Based on parameter count and precision
2. **Optimizer States**: Adam/AdamW requires 2x model weights for training
3. **Gradients**: Same size as model weights for training
4. **Activations**: Depends on batch size, sequence length, and model architecture
5. **Overhead**: Framework and CUDA context overhead (~15-20%)

## Development

```bash
# Clone and setup
git clone https://github.com/farromars/vram-calculator.git
cd vram-calculator/mcp-server

# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Test
npm test
```

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Contributing

Contributions welcome! Please see the main repository for contribution guidelines.

## Links

- **Main Project**: https://github.com/farromars/vram-calculator
- **Issues**: https://github.com/farromars/vram-calculator/issues
- **MCP Protocol**: https://modelcontextprotocol.io/
