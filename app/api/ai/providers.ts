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
// The models below are all confirmed live against Groq's /v1/models endpoint —
// every model previously listed here (llama-3.x, mixtral, gemma2, qwen-qwq,
// deepseek-r1-distill) has since been decommissioned by Groq and now returns
// 404/400 for every single request, which is what silently exhausted this
// entire provider regardless of how valid the API key was.
// groq/compound and groq/compound-mini were removed 2026-10: Groq deprecated
// them Aug 24 2026 and fully decommissioned them Sep 21 2026 — they now 404
// on every request, same as the earlier llama-3.x/qwen-qwq/deepseek-r1-distill
// removal above. Do not re-add them without re-checking Groq's live model list.
const GROQ_MODELS = [
  "openai/gpt-oss-120b",   // Best Groq quality, reasoning model
  "qwen/qwen3.8-27b",       // Multilingual FR/AR, fast
  "allam-2-7b",             // Arabic-specialized (SDAIA)
  "openai/gpt-oss-20b",     // Smaller/faster reasoning model
];

const GROQ_MODELS_FAST = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "allam-2-7b",
  "openai/gpt-oss-120b",
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

// ─── JSON-mode helper ───────────────────────────────────────────────────────
// For task:"json" calls, ask each OpenAI-compatible provider to constrain its
// output to a valid JSON object natively, instead of relying only on prompt
// instructions — this is what keeps the result consistent regardless of
// which of the ~13 free-tier providers in the race below happens to answer
// first. Some free-tier passthroughs reject the `response_format` field with
// a 400, so callers retry once without it rather than losing that provider
// entirely over an unsupported param.
function oaBody(model: string, maxTok: number, messages: unknown[], jsonMode: boolean): Record<string, unknown> {
  return jsonMode
    ? { model, max_tokens: maxTok, messages, response_format: { type: "json_object" } }
    : { model, max_tokens: maxTok, messages };
}

async function fetchChat(
  url: string, headers: Record<string, string>, model: string, maxTok: number,
  messages: unknown[], jsonMode: boolean, timeoutMs?: number
): Promise<Response> {
  const res = await tFetch(url, { method: "POST", headers, body: JSON.stringify(oaBody(model, maxTok, messages, jsonMode)) }, timeoutMs);
  if (jsonMode && res.status === 400) {
    return tFetch(url, { method: "POST", headers, body: JSON.stringify(oaBody(model, maxTok, messages, false)) }, timeoutMs);
  }
  return res;
}

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

// Google retired the 2.5 series for new API keys (confirmed live against the real
// Generative Language API: a freshly-issued key gets 404 "no longer available to
// new users" on gemini-2.5-*, pointing callers at the 3.5 series instead) — 3.5 is
// listed first so a newly-issued key actually works. 2.5 stays as a fallback for
// any older, grandfathered key that predates the cutover and still serves it; if
// Google renames/retires 3.5 again, or a given key/region hasn't rolled onto it
// yet, this silently drops to 2.5 instead of losing the provider outright.
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash"];
const GEMINI_MODELS_FAST = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite"];

async function gemini(msgs: Msg[], sys: string | undefined, maxTok: number, fast = false, jsonMode = false): Promise<string> {
  const key = ev("GEMINI_API_KEY");
  if (!key) throw new Error("no GEMINI_API_KEY");
  const envModel = process.env.GEMINI_MODEL;
  const candidates = envModel ? [envModel] : (fast ? GEMINI_MODELS_FAST : GEMINI_MODELS);
  const contents = msgs.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: textOnly(m.content) }],
  }));
  const gTimeout = maxTok <= 500 ? 5000 : 18000;
  let lastErr: Error = new Error("Gemini exhausted");
  for (const model of candidates) {
    const generationConfig: Record<string, unknown> = { maxOutputTokens: maxTok };
    if (jsonMode) generationConfig.responseMimeType = "application/json";
    const body: Record<string, unknown> = { contents, generationConfig };
    if (sys) body.systemInstruction = { parts: [{ text: sys }] };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      let res = await tFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, gTimeout);
      if (jsonMode && res.status === 400) {
        // Some Gemini models reject responseMimeType — retry once without it
        // before concluding the model itself is the problem.
        delete generationConfig.responseMimeType;
        res = await tFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, gTimeout);
      }
      if (!res.ok) { lastErr = new Error(`Gemini ${res.status} (${model})`); continue; }
      const d = await res.json();
      const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
      lastErr = new Error(`Gemini empty response (${model})`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr;
}

// Groq: tries every free model in sequence until one succeeds.
async function groq(msgs: Msg[], sys: string | undefined, maxTok: number, fast = false, jsonMode = false): Promise<string> {
  const key = ev("GROQ_API_KEY");
  if (!key) throw new Error("no GROQ_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const groqTimeout = maxTok <= 500 ? 5000 : 18000;
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of fast ? GROQ_MODELS_FAST : GROQ_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode, groqTimeout);
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
async function cerebras(msgs: Msg[], sys: string | undefined, maxTok: number, fast = false, jsonMode = false): Promise<string> {
  const key = ev("CEREBRAS_API_KEY");
  if (!key) throw new Error("no CEREBRAS_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const cbTimeout = maxTok <= 500 ? 5000 : 18000;
  const url = "https://api.cerebras.ai/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of fast ? CEREBRAS_MODELS_FAST : CEREBRAS_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode, cbTimeout);
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
async function sambanova(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("SAMBANOVA_API_KEY");
  if (!key) throw new Error("no SAMBANOVA_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://api.sambanova.ai/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of SAMBANOVA_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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
async function mistral(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("MISTRAL_API_KEY");
  if (!key) throw new Error("no MISTRAL_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://api.mistral.ai/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of MISTRAL_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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
async function nvidia(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("NVIDIA_API_KEY");
  if (!key) throw new Error("no NVIDIA_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of NVIDIA_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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
async function deepseek(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("DEEPSEEK_API_KEY");
  if (!key) throw new Error("no DEEPSEEK_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://api.deepseek.com/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of DEEPSEEK_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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

async function openrouter(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
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
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of models) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return stripThink(text);
    } catch { continue; }
  }
  throw new Error("OpenRouter exhausted");
}

async function together(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("TOGETHER_API_KEY");
  if (!key) throw new Error("no TOGETHER_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://api.together.xyz/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of TOGETHER_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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
async function hyperbolic(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("HYPERBOLIC_API_KEY");
  if (!key) throw new Error("no HYPERBOLIC_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://api.hyperbolic.xyz/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of HYPERBOLIC_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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
async function fireworks(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("FIREWORKS_API_KEY");
  if (!key) throw new Error("no FIREWORKS_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://api.fireworks.ai/inference/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of FIREWORKS_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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
async function huggingface(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("HUGGINGFACE_API_KEY");
  if (!key) throw new Error("no HUGGINGFACE_API_KEY");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://router.huggingface.co/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const model of HUGGINGFACE_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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

async function githubModels(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("GITHUB_MODELS_TOKEN");
  if (!key) throw new Error("no GITHUB_MODELS_TOKEN");
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  const url = "https://models.github.ai/inference/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" };
  for (const model of GITHUB_MODELS) {
    try {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode);
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

// Pollinations — a free, community-run OpenAI-compatible gateway that needs
// NO API key / signup of any kind, unlike every other provider above. Lower
// reliability than a paid-tier-backed free API (no SLA, no rate-limit
// guarantee), so it's placed last in every race/sweep below — it only ever
// gets to answer if every keyed provider is unavailable or unconfigured,
// never races ahead of them. Included specifically because it's the one
// provider that adds real redundancy with zero setup required — useful
// right now while only 3 of the keyed providers (Groq/Cerebras/Mistral)
// actually have API keys in this project's production environment.
async function pollinations(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) }))];
  for (const model of ["openai", "mistral", "llama"]) {
    try {
      const res = await tFetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTok, messages: all, referrer: "ideamaponline.org" }),
      }, 10000);
      if (!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if (text) return text;
    } catch { continue; }
  }
  throw new Error("Pollinations exhausted");
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

// Race 4 Groq models in parallel — each has an INDEPENDENT 30 RPM rate limit,
// so firing them simultaneously multiplies effective throughput vs cycling sequentially.
// Always available via hardcoded key. Returns the highest-quality fastest response.
// Uses the same confirmed-live model set as GROQ_MODELS above — this list used to
// carry its own separate (and since-decommissioned) model ids (llama-3.3-70b-versatile,
// deepseek-r1-distill-llama-70b, qwen-qwq-32b, llama-4-scout/maverick), which meant this
// race was silently 404-ing on every model and falling through to the slow sequential
// groq() fallback on every single call. Keep this list in sync with GROQ_MODELS.
async function raceGroqModels(msgs: Msg[], sys: string | undefined, maxTok: number, jsonMode = false): Promise<string> {
  const key = ev("GROQ_API_KEY");
  if (!key) throw new Error("no GROQ_API_KEY");
  const all = [
    ...(sys ? [{ role: "system", content: sys }] : []),
    ...msgs.map(m => ({ role: m.role, content: textOnly(m.content) })),
  ];
  const topModels = GROQ_MODELS;
  const perTok = maxTok <= 500 ? 5000 : 10000;
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const result = await raceFirst(
    topModels.map(model => async (_m: Msg[], _s: string | undefined, _t: number): Promise<string> => {
      const res = await fetchChat(url, headers, model, maxTok, all, jsonMode, perTok);
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
  return groq(msgs, sys, maxTok, false, jsonMode);
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
      pollinations,
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
        pollinations,
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
  // For task:"json", every OpenAI-compatible provider (and Gemini) is asked to
  // constrain its output to a JSON object natively (see fetchChat/oaBody above) —
  // this is what keeps the result consistently parseable regardless of which of
  // the providers below happens to answer first, instead of relying only on
  // prompt wording that a given free-tier model might ignore.
  const jsonMode = task === "json";
  const raceWindow = task === "json" ? 9000 : 6000;
  const raceText = await raceFirst([
    anthropic,                                                                  // Claude Haiku — best when key set
    (m, s, t) => githubModels(m, s, t, jsonMode),                               // GPT-4o / Llama-4 / DeepSeek-R1 — free via GitHub PAT
    (m, s, t) => gemini(m, s, t, false, jsonMode),                              // Gemini 2.5 Flash — 1M ctx, excellent
    (m, s, t) => raceGroqModels(m, s, t, jsonMode),                             // 5 Groq models in parallel — fast when key is set
    (m, s, t) => nvidia(m, s, t, jsonMode),                                     // DeepSeek-R1 685B + Qwen3-235B (NIM free)
    (m, s, t) => deepseek(m, s, t, jsonMode),                                   // DeepSeek V3 + R1 direct — near-free
    (m, s, t) => cerebras(m, s, t, false, jsonMode),                            // LPU 2 000 tok/s + qwen3-32b FR/AR
    (m, s, t) => sambanova(m, s, t, jsonMode),                                  // Llama-4-Maverick 128k — long docs
    (m, s, t) => mistral(m, s, t, jsonMode),                                    // Best French + Arabic bilingual
    (m, s, t) => openrouter(m, s, t, jsonMode),                                 // Nemotron-253B + R1-0528 + Qwen3-235B free
    (m, s, t) => hyperbolic(m, s, t, jsonMode),                                 // DeepSeek-V3 + Qwen2.5-72B — free starter credits
    (m, s, t) => fireworks(m, s, t, jsonMode),                                  // DeepSeek-V3 + Llama 70B — $1 free credit
    (m, s, t) => huggingface(m, s, t, jsonMode),                                // Router to Together/Fireworks/Hyperbolic backends
    pollinations,                                                               // Keyless community gateway — zero-setup redundancy, no jsonMode param
  ], messages, system, max_tokens, raceWindow);
  if (raceText) return raceText;

  // Sequential fallback — providers not yet tried in the race
  for (const fn of [
    (m: Msg[], s: string | undefined, t: number) => together(m, s, t, jsonMode),
    (m: Msg[], s: string | undefined, t: number) => nvidia(m, s, t, jsonMode),
    (m: Msg[], s: string | undefined, t: number) => deepseek(m, s, t, jsonMode),
  ]) {
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
      (m: Msg[], s: string | undefined, t: number) => raceGroqModels(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => gemini(m, s, t, false, jsonMode),
      anthropic,
      (m: Msg[], s: string | undefined, t: number) => githubModels(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => nvidia(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => deepseek(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => cerebras(m, s, t, false, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => sambanova(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => mistral(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => together(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => openrouter(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => hyperbolic(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => fireworks(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => huggingface(m, s, t, jsonMode),
      pollinations,
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
      (m: Msg[], s: string | undefined, t: number) => raceGroqModels(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => nvidia(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => deepseek(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => mistral(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => gemini(m, s, t, false, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => cerebras(m, s, t, false, jsonMode),
      anthropic,
      (m: Msg[], s: string | undefined, t: number) => githubModels(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => sambanova(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => together(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => openrouter(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => hyperbolic(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => fireworks(m, s, t, jsonMode),
      (m: Msg[], s: string | undefined, t: number) => huggingface(m, s, t, jsonMode),
      pollinations,
    ]) {
      if (outOfTime()) break;
      const text = await withTimeout(tryOnce(fn, messages, system, max_tokens), 8000);
      if (text) return text;
    }
  }

  throw new Error("All AI providers temporarily busy. Please try again in a few seconds.");
}
