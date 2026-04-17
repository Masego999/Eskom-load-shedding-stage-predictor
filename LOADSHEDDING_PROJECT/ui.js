/**
 * ui.js — DOM rendering & UI update functions
 * Eskom Load Shedding Dashboard
 *
 * Keeps all direct DOM manipulation separate from business logic.
 * Each function receives data and updates a specific part of the page.
 */

"use strict";

// ── Header badge ──────────────────────────────────────────────────────────────
function renderBadge(stage) {
  const el = document.getElementById('current-badge');
  el.textContent = 'Stage ' + stage;
  el.style.background   = getStageColor(stage, 'bg');
  el.style.color        = getStageColor(stage, 'text');
  el.style.borderColor  = getStageColor(stage, 'border');
}

// ── Metric cards ──────────────────────────────────────────────────────────────
function renderMetrics(stage) {
  document.getElementById('m-stage').textContent     = 'Stage ' + stage;
  document.getElementById('m-stage-sub').textContent = stageSeverity(stage);
  document.getElementById('m-hours').textContent     = hoursOffSupply(stage);
  document.getElementById('m-deficit').textContent   = deficitMW(stage);
  document.getElementById('m-conf').textContent      = '78%';
}

// ── Stage distribution bar list ───────────────────────────────────────────────
function renderDistribution(history) {
  const dist = stageDistribution(history);
  const el = document.getElementById('dist-list');
  el.innerHTML = '';

  // Sort stages ascending
  Object.keys(dist).map(Number).sort((a, b) => a - b).forEach(stage => {
    const { pct } = dist[stage];
    const color = getStageColor(stage, 'bar');

    el.innerHTML += `
      <div class="stage-row">
        <span class="stage-dot" style="background:${color};"></span>
        <span class="stage-name">Stage ${stage}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%; background:${color};"></div>
        </div>
        <span class="bar-pct">${pct}%</span>
      </div>`;
  });
}

// ── 14-day timeline ───────────────────────────────────────────────────────────
function renderTimeline(history) {
  const tlEl = document.getElementById('timeline');
  const lbEl = document.getElementById('tl-labels');
  const maxS = Math.max(...history);
  tlEl.innerHTML = '';
  lbEl.innerHTML = '';

  history.forEach((stage, i) => {
    const barHeight = Math.max(8, Math.round((stage / maxS) * 72));
    const dayLabel  = i === history.length - 1 ? 'T' : '-' + (history.length - 1 - i);
    const color     = getStageColor(stage, 'bar');

    tlEl.innerHTML += `
      <div class="tl-bar"
           style="height:${barHeight}px; background:${color};"
           data-tip="Day ${dayLabel}: Stage ${stage}">
      </div>`;

    lbEl.innerHTML += `<span class="tl-label">${dayLabel}</span>`;
  });
}

// ── ERF schedule grid ─────────────────────────────────────────────────────────
function renderERF(stage) {
  const slots = generateERFSchedule(stage);
  const el = document.getElementById('erf-grid');

  if (slots.length === 0) {
    el.innerHTML = '<p style="font-size:13px; color:var(--color-text-sec); grid-column:1/-1;">No scheduled outages for this stage.</p>';
    return;
  }

  el.innerHTML = slots.map(s => `
    <div class="erf-cell">
      <p class="erf-slot">Slot ${s.slot}</p>
      <p class="erf-time">${s.start} – ${s.end}</p>
      <p class="erf-dur">${s.duration}</p>
    </div>`).join('');
}

// ── Prediction result panel ───────────────────────────────────────────────────
function renderPredictionResult(stage, confidence, warning) {
  const el = document.getElementById('pred-result');
  const bg      = getStageColor(stage, 'bg');
  const textCol = getStageColor(stage, 'text');
  const bdr     = getStageColor(stage, 'border');

  el.classList.remove('hidden');
  el.style.background   = bg;
  el.style.borderColor  = bdr;

  el.innerHTML = `
    <div class="pred-header">
      <span class="pred-stage-label" style="color:${textCol};">Predicted: Stage ${stage}</span>
      <span class="pred-severity"    style="color:${textCol};">${stageSeverity(stage)}</span>
    </div>
    <p class="pred-desc">
      Estimated <strong>${hoursOffSupply(stage)} hrs</strong> off-supply per day.
      Model confidence: <strong>${confidence}%</strong>.
      ${warning}
    </p>`;

  // Also update ERF schedule to reflect predicted stage
  renderERF(stage);
}

// ── Slider live-update helper ─────────────────────────────────────────────────
function bindSlider(sliderId, displayId) {
  const slider  = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  slider.addEventListener('input', () => {
    display.textContent = slider.value;
  });
}
