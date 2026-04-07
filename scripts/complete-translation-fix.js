#!/usr/bin/env node

/**
 * 完整修复高级微调计算器中的所有国际化标签
 * 将所有硬编码的中文标签替换为翻译函数调用
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/calculators/advanced-fine-tuning-calculator.tsx');

// 需要替换的标签映射 - 完整列表
const labelMappings = [
  // 配置面板标题
  { from: '"多模态模型优化设置"', to: '{t(\'advanced.finetuning.multimodal.optimization.settings\')}' },
  { from: '"MoE模型基础配置"', to: '{t(\'advanced.finetuning.moe.basic.config\')}' },
  { from: '"MoE模型高级配置"', to: '{t(\'advanced.finetuning.moe.advanced.config\')}' },
  { from: '"MoE模型优化设置"', to: '{t(\'advanced.finetuning.moe.optimization.settings\')}' },
  { from: '"CNN模型基础配置"', to: '{t(\'advanced.finetuning.cnn.basic.config\')}' },
  { from: '"CNN模型高级配置"', to: '{t(\'advanced.finetuning.cnn.advanced.config\')}' },
  { from: '"CNN模型优化设置"', to: '{t(\'advanced.finetuning.cnn.optimization.settings\')}' },

  // 参数标签
  { from: '"架构类型"', to: '{t(\'advanced.finetuning.architecture.type\')}' },
  { from: '"批次大小"', to: '{t(\'advanced.finetuning.batch.size\')}' },
  { from: '"序列长度"', to: '{t(\'advanced.finetuning.sequence.length\')}' },
  { from: '"训练轮数"', to: '{t(\'advanced.finetuning.training.epochs\')}' },
  { from: '"学习率"', to: '{t(\'advanced.finetuning.learning.rate\')}' },
  { from: '"视觉编码器"', to: '{t(\'advanced.finetuning.vision.encoder\')}' },
  { from: '"文本编码器"', to: '{t(\'advanced.finetuning.text.encoder\')}' },
  { from: '"激活专家数"', to: '{t(\'advanced.finetuning.num.active.experts\')}' },
  { from: '"路由策略"', to: '{t(\'advanced.finetuning.routing.strategy\')}' },
  { from: '"冻结层数"', to: '{t(\'advanced.finetuning.frozen.layers\')}' },
  { from: '"分类头维度"', to: '{t(\'advanced.finetuning.classification.head.dim\')}' },
  { from: '"权重衰减"', to: '{t(\'advanced.finetuning.weight.decay\')}' },
  { from: '"预热步数"', to: '{t(\'advanced.finetuning.warmup.steps\')}' },
  { from: '"梯度裁剪"', to: '{t(\'advanced.finetuning.gradient.clipping\')}' },
  { from: '"混合精度训练"', to: '{t(\'advanced.finetuning.mixed.precision.training\')}' },
  { from: '"专家特化度"', to: '{t(\'advanced.finetuning.expert.specialization\')}' },

  // 选项值
  { from: '"随机初始化"', to: '{t(\'advanced.finetuning.option.random.init\')}' },
  { from: '"预训练继承"', to: '{t(\'advanced.finetuning.option.pretrained.inherit\')}' },
  { from: '"全专家"', to: '{t(\'advanced.finetuning.option.all.experts\')}' },
  { from: '"部分专家"', to: '{t(\'advanced.finetuning.option.partial.experts\')}' },
  { from: '"仅路由器"', to: '{t(\'advanced.finetuning.option.router.only\')}' },

  // 文本标签
  { from: '"冻结"', to: '{t(\'advanced.finetuning.freeze\')}' },
  { from: '"启用AMP"', to: '{t(\'advanced.finetuning.enable.amp\')}' },
  { from: '"有效批次大小"', to: '{t(\'advanced.finetuning.effective.batch.size.label\')}' },

  // 特殊情况 - 带冒号的文本
  { from: '有效批次大小:', to: '{t(\'advanced.finetuning.effective.batch.size.label\')}:' },
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
