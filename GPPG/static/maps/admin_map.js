let municipalityDataCache = null;
let isSearching = false;
let isClickActive = false;
let highlight;

// Forest color palette and management
const forestColors = [
  "rgba(45, 90, 39, 0.7)", // Dark forest green
  "rgba(74, 120, 86, 0.7)", // Sage green
  "rgba(143, 188, 143, 0.7)", // Dark sea green
  "rgba(34, 139, 34, 0.7)", // Forest green
  "rgba(85, 107, 47, 0.7)", // Dark olive green
  "rgba(107, 142, 35, 0.7)", // Olive drab
  "rgba(128, 128, 0, 0.7)", // Olive
  "rgba(60, 179, 113, 0.7)", // Medium sea green
];

const regionColorMap = new Map();
let colorCounter = 0;

function getRegionColor(regionName) {
  if (!regionColorMap.has(regionName)) {
    regionColorMap.set(regionName, forestColors[colorCounter % forestColors.length]);
    colorCounter++;
  }
  return regionColorMap.get(regionName);
}

async function initializeMunicipalityData() {
  try {
    showLoading();
    const response = await fetch("/get-municity-data/");
    const data = await response.json();

    let totalIncidents = 0;
    Object.values(data).forEach((municipalityData) => {
      if (municipalityData) {
        totalIncidents += municipalityData.dead + municipalityData.alive + municipalityData.scales + municipalityData.illegalTrades;
      }
    });

    Object.keys(data).forEach((municity) => {
      const municipalityData = data[municity];
      if (municipalityData) {
        const municipalityTotal = municipalityData.dead + municipalityData.alive + municipalityData.scales + municipalityData.illegalTrades;

        municipalityData.municipalityTotal = municipalityTotal;
        municipalityData.percentage = ((municipalityTotal / totalIncidents) * 100).toFixed(2);
      }
    });

    municipalityDataCache = data;
    hideLoading();
    return data;
  } catch (error) {
    console.error("Error initializing municipality data:", error);
    hideLoading();
    showError("Failed to load municipality data");
    return null;
  }
}

function getMunicipalityData(municity) {
  return municipalityDataCache?.[municity] || null;
}

async function searchMunicipality(event) {
  event.preventDefault();
  const searchValue = document.getElementById("search-dropdown").value.toLowerCase();

  showLoading();

  if (!municipalityDataCache) {
    await initializeMunicipalityData();
  }

  let foundFeature = null;
  vectorLayer.getSource().forEachFeature(function (feature) {
    const properties = feature.getProperties();
    const name = properties.name || properties.Municipalities || "";
    if (name.toLowerCase() === searchValue) {
      foundFeature = feature;
    }
  });

  if (foundFeature) {
    const geometry = foundFeature.getGeometry();
    const centroid = ol.extent.getCenter(geometry.getExtent());
    map.getView().fit(geometry.getExtent(), { duration: 1000, maxZoom: 10 });

    featureOverlay.getSource().clear();
    featureOverlay.getSource().addFeature(foundFeature);

    const properties = foundFeature.getProperties();
    const regionName = properties.name || properties.Municipalities || "Unknown Region";

    const infoElement = createOverlayHTML(regionName);
    overlay.setElement(infoElement);
    overlay.setPosition(centroid);

    updateChartForRegion(regionName);

    isSearching = true;
  } else {
    showError("Municipality not found. Please try again.");
  }
  hideLoading();
}

function showError(message) {
  let errorElement = document.getElementById("error-message");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = "error-message";
    errorElement.className = "fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded shadow-lg";
    document.body.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

function removeHighlight() {
  featureOverlay.getSource().clear();
  overlay.setPosition(undefined);
  isSearching = false;
  isClickActive = false;
}

function showLoading() {
  const loadingElement = document.getElementById("loading-animation");
  if (loadingElement) {
    loadingElement.classList.remove("hidden");
    loadingElement.innerHTML =
      '<div class="flex items-center absolute inset-0 md:ml-72 justify-center "><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>';
  }
}

function hideLoading() {
  const loadingElement = document.getElementById("loading-animation");
  if (loadingElement) {
    loadingElement.classList.add("hidden");
    loadingElement.innerHTML = "";
  }
}

function updateChartForRegion(regionName) {
  const municipalityData = getMunicipalityData(regionName);
  createDoughnutChart(municipalityData);

  const percentageElement = document.getElementById("percentage-text");
  const totalElement = document.getElementById("total-text");

  if (municipalityData) {
    if (percentageElement) {
      percentageElement.innerHTML = `<span class='font-bold'>${municipalityData.percentage}%</span> of total incidents`;
    }
    if (totalElement) {
      totalElement.innerHTML = `<span class='font-bold'>${municipalityData.municipalityTotal}</span>`;
    }
  } else {
    if (percentageElement) {
      percentageElement.innerHTML = "0% of total incidents";
    }
    if (totalElement) {
      totalElement.innerHTML = "0";
    }
  }
}

function createOverlayHTML(regionName) {
  const infoElement = document.createElement("div");
  infoElement.innerHTML = `
    <div class="bg-white p-5 rounded-2xl relative shadow-2xl">
      <button onclick="removeOverlay()" class="absolute top-2 right-2 m-1 text-sm">&times;</button>
      <div class="text-center mb-5">
        <p class="font-bold">${regionName}</p>
        <div class="text-sm mt-2">
          <p class="font-semibold">Poaching Incidents Recorded:</p>
          <p class="text-2xl font-bold text-green-700" id="total-text">Loading...</p>
        </div>
        <p class="text-sm text-gray-600" id="percentage-text">Loading...</p>
      </div>
      <canvas id="donutchart" width="220" height="220"></canvas>
    </div>
  `;
  return infoElement;
}

let chartInstance;

function createDoughnutChart(municipalityData) {
  const ctx = document.getElementById("donutchart").getContext("2d");
  const percentageElement = document.getElementById("percentage-text");
  const totalElement = document.getElementById("total-text");

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!municipalityData || Object.values(municipalityData).every((value) => value === 0 || typeof value === "string")) {
    ctx.font = "bold 15px Roboto";
    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    const message = "No poaching incidents recorded\nin this area";
    const lines = message.split("\n");

    lines.forEach((line, index) => {
      ctx.fillText(line, ctx.canvas.width / 2, ctx.canvas.height / 2 - 10 + index * 20);
    });

    if (percentageElement) {
      percentageElement.innerHTML = "0% of total incidents";
      totalElement.innerHTML = "0";
    }
    return;
  }

  if (percentageElement) {
    percentageElement.innerHTML = `<span class='font-bold'>${municipalityData.percentage}%</span> of total incidents`;
    totalElement.innerHTML = `<span class='font-bold'>${municipalityData.municipalityTotal}</span>`;
  }

  const dataValues = [municipalityData.dead, municipalityData.alive, municipalityData.scales, municipalityData.illegalTrades];
  const total = dataValues.reduce((sum, value) => sum + value, 0);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Dead", "Alive", "Scales", "Illegal Trades"],
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "rgba(34, 139, 34, 0.8)", // Forest green
            "rgba(85, 107, 47, 0.8)", // Dark olive green
            "rgba(60, 179, 113, 0.8)", // Medium sea green
            "rgba(143, 188, 143, 0.8)", // Dark sea green
          ],
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 10,
            usePointStyle: true,
            color: "#000",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              if (total > 0) {
                const percentage = ((value / total) * 100).toFixed(2);
                return `${context.label}: (${percentage}%)`;
              }
              return `${context.label}: ${value}`;
            },
          },
        },
        datalabels: {
          color: "white",
          formatter: (value) => `${value}`,
          font: { weight: "semibold" },
          align: "center",
          anchor: "center",
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

var map = new ol.Map({
  target: "map",
  layers: [],
  view: new ol.View({
    center: ol.proj.fromLonLat([118.7384, 9.8349]),
    zoom: 7.5,
    minZoom: 2,
    maxZoom: 18,
  }),
});

showLoading();

map.on("rendercomplete", function () {
  hideLoading();
});

var vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "https://gppg-bucket.s3.ap-southeast-2.amazonaws.com/static/maps/map.geojson",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    const regionName = feature.get("Municipalities");
    feature.set("data", municipalityData[regionName] || "No data available");

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#1a4314",
        width: 0.5,
      }),
      fill: new ol.style.Fill({
        color: getRegionColor(regionName),
      }),
    });
  },
});

map.addLayer(vectorLayer);

var overlay = new ol.Overlay({
  element: document.createElement("div"),
  positioning: "bottom-center",
  stopEvent: false,
  offset: [0, -10],
});
map.addOverlay(overlay);

var highlightStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "#90EE90",
    width: 2,
  }),
  fill: new ol.style.Fill({
    color: "rgba(144, 238, 144, 0.3)",
  }),
});

var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector(),
  map: map,
  style: highlightStyle,
});

map.on("click", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature) {
    isClickActive = true;

    const properties = feature.getProperties();
    const regionName = properties.name || properties.Municipalities || "Unknown Region";
    const geometry = feature.getGeometry();
    const centroid = ol.extent.getCenter(geometry.getExtent());

    featureOverlay.getSource().clear();
    featureOverlay.getSource().addFeature(feature);

    const infoElement = createOverlayHTML(regionName);
    overlay.setElement(infoElement);
    overlay.setPosition(centroid);

    updateChartForRegion(regionName);
  } else {
    removeOverlay();
  }
});

map.on("pointermove", function (evt) {
  if (isSearching || isClickActive) return;

  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
      const properties = feature.getProperties();
      const regionName = properties.name || properties.Municipalities || "Unknown Region";

      const infoElement = createOverlayHTML(regionName);
      overlay.setElement(infoElement);
      overlay.setPosition(evt.coordinate);

      updateChartForRegion(regionName);
    } else {
      overlay.setPosition(undefined);
    }
    highlight = feature;
  }
});

vectorLayer.getSource().once("change", function (e) {
  if (vectorLayer.getSource().getState() === "ready") {
    initializeMunicipalityData();
  }
});

function removeOverlay() {
  overlay.setPosition(undefined);
  featureOverlay.getSource().clear();
  highlight = null;
  selectedFeature = null;
  isClickActive = false;
  isSearching = false;
}
