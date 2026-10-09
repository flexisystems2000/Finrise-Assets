// Finrise Assets transactional email webhook.
// Deploy as a Supabase Edge Function. Secrets stay server-side.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-finrise-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const emailFrom = Deno.env.get("EMAIL_FROM") ?? "Finrise Assets <notifications@your-verified-domain.com>";
const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "";
const webhookSecret = Deno.env.get("FINRISE_WEBHOOK_SECRET") ?? "";
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type AnyRow = Record<string, unknown>;
type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: AnyRow | null;
  old_record?: AnyRow | null;
};

function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] ?? c));
}
function money(value: unknown, currency = "NGN"): string {
  const amount = Number(value ?? 0);
  try { return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount); }
  catch { return `${currency} ${amount.toFixed(2)}`; }
}
function layout(title: string, content: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f3f6fb;font-family:Arial,sans-serif;color:#172033"><div style="max-width:620px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden"><div style="background:#073b2a;padding:25px 28px;color:#fff"><div style="font-size:22px;font-weight:700">Finrise Assets</div><div style="font-size:13px;opacity:.85;margin-top:5px">Account notification</div></div><div style="padding:28px"><h2 style="margin-top:0">${esc(title)}</h2>${content}<p style="font-size:12px;color:#687386;margin-top:28px">This is an automated account notification. If you did not expect this message, contact Finrise Assets support.</p></div></div></body></html>`;
}
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!to || !resendApiKey || !emailFrom.includes("@") || emailFrom.includes("your-verified-domain.com")) {
    throw new Error("Email is not configured: set RESEND_API_KEY and EMAIL_FROM to a verified sender.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: emailFrom, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend rejected email (${response.status}): ${(await response.text()).slice(0, 500)}`);
}
async function getAuthUser(userId: unknown): Promise<{ email: string; name: string }> {
  if (!userId) return { email: "", name: "" };
  const { data, error } = await supabase.auth.admin.getUserById(String(userId));
  if (error || !data.user) return { email: "", name: "" };
  const metadata = data.user.user_metadata ?? {};
  return {
    email: data.user.email ?? "",
    name: String(metadata.full_name ?? metadata.name ?? metadata.username ?? "there"),
  };
}
function statusMessage(status: string): string {
  const normalized = status.toLowerCase();
  if (["approved", "completed", "paid", "successful", "success"].includes(normalized)) return "Your request has been approved or completed.";
  if (["rejected", "failed", "cancelled", "canceled"].includes(normalized)) return "Your request was not approved or could not be completed. Please contact support if you need help.";
  return "Your request has been received and is awaiting review.";
}
async function sendUserTransactionEmail(table: string, record: AnyRow, event: string): Promise<void> {
  const userId = record.user_id ?? record.owner_id;
  const user = await getAuthUser(userId);
  if (!user.email) return;
  const status = String(record.status ?? (event === "INSERT" ? "pending" : "updated"));
  const amount = money(record.amount, String(record.currency ?? "NGN"));
  const reference = String(record.reference ?? record.id ?? "Not provided");
  const kind = table === "deposits" ? "deposit" : table === "withdrawals" ? "withdrawal" : "investment";
  const isUpdate = event === "UPDATE";
  const title = isUpdate ? `${kind[0].toUpperCase()}${kind.slice(1)} status update` : `${kind[0].toUpperCase()}${kind.slice(1)} request received`;
  const body = `<p>Hello ${esc(user.name)},</p><p>${isUpdate ? statusMessage(status) : `We have received your ${esc(kind)} request. It is not considered approved until its status is updated by Finrise Assets.`}</p><div style="background:#f5f8f6;padding:16px;border-radius:10px"><p><strong>Amount:</strong> ${esc(amount)}</p><p><strong>Status:</strong> ${esc(status)}</p><p><strong>Reference:</strong> ${esc(reference)}</p></div><p>Please keep this email for your records.</p>`;
  await send(user.email, `Finrise Assets: ${title}`, layout(title, body));
  if (adminEmail) {
    const adminBody = `<p>A ${esc(kind)} record was ${isUpdate ? "updated" : "created"}.</p><p><strong>User:</strong> ${esc(user.email)}</p><p><strong>Amount:</strong> ${esc(amount)}</p><p><strong>Status:</strong> ${esc(status)}</p><p><strong>Reference:</strong> ${esc(reference)}</p>`;
    await send(adminEmail, `Finrise Assets admin: ${kind} ${isUpdate ? "status update" : "submitted"}`, layout("Financial activity notification", adminBody));
  }
}
async function sendReferralEmail(record: AnyRow): Promise<void> {
  const referrerId = record.referrer_id;
  const referredId = record.referred_user_id;
  const [referrer, referred] = await Promise.all([getAuthUser(referrerId), getAuthUser(referredId)]);
  const code = String(record.referral_code ?? "");
  if (referred.email) {
    const body = `<p>Hello ${esc(referred.name)},</p><p>Your Finrise Assets account was created through a referral link${code ? ` (code <strong>${esc(code)}</strong>)` : ""}.</p><p>Referral rewards, if applicable, are subject to the programme's rules and approval. This email does not confirm a reward payment.</p>`;
    await send(referred.email, "Welcome to Finrise Assets", layout("Welcome to Finrise Assets", body));
  }
  if (referrer.email) {
    const body = `<p>Hello ${esc(referrer.name)},</p><p>Someone has joined Finrise Assets using your referral link.</p><p>Referral rewards, if applicable, are subject to eligibility checks and approval. This email does not confirm that a reward has been earned or paid.</p>`;
    await send(referrer.email, "A new signup used your Finrise Assets referral link", layout("You have a new referral", body));
  }
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Server email secrets are not configured." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (req.headers.get("x-finrise-webhook-secret") !== webhookSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized webhook" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const payload = await req.json() as WebhookPayload;
    const table = String(payload.table ?? "");
    const event = String(payload.type ?? "INSERT").toUpperCase();
    const record = payload.record ?? {};
    if (!record || typeof record !== "object") throw new Error("Webhook record is missing.");
    if (["deposits", "withdrawals", "investments"].includes(table) && ["INSERT", "UPDATE"].includes(event)) {
      await sendUserTransactionEmail(table, record, event);
    } else if (table === "referrals" && event === "INSERT") {
      await sendReferralEmail(record);
    } else {
      return new Response(JSON.stringify({ ok: true, ignored: true, table, event }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Finrise email webhook failed:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Email delivery failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
