// === Safe Text Update with Flash ===
function safeUpdate(id, value) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`⚠️ Element with ID "${id}" not found`);
    return;
  }
  el.textContent = value;
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 800);
}

// === Update Dynamic Trip Status Label ===
function updateTripStatusLabel(state) {
  const banner = document.getElementById("trip-status-label");
  if (!banner) return;
  const labels = {
    idle: "🟡 Idle",
    tracking: "🟢 Tracking...",
    paused: "⏸️ Paused",
    complete: "✅ Trip Ended"
  };
  banner.textContent = labels[state] || "–";
}

// === Show Toast with Style & Timeout ===
function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
