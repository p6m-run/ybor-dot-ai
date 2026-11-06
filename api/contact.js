/* ==========================================================================
   POST /api/contact  (Vercel serverless function)
   Emails a contact-form submission to salesinquiries@ybor.ai through Resend,
   the same service and sending address the previous ybor.ai used.

   Needs one environment variable, set in Vercel project settings (never in code):
     RESEND_API_KEY   the Resend API key

   Rules this follows (Ybor SOC 2 environment):
   - The recipient is fixed here. The browser cannot choose where mail goes.
   - Everything a visitor typed is escaped before it goes into the email.
   - Form contents are never logged. Errors log only a status code.
   ========================================================================== */

const TO = "salesinquiries@ybor.ai";
const FROM = "Ybor website <no-reply@ybor.ai>";

/* Sites allowed to post here: production, Vercel previews, local testing. */
const ALLOWED_ORIGIN = /^https:\/\/((www\.)?ybor\.ai|[a-z0-9-]+\.vercel\.app)$|^http:\/\/localhost(:\d+)?$/;

const LIMITS = {
  intent: 100, firstName: 100, lastName: 100, email: 254, company: 200,
  role: 100, size: 50, message: 2000, page: 500,
};

function clean(value, max) {
  return String(value == null ? "" : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function oneLine(s) {
  return s.replace(/[\r\n]+/g, " ");
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGIN.test(origin)) {
    return send(res, 403, { ok: false, error: "forbidden" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== "object") {
    return send(res, 400, { ok: false, error: "invalid_body" });
  }

  /* Honeypot: people never see the "website" field. If it has a value, a bot
     filled it in. Answer as if it worked so the bot learns nothing. */
  if (clean(body.website, 200)) {
    return send(res, 200, { ok: true });
  }

  const f = {};
  for (const key of Object.keys(LIMITS)) f[key] = clean(body[key], LIMITS[key]);

  const missing = ["intent", "firstName", "lastName", "email", "company"].filter((k) => !f[k]);
  if (missing.length || body.consent !== true) {
    return send(res, 400, { ok: false, error: "missing_fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    return send(res, 400, { ok: false, error: "invalid_email" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("contact: RESEND_API_KEY is not set");
    return send(res, 500, { ok: false, error: "not_configured" });
  }

  const rows = [
    ["Inquiry type", f.intent],
    ["Name", f.firstName + " " + f.lastName],
    ["Email", f.email],
    ["Company", f.company],
    ["Role", f.role],
    ["Company size", f.size],
    ["Privacy policy", "Accepted"],
    ["Sent from", f.page],
  ];
  const message = f.message || "(none)";

  const html =
    "<h2>New website inquiry</h2>" +
    "<table cellpadding=\"4\">" +
    rows.map(([k, v]) => "<tr><td><strong>" + k + "</strong></td><td>" + escapeHtml(v || "-") + "</td></tr>").join("") +
    "</table><p><strong>Message</strong></p><p style=\"white-space:pre-wrap\">" + escapeHtml(message) + "</p>";

  const text = rows.map(([k, v]) => k + ": " + (v || "-")).join("\n") + "\n\nMessage:\n" + message;

  const subject = oneLine("[Website] " + f.intent + " | " + f.company).slice(0, 200);

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: f.email, subject, html, text }),
    });
    if (!r.ok) {
      console.error("contact: Resend returned HTTP " + r.status);
      return send(res, 502, { ok: false, error: "send_failed" });
    }
    return send(res, 200, { ok: true });
  } catch (e) {
    console.error("contact: could not reach Resend");
    return send(res, 502, { ok: false, error: "send_failed" });
  }
};
