function stripCtrl(s) {
  return typeof s === "string" ? s.replace(/[\x00-\x1F\x7F]/g, "") : s;
}

function csvCell(value) {
  const s = String(value ?? "").replace(/"/g, '""');
  const prefix = /^[=+\-@\t\r]/.test(s) ? "'" : "";
  return `"${prefix}${s}"`;
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
      if (c.comments !== undefined && c.comments !== null) {
        if (typeof c.comments !== "string") {
          errors.push(`Case ${i}: comments must be a string`);
        } else if (c.comments.length > 2000) {
          errors.push(`Case ${i}: comments too long`);
        }
      }
    });
  }

  return errors;
}

module.exports = { validatePayload, csvCell, stripCtrl };
