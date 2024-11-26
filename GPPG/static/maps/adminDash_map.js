var highlightDash;
var isSearchingDash = false;

function removeHighlightDash() {
  featureOverlayDash.geatSource().clear();
  overlayDash.setPosition(undefined);
  isSearchingDash = false;
}

function showLoadingDash() {
  const loadingElement = document.getElementById("Loading_Animation");
  if (loadingElement) {
    loadingElement.classList.remove("hidden");
    loadingElement.innerHTML = '<div class="flex items-center   mt-40 justify-center "><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>';
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
    minZoom: 5,
    maxZoom: 10,
    constrainResolution: true,
  }),
});

// Show loading animation when map starts loading
showLoadingDash();

mapDash.on("rendercomplete", function () {
  // Hide loading animation when map finishes rendering
  hideLoadingDash();
});

let municipalityData = {};
let totalIncidents = 0;

async function fetchAdminMapData(municity) {
  try {
    const response = await fetch(`/get-municity-data/`);
    const data = await response.json();

    // Calculate total incidents across all municipalities first
    totalIncidents = 0;
    Object.values(data).forEach((municipality) => {
      if (municipality) {
        totalIncidents += municipality.dead + municipality.alive + municipality.scales + municipality.illegalTrades;
      }
    });

    municipalityData = data; // Set the global municipality data

    if (municipalityData[municity]) {
      const municipality = municipalityData[municity];

      // Calculate percentage for this municipality
      const municipalityTotal = municipality.dead + municipality.alive + municipality.scales + municipality.illegalTrades;
      const percentage = ((municipalityTotal / totalIncidents) * 100).toFixed(2);

      // Add percentage to the municipality data object
      municipality.percentage = percentage;
    }
  } catch (error) {
    console.error("Error fetching municipality data:", error);
  }
}

var vectorLayerDash = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "/static/maps/map.geojson", // Geojson file input kuno
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    const regionName = feature.get("Municipalities");
    feature.set("data", municipalityData[regionName] || "No data available");

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#ff8c00",
        width: 0.5,
      }),
      fill: new ol.style.Fill({
        color: "rgba(255, 140, 0, 0.3)",
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
    color: "#ff0000",
    width: 0.5,
  }),
  fill: new ol.style.Fill({
    color: "rgba(255, 0, 0, 0.1)",
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

      // Fetch the data and update the overlay after the data is ready
      await fetchAdminMapData(regionName);

      const municipalityDataForRegion = municipalityData[regionName] || {};

      // Get the total poachinaag incidents and percentage for this region
      const totalPoachingIncidents = municipalityDataForRegion.dead + municipalityDataForRegion.alive + municipalityDataForRegion.scales + municipalityDataForRegion.illegalTrades;

      // Handle the case where there's no data or incidents
      const totalDisplay = totalPoachingIncidents > 0 ? totalPoachingIncidents : "No Poaching Incidents";
      const percentage = municipalityDataForRegion.percentage || 0;

      // Update the overlay with both total incidents and percentage
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
