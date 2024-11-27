// Forest/environment color palette
const baseColors = ["#2d5a27", "#4a7856", "#8fbc8f", "#228b22", "#556b2f", "#6b8e23", "#808000", "#90ee90", "#98fb98", "#3cb371"];

function generateColorVariations(baseColors) {
  let variations = [];
  baseColors.forEach((color) => {
    variations.push(color);
    variations.push(adjustColor(color, 10));
    variations.push(adjustColor(color, -10));
  });
  return variations;
}

function adjustColor(hex, percent) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.min(255, Math.max(0, r + (r * percent) / 100));
  g = Math.min(255, Math.max(0, g + (g * percent) / 100));
  b = Math.min(255, Math.max(0, b + (b * percent) / 100));

  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

const colorVariations = generateColorVariations(baseColors);
const regionColors = new Map();
let colorIndex = 0;

var highlightDash;
var isSearchingDash = false;

function removeHighlightDash() {
  featureOverlayDash.getSource().clear();
  overlayDash.setPosition(undefined);
  isSearchingDash = false;
}

function showLoadingDash() {
  const loadingElement = document.getElementById("Loading_Animation");
  if (loadingElement) {
    loadingElement.classList.remove("hidden");
    loadingElement.innerHTML = '<div class="flex items-center mt-40 justify-center"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>';
  }
}

function hideLoadingDash() {
  const loadingElement = document.getElementById("Loading_Animation");
  if (loadingElement) {
    loadingElement.classList.add("hidden");
    loadingElement.innerHTML = "";
  }
}

var mapDash = new ol.Map({
  target: "DashMap",
  layers: [],
  view: new ol.View({
    center: ol.proj.fromLonLat([118.7384, 9.8349]),
    zoom: 7,
    minZoom: 2,
    maxZoom: 18,
  }),
});

showLoadingDash();

mapDash.on("rendercomplete", function () {
  hideLoadingDash();
});

let municipalityData = {};
let totalIncidents = 0;

async function fetchAdminMapData(municity) {
  try {
    const response = await fetch(`/get-municity-data/`);
    const data = await response.json();

    totalIncidents = 0;
    Object.values(data).forEach((municipality) => {
      if (municipality) {
        totalIncidents += municipality.dead + municipality.alive + municipality.scales + municipality.illegalTrades;
      }
    });

    municipalityData = data;

    if (municipalityData[municity]) {
      const municipality = municipalityData[municity];
      const municipalityTotal = municipality.dead + municipality.alive + municipality.scales + municipality.illegalTrades;
      const percentage = ((municipalityTotal / totalIncidents) * 100).toFixed(2);
      municipality.percentage = percentage;
    }
  } catch (error) {
    console.error("Error fetching municipality data:", error);
  }
}

var vectorLayerDash = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "https://gppg-bucket.s3.amazonaws.com/static/maps/map.geojson",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    const regionName = feature.get("Municipalities");

    if (!regionColors.has(regionName)) {
      const color = colorVariations[colorIndex % colorVariations.length];
      regionColors.set(regionName, color + "B3");
      colorIndex++;
    }

    feature.set("data", municipalityData[regionName] || "No data available");

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#1a4314",
        width: 0.5,
      }),
      fill: new ol.style.Fill({
        color: regionColors.get(regionName) || "#2d5a27B3",
      }),
    });
  },
});

mapDash.addLayer(vectorLayerDash);

var overlayDash = new ol.Overlay({
  element: document.createElement("div"),
  positioning: "bottom-center",
  stopEvent: false,
  offset: [0, -10],
});
mapDash.addOverlay(overlayDash);

var highlightStyleDash = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "#90ee90",
    width: 2,
  }),
  fill: new ol.style.Fill({
    color: "#98fb9880",
  }),
});

var featureOverlayDash = new ol.layer.Vector({
  source: new ol.source.Vector(),
  map: mapDash,
  style: highlightStyleDash,
});

mapDash.on("pointermove", async function (evt) {
  if (isSearchingDash) return;

  var feature = mapDash.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature !== highlightDash) {
    if (highlightDash) {
      featureOverlayDash.getSource().removeFeature(highlightDash);
    }
    if (feature) {
      featureOverlayDash.getSource().addFeature(feature);

      const properties = feature.getProperties();
      const regionName = properties.name || properties.Municipalities || "Unknown Region";

      await fetchAdminMapData(regionName);

      const municipalityDataForRegion = municipalityData[regionName] || {};
      const totalPoachingIncidents = municipalityDataForRegion.dead + municipalityDataForRegion.alive + municipalityDataForRegion.scales + municipalityDataForRegion.illegalTrades;

      const totalDisplay = totalPoachingIncidents > 0 ? totalPoachingIncidents : "No Poaching Incidents";
      const percentage = municipalityDataForRegion.percentage || 0;

      overlayDash.getElement().innerHTML = `
        <div class="bg-white p-2 rounded shadow-2xl">
          <p class="font-bold">${regionName}</p><br>
          Total Poaching Incidents: <span class="font-bold">${totalDisplay}</span><br>
          Percentage: <span class="font-bold">${totalPoachingIncidents > 0 ? `${percentage}%` : "N/A"}</span>
        </div>`;

      overlayDash.setPosition(evt.coordinate);
    } else {
      overlayDash.setPosition(undefined);
    }
    highlightDash = feature;
  }
});
