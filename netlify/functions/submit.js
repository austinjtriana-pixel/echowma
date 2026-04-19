// Netlify Function: receives survey submissions, stores in Supabase, and emails CSV via Resend
const https = require("https");
const Sentry = require("@sentry/node");
if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN });
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TO_EMAIL = process.env.TO_EMAIL || "austin.j.triana@gmail.com";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map((o) => o.trim()).filter(Boolean);

// Simple in-memory sliding-window rate limit (per warm container).
// Not a hard defense on its own, but cheap and blocks casual flooding.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map();

const { validatePayload, csvCell, stripCtrl } = require("./validate");

function rateLimitOk(ip) {
  if (!ip) return true;
  const now = Date.now();
  const arr = (rateLimitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, arr);
    return false;
  }
  arr.push(now);
  rateLimitMap.set(ip, arr);
  // Opportunistic cleanup to avoid unbounded growth
  if (rateLimitMap.size > 10_000) {
    for (const [k, v] of rateLimitMap) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) rateLimitMap.delete(k);
    }
  }
  return true;
}

function buildCorsHeaders(event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : (ALLOWED_ORIGINS[0] || "null"),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "_allowed": allowed ? "1" : "0",
  };
}

// fetch fallback for Node <18
function postJSON(url, reqHeaders, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: "POST", headers: reqHeaders },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: () => Promise.resolve(data) }));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function safeFetch(url, options) {
  if (typeof fetch !== "undefined") {
    return fetch(url, options);
  }
  return postJSON(url, options.headers, options.body);
}

exports.handler = async (event) => {
  const rawHeaders = buildCorsHeaders(event);
  const originAllowed = rawHeaders._allowed === "1";
  const headers = { ...rawHeaders };
  delete headers._allowed;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method not allowed" };
  }

  // If ALLOWED_ORIGINS is configured, reject cross-origin browser requests.
  // Requests without an Origin header (same-origin, curl) are allowed through.
  const originHeader = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  if (ALLOWED_ORIGINS.length > 0 && originHeader && !originAllowed) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  // Rate limit by client IP (Netlify forwards via x-nf-client-connection-ip / x-forwarded-for)
  const ip =
    (event.headers && (event.headers["x-nf-client-connection-ip"] ||
      (event.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      event.headers["client-ip"])) || "";
  if (!rateLimitOk(ip)) {
    return {
      statusCode: 429,
      headers: { ...headers, "Retry-After": "60" },
      body: JSON.stringify({ error: "Too many requests" }),
    };
  }

  try {
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const validationErrors = validatePayload(payload);
    if (validationErrors.length > 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Validation failed", details: validationErrors }) };
    }

    const { rater, cases, timestamp } = payload;

    rater.name = stripCtrl(rater.name);
    if (rater.hospital) rater.hospital = stripCtrl(rater.hospital);

    // ---- Supabase insert ----
    if (SUPABASE_URL && SUPABASE_KEY) {
      const rows = cases.map((c) => {
        const row = {
          rater_name: rater.name,
          rater_email: rater.email || null,
          hospital: rater.hospital || null,
          role: rater.role || null,
          case_number: c.caseNumber,
          wmsi: c.wmsi ?? null,
          comments: c.comments || null,
        };
        for (let s = 1; s <= 17; s++) row[`seg${s}`] = c.scores[s] ?? null;
        return row;
      });

      const dbResp = await safeFetch(`${SUPABASE_URL}/rest/v1/submissions`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(rows),
      });

      if (!dbResp.ok) {
        const errText = await dbResp.text();
        console.error("Supabase insert error:", dbResp.status, errText);
        Sentry.captureException(new Error(`Supabase insert failed: ${dbResp.status} ${errText}`));
        // Don't fail the whole request — continue to email
      } else {
        console.log("Supabase insert success:", rows.length, "rows");
      }
    } else {
      console.warn("SUPABASE_URL or SUPABASE_KEY not set, skipping DB insert");
    }

    // ---- Build CSV for email ----
    const segNames = [
      "BasalAnterior", "BasalAnteroseptal", "BasalInferoseptal",
      "BasalInferior", "BasalInferolateral", "BasalAnterolateral",
      "MidAnterior", "MidAnteroseptal", "MidInferoseptal",
      "MidInferior", "MidInferolateral", "MidAnterolateral",
      "ApicalAnterior", "ApicalSeptal", "ApicalInferior",
      "ApicalLateral", "Apex"
    ];
    const segHeaders = segNames.map((name, i) => `Seg${i + 1}_${name}`);
    const csvHeader = ["RaterID", "Email", "Hospital", "Role", "CaseNumber", ...segHeaders, "WMSI", "Comments"].join(",");

    const csvRows = cases.map((c) => {
      const segValues = [];
      for (let s = 1; s <= 17; s++) {
        segValues.push(c.scores[s] === null ? "" : c.scores[s]);
      }
      return [
        csvCell(rater.name),
        csvCell(rater.email),
        csvCell(rater.hospital),
        csvCell(rater.role),
        c.caseNumber,
        ...segValues,
        c.wmsi ?? "",
        csvCell(c.comments),
      ].join(",");
    });

    const csv = csvHeader + "\n" + csvRows.join("\n");
    const csvBase64 = Buffer.from(csv).toString("base64");

    // ---- Send email via Resend ----
    const emailBody = `
New EchoWMA submission received.

Rater: ${rater.name}
Email: ${rater.email}
Hospital: ${rater.hospital}
Role: ${rater.role}
Submitted: ${timestamp || new Date().toISOString()}

Case Summary:
${cases.map((c) => {
  const scored = Object.values(c.scores).filter((v) => v !== null).length;
  return `  Case ${c.caseNumber}: ${scored}/17 scored, WMSI: ${c.wmsi ?? "N/A"}`;
}).join("\n")}

The CSV file is attached. Data has also been saved to Supabase.
    `.trim();

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return { statusCode: 200, headers, body: JSON.stringify({ status: "ok", email: false }) };
    }

    const emailPayload = JSON.stringify({
      from: "EchoWMA <onboarding@resend.dev>",
      to: [TO_EMAIL],
      subject: `EchoWMA Submission — ${rater.name} (${rater.hospital})`,
      text: emailBody,
      attachments: [
        {
          filename: `echoWMA_${rater.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 100)}_${Date.now()}.csv`,
          content: csvBase64,
        },
      ],
    });

    const emailResp = await safeFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: emailPayload,
    });

    if (!emailResp.ok) {
      const errText = await emailResp.text();
      console.error("Resend error:", emailResp.status, errText);
      Sentry.captureException(new Error(`Resend email failed: ${emailResp.status} ${errText}`));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to send email", detail: errText }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "ok" }),
    };
  } catch (err) {
    console.error("Function error:", err);
    Sentry.captureException(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
