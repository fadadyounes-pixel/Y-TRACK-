type Msg = { role: string; content: string };

interface RafiqOpts {
  task: "json" | "dialogue";
  messages: Msg[];
  system?: string;
  max_tokens?: number;
}

async function gemini(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no GEMINI_API_KEY");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = msgs.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const body: Record<string, unknown> = { contents, generationConfig: { maxOutputTokens: maxTok } };
  if (sys) body.systemInstruction = { parts: [{ text: sys }] };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function groq(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("no GROQ_API_KEY");
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs];
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? "";
}

async function openrouter(msgs: Msg[], sys: string | undefined, maxTok: number): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("no OPENROUTER_API_KEY");
  const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-235b-a22b:free";
  const all = [...(sys ? [{ role: "system", content: sys }] : []), ...msgs];
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTok, messages: all }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? "";
}

export async function rafiq({ task, messages, system, max_tokens = 1200 }: RafiqOpts): Promise<string> {
  const order = task === "json"
    ? [gemini, openrouter, groq]
    : [groq, gemini, openrouter];
  let last: Error | null = null;
  for (const fn of order) {
    try {
      const text = await fn(messages, system, max_tokens);
      if (text) return text;
    } catch (e) {
      last = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw last ?? new Error("All AI providers failed");
}
