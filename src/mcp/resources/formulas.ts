/**
 * 计算公式资源实现
 * 提供显存计算公式的详细文档和说明
 */

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpLogger } from '../logger';

/**
 * 计算公式文档数据
 */
const FORMULA_DOCS = {
  overview: {
    title: "通用LLM显存计算框架",
    description: "所有显存计算都基于统一的通用LLM框架",
    formula: "总显存占用 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销",
    keyPoints: [
      "不同训练/推理模式的核心区别在于P_train（可训练参数量）的大小",
      "推理模式: P_train = 0（无需梯度）",
      "全量训练/微调: P_train = P_total（所有参数需要梯度）",
      "PEFT方法: P_train << P_total（只有少量参数需要梯度）"
    ]
  },
  
  inference: {
    title: "推理显存计算",
    description: "模型推理时的显存需求计算",
    formula: "总显存 = 量化模型权重 + KV缓存 + 激活值（少量）",
    components: {
      modelWeights: "模型权重 = P_total × 精度字节数 × 量化比例",
      kvCache: "KV缓存 = batch_size × seq_len × hidden_size × 层数 × 2 × 精度字节数",
      activations: "激活值 = 训练激活值的10%（推理时较小）"
    },
    optimizations: [
      "使用量化技术（INT8/INT4）减少模型权重",
      "调整批次大小控制KV缓存",
      "使用KV缓存优化长序列推理"
    ]
  },
  
  training: {
    title: "训练显存计算",
    description: "模型全量训练时的显存需求计算",
    formula: "总显存 = 模型权重 + 优化器状态 + 梯度 + 激活值 + 其他开销",
    components: {
      modelWeights: "模型权重 = P_total × 训练精度字节数",
      optimizer: "优化器状态 = P_total × 4字节 × 优化器系数（SGD=1, AdamW=2）",
      gradients: "梯度 = P_total × 训练精度字节数",
      activations: "激活值支持梯度检查点（减少70%）",
      other: "其他开销 = CUDA上下文、临时变量、框架开销等"
    },
    optimizations: [
      "启用梯度检查点可减少70%激活值显存",
      "使用混合精度训练",
      "梯度累积减少批次大小",
      "数据并行分布式训练"
    ]
  },
  
  finetuning: {
    title: "微调显存计算",
    description: "模型微调时的显存需求计算，支持全量微调和PEFT方法",
    formula: "总显存 = 模型权重 + (P_train × 优化器系数) + (P_train × 梯度精度) + 激活值",
    methods: {
      full: {
        name: "全量微调",
        description: "P_train = P_total（所有参数需要梯度）",
        memoryUsage: "最高"
      },
      lora: {
        name: "LoRA",
        description: "P_train = calculateLoRAParams(rank)，约为总参数的1%",
        memoryUsage: "低"
      },
      qlora: {
        name: "QLoRA",
        description: "基础模型量化 + LoRA参数",
        memoryUsage: "最低"
      },
      prefix: {
        name: "Prefix Tuning",
        description: "P_train = 1% × P_total",
        memoryUsage: "低"
      }
    },
    optimizations: [
      "使用LoRA等PEFT方法大幅减少显存占用",
      "QLoRA结合量化进一步优化",
      "调整LoRA rank平衡性能和显存"
    ]
  },
  
  grpo: {
    title: "GRPO显存计算",
    description: "Group-wise Ranking Preference Optimization显存计算",
    formula: "GRPO激活值 = k × SFT激活值，其中k是偏好组大小",
    keyFeature: "激活值是显存瓶颈，随偏好组大小线性增长",
    components: {
      modelWeights: "通常使用INT4量化（8倍压缩）",
      trainableParams: "P_train = 1% × P_total（LoRA等PEFT方法）",
      activations: "激活值 = k × 基础激活值（k为偏好组大小）"
    },
    comparison: {
      sft: "SFT: 激活值 = 1 × 基础",
      dpo: "DPO: 激活值 ≈ 2 × 基础",
      grpo_4: "GRPO(k=4): 激活值 = 4 × 基础",
      grpo_8: "GRPO(k=8): 激活值 = 8 × 基础"
    },
    optimizations: [
      "使用PEFT方法减少可训练参数",
      "基础模型量化减少权重显存",
      "调整偏好组大小平衡性能和显存"
    ]
  },
  
  multimodal: {
    title: "多模态显存计算",
    description: "多模态模型的显存需求计算",
    formula: "激活值显存 = batch_size × Total_Sequence_Length × hidden_size × 层数 × 精度字节数",
    keyFeature: "Total_Sequence_Length决定激活值显存",
    sequenceLength: {
      text: "文本序列长度 = 文本Token数量",
      image: "图像序列长度 = (分辨率/patch_size)² × 图像数量",
      audio: "音频序列长度 = 时长(ms) / 80ms",
      video: "视频序列长度 = 帧数 × 每帧patch数（序列长度爆炸的根源）"
    },
    totalSequence: "Total_Sequence_Length = 文本Token + 图像Patch + 音频Patch + 视频Patch",
    optimizations: [
      "降低图像分辨率减少patch数量",
      "减少视频帧数控制序列长度",
      "使用更大的patch_size",
      "批次大小调整"
    ]
  }
};

/**
 * 精度和量化对照表
 */
const PRECISION_TABLES = {
  precision: {
    title: "精度字节数对照表",
    data: {
      FP32: { bytes: 4, description: "单精度浮点" },
      FP16: { bytes: 2, description: "半精度浮点" },
      BF16: { bytes: 2, description: "Brain浮点" },
      INT8: { bytes: 1, description: "8位整数量化（4倍压缩）" },
      INT4: { bytes: 0.5, description: "4位整数量化（8倍压缩）" }
    }
  },
  quantization: {
    title: "量化比例对照表",
    data: {
      None: { ratio: 1.0, savings: "0%" },
      INT8: { ratio: 0.25, savings: "75%" },
      INT4: { ratio: 0.125, savings: "87.5%" }
    }
  }
};

/**
 * 注册计算公式相关资源
 */
export function registerFormulaResources(server: any) {
  // 通用框架概述
  server.registerResource(
    "formulas-overview",
    "formulas://overview",
    {
      title: "通用LLM显存计算框架",
      description: "显存计算的统一框架和核心概念",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取计算公式概述", { uri: uri.href });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            framework: FORMULA_DOCS.overview,
            precisionTables: PRECISION_TABLES,
            supportedModes: Object.keys(FORMULA_DOCS).filter(key => key !== 'overview')
          }, null, 2)
        }]
      };
    }
  );

  // 特定模式的公式详情
  server.registerResource(
    "formula-detail",
    new ResourceTemplate("formulas://{mode}", { list: undefined }),
    {
      title: "计算公式详情",
      description: "获取特定计算模式的详细公式说明"
    },
    async (uri: URL, { mode }: { mode: string }) => {
      mcpLogger.info("获取计算公式详情", { mode, uri: uri.href });
      
      const formulaDoc = FORMULA_DOCS[mode as keyof typeof FORMULA_DOCS];
      
      if (!formulaDoc) {
        mcpLogger.warn("计算模式未找到", { mode });
        throw new Error(`计算模式 ${mode} 未找到`);
      }
      
      mcpLogger.debug("公式详情获取成功", { mode });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            mode,
            formula: formulaDoc,
            precisionTables: PRECISION_TABLES
          }, null, 2)
        }]
      };
    }
  );

  // 优化建议资源
  server.registerResource(
    "optimization-guide",
    "formulas://optimization",
    {
      title: "显存优化指南",
      description: "各种显存优化技术和建议",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      mcpLogger.info("获取优化指南", { uri: uri.href });
      
      const optimizations = Object.entries(FORMULA_DOCS)
        .filter(([key]) => key !== 'overview')
        .reduce((acc, [mode, doc]) => {
          if ('optimizations' in doc) {
            acc[mode] = doc.optimizations;
          }
          return acc;
        }, {} as Record<string, string[]>);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            title: "显存优化技术指南",
            description: "针对不同计算模式的显存优化建议",
            optimizations,
            generalTips: [
              "选择合适的精度类型（FP16 vs FP32）",
              "使用量化技术减少模型权重",
              "启用梯度检查点减少激活值",
              "调整批次大小平衡性能和显存",
              "考虑PEFT方法减少可训练参数",
              "使用分布式训练分摊显存压力"
            ]
          }, null, 2)
        }]
      };
    }
  );

  mcpLogger.info("计算公式资源注册完成", { 
    resources: ['formulas-overview', 'formula-detail', 'optimization-guide']
  });
}
