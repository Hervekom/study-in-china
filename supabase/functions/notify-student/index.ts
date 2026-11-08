// Supabase Edge Function: notify-student
// Like official immigration portals, emails never carry the details of a file:
// they only say that something new is waiting in the student's account.
//
// type "account_update"       -> admins only: a new message / change is in the account
// type "application_received" -> the student who owns the application (or an admin),
//                                within 30 minutes of submitting it
//
// Email delivery via Brevo (secrets: BREVO_API_KEY, MAIL_FROM_EMAIL, MAIL_FROM_NAME).
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

type Lang = "en" | "fr";
type Kind = "account_update" | "application_received";

const COPY: Record<Kind, Record<Lang, { subject: string; title: string; body: string }>> = {
  account_update: {
    en: {
      subject: "New message in your ChinaStudyPath account",
      title: "You have a new message",
      body: "There is a new message or update about your application {ref} in your account. For your security, we do not send the details by email. Sign in to your account to read it.",
    },
    fr: {
      subject: "Nouveau message dans votre compte ChinaStudyPath",
      title: "Vous avez un nouveau message",
      body: "Un nouveau message ou une mise à jour concernant votre candidature {ref} est disponible dans votre compte. Pour votre sécurité, nous n’envoyons pas les détails par e-mail. Connectez-vous à votre compte pour le lire.",
    },
  },
  application_received: {
    en: {
      subject: "We received your application",
      title: "Application received",
      body: "Your application {ref} has been received. All updates and messages from our team will be posted in your account, and we will email you each time something new is available.",
    },
    fr: {
      subject: "Nous avons reçu votre candidature",
      title: "Candidature reçue",
      body: "Votre candidature {ref} a bien été reçue. Toutes les mises à jour et tous les messages de notre équipe seront publiés dans votre compte, et nous vous enverrons un e-mail à chaque nouveauté.",
    },
  },
};

const FOOTER: Record<Lang, { button: string; safety: string }> = {
  en: {
    button: "Sign in to my account",
    safety: "ChinaStudyPath will never ask for your password, card details or a payment by email, phone or WhatsApp. If a message asks you to, do not answer it.",
  },
  fr: {
    button: "Me connecter à mon compte",
    safety: "ChinaStudyPath ne vous demandera jamais votre mot de passe, vos données de carte ou un paiement par e-mail, téléphone ou WhatsApp. Si un message vous le demande, n’y répondez pas.",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ sent: false, error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const fromEmail = Deno.env.get("MAIL_FROM_EMAIL");
  const fromName = Deno.env.get("MAIL_FROM_NAME") || "ChinaStudyPath";

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ sent: false, error: "Invalid request" }, 400);
  }
  const type: Kind = body.type === "application_received" ? "application_received" : "account_update";
  const applicationId = clip(body.applicationId, 64);
  const siteUrl = /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(clip(body.siteUrl, 200)) ? clip(body.siteUrl, 200) : "";
  if (!applicationId) return json({ sent: false, error: "Missing applicationId" }, 400);

  // 1) Who is calling?
  const authHeader = req.headers.get("Authorization") || "";
  const asCaller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: isAdmin } = await asCaller.rpc("is_admin");
  const { data: who } = await asCaller.auth.getUser();
  const callerId = who?.user?.id || "";

  const admin = createClient(url, serviceKey);
  const { data: row, error: rowErr } = await admin
    .from("student_applications")
    .select("id, user_id, data, created_at")
    .eq("id", applicationId)
    .maybeSingle();
  if (rowErr || !row) return json({ sent: false, error: "Application not found" }, 404);

  if (type === "account_update" && isAdmin !== true) {
    return json({ sent: false, error: "Only admins can send account notifications" }, 403);
  }
  if (type === "application_received" && isAdmin !== true) {
    const fresh = Date.now() - new Date(row.created_at).getTime() < 30 * 60 * 1000;
    if (!callerId || callerId !== row.user_id || !fresh) {
      return json({ sent: false, error: "Not allowed" }, 403);
    }
  }

  if (!brevoKey || !fromEmail) {
    return json({ sent: false, error: "Email service not configured yet (BREVO_API_KEY / MAIL_FROM_EMAIL)" });
  }

  // 2) Recipient: the account email first, then the email given in the application
  const { data: userData } = await admin.auth.admin.getUserById(row.user_id);
  const to = userData?.user?.email || row.data?.personal?.email || "";
  if (!to) return json({ sent: false, error: "Student has no email address" });
  const firstName = clip(row.data?.personal?.firstName, 60);
  const lang: Lang = row.data?.preferredLanguage === "fr" ? "fr" : "en";
  const other: Lang = lang === "fr" ? "en" : "fr";

  const main = COPY[type][lang];
  const alt = COPY[type][other];
  const ref = esc(applicationId);
  const loginUrl = siteUrl ? `${siteUrl}/student/dashboard` : "";
  const hello = lang === "fr" ? `Bonjour ${esc(firstName)},` : `Hello ${esc(firstName) || "there"},`;

  const html = `<!doctype html><html><body style="margin:0;background:#f6f3f5;font-family:Arial,Helvetica,sans-serif;color:#18151B">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f5;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ead5de">
    <tr><td style="background:#6D1838;color:#ffffff;padding:18px 24px;font-weight:bold;font-size:16px">${esc(fromName)}</td></tr>
    <tr><td style="padding:24px">
      <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3">${esc(main.title)}</h1>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6">${hello}</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${main.body.replace("{ref}", `<strong>${ref}</strong>`)}</p>
      ${loginUrl ? `<a href="${esc(loginUrl)}" style="display:inline-block;background:#6D1838;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold;font-size:14px">${esc(FOOTER[lang].button)}</a>` : ""}
      <p style="margin:24px 0 0;font-size:12px;color:#8a8590;line-height:1.5">${esc(FOOTER[lang].safety)}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#55505a">${esc(alt.title)}</p>
      <p style="margin:0;font-size:12px;color:#8a8590;line-height:1.5">${alt.body.replace("{ref}", ref)}</p>
    </td></tr>
  </table></td></tr></table></body></html>`;
  const text = `${main.title}\n\n${hello.replace(/&[a-z#0-9]+;/g, "")}\n\n${main.body.replace("{ref}", applicationId)}\n\n${loginUrl ? `${FOOTER[lang].button}: ${loginUrl}\n\n` : ""}${FOOTER[lang].safety}\n\n---\n${alt.title}\n${alt.body.replace("{ref}", applicationId)}`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to, name: firstName || undefined }],
      subject: `${main.subject} · ${applicationId}`,
      htmlContent: html,
      textContent: text,
      tags: [type],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return json({ sent: false, error: `Email provider error ${res.status}: ${detail.slice(0, 200)}` });
  }
  return json({ sent: true });
});
