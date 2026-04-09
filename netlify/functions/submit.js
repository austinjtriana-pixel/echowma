// Netlify Function: receives survey submissions, stores in Supabase, and emails CSV via Resend
const https = require("https");
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TO_EMAIL = "austin.j.triana@gmail.com";

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
    const payload = JSON.parse(event.body);
    const { rater, cases, timestamp } = payload;

    if (!rater?.name || !cases?.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid payload" }) };
    }

    // ---- Supabase insert ----
    if (SUPABASE_URL && SUPABASE_KEY) {
      const rows = cases.map((c) => ({
        rater_name: rater.name,
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
    const csvHeader = ["RaterID", "Hospital", "Role", "CaseNumber", ...segHeaders, "WMSI", "Comments"].join(",");

    const csvRows = cases.map((c) => {
      const segValues = [];
      for (let s = 1; s <= 17; s++) {
        segValues.push(c.scores[s] === null ? "" : c.scores[s]);
      }
      const comments = (c.comments || "").replace(/"/g, '""');
      const name = (rater.name || "").replace(/"/g, '""');
      const hospital = (rater.hospital || "").replace(/"/g, '""');
      return [`"${name}"`, `"${hospital}"`, rater.role, c.caseNumber, ...segValues, c.wmsi ?? "", `"${comments}"`].join(",");
    });

    const csv = csvHeader + "\n" + csvRows.join("\n");
    const csvBase64 = Buffer.from(csv).toString("base64");

    // ---- Send email via Resend ----
    const emailBody = `
New EchoWMA submission received.

Rater: ${rater.name}
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
