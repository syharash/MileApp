let tripLog = [];
let filteredLog = [];

// === Trip Logging ===
function logTrip(purpose, notes, distance, duration, paused) {
  const rate = parseFloat(document.getElementById("rate").value || "0");
  const reimbursement = (distance * rate).toFixed(2);
  const entry = {
    date: new Date().toLocaleString(),
    purpose,
    notes,
    miles: distance,
    duration: `${duration} min`,
    paused: `${paused} min`,
    reimbursement: `$${reimbursement}`
  };
  tripLog.push(entry);
  saveTripHistory();
  syncToGoogleSheets(entry);
  renderTripLog();
  updateSummary();
}

// === Save & Load ===
function saveTripHistory() {
  const user = localStorage.getItem("userEmail") || "default";
  localStorage.setItem(`tripHistory_${user}`, JSON.stringify(tripLog));
}

function loadTripHistory() {
  const user = localStorage.getItem("userEmail") || "default";
  const saved = localStorage.getItem(`tripHistory_${user}`);
  if (saved) {
    tripLog = JSON.parse(saved);
    filteredLog = [...tripLog];
    renderTripLog();
    updateSummary();
  }
}

// === Render Trip Log ===
function renderTripLog() {
  const list = document.getElementById("trip-log");
  list.innerHTML = "";
  filteredLog.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.date} | ${entry.purpose} | ${entry.miles} mi | ${entry.reimbursement}`;
    list.appendChild(li);
  });
}

// === Summary ===
function updateSummary() {
  let today = 0, week = 0;
  const todayDate = new Date().toDateString();
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const rate = parseFloat(document.getElementById("rate").value || "0");

  tripLog.forEach(t => {
    const d = new Date(t.date);
    const m = parseFloat(t.miles);
    if (d.toDateString() === todayDate) today += m;
    if (d.getTime() >= weekAgo) week += m;
  });

  document.getElementById("today-summary").textContent = `${today.toFixed(2)} mi | $${(today * rate).toFixed(2)}`;
  document.getElementById("week-summary").textContent = `${week.toFixed(2)} mi | $${(week * rate).toFixed(2)}`;
}

// === CSV Export ===
function downloadCSV() {
  if (!filteredLog.length) return showToast("📂 No trips to export");
  let csv = "Date,Purpose,Notes,Miles,Duration,Paused,Reimbursement\n";
  filteredLog.forEach(t => {
    csv += `${t.date},${t.purpose},${t.notes},${t.miles},${t.duration},${t.paused},${t.reimbursement}\n`;
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "filtered_mileage_log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// === Clear History ===
function clearHistory() {
  tripLog = [];
  filteredLog = [];
  document.getElementById("trip-log").innerHTML = "";
  updateSummary();
  saveTripHistory();
  showToast("🧹 Trip history cleared");
}

// === Filtering ===
function filterTrips({ startDate, endDate, purpose }) {
  filteredLog = tripLog.filter(entry => {
    const entryDate = new Date(entry.date);
    const matchesDate = (!startDate || entryDate >= new Date(startDate)) &&
                        (!endDate || entryDate <= new Date(endDate));
    const matchesPurpose = !purpose || entry.purpose.toLowerCase().includes(purpose.toLowerCase());
    return matchesDate && matchesPurpose;
  });
  renderTripLog();
  updateSummary();
}

// === Google Sheets Sync ===
function syncToGoogleSheets(entry) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwd-_EuMr0Jy51_yYdMQpvVPSJNcKzMuU0RFla76qFgVsCb85DyBLCkkqXJ_Uk5L2iS/exec";
  const payload = {
    email: localStorage.getItem("userEmail") || "unknown",
    ...entry
  };

  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors", // Use "cors" if your script returns JSON
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch(err => {
    console.warn("⚠️ Google Sheets sync failed:", err);
  });
}
