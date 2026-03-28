'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, ArrowLeft, BookOpen, HelpCircle, FileText } from 'lucide-react';
import { ZH } from '@/lib/i18n';
import Link from 'next/link';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-tc-bg-page">
      {/* 导航栏 */}
      <nav className="tc-navbar">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-tc-text-primary">{ZH.site.title}</h1>
          </Link>
          <span className="text-tc-text-disabled">/</span>
          <span className="text-sm text-tc-text-secondary">帮助与说明</span>
        </div>
        <div className="ml-auto">
          <Link href="/" className="glass-button flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>返回计算器</span>
          </Link>
        </div>
      </nav>

      <main className="pt-[72px] pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 计算原理 */}
          <section className="mb-10">
            <div className="tc-card">
              <div className="tc-card-header">
                <BookOpen className="w-5 h-5 text-brand" />
                显存计算原理
              </div>
              <div className="tc-card-body space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-tc-text-primary mb-2">推理场景</h3>
                  <p className="text-sm text-tc-text-secondary leading-relaxed mb-3">
                    推理模式下的显存占用主要由三部分组成：
                  </p>
                  <div className="bg-tc-bg-page rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="tc-tag tc-tag-info font-mono">总显存</span>
                      <span className="text-tc-text-secondary">= 模型权重 + KV 缓存 + 激活值</span>
                    </div>
                    <div className="pl-4 space-y-1.5 text-tc-text-placeholder">
                      <p><strong className="text-tc-text-secondary">模型权重</strong> = 参数量 × 每参数字节数 × 量化比例</p>
                      <p><strong className="text-tc-text-secondary">KV 缓存</strong> = 批量大小 × 序列长度 × 隐藏维度 × 层数 × 2(K+V) × 精度字节数</p>
                      <p><strong className="text-tc-text-secondary">激活值</strong> ≈ 模型权重 × 10%（推理时较少）</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-tc-text-primary mb-2">训练场景</h3>
                  <p className="text-sm text-tc-text-secondary leading-relaxed mb-3">
                    训练模式显存占用显著高于推理，需要额外存储梯度和优化器状态：
                  </p>
                  <div className="bg-tc-bg-page rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="tc-tag tc-tag-info font-mono">总显存</span>
                      <span className="text-tc-text-secondary">= 模型权重 + 优化器状态 + 梯度 + 激活值 + 固定开销</span>
                    </div>
                    <div className="pl-4 space-y-1.5 text-tc-text-placeholder">
                      <p><strong className="text-tc-text-secondary">优化器状态 (AdamW)</strong> = 参数量 × 4字节 × 2（一阶+二阶动量）</p>
                      <p><strong className="text-tc-text-secondary">梯度</strong> = 可训练参数量 × 精度字节数</p>
                      <p><strong className="text-tc-text-secondary">激活值</strong> = 批量大小 × 序列长度 × 隐藏维度 × 层数 × 倍数</p>
                      <p><strong className="text-tc-text-secondary">固定开销</strong> ≈ 1.5 GB（CUDA 上下文、临时变量等）</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-tc-text-primary mb-2">微调场景 (LoRA/QLoRA)</h3>
                  <p className="text-sm text-tc-text-secondary leading-relaxed mb-3">
                    LoRA 等参数高效微调方法可以大幅减少显存需求，因为只训练少量参数：
                  </p>
                  <div className="bg-tc-bg-page rounded-lg p-4 space-y-2 text-sm">
                    <div className="pl-4 space-y-1.5 text-tc-text-placeholder">
                      <p><strong className="text-tc-text-secondary">LoRA</strong>：冻结基础模型，只训练低秩适配器，可训练参数 &lt; 1%</p>
                      <p><strong className="text-tc-text-secondary">QLoRA</strong>：在 LoRA 基础上对基础模型进行 4-bit 量化，进一步减少显存</p>
                      <p><strong className="text-tc-text-secondary">全参数微调</strong>：更新所有参数，显存需求接近训练场景</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-tc-text-primary mb-2">量化对显存的影响</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-tc-border-light">
                          <th className="text-left py-2 px-3 text-tc-text-secondary font-medium">量化方式</th>
                          <th className="text-left py-2 px-3 text-tc-text-secondary font-medium">每参数字节数</th>
                          <th className="text-left py-2 px-3 text-tc-text-secondary font-medium">相对 FP16 压缩比</th>
                          <th className="text-left py-2 px-3 text-tc-text-secondary font-medium">精度影响</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-tc-border-light"><td className="py-2 px-3">FP32</td><td className="py-2 px-3">4 字节</td><td className="py-2 px-3">2x</td><td className="py-2 px-3">最高精度</td></tr>
                        <tr className="border-b border-tc-border-light"><td className="py-2 px-3">FP16 / BF16</td><td className="py-2 px-3">2 字节</td><td className="py-2 px-3">1x（基准）</td><td className="py-2 px-3">几乎无损</td></tr>
                        <tr className="border-b border-tc-border-light"><td className="py-2 px-3">INT8</td><td className="py-2 px-3">1 字节</td><td className="py-2 px-3">0.5x</td><td className="py-2 px-3">轻微损失</td></tr>
                        <tr><td className="py-2 px-3">INT4</td><td className="py-2 px-3">0.5 字节</td><td className="py-2 px-3">0.25x</td><td className="py-2 px-3">较小损失</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 常见问题 */}
          <section className="mb-10">
            <div className="tc-card">
              <div className="tc-card-header">
                <HelpCircle className="w-5 h-5 text-brand" />
                常见问题
              </div>
              <div className="tc-card-body">
                <div className="divide-y divide-tc-border-light">
                  {ZH.faq.map((item, idx) => (
                    <div key={idx} className="py-3">
                      <button
                        className="w-full flex items-center justify-between text-left"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      >
                        <span className="text-sm font-medium text-tc-text-primary pr-4">{item.q}</span>
                        {openFaq === idx
                          ? <ChevronDown className="w-4 h-4 text-tc-text-placeholder flex-shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-tc-text-placeholder flex-shrink-0" />
                        }
                      </button>
                      {openFaq === idx && (
                        <p className="mt-2 text-sm text-tc-text-secondary leading-relaxed pl-0">
                          {item.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 参考文献 */}
          <section>
            <div className="tc-card">
              <div className="tc-card-header">
                <FileText className="w-5 h-5 text-brand" />
                参考文献
              </div>
              <div className="tc-card-body">
                <ul className="space-y-2 text-sm text-tc-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-tc-text-disabled">[1]</span>
                    <span>Vaswani et al. &quot;Attention Is All You Need&quot;, NeurIPS 2017</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tc-text-disabled">[2]</span>
                    <span>Hu et al. &quot;LoRA: Low-Rank Adaptation of Large Language Models&quot;, ICLR 2022</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tc-text-disabled">[3]</span>
                    <span>Dettmers et al. &quot;QLoRA: Efficient Finetuning of Quantized Language Models&quot;, NeurIPS 2023</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tc-text-disabled">[4]</span>
                    <span>Fedus et al. &quot;Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity&quot;, JMLR 2022</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tc-text-disabled">[5]</span>
                    <span>NVIDIA. &quot;GPU Memory Optimization for Deep Learning&quot;, NVIDIA Developer Blog</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
