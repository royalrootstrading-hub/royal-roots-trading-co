import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const $ = (s) => document.querySelector(s);
const url = window.SUPABASE_URL, key = window.SUPABASE_ANON_KEY;
const login = $("#login"), chat = $("#chat"), loginNotice = $("#login-notice"), chatNotice = $("#chat-notice");
let sb, session = null, history = [], busy = false;
function notice(el, text, type = "") { el.textContent = text; el.className = "notice" + (type ? " " + type : ""); el.hidden = !text; }
function viewChat(on) { login.style.display = on ? "none" : "block"; chat.style.display = on ? "block" : "none"; }
function addMessage(role, content) { const el = document.createElement("div"); el.className = "msg " + role; el.textContent = content; $("#messages").append(el); $("#messages").scrollTop = $("#messages").scrollHeight; }
if (!url || !key || !url.startsWith("https://") || key.length < 20) {
  notice(loginNotice, "Supabase browser configuration is missing. Ask the administrator to check supabase-config.js.", "error");
} else {
  sb = createClient(url, key);
  const { data } = await sb.auth.getSession();
  if (data.session) { session = data.session; viewChat(true); }
  sb.auth.onAuthStateChange((_event, next) => { session = next; if (!next) viewChat(false); });
}
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); if (!sb) return;
  const button = $("#login-button"); button.disabled = true; notice(loginNotice, "");
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value });
    if (error) throw error;
    session = data.session; history = []; viewChat(true); notice(chatNotice, "Signed in successfully.", "success");
  } catch (err) { notice(loginNotice, err.message || "Sign-in failed.", "error"); }
  finally { button.disabled = false; }
});
$("#signout").addEventListener("click", async () => { if (sb) await sb.auth.signOut(); session = null; history = []; viewChat(false); });
$("#chat-form").addEventListener("submit", async (e) => {
  e.preventDefault(); if (busy) return;
  const text = $("#prompt").value.trim(); if (!text || text.length > 5000) return;
  const current = session || (await sb.auth.getSession()).data.session;
  if (!current) { viewChat(false); notice(loginNotice, "Your session has expired. Please sign in again.", "error"); return; }
  busy = true; $("#send").disabled = true; $("#prompt").disabled = true; notice(chatNotice, "");
  addMessage("user", text); history.push({ role: "user", content: text }); $("#prompt").value = "";
  const pending = document.createElement("div"); pending.className = "msg assistant"; pending.textContent = "Thinking…"; $("#messages").append(pending);
  try {
    const response = await fetch(url + "/functions/v1/royal-roots-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": key, "Authorization": "Bearer " + current.access_token },
      body: JSON.stringify({ messages: history.slice(-12) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The assistant request failed (" + response.status + ").");
    if (!data.answer) throw new Error("The assistant returned no answer.");
    pending.textContent = data.answer; history.push({ role: "assistant", content: data.answer });
  } catch (err) {
    pending.remove(); notice(chatNotice, err.message || "Could not reach the AI service. Please try again.", "error");
  } finally { busy = false; $("#send").disabled = false; $("#prompt").disabled = false; $("#prompt").focus(); }
});