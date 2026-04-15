import { NextRequest, NextResponse } from 'next/server';

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

/** config.json 顶层或 text_config 子对象的字段 */
interface LLMConfigFields {
  model_type?: string;
  hidden_size?: number;
  num_hidden_layers?: number;
  num_attention_heads?: number;
  num_key_value_heads?: number;
  vocab_size?: number;
  // MoE
  num_experts?: number;
  num_local_experts?: number;
  n_routed_experts?: number;
  num_experts_per_tok?: number;
  num_selected_experts?: number;
  moe_intermediate_size?: number;
  intermediate_size?: number;
  // 参数量（部分模型直接写出）
  num_parameters?: number;
  architectures?: string[];
}

/** config.json 完整结构（包含各种多模态嵌套子对象） */
interface HFConfig extends LLMConfigFields {
  // 各架构的 LLM 参数嵌套键名（不同模型使用不同键）：
  text_config?: LLMConfigFields;   // Qwen3.5-VL / LLaVA / Idefics 等
  llm_config?: LLMConfigFields;    // InternVL / Qianfan-OCR 等
  language_config?: LLMConfigFields; // 部分 Flamingo 衍生架构
  // 扩散模型 / 非 LLM 模型的识别字段
  _class_name?: string;            // ComfyUI / Diffusers
  pipeline_tag?: string;
}

// 按优先级排列的 LLM 嵌套键名列表
const NESTED_LLM_KEYS: Array<keyof HFConfig> = [
  'text_config',
  'llm_config',
  'language_config',
];

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

/**
 * 从 config 中提取 LLM 参数字段：
 * 1. 优先顶层（标准 LLM，hidden_size 在根部）
 * 2. 顶层缺失时，按 NESTED_LLM_KEYS 顺序查找嵌套子对象
 *    - text_config: Qwen3.5-VL、LLaVA 等
 *    - llm_config:  InternVL、百度千帆 OCR 等
 *    - language_config: 部分 Flamingo 衍生架构
 */
function extractLLMFields(config: HFConfig): LLMConfigFields {
  if (config.hidden_size) return config;
  for (const key of NESTED_LLM_KEYS) {
    const sub = config[key] as LLMConfigFields | undefined;
    if (sub?.hidden_size) return sub;
  }
  return config;
}

/**
 * 判断是否为多模态模型（参数来自嵌套子对象）
 */
function detectIsMultimodal(config: HFConfig): boolean {
  if (config.hidden_size) return false; // 顶层有则为纯 LLM
  return NESTED_LLM_KEYS.some(key => !!(config[key] as LLMConfigFields | undefined)?.hidden_size);
}

/**
 * 判断是否为非 LLM 模型（扩散模型、纯权重仓库等），返回友好说明
 */
function detectNonLLM(config: HFConfig): string | null {
  const type = (config.model_type ?? '').toLowerCase();
  const arch = (config.architectures?.[0] ?? '').toLowerCase();
  const cls  = (config._class_name ?? '').toLowerCase();

  // ① _diffusers_version 字段存在 → 100% 是 Diffusers 扩散/视频模型
  //    （WanModel、DiT、UNet2D 等所有 Diffusers 组件都带此字段）
  if ((config as Record<string, unknown>)['_diffusers_version']) {
    const label = config.model_type ? `（model_type: ${config.model_type}）` : '';
    return `该模型是 Diffusers 格式的扩散/视频生成模型${label}，不是文本 LLM，无法估算显存。`;
  }

  // ② 扩散模型关键词匹配
  const diffusionExact = ['unet', 'vae', 'flux', 'sdxl', 'controlnet', 'ernie_image'];
  const diffusionPrefix = ['stable_diffusion'];
  // 视频/图像生成专属 model_type（WanVideo、CogVideo、HunyuanVideo 等）
  const diffusionModelTypes = ['ti2v', 't2v', 'i2v', 'wan', 'cogvideo', 'hunyuanvideo',
                               'animatediff', 'videocrafter', 'opensora'];
  // 'dit' 需要词边界：避免误中 'conditional'
  const hasDiT = /(?<![a-z])dit(?![a-z])/.test(type) ||
                 /(?<![a-z])dit(?![a-z])/.test(arch) ||
                 /(?<![a-z])dit(?![a-z])/.test(cls);

  const hasDiffusion =
    hasDiT ||
    diffusionExact.some(k => type === k || arch.startsWith(k) || cls.includes(k)) ||
    diffusionPrefix.some(k => type.includes(k) || arch.includes(k)) ||
    diffusionModelTypes.some(k => type === k || type.startsWith(k));

  if (hasDiffusion) {
    return '该模型是图像/视频生成模型，不是文本 LLM，无法估算 VRAM。';
  }

  // ③ 没有任何 config 字段（纯权重仓库）
  if (!type && !arch && !config.hidden_size && !config.text_config && !config.llm_config) {
    return '该仓库未包含标准的 config.json，可能是纯权重文件仓库（如 ComfyUI 模型），无法自动解析参数。';
  }
  return null;
}

/**
 * 架构类型映射
 */
function mapArchitecture(fields: LLMConfigFields): string {
  const arch = (fields.architectures?.[0] ?? '').toLowerCase();
  const type = (fields.model_type ?? '').toLowerCase();

  const isMoE =
    fields.num_experts != null ||
    fields.num_local_experts != null ||
    fields.n_routed_experts != null ||
    type.includes('moe') ||
    arch.includes('moe');
  if (isMoE) return 'moe';

  if (type.includes('chatglm') || type.includes('glm')) return 'glm';

  // 多模态：明确的多模态架构关键词（不包含 qwen3_5，它是 LLM）
  const multimodalTypes = ['llava', 'blip', 'clip', 'flamingo', 'qwen2_vl', 'qwen3_vl', 'internvl', 'minicpm'];
  if (multimodalTypes.some(t => type.includes(t) || arch.includes(t))) return 'multimodal';

  return 'transformer';
}

/**
 * 参数量估算
 * Dense: 12 * L * H² + 2 * V * H
 * MoE:   attention + num_experts * FFN + embedding
 */
function estimateParams(fields: LLMConfigFields): number | null {
  if (fields.num_parameters && fields.num_parameters > 0) {
    return parseFloat((fields.num_parameters / 1e9).toFixed(2));
  }
  const H = fields.hidden_size;
  const L = fields.num_hidden_layers;
  const V = fields.vocab_size;
  if (!H || !L || !V) return null;

  const numExperts = fields.num_local_experts ?? fields.num_experts ?? fields.n_routed_experts;
  const ffnSize    = fields.moe_intermediate_size ?? (numExperts ? fields.intermediate_size : undefined);
  if (numExperts && ffnSize) {
    const total = 4 * H * H * L + 3 * H * ffnSize * numExperts * L + 2 * V * H;
    return parseFloat((total / 1e9).toFixed(1));
  }
  const total = 12 * L * H * H + 2 * V * H;
  return parseFloat((total / 1e9).toFixed(2));
}

// ──────────────────────────────────────────────
// 安全：SSRF 防护
// ──────────────────────────────────────────────

const ALLOWED_HOSTS = ['huggingface.co', 'modelscope.cn'];

/**
 * 校验 URL 是否属于允许的域名，防止 SSRF 攻击
 * - 仅允许 https://huggingface.co 和 https://modelscope.cn
 * - 拒绝内网 IP、localhost、file:// 等
 */
function assertSafeUrl(rawUrl: string): void {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error('无效的 URL 格式');
  }
  if (u.protocol !== 'https:') {
    throw new Error('仅支持 HTTPS 链接');
  }
  const host = u.hostname.toLowerCase();
  const allowed = ALLOWED_HOSTS.some(h => host === h || host.endsWith(`.${h}`));
  if (!allowed) {
    throw new Error(`不支持的域名：${host}。仅允许 HuggingFace 和 ModelScope 链接`);
  }
}

// ──────────────────────────────────────────────
// URL 解析
// ──────────────────────────────────────────────

function parseHuggingFaceUrl(url: string): { org: string; model: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('huggingface.co')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { org: parts[0], model: parts[1] };
  } catch { return null; }
}

function parseModelScopeUrl(url: string): { org: string; model: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('modelscope.cn')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('models');
    if (idx === -1 || parts.length < idx + 3) return null;
    return { org: parts[idx + 1], model: parts[idx + 2] };
  } catch { return null; }
}

// ──────────────────────────────────────────────
// 远端请求
// ──────────────────────────────────────────────

async function fetchHuggingFaceConfig(org: string, model: string): Promise<HFConfig> {
  const res = await fetch(
    `https://huggingface.co/${org}/${model}/resolve/main/config.json`,
    { headers: { 'User-Agent': 'vram-calculator/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(15000) }
  );
  if (res.ok) return res.json();

  if (res.status === 404) {
    // 查询仓库文件列表，给出具体原因
    try {
      const apiRes = await fetch(
        `https://huggingface.co/api/models/${org}/${model}`,
        { headers: { 'User-Agent': 'vram-calculator/1.0' }, signal: AbortSignal.timeout(8000) }
      );
      if (apiRes.ok) {
        const meta = await apiRes.json() as { siblings?: { rfilename: string }[]; pipeline_tag?: string };
        const files = (meta.siblings ?? []).map((f) => f.rfilename);
        const hasConfig = files.some(f => f === 'config.json');
        if (!hasConfig) {
          const tag = meta.pipeline_tag ?? '';
          const hint = tag
            ? `该仓库的 pipeline_tag 为「${tag}」，没有根目录 config.json，不是标准 LLM 格式，无法自动导入。`
            : `该仓库没有根目录 config.json（文件列表：${files.slice(0, 5).join(', ')}${files.length > 5 ? '…' : ''}），不是标准 LLM 格式，无法自动导入。`;
          throw new Error(hint);
        }
      }
    } catch (e) {
      // 如果 throw 的是我们自己构造的错误，直接往上抛
      if (e instanceof Error && !e.message.includes('HuggingFace config.json')) throw e;
    }
    throw new Error(`HuggingFace config.json 获取失败 (404): ${org}/${model}，请确认模型页 URL 是否正确。`);
  }

  throw new Error(`HuggingFace config.json 获取失败 (${res.status}): ${org}/${model}`);
}

async function fetchModelScopeConfig(org: string, model: string): Promise<HFConfig> {
  for (const branch of ['master', 'main']) {
    try {
      const res = await fetch(
        `https://modelscope.cn/models/${org}/${model}/resolve/${branch}/config.json`,
        { headers: { 'User-Agent': 'vram-calculator/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(12000) }
      );
      if (res.ok) return (await res.json()) as HFConfig;
    } catch { /* 继续下一 branch */ }
  }
  // fallback: raw API
  const res = await fetch(
    `https://modelscope.cn/api/v1/models/${org}/${model}/repo/raw?FilePath=config.json`,
    { headers: { 'User-Agent': 'vram-calculator/1.0' }, signal: AbortSignal.timeout(12000) }
  );
  if (!res.ok) throw new Error(`ModelScope config.json 获取失败 (${res.status}): ${org}/${model}`);
  return (await res.json()) as HFConfig;
}

// ──────────────────────────────────────────────
// 路由处理
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '请提供有效的模型 URL' }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    // ── 安全校验：防 SSRF ──
    assertSafeUrl(trimmedUrl);
    const hfParsed = parseHuggingFaceUrl(trimmedUrl);
    const msParsed = parseModelScopeUrl(trimmedUrl);

    if (!hfParsed && !msParsed) {
      return NextResponse.json(
        { error: '不支持的 URL 格式，请粘贴 HuggingFace 或 ModelScope 的模型页链接' },
        { status: 400 }
      );
    }

    let rawConfig: HFConfig;
    let source: 'huggingface' | 'modelscope';
    let org: string;
    let modelName: string;

    if (hfParsed) {
      ({ org, model: modelName } = hfParsed);
      source = 'huggingface';
      rawConfig = await fetchHuggingFaceConfig(org, modelName);
    } else {
      ({ org, model: modelName } = msParsed!);
      source = 'modelscope';
      try {
        rawConfig = await fetchModelScopeConfig(org, modelName);
      } catch {
        try {
          rawConfig = await fetchHuggingFaceConfig(org, modelName);
          source = 'huggingface';
        } catch {
          throw new Error(`无法从 ModelScope 或 HuggingFace 获取 ${org}/${modelName} 的 config.json`);
        }
      }
    }

    // 非 LLM 模型检测
    const nonLLMReason = detectNonLLM(rawConfig);
    if (nonLLMReason) {
      return NextResponse.json({ error: nonLLMReason }, { status: 422 });
    }

    // 提取 LLM 字段（支持顶层 & text_config 嵌套两种结构）
    const fields = extractLLMFields(rawConfig);

    const hidden_size         = fields.hidden_size;
    const num_hidden_layers   = fields.num_hidden_layers;
    const num_attention_heads = fields.num_attention_heads;
    const num_key_value_heads = fields.num_key_value_heads;
    const vocab_size          = fields.vocab_size;

    const missingFields: string[] = [];
    if (!hidden_size)         missingFields.push('hidden_size');
    if (!num_hidden_layers)   missingFields.push('num_hidden_layers');
    if (!num_attention_heads) missingFields.push('num_attention_heads');
    if (!vocab_size)          missingFields.push('vocab_size');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `config.json 缺少必要字段：${missingFields.join(', ')}。该模型可能使用了非标准配置格式。` },
        { status: 422 }
      );
    }

    const numExperts      = fields.num_local_experts ?? fields.num_experts ?? fields.n_routed_experts ?? null;
    const numActiveExperts = fields.num_experts_per_tok ?? fields.num_selected_experts ?? null;
    const architecture    = mapArchitecture(fields);
    const estimatedParams = estimateParams(fields);

    let activeParams: number | null = null;
    if (architecture === 'moe' && numExperts && numActiveExperts && estimatedParams) {
      activeParams = parseFloat(((numActiveExperts / numExperts) * estimatedParams).toFixed(2));
    }

    // 多模态标识：参数来自嵌套子对象（text_config / llm_config 等）= 多模态包 LLM
    const isMultimodal = detectIsMultimodal(rawConfig);

    // 多模态模型的实际 model_type 可能在 text_config 里，优先使用顶层
    const displayModelType = rawConfig.model_type ?? fields.model_type ?? '';

    return NextResponse.json({
      success: true,
      source,
      modelId: `${org}/${modelName}`,
      displayName: modelName,
      isMultimodal,
      config: {
        model_type: displayModelType,
        architectures: rawConfig.architectures ?? fields.architectures ?? [],
      },
      draft: {
        name: modelName,
        architecture,
        params: estimatedParams != null ? String(estimatedParams) : '',
        hiddenSize: String(hidden_size),
        numLayers: String(num_hidden_layers),
        numHeads: String(num_attention_heads),
        numKVHeads:
          num_key_value_heads != null && num_key_value_heads !== num_attention_heads
            ? String(num_key_value_heads)
            : '',
        vocabSize: String(vocab_size),
        activeParams: activeParams != null ? String(activeParams) : '',
      },
      meta: { numExperts, numActiveExperts, modelType: displayModelType },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
