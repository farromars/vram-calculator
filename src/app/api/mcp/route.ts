/**
 * MCP (Model Context Protocol) API 路由
 * 提供HTTP传输层支持，使AI助手能够通过标准化协议访问显存计算功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { mcpLogger } from '@/mcp/logger';
import { calculateAdvancedFineTuningMemory } from '@/utils/memory-formulas';

/**
 * 处理POST请求 - 使用stdio传输模拟
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    mcpLogger.info("收到MCP请求", { method: body.method, id: body.id });

    // 创建一个简单的响应处理器
    if (body.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            resources: {},
            tools: {},
            prompts: {}
          },
          serverInfo: {
            name: 'vram-calculator-mcp-server',
            version: '1.0.0'
          }
        },
        id: body.id
      };

      mcpLogger.info("MCP初始化完成", { id: body.id });

      return NextResponse.json(response, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // 处理其他MCP方法
    switch (body.method) {
      case 'resources/list':
        const response = {
          jsonrpc: '2.0',
          result: {
            resources: [
              { uri: 'models://nlp', name: 'NLP模型数据库', description: '所有NLP/语言模型的详细信息' },
              { uri: 'models://multimodal', name: '多模态模型数据库', description: '所有多模态模型的详细信息' },
              { uri: 'gpu://specs', name: 'GPU规格数据库', description: '所有GPU的详细规格和价格信息' },
              { uri: 'formulas://overview', name: '计算公式概述', description: '显存计算的统一框架和核心概念' },
              { uri: 'history://list', name: '计算历史记录', description: '获取最近的计算历史记录' }
            ]
          },
          id: body.id
        };
        return NextResponse.json(response, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });

      case 'tools/list':
        const toolsResponse = {
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                name: 'calculate_inference_vram',
                description: '计算模型推理时的显存需求',
                inputSchema: {
                  type: 'object',
                  properties: {
                    modelId: { type: 'string', description: '模型ID' },
                    batchSize: { type: 'number', description: '批次大小' },
                    sequenceLength: { type: 'number', description: '序列长度' },
                    precision: { type: 'string', enum: ['fp32', 'fp16', 'bf16', 'int8', 'int4'] }
                  }
                }
              },
              {
                name: 'recommend_gpu',
                description: '根据显存需求推荐合适的GPU',
                inputSchema: {
                  type: 'object',
                  properties: {
                    vramRequired: { type: 'number', description: '所需显存(GB)' },
                    useCase: { type: 'string', enum: ['inference', 'training', 'development'] }
                  }
                }
              },
              {
                name: 'calculate_advanced_finetuning_vram',
                description: '计算高级微调配置的显存需求',
                inputSchema: {
                  type: 'object',
                  properties: {
                    modelType: { type: 'string', enum: ['nlp', 'multimodal', 'moe', 'cnn'], description: '模型类型' },
                    modelSize: { type: 'number', description: '模型大小(B)' },
                    architectureType: { type: 'string', description: '架构类型' },
                    precision: { type: 'string', enum: ['fp32', 'fp16', 'bf16', 'int8', 'int4'], description: '训练精度' },
                    batchSize: { type: 'number', description: '批次大小' },
                    learningRate: { type: 'number', description: '学习率' },
                    optimizer: { type: 'string', enum: ['sgd', 'adam', 'adamw'], description: '优化器' },
                    trainingEpochs: { type: 'number', description: '训练轮数' }
                  },
                  required: ['modelType', 'modelSize', 'architectureType', 'precision', 'batchSize', 'learningRate', 'optimizer', 'trainingEpochs']
                }
              }
            ]
          },
          id: body.id
        };
        return NextResponse.json(toolsResponse, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });

      case 'prompts/list':
        const promptsResponse = {
          jsonrpc: '2.0',
          result: {
            prompts: [
              {
                name: 'vram_optimization',
                description: '基于计算结果提供专业的显存优化建议',
                arguments: [
                  { name: 'calculationResult', description: '计算结果JSON', required: true },
                  { name: 'targetVRAM', description: '目标显存限制', required: false },
                  { name: 'useCase', description: '使用场景', required: true }
                ]
              },
              {
                name: 'gpu_selection_guide',
                description: '提供专业的GPU选择建议和配置指导',
                arguments: [
                  { name: 'requirements', description: '需求描述', required: true },
                  { name: 'budget', description: '预算限制', required: false },
                  { name: 'useCase', description: '使用场景', required: true }
                ]
              }
            ]
          },
          id: body.id
        };
        return NextResponse.json(promptsResponse, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });

      case 'tools/call':
        // 简单的工具调用示例
        const toolName = body.params?.name;
        const toolArgs = body.params?.arguments || {};

        if (toolName === 'recommend_gpu') {
          const mockResult = {
            vramRequired: toolArgs.vramRequired || 16,
            useCase: toolArgs.useCase || 'training',
            recommendations: [
              { name: 'RTX 4090', vram: 24, utilization: 67, price: 1599 },
              { name: 'RTX 4080', vram: 16, utilization: 100, price: 1199 },
              { name: 'A100 80GB', vram: 80, utilization: 20, price: 15000 }
            ],
            summary: `找到 3 个符合 ${toolArgs.vramRequired}GB 显存要求的GPU选项`
          };

          const toolResponse = {
            jsonrpc: '2.0',
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(mockResult, null, 2)
              }]
            },
            id: body.id
          };

          return NextResponse.json(toolResponse, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          });
        }

        if (toolName === 'calculate_advanced_finetuning_vram') {
          try {
            // 调用实际的计算函数
            const result = calculateAdvancedFineTuningMemory(toolArgs);

            const toolResponse = {
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }]
              },
              id: body.id
            };

            mcpLogger.info("高级微调显存计算完成", {
              modelType: toolArgs.modelType,
              totalVRAM: result.total
            });

            return NextResponse.json(toolResponse, {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            });
          } catch (error) {
            mcpLogger.error("高级微调显存计算失败", error);

            const errorResponse = {
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Calculation failed',
                data: error instanceof Error ? error.message : String(error)
              },
              id: body.id
            };

            return NextResponse.json(errorResponse, {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            });
          }
        }

        // 其他工具的默认响应
        const defaultToolResponse = {
          jsonrpc: '2.0',
          result: {
            content: [{
              type: 'text',
              text: `工具 ${toolName} 被调用，参数: ${JSON.stringify(toolArgs, null, 2)}`
            }]
          },
          id: body.id
        };

        return NextResponse.json(defaultToolResponse, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });

      case 'resources/read':
        // 简单的资源读取示例
        const uri = body.params?.uri;

        if (uri === 'models://nlp') {
          const mockModels = {
            total: 5,
            models: [
              { id: 'llama-2-7b', name: 'Llama 2 7B', params: 7, architecture: 'transformer' },
              { id: 'llama-2-13b', name: 'Llama 2 13B', params: 13, architecture: 'transformer' },
              { id: 'llama-2-70b', name: 'Llama 2 70B', params: 70, architecture: 'transformer' },
              { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', params: 175, architecture: 'transformer' },
              { id: 'claude-3-haiku', name: 'Claude 3 Haiku', params: 20, architecture: 'transformer' }
            ]
          };

          const resourceResponse = {
            jsonrpc: '2.0',
            result: {
              contents: [{
                uri: uri,
                text: JSON.stringify(mockModels, null, 2)
              }]
            },
            id: body.id
          };

          return NextResponse.json(resourceResponse, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          });
        }

        // 其他资源的默认响应
        const defaultResourceResponse = {
          jsonrpc: '2.0',
          result: {
            contents: [{
              uri: uri,
              text: `资源 ${uri} 的内容`
            }]
          },
          id: body.id
        };

        return NextResponse.json(defaultResourceResponse, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });

      default:
        // 未实现的方法
        const errorResponse = {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${body.method}`
          },
          id: body.id
        };
        return NextResponse.json(errorResponse, {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
    }

  } catch (error) {
    mcpLogger.error('MCP POST请求错误', error);
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal server error',
        data: error instanceof Error ? error.message : String(error)
      },
      id: null,
    }, { status: 500 });
  }
}

/**
 * 处理GET请求 - 返回服务器信息
 */
export async function GET() {
  try {
    return NextResponse.json({
      name: "vram-calculator-mcp-server",
      version: "1.0.0",
      description: "AI显存计算器MCP服务器",
      capabilities: {
        resources: true,
        tools: true,
        prompts: true
      },
      status: "running"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    mcpLogger.error('MCP GET请求错误', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * 处理OPTIONS请求 - CORS预检
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id',
      'Access-Control-Expose-Headers': 'mcp-session-id',
    },
  });
}
