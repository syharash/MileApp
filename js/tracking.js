// tracking.js
import { updateDebugBadge } from './js/ui.js';
import { getRoute } from './js/map.js';
import { renderSteps, safeUpdate, showToast, updateStatus, updateControls } from './js/ui.js';
import { logTrip } from './js/log.js';
import { startLiveTracking } from './js/log.js'

const tripData = {
  status: 'idle',
  tracking: false,
  start: null,
  end: null,
  pauseStart: null,
  pausedDuration: 0,
  interval: null,
};

export function startTracking() {
  tripData.status = 'tracking';
  navigator.geolocation.getCurrentPosition(pos => {
    tripData.start = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      timestamp: Date.now()
    };
    console.log("📍 Trip Start:", tripData.start.latitude, tripData.start.longitude);

    tripData.tracking = true;
    startLiveTracking();
    tripData.pausedDuration = 0;
    updateStatus("Tracking");
    showToast("🚀 Trip started!");
    updateControls();
    updateDebugBadge();
  }, () => showToast("⚠️ Unable to access GPS", "error"));
}

export function pauseTracking() {
  tripData.status = 'paused';
  clearInterval(tripData.interval);
  tripData.interval = null;
  tripData.pauseStart = Date.now();
  updateStatus("Paused");
  showToast("⏸️ Trip paused");
  updateControls();
  updateDebugBadge();
}

export function resumeTracking() {
  tripData.status = 'resumed';
  tripData.interval = setInterval(() => {
    // optional fallback location polling
  }, 10000);
  if (tripData.pauseStart) {
    tripData.pausedDuration += Date.now() - tripData.pauseStart;
    tripData.pauseStart = null;
  }
  updateStatus("Tracking");
  showToast("▶️ Trip resumed");
  updateControls();
  updateDebugBadge();
}

export async function endTracking() {
  tripData.status = 'idle';
  navigator.geolocation.getCurrentPosition(async pos => {
    tripData.end = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      timestamp: Date.now()
    };
    console.log("📍 Trip End:", tripData.end.latitude, tripData.end.longitude);

    if (!tripData.start || !tripData.end) {
      showToast("❌ Trip cannot be ended: Missing location data.", "error");
      console.warn("Missing tripStart or tripEnd");
      return;
    }

    clearInterval(tripData.interval);
    tripData.interval = null;
    tripData.tracking = false;

    try {
      const { data, error } = await getRoute(tripData.start, tripData.end);

      if (error) {
        showToast(`⚠️ ${error}`, "error");
        updateStatus("Error");
        updateControls();
        updateDebugBadge();
        return;
      }

      const leg = data.routes[0].legs[0];
      const distanceMi = (leg.distance.value / 1609.34).toFixed(2);
      const durationMin = Math.round(leg.duration.value / 60);
      const pausedMin = Math.round(tripData.pausedDuration / 60000);
      const startAddress = leg.start_address;
      const endAddress = leg.end_address;
      const purpose = document.getElementById("trip-purpose").value || "–";
      const notes = document.getElementById("trip-notes").value || "–";

      safeUpdate("summary-purpose", purpose);
      safeUpdate("summary-notes", notes);
      safeUpdate("summary-start", startAddress);
      safeUpdate("summary-end", endAddress);
      safeUpdate("summary-distance", `${distanceMi} mi`);
      safeUpdate("summary-duration", `${durationMin} min`);
      safeUpdate("pause-summary", `${pausedMin} min`);
      safeUpdate("lastDistance", `${distanceMi} mi`);
      safeUpdate("lastDuration", `${durationMin} min`);

      renderSteps(leg.steps);
      logTrip(purpose, notes, distanceMi, durationMin, pausedMin);
      showToast(`✅ Trip complete: ${distanceMi} mi`);
    } catch (err) {
      console.error("endTracking() error:", err);
      showToast("❌ " + err.message, "error");
    }

    updateStatus("Trip Complete");
    updateControls();
    updateDebugBadge();
    tripData.start = tripData.end = null;
  }, () => {
    showToast("⚠️ GPS access failed", "error");
    updateStatus("Trip Complete");
    updateDebugBadge();
  });
}
