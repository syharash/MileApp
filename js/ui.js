// ui.js
// import { getTripState } from './tracking.js';

function updateStatus(state) {
  const el = document.getElementById("tracking-status");
  if (el) el.textContent = state;
  document.body.classList.toggle("paused", state === "Paused");
  document.body.classList.toggle("ended", state === "Ended" || state === "Trip Complete");
}

function updateControls(tripStatus = 'idle') {
  const startTrackingBtn = document.getElementById("startTrackingBtn");
  const pauseTrackingBtn = document.getElementById("pauseTrackingBtn");
  const resumeTrackingBtn = document.getElementById("resumeTrackingBtn");
  const endTrackingBtn = document.getElementById("endTrackingBtn");

  if (!startTrackingBtn || !pauseTrackingBtn || !resumeTrackingBtn || !endTrackingBtn) {
    console.warn("🔍 Some control buttons not found.");
    return;
  }

  startTrackingBtn.disabled = tripStatus !== 'idle';
  pauseTrackingBtn.disabled = !(tripStatus === 'tracking');
  resumeTrackingBtn.disabled = !(tripStatus === 'paused');
  endTrackingBtn.disabled = !(tripStatus === 'tracking' || tripStatus === 'paused' || tripStatus === 'resumed');
}

function showToast(msg, type = "default") {
  const t = document.getElementById("toast");
  if (!t) {
    console.warn("🚨 Toast element not found.");
    return;
  }
  t.textContent = msg;
  t.className = "show";
  t.style.backgroundColor = type === "error" ? "#B00020" : "#222";
  setTimeout(() => t.className = "", 3000);
}

function safeUpdate(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  } else {
    console.warn(`⚠️ Element with ID "${id}" not found`);
  }
}

function toggleHelp() {
  const h = document.getElementById("help-screen");
  if (h) {
    h.style.display = h.style.display === "none" ? "block" : "none";
  } else {
    console.warn("🆘 Help screen not found.");
  }
}

export function updateDebugBadge() {
  const { status, tracking, pausedDuration } = getTripState();
  const badge = document.getElementById("debugBadge");
  if (!badge) return;

  const stateMap = {
    idle: "🛠 Idle",
    tracking: "🚗 Tracking",
    paused: `⏸️ Paused (${Math.round(pausedDuration / 60000)} min)`,
    resumed: "▶️ Resumed",
  };

  badge.textContent = stateMap[status] || `🛠 ${status}`;
}

export function clearTripUI() {
  safeUpdate("summary-purpose", "–");
  safeUpdate("summary-notes", "–");
  safeUpdate("summary-start", "–");
  safeUpdate("summary-end", "–");
  safeUpdate("summary-distance", "–");
  safeUpdate("summary-duration", "–");
  safeUpdate("pause-summary", "–");
  document.getElementById("trip-purpose").value = "";
  document.getElementById("trip-notes").value = "";
  document.getElementById("rate").value = "";
}

export function updateDebugPanel() {
  const state = getTripState();
  const panel = document.getElementById("debugPanel");
  const pre = document.getElementById("debugContent");
  if (!panel || !pre) return;

  panel.style.display = "block";
  pre.textContent = JSON.stringify(state, null, 2);
}

export function initDebugCopy() {
  const btn = document.getElementById("copyDebugBtn");
  btn?.addEventListener("click", () => {
    const state = getTripState();
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  });
}


export { updateStatus, updateControls, showToast, safeUpdate, toggleHelp };
