// Netlify Function: receives survey submissions and emails CSV via Resend
const https = require("https");
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "austin.j.triana@gmail.com";

// fetch fallback for Node <18
function postJSON(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname, method: "POST", headers },
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

    // Build CSV
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

    // Build email body
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

The CSV file is attached.
    `.trim();

    // Send via Resend API
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing API key" }) };
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

    const reqHeaders = {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    let response;
    if (typeof fetch !== "undefined") {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: reqHeaders,
        body: emailPayload,
      });
    } else {
      response = await postJSON("https://api.resend.com/emails", reqHeaders, emailPayload);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("Resend error:", response.status, errText);
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
