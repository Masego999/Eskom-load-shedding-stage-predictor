/**
 * app.js — Application entry point
 * Eskom Load Shedding Dashboard
 *
 * Initialises the dashboard and wires up event listeners.
 * Depends on: data.js, predictor.js, ui.js (loaded before this in index.html)
 */

"use strict";

// ── Initialise dashboard on DOM ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBadge(currentStage);
  renderMetrics(currentStage);
  renderDistribution(stageHistory);
  renderTimeline(stageHistory);
  renderERF(currentStage);

  // Bind all four sliders to their live-display spans
  bindSlider('sl-planned',   'sv-planned');
  bindSlider('sl-unplanned', 'sv-unplanned');
  bindSlider('sl-ocgt',      'sv-ocgt');
  bindSlider('sl-reserve',   'sv-reserve');

  // Wire up the predict button
  document.getElementById('predict-btn').addEventListener('click', runPrediction);
});

// ── Prediction button handler ─────────────────────────────────────────────────
function runPrediction() {
  const plannedMW   = Number(document.getElementById('sl-planned').value);
  const unplannedMW = Number(document.getElementById('sl-unplanned').value);
  const ocgtPct     = Number(document.getElementById('sl-ocgt').value);
  const reserveMW   = Number(document.getElementById('sl-reserve').value);

  const { stage, confidence, warning } = predictStage(
    plannedMW, unplannedMW, ocgtPct, reserveMW
  );

  renderPredictionResult(stage, confidence, warning);
}
