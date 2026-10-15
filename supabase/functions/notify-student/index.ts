// Supabase Edge Function: notify-student
// Emails a student when the admissions team changes something in their account.
// Only admins can call it. Email delivery via Brevo (secrets: BREVO_API_KEY, MAIL_FROM_EMAIL, MAIL_FROM_NAME).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ sent: false, error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const fromEmail = Deno.env.get("MAIL_FROM_EMAIL");
  const fromName = Deno.env.get("MAIL_FROM_NAME") || "Study In China";

  // 1) Caller must be a signed-in admin
  const authHeader = req.headers.get("Authorization") || "";
  const asCaller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: isAdmin, error: adminErr } = await asCaller.rpc("is_admin");
  if (adminErr || isAdmin !== true) return json({ sent: false, error: "Only admins can send notifications" }, 403);

  if (!brevoKey || !fromEmail) {
    return json({ sent: false, error: "Email service not configured yet (BREVO_API_KEY / MAIL_FROM_EMAIL)" });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ sent: false, error: "Invalid request" }, 400);
  }
  const applicationId = clip(body.applicationId, 64);
  const subject = clip(body.subject, 150) || "Update on your application";
  const headline = clip(body.headline, 150) || subject;
  const message = clip(body.message, 4000);
  const siteUrl = /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(clip(body.siteUrl, 200)) ? clip(body.siteUrl, 200) : "";
  if (!applicationId || !message) return json({ sent: false, error: "Missing applicationId or message" }, 400);

  // 2) Find the student (account email first, then the email given in the application)
  const admin = createClient(url, serviceKey);
  const { data: row, error: rowErr } = await admin
    .from("student_applications")
    .select("id, user_id, data")
    .eq("id", applicationId)
    .maybeSingle();
  if (rowErr || !row) return json({ sent: false, error: "Application not found" }, 404);

  let to = "";
  const { data: userData } = await admin.auth.admin.getUserById(row.user_id);
  to = userData?.user?.email || row.data?.personal?.email || "";
  if (!to) return json({ sent: false, error: "Student has no email address" });
  const firstName = clip(row.data?.personal?.firstName, 60) || "there";

  // 3) Send
  const dashboardUrl = siteUrl ? `${siteUrl}/student/dashboard` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f6f3f5;font-family:Arial,Helvetica,sans-serif;color:#18151B">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f5;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ead5de">
    <tr><td style="background:#6D1838;color:#ffffff;padding:18px 24px;font-weight:bold;font-size:16px">${esc(fromName)}</td></tr>
    <tr><td style="padding:24px">
      <p style="margin:0 0 6px;font-size:13px;color:#6D1838;font-weight:bold;text-transform:uppercase;letter-spacing:.06em">Application ${esc(applicationId)}</p>
      <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3">${esc(headline)}</h1>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6">Hello ${esc(firstName)},</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;white-space:pre-line">${esc(message)}</p>
      ${dashboardUrl ? `<a href="${esc(dashboardUrl)}" style="display:inline-block;background:#6D1838;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold;font-size:14px">Open my dashboard</a>` : ""}
      <p style="margin:24px 0 0;font-size:12px;color:#8a8590;line-height:1.5">You receive this email because you have an application with ${esc(fromName)}. Please do not share your password with anyone.</p>
    </td></tr>
  </table></td></tr></table></body></html>`;
  const text = `${headline}\n\nHello ${firstName},\n\n${message}\n\n${dashboardUrl ? `Open your dashboard: ${dashboardUrl}\n` : ""}`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to, name: firstName }],
      subject,
      htmlContent: html,
      textContent: text,
      tags: ["student-notification"],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return json({ sent: false, error: `Email provider error ${res.status}: ${detail.slice(0, 200)}` });
  }
  return json({ sent: true });
});
