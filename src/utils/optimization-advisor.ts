import {
  AdvancedModelType,
  AdvancedFineTuningConfig,
  AdvancedMemoryBreakdown
} from '@/types';

// 优化建议类型
export interface OptimizationSuggestion {
  type: 'memory' | 'performance' | 'cost' | 'stability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  implementation: string[];
}

// GPU推荐接口
export interface GPURecommendation {
  name: string;
  vram: number;
  price?: number;
  utilization: number;
  efficiency: number;
  recommendation: 'excellent' | 'good' | 'acceptable' | 'insufficient';
}

/**
 * 智能优化建议生成器
 */
export class OptimizationAdvisor {
  /**
   * 生成综合优化建议
   */
  static generateOptimizationSuggestions(
    config: AdvancedFineTuningConfig,
    memoryResult: AdvancedMemoryBreakdown,
    targetGPU?: { name: string; vram: number }
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 显存优化建议
    suggestions.push(...this.generateMemoryOptimizations(config, memoryResult, targetGPU));

    // 性能优化建议
    suggestions.push(...this.generatePerformanceOptimizations(config, memoryResult));

    // 成本优化建议
    suggestions.push(...this.generateCostOptimizations(config, memoryResult));

    // 稳定性优化建议
    suggestions.push(...this.generateStabilityOptimizations(config, memoryResult));

    // 按优先级排序
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 生成显存优化建议
   */
  private static generateMemoryOptimizations(
    config: AdvancedFineTuningConfig,
    memoryResult: AdvancedMemoryBreakdown,
    targetGPU?: { name: string; vram: number }
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const utilizationRate = targetGPU ? (memoryResult.total / targetGPU.vram) * 100 : 0;

    // 显存不足的紧急优化
    if (targetGPU && utilizationRate > 95) {
      suggestions.push({
        type: 'memory',
        priority: 'high',
        title: '显存严重不足',
        description: `当前配置需要 ${memoryResult.total.toFixed(1)}GB 显存，超出 ${targetGPU.name} 的 ${targetGPU.vram}GB 容量`,
        impact: '无法正常训练',
        implementation: [
          '减少批次大小至原来的一半',
          '启用梯度检查点技术',
          '使用更激进的量化方案（INT4）',
          '考虑使用更大显存的GPU'
        ]
      });
    }

    // 显存使用率过高的优化
    if (targetGPU && utilizationRate > 85 && utilizationRate <= 95) {
      suggestions.push({
        type: 'memory',
        priority: 'medium',
        title: '显存使用率过高',
        description: `显存使用率 ${utilizationRate.toFixed(1)}%，接近上限`,
        impact: '可能出现OOM错误',
        implementation: [
          '减少批次大小',
          '启用梯度累积',
          '使用混合精度训练',
          '启用CPU卸载'
        ]
      });
    }

    // 模型特定的显存优化
    switch (config.modelType) {
      case 'NLP':
        if (config.nlpConfig && config.nlpConfig.sequenceLength > 4096) {
          suggestions.push({
            type: 'memory',
            priority: 'medium',
            title: '序列长度过长',
            description: '长序列会显著增加激活值显存占用',
            impact: '激活值显存占用过高',
            implementation: [
              '减少序列长度到2048或4096',
              '使用序列并行技术',
              '启用梯度检查点'
            ]
          });
        }
        break;

      case 'Multimodal':
        if (config.multimodalConfig && config.multimodalConfig.imageResolution > 512) {
          suggestions.push({
            type: 'memory',
            priority: 'medium',
            title: '图像分辨率过高',
            description: '高分辨率图像会大幅增加特征图显存占用',
            impact: '图像特征显存占用过高',
            implementation: [
              '降低图像分辨率到336或448',
              '增大patch大小',
              '使用图像特征缓存'
            ]
          });
        }
        break;

      case 'MoE':
        if (config.moeConfig && config.moeConfig.numActiveExperts > 4) {
          suggestions.push({
            type: 'memory',
            priority: 'medium',
            title: '激活专家数量过多',
            description: '过多的激活专家会增加显存占用',
            impact: '专家激活显存占用过高',
            implementation: [
              '减少激活专家数量到2-4个',
              '使用专家并行技术',
              '启用专家卸载'
            ]
          });
        }
        break;

      case 'CNN':
        if (config.cnnConfig && config.cnnConfig.batchSize > 256) {
          suggestions.push({
            type: 'memory',
            priority: 'low',
            title: '批次大小可以优化',
            description: 'CNN可以使用更大的批次大小提高效率',
            impact: '提高训练效率',
            implementation: [
              '适当增加批次大小',
              '使用特征图重计算',
              '启用数据并行'
            ]
          });
        }
        break;
    }

    return suggestions;
  }

  /**
   * 生成性能优化建议
   */
  private static generatePerformanceOptimizations(
    config: AdvancedFineTuningConfig,
    memoryResult: AdvancedMemoryBreakdown
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 计算效率分析
    const computeEfficiency = memoryResult.advancedMetadata?.computeEfficiency || 0;

    if (computeEfficiency < 50) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        title: '计算效率偏低',
        description: '当前配置的计算效率不够理想',
        impact: '训练速度较慢',
        implementation: [
          '增加批次大小',
          '使用更高效的优化器',
          '启用编译优化',
          '使用Tensor并行'
        ]
      });
    }

    // 模型特定的性能优化
    switch (config.modelType) {
      case 'NLP':
        if (config.nlpConfig?.optimizer === 'SGD') {
          suggestions.push({
            type: 'performance',
            priority: 'low',
            title: '优化器选择',
            description: 'AdamW通常在大模型训练中表现更好',
            impact: '提高收敛速度',
            implementation: [
              '切换到AdamW优化器',
              '调整学习率到2e-5',
              '增加warmup步数'
            ]
          });
        }
        break;

      case 'Multimodal':
        if (config.multimodalConfig && !config.multimodalConfig.mixedPrecisionTraining) {
          suggestions.push({
            type: 'performance',
            priority: 'medium',
            title: '启用混合精度训练',
            description: '混合精度可以显著提高多模态训练速度',
            impact: '提高训练速度30-50%',
            implementation: [
              '启用AMP（自动混合精度）',
              '使用BF16精度',
              '调整损失缩放'
            ]
          });
        }
        break;
    }

    return suggestions;
  }

  /**
   * 生成成本优化建议
   */
  private static generateCostOptimizations(
    config: AdvancedFineTuningConfig,
    memoryResult: AdvancedMemoryBreakdown
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 基于显存需求的成本优化
    if (memoryResult.total > 40) {
      suggestions.push({
        type: 'cost',
        priority: 'medium',
        title: '高端GPU成本优化',
        description: '当前配置需要昂贵的高端GPU',
        impact: '降低硬件成本',
        implementation: [
          '使用QLoRA量化技术',
          '启用CPU卸载',
          '考虑多GPU分布式训练',
          '使用云服务按需付费'
        ]
      });
    }

    // PEFT方法建议
    if (config.modelType === 'NLP' && config.nlpConfig) {
      const memoryEfficiency = memoryResult.advancedMetadata?.memoryEfficiency || 0;
      if (memoryEfficiency < 30) {
        suggestions.push({
          type: 'cost',
          priority: 'high',
          title: '使用参数高效微调',
          description: '当前配置的内存效率较低，建议使用PEFT方法',
          impact: '大幅降低显存需求和成本',
          implementation: [
            '使用LoRA微调替代全参数微调',
            '设置LoRA rank为16-32',
            '只微调关键模块',
            '启用量化技术'
          ]
        });
      }
    }

    return suggestions;
  }

  /**
   * 生成稳定性优化建议
   */
  private static generateStabilityOptimizations(
    config: AdvancedFineTuningConfig,
    memoryResult: AdvancedMemoryBreakdown
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 学习率稳定性检查
    switch (config.modelType) {
      case 'NLP':
        if (config.nlpConfig && config.nlpConfig.learningRate > 5e-5) {
          suggestions.push({
            type: 'stability',
            priority: 'medium',
            title: '学习率过高',
            description: '过高的学习率可能导致训练不稳定',
            impact: '提高训练稳定性',
            implementation: [
              '降低学习率到2e-5',
              '增加warmup步数',
              '使用学习率调度器',
              '启用梯度裁剪'
            ]
          });
        }
        break;

      case 'MoE':
        if (config.moeConfig && config.moeConfig.loadBalanceLossWeight < 0.01) {
          suggestions.push({
            type: 'stability',
            priority: 'medium',
            title: '负载均衡权重过低',
            description: '可能导致专家利用不均衡',
            impact: '提高专家利用率',
            implementation: [
              '增加负载均衡损失权重到0.01-0.1',
              '监控专家激活分布',
              '调整路由策略'
            ]
          });
        }
        break;
    }

    return suggestions;
  }

  /**
   * 生成GPU推荐
   */
  static generateGPURecommendations(memoryRequirement: number): GPURecommendation[] {
    const gpuSpecs = [
      { name: 'RTX 4060 Ti', vram: 16, price: 400 },
      { name: 'RTX 4070', vram: 12, price: 600 },
      { name: 'RTX 4070 Ti', vram: 16, price: 800 },
      { name: 'RTX 4080', vram: 16, price: 1200 },
      { name: 'RTX 4090', vram: 24, price: 1600 },
      { name: 'A100 PCIe', vram: 40, price: 10000 },
      { name: 'H100 PCIe', vram: 80, price: 25000 },
      { name: 'H100 SXM', vram: 80, price: 30000 }
    ];

    return gpuSpecs.map(gpu => {
      const utilization = (memoryRequirement / gpu.vram) * 100;
      const efficiency = Math.max(0, 100 - Math.abs(utilization - 75)); // 75%为最佳利用率

      let recommendation: GPURecommendation['recommendation'];
      if (utilization > 95) recommendation = 'insufficient';
      else if (utilization > 85) recommendation = 'acceptable';
      else if (utilization > 60) recommendation = 'good';
      else recommendation = 'excellent';

      return {
        name: gpu.name,
        vram: gpu.vram,
        price: gpu.price,
        utilization,
        efficiency,
        recommendation
      };
    }).filter(gpu => gpu.utilization <= 95)
      .sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * 生成配置优化建议
   */
  static generateConfigOptimizations(
    config: AdvancedFineTuningConfig,
    targetVRAM: number
  ): Partial<AdvancedFineTuningConfig> {
    const optimizedConfig: Partial<AdvancedFineTuningConfig> = {};

    switch (config.modelType) {
      case 'NLP':
        if (config.nlpConfig) {
          optimizedConfig.nlpConfig = { ...config.nlpConfig };
          
          // 如果显存需求过高，自动调整参数
          if (targetVRAM < 16) {
            optimizedConfig.nlpConfig.batchSize = Math.min(4, config.nlpConfig.batchSize);
            optimizedConfig.nlpConfig.sequenceLength = Math.min(2048, config.nlpConfig.sequenceLength);
            optimizedConfig.nlpConfig.loraRank = Math.min(16, config.nlpConfig.loraRank);
          }
        }
        break;

      case 'Multimodal':
        if (config.multimodalConfig) {
          optimizedConfig.multimodalConfig = { ...config.multimodalConfig };
          
          if (targetVRAM < 24) {
            optimizedConfig.multimodalConfig.batchSize = Math.min(8, config.multimodalConfig.batchSize);
            optimizedConfig.multimodalConfig.imageResolution = Math.min(336, config.multimodalConfig.imageResolution);
          }
        }
        break;

      case 'MoE':
        if (config.moeConfig) {
          optimizedConfig.moeConfig = { ...config.moeConfig };
          
          if (targetVRAM < 40) {
            optimizedConfig.moeConfig.numActiveExperts = Math.min(2, config.moeConfig.numActiveExperts);
            optimizedConfig.moeConfig.batchSize = Math.min(16, config.moeConfig.batchSize);
          }
        }
        break;

      case 'CNN':
        if (config.cnnConfig) {
          optimizedConfig.cnnConfig = { ...config.cnnConfig };
          
          if (targetVRAM < 12) {
            optimizedConfig.cnnConfig.batchSize = Math.min(64, config.cnnConfig.batchSize);
            optimizedConfig.cnnConfig.inputImageSize = Math.min(224, config.cnnConfig.inputImageSize);
          }
        }
        break;
    }

    return optimizedConfig;
  }
}
