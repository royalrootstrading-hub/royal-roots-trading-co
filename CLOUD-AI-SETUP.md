# Royal Roots Trading & Co. — Cloud AI setup

## What is deployed
- Supabase Edge Function: `royal-roots-ai` (JWT verification enabled).
- Browser interface: `ai-assistant.html` and `ai-assistant.js`.
- Uses the existing Supabase Auth login; no public sign-up form is added.
- The AI key is read only by the Edge Function. Free option: `GEMINI_API_KEY` (Google Gemini). If it is not set, the function falls back to `OPENAI_API_KEY` (paid).
- The function sends only the recent messages explicitly entered in this chat to OpenAI. It does not query product or business tables.

## Required owner/admin action: add the free Gemini key
The Edge Function is deployed, but the assistant returns a configuration message until a key is saved as a Supabase secret.

1. Sign in at https://aistudio.google.com/apikey with a Google account and create an API key. The free tier needs no billing.
2. In Supabase, open project `rdplhwytedjphuczcvrf` -> Edge Functions -> Secrets.
3. Add secret name `GEMINI_API_KEY` and paste the key into the value field, then save. Never put the key in GitHub, HTML, JavaScript, chat, or `supabase-config.js`.
4. Optional: add `GEMINI_MODEL` to choose another model. The default is `gemini-flash-lite-latest`.
5. Open `https://royalrootstrading-hub.github.io/royal-roots-trading-co/ai-assistant.html`, sign in with an existing Supabase Auth user, and test a harmless question.

Free-tier notes: Google applies per-minute and per-day request limits (shown in AI Studio); when they are hit the page says to wait and try again. Google may use free-tier prompts to improve its products, so do not type customer secrets, passwords or sensitive financial details into the assistant.

Only a Supabase project Owner/Administrator can create production secrets.

## Existing data and authorization
This setup does not change or delete existing database tables or rows. The Edge Function requires a valid Supabase Auth session and verifies the user before forwarding messages. Public sign-ups remain disabled; provision staff accounts in Supabase Auth. Keep RLS enabled on business tables.

The function is deployed with JWT verification enabled. It also validates the bearer session against Supabase Auth, restricts browser origins to the existing GitHub Pages site (plus local development origins), caps message size/history, and does not log prompts or responses.

## Security and cost notes
- Publishable Supabase key in `supabase-config.js` is browser-safe by design; never place a Supabase secret/service-role key there.
- With `GEMINI_API_KEY` set, requests use Google Gemini's free tier (no charge). Only if that key is missing does the function use `gpt-4.1-mini`, billed to the OpenAI API project.
- This first version is a general business assistant and does not have access to products, invoices, customer records, or live inventory.
- The existing product and website editor permissions remain governed by Supabase Auth and RLS.
