// Per-provider timeout: 18s for long-form JSON tasks (CV analysis), 5s otherwise.
function tFetch(url: string, opts: RequestInit, ms = 18000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// Reasoning models (DeepSeek-R1, QwQ) prefix answers with a <think>...</think> block.
// Strip it so the app only receives the final answer, not the chain-of-thought.
function stripThink(text: string): string {
  if (!text.includes("<think>")) return text;
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

type MsgContentItem =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: string; media_type: string; data: string } }
  | { type: "document"; source: { type: string; media_type: string; data: string } };

type Msg = { role: string; content: string | MsgContentItem[] };

function textOnly(content: string | MsgContentItem[]): string {
  if (typeof content === "string") return content;
  const texts: string[] = [];
  for (const c of content as MsgContentItem[]) {
    if (c.type === "text") texts.push((c as { type: "text"; text: string }).text);
    else if (c.type === "image") texts.push("[Image CV fournie — analyse visuelle requise]");
    else if (c.type === "document") texts.push("[Document PDF fourni — analyse requise]");
  }
  return texts.join("\n") || "[fichier joint]";
}

interface RafiqOpts {
  task: "json" | "dialogue" | "fast";
  messages: Msg[];
  system?: string;
  max_tokens?: number;
}

const ev = (k: string, fb = "") => process.env[k] || fb;

// ─── MODEL LISTS ────────────────────────────────────────────────────────────

// Groq — free tier, INDEPENDENT 30 RPM per model.
// Reasoning models (deepseek-r1, qwen-qwq) excel at structured JSON & scoring tasks.
const GROQ_MODELS = [
  "meta-llama/llama-4-maverick-17b-128e-instruct",  // Best Groq quality, 128k ctx
  "llama-3.3-70b-versatile",                          // Reliable 70B
  "deepseek-r1-distill-llama-70b",                    // Reasoning — best JSON analysis
  "qwen-qwq-32b",                                     // Reasoning + multilingual FR/AR
  "meta-llama/llama-4-scout-17b-16e-instruct",        // Fast + good quality
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
  "llama-3.1-8b-instant",
];

const GROQ_MODELS_FAST = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "llama-3.3-70b-versatile",
];

// NVIDIA NIM — enterprise inference, 1 000 free API credits/month (no card).
// Hosts full DeepSeek-R1 (685B distill), Qwen3-235B, Nemotron-253B.
// Best for: CV-job matching, compliance scoring, business plan JSON, Arabic+French.
// Sign up free: https://build.nvidia.com  |  Set env var: NVIDIA_API_KEY
const NVIDIA_MODELS = [
  "deepseek-ai/deepseek-r1-0528",              // Best reasoning — 685B distill, rivals o1
  "qwen/qwen3-235b-a22b",                      // 235B — best free multilingual (FR+AR++)
  "nvidia/llama-3.3-nemotron-super-49b-v1",    // NVIDIA-tuned, fast + instruction-following
  "meta/llama-4-maverick-17b-128e-instruct",   // 128k context
  "nvidia/llama-3.1-nemotron-ultra-253b-v1",   // Largest free NVIDIA model — highest quality
];

// DeepSeek — direct API, near-free ($0.07–0.27 / M tokens).
// V3 is top-tier at structured JSON; R1 rivals o1-mini on reasoning.
// Best for: CV analysis, matching scores, admin report generation.
// Sign up: https://platform.deepseek.com  |  Set env var: DEEPSEEK_API_KEY
const DEEPSEEK_MODELS = [
  "deepseek-chat",      // DeepSeek-V3 — fast, excellent structured JSON, strong FR/AR
  "deepseek-reasoner",  // DeepSeek-R1 — best reasoning, ideal for compliance scoring
];

// Cerebras — LPU hardware, 1 000–2 000 tok/s, 1M tokens/day free.
// Fastest free inference; ideal for real-time dialogue and suggestions.
// Sign up free (no card): https://cloud.cerebras.ai  |  Set env var: CEREBRAS_API_KEY
const CEREBRAS_MODELS = [
  "llama-4-scout-17b-16e-instruct",  // Best speed/quality on Cerebras
  "qwen3-32b",                        // Excellent FR+AR multilingual
  "llama-3.3-70b",
  "llama-3.1-8b",
];

const CEREBRAS_MODELS_FAST = [
  "llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b",
  "qwen3-32b",
];

// SambaNova — RDU hardware, ~700 tok/s, free tier.
// Llama-4-Maverick at 128k context — best for long CV/dossier analysis.
// Sign up free (no card): https://cloud.sambanova.ai  |  Set env var: SAMBANOVA_API_KEY
const SAMBANOVA_MODELS = [
  "Llama-4-Maverick-17B-128E-Instruct",  // 128k ctx — long business plans, CV analysis
  "Llama-4-Scout-17B-16E-Instruct",
  "DeepSeek-V3-0324",                     // Strong French/Arabic structured output
  "Llama-3.3-70B-Instruct",
];

// Mistral La Plateforme — ~1B tokens/month free.
// Best French + Arabic bilingual models — critical for TalentMap & IdeaMap Morocco.
// Sign up free: https://console.mistral.ai  |  Set env var: MISTRAL_API_KEY
const MISTRAL_MODELS = [
  "mistral-small-latest",  // 128k ctx, top free FR+AR bilingual
  "open-mistral-nemo",     // 128k ctx, multilingual, fast
  "open-mixtral-8x7b",
];

// Together AI — specific permanently-free models.
// Set env var: TOGETHER_API_KEY
const TOGETHER_MODELS = [
  "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
  "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-Free",
];

// Hyperbolic — OpenAI-compatible GPU inference marketplace, free starter credits on
// signup, 25+ open models (DeepSeek-V3, Qwen2.5-72B, Llama 3.1). Drop-in OpenAI base URL.
// Sign up free: https://app.hyperbolic.xyz  |  Set env var: HYPERBOLIC_API_KEY
const HYPERBOLIC_MODELS = [
  "deepseek-ai/DeepSeek-V3",              // Excellent structured JSON, strong FR/AR
  "Qwen/Qwen2.5-72B-Instruct",             // Best multilingual on this provider
  "meta-llama/Meta-Llama-3.1-70B-Instruct",
];

// Fireworks AI — OpenAI-compatible, $1 free starter credit (~1M tokens on a 70B model).
// Fast serverless inference tuned for function calling & structured output.
// Sign up free: https://fireworks.ai  |  Set env var: FIREWORKS_API_KEY
const FIREWORKS_MODELS = [
  "accounts/fireworks/models/deepseek-v3",
  "accounts/fireworks/models/llama-v3p3-70b-instruct",
  "accounts/fireworks/models/qwen2p5-72b-instruct",
];

// Hugging Face Inference Providers router — OpenAI-compatible, small free monthly quota
// for signed-in users. Auto-routes each model to whichever backend (Together, Fireworks,
// Hyperbolic, Novita…) is fastest, so it's a useful extra shot even when this app's own
// keys for those backends are rate-limited.
// Sign up free: https://huggingface.co/settings/tokens  |  Set env var: HUGGINGFACE_API_KEY
const HUGGINGFACE_MODELS = [
  "deepseek-ai/DeepSeek-V3-0324",
  "meta-llama/Llama-3.3-70B-Instruct",
  "Qwen/Qwen2.5-72B-Instruct",
];

// GitHub Models — free, OpenAI-compatible access to frontier models via a GitHub PAT
// (needs "models: read" permission). Modest per-model daily caps, but genuinely
// higher-quality models than most other free tiers — good for the final JSON step.
// Sign up: https://github.com/settings/personal-access-tokens (free) | Set env var: GITHUB_MODELS_TOKEN
const GITHUB_MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "meta/Meta-Llama-3.1-70B-Instruct",
  "mistral-ai/mistral-large",
  "deepseek/DeepSeek-R1",
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Anthropic Claude — reads ANTHROPIC_API_KEY env var.
async function anthropic(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const apiKey = ev("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("no ANTHROPIC_API_KEY");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "x-api-key": apiKey,
  };

  const model = ev("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001");
  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTok,
    messages: msgs.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  };
  if (sys) body.system = sys;

  const timeout = maxTok <= 500 ? 5000 : 18000;
  const res = await tFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }, timeout);
  if (res.status === 401) throw new Error("Anthropic 401");
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const d = await res.json();
  return d.content?.[0]?.text ?? "";
}

async function gemini(msgs: Msg[], sys: string | undefined, maxTok: number, fast = false): Promise<string> {
  const key = ev("GEMINI_API_KEY");
  if (!key) throw new Error("no GEMINI_API_KEY");
  const model = process.env.GEMINI_MODEL || (fast ? "gemini-2.5-flash-lite" : "gemini-2.5-flash");
  const contents = msgs.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: textOnly(m.content) }],
  }));
  const body: Record<string, unknown> = { contents, generationConfig: { maxOutputTokens: maxTok } };
  if (sys) body.systemInstruction = { parts: [{ text: sys }] };
  const gTimeout = maxTok <= 500 ? 5000 : 18000;
  const res = await tFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    gTimeout
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Groq: tries every free model in sequence until one succeeds.
async function groq(msgs: Msg[], sys: string | undefined, maxTok: number, fast = false): Promise<string> {
  const key = ev("GROQ_API_KEY");
  if (!key) throw new Error("no GROQ_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const groqTimeout = maxTok <= 500 ? 5000 : 18000;
  for (const model of fast ? GROQ_MODELS_FAST : GROQ_MODELS) {
    try {
      const res = await tFetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      }, groqTimeout);
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("Groq 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("Groq all models exhausted");
}

// Cerebras: 1000–2000 tok/s on LPU hardware — fastest free inference available.
// 1M tokens/day free, no credit card. Best for real-time dialogue & suggestions.
async function cerebras(msgs: Msg[], sys: string | undefined, maxTok: number, fast = false): Promise<string> {
  const key = ev("CEREBRAS_API_KEY");
  if (!key) throw new Error("no CEREBRAS_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const cbTimeout = maxTok <= 500 ? 5000 : 18000;
  for (const model of fast ? CEREBRAS_MODELS_FAST : CEREBRAS_MODELS) {
    try {
      const res = await tFetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      }, cbTimeout);
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("Cerebras 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("Cerebras all models exhausted");
}

// SambaNova: RDU hardware ~700 tok/s, Llama 4 Maverick at 128k context.
// Excellent for INDH dossier analysis and long business plan generation.
async function sambanova(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("SAMBANOVA_API_KEY");
  if (!key) throw new Error("no SAMBANOVA_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of SAMBANOVA_MODELS) {
    try {
      const res = await tFetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("SambaNova 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("SambaNova all models exhausted");
}

// Mistral La Plateforme: ~1B tokens/month free.
// Best French + Arabic bilingual models — essential for INDH Morocco (French & Arabic official languages).
// mistral-small-latest scores highest on French/Arabic benchmarks among free-tier models.
async function mistral(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("MISTRAL_API_KEY");
  if (!key) throw new Error("no MISTRAL_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of MISTRAL_MODELS) {
    try {
      const res = await tFetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("Mistral 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("Mistral all models exhausted");
}

// NVIDIA NIM — enterprise-grade inference, 1 000 free API credits/month.
// DeepSeek-R1 full (685B distill) and Qwen3-235B for best reasoning + multilingual quality.
async function nvidia(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("NVIDIA_API_KEY");
  if (!key) throw new Error("no NVIDIA_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of NVIDIA_MODELS) {
    try {
      const res = await tFetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("NVIDIA 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return stripThink(text);
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("NVIDIA NIM all models exhausted");
}

// DeepSeek direct API — near-free at $0.07–0.27/M tokens.
// V3 leads on structured JSON output; R1 rivals o1-mini on reasoning.
async function deepseek(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("DEEPSEEK_API_KEY");
  if (!key) throw new Error("no DEEPSEEK_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of DEEPSEEK_MODELS) {
    try {
      const res = await tFetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("DeepSeek 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return stripThink(text);
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("DeepSeek all models exhausted");
}

async function openrouter(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("OPENROUTER_API_KEY");
  if (!key) throw new Error("no OPENROUTER_API_KEY");
  // Best free models first — quality order: reasoning > multilingual > fast
  const models = [
    "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",  // 253B — largest free model
    "deepseek/deepseek-r1-0528:free",                 // Latest R1 — best reasoning free
    "qwen/qwen3-235b-a22b:free",                      // 235B — best free multilingual FR+AR
    "deepseek/deepseek-v3-0324:free",                 // V3 — excellent structured JSON
    "meta-llama/llama-4-maverick:free",               // Strong quality
    "google/gemma-3-27b-it:free",                     // Google Gemma 3 — good multilingual
    "qwen/qwen3-30b-a3b:free",                        // Faster Qwen3 — FR+AR quality
    process.env.OPENROUTER_MODEL || "microsoft/phi-4:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ];
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of models) {
    try {
      const res = await tFetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return stripThink(text);
    } catch { continue; }
  }
  throw new Error("OpenRouter exhausted");
}

async function together(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("TOGETHER_API_KEY");
  if (!key) throw new Error("no TOGETHER_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of TOGETHER_MODELS) {
    try {
      const res = await tFetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch { continue; }
  }
  throw new Error("Together exhausted");
}

// Hyperbolic — OpenAI-compatible drop-in, free starter credits.
async function hyperbolic(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("HYPERBOLIC_API_KEY");
  if (!key) throw new Error("no HYPERBOLIC_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of HYPERBOLIC_MODELS) {
    try {
      const res = await tFetch("https://api.hyperbolic.xyz/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("Hyperbolic 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("Hyperbolic all models exhausted");
}

// Fireworks AI — OpenAI-compatible, $1 free starter credit.
async function fireworks(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("FIREWORKS_API_KEY");
  if (!key) throw new Error("no FIREWORKS_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of FIREWORKS_MODELS) {
    try {
      const res = await tFetch("https://api.fireworks.ai/inference/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("Fireworks 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("Fireworks all models exhausted");
}

// Hugging Face Inference Providers router — OpenAI-compatible, small free monthly quota.
async function huggingface(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("HUGGINGFACE_API_KEY");
  if (!key) throw new Error("no HUGGINGFACE_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of HUGGINGFACE_MODELS) {
    try {
      const res = await tFetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("Hugging Face 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("Hugging Face all models exhausted");
}

async function githubModels(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("GITHUB_MODELS_TOKEN");
  if (!key) throw new Error("no GITHUB_MODELS_TOKEN");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of GITHUB_MODELS) {
    try {
      const res = await tFetch("https://models.github.ai/inference/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      });
      if (res.status === 429) continue;
      if (res.status === 401) throw new Error("GitHub Models 401");
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e: any) {
      if (e.message?.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("GitHub Models exhausted");
}

async function tryOnce(fn: (m: Msg[], s: string | undefined, t: number) => Promise<string>, msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string | null> {
  try {
    const text = await fn(msgs, sys, maxTok);
    return text || null;
  } catch {
    return null;
  }
}

// Race providers in parallel — resolves with the first valid response within timeoutMs,
// or null if all fail / none responds in time. Orphaned requests complete but are discarded.
async function raceFirst(
  fns: Array<(m: Msg[], s: string | undefined, t: number) => Promise<string>>,
  msgs: Msg[], sys: string | undefined, maxTok: number, timeoutMs: number
): Promise<string | null> {
  return new Promise(resolve => {
    let done = false;
    let pending = fns.length;
    const guard = setTimeout(() => { if (!done) { done = true; resolve(null); } }, timeoutMs);
    const settle = (text: string | null) => {
      if (!done && text) { done = true; clearTimeout(guard); resolve(text); return; }
      if (--pending === 0 && !done) { done = true; clearTimeout(guard); resolve(null); }
    };
    for (const fn of fns) {
      fn(msgs, sys, maxTok).then(t => settle(t || null)).catch(() => settle(null));
    }
  });
}

// Race 5 Groq models in parallel — each has an INDEPENDENT 30 RPM rate limit,
// so firing them simultaneously quintuples effective throughput vs cycling sequentially.
// Always available via hardcoded key. Returns the highest-quality fastest response.
// Mix of quality (maverick, 70B), reasoning (deepseek-r1, qwen-qwq), and speed (scout).
async function raceGroqModels(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("GROQ_API_KEY");
  if (!key) throw new Error("no GROQ_API_KEY");
  const all = [
    ...(sys ? [{ role: "system", content: sys }] : []),
    ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) })),
  ];
  const topModels = [
    "meta-llama/llama-4-maverick-17b-128e-instruct", // Best quality, 128k ctx
    "llama-3.3-70b-versatile",                        // Reliable 70B
    "deepseek-r1-distill-llama-70b",                  // Reasoning — superior JSON analysis
    "qwen-qwq-32b",                                   // Reasoning + strong FR/AR multilingual
    "meta-llama/llama-4-scout-17b-16e-instruct",      // Speed fallback
  ];
  const perTok = maxTok <= 500 ? 5000 : 10000;
  const result = await raceFirst(
    topModels.map(model => async (_m: Msg[], _s: string | undefined, _t: number): Promise<string> => {
      const res = await tFetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
      }, perTok);
      if (res.status === 429) throw new Error("429");
      if (res.status === 401) throw new Error("Groq 401");
      if (!res.ok) throw new Error(`Groq ${res.status}`);
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (!text) throw new Error("empty");
      return stripThink(text);  // deepseek-r1 and qwen-qwq output <think> blocks
    }),
    msgs, sys, maxTok, perTok + 2000
  );
  if (result) return result;
  // Cycle through remaining Groq models sequentially as last resort
  return groq(msgs, sys, maxTok, false);
}

// Provider functions cycle through several models internally (e.g. nvidia() tries 5
// models sequentially, each with an 18s fetch timeout) — a single unlucky provider in
// a fallback loop could otherwise burn 60-90s on its own. Cap each fallback-phase
// attempt at a fixed wall-clock budget so the loop keeps moving through providers
// briskly; the abandoned call is simply discarded (same orphan pattern as raceFirst).
function withTimeout(p: Promise<string | null>, ms: number): Promise<string | null> {
  return Promise.race([p, sleep(ms).then(() => null)]);
}

export async function rafiq({ task, messages, system, max_tokens = 1200 }: RafiqOpts): Promise<string> {
  const fast = task === "fast";
  // Every phase past the initial race checks this before starting — bounds total
  // server time well under Vercel's function ceiling (see route.ts's maxDuration)
  // so a saturated cascade fails cleanly with a JSON error instead of being killed
  // mid-request by the platform.
  const startedAt = Date.now();
  const outOfTime = () => Date.now() - startedAt > 45000;

  if (fast) {
    // Fast path: race Cerebras LPU + Groq + Gemini Flash + DeepSeek-V3 in parallel (4s window).
    // Cerebras hits 1 000–2 000 tok/s; DeepSeek-V3 is surprisingly fast.
    const fastTok = Math.min(max_tokens, 800);
    const fastResult = await raceFirst([
      (m, s, t) => cerebras(m, s, t, true),   // LPU — fastest free inference
      (m, s, t) => groq(m, s, t, true),        // Fast when GROQ_API_KEY is set
      (m, s, t) => gemini(m, s, t, true),      // Gemini Flash Lite
      deepseek,                                 // DeepSeek-V3 — fast + high quality
    ], messages, system, fastTok, 4000);
    if (fastResult) return fastResult;
    // Sequential fallback — fast path should rarely reach here
    for (const fn of [
      nvidia, sambanova, anthropic, mistral, together, githubModels,
      hyperbolic, fireworks, huggingface,
      (m: Msg[], s: string | undefined, t: number) => groq(m, s, t, true),
    ]) {
      if (outOfTime()) break;
      const text = await withTimeout(tryOnce(fn, messages, system, fastTok), 6000);
      if (text) return text;
    }
    // Second sweep, mirroring the JSON/dialogue path — a short wait lets a shared
    // rate-limit window roll over before this surfaces as a user-facing failure.
    if (!outOfTime()) {
      await sleep(1200);
      for (const fn of [
        (m: Msg[], s: string | undefined, t: number) => cerebras(m, s, t, true),
        (m: Msg[], s: string | undefined, t: number) => gemini(m, s, t, true),
        deepseek, nvidia, sambanova, anthropic, mistral, together, githubModels,
        (m: Msg[], s: string | undefined, t: number) => groq(m, s, t, true),
      ]) {
        if (outOfTime()) break;
        const text = await withTimeout(tryOnce(fn, messages, system, fastTok), 6000);
        if (text) return text;
      }
    }
    throw new Error("Fast AI providers busy. Please try again.");
  }

  // JSON / dialogue: race ALL top-tier providers simultaneously — 13 providers in parallel.
  // First valid response wins; orphaned requests complete but are discarded.
  // JSON needs best quality → 9s window. Dialogue needs speed → 6s window.
  const raceWindow = task === "json" ? 9000 : 6000;
  const raceText = await raceFirst([
    anthropic,                                         // Claude Haiku — best when key set
    githubModels,                                      // GPT-4o / Llama-4 / DeepSeek-R1 — free via GitHub PAT
    (m, s, t) => gemini(m, s, t, false),               // Gemini 2.5 Flash — 1M ctx, excellent
    raceGroqModels,                                    // 5 Groq models in parallel — fast when key is set
    nvidia,                                            // DeepSeek-R1 685B + Qwen3-235B (NIM free)
    deepseek,                                          // DeepSeek V3 + R1 direct — near-free
    (m, s, t) => cerebras(m, s, t, false),             // LPU 2 000 tok/s + qwen3-32b FR/AR
    sambanova,                                         // Llama-4-Maverick 128k — long docs
    mistral,                                           // Best French + Arabic bilingual
    openrouter,                                        // Nemotron-253B + R1-0528 + Qwen3-235B free
    hyperbolic,                                        // DeepSeek-V3 + Qwen2.5-72B — free starter credits
    fireworks,                                         // DeepSeek-V3 + Llama 70B — $1 free credit
    huggingface,                                       // Router to Together/Fireworks/Hyperbolic backends
  ], messages, system, max_tokens, raceWindow);
  if (raceText) return raceText;

  // Sequential fallback — providers not yet tried in the race
  for (const fn of [together, nvidia, deepseek]) {
    if (outOfTime()) break;
    const text = await withTimeout(tryOnce(fn, messages, system, max_tokens), 8000);
    if (text) return text;
  }

  // Second sweep after 1.2s — rate limits may have cleared on fast providers.
  // Each call is time-boxed and the loop bails once the overall budget is
  // gone, so one hanging provider can't stall the whole request past
  // route.ts's own deadline.
  if (!outOfTime()) {
    await sleep(1200);
    for (const fn of [
      raceGroqModels,
      (m: Msg[], s: string | undefined, t: number) => gemini(m, s, t, false),
      anthropic, githubModels, nvidia, deepseek,
      (m: Msg[], s: string | undefined, t: number) => cerebras(m, s, t, false),
      sambanova, mistral, together, openrouter,
      hyperbolic, fireworks, huggingface,
    ]) {
      if (outOfTime()) break;
      const text = await withTimeout(tryOnce(fn, messages, system, max_tokens), 8000);
      if (text) return text;
    }
  }

  // Third sweep after a longer 4s wait — covers the case where every provider was
  // saturated at once (e.g. many concurrent users hitting the same free-tier RPM
  // window simultaneously). Per-minute windows roll over well within this budget,
  // so this converts a burst-driven outage into a slower but successful response
  // instead of surfacing "unavailable" to the user.
  if (!outOfTime()) {
    await sleep(4000);
    for (const fn of [
      raceGroqModels, nvidia, deepseek, mistral,
      (m: Msg[], s: string | undefined, t: number) => gemini(m, s, t, false),
      (m: Msg[], s: string | undefined, t: number) => cerebras(m, s, t, false),
      anthropic, githubModels, sambanova, together, openrouter,
      hyperbolic, fireworks, huggingface,
    ]) {
      if (outOfTime()) break;
      const text = await withTimeout(tryOnce(fn, messages, system, max_tokens), 8000);
      if (text) return text;
    }
  }

  throw new Error("All AI providers temporarily busy. Please try again in a few seconds.");
}
