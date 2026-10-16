# Royal Roots Trading & Co. — Cloud AI setup

## What is deployed
- Supabase Edge Function: `royal-roots-ai` (JWT verification enabled).
- Browser interface: `ai-assistant.html` and `ai-assistant.js`.
- Uses the existing Supabase Auth login; no public sign-up form is added.
- OpenAI key is read only by the Edge Function from `OPENAI_API_KEY`.
- The function sends only the recent messages explicitly entered in this chat to OpenAI. It does not query product or business tables.

## Required owner/admin action: add the OpenAI key
The Edge Function is deployed, but cloud AI will return a configuration message until the OpenAI API key is saved as a Supabase secret.

1. Create a project API key at https://platform.openai.com/api-keys. OpenAI API billing/usage is separate from a ChatGPT subscription.
2. In Supabase, open project `rdplhwytedjphuczcvrf` → Edge Functions → Secrets.
3. Add secret name `OPENAI_API_KEY` and paste the value into the secret field, then save. Do not put the value in GitHub, HTML, JavaScript, chat, or `supabase-config.js`.
4. Open `https://royalrootstrading-hub.github.io/royal-roots-trading-co/ai-assistant.html`, sign in with an existing Supabase Auth user, and test a harmless question.

Only a Supabase project Owner/Administrator can create production secrets. If you cannot see or save Edge Function Secrets, ask the project Owner/Administrator to perform step 3. The assistant does not work until a valid API key and available OpenAI API billing/quota are in place.

## Existing data and authorization
This setup does not change or delete existing database tables or rows. The Edge Function requires a valid Supabase Auth session and verifies the user before forwarding messages. Public sign-ups remain disabled; provision staff accounts in Supabase Auth. Keep RLS enabled on business tables.

The function is deployed with JWT verification enabled. It also validates the bearer session against Supabase Auth, restricts browser origins to the existing GitHub Pages site (plus local development origins), caps message size/history, and does not log prompts or responses.

## Security and cost notes
- Publishable Supabase key in `supabase-config.js` is browser-safe by design; never place a Supabase secret/service-role key there.
- AI requests use the `gpt-4.1-mini` model and are billed to the OpenAI API project.
- This first version is a general business assistant and does not have access to products, invoices, customer records, or live inventory.
- The existing product and website editor permissions remain governed by Supabase Auth and RLS.
