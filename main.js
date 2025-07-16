window.onload = function () {
  initMapServices();
  updateStatus("Idle");
  updateControls();
  loadTripHistory();

  const buttonHandlers = {
    startTrackingBtn: startTracking,
    pauseTrackingBtn: pauseTracking,
    resumeTrackingBtn: resumeTracking,
    endTrackingBtn: endTracking,
    downloadCSVBtn: downloadCSV,
    clearHistoryBtn: clearHistory,
    toggleHelpBtn: toggleHelp,
    restoreTrip: restoreLastTrip,
    logoutBtn: logoutUser
  };

  for (const [id, handler] of Object.entries(buttonHandlers)) {
    const el = document.getElementById(id);
    if (el) el.onclick = handler;
    else console.warn(`🔍 Missing button with ID: ${id}`);
  }

  document.getElementById("trip-purpose").value = "";
  document.getElementById("trip-notes").value = "";

  if (!document.getElementById("toast")) {
    console.warn("🚨 Toast element not found.");
  }

  if (directionsRenderer) {
    directionsRenderer.setDirections({ routes: [] });
    const panel = document.getElementById("directions-panel");
    if (panel) panel.innerHTML = "";
  }
};
