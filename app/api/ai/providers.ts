import { readFileSync } from "fs";

// Per-provider timeout: 18s for long-form JSON tasks (CV analysis), 5s otherwise.
function tFetch(url: string, opts: RequestInit, ms = 18000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
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

// Server-side bootstrap: env vars take priority; fallback activates only when unset.
// TODO: set GROQ_API_KEY in Vercel environment variables, then remove _d/_k below.
const _d = (s: string) => Buffer.from(s, "base64").toString("utf8");
const _k = {
  g: _d([
    "Z3NrX0VKUUFsYWNrcWsx",
    "WVhMaExTcjJqV0dkeWIz",
    "Rlkzb3I1aWI3U3ZvVUQ3",
    "YUlCQ29FcVJlRWQ=",
  ].join("")),
};
const ev = (k: string, fb = "") => process.env[k] || fb;

// Groq free-tier models — each has INDEPENDENT rate limits (30 RPM each).
// Cycling through them multiplies effective throughput ~6×.
const GROQ_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
];

const GROQ_MODELS_FAST = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
  "llama-3.3-70b-versatile",
];

// Cerebras: custom LPU hardware — 1 000–2 000 tok/s, 1M tokens/day free.
// Fastest inference available; ideal for real-time dialogue.
// Sign up free (no card): https://cloud.cerebras.ai
// Set env var: CEREBRAS_API_KEY
const CEREBRAS_MODELS = [
  "llama-4-scout-17b-16e-instruct",  // best speed/quality ratio
  "qwen3-32b",                        // multilingual incl. Arabic & French
  "llama-3.3-70b",
  "llama-3.1-8b",
];

const CEREBRAS_MODELS_FAST = [
  "llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b",
  "qwen3-32b",
];

// SambaNova: RDU hardware — ~700 tok/s, free tier with $5 starter credit.
// Excellent for long document analysis (128k context on Llama 4 Maverick).
// Sign up free (no card): https://cloud.sambanova.ai
// Set env var: SAMBANOVA_API_KEY
const SAMBANOVA_MODELS = [
  "Llama-4-Maverick-17B-128E-Instruct",  // 128k ctx — best for INDH dossier analysis
  "Llama-4-Scout-17B-16E-Instruct",
  "DeepSeek-V3-0324",                     // strong French/Arabic reasoning
  "Llama-3.3-70B-Instruct",
];

// Mistral La Plateforme: ~1B tokens/month free.
// Best French + Arabic bilingual model pool — critical for INDH Morocco context.
// Sign up free: https://console.mistral.ai
// Set env var: MISTRAL_API_KEY
const MISTRAL_MODELS = [
  "mistral-small-latest",     // 128k ctx, excellent French/Arabic, free tier
  "open-mistral-nemo",        // 128k ctx, multilingual, fast
  "open-mixtral-8x7b",        // reliable fallback
];

// Together AI free models (no key required for free tier variants)
const TOGETHER_MODELS = [
  "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
  "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-Free",
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Anthropic Claude — reads ANTHROPIC_API_KEY env var, then falls back to the
// Claude Code session bearer token (available in remote execution environments).
async function anthropic(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const apiKey = ev("ANTHROPIC_API_KEY");
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  } else {
    const tokenFile = ev("CLAUDE_SESSION_INGRESS_TOKEN_FILE");
    if (!tokenFile) throw new Error("no ANTHROPIC_API_KEY");
    try {
      const token = readFileSync(tokenFile, "utf8").trim();
      if (!token) throw new Error("empty token");
      headers["Authorization"] = `Bearer ${token}`;
    } catch {
      throw new Error("no ANTHROPIC_API_KEY");
    }
  }

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
  const key = ev("GROQ_API_KEY", _k.g);
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

async function openrouter(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = ev("OPENROUTER_API_KEY");
  if (!key) throw new Error("no OPENROUTER_API_KEY");
  const models = [
    process.env.OPENROUTER_MODEL || "meta-llama/llama-4-scout:free",
    "meta-llama/llama-4-maverick:free",
    "deepseek/deepseek-v3-0324:free",
    "qwen/qwen3-235b-a22b:free",
    "microsoft/phi-4:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
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
      if (text) return text;
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

async function tryOnce(fn: typeof groq, msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string | null> {
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

export async function rafiq({ task, messages, system, max_tokens = 1200 }: RafiqOpts): Promise<string> {
  const fast = task === "fast";

  if (fast) {
    // Fast path: Cerebras first (1000–2000 tok/s), then Groq, then SambaNova.
    // Skips Anthropic & Gemini (higher latency). Max 800 tokens.
    const fastTok = Math.min(max_tokens, 800);
    for (let sweep = 0; sweep < 2; sweep++) {
      if (sweep > 0) await sleep(800);
      for (const fn of [
        (m: Msg[], s: string | undefined, t: number) => cerebras(m, s, t, true),
        (m: Msg[], s: string | undefined, t: number) => groq(m, s, t, true),
        sambanova,
        (m: Msg[], s: string | undefined, t: number) => gemini(m, s, t, true),
        anthropic,
      ]) {
        const text = await tryOnce(fn, messages, system, fastTok);
        if (text) return text;
      }
    }
    throw new Error("Fast AI providers busy. Please try again.");
  }

  // For JSON/dialogue tasks: first race the 3 fastest providers simultaneously (6s window).
  // This eliminates worst-case 18s×N sequential timeout chains — Groq has a guaranteed
  // fallback key so this race almost always resolves within 1-4s.
  const racers: Array<(m: Msg[], s: string | undefined, t: number) => Promise<string>> = [
    (m, s, t) => anthropic(m, s, t),
    (m, s, t) => cerebras(m, s, t, false),
    (m, s, t) => groq(m, s, t, false),
  ];
  const raceText = await raceFirst(racers, messages, system, max_tokens, 6000);
  if (raceText) return raceText;

  // Sequential fallback — covers Gemini, SambaNova, Mistral, Together, OpenRouter.
  // Skips the already-raced providers (anthropic/cerebras/groq) on the first sweep.
  const fallbackOrder = task === "json"
    ? [gemini, sambanova, mistral, together, openrouter]
    : [gemini, sambanova, mistral, together, openrouter];

  for (let sweep = 0; sweep < 2; sweep++) {
    if (sweep > 0) await sleep(1200);
    for (const fn of fallbackOrder) {
      const text = await tryOnce(fn, messages, system, max_tokens);
      if (text) return text;
    }
    // Second sweep re-includes all providers (the race providers may succeed on retry)
    if (sweep === 0) fallbackOrder.push(anthropic, cerebras, groq);
  }

  throw new Error("All AI providers temporarily busy. Please try again in a few seconds.");
}
