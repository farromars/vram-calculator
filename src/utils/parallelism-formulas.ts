/**
 * 多机多卡并行策略推荐计算
 * 触发条件：总显存需求 > 800 GB
 */

export type ParallelStrategy = 'tp' | 'tp+pp' | 'ep+tp';

export interface ParallelismConfig {
  strategy: ParallelStrategy;
  tp: number;           // 张量并行度 = 每节点 GPU 数
  pp: number;           // 流水线并行度 = 节点数
  ep: number;           // 专家并行度（MoE 专用，否则为 1）
  totalGPUs: number;
  totalNodes: number;
  totalVRAM: number;    // GB
  headroom: number;     // 余量（GB）
  vllmFlags: string;
  trtllmFlags: string;
  interconnect: 'nvlink' | 'pcie' | 'infiniband';
  warning?: string;     // 互联/配置提示
}

export interface ParallelismInput {
  requiredGB: number;
  gpuVRAM: number;      // 单卡显存（GB）
  gpuName: string;
  gpusPerNode: number;  // 每节点卡数（4 或 8）
  isMoE: boolean;
  seqLen: number;
}

/** 触发并行推荐的阈值 */
export const PARALLEL_THRESHOLD_GB = 800;

export function computeParallelism(input: ParallelismInput): ParallelismConfig {
  const { requiredGB, gpuVRAM, gpuName, gpusPerNode, isMoE, seqLen } = input;

  const nodeVRAM = gpuVRAM * gpusPerNode;
  const minNodes = Math.ceil(requiredGB / nodeVRAM);
  const tp = gpusPerNode;
  const pp = Math.max(1, minNodes);
  const totalGPUs = tp * pp;
  const totalVRAM = totalGPUs * gpuVRAM;
  const headroom = totalVRAM - requiredGB;

  // 策略选择：MoE > 多节点TP+PP > 单节点TP
  const strategy: ParallelStrategy =
    isMoE ? 'ep+tp' : minNodes > 1 ? 'tp+pp' : 'tp';

  // 互联建议
  const interconnect: ParallelismConfig['interconnect'] =
    minNodes > 1 ? 'infiniband' : 'nvlink';

  // vLLM 参数
  const vllmFlags = [
    `--tensor-parallel-size ${tp}`,
    pp > 1 ? `--pipeline-parallel-size ${pp}` : null,
    `--max-model-len ${seqLen}`,
  ].filter(Boolean).join(' \\\n  ');

  // TensorRT-LLM 参数
  const trtllmFlags = [
    'trtllm-build',
    `--tp_size ${tp}`,
    pp > 1 ? `--pp_size ${pp}` : null,
    `--max_seq_len ${seqLen}`,
  ].filter(Boolean).join(' \\\n  ');

  // 警告信息
  let warning: string | undefined;
  if (minNodes > 1) {
    warning = `多节点部署需要 InfiniBand 网络 + GPUDirect RDMA，节点间带宽直接影响 TP 通信效率`;
  } else if (gpusPerNode > 4 && !gpuName.includes('H100') && !gpuName.includes('H200')) {
    warning = `${gpuName} 建议确认节点内 NVLink 互联，PCIe 拓扑会显著增加 TP 通信开销`;
  }

  return {
    strategy,
    tp,
    pp,
    ep: isMoE ? tp : 1,
    totalGPUs,
    totalNodes: minNodes,
    totalVRAM,
    headroom,
    vllmFlags,
    trtllmFlags,
    interconnect,
    warning,
  };
}

/** 格式化显存大小（GB / TB） */
export function formatVRAMSize(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
  return `${gb} GB`;
}

/** 策略说明文本 */
export const STRATEGY_LABELS: Record<ParallelStrategy, string> = {
  'tp': '单节点张量并行（TP）',
  'tp+pp': '多节点 TP + 流水线并行（PP）',
  'ep+tp': 'MoE 专家并行 + 张量并行（EP+TP）',
};

export const STRATEGY_DESC: Record<ParallelStrategy, string> = {
  'tp': '模型张量切分到单节点多卡，适合节点内 NVLink 高带宽环境',
  'tp+pp': '每节点内 TP 切分张量，跨节点 PP 切分模型层，适合多机部署',
  'ep+tp': 'MoE 专家分散到不同卡，节点内 TP 处理注意力层，适合 DeepSeek-R1/Mixtral',
};
