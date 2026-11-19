import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set([
  "https://royalrootstrading-hub.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://royalrootstrading-hub.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json",
});
const reply = (body: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

const SYSTEM_PROMPT = "You are the Royal Roots Trading & Co. business assistant. Help with building materials, product information, quotations, business writing, and general office tasks. Be clear and practical. Do not claim access to company records, products, invoices, or live inventory unless that information is included in the conversation. Do not ask users to share passwords, API keys, or sensitive financial credentials.";

type Msg = { role: "user" | "assistant"; content: string };

// Free provider: Google Gemini API (free tier key from https://aistudio.google.com/apikey).
async function askGemini(key: string, messages: Msg[]) {
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-flash-lite-latest";
  // Gemini expects the conversation to start with a user turn.
  const turns = [...messages];
  while (turns.length && turns[0].role !== "user") turns.shift();
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: turns.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 900 },
      }),
    },
  );
  const data = await res.json().catch(() => ({}));
  const answer = Array.isArray(data?.candidates?.[0]?.content?.parts)
    ? data.candidates[0].content.parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("").trim()
    : "";
  return { ok: res.ok, status: res.status, errorType: data?.error?.status || "unknown", answer, model };
}

// Optional paid fallback, used only when no Gemini key is configured.
async function askOpenAI(key: string, messages: Msg[]) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4.1-mini", instructions: SYSTEM_PROMPT, input: messages, max_output_tokens: 900, store: false }),
  });
  const data = await res.json().catch(() => ({}));
  const answer = typeof data.output_text === "string" ? data.output_text.trim() : "";
  return { ok: res.ok, status: res.status, errorType: data?.error?.type || "unknown", answer, model: "gpt-4.1-mini" };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return reply({ error: "Origin not allowed." }, 403, origin);

  const authorization = req.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return reply({ error: "Please sign in to use the assistant." }, 401, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_ANON_KEY")
    || (() => {
      try {
        const keys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
        return keys.default || Object.values(keys)[0] || "";
      } catch { return ""; }
    })();
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !publishable) return reply({ error: "Authentication service is not configured." }, 503, origin);
  if (!geminiKey && !openaiKey) return reply({ error: "Cloud AI is not configured yet. The administrator must add GEMINI_API_KEY (free from Google AI Studio) in Supabase Edge Function Secrets." }, 503, origin);

  try {
    const userResponse = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { "apikey": publishable, "Authorization": "Bearer " + match[1] },
    });
    if (!userResponse.ok) return reply({ error: "Your session is invalid or expired. Please sign in again." }, 401, origin);
    const user = await userResponse.json();
    if (!user?.id || !user?.email) return reply({ error: "A valid signed-in account is required." }, 401, origin);

    const raw = await req.text();
    if (raw.length > 24000) return reply({ error: "Message is too large. Please shorten the conversation." }, 413, origin);
    let body: any;
    try { body = JSON.parse(raw); } catch { return reply({ error: "Invalid request body." }, 400, origin); }
    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12) {
      return reply({ error: "Send between 1 and 12 recent messages." }, 400, origin);
    }
    const messages: Msg[] = body.messages.map((m: any) => {
      if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") throw new Error("Invalid message format.");
      const content = m.content.trim();
      if (!content || content.length > 5000) throw new Error("Each message must contain 1–5000 characters.");
      return { role: m.role, content };
    });
    if (!messages.some((m) => m.role === "user")) return reply({ error: "Include a user message." }, 400, origin);

    const result = geminiKey ? await askGemini(geminiKey, messages) : await askOpenAI(openaiKey!, messages);
    if (!result.ok) {
      console.error("AI request failed", geminiKey ? "gemini" : "openai", result.status, result.errorType);
      return reply(
        { error: result.status === 429 ? "The free AI limit was reached for now. Please wait a minute and try again." : "The AI service could not complete the request. Please try again later." },
        result.status === 429 ? 429 : 502,
        origin,
      );
    }
    if (!result.answer) return reply({ error: "The AI service returned an empty response. Please try again." }, 502, origin);
    return reply({ answer: result.answer, model: result.model }, 200, origin);
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.startsWith("Invalid message") || message.startsWith("Each message")) return reply({ error: message }, 400, origin);
    console.error("AI assistant request failed");
    return reply({ error: "The assistant could not process that request. Please try again." }, 500, origin);
  }
});
