// ============================================================
// SENTRY INITIALIZATION
// ============================================================
if (window.Sentry) {
  Sentry.init({
    dsn: "https://4d19c0ff0f76a8dd5e329f2c54460d77@o4511187607945216.ingest.us.sentry.io/4511187619872768",
    environment: location.hostname === "localhost" ? "development" : "production",
    tracesSampleRate: 0.1,
  });
}

// ============================================================
// CONFIGURATION
// ============================================================

// Netlify Function endpoint for email submissions
const SUBMIT_URL = "/.netlify/functions/submit";

// Multiple videos per case — add YouTube URLs for each echo view
const CASE_VIDEOS = [
  { // Case 1
    videos: [
      { label: "Clip 1", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case1_1.mp4" },
      { label: "Clip 2", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case1_2.mp4" },
      { label: "Clip 3", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case1_3.mp4" },
      { label: "Clip 4", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case1_4.mp4" },
      { label: "Clip 5", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case1_5.mp4" },
      { label: "Clip 6", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case1_6.mp4" },
    ]
  },
  { // Case 2
    videos: [
      { label: "Clip 1", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_1.mp4" },
      { label: "Clip 2", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_2.mp4" },
      { label: "Clip 3", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_3.mp4" },
      { label: "Clip 4", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_4.mp4" },
      { label: "Clip 5", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_5.mp4" },
      { label: "Clip 6", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_6.mp4" },
      { label: "Clip 7", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_7.mp4" },
      { label: "Clip 8", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case2_8.mp4" },
    ]
  },
  { // Case 3
    videos: [
      { label: "Clip 1", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_1.mp4" },
      { label: "Clip 2", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_2.mp4" },
      { label: "Clip 3", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_3.mp4" },
      { label: "Clip 4", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_4.mp4" },
      { label: "Clip 5", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_5.mp4" },
      { label: "Clip 6", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_6.mp4" },
      { label: "Clip 7", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_7.mp4" },
      { label: "Clip 8", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case3_8.mp4" },
    ]
  },
  { // Case 4
    videos: [
      { label: "Clip 1", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_1.mp4" },
      { label: "Clip 2", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_2.mp4" },
      { label: "Clip 3", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_3.mp4" },
      { label: "Clip 4", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_4.mp4" },
      { label: "Clip 5", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_5.mp4" },
      { label: "Clip 6", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_6.mp4" },
      { label: "Clip 7", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case4_7.mp4" },
    ]
  },
  { // Case 5
    videos: [
      { label: "Clip 1", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case5_1.mp4" },
      { label: "Clip 2", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case5_2.mp4" },
      { label: "Clip 3", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case5_3.mp4" },
      { label: "Clip 4", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case5_4.mp4" },
      { label: "Clip 5", url: "https://ivnugmgqnnvxbdakwzip.supabase.co/storage/v1/object/public/case-videos/Case5_5.mp4" },
    ]
  },
];

// ============================================================
// DATA MODEL
// ============================================================
const SEGMENTS = [
  { id: 1,  name: "Basal Anterior",       abbr: "BA" },
  { id: 2,  name: "Basal Anteroseptal",   abbr: "BAS" },
  { id: 3,  name: "Basal Inferoseptal",   abbr: "BIS" },
  { id: 4,  name: "Basal Inferior",       abbr: "BI" },
  { id: 5,  name: "Basal Inferolateral",  abbr: "BIL" },
  { id: 6,  name: "Basal Anterolateral",  abbr: "BAL" },
  { id: 7,  name: "Mid Anterior",         abbr: "MA" },
  { id: 8,  name: "Mid Anteroseptal",     abbr: "MAS" },
  { id: 9,  name: "Mid Inferoseptal",     abbr: "MIS" },
  { id: 10, name: "Mid Inferior",         abbr: "MI" },
  { id: 11, name: "Mid Inferolateral",    abbr: "MIL" },
  { id: 12, name: "Mid Anterolateral",    abbr: "MAL" },
  { id: 13, name: "Apical Anterior",      abbr: "AA" },
  { id: 14, name: "Apical Septal",        abbr: "AS" },
  { id: 15, name: "Apical Inferior",      abbr: "AI" },
  { id: 16, name: "Apical Lateral",       abbr: "AL" },
  { id: 17, name: "Apex",                 abbr: "Ap" },
];

const SCORES = [
  { value: null, label: "Not Assessed", color: "#d1d5db", textColor: "#555" },
  { value: 0,    label: "Hyperkinesis",  color: "#4a9e6e", textColor: "#fff" },
  { value: 1,    label: "Normal",        color: "#5b8abf", textColor: "#fff" },
  { value: 2,    label: "Hypokinesis",   color: "#8b6aae", textColor: "#fff" },
  { value: 3,    label: "Akinesis",      color: "#c05555", textColor: "#fff" },
  { value: 4,    label: "Dyskinesis",    color: "#c07a3e", textColor: "#fff" },
  { value: 5,    label: "Aneurysmal",    color: "#8a7040", textColor: "#fff" },
];

const VIEWS = {
  basalSA:  { type: "ring", sectors: 6, segments: [1,6,5,4,3,2] },
  midSA:    { type: "ring", sectors: 6, segments: [7,12,11,10,9,8] },
  apicalSA: { type: "ring", sectors: 4, segments: [13,16,15,14] },
  fourCh:   { type: "longaxis", left: [3,9,14],  right: [6,12,16],  apex: 17, leftLabel: "Sep", rightLabel: "Lat", hasRV: true, leftAtrium: "RA", rightAtrium: "LA" },
  twoCh:    { type: "longaxis", left: [4,10,15], right: [1,7,13],  apex: 17, leftLabel: "Inf", rightLabel: "Ant", hasRV: false, leftAtrium: "LA", rightAtrium: "LA" },
  longAxis: { type: "longaxis", left: [5,11,16], right: [2,8,14], apex: 17, leftLabel: "InfLat", rightLabel: "AntSep", hasRV: true, hasAorta: true, leftAtrium: "LA", rightAtrium: "Ao" },
};

// State
let state = {
  rater: { name: "", email: "", hospital: "", role: "" },
  currentCase: 1,
  maxVisitedCase: 1,
  submitted: false,
  cases: {}
};

for (let i = 1; i <= 5; i++) {
  state.cases[i] = { scores: {}, comments: "" };
  for (let s = 1; s <= 17; s++) state.cases[i].scores[s] = null;
}

// ============================================================
// SVG HELPERS
// ============================================================
function polarToCart(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, innerR, outerR, startDeg, endDeg) {
  const s1 = polarToCart(cx, cy, outerR, startDeg);
  const e1 = polarToCart(cx, cy, outerR, endDeg);
  const s2 = polarToCart(cx, cy, innerR, endDeg);
  const e2 = polarToCart(cx, cy, innerR, startDeg);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y}`,
    `Z`
  ].join(" ");
}

function getScoreInfo(score) {
  return SCORES.find(s => s.value === score) || SCORES[0];
}

function getSegName(id) {
  return SEGMENTS.find(s => s.id === id)?.name || "";
}

// ============================================================
// RENDER SHORT-AXIS RINGS
// ============================================================
function renderRing(containerId, view) {
  const ringSize = 200;
  const rvPad = 80;  // extra space on the left for the RV arc
  const svgW = ringSize + rvPad;
  const svgH = ringSize;
  const cx = rvPad + ringSize / 2, cy = ringSize / 2;
  const outerR = 88, innerR = 58;
  const hasApex = view.apex !== undefined;
  const apexR = hasApex ? 45 : 0;
  const effectiveInnerR = hasApex ? apexR + 6 : innerR;

  let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;

  const sectorAngle = 360 / view.sectors;
  // Offset so first segment (anterior) is centered at 12 o'clock
  const offsetAngle = -(sectorAngle / 2);

  view.segments.forEach((segId, i) => {
    const startDeg = offsetAngle + i * sectorAngle;
    const endDeg = startDeg + sectorAngle;
    const d = arcPath(cx, cy, effectiveInnerR, outerR, startDeg, endDeg);
    const info = getScoreInfo(state.cases[state.currentCase].scores[segId]);

    // Label position at midpoint
    const midAngle = startDeg + sectorAngle / 2;
    const midR = (effectiveInnerR + outerR) / 2;
    const lp = polarToCart(cx, cy, midR, midAngle);

    const scoreLabel = info.value === null ? "" : info.value;
    svg += `<path d="${d}" fill="${info.color}" class="segment-path" data-segment="${segId}" onclick="cycleScore(event, ${segId})" oncontextmenu="openPicker(event, ${segId})" onmousemove="showSegTooltip(event, ${segId})" onmouseleave="hideSegTooltip()" />`;
    svg += `<text x="${lp.x}" y="${lp.y}" fill="${info.textColor}" class="segment-label">${scoreLabel}</text>`;
  });

  // Apex center circle
  if (hasApex) {
    const apexInfo = getScoreInfo(state.cases[state.currentCase].scores[view.apex]);
    const apexScoreLabel = apexInfo.value === null ? "" : apexInfo.value;
    svg += `<circle cx="${cx}" cy="${cy}" r="${apexR}" fill="${apexInfo.color}" class="segment-path" data-segment="${view.apex}" onclick="cycleScore(event, ${view.apex})" oncontextmenu="openPicker(event, ${view.apex})" onmousemove="showSegTooltip(event, ${view.apex})" onmouseleave="hideSegTooltip()" />`;
    svg += `<text x="${cx}" y="${cy}" fill="${apexInfo.textColor}" class="segment-label">${apexScoreLabel}</text>`;
  }

  // RV reference — curved outline on the septal (left) side
  const rvStartAngle = view.sectors === 6 ? 225 : 225;
  const rvEndAngle = view.sectors === 6 ? 315 : 315;
  const rvBaseR = outerR + 3;
  const rvP1 = polarToCart(cx, cy, rvBaseR, rvStartAngle);
  const rvP2 = polarToCart(cx, cy, rvBaseR, rvEndAngle);
  const rvBulge = view.sectors === 6 ? 110 : 65;
  const rvCtrlOffset = view.sectors === 6 ? 10 : 20;
  const rvC1 = polarToCart(cx, cy, outerR + rvBulge, rvStartAngle + rvCtrlOffset);
  const rvC2 = polarToCart(cx, cy, outerR + rvBulge, rvEndAngle - rvCtrlOffset);
  svg += `<path d="M ${rvP1.x} ${rvP1.y} C ${rvC1.x} ${rvC1.y} ${rvC2.x} ${rvC2.y} ${rvP2.x} ${rvP2.y}" fill="none" stroke="#bbb" stroke-width="1.8"/>`;

  svg += `</svg>`;
  document.getElementById(containerId).innerHTML = svg;
}

// ============================================================
// RENDER LONG-AXIS VIEWS (apex on top, base on bottom, with atria + optional RV)
// ============================================================
function renderLongAxis(containerId, view) {
  const rvLeftExtra = (view.hasRV && !view.hasAorta) ? 85 : 0;
  const rvRightExtra = (view.hasRV && view.hasAorta) ? 85 : 0;
  const w = 260 + rvLeftExtra + rvRightExtra, h = 290;
  const cx = rvLeftExtra + 260 / 2;

  const apexY = 42;
  const baseY = 254;

  const wallThick = 24;
  const cavityHalfTop = 10;
  const cavityHalfBot = 42;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 1.35); }
  function tFrac(y) { return (y - apexY) / (baseY - apexY); }

  function leftInner(y) {
    const t = easeOut(tFrac(y));
    return cx - lerp(cavityHalfTop, cavityHalfBot, t);
  }
  function leftOuter(y) {
    const t = easeOut(tFrac(y));
    const thick = lerp(wallThick * 0.9, wallThick, t);
    return leftInner(y) - thick;
  }
  function rightInner(y) {
    const t = easeOut(tFrac(y));
    return cx + lerp(cavityHalfTop, cavityHalfBot, t);
  }
  function rightOuter(y) {
    const t = easeOut(tFrac(y));
    const thick = lerp(wallThick * 0.9, wallThick, t);
    return rightInner(y) + thick;
  }

  const yApicalTop = apexY + 18;
  const yApicalBot = apexY + 78;
  const yMidBot = apexY + 145;
  const yBasalBot = baseY;

  const yLevels = [yApicalTop, yApicalBot, yMidBot, yBasalBot];
  const leftSegs = [view.left[2], view.left[1], view.left[0]];
  const rightSegs = [view.right[2], view.right[1], view.right[0]];

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;

  // LV cavity outline — sits inside the apical arch
  const cavityTopY = apexY + 8;
  svg += `<path d="
    M ${cx} ${cavityTopY}
    Q ${leftInner(apexY)} ${apexY + 28}, ${leftInner(baseY)} ${baseY}
    L ${rightInner(baseY)} ${baseY}
    Q ${rightInner(apexY)} ${apexY + 28}, ${cx} ${cavityTopY}
    Z" fill="#f8f8f8" stroke="none"/>`;

  // RV free wall
  if (view.hasRV) {
    const rvMidY = (yApicalTop + yBasalBot) / 2;
    const rvTopY = yApicalTop + 5;
    const rvBotY = yBasalBot;
    if (view.hasAorta) {
      const rvPeakX = rightOuter(rvMidY) + 55;
      const rvBaseX = rightOuter(yBasalBot) + 50;
      svg += `<path d="
        M ${rightOuter(rvTopY)} ${rvTopY}
        C ${rvPeakX} ${rvTopY + 40}, ${rvPeakX + 10} ${rvBotY - 25}, ${rvBaseX} ${rvBotY}
        " fill="none" stroke="#bbb" stroke-width="1.8"/>`;
      svg += `<text x="${rvPeakX + 14}" y="${rvMidY}" fill="#999" font-size="11" font-weight="600" text-anchor="middle" dominant-baseline="central">RV</text>`;
    } else {
      const rvPeakX = leftOuter(rvMidY) - 55;
      const rvBaseX = leftOuter(yBasalBot) - 50;
      svg += `<path d="
        M ${leftOuter(rvTopY)} ${rvTopY}
        C ${rvPeakX} ${rvTopY + 40}, ${rvPeakX - 10} ${rvBotY - 25}, ${rvBaseX} ${rvBotY}
        " fill="none" stroke="#bbb" stroke-width="1.8"/>`;
      svg += `<text x="${rvPeakX - 14}" y="${rvMidY}" fill="#999" font-size="11" font-weight="600" text-anchor="middle" dominant-baseline="central">RV</text>`;
    }
  }

  // Aortic root / LVOT
  if (view.hasAorta) {
    const aoTopY = yBasalBot;
    const aoEndY = yBasalBot + 30;
    const aoRightX = rightInner(aoTopY) - 4;
    const aoLeftX = aoRightX - 30;
    const aoTiltX = 25;
    const aoEndLeftX = aoLeftX + aoTiltX;
    const aoEndRightX = aoRightX + aoTiltX;
    svg += `<path d="
      M ${aoLeftX} ${aoTopY}
      C ${aoLeftX + 5} ${aoTopY + 30}, ${aoEndLeftX - 5} ${aoEndY - 20}, ${aoEndLeftX} ${aoEndY}
      " fill="none" stroke="#bbb" stroke-width="1.8"/>`;
    svg += `<path d="
      M ${aoRightX} ${aoTopY}
      C ${aoRightX + 5} ${aoTopY + 30}, ${aoEndRightX - 5} ${aoEndY - 20}, ${aoEndRightX} ${aoEndY}
      " fill="none" stroke="#bbb" stroke-width="1.8"/>`;
    const aoLabelX = (aoLeftX + aoRightX) / 2 + aoTiltX / 2;
    const aoLabelY = (aoTopY + aoEndY) / 2;
    svg += `<text x="${aoLabelX}" y="${aoLabelY}" fill="#999" font-size="11" font-weight="600" text-anchor="middle" dominant-baseline="central">Ao</text>`;
  }

  // Left wall segments
  for (let i = 0; i < 3; i++) {
    const yt = yLevels[i], yb = yLevels[i + 1];
    const segId = leftSegs[i];
    const info = getScoreInfo(state.cases[state.currentCase].scores[segId]);

    const steps = 8;
    let outerPts = [], innerPts = [];
    for (let s = 0; s <= steps; s++) {
      const y = lerp(yt, yb, s / steps);
      outerPts.push(`${leftOuter(y)},${y}`);
      innerPts.push(`${leftInner(y)},${y}`);
    }
    const d = `M ${outerPts[0]} L ${outerPts.join(" L ")} L ${innerPts.reverse().join(" L ")} Z`;
    const midY = (yt + yb) / 2;
    const lx = (leftOuter(midY) + leftInner(midY)) / 2;

    const scoreLabel = info.value === null ? "" : info.value;
    svg += `<path d="${d}" fill="${info.color}" class="segment-path" data-segment="${segId}" onclick="cycleScore(event, ${segId})" oncontextmenu="openPicker(event, ${segId})" onmousemove="showSegTooltip(event, ${segId})" onmouseleave="hideSegTooltip()" />`;
    svg += `<text x="${lx}" y="${midY}" fill="${info.textColor}" class="segment-label">${scoreLabel}</text>`;
  }

  // Right wall segments
  for (let i = 0; i < 3; i++) {
    const yt = yLevels[i], yb = yLevels[i + 1];
    const segId = rightSegs[i];
    const info = getScoreInfo(state.cases[state.currentCase].scores[segId]);

    const steps = 8;
    let innerPts = [], outerPts = [];
    for (let s = 0; s <= steps; s++) {
      const y = lerp(yt, yb, s / steps);
      innerPts.push(`${rightInner(y)},${y}`);
      outerPts.push(`${rightOuter(y)},${y}`);
    }
    const d = `M ${innerPts[0]} L ${innerPts.join(" L ")} L ${outerPts.reverse().join(" L ")} Z`;
    const midY = (yt + yb) / 2;
    const lx = (rightOuter(midY) + rightInner(midY)) / 2;

    const scoreLabel2 = info.value === null ? "" : info.value;
    svg += `<path d="${d}" fill="${info.color}" class="segment-path" data-segment="${segId}" onclick="cycleScore(event, ${segId})" oncontextmenu="openPicker(event, ${segId})" onmousemove="showSegTooltip(event, ${segId})" onmouseleave="hideSegTooltip()" />`;
    svg += `<text x="${lx}" y="${midY}" fill="${info.textColor}" class="segment-label">${scoreLabel2}</text>`;
  }

  // Apex cap — rounded gothic arch where the two walls meet at a pointed rounded peak
  const apexInfo = getScoreInfo(state.cases[state.currentCase].scores[view.apex]);
  const loTop = leftOuter(yApicalTop);
  const roTop = rightOuter(yApicalTop);
  const liTop = leftInner(yApicalTop);
  const riTop = rightInner(yApicalTop);
  const outerPeakY = apexY - 6;
  const innerPeakY = apexY + 8;
  svg += `<path d="
    M ${loTop} ${yApicalTop}
    C ${loTop} ${outerPeakY}, ${cx - 2} ${outerPeakY}, ${cx} ${outerPeakY}
    C ${cx + 2} ${outerPeakY}, ${roTop} ${outerPeakY}, ${roTop} ${yApicalTop}
    L ${riTop} ${yApicalTop}
    C ${riTop} ${innerPeakY}, ${cx + 2} ${innerPeakY}, ${cx} ${innerPeakY}
    C ${cx - 2} ${innerPeakY}, ${liTop} ${innerPeakY}, ${liTop} ${yApicalTop}
    Z" fill="${apexInfo.color}" class="segment-path" data-segment="${view.apex}" onclick="cycleScore(event, ${view.apex})" oncontextmenu="openPicker(event, ${view.apex})" onmousemove="showSegTooltip(event, ${view.apex})" onmouseleave="hideSegTooltip()" />`;
  const apexLabelY = apexY + 2;
  const apexScoreLabel = apexInfo.value === null ? "" : apexInfo.value;
  svg += `<text x="${cx}" y="${apexLabelY}" fill="${apexInfo.textColor}" class="segment-label" style="font-size:11px">${apexScoreLabel}</text>`;

  // Wall labels — positioned just outside the basal segment, aligned to the base
  svg += `<text x="${leftOuter(baseY) - 5}" y="${baseY}" fill="var(--text-muted)" font-size="11" font-weight="700" text-anchor="end" dominant-baseline="central">${view.leftLabel}</text>`;
  svg += `<text x="${rightOuter(baseY) + 5}" y="${baseY}" fill="var(--text-muted)" font-size="11" font-weight="700" text-anchor="start" dominant-baseline="central">${view.rightLabel}</text>`;

  svg += `</svg>`;
  document.getElementById(containerId).innerHTML = svg;
}

// ============================================================
// RENDER ALL DIAGRAMS
// ============================================================
function renderAll() {
  renderRing("basalSA", VIEWS.basalSA);
  renderRing("midSA", VIEWS.midSA);
  renderRing("apicalSA", VIEWS.apicalSA);
  renderLongAxis("fourCh", VIEWS.fourCh);
  renderLongAxis("twoCh", VIEWS.twoCh);
  renderLongAxis("longAxis", VIEWS.longAxis);
  updateWMSI();
}

// ============================================================
// SCORE PICKER
// ============================================================
let pickerSegId = null;

function cycleScore(event, segId) {
  event.stopPropagation();
  const scores = state.cases[state.currentCase].scores;
  const current = scores[segId];
  if (current === null) scores[segId] = 1;
  else if (current >= 5) scores[segId] = null;
  else scores[segId] = current + 1;
  renderAll();
  updateCaseTabs();
  saveState();
}

function showSegTooltip(event, segId) {
  const tooltip = document.getElementById("segmentTooltip");
  tooltip.textContent = getSegName(segId);

  let left = event.clientX + 12;
  let top = event.clientY - 32;

  if (left + 160 > window.innerWidth) left = event.clientX - 160;
  if (top < 10) top = event.clientY + 14;

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
  tooltip.classList.add("visible");
}

function hideSegTooltip() {
  document.getElementById("segmentTooltip").classList.remove("visible");
}

function openPicker(event, segId) {
  event.preventDefault();
  event.stopPropagation();
  hideSegTooltip();
  pickerSegId = segId;
  const picker = document.getElementById("scorePicker");
  const overlay = document.getElementById("overlay");
  const currentScore = state.cases[state.currentCase].scores[segId];

  let html = `<h5>Seg ${segId}: ${getSegName(segId)}</h5><div class="score-options">`;
  SCORES.forEach(s => {
    const active = s.value === currentScore ? " active" : "";
    const label = s.value === null ? "N/A" : `${s.value} — ${s.label}`;
    html += `<button class="score-option${active}" onclick="setScore(${segId}, ${s.value === null ? 'null' : s.value})">
      <span class="opt-swatch" style="background:${s.color}"></span>${label}</button>`;
  });
  html += `</div>`;
  picker.innerHTML = html;

  // Position near click
  const rect = event.target.getBoundingClientRect();
  let left = rect.right + 8;
  let top = rect.top - 20;

  // Keep on screen
  if (left + 200 > window.innerWidth) left = rect.left - 210;
  if (top + 300 > window.innerHeight) top = window.innerHeight - 310;
  if (top < 10) top = 10;

  picker.style.left = left + "px";
  picker.style.top = top + "px";
  picker.classList.add("visible");
  overlay.classList.add("visible");
}

function closePicker() {
  document.getElementById("scorePicker").classList.remove("visible");
  document.getElementById("overlay").classList.remove("visible");
  pickerSegId = null;
}

document.getElementById("overlay").addEventListener("click", closePicker);

function setScore(segId, value) {
  state.cases[state.currentCase].scores[segId] = value;
  closePicker();
  renderAll();
  updateCaseTabs();
  saveState();
}

// ============================================================
// BULK ACTIONS
// ============================================================
function setAllScores(value) {
  for (let s = 1; s <= 17; s++) {
    state.cases[state.currentCase].scores[s] = value;
  }
  renderAll();
  updateCaseTabs();
  saveState();
}

// ============================================================
// WMSI
// ============================================================
function updateWMSI() {
  const scores = state.cases[state.currentCase].scores;
  let sum = 0, count = 0;
  for (let s = 1; s <= 17; s++) {
    if (scores[s] !== null && scores[s] > 0) {
      sum += scores[s];
      count++;
    } else if (scores[s] === 0) {
      // Hyperkinesis scored as 0 — include in count but not in standard WMSI
      // Standard WMSI uses 1=normal as baseline; treat 0 as 1 for WMSI calc
      sum += 1;
      count++;
    }
  }
  const display = document.getElementById("wmsiDisplay");
  if (count === 0) {
    display.innerHTML = `—<small>Score Index</small>`;
  } else {
    const wmsi = (sum / count).toFixed(2);
    display.innerHTML = `${wmsi}<small>Score Index (${count}/17 segments)</small>`;
  }
}

// ============================================================
// CASE TABS & NAVIGATION
// ============================================================
function renderCaseTabs() {
  const container = document.getElementById("caseTabs");
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const active = i === state.currentCase ? " active" : "";
    const disabled = i > state.maxVisitedCase ? " disabled" : "";
    const scored = countScored(i);
    html += `<div class="case-tab${active}${disabled}" onclick="${i <= state.maxVisitedCase ? `switchCase(${i})` : ''}">Case ${i}<span class="completion">(${scored}/17)</span></div>`;
  }
  container.innerHTML = html;
}

function updateCaseTabs() {
  renderCaseTabs();
}

function countScored(caseNum) {
  let c = 0;
  for (let s = 1; s <= 17; s++) {
    if (state.cases[caseNum].scores[s] !== null) c++;
  }
  return c;
}

function switchCase(num) {
  if (num > state.maxVisitedCase) return;
  state.cases[state.currentCase].comments = document.getElementById("caseComments").value;
  state.currentCase = num;
  renderAll();
  renderCaseTabs();
  loadVideo(num);
  updateNav();
  document.getElementById("caseComments").value = state.cases[num].comments || "";
  saveState();
}

function prevCase() {
  if (state.currentCase > 1) switchCase(state.currentCase - 1);
}

function nextCase() {
  if (state.currentCase < 5) {
    const next = state.currentCase + 1;
    if (next > state.maxVisitedCase) state.maxVisitedCase = next;
    switchCase(next);
  } else {
    showReviewPanel();
  }
}

function updateNav() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progress = document.getElementById("navProgress");
  prevBtn.disabled = state.currentCase <= 1;
  nextBtn.textContent = state.currentCase === 5 ? "Review & Submit" : "Next Case";
  progress.textContent = `Case ${state.currentCase} of 5`;
}

// ============================================================
// VIDEO (multi-clip grid per case)
// ============================================================
function loadVideo(caseNum) {
  const container = document.getElementById("videoContainer");
  const caseVideos = CASE_VIDEOS[caseNum - 1]?.videos || [];

  container.classList.remove("single");

  if (caseVideos.length === 0) {
    container.innerHTML = `<div class="video-placeholder">No video configured for Case ${caseNum}.</div>`;
    container.classList.add("single");
    return;
  }

  // Multi-clip grid: render all clips simultaneously, autoplaying + looped
  if (caseVideos.length > 1) {
    const tiles = caseVideos.map((v, i) => `
      <div class="video-tile" onclick="openVideoModal(${caseNum}, ${i})">
        <video src="${v.url}" autoplay loop muted playsinline preload="metadata"></video>
        <div class="tile-label">${v.label || `Clip ${i + 1}`}</div>
      </div>
    `).join("");
    container.innerHTML = `<div class="video-grid">${tiles}</div>`;
    return;
  }

  // Single-clip fallback (YouTube/Vimeo embeds or a lone MP4)
  container.classList.add("single");
  const url = caseVideos[0].url;
  if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
    let embedUrl = url;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    container.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
  } else {
    container.innerHTML = `<video src="${url}" autoplay loop muted playsinline controls preload="metadata"></video>`;
  }
}

// Expand a clip to a fullscreen modal on click
function openVideoModal(caseNum, idx) {
  const clip = CASE_VIDEOS[caseNum - 1]?.videos?.[idx];
  if (!clip) return;
  let modal = document.getElementById("videoModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "videoModal";
    modal.className = "video-modal";
    modal.onclick = closeVideoModal;
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <button class="video-modal-close" onclick="event.stopPropagation(); closeVideoModal()" aria-label="Close">&times;</button>
    <video src="${clip.url}" autoplay loop muted playsinline controls></video>
  `;
  modal.classList.add("visible");
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  if (!modal) return;
  modal.classList.remove("visible");
  modal.innerHTML = "";
}

// Esc closes the expanded modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeVideoModal();
});

// ============================================================
// LEGEND & BULK BUTTONS
// ============================================================
function renderLegend() {
  const legend = document.getElementById("legend");
  let html = "";
  SCORES.forEach(s => {
    const label = s.value === null ? "N/A" : s.value;
    html += `<div class="legend-item"><span class="legend-swatch" style="background:${s.color}; color:${s.textColor}">${s.value === null ? "" : s.value}</span>${s.value === null ? "Not Assessed" : s.label}</div>`;
  });
  legend.innerHTML = html;
}

function renderBulkActions() {
  const container = document.getElementById("bulkActions");
  container.innerHTML = `
    <button class="bulk-btn" onclick="setAllScores(null)">&#x1f6ab; Clear All</button>
    <button class="bulk-btn" onclick="setAllScores(1)"><span class="dot" style="background:var(--score-1)"></span> All Normal</button>
    <button class="bulk-btn" onclick="setAllScores(0)"><span class="dot" style="background:var(--score-0)"></span> All Hyperkinetic</button>
    <button class="bulk-btn" onclick="setAllScores(2)"><span class="dot" style="background:var(--score-2)"></span> All Hypokinetic</button>
  `;
}

// ============================================================
// LOCALSTORAGE
// ============================================================
function saveState() {
  const commentsEl = document.getElementById("caseComments");
  if (commentsEl) state.cases[state.currentCase].comments = commentsEl.value;
  localStorage.setItem("echoWMA_state", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("echoWMA_state");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.rater) {
        state.rater = { name: parsed.rater.name || "", email: parsed.rater.email || "", hospital: parsed.rater.hospital || "", role: parsed.rater.role || "" };
      } else if (parsed.raterId) {
        state.rater.name = parsed.raterId;
      }
      state.currentCase = parsed.currentCase || 1;
      state.maxVisitedCase = parsed.maxVisitedCase || 1;
      state.submitted = parsed.submitted || false;
      for (let i = 1; i <= 5; i++) {
        if (parsed.cases && parsed.cases[i]) {
          state.cases[i].comments = parsed.cases[i].comments || "";
          for (let s = 1; s <= 17; s++) {
            state.cases[i].scores[s] = parsed.cases[i].scores[s] !== undefined ? parsed.cases[i].scores[s] : null;
          }
        }
      }
    } catch(e) { /* ignore corrupt data */ }
  }
  document.getElementById("caseComments").value = state.cases[state.currentCase].comments || "";
}

// Auto-save comments
document.getElementById("caseComments").addEventListener("input", saveState);

// ============================================================
// PAYLOAD
// ============================================================
function buildPayload() {
  const cases = [];
  for (let c = 1; c <= 5; c++) {
    const scores = state.cases[c].scores;
    let sum = 0, count = 0;
    for (let s = 1; s <= 17; s++) {
      const v = scores[s];
      if (v !== null) { sum += v === 0 ? 1 : v; count++; }
    }
    cases.push({
      caseNumber: c,
      scores: { ...scores },
      wmsi: count > 0 ? parseFloat((sum / count).toFixed(2)) : null,
      comments: state.cases[c].comments || ""
    });
  }
  return { rater: { ...state.rater }, cases };
}

// ============================================================
// INTAKE MODAL
// ============================================================
// Show/hide "Other" hospital text input
document.getElementById("intakeHospital").addEventListener("change", function() {
  document.getElementById("intakeHospitalOther").style.display = this.value === "Other" ? "block" : "none";
});

function submitIntake() {
  const name = document.getElementById("intakeName").value.trim();
  const email = document.getElementById("intakeEmail").value.trim();
  const hospitalSelect = document.getElementById("intakeHospital").value;
  const hospitalOther = document.getElementById("intakeHospitalOther").value.trim();
  const hospital = hospitalSelect === "Other" ? hospitalOther : hospitalSelect;
  const role = document.getElementById("intakeRole").value;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  document.getElementById("nameError").style.display = name ? "none" : "block";
  document.getElementById("emailError").style.display = emailValid ? "none" : "block";
  document.getElementById("hospitalError").style.display = hospital ? "none" : "block";
  document.getElementById("roleError").style.display = role ? "none" : "block";
  if (!name || !emailValid || !hospital || !role) return;

  state.rater = { name, email, hospital, role };
  document.getElementById("intakeModal").classList.add("hidden");

  // Show onboarding for first-time users
  if (!localStorage.getItem("echoWMA_hideOnboarding")) {
    document.getElementById("onboardingModal").classList.remove("hidden");
  }

  updateRaterDisplay();
  saveState();
}

function dismissOnboarding() {
  if (document.getElementById("dontShowAgain").checked) {
    localStorage.setItem("echoWMA_hideOnboarding", "true");
  }
  document.getElementById("onboardingModal").classList.add("hidden");
}

function showIntakeModal() {
  const modal = document.getElementById("intakeModal");
  modal.classList.remove("hidden");
  document.getElementById("intakeName").value = state.rater.name || "";
  document.getElementById("intakeEmail").value = state.rater.email || "";
  const knownHospitals = ["HUP", "Presby", "Pennsy"];
  const h = state.rater.hospital || "";
  if (knownHospitals.includes(h)) {
    document.getElementById("intakeHospital").value = h;
    document.getElementById("intakeHospitalOther").style.display = "none";
  } else if (h) {
    document.getElementById("intakeHospital").value = "Other";
    document.getElementById("intakeHospitalOther").value = h;
    document.getElementById("intakeHospitalOther").style.display = "block";
  }
  document.getElementById("intakeRole").value = state.rater.role || "";
}

function updateRaterDisplay() {
  const info = document.getElementById("raterInfo");
  if (state.rater.name) {
    const emailPart = state.rater.email ? ` | ${state.rater.email}` : "";
    info.innerHTML = `<span>${state.rater.name}${emailPart} | ${state.rater.hospital} | ${state.rater.role}</span><button onclick="showIntakeModal()">Edit</button>`;
  } else {
    info.innerHTML = "";
  }
}

// ============================================================
// REVIEW PANEL
// ============================================================
function showReviewPanel() {
  state.cases[state.currentCase].comments = document.getElementById("caseComments").value;
  saveState();

  document.querySelector("main").style.display = "none";
  document.getElementById("caseTabs").style.display = "none";
  const panel = document.getElementById("reviewPanel");
  panel.classList.remove("hidden");

  let html = `<h2>Review Your Responses</h2>
    <p class="review-subtitle">Please review your scores before submitting.</p>
    <div class="review-rater"><strong>${state.rater.name}</strong> &mdash; ${state.rater.email} &mdash; ${state.rater.hospital} &mdash; ${state.rater.role}</div>`;

  for (let c = 1; c <= 5; c++) {
    const scored = countScored(c);
    const scores = state.cases[c].scores;
    let sum = 0, cnt = 0;
    for (let s = 1; s <= 17; s++) {
      const v = scores[s];
      if (v !== null) { sum += v === 0 ? 1 : v; cnt++; }
    }
    const wmsi = cnt > 0 ? (sum / cnt).toFixed(2) : "N/A";
    const warning = scored < 17 ? `<span class="warning">${17 - scored} segment(s) not assessed</span>` : "";
    html += `<div class="review-case-card">
      <div><span class="case-label">Case ${c}</span> ${warning}</div>
      <div class="case-stats">${scored}/17 scored &mdash; WMSI: ${wmsi}</div>
    </div>`;
  }

  html += `<div class="review-actions">
    <button class="nav-btn" onclick="hideReviewPanel()">Go Back</button>
    <button class="nav-btn primary" onclick="submitSurvey()">Submit</button>
  </div>`;

  panel.innerHTML = html;
}

function hideReviewPanel() {
  document.getElementById("reviewPanel").classList.add("hidden");
  document.querySelector("main").style.display = "";
  document.getElementById("caseTabs").style.display = "";
}

// ============================================================
// SUBMISSION
// ============================================================
async function submitSurvey() {
  const payload = buildPayload();
  payload.timestamp = new Date().toISOString();

  // Disable submit button to prevent double-clicks
  const submitBtn = document.querySelector('#reviewPanel .nav-btn.primary');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Submitting..."; }

  try {
    const resp = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
  } catch (err) {
    if (window.Sentry) Sentry.captureException(err, { tags: { action: "submit_survey" } });
    alert("Submission failed. Please check your connection and try again.\n\nIf the problem persists, contact the study coordinator.");
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit"; }
    return;
  }

  state.submitted = true;
  saveState();
  showSuccessScreen();
}

function showSuccessScreen() {
  document.getElementById("reviewPanel").classList.add("hidden");
  document.querySelector("main").style.display = "none";
  document.getElementById("caseTabs").style.display = "none";
  document.getElementById("successScreen").classList.remove("hidden");
}

function startOver() {
  localStorage.removeItem("echoWMA_state");
  location.reload();
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener("keydown", (e) => {
  if (pickerSegId !== null && e.key >= "0" && e.key <= "5") {
    setScore(pickerSegId, parseInt(e.key));
  }
  if (e.key === "Escape") closePicker();
});

// ============================================================
// INIT
// ============================================================
function init() {
  loadState();

  // Already submitted
  if (state.submitted) {
    document.querySelector("main").style.display = "none";
    document.getElementById("caseTabs").style.display = "none";
    document.getElementById("intakeModal").classList.add("hidden");
    document.getElementById("successScreen").classList.remove("hidden");
    document.getElementById("successScreen").querySelector("h2").textContent = "Already Submitted";
    document.getElementById("successScreen").querySelector("p").textContent = "You have already submitted your responses. You can start a new survey if needed.";
    updateRaterDisplay();
    return;
  }

  // Show intake if no rater info; skip onboarding for returning users
  if (state.rater.name) {
    document.getElementById("intakeModal").classList.add("hidden");
  }

  updateRaterDisplay();
  renderLegend();
  renderBulkActions();
  renderCaseTabs();
  renderAll();
  loadVideo(state.currentCase);
  updateNav();
}

init();
