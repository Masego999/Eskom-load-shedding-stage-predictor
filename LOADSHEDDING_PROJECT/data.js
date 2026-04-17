/**
 * data.js — Static data & constants
 * Eskom Load Shedding Dashboard
 *
 * In a production build, stageHistory and currentStage would be
 * fetched from the EskomSePush API: https://eskomsepush.gumroad.com/l/api
 */

"use strict";

// ── Stage colour maps ──────────────────────────────────────────────────────────
const STAGE_COLORS = {
  bg:     ['#EAF3DE','#EAF3DE','#FAEEDA','#FAEEDA','#FAECE7','#FAECE7','#FCEBEB','#FCEBEB','#FCEBEB'],
  text:   ['#3B6D11','#3B6D11','#854F0B','#854F0B','#993C1D','#993C1D','#A32D2D','#A32D2D','#791F1F'],
  border: ['#639922','#639922','#BA7517','#BA7517','#D85A30','#D85A30','#E24B4A','#E24B4A','#E24B4A'],
  bar:    ['#639922','#639922','#BA7517','#BA7517','#D85A30','#D85A30','#E24B4A','#E24B4A','#E24B4A'],
};

// ── Simulated 14-day stage history ─────────────────────────────────────────────
// Replace with real API data in production
const stageHistory = [3, 3, 4, 4, 5, 4, 3, 4, 6, 6, 5, 4, 3, 4];

// ── Current active stage ───────────────────────────────────────────────────────
const currentStage = stageHistory[stageHistory.length - 1];

// ── Helper: hours off-supply per stage ────────────────────────────────────────
function hoursOffSupply(stage) {
  // Eskom's schedule: roughly 2.5 hrs per stage per day per area
  return parseFloat((stage * 2.5).toFixed(1));
}

// ── Helper: approximate MW deficit per stage ──────────────────────────────────
function deficitMW(stage) {
  // ~500 MW per stage as a rough estimate (Eskom operational data)
  const base = stage * 500;
  return base.toLocaleString();
}

// ── Helper: get stage colour properties ───────────────────────────────────────
function getStageColor(stage, prop) {
  const idx = Math.min(Math.max(stage, 0), 8);
  return STAGE_COLORS[prop][idx];
}

// ── Helper: stage severity label ──────────────────────────────────────────────
function stageSeverity(stage) {
  if (stage <= 2) return 'Low impact';
  if (stage <= 4) return 'Moderate impact';
  if (stage <= 6) return 'High impact';
  return 'Critical';
}
