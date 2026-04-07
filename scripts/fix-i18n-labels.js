#!/usr/bin/env node

/**
 * 批量修复高级微调计算器中的国际化标签
 * 将硬编码的中文标签替换为翻译函数调用
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/calculators/advanced-fine-tuning-calculator.tsx');

// 需要替换的标签映射
const labelMappings = [
  // 多模态标签
  { from: '"视觉特征维度"', to: '{t(\'advanced.finetuning.vision.feature.dim\')}' },
  { from: '"跨模态对齐权重"', to: '{t(\'advanced.finetuning.cross.modal.alignment.weight\')}' },
  { from: '"图像-文本对比权重"', to: '{t(\'advanced.finetuning.image.text.contrast.weight\')}' },
  { from: '"视觉编码器"', to: '{t(\'advanced.finetuning.vision.encoder.label\')}' },
  { from: '"文本编码器"', to: '{t(\'advanced.finetuning.text.encoder.label\')}' },
  { from: '"冻结"', to: '{t(\'advanced.finetuning.freeze\')}' },
  { from: '"LoRA"', to: '{t(\'advanced.finetuning.lora\')}' },
  { from: '"混合精度训练"', to: '{t(\'advanced.finetuning.mixed.precision.training\')}' },
  { from: '"启用AMP"', to: '{t(\'advanced.finetuning.enable.amp\')}' },
  
  // MoE标签
  { from: '"专家容量因子"', to: '{t(\'advanced.finetuning.expert.capacity.factor\')}' },
  { from: '"专家特化度"', to: '{t(\'advanced.finetuning.expert.specialization\')}' },
  { from: '"负载均衡损失权重"', to: '{t(\'advanced.finetuning.load.balance.loss.weight\')}' },
  { from: '"辅助损失权重"', to: '{t(\'advanced.finetuning.auxiliary.loss.weight\')}' },
  { from: '"专家初始化策略"', to: '{t(\'advanced.finetuning.expert.init.strategy\')}' },
  { from: '"LoRA应用策略"', to: '{t(\'advanced.finetuning.lora.application.strategy\')}' },
  { from: '"专家并行度"', to: '{t(\'advanced.finetuning.expert.parallelism\')}' },
  { from: '"专家正则化"', to: '{t(\'advanced.finetuning.expert.regularization\')}' },
  { from: '"专家Dropout率"', to: '{t(\'advanced.finetuning.expert.dropout.rate\')}' },
  
  // CNN标签
  { from: '"池化策略"', to: '{t(\'advanced.finetuning.pooling.strategy\')}' },
  { from: '"冻结层数"', to: '{t(\'advanced.finetuning.frozen.layers\')}' },
  { from: '"分类头维度"', to: '{t(\'advanced.finetuning.classification.head.dim\')}' },
  { from: '"学习率调度器"', to: '{t(\'advanced.finetuning.lr.scheduler\')}' },
  { from: '"数据增强策略"', to: '{t(\'advanced.finetuning.data.augmentation.strategy\')}' },
  { from: '"批归一化"', to: '{t(\'advanced.finetuning.batch.normalization\')}' },
  { from: '"冻结BN层"', to: '{t(\'advanced.finetuning.freeze.bn.layers\')}' },
  { from: '"标签平滑"', to: '{t(\'advanced.finetuning.label.smoothing\')}' },
  
  // 选项值
  { from: '"随机初始化"', to: '{t(\'advanced.finetuning.option.random.init\')}' },
  { from: '"预训练继承"', to: '{t(\'advanced.finetuning.option.pretrained.inherit\')}' },
  { from: '"全专家"', to: '{t(\'advanced.finetuning.option.all.experts\')}' },
  { from: '"部分专家"', to: '{t(\'advanced.finetuning.option.partial.experts\')}' },
  { from: '"仅路由器"', to: '{t(\'advanced.finetuning.option.router.only\')}' },
  
  // 池化选项
  { from: '"MaxPool"', to: '{t(\'advanced.finetuning.pooling.maxpool\')}' },
  { from: '"AvgPool"', to: '{t(\'advanced.finetuning.pooling.avgpool\')}' },
  { from: '"AdaptiveAvgPool"', to: '{t(\'advanced.finetuning.pooling.adaptive.avgpool\')}' },
  
  // 学习率调度器选项
  { from: '"StepLR"', to: '{t(\'advanced.finetuning.lr.scheduler.step\')}' },
  { from: '"CosineAnnealingLR"', to: '{t(\'advanced.finetuning.lr.scheduler.cosine\')}' },
  { from: '"ReduceLROnPlateau"', to: '{t(\'advanced.finetuning.lr.scheduler.plateau\')}' },
  
  // 配置面板标题
  { from: '"多模态模型优化设置"', to: '{t(\'advanced.finetuning.multimodal\')} {t(\'advanced.finetuning.optimization.config.title\')}' },
  { from: '"MoE模型基础配置"', to: '{t(\'advanced.finetuning.moe\')} {t(\'advanced.finetuning.basic.config.title\')}' },
  { from: '"MoE模型高级配置"', to: '{t(\'advanced.finetuning.moe\')} {t(\'advanced.finetuning.advanced.config.title\')}' },
  { from: '"MoE模型优化设置"', to: '{t(\'advanced.finetuning.moe\')} {t(\'advanced.finetuning.optimization.config.title\')}' },
  { from: '"CNN模型基础配置"', to: '{t(\'advanced.finetuning.cnn\')} {t(\'advanced.finetuning.basic.config.title\')}' },
  { from: '"CNN模型高级配置"', to: '{t(\'advanced.finetuning.cnn\')} {t(\'advanced.finetuning.advanced.config.title\')}' },
  { from: '"CNN模型优化设置"', to: '{t(\'advanced.finetuning.cnn\')} {t(\'advanced.finetuning.optimization.config.title\')}' },
];

function fixI18nLabels() {
  try {
    console.log('🔧 开始修复国际化标签...');
    
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    
    // 应用所有替换
    labelMappings.forEach(({ from, to }) => {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, to);
        changeCount += matches.length;
        console.log(`✅ 替换 ${from} -> ${to} (${matches.length} 次)`);
      }
    });
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`🎉 修复完成！总共替换了 ${changeCount} 个标签`);
    console.log('📝 请检查文件并确保所有替换都正确');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行修复
if (require.main === module) {
  fixI18nLabels();
}

module.exports = { fixI18nLabels };
