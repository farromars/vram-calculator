/**
 * MCP提示模板实现
 * 提供各种AI助手交互的提示模板
 */

import {
  OptimizationPromptParamsSchema,
  GPUSelectionPromptParamsSchema,
  OptimizationPromptParams,
  GPUSelectionPromptParams
} from '../types';
import { mcpLogger } from '../logger';
import { z } from 'zod';

/**
 * 技术分析参数
 */
const TechnicalAnalysisParamsSchema = z.object({
  issue: z.string().describe('遇到的技术问题'),
  context: z.string().describe('问题上下文信息'),
  modelInfo: z.string().optional().describe('相关模型信息'),
  hardwareInfo: z.string().optional().describe('硬件配置信息')
});

/**
 * 训练配置优化参数
 */
const TrainingOptimizationParamsSchema = z.object({
  modelSize: z.string().describe('模型大小'),
  currentConfig: z.string().describe('当前训练配置'),
  issues: z.string().describe('遇到的问题'),
  goals: z.string().describe('优化目标')
});

type TechnicalAnalysisParams = z.infer<typeof TechnicalAnalysisParamsSchema>;
type TrainingOptimizationParams = z.infer<typeof TrainingOptimizationParamsSchema>;

/**
 * 注册提示模板
 */
export function registerPromptTemplates(server: any) {
  // 显存优化建议提示
  server.registerPrompt(
    "vram_optimization",
    {
      title: "显存优化建议",
      description: "基于计算结果提供专业的显存优化建议",
      argsSchema: OptimizationPromptParamsSchema
    },
    ({ calculationResult, targetVRAM, useCase }: OptimizationPromptParams) => {
      mcpLogger.info("生成显存优化建议提示", { targetVRAM, useCase });
      
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `作为AI显存优化专家，请基于以下计算结果提供详细的优化建议：

## 计算结果
${calculationResult}

## 优化目标
${targetVRAM ? `目标显存限制：${targetVRAM}GB` : '无特定显存限制'}
使用场景：${useCase}

## 请提供以下方面的专业建议：

### 1. 技术优化方案
- 量化技术选择（INT8/INT4）及其影响
- 精度优化（FP32→FP16/BF16）的权衡
- 梯度检查点的使用策略
- PEFT方法（LoRA/QLoRA）的适用性

### 2. 配置调整建议
- 批次大小优化策略
- 序列长度调整方案
- 优化器选择建议
- 学习率调度优化

### 3. 硬件选择建议
- 推荐的GPU型号及理由
- 单卡vs多卡方案对比
- 云服务vs本地部署分析
- 成本效益评估

### 4. 实施路线图
- 优化措施的优先级排序
- 分步实施计划
- 风险评估和缓解策略
- 性能监控指标

### 5. 预期效果
- 显存节省预估
- 性能影响分析
- 训练时间变化
- 模型质量影响

请确保建议具体可操作，并说明每个建议的原理和预期效果。`
          }
        }]
      };
    }
  );

  // GPU选择指导提示
  server.registerPrompt(
    "gpu_selection_guide",
    {
      title: "GPU选择指导",
      description: "提供专业的GPU选择建议和配置指导",
      argsSchema: GPUSelectionPromptParamsSchema
    },
    ({ requirements, budget, useCase }: GPUSelectionPromptParams) => {
      mcpLogger.info("生成GPU选择指导提示", { budget, useCase });
      
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `作为GPU硬件专家，请为以下需求提供专业的GPU选择指导：

## 需求信息
**需求描述**：${requirements}
**预算限制**：${budget ? `$${budget}` : '无限制'}
**使用场景**：${useCase}

## 请提供以下方面的专业分析：

### 1. GPU推荐分析
- 推荐的具体GPU型号（至少3个选项）
- 每个选项的优缺点分析
- 性价比评估和排序
- 适用场景说明

### 2. 技术规格对比
- 显存容量和带宽对比
- 计算能力（FP32/FP16/INT8）分析
- 架构特性和优势
- 功耗和散热要求

### 3. 成本效益分析
- 初始采购成本
- 运营成本（电费、维护）
- 云服务vs自建对比
- ROI分析和回收期

### 4. 部署建议
- 单卡vs多卡配置
- 系统配置要求（CPU、内存、存储）
- 网络和I/O考虑
- 散热和电源规划

### 5. 未来扩展性
- 升级路径规划
- 技术发展趋势
- 兼容性考虑
- 投资保护策略

### 6. 风险评估
- 技术风险（性能不达预期）
- 市场风险（价格波动、供应）
- 兼容性风险
- 缓解措施建议

请确保建议基于最新的市场信息和技术发展，并提供具体的配置参数和采购建议。`
          }
        }]
      };
    }
  );

  // 技术问题诊断提示
  server.registerPrompt(
    "technical_diagnosis",
    {
      title: "技术问题诊断",
      description: "诊断和解决AI模型部署中的技术问题",
      argsSchema: TechnicalAnalysisParamsSchema
    },
    ({ issue, context, modelInfo, hardwareInfo }: TechnicalAnalysisParams) => {
      mcpLogger.info("生成技术诊断提示", { issue });
      
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `作为AI系统诊断专家，请帮助分析和解决以下技术问题：

## 问题描述
**主要问题**：${issue}
**问题上下文**：${context}
${modelInfo ? `**模型信息**：${modelInfo}` : ''}
${hardwareInfo ? `**硬件配置**：${hardwareInfo}` : ''}

## 请提供以下方面的专业诊断：

### 1. 问题分析
- 问题的根本原因分析
- 可能的触发因素
- 问题的严重程度评估
- 影响范围分析

### 2. 诊断步骤
- 系统性的排查方法
- 关键指标监控
- 日志分析要点
- 性能基准测试

### 3. 解决方案
- 立即缓解措施
- 根本性解决方案
- 替代方案对比
- 实施优先级排序

### 4. 预防措施
- 避免问题再次发生的策略
- 监控和告警设置
- 最佳实践建议
- 定期维护计划

### 5. 性能优化
- 系统调优建议
- 配置参数优化
- 资源利用率提升
- 瓶颈识别和解决

### 6. 风险管控
- 潜在风险识别
- 风险缓解策略
- 应急预案制定
- 备份和恢复方案

请提供具体可执行的解决步骤，并说明每个步骤的原理和预期效果。如果需要额外信息，请明确指出需要收集哪些数据。`
          }
        }]
      };
    }
  );

  // 训练配置优化提示
  server.registerPrompt(
    "training_optimization",
    {
      title: "训练配置优化",
      description: "优化模型训练配置和超参数",
      argsSchema: TrainingOptimizationParamsSchema
    },
    ({ modelSize, currentConfig, issues, goals }: TrainingOptimizationParams) => {
      mcpLogger.info("生成训练优化提示", { modelSize, goals });
      
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `作为AI训练优化专家，请帮助优化以下训练配置：

## 训练信息
**模型规模**：${modelSize}
**当前配置**：${currentConfig}
**遇到问题**：${issues}
**优化目标**：${goals}

## 请提供以下方面的优化建议：

### 1. 超参数优化
- 学习率调度策略
- 批次大小优化
- 优化器选择和配置
- 正则化参数调整

### 2. 训练策略
- 预训练策略选择
- 数据增强技术
- 课程学习设计
- 多阶段训练方案

### 3. 效率优化
- 混合精度训练
- 梯度累积策略
- 分布式训练配置
- 内存优化技术

### 4. 稳定性改进
- 梯度裁剪设置
- 权重初始化策略
- 损失函数设计
- 训练监控指标

### 5. 收敛加速
- 预热策略设计
- 学习率衰减方案
- 早停机制设置
- 检查点策略

### 6. 质量保证
- 验证策略设计
- 过拟合检测
- 模型评估方法
- A/B测试方案

请提供具体的配置参数建议，并解释每个建议的理论依据和预期效果。如果有多个方案，请按优先级排序。`
          }
        }]
      };
    }
  );

  mcpLogger.info("提示模板注册完成", { 
    templates: ['vram_optimization', 'gpu_selection_guide', 'technical_diagnosis', 'training_optimization']
  });
}
