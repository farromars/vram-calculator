# MCP使用示例和教程

## 概述

本文档提供了AI显存计算器MCP服务器的详细使用示例，帮助开发者快速集成和使用MCP功能。

## 快速开始

### 1. 启动MCP服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 服务器将在 http://localhost:3001 启动
# MCP端点: http://localhost:3001/api/mcp
```

### 2. 基础连接测试

```javascript
const MCP_ENDPOINT = 'http://localhost:3001/api/mcp';

// 检查服务器状态
const statusResponse = await fetch(MCP_ENDPOINT);
const status = await statusResponse.json();
console.log('服务器状态:', status);

// MCP初始化
const initResponse = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'my-ai-assistant',
        version: '1.0.0'
      }
    },
    id: 1
  })
});

const initResult = await initResponse.json();
console.log('初始化结果:', initResult);
```

## 核心功能示例

### 资源查询 (Resources)

#### 1. 获取NLP模型列表

```javascript
// 获取所有NLP模型
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'resources/read',
    params: {
      uri: 'models://nlp'
    },
    id: 2
  })
});

const models = await response.json();
// 返回130+个NLP模型的详细信息
```

#### 2. 按参数大小筛选模型

```javascript
// 获取7B-30B参数的模型
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'resources/read',
    params: {
      uri: 'models://size/7-30'
    },
    id: 3
  })
});
```

#### 3. 获取GPU推荐

```javascript
// 基于16GB显存需求获取GPU推荐
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'resources/read',
    params: {
      uri: 'gpu://recommend/16'
    },
    id: 4
  })
});
```

### 工具调用 (Tools)

#### 1. GRPO显存计算

```javascript
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'calculate_grpo_vram',
      arguments: {
        modelId: 'llama-2-7b',
        batchSize: 4,
        sequenceLength: 2048,
        precision: 'fp16',
        numGenerations: 4,
        method: 'lora',
        loraRank: 4,
        quantization: 'int4'
      }
    },
    id: 5
  })
});

const result = await response.json();
// 返回详细的GRPO显存计算结果和优化建议
```

#### 2. 多模态显存计算

```javascript
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'calculate_multimodal_vram',
      arguments: {
        modelId: 'llava-1.5-7b',
        batchSize: 2,
        textTokens: 1024,
        imageCount: 4,
        imageResolution: 336,
        audioSeconds: 0,
        videoFrames: 0,
        precision: 'fp16',
        mode: 'training'
      }
    },
    id: 6
  })
});
```

#### 3. 高级GPU推荐

```javascript
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'recommend_gpu_advanced',
      arguments: {
        vramRequired: 24,
        budget: 5000,
        useCase: 'training',
        multiGPU: false,
        workloadType: 'continuous',
        powerLimit: 400
      }
    },
    id: 7
  })
});
```

#### 4. 配置优化建议

```javascript
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'optimize_config',
      arguments: {
        modelId: 'llama-2-13b',
        targetVRAM: 16,
        mode: 'finetuning',
        currentConfig: {
          batchSize: 8,
          sequenceLength: 2048,
          precision: 'fp32'
        },
        constraints: {
          minBatchSize: 1,
          allowQuantization: true,
          allowPEFT: true
        }
      }
    },
    id: 8
  })
});
```

### 提示模板 (Prompts)

#### 1. 显存优化建议

```javascript
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'prompts/get',
    params: {
      name: 'vram_optimization',
      arguments: {
        calculationResult: JSON.stringify({
          totalVRAM: 32.5,
          breakdown: {
            modelWeights: 14.0,
            optimizer: 12.0,
            gradients: 4.0,
            activations: 2.5
          }
        }),
        targetVRAM: 24,
        useCase: '大模型微调训练'
      }
    },
    id: 9
  })
});
```

#### 2. GPU选择指导

```javascript
const response = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'prompts/get',
    params: {
      name: 'gpu_selection_guide',
      arguments: {
        requirements: '需要训练70B参数的大语言模型，预计需要140GB显存',
        budget: 50000,
        useCase: 'training'
      }
    },
    id: 10
  })
});
```

## 实际应用场景

### 场景1：AI助手集成

```javascript
// AI助手可以这样使用MCP服务器
class AIAssistant {
  constructor(mcpEndpoint) {
    this.mcpEndpoint = mcpEndpoint;
  }

  async getGPURecommendation(userQuery) {
    // 解析用户需求
    const vramRequired = this.parseVRAMRequirement(userQuery);
    const budget = this.parseBudget(userQuery);
    
    // 调用MCP工具
    const response = await fetch(this.mcpEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'recommend_gpu_advanced',
          arguments: { vramRequired, budget, useCase: 'training' }
        },
        id: Date.now()
      })
    });
    
    const result = await response.json();
    return this.formatRecommendation(result);
  }

  async optimizeTrainingConfig(modelName, constraints) {
    // 获取模型信息
    const modelInfo = await this.getModelInfo(modelName);
    
    // 调用优化工具
    const response = await fetch(this.mcpEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'optimize_config',
          arguments: {
            modelId: modelInfo.id,
            targetVRAM: constraints.maxVRAM,
            mode: 'finetuning',
            currentConfig: constraints.currentConfig
          }
        },
        id: Date.now()
      })
    });
    
    return await response.json();
  }
}
```

### 场景2：批量分析

```javascript
// 批量比较多个模型
async function compareModels(modelIds) {
  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'compare_models_batch',
        arguments: {
          modelIds: modelIds,
          mode: 'training',
          batchSize: 4,
          sequenceLength: 2048,
          precision: 'fp16'
        }
      },
      id: Date.now()
    })
  });
  
  const result = await response.json();
  return result.result.comparisons;
}

// 使用示例
const models = ['llama-2-7b', 'llama-2-13b', 'llama-2-70b'];
const comparison = await compareModels(models);
console.log('模型比较结果:', comparison);
```

## 错误处理

```javascript
async function safeMCPCall(method, params) {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: Date.now()
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('MCP错误:', result.error);
      return null;
    }
    
    return result.result;
  } catch (error) {
    console.error('网络错误:', error);
    return null;
  }
}
```

## 最佳实践

1. **错误处理**: 始终检查响应中的error字段
2. **参数验证**: 使用提供的schema验证输入参数
3. **缓存**: 对于不经常变化的资源（如模型列表），考虑客户端缓存
4. **批量操作**: 使用批量工具减少网络请求
5. **日志记录**: 记录重要的MCP调用以便调试

## 部署配置

### Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 环境变量

```bash
# .env.local
MCP_SERVER_NAME=vram-calculator-mcp-server
MCP_SERVER_VERSION=1.0.0
MCP_LOG_LEVEL=info
```

这个MCP服务器为AI助手提供了强大的显存计算和GPU选择能力，通过标准化的协议接口，可以轻松集成到各种AI应用中。
