// map.js

let map;
let directionsService;
let directionsRenderer;

function initMapServices() {
  if (map) return;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 38.5816, lng: -121.4944 },
    zoom: 12
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    panel: document.getElementById("directions-panel")
  });
}

async function getRoute(start, end) {
  if (!start || !end) {
    console.warn("Missing start or end location:", { start, end });
    return { error: "Missing location data." };
  }

  const coordsValid =
    typeof start.latitude === "number" &&
    typeof start.longitude === "number" &&
    typeof end.latitude === "number" &&
    typeof end.longitude === "number";

  if (!coordsValid) {
    console.warn("Invalid coordinates:", { start, end });
    return { error: "Invalid coordinates." };
  }

  try {
    const result = await new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(start.latitude, start.longitude),
          destination: new google.maps.LatLng(end.latitude, end.longitude),
          travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
          status === google.maps.DirectionsStatus.OK
            ? resolve(response)
            : reject(`Route request failed: ${status}`);
        }
      );
    });
    return { data: result };
  } catch (error) {
    console.error("Route calculation error:", error);
    return { error: "Unable to calculate route. Try again later." };
  }
}

function renderSteps(steps) {
  const panel = document.getElementById("directions-panel");
  panel.innerHTML = "";
  const iconMap = {
    "turn-left": "⬅️",
    "turn-right": "➡️",
    "merge": "🔀",
    "ramp-right": "↪️",
    "ramp-left": "↩️"
  };
  steps.forEach(step => {
    const div = document.createElement("div");
    const icon = iconMap[step.maneuver] || "➡️";
    div.innerHTML = `${icon} ${step.html_instructions}`;
    panel.appendChild(div);
  });
}

function clearDirections() {
  if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
  const panel = document.getElementById("directions-panel");
  if (panel) panel.innerHTML = "";
}

function getMapSnapshot() {
  return map
    ? {
        center: map.getCenter().toJSON(),
        zoom: map.getZoom()
      }
    : null;
}

export {
  initMapServices,
  getRoute,
  renderSteps,
  clearDirections,
  getMapSnapshot
};
