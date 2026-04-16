// Netlify Function: receives survey submissions, stores in Supabase, and emails CSV via Resend
const https = require("https");
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN || "" });
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TO_EMAIL = process.env.TO_EMAIL || "austin.j.triana@gmail.com";

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

function validatePayload(payload) {
  const errors = [];

  if (!payload.rater || typeof payload.rater !== "object") {
    errors.push("Missing rater object");
  } else {
    if (!payload.rater.name || typeof payload.rater.name !== "string" || payload.rater.name.trim().length === 0) {
      errors.push("Rater name is required");
    } else if (payload.rater.name.length > 200) {
      errors.push("Rater name too long");
    }
    if (!payload.rater.email || typeof payload.rater.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.rater.email)) {
      errors.push("Valid rater email is required");
    } else if (payload.rater.email.length > 254) {
      errors.push("Rater email too long");
    }
    if (payload.rater.hospital && typeof payload.rater.hospital !== "string") {
      errors.push("Hospital must be a string");
    }
    if (payload.rater.role && !["Faculty", "Fellow"].includes(payload.rater.role)) {
      errors.push("Invalid role value");
    }
  }

  if (!Array.isArray(payload.cases) || payload.cases.length === 0) {
    errors.push("Cases array is required and must not be empty");
  } else if (payload.cases.length > 10) {
    errors.push("Too many cases");
  } else {
    payload.cases.forEach((c, i) => {
      if (!c.caseNumber || typeof c.caseNumber !== "number") {
        errors.push(`Case ${i}: missing or invalid caseNumber`);
      }
      if (!c.scores || typeof c.scores !== "object") {
        errors.push(`Case ${i}: missing scores object`);
      } else {
        for (const [seg, val] of Object.entries(c.scores)) {
          const segNum = parseInt(seg);
          if (isNaN(segNum) || segNum < 1 || segNum > 17) {
            errors.push(`Case ${i}: invalid segment number ${seg}`);
          }
          if (val !== null && (typeof val !== "number" || !Number.isInteger(val) || val < 0 || val > 5)) {
            errors.push(`Case ${i}: segment ${seg} score must be null or integer 0-5`);
          }
        }
      }
      if (c.wmsi !== null && c.wmsi !== undefined && typeof c.wmsi !== "number") {
        errors.push(`Case ${i}: WMSI must be a number or null`);
      }
    });
  }

  return errors;
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method not allowed" };
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

    // ---- Supabase insert ----
    if (SUPABASE_URL && SUPABASE_KEY) {
      const rows = cases.map((c) => ({
        rater_name: rater.name,
        rater_email: rater.email || null,
        hospital: rater.hospital || null,
        role: rater.role || null,
        case_number: c.caseNumber,
        seg1: c.scores[1] ?? null, seg2: c.scores[2] ?? null, seg3: c.scores[3] ?? null,
        seg4: c.scores[4] ?? null, seg5: c.scores[5] ?? null, seg6: c.scores[6] ?? null,
        seg7: c.scores[7] ?? null, seg8: c.scores[8] ?? null, seg9: c.scores[9] ?? null,
        seg10: c.scores[10] ?? null, seg11: c.scores[11] ?? null, seg12: c.scores[12] ?? null,
        seg13: c.scores[13] ?? null, seg14: c.scores[14] ?? null, seg15: c.scores[15] ?? null,
        seg16: c.scores[16] ?? null, seg17: c.scores[17] ?? null,
        wmsi: c.wmsi ?? null,
        comments: c.comments || null,
      }));

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
      const comments = (c.comments || "").replace(/"/g, '""');
      const name = (rater.name || "").replace(/"/g, '""');
      const email = (rater.email || "").replace(/"/g, '""');
      const hospital = (rater.hospital || "").replace(/"/g, '""');
      return [`"${name}"`, `"${email}"`, `"${hospital}"`, rater.role, c.caseNumber, ...segValues, c.wmsi ?? "", `"${comments}"`].join(",");
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
          filename: `echoWMA_${rater.name.replace(/\s+/g, "_")}_${Date.now()}.csv`,
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
