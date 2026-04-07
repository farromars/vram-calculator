import { MemoryBreakdown, CalculatorType } from '@/types';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  type: CalculatorType;
  config: Record<string, unknown>;
  result: MemoryBreakdown;
  name?: string;
  notes?: string;
}

export interface ShareableResult {
  id: string;
  type: CalculatorType;
  config: Record<string, unknown>;
  result: MemoryBreakdown;
  timestamp: Date;
  name?: string;
  notes?: string;
}

// 生成分享链接
export function generateShareLink(historyItem: HistoryItem): string {
  try {
    const shareData: ShareableResult = {
      id: Math.random().toString(36).substr(2, 12),
      type: historyItem.type,
      config: historyItem.config,
      result: historyItem.result,
      timestamp: historyItem.timestamp,
      name: historyItem.name,
      notes: historyItem.notes
    };

    // 将数据编码为Base64 URL参数
    const encodedData = btoa(JSON.stringify(shareData))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
  } catch (error) {
    console.error('生成分享链接失败:', error);
    throw new Error('无法生成分享链接');
  }
}

// 解析分享链接
export function parseShareLink(shareParam: string): ShareableResult | null {
  try {
    // 恢复Base64编码
    const base64Data = shareParam
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // 添加padding
    const paddedData = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
    
    const jsonData = atob(paddedData);
    const shareData = JSON.parse(jsonData);
    
    // 验证数据完整性
    if (!shareData.id || !shareData.type || !shareData.config || !shareData.result) {
      throw new Error('分享数据不完整');
    }

    // 转换时间戳
    shareData.timestamp = new Date(shareData.timestamp);

    return shareData;
  } catch (error) {
    console.error('解析分享链接失败:', error);
    return null;
  }
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 备用方法
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    return false;
  }
}

// 生成报告内容
export function generateReport(historyItem: HistoryItem): string {
  const { type, config, result, timestamp, name } = historyItem;
  
  const typeLabels = {
    training: '训练',
    inference: '推理', 
    finetuning: '微调',
    finetuning_advanced: '高级微调',
    grpo: 'GRPO',
    multimodal: '多模态'
  };

  const report = `
# AI显存计算报告

## 基本信息
- **计算类型**: ${typeLabels[type]}
- **配置名称**: ${name || '未命名配置'}
- **计算时间**: ${timestamp.toLocaleString('zh-CN')}

## 显存分析结果
- **总显存需求**: ${result.total.toFixed(2)} GB
- **模型参数**: ${result.modelParams.toFixed(2)} GB
- **梯度存储**: ${result.gradients.toFixed(2)} GB
- **优化器状态**: ${result.optimizer.toFixed(2)} GB
- **激活值**: ${result.activations.toFixed(2)} GB
- **KV缓存**: ${result.kvCache.toFixed(2)} GB

## 配置详情
${formatConfigDetails(type, config)}

## 优化建议
${result.breakdown?.length > 0 ? '基于当前配置的显存分布已优化' : '暂无优化建议'}

---
*报告由AI显存计算器生成 - ${new Date().toLocaleString('zh-CN')}*
  `.trim();

  return report;
}

function formatConfigDetails(type: string, config: Record<string, unknown>): string {
  switch (type) {
    case 'training':
      return `
- **模型参数**: ${((config.modelParams as number) || 0).toFixed(1)}B
- **批次大小**: ${config.batchSize || 'N/A'}
- **序列长度**: ${config.sequenceLength || 'N/A'}
- **精度**: ${(config.precision as string)?.toUpperCase() || 'FP32'}
- **优化器**: ${(config.optimizer as string)?.toUpperCase() || 'AdamW'}
- **梯度检查点**: ${config.gradientCheckpointing ? '启用' : '禁用'}
- **混合精度**: ${config.mixedPrecision ? '启用' : '禁用'}
      `.trim();
      
    case 'inference':
      return `
- **模型**: ${config.modelId || 'N/A'}
- **批次大小**: ${config.batchSize || 'N/A'}
- **序列长度**: ${config.sequenceLength || 'N/A'}
- **精度**: ${(config.precision as string)?.toUpperCase() || 'FP16'}
- **量化**: ${(config.quantization as string)?.toUpperCase() || 'None'}
- **KV缓存比例**: ${config.kvCacheRatio || 'N/A'}
      `.trim();
      
    case 'finetuning':
      return `
- **基础模型**: ${config.baseModel || 'N/A'}
- **微调方法**: ${(config.method as string)?.toUpperCase() || 'Full'}
- **精度**: ${(config.precision as string)?.toUpperCase() || 'FP16'}
- **量化**: ${(config.quantization as string)?.toUpperCase() || 'None'}
- **LoRA参数**: rank=${config.loraRank || 'N/A'}, alpha=${config.loraAlpha || 'N/A'}
      `.trim();
      
    case 'grpo':
      return `
- **模型**: ${config.modelId || 'N/A'}
- **批次大小**: ${config.batchSize || 'N/A'}
- **生成数量**: ${config.numGenerations || 'N/A'}
- **精度**: ${(config.precision as string)?.toUpperCase() || 'FP16'}
- **8位优化器**: ${config.use8BitOptimizer ? '启用' : '禁用'}
- **梯度检查点**: ${config.gradientCheckpointing ? '启用' : '禁用'}
      `.trim();
      
    case 'multimodal':
      return `
- **模型**: ${config.modelId || 'N/A'}
- **批次大小**: ${config.batchSize || 'N/A'}
- **图像数量**: ${config.numImages || 'N/A'}
- **图像分辨率**: ${config.imageResolution || 'N/A'}x${config.imageResolution || 'N/A'}
- **文本精度**: ${(config.textPrecision as string)?.toUpperCase() || 'FP16'}
- **视觉精度**: ${(config.visionPrecision as string)?.toUpperCase() || 'FP16'}
      `.trim();
      
    default:
      return JSON.stringify(config, null, 2);
  }
}

// 下载文件
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导出为JSON
export function exportToJSON(historyItem: HistoryItem): void {
  const jsonData = JSON.stringify(historyItem, null, 2);
  const filename = `ai-memory-calc-${historyItem.type}-${Date.now()}.json`;
  downloadFile(jsonData, filename, 'application/json');
}

// 导出为Markdown报告
export function exportToMarkdown(historyItem: HistoryItem): void {
  const report = generateReport(historyItem);
  const filename = `ai-memory-report-${historyItem.type}-${Date.now()}.md`;
  downloadFile(report, filename, 'text/markdown');
}

// 社交分享
export function shareToSocial(platform: 'twitter' | 'linkedin' | 'reddit', historyItem: HistoryItem) {
  const shareLink = generateShareLink(historyItem);
  const typeText = {
    training: '训练',
    inference: '推理',
    finetuning: '微调',
    finetuning_advanced: '高级微调',
    grpo: 'GRPO',
    multimodal: '多模态'
  }[historyItem.type] || '未知';
  
  const text = `我使用AI显存计算器分析了${typeText}场景的显存需求，结果显示需要${historyItem.result.total.toFixed(1)}GB显存。`;
  
  let url = '';
  
  switch (platform) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
      break;
    case 'linkedin':
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
      break;
    case 'reddit':
      url = `https://reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
      break;
  }
  
  if (url) {
    window.open(url, '_blank', 'width=600,height=400');
  }
} 