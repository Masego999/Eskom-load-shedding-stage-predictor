/**
 * predictor.js — Weighted linear regression stage predictor
 * Eskom Load Shedding Dashboard
 *
 * Mathematical model:
 *   Stage ≈ w1*(unplanned/1000) + w2*(planned/1000) + w3*(ocgt/100)*8 - w4*(reserve/1000)
 *
 * Weights derived from Eskom operational reports:
 *   w1 = 0.35  (unplanned outages have highest impact)
 *   w2 = 0.20  (planned outages are scheduled, lower urgency)
 *   w3 = 0.25  (OCGT reliance signals grid stress)
 *   w4 = 0.20  (higher reserve reduces stage)
 *
 * In a full build, weights would be trained using least-squares
 * regression on historical Eskom ESCOM data:
 *   β = (XᵀX)⁻¹ Xᵀy   (Normal Equation — BSc Linear Algebra)
 */

"use strict";

// ── Model weights ─────────────────────────────────────────────────────────────
const MODEL_WEIGHTS = {
  unplanned: 0.35,
  planned:   0.20,
  ocgt:      0.25,
  reserve:   0.20,
};

const STAGE_MIN = 0;
const STAGE_MAX = 8;

/**
 * Predict load shedding stage from grid parameters.
 *
 * @param {number} plannedMW    - Planned capacity offline (MW)
 * @param {number} unplannedMW  - Unplanned capacity offline (MW)
 * @param {number} ocgtPct      - OCGT (Open Cycle Gas Turbine) usage as % [0–100]
 * @param {number} reserveMW    - Available reserve margin (MW)
 * @returns {{ stage: number, confidence: number, warning: string }}
 */
function predictStage(plannedMW, unplannedMW, ocgtPct, reserveMW) {
  const { unplanned, planned, ocgt, reserve } = MODEL_WEIGHTS;

  const raw =
    (unplanned * (unplannedMW / 1000)) +
    (planned   * (plannedMW   / 1000)) +
    (ocgt      * (ocgtPct / 100) * 8) -
    (reserve   * (reserveMW   / 1000));

  // Clamp to valid stage range and round to nearest integer
  const stage = Math.min(STAGE_MAX, Math.max(STAGE_MIN, Math.round(raw)));

  // Confidence: higher reserve and lower OCGT usage = more confident prediction
  const confidence = Math.max(40, Math.min(95,
    Math.round(65 + (reserveMW / 4000) * 15 - (ocgtPct / 100) * 10)
  ));

  // Contextual warning message
  let warning = '';
  if (reserveMW < 500) {
    warning = 'Warning: critically low reserve margin.';
  } else if (stage > 5) {
    warning = 'OCGT reliance is unsustainable — coal plant recovery needed.';
  } else if (stage <= 2) {
    warning = 'Grid conditions stable. Monitor for unplanned trips.';
  } else {
    warning = 'Conditions may stabilise if maintenance backlogs are addressed.';
  }

  return { stage, confidence, warning };
}

/**
 * Calculate percentage of days at each stage from a history array.
 *
 * @param {number[]} history - Array of stage values
 * @returns {Object} - Map of stage => { count, pct }
 */
function stageDistribution(history) {
  const counts = {};
  history.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  const total = history.length;
  const dist = {};
  Object.keys(counts).forEach(s => {
    dist[s] = {
      count: counts[s],
      pct: Math.round((counts[s] / total) * 100),
    };
  });
  return dist;
}

/**
 * Generate ERF (Estimated Restoration) slots for a given stage.
 * Each stage adds one 2h30m outage window per day.
 *
 * @param {number} stage
 * @param {number} startHour - Hour to begin scheduling from (default 6)
 * @returns {Array<{ slot: number, start: string, end: string, duration: string }>}
 */
function generateERFSchedule(stage, startHour = 6) {
  const slots = [];
  let h = startHour;
  const count = Math.min(stage, 6);

  for (let i = 0; i < count; i++) {
    const startStr = String(h).padStart(2, '0') + ':00';
    h = (h + 2) % 24;
    const endStr = String(h).padStart(2, '0') + ':30';
    h = (h + 2) % 24;
    slots.push({ slot: i + 1, start: startStr, end: endStr, duration: '2h 30m' });
  }

  return slots;
}
